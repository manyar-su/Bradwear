
import React, { useState, useRef, useEffect } from 'react';
import { Camera, Loader2, Save, Plus, Trash2, ChevronLeft, AlertTriangle, Upload, FileText, Package, Scissors, RotateCcw } from 'lucide-react';
import { OrderItem, SakuColor, SakuType, JobStatus, Priority, BRAD_MODELS } from '../types';
import { format, differenceInDays } from 'date-fns';
import { id as idLocale } from 'date-fns/locale/id';

import { syncService } from '../services/syncService';

interface ScanScreenProps {
  onSave: (order: OrderItem) => void;
  onCancel: () => void;
  isDarkMode: boolean;
  existingOrders?: OrderItem[];
  isScanningGlobal: boolean;
  scanResultGlobal: Partial<OrderItem> | null;
  onStartScan: (base64: string) => void;
  setScanResultGlobal: (res: Partial<OrderItem> | null) => void;
}

const GREETINGS = [
  "Sabar ya, BradwearFlow lagi baca Rekapan kamu...",
  "Lagi ngitung kancing nih, tunggu sebentar...",
  "Memproses Rekapan jahitan digital Anda...",
  "Dikit lagi beres, datanya lagi dirapiin...",
  "Hampir selesai! Lagi cocokin data rekapannya..."
];

const INITIAL_FORM_STATE: Partial<OrderItem> = {
  namaPenjahit: 'Nama Anda',
  kodeBarang: '',
  tanggalOrder: format(new Date(), 'd MMMM yyyy', { locale: idLocale }),
  tanggalTargetSelesai: '',
  cs: '',
  konsumen: '',
  jumlahPesanan: 0,
  sizeDetails: [],
  model: 'Brad V2',
  warna: '',
  sakuType: SakuType.POLOS,
  sakuColor: SakuColor.ABU,
  status: JobStatus.PROSES,
  priority: Priority.MEDIUM,
  embroideryStatus: 'Lengkap',
  embroideryNotes: '',
  deskripsiPekerjaan: '',
  isManual: true,
  createCalendarReminder: false,
  modelDetail: ''
};

const ScanScreen: React.FC<ScanScreenProps> = ({
  onSave, onCancel, isDarkMode, existingOrders = [],
  isScanningGlobal, scanResultGlobal, onStartScan, setScanResultGlobal
}) => {
  const [greeting, setGreeting] = useState(GREETINGS[0]);
  const [isManualMode, setIsManualMode] = useState(false);
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false);
  const [duplicateOwner, setDuplicateOwner] = useState<string | null>(null);
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);

  const [formData, setFormData] = useState<Partial<OrderItem>>(INITIAL_FORM_STATE);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const profileName = localStorage.getItem('profileName') || 'Nama Anda';
    setFormData(prev => ({ ...prev, namaPenjahit: profileName }));
  }, []);

  useEffect(() => {
    if (descriptionRef.current) {
      descriptionRef.current.style.height = 'auto';
      descriptionRef.current.style.height = `${descriptionRef.current.scrollHeight}px`;
    }
  }, [formData.deskripsiPekerjaan]);

  useEffect(() => {
    let interval: any;
    if (isScanningGlobal) {
      interval = setInterval(() => {
        setGreeting(GREETINGS[Math.floor(Math.random() * GREETINGS.length)]);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isScanningGlobal]);

  useEffect(() => {
    if (scanResultGlobal) {
      setFormData(prev => ({
        ...prev,
        ...scanResultGlobal,
        namaPenjahit: scanResultGlobal.namaPenjahit || prev.namaPenjahit || '',
        isManual: false
      }));
      setIsManualMode(false);
    }
  }, [scanResultGlobal]);

  useEffect(() => {
    const checkDuplicate = async () => {
      if (formData.kodeBarang) {
        // Local check
        const localDup = existingOrders.find(o => o.kodeBarang === formData.kodeBarang);
        // Global check (async)
        const globalDup = await syncService.checkDuplicateCode(formData.kodeBarang);

        if (localDup || globalDup) {
          setShowDuplicateWarning(true);
          setDuplicateOwner((globalDup?.namaPenjahit || localDup?.namaPenjahit || null));
        } else {
          setShowDuplicateWarning(false);
          setDuplicateOwner(null);
        }
      } else {
        setShowDuplicateWarning(false);
        setDuplicateOwner(null);
      }
    };

    checkDuplicate();
  }, [formData.kodeBarang, existingOrders]);

  useEffect(() => {
    if (formData.sizeDetails) {
      const total = formData.sizeDetails.reduce((sum, item) => sum + (item.jumlah || 0), 0);
      setFormData(prev => ({ ...prev, jumlahPesanan: total }));
    }
  }, [formData.sizeDetails]);

  const handleResetForm = () => {
    const message = scanResultGlobal
      ? "Batalkan hasil scan dan kembali ke pemilihan metode?"
      : "Hapus semua input dan kembali ke pemilihan metode?";

    if (window.confirm(message)) {
      setScanResultGlobal(null);
      setIsManualMode(false);
      setFormData(INITIAL_FORM_STATE);
    }
  };

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1200;
          const MAX_HEIGHT = 1200;
          let width = img.width;
          let height = img.height;
          if (width > height) {
            if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
          } else {
            if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; }
          }
          canvas.width = width; canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.8).split(',')[1]);
        };
        img.onerror = reject;
      };
      reader.onerror = reject;
    });
  };

  const handleImageInput = async (file: File) => {
    setIsManualMode(false);
    try {
      const compressedBase64 = await compressImage(file);
      onStartScan(compressedBase64);
    } catch (err) {
      const reader = new FileReader();
      reader.onloadend = () => onStartScan((reader.result as string).split(',')[1]);
      reader.readAsDataURL(file);
    }
  };

  const handleManualEntry = () => {
    setIsManualMode(true);
    setScanResultGlobal(null);
    setFormData(prev => ({
      ...prev, isManual: true,
      namaPenjahit: 'Nama Anda',
      sizeDetails: [{ size: '', jumlah: 0, gender: 'Pria', tangan: 'Pendek', namaPerSize: '' }]
    }));
  };

  const handleAddSize = () => {
    setFormData(prev => ({ ...prev, sizeDetails: [...(prev.sizeDetails || []), { size: '', jumlah: 0, gender: 'Pria', tangan: 'Pendek', namaPerSize: '' }] }));
  };

  const handleRemoveSize = (index: number) => {
    setFormData(prev => ({ ...prev, sizeDetails: prev.sizeDetails?.filter((_, i) => i !== index) }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.namaPenjahit || !formData.kodeBarang) {
      alert("Nama Penjahit dan Kode Barang wajib diisi!"); return;
    }

    if (showDuplicateWarning) {
      setShowConfirmPopup(true);
    } else {
      onSave(formData as OrderItem);
    }
  };

  const handleConfirmDuplicate = () => {
    onSave(formData as OrderItem);
    setShowConfirmPopup(false);
  };

  const daysUntilDeadline = formData.tanggalTargetSelesai ? differenceInDays(new Date(formData.tanggalTargetSelesai), new Date()) : 999;
  const isUrgent = daysUntilDeadline <= 1;

  return (
    <div className={`p-4 md:p-8 pb-32 min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-slate-950' : 'bg-slate-50'}`}>
      <style>{`
        input[type=number]::-webkit-inner-spin-button, input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
        
        @keyframes urgentCycle {
          0% { background-color: #ef4444; border-color: #f87171; box-shadow: 0 0 20px 5px rgba(239, 68, 68, 0.3); }
          50% { background-color: #f97316; border-color: #fb923c; box-shadow: 0 0 30px 10px rgba(249, 115, 22, 0.4); }
          100% { background-color: #ef4444; border-color: #f87171; box-shadow: 0 0 20px 5px rgba(239, 68, 68, 0.3); }
        }

        @keyframes normalCycle {
          0% { background-color: #f97316; border-color: #fb923c; }
          50% { background-color: #fbbf24; border-color: #fcd34d; }
          100% { background-color: #f97316; border-color: #fb923c; }
        }

        .animate-urgent-cycle {
          animation: urgentCycle 1.5s infinite ease-in-out;
        }

        .animate-normal-cycle {
          animation: normalCycle 4s infinite ease-in-out;
        }
      `}</style>

      {showConfirmPopup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in zoom-in duration-300">
          <div className={`relative w-full max-w-sm rounded-[3rem] p-8 shadow-2xl flex flex-col text-center space-y-6 ${isDarkMode ? 'bg-slate-900 border border-slate-800' : 'bg-white'}`}>
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto border-4 border-red-100 shadow-inner">
              <AlertTriangle size={32} />
            </div>
            <div className="space-y-2">
              <h4 className={`text-sm font-black uppercase tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Kode Barang Sudah Ada</h4>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                Kode <span className="text-red-500 font-black">{formData.kodeBarang}</span> sudah terdaftar {duplicateOwner ? `atas nama ` : ''}
                {duplicateOwner && <span className="text-emerald-500 font-black">{duplicateOwner}</span>}.
                Anda ingin tetap masuk?
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleConfirmDuplicate}
                className="py-4 bg-red-500 text-white rounded-2xl font-black text-[10px] uppercase shadow-lg shadow-red-500/20 active:scale-95 transition-all"
              >
                Iya, Gandakan
              </button>
              <button
                onClick={() => setShowConfirmPopup(false)}
                className={`py-4 rounded-2xl font-black text-[10px] uppercase transition-all active:scale-95 border ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-50 border-slate-100 text-slate-500'}`}
              >
                Tidak, Ubah
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <button onClick={onCancel} className={`p-2.5 rounded-2xl transition-all ${isDarkMode ? 'bg-slate-900 text-slate-400 hover:text-slate-100' : 'bg-white text-slate-400 hover:text-slate-600 shadow-sm border border-slate-100'}`}><ChevronLeft /></button>
          <h2 className={`text-2xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Input Kerja Baru</h2>
        </div>

        {/* Tombol Reset/Restore di Header sesuai instruksi visual */}
        {(formData.kodeBarang || isManualMode) && !isScanningGlobal && (
          <button
            type="button"
            onClick={handleResetForm}
            title={scanResultGlobal ? "Restore data scan asli" : "Reset form"}
            className={`flex items-center gap-2 p-3 rounded-2xl transition-all shadow-sm active:scale-95 border-2 ${scanResultGlobal ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : isDarkMode ? 'bg-slate-900 text-red-400 border-slate-800' : 'bg-white text-red-500 border-slate-100'}`}
          >
            <RotateCcw size={20} className={scanResultGlobal ? "text-emerald-500" : ""} />
            <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">{scanResultGlobal ? "Batal Simpan" : "Reset"}</span>
          </button>
        )}
      </div>

      {isScanningGlobal ? (
        <div className="flex flex-col items-center justify-center py-32 gap-10 text-center">
          <div className="relative"><Loader2 className="animate-spin text-emerald-500" size={80} strokeWidth={3} /><div className="absolute inset-0 bg-emerald-500 blur-3xl opacity-20 animate-pulse" /></div>
          <div className="space-y-4 px-10 max-w-md"><p className={`font-black text-xl leading-snug ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{greeting}</p></div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-8 max-w-3xl mx-auto">
          {!formData.kodeBarang && !isManualMode && (
            <div className="space-y-8">
              <div className="bg-[#10b981] rounded-[3.5rem] p-10 md:p-14 text-white flex flex-col items-center justify-center gap-8 shadow-2xl text-center">
                <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center backdrop-blur-md border border-white/30"><FileText size={40} strokeWidth={2.5} /></div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-black">Pilih Metode Input</h3>
                  <p className="text-emerald-50/80 text-sm font-medium">Gunakan AI untuk memindai dokumen secara otomatis</p>
                </div>
                <div className="grid grid-cols-2 gap-4 w-full">
                  <button type="button" onClick={() => cameraInputRef.current?.click()} className="bg-white text-[#10b981] p-4 rounded-3xl font-black text-sm shadow-xl flex flex-col items-center gap-3 transition-all active:scale-95 hover:brightness-105"><Camera size={24} /> Kamera</button>
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="bg-emerald-600 text-white p-4 rounded-3xl font-black text-sm shadow-xl flex flex-col items-center gap-3 border border-emerald-400/30 transition-all active:scale-95 hover:brightness-105"><Upload size={24} /> Berkas</button>
                </div>
              </div>
              <button type="button" onClick={handleManualEntry} className={`w-full py-6 rounded-[2.5rem] border-2 border-dashed flex items-center justify-center gap-3 font-black text-sm uppercase transition-all active:scale-95 ${isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-500 hover:border-emerald-500 hover:text-emerald-500' : 'bg-white border-slate-200 text-slate-400 shadow-sm hover:border-emerald-500 hover:text-emerald-500'}`}><Package size={20} /> Ketik Manual</button>
            </div>
          )}

          <input type="file" ref={cameraInputRef} onChange={(e) => e.target.files?.[0] && handleImageInput(e.target.files[0])} hidden accept="image/*" capture="environment" />
          <input type="file" ref={fileInputRef} onChange={(e) => e.target.files?.[0] && handleImageInput(e.target.files[0])} hidden accept="image/*" />

          {(formData.kodeBarang || isManualMode) && (
            <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">

              {!formData.isManual && formData.kodeBarang && (
                <div className="sticky top-0 z-[60] -mx-2 mb-6 px-2 animate-in slide-in-from-top duration-500">
                  <div className={`p-5 rounded-[2.5rem] shadow-2xl flex items-center justify-between border-2 ring-8 backdrop-blur-md text-white ${isUrgent ? 'animate-urgent-cycle ring-red-500/20' : 'animate-normal-cycle ring-orange-500/20'}`}>
                    <div className="flex items-center gap-4">
                      <div className="p-2.5 bg-white/20 rounded-2xl">
                        <AlertTriangle size={24} className={isUrgent ? "animate-bounce" : ""} />
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] leading-tight">
                        NIH KERJAAN BELUM DISIMPEN!<br /><span className="opacity-80">NANTI HILANG!</span>
                      </p>
                    </div>
                    <div className="p-3 bg-white/20 rounded-2xl">
                      <Save size={20} className="opacity-80" />
                    </div>
                  </div>
                </div>
              )}

              <div className={`p-8 rounded-[3rem] shadow-xl border space-y-6 transition-colors ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                <div className="grid grid-cols-2 gap-6">
                  <FormInput label="Penjahit" value={formData.namaPenjahit} onChange={v => setFormData({ ...formData, namaPenjahit: v })} required isDarkMode={isDarkMode} placeholder="Isi Nama Penjahit" />
                  <FormInput
                    label="Kode Barang"
                    value={formData.kodeBarang}
                    onChange={v => setFormData({ ...formData, kodeBarang: v })}
                    required
                    isDarkMode={isDarkMode}
                    placeholder="Contoh: 1716"
                    error={showDuplicateWarning}
                  />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <FormInput label="CS (Admin)" value={formData.cs} onChange={v => setFormData({ ...formData, cs: v })} isDarkMode={isDarkMode} placeholder="Nama CS" />
                  <FormInput label="Konsumen" value={formData.konsumen} onChange={v => setFormData({ ...formData, konsumen: v })} isDarkMode={isDarkMode} placeholder="Nama Konsumen" />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <FormInput label="Tgl Order" value={formData.tanggalOrder} onChange={v => setFormData({ ...formData, tanggalOrder: v })} isDarkMode={isDarkMode} />
                  <FormInput label="Target" value={formData.tanggalTargetSelesai} onChange={v => setFormData({ ...formData, tanggalTargetSelesai: v })} isDarkMode={isDarkMode} placeholder="12 Jan 2026" />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <FormInput label="Model" isDarkMode={isDarkMode}>
                    <select className={`w-full h-14 px-5 rounded-2xl text-sm font-black transition-all outline-none focus:ring-2 focus:ring-[#10b981]/20 appearance-none bg-no-repeat bg-[right_1.25rem_center] ${isDarkMode ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800 shadow-inner'}`} value={formData.model} onChange={(e) => setFormData({ ...formData, model: e.target.value })} style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='${isDarkMode ? '%23475569' : '%2394a3b8'}' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")` }}>
                      {BRAD_MODELS.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </FormInput>
                  <FormInput label="Warna" value={formData.warna} onChange={v => setFormData({ ...formData, warna: v })} isDarkMode={isDarkMode} placeholder="Putih" />
                </div>

                {(formData.model === 'Rompi' || formData.model === 'Celana') && (
                  <div className="grid grid-cols-1 gap-6">
                    <FormInput
                      label={`Nama Model ${formData.model}`}
                      value={formData.modelDetail}
                      onChange={v => setFormData({ ...formData, modelDetail: v })}
                      isDarkMode={isDarkMode}
                      placeholder={`Contoh: Model ${formData.model} A`}
                    />
                  </div>
                )}

              </div>

              <div className={`p-8 rounded-[3rem] shadow-xl border space-y-6 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                <h3 className="text-[12px] font-black text-slate-400 uppercase flex items-center gap-2 ml-2 tracking-[0.2em]"><Package size={14} /> Konfigurasi Saku</h3>
                <div className="grid grid-cols-2 gap-6">
                  <FormInput label="Tipe Saku" isDarkMode={isDarkMode}>
                    <select
                      className={`w-full h-14 px-5 rounded-2xl text-sm font-black transition-all outline-none focus:ring-2 focus:ring-[#10b981]/20 appearance-none bg-no-repeat bg-[right_1.25rem_center] ${isDarkMode ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800 shadow-inner'}`}
                      value={formData.sakuType}
                      onChange={(e) => setFormData({ ...formData, sakuType: e.target.value as SakuType })}
                      style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='${isDarkMode ? '%23475569' : '%2394a3b8'}' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")` }}
                    >
                      {Object.values(SakuType).map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </FormInput>
                  <FormInput label="Warna Saku" isDarkMode={isDarkMode}>
                    <select
                      className={`w-full h-14 px-5 rounded-2xl text-sm font-black transition-all outline-none focus:ring-2 focus:ring-[#10b981]/20 appearance-none bg-no-repeat bg-[right_1.25rem_center] ${isDarkMode ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800 shadow-inner'}`}
                      value={formData.sakuColor}
                      onChange={(e) => setFormData({ ...formData, sakuColor: e.target.value as SakuColor })}
                      style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='${isDarkMode ? '%23475569' : '%2394a3b8'}' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")` }}
                    >
                      {Object.values(SakuColor).map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </FormInput>
                </div>
              </div>

              <div className={`p-8 rounded-[3rem] shadow-xl border space-y-6 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                <div className="flex justify-between items-center mb-2 px-2">
                  <h3 className="text-[12px] font-black text-slate-400 uppercase tracking-[0.2em]">Rincian Kerja</h3>
                  {formData.jumlahPesanan > 0 && (
                    <div className="bg-[#10b981]/10 text-[#10b981] px-4 py-1.5 rounded-full border border-[#10b981]/20 animate-in zoom-in shadow-sm">
                      <span className="text-[10px] font-black uppercase tracking-widest">{formData.jumlahPesanan} PCS TOTAL</span>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  {formData.sizeDetails?.map((sd, i) => (
                    <div key={i} className={`p-6 rounded-[2.5rem] border transition-all flex flex-col gap-4 ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-100 shadow-sm'}`}>

                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">ITEM #{i + 1}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSize(i)}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-red-50 text-red-500 border border-red-100 active:scale-95 transition-all"
                        >
                          <Trash2 size={14} />
                          <span className="text-[10px] font-black uppercase">HAPUS</span>
                        </button>
                      </div>

                      <div className="flex flex-col gap-5">
                        <div className="grid grid-cols-4 gap-3">
                          <input
                            className={`col-span-3 px-5 py-4 rounded-2xl text-sm font-black uppercase outline-none focus:ring-2 focus:ring-[#10b981]/10 ${isDarkMode ? 'bg-slate-900 text-white border-slate-800' : 'bg-slate-50 text-slate-800 border-slate-100'}`}
                            value={sd.size}
                            placeholder={formData.model === 'Celana' ? "28-40 / Custom" : "Ukuran (S/M/L/XL)"}
                            onChange={e => {
                              const val = e.target.value;
                              if (formData.model === 'Celana') {
                                if (val === "" || /^\d*$/.test(val)) {
                                  const next = [...formData.sizeDetails!];
                                  next[i].size = val;
                                  setFormData({ ...formData, sizeDetails: next });
                                }
                              } else {
                                const next = [...formData.sizeDetails!];
                                next[i].size = val;
                                setFormData({ ...formData, sizeDetails: next });
                              }
                            }}
                          />
                          <input
                            type="number"
                            className={`px-3 py-4 rounded-2xl text-sm font-black text-center outline-none ${isDarkMode ? 'bg-slate-900 text-[#10b981] border-slate-800 placeholder-emerald-900/30' : 'bg-emerald-50 text-[#10b981] border-emerald-100'}`}
                            value={sd.jumlah || ''}
                            placeholder="Qty"
                            onChange={e => { const next = [...formData.sizeDetails!]; next[i].jumlah = parseInt(e.target.value) || 0; setFormData({ ...formData, sizeDetails: next }); }}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <select className={`px-5 py-3 rounded-2xl text-[11px] font-black uppercase transition-all outline-none ${isDarkMode ? 'bg-slate-900 text-slate-100 border-slate-800' : 'bg-slate-50 text-slate-800 border-slate-100'}`} value={sd.gender} onChange={e => { const next = [...formData.sizeDetails!]; next[i].gender = e.target.value as any; setFormData({ ...formData, sizeDetails: next }); }}><option value="Pria">Pria</option><option value="Wanita">Wanita</option></select>
                          <select className={`px-5 py-3 rounded-2xl text-[11px] font-black uppercase transition-all outline-none ${isDarkMode ? 'bg-slate-900 text-slate-100 border-slate-800' : 'bg-slate-50 text-slate-800 border-slate-100'}`} value={sd.tangan} onChange={e => { const next = [...formData.sizeDetails!]; next[i].tangan = e.target.value as any; setFormData({ ...formData, sizeDetails: next }); }}><option value="Pendek">Pendek</option><option value="Panjang">Panjang</option></select>
                        </div>
                      </div>
                    </div>
                  ))}
                  <button type="button" onClick={handleAddSize} className="w-full py-6 border-2 border-dashed rounded-[2.5rem] flex items-center justify-center gap-3 text-[12px] font-black text-slate-400 uppercase transition-all hover:border-[#10b981] hover:text-[#10b981] active:scale-95"><Plus size={20} /> Tambah Item</button>
                </div>
              </div>

              <div className={`p-8 rounded-[3rem] shadow-xl border space-y-6 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                <h3 className="text-[12px] font-black text-slate-400 uppercase flex items-center gap-2 ml-2 tracking-[0.2em]"><Scissors size={14} /> Keterangan Bordir</h3>
                <div className={`flex gap-3 p-2 rounded-2xl border transition-all ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'}`}>
                  <button type="button" onClick={() => setFormData({ ...formData, embroideryStatus: 'Lengkap' })} className={`flex-1 py-4 rounded-xl text-xs font-black uppercase transition-all ${formData.embroideryStatus === 'Lengkap' ? 'bg-[#10b981] text-white shadow-lg scale-[1.02]' : 'text-slate-400 font-bold'}`}>Lengkap</button>
                  <button type="button" onClick={() => setFormData({ ...formData, embroideryStatus: 'Kurang' })} className={`flex-1 py-4 rounded-xl text-xs font-black uppercase transition-all ${formData.embroideryStatus === 'Kurang' ? 'bg-[#ef4444] text-white shadow-lg scale-[1.02]' : 'text-slate-400 font-bold'}`}>Kurang</button>
                </div>
                {formData.embroideryStatus === 'Kurang' && (
                  <textarea
                    className={`w-full p-6 rounded-[2rem] text-xs font-bold border min-h-[120px] transition-all outline-none focus:ring-2 focus:ring-[#ef4444]/10 ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-600' : 'bg-white text-slate-800 border-slate-200 shadow-inner'}`}
                    placeholder="Detail kekurangan bordir..."
                    value={formData.embroideryNotes}
                    onChange={e => setFormData({ ...formData, embroideryNotes: e.target.value })}
                  />
                )}
              </div>

              <div className={`p-8 rounded-[3rem] shadow-xl border space-y-6 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                <div className={`p-5 rounded-2xl border flex items-center justify-between transition-all ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200 shadow-inner'}`}>
                  <div className="flex flex-col gap-1">
                    <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">Ingin buat reminder di kalender?</span>
                    <p className="text-[9px] font-bold text-slate-500 uppercase">Akan diingatkan sesuai tanggal target</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, createCalendarReminder: true })}
                      className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${formData.createCalendarReminder ? 'bg-emerald-500 text-white shadow-lg' : 'text-slate-400'}`}
                    >
                      Iya
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, createCalendarReminder: false })}
                      className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${!formData.createCalendarReminder ? 'bg-red-500 text-white shadow-lg' : 'text-slate-400'}`}
                    >
                      Tidak Perlu
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <button type="submit" className="w-full bg-[#10b981] text-white font-black py-7 rounded-[3rem] shadow-2xl flex items-center justify-center gap-4 active:scale-[0.98] transition-all text-xl uppercase tracking-widest hover:brightness-105">
                  <Save size={28} /> SIMPAN PEKERJAAN
                </button>
              </div>
            </div>
          )}
        </form>
      )}
    </div>
  );
};

const FormInput = ({ label, type = 'text', value, onChange, required, isDarkMode, placeholder, readOnly, children, error }: any) => (
  <div className="flex flex-col gap-2 flex-1">
    <label className={`text-[11px] font-black uppercase ml-2 tracking-widest transition-colors ${error ? 'text-red-500' : 'text-slate-400'}`}>
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children ? children : (
      <input
        type={type}
        readOnly={readOnly}
        className={`border rounded-2xl px-6 py-4 text-sm font-black transition-all outline-none focus:ring-4 ${error ? 'border-red-500 bg-red-50/10 focus:ring-red-500/10' : 'focus:ring-[#10b981]/5'} ${isDarkMode ? (error ? 'text-red-300' : 'bg-slate-950 border-slate-800 text-white placeholder-slate-800') : (error ? 'text-red-600' : 'bg-slate-50 border-slate-200 text-slate-700 shadow-inner')}`}
        value={value || ''}
        onChange={e => !readOnly && onChange(e.target.value)}
        required={required}
        placeholder={placeholder}
      />
    )}
  </div>
);

export default ScanScreen;

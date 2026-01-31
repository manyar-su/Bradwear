
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { User, Shield, Info, LogOut, ChevronRight, FileText, Layers, Loader2, X, Camera, DollarSign, Cloud, Edit2, Upload, Send, Calendar, Package, TrendingUp, Sparkles, Code2, Users, Plus, Minus, Trash2, Check, Save, RotateCcw, Scissors, ArrowUpRight, AlertTriangle, MessageSquare, Key, CheckCircle2 } from 'lucide-react';
import { extractSplitData } from '../services/geminiService';
import { PRICE_LIST as DEFAULT_PRICE_LIST, OrderItem, JobStatus } from '../types';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale/id';

const DEFAULT_TAILOR_NAMES = [
  "Maris", "Ferry", "Aan", "Farid", "Opik",
  "Fadil", "Asep", "Abdul", "Hadi", "Epul"
];

const MenuItem = ({ icon, label, isDarkMode, onClick, badge }: any) => (
  <button onClick={onClick} className={`w-full p-4 flex items-center justify-between transition-all active:bg-slate-50`}>
    <div className="flex items-center gap-4">
      <div className={`p-2 rounded-xl border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-[#f4f7f9] border-transparent shadow-sm'}`}>{icon}</div>
      <span className={`text-[11px] font-black uppercase tracking-wider ${isDarkMode ? 'text-slate-300' : 'text-[#334155]'}`}>{label}</span>
    </div>
    <div className="flex items-center gap-2">
      {badge && <span className="bg-[#10b981] text-white text-[8px] font-black px-2 py-0.5 rounded-full">{badge}</span>}
      <ChevronRight size={16} className="text-[#cbd5e1]" />
    </div>
  </button>
);

const AccountScreen = ({ isDarkMode, orders = [], deletedOrders = [], onRestore, onPermanentDelete, onUpdateOrder }: { isDarkMode: boolean, orders?: OrderItem[], deletedOrders: OrderItem[], onRestore: (id: string) => void, onPermanentDelete: (id: string) => void, onUpdateOrder: (order: OrderItem) => void }) => {
  const [showSplitPopup, setShowSplitPopup] = useState(false);
  const [showPricePopup, setShowPricePopup] = useState(false);
  const [showReportPopup, setShowReportPopup] = useState(false);
  const [showInfoPopup, setShowInfoPopup] = useState(false);
  const [showRecyclePopup, setShowRecyclePopup] = useState(false);
  const [showEmbroideryPopup, setShowEmbroideryPopup] = useState(false);
  const [showApiKeyPopup, setShowApiKeyPopup] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem('isLoggedIn') === 'true');
  const [isSyncing, setIsSyncing] = useState(false);
  const [loading, setLoading] = useState(false);

  const [profileName, setProfileName] = useState(() => localStorage.getItem('profileName') || 'Nama Penjahit');
  const [profileImage, setProfileImage] = useState(() => localStorage.getItem('profileImage') || null);
  const [isEditingName, setIsEditingName] = useState(false);

  const [prices, setPrices] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('bradwear_price_list');
    return saved ? JSON.parse(saved) : DEFAULT_PRICE_LIST;
  });
  const [editingPriceKey, setEditingPriceKey] = useState<string | null>(null);
  const [newPriceName, setNewPriceName] = useState('');
  const [newPriceValue, setNewPriceValue] = useState('');
  const [isAddingNewPrice, setIsAddingNewPrice] = useState(false);

  // API Key State
  const [tempGeminiKey, setTempGeminiKey] = useState(() => localStorage.getItem('bradwear_gemini_key') || '');

  // Embroidery Edit State
  const [editingEmbroideryOrder, setEditingEmbroideryOrder] = useState<OrderItem | null>(null);

  const [splitResult, setSplitResult] = useState<{ orders: any[], totalPcs: number } | null>(null);
  const [selectedIndicesForShare, setSelectedIndicesForShare] = useState<Set<number>>(new Set());

  const [customNames, setCustomNames] = useState<string[]>(() => {
    const saved = localStorage.getItem('pecah_rata_names');
    return saved ? JSON.parse(saved) : DEFAULT_TAILOR_NAMES;
  });
  const [newNameInput, setNewNameInput] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const profileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    localStorage.setItem('profileName', profileName);
    localStorage.setItem('isLoggedIn', isLoggedIn.toString());
    if (profileImage) localStorage.setItem('profileImage', profileImage);
    else localStorage.removeItem('profileImage');
    localStorage.setItem('pecah_rata_names', JSON.stringify(customNames));
    localStorage.setItem('bradwear_price_list', JSON.stringify(prices));
  }, [profileName, isLoggedIn, profileImage, customNames, prices]);

  const monthlyReports = useMemo(() => {
    const stats: Record<string, { totalOrders: number, totalPcs: number, totalEarnings: number, rawDate: Date, ordersList: OrderItem[] }> = {};

    const allOrdersForEarning = [...orders, ...deletedOrders];

    allOrdersForEarning.forEach(o => {
      const date = new Date(o.createdAt);
      const monthKey = format(date, 'MMMM yyyy', { locale: idLocale });
      if (!stats[monthKey]) {
        stats[monthKey] = { totalOrders: 0, totalPcs: 0, totalEarnings: 0, rawDate: date, ordersList: [] };
      }
      stats[monthKey].totalOrders += 1;
      stats[monthKey].totalPcs += o.jumlahPesanan;
      stats[monthKey].ordersList.push(o);
      if (o.status === JobStatus.BERES) {
        const price = prices[o.model.toUpperCase()] || prices['DEFAULT'] || 0;
        stats[monthKey].totalEarnings += (price * o.jumlahPesanan);
      }
    });
    return Object.entries(stats).sort((a, b) => b[1].rawDate.getTime() - a[1].rawDate.getTime());
  }, [orders, deletedOrders, prices]);

  const handleSaveApiKey = () => {
    localStorage.setItem('bradwear_gemini_key', tempGeminiKey);
    setShowApiKeyPopup(false);
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);
  };

  const handleGoogleLogin = () => {
    setLoading(true);
    setTimeout(() => {
      setIsLoggedIn(true);
      setLoading(false);
      setIsSyncing(true);
      setTimeout(() => setIsSyncing(false), 2000);
    }, 1500);
  };

  const handleExitApp = () => {
    if (confirm("Simpan data dan keluar?")) {
      setIsLoggedIn(false);
      window.location.href = "about:blank";
    }
  };

  const handleProfileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setProfileImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSplitScan = async (files: FileList) => {
    setLoading(true);
    try {
      const base64Images = await Promise.all(
        Array.from(files).map(file => {
          return new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
            reader.readAsDataURL(file);
          });
        })
      );
      const result = await extractSplitData(base64Images);

      const ordersData = (result.orders || []).map((order: any) => ({
        ...order,
        sizeCounts: (order.sizeCounts || []).map((s: any) => ({
          size: s.size,
          jumlah: parseInt(s.jumlah) || 0
        }))
      }));

      const totalPcs = ordersData.reduce((sum: number, order: any) =>
        sum + order.sizeCounts.reduce((sSum: number, s: any) => sSum + s.jumlah, 0), 0
      );

      setSplitResult({ orders: ordersData, totalPcs });
      setSelectedIndicesForShare(new Set());
    } catch (err) {
      alert("Scan gagal.");
    } finally { setLoading(false); }
  };

  const calculatedDistribution = useMemo(() => {
    if (!splitResult) return [];
    const { orders, totalPcs } = splitResult;
    const namesToUse = customNames;
    if (namesToUse.length === 0) return [];

    let distributionPool: any[] = [];
    orders.forEach(order => {
      order.sizeCounts.forEach((sc: any) => {
        if (sc.jumlah > 0) {
          distributionPool.push({
            kodeBarang: order.kodeBarang,
            model: order.model,
            size: sc.size,
            jumlah: sc.jumlah
          });
        }
      });
    });

    distributionPool.sort((a, b) => b.jumlah - a.jumlah);

    const targetPerPerson = Math.floor(totalPcs / namesToUse.length);
    let remainder = totalPcs % namesToUse.length;

    const tailorResults = namesToUse.map((name, i) => ({
      tailorName: name,
      items: [] as any[],
      totalItems: 0,
      target: targetPerPerson + (i < remainder ? 1 : 0)
    }));

    tailorResults.forEach((tailor) => {
      let needed = tailor.target;

      while (needed > 0 && distributionPool.length > 0) {
        let bestPileIdx = -1;
        for (let i = 0; i < distributionPool.length; i++) {
          if (distributionPool[i].jumlah <= needed) {
            bestPileIdx = i;
            break;
          }
        }

        if (bestPileIdx !== -1) {
          const pile = distributionPool[bestPileIdx];
          tailor.items.push({
            kodeBarang: pile.kodeBarang,
            model: pile.model,
            size: pile.size,
            count: pile.jumlah
          });
          tailor.totalItems += pile.jumlah;
          needed -= pile.jumlah;
          distributionPool.splice(bestPileIdx, 1);
        } else {
          const largestPile = distributionPool[0];
          const take = needed;
          tailor.items.push({
            kodeBarang: largestPile.kodeBarang,
            model: largestPile.model,
            size: largestPile.size,
            count: take
          });
          tailor.totalItems += take;
          largestPile.jumlah -= take;
          needed = 0;
          if (largestPile.jumlah <= 0) distributionPool.splice(0, 1);
        }
      }
    });

    return tailorResults;
  }, [splitResult, customNames]);

  const handleAddNewTailor = () => {
    if (!newNameInput.trim()) return;
    setCustomNames([...customNames, newNameInput.trim()]);
    setNewNameInput('');
  };

  const handleRemoveTailor = (index: number) => {
    setCustomNames(customNames.filter((_, i) => i !== index));
  };

  const toggleShareSelection = (index: number) => {
    const next = new Set(selectedIndicesForShare);
    if (next.has(index)) next.delete(index);
    else next.add(index);
    setSelectedIndicesForShare(next);
  };

  const handleShareWhatsAppSplits = () => {
    if (selectedIndicesForShare.size === 0) {
      alert("Pilih minimal satu penjahit untuk dikirim!");
      return;
    }

    const selectedResults = Array.from(selectedIndicesForShare).map(i => calculatedDistribution[i]);

    let text = `*PEMBAGIAN KERJA BRADWEAR FLOW*\n`;
    text += `*Tanggal:* ${format(new Date(), 'd MMM yyyy', { locale: idLocale })}\n\n`;

    selectedResults.forEach(res => {
      text += `--------------------------\n`;
      text += `👤 *${res.tailorName.toUpperCase()}*\n`;
      text += `Total: ${res.totalItems} PCS\n`;
      text += `Detail Kerja:\n`;

      const groupedByCode: Record<string, any[]> = {};
      res.items.forEach(it => {
        if (!groupedByCode[it.kodeBarang]) groupedByCode[it.kodeBarang] = [];
        groupedByCode[it.kodeBarang].push(it);
      });

      Object.entries(groupedByCode).forEach(([code, its]) => {
        text += `📦 *KODE: ${code}*\n`;
        text += `Model: ${its[0].model}\n`;
        its.forEach(it => {
          text += `  - ${it.size}: ${it.count} PCS\n`;
        });
      });
      text += `\n`;
    });

    text += `_Mohon segera diproses, terima kasih!_`;

    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleUpdatePrice = (key: string, value: string) => {
    const numValue = parseInt(value);
    if (!isNaN(numValue)) {
      setPrices(prev => ({ ...prev, [key]: numValue }));
    }
    setEditingPriceKey(null);
  };

  const handleDeletePrice = (key: string) => {
    if (confirm(`Hapus harga untuk model ${key}?`)) {
      setPrices(prev => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const handleAddNewPrice = () => {
    if (!newPriceName.trim() || !newPriceValue.trim()) {
      alert("Nama model dan harga wajib diisi!");
      return;
    }
    const numValue = parseInt(newPriceValue);
    if (isNaN(numValue)) {
      alert("Harga harus berupa angka!");
      return;
    }
    setPrices(prev => ({ ...prev, [newPriceName.trim().toUpperCase()]: numValue }));
    setNewPriceName('');
    setNewPriceValue('');
    setIsAddingNewPrice(false);
  };

  const handleEmbroiderySubmit = () => {
    if (editingEmbroideryOrder) {
      onUpdateOrder(editingEmbroideryOrder);
      setEditingEmbroideryOrder(null);
    }
  };

  const handleShareMonthlyReport = (month: string, data: any) => {
    let text = `*LAPORAN PRODUKSI BRADWEAR FLOW*\n`;
    text += `*Bulan:* ${month}\n\n`;
    text += `📦 *Total Produksi:* ${data.totalPcs} PCS\n`;
    text += `💰 *Perkiraan Omset (Beres):* Rp ${data.totalEarnings.toLocaleString()}\n`;
    text += `📋 *Jumlah Pesanan:* ${data.totalOrders}\n\n`;
    text += `_Detail Pesanan:_\n`;

    data.ordersList.forEach((o: OrderItem, i: number) => {
      text += `${i + 1}. [${o.kodeBarang}] ${o.model} - ${o.jumlahPesanan} Pcs (${o.status})\n`;
    });

    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-slate-900' : 'bg-[#f4f7f9]'}`}>

      {/* SUCCESS TOAST ALREADY IN SCREEN */}
      {showSuccessToast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[500] animate-in slide-in-from-top duration-500">
          <div className="bg-[#10b981] text-white px-6 py-4 rounded-[2rem] shadow-2xl flex items-center gap-3 border-2 border-white/20">
            <CheckCircle2 size={24} className="animate-bounce" />
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-widest leading-none">Berhasil Disimpan</span>
              <span className="text-[8px] font-bold text-emerald-100 uppercase mt-1">Konfigurasi API diperbarui</span>
            </div>
          </div>
        </div>
      )}

      <div className="p-6 space-y-8 pb-32 animate-in fade-in duration-500">
        <input type="file" ref={fileInputRef} hidden accept="image/*" multiple onChange={(e) => e.target.files && handleSplitScan(e.target.files)} />
        <input type="file" ref={profileInputRef} hidden accept="image/*" onChange={handleProfileUpload} />

        {/* Profile Header */}
        <div className="flex flex-col items-center gap-4 py-8">
          <div className="relative group">
            <div className={`w-28 h-28 rounded-full border-[6px] shadow-xl flex items-center justify-center overflow-hidden transition-all ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-[#e6f7ef]'}`}>
              {profileImage ? <img src={profileImage} alt="Profile" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-[#10b981]"><User size={54} strokeWidth={1.5} /></div>}
            </div>
            <button onClick={() => profileInputRef.current?.click()} className="absolute bottom-1 right-1 p-2 bg-[#10b981] text-white rounded-full shadow-lg border-2 border-white active:scale-90 transition-all"><Camera size={14} strokeWidth={2.5} /></button>
          </div>
          <div className="text-center w-full px-10">
            {isEditingName ? <input autoFocus className={`w-full text-xl font-black text-center bg-transparent border-b-2 focus:outline-none transition-colors ${isDarkMode ? 'text-white border-slate-700 focus:border-[#10b981]' : 'text-[#334155] border-slate-200 focus:border-[#10b981]'}`} value={profileName} onChange={(e) => setProfileName(e.target.value)} onBlur={() => setIsEditingName(false)} onKeyDown={(e) => e.key === 'Enter' && setIsEditingName(false)} /> : <div className="flex items-center justify-center gap-2 group cursor-pointer" onClick={() => setIsEditingName(true)}><h2 className={`text-xl font-black ${isDarkMode ? 'text-white' : 'text-[#334155]'}`}>{profileName}</h2><Edit2 size={14} className="text-slate-300 opacity-0 group-hover:opacity-100" /></div>}
            <div className="mt-4 flex flex-col items-center gap-2">
              {!isLoggedIn ? <button onClick={handleGoogleLogin} className={`w-40 border-2 py-2.5 rounded-xl flex items-center justify-center gap-3 transition-all active:scale-95 border-[#7c9cfc] text-[#7c9cfc] hover:bg-blue-50/50`}>{loading ? <Loader2 className="animate-spin" size={16} /> : <><Cloud size={16} fill="currentColor" /> <span className="text-[10px] font-black uppercase tracking-widest">Login Google</span></>}</button> : <div className="flex flex-col items-center gap-1"><div className="flex items-center gap-2 bg-[#e6f7ef] px-4 py-1.5 rounded-full border border-[#10b981]/20"><Cloud className="text-[#10b981]" size={14} /><span className="text-[10px] font-black text-[#10b981] uppercase tracking-widest">{isSyncing ? 'Syncing...' : 'G-Drive Active'}</span></div></div>}
            </div>
          </div>
        </div>

        {/* Menu Sections */}
        <div className="space-y-6">
          <div>
            <h5 className="text-[10px] font-black uppercase tracking-[0.2em] ml-4 mb-3 text-[#94a3b8]">Produksi</h5>
            <div className={`rounded-3xl overflow-hidden border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-[#f1f5f9] shadow-sm'}`}>
              <MenuItem icon={<Layers className="text-[#10b981]" />} label="Pecah Rata " isDarkMode={isDarkMode} onClick={() => setShowSplitPopup(true)} />
              <div className="h-[1px] mx-4 bg-[#f8fafc]" />
              <MenuItem icon={<DollarSign className="text-amber-500" />} label="Daftar Harga" isDarkMode={isDarkMode} onClick={() => setShowPricePopup(true)} />
              <div className="h-[1px] mx-4 bg-[#f8fafc]" />
              <MenuItem icon={<Scissors className="text-blue-500" />} label="Manajemen Bordir" isDarkMode={isDarkMode} onClick={() => setShowEmbroideryPopup(true)} badge="Check" />
            </div>
          </div>

          <div>
            <h5 className="text-[10px] font-black uppercase tracking-[0.2em] ml-4 mb-3 text-[#94a3b8]">Sistem</h5>
            <div className={`rounded-3xl overflow-hidden border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-[#f1f5f9] shadow-sm'}`}>
              <MenuItem icon={<Key className="text-amber-600" />} label="API KEY Management" isDarkMode={isDarkMode} onClick={() => setShowApiKeyPopup(true)} badge="NEW" />
              <div className="h-[1px] mx-4 bg-[#f8fafc]" />
              <MenuItem icon={<Info className="text-blue-500" />} label="Laporan Bulanan" isDarkMode={isDarkMode} onClick={() => setShowReportPopup(true)} badge="AI" />
              <div className="h-[1px] mx-4 bg-[#f8fafc]" />
              <MenuItem icon={<Trash2 className="text-red-500" />} label="Tempat Sampah" isDarkMode={isDarkMode} onClick={() => setShowRecyclePopup(true)} badge={deletedOrders.length.toString()} />
              <div className="h-[1px] mx-4 bg-[#f8fafc]" />
              <MenuItem icon={<Code2 className="text-[#10b981]" />} label="Informasi Pembuat" isDarkMode={isDarkMode} onClick={() => setShowInfoPopup(true)} />
            </div>
          </div>

          <button onClick={handleExitApp} className="w-full p-4 rounded-3xl bg-red-50 text-red-500 flex items-center justify-between active:scale-95 transition-all border border-red-100 shadow-sm">
            <div className="flex items-center gap-4"><div className="p-2 bg-white rounded-xl shadow-sm"><LogOut size={20} /></div><span className="font-black uppercase text-[11px] tracking-widest">Keluar Aplikasi</span></div>
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* API KEY POPUP */}
      {showApiKeyPopup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className={`relative w-full max-w-sm rounded-[3rem] p-8 shadow-2xl flex flex-col gap-6 ${isDarkMode ? 'bg-slate-900 text-white' : 'bg-white text-slate-800'}`}>
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-black">Konfigurasi API</h3>
              <button onClick={() => setShowApiKeyPopup(false)} className="text-slate-400 hover:text-red-500"><X size={24} /></button>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 flex gap-3">
                <AlertTriangle className="text-amber-600 shrink-0" size={20} />
                <p className="text-[10px] font-bold text-amber-700 leading-relaxed uppercase tracking-widest">Kunci ini digunakan untuk fitur pemindaian AI. Pastikan kunci valid untuk menghindari error.</p>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">Provider: Google Gemini</label>
                <div className="relative">
                  <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input
                    type="password"
                    className={`w-full pl-12 pr-4 py-4 rounded-2xl text-xs font-black border outline-none focus:ring-4 focus:ring-amber-500/10 ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-100 text-slate-800'}`}
                    placeholder="AIzaSyB..."
                    value={tempGeminiKey}
                    onChange={e => setTempGeminiKey(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowApiKeyPopup(false)}
                className={`flex-1 py-4 rounded-3xl font-black text-[10px] uppercase border transition-all ${isDarkMode ? 'border-slate-800 text-slate-400' : 'border-slate-100 text-slate-400'}`}
              >
                Batal
              </button>
              <button
                onClick={handleSaveApiKey}
                className="flex-[2] py-4 bg-[#10b981] text-white rounded-3xl font-black text-[10px] uppercase shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Save size={16} /> Simpan Kunci
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Split AI Popup */}
      {showSplitPopup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className={`relative w-full max-w-sm rounded-[3rem] p-8 shadow-2xl flex flex-col max-h-[85vh] ${isDarkMode ? 'bg-slate-900 text-white' : 'bg-white text-slate-800'}`}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black">Pecah Rata</h3>
              <button onClick={() => setShowSplitPopup(false)} className="text-slate-400 hover:text-red-500"><X size={24} /></button>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 no-scrollbar space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center px-2">
                  <div className="flex items-center gap-2">
                    <h5 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Daftar Penjahit</h5>
                    <button
                      onClick={() => {
                        if (confirm("Kembalikan 10 nama penjahit asli?")) {
                          setCustomNames(DEFAULT_TAILOR_NAMES);
                        }
                      }}
                      className="p-1.5 bg-amber-50 rounded-lg text-amber-600 active:scale-95 transition-all"
                      title="Kembalikan 10 Nama Asli"
                    >
                      <RotateCcw size={10} strokeWidth={3} />
                    </button>
                  </div>
                  <span className="text-[10px] font-black text-[#10b981]">{customNames.length} Aktif</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {customNames.map((name, i) => (
                    <div key={i} className={`flex items-center gap-2 px-3 py-1.5 rounded-full border animate-in zoom-in duration-300 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                      <span className="text-[9px] font-black uppercase">{name}</span>
                      <button onClick={() => handleRemoveTailor(i)} className="text-red-400 hover:text-red-500"><X size={12} strokeWidth={3} /></button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    className={`flex-1 px-4 py-2.5 rounded-2xl text-[10px] font-black uppercase border outline-none focus:ring-2 focus:ring-[#10b981]/10 ${isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200'}`}
                    placeholder="Nama Penjahit Baru..."
                    value={newNameInput}
                    onChange={e => setNewNameInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAddNewTailor()}
                  />
                  <button onClick={handleAddNewTailor} className="p-3 bg-[#10b981] text-white rounded-2xl shadow-lg active:scale-90 transition-all"><Plus size={18} strokeWidth={3} /></button>
                </div>
              </div>

              <div className="h-[1px] bg-slate-100/10 mx-2" />

              {!splitResult ? (
                <div className="flex flex-col items-center justify-center gap-6 py-4">
                  <div className="w-16 h-16 bg-[#10b981]/10 text-[#10b981] rounded-full flex items-center justify-center"><Layers size={32} /></div>
                  <div className="text-center space-y-2">
                    <p className="text-[10px] font-bold opacity-70 uppercase tracking-widest leading-relaxed">Scan rekapan (bisa pilih banyak berkas) untuk pecah kerjaan merata.</p>
                  </div>
                  <button onClick={() => fileInputRef.current?.click()} className="w-full py-4 bg-[#10b981] text-white rounded-3xl font-black uppercase text-[10px] tracking-widest shadow-lg active:scale-95 transition-all">
                    {loading ? <Loader2 className="animate-spin mx-auto" /> : 'Upload Berkas Rekapan'}
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex justify-between items-center mb-2 px-2">
                    <h5 className="text-[10px] font-black uppercase text-[#10b981] tracking-widest tracking-[0.2em]">Hasil Pembagian</h5>
                    <button
                      onClick={handleShareWhatsAppSplits}
                      className={`flex items-center gap-2 px-4 py-2 rounded-2xl font-black text-[9px] uppercase tracking-widest transition-all ${selectedIndicesForShare.size > 0 ? 'bg-white text-[#10b981] border border-[#10b981]/30 shadow-sm' : 'bg-slate-100 text-slate-400'}`}
                    >
                      <MessageSquare size={12} /> Kirim WhatsApp
                    </button>
                  </div>

                  <div className="p-5 rounded-[2.5rem] bg-[#e6f7ef] border border-[#10b981]/10 flex justify-between items-center shadow-inner">
                    <div className="space-y-1">
                      <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Total Produksi</p>
                      <p className="text-2xl font-black text-[#10b981]">{splitResult.totalPcs} PCS</p>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Rata-Rata</p>
                      <p className="text-sm font-black text-slate-700">± {Math.floor(splitResult.totalPcs / customNames.length)} Pcs</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {calculatedDistribution.map((t, i) => {
                      const isSelected = selectedIndicesForShare.has(i);
                      const uniqueCodes = Array.from(new Set(t.items.map(it => it.kodeBarang)));

                      return (
                        <div
                          key={i}
                          onClick={() => toggleShareSelection(i)}
                          className={`p-5 rounded-[2.5rem] border transition-all cursor-pointer animate-in slide-in-from-bottom-2 duration-300 relative ${isSelected ? 'border-[#10b981] bg-[#e6f7ef]/20 shadow-md ring-4 ring-[#10b981]/5' : isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100 shadow-sm'}`}
                        >
                          <div className={`absolute top-6 left-6 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-[#10b981] border-[#10b981] text-white' : 'border-slate-300'}`}>
                            {isSelected && <Check size={10} strokeWidth={4} />}
                          </div>

                          <div className="flex justify-between items-center mb-4 pl-8">
                            <span className="text-[11px] font-black text-slate-800 uppercase tracking-widest">{t.tailorName}</span>
                            <span className="text-[11px] font-black text-[#10b981]">{t.totalItems} PCS</span>
                          </div>

                          <div className="pl-8 space-y-3">
                            {uniqueCodes.map(code => (
                              <div key={code} className="space-y-1.5">
                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">KODE: {code}</p>
                                <div className="flex flex-wrap gap-2">
                                  {t.items.filter(it => it.kodeBarang === code).map((it, idx) => (
                                    <span key={idx} className={`px-3 py-1.5 rounded-xl text-[9px] font-bold shadow-sm ${isDarkMode ? 'bg-slate-900 text-slate-300' : 'bg-slate-50 text-slate-600 border border-slate-100'}`}>
                                      {it.size}: {it.count}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <button onClick={() => setSplitResult(null)} className="w-full py-5 border-2 border-dashed border-slate-200 rounded-[2.5rem] font-black uppercase text-[10px] tracking-widest text-slate-400 hover:text-[#10b981] hover:border-[#10b981] transition-all">Scan Ulang / Reset</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Laporan Bulanan Popup */}
      {showReportPopup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className={`relative w-full max-w-sm rounded-[3rem] p-8 shadow-2xl flex flex-col max-h-[85vh] ${isDarkMode ? 'bg-slate-900 text-white' : 'bg-white text-slate-800'}`}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black">Laporan Bulanan</h3>
              <button onClick={() => setShowReportPopup(false)} className="text-slate-400 hover:text-red-500"><X size={24} /></button>
            </div>
            <div className="flex-1 overflow-y-auto pr-2 no-scrollbar space-y-4">
              {monthlyReports.length === 0 ? (
                <div className="py-20 text-center opacity-30 flex flex-col items-center gap-4">
                  <FileText size={48} />
                  <p className="text-[10px] font-black uppercase">Belum ada data produksi</p>
                </div>
              ) : monthlyReports.map(([month, data], i) => (
                <div key={i} className={`p-6 rounded-[2.5rem] border shadow-sm flex flex-col gap-4 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-[#f8fafc] border-slate-100'}`}>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#10b981]">{month}</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleShareMonthlyReport(month, data)}
                        className={`p-2 rounded-xl shadow-sm bg-emerald-100 text-emerald-600 transition-all active:scale-90`}
                      >
                        <Send size={14} />
                      </button>
                      <button className="p-2 bg-white rounded-xl shadow-sm text-blue-500"><Upload size={14} /></button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col">
                      <span className="text-[8px] font-black text-slate-400 uppercase">Produksi</span>
                      <span className="text-lg font-black">{data.totalPcs} PCS</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[8px] font-black text-slate-400 uppercase">Omset (Beres)</span>
                      <span className="text-lg font-black text-[#10b981]">Rp {(data.totalEarnings / 1000).toFixed(0)}K</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                    <TrendingUp size={12} className="text-[#10b981]" />
                    <span className="text-[9px] font-bold text-slate-500">{data.totalOrders} Pesanan Terdaftar</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Recycle Bin Popup */}
      {showRecyclePopup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className={`relative w-full max-w-sm rounded-[3rem] p-8 shadow-2xl flex flex-col max-h-[85vh] ${isDarkMode ? 'bg-slate-900 text-white' : 'bg-white text-slate-800'}`}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black">Tempat Sampah</h3>
              <button onClick={() => setShowRecyclePopup(false)} className="text-slate-400 hover:text-red-500"><X size={24} /></button>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 no-scrollbar space-y-4">
              {deletedOrders.length === 0 ? (
                <div className="py-20 flex flex-col items-center gap-4 opacity-30 text-center">
                  <Trash2 size={48} />
                  <p className="text-[10px] font-black uppercase">Tidak ada data terhapus</p>
                </div>
              ) : deletedOrders.map(o => (
                <div key={o.id} className={`p-4 rounded-3xl border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-[#f8fafc] border-slate-100'}`}>
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1 min-w-0 pr-4">
                      <p className="text-[9px] font-black text-emerald-500 uppercase truncate">{o.kodeBarang}</p>
                      <p className="text-xs font-bold truncate">{o.model}</p>
                      <p className="text-[8px] font-bold text-slate-400 italic">Dihapus pada: {o.deletedAt ? format(new Date(o.deletedAt), 'd MMM HH:mm') : '-'}</p>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => onRestore(o.id)}
                        className="p-2 bg-emerald-100 text-emerald-600 rounded-xl active:scale-90 shadow-sm"
                      >
                        <RotateCcw size={16} />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(o.id)}
                        className="p-2 bg-red-100 text-red-600 rounded-xl active:scale-90 shadow-sm"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {deleteConfirmId && (
              <div className="absolute inset-0 z-[110] bg-black/60 backdrop-blur-md flex items-center justify-center p-6 rounded-[3rem] animate-in fade-in duration-300">
                <div className={`w-full max-w-[280px] p-8 rounded-[2rem] shadow-2xl border text-center flex flex-col items-center animate-in zoom-in duration-300 ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-50'}`}>
                  <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6 border-4 border-red-50/50">
                    <AlertTriangle size={36} strokeWidth={2.5} />
                  </div>

                  <div className="space-y-3 mb-8">
                    <h4 className={`text-sm font-black uppercase tracking-tight leading-tight ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                      SERIUS KAMU MAU HAPUS DATA?
                    </h4>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-relaxed px-4">
                      TINDAKAN INI PERMANEN DAN TIDAK BISA DIKEMBALIKAN.
                    </p>
                  </div>

                  <div className="w-full flex flex-col gap-3">
                    <button
                      onClick={() => {
                        onPermanentDelete(deleteConfirmId);
                        setDeleteConfirmId(null);
                      }}
                      className="w-full py-4 bg-red-500 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-lg shadow-red-500/20 active:scale-95 transition-all"
                    >
                      IYA
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(null)}
                      className={`w-full py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all active:scale-95 ${isDarkMode ? 'bg-slate-800 text-slate-300 border border-slate-700' : 'bg-slate-50 text-slate-400 border border-slate-100'}`}
                    >
                      TIDAK
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Embroidery Management Popup */}
      {showEmbroideryPopup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className={`relative w-full max-w-sm rounded-[3rem] p-8 shadow-2xl flex flex-col max-h-[90vh] ${isDarkMode ? 'bg-slate-900 text-white' : 'bg-white text-slate-800'}`}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black">Cek Bordir</h3>
              <button onClick={() => { setShowEmbroideryPopup(false); setEditingEmbroideryOrder(null); }} className="text-slate-400 hover:text-red-500"><X size={24} /></button>
            </div>

            {!editingEmbroideryOrder ? (
              <div className="flex-1 overflow-y-auto no-scrollbar space-y-4">
                {orders.filter(o => o.status === JobStatus.PROSES).length === 0 ? (
                  <div className="py-20 flex flex-col items-center gap-3 opacity-30 text-center">
                    <Scissors size={40} />
                    <p className="text-[10px] font-black uppercase">Pekerjaan Aktif Tidak Ditemukan</p>
                  </div>
                ) : orders.filter(o => o.status === JobStatus.PROSES).map(o => (
                  <button
                    key={o.id}
                    onClick={() => setEditingEmbroideryOrder({ ...o })}
                    className={`w-full p-4 rounded-3xl border text-left flex justify-between items-center transition-all active:scale-95 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-[#f8fafc] border-slate-100'}`}
                  >
                    <div className="flex-1 truncate pr-4">
                      <span className="text-[8px] font-black text-[#10b981] uppercase block mb-1">{o.kodeBarang}</span>
                      <span className="text-xs font-black uppercase truncate block">{o.model} • {o.warna}</span>
                      <span className="text-[8px] font-black text-slate-400 uppercase mt-1 block">PJ: {o.namaPenjahit}</span>
                    </div>
                    <div className={`px-3 py-1.5 rounded-xl text-[8px] font-black uppercase border ${o.embroideryStatus === 'Kurang' ? 'bg-red-50 border-red-100 text-red-500' : 'bg-emerald-50 border-emerald-100 text-emerald-500'}`}>
                      {o.embroideryStatus || 'Lengkap'}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-6 animate-in slide-in-from-right">
                <div className="p-4 rounded-3xl bg-emerald-50 border border-emerald-100">
                  <p className="text-[10px] font-black text-emerald-600 uppercase mb-1">Editing Embroidery Status</p>
                  <p className="text-xs font-bold text-slate-800">{editingEmbroideryOrder.kodeBarang} - {editingEmbroideryOrder.model}</p>
                </div>

                <div className="space-y-3">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">Status Bordir</label>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setEditingEmbroideryOrder({ ...editingEmbroideryOrder, embroideryStatus: 'Lengkap' })}
                      className={`flex-1 py-3 rounded-2xl font-black text-[10px] uppercase border transition-all ${editingEmbroideryOrder.embroideryStatus === 'Lengkap' ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-white text-slate-400 border-slate-100'}`}
                    >
                      Lengkap
                    </button>
                    <button
                      onClick={() => setEditingEmbroideryOrder({ ...editingEmbroideryOrder, embroideryStatus: 'Kurang' })}
                      className={`flex-1 py-3 rounded-2xl font-black text-[10px] uppercase border transition-all ${editingEmbroideryOrder.embroideryStatus === 'Kurang' ? 'bg-red-500 text-white border-red-500' : 'bg-white text-slate-400 border-slate-100'}`}
                    >
                      Ada Kekurangan
                    </button>
                  </div>
                </div>

                {editingEmbroideryOrder.embroideryStatus === 'Kurang' && (
                  <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">Detail Kekurangan (Item, Jumlah, Size)</label>
                    <textarea
                      className={`w-full p-4 rounded-2xl text-xs font-bold border min-h-[100px] focus:outline-none focus:ring-4 focus:ring-emerald-500/5 ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-100 text-slate-800'}`}
                      placeholder="Contoh: Saku kiri kurang 2 (Size XL), Punggung kurang 1 (Size L)"
                      value={editingEmbroideryOrder.embroideryNotes || ''}
                      onChange={e => setEditingEmbroideryOrder({ ...editingEmbroideryOrder, embroideryNotes: e.target.value })}
                    />
                  </div>
                )}

                <div className="flex gap-2">
                  <button onClick={() => setEditingEmbroideryOrder(null)} className="flex-1 py-4 border-2 border-slate-100 text-slate-400 font-black text-[10px] uppercase rounded-3xl">Batal</button>
                  <button onClick={handleEmbroiderySubmit} className="flex-[2] py-4 bg-emerald-500 text-white font-black text-[10px] uppercase rounded-3xl shadow-lg active:scale-95 transition-all">Update Status</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Info Popup */}
      {showInfoPopup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in zoom-in duration-300">
          <div className={`relative w-full max-w-sm rounded-[3rem] p-8 shadow-2xl overflow-hidden flex flex-col ${isDarkMode ? 'bg-slate-900 text-white' : 'bg-white text-slate-800'}`}>
            <div className="flex flex-col items-center text-center gap-6">
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center border-4 border-emerald-50 shadow-xl"><Sparkles size={40} /></div>
              <div>
                <h3 className="text-xl font-black mb-2">Informasi Pembuat</h3>
                <p className="text-sm px-2 font-medium opacity-80">Saya <span className="text-[#10b981] font-black">Maris</span> membuat aplikasi beta ini untuk mempermudah dalam pencatatan kerjaan agar tidak ada data ganda dan semoga bisa bermanfaat <span className="italic">beta 2.0</span> project.</p>
              </div>
              <button onClick={() => setShowInfoPopup(false)} className="w-full py-4 bg-[#10b981] text-white rounded-3xl font-black uppercase tracking-widest text-xs">Oke, Mengerti</button>
            </div>
          </div>
        </div>
      )}

      {/* Price Management Popup */}
      {showPricePopup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className={`relative w-full max-w-sm rounded-[3rem] p-8 shadow-2xl flex flex-col max-h-[90vh] ${isDarkMode ? 'bg-slate-900 text-white' : 'bg-white text-slate-800'}`}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black">Daftar Harga</h3>
              <button onClick={() => setShowPricePopup(false)} className="text-slate-400 hover:text-red-500"><X size={24} /></button>
            </div>
            <div className="space-y-3 overflow-y-auto no-scrollbar pr-1 pb-4">
              {Object.entries(prices).map(([model, price]) => (
                <div key={model} className={`group p-4 rounded-2xl border flex flex-col gap-3 transition-all ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100 shadow-sm'}`}>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{model}</span>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => setEditingPriceKey(editingPriceKey === model ? null : model)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"><Edit2 size={14} /></button>
                      <button onClick={() => handleDeletePrice(model)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={14} /></button>
                    </div>
                  </div>
                  {editingPriceKey === model ? (
                    <div className="flex gap-2 animate-in slide-in-from-top-2">
                      <input type="number" className={`flex-1 px-4 py-2 rounded-xl text-xs font-black border focus:outline-none ${isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'}`} defaultValue={price} autoFocus onBlur={(e) => handleUpdatePrice(model, e.target.value)} />
                      <button className="bg-[#10b981] text-white p-2 rounded-xl"><Check size={16} /></button>
                    </div>
                  ) : <span className="text-base font-black text-[#10b981]">Rp {price.toLocaleString()}</span>}
                </div>
              ))}
              {isAddingNewPrice ? (
                <div className="p-4 rounded-2xl border border-dashed border-[#10b981] space-y-3 animate-in fade-in">
                  <input className={`w-full px-3 py-2 rounded-xl text-[10px] font-black uppercase border ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-800'}`} placeholder="Nama Model" value={newPriceName} onChange={e => setNewPriceName(e.target.value)} />
                  <div className="flex gap-2">
                    <input type="number" className={`flex-1 px-3 py-2 rounded-xl text-xs font-black border ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-800'}`} placeholder="Harga" value={newPriceValue} onChange={e => setNewPriceValue(e.target.value)} />
                    <button onClick={handleAddNewPrice} className="bg-[#10b981] text-white px-4 py-2 rounded-xl font-black text-[10px]">SAVE</button>
                  </div>
                </div>
              ) : <button onClick={() => setIsAddingNewPrice(true)} className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-[10px] font-black text-slate-400 uppercase tracking-widest hover:border-[#10b981] transition-all"><Plus size={16} className="inline mr-2" /> Tambah Harga Baru</button>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountScreen;

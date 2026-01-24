
import React, { useState, useEffect, useRef } from 'react';
import Layout from './components/Layout';
import Dashboard from './screens/Dashboard';
import ScanScreen from './screens/ScanScreen';
import HistoryScreen from './screens/HistoryScreen';
import AnalyticsScreen from './screens/AnalyticsScreen';
import AccountScreen from './screens/AccountScreen';
import { OrderItem, ViewState, JobStatus, Priority, SakuType, SakuColor } from './types';
import { differenceInDays, format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale/id';
import { extractOrderData } from './services/geminiService';
import { Camera, Upload, X, FileText, Loader2, Keyboard, AlertTriangle, ChevronRight } from 'lucide-react';

const GREETINGS = [
  "Sabar ya, BradwearFlow lagi baca Rekapan kamu...",
  "Lagi ngitung kancing nih, tunggu sebentar...",
  "Memproses Rekapan jahitan digital Anda...",
  "Dikit lagi beres, datanya lagi dirapiin...",
  "Hampir selesai! Lagi cocokin data rekapannya..."
];

const isValidDate = (date: any): date is Date => {
  return date instanceof Date && !isNaN(date.getTime());
};

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<ViewState>('DASHBOARD');
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
  const [isScanning, setIsScanning] = useState(false);
  
  const [scanResult, setScanResult] = useState<Partial<OrderItem> | null>(null);
  const [showScanMethodPopup, setShowScanMethodPopup] = useState(false);
  const [loadingText, setLoadingText] = useState(GREETINGS[0]);

  const globalCameraInputRef = useRef<HTMLInputElement>(null);
  const globalFileInputRef = useRef<HTMLInputElement>(null);
  const isScanningRef = useRef(false);

  useEffect(() => {
    const saved = localStorage.getItem('tailor_orders');
    if (saved) setOrders(JSON.parse(saved));
    
    const savedPending = localStorage.getItem('pending_scan_result');
    if (savedPending) setScanResult(JSON.parse(savedPending));

    // Request notification permission
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('tailor_orders', JSON.stringify(orders));
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    if (scanResult) {
      localStorage.setItem('pending_scan_result', JSON.stringify(scanResult));
    } else {
      localStorage.removeItem('pending_scan_result');
    }
    
    // Check for upcoming deadlines (1 day before)
    checkUpcomingDeadlines(orders);
  }, [orders, isDarkMode, scanResult]);

  const checkUpcomingDeadlines = (allOrders: OrderItem[]) => {
    if (!("Notification" in window) || Notification.permission !== "granted") return;

    allOrders.forEach(order => {
      if (order.status === JobStatus.PROSES && !order.deletedAt) {
        try {
          // Attempt to parse date string
          const targetDate = new Date(order.tanggalTargetSelesai);
          if (isValidDate(targetDate)) {
            const daysLeft = differenceInDays(targetDate, new Date());
            if (daysLeft === 1) {
              new Notification("Peringatan Target!", {
                body: `Order ${order.kodeBarang} (${order.model}) target besok! Mohon segera diselesaikan.`,
                icon: "/favicon.ico"
              });
            }
          }
        } catch (e) {
          // Ignore parse errors for custom date strings
        }
      }
    });
  };

  useEffect(() => {
    let interval: any;
    if (isScanning) {
      interval = setInterval(() => {
        setLoadingText(GREETINGS[Math.floor(Math.random() * GREETINGS.length)]);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isScanning]);

  const handleGlobalScan = async (base64: string) => {
    setIsScanning(true);
    isScanningRef.current = true;
    setShowScanMethodPopup(false);
    try {
      const extracted = await extractOrderData(base64);
      
      if (!isScanningRef.current) return;

      if (extracted) {
        const formatDateLong = (dateStr: string) => {
          if (!dateStr) return '';
          const d = new Date(dateStr);
          if (isValidDate(d)) {
            return format(d, 'd MMMM yyyy', { locale: idLocale });
          }
          return dateStr;
        };

        const result: Partial<OrderItem> = {
          ...extracted,
          id: Math.random().toString(36).substr(2, 9),
          createdAt: new Date().toISOString(),
          status: JobStatus.PROSES,
          isManual: false,
          tanggalOrder: formatDateLong(extracted.tanggalOrder) || format(new Date(), 'd MMMM yyyy', { locale: idLocale }),
          tanggalTargetSelesai: formatDateLong(extracted.tanggalTargetSelesai),
          sakuType: extracted.sakuType as SakuType || SakuType.POLOS,
          sakuColor: extracted.sakuColor as SakuColor || SakuColor.ABU,
          embroideryStatus: 'Lengkap'
        };

        setScanResult(result);
        setActiveView('SCAN');
      }
    } catch (err) {
      console.error("Scan error:", err);
      if (isScanningRef.current) {
        alert("Gagal membaca foto. Pastikan teks rekapan terlihat jelas dan coba lagi.");
      }
    } finally {
      setIsScanning(false);
      isScanningRef.current = false;
    }
  };

  const handleCancelScan = () => {
    setIsScanning(false);
    isScanningRef.current = false;
  };

  const handleFloatingScanClick = () => {
    setShowScanMethodPopup(true);
  };

  const handleManualEntryFromPopup = () => {
    setShowScanMethodPopup(false);
    setScanResult(null);
    setActiveView('SCAN');
  };

  const handleAddOrder = (newOrder: OrderItem) => {
    const finalizedOrder: OrderItem = {
      ...newOrder,
      id: newOrder.id || Math.random().toString(36).substr(2, 9),
      createdAt: newOrder.createdAt || new Date().toISOString()
    };
    
    setOrders([finalizedOrder, ...orders]);
    setScanResult(null);
    setActiveView('HISTORY');
  };

  const handleDeleteOrder = (id: string) => {
    setOrders(orders.map(o => o.id === id ? { ...o, deletedAt: new Date().toISOString() } : o));
  };

  const handleRestoreOrder = (id: string) => {
    setOrders(orders.map(o => o.id === id ? { ...o, deletedAt: null } : o));
  };

  const handlePermanentDelete = (id: string) => {
    setOrders(orders.filter(o => o.id !== id));
  };

  const handleUpdateStatus = (id: string, newStatus: JobStatus) => {
    setOrders(orders.map(o => {
      if (o.id === id) {
        return { 
          ...o, 
          status: newStatus,
          completedAt: newStatus === JobStatus.BERES ? new Date().toISOString() : null
        };
      }
      return o;
    }));
  };

  const handleUpdateOrder = (updatedOrder: OrderItem) => {
    setOrders(orders.map(o => o.id === updatedOrder.id ? updatedOrder : o));
  };

  const activeOrders = orders.filter(o => !o.deletedAt);
  const deletedOrders = orders.filter(o => !!o.deletedAt);

  return (
    <Layout 
      activeView={activeView} 
      onViewChange={setActiveView} 
      onScanClick={handleFloatingScanClick}
      isDarkMode={isDarkMode} 
    >
      {scanResult && activeView !== 'SCAN' && !isScanning && (
        <div 
          onClick={() => setActiveView('SCAN')}
          className="fixed top-20 left-4 right-4 z-[400] animate-in slide-in-from-top-4 duration-500 cursor-pointer"
        >
          <div className="bg-orange-500 text-white p-4 rounded-3xl shadow-2xl flex items-center justify-between border-2 border-orange-400">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl">
                <AlertTriangle size={20} className="animate-pulse" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest leading-none">Ada kerjaan belum disimpan!</p>
                <p className="text-[9px] font-bold text-orange-100 uppercase mt-1">Tap untuk lanjut & simpan</p>
              </div>
            </div>
            <ChevronRight size={20} className="opacity-60" />
          </div>
        </div>
      )}

      {isScanning && (
        <div className="fixed inset-0 z-[500] flex flex-col items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="relative mb-8">
            <Loader2 className="animate-spin text-[#10b981]" size={72} strokeWidth={3} />
            <div className="absolute inset-0 bg-[#10b981] blur-3xl opacity-20 animate-pulse" />
          </div>
          <div className="text-center space-y-3 max-w-xs">
            <h2 className="text-white text-xl font-black uppercase tracking-tight">AI Processing</h2>
            <p className="text-[#10b981] font-black text-sm leading-tight animate-pulse h-12 flex items-center justify-center">{loadingText}</p>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest pt-4 opacity-50">Mohon tunggu sebentar...</p>
            
            <button 
              onClick={handleCancelScan}
              className="mt-10 px-8 py-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all"
            >
              Batal Scan
            </button>
          </div>
        </div>
      )}

      {showScanMethodPopup && !isScanning && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
           <div className={`relative w-full max-w-xs rounded-[3rem] p-8 shadow-2xl flex flex-col gap-6 text-center ${isDarkMode ? 'bg-slate-900 border border-slate-800' : 'bg-white'}`}>
              <button onClick={() => setShowScanMethodPopup(false)} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-red-500"><X size={24} /></button>
              
              <div className="flex flex-col items-center gap-2 mt-4">
                 <div className="w-16 h-16 bg-emerald-50 text-[#10b981] rounded-full flex items-center justify-center mb-2 shadow-inner"><FileText size={32} /></div>
                 <h4 className={`text-xl font-black ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Pilih Input</h4>
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">Gunakan OCR AI atau ketik manual</p>
              </div>

              <div className="flex flex-col gap-3">
                 <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => globalCameraInputRef.current?.click()}
                      className="py-4 bg-[#10b981] text-white rounded-2xl font-black flex flex-col items-center justify-center gap-2 shadow-lg active:scale-95 transition-all uppercase text-[9px] tracking-widest"
                    >
                        <Camera size={20} /> Kamera
                    </button>
                    <button 
                      onClick={() => globalFileInputRef.current?.click()}
                      className={`py-4 rounded-2xl font-black flex flex-col items-center justify-center gap-2 transition-all active:scale-95 uppercase text-[9px] tracking-widest border ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-50 border-slate-100 text-slate-600'}`}
                    >
                        <Upload size={20} /> Berkas
                    </button>
                 </div>
                 
                 <button 
                  onClick={handleManualEntryFromPopup}
                  className={`w-full py-4 rounded-2xl font-black flex items-center justify-center gap-3 transition-all active:scale-95 uppercase text-[10px] tracking-widest border ${isDarkMode ? 'bg-slate-800 border-slate-700 text-emerald-500' : 'bg-white border-emerald-100 text-[#10b981] shadow-sm'}`}
                 >
                    <Keyboard size={18} /> Ketik Manual
                 </button>
              </div>
           </div>
        </div>
      )}

      <input 
        type="file" 
        ref={globalCameraInputRef} 
        accept="image/*" 
        capture="environment" 
        hidden 
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
              const base64 = (reader.result as string).split(',')[1];
              handleGlobalScan(base64);
            };
            reader.readAsDataURL(file);
          }
          e.target.value = '';
        }}
      />
      <input 
        type="file" 
        ref={globalFileInputRef} 
        accept="image/*" 
        hidden 
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
              const base64 = (reader.result as string).split(',')[1];
              handleGlobalScan(base64);
            };
            reader.readAsDataURL(file);
          }
          e.target.value = '';
        }}
      />

      {activeView === 'DASHBOARD' && (
        <Dashboard 
          orders={orders} 
          onScanClick={handleFloatingScanClick} 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          isDarkMode={isDarkMode}
          onViewHistory={() => setActiveView('HISTORY')}
          onUpdateStatus={handleUpdateStatus}
          onUpdateOrder={handleUpdateOrder}
          toggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        />
      )}
      {activeView === 'SCAN' && (
        <ScanScreen 
          existingOrders={activeOrders} 
          onSave={handleAddOrder} 
          onCancel={() => { setActiveView('DASHBOARD'); }} 
          isDarkMode={isDarkMode} 
          isScanningGlobal={isScanning}
          scanResultGlobal={scanResult}
          onStartScan={handleGlobalScan}
          setScanResultGlobal={setScanResult}
        />
      )}
      {activeView === 'HISTORY' && (
        <HistoryScreen 
          orders={activeOrders} 
          onDelete={handleDeleteOrder} 
          onUpdateStatus={handleUpdateStatus}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          isDarkMode={isDarkMode}
        />
      )}
      {activeView === 'ANALYTICS' && (
        <AnalyticsScreen orders={orders} isDarkMode={isDarkMode} />
      )}
      {activeView === 'ACCOUNT' && (
        <AccountScreen 
          orders={activeOrders} 
          deletedOrders={deletedOrders} 
          onRestore={handleRestoreOrder}
          onPermanentDelete={handlePermanentDelete}
          onUpdateOrder={handleUpdateOrder}
          isDarkMode={isDarkMode} 
        />
      )}
    </Layout>
  );
};

export default App;

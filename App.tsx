
import React, { useState, useEffect, useRef } from 'react';
import Layout from './components/Layout';
import Dashboard from './screens/Dashboard';
import ScanScreen from './screens/ScanScreen';
import HistoryScreen from './screens/HistoryScreen';
import AnalyticsScreen from './screens/AnalyticsScreen';
import AccountScreen from './screens/AccountScreen';
import ChatScreen from './screens/ChatScreen';
import { OrderItem, ViewState, JobStatus, Priority, SakuType, SakuColor } from './types';
import { differenceInDays, format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale/id';
import { extractOrderData } from './services/geminiService';
import { syncService } from './services/syncService';
import { notificationService } from './services/notificationService';
import { Camera, Upload, X, FileText, Loader2, Keyboard, AlertTriangle, ChevronRight, LogOut, MessageSquare, Sparkles } from 'lucide-react';
// Capacitor plugins will be accessed dynamically to avoid build issues if not installed

const GREETINGS = [
  "Sabar ya, BradwearFlow lagi baca Rekapan kamu...",
  "Lagi ngitung kancing nih, tunggu sebentar...",
  "Memproses Rekapan jahitan digital Anda...",
  "Dikit lagi beres, datanya lagi dirapiin...",
  "Hampir selesai! Lagi cocokin data rekapannya..."
];

const INDO_MONTHS: Record<string, number> = {
  'januari': 0, 'februari': 1, 'maret': 2, 'april': 3, 'mei': 4, 'juni': 5,
  'juli': 6, 'agustus': 7, 'september': 8, 'oktober': 9, 'november': 10, 'desember': 11
};

const parseIndoDate = (dateStr: string): Date | null => {
  if (!dateStr) return null;
  try {
    const parts = dateStr.toLowerCase().split(' ');
    if (parts.length === 3) {
      const day = parseInt(parts[0]);
      const month = INDO_MONTHS[parts[1]];
      const year = parseInt(parts[2]);
      if (!isNaN(day) && month !== undefined && !isNaN(year)) {
        return new Date(year, month, day);
      }
    }
    const d = new Date(dateStr);
    return !isNaN(d.getTime()) ? d : null;
  } catch {
    return null;
  }
};

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
  const [lastBackPress, setLastBackPress] = useState(0);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const globalCameraInputRef = useRef<HTMLInputElement>(null);
  const globalFileInputRef = useRef<HTMLInputElement>(null);
  const isScanningRef = useRef(false);

  const [globalNotification, setGlobalNotification] = useState<{ sender: string, kode: string } | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('tailor_orders');
    if (saved) setOrders(JSON.parse(saved));

    const savedPending = localStorage.getItem('pending_scan_result');
    if (savedPending) setScanResult(JSON.parse(savedPending));

    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'bradwear_global_notif' && e.newValue) {
        try {
          const notif = JSON.parse(e.newValue);
          if (notif && notif.sender && notif.kode) {
            const profileName = localStorage.getItem('profileName') || 'Nama Anda';
            // Only show if sender is NOT me
            if (notif.sender !== profileName) {
              setGlobalNotification(notif);
              setTimeout(() => setGlobalNotification(null), 5000);
            }
          }
        } catch { }
      }
    };
    window.addEventListener('storage', handleStorage);

    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }

    // Initialize push notification service
    notificationService.init().catch(e => console.log('Notification init skipped:', e));

    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  useEffect(() => {
    localStorage.setItem('tailor_orders', JSON.stringify(orders));
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    if (scanResult) {
      localStorage.setItem('pending_scan_result', JSON.stringify(scanResult));
    } else {
      localStorage.removeItem('pending_scan_result');
    }

    const profileName = localStorage.getItem('profileName') || 'Nama Anda';
    notificationService.checkAndNotify(orders, profileName).catch(e => console.log('Deadline check failed:', e));
  }, [orders, isDarkMode, scanResult]);

  useEffect(() => {
    // Handling Back Button logic
    const handleBackButton = () => {
      if (activeView !== 'DASHBOARD') {
        setActiveView('DASHBOARD');
        return;
      }

      const now = Date.now();
      if (now - lastBackPress < 2000) {
        setShowExitConfirm(true);
      } else {
        setLastBackPress(now);
      }
    };

    // This works if Capacitor is active and popstate is triggered
    window.addEventListener('popstate', (e) => {
      e.preventDefault();
      handleBackButton();
      window.history.pushState(null, '', window.location.pathname);
    });

    // Push initial state to trap back button
    window.history.pushState(null, '', window.location.pathname);

    return () => {
      window.removeEventListener('popstate', handleBackButton);
    };
  }, [activeView, lastBackPress]);



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
    const profileName = localStorage.getItem('profileName') || 'Nama Anda';

    const apiKey = localStorage.getItem('bradwear_gemini_key');
    if (!apiKey) {
      alert("⚠️ API KEY TIDAK DITEMUKAN!\n\nFitur scan memerlukan Gemini API Key. Silakan isi API Key di menu 'Account' atau tanyakan ke pembuat aplikasi (Maris).");
      setIsScanning(false);
      isScanningRef.current = false;
      return;
    }

    try {
      const extracted = await extractOrderData(base64);

      if (!isScanningRef.current) return;

      if (extracted) {
        let finalSizeDetails = extracted.sizeDetails || [];

        // ALGORITMA SCANNER CERDAS:
        // Jika scanner mendeteksi nama penjahit pada baris item tertentu,
        // dan nama tersebut cocok dengan Nama Akun yang sedang login,
        // maka aplikasi hanya akan mengambil rincian kerja milik akun tersebut.
        const anyTailorMentioned = finalSizeDetails.some((sd: any) => sd.namaPenjahit);

        if (anyTailorMentioned && profileName) {
          finalSizeDetails = finalSizeDetails.filter((sd: any) =>
            !sd.namaPenjahit || sd.namaPenjahit.toLowerCase().trim() === profileName.toLowerCase().trim()
          );
        }

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
          sizeDetails: finalSizeDetails,
          jumlahPesanan: finalSizeDetails.reduce((sum, sd) => sum + (sd.jumlah || 0), 0),
          namaPenjahit: profileName, // Otomatis isi nama penjahit dari akun
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
    } catch (err: any) {
      console.error("Scan error:", err);
      if (isScanningRef.current) {
        const errorMsg = err?.message || err?.toString() || 'Unknown error';
        if (errorMsg.includes('API_KEY') || errorMsg.includes('401') || errorMsg.includes('403')) {
          alert("Error API Key: Silakan cek API Key Gemini di menu Account atau gunakan key yang valid.");
        } else if (errorMsg.includes('network') || errorMsg.includes('fetch') || errorMsg.includes('Failed to fetch')) {
          alert("Gagal terhubung ke server. Periksa koneksi internet Anda.");
        } else if (errorMsg.includes('quota') || errorMsg.includes('429')) {
          alert("Batas penggunaan API tercapai. Coba lagi nanti atau gunakan API Key pribadi.");
        } else {
          alert(`Gagal membaca foto: ${errorMsg}\n\nPastikan teks rekapan terlihat jelas dan coba lagi.`);
        }
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

    // Real-time synchronization to global store (Supabase)
    syncService.pushOrderToCloud(finalizedOrder).catch(e => console.error('Sync failed:', e));

    if (finalizedOrder.createCalendarReminder && finalizedOrder.tanggalTargetSelesai) {
      createCalendarReminder(finalizedOrder);
    }
  };

  const createCalendarReminder = async (order: OrderItem) => {
    const CapCalendar = (window as any).Capacitor?.Plugins?.Calendar;
    const targetDate = parseIndoDate(order.tanggalTargetSelesai);
    if (!targetDate) return;

    const title = `Target Selesai: ${order.kodeBarang} - ${order.model}${order.modelDetail ? ` (${order.modelDetail})` : ''}`;
    const desc = `Penjahit: ${order.namaPenjahit}\nKonsumen: ${order.konsumen}\nJumlah: ${order.jumlahPesanan} PCS`;

    try {
      if (!CapCalendar) throw new Error("Calendar plugin not found");

      const hasPermission = await CapCalendar.checkPermissions();
      if (hasPermission.readCalendar !== 'granted' || hasPermission.writeCalendar !== 'granted') {
        await CapCalendar.requestPermissions();
      }

      const startDate = new Date(targetDate);
      startDate.setHours(9, 0, 0, 0); // Default to 9 AM
      const endDate = new Date(startDate);
      endDate.setHours(10, 0, 0, 0);

      await CapCalendar.createEvent({
        title,
        notes: desc,
        startDate: startDate.getTime(),
        endDate: endDate.getTime(),
        location: 'Bradwear Workshop'
      });

      alert("Reminder telah ditambahkan ke kalender perangkat!");
    } catch (err) {
      console.error("Calendar error:", err);
      // Fallback to Google Calendar link if plugin fails
      const startStr = targetDate.toISOString().replace(/-|:|\.\d+/g, '');
      const endStr = new Date(targetDate.getTime() + 60 * 60 * 1000).toISOString().replace(/-|:|\.\d+/g, '');
      const url = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&details=${encodeURIComponent(desc)}&dates=${startStr}/${endStr}`;
      window.open(url, '_blank');
    }
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
      {/* Global Notification Toast */}
      {globalNotification && (
        <div className="fixed top-24 left-4 right-4 z-[600] animate-in slide-in-from-top-4 duration-500">
          <div className="bg-slate-900/95 backdrop-blur-md text-white p-4 rounded-[2rem] shadow-2xl flex items-center gap-4 border border-slate-700/50 overflow-hidden">
            <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center flex-shrink-0 animate-pulse shadow-lg shadow-emerald-500/20">
              <Sparkles size={24} className="text-white" />
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-black uppercase text-emerald-400 tracking-widest mb-0.5">Kerjaan Baru!</p>
              <p className="text-xs font-bold leading-tight line-clamp-2">
                <span className="text-white italic">{globalNotification.sender}</span> baru saja mengerjakan kode <span className="text-emerald-400">#{globalNotification.kode}</span>
              </p>
            </div>
            <button onClick={() => setGlobalNotification(null)} className="p-2 text-slate-500">
              <X size={18} />
            </button>
            <div className="absolute bottom-0 left-0 h-1 bg-emerald-500 transition-all duration-5000 ease-linear w-full" />
          </div>
        </div>
      )}

      {scanResult && scanResult.kodeBarang && activeView !== 'SCAN' && !isScanning && (
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
      {activeView === 'FORUM_CHAT' && (
        <ChatScreen isDarkMode={isDarkMode} />
      )}
      {showExitConfirm && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in zoom-in duration-300">
          <div className={`relative w-full max-w-sm rounded-[3rem] p-8 shadow-2xl flex flex-col text-center space-y-6 ${isDarkMode ? 'bg-slate-900 border border-slate-800' : 'bg-white'}`}>
            <div className="w-16 h-16 bg-slate-100 text-slate-500 rounded-full flex items-center justify-center mx-auto border-4 border-slate-200 shadow-inner">
              <LogOut size={32} />
            </div>
            <div className="space-y-2">
              <h4 className={`text-sm font-black uppercase tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Keluar Aplikasi?</h4>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                Apakah Anda yakin ingin keluar dari aplikasi?
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  const CapApp = (window as any).Capacitor?.Plugins?.App;
                  if (CapApp) {
                    if (CapApp.minimizeApp) {
                      CapApp.minimizeApp();
                    } else {
                      CapApp.exitApp();
                    }
                  } else {
                    window.close();
                  }
                  setShowExitConfirm(false);
                }}
                className="py-4 bg-red-500 text-white rounded-2xl font-black text-[10px] uppercase shadow-lg shadow-red-500/20 active:scale-95 transition-all"
              >
                Iya, Keluar
              </button>
              <button
                onClick={() => setShowExitConfirm(false)}
                className={`py-4 rounded-2xl font-black text-[10px] uppercase transition-all active:scale-95 border ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-50 border-slate-100 text-slate-500'}`}
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default App;

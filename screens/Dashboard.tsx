
import React, { useMemo, useState, useEffect } from 'react';
import { Search, Package, Clock, Sun, Moon, BellRing, Target, ArrowUpRight, ChevronRight, AlertCircle, X, Info, User, Calendar, Scissors, ShieldCheck, Flame, PlusCircle, Layers, DollarSign, History, BarChart2 } from 'lucide-react';
import { OrderItem, JobStatus, Priority } from '../types';
import { format, differenceInDays } from 'date-fns';
import { id as idLocale } from 'date-fns/locale/id';

interface DashboardProps {
  orders: OrderItem[];
  onScanClick: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  isDarkMode: boolean;
  onViewHistory: () => void;
  toggleDarkMode?: () => void;
  onUpdateStatus?: (id: string, status: JobStatus) => void;
  onUpdateOrder?: (order: OrderItem) => void;
}

const MOTIVATIONAL_QUOTES = [
  "Detail adalah kunci kualitas sejati.",
  "Setiap jahitan menceritakan dedikasi Anda.",
  "Kualitas Bradwear ada di tangan Anda.",
  "Kerja keras hari ini, sukses hari esok.",
  "Fokus pada proses, hasil mengikuti.",
  "Jadikan setiap pakaian karya seni.",
  "Disiplin adalah jembatan menuju prestasi."
];

const INDO_MONTHS: Record<string, number> = {
  'januari': 0, 'februari': 1, 'maret': 2, 'april': 3, 'mei': 4, 'juni': 5,
  'juli': 6, 'agustus': 7, 'september': 8, 'oktober': 9, 'november': 10, 'desember': 11
};

const isValidDate = (date: any): date is Date => {
  return date instanceof Date && !isNaN(date.getTime());
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
    return isValidDate(d) ? d : null;
  } catch {
    return null;
  }
};

interface ReminderCardProps {
  order: any;
  urgencyType: 'late' | 'upcoming';
  isDarkMode: boolean;
  onClick: () => void;
  index: number;
}

const ReminderCard: React.FC<ReminderCardProps> = ({ order, urgencyType, isDarkMode, onClick, index }) => {
  const urgencyLabel = urgencyType === 'late' ? 'TERLAMBAT' : order.daysLeft === 0 ? 'HARI INI' : `${order.daysLeft} HARI LAGI`;
  const urgencyColor = urgencyType === 'late' ? 'bg-[#ef4444]' : order.daysLeft === 0 ? 'bg-orange-500' : 'bg-blue-500';

  return (
    <div 
      onClick={onClick}
      style={{ animationDelay: `${index * 80}ms` }}
      className={`w-full p-5 rounded-[2.5rem] border shadow-sm transition-all active:scale-[0.98] cursor-pointer mb-3 animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both hover:-translate-y-1 hover:shadow-md ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-50'}`}
    >
      <div className="flex justify-between items-start mb-3">
        <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-tighter ${urgencyColor} text-white ${urgencyType === 'late' ? 'animate-pulse' : ''}`}>
          {urgencyLabel}
        </span>
        <span className="text-[8px] font-black text-slate-400 uppercase">#{order.kodeBarang}</span>
      </div>
      
      <h5 className={`font-black text-sm truncate mb-1 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{order.model} • {order.warna}</h5>
      <div className="flex items-center gap-1.5 mb-3">
        <div className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center">
          <Package size={8} className="text-emerald-500" />
        </div>
        <p className="text-[9px] font-bold text-slate-400 uppercase truncate">PJ: <span className="text-emerald-500">{order.namaPenjahit || 'NULL'}</span></p>
      </div>

      <div className={`p-2 rounded-xl flex items-center justify-between ${isDarkMode ? 'bg-slate-900' : 'bg-slate-50'}`}>
        <span className="text-[8px] font-black text-slate-400 uppercase tracking-tight">TARGET:</span>
        <span className="text-[8px] font-black text-slate-600 uppercase tracking-tight">{order.tanggalTargetSelesai}</span>
      </div>
    </div>
  );
};

const DetailRow = ({ icon, label, value, subValue, isDarkMode, isLongText, onClick, className }: any) => (
  <div 
    onClick={onClick}
    className={`flex items-start gap-4 p-5 rounded-3xl border transition-all ${className ? className : isDarkMode ? 'bg-slate-800 border-slate-700 shadow-lg' : 'bg-white border-slate-100 shadow-sm'} ${onClick ? 'cursor-pointer active:scale-[0.98]' : ''}`}
  >
    <div className={`flex-shrink-0 p-2.5 rounded-2xl ${isDarkMode ? 'bg-slate-900' : 'bg-slate-50'}`}>
      {icon}
    </div>
    <div className="flex-1 flex flex-col gap-0.5 min-w-0">
      <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.15em]">{label}</span>
      <span className={`font-bold leading-relaxed break-words ${isLongText ? 'text-[10px]' : 'text-xs uppercase'} ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>
        {value}
      </span>
      {subValue && (
        <span className="text-[9px] font-medium text-slate-400 italic mt-1 leading-tight">
          "{subValue}"
        </span>
      )}
    </div>
    {onClick && <ChevronRight size={14} className="text-slate-300 self-center" />}
  </div>
);

const Dashboard: React.FC<DashboardProps> = ({ orders, searchQuery, setSearchQuery, isDarkMode, onViewHistory, toggleDarkMode, onScanClick, onUpdateStatus, onUpdateOrder }) => {
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [showSearchResults, setShowSearchResults] = useState(false);
  
  const activeOnly = useMemo(() => orders.filter(o => !o.deletedAt), [orders]);

  const selectedOrder = useMemo(() => {
    if (!selectedOrderId) return null;
    return orders.find(o => o.id === selectedOrderId) || null;
  }, [selectedOrderId, orders]);

  const dailyQuote = useMemo(() => {
    const day = new Date().getDate();
    return MOTIVATIONAL_QUOTES[day % MOTIVATIONAL_QUOTES.length];
  }, []);

  const stats = useMemo(() => {
    const active = orders.filter(o => !o.deletedAt && o.status === JobStatus.PROSES).length;
    const completed = orders.filter(o => o.status === JobStatus.BERES).length;
    const totalPcs = orders.reduce((sum, o) => sum + o.jumlahPesanan, 0);
    return { active, completed, totalPcs, total: orders.length };
  }, [orders]);

  const filteredResults = useMemo(() => {
    if (!localSearch.trim()) return [];
    return activeOnly.filter(o => 
      o.kodeBarang.toLowerCase().includes(localSearch.toLowerCase()) || 
      o.namaPenjahit.toLowerCase().includes(localSearch.toLowerCase())
    ).slice(0, 5);
  }, [localSearch, activeOnly]);

  const { lateReminders, upcomingReminders } = useMemo(() => {
    const activeReminders = orders
      .filter(o => !o.deletedAt && o.status === JobStatus.PROSES)
      .map(o => {
        const targetDate = parseIndoDate(o.tanggalTargetSelesai);
        const days = targetDate ? differenceInDays(targetDate, new Date()) : 999;
        return { ...o, daysLeft: days };
      });

    const late = activeReminders
      .filter(o => o.daysLeft < 0)
      .sort((a, b) => a.daysLeft - b.daysLeft);

    const upcoming = activeReminders
      .filter(o => o.daysLeft >= 0)
      .sort((a, b) => a.daysLeft - b.daysLeft);

    return { lateReminders: late, upcomingReminders: upcoming };
  }, [orders]);

  const handleToggleStatus = () => {
    if (selectedOrder && onUpdateStatus) {
      const nextStatus = selectedOrder.status === JobStatus.BERES ? JobStatus.PROSES : JobStatus.BERES;
      onUpdateStatus(selectedOrder.id, nextStatus);
    }
  };

  const handleToggleEmbroidery = () => {
    if (selectedOrder && onUpdateOrder) {
      const nextStatus = selectedOrder.embroideryStatus === 'Kurang' ? 'Lengkap' : 'Kurang';
      onUpdateOrder({
        ...selectedOrder,
        embroideryStatus: nextStatus as 'Lengkap' | 'Kurang'
      });
    }
  };

  return (
    <div className="relative animate-in fade-in duration-500">
      {selectedOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in zoom-in duration-300">
          <div className={`relative w-full max-sm rounded-[3rem] p-8 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden ${isDarkMode ? 'bg-slate-900 text-white' : 'bg-white text-slate-800'}`}>
            <button 
              onClick={() => setSelectedOrderId(null)} 
              className={`absolute top-6 right-6 p-2 rounded-xl transition-colors ${isDarkMode ? 'text-slate-500 hover:bg-slate-800' : 'text-slate-400 hover:bg-slate-100'}`}
            >
              <X size={24} />
            </button>
            
            <div className="space-y-6 overflow-y-auto pr-2 no-scrollbar mt-4 pb-4">
              <div className="flex flex-col items-center gap-4 text-center">
                <h3 className={`text-2xl font-black uppercase tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                  {selectedOrder.kodeBarang}
                </h3>
                
                <button 
                  onClick={handleToggleStatus}
                  className={`px-8 py-2.5 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl transition-all active:scale-95 flex items-center gap-2 border-2 ${selectedOrder.status === JobStatus.BERES ? 'bg-emerald-500 border-emerald-400 shadow-emerald-500/20' : 'bg-[#ef4444] border-red-400 shadow-red-500/20'} text-white`}
                >
                  <div className={`w-2 h-2 rounded-full bg-white ${selectedOrder.status === JobStatus.PROSES ? 'animate-pulse' : ''}`} />
                  {selectedOrder.status === JobStatus.BERES ? 'Pekerjaan Selesai' : 'Sedang Diproses'}
                </button>
              </div>

              <div className="space-y-4">
                <DetailRow 
                  icon={<Package size={20} className="text-[#10b981]" />} 
                  label="Model & Warna" 
                  value={`${selectedOrder.model} • ${selectedOrder.warna}`} 
                  isDarkMode={isDarkMode} 
                />
                <DetailRow 
                  icon={<User size={20} className="text-[#3b82f6]" />} 
                  label="Penjahit" 
                  value={selectedOrder.namaPenjahit} 
                  isDarkMode={isDarkMode} 
                />
                <DetailRow 
                  icon={<Calendar size={20} className="text-[#f59e0b]" />} 
                  label="Target Selesai" 
                  value={selectedOrder.tanggalTargetSelesai} 
                  isDarkMode={isDarkMode} 
                />
                
                <DetailRow 
                  onClick={handleToggleEmbroidery}
                  icon={<Scissors size={20} className="text-[#8b5cf6]" />} 
                  label="Status Bordir" 
                  value={selectedOrder.embroideryStatus || 'Lengkap'} 
                  subValue={selectedOrder.embroideryNotes}
                  isDarkMode={isDarkMode}
                  className={selectedOrder.embroideryStatus === 'Kurang' ? 'border-red-200 bg-red-50/10' : ''}
                />

                <DetailRow 
                  icon={<Info size={20} className="text-[#64748b]" />} 
                  label="Keterangan" 
                  value={selectedOrder.deskripsiPekerjaan || 'Tidak ada catatan khusus.'} 
                  isDarkMode={isDarkMode} 
                  isLongText
                />
              </div>
              
              <button 
                onClick={() => { setSelectedOrderId(null); onViewHistory(); }}
                className="w-full py-5 bg-[#10b981] text-white rounded-3xl font-black uppercase tracking-widest text-xs shadow-xl shadow-[#10b981]/20 active:scale-95 transition-all mt-4"
              >
                Lihat di History
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={`sticky top-0 z-30 px-6 py-4 flex justify-between items-center backdrop-blur-md border-b transition-colors ${isDarkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-50/80 border-slate-200'}`}>
         <div className="flex items-center gap-3">
            <div className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 ${isDarkMode ? 'border-slate-700 bg-slate-800 shadow-[0_0_10px_rgba(57,255,20,0.2)]' : 'border-slate-100 bg-white shadow-sm'}`}>
              {/* Neon Icon Style Header */}
              <div className="w-6 h-6 bg-black rounded flex items-center justify-center p-0.5 border border-[#39FF14]/50">
                <span className="text-[6px] font-black leading-none text-center" style={{ color: '#39FF14', textShadow: '0 0 2px #39FF14' }}>BRAD<br/>WEAR</span>
              </div>
              <span className={`text-sm font-black ${isDarkMode ? 'text-[#39FF14]' : 'text-[#10b981]'}`}>{format(new Date(), 'HH:mm')}</span>
            </div>
            <div>
              <h2 className={`text-lg font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Bradwear Flow</h2>
            </div>
          </div>
          <button onClick={toggleDarkMode} className={`p-2.5 rounded-xl shadow-sm border transition-all active:scale-90 ${isDarkMode ? 'bg-slate-800 text-amber-400 border-slate-700' : 'bg-white text-slate-500 border-slate-100'}`}>
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
      </div>

      <div className="p-6 space-y-6 flex flex-col items-center">
        {/* Quick Menu Grid ala Fintech */}
        <div className="w-full max-w-sm grid grid-cols-4 gap-4 px-2 py-4 animate-in slide-in-from-top-4 duration-700">
           <QuickMenuButton icon={<Package className="text-[#10b981]" />} label="Scan" onClick={onScanClick} isDarkMode={isDarkMode} />
           <QuickMenuButton icon={<History className="text-blue-500" />} label="History" onClick={onViewHistory} isDarkMode={isDarkMode} />
           <QuickMenuButton icon={<Layers className="text-orange-500" />} label="Pecah" onClick={() => {}} isDarkMode={isDarkMode} />
           <QuickMenuButton icon={<BarChart2 className="text-purple-500" />} label="Stats" onClick={() => {}} isDarkMode={isDarkMode} />
        </div>

        <div className={`w-full max-sm p-6 rounded-[2.5rem] border shadow-lg relative overflow-hidden animate-in slide-in-from-bottom-4 duration-700 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-50'}`}>
          <div className="relative z-10">
            <div className="flex justify-between items-center mb-6">
              <div className={`p-3 rounded-2xl ${isDarkMode ? 'bg-slate-900' : 'bg-emerald-50'}`}>
                <Target className="text-emerald-500" size={24} />
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pekerjaan Aktif</p>
                <p className={`text-sm font-black ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{stats.active} Order</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <div>
                  <h3 className={`text-3xl font-black tracking-tighter ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                    {stats.totalPcs} <span className="text-sm font-bold text-slate-400">PCS</span>
                  </h3>
                  <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Total Produksi Sistem</p>
                </div>
                <div className="flex items-center gap-1 text-emerald-500 text-xs font-bold">
                  <ArrowUpRight size={14} />
                  <span>+{(stats.completed / Math.max(stats.total, 1) * 100).toFixed(0)}% Done</span>
                </div>
              </div>
              
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 transition-all duration-1000" 
                  style={{ width: `${(stats.completed / Math.max(stats.total, 1)) * 100}%` }}
                />
              </div>
            </div>
          </div>
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-emerald-500/5 rounded-full blur-3xl" />
        </div>

        <div className="w-full max-w-sm overflow-hidden relative py-1 rounded-full border border-dashed border-slate-300">
          <div className="flex animate-[marquee_25s_linear_infinite] whitespace-nowrap">
            <span className={`text-[10px] font-bold uppercase tracking-[0.2em] px-4 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              {dailyQuote} • {dailyQuote} • {dailyQuote} • {dailyQuote}
            </span>
          </div>
        </div>

        <div className="w-full max-w-sm relative z-40 animate-in fade-in duration-700 delay-200">
          <div className="relative group mb-3">
            <Search className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${localSearch ? 'text-[#10b981]' : 'text-slate-400'}`} size={18} />
            <input 
              type="text" 
              placeholder="Cari Kode Barang / Penjahit..." 
              value={localSearch} 
              onFocus={() => setShowSearchResults(true)}
              onChange={(e) => {
                setLocalSearch(e.target.value);
                setSearchQuery(e.target.value);
              }} 
              className={`w-full border rounded-[1.5rem] py-4 pl-11 pr-10 focus:outline-none focus:ring-4 transition-all shadow-sm ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white focus:ring-emerald-500/10' : 'bg-white border-slate-100 text-slate-800 focus:ring-emerald-500/5'}`} 
            />
            {localSearch && (
              <button onClick={() => { setLocalSearch(''); setSearchQuery(''); }} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 p-1">
                <X size={16} />
              </button>
            )}
          </div>

          {showSearchResults && localSearch.trim() && (
            <div className={`absolute left-0 right-0 mt-2 p-2 rounded-3xl border shadow-2xl animate-in slide-in-from-top-2 duration-300 z-50 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
              {filteredResults.length === 0 ? (
                <div className="p-4 text-center">
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Tidak ditemukan</p>
                </div>
              ) : (
                <div className="flex flex-col gap-1">
                  {filteredResults.map(order => (
                    <button 
                      key={order.id}
                      onClick={() => {
                        setSelectedOrderId(order.id);
                        setShowSearchResults(false);
                      }}
                      className={`flex items-center gap-3 p-3 rounded-2xl text-left transition-all active:scale-[0.98] ${isDarkMode ? 'hover:bg-slate-900' : 'hover:bg-slate-50'}`}
                    >
                      <div className={`p-2 rounded-xl ${isDarkMode ? 'bg-slate-700' : 'bg-emerald-50'} text-[#10b981]`}>
                        <Package size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-black uppercase truncate ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{order.kodeBarang}</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase truncate">PJ: {order.namaPenjahit}</p>
                      </div>
                      <ChevronRight size={14} className="text-slate-300" />
                    </button>
                  ))}
                  <div className="h-[1px] bg-slate-100/10 mx-2 my-1" />
                  <button 
                    onClick={() => {
                      setSearchQuery(localSearch);
                      onViewHistory();
                      setShowSearchResults(false);
                    }}
                    className="w-full py-2.5 text-[9px] font-black text-emerald-500 uppercase tracking-widest text-center"
                  >
                    Lihat Semua Hasil
                  </button>
                </div>
              )}
            </div>
          )}
          {showSearchResults && (
            <div className="fixed inset-0 z-[-1]" onClick={() => setShowSearchResults(false)} />
          )}
        </div>

        <div className="w-full max-w-sm grid grid-cols-2 gap-4 animate-in slide-in-from-bottom-2 duration-700 delay-500">
          <div className={`p-5 rounded-[2rem] border shadow-sm flex flex-col items-center text-center ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-50'}`}>
            <Package className="text-emerald-500 mb-2" size={20} />
            <p className="text-[8px] text-slate-400 font-black uppercase tracking-wider">Berjalan</p>
            <p className={`text-xl font-black ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{stats.active}</p>
          </div>
          <div className={`p-5 rounded-[2rem] border shadow-sm flex flex-col items-center text-center ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-50'}`}>
            <Clock className="text-blue-500 mb-2" size={20} />
            <p className="text-[8px] text-slate-400 font-black uppercase tracking-wider">Beres</p>
            <p className={`text-xl font-black ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{stats.completed}</p>
          </div>
        </div>

        <div className="w-full max-w-sm space-y-8 animate-in slide-in-from-bottom-2 duration-700 delay-300">
          <div className="px-2">
            <h4 className="font-black text-[10px] uppercase text-slate-400 tracking-[0.2em] flex items-center gap-2 mb-4">
              <BellRing size={14} className="text-orange-500" /> Pengingat Target
            </h4>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 px-2">
              <Flame size={12} className="text-red-500" />
              <span className="text-[9px] font-black uppercase tracking-widest text-red-500">Terlambat</span>
            </div>
            {lateReminders.length === 0 ? (
              <div className={`mx-2 p-5 rounded-[2rem] border border-dashed flex items-center justify-center gap-3 ${isDarkMode ? 'border-slate-800 bg-slate-800/20' : 'border-slate-200 bg-slate-50/50'}`}>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Aman, Tidak ada yang terlambat</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2 px-2">
                {lateReminders.map((order, idx) => (
                  <ReminderCard key={order.id} order={order} urgencyType="late" isDarkMode={isDarkMode} onClick={() => setSelectedOrderId(order.id)} index={idx} />
                ))}
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 px-2">
              <Clock size={12} className="text-blue-500" />
              <span className="text-[9px] font-black uppercase tracking-widest text-blue-500">Mendatang</span>
            </div>
            {upcomingReminders.length === 0 ? (
              <div className={`mx-2 p-5 rounded-[2rem] border border-dashed flex items-center justify-center gap-3 ${isDarkMode ? 'border-slate-800 bg-slate-800/20' : 'border-slate-200 bg-slate-50/50'}`}>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Belum ada target baru</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2 px-2">
                {upcomingReminders.map((order, idx) => (
                  <ReminderCard key={order.id} order={order} urgencyType="upcoming" isDarkMode={isDarkMode} onClick={() => setSelectedOrderId(order.id)} index={idx} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
};

const QuickMenuButton = ({ icon, label, onClick, isDarkMode }: any) => (
  <button 
    onClick={onClick}
    className="flex flex-col items-center gap-2 active:scale-95 transition-all"
  >
    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm border transition-colors ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-100'}`}>
      {icon}
    </div>
    <span className={`text-[9px] font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{label}</span>
  </button>
);

export default Dashboard;

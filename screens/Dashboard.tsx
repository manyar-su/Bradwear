
import React, { useMemo, useState, useEffect } from 'react';
import { Search, Package, Clock, Sun, Moon, BellRing, Target, ArrowUpRight, ChevronRight, AlertCircle, X, Info, User, Calendar, Scissors, ShieldCheck, Lock, Shield, Flame, PlusCircle, Layers, DollarSign, History, BarChart2, Send, UserCheck } from 'lucide-react';
import { OrderItem, JobStatus, Priority } from '../types';
import { format, differenceInDays, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay, addDays, isBefore, startOfDay } from 'date-fns';
import { id as idLocale } from 'date-fns/locale/id';
import { syncService } from '../services/syncService';

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
const Calendar3D = ({ orders, isDarkMode }: { orders: OrderItem[], isDarkMode: boolean }) => {
  const today = startOfDay(new Date());
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const startDay = getDay(monthStart);
  const blanks = Array(startDay).fill(null);

  const getOrdersForDay = (date: Date) => {
    return orders.filter(o => {
      const targetDate = parseIndoDate(o.tanggalTargetSelesai);
      return targetDate && isSameDay(targetDate, date) && o.status !== JobStatus.BERES;
    });
  };

  const getDayStatusColor = (date: Date, dayOrders: OrderItem[]) => {
    if (dayOrders.length === 0) return '';

    const isLate = dayOrders.some(o => {
      const targetDate = parseIndoDate(o.tanggalTargetSelesai);
      return targetDate && isBefore(targetDate, today);
    });

    if (isLate) return 'bg-red-500 shadow-lg shadow-red-500/40 text-white';

    const daysLeft = differenceInDays(date, today);
    if (daysLeft <= 1) return 'bg-orange-500 shadow-lg shadow-orange-500/40 text-white';
    if (daysLeft <= 3) return 'bg-amber-400 shadow-lg shadow-amber-400/40 text-white';
    return 'bg-emerald-500 shadow-lg shadow-emerald-500/40 text-white';
  };

  return (
    <div className={`w-full max-w-sm p-6 rounded-[2.5rem] border shadow-2xl relative overflow-hidden transition-all duration-500 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-50'}`} style={{ transformStyle: 'preserve-3d', perspective: '1000px' }}>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl ${isDarkMode ? 'bg-slate-900' : 'bg-emerald-50'}`}>
            <Calendar className="text-emerald-500" size={20} />
          </div>
          <h4 className={`text-sm font-black uppercase tracking-widest ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
            {format(today, 'MMMM yyyy', { locale: idLocale })}
          </h4>
        </div>
        <div className="flex gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
          <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
          <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-2">
        {['S', 'S', 'R', 'K', 'J', 'S', 'M'].map((d, i) => (
          <div key={i} className="text-[8px] font-black text-slate-400 text-center uppercase tracking-tighter">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {blanks.map((_, i) => <div key={`blank-${i}`} />)}
        {days.map((day, i) => {
          const dayOrders = getOrdersForDay(day);
          const colorClass = getDayStatusColor(day, dayOrders);
          const isToday = isSameDay(day, today);

          return (
            <div
              key={i}
              className={`relative flex flex-col items-center justify-center p-1.5 rounded-xl transition-all duration-300 group ${colorClass ? 'scale-105 z-10' : isDarkMode ? 'bg-slate-900/50 hover:bg-slate-900' : 'bg-slate-50 hover:bg-slate-100'} ${isToday ? 'border-2 border-emerald-500/50 ring-2 ring-emerald-500/10' : ''}`}
              style={{ transform: colorClass ? 'translateZ(10px)' : 'none' }}
            >
              <span className={`text-[10px] font-black ${colorClass ? 'text-white' : isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                {format(day, 'd')}
              </span>

              {dayOrders.length > 0 && (
                <div className="mt-1 flex flex-col items-center">
                  <span className={`text-[6px] font-black leading-none ${colorClass ? 'text-white/80' : 'text-emerald-500'}`}>
                    {dayOrders[0].kodeBarang.slice(-4)}
                  </span>
                  {dayOrders.length > 1 && (
                    <div className="w-1 h-1 rounded-full bg-white/50 mt-0.5" />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-4 border-t border-slate-100/10 flex justify-between items-center">
        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">
          {orders.filter(o => o.status !== JobStatus.BERES).length} Pekerjaan Berjalan
        </p>
        <div className="flex gap-3">
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-sm shadow-red-500/50" />
            <span className="text-[7px] font-black text-slate-400 uppercase">Telat</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-orange-500 shadow-sm shadow-orange-500/50" />
            <span className="text-[7px] font-black text-slate-400 uppercase">Red</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const Dashboard: React.FC<DashboardProps> = ({ orders, searchQuery, setSearchQuery, isDarkMode, onViewHistory, toggleDarkMode, onScanClick, onUpdateStatus, onUpdateOrder }) => {
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [globalResults, setGlobalResults] = useState<OrderItem[]>([]);
  const [isSearchingGlobal, setIsSearchingGlobal] = useState(false);
  const [showFullUserResults, setShowFullUserResults] = useState(false);
  const [fullUserResults, setFullUserResults] = useState<OrderItem[]>([]);
  const [searchedUserName, setSearchedUserName] = useState('');

  const activeOnly = useMemo(() => orders.filter(o => !o.deletedAt), [orders]);

  const profileName = useMemo(() => localStorage.getItem('profileName') || 'Nama Anda', []);

  useEffect(() => {
    const searchGlobal = async () => {
      if (localSearch.length >= 2) {
        setIsSearchingGlobal(true);
        const results = await syncService.searchGlobalOrders(localSearch);
        // Filter out orders that are already in the local 'orders' list to avoid duplicates
        const filteredGlobal = results.filter(go => !orders.some(lo => lo.id === go.id));
        setGlobalResults(filteredGlobal);
        setIsSearchingGlobal(false);
      } else {
        setGlobalResults([]);
      }
    };

    const timer = setTimeout(searchGlobal, 500);
    return () => clearTimeout(timer);
  }, [localSearch, orders]);

  const selectedOrder = useMemo(() => {
    if (!selectedOrderId) return null;
    const local = orders.find(o => o.id === selectedOrderId);
    if (local) return local;
    return globalResults.find(o => o.id === selectedOrderId) || null;
  }, [selectedOrderId, orders, globalResults]);

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

  const isOwner = useMemo(() => {
    if (!selectedOrder) return false;
    return selectedOrder.namaPenjahit.toLowerCase().trim() === profileName.toLowerCase().trim();
  }, [selectedOrder, profileName]);

  const handleToggleStatus = () => {
    if (!selectedOrder || !onUpdateStatus) return;
    if (!isOwner) {
      alert(`Hanya ${selectedOrder.namaPenjahit} yang bisa merubah status order ini.`);
      return;
    }
    const nextStatus = selectedOrder.status === JobStatus.BERES ? JobStatus.PROSES : JobStatus.BERES;
    onUpdateStatus(selectedOrder.id, nextStatus);
  };

  const handleToggleEmbroidery = () => {
    if (!selectedOrder || !onUpdateOrder) return;
    if (!isOwner) {
      alert(`Hanya ${selectedOrder.namaPenjahit} yang bisa merubah rincian order ini.`);
      return;
    }
    const nextStatus = selectedOrder.embroideryStatus === 'Kurang' ? 'Lengkap' : 'Kurang';
    onUpdateOrder({ ...selectedOrder, embroideryStatus: nextStatus as 'Lengkap' | 'Kurang' });
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
                  className={`px-8 py-2.5 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl transition-all active:scale-95 flex items-center gap-2 border-2 ${!isOwner ? 'opacity-70 grayscale' : ''} ${selectedOrder.status === JobStatus.BERES ? 'bg-emerald-500 border-emerald-400 shadow-emerald-500/20' : 'bg-[#ef4444] border-red-400 shadow-red-500/20'} text-white`}
                >
                  {!isOwner && <Lock size={10} />}
                  <div className={`w-2 h-2 rounded-full bg-white ${selectedOrder.status === JobStatus.PROSES ? 'animate-pulse' : ''}`} />
                  {selectedOrder.status === JobStatus.BERES ? 'Pekerjaan Selesai' : 'Sedang Diproses'}
                </button>

                {!isOwner && (
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full">
                    <Shield size={10} className="text-amber-500" />
                    <span className="text-[8px] font-black text-amber-500 uppercase tracking-wider">Hanya Bisa Dilihat (Milik {selectedOrder.namaPenjahit})</span>
                  </div>
                )}
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
                  icon={<ShieldCheck size={20} className="text-[#10b981]" />}
                  label="Nama CS (Admin)"
                  value={selectedOrder.cs || '-'}
                  isDarkMode={isDarkMode}
                />
                <DetailRow
                  icon={<UserCheck size={20} className="text-pink-500" />}
                  label="Nama Konsumen"
                  value={selectedOrder.konsumen || '-'}
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
                  className={`${selectedOrder.embroideryStatus === 'Kurang' ? 'border-red-200 bg-red-50/10' : ''} ${!isOwner ? 'cursor-not-allowed opacity-80' : ''}`}
                />

                <DetailRow
                  icon={<Info size={20} className="text-[#64748b]" />}
                  label="Keterangan"
                  value={selectedOrder.deskripsiPekerjaan || 'Tidak ada catatan khusus.'}
                  isDarkMode={isDarkMode}
                  isLongText
                />

                <div className={`mt-4 rounded-3xl p-5 border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-[#f8fafc] border-slate-100'}`}>
                  <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Rincian Size & Jumlah</h5>
                  <table className="w-full text-[10px]">
                    <thead>
                      <tr className="text-slate-400 opacity-60">
                        <th className="text-left pb-3 font-black uppercase tracking-wider w-1/4">Size</th>
                        <th className="text-center pb-3 font-black uppercase tracking-wider w-1/4">Qty</th>
                        <th className="text-center pb-3 font-black uppercase tracking-wider w-1/4">Gender</th>
                        <th className="text-right pb-3 font-black uppercase tracking-wider w-1/4">Lengan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100/10">
                      {selectedOrder.sizeDetails.map((sd, i) => (
                        <tr key={i} className={isDarkMode ? 'text-slate-300' : 'text-slate-600'}>
                          <td className="py-3 font-black uppercase">{sd.size}</td>
                          <td className="py-3 text-center font-black text-[#10b981] text-[11px]">{sd.jumlah}</td>
                          <td className="py-3 text-center font-bold px-1">{sd.gender}</td>
                          <td className="py-3 text-right font-medium opacity-80">{sd.tangan}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="mt-4 pt-4 border-t border-slate-200/10 flex justify-between items-center">
                    <span className="text-[10px] font-black text-slate-400 uppercase">Total Pesanan</span>
                    <span className="text-sm font-black text-[#10b981]">{selectedOrder.jumlahPesanan} PCS</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-4">
                <button
                  onClick={() => {
                    const text = `✨ *Rincian Kerja: ${selectedOrder.kodeBarang}* ✨\n` +
                      `Model: ${selectedOrder.model}\n` +
                      `Penjahit: ${selectedOrder.namaPenjahit}\n` +
                      `Total: ${selectedOrder.jumlahPesanan} PCS`;
                    const phoneNumber = "6283194190156";
                    window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(text)}`, '_blank');
                  }}
                  className="py-4 bg-emerald-500 text-white rounded-[2rem] font-black uppercase tracking-widest text-[10px] shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <Send size={16} /> WhatsApp
                </button>
                <button
                  onClick={() => { setSelectedOrderId(null); onViewHistory(); }}
                  className={`py-4 rounded-[2rem] font-black uppercase tracking-widest text-[10px] transition-all active:scale-95 border ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-600'}`}
                >
                  Riwayat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showFullUserResults && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in zoom-in duration-300">
          <div className={`relative w-full max-w-sm rounded-[3rem] p-8 shadow-2xl flex flex-col max-h-[85vh] ${isDarkMode ? 'bg-slate-900 text-white border border-slate-800' : 'bg-white text-slate-800'}`}>
            <button
              onClick={() => setShowFullUserResults(false)}
              className="absolute top-6 right-6 p-2 text-slate-400 hover:text-red-500"
            >
              <X size={24} />
            </button>

            <div className="mb-6 pr-8">
              <h3 className="text-xl font-black uppercase tracking-tight">Rincian Kerja</h3>
              <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mt-1">
                {searchedUserName} <span className="text-slate-400 opacity-50">•</span> {fullUserResults.length} Item
              </p>
            </div>

            <div className="flex flex-col gap-3 overflow-y-auto pr-2 no-scrollbar">
              {fullUserResults.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Tidak ada data</p>
                </div>
              ) : fullUserResults.map((order, idx) => (
                <button
                  key={order.id}
                  onClick={() => {
                    setSelectedOrderId(order.id);
                    setShowFullUserResults(false);
                  }}
                  className={`flex flex-col gap-2 p-5 rounded-[2.5rem] border shadow-sm transition-all active:scale-[0.98] animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'}`}
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <div className="flex justify-between items-center w-full">
                    <div className="flex items-center gap-2">
                      <span className={`text-[11px] font-black px-4 py-1.5 rounded-full border shadow-sm ${isDarkMode ? 'bg-slate-900 border-slate-700 text-emerald-400' : 'bg-white border-emerald-100 text-emerald-600'}`}>
                        {order.kodeBarang}
                      </span>
                      <span className={`text-[7px] font-black px-2 py-0.5 rounded-md uppercase tracking-tighter ${order.status === JobStatus.BERES ? 'bg-emerald-500/10 text-emerald-500' : 'bg-orange-500/10 text-orange-500'}`}>
                        {order.status}
                      </span>
                    </div>
                    <ChevronRight size={14} className="text-slate-300" />
                  </div>
                  <div className="flex flex-col items-start gap-0.5">
                    <p className={`text-[10px] font-black uppercase ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>{order.model} • {order.warna}</p>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={10} className="text-slate-400" />
                        <span className="text-[8px] font-bold text-slate-400 uppercase">{order.tanggalTargetSelesai || '-'}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Package size={10} className="text-slate-400" />
                        <span className="text-[8px] font-bold text-slate-400 uppercase">{order.jumlahPesanan} PCS</span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className={`sticky top-0 z-30 px-6 py-4 flex justify-between items-center backdrop-blur-md border-b transition-colors ${isDarkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-50/80 border-slate-200'}`}>
        <div className="flex items-center gap-3">
          <div className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 ${isDarkMode ? 'border-slate-700 bg-slate-800 shadow-[0_0_10px_rgba(57,255,20,0.2)]' : 'border-slate-100 bg-white shadow-sm'}`}>
            {/* Neon Icon Style Header */}
            <div className="w-6 h-6 bg-black rounded flex items-center justify-center p-0.5 border border-[#39FF14]/50">
              <span className="text-[6px] font-black leading-none text-center" style={{ color: '#39FF14', textShadow: '0 0 2px #39FF14' }}>BRAD<br />WEAR</span>
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
        {/* Quick Menu Grid removed as requested */}

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

        <Calendar3D orders={orders} isDarkMode={isDarkMode} />

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
              {(filteredResults.length === 0 && globalResults.length === 0) ? (
                <div className="p-4 text-center">
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                    {isSearchingGlobal ? 'Mencari Antar Perangkat...' : 'Tidak ditemukan'}
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-1">
                  {/* Local Results */}
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
                        <div className="flex items-center gap-2">
                          <p className="text-[9px] font-bold text-slate-400 uppercase truncate">PJ: {order.namaPenjahit}</p>
                          <span className={`text-white text-[6px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-tighter ${order.status === JobStatus.BERES ? 'bg-emerald-500' : 'bg-orange-500 animate-pulse'}`}>
                            {order.status}
                          </span>
                        </div>
                      </div>
                      <ChevronRight size={14} className="text-slate-300" />
                    </button>
                  ))}

                  {/* Global Results */}
                  {globalResults.map(order => (
                    <button
                      key={order.id}
                      onClick={() => {
                        // Viewing global order
                        // If it's not in local orders, we might need to add it temporarily or handle viewing it
                        // For now, let's assume it handles IDs universally if we sync it.
                        // I'll update the selectedOrder logic in Dashboard to look in syncService if not found.
                        setSelectedOrderId(order.id);
                        setShowSearchResults(false);
                      }}
                      className={`flex items-center gap-3 p-3 rounded-2xl text-left transition-all active:scale-[0.98] border border-dashed ${isDarkMode ? 'border-slate-700 hover:bg-slate-900' : 'border-blue-100 bg-blue-50/20 hover:bg-blue-50'}`}
                    >
                      <div className={`p-2 rounded-xl ${isDarkMode ? 'bg-slate-900' : 'bg-blue-50'} text-blue-500`}>
                        <PlusCircle size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-black uppercase truncate ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{order.kodeBarang}</p>
                        <div className="flex items-center gap-2">
                          <p className="text-[9px] font-bold text-slate-400 uppercase truncate">PJ: {order.namaPenjahit}</p>
                          <span className={`text-white text-[6px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-tighter ${order.status === JobStatus.BERES ? 'bg-emerald-500' : 'bg-orange-500'}`}>
                            {order.status}
                          </span>
                          <span className={`text-white text-[6px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-tighter ${order.namaPenjahit.toLowerCase().trim() === profileName.toLowerCase().trim() ? 'bg-emerald-500' : 'bg-amber-500'}`}>
                            {order.namaPenjahit.toLowerCase().trim() === profileName.toLowerCase().trim() ? 'Milik Anda' : 'Public'}
                          </span>
                        </div>
                      </div>
                      <ChevronRight size={14} className="text-slate-300" />
                    </button>
                  ))}

                  <div className="h-[1px] bg-slate-100/10 mx-2 my-1" />
                  <button
                    onClick={() => {
                      // Jika pencarian mengandung nama user, tampilkan popup rincian user
                      const lowerSearch = localSearch.toLowerCase();
                      const allRelated = [...orders, ...globalResults].filter(o =>
                        o.namaPenjahit.toLowerCase().includes(lowerSearch) ||
                        o.kodeBarang.toLowerCase().includes(lowerSearch)
                      );

                      // Cari nama user yang paling pas dari hasil
                      const userMatch = allRelated.find(o => o.namaPenjahit.toLowerCase().includes(lowerSearch));

                      if (userMatch) {
                        setFullUserResults(allRelated);
                        setSearchedUserName(userMatch.namaPenjahit);
                        setShowFullUserResults(true);
                      } else {
                        // Fallback ke history jika tidak ada user match yang jelas
                        setSearchQuery(localSearch);
                        onViewHistory();
                      }
                      setShowSearchResults(false);
                    }}
                    className="w-full py-3 text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] text-center hover:bg-emerald-500/5 transition-colors"
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

export default Dashboard;

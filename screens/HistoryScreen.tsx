
import React, { useState, useMemo } from 'react';
import { Search, Trash2, CheckCircle, Send, FileText, Info, Calendar, User, UserCheck, X, Package, ShieldCheck, Clock, Filter, CalendarDays, CalendarRange, ArrowUpDown, ListFilter } from 'lucide-react';
import { OrderItem, JobStatus, Priority } from '../types';
// Fixed: Removed parseISO from date-fns imports as it's not exported or redundant for ISO strings
import { differenceInDays, format, isSameWeek, isSameMonth, isSameYear } from 'date-fns';
import { id as idLocale } from 'date-fns/locale/id';

interface HistoryScreenProps {
  orders: OrderItem[];
  onDelete: (id: string) => void;
  onUpdateStatus: (id: string, status: JobStatus) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  isDarkMode: boolean;
}

type FilterMode = 'SEMUA' | 'MINGGUAN' | 'BULANAN' | 'TAHUNAN';

const isValidDate = (date: any): date is Date => {
  return date instanceof Date && !isNaN(date.getTime());
};

const HistoryScreen: React.FC<HistoryScreenProps> = ({ orders, onDelete, onUpdateStatus, searchQuery, setSearchQuery, isDarkMode }) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [filterMode, setFilterMode] = useState<FilterMode>('SEMUA');
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<OrderItem | null>(null);

  const processedOrders = useMemo(() => {
    const now = new Date();

    let filtered = orders.filter(o => {
      const matchSearch =
        o.kodeBarang.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.namaPenjahit.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.konsumen?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.sizeDetails.some(s => s.size.toLowerCase().includes(searchQuery.toLowerCase()) || s.namaPerSize?.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchSearch) return false;

      // Fixed: Using new Date() instead of parseISO which was causing a compilation error
      const orderDate = new Date(o.createdAt);
      if (!isValidDate(orderDate)) return true;

      switch (filterMode) {
        case 'MINGGUAN':
          return isSameWeek(orderDate, now, { weekStartsOn: 1 });
        case 'BULANAN':
          return isSameMonth(orderDate, now);
        case 'TAHUNAN':
          return isSameYear(orderDate, now);
        case 'SEMUA':
        default:
          return true;
      }
    });

    // Default sorting by newest
    return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [orders, searchQuery, filterMode]);

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleShareWhatsApp = () => {
    const selected = orders.filter(o => selectedIds.has(o.id));
    if (selected.length === 0) return;

    let text = "✨ *RINGKASAN KERJA BRADWEAR FLOW* ✨\n";
    text += "━━━━━━━━━━━━━━━━━━━━\n\n";

    selected.forEach(o => {
      let totalPanjang = 0;
      let totalPendek = 0;

      o.sizeDetails.forEach(sd => {
        if (sd.tangan === 'Panjang') totalPanjang += sd.jumlah;
        else if (sd.tangan === 'Pendek') totalPendek += sd.jumlah;
      });

      text += `💠 *KODE:* ${o.kodeBarang}\n`;
      text += `👩‍💼 *NAMA CS:* ${o.cs || '-'}\n`;
      text += `👤 *KONSUMEN:* ${o.konsumen || '-'}\n`;
      text += `👕 *MODEL:* ${o.model}${o.modelDetail ? ` (${o.modelDetail})` : ''}\n`;
      text += `🎨 *WARNA:* ${o.warna || '-'}\n`;
      text += `\n✨ *RINCIAN ITEM:* ✨\n`;
      text += `────────────────────\n`;

      o.sizeDetails.forEach(sd => {
        const type = sd.tangan === 'Panjang' ? 'Lengan Panjang' : 'Lengan Pendek';
        const icon = sd.tangan === 'Panjang' ? '🌀' : '💠';
        // Padding for a more table-like feel
        text += `${icon} *${sd.size}* | ${type} | *${sd.jumlah} PCS*\n`;
      });
      text += `────────────────────\n`;

      let summarySuffix = "";
      const parts = [];
      if (totalPanjang > 0) parts.push(`${totalPanjang} Panjang`);
      if (totalPendek > 0) parts.push(`${totalPendek} Pendek`);
      if (parts.length > 0) summarySuffix = ` (${parts.join(' & ')})`;

      text += `📊 *TOTAL:* *${o.jumlahPesanan} PCS*${summarySuffix}\n`;
      text += "━━━━━━━━━━━━━━━━━━━━\n\n";
    });

    text += "🙏 _Berikut rincian yang saya kirimkan mohon untuk di cek kembali barangkali ada salah input data terimakasih._";

    const phoneNumber = "6283194190156";
    window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(text)}`, '_blank');
  };

  const getUrgencyStyles = (days: number) => {
    if (days < 0) return 'bg-slate-900 text-white border-slate-800 shadow-lg';
    if (days <= 2) return 'bg-red-500 text-white border-red-400 shadow-[0_10px_20px_rgba(239,68,68,0.2)]';
    if (days <= 5) return 'bg-amber-500 text-white border-amber-400 shadow-md';
    return isDarkMode ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-slate-50 text-slate-400 border-slate-100';
  };

  const formatDateIndo = (dateStr: string | null | undefined) => {
    if (!dateStr) return '-';
    try {
      let d: Date;
      if (dateStr.includes('-')) {
        const parts = dateStr.split('-');
        d = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
      } else {
        d = new Date(dateStr);
      }
      return isValidDate(d) ? format(d, 'EEEE, d MMMM yyyy', { locale: idLocale }) : dateStr;
    } catch { return dateStr; }
  };

  const cycleFilter = () => {
    const modes: FilterMode[] = ['SEMUA', 'MINGGUAN', 'BULANAN', 'TAHUNAN'];
    const currentIdx = modes.indexOf(filterMode);
    setFilterMode(modes[(currentIdx + 1) % modes.length]);
  };

  const getFilterIcon = () => {
    switch (filterMode) {
      case 'MINGGUAN': return <CalendarDays size={14} />;
      case 'BULANAN': return <CalendarRange size={14} />;
      case 'TAHUNAN': return <Calendar size={14} />;
      default: return <ArrowUpDown size={14} />;
    }
  };

  return (
    <div className={`p-6 min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-slate-900' : 'bg-[#f4f7f9]'}`}>
      <div className="flex justify-between items-center mb-6">
        <h2 className={`text-2xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>History Kerja</h2>
        {selectedIds.size > 0 && (
          <div className="flex gap-2 animate-in slide-in-from-right">
            <button onClick={handleShareWhatsApp} className="p-3 bg-emerald-500 text-white rounded-2xl shadow-xl shadow-emerald-500/20 active:scale-90"><Send size={18} /></button>
            <button className="p-3 bg-slate-800 text-white rounded-2xl shadow-xl active:scale-90"><FileText size={18} /></button>
          </div>
        )}
      </div>

      {selectedOrderDetails && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in zoom-in duration-300">
          <div className={`relative w-full max-w-sm rounded-[3rem] p-8 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden ${isDarkMode ? 'bg-slate-900 text-white' : 'bg-white text-slate-800'}`}>
            <button onClick={() => setSelectedOrderDetails(null)} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-red-500"><X size={24} /></button>

            <div className="flex flex-col gap-6 overflow-y-auto pr-2 no-scrollbar mt-4">
              <div className="text-center">
                <h3 className="text-2xl font-black">{selectedOrderDetails.kodeBarang}</h3>
                <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">{selectedOrderDetails.model}</p>
              </div>

              <div className="space-y-4">
                <InfoBox label="Penjahit" value={selectedOrderDetails.namaPenjahit} icon={<User size={16} className="text-blue-500" />} isDarkMode={isDarkMode} />
                <InfoBox label="Konsumen" value={selectedOrderDetails.konsumen} icon={<UserCheck size={16} className="text-emerald-500" />} isDarkMode={isDarkMode} />
                <InfoBox label="Admin (CS)" value={selectedOrderDetails.cs} icon={<ShieldCheck size={16} className="text-orange-500" />} isDarkMode={isDarkMode} />
                <InfoBox label="Target Selesai" value={selectedOrderDetails.tanggalTargetSelesai} icon={<Calendar size={16} className="text-red-500" />} isDarkMode={isDarkMode} />

                <div className={`p-5 rounded-3xl border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                  <h5 className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-3">Rincian Bordir</h5>
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${selectedOrderDetails.embroideryStatus === 'Lengkap' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                      {selectedOrderDetails.embroideryStatus || 'Lengkap'}
                    </span>
                  </div>
                  {selectedOrderDetails.embroideryNotes && (
                    <p className="text-[10px] font-bold text-slate-500 italic">"{selectedOrderDetails.embroideryNotes}"</p>
                  )}
                </div>

                <div className={`p-5 rounded-3xl border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                  <h5 className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2">Catatan Kerja</h5>
                  <p className="text-[10px] font-medium leading-relaxed">{selectedOrderDetails.deskripsiPekerjaan || '-'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SEARCH BOX & SORT/FILTER BUTTON SYNCED WITH DASHBOARD */}
      <div className="flex gap-2 mb-8 animate-in fade-in duration-500">
        <div className="flex-1 relative group">
          <Search className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${searchQuery ? 'text-[#10b981]' : 'text-slate-400'}`} size={18} />
          <input
            type="text"
            placeholder="Cari Kode Barang / Penjahit..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full border rounded-[1.5rem] py-4 pl-11 pr-10 focus:outline-none focus:ring-4 transition-all shadow-sm ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white focus:ring-emerald-500/10' : 'bg-white border-slate-100 text-slate-800 focus:ring-emerald-500/5'}`}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 p-1"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Sort/Filter Button matching the screenshot style (pill shape) */}
        <button
          onClick={cycleFilter}
          className={`flex items-center gap-2 px-5 rounded-[1.5rem] shadow-sm border transition-all active:scale-95 ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-[#e2e8f0] border-slate-200 text-slate-700'}`}
        >
          {getFilterIcon()}
          <span className="text-[10px] font-black uppercase tracking-wider">
            {filterMode === 'SEMUA' ? 'NEWEST' : filterMode}
          </span>
        </button>
      </div>

      <div className="space-y-6">
        {processedOrders.length === 0 ? (
          <div className="py-24 text-center opacity-30 flex flex-col items-center gap-4">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-2">
              <Search size={40} className="text-slate-300" />
            </div>
            <p className="font-black text-xs uppercase tracking-widest text-slate-500">Data tidak ditemukan</p>
            {filterMode !== 'SEMUA' && (
              <button
                onClick={() => setFilterMode('SEMUA')}
                className="mt-2 px-6 py-2 bg-[#10b981] text-white rounded-full text-[9px] font-black uppercase tracking-[0.2em] shadow-lg shadow-emerald-500/20"
              >
                Reset Filter
              </button>
            )}
          </div>
        ) : processedOrders.map(order => {
          const isSelected = selectedIds.has(order.id);

          let daysLeft = 0;
          try {
            const targetDate = order.tanggalTargetSelesai.includes('-')
              ? new Date(order.tanggalTargetSelesai.split('-').reverse().join('-'))
              : new Date(order.tanggalTargetSelesai);
            if (isValidDate(targetDate)) {
              daysLeft = differenceInDays(targetDate, new Date());
            }
          } catch { daysLeft = 999; }

          return (
            <div
              key={order.id}
              className={`relative p-6 rounded-[2.5rem] border transition-all ${isSelected ? 'border-emerald-500 ring-8 ring-emerald-500/5 shadow-2xl scale-[1.01]' : isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-100 shadow-sm'}`}
            >
              <button
                onClick={() => toggleSelect(order.id)}
                className={`absolute top-6 left-6 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all z-10 ${isSelected ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg' : isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200'}`}
              >
                {isSelected && <CheckCircle size={12} strokeWidth={4} />}
              </button>

              <div className="flex flex-col gap-5">
                <div className="flex justify-between items-center pl-8">
                  <span className={`text-[10px] font-black px-4 py-1.5 rounded-full border shadow-sm ${isDarkMode ? 'bg-slate-700 border-slate-600 text-emerald-400' : 'bg-[#e6f7ef] border-emerald-100 text-emerald-600'}`}>
                    {order.kodeBarang}
                  </span>
                  <div className="flex flex-col items-end gap-0.5 text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={12} className="opacity-60" />
                      <span className="text-[9px] font-black uppercase tracking-tight">{formatDateIndo(order.tanggalTargetSelesai)}</span>
                    </div>
                    {order.status === JobStatus.BERES && order.completedAt && (
                      <div className="flex items-center gap-1.5 text-emerald-500">
                        <CheckCircle size={10} className="opacity-80" />
                        <span className="text-[8px] font-black uppercase tracking-tight italic">Selesai: {format(new Date(order.completedAt), 'd MMM yyyy HH:mm', { locale: idLocale })}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pl-8">
                  <span className={`text-[8px] font-black px-3 py-1 rounded-lg uppercase tracking-widest border inline-block ${getUrgencyStyles(daysLeft)}`}>
                    {daysLeft < 0 ? 'OVERDUE' : daysLeft === 0 ? 'HARI INI' : `${daysLeft} HARI LAGI`}
                  </span>
                </div>

                <div className="pl-8 space-y-3">
                  <h4 className={`text-sm font-black transition-colors uppercase tracking-tight leading-relaxed ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                    {order.model} • {order.warna}
                  </h4>

                  <div className="grid grid-cols-1 gap-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">PJ:</span>
                      <span className="text-[9px] font-black text-emerald-500 uppercase">{order.namaPenjahit}</span>
                    </div>
                  </div>
                </div>

                <div className={`rounded-3xl p-5 border ${isDarkMode ? 'bg-slate-900/50 border-slate-700' : 'bg-[#f8fafc] border-slate-100'}`}>
                  <table className="w-full text-[9px]">
                    <thead>
                      <tr className="text-slate-400">
                        <th className="text-left pb-3 font-black uppercase tracking-[0.2em] opacity-80 w-1/4">Detail</th>
                        <th className="text-center pb-3 font-black uppercase tracking-[0.2em] opacity-80 w-1/4">Qty</th>
                        <th className="text-center pb-3 font-black uppercase tracking-[0.2em] opacity-80 w-1/4">Gender</th>
                        <th className="text-right pb-3 font-black uppercase tracking-[0.2em] opacity-80 w-1/4">Lengan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100/10">
                      {order.sizeDetails.map((sd, i) => (
                        <tr key={i} className={isDarkMode ? 'text-slate-400' : 'text-slate-600'}>
                          <td className="py-2.5 font-black uppercase break-words pr-2">{sd.size}</td>
                          <td className="py-2.5 text-center font-black text-[#10b981] text-[11px]">{sd.jumlah}</td>
                          <td className="py-2.5 text-center font-bold">{sd.gender}</td>
                          <td className="py-2.5 text-right font-medium opacity-80">{sd.tangan}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-between items-center pl-4 pr-2">
                  <button
                    onClick={() => {
                      onUpdateStatus(order.id, order.status === JobStatus.BERES ? JobStatus.PROSES : JobStatus.BERES);
                    }}
                    className={`text-[9px] font-black px-5 py-2.5 rounded-2xl transition-all shadow-sm uppercase tracking-[0.15em] flex items-center gap-2 ${order.status === JobStatus.BERES ? 'bg-emerald-500 text-white' : isDarkMode ? 'bg-slate-700 text-slate-300' : 'bg-white text-slate-500 border border-slate-100'}`}
                  >
                    <div className={`w-1.5 h-1.5 rounded-full ${order.status === JobStatus.BERES ? 'bg-white animate-pulse' : 'bg-orange-400'}`} />
                    {order.status}
                  </button>
                  <div className="flex gap-2">
                    <button onClick={() => setSelectedOrderDetails(order)} className="p-2.5 text-slate-400 hover:text-blue-500 transition-colors"><Info size={18} /></button>
                    <button onClick={() => onDelete(order.id)} className="p-2.5 text-slate-400 hover:text-red-500 transition-colors">
                      <Trash2 size={18} strokeWidth={2.5} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const InfoBox = ({ label, value, icon, isDarkMode }: any) => (
  <div className={`flex items-center gap-4 p-4 rounded-2xl border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
    <div className="p-2 bg-slate-50 rounded-xl">{icon}</div>
    <div className="flex flex-col">
      <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
      <span className="text-[11px] font-bold uppercase">{value || '-'}</span>
    </div>
  </div>
);

export default HistoryScreen;

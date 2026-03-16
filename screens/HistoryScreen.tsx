
import React, { useState, useMemo } from 'react';
import { Search, Trash2, CheckCircle, Send, FileText, Info, Calendar, User, UserCheck, X, Package, ShieldCheck, Clock, Filter, CalendarDays, ArrowUpDown, ListFilter, CloudUpload, Globe, Edit3, CreditCard, Wallet, AlertCircle, Lock, DollarSign, Sparkles, Layers, RotateCcw, AlertTriangle, ChevronDown } from 'lucide-react';
import { PRICE_LIST as DEFAULT_PRICE_LIST, OrderItem, JobStatus, Priority, PaymentStatus } from '../types';
import { syncService } from '../services/syncService';
import { differenceInDays, format, isSameWeek, isSameMonth, isSameYear, startOfWeek } from 'date-fns';
import { id as idLocale } from 'date-fns/locale/id';

interface HistoryScreenProps {
  orders: OrderItem[];
  onDelete: (id: string, searchResults?: OrderItem[]) => void;
  onBulkDelete?: (ids: string[], permanent: boolean) => void;
  onUpdateStatus: (id: string, status: JobStatus) => void;
  onBulkUpdateStatus?: (ids: string[], status: JobStatus, paymentStatus?: PaymentStatus) => void;
  onUpdatePayment?: (id: string, status: PaymentStatus) => void;
  onEdit: (order: OrderItem) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  isDarkMode: boolean;
  targetId?: string | null;
  clearTargetId?: () => void;
  triggerConfirm: (config: any) => void;
}

type FilterMode = 'TERDEKAT' | 'SUDAH DIBAYAR' | 'BELUM DIBAYAR' | 'SEMUA';

const isValidDate = (date: any): date is Date => {
  return date instanceof Date && !isNaN(date.getTime());
};

const HistoryScreen: React.FC<HistoryScreenProps> = ({ orders, onDelete, onBulkDelete, onUpdateStatus, onBulkUpdateStatus, onUpdatePayment, onEdit, searchQuery, setSearchQuery, isDarkMode, targetId, clearTargetId, triggerConfirm }) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [expandedDetails, setExpandedDetails] = useState<Set<string>>(new Set());
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const [filterMode, setFilterMode] = useState<FilterMode>('SEMUA');
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<OrderItem | null>(null);
  const [selectedEarningOrder, setSelectedEarningOrder] = useState<OrderItem | null>(null);
  const itemsRef = React.useRef<Record<string, HTMLDivElement | null>>({});

  React.useEffect(() => {
    if (targetId) {
      setTimeout(() => {
        const el = itemsRef.current[targetId];
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.classList.add('ring-4', 'ring-emerald-500', 'ring-opacity-50');
          setTimeout(() => {
            el.classList.remove('ring-4', 'ring-emerald-500', 'ring-opacity-50');
            if (clearTargetId) clearTargetId();
          }, 2000);
        }
      }, 300);
    }
  }, [targetId]);

  const processedOrders = useMemo(() => {
    const now = new Date();
    let filtered = orders.filter(o => {
      const matchSearch =
        o.kodeBarang.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.namaPenjahit.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.konsumen?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.sizeDetails.some(s => s.size.toLowerCase().includes(searchQuery.toLowerCase()) || s.namaPerSize?.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchSearch) return false;

      const orderStatusMatch = true; // Placeholder for other filters if needed

      const targetDateStr = o.tanggalTargetSelesai;
      let daysLeft = 999;
      try {
        if (targetDateStr) {
          const targetDate = targetDateStr.includes('-')
            ? new Date(targetDateStr.split('-').reverse().join('-'))
            : new Date(targetDateStr);
          if (isValidDate(targetDate)) {
            daysLeft = differenceInDays(targetDate, now);
          }
        }
      } catch (e) { }

      switch (filterMode) {
        case 'TERDEKAT': return daysLeft >= 0 && daysLeft <= 7;
        case 'SUDAH DIBAYAR': return o.paymentStatus === PaymentStatus.BAYAR;
        case 'BELUM DIBAYAR': return o.paymentStatus === PaymentStatus.BELUM || !o.paymentStatus;
        default: return true;
      }
    });

    if (filterMode === 'TERDEKAT') {
      return filtered.sort((a, b) => {
        const da = differenceInDays(new Date(a.tanggalTargetSelesai), now);
        const db = differenceInDays(new Date(b.tanggalTargetSelesai), now);
        return da - db;
      });
    }
    return filtered;
  }, [orders, searchQuery, filterMode]);

  const { activeItems, completedPaidItems, completedUnpaidItems, groupedPaidItems, groupedUnpaidItems } = useMemo(() => {
    const active = processedOrders.filter(o => o.status !== JobStatus.BERES);
    const completed = processedOrders.filter(o => o.status === JobStatus.BERES);
    const completedPaid = completed.filter(o => o.paymentStatus === PaymentStatus.BAYAR);
    const completedUnpaid = completed.filter(o => o.paymentStatus !== PaymentStatus.BAYAR);

    // Grouping completedPaid by DATE (full date) based on completedAt
    const groupedPaid: Record<string, OrderItem[]> = {};
    completedPaid.forEach(o => {
      let dateKey = 'Tanpa Tanggal';
      if (o.completedAt) {
        try {
          const d = new Date(o.completedAt);
          dateKey = format(d, 'yyyy-MM-dd'); // Format: YYYY-MM-DD for sorting
        } catch (e) { dateKey = 'Tanpa Tanggal'; }
      }
      if (!groupedPaid[dateKey]) groupedPaid[dateKey] = [];
      groupedPaid[dateKey].push(o);
    });

    // Grouping completedUnpaid by DATE (full date) based on completedAt
    const groupedUnpaid: Record<string, OrderItem[]> = {};
    completedUnpaid.forEach(o => {
      let dateKey = 'Tanpa Tanggal';
      if (o.completedAt) {
        try {
          const d = new Date(o.completedAt);
          dateKey = format(d, 'yyyy-MM-dd'); // Format: YYYY-MM-DD for sorting
        } catch (e) { dateKey = 'Tanpa Tanggal'; }
      }
      if (!groupedUnpaid[dateKey]) groupedUnpaid[dateKey] = [];
      groupedUnpaid[dateKey].push(o);
    });

    // Sort by date descending (newest first)
    const sortedGroupedPaid = Object.entries(groupedPaid).sort((a, b) => b[0].localeCompare(a[0]));
    const sortedGroupedUnpaid = Object.entries(groupedUnpaid).sort((a, b) => b[0].localeCompare(a[0]));

    return { 
      activeItems: active, 
      completedPaidItems: completedPaid, 
      completedUnpaidItems: completedUnpaid, 
      groupedPaidItems: sortedGroupedPaid,
      groupedUnpaidItems: sortedGroupedUnpaid
    };
  }, [processedOrders]);

  // Set all groups as collapsed by default
  React.useEffect(() => {
    const allDateKeys = [
      ...groupedPaidItems.map(([date]) => `paid-${date}`),
      ...groupedUnpaidItems.map(([date]) => `unpaid-${date}`)
    ];
    setCollapsedGroups(new Set(allDateKeys));
  }, [groupedPaidItems.length, groupedUnpaidItems.length]); // Only run when number of groups changes

  const calculateOrderEarning = (order: OrderItem) => {
    const prices = JSON.parse(localStorage.getItem('bradwear_price_list') || JSON.stringify(DEFAULT_PRICE_LIST));
    const modelName = order.model.toUpperCase();
    const isCelana = modelName.includes('CELANA');
    const isRompi = modelName.includes('ROMPI');
    
    return order.sizeDetails.reduce((sum, sd) => {
      let price = 0;
      if (isRompi) price = prices['ROMPI'] || prices['DEFAULT'] || 0;
      else if (isCelana) {
        const isFormal = modelName.includes('FORMAL');
        const key = isFormal ? 'CELANA_FORMAL' : 'CELANA_PDL';
        price = prices[key] || prices['CELANA_PDL'] || prices['DEFAULT'] || 0;
      } else {
        const cat = sd.tangan === 'Panjang' ? 'KPLJ' : 'KLPD';
        price = prices[`${modelName}_${cat}`] || prices[modelName] || prices['DEFAULT'] || 0;
      }
      
      const qty = sd.sizes && sd.sizes.length > 0 ? sd.sizes.reduce((s, si) => s + (si.jumlah || 0), 0) : (sd.jumlah || 0);
      return sum + (price * qty);
    }, 0);
  };

  const toggleGroupCollapse = (dateKey: string) => {
    const next = new Set(collapsedGroups);
    if (next.has(dateKey)) {
      next.delete(dateKey);
    } else {
      next.add(dateKey);
    }
    setCollapsedGroups(next);
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelectedIds(next);
  };

  const toggleSelectAll = (itemIds: string[]) => {
    const next = new Set(selectedIds);
    const allSelected = itemIds.every(id => next.has(id));
    if (allSelected) itemIds.forEach(id => next.delete(id)); else itemIds.forEach(id => next.add(id));
    setSelectedIds(next);
  };

  const handleShareWhatsApp = () => {
    const selected = orders.filter(o => selectedIds.has(o.id));
    if (selected.length === 0) return;
    
    // PERBAIKAN: Tampilkan warning sebelum memindahkan ke history selesai
    triggerConfirm({
      title: 'Kirim ke WhatsApp?',
      message: `${selected.length} item akan dikirim ke WhatsApp dan otomatis dipindahkan ke History Selesai & Lunas. Lanjutkan?`,
      type: 'warning',
      onConfirm: () => {
        let totalQty = 0, totalPanjang = 0, totalPendek = 0;
        let text = "✨ *RINGKASAN KERJA BRADWEAR FLOW* ✨\n━━━━━━━━━━━━━━━━━━━━\n\n";
        
        selected.forEach(o => {
          let curQty = 0, curPanjang = 0, curPendek = 0;
          
          text += `✨ *RINCIAN ITEM:* ✨\n────────────────────\n`;
          
          o.sizeDetails.forEach(sd => {
            const type = sd.tangan === 'Panjang' ? 'Lengan Panjang' : 'Lengan Pendek';
            const icon = sd.tangan === 'Panjang' ? '🌀' : '💠';
            
            if (sd.sizes && sd.sizes.length > 0) {
              sd.sizes.forEach(sz => {
                text += `${icon} *${sz.size}* | ${type} | *${sz.jumlah} PCS*\n`;
                curQty += sz.jumlah;
                if (sd.tangan === 'Panjang') curPanjang += sz.jumlah; else curPendek += sz.jumlah;
              });
            } else {
              text += `${icon} *${sd.size}* | ${type} | *${sd.jumlah} PCS*\n`;
              curQty += sd.jumlah;
              if (sd.tangan === 'Panjang') curPanjang += sd.jumlah; else curPendek += sd.jumlah;
            }
          });
          
          text += `────────────────────\n`;
          text += `📊 *TOTAL:* *${curQty} PCS* (${curPanjang} Pjg & ${curPendek} Pdk)\n\n`;
          
          // Info detail per item
          text += `💎 *KODE:* ${o.kodeBarang}\n`;
          text += `👨‍💼 *CONS:* ${o.konsumen || '-'}\n`;
          text += `👕 *MODEL:* ${o.model}\n`;
          text += `🎨 *WARNA:* ${o.warna || '-'}\n`;
          text += `━━━━━━━━━━━━━━━━━━━━\n\n`;
          
          totalQty += curQty;
          totalPanjang += curPanjang;
          totalPendek += curPendek;
        });
        
        text += `📦 *TOTAL BARANG:* ${totalQty} PCS\n`;
        text += `━━━━━━━━━━━━━━━━━━━━\n\n`;
        text += `🙏 _Terimakasih._`;
        
        window.open(`https://wa.me/6283194190156?text=${encodeURIComponent(text)}`, '_blank');
        
        // Update status dan payment untuk semua item terpilih menggunakan bulk update
        const selectedIdArray = Array.from(selectedIds);
        if (onBulkUpdateStatus) {
          onBulkUpdateStatus(selectedIdArray, JobStatus.BERES, PaymentStatus.BAYAR);
        } else {
          // Fallback jika bulk update tidak tersedia
          selected.forEach(o => {
            onUpdateStatus(o.id, JobStatus.BERES);
            if (onUpdatePayment) onUpdatePayment(o.id, PaymentStatus.BAYAR);
          });
        }
        setSelectedIds(new Set());
      }
    });
  };

  const formatDateIndo = (dateStr: string | null | undefined) => {
    if (!dateStr) return '-';
    try {
      let d = dateStr.includes('-') ? new Date(dateStr.split('-').reverse().join('-')) : new Date(dateStr);
      return isValidDate(d) ? format(d, 'EEEE, d MMMM yyyy', { locale: idLocale }) : dateStr;
    } catch { return dateStr; }
  };

  const handleBulkDelete = () => {
    if (selectedIds.size === 0) return;
    triggerConfirm({
      title: 'PINDAHKAN KE TEMPAT SAMPAH?',
      message: `Pindahkan ${selectedIds.size} data ke tempat sampah? Anda bisa mengembalikannya dari menu Akun.`,
      type: 'warning',
      onConfirm: () => { 
        const selectedIdArray = Array.from(selectedIds);
        if (onBulkDelete) {
          // Soft delete (permanent = false)
          onBulkDelete(selectedIdArray, false);
        } else {
          // Fallback jika bulk delete tidak tersedia
          selectedIds.forEach(id => onDelete(id));
        }
        setSelectedIds(new Set());
      }
    });
  };

  const handleBulkRestore = () => {
    if (selectedIds.size === 0) return;
    triggerConfirm({
      title: 'PULIHKAN?',
      message: `Kembalikan ${selectedIds.size} data ke antrean proses?`,
      type: 'warning',
      onConfirm: () => { 
        const selectedIdArray = Array.from(selectedIds);
        if (onBulkUpdateStatus) {
          onBulkUpdateStatus(selectedIdArray, JobStatus.PROSES, PaymentStatus.BELUM);
        } else {
          // Fallback jika bulk update tidak tersedia
          selectedIds.forEach(id => { 
            onUpdateStatus(id, JobStatus.PROSES); 
            if (onUpdatePayment) onUpdatePayment(id, PaymentStatus.BELUM); 
          });
        }
        setSelectedIds(new Set());
      }
    });
  };

  const InfoBox = ({ label, value, icon, isDarkMode }: any) => (
    <div className={`p-4 rounded-2xl border flex items-center gap-4 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
      <div className="p-2 bg-slate-50 rounded-xl">{icon}</div>
      <div className="flex flex-col"><span className="text-[8px] font-black uppercase text-slate-400">{label}</span><span className="text-[11px] font-bold uppercase">{value || '-'}</span></div>
    </div>
  );

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-slate-900' : 'bg-[#f4f7f9]'}`}>
      {/* Sticky Header */}
      <div className={`sticky top-0 z-50 pt-4 pb-4 px-6 ${isDarkMode ? 'bg-slate-900' : 'bg-[#f4f7f9]'}`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>History Kerja</h2>
        </div>

        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input type="text" placeholder="Cari..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className={`w-full py-4 pl-11 pr-4 rounded-[1.5rem] border ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-100'}`} />
          </div>
          <button onClick={() => setFilterMode('SEMUA')} className="px-4 bg-white border border-slate-100 rounded-2xl"><Filter size={18} /></button>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 pb-32 space-y-6">
        {activeItems.map(order => {
          const isSelected = selectedIds.has(order.id);
          const isExpanded = expandedDetails.has(order.id);
          return (
            <div key={order.id} className={`p-4 md:p-6 rounded-[1.5rem] md:rounded-[2.5rem] border transition-all ${isSelected ? 'border-emerald-500 ring-4 md:ring-8 ring-emerald-500/5 shadow-xl' : isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-100'}`}>
               <div className="flex justify-between items-start mb-3 md:mb-4">
                  <div className="flex items-center gap-2 md:gap-3">
                    <button onClick={() => toggleSelect(order.id)} className={`w-6 h-6 md:w-8 md:h-8 rounded-full border-2 flex items-center justify-center ${isSelected ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300'}`}>
                      {isSelected && <CheckCircle size={12} className="md:hidden" strokeWidth={4} />}
                      {isSelected && <CheckCircle size={14} className="hidden md:block" strokeWidth={4} />}
                    </button>
                    <span className="text-xs md:text-sm font-black text-emerald-500">{order.kodeBarang}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase">{formatDateIndo(order.tanggalTargetSelesai)}</span>
                  </div>
               </div>

               <div className="mb-4 md:mb-6">
                  <h4 className="text-sm md:text-base font-black uppercase mb-1 truncate">{order.model} • {order.warna}</h4>
                  <p className="text-[9px] md:text-[10px] font-bold text-slate-400 truncate">PJ: {order.namaPenjahit} | CONS: {order.konsumen || '-'}</p>
               </div>

               <div className={`rounded-xl md:rounded-[2rem] border overflow-hidden transition-all duration-500 ${isDarkMode ? 'bg-slate-900/50 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                  <button onClick={() => { const next = new Set(expandedDetails); if (next.has(order.id)) next.delete(order.id); else next.add(order.id); setExpandedDetails(next); }} className="w-full p-3 md:p-4 flex justify-between items-center">
                    <span className="text-[8px] md:text-[9px] font-black uppercase tracking-widest opacity-40">Rincian Item ({order.jumlahPesanan} PCS)</span>
                    <ChevronDown className={`transition-transform duration-500 ${isExpanded ? 'rotate-180' : ''}`} size={16} />
                  </button>
                  <div className={`overflow-hidden transition-all duration-500 ${isExpanded ? 'max-h-[1000px] p-3 md:p-4 pt-0 opacity-100' : 'max-h-0 opacity-0'}`}>
                     <div className="space-y-2">
                        {order.sizeDetails.map((sd, i) => {
                          // Jika ada sizes array, tampilkan semua sizes
                          if (sd.sizes && sd.sizes.length > 0) {
                            return sd.sizes.map((sizeItem, sIdx) => (
                              <div key={`${i}-${sIdx}`} className={`p-2 md:p-3 rounded-lg md:rounded-xl border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
                                <div className="flex items-center justify-between gap-2 md:gap-3">
                                   <div className="flex items-center gap-1.5 md:gap-2">
                                      <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-black text-xs md:text-sm">{sizeItem.size}</div>
                                      <span className="text-[10px] md:text-xs font-black text-slate-400">-</span>
                                      <span className="text-xs md:text-sm font-black text-emerald-500">{sizeItem.jumlah} PCS</span>
                                   </div>
                                   <div className="flex items-center gap-1 md:gap-2 text-[8px] md:text-[9px] font-bold text-slate-500">
                                      <span className="uppercase">{sd.gender}</span>
                                      <span className="text-slate-400">-</span>
                                      <span>{sd.tangan || '-'}</span>
                                   </div>
                                </div>
                              </div>
                            ));
                          } else {
                            // Format lama: single size
                            return (
                              <div key={i} className={`p-2 md:p-3 rounded-lg md:rounded-xl border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
                                <div className="flex items-center justify-between gap-2 md:gap-3">
                                   <div className="flex items-center gap-1.5 md:gap-2">
                                      <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-black text-xs md:text-sm">{sd.size}</div>
                                      <span className="text-[10px] md:text-xs font-black text-slate-400">-</span>
                                      <span className="text-xs md:text-sm font-black text-emerald-500">{sd.jumlah} PCS</span>
                                   </div>
                                   <div className="flex items-center gap-1 md:gap-2 text-[8px] md:text-[9px] font-bold text-slate-500">
                                      <span className="uppercase">{sd.gender}</span>
                                      <span className="text-slate-400">-</span>
                                      <span>{sd.tangan || '-'}</span>
                                   </div>
                                </div>
                              </div>
                            );
                          }
                        })}
                     </div>
                  </div>
               </div>

               <div className="mt-4 md:mt-6 flex justify-between items-center">
                 <div className="flex gap-1.5 md:gap-2">
                    <button onClick={() => onUpdateStatus(order.id, JobStatus.BERES)} className="px-2 py-1.5 md:px-4 md:py-2 bg-orange-500 text-white rounded-lg md:rounded-xl font-black text-[7px] md:text-[8px] uppercase">STATUS: {order.status}</button>
                    <button onClick={() => onUpdatePayment && onUpdatePayment(order.id, PaymentStatus.BAYAR)} className="px-2 py-1.5 md:px-4 md:py-2 bg-blue-600 text-white rounded-lg md:rounded-xl font-black text-[7px] md:text-[8px] uppercase whitespace-nowrap">LUNAS: {order.paymentStatus === PaymentStatus.BAYAR ? 'YA' : 'TIDAK'}</button>
                 </div>
                 <div className="flex gap-1.5 md:gap-2 text-slate-400">
                    <button onClick={() => onEdit(order)}><Edit3 size={14} className="md:hidden" /><Edit3 size={16} className="hidden md:block" /></button>
                    <button onClick={() => setSelectedOrderDetails(order)}><Info size={14} className="md:hidden" /><Info size={16} className="hidden md:block" /></button>
                 </div>
               </div>
            </div>
          )
        })}

      {groupedUnpaidItems.length > 0 && (
        <div className="mt-12 space-y-10">
          <div className="flex items-center gap-3 px-4">
            <div className="h-[1px] flex-1 bg-slate-200" />
            <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Selesai Belum Lunas</span>
            <div className="h-[1px] flex-1 bg-slate-200" />
          </div>

          {groupedUnpaidItems.map(([date, items]) => {
            // Format tanggal untuk display
            let displayDate = 'Tanpa Tanggal';
            if (date !== 'Tanpa Tanggal') {
              try {
                const d = new Date(date);
                displayDate = format(d, 'EEEE, d MMMM yyyy', { locale: idLocale }).toUpperCase();
              } catch (e) {
                displayDate = date;
              }
            }
            const groupKey = `unpaid-${date}`;
            const isCollapsed = collapsedGroups.has(groupKey);
            
            return (
            <div key={date} className={`overflow-hidden rounded-[2.5rem] md:rounded-[2.5rem] rounded-[1.5rem] border-2 shadow-xl transition-all ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-amber-500/10'}`}>
               {/* Header Tanggal - Clickable */}
               <button 
                 onClick={() => toggleGroupCollapse(groupKey)}
                 className={`w-full flex items-center gap-2 md:gap-4 p-3 md:p-5 border-b ${isDarkMode ? 'border-slate-700' : 'border-slate-100'} hover:bg-amber-50/5 transition-colors`}
               >
                  <div className="w-10 h-10 md:w-14 md:h-14 bg-amber-50 text-amber-500 rounded-xl md:rounded-2xl flex items-center justify-center shrink-0"><AlertCircle size={20} className="md:hidden" /><AlertCircle size={28} className="hidden md:block" /></div>
                  <div className="flex-1 text-left min-w-0">
                     <h4 className="text-xs md:text-base font-black uppercase text-amber-600 truncate">{displayDate}</h4>
                     <p className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase">Selesai - Menunggu Pembayaran</p>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 rounded-lg md:rounded-xl px-2 py-1 md:px-4 md:py-2 flex flex-col items-center shrink-0">
                     <span className="text-sm md:text-lg font-black text-slate-400">{items.length}</span>
                     <span className="text-[6px] md:text-[7px] font-black text-slate-300">ITEM</span>
                  </div>
                  <ChevronDown className={`transition-transform duration-300 text-slate-400 shrink-0 ${isCollapsed ? '' : 'rotate-180'}`} size={16} />
               </button>

               {/* Tabel Items - Collapsible */}
               <div className={`overflow-hidden transition-all duration-300 ${isCollapsed ? 'max-h-0' : 'max-h-[2000px]'}`}>
               <div className="overflow-x-auto">
                  <table className="w-full text-left">
                     <thead>
                        <tr className="text-[9px] font-black uppercase text-slate-400 border-b border-slate-50">
                           <th className="px-3 py-4 w-12">
                              <button
                                onClick={() => toggleSelectAll(items.map(o => o.id))}
                                className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${items.every(o => selectedIds.has(o.id)) && items.length > 0 ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300'}`}
                              >
                                {items.every(o => selectedIds.has(o.id)) && items.length > 0 && <CheckCircle size={10} strokeWidth={4} />}
                              </button>
                           </th>
                           <th className="px-3 py-4">Kode / Konsumen</th>
                           <th className="px-3 py-4">Model</th>
                           <th className="px-3 py-4 text-center w-16">Qty</th>
                           <th className="px-3 py-4 text-right w-16">Aksi</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-50">
                        {items.map(o => {
                          const isSelected = selectedIds.has(o.id);
                          return (
                            <tr key={o.id} onClick={() => toggleSelect(o.id)} className={`text-[10px] font-bold cursor-pointer transition-colors ${isSelected ? (isDarkMode ? 'bg-emerald-500/10' : 'bg-emerald-50') : ''}`}>
                               <td className="px-3 py-4">
                                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300'}`}>
                                    {isSelected && <CheckCircle size={10} strokeWidth={4} />}
                                  </div>
                               </td>
                               <td className="px-3 py-4">
                                 <div className="flex flex-col">
                                    <span className="text-emerald-500 font-black">{o.kodeBarang}</span>
                                    <span className="text-[8px] opacity-40">{o.konsumen || '-'}</span>
                                 </div>
                               </td>
                               <td className="px-3 py-4 uppercase truncate max-w-[100px]">{o.model}</td>
                               <td className="px-3 py-4 text-center">{o.jumlahPesanan}</td>
                               <td className="px-3 py-4 text-right">
                                  <button onClick={(e) => { e.stopPropagation(); setSelectedOrderDetails(o); }} className="p-1.5 text-blue-500 inline-flex items-center justify-center"><Info size={16} /></button>
                               </td>
                            </tr>
                          );
                        })}
                     </tbody>
                  </table>
               </div>
               </div>
            </div>
            );
          })}
        </div>
      )}

      {groupedPaidItems.length > 0 && (
        <div className="mt-12 space-y-10">
          <div className="flex items-center gap-3 px-4">
            <div className="h-[1px] flex-1 bg-slate-200" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Selesai & Lunas</span>
            <div className="h-[1px] flex-1 bg-slate-200" />
          </div>

          {groupedPaidItems.map(([date, items]) => {
            // Format tanggal untuk display
            let displayDate = 'Tanpa Tanggal';
            if (date !== 'Tanpa Tanggal') {
              try {
                const d = new Date(date);
                displayDate = format(d, 'EEEE, d MMMM yyyy', { locale: idLocale }).toUpperCase();
              } catch (e) {
                displayDate = date;
              }
            }
            const groupKey = `paid-${date}`;
            const isCollapsed = collapsedGroups.has(groupKey);
            
            return (
            <div key={date} className={`overflow-hidden rounded-[2.5rem] md:rounded-[2.5rem] rounded-[1.5rem] border-2 shadow-xl transition-all ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-emerald-500/10'}`}>
               {/* Header Tanggal - Clickable */}
               <button 
                 onClick={() => toggleGroupCollapse(groupKey)}
                 className={`w-full flex items-center gap-2 md:gap-4 p-3 md:p-5 border-b ${isDarkMode ? 'border-slate-700' : 'border-slate-100'} hover:bg-emerald-50/5 transition-colors`}
               >
                  <div className="w-10 h-10 md:w-14 md:h-14 bg-emerald-50 text-emerald-500 rounded-xl md:rounded-2xl flex items-center justify-center shrink-0"><CalendarDays size={20} className="md:hidden" /><CalendarDays size={28} className="hidden md:block" /></div>
                  <div className="flex-1 text-left min-w-0">
                     <h4 className="text-xs md:text-base font-black uppercase text-emerald-600 truncate">{displayDate}</h4>
                     <p className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase">Laporan Harian Team</p>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 rounded-lg md:rounded-xl px-2 py-1 md:px-4 md:py-2 flex flex-col items-center shrink-0">
                     <span className="text-sm md:text-lg font-black text-slate-400">{items.length}</span>
                     <span className="text-[6px] md:text-[7px] font-black text-slate-300">ITEM</span>
                  </div>
                  <ChevronDown className={`transition-transform duration-300 text-slate-400 shrink-0 ${isCollapsed ? '' : 'rotate-180'}`} size={16} />
               </button>

               {/* Tabel Items - Collapsible */}
               <div className={`overflow-hidden transition-all duration-300 ${isCollapsed ? 'max-h-0' : 'max-h-[2000px]'}`}>
               <div className="overflow-x-auto">
                  <table className="w-full text-left">
                     <thead>
                        <tr className="text-[9px] font-black uppercase text-slate-400 border-b border-slate-50">
                           <th className="px-3 py-4 w-12">
                              <button
                                onClick={() => toggleSelectAll(items.map(o => o.id))}
                                className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${items.every(o => selectedIds.has(o.id)) && items.length > 0 ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300'}`}
                              >
                                {items.every(o => selectedIds.has(o.id)) && items.length > 0 && <CheckCircle size={10} strokeWidth={4} />}
                              </button>
                           </th>
                           <th className="px-3 py-4">Kode / Konsumen</th>
                           <th className="px-3 py-4">Model</th>
                           <th className="px-3 py-4 text-center w-16">Qty</th>
                           <th className="px-3 py-4 text-right w-16">Aksi</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-50">
                        {items.map(o => {
                          const isSelected = selectedIds.has(o.id);
                          return (
                            <tr key={o.id} onClick={() => toggleSelect(o.id)} className={`text-[10px] font-bold cursor-pointer transition-colors ${isSelected ? (isDarkMode ? 'bg-emerald-500/10' : 'bg-emerald-50') : ''}`}>
                               <td className="px-3 py-4">
                                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300'}`}>
                                    {isSelected && <CheckCircle size={10} strokeWidth={4} />}
                                  </div>
                               </td>
                               <td className="px-3 py-4">
                                 <div className="flex flex-col">
                                    <span className="text-emerald-500 font-black">{o.kodeBarang}</span>
                                    <span className="text-[8px] opacity-40">{o.konsumen || '-'}</span>
                                 </div>
                               </td>
                               <td className="px-3 py-4 uppercase truncate max-w-[100px]">{o.model}</td>
                               <td className="px-3 py-4 text-center">{o.jumlahPesanan}</td>
                               <td className="px-3 py-4 text-right">
                                  <button onClick={(e) => { e.stopPropagation(); setSelectedOrderDetails(o); }} className="p-1.5 text-blue-500 inline-flex items-center justify-center"><Info size={16} /></button>
                               </td>
                            </tr>
                          );
                        })}
                     </tbody>
                  </table>
               </div>
               </div>
            </div>
            );
          })}
        </div>
      )}
      </div>

      {selectedIds.size > 0 && (
        <div className="fixed bottom-24 sm:bottom-20 left-0 right-0 z-[80] px-3 sm:px-4 animate-in slide-in-from-bottom-10 duration-500">
          <div className={`max-w-md mx-auto flex items-center justify-center gap-1.5 sm:gap-2 p-2.5 sm:p-3 rounded-[1.5rem] shadow-2xl border-2 ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-100'}`}>
            {/* Badge Count */}
            <div className="bg-emerald-500 text-white w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center font-black text-xs shrink-0">
              {selectedIds.size}
            </div>
            
            {/* Restore Button */}
            <button
              onClick={handleBulkRestore}
              className="flex items-center justify-center gap-1 sm:gap-1.5 bg-amber-500 text-white px-2.5 sm:px-3 py-2 sm:py-2.5 rounded-xl font-black text-[9px] uppercase shadow-lg hover:scale-105 active:scale-95 transition-all min-w-0"
              title="Pulihkan Terpilih"
            >
              <RotateCcw size={14} className="shrink-0" />
              <span className="hidden sm:inline">Restore</span>
            </button>

            {/* Delete Button */}
            <button
              onClick={handleBulkDelete}
              className="flex items-center justify-center gap-1 sm:gap-1.5 bg-red-500 text-white px-2.5 sm:px-3 py-2 sm:py-2.5 rounded-xl font-black text-[9px] uppercase shadow-lg hover:scale-105 active:scale-95 transition-all min-w-0"
              title="Hapus Terpilih"
            >
              <Trash2 size={14} className="shrink-0" />
              <span className="hidden sm:inline">Hapus</span>
            </button>

            {/* WhatsApp Button */}
            <button
              onClick={handleShareWhatsApp}
              className="flex items-center justify-center gap-1 sm:gap-1.5 bg-emerald-500 text-white px-2.5 sm:px-3 py-2 sm:py-2.5 rounded-xl font-black text-[9px] uppercase shadow-lg hover:scale-105 active:scale-95 transition-all min-w-0"
            >
              <Send size={14} className="shrink-0" />
              <span className="hidden sm:inline">WhatsApp</span>
            </button>
          </div>
        </div>
      )}

      {/* Info Detail Popup */}
      {selectedOrderDetails && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in zoom-in duration-300">
          <div className={`relative w-full max-w-sm rounded-[3rem] p-8 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden ${isDarkMode ? 'bg-slate-900 text-white' : 'bg-white text-slate-800'}`}>
            <button onClick={() => setSelectedOrderDetails(null)} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-red-500"><X size={24} /></button>

            <div className="flex flex-col gap-6 overflow-y-auto mt-4 px-1" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              <style>{`div::-webkit-scrollbar { display: none; }`}</style>
              
              <div className="text-center">
                <h3 className="text-2xl font-black">{selectedOrderDetails.kodeBarang}</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Penjahit: {selectedOrderDetails.namaPenjahit}</p>
              </div>

              <div className="space-y-6">
                <div className="flex flex-col gap-3">
                  <InfoBox label="Konsumen" value={selectedOrderDetails.konsumen} icon={<UserCheck size={14} className="text-emerald-500" />} isDarkMode={isDarkMode} />
                  <InfoBox label="Admin (CS)" value={selectedOrderDetails.cs} icon={<ShieldCheck size={14} className="text-orange-500" />} isDarkMode={isDarkMode} />
                  <InfoBox label="Tgl Order" value={formatDateIndo(selectedOrderDetails.tanggalOrder)} icon={<CalendarDays size={14} className="text-cyan-500" />} isDarkMode={isDarkMode} />
                  <InfoBox label="Target Selesai" value={formatDateIndo(selectedOrderDetails.tanggalTargetSelesai)} icon={<Calendar size={14} className="text-red-500" />} isDarkMode={isDarkMode} />
                </div>

                {/* Rincian Items */}
                <div className="space-y-4">
                  <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Rincian Item</h5>
                  {selectedOrderDetails.sizeDetails.map((sd, i) => {
                    // Jika ada sizes array
                    if (sd.sizes && sd.sizes.length > 0) {
                      return (
                        <div key={i} className={`p-4 rounded-2xl border space-y-2 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                          {sd.sizes.map((sizeItem, sIdx) => (
                            <div key={sIdx} className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-2">
                                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black">{sizeItem.size}</div>
                                <span className="text-xs font-black text-slate-400">-</span>
                                <span className="text-sm font-black text-emerald-500">{sizeItem.jumlah} PCS</span>
                              </div>
                              <div className="flex items-center gap-2 text-[9px] font-bold text-slate-500">
                                <span className="uppercase">{sd.gender}</span>
                                <span className="text-slate-400">-</span>
                                <span>{sd.tangan || '-'}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    } else {
                      // Format lama
                      return (
                        <div key={i} className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black">{sd.size}</div>
                              <span className="text-xs font-black text-slate-400">-</span>
                              <span className="text-sm font-black text-emerald-500">{sd.jumlah} PCS</span>
                            </div>
                            <div className="flex items-center gap-2 text-[9px] font-bold text-slate-500">
                              <span className="uppercase">{sd.gender}</span>
                              <span className="text-slate-400">-</span>
                              <span>{sd.tangan || '-'}</span>
                            </div>
                          </div>
                        </div>
                      );
                    }
                  })}
                </div>

                <div className={`p-5 rounded-3xl border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                  <div className="flex justify-between items-center mb-3">
                    <h5 className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Rincian Bordir</h5>
                    <span className={`px-2 py-0.5 rounded-lg text-[7px] font-black uppercase ${selectedOrderDetails.embroideryStatus === 'Lengkap' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                      {selectedOrderDetails.embroideryStatus || 'Lengkap'}
                    </span>
                  </div>
                  {selectedOrderDetails.embroideryNotes && (
                    <p className="text-[10px] font-bold text-slate-500 italic leading-snug">"{selectedOrderDetails.embroideryNotes}"</p>
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
    </div>
  );
};

export default HistoryScreen;

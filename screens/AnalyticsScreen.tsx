
import React, { useState, useMemo } from 'react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { OrderItem, PRICE_LIST, JobStatus, PaymentStatus } from '../types';
import { format, isSameDay, isSameMonth, addDays } from 'date-fns';
import { id as idLocale } from 'date-fns/locale/id';
import { Wallet, TrendingUp, Package } from 'lucide-react';

interface AnalyticsScreenProps {
  orders: OrderItem[];
  isDarkMode: boolean;
}

const isValidDate = (date: any): date is Date => {
  return date instanceof Date && !isNaN(date.getTime());
};

const AnalyticsScreen: React.FC<AnalyticsScreenProps> = ({ orders, isDarkMode }) => {
  const [timeframe, setTimeframe] = useState<'WEEK' | 'MONTH' | 'YEAR'>('WEEK');
  const [manualSisaUang, setManualSisaUang] = useState(() => {
    const saved = localStorage.getItem('bradwear_sisa_uang');
    return saved ? parseInt(saved) : 0;
  });
  const [isEditingSisa, setIsEditingSisa] = useState(false);

  const statsSummary = useMemo(() => {
    const paidOrders = orders.filter(o => o.paymentStatus === PaymentStatus.BAYAR);
    const totalEarnings = paidOrders.reduce((sum, o) => {
      const price = PRICE_LIST[o.model.toUpperCase()] || PRICE_LIST['DEFAULT'];
      return sum + (price * (o.jumlahPesanan || 0));
    }, 0);

    const totalPcs = orders.reduce((sum, o) => sum + (o.jumlahPesanan || 0), 0);

    return { totalEarnings, totalPcs, paidCount: paidOrders.length };
  }, [orders]);

  const handleUpdateSisaUang = (val: string) => {
    const num = parseInt(val.replace(/\D/g, '')) || 0;
    setManualSisaUang(num);
    localStorage.setItem('bradwear_sisa_uang', num.toString());
  };

  const chartData = useMemo(() => {
    const now = new Date();
    if (timeframe === 'WEEK') {
      const monday = new Date(now);
      const day = monday.getDay();
      const diff = monday.getDate() - (day === 0 ? 6 : day - 1);
      monday.setDate(diff);
      monday.setHours(0, 0, 0, 0);

      const dayLabels = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

      return [0, 1, 2, 3, 4, 5].map(offset => {
        const date = addDays(monday, offset);
        const dayOrders = orders.filter(o => {
          if (o.status !== JobStatus.BERES || !o.completedAt) return false;
          const d = new Date(o.completedAt);
          return isValidDate(d) && isSameDay(d, date);
        });
        return {
          label: dayLabels[offset],
          count: dayOrders.reduce((sum, o) => sum + (o.jumlahPesanan || 0), 0),
          orderCount: dayOrders.length,
          date: date
        };
      });
    } else {
      return [5, 4, 3, 2, 1, 0].reverse().map(i => {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthOrders = orders.filter(o => {
          if (o.status !== JobStatus.BERES || !o.completedAt) return false;
          const d = new Date(o.completedAt);
          return isValidDate(d) && isSameMonth(d, date);
        });
        return {
          label: format(date, 'MMM', { locale: idLocale }),
          count: monthOrders.reduce((sum, o) => sum + (o.jumlahPesanan || 0), 0),
          orderCount: monthOrders.length,
          date: date
        };
      });
    }
  }, [orders, timeframe]);

  const maxProduction = useMemo(() => Math.max(...chartData.map(d => d.count), 1), [chartData]);

  return (
    <div className="p-6 space-y-6 pb-24">
      <h2 className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Performance Stats</h2>

      <div className="flex gap-2">
        <button
          onClick={() => setTimeframe('WEEK')}
          className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${timeframe === 'WEEK' ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg' : isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-white border-slate-100 text-slate-400'}`}
        >
          Pekan Ini
        </button>
        <button
          onClick={() => setTimeframe('MONTH')}
          className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${timeframe === 'MONTH' ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg' : isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-white border-slate-100 text-slate-400'}`}
        >
          6 Bulan
        </button>
      </div>

      <div className={`p-8 rounded-[2.5rem] bg-gradient-to-br from-blue-600 to-indigo-800 text-white shadow-2xl relative overflow-hidden transition-all active:scale-[0.98]`}>
        <div className="relative z-10 flex flex-col gap-1">
          <span className="text-[10px] font-black uppercase tracking-widest opacity-80">Management Keuangan</span>
          <div className="mt-4 space-y-4">
            <div className="flex flex-col">
              <span className="text-[8px] font-black uppercase opacity-60">Total Gaji (Terbayar)</span>
              <div className="flex items-center gap-2">
                <Wallet className="opacity-40" size={16} />
                <h3 className="text-2xl font-black">Rp {statsSummary.totalEarnings.toLocaleString()}</h3>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10">
              <div className="flex flex-col">
                <span className="text-[8px] font-black uppercase opacity-60">Sisa Uang (Input Manual)</span>
                <div className="flex items-center gap-1.5 mt-1">
                  <TrendingUp className="text-emerald-400" size={14} />
                  {isEditingSisa ? (
                    <input
                      autoFocus
                      type="text"
                      inputMode="numeric"
                      value={manualSisaUang || ''}
                      onChange={(e) => handleUpdateSisaUang(e.target.value)}
                      onBlur={() => setIsEditingSisa(false)}
                      onKeyDown={(e) => e.key === 'Enter' && setIsEditingSisa(false)}
                      className="bg-white/10 border border-white/20 rounded-lg px-2 py-1 text-lg font-black text-white outline-none w-32"
                    />
                  ) : (
                    <h4 onClick={() => setIsEditingSisa(true)} className="text-2xl font-black text-emerald-400 cursor-pointer">
                      Rp {manualSisaUang.toLocaleString()}
                    </h4>
                  )}
                </div>
                {!isEditingSisa && <p className="text-[7px] text-white/40 uppercase mt-1 leading-none">Tap angka untuk ubah sisa uang</p>}
              </div>
            </div>
          </div>
        </div>
        <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className={`p-5 rounded-[2rem] border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
          <Package className="text-blue-500 mb-2" size={20} />
          <p className="text-[9px] text-slate-400 font-black uppercase">Total Produksi</p>
          <p className={`text-xl font-black ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{statsSummary.totalPcs} Pcs</p>
        </div>
        <div className={`p-5 rounded-[2rem] border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
          <TrendingUp className="text-orange-500 mb-2" size={20} />
          <p className="text-[9px] text-slate-400 font-black uppercase">Efisiensi</p>
          <p className={`text-xl font-black ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>94%</p>
        </div>
      </div>

      {/* DETAILED PRODUCTION WIDGET */}
      <div className={`${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-50'} p-6 rounded-[2.5rem] shadow-xl border`}>
        <div className="flex justify-between items-center mb-6 px-2">
          <div className="flex flex-col">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Detail Produksi Harian</h4>
            <span className="text-[8px] font-bold text-emerald-500 uppercase mt-1">Berdasarkan Jumlah Pcs Beres</span>
          </div>
          <div className="p-2 bg-emerald-500/10 rounded-xl">
            <TrendingUp size={16} className="text-emerald-500" />
          </div>
        </div>

        <div className="space-y-4">
          {chartData.map((data, idx) => {
            const percentage = (data.count / maxProduction) * 100;
            const isToday = timeframe === 'WEEK' && isSameDay(data.date, new Date());

            return (
              <div key={idx} className={`relative flex flex-col gap-1.5 p-3 rounded-2xl transition-all ${isToday ? (isDarkMode ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-emerald-50') : ''}`}>
                <div className="flex justify-between items-end">
                  <div className="flex flex-col">
                    <span className={`text-[10px] font-black uppercase tracking-tighter ${isToday ? 'text-emerald-500' : isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      {data.label} {isToday && '• HARI INI'}
                    </span>
                    <span className={`text-[8px] font-medium ${isDarkMode ? 'text-slate-600' : 'text-slate-300'}`}>
                      {data.orderCount} Kerjaaan selesai
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className={`text-lg font-black leading-none ${isToday ? 'text-emerald-600' : isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                      {data.count}
                    </span>
                    <span className="text-[8px] font-black text-slate-400 uppercase">Pcs</span>
                  </div>
                </div>

                {/* Visual Progress Bar */}
                <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-700/50 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ${isToday ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-blue-500/50'}`}
                    style={{ width: `${Math.max(percentage, 5)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {chartData.length === 0 && (
          <div className="py-10 text-center">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest opacity-50">Belum ada data produksi</p>
          </div>
        )}
      </div>

      <div className={`${isDarkMode ? 'bg-slate-800' : 'bg-slate-900'} rounded-[2.5rem] p-8 text-white relative overflow-hidden`}>
        <div className="relative z-10">
          <h4 className="font-black text-[10px] uppercase tracking-[0.2em] text-emerald-500 mb-3">Menabung Untuk Masa Depan</h4>
          <p className="text-sm font-black italic leading-tight">
            "Rezeki yang ditabung adalah rezeki yang terjaga. Kualitas kerja mendatangkan pelanggan, hemat uang menjaga masa depan."
          </p>
          <div className="mt-6 flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 flex items-center justify-center">
              <TrendingUp size={20} className="text-emerald-500 animate-bounce" />
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Target Menabung</span>
              <span className="text-[10px] font-bold text-emerald-400">Jangan habiskan semua yang kau hasilkan hari ini!</span>
            </div>
          </div>
        </div>
        <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl" />
      </div>
    </div>
  );
};

export default AnalyticsScreen;

import React from 'react';
import { Layers } from 'lucide-react';
import { SizeGroup, JenisBarang } from '../../types';
import { getCategoryDisplayName, calculateGroupSubtotal } from '../../utils/sizeGrouping';

interface GrandTotalDisplayProps {
  groups: SizeGroup[];
  jenisBarang?: JenisBarang;
  grandTotal: number;
  isDarkMode: boolean;
}

const GrandTotalDisplay: React.FC<GrandTotalDisplayProps> = ({
  groups,
  jenisBarang,
  grandTotal,
  isDarkMode,
}) => {
  return (
    <div
      className={`p-3 md:p-5 rounded-xl md:rounded-2xl border ${
        isDarkMode
          ? 'bg-blue-500/10 border-blue-500/20'
          : 'bg-blue-50 border-blue-100'
      }`}
    >
      <div className="flex items-center gap-1.5 md:gap-2 mb-3 md:mb-4">
        <Layers size={14} className="md:hidden text-blue-500" />
        <Layers size={16} className="hidden md:block text-blue-500" />
        <span className="text-[10px] md:text-[11px] font-black text-blue-600 uppercase tracking-widest">
          Total Keseluruhan
        </span>
      </div>

      {/* Category Breakdown */}
      <div className="space-y-1.5 md:space-y-2 mb-3 md:mb-4">
        {groups.map((group) => {
          const categoryName = getCategoryDisplayName(group, jenisBarang);
          const subtotal = calculateGroupSubtotal(group);
          return (
            <div
              key={group.id}
              className="flex justify-between items-center text-[9px] md:text-[10px]"
            >
              <span className={`font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                {categoryName}
              </span>
              <span className={`font-black ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                {subtotal} PCS
              </span>
            </div>
          );
        })}
      </div>

      {/* Grand Total */}
      <div
        className={`pt-2 md:pt-3 border-t flex justify-between items-center ${
          isDarkMode ? 'border-blue-500/20' : 'border-blue-200'
        }`}
      >
        <span className="text-[10px] md:text-[11px] font-black text-blue-600 uppercase">Grand Total</span>
        <span className="text-[13px] md:text-[14px] font-black text-blue-600">{grandTotal} PCS</span>
      </div>
    </div>
  );
};

export default GrandTotalDisplay;

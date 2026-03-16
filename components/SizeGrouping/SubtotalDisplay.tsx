import React from 'react';
import { Calculator } from 'lucide-react';
import { SizeGroup, JenisBarang } from '../../types';
import { getCategoryDisplayName, calculateGroupSubtotal } from '../../utils/sizeGrouping';

interface SubtotalDisplayProps {
  group: SizeGroup;
  jenisBarang?: JenisBarang;
  isDarkMode: boolean;
}

const SubtotalDisplay: React.FC<SubtotalDisplayProps> = ({
  group,
  jenisBarang,
  isDarkMode,
}) => {
  const categoryName = getCategoryDisplayName(group, jenisBarang);
  const subtotal = calculateGroupSubtotal(group);

  return (
    <div
      className={`p-4 rounded-xl border ${
        isDarkMode
          ? 'bg-emerald-500/10 border-emerald-500/20'
          : 'bg-emerald-50 border-emerald-100'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calculator size={14} className="text-emerald-500" />
          <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">
            {categoryName}
          </span>
        </div>
        <span className="text-[13px] font-black text-emerald-600">
          {subtotal} PCS
        </span>
      </div>
    </div>
  );
};

export default SubtotalDisplay;

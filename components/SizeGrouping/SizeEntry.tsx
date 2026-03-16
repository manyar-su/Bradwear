import React from 'react';
import { Trash2 } from 'lucide-react';
import { JenisBarang, CustomMeasurements } from '../../types';
import CustomMeasurementsInput from './CustomMeasurementsInput';

interface SizeEntryProps {
  size: string;
  jumlah: number;
  namaPerSize?: string;
  isCustomSize?: boolean;
  customMeasurements?: CustomMeasurements;
  isFirst: boolean;
  jenisBarang?: JenisBarang;
  onSizeChange: (value: string) => void;
  onJumlahChange: (value: number) => void;
  onCustomMeasurementsChange?: (measurements: CustomMeasurements) => void;
  onDelete?: () => void;
  isDarkMode: boolean;
}

const SizeEntry: React.FC<SizeEntryProps> = ({
  size,
  jumlah,
  namaPerSize,
  isCustomSize,
  customMeasurements,
  isFirst,
  jenisBarang,
  onSizeChange,
  onJumlahChange,
  onCustomMeasurementsChange,
  onDelete,
  isDarkMode,
}) => {
  // Display namaPerSize if available, otherwise show size
  const displayValue = namaPerSize || size;
  
  // Check if this is a custom size (either isCustomSize flag or size contains "CUSTOM")
  const isCustom = isCustomSize || size.toUpperCase().includes('CUSTOM');
  
  return (
    <div className="space-y-2 md:space-y-3">
      <div className="grid grid-cols-2 gap-2 md:gap-3">
        {/* Size Field */}
        <div className="flex flex-col gap-1 md:gap-2">
          {isFirst && (
            <label className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 md:ml-2">
              {jenisBarang === JenisBarang.CELANA ? 'Ukuran (Nomor)' : 'Ukuran (Size)'}
            </label>
          )}
          <input
            className={`w-full px-3 py-2.5 md:px-5 md:py-3.5 rounded-xl md:rounded-2xl text-[10px] md:text-[11px] font-black uppercase outline-none focus:ring-2 md:focus:ring-4 focus:ring-emerald-500/10 border ${
              isDarkMode ? 'bg-slate-950 border-slate-700 text-white' : 'bg-white border-slate-100 shadow-sm'
            }`}
            value={displayValue}
            placeholder={jenisBarang === JenisBarang.CELANA ? '28/30/32' : 'S/M/L/XL'}
            onChange={(e) => onSizeChange(e.target.value)}
          />
        </div>

        {/* Jumlah Field */}
        <div className="flex flex-col gap-1 md:gap-2">
          {isFirst && (
            <label className="text-[8px] md:text-[9px] font-black text-emerald-500 uppercase tracking-widest ml-1 md:ml-2">
              Jumlah (PCS)
            </label>
          )}
          <input
            type="number"
            className="w-full px-3 py-2.5 md:px-5 md:py-3.5 rounded-xl md:rounded-2xl text-[11px] md:text-[12px] font-black outline-none border border-emerald-200 bg-emerald-50 text-emerald-600 shadow-inner"
            value={jumlah || ''}
            placeholder="0"
            onChange={(e) => onJumlahChange(parseInt(e.target.value) || 0)}
          />
        </div>
      </div>

      {/* Custom Measurements Input - Show if custom size and has namaPerSize */}
      {isCustom && namaPerSize && onCustomMeasurementsChange && (
        <CustomMeasurementsInput
          namaPerSize={namaPerSize}
          measurements={customMeasurements}
          onMeasurementsChange={onCustomMeasurementsChange}
          isDarkMode={isDarkMode}
        />
      )}

      {/* Delete Button - only for non-first sizes */}
      {!isFirst && onDelete && (
        <button
          type="button"
          onClick={onDelete}
          className="w-full py-2 md:py-3 rounded-lg md:rounded-xl bg-red-50 text-red-500 border border-red-100 hover:bg-red-500 hover:text-white transition-all active:scale-95 flex items-center justify-center gap-1.5 md:gap-2"
          title="Hapus size ini"
        >
          <Trash2 size={12} className="md:hidden" />
          <Trash2 size={14} className="hidden md:block" />
          <span className="text-[9px] md:text-[10px] font-black uppercase">Hapus Size</span>
        </button>
      )}
    </div>
  );
};

export default SizeEntry;

import React from 'react';
import { Trash2 } from 'lucide-react';
import { JenisBarang, CustomMeasurements } from '../../types';
import CustomMeasurementsInput from './CustomMeasurementsInput';

const KNOWN_TAILORS = ['maris', 'ferry', 'feri', 'aan', 'farid', 'opik', 'fadil', 'asep', 'abdul', 'hadi', 'epul'];

export const isTailorName = (value: string): boolean => {
  if (!value) return false;
  const lower = value.toLowerCase().trim();
  const isSizePattern = /^(xs|s|m|l|xl|xxl|xxxl|2xl|3xl|4xl|5xl|\d{2,3})$/i.test(lower);
  if (isSizePattern) return false;
  return KNOWN_TAILORS.some(t => lower.includes(t)) || /^[a-z]{3,}$/i.test(lower);
};

interface SizeEntryProps {
  size: string;
  jumlah: number;
  namaPerSize?: string;
  isCustomSize?: boolean;
  customMeasurements?: CustomMeasurements;
  isFirst: boolean;
  jenisBarang?: JenisBarang;
  hasPjColumn?: boolean;
  currentUser?: string;
  onSizeChange: (value: string) => void;
  onJumlahChange: (value: number) => void;
  onNamaPerSizeChange?: (value: string) => void;
  onCustomMeasurementsChange?: (measurements: CustomMeasurements) => void;
  onDelete?: () => void;
  isDarkMode: boolean;
}

const SizeEntry: React.FC<SizeEntryProps> = ({
  size, jumlah, namaPerSize, isCustomSize, customMeasurements,
  isFirst, jenisBarang, hasPjColumn = false, currentUser,
  onSizeChange, onJumlahChange, onNamaPerSizeChange,
  onCustomMeasurementsChange, onDelete, isDarkMode,
}) => {
  const isCustom = !!(isCustomSize || customMeasurements || size.toUpperCase().includes('CUSTOM'));
  const showPj = hasPjColumn && !isCustom;

  // Cek apakah PJ ini bukan user yang sedang login
  const isOtherPj = !!(showPj && namaPerSize && currentUser &&
    namaPerSize.toLowerCase().trim() !== currentUser.toLowerCase().trim());

  const gridCols = showPj ? 'grid-cols-[1fr_1.2fr_1fr_auto]' : 'grid-cols-[1.5fr_1fr_auto]';
  const inputBase = 'w-full px-2 py-2 rounded-lg text-[10px] font-bold uppercase outline-none focus:ring-2 focus:ring-emerald-400/20 border transition-all';
  const inputLight = 'bg-white border-slate-200 shadow-sm text-slate-800';
  const inputDark = 'bg-slate-950 border-slate-700 text-white';

  return (
    <div className="space-y-1.5">
      {/* Labels — hanya baris pertama */}
      {isFirst && (
        <div className={`grid gap-1.5 ${gridCols}`}>
          {showPj && (
            <label className="text-[8px] font-black text-blue-400 uppercase tracking-widest ml-1">PJ</label>
          )}
          <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">
            {jenisBarang === JenisBarang.CELANA ? 'Nomor' : 'Size'}
          </label>
          <label className="text-[8px] font-black text-emerald-500 uppercase tracking-widest ml-1">Jml</label>
          <div className="w-8" />
        </div>
      )}

      {/* Input row */}
      <div className={`grid gap-1.5 items-center ${gridCols}`}>
        {/* PJ kolom */}
        {showPj && (
          <div className="relative">
            <input
              className={`${inputBase} ${
                isOtherPj
                  ? 'bg-red-50 border-red-300 text-red-600 animate-pulse focus:ring-red-300/30'
                  : isDarkMode
                    ? 'bg-blue-950/40 border-blue-700 text-blue-300'
                    : 'bg-blue-50 border-blue-200 text-blue-700'
              }`}
              value={namaPerSize || ''}
              placeholder="Nama PJ"
              onChange={(e) => onNamaPerSizeChange?.(e.target.value)}
            />
            {/* Indikator merah jika PJ lain */}
            {isOtherPj && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-ping" />
            )}
          </div>
        )}

        {/* Size */}
        <input
          className={`${inputBase} ${isDarkMode ? inputDark : inputLight}`}
          value={size}
          placeholder={jenisBarang === JenisBarang.CELANA ? '28/30' : 'S/M/L'}
          onChange={(e) => onSizeChange(e.target.value)}
        />

        {/* Jumlah */}
        <input
          type="number"
          className={`${inputBase} border-emerald-200 bg-emerald-50 text-emerald-700 font-black`}
          value={jumlah || ''}
          placeholder="0"
          min={0}
          onChange={(e) => onJumlahChange(parseInt(e.target.value) || 0)}
        />

        {/* Hapus */}
        {onDelete ? (
          <button
            type="button"
            onClick={onDelete}
            className="w-8 h-8 rounded-lg bg-red-50 text-red-400 border border-red-100 hover:bg-red-500 hover:text-white transition-all active:scale-95 flex items-center justify-center flex-shrink-0"
            title="Hapus size"
          >
            <Trash2 size={12} />
          </button>
        ) : (
          <div className="w-8 h-8 flex-shrink-0" />
        )}
      </div>

      {/* Custom Measurements — nama di sini adalah nama konsumen */}
      {isCustom && namaPerSize && onCustomMeasurementsChange && (
        <CustomMeasurementsInput
          namaPerSize={namaPerSize}
          measurements={customMeasurements}
          onMeasurementsChange={onCustomMeasurementsChange}
          isDarkMode={isDarkMode}
        />
      )}
    </div>
  );
};

export default SizeEntry;

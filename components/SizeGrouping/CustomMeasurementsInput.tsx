import React, { useState } from 'react';
import { Ruler, ChevronDown, ChevronUp } from 'lucide-react';
import { CustomMeasurements } from '../../types';

interface CustomMeasurementsInputProps {
  namaPerSize: string;
  measurements?: CustomMeasurements;
  onMeasurementsChange: (measurements: CustomMeasurements) => void;
  isDarkMode: boolean;
}

const CustomMeasurementsInput: React.FC<CustomMeasurementsInputProps> = ({
  namaPerSize,
  measurements,
  onMeasurementsChange,
  isDarkMode,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Ensure measurements is always an object
  const currentMeasurements = measurements || {};

  const handleChange = (field: keyof CustomMeasurements, value: string) => {
    const numValue = value === '' ? undefined : parseFloat(value);
    onMeasurementsChange({
      ...currentMeasurements,
      [field]: numValue,
    });
  };

  const inputClass = `w-full px-3 py-2 rounded-lg text-[10px] font-bold outline-none border ${
    isDarkMode
      ? 'bg-slate-900 border-slate-700 text-white'
      : 'bg-white border-slate-200'
  }`;

  const labelClass = 'text-[9px] font-black text-slate-400 uppercase tracking-wider';

  return (
    <div
      className={`mt-3 rounded-xl border ${
        isDarkMode
          ? 'bg-blue-500/5 border-blue-500/20'
          : 'bg-blue-50 border-blue-100'
      }`}
    >
      {/* Header */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <Ruler size={14} className="text-blue-500" />
          <span className="text-[10px] font-black text-blue-600 uppercase">
            Ukuran Custom - {namaPerSize}
          </span>
        </div>
        {isExpanded ? (
          <ChevronUp size={14} className="text-blue-500" />
        ) : (
          <ChevronDown size={14} className="text-blue-500" />
        )}
      </button>

      {/* Measurements Form */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-3">
          {/* Row 1: Tinggi & Lebar Dada */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Tinggi (cm)</label>
              <input
                type="number"
                className={inputClass}
                value={currentMeasurements.tinggi || ''}
                onChange={(e) => handleChange('tinggi', e.target.value)}
                placeholder="0"
              />
            </div>
            <div>
              <label className={labelClass}>LD / Lebar Dada (cm)</label>
              <input
                type="number"
                className={inputClass}
                value={currentMeasurements.lebarDada || ''}
                onChange={(e) => handleChange('lebarDada', e.target.value)}
                placeholder="0"
              />
            </div>
          </div>

          {/* Row 2: Lebar Bahu & Panjang Lengan */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Lebar Bahu (cm)</label>
              <input
                type="number"
                className={inputClass}
                value={currentMeasurements.lebarBahu || ''}
                onChange={(e) => handleChange('lebarBahu', e.target.value)}
                placeholder="0"
              />
            </div>
            <div>
              <label className={labelClass}>Panjang Lengan (cm)</label>
              <input
                type="number"
                className={inputClass}
                value={currentMeasurements.panjangLengan || currentMeasurements.lenganPanjang || ''}
                onChange={(e) => handleChange('panjangLengan', e.target.value)}
                placeholder="0"
              />
            </div>
          </div>

          {/* Row 3: Ling Perut & Ling Pinggul */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Ling Perut (cm)</label>
              <input
                type="number"
                className={inputClass}
                value={currentMeasurements.lingPerut || currentMeasurements.lingkaranPerut || ''}
                onChange={(e) => handleChange('lingPerut', e.target.value)}
                placeholder="0"
              />
            </div>
            <div>
              <label className={labelClass}>Ling Pinggul (cm)</label>
              <input
                type="number"
                className={inputClass}
                value={currentMeasurements.lingPinggul || currentMeasurements.lingkarPinggul || ''}
                onChange={(e) => handleChange('lingPinggul', e.target.value)}
                placeholder="0"
              />
            </div>
          </div>

          {/* Row 4: Kerah & Manset (Optional) */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Kerah (cm)</label>
              <input
                type="number"
                className={inputClass}
                value={currentMeasurements.kerah || ''}
                onChange={(e) => handleChange('kerah', e.target.value)}
                placeholder="0"
              />
            </div>
            <div>
              <label className={labelClass}>Manset (cm)</label>
              <input
                type="number"
                className={inputClass}
                value={currentMeasurements.manset || ''}
                onChange={(e) => handleChange('manset', e.target.value)}
                placeholder="0"
              />
            </div>
          </div>

          {/* Summary */}
          <div className={`mt-3 p-2 rounded-lg text-[9px] ${
            isDarkMode ? 'bg-slate-800' : 'bg-slate-50'
          }`}>
            <div className="text-slate-500 font-bold">
              Ukuran untuk: <span className="text-blue-600">{namaPerSize}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomMeasurementsInput;

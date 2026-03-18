import React, { useState } from 'react';
import { Ruler, ChevronDown, ChevronUp } from 'lucide-react';
import { CustomMeasurements } from '../../types';

interface CustomMeasurementsInputProps {
  namaPerSize: string;
  measurements?: CustomMeasurements;
  onMeasurementsChange: (measurements: CustomMeasurements) => void;
  isDarkMode: boolean;
}

const FIELDS: { key: keyof CustomMeasurements; label: string }[] = [
  { key: 'tinggi',       label: 'Tinggi' },
  { key: 'lebarDada',    label: 'L. Dada' },
  { key: 'lebarBahu',    label: 'L. Bahu' },
  { key: 'panjangLengan',label: 'P. Lengan' },
  { key: 'lingPerut',    label: 'Ling. Perut' },
  { key: 'lingPinggul',  label: 'Ling. Pinggul' },
  { key: 'kerah',        label: 'Kerah' },
  { key: 'manset',       label: 'Manset' },
];

const CustomMeasurementsInput: React.FC<CustomMeasurementsInputProps> = ({
  namaPerSize,
  measurements,
  onMeasurementsChange,
  isDarkMode,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const cur = measurements || {};

  const handleChange = (field: keyof CustomMeasurements, value: string) => {
    onMeasurementsChange({
      ...cur,
      [field]: value === '' ? undefined : parseFloat(value),
    });
  };

  const inputCls = `w-full px-2 py-1.5 rounded-lg text-[10px] font-bold outline-none border focus:ring-1 focus:ring-blue-400/30 ${
    isDarkMode
      ? 'bg-slate-900 border-slate-700 text-white'
      : 'bg-white border-slate-200 text-slate-800'
  }`;

  const labelCls = 'block text-[8px] font-black text-slate-400 uppercase tracking-wider mb-0.5 truncate';

  return (
    <div className={`mt-2 rounded-xl border ${isDarkMode ? 'bg-blue-500/5 border-blue-500/20' : 'bg-blue-50 border-blue-100'}`}>
      {/* Toggle header */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-3 py-2 flex items-center justify-between"
      >
        <div className="flex items-center gap-1.5">
          <Ruler size={12} className="text-blue-500 flex-shrink-0" />
          <span className="text-[9px] font-black text-blue-600 uppercase truncate">
            Ukuran — {namaPerSize}
          </span>
        </div>
        {isExpanded
          ? <ChevronUp size={12} className="text-blue-500 flex-shrink-0" />
          : <ChevronDown size={12} className="text-blue-500 flex-shrink-0" />}
      </button>

      {/* Grid of fields */}
      {isExpanded && (
        <div className="px-3 pb-3 grid grid-cols-2 gap-x-2 gap-y-2">
          {FIELDS.map(({ key, label }) => {
            // Support alias fields
            const val = (cur as any)[key]
              ?? (key === 'panjangLengan' ? cur.lenganPanjang : undefined)
              ?? (key === 'lingPerut' ? cur.lingkaranPerut : undefined)
              ?? (key === 'lingPinggul' ? cur.lingkarPinggul : undefined)
              ?? '';
            return (
              <div key={key}>
                <label className={labelCls}>{label} <span className="normal-case font-normal">(cm)</span></label>
                <input
                  type="number"
                  className={inputCls}
                  value={val === undefined ? '' : val}
                  placeholder="0"
                  min={0}
                  onChange={(e) => handleChange(key, e.target.value)}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CustomMeasurementsInput;

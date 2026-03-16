import React from 'react';
import { JenisBarang, ModelCelana, ModelRompi, JenisSakuRompi } from '../../types';

interface CategoryHeaderProps {
  jenisBarang?: JenisBarang;
  gender?: 'Pria' | 'Wanita';
  tangan?: 'Panjang' | 'Pendek';
  modelCelana?: ModelCelana;
  modelRompi?: ModelRompi;
  onGenderChange?: (value: 'Pria' | 'Wanita') => void;
  onTanganChange?: (value: 'Panjang' | 'Pendek') => void;
  onModelCelanaChange?: (value: ModelCelana) => void;
  onModelRompiChange?: (value: ModelRompi) => void;
  isDarkMode: boolean;
}

const CategoryHeader: React.FC<CategoryHeaderProps> = ({
  jenisBarang,
  gender,
  tangan,
  modelCelana,
  modelRompi,
  onGenderChange,
  onTanganChange,
  onModelCelanaChange,
  onModelRompiChange,
  isDarkMode,
}) => {
  const selectStyle = `w-full px-3 py-2.5 md:px-5 md:py-3.5 rounded-xl md:rounded-2xl text-[10px] md:text-[11px] font-black uppercase outline-none border appearance-none bg-no-repeat bg-[right_0.8rem_center] md:bg-[right_1.2rem_center] ${
    isDarkMode ? 'bg-slate-950 border-slate-700 text-white' : 'bg-white border-slate-100 shadow-sm'
  }`;

  const arrowIcon = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='${
    isDarkMode ? '%23475569' : '%2394a3b8'
  }' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`;

  if (jenisBarang === JenisBarang.KEMEJA || !jenisBarang) {
    return (
      <div className="grid grid-cols-2 gap-2 md:gap-3 mb-3 md:mb-4">
        <div className="flex flex-col gap-1 md:gap-2">
          <label className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 md:ml-2">
            Gender
          </label>
          <select
            className={selectStyle}
            style={{ backgroundImage: arrowIcon }}
            value={gender || 'Pria'}
            onChange={(e) => onGenderChange?.(e.target.value as 'Pria' | 'Wanita')}
          >
            <option value="Pria">Laki-Laki (P)</option>
            <option value="Wanita">Perempuan (W)</option>
          </select>
        </div>

        <div className="flex flex-col gap-1 md:gap-2">
          <label className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 md:ml-2">
            Tangan
          </label>
          <select
            className={selectStyle}
            style={{ backgroundImage: arrowIcon }}
            value={tangan || 'Pendek'}
            onChange={(e) => onTanganChange?.(e.target.value as 'Panjang' | 'Pendek')}
          >
            <option value="Pendek">Pendek (PDK)</option>
            <option value="Panjang">Panjang (PJG)</option>
          </select>
        </div>
      </div>
    );
  } else if (jenisBarang === JenisBarang.CELANA) {
    return (
      <div className="mb-3 md:mb-4">
        <label className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 md:ml-2 block mb-1 md:mb-2">
          Model Celana
        </label>
        <select
          className={selectStyle}
          style={{ backgroundImage: arrowIcon }}
          value={modelCelana || ModelCelana.WARRIOR}
          onChange={(e) => onModelCelanaChange?.(e.target.value as ModelCelana)}
        >
          <option value={ModelCelana.WARRIOR}>{ModelCelana.WARRIOR}</option>
          <option value={ModelCelana.ARMOR}>{ModelCelana.ARMOR}</option>
        </select>
      </div>
    );
  } else if (jenisBarang === JenisBarang.ROMPI) {
    return (
      <div className="mb-3 md:mb-4">
        <label className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 md:ml-2 block mb-1 md:mb-2">
          Model Rompi
        </label>
        <select
          className={selectStyle}
          style={{ backgroundImage: arrowIcon }}
          value={modelRompi || ModelRompi.BUPATI}
          onChange={(e) => onModelRompiChange?.(e.target.value as ModelRompi)}
        >
          <option value={ModelRompi.BUPATI}>{ModelRompi.BUPATI}</option>
          <option value={ModelRompi.CUSTOM}>{ModelRompi.CUSTOM}</option>
        </select>
      </div>
    );
  }

  return null;
};

export default CategoryHeader;

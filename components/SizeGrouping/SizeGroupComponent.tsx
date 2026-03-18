import React from 'react';
import { Plus } from 'lucide-react';
import { SizeGroup, JenisBarang } from '../../types';
import CategoryHeader from './CategoryHeader';
import SizeEntry from './SizeEntry';
import SubtotalDisplay from './SubtotalDisplay';

interface SizeGroupComponentProps {
  group: SizeGroup;
  jenisBarang?: JenisBarang;
  currentUser?: string;
  onUpdateGroup: (updatedGroup: SizeGroup) => void;
  isDarkMode: boolean;
}

const SizeGroupComponent: React.FC<SizeGroupComponentProps> = ({
  group, jenisBarang, currentUser, onUpdateGroup, isDarkMode,
}) => {
  const handleCategoryChange = (field: string, value: any) => {
    onUpdateGroup({ ...group, [field]: value });
  };

  const handleAddSize = () => {
    onUpdateGroup({
      ...group,
      sizes: [...group.sizes, {
        id: `size-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        size: '',
        jumlah: 0,
      }],
    });
  };

  const handleUpdateSize = (idx: number, field: 'size' | 'jumlah' | 'namaPerSize' | 'customMeasurements', value: any) => {
    const updatedSizes = [...group.sizes];
    (updatedSizes[idx] as any)[field] = value;
    onUpdateGroup({ ...group, sizes: updatedSizes });
  };

  const handleDeleteSize = (idx: number) => {
    onUpdateGroup({ ...group, sizes: group.sizes.filter((_, i) => i !== idx) });
  };

  const hasPjColumn = group.sizes.some(s =>
    s.namaPerSize && !s.isCustomSize && !s.customMeasurements
  );

  return (
    <div className={`p-3 md:p-5 rounded-2xl border ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
      <CategoryHeader
        jenisBarang={jenisBarang}
        gender={group.gender}
        tangan={group.tangan}
        modelCelana={group.modelCelana}
        modelRompi={group.modelRompi}
        onGenderChange={(v) => handleCategoryChange('gender', v)}
        onTanganChange={(v) => handleCategoryChange('tangan', v)}
        onModelCelanaChange={(v) => handleCategoryChange('modelCelana', v)}
        onModelRompiChange={(v) => handleCategoryChange('modelRompi', v)}
        isDarkMode={isDarkMode}
      />

      <div className="space-y-2 mb-3">
        {group.sizes.map((sizeItem, idx) => (
          <SizeEntry
            key={sizeItem.id}
            size={sizeItem.size}
            jumlah={sizeItem.jumlah}
            namaPerSize={sizeItem.namaPerSize}
            isCustomSize={sizeItem.isCustomSize}
            customMeasurements={sizeItem.customMeasurements}
            isFirst={idx === 0}
            jenisBarang={jenisBarang}
            hasPjColumn={hasPjColumn}
            currentUser={currentUser}
            onSizeChange={(v) => handleUpdateSize(idx, 'size', v)}
            onJumlahChange={(v) => handleUpdateSize(idx, 'jumlah', v)}
            onNamaPerSizeChange={(v) => handleUpdateSize(idx, 'namaPerSize', v)}
            onCustomMeasurementsChange={(v) => handleUpdateSize(idx, 'customMeasurements', v)}
            onDelete={() => handleDeleteSize(idx)}
            isDarkMode={isDarkMode}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleAddSize(); }}
        className={`w-full py-2 border-2 border-dashed rounded-xl flex items-center justify-center gap-1.5 text-[9px] font-black uppercase transition-all hover:border-emerald-500 hover:text-emerald-500 active:scale-95 mb-3 ${isDarkMode ? 'border-slate-700 text-slate-500' : 'border-slate-200 text-slate-400'}`}
      >
        <Plus size={12} />
        Tambah Size
      </button>

      <SubtotalDisplay group={group} jenisBarang={jenisBarang} isDarkMode={isDarkMode} />
    </div>
  );
};

export default SizeGroupComponent;

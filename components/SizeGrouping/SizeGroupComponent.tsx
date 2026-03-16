import React from 'react';
import { Plus } from 'lucide-react';
import { SizeGroup, JenisBarang } from '../../types';
import CategoryHeader from './CategoryHeader';
import SizeEntry from './SizeEntry';
import SubtotalDisplay from './SubtotalDisplay';

interface SizeGroupComponentProps {
  group: SizeGroup;
  jenisBarang?: JenisBarang;
  onUpdateGroup: (updatedGroup: SizeGroup) => void;
  isDarkMode: boolean;
}

const SizeGroupComponent: React.FC<SizeGroupComponentProps> = ({
  group,
  jenisBarang,
  onUpdateGroup,
  isDarkMode,
}) => {
  const handleCategoryChange = (field: string, value: any) => {
    onUpdateGroup({
      ...group,
      [field]: value,
    });
  };

  const handleAddSize = () => {
    const newSize = {
      id: `size-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
      size: '',
      jumlah: 0,
    };
    onUpdateGroup({
      ...group,
      sizes: [...group.sizes, newSize],
    });
  };

  const handleUpdateSize = (sizeIndex: number, field: 'size' | 'jumlah' | 'customMeasurements', value: any) => {
    const updatedSizes = [...group.sizes];
    if (field === 'jumlah') {
      updatedSizes[sizeIndex].jumlah = value;
    } else if (field === 'customMeasurements') {
      updatedSizes[sizeIndex].customMeasurements = value;
    } else {
      updatedSizes[sizeIndex].size = value;
    }
    onUpdateGroup({
      ...group,
      sizes: updatedSizes,
    });
  };

  const handleDeleteSize = (sizeIndex: number) => {
    const updatedSizes = group.sizes.filter((_, idx) => idx !== sizeIndex);
    onUpdateGroup({
      ...group,
      sizes: updatedSizes,
    });
  };

  return (
    <div
      className={`p-4 md:p-6 rounded-2xl md:rounded-3xl border ${
        isDarkMode
          ? 'bg-slate-900/50 border-slate-800'
          : 'bg-white border-slate-200 shadow-sm'
      }`}
    >
      {/* Category Header */}
      <CategoryHeader
        jenisBarang={jenisBarang}
        gender={group.gender}
        tangan={group.tangan}
        modelCelana={group.modelCelana}
        modelRompi={group.modelRompi}
        onGenderChange={(value) => handleCategoryChange('gender', value)}
        onTanganChange={(value) => handleCategoryChange('tangan', value)}
        onModelCelanaChange={(value) => handleCategoryChange('modelCelana', value)}
        onModelRompiChange={(value) => handleCategoryChange('modelRompi', value)}
        isDarkMode={isDarkMode}
      />

      {/* Size Entries */}
      <div className="space-y-3 md:space-y-4 mb-3 md:mb-4">
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
            onSizeChange={(value) => handleUpdateSize(idx, 'size', value)}
            onJumlahChange={(value) => handleUpdateSize(idx, 'jumlah', value)}
            onCustomMeasurementsChange={(value) => handleUpdateSize(idx, 'customMeasurements', value)}
            onDelete={idx > 0 ? () => handleDeleteSize(idx) : undefined}
            isDarkMode={isDarkMode}
          />
        ))}
      </div>

      {/* Add Size Button */}
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleAddSize();
        }}
        className={`w-full py-2 md:py-3 border-2 border-dashed rounded-xl md:rounded-2xl flex items-center justify-center gap-1.5 md:gap-2 text-[9px] md:text-[10px] font-black uppercase transition-all hover:border-blue-500 hover:text-blue-500 active:scale-95 mb-3 md:mb-4 ${
          isDarkMode ? 'border-slate-700 text-slate-500' : 'border-slate-200 text-slate-400'
        }`}
      >
        <Plus size={12} className="md:hidden" />
        <Plus size={14} className="hidden md:block" />
        Tambah Size
      </button>

      {/* Subtotal Display */}
      <SubtotalDisplay
        group={group}
        jenisBarang={jenisBarang}
        isDarkMode={isDarkMode}
      />
    </div>
  );
};

export default SizeGroupComponent;

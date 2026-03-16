import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { SizeGroup, JenisBarang, ModelCelana, ModelRompi, SizeDetail } from '../../types';
import SizeGroupComponent from './SizeGroupComponent';
import GrandTotalDisplay from './GrandTotalDisplay';
import {
  deserializeSizeDetails,
  serializeSizeGroups,
  calculateGrandTotal,
} from '../../utils/sizeGrouping';

interface SizeGroupingSectionProps {
  jenisBarang?: JenisBarang;
  sizeDetails: SizeDetail[];
  onSizeDetailsChange: (sizeDetails: SizeDetail[]) => void;
  isDarkMode: boolean;
}

const SizeGroupingSection: React.FC<SizeGroupingSectionProps> = ({
  jenisBarang,
  sizeDetails,
  onSizeDetailsChange,
  isDarkMode,
}) => {
  const [sizeGroups, setSizeGroups] = useState<SizeGroup[]>([]);
  const isInternalUpdate = React.useRef(false);

  // Initialize or update from props
  useEffect(() => {
    // Skip if this is an internal update
    if (isInternalUpdate.current) {
      isInternalUpdate.current = false;
      return;
    }

    try {
      const groups = deserializeSizeDetails(sizeDetails, jenisBarang);
      
      if (groups.length === 0) {
        // Initialize with one empty group
        const defaultGroup: SizeGroup = {
          id: `group-${Date.now()}`,
          gender: 'Pria',
          tangan: 'Pendek',
          modelCelana: ModelCelana.WARRIOR,
          modelRompi: ModelRompi.BUPATI,
          sizes: [
            {
              id: `size-${Date.now()}`,
              size: '',
              jumlah: 0,
            },
          ],
        };
        setSizeGroups([defaultGroup]);
      } else {
        setSizeGroups(groups);
      }
    } catch (error) {
      console.error('Error in SizeGroupingSection useEffect:', error);
      // Fallback to default group on error
      const defaultGroup: SizeGroup = {
        id: `group-${Date.now()}`,
        gender: 'Pria',
        tangan: 'Pendek',
        modelCelana: ModelCelana.WARRIOR,
        modelRompi: ModelRompi.BUPATI,
        sizes: [
          {
            id: `size-${Date.now()}`,
            size: '',
            jumlah: 0,
          },
        ],
      };
      setSizeGroups([defaultGroup]);
    }
  }, [sizeDetails, jenisBarang]);

  // Update parent when groups change internally
  const updateParent = React.useCallback((newGroups: SizeGroup[]) => {
    if (newGroups.length > 0) {
      try {
        isInternalUpdate.current = true;
        const serialized = serializeSizeGroups(newGroups, jenisBarang);
        onSizeDetailsChange(serialized);
      } catch (error) {
        console.error('Error updating parent:', error);
        // Don't crash, just log the error
      }
    }
  }, [jenisBarang, onSizeDetailsChange]);

  const handleUpdateGroup = (groupIndex: number, updatedGroup: SizeGroup) => {
    const newGroups = [...sizeGroups];
    
    // Check if this is the last size being removed
    if (updatedGroup.sizes.length === 0) {
      // Remove the entire group
      newGroups.splice(groupIndex, 1);
    } else {
      newGroups[groupIndex] = updatedGroup;
    }
    
    setSizeGroups(newGroups);
    updateParent(newGroups);
  };

  const handleAddNewGroup = () => {
    const newGroup: SizeGroup = {
      id: `group-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      gender: 'Pria',
      tangan: 'Pendek',
      modelCelana: ModelCelana.WARRIOR,
      modelRompi: ModelRompi.BUPATI,
      sizes: [
        {
          id: `size-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          size: '',
          jumlah: 0,
        },
      ],
    };
    
    const newGroups = [...sizeGroups, newGroup];
    setSizeGroups(newGroups);
    updateParent(newGroups);
  };

  const grandTotal = calculateGrandTotal(sizeGroups);

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Size Groups */}
      {sizeGroups.length > 0 ? (
        <div className="space-y-4 md:space-y-6">
          {sizeGroups.map((group, idx) => (
            <SizeGroupComponent
              key={group.id}
              group={group}
              jenisBarang={jenisBarang}
              onUpdateGroup={(updatedGroup) => handleUpdateGroup(idx, updatedGroup)}
              isDarkMode={isDarkMode}
            />
          ))}
        </div>
      ) : (
        <div className="py-8 md:py-12 border-2 border-dashed border-slate-100/20 rounded-2xl md:rounded-[3rem] text-center">
          <p className="text-[9px] md:text-[10px] font-bold text-slate-400 tracking-widest uppercase">
            Belum ada kategori ditambahkan
          </p>
        </div>
      )}

      {/* Add New Category Button */}
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleAddNewGroup();
        }}
        className={`w-full py-4 md:py-6 border-2 border-dashed rounded-xl md:rounded-[2.5rem] flex items-center justify-center gap-2 md:gap-3 text-[10px] md:text-[12px] font-black uppercase transition-all hover:border-[#10b981] hover:text-[#10b981] active:scale-95 ${
          isDarkMode ? 'border-slate-700 text-slate-500' : 'border-slate-200 text-slate-400'
        }`}
      >
        <Plus size={16} className="md:hidden" />
        <Plus size={20} className="hidden md:block" />
        Tambah Kategori Baru
      </button>

      {/* Grand Total Display */}
      {sizeGroups.length > 0 && (
        <GrandTotalDisplay
          groups={sizeGroups}
          jenisBarang={jenisBarang}
          grandTotal={grandTotal}
          isDarkMode={isDarkMode}
        />
      )}
    </div>
  );
};

export default SizeGroupingSection;

import { SizeDetail, SizeGroup, JenisBarang, ModelCelana, ModelRompi } from '../types';

/**
 * Generate a unique grouping key based on jenis barang and category attributes
 */
export function getGroupKey(sd: SizeDetail, jenisBarang?: JenisBarang): string {
  if (jenisBarang === JenisBarang.KEMEJA || !jenisBarang) {
    return `${sd.gender || 'Pria'}_${sd.tangan || 'Pendek'}`;
  } else if (jenisBarang === JenisBarang.CELANA) {
    return `${sd.modelCelana || ModelCelana.WARRIOR}`;
  } else if (jenisBarang === JenisBarang.ROMPI) {
    return `${sd.modelRompi || 'Bupati'}`;
  }
  return 'default';
}

/**
 * Check if two groups have matching category attributes
 */
export function areGroupsEqual(
  group1: SizeGroup,
  group2: SizeGroup,
  jenisBarang?: JenisBarang
): boolean {
  if (jenisBarang === JenisBarang.KEMEJA || !jenisBarang) {
    return group1.gender === group2.gender && group1.tangan === group2.tangan;
  } else if (jenisBarang === JenisBarang.CELANA) {
    return group1.modelCelana === group2.modelCelana;
  } else if (jenisBarang === JenisBarang.ROMPI) {
    return group1.modelRompi === group2.modelRompi;
  }
  return false;
}

/**
 * Get category display name for a group
 */
export function getCategoryDisplayName(
  group: SizeGroup,
  jenisBarang?: JenisBarang
): string {
  if (jenisBarang === JenisBarang.KEMEJA || !jenisBarang) {
    return `Tangan ${group.tangan || 'Pendek'}`;
  } else if (jenisBarang === JenisBarang.CELANA) {
    return group.modelCelana || ModelCelana.WARRIOR;
  } else if (jenisBarang === JenisBarang.ROMPI) {
    return group.modelRompi || 'Bupati';
  }
  return 'Unknown';
}

/**
 * Convert flat SizeDetail[] array to grouped SizeGroup[] structure
 */
export function deserializeSizeDetails(
  sizeDetails: SizeDetail[],
  jenisBarang?: JenisBarang
): SizeGroup[] {
  if (!sizeDetails || sizeDetails.length === 0) {
    return [];
  }

  try {
    const groupMap = new Map<string, SizeGroup>();
    let groupCounter = 0;
    let sizeCounter = 0;

    sizeDetails.forEach((sd) => {
      // Validate sd object
      if (!sd || typeof sd !== 'object') {
        console.warn('Invalid size detail:', sd);
        return;
      }

      const groupKey = getGroupKey(sd, jenisBarang);

      if (!groupMap.has(groupKey)) {
        // Create new group
        const newGroup: SizeGroup = {
          id: `group-${Date.now()}-${groupCounter++}-${Math.random().toString(36).slice(2, 11)}`,
          sizes: [],
          // Copy category attributes with defaults
          gender: sd.gender || 'Pria',
          tangan: sd.tangan || 'Pendek',
          modelCelana: sd.modelCelana,
          modelRompi: sd.modelRompi,
          // Copy shared attributes
          warna: sd.warna,
          model: sd.model,
          sakuType: sd.sakuType,
          sakuColor: sd.sakuColor,
          bahanKemeja: sd.bahanKemeja,
          bahanCelana: sd.bahanCelana,
          jenisSakuRompi: sd.jenisSakuRompi,
        };
        groupMap.set(groupKey, newGroup);
      }

      const group = groupMap.get(groupKey)!;

      // Handle sizes array if present
      if (sd.sizes && Array.isArray(sd.sizes) && sd.sizes.length > 0) {
        sd.sizes.forEach((sizeItem) => {
          // Validate sizeItem
          if (!sizeItem || typeof sizeItem !== 'object') {
            console.warn('Invalid size item:', sizeItem);
            return;
          }

          group.sizes.push({
            id: `size-${Date.now()}-${sizeCounter++}-${Math.random().toString(36).slice(2, 11)}`,
            size: sizeItem.size || '',
            jumlah: sizeItem.jumlah || 0,
            namaPerSize: sizeItem.namaPerSize,
            isCustomSize: sizeItem.isCustomSize || false,
            customMeasurements: sizeItem.customMeasurements || undefined,
          });
        });
      } else {
        // Single size entry
        group.sizes.push({
          id: `size-${Date.now()}-${sizeCounter++}-${Math.random().toString(36).slice(2, 11)}`,
          size: sd.size || '',
          jumlah: sd.jumlah || 0,
          namaPerSize: sd.namaPerSize,
          isCustomSize: sd.isCustomSize || false,
          customMeasurements: sd.customMeasurements || undefined,
        });
      }
    });

    return Array.from(groupMap.values());
  } catch (error) {
    console.error('Error deserializing size details:', error);
    // Return empty array instead of crashing
    return [];
  }
}

/**
 * Convert grouped SizeGroup[] structure to flat SizeDetail[] array
 */
export function serializeSizeGroups(
  groups: SizeGroup[],
  jenisBarang?: JenisBarang
): SizeDetail[] {
  const sizeDetails: SizeDetail[] = [];

  groups.forEach((group) => {
    group.sizes.forEach((sizeItem) => {
      const detail: SizeDetail = {
        size: sizeItem.size,
        jumlah: sizeItem.jumlah,
        gender: group.gender || 'Pria',
        tangan: group.tangan || 'Pendek',
        namaPerSize: sizeItem.namaPerSize,
        isCustomSize: sizeItem.isCustomSize,
        customMeasurements: sizeItem.customMeasurements,
        // Copy shared attributes
        warna: group.warna,
        model: group.model,
        sakuType: group.sakuType,
        sakuColor: group.sakuColor,
        bahanKemeja: group.bahanKemeja,
        modelCelana: group.modelCelana,
        bahanCelana: group.bahanCelana,
        jenisSakuRompi: group.jenisSakuRompi,
        modelRompi: group.modelRompi,
      };
      sizeDetails.push(detail);
    });
  });

  return sizeDetails;
}

/**
 * Calculate subtotal for a group
 */
export function calculateGroupSubtotal(group: SizeGroup): number {
  return group.sizes.reduce((sum, size) => sum + (size.jumlah || 0), 0);
}

/**
 * Calculate grand total across all groups
 */
export function calculateGrandTotal(groups: SizeGroup[]): number {
  return groups.reduce((sum, group) => sum + calculateGroupSubtotal(group), 0);
}

import { SizeDetail, SizeGroup, JenisBarang, ModelCelana, ModelRompi } from '../types';

/**
 * Generate a unique grouping key based on jenis barang and category attributes
 */
export function getGroupKey(sd: SizeDetail, jenisBarang?: JenisBarang): string {
  const sharedValues = [
    (sd.warna || '').trim().toLowerCase(),
    (sd.namaPenjahit || sd.candidateTailorName || '').trim().toLowerCase(),
  ].filter(Boolean);
  const sharedKey = sharedValues.length > 0 ? `${sharedValues.join('_')}_` : '';
  if (jenisBarang === JenisBarang.KEMEJA || !jenisBarang) {
    return `${sharedKey}${sd.gender || 'Pria'}_${sd.tangan || 'Pendek'}`;
  } else if (jenisBarang === JenisBarang.CELANA) {
    return `${sharedKey}${sd.modelCelana || ModelCelana.WARRIOR}`;
  } else if (jenisBarang === JenisBarang.ROMPI) {
    return `${sharedKey}${sd.modelRompi || 'Bupati'}`;
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
    return group1.gender === group2.gender &&
      group1.tangan === group2.tangan &&
      group1.warna === group2.warna &&
      group1.namaPenjahit === group2.namaPenjahit &&
      group1.candidateTailorName === group2.candidateTailorName;
  } else if (jenisBarang === JenisBarang.CELANA) {
    return group1.modelCelana === group2.modelCelana &&
      group1.warna === group2.warna &&
      group1.namaPenjahit === group2.namaPenjahit &&
      group1.candidateTailorName === group2.candidateTailorName;
  } else if (jenisBarang === JenisBarang.ROMPI) {
    return group1.modelRompi === group2.modelRompi &&
      group1.warna === group2.warna &&
      group1.namaPenjahit === group2.namaPenjahit &&
      group1.candidateTailorName === group2.candidateTailorName;
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
    return [group.warna, group.namaPenjahit || group.candidateTailorName, `Tangan ${group.tangan || 'Pendek'}`]
      .filter(Boolean)
      .join(' · ');
  } else if (jenisBarang === JenisBarang.CELANA) {
    return [group.warna, group.namaPenjahit || group.candidateTailorName, group.modelCelana || ModelCelana.WARRIOR]
      .filter(Boolean)
      .join(' · ');
  } else if (jenisBarang === JenisBarang.ROMPI) {
    return [group.warna, group.namaPenjahit || group.candidateTailorName, group.modelRompi || 'Bupati']
      .filter(Boolean)
      .join(' · ');
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
          namaPenjahit: sd.namaPenjahit,
          candidateTailorName: sd.candidateTailorName,
          tailorConfirmationStatus: sd.tailorConfirmationStatus || (sd.candidateTailorName ? 'needs_confirmation' : 'confirmed'),
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
        // Jika ada namaPenjahit dan bukan custom size, masukkan ke namaPerSize
        const namaPerSize = sd.namaPerSize || (!sd.isCustomSize && !sd.customMeasurements ? (sd as any).namaPenjahit : undefined);
        group.sizes.push({
          id: `size-${Date.now()}-${sizeCounter++}-${Math.random().toString(36).slice(2, 11)}`,
          size: sd.size || '',
          jumlah: sd.jumlah || 0,
          namaPerSize,
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
        namaPenjahit: group.namaPenjahit,
        candidateTailorName: group.candidateTailorName,
        tailorConfirmationStatus: group.tailorConfirmationStatus,
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

/**
 * Comprehensive verification for serializeSizeGroups function
 * Validates Requirements 9.3 and 9.2
 * Run with: npx tsx utils/serializeSizeGroups.verify.ts
 */

import {
  serializeSizeGroups,
  deserializeSizeDetails,
} from './sizeGrouping';
import {
  SizeGroup,
  JenisBarang,
  ModelCelana,
  ModelRompi,
  SakuType,
  SakuColor,
  BahanKemeja,
} from '../types';

console.log('=== Testing serializeSizeGroups() ===\n');
console.log('Requirements: 9.3 (Serialize grouped data), 9.2 (Backward compatibility)\n');

// Test 1: Basic serialization - single group with multiple sizes
console.log('Test 1: Convert single group to flat SizeDetail array');
const group1: SizeGroup[] = [
  {
    id: 'group-1',
    gender: 'Pria',
    tangan: 'Pendek',
    warna: 'Putih',
    model: 'Brad V2',
    sizes: [
      { id: 'size-1', size: 'M', jumlah: 5 },
      { id: 'size-2', size: 'L', jumlah: 3 },
    ],
  },
];
const result1 = serializeSizeGroups(group1, JenisBarang.KEMEJA);
console.log('Expected: 2 SizeDetail entries with duplicated category attributes');
console.log('Result:', {
  count: result1.length,
  entry1: { size: result1[0].size, jumlah: result1[0].jumlah, gender: result1[0].gender, tangan: result1[0].tangan },
  entry2: { size: result1[1].size, jumlah: result1[1].jumlah, gender: result1[1].gender, tangan: result1[1].tangan },
});
const pass1 = result1.length === 2 &&
  result1[0].size === 'M' && result1[0].jumlah === 5 &&
  result1[0].gender === 'Pria' && result1[0].tangan === 'Pendek' &&
  result1[1].size === 'L' && result1[1].jumlah === 3 &&
  result1[1].gender === 'Pria' && result1[1].tangan === 'Pendek';
console.log(pass1 ? '✓ PASS\n' : '✗ FAIL\n');

// Test 2: Duplicate category attributes across all sizes
console.log('Test 2: Verify category attributes are duplicated to all sizes');
const group2: SizeGroup[] = [
  {
    id: 'group-1',
    gender: 'Wanita',
    tangan: 'Panjang',
    warna: 'Biru',
    model: 'Brad V3',
    sakuType: SakuType.SKOTLAIT,
    sakuColor: SakuColor.ABU,
    bahanKemeja: BahanKemeja.OXFORD,
    sizes: [
      { id: 'size-1', size: 'S', jumlah: 2 },
      { id: 'size-2', size: 'M', jumlah: 4 },
      { id: 'size-3', size: 'L', jumlah: 1 },
    ],
  },
];
const result2 = serializeSizeGroups(group2, JenisBarang.KEMEJA);
console.log('Expected: All 3 entries have same category and shared attributes');
const allMatch2 = result2.every(detail =>
  detail.gender === 'Wanita' &&
  detail.tangan === 'Panjang' &&
  detail.warna === 'Biru' &&
  detail.model === 'Brad V3' &&
  detail.sakuType === SakuType.SKOTLAIT &&
  detail.sakuColor === SakuColor.ABU &&
  detail.bahanKemeja === BahanKemeja.OXFORD
);
console.log('Result:', {
  count: result2.length,
  allAttributesMatch: allMatch2,
  sample: {
    gender: result2[0].gender,
    tangan: result2[0].tangan,
    warna: result2[0].warna,
    model: result2[0].model,
  },
});
console.log(result2.length === 3 && allMatch2 ? '✓ PASS\n' : '✗ FAIL\n');

// Test 3: Multiple groups
console.log('Test 3: Handle multiple groups correctly');
const group3: SizeGroup[] = [
  {
    id: 'group-1',
    gender: 'Pria',
    tangan: 'Pendek',
    sizes: [{ id: 'size-1', size: 'M', jumlah: 5 }],
  },
  {
    id: 'group-2',
    gender: 'Pria',
    tangan: 'Panjang',
    sizes: [{ id: 'size-2', size: 'L', jumlah: 3 }],
  },
  {
    id: 'group-3',
    gender: 'Wanita',
    tangan: 'Pendek',
    sizes: [{ id: 'size-3', size: 'S', jumlah: 2 }],
  },
];
const result3 = serializeSizeGroups(group3, JenisBarang.KEMEJA);
console.log('Expected: 3 entries with correct category attributes from each group');
console.log('Result:', {
  count: result3.length,
  entry1: { size: result3[0].size, gender: result3[0].gender, tangan: result3[0].tangan },
  entry2: { size: result3[1].size, gender: result3[1].gender, tangan: result3[1].tangan },
  entry3: { size: result3[2].size, gender: result3[2].gender, tangan: result3[2].tangan },
});
const pass3 = result3.length === 3 &&
  result3[0].tangan === 'Pendek' && result3[0].gender === 'Pria' &&
  result3[1].tangan === 'Panjang' && result3[1].gender === 'Pria' &&
  result3[2].tangan === 'Pendek' && result3[2].gender === 'Wanita';
console.log(pass3 ? '✓ PASS\n' : '✗ FAIL\n');

// Test 4: CELANA with modelCelana
console.log('Test 4: Handle CELANA with modelCelana attribute');
const group4: SizeGroup[] = [
  {
    id: 'group-1',
    modelCelana: ModelCelana.WARRIOR,
    warna: 'Hitam',
    sizes: [
      { id: 'size-1', size: 'M', jumlah: 5 },
      { id: 'size-2', size: 'L', jumlah: 3 },
    ],
  },
];
const result4 = serializeSizeGroups(group4, JenisBarang.CELANA);
console.log('Expected: 2 entries with modelCelana=WARRIOR and default gender/tangan');
console.log('Result:', {
  count: result4.length,
  entry1: { size: result4[0].size, modelCelana: result4[0].modelCelana, gender: result4[0].gender, tangan: result4[0].tangan },
  entry2: { size: result4[1].size, modelCelana: result4[1].modelCelana, gender: result4[1].gender, tangan: result4[1].tangan },
});
const pass4 = result4.length === 2 &&
  result4[0].modelCelana === ModelCelana.WARRIOR &&
  result4[1].modelCelana === ModelCelana.WARRIOR &&
  result4[0].gender === 'Pria' && result4[0].tangan === 'Pendek';
console.log(pass4 ? '✓ PASS\n' : '✗ FAIL\n');

// Test 5: ROMPI with modelRompi
console.log('Test 5: Handle ROMPI with modelRompi attribute');
const group5: SizeGroup[] = [
  {
    id: 'group-1',
    modelRompi: ModelRompi.BUPATI,
    sizes: [{ id: 'size-1', size: 'M', jumlah: 5 }],
  },
  {
    id: 'group-2',
    modelRompi: ModelRompi.CUSTOM,
    sizes: [{ id: 'size-2', size: 'L', jumlah: 3 }],
  },
];
const result5 = serializeSizeGroups(group5, JenisBarang.ROMPI);
console.log('Expected: 2 entries with correct modelRompi values');
console.log('Result:', {
  count: result5.length,
  entry1: { size: result5[0].size, modelRompi: result5[0].modelRompi },
  entry2: { size: result5[1].size, modelRompi: result5[1].modelRompi },
});
const pass5 = result5.length === 2 &&
  result5[0].modelRompi === ModelRompi.BUPATI &&
  result5[1].modelRompi === ModelRompi.CUSTOM;
console.log(pass5 ? '✓ PASS\n' : '✗ FAIL\n');

// Test 6: Preserve custom measurements
console.log('Test 6: Preserve custom measurements and namaPerSize');
const group6: SizeGroup[] = [
  {
    id: 'group-1',
    gender: 'Pria',
    tangan: 'Pendek',
    sizes: [
      {
        id: 'size-1',
        size: 'Custom',
        jumlah: 1,
        namaPerSize: 'John Doe',
        isCustomSize: true,
        customMeasurements: {
          tinggi: 170,
          lebarDada: 100,
          lebarBahu: 45,
        },
      },
    ],
  },
];
const result6 = serializeSizeGroups(group6, JenisBarang.KEMEJA);
console.log('Expected: Custom measurements and namaPerSize preserved');
console.log('Result:', {
  namaPerSize: result6[0].namaPerSize,
  isCustomSize: result6[0].isCustomSize,
  customMeasurements: result6[0].customMeasurements,
});
const pass6 = result6[0].namaPerSize === 'John Doe' &&
  result6[0].isCustomSize === true &&
  result6[0].customMeasurements?.tinggi === 170 &&
  result6[0].customMeasurements?.lebarDada === 100;
console.log(pass6 ? '✓ PASS\n' : '✗ FAIL\n');

// Test 7: Empty groups array
console.log('Test 7: Handle empty groups array');
const result7 = serializeSizeGroups([], JenisBarang.KEMEJA);
console.log('Expected: Empty array');
console.log('Result:', result7);
console.log(result7.length === 0 ? '✓ PASS\n' : '✗ FAIL\n');

// Test 8: Group with empty sizes array
console.log('Test 8: Handle group with empty sizes array');
const group8: SizeGroup[] = [
  {
    id: 'group-1',
    gender: 'Pria',
    tangan: 'Pendek',
    sizes: [],
  },
];
const result8 = serializeSizeGroups(group8, JenisBarang.KEMEJA);
console.log('Expected: Empty array (no sizes to serialize)');
console.log('Result:', result8);
console.log(result8.length === 0 ? '✓ PASS\n' : '✗ FAIL\n');

// Test 9: Backward compatibility - SizeDetail interface
console.log('Test 9: Verify backward compatibility with SizeDetail interface');
const group9: SizeGroup[] = [
  {
    id: 'group-1',
    gender: 'Pria',
    tangan: 'Pendek',
    warna: 'Putih',
    model: 'Brad V2',
    sizes: [{ id: 'size-1', size: 'M', jumlah: 5 }],
  },
];
const result9 = serializeSizeGroups(group9, JenisBarang.KEMEJA);
console.log('Expected: Result has all required SizeDetail fields');
const hasRequiredFields = result9[0].size !== undefined &&
  result9[0].jumlah !== undefined &&
  result9[0].gender !== undefined &&
  result9[0].tangan !== undefined;
console.log('Result:', {
  hasSize: result9[0].size !== undefined,
  hasJumlah: result9[0].jumlah !== undefined,
  hasGender: result9[0].gender !== undefined,
  hasTangan: result9[0].tangan !== undefined,
});
console.log(hasRequiredFields ? '✓ PASS\n' : '✗ FAIL\n');

// Test 10: Round-trip preservation (serialize -> deserialize)
console.log('Test 10: Round-trip preservation (Requirement 9.2, 9.3)');
const originalGroups: SizeGroup[] = [
  {
    id: 'group-1',
    gender: 'Pria',
    tangan: 'Pendek',
    warna: 'Putih',
    model: 'Brad V2',
    sizes: [
      { id: 'size-1', size: 'M', jumlah: 5 },
      { id: 'size-2', size: 'L', jumlah: 3 },
    ],
  },
  {
    id: 'group-2',
    gender: 'Pria',
    tangan: 'Panjang',
    warna: 'Putih',
    model: 'Brad V2',
    sizes: [{ id: 'size-3', size: 'XL', jumlah: 2 }],
  },
];
const serialized = serializeSizeGroups(originalGroups, JenisBarang.KEMEJA);
const deserialized = deserializeSizeDetails(serialized, JenisBarang.KEMEJA);
console.log('Expected: Same structure after round-trip');
console.log('Result:', {
  originalGroupCount: originalGroups.length,
  deserializedGroupCount: deserialized.length,
  group1SizesMatch: originalGroups[0].sizes.length === deserialized[0].sizes.length,
  group2SizesMatch: originalGroups[1].sizes.length === deserialized[1].sizes.length,
  categoryAttributesMatch: deserialized[0].gender === 'Pria' &&
    deserialized[0].tangan === 'Pendek' &&
    deserialized[1].tangan === 'Panjang',
});
const pass10 = deserialized.length === 2 &&
  deserialized[0].sizes.length === 2 &&
  deserialized[1].sizes.length === 1 &&
  deserialized[0].gender === 'Pria' &&
  deserialized[0].tangan === 'Pendek' &&
  deserialized[1].tangan === 'Panjang';
console.log(pass10 ? '✓ PASS\n' : '✗ FAIL\n');

console.log('=== All Tests Complete ===');
console.log('\nSummary:');
console.log('✓ Converts grouped SizeGroup[] structure to flat SizeDetail[] array');
console.log('✓ Duplicates category attributes across all sizes in each group');
console.log('✓ Maintains backward compatibility with existing SizeDetail interface');
console.log('✓ Handles KEMEJA, CELANA, and ROMPI correctly');
console.log('✓ Preserves custom measurements and namaPerSize');
console.log('✓ Handles edge cases (empty arrays, empty sizes)');
console.log('✓ Round-trip serialization preserves data structure');

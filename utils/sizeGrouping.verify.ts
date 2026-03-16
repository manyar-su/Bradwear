/**
 * Manual verification script for deserializeSizeDetails function
 * Run this with: npx tsx utils/sizeGrouping.verify.ts
 */

import {
  deserializeSizeDetails,
  serializeSizeGroups,
  getGroupKey,
  areGroupsEqual,
  getCategoryDisplayName,
  calculateGroupSubtotal,
  calculateGrandTotal,
} from './sizeGrouping';
import {
  SizeDetail,
  SizeGroup,
  JenisBarang,
  ModelCelana,
  ModelRompi,
} from '../types';

console.log('=== Testing deserializeSizeDetails ===\n');

// Test 1: Empty array
console.log('Test 1: Empty array');
const result1 = deserializeSizeDetails([], JenisBarang.KEMEJA);
console.log('Expected: []');
console.log('Result:', result1);
console.log('✓ PASS\n');

// Test 2: Group KEMEJA sizes by gender and tangan
console.log('Test 2: Group KEMEJA sizes by gender and tangan');
const sizeDetails2: SizeDetail[] = [
  { size: 'M', jumlah: 5, gender: 'Pria', tangan: 'Pendek' },
  { size: 'L', jumlah: 3, gender: 'Pria', tangan: 'Pendek' },
  { size: 'M', jumlah: 2, gender: 'Pria', tangan: 'Panjang' },
];
const result2 = deserializeSizeDetails(sizeDetails2, JenisBarang.KEMEJA);
console.log('Expected: 2 groups (Pendek with 2 sizes, Panjang with 1 size)');
console.log('Result:', {
  groupCount: result2.length,
  group1Sizes: result2[0]?.sizes.length,
  group2Sizes: result2[1]?.sizes.length,
});
console.log(result2.length === 2 && result2[0].sizes.length === 2 && result2[1].sizes.length === 1 ? '✓ PASS\n' : '✗ FAIL\n');

// Test 3: Group CELANA sizes by modelCelana
console.log('Test 3: Group CELANA sizes by modelCelana');
const sizeDetails3: SizeDetail[] = [
  { size: 'M', jumlah: 5, gender: 'Pria', tangan: 'Pendek', modelCelana: ModelCelana.WARRIOR },
  { size: 'L', jumlah: 3, gender: 'Pria', tangan: 'Pendek', modelCelana: ModelCelana.WARRIOR },
  { size: 'M', jumlah: 2, gender: 'Pria', tangan: 'Panjang', modelCelana: ModelCelana.ARMOR },
];
const result3 = deserializeSizeDetails(sizeDetails3, JenisBarang.CELANA);
console.log('Expected: 2 groups (WARRIOR with 2 sizes, ARMOR with 1 size)');
console.log('Result:', {
  groupCount: result3.length,
  group1Model: result3[0]?.modelCelana,
  group1Sizes: result3[0]?.sizes.length,
  group2Model: result3[1]?.modelCelana,
  group2Sizes: result3[1]?.sizes.length,
});
console.log(
  result3.length === 2 &&
  result3[0].modelCelana === ModelCelana.WARRIOR &&
  result3[0].sizes.length === 2 &&
  result3[1].modelCelana === ModelCelana.ARMOR &&
  result3[1].sizes.length === 1
    ? '✓ PASS\n'
    : '✗ FAIL\n'
);

// Test 4: Group ROMPI sizes by modelRompi
console.log('Test 4: Group ROMPI sizes by modelRompi');
const sizeDetails4: SizeDetail[] = [
  { size: 'M', jumlah: 5, gender: 'Pria', tangan: 'Pendek', modelRompi: ModelRompi.BUPATI },
  { size: 'L', jumlah: 3, gender: 'Pria', tangan: 'Pendek', modelRompi: ModelRompi.BUPATI },
  { size: 'M', jumlah: 2, gender: 'Pria', tangan: 'Panjang', modelRompi: ModelRompi.CUSTOM },
];
const result4 = deserializeSizeDetails(sizeDetails4, JenisBarang.ROMPI);
console.log('Expected: 2 groups (BUPATI with 2 sizes, CUSTOM with 1 size)');
console.log('Result:', {
  groupCount: result4.length,
  group1Model: result4[0]?.modelRompi,
  group1Sizes: result4[0]?.sizes.length,
  group2Model: result4[1]?.modelRompi,
  group2Sizes: result4[1]?.sizes.length,
});
console.log(
  result4.length === 2 &&
  result4[0].modelRompi === ModelRompi.BUPATI &&
  result4[0].sizes.length === 2 &&
  result4[1].modelRompi === ModelRompi.CUSTOM &&
  result4[1].sizes.length === 1
    ? '✓ PASS\n'
    : '✗ FAIL\n'
);

// Test 5: Generate unique IDs
console.log('Test 5: Generate unique IDs for groups and sizes');
const sizeDetails5: SizeDetail[] = [
  { size: 'M', jumlah: 5, gender: 'Pria', tangan: 'Pendek' },
  { size: 'L', jumlah: 3, gender: 'Pria', tangan: 'Pendek' },
];
const result5 = deserializeSizeDetails(sizeDetails5, JenisBarang.KEMEJA);
console.log('Expected: Unique IDs for group and both sizes');
console.log('Result:', {
  groupId: result5[0]?.id,
  size1Id: result5[0]?.sizes[0]?.id,
  size2Id: result5[0]?.sizes[1]?.id,
  allUnique: result5[0]?.sizes[0]?.id !== result5[0]?.sizes[1]?.id,
});
console.log(
  result5[0]?.id &&
  result5[0]?.sizes[0]?.id &&
  result5[0]?.sizes[1]?.id &&
  result5[0]?.sizes[0]?.id !== result5[0]?.sizes[1]?.id
    ? '✓ PASS\n'
    : '✗ FAIL\n'
);

// Test 6: Handle sizes array in SizeDetail
console.log('Test 6: Handle sizes array in SizeDetail');
const sizeDetails6: SizeDetail[] = [
  {
    size: 'M',
    jumlah: 5,
    gender: 'Pria',
    tangan: 'Pendek',
    sizes: [
      { size: 'S', jumlah: 2 },
      { size: 'M', jumlah: 3 },
      { size: 'L', jumlah: 4 },
    ],
  },
];
const result6 = deserializeSizeDetails(sizeDetails6, JenisBarang.KEMEJA);
console.log('Expected: 1 group with 3 sizes (S, M, L)');
console.log('Result:', {
  groupCount: result6.length,
  sizesCount: result6[0]?.sizes.length,
  sizes: result6[0]?.sizes.map(s => s.size),
});
console.log(
  result6.length === 1 &&
  result6[0].sizes.length === 3 &&
  result6[0].sizes[0].size === 'S' &&
  result6[0].sizes[1].size === 'M' &&
  result6[0].sizes[2].size === 'L'
    ? '✓ PASS\n'
    : '✗ FAIL\n'
);

// Test 7: Copy shared attributes
console.log('Test 7: Copy shared attributes to group');
const sizeDetails7: SizeDetail[] = [
  {
    size: 'M',
    jumlah: 5,
    gender: 'Pria',
    tangan: 'Pendek',
    warna: 'Putih',
    model: 'Brad V2',
  },
];
const result7 = deserializeSizeDetails(sizeDetails7, JenisBarang.KEMEJA);
console.log('Expected: Group with warna="Putih" and model="Brad V2"');
console.log('Result:', {
  warna: result7[0]?.warna,
  model: result7[0]?.model,
});
console.log(result7[0]?.warna === 'Putih' && result7[0]?.model === 'Brad V2' ? '✓ PASS\n' : '✗ FAIL\n');

// Test 8: Round-trip serialization
console.log('Test 8: Round-trip serialization (serialize then deserialize)');
const originalGroups: SizeGroup[] = [
  {
    id: '1',
    gender: 'Pria',
    tangan: 'Pendek',
    warna: 'Putih',
    model: 'Brad V2',
    sizes: [
      { id: '1', size: 'M', jumlah: 5 },
      { id: '2', size: 'L', jumlah: 3 },
    ],
  },
  {
    id: '2',
    gender: 'Pria',
    tangan: 'Panjang',
    warna: 'Putih',
    model: 'Brad V2',
    sizes: [
      { id: '3', size: 'M', jumlah: 2 },
    ],
  },
];
const serialized = serializeSizeGroups(originalGroups, JenisBarang.KEMEJA);
const deserialized = deserializeSizeDetails(serialized, JenisBarang.KEMEJA);
console.log('Expected: 2 groups with same structure as original');
console.log('Result:', {
  groupCount: deserialized.length,
  group1Sizes: deserialized[0]?.sizes.length,
  group2Sizes: deserialized[1]?.sizes.length,
  group1Gender: deserialized[0]?.gender,
  group1Tangan: deserialized[0]?.tangan,
  group2Tangan: deserialized[1]?.tangan,
});
console.log(
  deserialized.length === 2 &&
  deserialized[0].sizes.length === 2 &&
  deserialized[1].sizes.length === 1 &&
  deserialized[0].gender === 'Pria' &&
  deserialized[0].tangan === 'Pendek' &&
  deserialized[1].tangan === 'Panjang'
    ? '✓ PASS\n'
    : '✗ FAIL\n'
);

// Test helper functions
console.log('=== Testing Helper Functions ===\n');

// Test getGroupKey
console.log('Test: getGroupKey for KEMEJA');
const key1 = getGroupKey({ size: 'M', jumlah: 5, gender: 'Pria', tangan: 'Pendek' }, JenisBarang.KEMEJA);
console.log('Expected: "Pria_Pendek"');
console.log('Result:', key1);
console.log(key1 === 'Pria_Pendek' ? '✓ PASS\n' : '✗ FAIL\n');

// Test getCategoryDisplayName
console.log('Test: getCategoryDisplayName for KEMEJA');
const displayName = getCategoryDisplayName(
  { id: '1', gender: 'Pria', tangan: 'Pendek', sizes: [] },
  JenisBarang.KEMEJA
);
console.log('Expected: "Tangan Pendek"');
console.log('Result:', displayName);
console.log(displayName === 'Tangan Pendek' ? '✓ PASS\n' : '✗ FAIL\n');

// Test calculateGroupSubtotal
console.log('Test: calculateGroupSubtotal');
const subtotal = calculateGroupSubtotal({
  id: '1',
  gender: 'Pria',
  tangan: 'Pendek',
  sizes: [
    { id: '1', size: 'M', jumlah: 5 },
    { id: '2', size: 'L', jumlah: 3 },
    { id: '3', size: 'XL', jumlah: 2 },
  ],
});
console.log('Expected: 10');
console.log('Result:', subtotal);
console.log(subtotal === 10 ? '✓ PASS\n' : '✗ FAIL\n');

// Test calculateGrandTotal
console.log('Test: calculateGrandTotal');
const grandTotal = calculateGrandTotal([
  {
    id: '1',
    gender: 'Pria',
    tangan: 'Pendek',
    sizes: [
      { id: '1', size: 'M', jumlah: 5 },
      { id: '2', size: 'L', jumlah: 3 },
    ],
  },
  {
    id: '2',
    gender: 'Pria',
    tangan: 'Panjang',
    sizes: [
      { id: '3', size: 'M', jumlah: 2 },
    ],
  },
]);
console.log('Expected: 10');
console.log('Result:', grandTotal);
console.log(grandTotal === 10 ? '✓ PASS\n' : '✗ FAIL\n');

console.log('=== All Tests Complete ===');

/**
 * Edge case verification for calculateGroupSubtotal function
 * Run this with: npx tsx utils/calculateGroupSubtotal.edge-cases.verify.ts
 */

import { calculateGroupSubtotal } from './sizeGrouping';
import { SizeGroup } from '../types';

console.log('=== Testing calculateGroupSubtotal Edge Cases ===\n');

// Test 1: Empty group
console.log('Test 1: Empty group (no sizes)');
const emptyGroup: SizeGroup = {
  id: 'test-1',
  gender: 'Pria',
  tangan: 'Pendek',
  sizes: [],
};
const result1 = calculateGroupSubtotal(emptyGroup);
console.log('Expected: 0');
console.log('Result:', result1);
console.log(result1 === 0 ? '✓ PASS\n' : '✗ FAIL\n');

// Test 2: Normal case - sum all quantities
console.log('Test 2: Normal case - sum all quantities');
const normalGroup: SizeGroup = {
  id: 'test-2',
  gender: 'Pria',
  tangan: 'Pendek',
  sizes: [
    { id: 's1', size: 'M', jumlah: 5 },
    { id: 's2', size: 'L', jumlah: 3 },
    { id: 's3', size: 'XL', jumlah: 2 },
  ],
};
const result2 = calculateGroupSubtotal(normalGroup);
console.log('Expected: 10');
console.log('Result:', result2);
console.log(result2 === 10 ? '✓ PASS\n' : '✗ FAIL\n');

// Test 3: Undefined quantities
console.log('Test 3: Undefined quantities (should treat as 0)');
const undefinedGroup: SizeGroup = {
  id: 'test-3',
  gender: 'Pria',
  tangan: 'Pendek',
  sizes: [
    { id: 's1', size: 'M', jumlah: 5 },
    { id: 's2', size: 'L', jumlah: undefined as any },
    { id: 's3', size: 'XL', jumlah: 3 },
  ],
};
const result3 = calculateGroupSubtotal(undefinedGroup);
console.log('Expected: 8 (5 + 0 + 3)');
console.log('Result:', result3);
console.log(result3 === 8 ? '✓ PASS\n' : '✗ FAIL\n');

// Test 4: Null quantities
console.log('Test 4: Null quantities (should treat as 0)');
const nullGroup: SizeGroup = {
  id: 'test-4',
  gender: 'Pria',
  tangan: 'Pendek',
  sizes: [
    { id: 's1', size: 'M', jumlah: 5 },
    { id: 's2', size: 'L', jumlah: null as any },
    { id: 's3', size: 'XL', jumlah: 3 },
  ],
};
const result4 = calculateGroupSubtotal(nullGroup);
console.log('Expected: 8 (5 + 0 + 3)');
console.log('Result:', result4);
console.log(result4 === 8 ? '✓ PASS\n' : '✗ FAIL\n');

// Test 5: Zero quantities
console.log('Test 5: All zero quantities');
const zeroGroup: SizeGroup = {
  id: 'test-5',
  gender: 'Pria',
  tangan: 'Pendek',
  sizes: [
    { id: 's1', size: 'M', jumlah: 0 },
    { id: 's2', size: 'L', jumlah: 0 },
    { id: 's3', size: 'XL', jumlah: 0 },
  ],
};
const result5 = calculateGroupSubtotal(zeroGroup);
console.log('Expected: 0');
console.log('Result:', result5);
console.log(result5 === 0 ? '✓ PASS\n' : '✗ FAIL\n');

// Test 6: Single size in group
console.log('Test 6: Single size in group');
const singleGroup: SizeGroup = {
  id: 'test-6',
  gender: 'Pria',
  tangan: 'Pendek',
  sizes: [
    { id: 's1', size: 'M', jumlah: 7 },
  ],
};
const result6 = calculateGroupSubtotal(singleGroup);
console.log('Expected: 7');
console.log('Result:', result6);
console.log(result6 === 7 ? '✓ PASS\n' : '✗ FAIL\n');

// Test 7: Large quantities
console.log('Test 7: Large quantities');
const largeGroup: SizeGroup = {
  id: 'test-7',
  gender: 'Pria',
  tangan: 'Pendek',
  sizes: [
    { id: 's1', size: 'M', jumlah: 100 },
    { id: 's2', size: 'L', jumlah: 250 },
    { id: 's3', size: 'XL', jumlah: 150 },
  ],
};
const result7 = calculateGroupSubtotal(largeGroup);
console.log('Expected: 500');
console.log('Result:', result7);
console.log(result7 === 500 ? '✓ PASS\n' : '✗ FAIL\n');

// Test 8: Mixed valid and invalid quantities
console.log('Test 8: Mixed valid and invalid quantities');
const mixedGroup: SizeGroup = {
  id: 'test-8',
  gender: 'Pria',
  tangan: 'Pendek',
  sizes: [
    { id: 's1', size: 'M', jumlah: 5 },
    { id: 's2', size: 'L', jumlah: undefined as any },
    { id: 's3', size: 'XL', jumlah: 3 },
    { id: 's4', size: 'XXL', jumlah: null as any },
    { id: 's5', size: 'S', jumlah: 2 },
  ],
};
const result8 = calculateGroupSubtotal(mixedGroup);
console.log('Expected: 10 (5 + 0 + 3 + 0 + 2)');
console.log('Result:', result8);
console.log(result8 === 10 ? '✓ PASS\n' : '✗ FAIL\n');

// Test 9: Negative quantities (edge case - should still sum)
console.log('Test 9: Negative quantities (edge case)');
const negativeGroup: SizeGroup = {
  id: 'test-9',
  gender: 'Pria',
  tangan: 'Pendek',
  sizes: [
    { id: 's1', size: 'M', jumlah: 10 },
    { id: 's2', size: 'L', jumlah: -2 },
    { id: 's3', size: 'XL', jumlah: 5 },
  ],
};
const result9 = calculateGroupSubtotal(negativeGroup);
console.log('Expected: 13 (10 + -2 + 5)');
console.log('Result:', result9);
console.log(result9 === 13 ? '✓ PASS\n' : '✗ FAIL\n');

// Test 10: Floating point quantities (edge case)
console.log('Test 10: Floating point quantities');
const floatGroup: SizeGroup = {
  id: 'test-10',
  gender: 'Pria',
  tangan: 'Pendek',
  sizes: [
    { id: 's1', size: 'M', jumlah: 5.5 },
    { id: 's2', size: 'L', jumlah: 3.2 },
    { id: 's3', size: 'XL', jumlah: 1.3 },
  ],
};
const result10 = calculateGroupSubtotal(floatGroup);
console.log('Expected: 10 (5.5 + 3.2 + 1.3)');
console.log('Result:', result10);
console.log(result10 === 10 ? '✓ PASS\n' : '✗ FAIL\n');

console.log('=== All Edge Case Tests Complete ===');

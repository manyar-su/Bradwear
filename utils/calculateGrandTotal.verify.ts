/**
 * Manual verification script for calculateGrandTotal function
 * Run this with: npx tsx utils/calculateGrandTotal.verify.ts
 */

import { calculateGrandTotal } from './sizeGrouping';
import { SizeGroup } from '../types';

console.log('=== Testing calculateGrandTotal ===\n');

// Test 1: Empty groups array
console.log('Test 1: Empty groups array');
const result1 = calculateGrandTotal([]);
console.log('Expected: 0');
console.log('Result:', result1);
console.log(result1 === 0 ? '✓ PASS\n' : '✗ FAIL\n');

// Test 2: Single group with multiple sizes
console.log('Test 2: Single group with multiple sizes');
const groups2: SizeGroup[] = [
  {
    id: 'group-1',
    gender: 'Pria',
    tangan: 'Pendek',
    sizes: [
      { id: 's1', size: 'M', jumlah: 5 },
      { id: 's2', size: 'L', jumlah: 3 },
    ],
  },
];
const result2 = calculateGrandTotal(groups2);
console.log('Expected: 8 (5 + 3)');
console.log('Result:', result2);
console.log(result2 === 8 ? '✓ PASS\n' : '✗ FAIL\n');

// Test 3: Multiple groups with multiple sizes each
console.log('Test 3: Multiple groups with multiple sizes each');
const groups3: SizeGroup[] = [
  {
    id: 'group-1',
    gender: 'Pria',
    tangan: 'Pendek',
    sizes: [
      { id: 's1', size: 'M', jumlah: 5 },
      { id: 's2', size: 'L', jumlah: 3 },
    ],
  },
  {
    id: 'group-2',
    gender: 'Pria',
    tangan: 'Panjang',
    sizes: [
      { id: 's3', size: 'M', jumlah: 2 },
      { id: 's4', size: 'XL', jumlah: 4 },
    ],
  },
  {
    id: 'group-3',
    gender: 'Wanita',
    tangan: 'Pendek',
    sizes: [
      { id: 's5', size: 'S', jumlah: 6 },
    ],
  },
];
const result3 = calculateGrandTotal(groups3);
console.log('Expected: 20 (8 + 6 + 6)');
console.log('Result:', result3);
console.log(result3 === 20 ? '✓ PASS\n' : '✗ FAIL\n');

// Test 4: Groups with empty sizes arrays
console.log('Test 4: Groups with empty sizes arrays');
const groups4: SizeGroup[] = [
  {
    id: 'group-1',
    gender: 'Pria',
    tangan: 'Pendek',
    sizes: [],
  },
  {
    id: 'group-2',
    gender: 'Pria',
    tangan: 'Panjang',
    sizes: [
      { id: 's1', size: 'M', jumlah: 5 },
    ],
  },
];
const result4 = calculateGrandTotal(groups4);
console.log('Expected: 5 (0 + 5)');
console.log('Result:', result4);
console.log(result4 === 5 ? '✓ PASS\n' : '✗ FAIL\n');

// Test 5: Groups with zero quantities
console.log('Test 5: Groups with zero quantities');
const groups5: SizeGroup[] = [
  {
    id: 'group-1',
    gender: 'Pria',
    tangan: 'Pendek',
    sizes: [
      { id: 's1', size: 'M', jumlah: 0 },
      { id: 's2', size: 'L', jumlah: 0 },
    ],
  },
  {
    id: 'group-2',
    gender: 'Pria',
    tangan: 'Panjang',
    sizes: [
      { id: 's3', size: 'M', jumlah: 5 },
    ],
  },
];
const result5 = calculateGrandTotal(groups5);
console.log('Expected: 5 (0 + 5)');
console.log('Result:', result5);
console.log(result5 === 5 ? '✓ PASS\n' : '✗ FAIL\n');

// Test 6: Groups with undefined quantities
console.log('Test 6: Groups with undefined quantities');
const groups6: SizeGroup[] = [
  {
    id: 'group-1',
    gender: 'Pria',
    tangan: 'Pendek',
    sizes: [
      { id: 's1', size: 'M', jumlah: 5 },
      { id: 's2', size: 'L', jumlah: undefined as any },
    ],
  },
  {
    id: 'group-2',
    gender: 'Pria',
    tangan: 'Panjang',
    sizes: [
      { id: 's3', size: 'M', jumlah: 3 },
    ],
  },
];
const result6 = calculateGrandTotal(groups6);
console.log('Expected: 8 (5 + 0 + 3)');
console.log('Result:', result6);
console.log(result6 === 8 ? '✓ PASS\n' : '✗ FAIL\n');

// Test 7: Groups with null quantities
console.log('Test 7: Groups with null quantities');
const groups7: SizeGroup[] = [
  {
    id: 'group-1',
    gender: 'Pria',
    tangan: 'Pendek',
    sizes: [
      { id: 's1', size: 'M', jumlah: 5 },
      { id: 's2', size: 'L', jumlah: null as any },
    ],
  },
  {
    id: 'group-2',
    gender: 'Pria',
    tangan: 'Panjang',
    sizes: [
      { id: 's3', size: 'M', jumlah: 3 },
    ],
  },
];
const result7 = calculateGrandTotal(groups7);
console.log('Expected: 8 (5 + 0 + 3)');
console.log('Result:', result7);
console.log(result7 === 8 ? '✓ PASS\n' : '✗ FAIL\n');

// Test 8: Large quantities across multiple groups
console.log('Test 8: Large quantities across multiple groups');
const groups8: SizeGroup[] = [
  {
    id: 'group-1',
    gender: 'Pria',
    tangan: 'Pendek',
    sizes: [
      { id: 's1', size: 'M', jumlah: 100 },
      { id: 's2', size: 'L', jumlah: 150 },
    ],
  },
  {
    id: 'group-2',
    gender: 'Pria',
    tangan: 'Panjang',
    sizes: [
      { id: 's3', size: 'M', jumlah: 200 },
      { id: 's4', size: 'XL', jumlah: 50 },
    ],
  },
];
const result8 = calculateGrandTotal(groups8);
console.log('Expected: 500 (250 + 250)');
console.log('Result:', result8);
console.log(result8 === 500 ? '✓ PASS\n' : '✗ FAIL\n');

// Test 9: Mixed valid and invalid quantities across groups
console.log('Test 9: Mixed valid and invalid quantities across groups');
const groups9: SizeGroup[] = [
  {
    id: 'group-1',
    gender: 'Pria',
    tangan: 'Pendek',
    sizes: [
      { id: 's1', size: 'M', jumlah: 5 },
      { id: 's2', size: 'L', jumlah: undefined as any },
    ],
  },
  {
    id: 'group-2',
    gender: 'Pria',
    tangan: 'Panjang',
    sizes: [
      { id: 's3', size: 'M', jumlah: null as any },
      { id: 's4', size: 'XL', jumlah: 3 },
    ],
  },
  {
    id: 'group-3',
    gender: 'Wanita',
    tangan: 'Pendek',
    sizes: [
      { id: 's5', size: 'S', jumlah: 2 },
    ],
  },
];
const result9 = calculateGrandTotal(groups9);
console.log('Expected: 10 (5 + 3 + 2)');
console.log('Result:', result9);
console.log(result9 === 10 ? '✓ PASS\n' : '✗ FAIL\n');

// Test 10: Many groups with varying sizes
console.log('Test 10: Many groups with varying sizes');
const groups10: SizeGroup[] = [
  {
    id: 'group-1',
    gender: 'Pria',
    tangan: 'Pendek',
    sizes: [
      { id: 's1', size: 'M', jumlah: 1 },
    ],
  },
  {
    id: 'group-2',
    gender: 'Pria',
    tangan: 'Panjang',
    sizes: [
      { id: 's2', size: 'L', jumlah: 2 },
      { id: 's3', size: 'XL', jumlah: 3 },
    ],
  },
  {
    id: 'group-3',
    gender: 'Wanita',
    tangan: 'Pendek',
    sizes: [
      { id: 's4', size: 'S', jumlah: 4 },
      { id: 's5', size: 'M', jumlah: 5 },
      { id: 's6', size: 'L', jumlah: 6 },
    ],
  },
];
const result10 = calculateGrandTotal(groups10);
console.log('Expected: 21 (1 + 5 + 15)');
console.log('Result:', result10);
console.log(result10 === 21 ? '✓ PASS\n' : '✗ FAIL\n');

// Test 11: Verify it uses calculateGroupSubtotal correctly
console.log('Test 11: Verify grand total equals sum of all group subtotals');
const groups11: SizeGroup[] = [
  {
    id: 'group-1',
    gender: 'Pria',
    tangan: 'Pendek',
    sizes: [
      { id: 's1', size: 'M', jumlah: 10 },
      { id: 's2', size: 'L', jumlah: 20 },
    ],
  },
  {
    id: 'group-2',
    gender: 'Pria',
    tangan: 'Panjang',
    sizes: [
      { id: 's3', size: 'M', jumlah: 30 },
    ],
  },
];
const result11 = calculateGrandTotal(groups11);
const expectedSubtotal1 = 10 + 20; // 30
const expectedSubtotal2 = 30; // 30
const expectedGrandTotal = expectedSubtotal1 + expectedSubtotal2; // 60
console.log('Expected: 60 (30 + 30)');
console.log('Result:', result11);
console.log(result11 === expectedGrandTotal ? '✓ PASS\n' : '✗ FAIL\n');

console.log('=== All Tests Complete ===');

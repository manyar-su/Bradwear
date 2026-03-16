/**
 * Unit tests for calculateGrandTotal function
 * Tests edge cases: empty groups array, groups with no sizes, mixed quantities
 */

import { calculateGrandTotal } from './sizeGrouping';
import { SizeGroup } from '../types';

describe('calculateGrandTotal', () => {
  it('should return 0 for empty groups array', () => {
    expect(calculateGrandTotal([])).toBe(0);
  });

  it('should sum all subtotals across all groups', () => {
    const groups: SizeGroup[] = [
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
    // Group 1: 5 + 3 = 8
    // Group 2: 2 + 4 = 6
    // Group 3: 6
    // Total: 8 + 6 + 6 = 20
    expect(calculateGrandTotal(groups)).toBe(20);
  });

  it('should handle single group', () => {
    const groups: SizeGroup[] = [
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
    expect(calculateGrandTotal(groups)).toBe(8);
  });

  it('should handle groups with empty sizes arrays', () => {
    const groups: SizeGroup[] = [
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
    expect(calculateGrandTotal(groups)).toBe(5);
  });

  it('should handle groups with zero quantities', () => {
    const groups: SizeGroup[] = [
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
    expect(calculateGrandTotal(groups)).toBe(5);
  });

  it('should handle undefined quantities as 0', () => {
    const groups: SizeGroup[] = [
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
    expect(calculateGrandTotal(groups)).toBe(8);
  });

  it('should handle null quantities as 0', () => {
    const groups: SizeGroup[] = [
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
    expect(calculateGrandTotal(groups)).toBe(8);
  });

  it('should handle large quantities across multiple groups', () => {
    const groups: SizeGroup[] = [
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
    // Group 1: 100 + 150 = 250
    // Group 2: 200 + 50 = 250
    // Total: 500
    expect(calculateGrandTotal(groups)).toBe(500);
  });

  it('should handle mixed valid and invalid quantities across groups', () => {
    const groups: SizeGroup[] = [
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
    // Group 1: 5 + 0 = 5
    // Group 2: 0 + 3 = 3
    // Group 3: 2
    // Total: 10
    expect(calculateGrandTotal(groups)).toBe(10);
  });

  it('should handle groups with single size each', () => {
    const groups: SizeGroup[] = [
      {
        id: 'group-1',
        gender: 'Pria',
        tangan: 'Pendek',
        sizes: [
          { id: 's1', size: 'M', jumlah: 5 },
        ],
      },
      {
        id: 'group-2',
        gender: 'Pria',
        tangan: 'Panjang',
        sizes: [
          { id: 's2', size: 'L', jumlah: 3 },
        ],
      },
      {
        id: 'group-3',
        gender: 'Wanita',
        tangan: 'Pendek',
        sizes: [
          { id: 's3', size: 'S', jumlah: 2 },
        ],
      },
    ];
    expect(calculateGrandTotal(groups)).toBe(10);
  });

  it('should handle many groups with varying sizes', () => {
    const groups: SizeGroup[] = [
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
    // Group 1: 1
    // Group 2: 2 + 3 = 5
    // Group 3: 4 + 5 + 6 = 15
    // Total: 21
    expect(calculateGrandTotal(groups)).toBe(21);
  });
});

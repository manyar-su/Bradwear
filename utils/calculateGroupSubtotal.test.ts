/**
 * Unit tests for calculateGroupSubtotal function
 * Tests edge cases: empty groups, undefined/null quantities
 */

import { calculateGroupSubtotal } from './sizeGrouping';
import { SizeGroup } from '../types';

describe('calculateGroupSubtotal', () => {
  it('should return 0 for empty group', () => {
    const emptyGroup: SizeGroup = {
      id: 'test-1',
      gender: 'Pria',
      tangan: 'Pendek',
      sizes: [],
    };
    expect(calculateGroupSubtotal(emptyGroup)).toBe(0);
  });

  it('should sum all quantities in a group', () => {
    const group: SizeGroup = {
      id: 'test-2',
      gender: 'Pria',
      tangan: 'Pendek',
      sizes: [
        { id: 's1', size: 'M', jumlah: 5 },
        { id: 's2', size: 'L', jumlah: 3 },
        { id: 's3', size: 'XL', jumlah: 2 },
      ],
    };
    expect(calculateGroupSubtotal(group)).toBe(10);
  });

  it('should handle undefined quantities as 0', () => {
    const group: SizeGroup = {
      id: 'test-3',
      gender: 'Pria',
      tangan: 'Pendek',
      sizes: [
        { id: 's1', size: 'M', jumlah: 5 },
        { id: 's2', size: 'L', jumlah: undefined as any },
        { id: 's3', size: 'XL', jumlah: 3 },
      ],
    };
    expect(calculateGroupSubtotal(group)).toBe(8);
  });

  it('should handle null quantities as 0', () => {
    const group: SizeGroup = {
      id: 'test-4',
      gender: 'Pria',
      tangan: 'Pendek',
      sizes: [
        { id: 's1', size: 'M', jumlah: 5 },
        { id: 's2', size: 'L', jumlah: null as any },
        { id: 's3', size: 'XL', jumlah: 3 },
      ],
    };
    expect(calculateGroupSubtotal(group)).toBe(8);
  });

  it('should handle zero quantities', () => {
    const group: SizeGroup = {
      id: 'test-5',
      gender: 'Pria',
      tangan: 'Pendek',
      sizes: [
        { id: 's1', size: 'M', jumlah: 0 },
        { id: 's2', size: 'L', jumlah: 0 },
        { id: 's3', size: 'XL', jumlah: 0 },
      ],
    };
    expect(calculateGroupSubtotal(group)).toBe(0);
  });

  it('should handle single size in group', () => {
    const group: SizeGroup = {
      id: 'test-6',
      gender: 'Pria',
      tangan: 'Pendek',
      sizes: [
        { id: 's1', size: 'M', jumlah: 7 },
      ],
    };
    expect(calculateGroupSubtotal(group)).toBe(7);
  });

  it('should handle large quantities', () => {
    const group: SizeGroup = {
      id: 'test-7',
      gender: 'Pria',
      tangan: 'Pendek',
      sizes: [
        { id: 's1', size: 'M', jumlah: 100 },
        { id: 's2', size: 'L', jumlah: 250 },
        { id: 's3', size: 'XL', jumlah: 150 },
      ],
    };
    expect(calculateGroupSubtotal(group)).toBe(500);
  });

  it('should handle mixed valid and invalid quantities', () => {
    const group: SizeGroup = {
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
    expect(calculateGroupSubtotal(group)).toBe(10);
  });
});

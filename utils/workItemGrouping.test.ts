import { describe, expect, it } from 'vitest';
import { deserializeSizeDetails, serializeSizeGroups } from './sizeGrouping';
import { JenisBarang, SizeDetail } from '../types';

describe('relational work item grouping', () => {
  it('separates matching sizes by color and tailor', () => {
    const details: SizeDetail[] = [
      { size: 'M', jumlah: 1, gender: 'Pria', tangan: 'Panjang', warna: 'Tropical Navy', namaPenjahit: 'Maris' },
      { size: 'M', jumlah: 1, gender: 'Pria', tangan: 'Panjang', warna: 'Tropical Khaki', namaPenjahit: 'Maris' },
      { size: 'M', jumlah: 1, gender: 'Pria', tangan: 'Panjang', warna: 'Tropical Navy', namaPenjahit: 'Fadil' },
    ];

    expect(deserializeSizeDetails(details, JenisBarang.KEMEJA)).toHaveLength(3);
  });

  it('preserves candidate tailor confirmation through round trip', () => {
    const details: SizeDetail[] = [{
      size: 'L',
      jumlah: 2,
      gender: 'Wanita',
      tangan: 'Panjang',
      warna: 'Tropical Navy',
      candidateTailorName: 'Jodi',
      tailorConfirmationStatus: 'needs_confirmation',
    }];

    const groups = deserializeSizeDetails(details, JenisBarang.KEMEJA);
    const result = serializeSizeGroups(groups, JenisBarang.KEMEJA);

    expect(result[0].candidateTailorName).toBe('Jodi');
    expect(result[0].tailorConfirmationStatus).toBe('needs_confirmation');
  });
});

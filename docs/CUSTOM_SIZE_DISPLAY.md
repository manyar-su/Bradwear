# Custom Size Display - namaPerSize Logic

## Overview
Sistem size grouping sekarang mendukung tampilan nama untuk custom size, dimana field `namaPerSize` akan ditampilkan sebagai pengganti field `size` jika tersedia.

## Behavior

### Display Logic
```typescript
const displayValue = namaPerSize || size;
```

Jika `namaPerSize` ada, maka akan ditampilkan. Jika tidak, akan menampilkan `size`.

### Example Data

**Input (SizeDetail):**
```typescript
{
  size: 'CUSTOM',
  jumlah: 1,
  gender: 'Pria',
  tangan: 'Panjang',
  namaPerSize: 'Akub',
  isCustomSize: true,
  customMeasurements: {
    tinggi: 72,
    lebarDada: 54,
    lebarBahu: 47,
    lingkarPerut: 101,
    lingkarPinggul: 105,
    panjangLengan: 60,
  }
}
```

**Display:**
- Field ukuran akan menampilkan: **"Akub"** (bukan "CUSTOM")
- Field jumlah akan menampilkan: **1**

## Use Cases

### 1. Custom Size dengan Nama Orang
Untuk order custom dengan nama pelanggan:
```typescript
{
  size: 'CUSTOM',
  namaPerSize: 'DWI',
  jumlah: 1,
  isCustomSize: true,
  customMeasurements: { ... }
}
```
Tampilan: **"DWI"**

### 2. Custom Size dengan Kode Produk
Untuk order custom dengan kode produk:
```typescript
{
  size: 'CUSTOM',
  namaPerSize: 'TROPICAL NAVY Kode B011',
  jumlah: 4,
  isCustomSize: true
}
```
Tampilan: **"TROPICAL NAVY Kode B011"**

### 3. Regular Size (Tanpa namaPerSize)
Untuk size standar:
```typescript
{
  size: 'M',
  jumlah: 5
}
```
Tampilan: **"M"**

## Data Preservation

### Serialization/Deserialization
Field `namaPerSize`, `isCustomSize`, dan `customMeasurements` sepenuhnya di-preserve melalui proses:
1. **Deserialization**: SizeDetail[] → SizeGroup[]
2. **Serialization**: SizeGroup[] → SizeDetail[]

### Backward Compatibility
✅ Data existing dengan `namaPerSize` akan tetap berfungsi
✅ Data tanpa `namaPerSize` akan menampilkan field `size` seperti biasa
✅ Round-trip serialization mempertahankan semua informasi

## Testing

Verification script tersedia di: `utils/customSizeDisplay.verify.ts`

Run test:
```bash
npx tsx utils/customSizeDisplay.verify.ts
```

Test coverage:
- ✅ Custom size dengan namaPerSize ditampilkan dengan benar
- ✅ Round-trip serialization mempertahankan namaPerSize
- ✅ Mixed custom dan regular sizes dalam satu group
- ✅ Display logic memprioritaskan namaPerSize

## Components Updated

1. **SizeEntry.tsx**
   - Added `namaPerSize` and `isCustomSize` props
   - Display logic: `const displayValue = namaPerSize || size`

2. **SizeGroupComponent.tsx**
   - Pass `namaPerSize` and `isCustomSize` to SizeEntry

3. **utils/sizeGrouping.ts**
   - Already preserves `namaPerSize` in serialization/deserialization

## Migration Notes

Tidak ada migration yang diperlukan. Sistem secara otomatis:
- Menampilkan `namaPerSize` jika ada
- Fallback ke `size` jika `namaPerSize` tidak ada
- Mempertahankan backward compatibility dengan data existing

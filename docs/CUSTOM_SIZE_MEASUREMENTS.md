# Custom Size Measurements

## Overview
Sistem sekarang mendukung input ukuran custom untuk setiap nama pelanggan yang terdeteksi. Ketika size "CUSTOM" terdeteksi dan memiliki `namaPerSize`, form input ukuran custom akan otomatis muncul.

## Behavior

### Auto-Detection
Form custom measurements akan muncul ketika:
1. Field `size` mengandung kata "CUSTOM" (case-insensitive), ATAU
2. Field `isCustomSize` bernilai `true`
3. DAN field `namaPerSize` terisi (nama pelanggan)

### Display Logic
```typescript
const isCustom = isCustomSize || size.toUpperCase().includes('CUSTOM');

if (isCustom && namaPerSize) {
  // Show CustomMeasurementsInput component
}
```

## Custom Measurements Fields

### Fields Available
Berdasarkan foto form lembar kerja, fields yang tersedia:

| Field | Label | Description |
|-------|-------|-------------|
| `tinggi` | Tinggi (cm) | Tinggi badan |
| `lebarDada` | LD / Lebar Dada (cm) | Lebar dada |
| `lebarBahu` | Lebar Bahu (cm) | Lebar bahu |
| `panjangLengan` | Panjang Lengan (cm) | Panjang lengan |
| `lingPerut` | Ling Perut (cm) | Lingkar perut |
| `lingPinggul` | Ling Pinggul (cm) | Lingkar pinggul |
| `kerah` | Kerah (cm) | Ukuran kerah (optional) |
| `manset` | Manset (cm) | Ukuran manset (optional) |

### Alias Fields (for compatibility)
- `lenganPanjang` → alias untuk `panjangLengan`
- `lingkaranPerut` → alias untuk `lingPerut`
- `lingkarPinggul` → alias untuk `lingPinggul`

## Example Data

### From Photo (Akub)
```typescript
{
  size: 'CUSTOM',
  jumlah: 1,
  namaPerSize: 'Akub',
  isCustomSize: true,
  customMeasurements: {
    tinggi: 72,
    lebarDada: 54,
    lebarBahu: 47,
    lingPerut: 101,
    lingPinggul: 105,
    panjangLengan: 60,
  }
}
```

### From Photo (DWI)
```typescript
{
  size: 'CUSTOM',
  jumlah: 1,
  namaPerSize: 'DWI',
  isCustomSize: true,
  customMeasurements: {
    tinggi: 79,
    lebarDada: 127,
    lebarBahu: 50,
    lingPerut: 129,
    lingPinggul: 133,
    panjangLengan: 59,
  }
}
```

## UI Component

### CustomMeasurementsInput
Komponen collapsible yang menampilkan form input untuk custom measurements.

**Props:**
```typescript
interface CustomMeasurementsInputProps {
  namaPerSize: string;                    // Nama pelanggan
  measurements?: CustomMeasurements;       // Ukuran existing (optional)
  onMeasurementsChange: (measurements: CustomMeasurements) => void;
  isDarkMode: boolean;
}
```

**Features:**
- ✅ Collapsible/expandable (default collapsed)
- ✅ Header menampilkan nama pelanggan
- ✅ Grid layout 2 kolom untuk efisiensi space
- ✅ Support dark mode
- ✅ Auto-save on change
- ✅ Numeric input dengan validation

### Integration with SizeEntry
SizeEntry component otomatis menampilkan CustomMeasurementsInput ketika:
```typescript
{isCustom && namaPerSize && onCustomMeasurementsChange && (
  <CustomMeasurementsInput
    namaPerSize={namaPerSize}
    measurements={customMeasurements}
    onMeasurementsChange={onCustomMeasurementsChange}
    isDarkMode={isDarkMode}
  />
)}
```

## Data Flow

### 1. Input Custom Size
User mengetik "CUSTOM" di field size atau set `isCustomSize = true`

### 2. Input Nama
User mengetik nama pelanggan di field size (akan menjadi `namaPerSize`)

### 3. Auto-Show Form
Form custom measurements otomatis muncul di bawah size entry

### 4. Input Measurements
User expand form dan input ukuran (tinggi, LD, lebar bahu, dll)

### 5. Auto-Save
Setiap perubahan langsung disimpan ke `customMeasurements` object

### 6. Serialization
Data disimpan ke database dengan format:
```typescript
{
  size: 'CUSTOM',
  jumlah: 1,
  namaPerSize: 'Akub',
  isCustomSize: true,
  customMeasurements: { ... }
}
```

## OCR/Scan Integration (Future)

### Auto-Populate from Scan
Ketika foto form lembar kerja di-scan:

1. **Detect Custom Sizes**
   - Cari pattern "CUSTOM" atau nama orang di kolom ukuran
   - Extract nama dari kolom ukuran

2. **Extract Measurements**
   - Parse tabel ukuran (Tinggi, LD, Lebar Bahu, dll)
   - Match nama dengan ukuran yang sesuai

3. **Auto-Create Entries**
   ```typescript
   const customSizes = [
     {
       size: 'CUSTOM',
       namaPerSize: 'Akub',
       jumlah: 1,
       isCustomSize: true,
       customMeasurements: {
         tinggi: 72,
         lebarDada: 54,
         // ... extracted from OCR
       }
     },
     {
       size: 'CUSTOM',
       namaPerSize: 'DWI',
       jumlah: 1,
       isCustomSize: true,
       customMeasurements: {
         tinggi: 79,
         lebarDada: 127,
         // ... extracted from OCR
       }
     }
   ];
   ```

4. **Populate Form**
   - Auto-create size entries dengan data dari OCR
   - User dapat review dan edit jika perlu

## Validation

### Required Fields
Tidak ada field yang required - semua optional. User bisa input sebagian ukuran saja.

### Numeric Validation
- Hanya accept angka (integer atau decimal)
- Empty field = `undefined` (not saved)
- Zero is valid value

### Display Validation
- Jika `namaPerSize` kosong, form tidak ditampilkan
- Jika bukan custom size, form tidak ditampilkan

## Backward Compatibility

### Existing Data
✅ Data existing dengan `customMeasurements` akan tetap berfungsi
✅ Data tanpa `customMeasurements` tidak akan menampilkan form
✅ Round-trip serialization mempertahankan semua data

### Migration
Tidak ada migration yang diperlukan. Sistem secara otomatis:
- Menampilkan form jika data custom size ada
- Hide form jika bukan custom size
- Preserve semua data existing

## Testing

### Manual Testing Checklist
- [ ] Input "CUSTOM" di size field → form muncul
- [ ] Input nama di size field → header form menampilkan nama
- [ ] Expand form → semua fields tersedia
- [ ] Input ukuran → data tersimpan
- [ ] Collapse form → data tetap tersimpan
- [ ] Delete size → custom measurements ikut terhapus
- [ ] Serialization → data tersimpan dengan benar
- [ ] Deserialization → data ter-load dengan benar

### Example Test Data
```typescript
const testData = {
  size: 'CUSTOM',
  jumlah: 1,
  namaPerSize: 'Test User',
  isCustomSize: true,
  customMeasurements: {
    tinggi: 170,
    lebarDada: 100,
    lebarBahu: 45,
    panjangLengan: 60,
    lingPerut: 90,
    lingPinggul: 95,
  }
};
```

## Future Enhancements

### 1. OCR Integration
- Auto-detect custom sizes from scanned forms
- Auto-extract measurements from tables
- Auto-populate form with extracted data

### 2. Measurement Templates
- Save common measurements as templates
- Quick-select from saved templates
- Reduce repetitive input

### 3. Measurement Validation
- Min/max ranges for each field
- Warning for unusual values
- Suggest corrections

### 4. Measurement History
- Track measurement changes over time
- Show previous measurements for same customer
- Suggest based on history

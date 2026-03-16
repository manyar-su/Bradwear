# Changelog v2.6.0

**Release Date:** 2026-03-12

---

## 🎉 New Features

### 1. Multiple Custom Sizes dengan Nama Berbeda

Sistem sekarang dapat mendeteksi dan mengelola multiple custom sizes dengan nama berbeda dalam satu item.

**Contoh Input:**
```
TROPICAL NAVY - LENGAN PANJANG
Akub = Tinggi 72, LD 54, Lebar bahu 47...
Iskandar T. = Tinggi 84, LD 132, Lebar bahu 54...
```

**Output:**
- 1 item dengan 2 sizes dalam array
- Setiap size memiliki nama dan custom measurements sendiri
- UI menampilkan nama dengan badge dan measurements dalam grid

**Files Changed:**
- `services/geminiService.ts` - Enhanced OCR prompt
- `types.ts` - Added `namaPerSize` and `customMeasurements` in sizes array
- `screens/ScanScreen.tsx` - Updated UI to display names and measurements

### 2. Grouping Berdasarkan Warna dan Tangan

**Aturan Grouping:**
1. **Warna berbeda** → Item terpisah (prioritas tertinggi)
2. **Tangan berbeda** (dalam warna sama) → Item terpisah
3. **Nama berbeda** (dalam warna+tangan sama) → Dalam `sizes` array

**Contoh:**
```
TROPICAL NAVY - LENGAN PANJANG (Item #1)
  - Akub
  - Iskandar T.

TROPICAL NAVY - LENGAN PENDEK (Item #2)
  - DWI
  - BIL

TROPICAL HITAM - LENGAN PENDEK (Item #3)
  - Iskandar T.
  - BIL
```

### 3. Field Custom Measurements Lengkap

Menambahkan field yang sebelumnya hilang:

**Kemeja (9 fields):**
- T, LD, LB, LPj, LPd, K, M
- **NEW:** LPr (Lingkar Perut), LPg (Lingkar Pinggul)

**Celana (5 fields):**
- T, LP, LPG, LPH, LBW

**Rompi (5 fields):**
- T, LD, LB, K, M

**Files Changed:**
- `types.ts` - Added `lingPerut`, `lingPinggul`, `panjangLengan`, `lingkaranPerut`
- `services/geminiService.ts` - Updated OCR prompt and schema
- `screens/ScanScreen.tsx` - Updated UI display and manual input

---

## 🔧 Improvements

### OCR Detection

**Enhanced Prompt:**
- Better detection of names with measurements
- Improved grouping logic by color and sleeve type
- More comprehensive measurement field detection

**Detection Patterns:**
```
Ling Perut / Lingkar Perut / Waist Circumference
Ling Pinggul / Lingkar Pinggul / Hip Circumference
Panjang lengan / Lengan Panjang / Long Sleeve
```

### UI/UX

**Display Improvements:**
- Nama ditampilkan dengan badge (👤 icon)
- Custom measurements dalam grid 3 kolom (lebih rapi)
- Border separator antar size
- Read-only display untuk measurements dari OCR

**Info Popup:**
- Menambahkan LPr dan LPg ke daftar singkatan
- Updated abbreviation list

---

## 📁 Documentation Organization

### New Structure

Semua dokumentasi dipindahkan ke folder `docs/`:

```
docs/
├── README.md (Index & navigation)
├── ADD_SIZE_VS_ADD_ITEM.md
├── MULTIPLE_SIZES_IN_ITEM.md
├── CUSTOM_SIZES_WITH_NAMES.md
├── DYNAMIC_FIELDS_FEATURE.md
├── SIZE_PICKER_FEATURE.md
├── SIZE_CHART_FEATURE.md
├── SCAN_CELANA_GUIDE.md
├── CHANGELOG_UI_IMPROVEMENTS.md
├── TEST_CUSTOM_SIZES_GUIDE.md
└── CHANGELOG_v2.6.0.md (this file)
```

**Benefits:**
- Kode lebih rapi dan terorganisir
- Dokumentasi mudah ditemukan
- Navigasi lebih jelas dengan README.md

---

## 🔄 Data Structure Changes

### Before (v2.5.0)
```typescript
sizes?: Array<{
  size: string;
  jumlah: number;
}>;
```

### After (v2.6.0)
```typescript
sizes?: Array<{
  size: string;
  jumlah: number;
  namaPerSize?: string;              // NEW
  isCustomSize?: boolean;            // NEW
  customMeasurements?: CustomMeasurements; // NEW
}>;
```

### CustomMeasurements Interface
```typescript
interface CustomMeasurements {
  tinggi?: number;
  lebarDada?: number;
  lebarBahu?: number;
  lenganPanjang?: number;
  lenganPendek?: number;
  kerah?: number;
  manset?: number;
  lingPerut?: number;        // NEW
  lingPinggul?: number;      // NEW
  panjangLengan?: number;    // NEW (alias)
  lingkaranPerut?: number;   // NEW (alias)
  // Celana fields
  lingkarPinggang?: number;
  lingkarPinggul?: number;
  lingkarPaha?: number;
  lingkarBawah?: number;
}
```

---

## 🧪 Testing

### New Test Scenarios

1. **Multiple Custom Sizes, Satu Warna**
   - Input: 2 nama dengan measurements berbeda
   - Expected: 1 item dengan 2 sizes dalam array

2. **Multiple Warna, Multiple Custom Sizes**
   - Input: 2 warna, masing-masing 2 nama
   - Expected: 2 item terpisah, masing-masing dengan 2 sizes

3. **Celana dengan Custom Sizes**
   - Input: Celana dengan 2 nama dan measurements
   - Expected: 1 item celana dengan 2 sizes

**Test Guide:** See `docs/TEST_CUSTOM_SIZES_GUIDE.md`

---

## 🐛 Bug Fixes

### Fixed Issues

1. **Missing Fields in OCR**
   - Lingkar Perut tidak terdeteksi → Fixed
   - Lingkar Pinggul tidak terdeteksi → Fixed
   - Panjang Lengan tidak terdeteksi → Fixed

2. **Grid Layout**
   - Changed from grid-cols-4 to grid-cols-3 untuk kemeja (9 fields)
   - Better responsive layout

3. **Schema Completeness**
   - Added all missing fields to OCR response schema
   - Added alias fields for compatibility

---

## 📊 Performance

### No Performance Impact

- OCR detection time: Same as v2.5.0
- UI rendering: Optimized with grid-cols-3
- Data storage: Minimal increase (only when custom sizes used)

---

## 🔐 Breaking Changes

### None

Semua perubahan backward compatible:
- Old data structure masih didukung
- New fields optional
- Existing features tidak terpengaruh

---

## 📝 Migration Guide

### From v2.5.0 to v2.6.0

**No migration needed!**

Existing data akan tetap berfungsi. New features akan aktif otomatis saat:
1. Scan rekapan dengan multiple custom sizes
2. Input manual dengan custom measurements baru

---

## 🎯 Next Steps

### Planned for v2.7.0

1. **Edit Custom Measurements**
   - Allow editing measurements dari OCR
   - Inline editing dalam sizes array

2. **Duplicate Detection**
   - Detect duplicate names dalam same item
   - Warning untuk nama yang sama

3. **Export/Import**
   - Export custom sizes to Excel
   - Import measurements from template

---

## 👥 Contributors

- Main Developer: [Your Name]
- Testing: [Tester Name]
- Documentation: [Doc Writer]

---

## 📞 Support

Untuk issue atau pertanyaan terkait v2.6.0:
1. Check `docs/CUSTOM_SIZES_WITH_NAMES.md`
2. Review `docs/TEST_CUSTOM_SIZES_GUIDE.md`
3. See `docs/README.md` untuk navigasi lengkap

---

**Version:** 2.6.0  
**Release Date:** 2026-03-12  
**Status:** ✅ Stable

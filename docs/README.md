# BradwearFlow Documentation

Dokumentasi lengkap untuk aplikasi BradwearFlow - Sistem manajemen order jahitan digital.

---

## 📚 Daftar Dokumentasi

### Core Features

1. **[ADD_SIZE_VS_ADD_ITEM.md](./ADD_SIZE_VS_ADD_ITEM.md)**
   - Perbedaan fungsi "Tambah Size" vs "Tambah Item"
   - Struktur data dan use cases
   - Workflow dan best practices

2. **[MULTIPLE_SIZES_IN_ITEM.md](./MULTIPLE_SIZES_IN_ITEM.md)**
   - Multiple sizes dalam satu item
   - Struktur `sizes` array
   - Implementation details

3. **[CUSTOM_SIZES_WITH_NAMES.md](./CUSTOM_SIZES_WITH_NAMES.md)**
   - Multiple custom sizes dengan nama berbeda
   - Grouping berdasarkan warna dan tangan
   - OCR detection logic

### UI Features

4. **[DYNAMIC_FIELDS_FEATURE.md](./DYNAMIC_FIELDS_FEATURE.md)**
   - Dynamic form fields berdasarkan jenis barang
   - Field mapping untuk Kemeja, Celana, Rompi
   - Custom measurements per jenis

5. **[SIZE_PICKER_FEATURE.md](./SIZE_PICKER_FEATURE.md)**
   - Quick size picker dengan smart filtering
   - Size chart integration
   - UI/UX details

6. **[SIZE_CHART_FEATURE.md](./SIZE_CHART_FEATURE.md)**
   - Size chart management
   - Auto-fill measurements
   - Chart selection logic

7. **[INFO_BUTTON_FEATURE.md](./INFO_BUTTON_FEATURE.md)**
   - Info button untuk custom measurements
   - Popup singkatan ukuran
   - User flow dan benefits

8. **[MOBILE_OPTIMIZATION.md](./MOBILE_OPTIMIZATION.md)**
   - Mobile-optimized custom measurements
   - Responsive text sizes and spacing
   - Touch target improvements

9. **[LAYOUT_IMPROVEMENTS_v2.6.3.md](./LAYOUT_IMPROVEMENTS_v2.6.3.md)**
   - Symmetric form layout
   - Vertical stacking for better UX
   - Full-width fields

10. **[DAILY_MOTIVATION_INTEGRATION.md](./DAILY_MOTIVATION_INTEGRATION.md)**
    - Animated daily motivation component
    - Framer-motion integration
    - Auto-hide and manual close features

### OCR & Scanning

11. **[SCAN_CELANA_GUIDE.md](./SCAN_CELANA_GUIDE.md)**
    - Panduan scan rekapan celana
    - Detection logic untuk celana
    - Field mapping khusus celana

12. **[OCR_MULTIPLE_SIZES_DETECTION.md](./OCR_MULTIPLE_SIZES_DETECTION.md)**
    - Enhanced OCR for multiple sizes detection
    - Pattern recognition for S/M/L and numeric sizes
    - Grouping and extraction rules

13. **[CHANGELOG_UI_IMPROVEMENTS.md](./CHANGELOG_UI_IMPROVEMENTS.md)**
    - History perubahan UI
    - Improvement log
    - Version tracking

### Data Integrity

14. **[DUPLICATE_WARNING_IMPROVEMENTS.md](./DUPLICATE_WARNING_IMPROVEMENTS.md)**
    - Enhanced duplicate detection
    - Same user and different user warnings
    - Data overwriting prevention

### Testing

15. **[TEST_CUSTOM_SIZES_GUIDE.md](./TEST_CUSTOM_SIZES_GUIDE.md)**
    - Testing guide untuk custom sizes
    - Test scenarios
    - Acceptance criteria

### Changelogs

16. **[CHANGELOG_v2.6.0.md](./CHANGELOG_v2.6.0.md)**
    - Custom measurements fields
    - Documentation organization

17. **[CHANGELOG_v2.6.1.md](./CHANGELOG_v2.6.1.md)**
    - Info button feature
    - Abbreviation popup

18. **[CHANGELOG_v2.6.4.md](./CHANGELOG_v2.6.4.md)**
    - Daily motivation component
    - Enhanced duplicate warnings
    - Data integrity improvements

---

## 🎯 Quick Start

### Untuk Developer Baru

1. Baca **ADD_SIZE_VS_ADD_ITEM.md** untuk memahami konsep dasar
2. Baca **DYNAMIC_FIELDS_FEATURE.md** untuk memahami struktur form
3. Baca **CUSTOM_SIZES_WITH_NAMES.md** untuk fitur advanced

### Untuk Testing

1. Baca **TEST_CUSTOM_SIZES_GUIDE.md** untuk test scenarios
2. Gunakan **SCAN_CELANA_GUIDE.md** sebagai referensi scan

### Untuk UI/UX

1. Baca **SIZE_PICKER_FEATURE.md** untuk size selection
2. Baca **SIZE_CHART_FEATURE.md** untuk chart management
3. Baca **CHANGELOG_UI_IMPROVEMENTS.md** untuk history

---

## 📋 Custom Measurements Fields

### Kemeja (9 fields)

| Singkatan | Field Name | Deskripsi |
|-----------|------------|-----------|
| T | tinggi | Tinggi Badan |
| LD | lebarDada | Lebar Dada |
| LB | lebarBahu | Lebar Bahu |
| LPj | lenganPanjang | Lengan Panjang |
| LPd | lenganPendek | Lengan Pendek |
| K | kerah | Kerah |
| M | manset | Manset |
| LPr | lingPerut | Lingkar Perut |
| LPg | lingPinggul | Lingkar Pinggul |

### Celana (5 fields)

| Singkatan | Field Name | Deskripsi |
|-----------|------------|-----------|
| T | tinggi | Tinggi/Panjang Celana |
| LP | lingkarPaha | Lingkar Paha |
| LPG | lingkarPinggang | Lingkar Pinggang |
| LPH | lingkarPinggul | Lingkar Pinggul |
| LBW | lingkarBawah | Lingkar Bawah |

### Rompi (5 fields)

| Singkatan | Field Name | Deskripsi |
|-----------|------------|-----------|
| T | tinggi | Tinggi Badan |
| LD | lebarDada | Lebar Dada |
| LB | lebarBahu | Lebar Bahu |
| K | kerah | Kerah |
| M | manset | Manset |

---

## 🔄 Data Structure

### OrderItem
```typescript
interface OrderItem {
  id: string;
  kodeBarang: string;
  jenisBarang?: JenisBarang; // Kemeja | Rompi | Celana
  sizeDetails: SizeDetail[];
  // ... other fields
}
```

### SizeDetail
```typescript
interface SizeDetail {
  size: string;
  jumlah: number;
  warna: string;
  gender: 'Pria' | 'Wanita';
  tangan?: 'Panjang' | 'Pendek';
  
  // Multiple sizes dalam satu item
  sizes?: Array<{
    size: string;
    jumlah: number;
    namaPerSize?: string;
    isCustomSize?: boolean;
    customMeasurements?: CustomMeasurements;
  }>;
  
  // Custom measurements
  isCustomSize?: boolean;
  customMeasurements?: CustomMeasurements;
  
  // Kemeja specific
  model?: string;
  sakuType?: SakuType;
  sakuColor?: SakuColor;
  
  // Celana specific
  modelCelana?: ModelCelana;
  bahanCelana?: BahanCelana;
  
  // Rompi specific
  jenisSakuRompi?: JenisSakuRompi;
}
```

---

## 🎨 UI Components

### Form Input Types

1. **Standard Size Input** - S, M, L, XL, XXL
2. **Numeric Size Input** - 28, 30, 32, 34 (untuk celana)
3. **Custom Size Input** - Manual measurements
4. **Size Chart Picker** - Quick selection dari chart

### Button Types

1. **Tambah Size** - Adds size within same item
2. **Tambah Item** - Adds new item with different rincian
3. **Scan Ulang** - Reset and rescan
4. **Simpan Pekerjaan** - Save order

---

## 🔍 OCR Detection

### Priority Order

1. **Kode Barang** - 4 digits at top of document
2. **Jenis Barang** - Kemeja, Celana, Rompi
3. **Warna** - Color grouping (highest priority)
4. **Tangan** - Sleeve type (within same color)
5. **Custom Sizes** - Names with measurements

### Grouping Rules

- **Warna berbeda** → Item terpisah
- **Tangan berbeda** (dalam warna sama) → Item terpisah
- **Nama berbeda** (dalam warna+tangan sama) → Dalam `sizes` array

---

## 📊 Version History

| Version | Date | Features |
|---------|------|----------|
| 2.6.4 | 2026-03-12 | Daily motivation, Enhanced duplicate warnings |
| 2.6.3 | 2026-03-12 | Symmetric form layout, Vertical stacking |
| 2.6.2 | 2026-03-12 | Mobile optimization, Responsive text sizes |
| 2.6.1 | 2026-03-12 | Info button untuk custom measurements |
| 2.6.0 | 2026-03-12 | Multiple custom sizes dengan nama, Lingkar Perut & Pinggul |
| 2.5.0 | 2026-03-12 | Multiple sizes dalam item, Tambah Size vs Tambah Item |
| 2.4.0 | 2026-03-11 | Dynamic fields per jenis barang |
| 2.3.0 | 2026-03-10 | Size chart integration |
| 2.2.0 | 2026-03-09 | Quick size picker |
| 2.1.0 | 2026-03-08 | Celana detection & fields |

---

## 🤝 Contributing

Saat menambahkan fitur baru:

1. Update dokumentasi yang relevan
2. Tambahkan test scenarios di TEST_CUSTOM_SIZES_GUIDE.md
3. Update CHANGELOG_UI_IMPROVEMENTS.md
4. Update README.md ini jika perlu

---

## 📞 Support

Untuk pertanyaan atau issue:
- Check dokumentasi yang relevan terlebih dahulu
- Lihat test scenarios untuk contoh penggunaan
- Review changelog untuk perubahan terbaru

---

**Last Updated:** 2026-03-12  
**Version:** 2.6.4

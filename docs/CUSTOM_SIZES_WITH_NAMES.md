# Multiple Custom Sizes dengan Nama Berbeda

## Overview

Fitur ini memungkinkan sistem untuk mendeteksi dan mengelola multiple custom sizes dengan nama berbeda dalam satu item, serta memisahkan item berdasarkan warna yang berbeda.

---

## Struktur Data

### Contoh Rekapan Input

```
TROPICAL NAVY Kode B011
LENGAN PANJANG
Akub = Tinggi 72, LD 54, Lebar bahu 47...
Iskandar T. = Tinggi 84, ukuran lebar dada dari baju 132...

LENGAN PENDEK
Iskandar T. = Tinggi 84, ukuran lebar dada 132...
DWI = Tinggi 79, LD 127, Lebar bahu 50...

TROPICAL HITAM
LENGAN PENDEK
Iskandar T. = Tinggi 84, ukuran lebar dada 132...
BIL = ...
```

### Output Data Structure

```typescript
sizeDetails: [
  // Item 1: TROPICAL NAVY - LENGAN PANJANG
  {
    warna: "TROPICAL NAVY",
    tangan: "Panjang",
    model: "Ventura",
    sizes: [
      {
        size: "CUSTOM",
        jumlah: 1,
        namaPerSize: "Akub",
        isCustomSize: true,
        customMeasurements: {
          tinggi: 72,
          lebarDada: 54,
          lebarBahu: 47,
          lenganPanjang: 60,
          // ...
        }
      },
      {
        size: "CUSTOM",
        jumlah: 1,
        namaPerSize: "Iskandar T.",
        isCustomSize: true,
        customMeasurements: {
          tinggi: 84,
          lebarDada: 132,
          lebarBahu: 54,
          // ...
        }
      }
    ]
  },
  
  // Item 2: TROPICAL NAVY - LENGAN PENDEK
  {
    warna: "TROPICAL NAVY",
    tangan: "Pendek",
    model: "Ventura",
    sizes: [
      {
        size: "CUSTOM",
        jumlah: 1,
        namaPerSize: "Iskandar T.",
        isCustomSize: true,
        customMeasurements: { ... }
      },
      {
        size: "CUSTOM",
        jumlah: 1,
        namaPerSize: "DWI",
        isCustomSize: true,
        customMeasurements: { ... }
      }
    ]
  },
  
  // Item 3: TROPICAL HITAM - LENGAN PENDEK (Warna berbeda = Item baru)
  {
    warna: "TROPICAL HITAM",
    tangan: "Pendek",
    model: "Ventura",
    sizes: [
      {
        size: "CUSTOM",
        jumlah: 1,
        namaPerSize: "Iskandar T.",
        isCustomSize: true,
        customMeasurements: { ... }
      },
      {
        size: "CUSTOM",
        jumlah: 1,
        namaPerSize: "BIL",
        isCustomSize: true,
        customMeasurements: { ... }
      }
    ]
  }
]
```

---

## Aturan Grouping

### 1. Group by Warna (Color) - PRIORITAS TERTINGGI

**Warna berbeda = Item terpisah**

```
✅ BENAR:
Item #1: TROPICAL NAVY (dengan multiple sizes)
Item #2: TROPICAL HITAM (dengan multiple sizes)

❌ SALAH:
Item #1: TROPICAL NAVY + TROPICAL HITAM (digabung)
```

### 2. Group by Tangan (Sleeve Type) - Dalam warna yang sama

**Tangan berbeda = Item terpisah (dalam warna yang sama)**

```
✅ BENAR:
Item #1: TROPICAL NAVY - LENGAN PANJANG (dengan multiple sizes)
Item #2: TROPICAL NAVY - LENGAN PENDEK (dengan multiple sizes)

❌ SALAH:
Item #1: TROPICAL NAVY - LENGAN PANJANG + PENDEK (digabung)
```

### 3. Multiple Custom Sizes - Dalam warna+tangan yang sama

**Nama berbeda = Masuk dalam sizes array**

```
✅ BENAR:
Item #1: TROPICAL NAVY - LENGAN PANJANG
  sizes: [
    { namaPerSize: "Akub", customMeasurements: {...} },
    { namaPerSize: "Iskandar T.", customMeasurements: {...} }
  ]

❌ SALAH:
Item #1: Akub
Item #2: Iskandar T.
(Seharusnya dalam 1 item dengan sizes array)
```

---

## UI Display

### Tampilan Multiple Custom Sizes

```
┌─────────────────────────────────────────────────┐
│ #1 RINCIAN ITEM                                 │
│ Warna: TROPICAL NAVY                            │
│ Model: Ventura                                  │
│ Tangan: Panjang                                 │
├─────────────────────────────────────────────────┤
│ 👤 AKUB                                         │
│ Ukuran: CUSTOM      Jumlah: 1                   │
│ ┌─────────────────────────────────────────────┐ │
│ │ 📏 Ukuran Custom                            │ │
│ │ T: 72  LD: 54  LB: 47  LPj: 60  LPd: 26    │ │
│ │ K: 0   M: 0                                 │ │
│ └─────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────┤
│ 👤 ISKANDAR T.                                  │
│ Ukuran: CUSTOM      Jumlah: 1  🗑️              │
│ ┌─────────────────────────────────────────────┐ │
│ │ 📏 Ukuran Custom                            │ │
│ │ T: 84  LD: 132  LB: 54  LPj: 26  LPd: 0    │ │
│ │ K: 0   M: 0                                 │ │
│ └─────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────┤
│ + TAMBAH SIZE                                   │
└─────────────────────────────────────────────────┘
```

### Fitur UI

1. **Nama Badge** - Setiap size menampilkan nama dengan icon 👤
2. **Custom Measurements Display** - Ukuran ditampilkan dalam grid 4 kolom
3. **Read-only Display** - Measurements dari OCR ditampilkan read-only
4. **Delete Button** - Hanya muncul untuk size kedua dan seterusnya
5. **Border Separator** - Setiap size dipisahkan dengan border

---

## OCR Detection Logic

### Prompt Enhancement

```
CRITICAL GROUPING RULES:
- Group by WARNA (color) first - different colors = different items
- Within same color, group by TANGAN (sleeve type) if applicable
- Within same color+tangan, multiple custom sizes with different names = use 'sizes' array

STRUCTURE FOR MULTIPLE CUSTOM SIZES:
Example: "TROPICAL NAVY" with "LENGAN PANJANG" has "Akub" and "Iskandar T."
→ Create ONE item with sizes array containing both

STRUCTURE FOR DIFFERENT COLORS:
Example: "TROPICAL NAVY" and "TROPICAL HITAM"
→ Create TWO separate items
```

### Detection Pattern

1. **Detect Color Sections**
   - Look for color keywords: TROPICAL NAVY, TROPICAL HITAM, dll
   - Each color = potential new item

2. **Detect Sleeve Type Sections**
   - Look for: LENGAN PANJANG, LENGAN PENDEK
   - Within same color, different sleeve = new item

3. **Detect Names with Measurements**
   - Pattern: `Nama = Tinggi X, LD Y, ...`
   - Extract name → `namaPerSize`
   - Extract measurements → `customMeasurements`

4. **Group into sizes array**
   - Same color + same sleeve → group into one item's sizes array
   - Different color → create new item

---

## Custom Measurements Fields

### Untuk Kemeja

| Singkatan | Field Name | Deskripsi |
|-----------|------------|-----------|
| T | tinggi | Tinggi Badan |
| LD | lebarDada | Lebar Dada |
| LB | lebarBahu | Lebar Bahu |
| LPj | lenganPanjang | Lengan Panjang |
| LPd | lenganPendek | Lengan Pendek |
| K | kerah | Kerah |
| M | manset | Manset |

### Untuk Celana

| Singkatan | Field Name | Deskripsi |
|-----------|------------|-----------|
| T | tinggi | Tinggi/Panjang Celana |
| LP | lingkarPaha | Lingkar Paha |
| LPG | lingkarPinggang | Lingkar Pinggang |
| LPH | lingkarPinggul | Lingkar Pinggul |
| LBW | lingkarBawah | Lingkar Bawah |

---

## Use Cases

### Use Case 1: Multiple Custom Sizes, Satu Warna, Satu Tangan

**Input:**
```
TROPICAL NAVY - LENGAN PANJANG
Akub = T 72, LD 54, LB 47
Iskandar = T 84, LD 132, LB 54
```

**Output:**
- 1 item dengan 2 sizes dalam array
- Warna: TROPICAL NAVY
- Tangan: Panjang
- Total: 2 pcs

---

### Use Case 2: Multiple Custom Sizes, Satu Warna, Dua Tangan

**Input:**
```
TROPICAL NAVY
LENGAN PANJANG
Akub = T 72, LD 54
Iskandar = T 84, LD 132

LENGAN PENDEK
DWI = T 79, LD 127
BIL = T 80, LD 130
```

**Output:**
- Item #1: TROPICAL NAVY - Panjang (2 sizes)
- Item #2: TROPICAL NAVY - Pendek (2 sizes)
- Total: 4 pcs

---

### Use Case 3: Multiple Warna

**Input:**
```
TROPICAL NAVY - LENGAN PENDEK
Iskandar = T 84, LD 132
DWI = T 79, LD 127

TROPICAL HITAM - LENGAN PENDEK
Iskandar = T 84, LD 132
BIL = T 80, LD 130
```

**Output:**
- Item #1: TROPICAL NAVY - Pendek (2 sizes)
- Item #2: TROPICAL HITAM - Pendek (2 sizes)
- Total: 4 pcs dalam 2 warna berbeda

---

## Technical Implementation

### Types Definition

```typescript
interface SizeDetail {
  size: string;
  jumlah: number;
  warna: string;
  tangan: 'Panjang' | 'Pendek';
  // ... other fields
  
  sizes?: Array<{
    size: string;
    jumlah: number;
    namaPerSize?: string;
    isCustomSize?: boolean;
    customMeasurements?: CustomMeasurements;
  }>;
}
```

### OCR Response Schema

```typescript
responseSchema: {
  sizeDetails: {
    type: Type.ARRAY,
    items: {
      properties: {
        // ... standard fields
        sizes: {
          type: Type.ARRAY,
          items: {
            properties: {
              size: { type: Type.STRING },
              jumlah: { type: Type.NUMBER },
              namaPerSize: { type: Type.STRING },
              isCustomSize: { type: Type.BOOLEAN },
              customMeasurements: {
                type: Type.OBJECT,
                properties: {
                  tinggi: { type: Type.NUMBER },
                  lebarDada: { type: Type.NUMBER },
                  // ... other measurements
                }
              }
            }
          }
        }
      }
    }
  }
}
```

---

## Benefits

### 1. Organisasi Data yang Lebih Baik
- Warna berbeda terpisah dengan jelas
- Custom sizes dengan nama terkelompok dalam satu item
- Mudah tracking per warna dan per nama

### 2. Input Lebih Cepat
- OCR otomatis mendeteksi struktur
- Tidak perlu input manual per nama
- Measurements langsung terisi

### 3. Mengurangi Error
- Grouping otomatis berdasarkan warna
- Nama dan measurements terhubung langsung
- Tidak ada duplikasi item yang seharusnya digabung

### 4. Display yang Informatif
- Nama ditampilkan dengan jelas
- Measurements mudah dibaca
- Visual grouping yang baik

---

## Testing Checklist

- [ ] OCR mendeteksi multiple custom sizes dengan nama
- [ ] Warna berbeda membuat item terpisah
- [ ] Tangan berbeda (dalam warna sama) membuat item terpisah
- [ ] Nama dan measurements terhubung dengan benar
- [ ] UI menampilkan nama dengan badge
- [ ] Custom measurements ditampilkan dalam grid
- [ ] Delete button hanya muncul untuk size kedua+
- [ ] Total calculation benar untuk multiple sizes
- [ ] Data tersimpan dengan struktur yang benar

---

**Version:** 2.6.0  
**Last Updated:** 2026-03-12  
**Feature Status:** ✅ Active

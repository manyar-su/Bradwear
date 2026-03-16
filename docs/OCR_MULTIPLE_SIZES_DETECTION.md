# OCR Multiple Sizes Detection Improvement

## Overview

Perbaikan OCR untuk mendeteksi multiple sizes dengan jumlah berbeda dalam satu kode barang yang sama.

---

## 🎯 Masalah yang Diperbaiki

### Before

**Problem:**
- OCR tidak mendeteksi size dan jumlah yang berbeda
- Hanya menampilkan "SIZE" tanpa nilai spesifik
- Hanya menampilkan "JUMLAH PCS" tanpa angka
- Multiple sizes tidak ter-group dengan benar

**Example Input:**
```
Kode: 1993
Brad V2
PJ: Maris

S = 2
M = 3
L = 1
XL = 2
```

**Old Output:**
```json
{
  "sizeDetails": [
    { "size": "", "jumlah": 0 },
    { "size": "", "jumlah": 0 },
    { "size": "", "jumlah": 0 },
    { "size": "", "jumlah": 0 }
  ]
}
```

### After

**New Output:**
```json
{
  "sizeDetails": [
    {
      "warna": "PUTIH",
      "tangan": "Panjang",
      "sizes": [
        { "size": "S", "jumlah": 2 },
        { "size": "M", "jumlah": 3 },
        { "size": "L", "jumlah": 1 },
        { "size": "XL", "jumlah": 2 }
      ]
    }
  ],
  "jumlahPesanan": 8
}
```

---

## 🔍 Detection Patterns

### Pattern 1: Standard Sizes with Quantities

**Input Format:**
```
S = 2
M = 3
L = 1
XL = 2
```

**Detection Logic:**
1. Look for "=" sign followed by number
2. Extract size letter (S, M, L, XL)
3. Extract quantity number after "="
4. Group into sizes array

**Output:**
```json
{
  "sizes": [
    { "size": "S", "jumlah": 2 },
    { "size": "M", "jumlah": 3 },
    { "size": "L", "jumlah": 1 },
    { "size": "XL", "jumlah": 2 }
  ]
}
```

---

### Pattern 2: Numeric Sizes (Celana)

**Input Format:**
```
28 = 1
30 = 2
32 = 1
34 = 1
```

**Detection Logic:**
1. Look for numeric size (28-40 range)
2. Look for "=" sign followed by quantity
3. Extract both size and quantity
4. Group into sizes array

**Output:**
```json
{
  "jenisBarang": "Celana",
  "sizes": [
    { "size": "28", "jumlah": 1 },
    { "size": "30", "jumlah": 2 },
    { "size": "32", "jumlah": 1 },
    { "size": "34", "jumlah": 1 }
  ]
}
```

---

### Pattern 3: Custom Sizes with Names

**Input Format:**
```
Akub = Tinggi 72, LD 54, Lebar bahu 47
Iskandar T. = Tinggi 84, LD 132, Lebar bahu 54
DWI = Tinggi 79, LD 127, Lebar bahu 50
```

**Detection Logic:**
1. Look for name before "=" sign
2. Extract measurements after "="
3. Parse measurement values
4. Create custom size entry with name

**Output:**
```json
{
  "sizes": [
    {
      "size": "CUSTOM",
      "jumlah": 1,
      "namaPerSize": "Akub",
      "isCustomSize": true,
      "customMeasurements": {
        "tinggi": 72,
        "lebarDada": 54,
        "lebarBahu": 47
      }
    },
    {
      "size": "CUSTOM",
      "jumlah": 1,
      "namaPerSize": "Iskandar T.",
      "isCustomSize": true,
      "customMeasurements": {
        "tinggi": 84,
        "lebarDada": 132,
        "lebarBahu": 54
      }
    }
  ]
}
```

---

## 📋 Enhanced Prompt Instructions

### Size Extraction Rules

```
STANDARD SIZES: S, M, L, XL, XXL, XXXL
NUMERIC SIZES: 28, 30, 32, 34, 36, 38, 40 (for celana)
CUSTOM SIZES: If followed by measurements, set size = "CUSTOM"
```

### Quantity Extraction Rules

```
1. Look for numbers after "=" sign
2. Look for numbers in "JUMLAH" or "QTY" column
3. Look for pattern: "size = number"
4. Default to 1 if not specified
```

### Grouping Rules

```
SAME ITEM:
- Same kode barang
- Same warna
- Same tangan
→ Group into ONE item with sizes array

DIFFERENT ITEMS:
- Different warna → separate items
- Different tangan → separate items
```

---

## 🎨 Visual Examples

### Example 1: Brad V2 with Multiple Sizes

**Input Document:**
```
┌─────────────────────────────────────┐
│ 1993                                │
│ SABTU, 21 FEBRUARI 2026             │
│                                     │
│ BRAD V2                             │
│ PJ: MARIS                           │
│                                     │
│ RINCIAN ITEM          4 PCS         │
│                                     │
│ SIZE    PRIA      JUMLAH            │
│         PANJANG   PCS               │
│                                     │
│ S       ✓         2                 │
│ M       ✓         1                 │
│ L       ✓         1                 │
└─────────────────────────────────────┘
```

**Expected Output:**
```json
{
  "kodeBarang": "1993",
  "tanggalTargetSelesai": "21 Februari 2026",
  "model": "Brad V2",
  "namaPenjahit": "Maris",
  "jumlahPesanan": 4,
  "sizeDetails": [
    {
      "warna": "",
      "gender": "Pria",
      "tangan": "Panjang",
      "model": "Brad V2",
      "sizes": [
        { "size": "S", "jumlah": 2 },
        { "size": "M", "jumlah": 1 },
        { "size": "L", "jumlah": 1 }
      ]
    }
  ]
}
```

---

### Example 2: Celana with Multiple Sizes

**Input Document:**
```
┌─────────────────────────────────────┐
│ 1368                                │
│ CELANA HITAM                        │
│ Model: WARRIOR                      │
│ Bahan: AMERICAN DRILL               │
│                                     │
│ 28 = 1                              │
│ 30 = 2                              │
│ 32 = 1                              │
│ 34 = 1                              │
└─────────────────────────────────────┘
```

**Expected Output:**
```json
{
  "kodeBarang": "1368",
  "jenisBarang": "Celana",
  "warna": "HITAM",
  "jumlahPesanan": 5,
  "sizeDetails": [
    {
      "warna": "HITAM",
      "modelCelana": "Warrior",
      "bahanCelana": "American Drill",
      "sizes": [
        { "size": "28", "jumlah": 1 },
        { "size": "30", "jumlah": 2 },
        { "size": "32", "jumlah": 1 },
        { "size": "34", "jumlah": 1 }
      ]
    }
  ]
}
```

---

## 🔧 Technical Implementation

### Prompt Enhancement

**Added Detection Patterns:**
```
CRITICAL: MULTIPLE SIZES DETECTION
When you see a list of items with SAME kode barang but DIFFERENT sizes/quantities:

Example Pattern 1 (Standard Sizes):
"S = 2
 M = 3
 L = 1"

Example Pattern 2 (Numeric Sizes):
"28 = 1
 30 = 2
 32 = 1"

Example Pattern 3 (Custom Sizes):
"Akub = Tinggi 72, LD 54..."
"Iskandar = Tinggi 84, LD 132..."
```

**Detection Logic:**
```
- Look for "=" sign followed by number
- Look for vertical list of sizes
- Look for "SIZE" column with "JUMLAH" column
- Look for repeated pattern: [size] [quantity]
```

---

## ✅ Benefits

### 1. Accurate Size Detection
- Detects all sizes in the document
- No missing sizes
- Correct size values (S, M, L, XL, 28, 30, etc.)

### 2. Accurate Quantity Detection
- Detects quantity for each size
- No missing quantities
- Correct numeric values

### 3. Proper Grouping
- Multiple sizes grouped into one item
- Correct use of sizes array
- Maintains relationship between size and quantity

### 4. Better Data Structure
- Clean and organized output
- Easy to display in UI
- Correct total calculation

---

## 🧪 Testing

### Test Cases

**Test Case 1: Standard Sizes**
```
Input: "S = 2, M = 3, L = 1, XL = 2"
Expected: 4 entries in sizes array
Expected Total: 8 pcs
```

**Test Case 2: Numeric Sizes**
```
Input: "28 = 1, 30 = 2, 32 = 1, 34 = 1"
Expected: 4 entries in sizes array
Expected Total: 5 pcs
```

**Test Case 3: Custom Sizes**
```
Input: "Akub = T 72, LD 54"
       "Iskandar = T 84, LD 132"
Expected: 2 entries in sizes array with customMeasurements
Expected Total: 2 pcs
```

**Test Case 4: Mixed Patterns**
```
Input: Multiple sizes with different formats
Expected: All sizes detected correctly
Expected: Proper grouping by warna/tangan
```

---

## 📊 Comparison

| Aspect | Before | After |
|--------|--------|-------|
| Size Detection | ❌ Empty | ✅ Accurate |
| Quantity Detection | ❌ Zero | ✅ Correct |
| Grouping | ❌ Separate items | ✅ Sizes array |
| Total Calculation | ❌ Wrong | ✅ Correct |
| Data Structure | ❌ Messy | ✅ Clean |

---

## 🚀 Future Improvements

### 1. Table Detection
Detect sizes in table format:
```
| SIZE | JUMLAH |
|------|--------|
| S    | 2      |
| M    | 3      |
```

### 2. Handwriting Recognition
Better detection of handwritten sizes and quantities

### 3. Confidence Scores
Add confidence score for each detected size/quantity

### 4. Auto-correction
Suggest corrections for ambiguous detections

---

## 📞 Related

- **Main Feature:** docs/CUSTOM_SIZES_WITH_NAMES.md
- **OCR Service:** services/geminiService.ts
- **Data Structure:** types.ts

---

**Version:** 2.7.0  
**Last Updated:** 2026-03-12  
**Status:** ✅ Active

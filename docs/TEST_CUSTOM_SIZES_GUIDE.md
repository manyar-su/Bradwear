# Testing Guide: Multiple Custom Sizes dengan Nama

## Test Scenario 1: Multiple Custom Sizes, Satu Warna

### Input Rekapan
```
Kode: 2516
TROPICAL NAVY Kode B011
Model: VENTURA

LENGAN PANJANG
Akub = Tinggi 72, LD 54, Lebar bahu 47, Ling Perut 101, Ling Pinggul 105, Panjang lengan 60
Iskandar T. = Tinggi 84, ukuran lebar dada dari baju 132, Lebar bahu 54, Ling perut 142, Ling pinggul 142, Panjang lengan 26, Ling lengan 46
```

### Expected Output
```json
{
  "kodeBarang": "2516",
  "jenisBarang": "Kemeja",
  "sizeDetails": [
    {
      "warna": "TROPICAL NAVY",
      "model": "Ventura",
      "tangan": "Panjang",
      "sizes": [
        {
          "size": "CUSTOM",
          "jumlah": 1,
          "namaPerSize": "Akub",
          "isCustomSize": true,
          "customMeasurements": {
            "tinggi": 72,
            "lebarDada": 54,
            "lebarBahu": 47,
            "lenganPanjang": 60,
            "lingPerut": 101,
            "lingPinggul": 105
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
            "lebarBahu": 54,
            "lenganPanjang": 26,
            "lingPerut": 142,
            "lingPinggul": 142
          }
        }
      ]
    }
  ],
  "jumlahPesanan": 2
}
```

### UI Verification
- [ ] 1 item card ditampilkan
- [ ] Warna: TROPICAL NAVY
- [ ] Model: Ventura
- [ ] Tangan: Panjang
- [ ] 2 size entries dengan nama:
  - [ ] Badge "AKUB" ditampilkan
  - [ ] Custom measurements Akub ditampilkan (T:72, LD:54, LB:47, dll)
  - [ ] Badge "ISKANDAR T." ditampilkan
  - [ ] Custom measurements Iskandar ditampilkan
  - [ ] Delete button hanya ada di Iskandar (size kedua)
- [ ] Total: 2 PCS

---

## Test Scenario 2: Multiple Warna, Multiple Custom Sizes

### Input Rekapan
```
Kode: 2516
TROPICAL NAVY Kode B011

LENGAN PANJANG
Akub = Tinggi 72, LD 54, Lebar bahu 47
Iskandar T. = Tinggi 84, LD 132, Lebar bahu 54

LENGAN PENDEK
Iskandar T. = Tinggi 84, LD 132, Lebar bahu 54
DWI = Tinggi 79, LD 127, Lebar bahu 50

TROPICAL HITAM

LENGAN PENDEK
Iskandar T. = Tinggi 84, LD 132
BIL = Tinggi 80, LD 130
```

### Expected Output
```json
{
  "kodeBarang": "2516",
  "sizeDetails": [
    {
      "warna": "TROPICAL NAVY",
      "tangan": "Panjang",
      "sizes": [
        { "namaPerSize": "Akub", "customMeasurements": {...} },
        { "namaPerSize": "Iskandar T.", "customMeasurements": {...} }
      ]
    },
    {
      "warna": "TROPICAL NAVY",
      "tangan": "Pendek",
      "sizes": [
        { "namaPerSize": "Iskandar T.", "customMeasurements": {...} },
        { "namaPerSize": "DWI", "customMeasurements": {...} }
      ]
    },
    {
      "warna": "TROPICAL HITAM",
      "tangan": "Pendek",
      "sizes": [
        { "namaPerSize": "Iskandar T.", "customMeasurements": {...} },
        { "namaPerSize": "BIL", "customMeasurements": {...} }
      ]
    }
  ],
  "jumlahPesanan": 6
}
```

### UI Verification
- [ ] 3 item cards ditampilkan
- [ ] Item #1: TROPICAL NAVY - Panjang (2 sizes)
- [ ] Item #2: TROPICAL NAVY - Pendek (2 sizes)
- [ ] Item #3: TROPICAL HITAM - Pendek (2 sizes)
- [ ] Total: 6 PCS
- [ ] Setiap item menampilkan nama dan measurements dengan benar

---

## Test Scenario 3: Celana dengan Custom Sizes

### Input Rekapan
```
Kode: 1368
CELANA HITAM
Model: ARMOR
Bahan: AMERICAN DRILL

Akub = Tinggi 100, LP 80, LPG 85, LPH 90, LBW 40
Iskandar = Tinggi 105, LP 85, LPG 90, LPH 95, LBW 42
```

### Expected Output
```json
{
  "kodeBarang": "1368",
  "jenisBarang": "Celana",
  "sizeDetails": [
    {
      "warna": "HITAM",
      "modelCelana": "Armor",
      "bahanCelana": "American Drill",
      "sizes": [
        {
          "size": "CUSTOM",
          "jumlah": 1,
          "namaPerSize": "Akub",
          "isCustomSize": true,
          "customMeasurements": {
            "tinggi": 100,
            "lingkarPaha": 80,
            "lingkarPinggang": 85,
            "lingkarPinggul": 90,
            "lingkarBawah": 40
          }
        },
        {
          "size": "CUSTOM",
          "jumlah": 1,
          "namaPerSize": "Iskandar",
          "isCustomSize": true,
          "customMeasurements": {
            "tinggi": 105,
            "lingkarPaha": 85,
            "lingkarPinggang": 90,
            "lingkarPinggul": 95,
            "lingkarBawah": 42
          }
        }
      ]
    }
  ],
  "jumlahPesanan": 2
}
```

### UI Verification
- [ ] 1 item card ditampilkan
- [ ] Jenis Barang: Celana
- [ ] Warna: HITAM
- [ ] Model Celana: Armor
- [ ] Bahan: American Drill
- [ ] 2 size entries dengan nama
- [ ] Custom measurements menampilkan field celana (T, LP, LPG, LPH, LBW)
- [ ] TIDAK menampilkan field kemeja (LD, LB, LPj, dll)
- [ ] Total: 2 PCS

---

## Manual Testing Steps

### Step 1: Scan Rekapan
1. Buka aplikasi
2. Klik "Input Kerja Baru"
3. Pilih "Kamera" atau "Berkas"
4. Scan/upload rekapan test

### Step 2: Verify OCR Detection
1. Tunggu proses OCR selesai
2. Periksa kode barang terdeteksi dengan benar
3. Periksa jenis barang (Kemeja/Celana/Rompi)
4. Periksa jumlah item yang dibuat

### Step 3: Verify Item Grouping
1. Periksa warna berbeda = item terpisah
2. Periksa tangan berbeda (dalam warna sama) = item terpisah
3. Periksa nama berbeda (dalam warna+tangan sama) = dalam sizes array

### Step 4: Verify UI Display
1. Setiap item menampilkan warna dengan benar
2. Setiap size menampilkan nama dengan badge
3. Custom measurements ditampilkan dalam grid
4. Delete button hanya ada di size kedua+
5. Total calculation benar

### Step 5: Verify Data Save
1. Klik "SIMPAN PEKERJAAN"
2. Buka History
3. Periksa data tersimpan dengan struktur yang benar
4. Periksa nama dan measurements tidak hilang

---

## Edge Cases to Test

### Edge Case 1: Nama dengan Spasi dan Titik
```
Input: "Iskandar T." atau "Abdul Hadi"
Expected: Nama tersimpan lengkap dengan spasi dan titik
```

### Edge Case 2: Measurements Tidak Lengkap
```
Input: "Akub = Tinggi 72, LD 54"
Expected: Field lain bernilai 0, tidak error
```

### Edge Case 3: Hanya 1 Custom Size
```
Input: Hanya ada 1 nama dengan measurements
Expected: Tetap menggunakan sizes array (untuk konsistensi)
```

### Edge Case 4: Warna Sama, Tangan Tidak Disebutkan
```
Input: Warna sama tapi tidak ada keterangan lengan
Expected: Default ke "Pendek" atau grouping berdasarkan warna saja
```

### Edge Case 5: Mixed Standard + Custom Sizes
```
Input: Ada size M, L, XL dan juga custom dengan nama
Expected: Standard sizes dan custom sizes terpisah atau dalam item berbeda
```

---

## Regression Testing

### Test Existing Features Still Work

- [ ] Standard sizes (S, M, L, XL) masih berfungsi
- [ ] Tambah Size button masih berfungsi
- [ ] Tambah Item button masih berfungsi
- [ ] Size Chart picker masih berfungsi
- [ ] Custom measurements toggle masih berfungsi
- [ ] Delete size masih berfungsi
- [ ] Total calculation masih akurat
- [ ] Save dan load data masih berfungsi

---

## Performance Testing

- [ ] OCR dengan multiple custom sizes tidak lebih lambat
- [ ] UI rendering dengan banyak sizes tidak lag
- [ ] Save data dengan struktur kompleks tidak error
- [ ] Load data dari storage tidak error

---

## Acceptance Criteria

### ✅ Feature Complete When:

1. OCR dapat mendeteksi multiple custom sizes dengan nama
2. Warna berbeda membuat item terpisah
3. Tangan berbeda (dalam warna sama) membuat item terpisah
4. Nama dan measurements terhubung dengan benar
5. UI menampilkan nama dengan badge yang jelas
6. Custom measurements ditampilkan dalam grid yang rapi
7. Delete button hanya muncul untuk size kedua+
8. Total calculation benar untuk semua skenario
9. Data tersimpan dan dapat di-load kembali dengan benar
10. Tidak ada regression pada fitur existing

---

**Test Status:** 🟡 Pending  
**Last Updated:** 2026-03-12

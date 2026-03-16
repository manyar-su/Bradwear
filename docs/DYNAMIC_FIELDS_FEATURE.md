# Fitur Dynamic Fields Berdasarkan Jenis Barang

## Overview

Form input sekarang menampilkan field yang berbeda berdasarkan jenis barang yang dipilih (Kemeja/Rompi/Celana), dengan rujukan langsung ke size chart untuk menentukan field mana yang ditampilkan.

---

## Perubahan Utama

### 1. Tombol "Tambah Size Lain" di Atas

**Lokasi:** Di atas field Ukuran (hanya muncul di item pertama)

**Tampilan:**
```
┌─────────────────────────────────────┐
│ + TAMBAH SIZE LAIN                  │ ← Tombol baru
├─────────────────────────────────────┤
│ UKURAN (SIZE)    JUMLAH (PCS)       │
│ [M] 📏           [2]                │
└─────────────────────────────────────┘
```

**Fungsi:**
- Menambah item size baru dengan field yang sama
- Hanya muncul di item #1 untuk menghindari duplikasi
- Border dashed dengan hover effect hijau

---

### 2. Gender dan Tangan Berdampingan (Kemeja)

**Sebelum:**
```
UKURAN (SIZE)
[M]

TIPE LENGAN
[Pendek ▼]

KATEGORI (GNDR)
[Laki-Laki ▼]
```

**Sesudah:**
```
UKURAN (SIZE)    JUMLAH (PCS)
[M] 📏           [2]

KATEGORI (GNDR)  TIPE LENGAN
[Laki-Laki ▼]    [Pendek ▼]
```

**Keuntungan:**
- ✅ Lebih compact
- ✅ Hemat ruang vertikal
- ✅ Mudah dibaca sekilas

---

### 3. Dynamic Custom Measurements

#### Untuk KEMEJA:
```
┌─────────────────────────────────────┐
│ 🔧 CUSTOM UKURAN          ℹ️  [ON]  │
├─────────────────────────────────────┤
│ T    LD   LB   LPj  LPd   K    M   │
│ [72] [50] [42] [58] [22] [38] [24] │
└─────────────────────────────────────┘

Keterangan:
T   = Tinggi Badan
LD  = Lebar Dada
LB  = Lebar Bahu
LPj = Lengan Panjang
LPd = Lengan Pendek
K   = Kerah
M   = Manset
```

#### Untuk CELANA:
```
┌─────────────────────────────────────┐
│ 🔧 CUSTOM UKURAN          ℹ️  [ON]  │
├─────────────────────────────────────┤
│ T     LP    LPG   LPH   LBW        │
│ [102] [82]  [92]  [59]  [36]       │
└─────────────────────────────────────┘

Keterangan:
T   = Tinggi/Panjang Celana
LP  = Lingkar Paha
LPG = Lingkar Pinggang
LPH = Lingkar Pinggul
LBW = Lingkar Bawah
```

#### Untuk ROMPI:
```
┌─────────────────────────────────────┐
│ 🔧 CUSTOM UKURAN          ℹ️  [ON]  │
├─────────────────────────────────────┤
│ T    LD   LB   K    M              │
│ [72] [50] [42] [38] [24]           │
└─────────────────────────────────────┘

Keterangan:
(Sama seperti kemeja, tanpa lengan)
T   = Tinggi Badan
LD  = Lebar Dada
LB  = Lebar Bahu
K   = Kerah
M   = Manset
```

---

## Logika Field Display

### Kemeja (Default)
```typescript
if (!jenisBarang || jenisBarang === JenisBarang.KEMEJA) {
  // Tampilkan:
  - Gender dan Tangan (berdampingan)
  - Custom: T, LD, LB, LPj, LPd, K, M
}
```

### Celana
```typescript
if (jenisBarang === JenisBarang.CELANA) {
  // Tampilkan:
  - Gender saja (tanpa tangan)
  - Custom: T, LP, LPG, LPH, LBW
}
```

### Rompi
```typescript
if (jenisBarang === JenisBarang.ROMPI) {
  // Tampilkan:
  - Gender saja (tanpa tangan)
  - Custom: T, LD, LB, K, M (tanpa lengan)
}
```

---

## Size Chart Integration

### Mapping Field Celana

Saat apply size chart celana, sistem akan mapping:

```typescript
customMeasurements = {
  tinggi: entry.tinggi || entry.panjang || 0,
  lingkarPaha: entry.lingkarPaha || entry.LP || 0,
  lingkarPinggang: entry.lingkarPinggang || entry.LPG || 0,
  lingkarPinggul: entry.lingkarPinggul || entry.LPH || 0,
  lingkarBawah: entry.lingkarBawah || entry.LBW || 0
}
```

### Mapping Field Kemeja

```typescript
customMeasurements = {
  tinggi: entry.tinggi || 0,
  lebarDada: entry.lebarDada || 0,
  lebarBahu: entry.lebarBahu || 0,
  lenganPanjang: entry.lenganPanjang || 0,
  lenganPendek: entry.lenganPendek || 0,
  kerah: entry.kerah || 0,
  manset: entry.manset || 0
}
```

---

## User Flow

### Flow 1: Input Kemeja Multiple Size

```
1. Pilih Jenis Barang: Kemeja
   ↓
2. Item #1:
   - Ukuran: M 📏 (pilih dari size chart)
   - Jumlah: 2
   - Gender: Pria | Tangan: Pendek
   ↓
3. Klik "Tambah Size Lain"
   ↓
4. Item #2:
   - Ukuran: L 📏
   - Jumlah: 1
   - Gender: Pria | Tangan: Pendek
   ↓
5. Custom Ukuran ON (jika perlu)
   - Field kemeja: T, LD, LB, LPj, LPd, K, M
```

### Flow 2: Input Celana Multiple Size

```
1. Pilih Jenis Barang: Celana
   ↓
2. Item #1:
   - Ukuran: 28 📏 (pilih dari size chart celana)
   - Jumlah: 2
   - Gender: Pria (tanpa tangan)
   ↓
3. Klik "Tambah Size Lain"
   ↓
4. Item #2:
   - Ukuran: 30 📏
   - Jumlah: 1
   - Gender: Pria
   ↓
5. Custom Ukuran ON (jika perlu)
   - Field celana: T, LP, LPG, LPH, LBW
```

---

## Contoh Penggunaan

### Skenario 1: Order Kemeja 3 Size

**Data:**
- Kode: 1234
- Jenis: Kemeja
- Size: M (2 pcs), L (3 pcs), XL (1 pcs)

**Input:**

```
Item #1:
┌─────────────────────────────────────┐
│ + TAMBAH SIZE LAIN                  │
├─────────────────────────────────────┤
│ Ukuran: [M] 📏    Jumlah: [2]       │
│ Gender: [Pria ▼]  Tangan: [PDK ▼]   │
└─────────────────────────────────────┘

Item #2:
┌─────────────────────────────────────┐
│ Ukuran: [L] 📏    Jumlah: [3]       │
│ Gender: [Pria ▼]  Tangan: [PDK ▼]   │
└─────────────────────────────────────┘

Item #3:
┌─────────────────────────────────────┐
│ Ukuran: [XL] 📏   Jumlah: [1]       │
│ Gender: [Pria ▼]  Tangan: [PDK ▼]   │
└─────────────────────────────────────┘

TOTAL: 6 PCS
```

---

### Skenario 2: Order Celana 4 Size

**Data:**
- Kode: 1368
- Jenis: Celana
- Size: 28 (1), 30 (2), 32 (1), 34 (1)

**Input:**

```
Item #1:
┌─────────────────────────────────────┐
│ + TAMBAH SIZE LAIN                  │
├─────────────────────────────────────┤
│ Ukuran: [28] 📏   Jumlah: [1]       │
│ Gender: [Pria ▼]                    │
│                                     │
│ Custom Ukuran: [ON]                 │
│ T: 102  LP: 82  LPG: 92            │
│ LPH: 59  LBW: 36                   │
└─────────────────────────────────────┘

Item #2:
┌─────────────────────────────────────┐
│ Ukuran: [30] 📏   Jumlah: [2]       │
│ Gender: [Pria ▼]                    │
│ (Custom dari size chart)            │
└─────────────────────────────────────┘

Item #3, #4: (sama seperti di atas)

TOTAL: 5 PCS
```

---

## Technical Implementation

### Dynamic Field Rendering

```typescript
{formData.jenisBarang === JenisBarang.CELANA ? (
  // Field Celana
  [
    { label: 'T', key: 'tinggi', fullName: 'Tinggi/Panjang' },
    { label: 'LP', key: 'lingkarPaha', fullName: 'Lingkar Paha' },
    { label: 'LPG', key: 'lingkarPinggang', fullName: 'Lingkar Pinggang' },
    { label: 'LPH', key: 'lingkarPinggul', fullName: 'Lingkar Pinggul' },
    { label: 'LBW', key: 'lingkarBawah', fullName: 'Lingkar Bawah' }
  ].map(field => <InputField {...field} />)
) : (
  // Field Kemeja
  [
    { label: 'T', key: 'tinggi', fullName: 'Tinggi Badan' },
    { label: 'LD', key: 'lebarDada', fullName: 'Lebar Dada' },
    // ... dst
  ].map(field => <InputField {...field} />)
)}
```

### Conditional Gender & Tangan

```typescript
{/* Gender dan Tangan berdampingan - hanya untuk Kemeja */}
{(!formData.jenisBarang || formData.jenisBarang === JenisBarang.KEMEJA) && (
  <div className="grid grid-cols-2 gap-3">
    <GenderSelect />
    <TanganSelect />
  </div>
)}

{/* Gender saja untuk Celana/Rompi */}
{(formData.jenisBarang === JenisBarang.CELANA || 
  formData.jenisBarang === JenisBarang.ROMPI) && (
  <GenderSelect />
)}
```

---

## Benefits

### Untuk User
1. 🎯 **Relevan** - Hanya tampil field yang diperlukan
2. 📊 **Konsisten** - Sesuai dengan size chart
3. 🚀 **Efisien** - Tidak ada field yang tidak terpakai
4. 💡 **Intuitif** - Tooltip menjelaskan singkatan

### Untuk Data Quality
1. ✅ **Akurat** - Field sesuai jenis barang
2. 📏 **Standar** - Mengikuti size chart
3. 🔍 **Validasi** - Hanya field yang valid
4. 💾 **Optimal** - Tidak menyimpan data kosong

---

## Responsive Design

### Mobile
- Grid 4 kolom untuk measurements
- Gender & Tangan: 2 kolom
- Tombol "Tambah Size": Full width

### Tablet & Desktop
- Grid tetap 4 kolom
- Spacing lebih lega
- Tooltip lebih jelas

---

## Accessibility

- ✅ Title attribute pada setiap field (hover untuk full name)
- ✅ Label yang jelas dengan uppercase
- ✅ Color contrast yang baik
- ✅ Keyboard navigation support

---

**Version:** 2.4.0  
**Last Updated:** 2026-03-12  
**Feature Status:** ✅ Active

# Perbedaan "Tambah Size" vs "Tambah Item"

## Overview

Ada 2 tombol berbeda untuk menambahkan data dengan fungsi yang berbeda:
1. **"Tambah Size"** - Menambah size dengan rincian yang sama
2. **"Tambah Item"** - Menambah item dengan rincian berbeda

---

## 1. Tambah Size

### Lokasi
Di bawah field "Ukuran" dan "Jumlah" pada setiap item

### Tampilan
```
┌─────────────────────────────────────┐
│ #1 RINCIAN ITEM                     │
│ Warna: Putih                        │
│ Model: Brad V2                      │
├─────────────────────────────────────┤
│ UKURAN (SIZE)    JUMLAH (PCS)       │
│ [M] 📏           [2]                │
├─────────────────────────────────────┤
│ + TAMBAH SIZE                       │ ← Tombol ini
└─────────────────────────────────────┘
```

### Fungsi
Menambahkan size baru **dengan rincian yang sama persis**:
- ✅ Warna sama
- ✅ Model sama
- ✅ Tipe saku sama
- ✅ Warna saku sama
- ✅ Bahan sama (untuk celana)
- ✅ Gender sama
- ✅ Tangan sama (untuk kemeja)

### Kapan Digunakan?
Ketika Anda ingin menambah size berbeda dalam **satu warna/model yang sama**.

### Contoh Penggunaan

**Skenario: Order Kemeja Putih, Model Brad V2**

```
Item #1 (Sebelum klik "Tambah Size"):
┌─────────────────────────────────────┐
│ Warna: Putih                        │
│ Model: Brad V2                      │
│ Saku: Polos / Abu                   │
├─────────────────────────────────────┤
│ Ukuran: M        Jumlah: 2          │
│ Gender: Pria     Tangan: Pendek     │
├─────────────────────────────────────┤
│ + TAMBAH SIZE                       │ ← Klik ini
└─────────────────────────────────────┘

Item #1 (Setelah klik "Tambah Size"):
┌─────────────────────────────────────┐
│ Warna: Putih     ← Sama             │
│ Model: Brad V2   ← Sama             │
│ Saku: Polos / Abu ← Sama            │
├─────────────────────────────────────┤
│ Ukuran: M        Jumlah: 2          │
│ Ukuran: [  ]     Jumlah: 1  🗑️     │ ← Size baru
│ Gender: Pria     Tangan: Pendek     │
├─────────────────────────────────────┤
│ + TAMBAH SIZE                       │
└─────────────────────────────────────┘
```

**Hasil:**
- Item #1 memiliki 2 size: M (2 pcs) dan L (1 pcs)
- **Total: 3 pcs kemeja putih dalam 1 item**

---

## 2. Tambah Item (Rincian Berbeda)

### Lokasi
Di bawah semua item, setelah list lengkap

### Tampilan
```
┌─────────────────────────────────────┐
│ #1 RINCIAN ITEM                     │
│ (Kemeja Putih, Brad V2)             │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ #2 RINCIAN ITEM                     │
│ (Kemeja Putih, Brad V2)             │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ + TAMBAH ITEM (RINCIAN BERBEDA)     │ ← Tombol ini
└─────────────────────────────────────┘
```

### Fungsi
Menambahkan item baru **dengan rincian yang bisa berbeda**:
- 🔄 Warna bisa berbeda
- 🔄 Model bisa berbeda
- 🔄 Tipe saku bisa berbeda
- 🔄 Warna saku bisa berbeda
- 🔄 Bahan bisa berbeda (untuk celana)

### Kapan Digunakan?
Ketika Anda ingin menambah item dengan **warna/model/rincian berbeda** dalam satu kode barang.

### Contoh Penggunaan

**Skenario: Order 1 Kode Barang, 2 Warna Berbeda**

```
Kode Barang: 1234

Item #1 (Kemeja Putih):
┌─────────────────────────────────────┐
│ Warna: Putih                        │
│ Model: Brad V2                      │
│ Saku: Polos / Abu                   │
├─────────────────────────────────────┤
│ Size M: 2 pcs                       │
│ Size L: 1 pcs                       │
└─────────────────────────────────────┘

Klik "TAMBAH ITEM (RINCIAN BERBEDA)"

Item #2 (Form Baru - Bisa Ubah Semua):
┌─────────────────────────────────────┐
│ Warna: [Hitam]   ← Bisa ubah        │
│ Model: [Brad V3] ← Bisa ubah        │
│ Saku: [Skotlait / Hitam] ← Bisa ubah│
├─────────────────────────────────────┤
│ Size XL: 2 pcs                      │
└─────────────────────────────────────┘
```

**Hasil:**
- Item #1: Kemeja Putih, Brad V2, M (2), L (1) = 3 pcs
- Item #2: Kemeja Hitam, Brad V3, XL (2) = 2 pcs
- **Total: 5 pcs dalam 1 kode barang**

---

## Perbandingan Visual

### Workflow "Tambah Size"
```
┌─────────────────────────────────────┐
│ #1 KEMEJA PUTIH - BRAD V2           │
├─────────────────────────────────────┤
│ Size M: 2 pcs                       │
│ [+ Tambah Size]                     │
│   ↓ (Menambah dalam item yang sama) │
│ Size M: 2 pcs                       │
│ Size L: 1 pcs  ← Rincian sama      │
│ [+ Tambah Size]                     │
│   ↓                                 │
│ Size M: 2 pcs                       │
│ Size L: 1 pcs                       │
│ Size XL: 1 pcs ← Rincian sama      │
└─────────────────────────────────────┘
Total: 1 item dengan 3 size berbeda
```

### Workflow "Tambah Item"
```
┌─────────────────────────────────────┐
│ #1 KEMEJA PUTIH - BRAD V2           │
│ Size M: 2, L: 1, XL: 1              │
└─────────────────────────────────────┘

[+ Tambah Item (Rincian Berbeda)]
   ↓ (Menambah item baru)

┌─────────────────────────────────────┐
│ #2 KEMEJA HITAM - BRAD V3           │
│ Size M: 3, L: 2                     │
└─────────────────────────────────────┘

Total: 2 item dengan rincian berbeda
```

---

## Use Cases

### Use Case 1: Multiple Size, Satu Warna

**Kebutuhan:**
- Kode: 1234
- Kemeja Putih, Brad V2
- Size: M (2), L (3), XL (1)

**Cara:**
1. Input Item #1: Putih, Brad V2, Size M, 2 pcs
2. Klik **"Tambah Size"**
3. Input Size L, 3 pcs
4. Klik **"Tambah Size"**
5. Input Size XL, 1 pcs

**Hasil:** 3 size dalam 1 warna

---

### Use Case 2: Multiple Warna, Satu Kode

**Kebutuhan:**
- Kode: 1234
- Kemeja Putih: M (2), L (1)
- Kemeja Hitam: M (3), XL (2)

**Cara:**
1. Input Item #1: Putih, Size M, 2 pcs
2. Klik **"Tambah Size"** → Size L, 1 pcs
3. Klik **"Tambah Item (Rincian Berbeda)"**
4. Input Item #2: Hitam, Size M, 3 pcs
5. Klik **"Tambah Size"** → Size XL, 2 pcs

**Hasil:** 2 warna berbeda dalam 1 kode barang

---

### Use Case 3: Celana Multiple Size

**Kebutuhan:**
- Kode: 1368
- Celana Hitam, American Drill, Armor
- Size: 28 (1), 30 (2), 32 (1), 34 (1)

**Cara:**
1. Input Item #1: Hitam, American Drill, Armor, Size 28, 1 pcs
2. Klik **"Tambah Size"** → Size 30, 2 pcs
3. Klik **"Tambah Size"** → Size 32, 1 pcs
4. Klik **"Tambah Size"** → Size 34, 1 pcs

**Hasil:** 4 size celana hitam

---

## Technical Implementation

### Data Structure
```typescript
interface SizeDetail {
  size: string;
  jumlah: number;
  warna: string;
  model: string;
  // ... rincian lainnya
  
  // Multiple sizes dalam satu item
  sizes?: Array<{
    size: string;
    jumlah: number;
  }>;
}
```

### handleAddSizeToItem (Tambah Size)
```typescript
const handleAddSizeToItem = (itemIndex: number) => {
  const currentItem = sizeDetails[itemIndex];
  
  // Inisialisasi array sizes jika belum ada
  if (!currentItem.sizes) {
    currentItem.sizes = [
      { size: currentItem.size, jumlah: currentItem.jumlah }
    ];
  }
  
  // Tambah size baru ke dalam array
  currentItem.sizes.push({ size: '', jumlah: 1 });
  
  // Rincian (warna, model, dll) tetap sama
};
```

### handleAddSize (Tambah Item)
```typescript
const handleAddSize = () => {
  // Ambil rincian dari item terakhir sebagai template
  const lastItem = formData.sizeDetails[formData.sizeDetails.length - 1];
  
  // Buat item baru dengan rincian yang bisa diubah
  const newItem = {
    size: '',
    jumlah: 1,
    warna: lastItem?.warna || '',
    model: lastItem?.model || 'Brad V2',
    // ... field lainnya
  };
  
  // Tambah di akhir list
  sizeDetails.push(newItem);
};
```

### Total Calculation
```typescript
const total = sizeDetails.reduce((sum, item) => {
  if (item.sizes && item.sizes.length > 0) {
    // Hitung dari array sizes
    return sum + item.sizes.reduce((s, sz) => s + (sz.jumlah || 0), 0);
  }
  // Hitung dari jumlah langsung
  return sum + (item.jumlah || 0);
}, 0);
```

---

## UI Indicators

### Tombol "Tambah Size"
- 🔵 Border biru
- 📏 Icon Plus kecil
- 📍 Posisi: Di bawah setiap item
- 💬 Text: "TAMBAH SIZE"

### Tombol "Tambah Item"
- 🟢 Border hijau (hover)
- ➕ Icon Plus besar
- 📍 Posisi: Di bawah semua item
- 💬 Text: "TAMBAH ITEM (RINCIAN BERBEDA)"

---

## Benefits

### Untuk "Tambah Size"
1. ⚡ **Cepat** - Tidak perlu input ulang rincian
2. ✅ **Konsisten** - Semua size pasti sama rinciannya
3. 🎯 **Akurat** - Mengurangi kesalahan input
4. 📊 **Terorganisir** - Size dikelompokkan per rincian

### Untuk "Tambah Item"
1. 🔄 **Fleksibel** - Bisa ubah semua rincian
2. 🎨 **Multi-warna** - Support multiple warna/model
3. 📦 **Satu Kode** - Semua dalam 1 kode barang
4. 💼 **Praktis** - Tidak perlu buat order terpisah

---

## Tips Penggunaan

### ✅ DO
- Gunakan "Tambah Size" untuk size berbeda dalam warna yang sama
- Gunakan "Tambah Item" untuk warna/model berbeda
- Kelompokkan size per warna untuk kemudahan tracking

### ❌ DON'T
- Jangan gunakan "Tambah Item" jika hanya beda size
- Jangan input manual jika bisa pakai "Tambah Size"
- Jangan campur warna berbeda dalam satu item

---

**Version:** 2.5.0  
**Last Updated:** 2026-03-12  
**Feature Status:** ✅ Active

# Multiple Sizes dalam Satu Item

## Overview

Fitur "Tambah Size" sekarang menambahkan form size baru **di dalam div item yang sama**, bukan membuat item terpisah. Ini memungkinkan multiple sizes dengan rincian yang sama (warna, model, dll) dalam satu grup.

---

## Cara Kerja

### Struktur Data

```typescript
SizeDetail {
  // Rincian item (warna, model, dll)
  warna: "Putih",
  model: "Brad V2",
  sakuType: "Polos",
  
  // Multiple sizes dalam array
  sizes: [
    { size: "M", jumlah: 2 },
    { size: "L", jumlah: 3 },
    { size: "XL", jumlah: 1 }
  ],
  
  // Field lainnya
  gender: "Pria",
  tangan: "Pendek"
}
```

---

## Visual Flow

### Awal (Single Size)

```
┌─────────────────────────────────────┐
│ #1 RINCIAN ITEM                     │
├─────────────────────────────────────┤
│ Warna: Putih                        │
│ Model: Brad V2                      │
│ Saku: Polos / Abu                   │
├─────────────────────────────────────┤
│ UKURAN (SIZE)    JUMLAH (PCS)       │
│ [M] 📏           [2]                │
├─────────────────────────────────────┤
│ + TAMBAH SIZE                       │
└─────────────────────────────────────┘
```

### Setelah Klik "Tambah Size"

```
┌─────────────────────────────────────┐
│ #1 RINCIAN ITEM                     │
├─────────────────────────────────────┤
│ Warna: Putih                        │
│ Model: Brad V2                      │
│ Saku: Polos / Abu                   │
├─────────────────────────────────────┤
│ UKURAN (SIZE)    JUMLAH (PCS)       │
│ [M] 📏           [2]                │
│                                     │
│ [L]              [3]          🗑️   │ ← Size baru
│                                     │
│ [XL]             [1]          🗑️   │ ← Size baru
├─────────────────────────────────────┤
│ + TAMBAH SIZE                       │
└─────────────────────────────────────┘
```

**Catatan:**
- Size pertama (M) tidak ada tombol hapus
- Size tambahan (L, XL) ada tombol hapus 🗑️
- Semua dalam 1 div item yang sama
- Rincian (warna, model) tetap sama untuk semua size

---

## Contoh Penggunaan

### Skenario 1: Kemeja Putih Multiple Size

**Kebutuhan:**
- Kemeja Putih, Brad V2, Saku Polos
- Size M: 2 pcs
- Size L: 3 pcs
- Size XL: 1 pcs

**Langkah:**

1. **Input Item #1:**
   ```
   Warna: Putih
   Model: Brad V2
   Saku: Polos / Abu
   Size: M
   Jumlah: 2
   ```

2. **Klik "Tambah Size":**
   ```
   Form baru muncul di bawah:
   Size: [  ]
   Jumlah: [1]
   ```

3. **Input Size L:**
   ```
   Size: L
   Jumlah: 3
   ```

4. **Klik "Tambah Size" lagi:**
   ```
   Form baru muncul:
   Size: [  ]
   Jumlah: [1]
   ```

5. **Input Size XL:**
   ```
   Size: XL
   Jumlah: 1
   ```

**Hasil Akhir:**
```
┌─────────────────────────────────────┐
│ KEMEJA PUTIH - BRAD V2              │
├─────────────────────────────────────┤
│ M:  2 pcs                           │
│ L:  3 pcs                           │
│ XL: 1 pcs                           │
├─────────────────────────────────────┤
│ TOTAL: 6 PCS                        │
└─────────────────────────────────────┘
```

---

### Skenario 2: Celana Hitam Multiple Size

**Kebutuhan:**
- Celana Hitam, American Drill, Armor
- Size 28: 1 pcs
- Size 30: 2 pcs
- Size 32: 1 pcs
- Size 34: 1 pcs

**Langkah:**

1. **Input Item #1:**
   ```
   Warna: Hitam
   Bahan: American Drill
   Model: Armor
   Size: 28
   Jumlah: 1
   ```

2. **Klik "Tambah Size" 3x dan input:**
   ```
   Size 30: 2 pcs
   Size 32: 1 pcs
   Size 34: 1 pcs
   ```

**Hasil:**
```
┌─────────────────────────────────────┐
│ CELANA HITAM - AMERICAN DRILL       │
│ MODEL ARMOR                         │
├─────────────────────────────────────┤
│ 28: 1 pcs                           │
│ 30: 2 pcs                           │
│ 32: 1 pcs                           │
│ 34: 1 pcs                           │
├─────────────────────────────────────┤
│ TOTAL: 5 PCS                        │
└─────────────────────────────────────┘
```

---

## Perbedaan dengan "Tambah Item"

### "Tambah Size" (Dalam Item yang Sama)

```
Item #1: Kemeja Putih
├─ Size M: 2 pcs    ← Rincian sama
├─ Size L: 3 pcs    ← Rincian sama
└─ Size XL: 1 pcs   ← Rincian sama
```

**Karakteristik:**
- ✅ Semua size dalam 1 div
- ✅ Warna sama
- ✅ Model sama
- ✅ Saku sama
- ✅ Gender & Tangan sama

### "Tambah Item" (Item Terpisah)

```
Item #1: Kemeja Putih
├─ Size M: 2 pcs
└─ Size L: 1 pcs

Item #2: Kemeja Hitam    ← Rincian berbeda
├─ Size M: 3 pcs
└─ Size XL: 2 pcs
```

**Karakteristik:**
- ✅ Item terpisah
- 🔄 Warna bisa berbeda
- 🔄 Model bisa berbeda
- 🔄 Saku bisa berbeda

---

## Fitur Hapus Size

### Tombol Hapus (🗑️)

**Lokasi:** Di sebelah kanan field Jumlah (kecuali size pertama)

**Fungsi:**
- Menghapus size dari array
- Jika hanya tersisa 1 size, kembali ke format single size
- Size pertama tidak bisa dihapus

**Contoh:**

```
Sebelum Hapus:
M: 2 pcs
L: 3 pcs  🗑️ ← Klik ini
XL: 1 pcs 🗑️

Setelah Hapus:
M: 2 pcs
XL: 1 pcs 🗑️
```

---

## Technical Implementation

### Data Structure

```typescript
// Single size (format lama)
{
  size: "M",
  jumlah: 2,
  warna: "Putih",
  model: "Brad V2"
}

// Multiple sizes (format baru)
{
  sizes: [
    { size: "M", jumlah: 2 },
    { size: "L", jumlah: 3 },
    { size: "XL", jumlah: 1 }
  ],
  warna: "Putih",
  model: "Brad V2"
}
```

### Functions

#### handleAddSizeToItem
```typescript
const handleAddSizeToItem = (itemIndex: number) => {
  const currentItem = sizeDetails[itemIndex];
  
  // Inisialisasi array sizes jika belum ada
  if (!currentItem.sizes) {
    currentItem.sizes = [
      { size: currentItem.size, jumlah: currentItem.jumlah }
    ];
  }
  
  // Tambah size baru
  currentItem.sizes.push({ size: '', jumlah: 1 });
};
```

#### handleRemoveSizeFromItem
```typescript
const handleRemoveSizeFromItem = (itemIndex: number, sizeIndex: number) => {
  const currentItem = sizeDetails[itemIndex];
  
  // Hapus size
  currentItem.sizes.splice(sizeIndex, 1);
  
  // Jika hanya 1 size tersisa, kembali ke format single
  if (currentItem.sizes.length === 1) {
    currentItem.size = currentItem.sizes[0].size;
    currentItem.jumlah = currentItem.sizes[0].jumlah;
    delete currentItem.sizes;
  }
};
```

#### handleUpdateSize
```typescript
const handleUpdateSize = (itemIndex, sizeIndex, field, value) => {
  const currentItem = sizeDetails[itemIndex];
  
  if (field === 'jumlah') {
    currentItem.sizes[sizeIndex].jumlah = parseInt(value) || 0;
  } else {
    currentItem.sizes[sizeIndex].size = value;
  }
};
```

### Total Calculation

```typescript
const total = sizeDetails.reduce((sum, item) => {
  if (item.sizes && item.sizes.length > 0) {
    // Hitung dari array sizes
    return sum + item.sizes.reduce((s, sz) => s + (sz.jumlah || 0), 0);
  }
  // Hitung dari jumlah langsung (single size)
  return sum + (item.jumlah || 0);
}, 0);
```

---

## UI Components

### Size Row (Multiple)

```jsx
{sd.sizes && sd.sizes.map((sizeItem, sIdx) => (
  <div className="grid grid-cols-2 gap-3">
    {/* Size Input */}
    <input 
      value={sizeItem.size}
      onChange={e => handleUpdateSize(i, sIdx, 'size', e.target.value)}
    />
    
    {/* Jumlah + Hapus */}
    <div className="flex gap-2">
      <input 
        type="number"
        value={sizeItem.jumlah}
        onChange={e => handleUpdateSize(i, sIdx, 'jumlah', e.target.value)}
      />
      
      {sIdx > 0 && (
        <button onClick={() => handleRemoveSizeFromItem(i, sIdx)}>
          <Trash2 />
        </button>
      )}
    </div>
  </div>
))}
```

---

## Benefits

### Untuk User
1. 📦 **Terorganisir** - Size dikelompokkan per rincian
2. 👁️ **Visual Jelas** - Semua size dalam 1 box
3. ⚡ **Cepat** - Tidak perlu scroll untuk lihat semua size
4. ✏️ **Mudah Edit** - Hapus size yang tidak perlu

### Untuk Data
1. 🎯 **Akurat** - Rincian pasti sama untuk semua size
2. 📊 **Konsisten** - Tidak ada duplikasi rincian
3. 💾 **Efisien** - Hemat storage (rincian hanya 1x)
4. 🔍 **Mudah Query** - Grouping otomatis per rincian

---

## Responsive Design

### Mobile
- Grid 2 kolom tetap
- Tombol hapus ukuran lebih kecil
- Spacing disesuaikan

### Desktop
- Grid 2 kolom dengan spacing lega
- Tombol hapus ukuran normal
- Hover effects lebih jelas

---

## Keyboard Shortcuts

- **Tab**: Navigasi antar field
- **Enter**: Submit (jika di field terakhir)
- **Escape**: Cancel edit (jika ada)

---

**Version:** 2.6.0  
**Last Updated:** 2026-03-12  
**Feature Status:** ✅ Active

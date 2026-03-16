# Changelog - UI Improvements

## Perubahan Layout Form Input

### 1. Ukuran dan Jumlah Berdampingan

**Sebelum:**
```
┌─────────────────────────────┐
│ UKURAN (NOMOR)              │
│ ┌─────────────────────────┐ │
│ │ 28                      │ │
│ └─────────────────────────┘ │
└─────────────────────────────┘

┌─────────────────────────────┐
│ KATEGORI (GNDR)             │
│ ┌─────────────────────────┐ │
│ │ LAKI-LAKI (P)          ▼│ │
│ └─────────────────────────┘ │
└─────────────────────────────┘

┌─────────────────────────────┐
│ JUMLAH (PCS)                │
│ ┌─────────────────────────┐ │
│ │ 1                       │ │
│ └─────────────────────────┘ │
└─────────────────────────────┘
```

**Sesudah (Lebih Rapi):**
```
┌──────────────┬──────────────┐
│ UKURAN       │ JUMLAH (PCS) │
│ (NOMOR)      │              │
│ ┌──────────┐ │ ┌──────────┐ │
│ │ 28       │ │ │ 1        │ │
│ └──────────┘ │ └──────────┘ │
└──────────────┴──────────────┘

┌─────────────────────────────┐
│ KATEGORI (GNDR)             │
│ ┌─────────────────────────┐ │
│ │ LAKI-LAKI (P)          ▼│ │
│ └─────────────────────────┘ │
└─────────────────────────────┘
```

**Keuntungan:**
- ✅ Lebih compact dan hemat ruang
- ✅ Mudah dibaca untuk multiple size
- ✅ Cocok untuk format celana (28=1, 30=2, dst)

**Contoh Multiple Size:**
```
Item #1: Size 28 | Qty 1
Item #2: Size 30 | Qty 2
Item #3: Size 32 | Qty 1
```

---

### 2. Tombol Scan Ulang di Warning Box

**Sebelum:**
```
┌────────────────────────────────────────────┐
│ ⚠️  NIH KERJAAN BELUM DISIMPEN!      💾   │
│     NANTI HILANG!                          │
└────────────────────────────────────────────┘
```

**Sesudah:**
```
┌────────────────────────────────────────────┐
│ ⚠️  NIH KERJAAN BELUM DISIMPEN!   📷  💾  │
│     NANTI HILANG!                          │
└────────────────────────────────────────────┘
     ↑ Tombol Scan Ulang (Camera Icon)
```

**Fitur Tombol Scan Ulang:**
- 📷 Icon kamera untuk scan ulang
- ✨ Hover effect (background lebih terang)
- 🔄 Reset form dan kembali ke pilihan metode input
- ⚡ Active scale animation saat diklik

**Fungsi:**
```javascript
onClick={() => {
  setScanResultGlobal(null);      // Hapus hasil scan
  setFormData(INITIAL_FORM_STATE); // Reset form
  setIsManualMode(false);          // Kembali ke mode pilihan
}}
```

---

## Contoh Penggunaan

### Skenario 1: Scan Celana dengan Multiple Size

**Input Scan:**
```
1368
Celana AMERICAN DRILL Model ARMOR

Ukuran:
28 = 1
30 = 2
32 = 1
34 = 1
```

**Hasil Form (Rapi):**
```
┌─────────────────────────────────────┐
│ #1  RINCIAN ITEM                    │
├──────────────┬──────────────────────┤
│ Warna: Hitam                        │
│ Model: Armor                        │
│ Bahan: American Drill               │
├──────────────┬──────────────────────┤
│ Size: 28     │ Qty: 1              │
│ Gender: Pria                        │
└──────────────┴──────────────────────┘

┌─────────────────────────────────────┐
│ #2  RINCIAN ITEM                    │
├──────────────┬──────────────────────┤
│ Size: 30     │ Qty: 2              │
└──────────────┴──────────────────────┘

┌─────────────────────────────────────┐
│ #3  RINCIAN ITEM                    │
├──────────────┬──────────────────────┤
│ Size: 32     │ Qty: 1              │
└──────────────┴──────────────────────┘

┌─────────────────────────────────────┐
│ #4  RINCIAN ITEM                    │
├──────────────┬──────────────────────┤
│ Size: 34     │ Qty: 1              │
└──────────────┴──────────────────────┘

TOTAL: 5 PCS
```

### Skenario 2: Hasil Scan Salah - Perlu Scan Ulang

**Langkah:**
1. Scan dokumen → Hasil tidak sesuai
2. Klik tombol 📷 (Camera) di warning box
3. Kembali ke pilihan metode input
4. Scan ulang dengan foto yang lebih jelas

---

## Technical Details

### Grid Layout untuk Size & Qty
```jsx
<div className="grid grid-cols-2 gap-3">
  <div className="flex flex-col gap-2">
    <label>Ukuran (Nomor)</label>
    <input value={sd.size} />
  </div>
  
  <div className="flex flex-col gap-2">
    <label>Jumlah (PCS)</label>
    <input type="number" value={sd.jumlah} />
  </div>
</div>
```

### Tombol Scan Ulang
```jsx
<button
  type="button"
  onClick={() => {
    setScanResultGlobal(null);
    setFormData(INITIAL_FORM_STATE);
    setIsManualMode(false);
  }}
  className="p-3 bg-white/20 rounded-2xl hover:bg-white/30 
             transition-all active:scale-95"
  title="Scan Ulang"
>
  <Camera size={20} className="opacity-80" />
</button>
```

---

## Responsive Design

### Mobile (< 640px)
- Size dan Qty tetap berdampingan (grid-cols-2)
- Warning box full width dengan icon lebih kecil

### Tablet & Desktop (≥ 640px)
- Layout optimal dengan spacing yang baik
- Warning box dengan padding lebih besar

---

## Accessibility

- ✅ Label yang jelas untuk screen readers
- ✅ Title attribute pada tombol scan ulang
- ✅ Keyboard navigation support
- ✅ Focus states yang jelas
- ✅ Color contrast yang baik

---

**Update Date:** 2026-03-12
**Version:** 2.1.0

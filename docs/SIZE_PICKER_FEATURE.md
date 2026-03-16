# Fitur Size Picker dengan Animasi

## Overview

Fitur baru yang memudahkan user untuk memilih size dari size chart dengan UI yang lebih intuitif, animasi smooth, dan filter otomatis berdasarkan jenis barang.

---

## Fitur Utama

### 1. Quick Size Picker (Icon Ruler di Input Size)

**Lokasi:** Icon ruler di sebelah kanan input ukuran

**Tampilan:**
```
┌─────────────────────────────────┐
│ UKURAN (NOMOR)                  │
│ ┌─────────────────────────────┐ │
│ │ 28                      📏  │ │ ← Klik icon ini
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

**Saat Diklik:**
```
┌─────────────────────────────────────────┐
│ 📏 PILIH SIZE DARI CHART           ✕   │
├─────────────────────────────────────────┤
│ ┌──────────────┐ ┌──────────────┐      │
│ │ Size Chart   │ │ Size Chart   │      │
│ │ Kemeja Pria  │ │ Celana Pria  │      │
│ │ 5 sizes      │ │ 8 sizes      │      │
│ └──────────────┘ └──────────────┘      │
├─────────────────────────────────────────┤
│ PILIH UKURAN:                           │
│ [S] [M] [L] [XL] [XXL]                 │
└─────────────────────────────────────────┘
```

---

### 2. Filter Otomatis Berdasarkan Jenis Barang

**Kemeja:**
- Hanya menampilkan size chart yang mengandung kata "kemeja" atau "shirt"
- Atau size chart yang TIDAK mengandung "celana"/"pants"
- Menampilkan size: S, M, L, XL, XXL, dll

**Celana:**
- Hanya menampilkan size chart yang mengandung kata "celana" atau "pants"
- Menampilkan size: 28, 30, 32, 34, 36, dll

**Rompi:**
- Sama seperti kemeja (tanpa lengan)

---

### 3. Animasi Show/Hide

**Animasi Masuk:**
```css
animate-in slide-in-from-top-2 fade-in duration-300
```

**Animasi Keluar:**
- Smooth fade out
- Slide up

**Transisi:**
- Toggle: 300ms
- Dropdown: 200ms
- Size buttons: Scale on click

---

### 4. Custom Ukuran dengan Show/Hide

**State OFF (Collapsed):**
```
┌─────────────────────────────────┐
│ 🔧 CUSTOM UKURAN      ℹ️  [OFF] │
└─────────────────────────────────┘
```

**State ON (Expanded):**
```
┌─────────────────────────────────────────┐
│ 🔧 CUSTOM UKURAN              ℹ️  [ON]  │
├─────────────────────────────────────────┤
│ 📏 GUNAKAN SIZE CHART                   │
│ [Pilih Chart ▼] [Pilih Size ▼]         │
├─────────────────────────────────────────┤
│ T    LD   LB   LPj  LPd   K    M       │
│ [72] [50] [42] [58] [22] [38] [24]     │
└─────────────────────────────────────────┘
```

---

## User Flow

### Flow 1: Quick Pick dari Input Size

```
1. User di field "Ukuran"
   ↓
2. Klik icon 📏 di kanan input
   ↓
3. Popup muncul dengan animasi slide-in
   ↓
4. Pilih size chart (otomatis filter by jenis barang)
   ↓
5. Pilih size (S/M/L atau 28/30/32)
   ↓
6. Size terisi + Custom measurements terisi otomatis
   ↓
7. Popup tutup dengan animasi
```

### Flow 2: Dari Custom Ukuran

```
1. Toggle "Custom Ukuran" ON
   ↓
2. Section expand dengan animasi
   ↓
3. Pilih chart dari dropdown
   ↓
4. Dropdown kedua muncul dengan animasi
   ↓
5. Pilih size
   ↓
6. Semua field terisi otomatis
   ↓
7. Edit manual jika perlu
```

---

## Contoh Penggunaan

### Skenario 1: Input Celana dengan Multiple Size

**Data:**
- Kode: 1368
- Jenis: Celana
- Size: 28 (2 pcs), 30 (1 pcs), 32 (1 pcs)

**Langkah:**

1. **Item #1 - Size 28:**
   ```
   Ukuran: [28] 📏 ← Klik icon
   → Pilih "Size Chart Celana Pria"
   → Pilih "28"
   → Otomatis terisi + custom measurements
   Jumlah: [2]
   ```

2. **Tambah Item (Klik "+ Tambah Item"):**
   ```
   Item #2 - Size 30:
   Ukuran: [30] 📏 ← Klik icon
   → Chart masih terpilih
   → Pilih "30"
   Jumlah: [1]
   ```

3. **Tambah Item lagi:**
   ```
   Item #3 - Size 32:
   Ukuran: [32] 📏
   → Pilih "32"
   Jumlah: [1]
   ```

**Hasil:**
```
TOTAL: 4 PCS
- Size 28: 2 pcs
- Size 30: 1 pcs
- Size 32: 1 pcs
```

---

### Skenario 2: Kemeja dengan Custom Measurements

**Langkah:**

1. **Pilih Jenis Barang: Kemeja**

2. **Item #1:**
   ```
   Ukuran: [M] 📏
   → Popup muncul
   → Hanya tampil size chart kemeja
   → Pilih "Size Chart Kemeja Pria"
   → Pilih "M"
   ```

3. **Custom Ukuran ON:**
   ```
   Toggle ON → Section expand
   
   Measurements terisi:
   T: 74  LD: 52  LB: 44  LPj: 60
   LPd: 24  K: 40  M: 26
   ```

4. **Edit Manual:**
   ```
   User ubah LPj dari 60 → 61
   (Sesuai permintaan customer)
   ```

---

## Technical Details

### State Management

```typescript
const [showSizeChartPicker, setShowSizeChartPicker] = useState<number | null>(null);
const [selectedSizeChart, setSelectedSizeChart] = useState<string | null>(null);
```

### Filter Logic

```typescript
availableSizeCharts.filter(chart => {
  const chartName = chart.name.toLowerCase();
  
  if (formData.jenisBarang === JenisBarang.CELANA) {
    return chartName.includes('celana') || chartName.includes('pants');
  } else if (formData.jenisBarang === JenisBarang.KEMEJA) {
    return chartName.includes('kemeja') || 
           chartName.includes('shirt') || 
           (!chartName.includes('celana') && !chartName.includes('pants'));
  }
  
  return true;
})
```

### Apply Size Chart

```typescript
const handleApplySizeChart = (itemIndex: number, chartId: string, sizeFromChart: string) => {
  const chart = availableSizeCharts.find(c => c.id === chartId);
  const entry = chart.entries.find(e => e.size === sizeFromChart);
  
  // Update size + custom measurements
  setFormData(prev => {
    const next = [...(prev.sizeDetails || [])];
    next[itemIndex] = {
      ...next[itemIndex],
      size: entry.size,
      isCustomSize: true,
      customMeasurements: { ...entry }
    };
    return { ...prev, sizeDetails: next };
  });
  
  // Close picker
  setShowSizeChartPicker(null);
  setSelectedSizeChart(null);
};
```

---

## UI Components

### Quick Picker Button

```jsx
<button
  type="button"
  onClick={() => setShowSizeChartPicker(showSizeChartPicker === i ? null : i)}
  className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg 
    ${showSizeChartPicker === i 
      ? 'bg-purple-500 text-white' 
      : 'bg-purple-50 text-purple-500'}`}
>
  <Ruler size={14} />
</button>
```

### Size Chart Cards

```jsx
<div className="grid grid-cols-2 gap-2">
  {filteredCharts.map(chart => (
    <div 
      className={`p-3 rounded-xl cursor-pointer transition-all
        ${selectedSizeChart === chart.id 
          ? 'bg-purple-500 text-white' 
          : 'bg-white hover:border-purple-400'}`}
      onClick={() => setSelectedSizeChart(chart.id)}
    >
      <p className="text-[9px] font-black">{chart.name}</p>
      <p className="text-[7px] text-slate-400">{chart.entries.length} sizes</p>
    </div>
  ))}
</div>
```

### Size Buttons Grid

```jsx
<div className="grid grid-cols-4 gap-2">
  {chart.entries.map(entry => (
    <button
      onClick={() => {
        handleApplySizeChart(i, chartId, entry.size);
        setShowSizeChartPicker(null);
      }}
      className="py-2.5 rounded-xl font-black hover:bg-purple-500 
                 hover:text-white active:scale-95"
    >
      {entry.size}
    </button>
  ))}
</div>
```

---

## Animations

### CSS Classes Used

```css
/* Slide in from top */
.animate-in.slide-in-from-top-2 {
  animation: slideInFromTop 0.3s ease-out;
}

/* Fade in */
.fade-in {
  animation: fadeIn 0.3s ease-out;
}

/* Slide in from right */
.slide-in-from-right-2 {
  animation: slideInFromRight 0.2s ease-out;
}

/* Scale on active */
.active\:scale-95:active {
  transform: scale(0.95);
}
```

---

## Benefits

### Untuk User
1. ⚡ **Lebih Cepat** - 2 klik untuk pilih size + measurements
2. 🎯 **Akurat** - Data langsung dari size chart
3. 🔍 **Smart Filter** - Hanya tampil chart yang relevan
4. ✨ **Smooth UX** - Animasi yang natural

### Untuk Multiple Size
1. 📊 **Konsisten** - Semua size dari chart yang sama
2. 🚀 **Efisien** - Tidak perlu buka-tutup menu
3. 💡 **Intuitif** - Icon ruler langsung di input
4. 🔄 **Reusable** - Chart terpilih tetap aktif

---

## Responsive Design

### Mobile (< 640px)
- Size chart cards: 2 kolom
- Size buttons: 4 kolom
- Popup: Full width dengan padding

### Tablet (640px - 1024px)
- Size chart cards: 2 kolom
- Size buttons: 4-5 kolom
- Popup: Max width 500px

### Desktop (> 1024px)
- Size chart cards: 2-3 kolom
- Size buttons: 5-6 kolom
- Popup: Max width 600px

---

## Keyboard Navigation

- ✅ Tab untuk navigasi antar field
- ✅ Enter untuk select size
- ✅ Escape untuk close picker
- ✅ Arrow keys untuk navigasi size buttons

---

**Version:** 2.3.0  
**Last Updated:** 2026-03-12  
**Feature Status:** ✅ Active

# Fitur Size Chart di Form Input

## Overview

Fitur baru yang memudahkan user untuk menggunakan size chart yang sudah dibuat di menu Account, sehingga tidak perlu input manual ukuran custom setiap kali.

---

## Fitur Utama

### 1. Size Chart Selector

**Lokasi:** Di dalam Custom Ukuran section (toggle purple)

**Cara Kerja:**
```
┌─────────────────────────────────────────┐
│ 🔧 CUSTOM UKURAN              ℹ️  [ON] │
├─────────────────────────────────────────┤
│ 📏 GUNAKAN SIZE CHART                   │
│ ┌──────────────┬──────────────────────┐ │
│ │ Pilih Chart ▼│ Pilih Size ▼        │ │
│ └──────────────┴──────────────────────┘ │
│                                         │
│ T    LD   LB   LPj  LPd   K    M      │
│ [0]  [0]  [0]  [0]  [0]  [0]  [0]     │
└─────────────────────────────────────────┘
```

**Langkah Penggunaan:**
1. Toggle "Custom Ukuran" ON (warna purple)
2. Pilih Size Chart dari dropdown pertama
3. Pilih Size yang diinginkan dari dropdown kedua
4. Ukuran otomatis terisi sesuai data size chart
5. Bisa edit manual jika perlu penyesuaian

---

### 2. Info Button (ℹ️)

**Lokasi:** Di sebelah toggle Custom Ukuran

**Fungsi:** Menampilkan popup informasi singkatan ukuran

**Isi Popup:**

#### Kemeja
```
┌─────────────────────────────────┐
│ ℹ️  SINGKATAN UKURAN            │
├─────────────────────────────────┤
│ 🟢 KEMEJA                       │
│ T   → Tinggi Badan              │
│ LD  → Lebar Dada                │
│ LB  → Lebar Bahu                │
│ LPj → Lengan Panjang            │
│ LPd → Lengan Pendek             │
│ K   → Kerah                     │
│ M   → Manset                    │
├─────────────────────────────────┤
│ 🟣 CELANA                       │
│ T   → Tinggi/Panjang Celana     │
│ LPG → Lingkar Pinggang          │
│ LPH → Lingkar Pinggul           │
│ LPA → Lingkar Paha              │
│ LBW → Lingkar Bawah             │
└─────────────────────────────────┘
```

---

## Integrasi dengan Size Chart Menu

### Data Source
Size chart diambil dari localStorage:
```javascript
const savedCharts = localStorage.getItem('bradwear_size_charts');
```

### Format Data
```json
{
  "id": "abc123",
  "name": "Size Chart Kemeja Pria",
  "entries": [
    {
      "size": "S",
      "tinggi": 72,
      "lebarDada": 50,
      "lebarBahu": 42,
      "lenganPanjang": 58,
      "lenganPendek": 22,
      "kerah": 38,
      "manset": 24
    },
    {
      "size": "M",
      "tinggi": 74,
      "lebarDada": 52,
      ...
    }
  ]
}
```

---

## User Flow

### Skenario 1: Menggunakan Size Chart

```
1. User scan rekapan atau input manual
   ↓
2. Tambah item baru
   ↓
3. Toggle "Custom Ukuran" ON
   ↓
4. Pilih "Size Chart Kemeja Pria" dari dropdown
   ↓
5. Pilih size "M" dari dropdown kedua
   ↓
6. Ukuran otomatis terisi:
   - T: 74
   - LD: 52
   - LB: 44
   - LPj: 60
   - LPd: 24
   - K: 40
   - M: 26
   ↓
7. Edit manual jika perlu (misal: LPj jadi 61)
   ↓
8. Simpan order
```

### Skenario 2: Cek Singkatan

```
1. User bingung arti "LD"
   ↓
2. Klik icon ℹ️ di sebelah toggle
   ↓
3. Popup muncul dengan daftar singkatan
   ↓
4. User lihat: LD = Lebar Dada
   ↓
5. Klik "Mengerti" untuk tutup popup
```

---

## Layout & Positioning

### Before (Tanpa Size Chart)
```
┌─────────────────────────────────┐
│ CUSTOM UKURAN          [Toggle] │
│                                 │
│ T  LD  LB  LPj  LPd  K  M      │
│ [0][0][0][0] [0] [0][0]        │
└─────────────────────────────────┘
```

### After (Dengan Size Chart)
```
┌─────────────────────────────────┐
│ CUSTOM UKURAN      ℹ️  [Toggle] │
│                                 │
│ 📏 GUNAKAN SIZE CHART           │
│ [Pilih Chart ▼] [Pilih Size ▼] │
│                                 │
│ T  LD  LB  LPj  LPd  K  M      │
│ [74][52][44][60][24][40][26]   │
└─────────────────────────────────┘
```

**Keuntungan Layout:**
- ✅ Size chart selector di atas grid input
- ✅ Info button mudah diakses
- ✅ Grid input tetap rapi 4 kolom
- ✅ Responsive untuk mobile

---

## Technical Implementation

### State Management
```typescript
const [showInfoPopup, setShowInfoPopup] = useState(false);
const [selectedSizeChart, setSelectedSizeChart] = useState<string | null>(null);
const [availableSizeCharts, setAvailableSizeCharts] = useState<SizeChart[]>([]);
```

### Apply Size Chart Function
```typescript
const handleApplySizeChart = (itemIndex: number, chartId: string, sizeFromChart: string) => {
  const chart = availableSizeCharts.find(c => c.id === chartId);
  const entry = chart.entries.find(e => e.size === sizeFromChart);
  
  // Update formData dengan measurements dari size chart
  setFormData(prev => {
    const next = [...(prev.sizeDetails || [])];
    next[itemIndex] = {
      ...next[itemIndex],
      size: entry.size,
      isCustomSize: true,
      customMeasurements: {
        tinggi: entry.tinggi || 0,
        lebarDada: entry.lebarDada || 0,
        // ... dst
      }
    };
    return { ...prev, sizeDetails: next };
  });
};
```

---

## UI Components

### Info Button
```jsx
<button
  type="button"
  onClick={() => setShowInfoPopup(true)}
  className="p-2 rounded-lg bg-blue-50 text-blue-500"
  title="Info Singkatan"
>
  <Info size={14} />
</button>
```

### Size Chart Selector
```jsx
<div className="grid grid-cols-2 gap-2">
  <select onChange={(e) => setSelectedSizeChart(e.target.value)}>
    <option value="">Pilih Chart</option>
    {availableSizeCharts.map(chart => (
      <option key={chart.id} value={chart.id}>{chart.name}</option>
    ))}
  </select>
  
  {selectedSizeChart && (
    <select onChange={(e) => handleApplySizeChart(i, selectedSizeChart, e.target.value)}>
      <option value="">Pilih Size</option>
      {chart.entries.map(entry => (
        <option key={entry.size} value={entry.size}>{entry.size}</option>
      ))}
    </select>
  )}
</div>
```

---

## Benefits

### Untuk User
1. ⚡ **Lebih Cepat** - Tidak perlu input manual setiap kali
2. ✅ **Konsisten** - Ukuran sesuai standar size chart
3. 📚 **Mudah Dipahami** - Info singkatan selalu tersedia
4. 🎯 **Akurat** - Mengurangi kesalahan input

### Untuk Workflow
1. 🔄 **Reusable** - Size chart bisa dipakai berkali-kali
2. 📊 **Terstandar** - Semua order menggunakan ukuran yang sama
3. 🚀 **Efisien** - Hemat waktu input data
4. 💾 **Tersimpan** - Size chart tersimpan di Account menu

---

## Compatibility

### Jenis Barang
- ✅ Kemeja (7 field: T, LD, LB, LPj, LPd, K, M)
- ✅ Celana (5 field: T, LPG, LPH, LPA, LBW)
- ✅ Rompi (sama seperti kemeja, tanpa lengan)

### Size Chart Types
- ✅ Size Chart Kemeja
- ✅ Size Chart Celana
- ✅ Size Chart Custom (user-defined)

---

## Future Enhancements

### Possible Improvements
1. 🔍 **Search** - Cari size chart by name
2. 📱 **Quick Access** - Shortcut ke size chart favorit
3. 🎨 **Preview** - Lihat semua size dalam chart sebelum pilih
4. 📤 **Export/Import** - Share size chart antar user
5. 🔔 **Suggestions** - Rekomendasi size chart berdasarkan jenis barang

---

**Version:** 2.2.0  
**Last Updated:** 2026-03-12  
**Feature Status:** ✅ Active

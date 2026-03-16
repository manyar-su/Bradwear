# Info Button untuk Custom Measurements

## Overview

Tombol informasi (ℹ️) ditambahkan di setiap section Custom Ukuran untuk memudahkan user melihat penjelasan singkatan ukuran.

---

## Lokasi Tombol Info

### 1. Di Custom Ukuran Toggle Section

**Lokasi:** Di sebelah toggle switch Custom Ukuran

```
┌─────────────────────────────────────────────────┐
│ 📏 CUSTOM UKURAN              ℹ️  [Toggle]      │
│                                                 │
│ [Gunakan Size Chart]                            │
│ T    LD   LB   LPj  LPd  K   M   LPr  LPg      │
│ [84] [132] [54] [26] [0] [0] [0] [142] [142]   │
└─────────────────────────────────────────────────┘
```

**Fungsi:**
- Klik tombol ℹ️ untuk melihat penjelasan singkatan
- Popup akan muncul dengan daftar lengkap singkatan

---

### 2. Di Custom Measurements Display (Sizes Array)

**Lokasi:** Di header "Ukuran Custom" untuk setiap size dalam array

```
┌─────────────────────────────────────────────────┐
│ 👤 ISKANDAR T.                                  │
│ Ukuran: CUSTOM      Jumlah: 1  🗑️              │
│ ┌─────────────────────────────────────────────┐ │
│ │ 📏 Ukuran Custom                    ℹ️      │ │
│ │ T: 84  LD: 132  LB: 54  LPj: 26  LPd: 0    │ │
│ │ K: 0   M: 0     LPr: 142  LPg: 142         │ │
│ └─────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

**Fungsi:**
- Klik tombol ℹ️ untuk melihat penjelasan singkatan
- Berguna saat melihat custom measurements dari OCR

---

## Info Popup Content

### Tampilan Popup

```
┌─────────────────────────────────────────────────┐
│ ℹ️  Singkatan Ukuran                      ✕    │
├─────────────────────────────────────────────────┤
│                                                 │
│ ┌─────────────────────────────────────────────┐ │
│ │ KEMEJA                                      │ │
│ │ T    = Tinggi Badan                         │ │
│ │ LD   = Lebar Dada                           │ │
│ │ LB   = Lebar Bahu                           │ │
│ │ LPj  = Lengan Panjang                       │ │
│ │ LPd  = Lengan Pendek                        │ │
│ │ K    = Kerah                                │ │
│ │ M    = Manset                               │ │
│ │ LPr  = Lingkar Perut                        │ │
│ │ LPg  = Lingkar Pinggul                      │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│ ┌─────────────────────────────────────────────┐ │
│ │ CELANA                                      │ │
│ │ T    = Tinggi/Panjang Celana                │ │
│ │ LPG  = Lingkar Pinggang                     │ │
│ │ LPH  = Lingkar Pinggul                      │ │
│ │ LPA  = Lingkar Paha                         │ │
│ │ LBW  = Lingkar Bawah                        │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│ [MENGERTI]                                      │
└─────────────────────────────────────────────────┘
```

---

## UI Specifications

### Button Style

**Default State:**
```css
background: blue-50 (light mode) / slate-800 (dark mode)
color: blue-500 (light mode) / blue-400 (dark mode)
padding: 8px (toggle section) / 6px (sizes array)
border-radius: 8px
```

**Hover State:**
```css
background: blue-100 (light mode) / slate-700 (dark mode)
transition: all 0.2s
```

**Icon:**
- Component: `<Info />` from lucide-react
- Size: 14px (toggle section) / 12px (sizes array)

---

## Implementation Details

### Location 1: Toggle Section

```tsx
<div className="flex items-center gap-2">
  <button
    type="button"
    onClick={() => setShowInfoPopup(true)}
    className={`p-2 rounded-lg transition-all ${
      isDarkMode 
        ? 'bg-slate-800 text-blue-400 hover:bg-slate-700' 
        : 'bg-blue-50 text-blue-500 hover:bg-blue-100'
    }`}
    title="Info Singkatan"
  >
    <Info size={14} />
  </button>
  <button type="button" onClick={toggleCustomSize}>
    {/* Toggle Switch */}
  </button>
</div>
```

### Location 2: Sizes Array Display

```tsx
<div className="flex items-center justify-between mb-3">
  <div className="flex items-center gap-2">
    <Ruler size={12} className="text-purple-500" />
    <span className="text-[8px] font-black text-purple-600 uppercase tracking-widest">
      Ukuran Custom
    </span>
  </div>
  <button
    type="button"
    onClick={() => setShowInfoPopup(true)}
    className={`p-1.5 rounded-lg transition-all ${
      isDarkMode 
        ? 'bg-slate-800 text-blue-400 hover:bg-slate-700' 
        : 'bg-blue-50 text-blue-500 hover:bg-blue-100'
    }`}
    title="Info Singkatan"
  >
    <Info size={12} />
  </button>
</div>
```

---

## User Flow

### Scenario 1: User Tidak Tahu Singkatan

1. User melihat field "LPr" dan tidak tahu artinya
2. User klik tombol ℹ️ di sebelah "Custom Ukuran"
3. Popup muncul dengan daftar lengkap singkatan
4. User menemukan: "LPr = Lingkar Perut"
5. User klik "MENGERTI" untuk menutup popup

### Scenario 2: User Melihat OCR Result

1. OCR mendeteksi custom measurements dengan nama
2. Display menampilkan: "T: 84, LD: 132, LB: 54..."
3. User tidak yakin apa arti "LD"
4. User klik tombol ℹ️ di header "Ukuran Custom"
5. Popup muncul: "LD = Lebar Dada"
6. User paham dan melanjutkan

---

## Benefits

### 1. Self-Service Help
- User tidak perlu bertanya atau mencari dokumentasi
- Informasi langsung tersedia di UI
- Mengurangi learning curve

### 2. Context-Aware
- Tombol muncul di tempat yang relevan
- Dekat dengan data yang memerlukan penjelasan
- Tidak mengganggu workflow

### 3. Consistent UX
- Menggunakan popup yang sama dengan fitur lain
- Icon dan style konsisten
- Familiar untuk user

### 4. Accessibility
- Tooltip "Info Singkatan" saat hover
- Keyboard accessible
- Screen reader friendly

---

## Edge Cases

### Case 1: Popup Sudah Terbuka

**Behavior:** Klik tombol info lagi akan menutup popup

**Implementation:**
```tsx
onClick={() => setShowInfoPopup(!showInfoPopup)}
```

### Case 2: Multiple Custom Sizes

**Behavior:** Setiap size memiliki tombol info sendiri, semua membuka popup yang sama

**Reason:** Popup content sama untuk semua, tidak perlu duplikasi

### Case 3: Dark Mode

**Behavior:** Button style otomatis menyesuaikan dengan theme

**Implementation:** Conditional className based on `isDarkMode`

---

## Testing Checklist

- [ ] Tombol info muncul di toggle section
- [ ] Tombol info muncul di sizes array display
- [ ] Klik tombol membuka popup
- [ ] Popup menampilkan singkatan lengkap
- [ ] Popup dapat ditutup dengan tombol "MENGERTI"
- [ ] Popup dapat ditutup dengan klik X
- [ ] Style konsisten di light/dark mode
- [ ] Tooltip "Info Singkatan" muncul saat hover
- [ ] Tidak ada error di console
- [ ] Responsive di mobile

---

## Future Enhancements

### 1. Contextual Info

Show only relevant abbreviations based on jenis barang:
- Kemeja → Show kemeja fields only
- Celana → Show celana fields only

### 2. Interactive Tooltips

Instead of popup, show tooltip on hover over each field label:
```
[T] ← Hover shows "Tinggi Badan"
```

### 3. Search in Popup

Add search box in popup to quickly find specific abbreviation:
```
[🔍 Cari singkatan...]
```

---

## Related Files

- `screens/ScanScreen.tsx` - Main implementation
- `docs/README.md` - Documentation index
- `docs/CHANGELOG_v2.6.0.md` - Version history

---

**Version:** 2.6.1  
**Last Updated:** 2026-03-12  
**Feature Status:** ✅ Active

# Changelog v2.6.1

**Release Date:** 2026-03-12  
**Type:** Minor Update - UI Enhancement

---

## 🎉 New Feature

### Info Button untuk Custom Measurements

Menambahkan tombol informasi (ℹ️) di setiap section Custom Ukuran untuk memudahkan user melihat penjelasan singkatan ukuran.

---

## 📍 Lokasi Tombol

### 1. Di Custom Ukuran Toggle Section

**Visual:**
```
┌─────────────────────────────────────────────────┐
│ 📏 CUSTOM UKURAN              ℹ️  [Toggle]      │
│                                                 │
│ [Gunakan Size Chart]                            │
│ T    LD   LB   LPj  LPd  K   M   LPr  LPg      │
└─────────────────────────────────────────────────┘
```

**Lokasi:** Di sebelah toggle switch Custom Ukuran  
**Fungsi:** Klik untuk melihat popup penjelasan singkatan

### 2. Di Custom Measurements Display (Sizes Array)

**Visual:**
```
┌─────────────────────────────────────────────────┐
│ 👤 ISKANDAR T.                                  │
│ ┌─────────────────────────────────────────────┐ │
│ │ 📏 Ukuran Custom                    ℹ️      │ │
│ │ T: 84  LD: 132  LB: 54  LPj: 26            │ │
│ └─────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

**Lokasi:** Di header "Ukuran Custom" untuk setiap size  
**Fungsi:** Klik untuk melihat popup penjelasan singkatan

---

## 🎨 UI Specifications

### Button Style

**Light Mode:**
- Background: `bg-blue-50`
- Text: `text-blue-500`
- Hover: `bg-blue-100`

**Dark Mode:**
- Background: `bg-slate-800`
- Text: `text-blue-400`
- Hover: `bg-slate-700`

**Size:**
- Toggle section: 14px icon, 8px padding
- Sizes array: 12px icon, 6px padding

**Tooltip:** "Info Singkatan"

---

## 💡 Benefits

### 1. Self-Service Help
User tidak perlu bertanya atau mencari dokumentasi eksternal untuk memahami singkatan.

### 2. Context-Aware
Tombol muncul di tempat yang relevan, dekat dengan data yang memerlukan penjelasan.

### 3. Consistent UX
Menggunakan popup yang sama dengan fitur info lainnya, style konsisten.

### 4. Accessibility
- Tooltip saat hover
- Keyboard accessible
- Screen reader friendly

---

## 🔧 Implementation

### Files Changed

**screens/ScanScreen.tsx:**
- Added info button in Custom Ukuran toggle section (line ~1193)
- Added info button in sizes array custom measurements display (line ~976)

### Code Changes

```tsx
// Location 1: Toggle Section
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

// Location 2: Sizes Array Display
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
```

---

## 📚 Documentation

### New Files

- **docs/INFO_BUTTON_FEATURE.md** - Complete documentation for info button feature

### Updated Files

- **docs/README.md** - Added INFO_BUTTON_FEATURE.md to index
- **docs/CHANGELOG_v2.6.1.md** - This file

---

## 🧪 Testing

### Test Checklist

- [x] Tombol info muncul di toggle section
- [x] Tombol info muncul di sizes array display
- [x] Klik tombol membuka popup
- [x] Popup menampilkan singkatan lengkap (Kemeja & Celana)
- [x] Popup dapat ditutup dengan tombol "MENGERTI"
- [x] Popup dapat ditutup dengan klik X
- [x] Style konsisten di light/dark mode
- [x] Tooltip "Info Singkatan" muncul saat hover
- [x] No TypeScript errors
- [x] No console errors

### User Flow Test

**Scenario:** User tidak tahu arti "LPr"

1. ✅ User melihat field "LPr: 142"
2. ✅ User klik tombol ℹ️
3. ✅ Popup muncul dengan daftar singkatan
4. ✅ User menemukan: "LPr = Lingkar Perut"
5. ✅ User klik "MENGERTI"
6. ✅ Popup tertutup

---

## 🔄 Backward Compatibility

### No Breaking Changes

- Existing functionality tidak terpengaruh
- Popup yang sama digunakan (sudah ada sebelumnya)
- Hanya menambahkan tombol baru

---

## 📊 Impact

### User Experience

**Before:**
- User harus menebak atau bertanya arti singkatan
- Tidak ada help langsung di UI

**After:**
- User dapat langsung melihat penjelasan dengan 1 klik
- Self-service help tersedia di context

### Code Quality

- Clean implementation
- Reuses existing popup component
- Consistent with design system

---

## 🚀 Future Enhancements

### Planned for v2.7.0

1. **Contextual Info**
   - Show only relevant abbreviations based on jenis barang
   - Kemeja → Show kemeja fields only
   - Celana → Show celana fields only

2. **Interactive Tooltips**
   - Show tooltip on hover over each field label
   - No need to open popup for quick reference

3. **Search in Popup**
   - Add search box to quickly find specific abbreviation

---

## 📞 Related

- **Main Feature:** Custom Measurements (v2.6.0)
- **Related Docs:** docs/INFO_BUTTON_FEATURE.md
- **Previous Version:** v2.6.0

---

**Version:** 2.6.1  
**Release Date:** 2026-03-12  
**Status:** ✅ Stable  
**Type:** Minor Update

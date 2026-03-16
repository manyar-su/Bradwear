# Layout Improvements v2.6.3

## Overview

Perbaikan layout form fields untuk meningkatkan simetri, konsistensi, dan mencegah overflow pada mobile devices.

---

## 🎯 Masalah yang Diperbaiki

### 1. Field Jumlah Keluar dari Container

**Before:**
```
┌─────────────────────────────────────┐
│ UKURAN (SIZE)    JUMLAH (PCS)       │
│ [CUST] 📏        [1] 🗑️            │ ← Delete button menyebabkan overflow
└─────────────────────────────────────┘
```

**Problem:**
- Delete button (🗑️) di dalam flex container dengan input
- Menyebabkan field jumlah menyempit
- Layout tidak simetris

**After:**
```
┌─────────────────────────────────────┐
│ UKURAN (SIZE)                       │
│ [CUSTOM] 📏                         │
│                                     │
│ JUMLAH (PCS)                        │
│ [1]                                 │
│                                     │
│ [🗑️ HAPUS SIZE]                    │ ← Separate button
└─────────────────────────────────────┘
```

**Solution:**
- Changed from `grid-cols-2` to `space-y-3` (vertical layout)
- Moved delete button outside flex container
- Full-width button with text label

---

### 2. Gender dan Tipe Lengan Tidak Simetris

**Before:**
```
┌─────────────────────────────────────┐
│ KATEGORI (GNDR)  TIPE LENGAN        │
│ [Laki-Laki]      [Panjang]          │ ← Horizontal, cramped
└─────────────────────────────────────┘
```

**Problem:**
- Horizontal layout (grid-cols-2) terlalu sempit di mobile
- Text label terpotong
- Tidak konsisten dengan field lain

**After:**
```
┌─────────────────────────────────────┐
│ KATEGORI (GENDER)                   │
│ [Laki-Laki (P)]                     │
│                                     │
│ TIPE LENGAN                         │
│ [Pendek (PDK)]                      │ ← Vertical, full width
└─────────────────────────────────────┘
```

**Solution:**
- Changed from `grid-cols-2` to `space-y-3` (vertical layout)
- Full-width select fields
- Better readability and consistency

---

## 📐 Layout Changes

### Size & Jumlah Fields

**Before Structure:**
```tsx
<div className="grid grid-cols-2 gap-3">
  <div>Ukuran Field</div>
  <div>
    <input />
    {deleteButton}  ← Causes overflow
  </div>
</div>
```

**After Structure:**
```tsx
<div className="space-y-3">
  <div>Ukuran Field (full width)</div>
  <div>Jumlah Field (full width)</div>
  {deleteButton && (
    <button className="w-full">
      Hapus Size
    </button>
  )}
</div>
```

---

### Gender & Tangan Fields

**Before Structure:**
```tsx
<div className="grid grid-cols-2 gap-3">
  <div>Gender Field</div>
  <div>Tangan Field</div>
</div>
```

**After Structure:**
```tsx
<div className="space-y-3">
  <div>Gender Field (full width)</div>
  <div>Tangan Field (full width)</div>
</div>
```

---

## 🎨 Visual Comparison

### Complete Form Layout

**Before:**
```
┌─────────────────────────────────────┐
│ 👤 AKUB                             │
├─────────────────────────────────────┤
│ UKURAN        JUMLAH                │
│ [CUST] 📏     [1] 🗑️               │ ← Cramped
├─────────────────────────────────────┤
│ KATEGORI      TIPE LENGAN           │
│ [Laki-Laki]   [Panjang]             │ ← Cramped
├─────────────────────────────────────┤
│ 📏 UKURAN CUSTOM            ℹ️      │
│ T    LD   LB   LPj  LPd  K   M     │
└─────────────────────────────────────┘
```

**After:**
```
┌─────────────────────────────────────┐
│ 👤 AKUB                             │
├─────────────────────────────────────┤
│ UKURAN (SIZE)                       │
│ [CUSTOM] 📏                         │
│                                     │
│ JUMLAH (PCS)                        │
│ [1]                                 │
│                                     │
│ [🗑️ HAPUS SIZE]                    │ ← Full width
├─────────────────────────────────────┤
│ KATEGORI (GENDER)                   │
│ [Laki-Laki (P)]                     │
│                                     │
│ TIPE LENGAN                         │
│ [Pendek (PDK)]                      │ ← Full width
├─────────────────────────────────────┤
│ 📏 UKURAN CUSTOM            ℹ️      │
│  T     LD    LB    LPj   LPd       │
│  72    54    47    60    0         │
└─────────────────────────────────────┘
```

---

## 🔧 Implementation Details

### 1. Size & Jumlah Fields

```tsx
<div className="space-y-3">
  {/* Ukuran Field */}
  <div className="flex flex-col gap-2">
    {sIdx === 0 && (
      <label className="text-[9px] sm:text-[8px] font-black text-slate-400 uppercase tracking-widest ml-2">
        {formData.jenisBarang === JenisBarang.CELANA ? 'Ukuran (Nomor)' : 'Ukuran (Size)'}
      </label>
    )}
    <div className="relative">
      <input
        className="w-full px-5 py-3.5 rounded-2xl..."
        value={sizeItem.size}
        onChange={e => handleUpdateSize(i, sIdx, 'size', e.target.value)}
      />
      {/* Size Chart Picker Button */}
    </div>
  </div>

  {/* Jumlah Field */}
  <div className="flex flex-col gap-2">
    {sIdx === 0 && (
      <label className="text-[9px] sm:text-[8px] font-black text-emerald-500 uppercase tracking-widest ml-2">
        Jumlah (PCS)
      </label>
    )}
    <input
      type="number"
      className="w-full px-5 py-3.5 rounded-2xl..."
      value={sizeItem.jumlah || ''}
      onChange={e => handleUpdateSize(i, sIdx, 'jumlah', e.target.value)}
    />
  </div>

  {/* Delete Button - Separate */}
  {sIdx > 0 && (
    <button
      type="button"
      onClick={() => handleRemoveSizeFromItem(i, sIdx)}
      className="w-full py-3 rounded-xl bg-red-50 text-red-500 border border-red-100 hover:bg-red-500 hover:text-white transition-all active:scale-95 flex items-center justify-center gap-2"
    >
      <Trash2 size={14} />
      <span className="text-[10px] font-black uppercase">Hapus Size</span>
    </button>
  )}
</div>
```

### 2. Gender & Tangan Fields

```tsx
{/* Gender dan Tangan vertikal - hanya untuk Kemeja */}
{(!formData.jenisBarang || formData.jenisBarang === JenisBarang.KEMEJA) && (
  <div className="space-y-3">
    <div className="flex flex-col gap-2">
      <label className="text-[9px] sm:text-[8px] font-black text-slate-400 uppercase tracking-widest ml-2">
        Kategori (Gender)
      </label>
      <select
        className="w-full px-5 py-3.5 rounded-2xl..."
        value={sd.gender}
        onChange={e => { /* ... */ }}
      >
        <option value="Pria">Laki-Laki (P)</option>
        <option value="Wanita">Perempuan (W)</option>
      </select>
    </div>

    <div className="flex flex-col gap-2">
      <label className="text-[9px] sm:text-[8px] font-black text-slate-400 uppercase tracking-widest ml-2">
        Tipe Lengan
      </label>
      <select
        className="w-full px-5 py-3.5 rounded-2xl..."
        value={sd.tangan}
        onChange={e => { /* ... */ }}
      >
        <option value="Pendek">Pendek (PDK)</option>
        <option value="Panjang">Panjang (PJG)</option>
      </select>
    </div>
  </div>
)}
```

---

## ✅ Benefits

### 1. No Overflow
- All fields stay within container bounds
- No horizontal scrolling
- Consistent width across all fields

### 2. Better Symmetry
- All fields have same width
- Consistent spacing (space-y-3)
- Aligned labels and inputs

### 3. Improved Readability
- Full-width fields easier to read
- Labels not truncated
- Better touch targets on mobile

### 4. Consistent Layout
- All fields follow same pattern
- Vertical stacking throughout
- Predictable user experience

### 5. Better Mobile UX
- No cramped horizontal layouts
- Easier to tap full-width fields
- More comfortable spacing

---

## 📊 Spacing Specifications

| Element | Spacing | Class |
|---------|---------|-------|
| Between Fields | 12px | space-y-3 |
| Label to Input | 8px | gap-2 |
| Input Padding X | 20px | px-5 |
| Input Padding Y | 14px | py-3.5 |
| Button Padding Y | 12px | py-3 |

---

## 🧪 Testing

### Test Checklist

- [x] Ukuran field full width
- [x] Jumlah field full width
- [x] Delete button full width with text
- [x] Gender field full width
- [x] Tangan field full width (Kemeja only)
- [x] No overflow on mobile (375px width)
- [x] Consistent spacing throughout
- [x] Labels aligned properly
- [x] Touch targets adequate (44px+)
- [x] No layout shift on different screen sizes

### Test Devices

- [x] iPhone SE (375px)
- [x] iPhone 12 (390px)
- [x] Samsung Galaxy S21 (360px)
- [x] iPad Mini (768px)
- [x] Desktop (1024px+)

---

## 🔄 Migration Notes

### Breaking Changes

**None** - This is a UI-only change. Data structure remains the same.

### Backward Compatibility

✅ Fully compatible with existing data
✅ No changes to data model
✅ Only visual layout changes

---

## 📝 Label Changes

### Updated Labels

| Old Label | New Label | Reason |
|-----------|-----------|--------|
| Kategori (Gndr) | Kategori (Gender) | More clear and readable |
| - | Hapus Size | Added text to delete button |

---

## 🚀 Future Improvements

### 1. Collapsible Sections

Add collapse/expand for each size entry:
```tsx
<button onClick={() => toggleSize(i)}>
  {expanded ? '▼' : '▶'} Size #{i + 1}
</button>
```

### 2. Drag to Reorder

Allow reordering sizes with drag & drop:
```tsx
<DragHandle />
<SizeFields />
```

### 3. Bulk Actions

Add bulk delete/edit for multiple sizes:
```tsx
<Checkbox /> Select All
<button>Delete Selected</button>
```

---

## 📞 Related

- **Mobile Optimization:** docs/MOBILE_OPTIMIZATION.md
- **Info Button:** docs/INFO_BUTTON_FEATURE.md
- **Main Feature:** docs/CUSTOM_SIZES_WITH_NAMES.md

---

**Version:** 2.6.3  
**Last Updated:** 2026-03-12  
**Status:** ✅ Active

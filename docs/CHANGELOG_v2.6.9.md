# Changelog v2.6.9

**Release Date**: 13 Maret 2026, 21:05  
**Build**: bradflow-v2.6.9-debug.apk (7.04 MB)

---

## 🐛 Bug Fixes

### Critical: Race Condition in Bulk Operations
**Problem**: Ketika memilih multiple items dan melakukan restore/delete, hanya 1 item yang berhasil diproses.

**Root Cause**: 
- Fungsi `forEach` memanggil state update berkali-kali
- Setiap call menggunakan state awal yang sama
- Hanya update terakhir yang tersimpan (race condition)

**Solution**:
1. ✅ **Bulk Restore Fixed**
   - Menambahkan `handleBulkUpdateStatus` di App.tsx
   - Update semua item sekaligus dalam satu operasi
   - Menggunakan Set untuk lookup O(1)

2. ✅ **Bulk Delete Fixed**
   - Menambahkan `handleBulkDelete` di App.tsx
   - Update semua item sekaligus dalam satu operasi
   - Support permanent delete dan soft delete

3. ✅ **Bulk WhatsApp** (Already working)
   - Menggunakan `handleBulkUpdateStatus`
   - Update semua item sekaligus

---

## 📚 Documentation

### New: Workflow Documentation
**File**: `docs/WORKFLOW_HISTORY_BULK_OPERATIONS.md`

Comprehensive documentation covering:
- Data structure & state management
- History Screen workflow
- Bulk operations detailed flow
- Race condition explanation & solution
- Component interaction diagram
- Testing checklist
- Best practices
- Troubleshooting guide

---

## 🔧 Technical Changes

### App.tsx
```javascript
// NEW: Bulk update function
handleBulkUpdateStatus(ids[], status, paymentStatus?)
handleBulkDelete(ids[], permanent)
```

### screens/HistoryScreen.tsx
```javascript
// UPDATED: Use bulk operations
handleBulkRestore() → uses onBulkUpdateStatus
handleBulkDelete() → uses onBulkDelete
handleShareWhatsApp() → uses onBulkUpdateStatus
```

---

## ✅ Testing Results

- [x] Restore 1 item → Success
- [x] Restore 10 items → All success ✅
- [x] Delete 1 item → Success
- [x] Delete 10 items → All success ✅
- [x] WhatsApp 1 item → Success
- [x] WhatsApp 10 items → All success ✅

---

## 📦 Files Changed

- `App.tsx` - Added bulk operations
- `screens/HistoryScreen.tsx` - Updated to use bulk operations
- `docs/WORKFLOW_HISTORY_BULK_OPERATIONS.md` - New documentation

---

**Previous Version**: v2.6.8  
**Next Version**: TBD

# Workflow: History & Bulk Operations

## Overview
Dokumen ini menjelaskan alur kerja lengkap untuk fitur History Screen dan operasi bulk (restore, delete, WhatsApp) di aplikasi Bradflow.

---

## 1. STRUKTUR DATA

### OrderItem
```typescript
{
  id: string,
  kodeBarang: string,
  namaPenjahit: string,
  konsumen: string,
  model: string,
  warna: string,
  status: JobStatus (PROSES | BERES),
  paymentStatus: PaymentStatus (BELUM | BAYAR),
  completedAt: string | null,
  deletedAt: string | null,
  sizeDetails: SizeDetail[]
}
```

### State Management
- **orders**: Array semua order (di App.tsx)
- **selectedIds**: Set<string> untuk tracking item yang dipilih (di HistoryScreen.tsx)

---

## 2. ALUR KERJA HISTORY SCREEN

### A. Tampilan Data

```
┌─────────────────────────────────────────┐
│  STICKY HEADER                          │
│  - Title: "History Kerja"               │
│  - Search Bar                           │
│  - Filter Button                        │
└─────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────┐
│  ACTIVE ITEMS (Status: PROSES)          │
│  - Checkbox untuk select                │
│  - Expandable rincian item              │
│  - Button: Edit, Info                   │
└─────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────┐
│  COMPLETED ITEMS (Status: BERES)        │
│  Grouped by Date (Newest First)         │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │ HEADER: HARI, DD MMMM YYYY        │ │
│  │ - Calendar Icon                   │ │
│  │ - Item Count Badge                │ │
│  ├───────────────────────────────────┤ │
│  │ TABLE:                            │ │
│  │ [✓] Kode/Konsumen | Model | Qty  │ │
│  │ [✓] 2076 PAK JADID | BRAD V1 | 5 │ │
│  │ [ ] 2084 BGN | BRAD V1 | 2       │ │
│  └───────────────────────────────────┘ │
└─────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────┐
│  ACTION BUTTONS (Fixed Bottom)          │
│  [Badge: 2] [Restore] [Delete] [WA]    │
└─────────────────────────────────────────┘
```

### B. Filter & Grouping

**processedOrders** (useMemo):
```javascript
1. Filter by search query (kode, penjahit, konsumen, size)
2. Filter by mode (TERDEKAT, SUDAH DIBAYAR, BELUM DIBAYAR, SEMUA)
3. Sort by target date (if TERDEKAT mode)
```

**Grouping** (useMemo):
```javascript
activeItems = orders.filter(status !== BERES)
completedPaidItems = orders.filter(status === BERES && payment === BAYAR)

groupedPaidItems = {
  "2026-03-13": [order1, order2, ...],
  "2026-03-01": [order3, order4, ...],
  ...
}
// Sorted descending (newest first)
```

---

## 3. BULK OPERATIONS WORKFLOW

### A. RESTORE (Pulihkan ke Antrean)

#### User Flow:
```
1. User pilih multiple items (checkbox)
   └─> selectedIds = Set(["id1", "id2", "id3"])

2. User klik tombol "Restore"
   └─> handleBulkRestore()

3. Konfirmasi dialog muncul
   └─> "Kembalikan 3 data ke antrean proses?"

4. User klik "Confirm"
   └─> onBulkUpdateStatus(["id1", "id2", "id3"], PROSES, BELUM)
```

#### Technical Flow:
```javascript
// HistoryScreen.tsx
handleBulkRestore() {
  const selectedIdArray = Array.from(selectedIds);
  onBulkUpdateStatus(selectedIdArray, JobStatus.PROSES, PaymentStatus.BELUM);
  setSelectedIds(new Set()); // Clear selection
}

// App.tsx
handleBulkUpdateStatus(ids, newStatus, newPaymentStatus) {
  const idsSet = new Set(ids);
  
  setOrders(orders.map(o => {
    if (idsSet.has(o.id)) {
      return {
        ...o,
        status: newStatus,              // PROSES
        paymentStatus: newPaymentStatus, // BELUM
        completedAt: null,
        deletedAt: null                 // ✅ Clear deletedAt
      };
    }
    return o;
  }));
  
  // Sync to cloud for each item
  ids.forEach(id => syncService.pushOrderToCloud(...));
}
```

#### Result:
- ✅ Semua item terpilih berubah status ke PROSES
- ✅ Payment status berubah ke BELUM
- ✅ deletedAt di-clear (null)
- ✅ Item pindah dari "Selesai & Lunas" ke "Active Items"
- ✅ Checkbox selection di-clear

---

### B. DELETE (Hapus Permanen)

#### User Flow:
```
1. User pilih multiple items
   └─> selectedIds = Set(["id1", "id2", "id3"])

2. User klik tombol "Hapus"
   └─> handleBulkDelete()

3. Konfirmasi dialog muncul
   └─> "Hapus 3 data secara permanen?"

4. User klik "Confirm"
   └─> selectedIds.forEach(id => onDelete(id))
```

#### Technical Flow:
```javascript
// HistoryScreen.tsx
handleBulkDelete() {
  const selectedIdArray = Array.from(selectedIds);
  onBulkDelete(selectedIdArray, true); // permanent = true
  setSelectedIds(new Set());
}

// App.tsx
handleBulkDelete(ids, permanent = false) {
  if (permanent) {
    // Hapus permanen dari array (BULK)
    const idsSet = new Set(ids);
    setOrders(orders.filter(o => !idsSet.has(o.id)));
    
    // Sync to cloud
    ids.forEach(id => syncService.deleteOrderFromCloud(id));
  } else {
    // Soft delete (set deletedAt) (BULK)
    const idsSet = new Set(ids);
    const now = new Date().toISOString();
    setOrders(orders.map(o => 
      idsSet.has(o.id) ? { ...o, deletedAt: now } : o
    ));
  }
}
```

#### Result:
- ✅ Semua item terpilih dihapus sekaligus
- ✅ No race condition
- ✅ Single state update
- ✅ Efficient Set-based lookup
- ✅ Proper cloud sync

---

### C. WHATSAPP (Kirim & Tandai Selesai)

#### User Flow:
```
1. User pilih multiple items
   └─> selectedIds = Set(["id1", "id2", "id3"])

2. User klik tombol "WhatsApp"
   └─> handleShareWhatsApp()

3. Warning dialog muncul
   └─> "3 item akan dikirim ke WhatsApp dan otomatis 
        dipindahkan ke History Selesai & Lunas. Lanjutkan?"

4. User klik "Confirm"
   ├─> Generate WhatsApp message
   ├─> Open WhatsApp with message
   └─> onBulkUpdateStatus(ids, BERES, BAYAR)
```

#### Technical Flow:
```javascript
// HistoryScreen.tsx
handleShareWhatsApp() {
  const selected = orders.filter(o => selectedIds.has(o.id));
  
  // 1. Generate WhatsApp message
  let text = "✨ *RINGKASAN KERJA BRADWEAR FLOW* ✨\n";
  selected.forEach(order => {
    text += `💠 *KODE:* ${order.kodeBarang}\n`;
    text += `👤 *CONS:* ${order.konsumen}\n`;
    // ... add all details
  });
  
  // 2. Open WhatsApp
  window.open(`https://wa.me/6283194190156?text=${encodeURIComponent(text)}`);
  
  // 3. Update status (BULK)
  const selectedIdArray = Array.from(selectedIds);
  onBulkUpdateStatus(selectedIdArray, JobStatus.BERES, PaymentStatus.BAYAR);
  
  setSelectedIds(new Set());
}

// App.tsx
handleBulkUpdateStatus(ids, BERES, BAYAR) {
  const idsSet = new Set(ids);
  
  setOrders(orders.map(o => {
    if (idsSet.has(o.id)) {
      return {
        ...o,
        status: JobStatus.BERES,
        paymentStatus: PaymentStatus.BAYAR,
        completedAt: new Date().toISOString() // ✅ Set completion time
      };
    }
    return o;
  }));
}
```

#### Result:
- ✅ WhatsApp terbuka dengan ringkasan kerja
- ✅ Semua item terpilih berubah status ke BERES
- ✅ Payment status berubah ke BAYAR
- ✅ completedAt di-set ke waktu sekarang
- ✅ Item pindah ke "Selesai & Lunas" section
- ✅ Grouped by completion date

---

## 4. RACE CONDITION PROBLEM & SOLUTION

### ❌ MASALAH: forEach dengan State Updates

```javascript
// WRONG - Race Condition
selectedIds.forEach(id => {
  onUpdateStatus(id, JobStatus.PROSES); // Each call uses same initial state
});

// Execution:
// Call 1: orders = [A, B, C] → update A → [A', B, C]
// Call 2: orders = [A, B, C] → update B → [A, B', C]  ❌ Lost A' update!
// Call 3: orders = [A, B, C] → update C → [A, B, C']  ❌ Lost A' & B' updates!
// Final: Only C' is saved!
```

### ✅ SOLUSI: Bulk Update dengan Single setOrders

```javascript
// CORRECT - Bulk Update
const idsSet = new Set(ids);
setOrders(orders.map(o => {
  if (idsSet.has(o.id)) {
    return { ...o, status: newStatus }; // Update all at once
  }
  return o;
}));

// Execution:
// Single call: orders = [A, B, C] → [A', B', C']  ✅ All updated!
```

### Keuntungan Bulk Update:
1. ✅ **No Race Condition**: Semua update dalam satu operasi
2. ✅ **Better Performance**: Hanya 1x re-render
3. ✅ **Atomic Operation**: Semua berhasil atau semua gagal
4. ✅ **Efficient Lookup**: Menggunakan Set untuk O(1) lookup

---

## 5. COMPONENT INTERACTION DIAGRAM

```
┌─────────────────────────────────────────────────────────┐
│                        App.tsx                          │
│                                                         │
│  State: orders = [...]                                  │
│                                                         │
│  Functions:                                             │
│  ├─ handleUpdateStatus(id, status)                     │
│  ├─ handleBulkUpdateStatus(ids[], status, payment)  ✅ │
│  ├─ handleUpdatePayment(id, payment)                   │
│  ├─ handleDeleteOrder(id, permanent)                   │
│  └─ handleBulkDelete(ids[], permanent)  ✅ FIXED       │
│                                                         │
└────────────────────┬────────────────────────────────────┘
                     │ Props
                     ↓
┌─────────────────────────────────────────────────────────┐
│                  HistoryScreen.tsx                      │
│                                                         │
│  State: selectedIds = Set([...])                        │
│                                                         │
│  Functions:                                             │
│  ├─ toggleSelect(id)                                   │
│  ├─ toggleSelectAll(ids[])                             │
│  ├─ handleBulkRestore()  ✅ Uses onBulkUpdateStatus    │
│  ├─ handleBulkDelete()   ✅ Uses onBulkDelete          │
│  └─ handleShareWhatsApp() ✅ Uses onBulkUpdateStatus   │
│                                                         │
│  Display:                                               │
│  ├─ Active Items (status !== BERES)                    │
│  └─ Completed Items (status === BERES)                 │
│      └─ Grouped by completedAt date                    │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 6. CHECKLIST IMPLEMENTASI

### ✅ Sudah Selesai:
- [x] Bulk Restore menggunakan `handleBulkUpdateStatus`
- [x] Bulk Delete menggunakan `handleBulkDelete` ✅ FIXED
- [x] Bulk WhatsApp menggunakan `handleBulkUpdateStatus`
- [x] Grouping by date (bukan weekly)
- [x] Sticky header
- [x] Format field: "Size - Jumlah" dan "Gender - Tangan"
- [x] Action buttons responsive mobile
- [x] Padding bottom untuk scroll

### ✅ Semua Bulk Operations Sudah Optimal:
- [x] No race conditions
- [x] Single state update per operation
- [x] Efficient Set-based lookup
- [x] Proper cloud sync

---

## 7. TESTING CHECKLIST

### Test Bulk Restore:
1. [ ] Pilih 1 item → Restore → Berhasil
2. [ ] Pilih 3 items → Restore → Semua berhasil
3. [ ] Pilih 10 items → Restore → Semua berhasil
4. [ ] Check status berubah ke PROSES
5. [ ] Check payment berubah ke BELUM
6. [ ] Check deletedAt = null
7. [ ] Check item pindah ke Active section

### Test Bulk Delete:
1. [ ] Pilih 1 item → Delete → Berhasil
2. [ ] Pilih 3 items → Delete → Semua berhasil ⚠️
3. [ ] Pilih 10 items → Delete → Semua berhasil ⚠️
4. [ ] Check item hilang dari list
5. [ ] Check sync to cloud

### Test Bulk WhatsApp:
1. [ ] Pilih 1 item → WhatsApp → Berhasil
2. [ ] Pilih 3 items → WhatsApp → Semua berhasil
3. [ ] Pilih 10 items → WhatsApp → Semua berhasil
4. [ ] Check WhatsApp message format
5. [ ] Check status berubah ke BERES
6. [ ] Check payment berubah ke BAYAR
7. [ ] Check completedAt di-set
8. [ ] Check item pindah ke Completed section

---

## 8. BEST PRACTICES

### State Updates:
```javascript
// ❌ JANGAN: Multiple setState calls
ids.forEach(id => {
  setOrders(orders.map(o => o.id === id ? {...o, status: 'BERES'} : o));
});

// ✅ LAKUKAN: Single setState call
const idsSet = new Set(ids);
setOrders(orders.map(o => idsSet.has(o.id) ? {...o, status: 'BERES'} : o));
```

### Performance:
```javascript
// ❌ JANGAN: Array.includes() - O(n) per item
ids.forEach(id => {
  if (orders.map(o => o.id).includes(id)) { ... }
});

// ✅ LAKUKAN: Set.has() - O(1) per item
const idsSet = new Set(ids);
orders.forEach(o => {
  if (idsSet.has(o.id)) { ... }
});
```

### Sync to Cloud:
```javascript
// Sync after state update
ids.forEach(id => {
  const order = orders.find(o => o.id === id);
  syncService.pushOrderToCloud(order).catch(console.error);
});
```

---

## 9. TROUBLESHOOTING

### Issue: Hanya 1 item yang ter-restore/delete
**Cause**: Race condition dalam forEach loop  
**Solution**: Gunakan bulk update function

### Issue: Item tidak pindah section setelah update
**Cause**: Filter/grouping tidak re-compute  
**Solution**: Check useMemo dependencies

### Issue: Checkbox tidak clear setelah action
**Cause**: Lupa `setSelectedIds(new Set())`  
**Solution**: Tambahkan di akhir setiap handler

### Issue: Sync to cloud gagal
**Cause**: Network error atau invalid data  
**Solution**: Check console.error, retry mechanism

---

## 10. FUTURE IMPROVEMENTS

1. **Optimistic Updates**: Update UI dulu, sync ke cloud di background
2. **Undo/Redo**: Simpan history untuk undo bulk operations
3. **Progress Indicator**: Show progress saat bulk operations
4. **Batch Sync**: Group multiple sync operations
5. **Error Handling**: Better error messages dan retry logic
6. **Offline Support**: Queue operations saat offline

---

**Last Updated**: 13 Maret 2026  
**Version**: 2.6.8

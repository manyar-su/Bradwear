# Soft Delete & Trash System

## Overview
Sistem penghapusan data dengan 2 tahap:
1. **Soft Delete** - Data dipindahkan ke tempat sampah (dapat dikembalikan)
2. **Permanent Delete** - Data dihapus permanen dari database (tidak dapat dikembalikan)

## Bulk Delete Flow

### From History Screen

```
User selects multiple items
         ↓
User clicks bulk delete button
         ↓
┌─────────────────────────────────────┐
│   Konfirmasi Dialog                 │
│  "PINDAHKAN KE TEMPAT SAMPAH?"      │
│                                     │
│  Pindahkan X data ke tempat sampah? │
│  Anda bisa mengembalikannya dari    │
│  menu Akun.                         │
│                                     │
│  [IYA, LANJUTKAN]                   │
│  [BATAL]                            │
└────────┬────────────────────────────┘
         │
    ┌────┴────┐
    │         │
    ↓         ↓
 BATAL    IYA, LANJUTKAN
    │         │
    │         ↓
    │    Set deletedAt = timestamp (all selected)
    │         │
    │         ↓
    │    Show notification:
    │    "X data dipindahkan ke tempat sampah.
    │     Buka menu Akun untuk mengembalikan
    │     atau menghapus permanen."
    │         │
    │         ↓
    │    Items move to Trash
    │         │
    ↓         ↓
Dialog closes automatically
Items remain in History
```

### Key Changes
- ✅ Bulk delete is now SOFT DELETE (not permanent)
- ✅ After confirmation, dialog closes automatically
- ✅ Shows notification with instructions
- ✅ Items can be restored from Account → Tempat Sampah
- ✅ Items can be permanently deleted from Trash

```
┌─────────────────┐
│  History Screen │
│  (Active Data)  │
└────────┬────────┘
         │
         │ User klik delete
         ↓
┌─────────────────────────┐
│   Konfirmasi Dialog     │
│  "HAPUS RIWAYAT?"       │
│                         │
│  Data akan dipindahkan  │
│  ke tempat sampah       │
│                         │
│  [IYA, LANJUTKAN]       │
│  [BATAL]                │
└────────┬────────────────┘
         │
    ┌────┴────┐
    │         │
    ↓         ↓
 BATAL    IYA, LANJUTKAN
    │         │
    │         ↓
    │    Set deletedAt = timestamp
    │         │
    │         ↓
    │    ┌─────────────────┐
    │    │  Tempat Sampah  │
    │    │  (Account Menu) │
    │    └────────┬────────┘
    │             │
    │        ┌────┴────┐
    │        │         │
    │        ↓         ↓
    │    RESTORE   DELETE PERMANEN
    │        │         │
    │        │         ↓
    │        │    ┌─────────────────────┐
    │        │    │ Konfirmasi Dialog   │
    │        │    │ "HAPUS PERMANEN?"   │
    │        │    │                     │
    │        │    │ Hapus data          │
    │        │    │ selamanya?          │
    │        │    │                     │
    │        │    │ [IYA, LANJUTKAN]    │
    │        │    │ [BATAL]             │
    │        │    └──────┬──────────────┘
    │        │           │
    │        │      ┌────┴────┐
    │        │      │         │
    │        │      ↓         ↓
    │        │   BATAL    IYA, LANJUTKAN
    │        │      │         │
    │        │      │         ↓
    │        │      │    Hapus dari database
    │        │      │         │
    │        │      │         ↓
    │        │      │    Data hilang permanen
    │        │      │
    │        ↓      ↓
    │    Set deletedAt = null
    │        │
    │        ↓
    │    Kembali ke History
    │        │
    ↓        ↓
Data tetap di History
```

## Implementation Details

### 1. Soft Delete (History → Trash)

#### Location
- **File**: `App.tsx`
- **Function**: `handleDeleteOrder()`
- **Trigger**: User klik delete di History screen

#### Code
```typescript
const handleDeleteOrder = (id: string, searchResults?: OrderItem[], skipConfirm = false) => {
  let order = orders.find(o => o.id === id || (o.cloudId && o.cloudId === id));
  if (!order && searchResults) order = searchResults.find(o => o.id === id || (o.cloudId && o.cloudId === id));
  if (!order) return;
  
  // Check permission
  const profileName = localStorage.getItem('profileName') || 'Nama Anda';
  if (order.namaPenjahit.toLowerCase().trim() !== profileName.toLowerCase().trim()) {
    if (!skipConfirm) triggerConfirm({ 
      title: 'Akses Ditolak', 
      message: `Hanya ${order.namaPenjahit} yang boleh menghapus.`, 
      type: 'info', 
      onConfirm: () => { } 
    });
    return;
  }
  
  const performDelete = () => {
    // Set deletedAt timestamp (soft delete)
    const deletedAt = new Date().toISOString();
    const updatedOrder = { ...order, deletedAt };
    
    // Update local state
    setOrders(prev => [
      updatedOrder, 
      ...prev.filter(o => o.id !== id && o.cloudId !== id && o.id !== order?.id && o.cloudId !== order?.cloudId)
    ]);
    
    // Sync to cloud
    syncService.pushOrderToCloud(updatedOrder).catch(e => console.error('Delete Sync failed:', e));
    
    // Show notification
    addNotification('Data Dihapus', `Order #${order?.kodeBarang} dipindahkan ke sampah`, 'warning');
  };
  
  if (skipConfirm) {
    performDelete();
  } else {
    triggerConfirm({ 
      title: 'HAPUS RIWAYAT?', 
      message: 'Data akan dipindahkan ke tempat sampah. Anda bisa mengembalikannya dari menu Akun.', 
      type: 'warning', 
      onConfirm: performDelete 
    });
  }
};
```

#### Key Points
- ✅ Set `deletedAt` timestamp (tidak menghapus data)
- ✅ Data masih ada di database
- ✅ Sync ke cloud dengan flag `deletedAt`
- ✅ Tampilkan konfirmasi sebelum soft delete
- ✅ Check permission (hanya owner yang bisa delete)

### 2. Restore (Trash → History)

#### Location
- **File**: `App.tsx`
- **Function**: `handleRestoreOrder()`
- **Trigger**: User klik restore di Account screen (Tempat Sampah)

#### Code
```typescript
const handleRestoreOrder = (id: string) => {
  const order = orders.find(o => o.id === id);
  if (!order) return;
  
  // Set deletedAt to null (restore)
  const updated = { ...order, deletedAt: null };
  
  // Update local state
  setOrders(orders.map(o => o.id === id ? updated : o));
  
  // Sync to cloud
  syncService.pushOrderToCloud(updated).catch(e => console.error('Restore Sync failed:', e));
  
  // Show notification
  addNotification('Data Dipulihkan', `Order #${order.kodeBarang} dikembalikan`, 'info');
};
```

#### Key Points
- ✅ Set `deletedAt` ke `null`
- ✅ Data kembali muncul di History
- ✅ Sync ke cloud
- ✅ No confirmation needed (restore is safe)

### 3. Permanent Delete (Trash → Database Delete)

#### Location
- **File**: `App.tsx`
- **Function**: `handlePermanentDelete()`
- **Trigger**: User klik delete permanen di Account screen (Tempat Sampah)

#### Code
```typescript
const handlePermanentDelete = (id: string) => {
  // Delete from cloud database
  syncService.deleteOrderPermanently(id).catch(e => console.error('Permanent Delete Sync failed:', e));
  
  // Remove from local state
  setOrders(orders.filter(o => o.id !== id && o.cloudId !== id));
  
  // Show notification
  addNotification('Data Terhapus', 'Dihapus permanen', 'danger');
};
```

#### Confirmation Dialog (AccountScreen.tsx)
```typescript
<button
  onClick={() => {
    triggerConfirm({
      title: 'HAPUS PERMANEN?',
      message: `Hapus data [${o.kodeBarang}] selamanya?`,
      type: 'danger',
      onConfirm: () => onPermanentDelete(o.id)
    });
  }}
  className="p-2 bg-red-100 text-red-600 rounded-xl active:scale-90 shadow-sm"
>
  <Trash2 size={16} />
</button>
```

#### Key Points
- ✅ Hapus dari database (permanent)
- ✅ Hapus dari local state
- ✅ Sync ke cloud untuk delete
- ✅ Tampilkan konfirmasi dengan warning kuat
- ✅ Data tidak bisa dikembalikan

## Data Filtering

### Active Orders (History Screen)
```typescript
const activeOrders = orders.filter(o => !o.deletedAt);
```

### Deleted Orders (Trash in Account Screen)
```typescript
const deletedOrders = orders.filter(o => o.deletedAt);
```

## UI Components

### 1. History Screen Delete Button
- **Location**: Bulk delete toolbar
- **Action**: Soft delete (move to trash)
- **Confirmation**: "HAPUS RIWAYAT?" dengan pesan "Data akan dipindahkan ke tempat sampah"
- **Button Text**: "IYA, LANJUTKAN" (warning color)

### 2. Account Screen - Tempat Sampah
- **Location**: Account menu → Tempat Sampah section
- **Shows**: List of deleted orders (`deletedAt !== null`)
- **Actions**:
  - **Restore Button** (Green): Kembalikan ke History
  - **Delete Button** (Red): Hapus permanen

### 3. Permanent Delete Confirmation
- **Title**: "HAPUS PERMANEN?"
- **Message**: "Hapus data [KODE_BARANG] selamanya?"
- **Type**: danger (red)
- **Button Text**: "IYA, LANJUTKAN" (red color)

## Database Schema

### OrderItem Type
```typescript
interface OrderItem {
  id: string;
  cloudId?: string;
  kodeBarang: string;
  namaPenjahit: string;
  // ... other fields
  deletedAt?: string | null;  // ← Soft delete flag
  createdAt: string;
  updatedAt?: string;
}
```

### deletedAt Field
- **Type**: `string | null | undefined`
- **Format**: ISO 8601 timestamp (e.g., "2026-03-14T10:30:00.000Z")
- **Meaning**:
  - `null` or `undefined`: Active order (visible in History)
  - `string` (timestamp): Deleted order (visible in Trash)

## Sync Service

### Push Order to Cloud
```typescript
// Soft delete - push with deletedAt
syncService.pushOrderToCloud(updatedOrder);
```

### Delete Permanently from Cloud
```typescript
// Permanent delete - remove from database
syncService.deleteOrderPermanently(id);
```

## User Experience

### Bulk Delete Flow (NEW)
1. User di History screen
2. Select multiple items (checkbox)
3. Klik bulk delete button
4. Dialog muncul: "PINDAHKAN KE TEMPAT SAMPAH?"
5. Pesan: "Pindahkan X data ke tempat sampah? Anda bisa mengembalikannya dari menu Akun."
6. User klik "IYA, LANJUTKAN"
7. Dialog closes automatically (no need to click close)
8. Notifikasi muncul: "X data dipindahkan ke tempat sampah. Buka menu Akun untuk mengembalikan atau menghapus permanen."
9. Items hilang dari History
10. Items muncul di Account → Tempat Sampah

### Single Delete Flow
1. User di History screen
2. Klik delete pada order
3. Dialog muncul: "HAPUS RIWAYAT?"
4. Pesan: "Data akan dipindahkan ke tempat sampah. Anda bisa mengembalikannya dari menu Akun."
5. User klik "IYA, LANJUTKAN"
6. Order hilang dari History
7. Order muncul di Account → Tempat Sampah
8. Notifikasi: "Order #XXXX dipindahkan ke sampah"

### Restore Flow
1. User di Account screen
2. Buka section "Tempat Sampah"
3. Lihat list deleted orders
4. Klik tombol Restore (icon RotateCcw)
5. Order langsung kembali ke History
6. Notifikasi: "Order #XXXX dikembalikan"

### Permanent Delete Flow
1. User di Account screen → Tempat Sampah
2. Klik tombol Delete (icon Trash2, red)
3. Dialog muncul: "HAPUS PERMANEN?"
4. Pesan: "Hapus data [KODE_BARANG] selamanya?"
5. User klik "IYA, LANJUTKAN"
6. Order dihapus dari database
7. Order hilang dari Tempat Sampah
8. Notifikasi: "Dihapus permanen"
9. **Data tidak bisa dikembalikan**

## Security & Permissions

### Delete Permission Check
```typescript
const profileName = localStorage.getItem('profileName') || 'Nama Anda';
if (order.namaPenjahit.toLowerCase().trim() !== profileName.toLowerCase().trim()) {
  triggerConfirm({ 
    title: 'Akses Ditolak', 
    message: `Hanya ${order.namaPenjahit} yang boleh menghapus.`, 
    type: 'info', 
    onConfirm: () => { } 
  });
  return;
}
```

### Key Points
- ✅ Hanya owner (namaPenjahit) yang bisa delete
- ✅ Case-insensitive comparison
- ✅ Trim whitespace
- ✅ Show access denied message

## Testing Checklist

### Soft Delete
- [ ] Klik delete di History → dialog muncul
- [ ] Klik "BATAL" → order tetap di History
- [ ] Klik "IYA, LANJUTKAN" → order pindah ke Trash
- [ ] Check database → deletedAt terisi timestamp
- [ ] Order tidak muncul di History
- [ ] Order muncul di Account → Tempat Sampah

### Restore
- [ ] Buka Account → Tempat Sampah
- [ ] Klik restore → order kembali ke History
- [ ] Check database → deletedAt = null
- [ ] Order hilang dari Trash
- [ ] Order muncul di History

### Permanent Delete
- [ ] Buka Account → Tempat Sampah
- [ ] Klik delete permanen → dialog muncul
- [ ] Klik "BATAL" → order tetap di Trash
- [ ] Klik "IYA, LANJUTKAN" → order hilang
- [ ] Check database → order tidak ada
- [ ] Order tidak bisa di-restore

### Permission
- [ ] User A buat order
- [ ] User B coba delete → "Akses Ditolak"
- [ ] User A delete → berhasil

## Best Practices

### 1. Always Use Soft Delete First
- Jangan langsung permanent delete
- Beri user kesempatan untuk restore
- Soft delete lebih aman

### 2. Clear Communication
- Jelaskan perbedaan soft delete vs permanent delete
- Gunakan warna yang berbeda (warning vs danger)
- Tampilkan pesan yang jelas

### 3. Confirmation for Destructive Actions
- Soft delete: warning confirmation
- Permanent delete: danger confirmation dengan pesan kuat
- Restore: no confirmation (safe action)

### 4. Sync to Cloud
- Soft delete: sync dengan deletedAt
- Restore: sync dengan deletedAt = null
- Permanent delete: call deleteOrderPermanently()

### 5. Show Notifications
- Soft delete: "Dipindahkan ke sampah"
- Restore: "Dikembalikan"
- Permanent delete: "Dihapus permanen"

## Related Files

- `App.tsx` - Main handlers (handleDeleteOrder, handleRestoreOrder, handlePermanentDelete)
- `screens/HistoryScreen.tsx` - Soft delete trigger
- `screens/AccountScreen.tsx` - Trash UI, restore & permanent delete
- `services/syncService.ts` - Cloud sync operations
- `types.ts` - OrderItem interface with deletedAt field

## Notes

- Soft delete sudah implemented ✅
- Permanent delete sudah implemented ✅
- Restore sudah implemented ✅
- Confirmation dialogs sudah ada ✅
- Permission check sudah ada ✅
- Cloud sync sudah terintegrasi ✅

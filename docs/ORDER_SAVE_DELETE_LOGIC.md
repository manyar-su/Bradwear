# Order Save & Delete Logic

## Overview
Dokumentasi ini menjelaskan logic untuk:
1. **Mencegah duplikasi order** berdasarkan kode barang
2. **Soft delete dengan restore** - Item tidak hilang permanen ketika dihapus

## Problem 1: Duplikasi Order

### Current Issue
Order dengan kode barang yang sama bisa tersimpan 2x di database, menyebabkan duplikasi di list.

### Root Cause
Logic di `handleAddOrder` sudah ada pengecekan duplikasi berdasarkan `kodeBarang`, tapi ada kemungkinan:
1. Race condition saat save bersamaan
2. Kode barang kosong/null sehingga check duplikasi di-skip
3. `namaPenjahit` berbeda sehingga dianggap order berbeda

### Current Logic (App.tsx)
```typescript
const handleAddOrder = (newOrder: OrderItem) => {
  // Check by ID
  const existingIndexById = orders.findIndex(o => o.id === newOrder.id);
  
  // Check by kode barang + nama penjahit
  const existingIndexByCode = newOrder.kodeBarang ? orders.findIndex(o => 
    o.kodeBarang === newOrder.kodeBarang && 
    o.namaPenjahit === newOrder.namaPenjahit &&
    o.id !== newOrder.id
  ) : -1;

  if (existingIndexById > -1) {
    // Update existing order
    const updatedOrders = orders.map(o => o.id === newOrder.id ? newOrder : o);
    setOrders(updatedOrders);
  } else if (existingIndexByCode > -1) {
    // Merge with existing order (prevent duplicate)
    const existingOrder = orders[existingIndexByCode];
    const mergedOrder = { 
      ...newOrder, 
      id: existingOrder.id, 
      cloudId: existingOrder.cloudId, 
      createdAt: existingOrder.createdAt 
    };
    const newOrders = [...orders];
    newOrders[existingIndexByCode] = mergedOrder;
    setOrders(newOrders);
  } else {
    // Create new order
    const finalizedOrder: OrderItem = {
      ...newOrder,
      id: newOrder.id || Math.random().toString(36).substr(2, 9),
      createdAt: newOrder.createdAt || new Date().toISOString()
    };
    setOrders([finalizedOrder, ...orders]);
  }
};
```

### Solution: Strengthen Duplicate Check

**Option 1: Check by kode barang only (ignore nama penjahit)**
```typescript
const existingIndexByCode = newOrder.kodeBarang ? orders.findIndex(o => 
  o.kodeBarang === newOrder.kodeBarang &&
  !o.deletedAt && // Ignore deleted orders
  o.id !== newOrder.id
) : -1;
```

**Option 2: Require kode barang (prevent empty kode barang)**
```typescript
const handleAddOrder = (newOrder: OrderItem) => {
  // Validate kode barang
  if (!newOrder.kodeBarang || newOrder.kodeBarang.trim() === '') {
    triggerConfirm({
      title: 'Kode Barang Kosong',
      message: 'Kode barang harus diisi untuk mencegah duplikasi',
      type: 'warning',
      onConfirm: () => {}
    });
    return;
  }
  
  // ... rest of logic
};
```

**Option 3: Use unique constraint (recommended)**
```typescript
const existingIndexByCode = newOrder.kodeBarang ? orders.findIndex(o => 
  o.kodeBarang === newOrder.kodeBarang &&
  o.namaPenjahit === newOrder.namaPenjahit &&
  !o.deletedAt && // Ignore deleted orders
  o.id !== newOrder.id
) : -1;

if (existingIndexByCode > -1) {
  // Show warning instead of silent merge
  triggerConfirm({
    title: 'Kode Barang Sudah Ada',
    message: `Order dengan kode ${newOrder.kodeBarang} sudah ada. Update order existing?`,
    type: 'warning',
    onConfirm: () => {
      // Merge logic here
      const existingOrder = orders[existingIndexByCode];
      const mergedOrder = { 
        ...newOrder, 
        id: existingOrder.id, 
        cloudId: existingOrder.cloudId, 
        createdAt: existingOrder.createdAt 
      };
      const newOrders = [...orders];
      newOrders[existingIndexByCode] = mergedOrder;
      setOrders(newOrders);
      syncService.pushOrderToCloud(mergedOrder);
    }
  });
  return; // Don't proceed with save
}
```

## Problem 2: Button "BATAL" Tidak Mengembalikan Item

### Current Issue
Ketika user klik "BATAL" di dialog "HAPUS PERMANEN?", item tetap hilang dari list.

### Root Cause
Dialog confirmation tidak memiliki callback untuk button "BATAL". Hanya ada callback untuk "IYA, LANJUTKAN".

### Current Logic (App.tsx)
```typescript
const handleDeleteOrder = (id: string, searchResults?: OrderItem[], skipConfirm = false) => {
  // ... validation logic
  
  const performDelete = () => {
    const deletedAt = new Date().toISOString();
    const updatedOrder = { ...order, deletedAt };
    setOrders(prev => [
      updatedOrder, 
      ...prev.filter(o => o.id !== id && o.cloudId !== id)
    ]);
    syncService.pushOrderToCloud(updatedOrder);
    addNotification('Data Dihapus', `Order #${order?.kodeBarang} dipindahkan ke sampah`, 'warning');
  };
  
  if (skipConfirm) {
    performDelete();
  } else {
    triggerConfirm({ 
      title: 'HAPUS RIWAYAT?', 
      message: 'Hapus Riwayat ini?', 
      type: 'danger', 
      onConfirm: performDelete 
      // ❌ Missing: onCancel callback
    });
  }
};
```

### Solution: Add onCancel Callback

**Update triggerConfirm interface:**
```typescript
interface ConfirmDialogProps {
  title: string;
  message: string;
  type: 'info' | 'warning' | 'danger';
  onConfirm: () => void;
  onCancel?: () => void; // Add this
}
```

**Update handleDeleteOrder:**
```typescript
const handleDeleteOrder = (id: string, searchResults?: OrderItem[], skipConfirm = false) => {
  let order = orders.find(o => o.id === id || (o.cloudId && o.cloudId === id));
  if (!order && searchResults) {
    order = searchResults.find(o => o.id === id || (o.cloudId && o.cloudId === id));
  }
  if (!order) return;
  
  // Validation logic...
  
  const performDelete = () => {
    const deletedAt = new Date().toISOString();
    const updatedOrder = { ...order, deletedAt };
    setOrders(prev => [
      updatedOrder, 
      ...prev.filter(o => o.id !== id && o.cloudId !== id)
    ]);
    syncService.pushOrderToCloud(updatedOrder);
    addNotification('Data Dihapus', `Order #${order?.kodeBarang} dipindahkan ke sampah`, 'warning');
  };
  
  const handleCancel = () => {
    // Item stays in list - do nothing
    console.log('Delete cancelled, item remains in list');
  };
  
  if (skipConfirm) {
    performDelete();
  } else {
    triggerConfirm({ 
      title: 'HAPUS RIWAYAT?', 
      message: 'Hapus Riwayat ini?', 
      type: 'danger', 
      onConfirm: performDelete,
      onCancel: handleCancel // ✅ Add cancel handler
    });
  }
};
```

**Update ConfirmDialog component:**
```typescript
const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  title,
  message,
  type,
  onConfirm,
  onCancel
}) => {
  const handleConfirm = () => {
    onConfirm();
    // Close dialog
  };
  
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    // Close dialog without doing anything
  };
  
  return (
    <div className="confirm-dialog">
      <h2>{title}</h2>
      <p>{message}</p>
      <button onClick={handleConfirm}>IYA, LANJUTKAN</button>
      <button onClick={handleCancel}>BATAL</button>
    </div>
  );
};
```

## Soft Delete System (Already Implemented ✅)

### How It Works
System sudah menggunakan soft delete dengan field `deletedAt`:

1. **Delete** - Set `deletedAt` timestamp
```typescript
const deletedAt = new Date().toISOString();
const updatedOrder = { ...order, deletedAt };
```

2. **Filter Active Orders** - Exclude deleted orders
```typescript
const activeOrders = orders.filter(o => !o.deletedAt);
const deletedOrders = orders.filter(o => o.deletedAt);
```

3. **Restore** - Set `deletedAt` to null
```typescript
const handleRestoreOrder = (id: string) => {
  const order = orders.find(o => o.id === id);
  if (!order) return;
  const updated = { ...order, deletedAt: null };
  setOrders(orders.map(o => o.id === id ? updated : o));
};
```

4. **Permanent Delete** - Remove from database
```typescript
const handlePermanentDelete = (id: string) => {
  syncService.deleteOrderPermanently(id);
  setOrders(orders.filter(o => o.id !== id && o.cloudId !== id));
};
```

## Implementation Checklist

### Fix Duplikasi Order
- [ ] Update `existingIndexByCode` check to ignore `deletedAt` orders
- [ ] Add validation for empty `kodeBarang`
- [ ] Add confirmation dialog when duplicate detected
- [ ] Test: Try to save same kode barang twice
- [ ] Test: Verify merge logic works correctly

### Fix Button BATAL
- [ ] Add `onCancel` prop to ConfirmDialog interface
- [ ] Update `handleDeleteOrder` to include `onCancel` callback
- [ ] Update ConfirmDialog component to call `onCancel` on BATAL button
- [ ] Test: Click BATAL and verify item stays in list
- [ ] Test: Click IYA LANJUTKAN and verify item moves to trash

### Additional Improvements
- [ ] Add loading state during save to prevent double-click
- [ ] Add debounce to save button
- [ ] Show toast notification on duplicate detection
- [ ] Add undo functionality for delete action

## Testing Scenarios

### Duplikasi Order
1. Create order with kode barang "2071000"
2. Try to create another order with same kode barang
3. Expected: Warning dialog appears
4. Click "Update existing": Order should be updated, not duplicated
5. Click "Cancel": New order should not be saved

### Button BATAL
1. Open order list
2. Click delete on an order
3. Dialog "HAPUS PERMANEN?" appears
4. Click "BATAL"
5. Expected: Dialog closes, order stays in list
6. Click delete again
7. Click "IYA, LANJUTKAN"
8. Expected: Order moves to trash (soft delete)

### Restore Order
1. Delete an order (moves to trash)
2. Go to Account screen
3. Find deleted order
4. Click "Restore"
5. Expected: Order returns to active list

## Notes

- Soft delete is already implemented ✅
- Restore functionality is already implemented ✅
- Only need to fix: duplicate check and cancel button
- Consider adding unique index on `kodeBarang` + `namaPenjahit` in database

# Delete Confirmation Logic

## Overview
Ketika user mencoba menghapus item, sistem akan menampilkan dialog konfirmasi untuk mencegah penghapusan yang tidak disengaja.

## Dialog Konfirmasi

### UI Elements
```
┌─────────────────────────────────────┐
│         ⚠️ (Warning Icon)           │
│                                     │
│        HAPUS PERMANEN?              │
│                                     │
│  HAPUS 1 DATA SECARA PERMANEN?      │
│                                     │
│  ┌───────────────────────────────┐  │
│  │   IYA, LANJUTKAN              │  │ (Red button)
│  └───────────────────────────────┘  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │   BATAL                       │  │ (Gray button)
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

### Button Actions

#### 1. "IYA, LANJUTKAN" (Confirm Delete)
- **Action**: Hapus item secara permanen
- **Result**: Item dihapus dari database dan UI
- **Color**: Red (destructive action)
- **Behavior**: 
  - Close dialog
  - Execute delete operation
  - Show success toast/message
  - Update UI (remove item from list)

#### 2. "BATAL" (Cancel Delete)
- **Action**: Batalkan penghapusan
- **Result**: Item TIDAK dihapus, tetap ada di list
- **Color**: Gray (neutral action)
- **Behavior**:
  - Close dialog
  - NO delete operation
  - Item tetap ada di UI
  - No changes to data

## Implementation Pattern

### React/React Native Example

```typescript
const [showDeleteDialog, setShowDeleteDialog] = useState(false);
const [itemToDelete, setItemToDelete] = useState<Item | null>(null);

// Step 1: User clicks delete button
const handleDeleteClick = (item: Item) => {
  setItemToDelete(item);
  setShowDeleteDialog(true);
};

// Step 2a: User confirms delete
const handleConfirmDelete = async () => {
  if (itemToDelete) {
    try {
      // Execute delete operation
      await deleteItem(itemToDelete.id);
      
      // Update UI - remove from list
      setItems(items.filter(i => i.id !== itemToDelete.id));
      
      // Show success message
      showToast('Item berhasil dihapus');
    } catch (error) {
      showToast('Gagal menghapus item');
    }
  }
  
  // Close dialog and reset
  setShowDeleteDialog(false);
  setItemToDelete(null);
};

// Step 2b: User cancels delete
const handleCancelDelete = () => {
  // Simply close dialog - NO delete operation
  setShowDeleteDialog(false);
  setItemToDelete(null);
  
  // Item remains in the list - no changes
};

// Render
return (
  <>
    {/* Item List */}
    {items.map(item => (
      <ItemCard 
        key={item.id}
        item={item}
        onDelete={() => handleDeleteClick(item)}
      />
    ))}
    
    {/* Delete Confirmation Dialog */}
    <Dialog visible={showDeleteDialog}>
      <WarningIcon />
      <Title>HAPUS PERMANEN?</Title>
      <Description>HAPUS 1 DATA SECARA PERMANEN?</Description>
      
      <Button 
        color="red"
        onPress={handleConfirmDelete}
      >
        IYA, LANJUTKAN
      </Button>
      
      <Button 
        color="gray"
        onPress={handleCancelDelete}
      >
        BATAL
      </Button>
    </Dialog>
  </>
);
```

## State Management

### Before Delete Click
```typescript
{
  items: [
    { id: 1, name: 'Item 1' },
    { id: 2, name: 'Item 2' },
    { id: 3, name: 'Item 3' },
  ],
  showDeleteDialog: false,
  itemToDelete: null
}
```

### After Delete Click (Dialog Open)
```typescript
{
  items: [
    { id: 1, name: 'Item 1' },
    { id: 2, name: 'Item 2' },  // ← User wants to delete this
    { id: 3, name: 'Item 3' },
  ],
  showDeleteDialog: true,
  itemToDelete: { id: 2, name: 'Item 2' }
}
```

### After "IYA, LANJUTKAN" (Confirmed)
```typescript
{
  items: [
    { id: 1, name: 'Item 1' },
    // Item 2 REMOVED
    { id: 3, name: 'Item 3' },
  ],
  showDeleteDialog: false,
  itemToDelete: null
}
```

### After "BATAL" (Cancelled)
```typescript
{
  items: [
    { id: 1, name: 'Item 1' },
    { id: 2, name: 'Item 2' },  // ← Still here!
    { id: 3, name: 'Item 3' },
  ],
  showDeleteDialog: false,
  itemToDelete: null
}
```

## Key Points

### ✅ DO
- Always show confirmation dialog before delete
- Keep item in state until confirmed
- Only execute delete on "IYA, LANJUTKAN"
- Close dialog on both buttons
- Reset itemToDelete after dialog closes

### ❌ DON'T
- Don't delete immediately without confirmation
- Don't remove item from UI before confirmation
- Don't execute delete on "BATAL" button
- Don't keep dialog open after button click

## User Experience Flow

```
User clicks delete button
         ↓
Dialog appears with warning
         ↓
    User chooses:
         ↓
    ┌────┴────┐
    ↓         ↓
"BATAL"   "IYA, LANJUTKAN"
    ↓         ↓
Close     Execute delete
dialog         ↓
    ↓      Remove from UI
    ↓         ↓
Item      Show success
remains   message
    ↓         ↓
    └────┬────┘
         ↓
    Dialog closed
```

## Error Handling

### Delete Operation Fails
```typescript
const handleConfirmDelete = async () => {
  try {
    await deleteItem(itemToDelete.id);
    // Success - remove from UI
    setItems(items.filter(i => i.id !== itemToDelete.id));
    showToast('Item berhasil dihapus');
  } catch (error) {
    // Error - keep item in UI
    showToast('Gagal menghapus item');
    // Item remains in list
  } finally {
    // Always close dialog
    setShowDeleteDialog(false);
    setItemToDelete(null);
  }
};
```

### Network Error
If delete fails due to network error:
- Show error message
- Keep item in list
- Close dialog
- User can try again later

## Accessibility

### Keyboard Navigation
- Tab to navigate between buttons
- Enter/Space to activate button
- Escape to cancel (same as "BATAL")

### Screen Reader
- Announce dialog title: "Hapus Permanen?"
- Announce description: "Hapus 1 data secara permanen?"
- Announce button labels clearly
- Announce result after action

## Testing Checklist

- [ ] Click delete → dialog appears
- [ ] Click "BATAL" → dialog closes, item remains
- [ ] Click "IYA, LANJUTKAN" → item deleted, dialog closes
- [ ] Click outside dialog → same as "BATAL"
- [ ] Press Escape → same as "BATAL"
- [ ] Delete fails → item remains, error shown
- [ ] Multiple items → correct item deleted
- [ ] Rapid clicks → no duplicate deletes

## Related Components

### For Order Items
- HistoryScreen: Delete order from history
- ScanScreen: Delete scanned item
- OrderDetailScreen: Delete order item

### For Size Entries
- SizeEntry: Delete size from group
- SizeGroupComponent: Delete entire group
- SizeGroupingSection: Delete category

## Best Practices

1. **Always Confirm Destructive Actions**
   - Use dialog for permanent deletes
   - Make "BATAL" easy to find
   - Use red color for destructive action

2. **Clear Communication**
   - Use clear warning icon
   - State what will be deleted
   - Use action-oriented button labels

3. **Preserve Data Until Confirmed**
   - Don't modify state until confirmed
   - Keep item visible during confirmation
   - Only delete after explicit confirmation

4. **Handle Errors Gracefully**
   - Show error message if delete fails
   - Keep item in list if error occurs
   - Allow user to retry

5. **Provide Feedback**
   - Show loading state during delete
   - Show success message after delete
   - Show error message if fails

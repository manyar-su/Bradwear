# Duplicate Warning Improvements

## Overview
Enhanced duplicate kode barang detection to warn users when saving duplicate codes, whether from the same user or different users, to prevent accidental data overwriting.

## Problem Statement
Previously, the system only showed warnings when a duplicate kode barang was from a DIFFERENT user. This meant:
- Same user could overwrite their own previous entries without warning
- Risk of losing historical data
- No protection against accidental duplicate entries

## Solution Implemented

### Detection Logic Changes

#### Before (v2.6.3 and earlier)
```typescript
const isDifferentOwner = (globalDup && globalDup.namaPenjahit !== formData.namaPenjahit) ||
  (localDup && localDup.namaPenjahit !== formData.namaPenjahit);

if (isDifferentOwner) {
  setShowDuplicateWarning(true);
  setDuplicateOwner((globalDup?.namaPenjahit || localDup?.namaPenjahit || null));
}
```
**Issue**: Only warned for different owners, same user could overwrite silently.

#### After (v2.6.4)
```typescript
const hasDuplicate = localDup || globalDup;

if (hasDuplicate) {
  const ownerName = (globalDup?.namaPenjahit || localDup?.namaPenjahit || null);
  const isDifferentOwner = ownerName && ownerName !== formData.namaPenjahit;
  
  setShowDuplicateWarning(true);
  setDuplicateOwner(ownerName);
}
```
**Improvement**: Warns for ALL duplicates, regardless of owner.

### Warning Messages

#### For Same User (Self-Duplicate)
```
Kode [1234] sudah pernah kamu simpan sebelumnya.

Apakah ini pekerjaan baru dengan kode yang sama?
Jika iya, data akan ditambahkan sebagai entry baru.
```

#### For Different User
```
Kode ini sudah di simpan oleh [Nama User].

Apakah kamu mengerjakan kode barang yang sama?
Jika iya maka kode barang bisa di simpan.
```

### User Flow

1. **User enters kode barang**
   - System checks local orders (existingOrders)
   - System checks global database (syncService.checkDuplicateCode)

2. **Duplicate detected**
   - Warning popup appears
   - Message adapts based on owner (same vs different)
   - User must confirm or cancel

3. **User confirms**
   - Data is saved as NEW entry (not overwriting)
   - Both entries remain in history
   - Each entry has unique ID and timestamp

4. **User cancels**
   - Returns to form
   - User can modify kode barang
   - No data is saved

### Exception: TDP Codes
TDP (Tanpa Data Penjahit) codes are exempt from duplicate warnings:
```typescript
const isTDPCode = formData.kodeBarang.toUpperCase().includes('TDP');
if (isTDPCode) {
  setShowDuplicateWarning(false);
  setDuplicateOwner(null);
  return;
}
```

## Technical Implementation

### State Management
```typescript
const [showDuplicateWarning, setShowDuplicateWarning] = useState(false);
const [duplicateOwner, setDuplicateOwner] = useState<string | null>(null);
const [showConfirmPopup, setShowConfirmPopup] = useState(false);
```

### Duplicate Check (useEffect)
- Triggers on: `formData.kodeBarang` or `existingOrders` change
- Checks: Local orders + Global database
- Filters: Excludes deleted orders (`!o.deletedAt`)
- Updates: Warning state and owner name

### Submit Handler
```typescript
const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  
  // Validation
  if (!formData.namaPenjahit || !formData.kodeBarang) {
    // Show error
    return;
  }

  // Duplicate check
  if (showDuplicateWarning) {
    setShowConfirmPopup(true); // Show confirmation
  } else {
    onSave(formData as OrderItem); // Direct save
  }
};
```

### Confirmation Handler
```typescript
const handleConfirmDuplicate = () => {
  const orderToSave = formData as OrderItem;
  onSave(orderToSave); // Save as new entry
  setShowConfirmPopup(false);
};
```

## Data Integrity

### No Overwriting
- Each save creates a NEW entry with unique ID
- Original entries are preserved
- History shows all entries with same kode barang
- Users can view/manage multiple entries

### Unique Identifiers
Each order has:
- `id`: Unique UUID
- `createdAt`: Timestamp
- `kodeBarang`: Can be duplicate
- `namaPenjahit`: Owner name
- `cloudId`: Sync identifier

### History Display
Multiple entries with same kode barang will show:
- All entries listed separately
- Each with own status, date, details
- Filterable by user, date, status
- Deletable individually

## User Benefits

1. **Prevents Accidental Overwriting**
   - Clear warning before saving duplicate
   - Explicit confirmation required
   - Both entries preserved

2. **Better Data Tracking**
   - Multiple orders with same code tracked separately
   - Historical data preserved
   - Audit trail maintained

3. **Flexible Workflow**
   - Same code can be used for different batches
   - Different users can work on same code
   - Each entry independent

4. **Clear Communication**
   - Contextual messages (same vs different user)
   - Visual warning indicators
   - Easy to understand prompts

## Testing Scenarios

### Scenario 1: Same User, Same Code
1. User "Maris" saves kode "1234"
2. User "Maris" tries to save kode "1234" again
3. Warning appears: "Kode 1234 sudah pernah kamu simpan sebelumnya"
4. User confirms → Both entries saved separately

### Scenario 2: Different User, Same Code
1. User "Maris" saves kode "1234"
2. User "Ferry" tries to save kode "1234"
3. Warning appears: "Kode ini sudah di simpan oleh Maris"
4. User confirms → Both entries saved separately

### Scenario 3: TDP Code
1. User enters kode "TDP1234"
2. No warning appears (TDP exempt)
3. Saves directly without confirmation

### Scenario 4: Cancel Duplicate
1. User tries to save duplicate
2. Warning appears
3. User clicks "Tidak, Ubah"
4. Returns to form, no save

## Version History
- **v2.6.4**: Enhanced duplicate detection for all users
- **v2.6.3**: Basic duplicate detection for different users only
- **v2.6.0**: Initial duplicate check implementation

## Related Files
- `screens/ScanScreen.tsx`: Main implementation
- `services/syncService.ts`: Global duplicate check
- `types.ts`: OrderItem interface
- `screens/HistoryScreen.tsx`: Display multiple entries

## Future Enhancements
1. Show count of existing entries with same code
2. Quick view of existing entries before saving
3. Option to update existing entry instead of creating new
4. Batch duplicate detection for multiple items
5. Smart suggestions for similar codes

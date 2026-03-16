# Quick Reference Guide v2.6.4

## 🚀 What's New in v2.6.4

### 1. Daily Motivation 🎨
- **Location**: Top of Dashboard
- **Duration**: 10 seconds (auto-hide)
- **Action**: Click X to close manually
- **Feature**: Different quote each day

### 2. Enhanced Duplicate Warnings ⚠️
- **Trigger**: When saving duplicate kode barang
- **Behavior**: Warns for ALL duplicates (same user + different user)
- **Action**: Confirm to save as new entry, or cancel to modify
- **Exception**: TDP codes bypass warning

---

## 📱 User Guide

### Daily Motivation
```
1. Open Dashboard
2. See motivational banner at top
3. Read the quote
4. Wait 10s for auto-hide OR click X to close
```

### Saving Orders with Duplicate Codes

#### Scenario 1: Your Own Duplicate
```
1. Enter kode barang (e.g., "1234")
2. Warning appears: "Kode 1234 sudah pernah kamu simpan sebelumnya"
3. Options:
   - "Iya, Simpan" → Saves as NEW entry (both kept)
   - "Tidak, Ubah" → Returns to form to change code
```

#### Scenario 2: Different User's Code
```
1. Enter kode barang (e.g., "1234")
2. Warning appears: "Kode ini sudah di simpan oleh [User]"
3. Options:
   - "Iya, Simpan" → Saves as NEW entry (both kept)
   - "Tidak, Ubah" → Returns to form to change code
```

#### Scenario 3: TDP Code
```
1. Enter kode barang with "TDP" (e.g., "TDP1234")
2. No warning appears
3. Saves directly
```

---

## 💻 Developer Guide

### Installing Dependencies
```bash
npm install framer-motion
```

### Using Daily Motivation
```tsx
import DailyMotivation from '../components/DailyMotivation';

<DailyMotivation isDarkMode={isDarkMode} />
```

### Duplicate Detection Logic
```typescript
// Check for duplicates
const localDup = existingOrders.find(o => o.kodeBarang === formData.kodeBarang && !o.deletedAt);
const globalDup = await syncService.checkDuplicateCode(formData.kodeBarang);

// Show warning if any duplicate found
const hasDuplicate = localDup || globalDup;
if (hasDuplicate) {
  setShowDuplicateWarning(true);
  setDuplicateOwner(ownerName);
}
```

### OCR Multiple Sizes
```typescript
// Input format
"S = 2, M = 3, L = 1"

// Output structure
{
  warna: "PUTIH",
  tangan: "Panjang",
  sizes: [
    { size: "S", jumlah: 2 },
    { size: "M", jumlah: 3 },
    { size: "L", jumlah: 1 }
  ]
}
```

---

## 🔧 Troubleshooting

### Daily Motivation Not Showing
- Check: Component imported in Dashboard.tsx
- Check: framer-motion installed
- Check: No console errors
- Solution: Refresh page

### Duplicate Warning Not Appearing
- Check: Kode barang is not TDP
- Check: Duplicate exists in database
- Check: Network connection for global check
- Solution: Wait for async check to complete

### Animation Laggy
- Check: Device performance
- Check: Browser hardware acceleration
- Solution: Close other tabs, update browser

---

## 📊 Data Structure Reference

### OrderItem with Duplicate Code
```typescript
// Entry 1 (saved first)
{
  id: "uuid-1",
  kodeBarang: "1234",
  namaPenjahit: "Maris",
  createdAt: "2026-03-12T10:00:00Z",
  // ... other fields
}

// Entry 2 (saved later, same code)
{
  id: "uuid-2",
  kodeBarang: "1234",
  namaPenjahit: "Maris",
  createdAt: "2026-03-12T14:00:00Z",
  // ... other fields
}

// Both entries preserved in history
```

### Multiple Sizes in Item
```typescript
{
  warna: "PUTIH",
  tangan: "Panjang",
  sizes: [
    { size: "S", jumlah: 2 },
    { size: "M", jumlah: 3 },
    { size: "L", jumlah: 1 }
  ]
}
```

---

## 🎯 Best Practices

### For Users
1. Read daily motivation for inspiration
2. Always confirm duplicate warnings carefully
3. Use descriptive kode barang
4. Check existing entries before saving

### For Developers
1. Always test duplicate detection
2. Verify animation performance
3. Check dark mode compatibility
4. Document code changes

### For Testers
1. Test with real scan data
2. Verify duplicate scenarios
3. Check mobile responsiveness
4. Test dark mode

---

## 📞 Quick Help

### Common Questions

**Q: Why do I see duplicate warning for my own code?**  
A: To prevent accidental overwriting. Both entries will be saved separately.

**Q: Can I update existing entry instead of creating new?**  
A: Not yet. Currently all saves create new entries. Feature planned for v2.6.5.

**Q: How do I delete duplicate entries?**  
A: Go to History, find the entry, and delete individually.

**Q: Why doesn't TDP code show warning?**  
A: TDP codes are exempt from duplicate checks by design.

**Q: Can I customize motivation quotes?**  
A: Not yet. Custom quotes planned for future version.

---

## 🔗 Related Documentation

- Full changelog: `docs/CHANGELOG_v2.6.4.md`
- Daily motivation: `docs/DAILY_MOTIVATION_INTEGRATION.md`
- Duplicate warnings: `docs/DUPLICATE_WARNING_IMPROVEMENTS.md`
- OCR detection: `docs/OCR_MULTIPLE_SIZES_DETECTION.md`
- Main docs: `docs/README.md`

---

## 📈 Version Info

- **Version**: 2.6.4
- **Release Date**: March 12, 2026
- **Status**: Production Ready
- **Next Version**: 2.6.5 (planned)

---

**Last Updated**: March 12, 2026  
**Document Version**: 1.0

# Changelog v2.7.1

**Release Date**: March 13, 2026  
**Build**: bradflow-v2.7.1-debug.apk

---

## 🎯 Major Fix: Completed Items Now Fully Visible

### Problem Solved
Fixed critical issue where completed work items were disappearing from the History screen if they hadn't been paid yet. This caused confusion and made it impossible to track unpaid completed orders.

---

## ✨ New Features

### 1. **Dual History Sections for Completed Items**

#### Section 1: "Selesai & Lunas" (Completed & Paid)
- **Theme**: Green/Emerald colors
- **Shows**: Items that are completed AND paid
- **Icon**: CalendarDays
- **Status**: `BERES` + `BAYAR`

#### Section 2: "Selesai Belum Lunas" (Completed Not Paid) - NEW! 🆕
- **Theme**: Amber/Yellow warning colors
- **Shows**: Items that are completed but NOT yet paid
- **Icon**: AlertCircle
- **Subtitle**: "Selesai - Menunggu Pembayaran"
- **Status**: `BERES` + `BELUM`

### 2. **Complete Feature Parity**
Both sections now support:
- ✅ Checkbox selection (individual + select all)
- ✅ Bulk actions (Restore, Delete, WhatsApp)
- ✅ Info popup (i) button for full details
- ✅ Date-based grouping (newest first)
- ✅ Collapsible groups (default: collapsed)
- ✅ Responsive design
- ✅ Dark mode support

### 3. **Independent Collapse State**
- Each date group can be expanded/collapsed independently
- Paid and unpaid sections maintain separate collapse states
- All groups default to collapsed for cleaner UI

---

## 🔧 Technical Improvements

### Data Processing
- Separated completed items into two distinct groups: paid and unpaid
- Both groups use date-based grouping by `completedAt` field
- Sorted newest first (descending order)

### UI/UX Enhancements
- Visual distinction with color themes (green for paid, amber for unpaid)
- Clear labeling to avoid confusion
- Warning icon (AlertCircle) for unpaid items draws attention
- Consistent table structure across both sections

### Code Quality
- Unique group keys prevent state conflicts (`paid-${date}` vs `unpaid-${date}`)
- Maintained all existing functionality
- No breaking changes to existing features

---

## 🐛 Bug Fixes

### Critical Fix: Missing Completed Items
**Issue**: Items with `status === BERES` but `paymentStatus !== BAYAR` were invisible in the UI

**Root Cause**: Only one history section existed, requiring BOTH completion AND payment

**Solution**: Added dedicated section for completed but unpaid items

**Impact**: 
- ❌ Before: Completed unpaid items disappeared from UI
- ✅ After: ALL completed items now visible and manageable

---

## 📊 User Impact

### Before v2.7.1
- Completed unpaid items were invisible
- Users couldn't track unpaid completed work
- Data existed in database but not in UI
- Confusion about "missing" orders

### After v2.7.1
- ALL completed items visible in history
- Clear separation between paid and unpaid
- Easy payment status tracking
- Better workflow management
- No data loss

---

## 🎨 Visual Changes

### New Section Styling
- **Amber Theme**: Warning color scheme for unpaid items
- **AlertCircle Icon**: Visual indicator for pending payment
- **Subtitle**: "Selesai - Menunggu Pembayaran" provides context
- **Border**: Amber border (10% opacity) for subtle distinction

### Maintained Consistency
- Same table structure as paid section
- Consistent typography and spacing
- Responsive design preserved
- Dark mode fully supported

---

## 📝 Files Modified

### Core Changes
- `screens/HistoryScreen.tsx`
  - Added `groupedUnpaidItems` data processing
  - Updated collapse state management
  - Added unpaid section UI rendering
  - Modified group key system for uniqueness

### Documentation Added
- `docs/FIX_COMPLETED_ITEMS_HISTORY.md` - Technical details
- `docs/TASK_15_COMPLETION_SUMMARY.md` - Task summary
- `docs/CHANGELOG_v2.7.1.md` - This changelog

---

## 🧪 Testing

### Verified Functionality
- ✅ Paid items show in "Selesai & Lunas"
- ✅ Unpaid items show in "Selesai Belum Lunas"
- ✅ Date grouping works correctly
- ✅ Collapse/expand functions independently
- ✅ Checkbox selection works in both sections
- ✅ Bulk restore works
- ✅ Bulk delete works
- ✅ WhatsApp sharing works
- ✅ Info popup displays correct data
- ✅ Dark mode styling correct
- ✅ Responsive design maintained
- ✅ No syntax errors
- ✅ TypeScript compilation successful

---

## 🚀 Upgrade Notes

### For Users
- No action required - update will work seamlessly
- Existing data will automatically appear in correct sections
- All previous features remain unchanged

### For Developers
- No breaking changes
- All existing APIs maintained
- New section uses same component patterns

---

## 📦 Build Information

- **Version**: 2.7.1
- **Version Code**: 20701
- **Package**: com.bradwear.flow
- **Build Type**: Debug
- **File**: bradflow-v2.7.1-debug.apk
- **Location**: `android/apk/debug/`

---

## 🔗 Related Issues

Resolves user query:
> "kenapa kerjaan yang selesai tidak di simpan di histori selesai ?? kemudian data menghilang bukanya di tamppilkan semua sesuai dengan database per user"

**Translation**: "Why is completed work not saved in completed history? Then the data disappears instead of showing all according to the database per user"

---

## 📚 Documentation

For detailed technical information, see:
- [Fix Documentation](./FIX_COMPLETED_ITEMS_HISTORY.md)
- [Task Summary](./TASK_15_COMPLETION_SUMMARY.md)
- [Bulk Operations Workflow](./WORKFLOW_HISTORY_BULK_OPERATIONS.md)

---

## 🎉 Summary

Version 2.7.1 fixes a critical issue where completed but unpaid items were invisible in the History screen. Now ALL completed items are properly displayed in two distinct sections based on payment status, providing better visibility and workflow management.

**Key Achievement**: Zero data loss - every completed item is now visible and manageable in the UI.

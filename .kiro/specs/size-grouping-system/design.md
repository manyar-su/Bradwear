# Design Document: Size Grouping System

## Overview

The Size Grouping System redesigns the size entry interface in ScanScreen to organize sizes by their category attributes (Gender+Tangan for shirts, Model for pants/vests). This eliminates the current issues where each size incorrectly has its own category fields, "Hapus Size" buttons don't work, and duplicate forms appear.

The new system introduces a grouping concept where:
- **KEMEJA (Shirts)**: Sizes are grouped by Gender + Tangan combination
- **CELANA (Pants)**: Sizes are grouped by Model (Warrior/Armor)
- **ROMPI (Vests)**: Sizes are grouped by Model (Bupati/Custom)

Each group has ONE set of category fields at the header level, with multiple sizes (each having only Size + Quantity) within the group. This provides a cleaner, more maintainable interface that correctly represents the data structure.

## Architecture

### Component Structure

```
ScanScreen
├── Size Entry Section
│   ├── Size Group 1
│   │   ├── Category Header (Gender/Tangan or Model)
│   │   ├── Size Entry 1 (Size + Quantity)
│   │   ├── Size Entry 2 (Size + Quantity)
│   │   ├── ...
│   │   ├── "Tambah Size" Button
│   │   └── Subtotal Display
│   ├── Size Group 2
│   │   └── ...
│   ├── "Tambah Kategori Baru" Button
│   └── Grand Total Display
```

### Data Flow

1. **Input**: User selects jenis barang (KEMEJA/CELANA/ROMPI)
2. **Grouping Logic**: System determines grouping strategy based on jenis barang
3. **State Management**: Internal grouped state structure
4. **Serialization**: Convert grouped state to flat SizeDetail[] for persistence
5. **Deserialization**: Convert flat SizeDetail[] back to grouped state for editing

### Key Design Decisions

1. **Internal Grouped State**: Maintain an internal state structure that groups sizes by category, separate from the persisted SizeDetail[] format
2. **Serialization Layer**: Implement bidirectional conversion between grouped state and flat SizeDetail[] array
3. **Dynamic Category Fields**: Render different category fields based on jenis barang
4. **Cascade Deletion**: Remove entire group when last size is deleted
5. **Add ModelRompi Enum**: Introduce new enum type for vest models (BUPATI, CUSTOM)

## Components and Interfaces

### New Type Definitions

```typescript
// Add to types.ts
export enum ModelRompi {
  BUPATI = 'Bupati',
  CUSTOM = 'Custom'
}

// Internal grouped state structure (not persisted)
interface SizeGroup {
  id: string; // Unique identifier for React keys
  // Category attributes (only relevant ones based on jenis barang)
  gender?: 'Pria' | 'Wanita';
  tangan?: 'Panjang' | 'Pendek';
  modelCelana?: ModelCelana;
  modelRompi?: ModelRompi;
  // Shared attributes across all sizes in group
  warna?: string;
  model?: string; // For KEMEJA
  sakuType?: SakuType;
  sakuColor?: SakuColor;
  bahanKemeja?: BahanKemeja;
  bahanCelana?: BahanCelana;
  jenisSakuRompi?: JenisSakuRompi;
  // Array of sizes within this group
  sizes: Array<{
    id: string;
    size: string;
    jumlah: number;
    namaPerSize?: string;
    isCustomSize?: boolean;
    customMeasurements?: CustomMeasurements;
  }>;
}
```

### Component Breakdown

#### SizeGroupComponent
Renders a single size group with:
- Category header with appropriate fields based on jenis barang
- List of size entries (size + quantity)
- "Tambah Size" button
- "Hapus Size" buttons (except for first size)
- Subtotal display

#### CategoryHeader
Renders category fields based on jenis barang:
- KEMEJA: Gender dropdown + Tangan dropdown
- CELANA: Model dropdown (Warrior/Armor)
- ROMPI: Model dropdown (Bupati/Custom)

#### SizeEntry
Renders individual size input:
- Size name input
- Quantity input
- "Hapus Size" button (conditional)
- Optional: Nama per size, custom measurements

#### SubtotalDisplay
Shows category breakdown and total for a group:
- Category name (e.g., "Tangan Pendek", "Warrior")
- Sum of quantities in group

#### GrandTotalDisplay
Shows overall summary:
- List of all categories with their totals
- Grand total across all groups

### State Management Functions

```typescript
// Convert flat SizeDetail[] to grouped structure
function deserializeSizeDetails(
  sizeDetails: SizeDetail[],
  jenisBarang: JenisBarang
): SizeGroup[]

// Convert grouped structure to flat SizeDetail[]
function serializeSizeGroups(
  groups: SizeGroup[],
  jenisBarang: JenisBarang
): SizeDetail[]

// Get grouping key for a size detail
function getGroupKey(
  sd: SizeDetail,
  jenisBarang: JenisBarang
): string

// Check if two groups have matching category attributes
function areGroupsEqual(
  group1: SizeGroup,
  group2: SizeGroup,
  jenisBarang: JenisBarang
): boolean

// Calculate subtotal for a group
function calculateGroupSubtotal(group: SizeGroup): number

// Calculate grand total across all groups
function calculateGrandTotal(groups: SizeGroup[]): number

// Get category display name for a group
function getCategoryDisplayName(
  group: SizeGroup,
  jenisBarang: JenisBarang
): string
```

## Data Models

### Existing SizeDetail Interface (Unchanged)
The existing `SizeDetail` interface in types.ts remains unchanged for backward compatibility. The system will serialize/deserialize between the grouped format and this flat format.

### Internal Grouped State
The component will maintain an internal state using the `SizeGroup[]` structure. This is not persisted directly but is converted to/from `SizeDetail[]` when saving/loading.

### Grouping Strategy by Jenis Barang

| Jenis Barang | Grouping Attributes | Example Groups |
|--------------|---------------------|----------------|
| KEMEJA | gender + tangan | [Laki-laki, Pendek], [Laki-laki, Panjang], [Perempuan, Pendek] |
| CELANA | modelCelana | [Warrior], [Armor] |
| ROMPI | modelRompi | [Bupati], [Custom] |

### Serialization Example

**Grouped State (Internal)**:
```javascript
[
  {
    id: "group-1",
    gender: "Pria",
    tangan: "Pendek",
    warna: "Putih",
    model: "Brad V2",
    sizes: [
      { id: "size-1", size: "M", jumlah: 5 },
      { id: "size-2", size: "L", jumlah: 3 }
    ]
  }
]
```

**Serialized to SizeDetail[] (Persisted)**:
```javascript
[
  {
    size: "M",
    jumlah: 5,
    gender: "Pria",
    tangan: "Pendek",
    warna: "Putih",
    model: "Brad V2"
  },
  {
    size: "L",
    jumlah: 3,
    gender: "Pria",
    tangan: "Pendek",
    warna: "Putih",
    model: "Brad V2"
  }
]
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property Reflection

After analyzing all testable acceptance criteria, I identified the following redundancies:
- **4.1 and 4.3** both test that the first size in a group doesn't have a delete button - these can be combined
- **9.3 and 9.4** form a round-trip property (serialize then deserialize should preserve structure) - these should be combined into one comprehensive round-trip property
- **6.7 and 7.4** both test reactivity of totals when quantities change - 7.4 is more comprehensive as it covers all groups
- **1.1, 1.2, 1.3** can be combined into one property about grouping by jenis barang
- **6.3, 6.4, 6.5** can be combined into one property about category name display based on jenis barang

After consolidation, the unique properties are:

### Property 1: Dynamic Grouping by Jenis Barang

*For any* set of size details and jenis barang (KEMEJA/CELANA/ROMPI), when deserializing to grouped format, sizes SHALL be grouped by the appropriate category attributes: Gender+Tangan for KEMEJA, modelCelana for CELANA, modelRompi for ROMPI.

**Validates: Requirements 1.1, 1.2, 1.3**

### Property 2: Category Field Visibility

*For any* jenis barang, when rendering the size entry system, Gender and Tangan fields SHALL only appear when jenis barang is KEMEJA or undefined, and SHALL NOT appear for CELANA or ROMPI.

**Validates: Requirements 1.4, 1.5**

### Property 3: Category Header Presence

*For any* grouped state with N groups, the rendered component SHALL contain exactly N category header elements, one for each group.

**Validates: Requirements 2.1**

### Property 4: Category Header Fields by Jenis Barang

*For any* size group, when jenis barang is KEMEJA, the category header SHALL contain Gender and Tangan fields; when CELANA, it SHALL contain Model field with Warrior/Armor options; when ROMPI, it SHALL contain Model field with Bupati/Custom options.

**Validates: Requirements 2.2, 2.3, 2.4**

### Property 5: Multiple Sizes Per Group

*For any* size group with N sizes, the rendered group SHALL contain exactly N size entry elements, each with size name and quantity fields.

**Validates: Requirements 2.5, 2.6**

### Property 6: Add Size Button Presence

*For any* grouped state with N groups, the rendered component SHALL contain exactly N "Tambah Size" buttons, one for each group.

**Validates: Requirements 3.1**

### Property 7: Add Size Within Group

*For any* size group with N sizes, when the "Tambah Size" button for that group is clicked, the group SHALL contain N+1 sizes, and the total number of groups SHALL remain unchanged.

**Validates: Requirements 3.2, 3.4**

### Property 8: New Size Initialization

*For any* newly added size entry, it SHALL have an empty string for size name and 0 for quantity.

**Validates: Requirements 3.3**

### Property 9: Delete Button Visibility

*For any* size group, the first size entry SHALL NOT have a "Hapus Size" button, and all subsequent size entries SHALL have a "Hapus Size" button.

**Validates: Requirements 4.1, 4.3**

### Property 10: Delete Size Functionality

*For any* size group with N sizes (where N > 1), when the "Hapus Size" button for size at index i (where i > 0) is clicked, the group SHALL contain N-1 sizes, and the size at index i SHALL be removed.

**Validates: Requirements 4.2**

### Property 11: Cascade Group Deletion

*For any* size group with exactly 1 size, when that size is removed (by removing the group itself, since the first size has no delete button), the group SHALL be removed from the grouped state.

**Validates: Requirements 4.4**

### Property 12: Add Category Button Presence

*For any* size entry system state, the rendered component SHALL contain exactly one "Tambah Kategori Baru" button.

**Validates: Requirements 5.1**

### Property 13: Add New Group

*For any* grouped state with N groups, when the "Tambah Kategori Baru" button is clicked, the state SHALL contain N+1 groups.

**Validates: Requirements 5.2**

### Property 14: New Group Initialization

*For any* newly created size group, it SHALL contain exactly one size entry with empty size name and zero quantity, and SHALL have default category attribute values based on jenis barang.

**Validates: Requirements 5.3, 5.4, 5.5, 5.6**

### Property 15: Subtotal Display Presence

*For any* grouped state with N groups, the rendered component SHALL contain exactly N subtotal displays, one for each group.

**Validates: Requirements 6.1**

### Property 16: Subtotal Category Name Display

*For any* size group, the subtotal display SHALL show a category name that matches the group's category attributes: "Tangan [Pendek/Panjang]" for KEMEJA, Model name for CELANA/ROMPI.

**Validates: Requirements 6.2, 6.3, 6.4, 6.5**

### Property 17: Subtotal Calculation

*For any* size group, the subtotal SHALL equal the sum of all quantity values across all sizes in that group.

**Validates: Requirements 6.6**

### Property 18: Grand Total Display Presence

*For any* size entry system state, the rendered component SHALL contain exactly one grand total display at the bottom of all groups.

**Validates: Requirements 7.1**

### Property 19: Grand Total Category Breakdown

*For any* grouped state, the grand total display SHALL list all unique category names with their respective subtotals.

**Validates: Requirements 7.2**

### Property 20: Grand Total Calculation

*For any* grouped state, the grand total SHALL equal the sum of all subtotals across all groups.

**Validates: Requirements 7.3**

### Property 21: Total Reactivity

*For any* grouped state, when any quantity value changes or when groups are added/removed, both the affected subtotal and the grand total SHALL update to reflect the new sums.

**Validates: Requirements 6.7, 7.4, 7.5**

### Property 22: Group Equality by Jenis Barang

*For any* two size groups and jenis barang, the groups SHALL be considered equal if and only if: for KEMEJA, they have the same gender AND tangan; for CELANA, they have the same modelCelana; for ROMPI, they have the same modelRompi.

**Validates: Requirements 8.2, 8.3, 8.4**

### Property 23: Grouped State Structure

*For any* internal grouped state, each group SHALL have a structure containing category attributes (appropriate to jenis barang) and an array of sizes, where each size has size name and quantity.

**Validates: Requirements 9.1**

### Property 24: Serialization Round Trip

*For any* grouped state, serializing to SizeDetail[] format and then deserializing back to grouped format SHALL produce an equivalent grouped state with the same groups, category attributes, and sizes.

**Validates: Requirements 9.2, 9.3, 9.4**

## Error Handling

### Invalid State Scenarios

1. **Empty Group**: If a group somehow has zero sizes, the system should either auto-remove the group or prevent the state from occurring
2. **Missing Category Attributes**: If a group is missing required category attributes for its jenis barang, use default values
3. **Invalid Jenis Barang**: If jenis barang is undefined or invalid, default to KEMEJA behavior
4. **Negative Quantities**: Validate that quantity inputs cannot be negative; default to 0 if invalid
5. **Duplicate Groups**: While not prevented at creation, the serialization should handle duplicate category combinations by merging or keeping them separate based on other attributes (like warna)

### User Input Validation

1. **Quantity Input**: Only accept non-negative integers
2. **Size Name**: Accept any string, including empty (for custom sizes)
3. **Category Fields**: Enforce selection from enum values only

### Serialization Errors

1. **Malformed SizeDetail[]**: If deserializing from invalid data, create a default single group with one empty size
2. **Missing Required Fields**: Use default values for missing category attributes during deserialization

## Testing Strategy

### Dual Testing Approach

The testing strategy employs both unit tests and property-based tests to ensure comprehensive coverage:

- **Unit Tests**: Focus on specific examples, edge cases, and integration points between components
- **Property Tests**: Verify universal properties across all inputs using randomized test data

Together, these approaches provide comprehensive coverage where unit tests catch concrete bugs and property tests verify general correctness.

### Property-Based Testing

**Library**: Use `fast-check` for JavaScript/TypeScript property-based testing

**Configuration**:
- Minimum 100 iterations per property test
- Each test must reference its design document property using a comment tag
- Tag format: `// Feature: size-grouping-system, Property {number}: {property_text}`

**Property Test Examples**:

1. **Property 1 - Dynamic Grouping**: Generate random SizeDetail[] arrays with various jenis barang values, deserialize to grouped format, verify sizes are grouped by correct attributes

2. **Property 17 - Subtotal Calculation**: Generate random size groups with random quantities, verify subtotal equals sum of quantities

3. **Property 24 - Serialization Round Trip**: Generate random grouped states, serialize to SizeDetail[], deserialize back, verify equivalence

### Unit Testing

**Focus Areas**:
- Specific jenis barang scenarios (KEMEJA with Gender+Tangan, CELANA with Model, ROMPI with Model)
- Edge cases: single group, single size, empty state
- Button click handlers: add size, delete size, add group
- UI rendering: correct fields displayed for each jenis barang
- Cascade deletion: removing last size removes group
- Default value initialization for new groups and sizes

**Example Unit Tests**:
- Test that clicking "Tambah Size" on group 2 adds a size to group 2 only
- Test that CELANA groups don't render Gender/Tangan fields
- Test that deleting the only size in a group removes the group
- Test that new KEMEJA groups have default Gender="Pria" and Tangan="Pendek"
- Test that subtotal displays "Tangan Pendek" for KEMEJA group with tangan="Pendek"

### Integration Testing

- Test full workflow: select jenis barang → add group → add sizes → verify serialization → save → load → verify deserialization
- Test interaction between multiple groups: add/delete groups, verify grand total updates
- Test switching jenis barang: verify category fields change appropriately

### Manual Testing Checklist

- [ ] Visual hierarchy: groups are clearly distinguished from sizes
- [ ] Responsive layout: works on mobile and desktop
- [ ] Accessibility: keyboard navigation, screen reader support
- [ ] Performance: smooth updates with many groups/sizes
- [ ] User experience: intuitive button placement, clear labels


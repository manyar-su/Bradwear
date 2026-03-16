# Requirements Document

## Introduction

This document specifies requirements for implementing a group-based size entry system in the ScanScreen of a React Native/Expo clothing order management application. The current system has critical issues: non-functional "Hapus Size" buttons, duplicated Gender/Tangan fields per size, and incorrect data structure where each size has its own category fields. The new system will group sizes by their category (Gender+Tangan for shirts, Model for pants/vests) to eliminate duplication and provide a cleaner, more maintainable interface.

## Glossary

- **Size_Entry_System**: The UI component in ScanScreen that allows users to input clothing sizes and quantities
- **Size_Group**: A collection of sizes that share the same category attributes (Gender+Tangan for Kemeja, Model for Celana/Rompi)
- **Category_Header**: The header section of a Size_Group displaying the shared attributes
- **KEMEJA**: Shirt type clothing (uses Gender + Tangan grouping)
- **CELANA**: Pants type clothing (uses Model grouping: Warrior/Armor)
- **ROMPI**: Vest type clothing (uses Model grouping: Bupati/Custom)
- **Tangan**: Sleeve type for shirts (Pendek=Short, Panjang=Long)
- **Gender**: Gender classification (Laki-laki=Male, Perempuan=Female)
- **Model**: Style variant for pants and vests
- **Subtotal_Display**: Summary showing category name and total pieces for a Size_Group
- **Grand_Total_Display**: Overall summary showing all categories and total pieces across all Size_Groups

## Requirements

### Requirement 1: Dynamic Category-Based Grouping

**User Story:** As a user entering clothing orders, I want sizes to be grouped by their category attributes, so that I don't have to repeatedly enter the same Gender/Tangan/Model information for each size.

#### Acceptance Criteria

1. WHEN the jenis barang is KEMEJA, THE Size_Entry_System SHALL group sizes by the combination of Gender and Tangan
2. WHEN the jenis barang is CELANA, THE Size_Entry_System SHALL group sizes by Model (Warrior or Armor)
3. WHEN the jenis barang is ROMPI, THE Size_Entry_System SHALL group sizes by Model (Bupati or Custom)
4. THE Size_Entry_System SHALL NOT display Gender fields for CELANA or ROMPI
5. THE Size_Entry_System SHALL NOT display Tangan fields for CELANA or ROMPI

### Requirement 2: Size Group Structure

**User Story:** As a user, I want each size group to have a clear header with category information and multiple sizes within it, so that I can easily understand which sizes belong to which category.

#### Acceptance Criteria

1. THE Size_Entry_System SHALL display a Category_Header for each Size_Group
2. WHEN jenis barang is KEMEJA, THE Category_Header SHALL display Gender and Tangan fields
3. WHEN jenis barang is CELANA, THE Category_Header SHALL display a Model field with options Warrior and Armor
4. WHEN jenis barang is ROMPI, THE Category_Header SHALL display a Model field with options Bupati and Custom
5. THE Size_Entry_System SHALL display multiple size entries within each Size_Group
6. THE Size_Entry_System SHALL display each size entry with size name and quantity fields

### Requirement 3: Add Size Within Group

**User Story:** As a user, I want to add new sizes to an existing group, so that I can enter multiple sizes for the same category without creating duplicate groups.

#### Acceptance Criteria

1. THE Size_Entry_System SHALL display a "Tambah Size" button for each Size_Group
2. WHEN the "Tambah Size" button is clicked, THE Size_Entry_System SHALL add a new size entry to that specific Size_Group
3. THE Size_Entry_System SHALL initialize the new size entry with empty size name and zero quantity
4. THE Size_Entry_System SHALL NOT create a new Size_Group when "Tambah Size" is clicked

### Requirement 4: Remove Size Functionality

**User Story:** As a user, I want to remove individual sizes from a group, so that I can correct mistakes without deleting the entire group.

#### Acceptance Criteria

1. THE Size_Entry_System SHALL display a "Hapus Size" button for each size entry except the first one in each Size_Group
2. WHEN the "Hapus Size" button is clicked, THE Size_Entry_System SHALL remove that specific size entry from the Size_Group
3. THE Size_Entry_System SHALL NOT display a "Hapus Size" button for the first size entry in each Size_Group
4. WHEN a size entry is removed and it is the last remaining size in a Size_Group, THE Size_Entry_System SHALL remove the entire Size_Group

### Requirement 5: Add New Category Group

**User Story:** As a user, I want to create new category groups, so that I can enter sizes for different Gender/Tangan combinations or Models.

#### Acceptance Criteria

1. THE Size_Entry_System SHALL display a "Tambah Kategori Baru" button
2. WHEN the "Tambah Kategori Baru" button is clicked, THE Size_Entry_System SHALL create a new Size_Group
3. THE Size_Entry_System SHALL initialize the new Size_Group with one empty size entry
4. WHEN jenis barang is KEMEJA, THE Size_Entry_System SHALL initialize the new Size_Group with default Gender and Tangan values
5. WHEN jenis barang is CELANA, THE Size_Entry_System SHALL initialize the new Size_Group with default Model value from ModelCelana enum
6. WHEN jenis barang is ROMPI, THE Size_Entry_System SHALL initialize the new Size_Group with a default Model value

### Requirement 6: Subtotal Display Per Group

**User Story:** As a user, I want to see the total quantity for each category group, so that I can quickly verify the quantities for each Gender/Tangan or Model combination.

#### Acceptance Criteria

1. THE Size_Entry_System SHALL display a Subtotal_Display for each Size_Group
2. THE Subtotal_Display SHALL show the category name based on the group's attributes
3. WHEN jenis barang is KEMEJA, THE Subtotal_Display SHALL show "Tangan [Pendek/Panjang]" as the category name
4. WHEN jenis barang is CELANA, THE Subtotal_Display SHALL show the Model name as the category name
5. WHEN jenis barang is ROMPI, THE Subtotal_Display SHALL show the Model name as the category name
6. THE Subtotal_Display SHALL calculate and display the sum of all quantities within that Size_Group
7. WHEN any quantity in the Size_Group changes, THE Subtotal_Display SHALL update automatically

### Requirement 7: Grand Total Display

**User Story:** As a user, I want to see the overall total across all category groups, so that I can verify the complete order quantity matches my expectations.

#### Acceptance Criteria

1. THE Size_Entry_System SHALL display a Grand_Total_Display at the bottom of all Size_Groups
2. THE Grand_Total_Display SHALL list all category names with their respective totals
3. THE Grand_Total_Display SHALL calculate and display the sum of all quantities across all Size_Groups
4. WHEN any quantity in any Size_Group changes, THE Grand_Total_Display SHALL update automatically
5. WHEN a Size_Group is added or removed, THE Grand_Total_Display SHALL update automatically

### Requirement 8: Category Deduplication

**User Story:** As a user, I want the system to prevent duplicate category groups, so that I don't accidentally create multiple groups for the same Gender/Tangan or Model combination.

#### Acceptance Criteria

1. WHEN a user attempts to create a new Size_Group with category attributes that match an existing Size_Group, THE Size_Entry_System SHALL add the size to the existing Size_Group instead of creating a duplicate
2. WHEN jenis barang is KEMEJA, THE Size_Entry_System SHALL consider two groups identical if they have the same Gender and Tangan values
3. WHEN jenis barang is CELANA, THE Size_Entry_System SHALL consider two groups identical if they have the same Model value
4. WHEN jenis barang is ROMPI, THE Size_Entry_System SHALL consider two groups identical if they have the same Model value

### Requirement 9: Data Structure Migration

**User Story:** As a developer, I want the data structure to support grouped sizes, so that the implementation can efficiently manage and persist the grouped size information.

#### Acceptance Criteria

1. THE Size_Entry_System SHALL store size groups in a structured format that includes category attributes and an array of sizes
2. THE Size_Entry_System SHALL maintain backward compatibility with existing SizeDetail interface
3. THE Size_Entry_System SHALL serialize grouped size data to the existing OrderItem.sizeDetails array format for persistence
4. THE Size_Entry_System SHALL deserialize OrderItem.sizeDetails array into grouped format for display and editing

### Requirement 10: UI Visual Hierarchy

**User Story:** As a user, I want clear visual distinction between groups and sizes, so that I can easily navigate and understand the structure of my order.

#### Acceptance Criteria

1. THE Size_Entry_System SHALL visually distinguish Category_Headers from size entries using styling
2. THE Size_Entry_System SHALL visually group size entries under their respective Category_Header
3. THE Size_Entry_System SHALL display group boundaries using visual separators or containers
4. THE Size_Entry_System SHALL use consistent spacing and alignment within each Size_Group

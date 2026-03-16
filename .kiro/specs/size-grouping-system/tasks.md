# Implementation Plan: Size Grouping System

## Overview

This implementation redesigns the size entry section in ScanScreen to use a group-based structure where sizes are organized by their category attributes (Gender+Tangan for KEMEJA, Model for CELANA/ROMPI). The implementation adds new type definitions, serialization/deserialization functions, and completely redesigns the size entry UI with proper group management, working delete buttons, and accurate subtotal/grand total displays.

## Tasks

- [-] 1. Add new type definitions to types.ts
  - Add ModelRompi enum with BUPATI and CUSTOM values
  - Add SizeGroup interface for internal grouped state structure
  - _Requirements: 9.1_

- [x] 2. Implement serialization and deserialization functions
  - [x] 2.1 Create helper functions for grouping logic
    - Implement getGroupKey() to generate unique keys based on jenis barang and category attributes
    - Implement areGroupsEqual() to compare groups by category attributes
    - Implement getCategoryDisplayName() to generate display names for subtotals
    - _Requirements: 1.1, 1.2, 1.3, 8.2, 8.3, 8.4, 6.3, 6.4, 6.5_
  
  - [x] 2.2 Implement deserializeSizeDetails() function
    - Convert flat SizeDetail[] array to grouped SizeGroup[] structure
    - Group sizes by appropriate attributes based on jenis barang
    - Generate unique IDs for groups and sizes
    - _Requirements: 9.4, 1.1, 1.2, 1.3_
  
  - [ ]* 2.3 Write property test for deserialization grouping
    - **Property 1: Dynamic Grouping by Jenis Barang**
    - **Validates: Requirements 1.1, 1.2, 1.3**
  
  - [x] 2.4 Implement serializeSizeGroups() function
    - Convert grouped SizeGroup[] structure to flat SizeDetail[] array
    - Duplicate category attributes across all sizes in each group
    - Maintain backward compatibility with existing SizeDetail interface
    - _Requirements: 9.3, 9.2_
  
  - [ ]* 2.5 Write property test for serialization round trip
    - **Property 24: Serialization Round Trip**
    - **Validates: Requirements 9.2, 9.3, 9.4**

- [x] 3. Implement calculation functions
  - [x] 3.1 Create calculateGroupSubtotal() function
    - Sum all jumlah values within a size group
    - _Requirements: 6.6_
  
  - [ ]* 3.2 Write property test for subtotal calculation
    - **Property 17: Subtotal Calculation**
    - **Validates: Requirements 6.6**
  
  - [x] 3.3 Create calculateGrandTotal() function
    - Sum all subtotals across all groups
    - _Requirements: 7.3_
  
  - [ ]* 3.4 Write property test for grand total calculation
    - **Property 20: Grand Total Calculation**
    - **Validates: Requirements 7.3**

- [x] 4. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Implement CategoryHeader component
  - [x] 5.1 Create CategoryHeader component with dynamic field rendering
    - Render Gender + Tangan dropdowns for KEMEJA
    - Render Model dropdown with Warrior/Armor options for CELANA
    - Render Model dropdown with Bupati/Custom options for ROMPI
    - Handle category attribute changes and propagate to parent
    - _Requirements: 2.2, 2.3, 2.4, 1.4, 1.5_
  
  - [ ]* 5.2 Write unit tests for CategoryHeader
    - Test correct fields displayed for each jenis barang
    - Test that Gender/Tangan don't appear for CELANA/ROMPI
    - _Requirements: 1.4, 1.5, 2.2, 2.3, 2.4_

- [x] 6. Implement SizeEntry component
  - [x] 6.1 Create SizeEntry component
    - Render size name input and quantity input
    - Conditionally render "Hapus Size" button (not for first size)
    - Handle size/quantity changes and propagate to parent
    - _Requirements: 2.6, 4.1, 4.3_
  
  - [ ]* 6.2 Write unit tests for SizeEntry
    - Test that first size doesn't have delete button
    - Test that subsequent sizes have delete button
    - _Requirements: 4.1, 4.3_

- [x] 7. Implement SubtotalDisplay component
  - [x] 7.1 Create SubtotalDisplay component
    - Display category name using getCategoryDisplayName()
    - Display calculated subtotal for the group
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_
  
  - [ ]* 7.2 Write unit tests for SubtotalDisplay
    - Test category name display for different jenis barang
    - Test subtotal calculation display
    - _Requirements: 6.2, 6.3, 6.4, 6.5, 6.6_

- [x] 8. Implement GrandTotalDisplay component
  - [x] 8.1 Create GrandTotalDisplay component
    - List all category names with their subtotals
    - Display grand total across all groups
    - _Requirements: 7.1, 7.2, 7.3_
  
  - [ ]* 8.2 Write unit tests for GrandTotalDisplay
    - Test category breakdown display
    - Test grand total calculation display
    - _Requirements: 7.1, 7.2, 7.3_

- [x] 9. Implement SizeGroupComponent
  - [x] 9.1 Create SizeGroupComponent
    - Render CategoryHeader with group's category attributes
    - Render list of SizeEntry components for all sizes in group
    - Render "Tambah Size" button
    - Render SubtotalDisplay
    - Handle add size action (add new size to group's sizes array)
    - Handle delete size action (remove size from group, cascade delete if last size)
    - _Requirements: 2.1, 2.5, 3.1, 3.2, 3.3, 4.2, 4.4, 6.1_
  
  - [ ]* 9.2 Write unit tests for SizeGroupComponent
    - Test that clicking "Tambah Size" adds size to correct group
    - Test that deleting a size removes it from the group
    - Test cascade deletion when last size is removed
    - _Requirements: 3.2, 3.4, 4.2, 4.4_

- [x] 10. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 11. Redesign size entry section in ScanScreen.tsx
  - [x] 11.1 Add state management for grouped sizes
    - Add sizeGroups state using SizeGroup[] type
    - Initialize state by deserializing existing sizeDetails on mount
    - Serialize sizeGroups back to sizeDetails when saving
    - _Requirements: 9.1, 9.3, 9.4_
  
  - [x] 11.2 Implement add new group functionality
    - Add "Tambah Kategori Baru" button handler
    - Create new group with default category attributes based on jenis barang
    - Initialize new group with one empty size entry
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_
  
  - [x] 11.3 Render size entry section with grouped structure
    - Map over sizeGroups to render SizeGroupComponent for each group
    - Render "Tambah Kategori Baru" button after all groups
    - Render GrandTotalDisplay at the bottom
    - Apply visual styling for group boundaries and hierarchy
    - _Requirements: 2.1, 5.1, 7.1, 10.1, 10.2, 10.3, 10.4_
  
  - [x] 11.4 Implement reactive total updates
    - Ensure subtotals update when quantities change within groups
    - Ensure grand total updates when quantities change or groups are added/removed
    - _Requirements: 6.7, 7.4, 7.5_
  
  - [ ]* 11.5 Write integration tests for ScanScreen size entry
    - Test full workflow: add group → add sizes → verify serialization
    - Test interaction between multiple groups
    - Test grand total updates across all operations
    - _Requirements: 6.7, 7.4, 7.5, 9.2, 9.3, 9.4_

- [x] 12. Final checkpoint - Ensure all tests pass and verify backward compatibility
  - Ensure all tests pass, ask the user if questions arise.
  - Verify that existing order data loads correctly with new deserialization
  - Verify that saved data maintains SizeDetail[] format for backward compatibility

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- The implementation uses TypeScript with React Native
- Serialization/deserialization ensures backward compatibility with existing SizeDetail[] format
- Property tests validate universal correctness properties using fast-check library
- Unit tests validate specific examples and edge cases
- Visual hierarchy and styling should clearly distinguish groups from individual size entries

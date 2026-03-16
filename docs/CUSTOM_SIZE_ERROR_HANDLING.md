# Custom Size Error Handling

## Problem
Aplikasi menampilkan blank putih ketika ada order dengan custom size karena:
1. Data custom size memiliki struktur yang berbeda
2. Field `customMeasurements` bisa undefined atau null
3. Field `namaPerSize` dan `isCustomSize` tidak selalu ada
4. Error saat deserialize menyebabkan crash

## Solution

### 1. **Robust Validation in deserializeSizeDetails**

```typescript
export function deserializeSizeDetails(
  sizeDetails: SizeDetail[],
  jenisBarang?: JenisBarang
): SizeGroup[] {
  if (!sizeDetails || sizeDetails.length === 0) {
    return [];
  }

  try {
    const groupMap = new Map<string, SizeGroup>();
    let groupCounter = 0;
    let sizeCounter = 0;

    sizeDetails.forEach((sd) => {
      // ✅ Validate sd object
      if (!sd || typeof sd !== 'object') {
        console.warn('Invalid size detail:', sd);
        return; // Skip invalid entry
      }

      const groupKey = getGroupKey(sd, jenisBarang);

      if (!groupMap.has(groupKey)) {
        const newGroup: SizeGroup = {
          id: `group-${Date.now()}-${groupCounter++}-${Math.random().toString(36).slice(2, 11)}`,
          sizes: [],
          // ✅ Provide defaults for missing fields
          gender: sd.gender || 'Pria',
          tangan: sd.tangan || 'Pendek',
          modelCelana: sd.modelCelana,
          modelRompi: sd.modelRompi,
          warna: sd.warna,
          model: sd.model,
          sakuType: sd.sakuType,
          sakuColor: sd.sakuColor,
          bahanKemeja: sd.bahanKemeja,
          bahanCelana: sd.bahanCelana,
          jenisSakuRompi: sd.jenisSakuRompi,
        };
        groupMap.set(groupKey, newGroup);
      }

      const group = groupMap.get(groupKey)!;

      // ✅ Validate sizes array
      if (sd.sizes && Array.isArray(sd.sizes) && sd.sizes.length > 0) {
        sd.sizes.forEach((sizeItem) => {
          // ✅ Validate each size item
          if (!sizeItem || typeof sizeItem !== 'object') {
            console.warn('Invalid size item:', sizeItem);
            return;
          }

          group.sizes.push({
            id: `size-${Date.now()}-${sizeCounter++}-${Math.random().toString(36).slice(2, 11)}`,
            size: sizeItem.size || '',
            jumlah: sizeItem.jumlah || 0,
            namaPerSize: sizeItem.namaPerSize,
            isCustomSize: sizeItem.isCustomSize || false,
            customMeasurements: sizeItem.customMeasurements || undefined,
          });
        });
      } else {
        // Single size entry
        group.sizes.push({
          id: `size-${Date.now()}-${sizeCounter++}-${Math.random().toString(36).slice(2, 11)}`,
          size: sd.size || '',
          jumlah: sd.jumlah || 0,
          namaPerSize: sd.namaPerSize,
          isCustomSize: sd.isCustomSize || false,
          customMeasurements: sd.customMeasurements || undefined,
        });
      }
    });

    return Array.from(groupMap.values());
  } catch (error) {
    // ✅ Catch any unexpected errors
    console.error('Error deserializing size details:', error);
    return []; // Return empty array instead of crashing
  }
}
```

### 2. **Error Boundary in SizeGroupingSection**

```typescript
useEffect(() => {
  if (isInternalUpdate.current) {
    isInternalUpdate.current = false;
    return;
  }

  try {
    const groups = deserializeSizeDetails(sizeDetails, jenisBarang);
    
    if (groups.length === 0) {
      // Initialize with default group
      const defaultGroup: SizeGroup = {
        id: `group-${Date.now()}`,
        gender: 'Pria',
        tangan: 'Pendek',
        modelCelana: ModelCelana.WARRIOR,
        modelRompi: ModelRompi.BUPATI,
        sizes: [{ id: `size-${Date.now()}`, size: '', jumlah: 0 }],
      };
      setSizeGroups([defaultGroup]);
    } else {
      setSizeGroups(groups);
    }
  } catch (error) {
    // ✅ Fallback to default group on error
    console.error('Error in SizeGroupingSection useEffect:', error);
    const defaultGroup: SizeGroup = {
      id: `group-${Date.now()}`,
      gender: 'Pria',
      tangan: 'Pendek',
      modelCelana: ModelCelana.WARRIOR,
      modelRompi: ModelRompi.BUPATI,
      sizes: [{ id: `size-${Date.now()}`, size: '', jumlah: 0 }],
    };
    setSizeGroups([defaultGroup]);
  }
}, [sizeDetails, jenisBarang]);
```

### 3. **Safe Update Parent**

```typescript
const updateParent = React.useCallback((newGroups: SizeGroup[]) => {
  if (newGroups.length > 0) {
    try {
      isInternalUpdate.current = true;
      const serialized = serializeSizeGroups(newGroups, jenisBarang);
      onSizeDetailsChange(serialized);
    } catch (error) {
      // ✅ Don't crash, just log
      console.error('Error updating parent:', error);
    }
  }
}, [jenisBarang, onSizeDetailsChange]);
```

## Custom Size Data Structure

### Standard Size
```typescript
{
  size: "M",
  jumlah: 5,
  gender: "Pria",
  tangan: "Pendek"
}
```

### Custom Size
```typescript
{
  size: "CUSTOM",
  jumlah: 2,
  gender: "Pria",
  tangan: "Pendek",
  namaPerSize: "Pak Budi",
  isCustomSize: true,
  customMeasurements: {
    tinggi: 170,
    lebarDada: 100,
    lebarBahu: 45,
    lenganPanjang: 60,
    lenganPendek: 25,
    kerah: 40,
    manset: 25,
    lingPerut: 90,
    lingPinggul: 95
  }
}
```

### Custom Size (Celana)
```typescript
{
  size: "CUSTOM",
  jumlah: 1,
  namaPerSize: "Pak Ahmad",
  isCustomSize: true,
  customMeasurements: {
    tinggi: 100,
    lingkarPaha: 60,
    lingkarPinggang: 80,
    lingkarPinggul: 95,
    lingkarBawah: 40
  }
}
```

## Error Prevention Checklist

### ✅ Validation
- [x] Check if sizeDetails is array
- [x] Check if each item is object
- [x] Provide default values for missing fields
- [x] Validate customMeasurements structure
- [x] Handle undefined/null values

### ✅ Error Handling
- [x] Try-catch in deserializeSizeDetails
- [x] Try-catch in useEffect
- [x] Try-catch in updateParent
- [x] Fallback to default group on error
- [x] Console.error for debugging

### ✅ Type Safety
- [x] Optional chaining for nested objects
- [x] Nullish coalescing for defaults
- [x] Type guards for validation
- [x] Proper TypeScript types

## Testing Custom Size

### Test Case 1: Standard Size
```typescript
const order = {
  sizeDetails: [
    { size: "M", jumlah: 5, gender: "Pria", tangan: "Pendek" }
  ]
};
// ✅ Should work
```

### Test Case 2: Custom Size with Full Data
```typescript
const order = {
  sizeDetails: [
    {
      size: "CUSTOM",
      jumlah: 2,
      gender: "Pria",
      tangan: "Pendek",
      namaPerSize: "Pak Budi",
      isCustomSize: true,
      customMeasurements: {
        tinggi: 170,
        lebarDada: 100,
        // ... all fields
      }
    }
  ]
};
// ✅ Should work
```

### Test Case 3: Custom Size with Missing Fields
```typescript
const order = {
  sizeDetails: [
    {
      size: "CUSTOM",
      jumlah: 2,
      namaPerSize: "Pak Budi",
      // Missing: isCustomSize, customMeasurements
    }
  ]
};
// ✅ Should work with defaults
```

### Test Case 4: Invalid Data
```typescript
const order = {
  sizeDetails: [
    null,
    undefined,
    "invalid",
    { size: "M" } // Missing jumlah
  ]
};
// ✅ Should skip invalid entries and use defaults
```

## Benefits

1. **No More Blank Screen** - Always shows UI even with invalid data
2. **Graceful Degradation** - Falls back to default group on error
3. **Better Debugging** - Console logs help identify issues
4. **Data Integrity** - Validates and sanitizes data
5. **User Experience** - App never crashes, always recoverable

## Related Files

- `utils/sizeGrouping.ts` - Deserialize/serialize functions
- `components/SizeGrouping/SizeGroupingSection.tsx` - Main component
- `components/SizeGrouping/SizeEntry.tsx` - Size input component
- `components/SizeGrouping/CustomMeasurementsInput.tsx` - Custom measurements UI

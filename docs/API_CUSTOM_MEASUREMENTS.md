# API Reference: Custom Measurements

## Overview

Dokumentasi lengkap untuk Custom Measurements API di BradwearFlow.

---

## Data Types

### CustomMeasurements Interface

```typescript
interface CustomMeasurements {
  // Common fields
  tinggi?: number;
  
  // Kemeja specific
  lebarDada?: number;
  lebarBahu?: number;
  lenganPanjang?: number;
  lenganPendek?: number;
  kerah?: number;
  manset?: number;
  lingPerut?: number;
  lingPinggul?: number;
  
  // Celana specific
  lingkarPinggang?: number;
  lingkarPinggul?: number;
  lingkarPaha?: number;
  lingkarBawah?: number;
  
  // Alias fields (for compatibility)
 
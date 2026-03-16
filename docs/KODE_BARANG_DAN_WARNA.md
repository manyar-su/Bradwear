# Aturan Kode Barang dan Kode Warna

## Overview
Dokumen ini menjelaskan aturan untuk membedakan kode barang dan kode warna dalam sistem.

## Aturan Kode Barang

### Kode Barang Valid
Kode barang hanya terdiri dari:
1. **4 angka murni** tanpa kombinasi huruf
   - Contoh: `1234`, `5678`, `9999`
2. **"TDP"** (khusus)

### Lokasi Kode Barang
- Kode barang hanya berada di **kanan atas** form lembar kerja
- Tidak ada kode barang di tempat lain

### Contoh Kode Barang Valid
```
✅ 1234
✅ 5678
✅ TDP
```

### Contoh BUKAN Kode Barang
```
❌ B011 (ada huruf)
❌ B0299 (ada huruf)
❌ 12345 (lebih dari 4 angka)
❌ 123 (kurang dari 4 angka)
```

## Aturan Kode Warna

### Kode Warna
Jika ada kode dengan format **huruf + angka** (contoh: B011, B0299), maka itu adalah **kode warna**, BUKAN kode barang.

### Format Penyimpanan Warna
Kode warna harus **digabungkan** dengan nama warna:
```
Format: [NAMA_WARNA] [KODE_WARNA]
```

### Contoh Kode Warna
```
Input: "HITAM" + kode "B011"
Output: "HITAM B011"

Input: "TROPICAL NAVY" + kode "B011"
Output: "TROPICAL NAVY B011"

Input: "TROPICAL HITAM" + kode "B0299"
Output: "TROPICAL HITAM B0299"

Input: "VENTURA" + kode "V123"
Output: "VENTURA V123"
```

## Parsing Logic

### Identifikasi Kode Barang
```typescript
function isValidKodeBarang(code: string): boolean {
  // Hanya 4 angka murni atau "TDP"
  if (code === 'TDP') return true;
  if (/^\d{4}$/.test(code)) return true;
  return false;
}
```

### Identifikasi Kode Warna
```typescript
function isKodeWarna(code: string): boolean {
  // Format: huruf + angka (contoh: B011, B0299, V123)
  return /^[A-Z]+\d+$/i.test(code);
}
```

### Parsing Warna dengan Kode
```typescript
function parseWarnaWithCode(text: string): string {
  // Contoh input: "TROPICAL NAVY Kode B011"
  // Output: "TROPICAL NAVY B011"
  
  // Cari pattern "Kode [KODE]" atau "[KODE]" di akhir
  const match = text.match(/(.+?)\s*(?:Kode\s+)?([A-Z]+\d+)$/i);
  
  if (match) {
    const namaWarna = match[1].trim();
    const kodeWarna = match[2].trim();
    return `${namaWarna} ${kodeWarna}`;
  }
  
  return text;
}
```

## Contoh Kasus Nyata

### Kasus 1: Form Lembar Kerja
```
Kanan Atas: 1234 (ini kode barang)
Deskripsi: "Kemeja TROPICAL NAVY kode B011"

Parsing:
- Kode Barang: 1234
- Warna: "TROPICAL NAVY B011"
```

### Kasus 2: Form dengan TDP
```
Kanan Atas: TDP (ini kode barang)
Deskripsi: "Kemeja HITAM B0299"

Parsing:
- Kode Barang: TDP
- Warna: "HITAM B0299"
```

### Kasus 3: Salah Identifikasi
```
❌ SALAH:
Kanan Atas: B011
Anggapan: B011 adalah kode barang

✅ BENAR:
Kanan Atas: (kosong atau tidak valid)
B011 adalah kode warna, bukan kode barang
```

## Implementasi di Sistem

### 1. Validasi Input Kode Barang
Saat user input kode barang, validasi:
- Hanya terima 4 angka murni atau "TDP"
- Reject jika ada huruf (kecuali TDP)
- Reject jika panjang tidak 4 digit

### 2. Parsing Warna dari Deskripsi
Saat parsing deskripsi order:
- Cari pattern kode warna (huruf + angka)
- Gabungkan dengan nama warna
- Simpan sebagai satu field warna

### 3. Display di Keterangan Per Item
Format keterangan per item:
```
[JENIS] [WARNA] [TANGAN] [GENDER]

Contoh:
- "KEMEJA TROPICAL NAVY B011 PANJANG LAKI-LAKI"
- "KEMEJA HITAM B0299 PENDEK PEREMPUAN"
- "CELANA WARRIOR"
```

## Testing

### Test Cases untuk Kode Barang
```typescript
// Valid
isValidKodeBarang('1234') // true
isValidKodeBarang('TDP')  // true

// Invalid
isValidKodeBarang('B011')   // false (ada huruf)
isValidKodeBarang('12345')  // false (5 digit)
isValidKodeBarang('123')    // false (3 digit)
```

### Test Cases untuk Kode Warna
```typescript
// Valid kode warna
isKodeWarna('B011')   // true
isKodeWarna('B0299')  // true
isKodeWarna('V123')   // true

// Bukan kode warna
isKodeWarna('1234')   // false (hanya angka)
isKodeWarna('TDP')    // false (hanya huruf)
```

### Test Cases untuk Parsing Warna
```typescript
parseWarnaWithCode('TROPICAL NAVY Kode B011')  // "TROPICAL NAVY B011"
parseWarnaWithCode('HITAM B0299')              // "HITAM B0299"
parseWarnaWithCode('VENTURA V123')             // "VENTURA V123"
parseWarnaWithCode('PUTIH')                    // "PUTIH" (no code)
```

## Migration Notes

### Data Existing
Untuk data existing yang mungkin salah:
1. Scan semua kode barang
2. Identifikasi yang mengandung huruf (kecuali TDP)
3. Pindahkan ke field warna
4. Kosongkan field kode barang atau set ke default

### Update Display
Update semua tempat yang menampilkan keterangan item untuk menggunakan format baru dengan warna yang sudah digabung dengan kode.

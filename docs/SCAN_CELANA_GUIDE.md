# Panduan Scan Rekapan Celana

## Fitur Baru: Deteksi Otomatis Celana

Sistem sekarang dapat mendeteksi dan mengisi data celana secara otomatis dari scan rekapan.

### Contoh Format Rekapan Celana

```
1368                    ← 4 angka paling atas = KODE BARANG
/BASOAIDIL
Deskripsi Pekerjaan     28-FEB

Celana Bahan AMERICAN DRILL kode 192, Model ARMOR seperti
gambar, Pinggang Tidak Pake Karet, Pinggang Pake Kain Keras.

Ukuran CELANA:
28 = 1
```

### Logika Deteksi Cerdas

#### 1. Kode Barang (4 Angka Paling Atas)
- **Prioritas Tinggi**: AI akan mencari 4 digit angka di bagian PALING ATAS dokumen
- **Contoh**: `1368` → Otomatis terdeteksi sebagai kode barang
- **Abaikan**: Tanggal (16/2026), nomor telepon, atau angka dalam teks

#### 2. Jenis Barang (Auto-Detect)
Sistem otomatis mendeteksi jenis barang dari kata kunci:
- **"CELANA"** / "Celana" / "pants" / "trouser" → Jenis: Celana
- **"ROMPI"** / "Rompi" / "vest" → Jenis: Rompi  
- **"KEMEJA"** / "Kemeja" / "shirt" / "brad" → Jenis: Kemeja

#### 3. Data Celana Spesifik

**Model Celana:**
- Deteksi kata "WARRIOR" → Model: Warrior
- Deteksi kata "ARMOR" → Model: Armor

**Bahan Celana:**
- "AMERICAN DRILL" → Bahan: American Drill
- "JAPAN DRILL" → Bahan: Japan Drill
- "RIPSTOP" → Bahan: Ripstop
- "CANVAS" → Bahan: Canvas

**Ukuran:**
- Format: `28 = 1` berarti Size 28, Jumlah 1 pcs
- Ukuran celana menggunakan NOMOR (28, 30, 32, 34, dll)
- Bukan huruf seperti S/M/L/XL

#### 4. Field yang Tidak Muncul untuk Celana
- ❌ Tipe Lengan (karena celana tidak punya lengan)
- ❌ Model Kemeja (Brad V1/V2/V3)
- ❌ Tipe Saku Kemeja (Skotlait/Peterban/Polos)
- ❌ Warna Saku

### Form Input Celana

Ketika jenis barang terdeteksi sebagai "Celana", form akan menampilkan:

1. **Warna Kain** - Warna bahan celana
2. **Model Celana** - Dropdown: Warrior / Armor
3. **Jenis Bahan** - Dropdown: American Drill / Japan Drill / Ripstop / Canvas
4. **Ukuran (Nomor)** - Input angka: 28, 30, 32, 34, dll
5. **Kategori (Gender)** - Pria / Wanita
6. **Jumlah (PCS)** - Jumlah pesanan

### Perbedaan Form Berdasarkan Jenis Barang

| Field | Kemeja | Rompi | Celana |
|-------|--------|-------|--------|
| Warna Kain | ✅ | ✅ | ✅ |
| Model Kemeja | ✅ | ❌ | ❌ |
| Tipe Saku | ✅ | ❌ | ❌ |
| Warna Saku | ✅ | ❌ | ❌ |
| Jenis Saku Rompi | ❌ | ✅ | ❌ |
| Model Celana | ❌ | ❌ | ✅ |
| Jenis Bahan | ❌ | ❌ | ✅ |
| Ukuran | S/M/L/XL | S/M/L/XL | 28-40 (Nomor) |
| Tipe Lengan | ✅ | ❌ | ❌ |
| Gender | ✅ | ✅ | ✅ |
| Jumlah | ✅ | ✅ | ✅ |

### Tips Scan yang Baik

1. **Pastikan 4 angka kode barang terlihat jelas** di bagian atas
2. **Tulis "Celana" dengan jelas** di deskripsi pekerjaan
3. **Sebutkan model** (Warrior/Armor) dalam deskripsi
4. **Sebutkan bahan** (American Drill, dll) dalam deskripsi
5. **Format ukuran** yang jelas: `28 = 1`, `30 = 2`, dst

### Contoh Hasil Scan Otomatis

Dari gambar rekapan di atas, sistem akan mengisi:

```json
{
  "kodeBarang": "1368",
  "jenisBarang": "Celana",
  "deskripsiPekerjaan": "Celana Bahan AMERICAN DRILL kode 192, Model ARMOR...",
  "sizeDetails": [
    {
      "size": "28",
      "jumlah": 1,
      "gender": "Pria",
      "warna": "",
      "modelCelana": "Armor",
      "bahanCelana": "American Drill"
    }
  ]
}
```

### Troubleshooting

**Q: Kode barang tidak terdeteksi?**
- Pastikan 4 angka ditulis dengan jelas di bagian paling atas
- Hindari menulis angka lain di atas kode barang
- Jangan gabungkan dengan tanggal (misal: 1368/2026)

**Q: Jenis barang tidak otomatis ke Celana?**
- Pastikan kata "Celana" ada di deskripsi pekerjaan
- Atau pilih manual tombol "Celana" setelah scan

**Q: Model/Bahan tidak terdeteksi?**
- Tulis dengan jelas: "Model ARMOR" atau "Bahan AMERICAN DRILL"
- Atau isi manual setelah scan di dropdown yang tersedia

---

**Update**: Sistem ini menggunakan AI Gemini 2.0 Flash untuk OCR dengan logika deteksi cerdas khusus untuk celana.

# 🧵 Bradflow — Aplikasi Manajemen Order Jahit

<p align="center">
  <img src="android/app/src/main/res/drawable/splash.png" width="120" alt="Bradflow Logo" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-2.7.7-emerald" />
  <img src="https://img.shields.io/badge/platform-Android-green" />
  <img src="https://img.shields.io/badge/built%20with-React%20%2B%20Capacitor-blue" />
</p>

---

## 📱 Tentang Aplikasi

**Bradflow** adalah aplikasi manajemen order jahit untuk tim **Bradwear** — dirancang khusus untuk penjahit, admin CS, dan pemilik usaha konveksi. Aplikasi ini membantu mencatat, memantau, dan mengelola pesanan jahit secara efisien dari satu tempat.

---

## ✨ Fitur Utama

### 📷 Scan Nota Otomatis (AI OCR)
- Foto nota pesanan fisik langsung dari kamera atau galeri
- AI (Gemini via Sumopod API) membaca dan mengekstrak data otomatis: kode barang, ukuran, jumlah, konsumen, CS, tanggal target
- Mendukung format nota standar maupun custom ukuran tubuh

### 📋 Manajemen Order
- Tambah, edit, hapus pesanan
- Status order: **Proses → Selesai**
- Status pembayaran: **Belum Lunas → Lunas**
- Soft delete dengan tempat sampah (bisa dipulihkan)
- Prioritas & deadline tracking

### 📅 Dashboard & Kalender
- Kalender 3D dengan warna status deadline (merah/oranye/hijau)
- Reminder otomatis untuk order mendekati deadline
- Statistik: total aktif, selesai, total PCS

### 📊 History & Laporan
- Riwayat order dikelompokkan per minggu
- Filter: Semua / Deadline / Lunas / Belum Lunas
- Total PCS dan estimasi harga per minggu
- Laporan mingguan otomatis

### 💬 Kirim WhatsApp
- Format pesan rekapan otomatis ke WhatsApp
- Kelompok per model + lengan panjang/pendek
- Grand total PCS di akhir pesan

### 👥 Multi Penjahit
- Setiap penjahit login dengan nama profil
- Order hanya bisa diubah oleh pemiliknya
- Highlight nama PJ yang tidak sesuai (merah + animasi)

### 🔍 Pencarian Global
- Cari order dari semua penjahit via Supabase cloud
- Real-time sync antar perangkat

### 📈 Analitik
- Grafik pendapatan mingguan/bulanan
- Estimasi harga berdasarkan price list
- Breakdown per model dan tipe tangan

---

## 🛠️ Teknologi

| Layer | Teknologi |
|-------|-----------|
| Frontend | React 19 + TypeScript + Vite |
| Mobile | Capacitor 7 (Android) |
| UI | Tailwind CSS |
| Database | Supabase (PostgreSQL) |
| AI/OCR | Gemini 2.0 Flash via Sumopod API |
| Charts | Recharts |
| Icons | Lucide React |

---

## 🚀 Setup Development

### Prerequisites
- Node.js 18+
- Android Studio (untuk build APK)
- Java 21

### Install
```bash
npm install
```

### Konfigurasi Environment
Buat file `.env` di root project:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_OPENROUTER_KEY=your_sumopod_api_key
VITE_GOOGLE_API_KEY=your_google_api_key
```

### Run Dev Server
```bash
npm run dev
```

### Build Web
```bash
npm run build
```

### Sync & Build Android
```bash
npx cap sync android
cd android
./gradlew assembleRelease bundleRelease
```

---

## 📦 Release

| File | Keterangan |
|------|-----------|
| `android/apk/release/bradflow-vX.X.X-release.apk` | Install langsung di Android |
| `android/aab/release/bradflow-vX.X.X-release.aab` | Upload ke Google Play Store |
| `android/aab/release/bradflow-vX.X.X-mapping.txt` | Deobfuscation file untuk Play Console |

---

## 📋 Versi Terbaru

**v2.7.7**
- Compact mobile UI untuk history order
- Toggle tombol Lunas (YA/TIDAK)
- Animasi saat order dipindah ke Selesai
- Fix scan AI menggunakan Sumopod API
- Permissions lengkap: kamera, galeri, notifikasi
- Build dengan minify + ProGuard untuk Play Store

---

## 👨‍💼 Tim

Dikembangkan untuk **Bradwear** — usaha konveksi seragam & pakaian kerja.

---

## 📄 Lisensi

Private — Hak cipta © 2024-2026 Bradwear. Semua hak dilindungi.

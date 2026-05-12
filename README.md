# Absensi Kolom 15

Website absensi ibadah Kolom 15 - setiap Selasa, 20 Januari – 24 November 2026.

## Fitur
- ✅ Absensi per minggu (Hadir / Absen)
- ✅ Database tersimpan di cloud (Vercel KV) — sync antar device
- ✅ Laporan bulanan dengan export CSV
- ✅ Rekap kehadiran total semua pertemuan
- ✅ 60 jemaat terdaftar

---

## Deploy ke Vercel (Langkah demi Langkah)

### 1. Upload ke GitHub
1. Buat repo baru di [github.com](https://github.com) (misal: `kolom15-absensi`)
2. Upload semua file ini ke repo tersebut
   - Bisa drag & drop di GitHub web, atau pakai Git

### 2. Deploy di Vercel
1. Buka [vercel.com](https://vercel.com) dan login (bisa pakai akun GitHub)
2. Klik **"Add New Project"**
3. Pilih repo `kolom15-absensi` dari GitHub
4. Vercel otomatis deteksi ini Next.js → klik **Deploy**

### 3. Aktifkan Vercel KV (Database)
Setelah deploy selesai:
1. Di dashboard Vercel, buka project kamu
2. Klik tab **"Storage"**
3. Klik **"Create Database"** → pilih **"KV"** (Redis)
4. Beri nama (misal: `kolom15-db`) → klik **Create**
5. Klik **"Connect to Project"** → pilih project kamu
6. Vercel otomatis tambahkan environment variables yang dibutuhkan
7. Klik **"Redeploy"** di tab Deployments agar pakai KV baru

### 4. Selesai! 🎉
Website siap dipakai di URL Vercel kamu (misal: `kolom15-absensi.vercel.app`)

---

## Development Lokal

```bash
npm install
npm run dev
```

Untuk dev lokal dengan KV, buat file `.env.local`:
```
KV_URL=...
KV_REST_API_URL=...
KV_REST_API_TOKEN=...
KV_REST_API_READ_ONLY_TOKEN=...
```
(Nilai-nilai ini bisa disalin dari dashboard Vercel → Storage → KV → `.env.local` tab)

---

## Struktur File
```
kolom15/
├── pages/
│   ├── _app.js          # App wrapper + Google Fonts
│   ├── index.js         # Halaman utama (absensi, laporan, rekap)
│   └── api/
│       ├── attendance.js # GET data dari KV
│       └── save.js       # POST simpan ke KV
├── styles/
│   ├── globals.css
│   └── Home.module.css
├── package.json
├── next.config.js
├── vercel.json
└── README.md
```

# SI-PPKN — Sistem Informasi PPKN MTs

Aplikasi web Sistem Informasi Pendidikan Pancasila dan Kewarganegaraan (PPKN) untuk Madrasah Tsanawiyah berbasis **React + TypeScript + Vite + Tailwind CSS**. Dirancang dengan antarmuka elegan warna biru lembut & putih yang responsif untuk HP dan laptop, siap dideploy langsung ke **Vercel**.

---

## 🚀 Fitur Utama

1. **Beranda Guru**: Sambutan hangat personal untuk Ibu Guru, agenda mengajar harian, kartu akses cepat, dan rubrik refleksi P5-PPRA.
2. **Bank Modul Ajar (13 Bab Lengkap 1 Tahun)**:
   - **Kelas 7 (5 Bab)**: Sejarah Kelahiran Pancasila, Norma & UUD 1945, Kesatuan NKRI & Deklarasi Djuanda, Keberagaman Bhinneka Tunggal Ika, Lingkungan & Gotong Royong.
   - **Kelas 8 (4 Bab)**: Kedudukan Pancasila, Sistem Presidensial & Kedaulatan, Tata Urutan Perundangan (UU No. 12/2011), Sumpah Pemuda & Demokrasi.
   - **Kelas 9 (4 Bab)**: Pancasila Era Global & AI, Pembukaan UUD 1945 & Kedaulatan, Harmoni Sosial, Bela Negara & Peran Internasional.
   - Tombol pada tiap modul: `[Lihat]`, `[Edit]`, `[Salin untuk Tahun Depan]`, `[Unduh Word/PDF]`, `[Arsip]`.
   - Tombol utama: `➕ TAMBAH MODUL AJAR BARU`.
3. **🎬 Media Audio Visual**: Tonton video YouTube dan infografis edukasi langsung di halaman tanpa keluar aplikasi, lengkap dengan mode proyeksi layar penuh untuk kelas.
4. **Bank Soal & Asesmen**: Koleksi soal pilihan ganda & HOTS, tambah soal manual, impor berkas massal, dan cetak naskah ujian Mode Siswa / Mode Guru.
5. **Daftar & Mutasi Siswa**: Manajemen rombel 7A-9B, mutasi / kenaikan kelas massal, dan ekspor CSV.
6. **Presensi Kehadiran**: 1-klik "Hadirkan Semua Siswa", pencatatan izin/sakit, dan rekap bulanan siap lapor ber-kop resmi.
7. **Nilai & Rapor**: Hitung nilai akhir dan predikat (A/B/C/D) otomatis, grafik ketuntasan (KKTP), dan cetak leger nilai.
8. **Arsip & Cadangan Data**: Cadangkan seluruh data ke JSON (`exportFullBackup`) dan pulihkan kapan saja (`restoreFullBackup`).

---

## 🛠️ Teknologi & Konfigurasi

- **Framework**: React 19 + TypeScript
- **Bundler**: Vite 8
- **Styling**: Tailwind CSS v4 (`@tailwindcss/vite`)
- **Icons**: Lucide React
- **Hosting / Deployment Target**: Vercel

---

## 🌐 Panduan Deploy ke Vercel

### Opsi 1: Deploy Otomatis via GitHub (Direkomendasikan)

1. Push repositori ini ke akun GitHub Anda.
2. Buka dashboard [Vercel](https://vercel.com) dan klik **"Add New..."** → **"Project"**.
3. Hubungkan repositori GitHub Anda dan pilih repositori `si-ppkn-mts`.
4. Vercel akan otomatis mengenali konfigurasi dari berkas `vercel.json`:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
5. Klik **"Deploy"**. Dalam ~1 menit aplikasi SI-PPKN akan aktif dan dapat diakses dengan domain `.vercel.app`.

### Opsi 2: Deploy Cepat via Vercel CLI

Buka terminal pada direktori proyek:

```bash
# 1. Pasang Vercel CLI (jika belum)
npm install -g vercel

# 2. Login ke akun Vercel
vercel login

# 3. Jalankan perintah deploy (langsung deploy ke production)
vercel --prod
```

Konfigurasi routing SPA dan caching statis telah otomatis diatur di dalam berkas `vercel.json`:
```json
{
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

---

## 💻 Menjalankan di Lokal (Pengembangan)

```bash
# Pasang dependensi
npm install

# Jalankan server pengembangan
npm run dev

# Uji build produksi
npm run build

# Pratinjau hasil build
npm run preview
```

# RT Admin - Sistem Administrasi RT

Sistem informasi berbasis web untuk mengelola administrasi RT, termasuk data warga, data rumah, iuran bulanan, dan pengeluaran.

## Fitur Unggulan
1. **Autentikasi Aman**: Login dan Logout admin RT menggunakan Laravel Sanctum.
2. **Dashboard Interaktif**: Ringkasan laporan keuangan (Total Saldo, Iuran Pending) lengkap dengan Grafik Pemasukan vs Pengeluaran Tahunan (Recharts).
3. **Detail Laporan Ter-Paginasi**: Laporan bulanan yang rapi dengan sistem navigasi halaman (Pagination) untuk performa maksimal.
4. **Manajemen Rumah & Penghuni**: Kelola unit rumah (Blok/Nomor), status hunian, riwayat warga, dan upload foto KTP.
5. **Sistem Iuran Cerdas**: Pencatatan iuran Satpam & Kebersihan, fitur *Bulk Generate* iuran 1 tahun dengan deteksi data ganda otomatis.
6. **Arus Kas Pengeluaran**: Pencatatan pengeluaran RT berdasarkan kategori (Gaji, Perbaikan, dll).
7. **UI/UX Modern (Pro Max)**: Desain minimalis terinspirasi dari Vercel, *fully responsive* untuk mobile/tablet, lengkap dengan efek *tactile feedback* pada tombol.

---

## Tech Stack
- **Backend**: Laravel 10 (REST API, Sanctum)
- **Frontend**: React 18 + Vite (Tailwind CSS, shadcn/ui, TanStack Query, Recharts)
- **Database**: MySQL 8+

---

## Persyaratan Sistem
Pastikan di komputer Anda sudah terinstal:
- PHP >= 8.1
- Composer
- Node.js >= 18
- MySQL Server

---

## Quick Start (Cara Cepat)
Jika Anda sudah familiar dengan Laravel & React, cukup jalankan perintah ini:

1. **Backend**:
   ```bash
   cd backend && composer install && cp .env.example .env && php artisan key:generate && php artisan migrate --seed && php artisan serve
   ```
2. **Frontend**:
   ```bash
   cd frontend && pnpm install && npm run dev
   ```

---

## Panduan Instalasi (Step-by-Step)

### 1. Setup Database
1. Buat database baru di MySQL dengan nama `rt_admin`:
   ```sql
   CREATE DATABASE rt_admin;
   ```
2. Anda juga dapat mengimpor file `rt_admin.sql` yang telah disediakan.

### 2. Setup Backend (Laravel)
1. Buka terminal, masuk ke folder `backend`:
   ```bash
   cd backend
   ```
2. Install dependensi PHP dengan Composer:
   ```bash
   composer install
   ```
3. Salin file environment:
   ```bash
   cp .env.example .env
   ```
4. Generate APP_KEY:
   ```bash
   php artisan key:generate
   ```
5. Sesuaikan konfigurasi database di file `.env`:
   ```env
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=rt_admin
   DB_USERNAME=root
   DB_PASSWORD=
   ```
6. Jalankan migrasi dan seeder untuk data awal (dummy data):
   ```bash
   php artisan migrate --seed
   ```
7. Buat link untuk storage (agar foto KTP bisa diakses):
   ```bash
   php artisan storage:link
   ```
8. Jalankan server backend:
   ```bash
   php artisan serve
   ```
   *Backend akan berjalan di http://localhost:8000*

> **Akun Admin Default (dari Seeder):**
> - **Email**: admin@rt.com
> - **Password**: password

### 3. Setup Frontend (React)
1. Buka terminal baru, masuk ke folder `frontend`:
   ```bash
   cd frontend
   ```
2. Install dependensi (disarankan menggunakan pnpm):
   ```bash
   pnpm install
   ```
3. Jalankan server frontend:
   ```bash
   pnpm run dev
   ```
   *Aplikasi akan berjalan di http://localhost:5173*

---

## Hasil Pengerjaan (Screenshots)
*Seluruh screenshot dapat ditemukan di folder root proyek:*
- `screenshot-dashboard.png` - Tampilan grafik dan detail laporan bulanan.
- `screenshot-residents.png` - Daftar warga dengan fitur upload KTP Base64.
- `screenshot-houses.png` - Grid unit rumah dan riwayat penghuni.
- `screenshot-payments.png` - Tabel iuran dengan sistem paginasi halaman.
- `screenshot-expenses.png` - Catatan arus kas keluar.
- `RT Admin — ERD.png` - Diagram skema database (ERD).

---
### Catatan Teknis (Development)
- **Upload File**: Menggunakan konversi Base64 di sisi client untuk menghindari masalah *permission* folder temporary pada sistem operasi Windows.
- **Database**: Menggunakan SQLite untuk pengembangan lokal, namun disertakan `rt_admin.sql` untuk instalasi pada basis MySQL sesuai PRD.

---
*Proyek ini dikembangkan sebagai bagian dari Skill Fit Test untuk Beon Intermedia.*

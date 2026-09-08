# ⚡ Panduan Setup Supabase Cloud untuk Cliniva (Langkah-demi-Langkah)

Panduan ini memandu Anda menghubungkan aplikasi **Cliniva** ke database cloud **Supabase** secara 100% gratis dalam waktu kurang dari 5 menit.

---

## 1. Buat Project Baru di Supabase (Gratis)
1. Buka situs [https://supabase.com](https://supabase.com) dan login/daftar akun.
2. Di dashboard, klik tombol **"New Project"**.
3. Isi informasi project:
   - **Name**: `Cliniva Clinic System`
   - **Database Password**: Buat password yang aman (dan simpan untuk keperluan Anda).
   - **Region**: Pilih lokasi terdekat (misalnya: `Singapore (ap-southeast-1)` untuk respon tercepat di Asia Tenggara).
   - **Pricing Plan**: Pilih **Free Plan** ($0 / month).
4. Klik **"Create new project"** dan tunggu sekitar 1-2 menit hingga provisioning selesai.

---

## 2. Eksekusi Skema SQL (DDL + Seed Data)
1. Setelah project siap, buka menu **SQL Editor** di sidebar kiri (ikon `>_` atau baris kode).
2. Klik tombol **"New query"**.
3. Buka file [`Desain/sql/schema.sql`](sql/schema.sql), lalu salin (*copy*) seluruh isinya.
4. Tempelkan (*paste*) ke dalam SQL Editor di dashboard Supabase.
5. Klik tombol **"Run"** (atau tekan `Ctrl + Enter`).
6. Tunggu hingga muncul pesan **"Success. No rows returned"**.
   *Tabel `branches`, `profiles`, `services`, `practitioners`, `bookings`, `queue_tickets`, `treatment_notes`, dan `audit_logs` kini telah terbentuk lengkap beserta data awal (seed data) dan konfigurasi Realtime WebSocket.*

---

## 3. Ambil Kredensial API Project Anda
1. Di sidebar kiri dashboard Supabase, klik ikon **Project Settings** (ikon roda gigi di pojok kiri bawah).
2. Pilih submenu **"Data API"** (atau **"API"**).
3. Cari dua nilai berikut:
   - **Project URL**: contoh `https://xyzcompany.supabase.co`
   - **Project API Keys** -> Ambil key berlabel **`anon` `public`** (contoh: `eyJhbGciOi...`).

---

## 4. Hubungkan ke Cliniva

Ada **2 cara mudah** untuk memasukkan kredensial ini ke dalam Cliniva:

### Cara A (Paling Cepat — Langsung dari Browser):
1. Buka aplikasi Cliniva di browser Anda (misalnya halaman [`pages/public/sign-in.html`](pages/public/sign-in.html) atau halaman manapun).
2. Buka DevTools Console (`F12` ➔ tab **Console**), lalu ketikkan perintah berikut:
   ```javascript
   localStorage.setItem('cliniva_supabase_url', 'PASTE_PROJECT_URL_ANDA_DISINI');
   localStorage.setItem('cliniva_supabase_key', 'PASTE_ANON_KEY_ANDA_DISINI');
   location.reload();
   ```
   Cliniva akan langsung mendeteksi Supabase dan mengaktifkan **Cloud Mode**.

### Cara B (Permanen di Kode Proyek):
1. Buka file [`Desain/js/config/supabase.js`](js/config/supabase.js).
2. Masukkan URL dan Key Anda pada konstanta:
   ```javascript
   export const SUPABASE_CONFIG = {
     url: "https://your-project-id.supabase.co",      // Ganti dengan URL Supabase Anda
     anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." // Ganti dengan Anon Key Anda
   };
   ```
3. Simpan file. Selesai!

---

## 5. Uji Coba Sinkronisasi Real-Time
1. Buka dua tab browser berdampingan:
   - **Tab 1**: Halaman Dokter [`pages/practitioner/index.html`](pages/practitioner/index.html)
   - **Tab 2**: Halaman Meja Depan [`pages/branch-admin/index.html`](pages/branch-admin/index.html)
2. Di **Tab 1 (Dokter)**, klik tombol **"🔊 Panggil Antrean Berikutnya"**.
3. Perhatikan di **Tab 2 (Meja Depan)**: Status antrean akan langsung berubah dan bersinkronisasi secara otomatis melalui Supabase Realtime WebSocket tanpa me-refresh halaman!

---

## 💡 Apa yang terjadi jika Kredensial Belum Diisi?
Cliniva menerapkan **Graceful Fallback (Dual-Mode)**:
Jika URL dan Key Supabase belum diisi, aplikasi akan tetap berjalan mulus menggunakan `localStorage` lokal tanpa memunculkan error, sehingga aman untuk demo kapan pun dan di mana pun.

# PhysioCare Login Credentials

Dokumen ini berisi informasi kredensial bawaan (*default credentials*) yang digunakan untuk masuk (login) ke dalam sistem prototipe PhysioCare saat masa pengembangan (Development). 

Tim developer dapat menggunakan akun-akun di bawah ini untuk menguji berbagai peran dan fitur di dalam aplikasi. Data ini diambil dari *mock data* yang terdapat pada file `data/users.json`.

---

## 1. Akun Pasien (User)
Gunakan akun ini untuk masuk ke dasbor pasien, menguji alur booking, dan melihat riwayat medis pasien.

* **Email:** `james@example.com`
* **Password:** `password123`

*(Setelah berhasil login, Anda akan diarahkan ke rute `#/patient/dashboard`)*

---

## 2. Akun Administrator (Admin / Staff)
Gunakan akun ini untuk masuk ke portal admin, menguji fitur manajemen jadwal terapis, manajemen persetujuan _refund/reschedule_ darurat, dan ringkasan klinik.

* **Email:** `admin@physiocare.com`
* **Password:** `admin123`

*(Setelah berhasil login, Anda akan diarahkan ke rute `#/admin/dashboard`)*

---

**Catatan Tambahan untuk Developer:**
- Jika Anda ingin mereset state login atau logout, Anda dapat mengklik tombol "Logout" di Navbar Dashboard atau menghapus key `physiocare_current_user` dari *LocalStorage* browser Anda.
- Untuk menguji register pengguna baru, Anda juga bisa melakukan registrasi melalui halaman Sign Up, data tersebut akan tersimpan sementara di memori selama sesi aktif.

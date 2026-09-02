# 🏥 Desain Prototipe Antarmuka Web - Sistem Reservasi & CRM Klinik Terpadu

Dokumen ini berisi panduan penggunaan prototipe antarmuka aplikasi **Sistem Manajemen Reservasi & CRM Klinik Terpadu** (*Integrated Clinical Appointment & Patient Relationship Management System*).

Prototipe ini dirancang menggunakan **HTML5 semantik, CSS3 modern (*Design System* bertema klinik medis), dan JavaScript interaktif** tanpa dependensi build kompleks, sehingga dapat langsung dijalankan dan diuji di browser apapun.

---

## 📂 Struktur Berkas di Direktori `Desain/`

| Nama Berkas | Deskripsi & Fungsi |
|---|---|
| [`index.html`](file:///C:/Users/hawki/Downloads/Dokumen%20Pengembangan/Booking%20System/Desain/index.html) | **Portal Pemesanan Mandiri Pasien (*Patient Self-Booking PWA*)** — Alur wizard 5 langkah pemesanan, pemilihan cabang, katalog layanan, *Triple-Constraint Engine*, formulir intake dinamis, upload rujukan, pembayaran deposit/QRIS, dan simulasi tiket digital + chat WhatsApp. |
| [`admin.html`](file:///C:/Users/hawki/Downloads/Dokumen%20Pengembangan/Booking%20System/Desain/admin.html) | **Panel Operasional Klinik (*Clinic Operations Dashboard*)** — Khusus staf resepsionis, dokter, dan manajer cabang: *Master Calendar Timeline*, *Live Queue Antrean Digital* (dengan audio chime), *SIMRS Referral Bridging Hub* (ephemeral proxy), log WhatsApp & Email, serta Kasir POS. |
| [`ticket.html`](file:///C:/Users/hawki/Downloads/Dokumen%20Pengembangan/Booking%20System/Desain/ticket.html) | **Viewer E-Tiket Digital Mandiri** — Layar tiket digital dengan QR Code SVG interaktif, unduh kalender `.ics`, dan aksi ubah jadwal (*reschedule*). |
| [`style.css`](file:///C:/Users/hawki/Downloads/Dokumen%20Pengembangan/Booking%20System/Desain/style.css) | **Sistem Desain CSS Modern** — Variabel warna *Medical Teal & Cyan Palette*, tipografi *Plus Jakarta Sans* & *Outfit*, *glassmorphism*, status badge, responsivitas mobile & desktop, dan animasi mikro. |
| [`app.js`](file:///C:/Users/hawki/Downloads/Dokumen%20Pengembangan/Booking%20System/Desain/app.js) | **Logika & State Engine Interaktif** — *State management*, simulasi database lokal (*LocalStorage*), kalkulator slot *Triple-Constraint*, *slot hold timer* 10 menit, generator QR Code, audio synthesizer chime, dan webhook inspector. |

---

## 🚀 Fitur-Fitur Unggulan Prototipe

### 1. Mesin Penjadwalan Anti-Bentrok (*Triple-Constraint Scheduling Engine*)
- Memvalidasi ketersediaan simultan dari 3 sumber daya: **Praktisi/Dokter + Ruangan/Bed + Peralatan Medis**.
- Dilengkapi jeda otomatis antar-sesi (*buffer time* 10-20 menit) untuk sterilisasi dan persiapan ruangan.
- Fitur **Temporary Hold (10 Menit)** dengan *countdown timer* saat pasien memilih slot.

### 2. Strategi Notifikasi Anti No-Show (WhatsApp Utama + Email Fallback)
- **WhatsApp Gateway Simulator**: Menampilkan simulasi gelembung chat WhatsApp resmi berformat interaktif dengan tombol konfirmasi, reschedule, dan tautan rute klinik.
- **Pengingat Bertahap**: Jadwal pengingat otomatis H-24 jam dan H-3 jam untuk memangkas angka *no-show* hingga 42%.
- **Email Fallback Engine**: Format tiket formal dengan tombol unduh file `.ics` yang langsung tersinkronisasi ke Google Calendar atau Apple Calendar.

### 3. Alur Pasien Rujukan & Bridging API (*Non-EMR Ephemeral Proxy*)
- Pasien umum, asuransi, maupun rujukan BPJS/Faskes dapat mengunggah foto surat rujukan.
- **Batasan Tegas Privasi Data**: Sistem booking **tidak menyimpan Rekam Medis**. Berkas rujukan berstatus *ephemeral proxy* (otomatis terhapus dalam 72 jam setelah berhasil di-bridge ke SIMRS klinik mitra).
- Dilengkapi penampil payload JSON Webhook di dashboard admin untuk inspeksi integrasi API.

### 4. Formulir Keluhan Dinamis (*Dynamic Intake Form*)
- Beradaptasi secara otomatis berdasarkan profil layanan:
  - **Spa & Wellness**: Preferensi tekanan pijat, pilihan aromaterapi herbal.
  - **TCM & Fisioterapi**: *Interactive Body Pain Map* (klik titik keluhan kepala, leher, punggung, lutut, dll).
  - **Klinik Medis**: Pilihan asuransi/BPJS, riwayat alergi, dan upload rujukan faskes.
- **Consent Box Aktif**: Kepatuhan terhadap UU PDP No. 27/2022 dan Singapore PDPA.

### 5. Panel Operasional Staf Klinik
- **Master Calendar View**: Jadwal visual timeline per praktisi vs jam praktik harian.
- **Quick Walk-in Dispatcher**: Form input cepat bagi resepsionis untuk melayani pasien datang langsung dalam &lt;30 detik.
- **Papan Antrean Digital (*Live Queue*)**: Monitor antrean ruang tunggu dengan tombol panggil bersuara nada dering (*Web Audio API Chime Synthesizer*).
- **Kasir POS Ringkas**: Pelunasan sisa tagihan, pengurangan deposit, dan cetak struk.

---

## 💻 Cara Menjalankan

1. Buka folder `Desain` di File Explorer Anda:
   `C:\Users\hawki\Downloads\Dokumen Pengembangan\Booking System\Desain`
2. Klik ganda pada berkas **`index.html`** untuk membuka Portal Pasien di peramban web (Google Chrome, Microsoft Edge, Mozilla Firefox, atau Safari).
3. Untuk melihat tampilan staf klinik, klik tombol **"🏥 Panel Operasional"** di pojok kanan atas atau buka langsung berkas **`admin.html`**.
4. Untuk melihat E-Tiket mandiri, buka berkas **`ticket.html`**.

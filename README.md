# 🏥 Cliniva — Integrated Clinic Booking & CRM Platform

Dokumen ini berisi panduan arsitektur dan struktur kode dari aplikasi **Cliniva** (*Integrated Clinical Appointment & Patient Relationship Management System*), dirancang dengan prinsip **SOLID** dan modularitas penuh untuk kemudahan perawatan, pengujian, dan deployment (misalnya di Vercel).

---

## 🏛️ Arsitektur SOLID & Pemisahan Berkas

Aplikasi telah dipisahkan dari bentuk monolitik 1 file menjadi struktur modular berbasis standar web (HTML5 Semantik, CSS3 Design Tokens, ES Modules):

```
Desain/
├── index.html                      # Portal Pasien & Product Showcase
├── sign-in.html                    # Halaman Autentikasi Staf & Pasien OTP
├── admin.html                      # Panel Operasional Staf & Live Queue
├── ticket.html                     # E-Tiket Digital & QR Check-in Viewer
├── README.md                       # Dokumentasi arsitektur sistem
│
├── css/
│   ├── style.css                   # Master stylesheet (mengimpor semua modul)
│   ├── variables.css               # Design Tokens: warna Medical Teal, gradien, shadow, radius
│   ├── base.css                    # CSS Reset, elemen dasar, tombol, pill, feedback box
│   ├── layout.css                  # Navbar glassmorphism, drawer mobile, header & footer
│   └── components/
│       ├── hero.css                # Visual hero, phone mockup, live operations card
│       ├── features.css            # Grid fitur, diagram alur rujukan ephemeral
│       ├── showcase.css            # Tab shell, workspace operasional, master calendar, feed
│       ├── booking.css             # Form booking mandiri, kartu layanan, slot grid, ringkasan
│       ├── notifications.css       # Engine notifikasi, mockup chat WhatsApp, reminder queue
│       ├── markets.css             # Kartu pasar SG & MY, tagar, call-to-action
│       ├── auth.css                # Form login staf/pasien, OTP grid 6-box, visual panel
│       ├── admin.css               # Live queue card, tabel SIMRS bridging, kasir POS
│       └── ticket.css              # Kartu digital ticket, perforated divider, QR canvas
│
└── js/
    ├── config/
    │   ├── clinic-data.js          # Master data: Cabang SG/MY, praktisi, layanan, slot default
    │   └── regional-config.js      # Konfigurasi regional: Mata uang, template WA, consent PDPA
    ├── services/
    │   ├── storage.service.js      # StorageService: LocalStorage abstraction + in-memory fallback
    │   ├── booking.service.js      # BookingService: Triple-Constraint engine & 10-min slot hold timer
    │   ├── auth.service.js         # AuthService: Login staf RBAC, generator & verifikasi OTP
    │   ├── notification.service.js # NotificationService: Multi-stage WhatsApp & .ics generator
    │   └── sound.service.js        # SoundService: Web Audio API chime synthesizer antrean
    ├── controllers/
    │   ├── ui.controller.js        # UIController: Navbar scroll, mobile drawer, toast feedback
    │   ├── booking.controller.js   # BookingController: Sinkronisasi form booking & checkout
    │   ├── dashboard.controller.js # DashboardController: Filter cabang & live calendar
    │   ├── auth.controller.js      # AuthController: Validasi login, auto-advance 6-box OTP
    │   └── admin.controller.js     # AdminController: Pemanggil antrean bersuara & kasir POS
    ├── pages/
    │   ├── main.js                 # Entry point untuk index.html
    │   ├── auth.js                 # Entry point untuk sign-in.html
    │   ├── admin.js                # Entry point untuk admin.html
    │   └── ticket.js               # Entry point untuk ticket.html
    └── app.js                      # Universal re-export bridge
```

---

## ⚡ Prinsip SOLID yang Diterapkan

1. **Single Responsibility Principle (SRP)**:
   - Setiap berkas CSS hanya bertanggung jawab atas 1 komponen UI atau token desain.
   - Setiap service JavaScript hanya mengelola 1 domain bisnis (misalnya `BookingService` murni untuk kalkulasi & slot holding, `AuthService` untuk otentikasi).
   - Setiap controller hanya menangani binding event DOM spesifik halaman tersebut.
2. **Open/Closed Principle (OCP)**:
   - Menambah cabang baru, dokter/praktisi baru, atau metode pembayaran baru cukup dilakukan di `js/config/clinic-data.js` tanpa menyentuh logika booking engine.
3. **Liskov Substitution & Interface Segregation (LSP / ISP)**:
   - Service memiliki antarmuka yang ramping dan independen, tidak membebani pemanggil dengan dependensi yang tidak diperlukan.
4. **Dependency Inversion Principle (DIP)**:
   - Controller berinteraksi dengan service melalui instance API yang jelas daripada melakukan manipulasi DOM spaghetti acak.

---

## 🚀 Cara Menjalankan

1. Buka folder `Desain/` di browser langsung atau jalankan static server lokal:
   ```bash
   npx serve .
   ```
2. Atau akses prototipe yang dideploy di Vercel:
   - **Live Production URL**: `https://prototype-crm-booking-system.vercel.app/`
3. Halaman yang tersedia:
   - [`index.html`](index.html) — Portal Pasien & Product Showcase
   - [`sign-in.html`](sign-in.html) — Autentikasi Staf & Pasien OTP
   - [`admin.html`](admin.html) — Panel Operasional & Papan Antrean Digital
   - [`ticket.html`](ticket.html) — Viewer E-Tiket Digital & Kalender `.ics`

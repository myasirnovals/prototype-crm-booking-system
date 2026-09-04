# 🏥 Cliniva — Integrated Clinic Booking & CRM Platform V1.1.2

Dokumen ini berisi panduan arsitektur dan struktur kode dari aplikasi **Cliniva** (*Integrated Clinical Appointment & Patient Relationship Management System*), dirancang dengan prinsip **SOLID** dan modularitas penuh untuk kemudahan perawatan (*maintenance*), pengujian, dan deployment.

---

## 🏛️ Arsitektur SOLID & Pengelompokan Berkas

Struktur berkas telah dikelompokkan secara terstruktur (*Single Responsibility Principle* per berkas):

```
Desain/
├── 📄 Halaman HTML (Entry Points per Role)
│   ├── index.html                      # Portal Pasien Publik & Product Showcase
│   ├── sign-in.html                    # Autentikasi Multi-Role & 1-Click Quick Demo Login
│   ├── owner.html                      # [NEW] Panel Eksekutif Owner: Analitik Omset & Konfigurasi Klinik
│   ├── practitioner.html               # [NEW] Workspace Dokter: Timeline Konsultasi & Body Pain Map
│   ├── receptionist.html               # [NEW] Panel Operasional Resepsionis: Live Queue, Kasir POS & Walk-In
│   ├── patient-portal.html             # [NEW] Portal Pasien Mandiri: E-Tiket Digital & Live Antrean Tracker
│   ├── ticket.html                     # Viewer E-Tiket Digital & Kalender .ics
│   ├── demo.html                       # Sandbox Demo Interaktif
│   ├── onboarding.html                 # Registrasi Klinik Baru & Akun Super Admin Owner
│   └── README.md                       # Dokumentasi arsitektur sistem
│
├── 🎨 css/
│   ├── style.css                       # Master stylesheet (mengimpor semua modul)
│   ├── variables.css                   # Design Tokens: warna Medical Teal, gradien, shadow, radius
│   ├── base.css                        # CSS Reset, elemen dasar, tombol, pill, feedback box
│   ├── layout.css                      # Navbar glassmorphism, drawer mobile, header & footer
│   └── components/
│       ├── auth.css                    # Form login staf/pasien, OTP grid 6-box & kartu 1-Click Quick Demo Login
│       ├── owner.css                   # [NEW] Style panel owner, analitik omset & live logo uploader
│       ├── practitioner.css            # [NEW] Style workspace dokter, visualizer Body Pain Map, audio chime
│       ├── patient-portal.css          # [NEW] Style portal pasien, live queue tracker & riwayat booking
│       ├── receptionist.css            # [NEW] Live queue card, tabel SIMRS bridging, kasir POS
│       ├── ticket.css                  # Kartu digital ticket, perforated divider, QR canvas
│       ├── hero.css                    # Visual hero, phone mockup, live operations card
│       ├── onboarding.css              # Form registrasi tenant, spesialisasi, animasi provisioning
│       ├── demo.css                    # Sandbox wizard stepper, visual body pain map, WhatsApp chat
│       ├── features.css                # Grid fitur, diagram alur rujukan ephemeral
│       ├── showcase.css                # Tab shell, workspace operasional, master calendar, feed
│       ├── booking.css                 # Form booking mandiri, kartu layanan, slot grid, ringkasan
│       ├── notifications.css           # Engine notifikasi, mockup chat WhatsApp, reminder queue
│       └── markets.css                 # Kartu pasar SG & MY, tagar, call-to-action
│
└── ⚡ js/
    ├── config/
    │   ├── role-routes.js              # [NEW] RBAC Matrix, route mapping & kredensial master per role (OCP)
    │   ├── clinic-data.js              # Master data: Cabang SG/MY, praktisi, layanan, slot default
    │   └── regional-config.js          # Konfigurasi regional: Mata uang, template WA, consent PDPA
    ├── locales/
    │   ├── en.js                       # Kamus Bahasa Inggris (Default SG / Global)
    │   ├── ms.js                       # Kamus Bahasa Melayu / Indonesia (MY / ID)
    │   └── zh.js                       # Kamus Bahasa Mandarin (Simplified Chinese)
    ├── services/
    │   ├── auth.service.js             # AuthService: Validasi kredensial per role, session guard, proteksi rute (SRP)
    │   ├── storage.service.js          # StorageService: LocalStorage abstraction + in-memory fallback
    │   ├── i18n.service.js             # I18nService: Engine terjemahan multilingual (EN/MS/ZH)
    │   ├── booking.service.js          # BookingService: Triple-Constraint engine & 10-min slot hold timer
    │   ├── notification.service.js     # NotificationService: Multi-stage WhatsApp & .ics generator
    │   └── sound.service.js            # SoundService: Web Audio API chime synthesizer antrean
    ├── controllers/
    │   ├── auth.controller.js          # AuthController: Sign-in validation, 1-Click quick login, auto-advance OTP
    │   ├── owner.controller.js         # [NEW] OwnerController: Analitik multi-cabang, live logo uploader, profil bisnis
    │   ├── practitioner.controller.js  # [NEW] PractitionerController: Timeline dokter, calling chime, body pain map
    │   ├── patient-portal.controller.js# [NEW] PatientPortalController: Active ticket, live queue, reschedule/cancel
    │   ├── receptionist.controller.js  # [NEW] ReceptionistController: Live queue calling, kasir POS & walk-in dispatcher
    │   ├── ui.controller.js            # UIController: Navbar scroll, mobile drawer, toast feedback
    │   ├── onboarding.controller.js    # OnboardingController: Pendaftaran tenant & simulasi provisioning
    │   ├── demo.controller.js          # DemoController: Wizard 5-langkah, Pain Map, WhatsApp 2-way, ROI
    │   ├── booking.controller.js       # BookingController: Sinkronisasi form booking & checkout
    │   └── dashboard.controller.js     # DashboardController: Filter cabang & live calendar
    └── pages/
        ├── auth.js                     # Entry point untuk sign-in.html
        ├── owner.js                    # [NEW] Entry point untuk owner.html
        ├── practitioner.js             # [NEW] Entry point untuk practitioner.html
        ├── patient-portal.js           # [NEW] Entry point untuk patient-portal.html
        ├── receptionist.js             # [NEW] Entry point untuk receptionist.html
        ├── main.js                     # Entry point untuk index.html
        ├── onboarding.js               # Entry point untuk onboarding.html
        ├── demo.js                     # Entry point untuk demo.html
        ├── ticket.js                   # Entry point untuk ticket.html
        └── app.js                      # Universal re-export bridge
```

---

## 🔑 Kredensial Akun Demo per Role (1-Click Login Ready)

Pada halaman [`sign-in.html`](sign-in.html), tersedia tombol **⚡ 1-Click Quick Demo Login** untuk menguji setiap peran secara instan:

| Peran | Akun Email / Kontak | Password / OTP | Halaman Tujuan | Fitur Utama |
|---|---|---|---|---|
| 👑 **Owner / Super Admin** | `owner@cliniva.com` | `cliniva2026` | [`owner.html`](owner.html) | Analitik omset konsolidasian, ganti nama & logo resmi klinik dengan live preview (FR-CONFIG-01), profil bisnis adaptif (FR-CONFIG-03), audit log |
| 🧑‍⚕️ **Practitioner / Dokter** | `dr.lim@orchardclinic.sg` | `cliniva2026` | [`practitioner.html`](practitioner.html) | Timeline konsultasi harian dokter, visualizer interaktif Body Pain Map, pemanggil antrean audio chime ke ruang periksa, pembaruan status sesi |
| 🛎️ **Receptionist / Front Desk** | `reception@orchardclinic.sg` | `cliniva2026` | [`receptionist.html`](receptionist.html) | Papan antrean ruang tunggu (*Live Queue*), kasir POS & pelunasan tagihan sesi, bridging dokumen SIMRS, pendaftaran pasien walk-in |
| 👤 **User / Pasien** | `+65 8123 4567` / `amanda@tan.sg` | OTP `123456` / `cliniva2026` | [`patient-portal.html`](patient-portal.html) | E-Tiket Digital & barcode QR Check-in kiosk, pelacak nomor antrean live, riwayat reservasi kunjungan, reschedule/batal mandiri |

---

## ⚡ Penerapan Prinsip SOLID

1. **Single Responsibility Principle (SRP)**:
   - Setiap berkas CSS hanya mengatur 1 komponen visual (`owner.css`, `practitioner.css`, `patient-portal.css`, `receptionist.css`, `auth.css`).
   - Setiap JavaScript Service hanya melayani 1 domain fungsional (`auth.service.js` untuk otentikasi & proteksi sesi, `soundService` untuk sintesis audio chime, `storageService` untuk persistensi).
   - Setiap Controller hanya bertanggung jawab atas interaksi DOM halaman spesifik tersebut.
2. **Open/Closed Principle (OCP)**:
   - Menambahkan peran baru atau rute baru cukup didefinisikan di `role-routes.js` tanpa merombak logika inti pada service autentikasi.
3. **Liskov Substitution & Interface Segregation (LSP / ISP)**:
   - Modul antarmuka controller memiliki kontrak inisialisasi yang seragam (`.init()`) dan service independen tanpa dependensi yang saling membebani.
4. **Dependency Inversion Principle (DIP)**:
   - Controller berinteraksi dengan state dan audio melalui service terabstraksi (`authService`, `soundService`, `storageService`).

---

## 🚀 Cara Menjalankan & Menguji

Buka folder `Desain/` menggunakan browser atau static server lokal:
```bash
npx serve .
```
Lalu buka:
- [`sign-in.html`](sign-in.html) — Coba tombol **1-Click Quick Demo Login** untuk masing-masing peran!

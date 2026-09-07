# 🏥 Cliniva — Integrated Clinic Booking & CRM Platform V1.3.1 [STABLE RELEASE]

Dokumen ini berisi panduan arsitektur dan struktur kode dari aplikasi **Cliniva** (*Integrated Clinical Appointment & Patient Relationship Management System*), dirancang dengan prinsip **SOLID** dan modularitas penuh untuk kemudahan perawatan (*maintenance*), pengujian, dan deployment.

---

## 🏛️ Arsitektur SOLID & Pengelompokan Berkas

Struktur berkas telah dikelompokkan secara terstruktur (*Single Responsibility Principle* per berkas):

```
Desain/
├── 📄 Halaman HTML (Entry Points per Role)
│   ├── index.html                      # Portal Pasien Publik & Product Showcase
│   ├── sign-in.html                    # Autentikasi Multi-Role, In-App Reset Password & 1-Click Quick Demo Login
│   ├── owner.html                      # Panel Eksekutif Owner: Analitik Omset, Profil & Unified Notification Bar
│   ├── practitioner.html               # Workspace Dokter: Queue Calling (Audio Chime), Sesi Terapi & Catatan Klinis
│   ├── receptionist.html               # Panel Operasional Resepsionis: Live Queue, Check-in, Kasir POS & Notifikasi
│   ├── patient-portal.html             # Portal Pasien Mandiri: E-Tiket Digital & Live Antrean Tracker
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
│       ├── auth.css                    # Form login staf/pasien, OTP grid, modal reset password, modal edit profil
│       ├── owner.css                   # Style panel owner, analitik omset & live logo uploader
│       ├── practitioner.css            # Style workspace dokter, visualizer Body Pain Map, audio chime calling
│       ├── patient-portal.css          # Style portal pasien, live queue tracker & riwayat booking
│       ├── receptionist.css            # Live queue card, tabel SIMRS bridging, kasir POS
│       ├── ticket.css                  # Kartu digital ticket, perforated divider, QR canvas
│       ├── hero.css                    # Visual hero, phone mockup, live operations card
│       ├── onboarding.css              # Form registrasi tenant, spesialisasi, animasi provisioning
│       ├── demo.css                    # Sandbox wizard stepper, visual body pain map, WhatsApp chat
│       ├── features.css                # Grid fitur, diagram alur rujukan ephemeral
│       ├── showcase.css                # Tab shell, workspace operasional, master calendar, feed
│       ├── booking.css                 # Form booking mandiri, kartu layanan, slot grid, ringkasan
│       ├── notifications.css           # Engine notifikasi, mockup chat WhatsApp, reminder queue, drawer activity
│       └── markets.css                 # Kartu pasar SG & MY, tagar, call-to-action
│
└── ⚡ js/
    ├── config/
    │   ├── role-routes.js              # RBAC Matrix, route mapping & kredensial master per role (OCP)
    │   ├── clinic-data.js              # Master data: Cabang SG/MY, praktisi, layanan, slot default
    │   └── regional-config.js          # Konfigurasi regional: Mata uang, template WA, consent PDPA
    │   ├── walkin-modal.component.js   # Component pendaftaran walk-in cepat
    │   └── whatsapp-simulator.component.js # Component simulasi live chat WA 2-way
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

---

## 📦 Riwayat Rilis & Semantic Versioning (SemVer)

### 🏷️ V1.3.1 (Patch Release) ✅ *Stable Release*
*Rilis pembaruan perbaikan (patch release) untuk menangani visibilitas inisial modal dialog profil pengguna, memastikan tombol exit/cancel/save merespons dengan benar, serta menjamin pre-fill data staf yang andal.*

- **🩹 Bug Fixes & UI Hardening (Patch)**:
  - **Modal Initial Visibility**: Menetapkan `display: none;` secara baku pada `.auth-modal-backdrop` dan inisialisasi markup modal profil agar modal tidak langsung muncul otomatis saat halaman pertama kali dibuka.
  - **Button Handlers Resilience**: Memperkuat penanganan klik pada tombol Exit (`#closeProfileModalBtn`), Batal (`#cancelProfileBtn`), dan Simpan (`#saveProfileBtn`) dengan handler ganda (`onclick` + `addEventListener`) dan pencegahan *event bubbling*.
  - **Role-Based Demo Pre-fill**: Menambahkan fallback cerdas otomatis berbasis URL role jika pengguna mengakses halaman operasional secara langsung tanpa proses sign-in sebelumnya.

### 🏷️ V1.3.0 (Minor Release) ✅ *Stable Release*
*Rilis resmi stabil V1.3.0 yang merangkum seluruh modernisasi fungsionalitas operasional CRM klinik: formulir asupan dinamis (TCM/Spa/Rehab), modul reset kata sandi in-app tanpa SMTP eksternal, manajemen antrean & rekam medis praktisi dengan audio chime, bilah notifikasi aktivitas terpadu, pembaruan profil staf tekstual, serta pencapaian target operasionalitas CRM 100%.*

- **🚀 New Features & Architecture (Minor)**:
  - **Unified Notification Bar Component (`NotificationBarComponent`)**:
    - Tombol lonceng dengan lencana penghitung notifikasi belum dibaca (*unread badge*) di topbar Resepsionis, Praktisi, dan Owner (`#notificationBarContainer`).
    - Dropdown drawer aktivitas interaktif dengan filter visual dan kategori ikon (`QUEUE`, `SESSION`, `SECURITY`, `PROFILE`, `RESERVATION`).
    - Kontrol aksi cepat *"Mark all as read"* dan *"Clear all"*, serta status *unread dot* dinamis.
  - **Textual Staff Profile Update Modal (`ProfileModalComponent`)**:
    - Formulir modal dialog pembaruan data staf (Nama Lengkap, Gelar/Spesialisasi, Ruangan Praktik/Station, Nomor Telepon).
    - Kebijakan IT internal tanpa upload/crop foto fisik, disertai alert edukasi kebijakan klinik.
    - Sinkronisasi instan teks identitas staf pada header antarmuka kerja secara reaktif melalui CustomEvent `cliniva:userProfileUpdated`.
  - **Practitioner Therapy Session & Queue Calling (`practitioner.controller.js`)**:
    - Alur kerja interaktif daftar antrean konsultasi harian dokter dengan persistensi LocalStorage (`cliniva_practitioner_sessions`).
    - Transisi status sesi terapi dinamis (`WAITING` ➔ `IN_PROGRESS` ➔ `COMPLETED` / `NO_SHOW`) dengan indikator *status pill* visual.
    - Perekaman otomatis timestamp tindakan (`startedAt`, `completedAt`).
    - Audio chime Web Audio API (`soundService.playQueueChime()`) dan nada akord mayor selesai (`soundService.playSuccessChime()`).
    - Textarea rekam medis klinis dokter (`#treatmentNotesInput`) dengan riwayat simpan dan notifikasi toast non-blocking.
  - **In-App Reset Password Engine (`sign-in.html` & `auth.service.js`)**:
    - Dialog `#resetPasswordModal` dengan verifikasi email/HP terdaftar dan sinkronisasi instan ke `cliniva_users_registry` tanpa SMTP.
  - **Dynamic Multi-Template Intake System (`IntakeFormComponent`)**:
    - Form asupan klinis adaptif untuk Wellness Spa, Fisioterapi, Nutrisi Klinis, dan TCM.
- **📊 Operationality Target Audit**:
  - Validasi menyeluruh alur kerja CRM mencapai tingkat operasionalitas interaktif **100%** (jauh melampaui batas minimal 50% yang ditargetkan).

### 🏷️ V1.3.0-beta.2 (Pre-Release / Beta 2) ⚠️ *Unstable Release*
*Rilis pembaruan pra-rilis (pre-release) fungsionalitas inti CRM operasional: alur kerja sesi terapi dokter (Practitioner Workspace), pemanggilan antrean audio chime, rekam medis catatan klinis, sistem reset kata sandi in-app, serta harmonisasi multibahasa kartu layanan.*

> ⚠️ **Status Rilis: PRE-RELEASE / UNSTABLE**  
> Versi ini merupakan iterasi beta kedua menuju rilis stabil `v1.3.0`. Memenuhi pencapaian target harian operasional CRM (Fase 2 & Fase 3) sebelum rilis final.

- **🚀 New Features & Architecture (Minor)**:
  - **Practitioner Therapy Session & Patient Queue Workflow (`practitioner.controller.js`)**:
    - Alur kerja interaktif daftar antrean konsultasi harian dokter dengan persistensi LocalStorage (`cliniva_practitioner_sessions`).
    - Transisi status sesi terapi dinamis (`WAITING` ➔ `IN_PROGRESS` ➔ `COMPLETED` / `NO_SHOW`) dengan indikator *status pill* visual langsung pada kartu antrean sidebar.
    - Perekaman otomatis *timestamp* mulai tindakan (*startedAt*) dan selesai tindakan (*completedAt*).
    - Audio chime pemanggilan antrean sintetis Web Audio API (`soundService.playQueueChime()`) dengan animasi banner pemanggilan aktif dan auto-transisi status ke *In Therapy*.
    - Nada akord mayor penyelesaian sesi (*success chime*) saat terapi ditandai selesai (`soundService.playSuccessChime()`).
  - **Clinical Treatment & Observation Notes**:
    - Formulir textarea rekam medis klinis dokter (`#treatmentNotesInput`) dengan tombol simpan (`#saveTreatmentNotesBtn`) dan pelacakan riwayat waktu simpan terakhir (`#treatmentNotesSavedTime`).
  - **Non-blocking Toast Feedback Notification System**:
    - Wadah notifikasi toast modern (`#practitionerToastContainer`) untuk umpan balik instan perubahan status tanpa popup `alert()` browser yang mengganggu alur kerja.
  - **In-App Reset Password Workflow (`sign-in.html` & `auth.service.js`)**:
    - Formulir modal dialog interaktif reset kata sandi staf dengan validasi kekuatan sandi dan konfirmasi sandi.
    - Penyimpanan pengguna terdaftar dinamis pada LocalStorage (`cliniva_users_registry`) tanpa ketergantungan SMTP email eksternal.
  - **System Activity Notifications Foundation (`notification.service.js`)**:
    - Penambahan metode `addSystemNotification()`, `getSystemNotifications()`, dan event `cliniva:systemNotificationAdded` untuk pencatatan log aktivitas pemanggilan antrean dan penyelesaian sesi klinis.
- **🩹 Fixes & Multilingual Hardening (Patch)**:
  - **Multilingual Harmonization on Service Cards**: Memperbaiki inkonsistensi bahasa campuran pada kartu layanan (`#bookingServiceCards`), menerjemahkan nama layanan, deskripsi, satuan durasi (`common.min`), dan lencana rekomendasi secara dinamis ke Bahasa Inggris, Melayu, dan Mandarin tanpa kebocoran teks.
  - **DOM Defensive Hardening**: Penanganan penghapusan toast feedback yang tahan terhadap lingkungan runtime beragam.

### 🏷️ V1.3.0-beta.1 (Pre-Release / Beta) ⚠️ *Unstable Release*
*Rilis pra-rilis (pre-release) arsitektur Dynamic Multi-Template Intake Form, integrasi peta interaktif Leaflet.js, serta adaptasi formulir klinis khusus untuk Fisioterapi, Nutrisi Klinis, dan Wellness Spa.*

> ⚠️ **Status Rilis: PRE-RELEASE / UNSTABLE**  
> Versi ini belum berstatus *Stable Release*. Versi ini dirilis untuk pengujian fungsional dan validasi alur kerja klinis di lapangan sebelum finalisasi rilis stabil `v1.3.0`.

- **🚀 New Features & Architecture (Minor)**:
  - **Dynamic Multi-Template Intake System**: Arsitektur modular form asupan klinis adaptif yang memuat komponen form spesifik berdasarkan klinik/cabang yang dipilih:
    - *Wellness & Luxury Spa* (`wellness`): Pemilihan minyak aromaterapi esensial, level tekanan pijatan, area fokus tubuh, preferensi gender terapis, dan suasana ruangan.
    - *Physiotherapy & Sports Rehab* (`physio`): Pemetaan titik nyeri muskuloskeletal, durasi gejala (*acute, subacute, chronic*), slider skala nyeri VAS (1–10) interaktif, dan simulasi unggah berkas rujukan/radiologi.
    - *Clinical Nutrition & Dietetics* (`nutrition`): Pengukuran biometrik, **kalkulator BMI real-time** dengan klasifikasi warna instan, target nutrisi klinis, pola diet, dan filter alergi makanan (*allergy chips*).
    - *Traditional Chinese Medicine* (`tcm`): Titik meridian interaktif, skala ketidaknyamanan Qi, dan catatan sensitivitas suhu.
  - **Isolated Dynamic Form Component (`IntakeFormComponent`)**: Komponen mandiri dengan rendering terisolasi, reaktif terhadap input pengguna, dan ekstraksi data cerdas (`getIntakeData()`).
  - **Interactive Leaflet.js Clinic Map Locator**: Integrasi peta interaktif dengan *custom pins*, kalkulasi jarak GPS real-time, dan sinkronisasi cabang ke formulir reservasi.
  - **Dynamic Digital E-Ticket & Owner Portal Parity**: Penyesuaian label tiket digital (`ticket.html`) serta katalog profil bisnis pada portal Owner (`owner.html`).
  - **100% i18n Synchronization**: Pembaruan kamus bahasa EN, MS, dan ZH untuk seluruh spesialisasi template baru.
- **🩹 Fixes & Hardening (Patch)**:
  - Pembersihan otomatis data sesi usang pada `localStorage` browser untuk mencegah konflik pemetaan template lama.
  - Penambahan jaminan re-render form dinamis saat transisi langkah (`goToStep(3)`).

### 🏷️ V1.2.0 (Minor Release)
*Rilis pembaruan modular arsitektur SOLID, standarisasi meja kerja Resepsionis, dan penguatan UI multi-peran.*

- **🚀 New Features & Architecture (Minor)**:
  - **Modular Demo Sandbox**: Memecah berkas monolitik `demo.html` (>1000 baris) menjadi 7 modul komponen ES terpisah di bawah `js/components/demo/` mengikuti prinsip *Single Responsibility Principle* (SRP).
  - **Receptionist Dedicated Subsystem**: Standardisasi rute dan arsitektur meja resepsionis menjadi `receptionist.html`, `receptionist.controller.js`, `receptionist.js`, dan `receptionist.css` guna menjamin simetri 4 peran pengguna (Owner, Doctor, Receptionist, Patient) dan menghilangkan duplikasi *dead code* (`admin.html`).
  - **Expanded Multilingual (i18n)**: Dukungan kamus bahasa lengkap (EN/MS/ZH) untuk seluruh langkah wizard, status reservasi, dan komponen interaktif.
  - **Patient Booking Expansion**: Pembaruan alur reservasi mandiri pasien dengan sinkronisasi slot dan timer *hold*.
- **🩹 Bug Fixes & UI Hardening (Patch)**:
  - Perbaikan fungsi tombol **Sign Out** pada meja kerja Resepsionis melalui penambahan alias `signOut()` pada `AuthService`.
  - Penyesuaian tata letak grid dan konsistensi emoji (`🩺`) pada kartu 1-Click Quick Demo Login (`sign-in.html`).
  - Perbaikan tata letak 2 kolom dan indikator langkah (*horizontal stepper*) pada halaman registrasi klinik (`onboarding.html`).
  - Perbaikan styling dan alignment pada Wizard Step Indicator (`demo.html`).

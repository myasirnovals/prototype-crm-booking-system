# 🏥 Cliniva — Integrated Clinic Booking & CRM Platform V1.6.0 [STABLE RELEASE]

Dokumen ini berisi panduan arsitektur dan struktur kode dari aplikasi **Cliniva** (*Integrated Clinical Appointment & Patient Relationship Management System*), dirancang dengan prinsip **SOLID** dan modularitas penuh untuk kemudahan perawatan (*maintenance*), pengujian, dan deployment.

---

## 🏛️ Arsitektur SOLID & Pengelompokan Berkas

Struktur berkas telah dikelompokkan secara terstruktur (*Single Responsibility Principle* per berkas):

```
Desain/
├── 📄 Halaman HTML (Entry Points per Role)
│   ├── index.html                      # Portal Pasien Publik & Product Showcase
│   ├── sign-in.html                    # Autentikasi Multi-Role, In-App Reset Password & 1-Click Quick Demo Login
│   ├── owner.html                      # Dashboard Super Admin (HQ): Multi-Branch Consolidation & User Management
│   ├── owner-dashboard.html            # [NEW] Dashboard Operasional Owner: Anti-Margin Error, 4 Modul Terisolasi Cabang
│   ├── branch-select.html              # [NEW] Gateway Pemilihan Cabang Aktif (Choose Branch) & Registrasi Cabang Baru
│   ├── admin-onboarding.html           # [NEW] Setup Branch Wizard 4-Langkah (Brand, 4 Template, Cabang 1, Launch)
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
    │   ├── owner.controller.js         # OwnerController: Analitik HQ multi-cabang, user management, profil bisnis
    │   ├── owner-dashboard.controller.js # [NEW] OwnerDashboardController: Modul 1 Cabang, Modul 2 Staf, Modul 3 Stok, Modul 4 Praktisi
    │   ├── branch-select.controller.js  # [NEW] BranchSelectController: Multi-branch gateway & new branch provisioning
    │   ├── admin-onboarding.controller.js # [NEW] AdminOnboardingController: WordPress-style 4-step branch setup wizard
    │   ├── practitioner.controller.js  # PractitionerController: Timeline dokter, calling chime, body pain map
    │   ├── patient-portal.controller.js# PatientPortalController: Active ticket, live queue, reschedule/cancel
    │   ├── receptionist.controller.js  # ReceptionistController: Live queue calling, kasir POS & walk-in dispatcher
    │   ├── ui.controller.js            # UIController: Navbar scroll, mobile drawer, toast feedback
    │   ├── onboarding.controller.js    # OnboardingController: Pendaftaran tenant & simulasi provisioning
    │   ├── demo.controller.js          # DemoController: Wizard 5-langkah, Pain Map, WhatsApp 2-way, ROI
    │   ├── booking.controller.js       # BookingController: Sinkronisasi form booking & checkout
    │   └── dashboard.controller.js     # DashboardController: Filter cabang & live calendar
    └── pages/
        ├── auth.js                     # Entry point untuk sign-in.html
        ├── owner.js                    # Entry point untuk owner.html
        ├── owner-dashboard.js          # [NEW] Entry point untuk owner-dashboard.html
        ├── branch-select.js            # [NEW] Entry point untuk branch-select.html
        ├── admin-onboarding.js         # [NEW] Entry point untuk admin-onboarding.html
        ├── practitioner.js             # Entry point untuk practitioner.html
        ├── patient-portal.js           # Entry point untuk patient-portal.html
        ├── receptionist.js             # Entry point untuk receptionist.html
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
| 👑 **Super Admin** | `owner@cliniva.com` | `cliniva2026` | [`owner.html`](owner.html) | Dashboard HQ konsolidasian, User Management (buat akun owner baru), profil bisnis adaptif (FR-CONFIG-03), audit trail |
| 💼 **Clinic Owner** | `dennis@cliniva.com` | `cliniva2026` | [`branch-select.html`](branch-select.html) ➔ [`owner-dashboard.html`](owner-dashboard.html) | Dashboard operasional cabang terisolasi (Anti-Margin Error), live queue hari ini, Modul 1 Cabang, Modul 2 Staf, Modul 3 Stok Template, Modul 4 Praktisi |
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

### 🏷️ V1.6.0 (Minor Release) ✅ *Stable Release*
*Rilis resmi stabil V1.6.0: Transformasi arsitektur multi-tenant dengan pemisahan peran operasional sesuai diagram alur resmi (`alur aplikasi booking system.xml`). Menghadirkan modul Super Admin User Management, WordPress-Style Setup Wizard 4-langkah untuk penyiapan identitas brand dan lini spesialisasi, Gerbang Pemilihan Cabang Aktif (*Choose Branch Gateway*) untuk mereduksi margin error operasional, Dashboard Khusus Owner (`owner-dashboard.html`) dengan 4 modul manajemen mandiri (Cabang, Staf, Stok Inventaris Spesifik Template, dan Praktisi/Terapis), serta ekspansi jaringan peta Leaflet 9 cabang strategis SG & MY.*

- **🚀 New Features & Architecture (Minor)**:
  - **Super Admin User Management Module (`owner.html` & `owner.controller.js`)**:
    - Panel registri pengguna platform multi-tenant dengan metrik KPI akun terdaftar, direktur owner, dan pending onboarding.
    - Tabel direktori pengguna lengkap dengan penanda status onboarding (`✅ Active` vs `⏳ Pending Setup`), filter role dinamis, dan aksi cepat *"Simulate First Login 🚀"* serta *"Delete 🗑️"*.
    - Modal pembuatan Admin/Owner baru (`#createAdminModalOverlay`) untuk mendaftarkan akun mitra/klien (misal: Dennis Pratama).
  - **WordPress-Style Setup Wizard Onboarding (`admin-onboarding.html`)**:
    - Stepper 4 langkah terstruktur saat Owner baru pertama kali masuk (`onboardingCompleted: false`):
      1. *Identitas Brand*: Nama klinik, tagline, pemilih logo emoji/upload gambar logo fisik drag-and-drop dengan live preview, yurisdiksi SG/MY.
      2. *Pemilihan 1 dari 4 Lini Spesialisasi Bisnis*: TCM (Meridian/Akupunktur), Wellness & Spa (Aromaterapi/Tekanan Pijat), Fisioterapi (Peta Nyeri/Skala VAS 1-10), dan Klinik Nutrisi (Kalkulator BMI Real-Time).
      3. *Konfigurasi Cabang Pertama (Cabang 1)*: Alamat fisik, WhatsApp cabang, jam operasional, kapasitas ruang terapi.
      4. *Peluncuran*: Konfirmasi dan auto-redirect langsung ke Dashboard Cabang.
  - **Gerbang Pemilihan Cabang Aktif (*Branch Selector Gateway* - `branch-select.html`)**:
    - Antarmuka pemilihan cabang bagi Owner yang sudah memiliki cabang saat login kembali (`First = No`).
    - Kartu cabang terdaftar dengan template spesifik, kontak, kapasitas, dan badge cabang aktif.
    - Formulir penambahan cabang baru (Cabang 2, 3, dst.) dengan template dan isolasi data operasional tersendiri.
  - **Dashboard Operasional Khusus Owner (`owner-dashboard.html`)**:
    - Halaman terpisah dan arsitektur mandiri dengan topbar brand resmi, indikator cabang aktif, tombol cepat *"Ganti Cabang 🔄"*, dan link pratinjau booking pasien.
    - *Tab 1 (Overview & Antrean)*: KPI omset cabang, okupansi, janji temu hari ini, dan tabel antrean live khusus cabang aktif dengan aksi *"Tandai Selesai ✓"*.
    - *Tab 2 (Modul 1: Pengaturan Cabang)*: Formulir edit identitas cabang, jam operasional, alamat, dan nomor kontak.
    - *Tab 3 (Modul 2: Staf Cabang)*: Pengelolaan resepsionis dan admin yang bertugas di cabang aktif + modal tambah staf.
    - *Tab 4 (Modul 3: Inventaris Spesifik Template)*: Katalog barang adaptif yang otomatis berubah mengikuti template (Jarum/Moxa untuk TCM; Taping/Resistance Band/Gel untuk Fisioterapi; Minyak Esensial/Scrub untuk Spa; Whey/Multivitamin/Bio-impedance untuk Nutrisi), batas minimum peringatan stok, dan tombol instan `+10 Stok`.
    - *Tab 5 (Modul 4: Praktisi & Terapis)*: Penjadwalan dokter/terapis cabang aktif, alokasi ruangan, jam shift, dan tarif.
  - **Full Diagram Flowchart Compliance (`alur aplikasi booking system.xml`)**:
    - Integrasi penuh `getHomeRouteForUser(user)` pada `auth.service.js`.
    - Super Admin ➔ `owner.html`
    - Owner (First = Yes) ➔ `admin-onboarding.html` ➔ `owner-dashboard.html`
    - Owner (First = No) ➔ `branch-select.html` ➔ `owner-dashboard.html`
  - **Ekspansi 9 Cabang Jaringan Klinik Multi-Disiplin (`clinic-data.js` & `CLINIC_LOCATIONS`)**:
    - 5 Cabang di Singapura dan 4 Cabang di Malaysia dengan adaptasi pin & popup dinamis mengikuti template aktif.
    - Filter cepat wilayah: `🇸🇬 Singapore (5 Branches)`, `🇲🇾 Malaysia (4 Branches)`, dan `🌐 All Locations (9)`.
    - Algoritma jarak Haversine untuk deteksi cabang terdekat.

### 🏷️ V1.5.0 (Minor Release) ✅ *Stable Release*
*Rilis resmi stabil V1.5.0: Menghubungkan secara penuh seleksi profil bisnis adaptif Super Admin pada panel eksekutif (`owner.html` & `owner.controller.js`) dengan alur reservasi pasien pada `booking.html`. Tampilan portal pasien terjaga bersih tanpa bilah switcher admin, dengan data sesi konsultasi, praktisi spesialis, instrumen form intake khusus, dan E-Tiket yang beradaptasi secara dinamis dan presisi sesuai profil yang diaktifkan oleh Super Admin.*

- **🚀 New Features & Architecture (Minor)**:
  - **Super Admin Adaptive Business Profile Activation (`owner.html` & `owner.controller.js`)**:
    - Bilah status blueprint aktif real-time (`#activeProfileStatusBanner`) dengan indikator status `● LIVE ON PATIENT PORTAL` dan tautan pratinjau langsung ke portal pasien (`Preview Patient Booking ↗`).
    - Tombol aksi aktivasi terintegrasi pada masing-masing kartu profil (`Set as Active Template` / `✓ Currently Active`).
    - Penyimpanan instan ke `storageService` (`cliniva_intake_profile` dan `cliniva_active_template`) dengan audio chime konfirmasi (`soundService.playQueueChime()`), feedback visual toast hijau, dan pencatatan audit trail otomatis.
    - Sinkronisasi template pada profil cabang utama (`cliniva_branches`).
  - **Clean Patient Portal Data Adaptation (`booking.html` & `patient-booking.controller.js`)**:
    - **Pembersihan Layout Portal Pasien**: Menghapus bilah switcher admin dari `booking.html` sesuai tata letak yang diinginkan pengguna, menjaga fokus dan privasi pengalaman reservasi pasien.
    - **Kotak Sesi Konsultasi Terkonfigurasi (`#activeClinicSessionBox`)**: Ditampilkan terintegrasi di dalam `#selectedClinicInfoBar` pada Langkah 1, menyajikan nama sesi konsultasi, durasi, harga baku, dan komitmen deposit slot.
    - **Lencana Klinik Adaptif (`#activeClinicBadge`)**: Otomatis menyesuaikan warna aksen, ikon, dan label (🌸 Wellness & Spa Care, 🏃 Physiotherapy & Rehab, 🥗 Clinical Nutrition & Dietetics, 🌿 Traditional Chinese Medicine).
    - **Filter Praktisi & Form Asesmen Asupan Dinamis**: Langkah 2 menampilkan spesialis sesuai template aktif; Langkah 3 memuat form asesmen khusus (skala nyeri VAS & pemilih sendi untuk fisioterapi; minyak esensial & tekanan pijat untuk spa; kalkulator BMI & target diet untuk nutrisi; peta meridian & diagnosis lidah/nadi untuk TCM).
    - **Ringkasan Langkah 4 & E-Tiket**: Persistensi penuh seluruh rincian konsultasi dan deposit pada E-Tiket digital resmi.
  - **Automated Verification Matrix (`test_owner_booking_sync.mjs`)**:
    - Pengujian otomatis end-to-end memvalidasi siklus peralihan ke-4 profil dan sinkronisasinya ke draf booking serta UI pasien dengan kelolosan 100%.

### 🏷️ V1.4.0 (Minor Release) ✅ *Stable Release*
*Rilis resmi stabil V1.4.0 menindaklanjuti feedback langsung dari mentor/pembimbing kerja praktik: Transformasi menyeluruh halaman reservasi pasien (`booking.html`) agar seluruh tampilan, alur, sesi konsultasi baku, estimasi biaya, deposit, dan formulir intake asupan diatur penuh dari template Super Admin (`wellness`, `physio`, `tcm`, `nutrition`), tanpa mengharuskan pasien memilih menu treatment manual.*

- **🚀 New Features & Architecture (Minor)**:
  - **Super Admin Dynamic Template Governance**: Halaman pemesanan pasien (`booking.html`) sepenuhnya beradaptasi dengan model bisnis klinik aktif yang ditentukan Super Admin:
    - *🌸 Wellness & Luxury Spa*: Sesi konsultasi & aromaterapi spa 75 min (SGD 130 / MYR 290, deposit SGD 35), dokter/terapis spa (Therapist Sarah Tan / Ayu Dewi), form intake preferensi minyak esensial, tekanan pijatan, dan area tubuh.
    - *🏃 Physiotherapy & Rehab*: Sesi pemeriksaan muskuloskeletal 60 min (SGD 120 / MYR 260, deposit SGD 30), dokter/praktisi fisioterapi (Dr. Lim Wei Han / Dr. Marcus Wong / Sarah Mitchell), form intake peta nyeri anatomi, skala VAS 1–10, dan durasi onset.
    - *🌿 Traditional Chinese Medicine (TCM)*: Sesi diagnosis meridian & nadi 45 min (SGD 90 / MYR 210, deposit SGD 25), sinse/dokter TCM (Dr. Wong Mei Ling / Sinse Huang Wei), form intake meridian, akupresur, dan sensitivitas suhu.
    - *🥗 NutriFlow Clinical Nutrition*: Sesi dietetika klinis & metabolik 60 min (SGD 110 / MYR 250, deposit SGD 25), dokter/dietisien klinis (Elena Lopez, RD / Dr. Kevin Tan / Amirah binti Razak), form intake biometrik, kalkulator BMI real-time, dan pola makan.
  - **Streamlined 4-Step Patient Journey (Penghapusan Pemilihan Treatment Manual)**:
    - Pasien tidak perlu lagi memilih-milih menu treatment secara manual di Langkah 1.
    - Menggantikan grid layanan lama dengan kartu *Standard Consultation Overview* (`#templateConsultationBanner`) yang menampilkan spesifikasi sesi, rincian biaya, deposit hold slot, dan 4 pilar fasilitas klinis (Spesialis, Intake, Kamar/Suite privat, PDPA).
    - Alur reservasi menjadi: **Langkah 1 (Lokasi Cabang)** ➔ **Langkah 2 (Praktisi & Jadwal 10-Min Hold)** ➔ **Langkah 3 (Asesmen Intake Khusus Template)** ➔ **Langkah 4 (Konfirmasi & Tiket E-Ticket Digital)**.
  - **Executive Super Admin Template Switcher Bar (`#adminTemplateSwitcherBar`)**:
    - Menyediakan bilah kontrol interaktif di bagian paling atas `booking.html` dengan 4 pill template untuk pengujian dan evaluasi langsung seluruh mode klinik.
    - Indikator status lencana template aktif dengan animasi pulsa hijau (*live status indicator*).
  - **Two-Way Synchronization with Super Admin Owner Portal (`owner.controller.js` & `booking.service.js`)**:
    - Sinkronisasi instan saat Super Admin memilih profil pada *Adaptive Business Profiles Catalog* di `owner.html`, otomatis memperbarui `cliniva_active_template` dan menyiarkan event `cliniva:templateChanged`.
    - Pilihan template pada `booking.html` juga tersinkronisasi kembali ke `cliniva_intake_profile`.
  - **Automated Test Suite (`test_dynamic_template_booking.mjs`)**:
    - Skrip pengujian terotomatisasi 6 fase memvalidasi integritas DOM, API template `bookingService`, rendering multi-template `IntakeFormComponent`, alur controller 4 langkah, dan persistensi E-Ticket.

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

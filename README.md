# 🏥 Cliniva — Integrated Clinic Booking & CRM Platform V1.8.1 [STABLE RELEASE]

Dokumen ini berisi panduan arsitektur dan struktur kode dari aplikasi **Cliniva** (*Integrated Clinical Appointment & Patient Relationship Management System*), dirancang dengan prinsip **SOLID** dan modularitas penuh untuk kemudahan perawatan (*maintenance*), pengujian, dan deployment.

---

## 🏛️ Arsitektur SOLID & Pengelompokan Berkas per Aktor

Struktur berkas telah dikelompokkan secara terstruktur (*Single Responsibility Principle* per aktor & fitur):

```
Desain/
├── 📄 Root (Landing & Public Tools)
│   ├── index.html                          # Landing page & embedded hero preview
│   ├── onboarding.html                     # Registrasi klinik baru publik
│   ├── demo.html                           # Sandbox demo interaktif
│   └── README.md                           # Dokumentasi arsitektur sistem
│
├── 📂 pages/                               # Halaman per Aktor (Strict Role Isolation)
│   ├── super-admin/
│   │   └── index.html                      # Platform Console: kelola akun owner & audit log
│   ├── owner/
│   │   ├── onboarding.html                 # Setup Branch Wizard (Brand, Template, Cabang 1)
│   │   ├── branch-select.html              # Gateway pemilihan cabang aktif
│   │   └── dashboard.html                  # Dashboard Owner: kelola cabang & Branch Admin
│   ├── branch-admin/
│   │   └── index.html                      # Workspace Admin Cabang: antrean meja depan, dokter/praktisi, jadwal & POS
│   ├── practitioner/
│   │   └── index.html                      # Workspace Dokter: antrean, audio chime, Body Pain Map
│   ├── patient/
│   │   └── index.html                      # Portal Pasien: e-tiket, lacak antrean, reschedule
│   └── public/
│       ├── sign-in.html                    # Multi-role login, 1-click quick demo & reset password
│       ├── booking.html                    # Wizard reservasi janji temu pasien 4-langkah
│       └── ticket.html                     # Viewer e-tiket digital & sinkronisasi .ics
│
├── 🎨 css/
│   ├── style.css                           # Master stylesheet (mengimpor semua modul)
│   ├── variables.css                       # Design Tokens: Medical Teal, gradien, shadow, radius
│   ├── base.css                            # CSS Reset, elemen dasar, tombol, pill, feedback box
│   ├── layout.css                          # Navbar glassmorphism, drawer mobile, header & footer
│   └── components/                         # CSS komponen spesifik per fitur/aktor
│
└── ⚡ js/
    ├── config/
    │   ├── role-routes.js                  # RBAC Matrix, route mapping & kredensial master (OCP)
    │   ├── clinic-data.js                  # Master data: Cabang SG/MY, praktisi, layanan, slot
    │   ├── regional-config.js              # Konfigurasi regional: Mata uang, template WA, PDPA
    │   └── templates/                      # Template spesialisasi klinik (physio, dental, tcm, wellness)
    ├── locales/
    │   ├── en.js                           # Kamus Bahasa Inggris (Default SG / Global)
    │   ├── ms.js                           # Kamus Bahasa Melayu / Indonesia (MY / ID)
    │   └── zh.js                           # Kamus Bahasa Mandarin (Simplified Chinese)
    ├── services/
    │   ├── auth.service.js                 # AuthService: Kredensial, dynamic route guard, logout (SRP)
    │   ├── storage.service.js              # StorageService: LocalStorage abstraction + memory fallback
    │   ├── i18n.service.js                 # I18nService: Multilingual translation engine
    │   ├── booking.service.js              # BookingService: Triple-Constraint engine & slot hold
    │   ├── navbar.service.js               # NavbarService: Dynamic nav, drawer & ticket sync
    │   ├── notification.service.js         # NotificationService: WhatsApp & .ics generator
    │   └── sound.service.js                # SoundService: Web Audio API chime synthesizer
    ├── components/
    │   ├── intake-form.component.js        # Form intake adaptif spesialisasi
    │   ├── notification-bar.component.js   # Bar notifikasi live
    │   ├── profile-modal.component.js      # Modal profil pengguna
    │   └── demo/                           # Komponen modular sandbox demo
    ├── controllers/                        # Controller Grouped by Actor / Surface
    │   ├── super-admin/                    # SuperAdminController: Platform & owner accounts
    │   ├── owner/                          # Owner controllers: onboarding, branch-select, dashboard
    │   ├── branch-admin/                   # BranchAdminController: Antrean, dokter cabang, jadwal, POS
    │   ├── practitioner/                   # PractitionerController: Timeline dokter, calling chime
    │   ├── patient/                        # PatientPortalController: Tiket, live queue, reschedule
    │   ├── public/                         # Public controllers: auth.controller, booking.controller
    │   └── landing/                        # Landing page controllers: ui, booking, dashboard
    └── pages/                              # Bootstrap entry points per halaman
```

---

## 🔑 Kredensial Akun Demo per Role (1-Click Login Ready)

Pada halaman [`pages/public/sign-in.html`](pages/public/sign-in.html), tersedia tombol **⚡ 1-Click Quick Demo Login** untuk menguji setiap peran secara instan:

| Peran | Akun Email / Kontak | Password / OTP | Halaman Tujuan | Fitur Utama |
|---|---|---|---|---|
| 👑 **Super Admin** | `superadmin@cliniva.com` | `cliniva2026` | [`pages/super-admin/index.html`](pages/super-admin/index.html) | Dashboard HQ platform, User Management (buat akun owner baru), audit trail |
| 💼 **Clinic Owner** | `dennis@cliniva.com` | `cliniva2026` | [`pages/owner/branch-select.html`](pages/owner/branch-select.html) ➔ [`pages/owner/dashboard.html`](pages/owner/dashboard.html) | Dashboard operasional owner, kelola cabang & Branch Admin |
| 🏪 **Admin Cabang (Branch Admin)** | `reception@orchardclinic.sg` / `manager@orchardclinic.sg` | `cliniva2026` | [`pages/branch-admin/index.html`](pages/branch-admin/index.html) | Operasional cabang terpadu: Meja Depan (antrean & chime), kelola dokter cabang, jadwal ruangan, kasir POS & stok |
| 🧑‍⚕️ **Practitioner / Dokter** | `dr.lim@orchardclinic.sg` | `cliniva2026` | [`pages/practitioner/index.html`](pages/practitioner/index.html) | Timeline konsultasi harian dokter, visualizer Body Pain Map, pemanggil chime |
| 👤 **User / Pasien** | `+65 8123 4567` / `amanda@tan.sg` | OTP `123456` / `cliniva2026` | [`pages/patient/index.html`](pages/patient/index.html) | E-Tiket digital, pelacak nomor antrean live, riwayat reservasi, reschedule |

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

### 🏷️ V1.8.1 (Patch Release) ✅ *Stable Release*
*Rilis perbaikan (patch release) v1.8.1: Harmonisasi benchmark visual kartu cabang pada Owner Gateway (`branch-select.html`), deduplikasi cerdas data cabang untuk mencegah duplikasi entri kartu ganda, eliminasi elemen pembatas bawah redundan (`#cardTriggerNewBranch`) yang digantikan tombol header primer, serta perbaikan menyeluruh interaktivitas tombol dan sintaks template literal pada konsol operasional Branch Admin (`pages/branch-admin/index.html`).*

- **🩹 Bug Fixes & UI Hardening (Patch)**:
  - **Deduplikasi Cerdas Data Cabang (`branch-select.controller.js` & `onboarding.controller.js`)**:
    - Menambahkan algoritma `deduplicateBranches()` berbasis ID dan normalisasi nama cabang dengan prioritas cabang aktif dan primer.
    - Mengeliminasi kemunculan kartu ganda (seperti duplikasi *"Paragon Medical Flagship (Cabang 1)"*).
    - Menambahkan validasi submit pendaftaran cabang baru guna mencegah penambahan nama cabang yang sudah terdaftar.
    - Memastikan proses inisialisasi pada onboarding klinik baru tidak memicu duplikasi data ke `localStorage`.
  - **Pembersihan Elemen Redundan (`branch-select.html` & `branch-select.controller.js`)**:
    - Menghapus elemen kartu pembatas bawah `#cardTriggerNewBranch` (`.add-branch-card-row`) beserta handler-nya karena pendaftaran cabang baru telah terakomodasi secara optimal oleh tombol primer di header (`#btnOpenNewBranchModal`).
    - Menghapus deklarasi CSS usang terkait elemen kartu pembatas bawah.
  - **Harmonisasi Benchmark Desain Kartu Cabang (`branch-select.controller.js`)**:
    - Menyelaraskan hierarki tipografi, padding, dan struktur kartu cabang agar konsisten 1:1 dengan benchmark kartu identitas brand induk (`.gateway-header-card`).
    - Memperbaiki parsing data jumlah ruang terapi adaptif: `${Array.isArray(b.rooms) ? b.rooms.length : (b.rooms || "4")} Ruang Terapi`.
  - **Pemulihan Interaktivitas Tombol Branch Admin Console (`dashboard.controller.js` & `pages/branch-admin/index.html`)**:
    - Memperbaiki sintaks kutip string template literal yang tidak tertutup pada helper `renderBranchStock`.
    - Memasang dan menginisialisasi `NotificationBarComponent` pada header konsol Branch Admin sehingga proses bootstrap controller berjalan tuntas tanpa runtime exception.
    - Menambahkan mekanisme fallback sesi demo otomatis saat halaman dibuka langsung tanpa proses login manual.
    - Menjamin seluruh tombol interaktif (panggil antrean, ubah status pasien, tab switcher, filter ruangan/dokter, modal tambah staf/stok/dokter) merespons klik 100%.

### 🏷️ V1.8.0 (Minor Release) ✅ *Stable Release*
*Rilis resmi minor v1.8.0: Konsolidasi struktural peran Branch Manager dan Receptionist menjadi peran operasional tunggal terpadu yaitu Branch Admin (`pages/branch-admin/index.html`), penegasan arsitektur 5 aktor definitif (Super Admin, Owner, Branch Admin, Practitioner, Patient), serta konfigurasi pengalihan backwards-compatible penuh pada `vercel.json`.*

- **🚀 New Features & Architecture (Minor)**:
  - **Unified Branch Admin Console (`pages/branch-admin/index.html` & `dashboard.controller.js`)**:
    - Menggabungkan fungsionalitas meja resepsionis (front desk check-in, live queue calling, status antrean) dan operasional manajerial (jadwal dokter, alokasi ruangan, kasir POS, manajemen stok inventaris).
    - Menghapus pemisahan redundant antara Branch Manager dan Receptionist demi alur kerja operasional klinik yang lebih ramping dan efisien.
  - **Arsitektur 5 Aktor Definitif Platform**:
    - 👑 **Super Admin** (`pages/super-admin/`): Manajemen platform dan akun owner mitra.
    - 💼 **Clinic Owner** (`pages/owner/`): Pengaturan brand induk, gerbang cabang, dan penunjukan admin cabang.
    - 🏪 **Branch Admin** (`pages/branch-admin/`): Operasional meja depan, antrean, kasir, stok, dan dokter cabang.
    - 🧑‍⚕️ **Practitioner / Dokter** (`pages/practitioner/`): Konsultasi medis, Body Pain Map, dan catatan klinis.
    - 👤 **Patient / Pasien** (`pages/patient/`): Reservasi mandiri, e-ticket digital, dan reschedule.
  - **Routing & Server Redirects (`role-routes.js` & `vercel.json`)**:
    - Menambahkan aturan redirect HTTP 301 untuk backward compatibility dari rute lama `/pages/receptionist/*` dan `/pages/branch-manager/*` menuju `/pages/branch-admin/*`.

### 🏷️ V1.7.1 (Patch Release) ✅ *Stable Release*
*Rilis perbaikan v1.7.1: Pembersihan berkas duplikat dan usang di tingkat root directory setelah restrukturisasi folder berbasis peran aktor, audit integritas referensi impor ES6, serta validasi deployment Vercel.*

- **🩹 Bug Fixes & Code Cleanup (Patch)**:
  - Mengeliminasi lebih dari 8.000 baris kode usang dan file duplikat yang tersisa di root directory setelah migrasi modular ke `pages/` dan `js/controllers/`.
  - Memperbarui seluruh jalur import modul ES6 dan referensi asset CSS/JS agar sinkron dengan struktur subdirektori peran aktor.

### 🏷️ V1.7.0 (Minor Release) ✅ *Stable Release*
*Rilis minor v1.7.0: Restrukturisasi arsitektur direktori secara komprehensif mengikuti prinsip Single Responsibility Principle (SOLID) berbasis peran aktor (`pages/` dan `js/controllers/` dikelompokkan per subfolder aktor).*

- **🚀 New Features & Architecture (Minor)**:
  - **Struktur Direktori Berbasis Peran Aktor**:
    - Pengelompokan halaman HTML ke dalam `pages/super-admin/`, `pages/owner/`, `pages/branch-admin/`, `pages/practitioner/`, `pages/patient/`, dan `pages/public/`.
    - Pengelompokan controller JavaScript ke dalam subfolder bersesuaian di `js/controllers/`.
  - **Modularitas & Kemudahan Maintenance**:
    - Menghilangkan kopling silang antar halaman aktor dan meningkatkan isolasi konteks keamanan RBAC.

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

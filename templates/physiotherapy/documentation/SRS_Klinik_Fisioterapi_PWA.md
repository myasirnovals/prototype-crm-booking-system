# Software Requirements Specification (SRS)
# Progressive Web App — Klinik Fisioterapi

**Versi:** 1.0
**Tanggal:** 10 Agustus 2026
**Disusun berdasarkan:** Sintesis 5 analisis komparatif (Deepseek, Gemini Notebook, Gemini Pro, GPT, Sonnet 5) terhadap 8 situs referensi (4 Indonesia: IndoHomeCare, Halodoc, NK Health, Fisiohome; 4 Singapura: ProRehab, AMP Lab, Strength Clinic Academy, Mount Elizabeth Hospital) dan dokumen "Analisis Kebutuhan Klinik Fisioterapi" (hasil wawancara 4 owner klinik).
**Design Reference:** `DESIGN.md` — Design System "Clinical Serenity"

---

## Daftar Isi

1. Pendahuluan
2. Sintesis Temuan Lintas-Analisis
3. Prinsip Diferensiasi (Anti-Duplikasi Kompetitor)
4. Deskripsi Umum Sistem
5. Kebutuhan Fungsional (Functional Requirements)
6. Kebutuhan Non-Fungsional (termasuk kebutuhan spesifik PWA)
7. Peran Pengguna & Hak Akses
8. Model Data (Ringkasan Entitas)
9. Spesifikasi Desain UI/UX (mengacu DESIGN.md)
10. Roadmap Implementasi (Fase 1–3)
11. Matriks Fitur vs Kompetitor & Status Diferensiasi
12. Lampiran

---

## 1. Pendahuluan

### 1.1 Tujuan Dokumen
Dokumen ini mendefinisikan kebutuhan perangkat lunak untuk pengembangan **Progressive Web App (PWA)** klinik fisioterapi. Dokumen ini menggabungkan seluruh temuan dari lima proses analisis independen (masing-masing dilakukan oleh model AI berbeda: Deepseek Instant/DeepThink/Search, Gemini Notebook, Gemini Pro, GPT, dan Sonnet 5) yang membandingkan 8 website/aplikasi kompetitor serta memvalidasinya terhadap kebutuhan riil 4 owner klinik fisioterapi di Indonesia.

### 1.2 Ruang Lingkup Produk
Produk yang dikembangkan adalah **PWA** (bukan native app maupun website statis biasa) yang berfungsi sebagai:
- Kanal informasi & kepercayaan (profil klinik, terapis, layanan, kondisi medis)
- Sistem operasional inti (booking, asesmen awal, pengingat, pembatalan/reschedule)
- Portal manajemen pasien (rekam medis ringkas, program latihan mandiri, riwayat kunjungan)
- Kanal transaksi (paket terapi, pembayaran digital)
- Dashboard internal klinik (admin, terapis, owner) dengan role-based access control
- Kanal diferensiasi jangka panjang (asisten AI triase, telekonsultasi, progress tracking)

Karena berbentuk PWA, aplikasi **wajib dapat di-install ke home screen, berjalan offline-first untuk konten statis/terakhir-diakses, mengirim push notification, dan tetap merupakan satu basis kode (codebase) yang diakses lewat browser** tanpa perlu publish ke App Store/Play Store.

### 1.3 Sumber Analisis yang Digabungkan
| Sumber | Kontribusi Utama terhadap Sintesis Ini |
|---|---|
| Deepseek (Instant/DeepThink/Search) | Struktur fase 1–3 awal, kriteria "Fitur Umum" berbasis frekuensi 8/8 situs, penekanan pada validasi silang dengan dokumen wawancara owner |
| Gemini Notebook | Tabel rekapitulasi frekuensi fitur per situs, status Wajib/Umum/Tambahan/Unggulan berbasis ambang kuantitatif |
| Gemini Pro | Kolom Fase Implementasi + Nilai Tambah per fitur, kategori Trust & Branding / Akses & Reservasi / Clinical Excellence / Patient Engagement / Operasional & Bisnis |
| GPT | Kolom Kategori (Standar/Unggulan), Nilai Bisnis, Dev Effort, tiga-tabel Benchmark → Prioritas → Matriks Keputusan |
| Sonnet 5 | Verifikasi ulang data (❓ untuk data tak terkonfirmasi, ⚠️ untuk fitur parsial), **split rasio Indonesia vs Singapura** berdasarkan kesamaan skala bisnis, silang eksplisit dengan 26 poin dokumen kebutuhan, aturan keputusan "2 dari 3 syarat" |

---

## 2. Sintesis Temuan Lintas-Analisis

Menggabungkan kelima analisis, ditemukan konsensus dan nuansa berikut:

### 2.1 Fitur yang Disepakati SEMUA analisis sebagai "Wajib/Core" (Fase 1)
Katalog Layanan & Estimasi Biaya, Profil Klinik/Cabang/Terapis (dengan STR), Booking & Reservasi Online Real-time, Integrasi WhatsApp, Formulir Asesmen Awal Online, Konfirmasi & Pengingat Otomatis, Dashboard Admin dengan Role-Based Access Control (RBAC), Kebijakan Pembatalan/Reschedule yang jelas.

### 2.2 Insight Unik per Analisis yang Diadopsi ke Sintesis Ini
- **Dari Sonnet 5:** Fitur yang tampak "jarang" dalam rasio gabungan 8 situs (mis. Estimasi Harga, Home Visit) sebenarnya **dominan di kelompok situs Indonesia** yang skala bisnisnya sebanding dengan klinik target — sehingga tetap diprioritaskan Fase 1, bukan diturunkan. Sebaliknya, fitur yang tampak "umum" di kelompok Singapura (Outcome/Progress Tracking, Teknologi Rehab) adalah ciri klinik premium bermodal alat mahal — dipertimbangkan sebagai opsi Fase 3, bukan Fase 1.
- **Dari Gemini Pro & GPT:** Perlu pemisahan tegas antara **Fitur Umum/Standar** (wajib ada agar produk "berfungsi", tidak memberi keunggulan) dan **Fitur Unggulan/Diferensiator** (memberi nilai kompetitif). Menandai semua fitur populer sebagai "unggulan" adalah kesalahan metodologi.
- **Dari Gemini Notebook:** Ambang kuantitatif eksplisit diperlukan agar klasifikasi objektif: ≥75% situs → Wajib, 50–74% → Umum, 25–49% → Tambahan, <25% → Unggulan/Niche.
- **Dari Deepseek (respons ke-2, referensi SG):** Empat area yang belum tergarap kompetitor Indonesia namun jadi standar di Singapura: (1) Indeks Kondisi Medis per bagian tubuh (SEO-driven), (2) showcase Teknologi/Alat Asesmen Objektif, (3) Metode Terapi Modern (Clinical Pilates, Dry Needling), (4) Alur Perawatan Pasien yang transparan ("What to Expect").
- **Dari seluruh analisis konsisten:** Asisten AI untuk triase (deteksi red-flag, dilarang mendiagnosis) dan Telekonsultasi berbayar adalah fitur diferensiasi Fase 3 dengan skema kredit biaya konsultasi ke sesi tatap muka pertama.

### 2.3 Koreksi Data Penting (dari proses verifikasi berulang lintas-analisis)
Beberapa kesalahan penandaan (false negative) yang dikoreksi selama proses: Profil Terapis & Testimoni sebenarnya ada di IndoHomeCare; Booking Online, Kontak WhatsApp, Estimasi Harga (bill estimator), dan FAQ sebenarnya tersedia di Mount Elizabeth; Artikel Edukasi/Blog tersedia di ProRehab & Strength Clinic Academy; Home Visit tersedia di NK Health & ProRehab. Detail lengkap ada di Bagian 11.

### 2.4 Daftar Fitur Master Gabungan (22 Fitur Unik Teridentifikasi)
Seluruh fitur unik yang disebut lintas kelima analisis, tanpa duplikasi:

1. Profil Klinik, Cabang & Terapis (STR, spesialisasi, sertifikasi)
2. Katalog Layanan & Estimasi Biaya
3. Indeks/Daftar Kondisi Medis per Area Tubuh (SEO)
4. Booking & Reservasi Online Real-time (termasuk pilih layanan/terapis/jadwal)
5. Integrasi WhatsApp & Live Chat (omnichannel)
6. Formulir Asesmen Awal / Skrining Online
7. Konfirmasi & Pengingat Otomatis (H-1)
8. Dashboard Admin dengan RBAC (Resepsionis/Terapis/Owner)
9. Kebijakan Pembatalan, Reschedule & Force Majeure
10. Rekam Medis Elektronik (EMR) & Portal Pasien
11. Pembayaran Digital (QRIS, VA, e-wallet, kartu)
12. Paket Terapi Multi-sesi & Voucher
13. Laporan & Statistik Bisnis untuk Owner
14. Keamanan Data (HTTPS, enkripsi, backup, log aktivitas)
15. Metode Terapi Modern & Showcase Teknologi/Alat Asesmen
16. Layanan Home Visit (tarif berbasis radius)
17. Alur Perawatan Pasien / Patient Journey ("What to Expect")
18. Asisten AI untuk Triase Awal (deteksi red-flag, smart-routing)
19. Telekonsultasi Berbayar (skema kredit ke sesi tatap muka)
20. Konten Edukasi, Video Latihan Mandiri (Home Exercise Program/HEP) & FAQ
21. Testimoni Pasien & Galeri Pemulihan
22. Personalised Treatment Plan & Outcome/Progress Tracking

---

## 3. Prinsip Diferensiasi (Anti-Duplikasi Kompetitor)

Instruksi eksplisit dari pemangku kepentingan adalah aplikasi **harus mengungguli kompetitor tanpa menirunya secara langsung**. Karena itu, setiap fitur pada Bagian 5 (Kebutuhan Fungsional) diberi label strategi implementasi berikut, bukan sekadar "ada/tidak ada":

| Label | Arti | Cara Diferensiasi yang Diwajibkan |
|---|---|---|
| 🔵 **Adopsi-Standar** | Fitur wajib ada karena sudah jadi ekspektasi pasar (mis. Booking Online, Profil Terapis) | Diimplementasikan dengan alur UX sendiri sesuai `DESIGN.md`, bukan mereplikasi tata letak/copywriting kompetitor manapun |
| 🟣 **Adopsi-Diperdalam** | Fitur ada di kompetitor tapi dangkal; aplikasi ini mengimplementasikan versi lebih lengkap | Contoh: Kondisi Medis bukan sekadar daftar (seperti AMPLab), tapi terhubung langsung ke smart-routing terapis & estimasi durasi pemulihan |
| 🟢 **Fitur Sintesis Baru** | Gabungan 2+ ide dari kompetitor berbeda yang belum pernah digabung siapa pun | Contoh: Skema kredit Telekonsultasi → sesi tatap muka (ide GPT/Deepseek) digabung dengan Smart-Routing AI (ide Sonnet 5) menjadi satu alur triase-ke-booking yang mulus |
| 🟠 **Fitur Native-PWA** | Fitur yang secara struktural tidak dimiliki kompetitor karena mereka bukan PWA | Push notification pengingat H-1 native tanpa app store, mode offline untuk melihat jadwal & program latihan tersimpan, "Add to Home Screen" |

**Aturan wajib bagi tim pengembang:** dilarang menyalin struktur navigasi, wording, atau tata letak halaman dari situs manapun yang disebut di Bagian 1.3. Setiap fitur "Adopsi-Standar" harus melalui proses desain ulang independen menggunakan `DESIGN.md` sebagai satu-satunya acuan visual.

---

## 4. Deskripsi Umum Sistem

### 4.1 Perspektif Produk
Sistem terdiri dari tiga permukaan (surface) dalam satu basis kode PWA:
1. **Public Web App** — diakses calon pasien/pasien tanpa login penuh (landing, katalog, kondisi medis, artikel)
2. **Patient Portal** — area login pasien (booking, EMR ringkas, program latihan, riwayat, telekonsultasi)
3. **Internal Dashboard** — area login staf (Resepsionis, Terapis, Owner/Admin) dengan RBAC

### 4.2 Karakteristik Pengguna
| Peran | Deskripsi | Contoh Kebutuhan Utama |
|---|---|---|
| Pasien Baru | Belum pernah booking, mencari kepercayaan & informasi | Katalog layanan, kondisi medis, testimoni, estimasi harga |
| Pasien Lama | Sudah terdaftar, aktif menjalani terapi | Riwayat kunjungan, program latihan, reschedule, progress tracking |
| Resepsionis | Mengelola jadwal harian & konfirmasi | Dashboard booking, konfirmasi pembayaran, data kontak pasien (bukan data medis penuh) |
| Terapis | Menangani sesi & mencatat perkembangan | Jadwal pribadi, EMR pasien yang ditangani, input progress/treatment plan |
| Owner/Admin | Mengelola bisnis & staf | Laporan & statistik, RBAC, manajemen layanan/harga/paket |

### 4.3 Batasan Umum
- Tidak boleh memberikan diagnosis medis otomatis (khusus fitur Asisten AI Triase — lihat FR-18)
- Estimasi harga wajib disertai disclaimer "harga final ditentukan setelah asesmen"
- Data medis pasien tunduk pada prinsip role-based access dan enkripsi (lihat NFR-Keamanan)
- Sebagai PWA, aplikasi harus tetap fungsional pada koneksi lambat/terputus untuk fitur yang sudah pernah dimuat (offline-first, lihat NFR-PWA)

---

## 5. Kebutuhan Fungsional (Functional Requirements)

Setiap requirement diberi kode `FR-xx`, label strategi diferensiasi dari Bagian 3, dan fase implementasi target.

### 5.1 Modul Kepercayaan & Informasi (Trust & Discovery)

**FR-01 — Profil Klinik, Cabang & Terapis** 🔵 *(Fase 1)*
- Sistem harus menampilkan halaman "Tentang Kami" dengan lokasi cabang terintegrasi peta.
- Sistem harus menampilkan profil tiap terapis: foto, nomor STR, spesialisasi, tahun pengalaman, sertifikasi tambahan (mis. dry needling).
- Sistem harus memvalidasi format nomor STR sebelum profil terapis dipublikasikan (validasi internal admin).

**FR-02 — Katalog Layanan & Estimasi Biaya** 🔵 *(Fase 1)*
- Sistem harus menampilkan daftar layanan dengan deskripsi, manfaat, durasi sesi, dan kontraindikasi (bila ada).
- Sistem harus menampilkan estimasi biaya dalam format rentang ("mulai dari Rp...") disertai disclaimer harga final pasca-asesmen.

**FR-03 — Indeks Kondisi Medis per Area Tubuh** 🟣 *(Fase 1)*
- Sistem harus menyediakan navigasi berbasis area tubuh (Leher, Bahu, Punggung, Lutut, Pergelangan Kaki, dll.) yang mengarah ke halaman kondisi spesifik (mis. Frozen Shoulder, Tennis Elbow, HNP, ACL Injury).
- Setiap halaman kondisi wajib memuat: gejala umum, penyebab, cara fisioterapi membantu, estimasi durasi pemulihan, dan CTA langsung ke booking layanan terkait — sebuah alur yang tidak ditemukan tergabung penuh di kompetitor manapun (diferensiasi dari kombinasi ide AMPLab + smart-routing).
- Halaman ini menjadi entry point SEO utama dan harus dapat diindeks mesin pencari (lihat NFR-PWA terkait SEO/SSR).

**FR-04 — Alur Perawatan Pasien (Patient Journey)** 🔵 *(Fase 1)*
- Sistem harus menampilkan visualisasi tahapan perawatan: Konsultasi & Asesmen → Diagnosis & Rencana → Pelaksanaan Terapi → Evaluasi & Penyesuaian → Program Mandiri → Discharge/Rujukan.

**FR-05 — Konten Edukasi, FAQ & Testimoni** 🔵 *(Fase 2–3)*
- Sistem harus menyediakan CMS internal untuk artikel edukasi dan video latihan mandiri.
- FAQ wajib mencakup minimal: kondisi yang ditangani, durasi terapi, kebutuhan rujukan dokter, tingkat nyeri saat terapi.
- Testimoni pasien (teks/video) wajib melalui persetujuan tertulis sebelum publikasi (field consent wajib di sistem admin).

### 5.2 Modul Reservasi & Operasional Inti

**FR-06 — Booking & Reservasi Online Real-time** 🔵 *(Fase 1)*
- Sistem harus memungkinkan pasien memilih layanan, terapis (opsional), tanggal, dan jam berdasarkan ketersediaan real-time (mencegah double-booking).
- Sistem harus mendukung dua mode layanan: In-Clinic dan Home Visit (dengan kalkulasi tarif berbasis radius lokasi — lihat FR-16).

**FR-07 — Formulir Asesmen Awal / Skrining Online** 🔵 *(Fase 1)*
- Sistem harus menyajikan kuesioner sebelum kedatangan: lokasi nyeri (idealnya via diagram tubuh interaktif), durasi keluhan, skala nyeri 1–10, riwayat cedera.
- Data asesmen awal otomatis tersambung ke EMR pasien (FR-10) agar terapis punya gambaran sebelum sesi pertama.

**FR-08 — Konfirmasi & Pengingat Otomatis** 🟠 *(Fase 1)*
- Sistem harus mengirim konfirmasi otomatis setelah booking berhasil dan pengingat H-1 melalui **push notification PWA** dan/atau WhatsApp.
- Untuk layanan Home Visit, pengingat dikirim H-2 mengingat kebutuhan persiapan logistik.

**FR-09 — Integrasi WhatsApp & Live Chat** 🔵 *(Fase 1)*
- Sistem harus menyediakan tombol akses cepat ke WhatsApp admin dari halaman manapun (floating action button) sesuai palet warna `secondary` pada `DESIGN.md`.

**FR-10 — Manajemen Pembatalan, Reschedule & Force Majeure** 🔵 *(Fase 1)*
- Sistem harus mengizinkan pasien membatalkan/reschedule mandiri dengan aturan otomatis: ≥24 jam = gratis; <24 jam tanpa keterangan medis = biaya admin; force majeure (dibuktikan surat rawat inap/IGD) = dana dikonversi jadi kredit berlaku 3–6 bulan.

**FR-11 — Dashboard Admin dengan RBAC** 🔵 *(Fase 1)*
- Sistem harus membatasi akses berdasarkan peran: Resepsionis (jadwal, data kontak, konfirmasi), Terapis (pasien yang ditangani + catatan klinis), Owner (akses penuh + log aktivitas seluruh pengguna).
- Setiap akses ke data medis wajib tercatat dalam log aktivitas (audit trail).

### 5.3 Modul Rekam Medis & Portal Pasien

**FR-12 — Rekam Medis Elektronik (EMR) & Portal Pasien** 🟣 *(Fase 2)*
- Sistem harus menyediakan EMR internal dengan opsi impor data pasien aktif dari Excel/CSV (bukan input manual massal) serta input on-demand saat pasien lama kembali berobat.
- Portal pasien harus menampilkan riwayat kunjungan dan hasil evaluasi.

**FR-13 — Personalised Treatment Plan** 🟣 *(Fase 2)*
- Sistem harus menyediakan halaman "Rencana Terapi Saya" berisi tujuan terapi, jumlah sesi, target mingguan, dan evaluasi perkembangan — disusun individual oleh terapis, bukan template generik per paket.

**FR-14 — Home Exercise Program (Program Latihan Mandiri)** 🔵 *(Fase 2)*
- Sistem harus menyajikan video/gambar latihan dengan jumlah repetisi dan checklist harian yang dapat dicentang pasien di portal.

**FR-15 — Outcome / Progress Tracking** 🟢 *(Fase 2–3)*
- Sistem harus mencatat metrik pemulihan sederhana yang dapat diinput terapis tanpa memerlukan alat mahal (skala nyeri, rentang gerak/ROM estimasi, jarak berjalan, keseimbangan) dan menampilkannya sebagai grafik progres di portal pasien.
- Ini adalah versi PWA-native, biaya-rendah dari konsep "Objective Assessment" milik klinik premium Singapura (ForceDecks/DynaMo) — **bukan replikasi alat mahal**, melainkan sintesis idenya ke bentuk input manual terstandardisasi.

### 5.4 Modul Layanan & Transaksi

**FR-16 — Layanan Home Visit** 🔵 *(Fase 1)*
- Sistem harus menghitung estimasi tarif berdasarkan radius dari cabang terdekat ke lokasi pasien saat proses booking.

**FR-17 — Paket Terapi & Voucher** 🔵 *(Fase 2)*
- Sistem harus mendukung paket multi-sesi dengan diskon bertingkat dan voucher waktu-terbatas.

**FR-18 — Pembayaran Digital** 🔵 *(Fase 2)*
- Sistem harus mengintegrasikan QRIS, transfer bank/virtual account, e-wallet, dan kartu kredit/debit melalui payment gateway.

**FR-19 — Laporan & Statistik Bisnis** 🔵 *(Fase 2)*
- Sistem harus menyajikan dashboard ringkas untuk owner: jumlah pasien baru vs lama, layanan terlaris, performa terapis, pendapatan per periode, tingkat no-show, konversi WA→booking.

### 5.5 Modul Diferensiasi Lanjutan

**FR-20 — Asisten AI untuk Triase Awal** 🟢 *(Fase 3)*
- Chatbot harus tersedia 24/7, dilarang keras memberikan diagnosis definitif (disclaimer wajib di setiap sesi chat).
- Sistem harus mendeteksi red-flag (mis. nyeri dada, kelumpuhan mendadak, kesulitan bernapas) dan mengarahkan pasien langsung ke instruksi IGD, bukan sekadar "hubungi terapis".
- Sistem harus melakukan smart-routing: mengarahkan pasien ke terapis dengan spesialisasi paling relevan berdasarkan hasil triase, langsung terhubung ke alur booking (FR-06) — penggabungan ide AI-triase (Halodoc) dengan smart-routing terapis, yang belum ada di kompetitor manapun secara utuh.
- Setiap eskalasi ke manusia wajib tercatat sebagai log audit.

**FR-21 — Telekonsultasi Berbayar** 🟢 *(Fase 3)*
- Sistem harus mendukung konsultasi chat/video dengan fisioterapis atau dokter Sp.KFR dengan tarif berjenjang.
- Biaya konsultasi dapat dikreditkan penuh ke sesi terapi tatap muka pertama jika booking dilakukan dalam batas waktu tertentu (mis. 7 hari) — skema konversi ini menjadi strategi retensi utama.

**FR-22 — Metode Terapi Modern & Showcase Teknologi** 🟣 *(Fase 3, opsional sesuai kapasitas klinik)*
- Sistem harus menyediakan halaman statis yang menjelaskan metode terapi (Clinical Pilates, Dry Needling, Sports Massage) dan alat asesmen yang benar-benar dimiliki klinik — **dilarang mencantumkan alat/teknologi yang tidak dimiliki** hanya demi meniru citra kompetitor premium.

---

## 6. Kebutuhan Non-Fungsional

### 6.1 Kebutuhan Spesifik PWA (NFR-PWA)
| Kode | Kebutuhan |
|---|---|
| NFR-PWA-01 | Aplikasi harus memiliki Web App Manifest valid (nama, ikon multi-resolusi, `theme_color` & `background_color` mengikuti token `primary` dan `surface` di `DESIGN.md`) agar dapat di-"Add to Home Screen". |
| NFR-PWA-02 | Aplikasi harus menggunakan Service Worker untuk caching shell aplikasi, halaman katalog layanan, dan halaman kondisi medis yang pernah dikunjungi, agar tetap dapat diakses saat offline/koneksi buruk. |
| NFR-PWA-03 | Booking yang dibuat saat offline harus disimpan sementara (queue) dan disinkronkan otomatis (Background Sync) begitu koneksi kembali tersedia — pasien diberi notifikasi status. |
| NFR-PWA-04 | Push Notification (via Web Push API) wajib digunakan untuk pengingat H-1, konfirmasi booking, dan update status telekonsultasi, tanpa bergantung pada WhatsApp sebagai satu-satunya kanal. |
| NFR-PWA-05 | Halaman publik (katalog layanan, kondisi medis, artikel) wajib dapat di-render sisi server atau pre-render (SSR/SSG) agar tetap terindeks mesin pencari — kelemahan umum PWA berbasis SPA murni. |
| NFR-PWA-06 | Aplikasi harus lulus audit Lighthouse PWA dengan skor Installability dan Performance minimal 90. |

### 6.2 Keamanan (NFR-Keamanan)
- Seluruh trafik wajib HTTPS/TLS.
- Data medis pasien wajib dienkripsi saat disimpan (AES-256 atau setara) dan saat transit.
- Backup otomatis harian ke penyimpanan cloud dengan retensi minimal 30 hari.
- Log aktivitas wajib mencatat: siapa mengakses, kapan, data apa yang diakses/diubah.
- Kepatuhan terhadap regulasi perlindungan data kesehatan yang berlaku di Indonesia.

### 6.3 Usabilitas
- Target pengguna mencakup lansia dan pasien dengan mobilitas terbatas — tap target minimal sesuai `rounded`/`spacing` token di `DESIGN.md`, kontras warna memenuhi WCAG AA.
- Label form selalu di atas field (bukan placeholder-only) sesuai spesifikasi `DESIGN.md` bagian Inputs & Forms.

### 6.4 Performa
- Waktu muat awal (First Contentful Paint) < 2.5 detik pada koneksi 4G.
- Sistem booking harus merespons konflik jadwal (double-booking) secara real-time (< 1 detik validasi).

### 6.5 Skalabilitas & Ketersediaan
- Arsitektur harus mendukung penambahan cabang baru tanpa perubahan struktural besar.
- Target uptime backend minimal 99.5%.

---

## 7. Peran Pengguna & Hak Akses (RBAC)

| Modul/Data | Pasien | Resepsionis | Terapis | Owner/Admin |
|---|---|---|---|---|
| Katalog, Kondisi Medis, Artikel | Baca | Baca | Baca | Kelola (CRUD) |
| Booking miliknya sendiri | Kelola | Kelola (semua pasien) | Baca (miliknya) | Kelola (semua) |
| Data kontak pasien | Kelola (miliknya) | Baca/Ubah | Baca (pasien ditangani) | Kelola (semua) |
| Rekam Medis (EMR) | Baca (miliknya, ringkas) | Tidak ada akses | Kelola (pasien ditangani) | Baca (semua, audit) |
| Program Latihan / Treatment Plan | Baca (miliknya) | Tidak ada akses | Kelola (pasien ditangani) | Baca (semua) |
| Pembayaran & Transaksi | Baca (miliknya) | Kelola | Tidak ada akses | Kelola (semua) |
| Laporan & Statistik Bisnis | Tidak ada akses | Tidak ada akses | Tidak ada akses | Kelola |
| Log Aktivitas Sistem | Tidak ada akses | Tidak ada akses | Tidak ada akses | Baca |

---

## 8. Model Data (Ringkasan Entitas)

Entitas inti yang wajib ada dalam skema basis data (detail atribut dirancang pada tahap desain database terpisah):

- **User** (peran: pasien/resepsionis/terapis/owner)
- **Clinic / Branch** (cabang, lokasi, koordinat peta)
- **Therapist** (relasi ke User, STR, spesialisasi, sertifikasi)
- **Service** (layanan, kategori, estimasi harga, durasi)
- **Condition** (kondisi medis, area tubuh, artikel terkait, layanan terkait)
- **Booking** (pasien, layanan, terapis, jadwal, mode In-Clinic/Home Visit, status)
- **Assessment** (hasil formulir asesmen awal, terhubung ke Booking & EMR)
- **MedicalRecord (EMR)** (riwayat kunjungan, catatan klinis, terhubung ke Patient & Therapist)
- **TreatmentPlan** (tujuan, target, evaluasi berkala, terhubung ke MedicalRecord)
- **ProgressLog** (skala nyeri, ROM, jarak berjalan — time-series untuk grafik progres)
- **ExerciseProgram** (video/gambar latihan, checklist harian)
- **Package/Voucher** (paket multi-sesi, diskon, masa berlaku)
- **Payment** (transaksi, metode, status)
- **Testimonial** (teks/video, status consent, status publikasi)
- **ChatbotSession** (log triase AI, red-flag terdeteksi, eskalasi)
- **TeleconsultSession** (jadwal, tarif, status kredit ke sesi tatap muka)
- **ActivityLog** (audit trail seluruh akses data sensitif)

---

## 9. Spesifikasi Desain UI/UX (Mengacu `DESIGN.md`)

Seluruh implementasi antarmuka **wajib** menggunakan design system "Clinical Serenity" yang telah ditetapkan di `DESIGN.md`, sebagai berikut (ringkasan; lihat file asli untuk token lengkap):

### 9.1 Arah Gaya
Corporate/Modern dengan basis "clinical white" dipadukan biru medis (`primary: #005A71`, `surface-tint/secondary: #006781`/`#006877`) untuk kesan otoritas medis sekaligus menenangkan. Sudut membulat level 2 (`rounded-lg` 16px untuk kartu layanan, `rounded-xl` 24px untuk hero/testimoni) dan bayangan lembut (blur 20px, opacity 5%, tint biru) menghindari kesan dingin/steril.

### 9.2 Tipografi
- **Manrope** (headline-lg 40px/700, headline-md 24px/600) untuk judul halaman & header layanan.
- **Inter** (body-lg 18px, body-md 16px) untuk seluruh informasi medis, artikel, dan data pasien — dipilih karena keterbacaan tinggi lintas usia.
- **JetBrains Mono** (label-sm 12px) khusus untuk data teknis: slot waktu booking, status "STR Verified", tag status.

### 9.3 Pemetaan Warna ke Fungsi
| Elemen | Token DESIGN.md |
|---|---|
| Tombol utama (Book Now, Submit Assessment) | `primary` solid, teks `on-primary` |
| Tombol sekunder (Learn More, View Schedule) | Ghost, border & teks `primary` |
| Tombol darurat (Go to ER — dari Asisten AI Triase FR-20) | `emergency-red` solid |
| Status "Confirmed" | `success-green` |
| Status "Pending" | `warning-amber` |
| Status "Cancelled" | Neutral slate (`outline-variant`) |
| Background section alternatif | `surface-muted` / `surface-container` |

### 9.4 Layout
Grid 12 kolom desktop (maks 1200px, auto-center), reflow ke 2 kolom di tablet dan stack vertikal penuh di mobile — krusial untuk kartu Terapis dan hasil pencarian Kondisi Medis (FR-03) agar tetap mudah dijangkau ibu jari pasien dengan mobilitas terbatas. Margin mobile tetap 20px demi ruang maksimal pada formulir asesmen (FR-07).

### 9.5 Komponen Kunci yang Wajib Dipetakan ke Fitur
- **Therapist Card** → digunakan di FR-01 (Profil Terapis) dan hasil smart-routing FR-20.
- **Service Card** (`surface-muted`, shadow saat hover) → digunakan di FR-02 dan FR-03.
- **Status Chips** → digunakan di dashboard booking (FR-06, FR-11) dan status pembayaran (FR-18).
- **Sticky Booking Summary bar (Level 2 elevation)** → digunakan sepanjang alur booking multi-step (FR-06).
- **Bottom-tab navigation mobile** ("Home", "My Bookings", "Education", "Profile") → menjadi navigasi utama Patient Portal (Bagian 4.1) pada PWA mode mobile/installed.

---

## 10. Roadmap Implementasi

| Fase | Fokus | Fitur (kode FR) |
|---|---|---|
| **Fase 1 — Fondasi Operasional & Kepercayaan** | Rilis MVP PWA yang installable, mengatasi masalah double-booking dan kepercayaan awal pasien | FR-01, FR-02, FR-03, FR-04, FR-06, FR-07, FR-08, FR-09, FR-10, FR-11, FR-16 |
| **Fase 2 — Penguatan Data, Transaksi & Engagement** | Retensi pasien melalui data terstruktur dan transaksi digital | FR-05, FR-12, FR-13, FR-14, FR-17, FR-18, FR-19 |
| **Fase 3 — Diferensiasi & Skalabilitas** | Fitur pembeda kompetitif jangka panjang | FR-15, FR-20, FR-21, FR-22 |

---

## 11. Matriks Fitur vs Kompetitor & Status Diferensiasi

Ringkasan hasil verifikasi silang lima analisis (rasio kemunculan di 8 situs referensi, telah dikoreksi dari kesalahan penandaan awal):

| Fitur (kode FR) | Rasio Situs (koreksi final) | Kategori | Strategi Aplikasi Ini |
|---|---|---|---|
| Katalog Layanan (FR-02) | 8/8 | Wajib | 🔵 Standar, desain ulang independen |
| Kondisi yang Ditangani (FR-03) | 8/8 (mendalam hanya di 2 situs SG) | Wajib + celah diferensiasi | 🟣 Diperdalam dengan smart-routing |
| Booking Online (FR-06) | 7–8/8 (sebagian hanya via WA manual) | Wajib | 🔵 Standar, real-time penuh (bukan manual) |
| Profil Terapis (FR-01) | 7/8 | Wajib | 🔵 Standar |
| WhatsApp/Contact (FR-09) | 6/8 | Wajib | 🔵 Standar, dilengkapi Push Notification (FR-08) sebagai kanal paralel |
| Artikel Edukasi & FAQ (FR-05) | 5–8/8 (bervariasi tergantung cakupan verifikasi) | Umum | 🔵 Standar |
| Testimoni (FR-05) | 3–6/8 | Umum | 🔵 Standar, wajib consent eksplisit |
| Home Visit (FR-16) | 4–5/8, dominan di kelompok Indonesia | Wajib untuk konteks lokal | 🔵 Standar |
| Estimasi Harga (FR-02) | 4/8, dominan di kelompok Indonesia | Wajib untuk konteks lokal | 🔵 Standar |
| Program Latihan Mandiri (FR-14) | 3–6/8, lebih matang di kelompok SG | Umum/berkembang | 🔵 Standar |
| Personalised Treatment Plan (FR-13) | 5/8 | Umum | 🟣 Diperdalam |
| Outcome/Progress Tracking (FR-15) | 2–4/8, dominan di kelompok premium SG | Diferensiasi | 🟢 Sintesis baru (versi biaya-rendah) |
| Teknologi Rehab / Alat Asesmen (FR-22) | 1–2/8 | Niche premium | 🟣 Opsional, hanya jika benar dimiliki klinik |
| Asisten AI Triase (FR-20) | 1/8 | Diferensiasi tinggi | 🟢 Sintesis baru (triase + smart-routing + booking) |
| Telekonsultasi (FR-21) | 3–4/8 | Diferensiasi menengah | 🟢 Skema kredit ke sesi tatap muka |

**Catatan validasi:** Sejumlah kesalahan penandaan awal (false negative) pada proses analisis dikoreksi sebelum masuk tabel final ini, antara lain: Booking Online, WhatsApp, Estimasi Harga, dan FAQ yang semula ditandai tidak tersedia di Mount Elizabeth Hospital; Profil Terapis dan Testimoni di IndoHomeCare; serta Artikel Edukasi di ProRehab dan Strength Clinic Academy. Beberapa sel data AMP Lab (Profil Terapis, Artikel Edukasi) dan Strength Clinic Academy (Testimoni) tidak dapat diverifikasi penuh karena keterbatasan halaman yang diakses saat riset — tim pengembang disarankan melakukan verifikasi lapangan ulang sebelum keputusan fitur final jika presisi data ini krusial.

**Kriteria "Fitur Unggulan" final** (memenuhi ≥2 dari 3 syarat berikut): (1) dominan di kelompok situs Indonesia yang skala bisnisnya sebanding, (2) disebutkan eksplisit dalam dokumen wawancara 4 owner klinik, (3) rasio kemunculan gabungan ≥5 dari 8 situs referensi.

---

## 12. Lampiran

### 12.1 Referensi Situs yang Dianalisis
**Indonesia:** IndoHomeCare, Halodoc (Fisioterapi & Rehabilitasi), NK Health, Fisiohome.
**Singapura:** ProRehab, AMP Lab, Strength Clinic Academy, Mount Elizabeth Hospital.

### 12.2 Dokumen Sumber
- `Analisis_Kebutuhan_Klinik_Fisioterapi.pdf` — hasil wawancara 4 owner klinik fisioterapi (26 poin kebutuhan)
- Lima laporan analisis komparatif fitur: Deepseek (Instant/DeepThink/Search), Gemini Notebook, Gemini Pro, GPT, Sonnet 5
- `DESIGN.md` — Design System "Clinical Serenity"

### 12.3 Riwayat Dokumen
| Versi | Tanggal | Perubahan |
|---|---|---|
| 1.0 | 10 Agustus 2026 | Penyusunan awal — sintesis 5 analisis komparatif + spesifikasi PWA + integrasi DESIGN.md |

---
*Dokumen ini merupakan spesifikasi kebutuhan tingkat tinggi (SRS). Detail teknis lanjutan (skema database penuh, API contract, wireframe per layar) disusun pada dokumen turunan terpisah.*

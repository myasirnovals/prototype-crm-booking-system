# **DOKUMEN ANALISIS KEBUTUHAN SISTEM** 

Website & Sistem Digitalisasi Klinik Fisioterapi 

# **1. Pemetaan Kebutuhan** 

Empat sesi wawancara dilakukan dengan owner klinik fisioterapi pra-digital (persona: Owner “Deepseek Expert”, Owner “Gemini Pro”, Owner “GPT”, dan Owner “Sonnet 5”) untuk menggali kebutuhan digitalisasi layanan melalui website. Meskipun disampaikan dengan gaya dan penekanan berbeda, keempat jawaban menunjukkan pola kebutuhan yang konsisten, dikelompokkan sebagai berikut: 

- Fondasi kepercayaan: profil klinik, profil terapis (kredensial/STR), informasi cabang. 

- Operasional inti: booking online real-time, konfirmasi & pengingat otomatis, reschedule/cancel, integrasi WhatsApp. 

- ● Data pasien: formulir asesmen awal, rekam medis elektronik (EMR), migrasi data bertahap dari arsip kertas. 

- Transaksi: katalog layanan dengan kisaran harga, pembayaran digital, paket terapi & voucher. 

- Engagement & marketing: artikel edukasi, video latihan mandiri, FAQ, testimoni, SEO lokal. 

- Manajemen internal: dashboard admin dengan role-based access, laporan/statistik, keamanan data (enkripsi, backup, log aktivitas). 

- Asisten AI: triase awal keluhan, deteksi kondisi darurat (red flag), smart-routing ke terapis, dengan batasan tegas tidak boleh mendiagnosis. 

- Model bisnis konsultasi digital: kebijakan biaya chat/konsultasi dengan tenaga profesional, skema kredit ke biaya terapi, serta kebijakan pembatalan/refund untuk kasus darurat medis. 

Perbedaan utama antar-owner terletak pada: (a) apakah chat lanjutan dengan terapis/dokter setelah AI bersifat berbayar atau digratiskan sebagai “pintu masuk” konversi ke terapi fisik, dan (b) seberapa cepat fitur-fitur lanjutan (AI, pembayaran online, login pasien) diimplementasikan — tiga owner cenderung menyertakan AI Assistant dan konsultasi berbayar sejak awal, sedangkan satu owner (Sonnet 5) mengusulkan pendekatan bertahap (Fase 1–3) dengan AI Assistant baru masuk di Fase 3. 

# **2. Referensi dan Adopsi** 

Untuk memvalidasi kebutuhan di atas, dilakukan peninjauan terhadap situs referensi yang relevan dengan model bisnis fisioterapi digital di Indonesia: 

- Fisiohome (fisiohome.id) — platform fisioterapi home-visit #1 di Indonesia. Referensi utama untuk: alur booking 3 tahap (konsultasi WA gratis → konfirmasi jadwal & terapis → pembayaran), paket kunjungan berjenjang (Visit Sekarang/Executive/Suite/Luxury/Royal Family), integrasi WhatsApp & telepon gratis 24 jam, testimoni pasien publik figur, artikel “Pulih Bersama Kami”, FAQ transparan (termasuk tarif mulai Rp199.000/kunjungan), serta pembayaran non-tunai (QRIS, transfer, e-wallet, kartu). 

- NK Health – Fisioterapi Online (nkhealth.fit) — referensi untuk model konsultasi/fisioterapi online sebagai pelengkap layanan tatap muka. 

- Halodoc — Fisioterapi dan Rehabilitasi (halodoc.com) — referensi konsep asisten AI “Hilda” untuk triase awal, serta struktur biaya konsultasi chat dengan dokter spesialis (Sp.KFR), yang di lapangan dimulai dari kisaran Rp49.000 per sesi chat — digunakan sebagai acuan tarif telekonsultasi, bukan untuk ditiru penuh mengingat skala klinik jauh lebih kecil dari platform telemedicine nasional. 

- Indohomecare (indohomecare.co.id) — referensi untuk model layanan fisioterapi berbasis kunjungan rumah (homecare) sebagai pembanding tarif dan cakupan wilayah layanan. 

Referensi-referensi ini diadopsi secara selektif — bukan ditiru mentah-mentah — disesuaikan dengan skala klinik kecil-menengah, sebagaimana ditekankan oleh keempat owner. 

# **3. Tabel Pemetaan Kebutuhan, Adopsi, dan Referensi** 

|**No**|**Kebutuhan**|**Adopsi**|**Referensi Website**|**Keterangan**|
|---|---|---|---|---|
|1|Profil klinik,<br>cabang, & profil<br>terapis<br>(kredensial/STR,<br>spesialisasi, foto)|Diadopsi penuh.<br>Halaman "Tentang<br>Kami", daftar cabang<br>+ Google Maps, dan<br>kartu profil<br>per-terapis lengkap<br>dengan sertifikasi.|Fisiohome<br>(fisiohome.id/tim-kami<br>,<br>fisiohome.id/tentang-k<br>ami)|Disepakati oleh<br>keempat owner<br>sebagai fondasi<br>kepercayaan pasien;<br>prioritas Fase 1<br>(tinggi).|
|2|Katalog layanan<br>fisioterapi<br>(olahraga, stroke,<br>geriatri, anak,<br>muskuloskeletal,<br>dll.) beserta<br>deskripsi kondisi<br>yang ditangani|Diadopsi. Setiap<br>layanan diberi<br>halaman detail:<br>prosedur, durasi,<br>manfaat,<br>indikasi/kontraindika<br>si.|Fisiohome<br>(fisiohome.id/layanan-<br>kami), Halodoc<br>kategori Fisioterapi &<br>Rehabilitasi|Semua owner sepakat;<br>bahasa harus awam<br>agar mudah dipahami<br>calon pasien.|
|3|Estimasi<br>biaya/tarif<br>layanan|Diadopsi sebagian —<br>ditampilkan sebagai<br>"kisaran harga" atau<br>"mulai dari Rp",<br>bukan nominal pasti<br>per kasus.|Fisiohome ("mulai dari<br>Rp199.000/kunjungan"<br>pada FAQ)|Owner Gemini secara<br>eksplisit meminta<br>harga tidak dipatok<br>pasti karena tarif<br>tergantung hasil<br>asesmen; owner lain<br>setuju kisaran harga<br>tetap perlu<br>ditampilkan untuk<br>transparansi.|
|4|Booking/reservasi<br>online real-time<br>(pilih layanan,<br>terapis, tanggal &<br>jam)|Diadopsi penuh<br>sebagai fitur inti<br>(prioritas #1 di semua<br>jawaban).|Fisiohome<br>(booking.fisiohome.id)<br>, NK Health<br>(nkhealth.fit fisioterapi<br>online)|Disebut sebagai<br>kebutuhan paling<br>mendesak oleh semua<br>owner — mengatasi<br>masalah<br>double-booking &<br>beban resepsionis<br>pada kondisi<br>non-digital.|



|5|Konfirmasi<br>otomatis &<br>pengingat jadwal<br>(H-1) via<br>WhatsApp/email<br>untuk menekan<br>no-show|Diadopsi penuh.|Fisiohome (integrasi<br>WhatsApp untuk<br>konfirmasi visit)|Konsisten muncul di<br>keempat jawaban<br>sebagai solusi masalah<br>no-show dan<br>miskomunikasi jadwal<br>manual.|
|---|---|---|---|---|
|6|Reschedule &<br>pembatalan<br>mandiri oleh<br>pasien|Diadopsi.|Fisiohome (alur<br>booking 3 tahap:<br>konsultasi →<br>konfirmasi →<br>booking)|Fitur pelengkap<br>booking online,<br>disepakati semua<br>owner sebagai<br>prioritas Fase 1.|
|7|Integrasi<br>WhatsApp / live<br>chat dengan<br>admin|Diadopsi penuh<br>sebagai kanal<br>komunikasi utama<br>(bukan pengganti,<br>tapi pelengkap<br>booking online).|Fisiohome (tombol<br>WA "Konsultasi Gratis<br>via WhatsApp",<br>telepon gratis 24 jam)|Wajib menurut semua<br>owner karena pasien<br>Indonesia terbiasa<br>memakai WhatsApp<br>dibanding<br>telepon/formulir.|
|8|Formulir<br>asesmen/skrining<br>awal & registrasi<br>pasien baru<br>online|Diadopsi —<br>kuesioner singkat<br>(lokasi nyeri, durasi,<br>skala nyeri 1–10,<br>riwayat) sebelum<br>kedatangan.|Fisiohome (formulir<br>pendaftaran pasien<br>pada Tahap 1 booking)|Tujuannya sama di<br>semua jawaban:<br>mempercepat sesi<br>karena terapis sudah<br>punya gambaran awal.|
|9|Rekam medis<br>elektronik (EMR)<br>& migrasi data<br>pasien lama|Diadopsi bertahap —<br>bukan input manual<br>massal, tapi impor<br>Excel/CSV untuk<br>data aktif, input<br>on-demand saat<br>pasien lama kembali<br>berobat, dan fitur<br>upload scan/PDF<br>arsip lama.|– (praktik umum<br>sistem klinik digital,<br>tidak ada satu referensi<br>tunggal)|Solusi ini spesifik<br>muncul pada dialog<br>owner Sonnet 5<br>sebagai jawaban atas<br>kekhawatiran biaya<br>migrasi data kertas;<br>direkomendasikan<br>untuk diadopsi di<br>semua rencana karena<br>efisien dan rendah<br>risiko.|
|10|Portal/login<br>pasien: riwayat<br>kunjungan &<br>program latihan<br>mandiri (home<br>exercise program)|Diadopsi sebagai<br>fitur Fase 2 — pasien<br>dapat melihat histori<br>terapi dan menerima<br>video/gambar latihan<br>menggantikan lembar<br>kertas.|Fisiohome (artikel<br>edukasi "Pulih<br>Bersama Kami" berisi<br>progres pasien)|Owner Sonnet 5<br>menandai fitur ini<br>"bagus tapi bukan<br>prioritas awal" karena<br>staf klinik belum<br>terbiasa input data<br>digital — didorong ke<br>fase lanjutan.|



|11|Pembayaran<br>digital (QRIS,<br>transfer bank,<br>e-wallet, kartu,<br>payment<br>gateway)|Diadopsi bertahap —<br>Fase 2, karena selama<br>ini pasien terbiasa<br>bayar tunai/transfer<br>manual di tempat.|Fisiohome<br>("Pembayaran Non<br>Tunai & Elektronik" –<br>QRIS, transfer,<br>e-wallet, kartu)|Semua owner ingin<br>fitur ini ada, namun<br>owner Sonnet 5 secara<br>spesifik meminta<br>penundaan ke Fase 2<br>karena biaya integrasi<br>& rekonsiliasi<br>keuangan belum siap.|
|---|---|---|---|---|
|12|Artikel edukasi,<br>video latihan, dan<br>FAQ|Diadopsi sebagai<br>konten SEO &<br>edukasi pasien,<br>prioritas menengah<br>(Fase 2–3).|Fisiohome<br>(fisiohome.id/artikel,<br>halaman FAQ),<br>Halodoc (artikel<br>"Fisioterapi")|Disepakati semua<br>owner untuk<br>membangun otoritas<br>& SEO, tetapi<br>produksi video butuh<br>sumber daya sehingga<br>didorong ke fase<br>belakangan.|
|13|Testimoni/ulasan<br>pasien|Diadopsi — teks atau<br>video singkat<br>(dengan izin pasien).|Fisiohome (galeri<br>testimoni pasien &<br>publik figur di<br>beranda)|Disepakati semua<br>owner untuk<br>membangun<br>kepercayaan calon<br>pasien baru.|
|14|Promo, paket<br>terapi (5/10 sesi),<br>dan voucher|Diadopsi — paket<br>multi-sesi dengan<br>diskon, serta voucher<br>berbatas waktu.|Fisiohome (paket<br>"Visit<br>Executive/Suite/Luxur<br>y/Royal Family",<br>promo kolaboratif)|Muncul di semua<br>jawaban; owner<br>Sonnet 5 menandai ini<br>butuh kesiapan<br>kebijakan bisnis,<br>bukan hanya teknis,<br>sehingga masuk Fase<br>2.|
|15|Dashboard admin<br>dengan<br>role-based access<br>control<br>(resepsionis,<br>terapis, super<br>admin/owner)|Diadopsi penuh —<br>resepsionis hanya<br>akses jadwal &<br>pendaftaran, terapis<br>akses data pasien<br>yang ditangani,<br>owner akses penuh<br>(super admin) dengan<br>log aktivitas tercatat<br>termasuk aksesnya<br>sendiri.|– (praktik standar<br>sistem informasi klinik<br>/ EMR)|Poin ini paling detail<br>dibahas pada dialog<br>owner Sonnet 5;<br>disepakati sebagai<br>kebutuhan lintas-fase<br>demi akuntabilitas &<br>privasi data pasien.|
|16|Laporan/statistik<br>(jumlah pasien,<br>layanan terlaris,|Diadopsi —<br>dashboard ringkas<br>untuk owner yang|– (fitur analitik umum<br>sistem booking/klinik)|Kebutuhan bisnis<br>eksplisit dari owner<br>Sonnet 5; prioritas|



||performa terapis,<br>pendapatan)|"buta data" akibat<br>pencatatan manual.||Fase 2 karena perlu<br>adaptasi staf terlebih<br>dahulu.|
|---|---|---|---|---|
|17|Keamanan data:<br>HTTPS/enkripsi,<br>backup otomatis<br>harian, log<br>aktivitas|Diadopsi penuh<br>sebagai kebutuhan<br>non-negotiable<br>karena menyangkut<br>data kesehatan.|– (praktik keamanan<br>standar layanan<br>kesehatan digital)|Disebut oleh seluruh<br>owner sebagai syarat<br>kepatuhan &<br>kepercayaan pasien;<br>berlaku di semua fase.|
|18|SEO lokal &<br>pendaftaran<br>Google Business<br>Profile|Diadopsi agar klinik<br>muncul saat pasien<br>mencari "fisioterapi<br>terdekat/[nama<br>kota]".|Fisiohome &<br>Indohomecare<br>(keduanya terindeks<br>baik untuk pencarian<br>"fisioterapi")|Disebut eksplisit oleh<br>owner Deepseek<br>Expert dan owner<br>Sonnet 5 (klinik<br>kompetitor sudah<br>muncul di Google,<br>klinik sendiri belum).|
|19|Asisten AI<br>(chatbot) untuk<br>triase awal, FAQ<br>24/7, dan<br>smart-routing ke<br>terapis sesuai<br>keluhan|Diadopsi dengan<br>batasan ketat: tidak<br>boleh mendiagnosis,<br>wajib mendeteksi<br>red-flag (nyeri dada,<br>kelumpuhan<br>mendadak, dll.) dan<br>langsung<br>mengarahkan ke IGD<br>untuk kasus gawat<br>darurat (bukan<br>sekadar "hubungi<br>terapis"), disertai<br>disclaimer & log<br>audit setiap eskalasi.|Halodoc – asisten<br>"Hilda" sebagai acuan<br>konsep triase;<br>Fisiohome – layanan<br>WA 24 jam sebagai<br>versi sederhana|Tiga dari empat owner<br>mendukung fitur ini di<br>Fase 3 (setelah fondasi<br>data pasien kuat);<br>owner Sonnet 5 secara<br>khusus meminta<br>pemisahan level<br>"butuh terapis" vs<br>"kegawatdaruratan<br>medis" agar respons<br>darurat lebih tegas.|
|20|Telekonsultasi<br>berbayar dengan<br>fisioterapis/dokter<br>spesialis<br>(Sp.KFR) setelah<br>triase AI|Diadopsi sebagai opsi<br>lanjutan (bukan wajib<br>di semua model) —<br>chat 15–30 menit<br>dengan tarif tiering:<br>fisioterapis lebih<br>murah, dokter<br>Sp.KFR lebih mahal.|Halodoc – chat dokter<br>Sp.KFR mulai<br>Rp49.000 (contoh: dr.<br>C. Arina Sp.KFR)|Tiga owner<br>(Deepseek, Gemini<br>Pro, GPT) sepakat<br>berbayar (kisaran<br>Rp35.000–Rp250.000<br>tergantung tingkatan);<br>owner Sonnet 5 justru<br>memilih<br>menggratiskan chat<br>pra-kunjungan agar<br>tidak menghambat<br>konversi ke sesi fisik<br>— opsi berbayar<br>didorong ke fase|



|||||ekspansi terpisah<br>dengan izin telemedis.|
|---|---|---|---|---|
|21|Skema<br>kredit/potongan<br>biaya konsultasi<br>terhadap biaya<br>terapi lanjutan<br>(in-clinic atau<br>home visit)|Diadopsi bagi model<br>yang menerapkan<br>konsultasi berbayar<br>— 100% biaya<br>konsultasi<br>dipotongkan/dikredit<br>kan ke tagihan terapi<br>pertama bila booking<br>dilakukan dalam 7<br>hari.|– (skema<br>loyalitas/voucher,<br>bukan fitur baku di<br>situs referensi)|Konsisten di tiga<br>jawaban (Deepseek,<br>Gemini Pro, GPT)<br>sebagai strategi<br>"win-win" agar pasien<br>tidak merasa<br>membayar dua kali;<br>tidak relevan pada<br>model Sonnet 5<br>karena chat<br>pra-kunjungan sudah<br>gratis.|
|22|Layanan terapi di<br>klinik (in-clinic)<br>dengan harga per<br>sesi & paket<br>multi-sesi|Diadopsi — daftar<br>sesi (manual,<br>modalitas<br>TENS/Ultrasound)<br>dengan estimasi<br>Rp150.000–Rp350.0<br>00/sesi dan paket<br>5/10 sesi berdiskon.|Fisiohome (paket Visit<br>Sekarang/Executive/Su<br>ite/Luxury)|Konsisten di seluruh<br>jawaban sebagai<br>layanan inti<br>pendapatan klinik.|
|23|Layanan home<br>visit (kunjungan<br>fisioterapi ke<br>rumah) dengan<br>tarif berbasis<br>radius|Diadopsi — harga<br>lebih tinggi dari<br>in-clinic karena<br>mencakup<br>transportasi &<br>peralatan portabel.|Fisiohome (layanan<br>home-visit inti, tarif<br>mulai<br>Rp199.000/kunjungan)<br>, Indohomecare<br>(layanan homecare<br>fisioterapi)|Disebut di tiga dari<br>empat jawaban<br>sebagai opsi setara<br>dengan terapi di<br>klinik, terutama untuk<br>pasien<br>lansia/keterbatasan<br>mobilitas.|
|24|Kebijakan<br>pembatalan/resch<br>edule & refund<br>untuk kondisi<br>non-darurat|Diadopsi — jendela<br>waktu pembatalan<br>(mis. ≥24 jam =<br>refund<br>penuh/reschedule<br>gratis; <24 jam tanpa<br>alasan = biaya<br>admin/pemotongan<br>sebagian).|– (kebijakan bisnis,<br>umum pada layanan<br>reservasi berbayar)|Seluruh owner sepakat<br>perlu aturan jelas<br>dituliskan di halaman<br>Syarat & Ketentuan<br>agar tidak ada<br>kesalahpahaman<br>pasien.|



|25|Kebijakan darurat<br>medis (force<br>majeure) hari-H:<br>pasien dilarikan<br>ke rumah sakit|Diadopsi sebagai<br>kebijakan berbasis<br>bukti (surat rawat<br>inap/IGD) dengan<br>pendekatan<br>manusiawi: dana<br>terapi (bukan biaya<br>konsultasi)<br>dikonversi menjadi<br>kredit/voucher yang<br>diperpanjang 3–6<br>bulan, atau refund<br>bersyarat setelah<br>verifikasi; sistem<br>menyediakan field<br>"alasan pembatalan"<br>dan keputusan tetap<br>oleh admin manusia<br>(bukan otomatis).|– (kebijakan customer<br>care, bukan fitur teknis<br>dari referensi situs)|Empat owner<br>memiliki nuansa<br>berbeda (refund 50%,<br>kredit penuh, atau<br>transfer ke anggota<br>keluarga), namun<br>semuanya sepakat:<br>biaya konsultasi/jasa<br>yang sudah diberikan<br>tidak dikembalikan,<br>sedangkan dana terapi<br>yang belum terpakai<br>diberi kelonggaran<br>dengan bukti medis.|
|---|---|---|---|---|
|26|Pendekatan<br>pengembangan<br>bertahap (Fase 1<br>– dasar<br>operasional, Fase<br>2 – data &<br>pembayaran, Fase<br>3 – AI & konten<br>edukasi)|Diadopsi sebagai<br>metodologi proyek,<br>bukan fitur produk.|–|Disarikan dari dialog<br>owner Sonnet 5 yang<br>paling eksplisit<br>membahas fase;<br>direkomendasikan<br>sebagai kerangka<br>roadmap keseluruhan<br>proyek untuk seluruh<br>kebutuhan pada tabel<br>ini.|



# **Catatan Penutup** 

Rekomendasi implementasi mengikuti kerangka bertahap: 

- Fase 1 berfokus pada fondasi operasional (profil, booking, WhatsApp, dashboard admin dasar); 

- Fase 2 pada penguatan data & transaksi (EMR/login pasien, pembayaran online, laporan, promo); dan 

- Fase 3 pada diferensiasi layanan (AI Assistant dengan batasan medis-legal yang ketat, konten edukasi, serta opsi telekonsultasi berbayar bila klinik siap secara regulasi dan operasional). 


import { tenantId, currentTenant, DEFAULT_TENANTS } from '../models/Tenant.js';
import { SERVICES, THERAPISTS, getSharedData, syncServices, syncTherapists } from '../models/Database.js';
import { DEFAULT_STATE, state, loadState, saveState } from '../models/State.js';

// 1.5 TRANSLATIONS DICTIONARY (ENGLISH & BAHASA MELAYU)
export const TRANSLATIONS = {
    en: {
        // Nav & General Buttons
        nav_home: "Home",
        nav_service: "Service",
        nav_blog: "Blog",
        btn_book_now: "Book Now",
        nav_profile: "Profile",
        btn_sign_out: "Sign Out",
        btn_sign_in: "Sign In",
        nav_contact: "Contact",

        // About Page
        nav_about: "About",
        about_tag: "Our Story",
        about_title: "Serenity & Soul Sanctuary",
        about_desc: "Established in 2024, Serenity & Soul Sanctuary was born from a simple belief: that everyone deserves a moment of absolute peace. Our sanctuary is a haven in the bustling city, designed to harmonize your body, mind, and spirit through holistic treatments and expert care.",
        about_team_title: "Meet Our Therapists",

        // Contact Page
        contact_tag: "GET IN TOUCH",
        contact_title: "We'd Love to Hear From You",
        contact_desc: "Whether you have a question about treatments, bookings, or anything else, our team is ready to answer all your questions.",

        btn_register: "Register",
        btn_back: "Back",
        btn_continue: "Continue",
        btn_confirm: "Confirm Reservation",
        btn_use_package: "Use Package",
        btn_topup: "Top Up Now",
        btn_reschedule: "Reschedule",
        btn_cancel: "Cancel",
        btn_view_qr: "View QR",
        hero_title: "Find Your Inner Peace",
        hero_subtitle: "Unwind and restore your balance through our exclusive spa treatments designed for ultimate tranquility.",
        footer_rights: "© 2024 Serenity & Soul. All Rights Reserved.",

        // Why Choose Us Section
        why_choose_us_title: "Why Choose Us?",
        why_choose_us_feat1_title: "Expert Therapists",
        why_choose_us_feat1_desc: "Our professional team is trained to provide a healing touch that personalizes every session.",
        why_choose_us_feat2_title: "Natural Products",
        why_choose_us_feat2_desc: "We only use high-quality organic ingredients that are friendly to the skin and the environment.",
        why_choose_us_feat3_title: "Serene Atmosphere",
        why_choose_us_feat3_desc: "Our minimalist interior design creates an oasis of peace amidst the hustle and bustle of the city.",

        // Headers & Stepper Titles
        step1_title: "Select Service (Step 1)",
        step1_subtitle: "Discover the perfect treatment for your needs.",
        step2_title: "Select Your Therapist",
        step2_subtitle: "Choose from our experienced practitioners for your deeply relaxing session.",
        step3_title: "New Reservation",
        step3_subtitle: "Follow the steps below to schedule your appointment.",
        step4_title: "Review & Confirm",
        step4_subtitle: "Please review your reservation details below before finalizing your booking.",
        guest_info_title: "Guest Information",
        payment_method_title: "Payment Method",
        booking_summary_title: "Booking Summary",
        lbl_service: "SERVICE",
        lbl_therapist: "THERAPIST",
        lbl_date_time: "DATE & TIME",
        lbl_subtotal: "Subtotal",
        lbl_tax: "Tax (7%)",
        lbl_total: "Total",
        lbl_est_total: "Estimated Total",

        // Success View
        success_title: "Your Tranquil Journey is Confirmed!",
        success_subtitle: "We look forward to welcoming you to your sanctuary of peace. Your reservation details are below.",
        prep_tips_title: "Preparation Tips",
        tip1_title: "Arrive Early",
        tip1_desc: "Please arrive 15 minutes before your treatment to complete intake and unwind.",
        tip2_title: "Stay Hydrated",
        tip2_desc: "Drink plenty of water before and after your deep tissue session.",
        tip3_title: "Unplug",
        tip3_desc: "We encourage silencing your devices to fully immerse in the experience.",
        btn_return_home: "Return to Home",

        // Profile & Wallet Views
        welcome_back: "Welcome Back",
        wallet_balance_title: "Available Balance",
        btn_manage_wallet: "Manage Wallet",
        btn_history: "History",
        perk_title: "Membership Perk",
        perk_desc: "You're earning 5% Soul Points on every top-up this month.",
        settings_title: "Account Settings",
        setting_personal: "Personal Details",
        setting_history: "Booking History",
        setting_notifications: "Notifications",
        setting_privacy: "Privacy & Security",
        next_appointment_title: "Next Appointment",
        no_upcoming_appts: "No upcoming appointments",
        appt_book_today: "Book your next relaxing session today.",
        btn_book_now_arrow: "Book Now &rarr;",
        wallet_header_title: "Wallet & Transactions",
        wallet_header_subtitle: "Manage your Serenity & Soul spa credits and view payment history.",
        quick_recharge_title: "Quick Recharge",
        quick_recharge_subtitle: "Select a preset amount to instantly add to your wellness wallet.",
        popular_badge: "Popular",
        topup_title: "Top-Up Your Sanctuary Wallet",
        topup_subtitle: "Add funds securely for seamless bookings and exclusive spa treatments.",
        btn_back_to_wallet: "Back to Wallet",

        // Booking History
        tab_upcoming: "Upcoming Appointments",
        tab_past: "Past & Cancelled",
        status_confirmed: "Confirmed",
        status_completed: "Completed",
        status_cancelled: "Cancelled",
        no_history_found: "No appointments found.",
        btn_explore_services: "Explore Services",
        lbl_therapist_strong: "Therapist:",

        // Login Modal
        login_modal_title: "Sign In to Your Sanctuary",
        login_modal_subtitle: "Access your digital wallet, view booking history, and manage appointments.",
        placeholder_email: "Email Address",
        placeholder_password: "Password",
        no_account_lbl: "Don't have an account?",
        btn_sign_in_now: "Sign In",

        // Active Packages Widget
        active_packages_widget_title: "Your Active Packages",
        remaining_quota_lbl: "Remaining quota:",
        lbl_sessions: "sessions",
        of_lbl: "of",

        // Service Catalog Tabs
        cat_all: "All",
        cat_signature: "Signature",
        cat_massage: "Massage",
        cat_facial: "Facial",
        cat_body: "Body Treatments",
        cat_packages: "Packages",

        // About Us Section
        about_tag: "Our Sanctuary Story",
        about_title: "Harmonizing Body, Mind, & Soul Through Natural Healing",
        about_desc: "Founded with a deep commitment to holistic wellness, Serenity & Soul is more than a spa—it is a sacred retreat designed to restore equilibrium to your daily life. We blend ancient Eastern touch therapies with pure organic botanical formulations to provide a transformative sensory experience.",
        about_vision_title: "Our Vision",
        about_vision_desc: "To be the region's leading eco-conscious holistic sanctuary, empowering individuals to cultivate lifelong physical vitality and mental tranquility.",
        about_mission_title: "Our Mission",
        about_mission_desc: "Delivering tailored, ethical therapeutic treatments with certified practitioners, sustainable organic oils, and uncompromised personal care.",

        // Blog Section
        blog_subtitle: "Insights & Inspiration",
        blog_title: "Sanctuary Wellness Journal",
        blog_desc: "Explore expert insights on stress relief, holistic therapies, aftercare advice, and mindful living routines curated by our master practitioners.",

        // Awards Section
        awards_tag: "Excellence & Recognition",
        awards_title: "Award-Winning Spa Sanctuary",
        awards_desc: "We are humbled to be recognized by leading wellness organizations for our commitment to holistic healing and exceptional service.",

        // Testimonials Section
        testimonials_tag: "Guest Experiences",
        testimonials_title: "Loved & Trusted by Over 1,200+ Guests",
        testimonials_desc: "Discover how our certified practitioners bring pure relaxation, stress relief, and holistic healing to life."
    },
    ms: {
        // Nav & General Buttons
        nav_home: "Laman Utama",
        nav_service: "Perkhidmatan",
        nav_blog: "Blog",
        btn_book_now: "Tempah Sekarang",
        nav_profile: "Profil",
        btn_sign_out: "Log Keluar",
        btn_sign_in: "Log Masuk",
        nav_contact: "Kontak",

        // About Page
        nav_about: "Tentang Kami",
        about_tag: "Kisah Kami",
        about_title: "Serenity & Soul Sanctuary",
        about_desc: "Didirikan pada tahun 2024, Serenity & Soul Sanctuary lahir dari sebuah keyakinan sederhana: bahwa setiap orang berhak mendapatkan momen kedamaian mutlak. Tempat kami adalah surga di tengah kota yang sibuk, dirancang untuk menyelaraskan tubuh, pikiran, dan jiwa Anda melalui perawatan holistik dan penanganan ahli.",
        about_team_title: "Temui Terapis Kami",

        // Contact Page
        contact_tag: "HUBUNGI KAMI",
        contact_title: "Kami Ingin Mendengar Dari Anda",
        contact_desc: "Baik Anda memiliki pertanyaan tentang perawatan, pemesanan, atau hal lainnya, tim kami siap menjawab semua pertanyaan Anda.",

        btn_register: "Daftar",
        btn_back: "Kembali",
        btn_continue: "Teruskan",
        btn_confirm: "Sahkan Tempahan",
        btn_use_package: "Guna Pakej",
        btn_topup: "Tambah Nilai",
        btn_reschedule: "Jadual Semula",
        btn_cancel: "Batal",
        btn_view_qr: "Lihat QR",
        hero_title: "Cari Ketenangan Jiwa Anda",
        hero_subtitle: "Berehat dan pulihkan keseimbangan anda melalui rawatan spa eksklusif kami yang direka untuk ketenangan mutlak.",
        footer_rights: "© 2024 Serenity & Soul. Hak Cipta Terpelihara.",

        // Why Choose Us Section
        why_choose_us_title: "Mengapa Memilih Kami?",
        why_choose_us_feat1_title: "Terapis Pakar",
        why_choose_us_feat1_desc: "Kumpulan profesional kami terlatih untuk memberikan sentuhan penyembuhan yang disesuaikan untuk setiap sesi.",
        why_choose_us_feat2_title: "Bahan Semula Jadi",
        why_choose_us_feat2_desc: "Kami hanya menggunakan bahan organik berkualiti tinggi yang mesra kulit dan alam sekitar.",
        why_choose_us_feat3_title: "Suasana Tenang",
        why_choose_us_feat3_desc: "Reka bentuk dalaman minimalis kami mencipta oasis ketenangan di tengah-tengah kesibukan kota.",

        // Headers & Stepper Titles
        step1_title: "Pilih Perkhidmatan (Langkah 1)",
        step1_subtitle: "Cari rawatan yang sesuai untuk keperluan anda.",
        step2_title: "Pilih Terapis Anda",
        step2_subtitle: "Pilih daripada pengamal berpengalaman kami untuk sesi santai anda.",
        step3_title: "Tempahan Baharu",
        step3_subtitle: "Ikuti langkah di bawah untuk menjadualkan janji temu anda.",
        step4_title: "Semak & Sahkan",
        step4_subtitle: "Sila semak butiran tempahan anda di bawah sebelum memuktamadkan tempahan.",
        guest_info_title: "Maklumat Tetamu",
        payment_method_title: "Kaedah Pembayaran",
        booking_summary_title: "Ringkasan Tempahan",
        lbl_service: "PERKHIDMATAN",
        lbl_therapist: "TERAPIS",
        lbl_date_time: "TARIKH & MASA",
        lbl_subtotal: "Jumlah Kecil",
        lbl_tax: "Cukai (7%)",
        lbl_total: "Jumlah",
        lbl_est_total: "Anggaran Jumlah",

        // Success View
        success_title: "Perjalanan Ketenangan Anda Telah Disahkan!",
        success_subtitle: "Kami tidak sabar untuk menyambut anda di suaka ketenangan kami. Butiran tempahan anda ada di bawah.",
        prep_tips_title: "Petua Persediaan",
        tip1_title: "Tiba Awal",
        tip1_desc: "Sila tiba 15 minit sebelum rawatan anda untuk melengkapkan daftar dan berehat.",
        tip2_title: "Kekal Terhidrat",
        tip2_desc: "Minum banyak air sebelum dan selepas sesi urutan anda.",
        tip3_title: "Berehat daripada Peranti",
        tip3_desc: "Kami menggalakkan anda mematikan peranti untuk menikmati pengalaman sepenuhnya.",
        btn_return_home: "Kembali ke Laman Utama",

        // Profile & Wallet Views
        welcome_back: "Selamat Kembali",
        wallet_balance_title: "Baki Tersedia",
        btn_manage_wallet: "Urus Dompet",
        btn_history: "Sejarah",
        perk_title: "Kelebihan Keahlian",
        perk_desc: "Anda mendapat 5% Mata Soul untuk setiap tambah nilai bulan ini.",
        settings_title: "Tetapan Akaun",
        setting_personal: "Butiran Peribadi",
        setting_history: "Sejarah Tempahan",
        setting_notifications: "Notifikasi",
        setting_privacy: "Privasi & Keselamatan",
        next_appointment_title: "Janji Temu Seterusnya",
        no_upcoming_appts: "Tiada janji temu akan datang",
        appt_book_today: "Tempah sesi santai anda yang seterusnya hari ini.",
        btn_book_now_arrow: "Tempah Sekarang &rarr;",
        wallet_header_title: "Dompet & Transaksi",
        wallet_header_subtitle: "Urus kredit spa Serenity & Soul anda dan lihat sejarah pembayaran.",
        quick_recharge_title: "Tambah Nilai Pantas",
        quick_recharge_subtitle: "Pilih jumlah pratetap untuk ditambah serta-merta ke dompet kesejahteraan anda.",
        popular_badge: "Popular",
        topup_title: "Tambah Nilai Dompet Spa Anda",
        topup_subtitle: "Tambah dana dengan selamat untuk tempahan mudah dan rawatan spa eksklusif.",
        btn_back_to_wallet: "Kembali ke Dompet",

        // Booking History
        tab_upcoming: "Janji Temu Akan Datang",
        tab_past: "Lalu & Dibatalkan",
        status_confirmed: "Disahkan",
        status_completed: "Selesai",
        status_cancelled: "Dibatalkan",
        no_history_found: "Tiada janji temu ditemui.",
        btn_explore_services: "Teroka Perkhidmatan",
        lbl_therapist_strong: "Terapis:",

        // Login Modal
        login_modal_title: "Log Masuk ke Tempat Ketenangan Anda",
        login_modal_subtitle: "Akses dompet digital anda, lihat sejarah tempahan, dan urus janji temu.",
        placeholder_email: "Alamat E-mel",
        placeholder_password: "Kata Laluan",
        no_account_lbl: "Belum mempunyai akaun?",
        btn_sign_in_now: "Log Masuk",

        // Active Packages Widget
        active_packages_widget_title: "Pakej Aktif Anda",
        remaining_quota_lbl: "Baki kuota:",
        lbl_sessions: "sesi",
        of_lbl: "daripada",

        // Service Catalog Tabs
        cat_all: "Semua",
        cat_signature: "Pilihan",
        cat_massage: "Urutan",
        cat_facial: "Rawatan Muka",
        cat_body: "Rawatan Badan",
        cat_packages: "Pakej",

        // About Us Section
        about_tag: "Kisah Suaka Kami",
        about_title: "Menyelaraskan Badan, Minda, & Jiwa Melalui Penyembuhan Semula Jadi",
        about_desc: "Diasaskan dengan komitmen mendalam terhadap kesejahteraan holistik, Serenity & Soul lebih daripada sekadar spa—ia adalah tempat perlindungan untuk memulihkan keseimbangan hidup anda. Kami menggabungkan terapi sentuhan Timur kuno dengan formulasi botanikal organik tulen untuk pengalaman sensori yang luar biasa.",
        about_vision_title: "Visi Kami",
        about_vision_desc: "Menjadi suaka holistik mesra alam terkemuka di rantau ini, membolehkan individu memupuk kecergasan fizikal dan ketenangan minda berpanjangan.",
        about_mission_title: "Misi Kami",
        about_mission_desc: "Menyajikan rawatan terapeutik yang disesuaikan dan beretika bersama terapis bersertifikat, minyak organik mampan, dan penjagaan peribadi terbaik.",

        // Blog Section
        blog_subtitle: "Panduan & Inspirasi",
        blog_title: "Jurnal Kesejahteraan Spa",
        blog_desc: "Terokai ulasan pakar mengenai pelegaan tekanan, terapi holistik, petua penjagaan selepas spa, dan amalan hidup tenang daripada terapis pakar kami.",

        // Awards Section
        awards_tag: "Kecemerlangan & Pengiktirafan",
        awards_title: "Pusat Rawatan Spa Pemenang Anugerah",
        awards_desc: "Kami berbangga kerana diiktiraf oleh organisasi kesejahteraan terkemuka atas komitmen kami terhadap penyembuhan holistik dan perkhidmatan cemerlang.",

        // Testimonials Section
        testimonials_tag: "Pengalaman Tetamu",
        testimonials_title: "Disukai & Dipercayai Oleh Lebih 1,200+ Tetamu",
        testimonials_desc: "Ketahui bagaimana terapis bersertifikat kami membawa ketenangan mutlak, pelepasan tekanan, dan penyembuhan holistik."
    }
};

export function t(key) {
    window.t = t;
    const lang = state.language || 'en';
    let text = key;
    if (TRANSLATIONS[lang] && TRANSLATIONS[lang][key]) {
        text = TRANSLATIONS[lang][key];
    } else if (TRANSLATIONS['en'] && TRANSLATIONS['en'][key]) {
        text = TRANSLATIONS['en'][key];
    }
    if (typeof text === 'string') {
        text = text.replace(/Serenity\s*&\s*Soul/gi, currentTenant.name)
            .replace(/Serenity/gi, currentTenant.logo || currentTenant.name);
    }
    return text;
};



export function getServiceTranslation(serviceId, field, fallback) {
    window.getServiceTranslation = getServiceTranslation;
    const dict = {
        'radiance-bundle': {
            name_ms: 'Pakej Radiance Facial',
            desc_ms: "Komited untuk kesihatan kulit anda dengan pakej 10 sesi kami. Rawatan berkala memberikan hasil yang tahan lama dan berseri."
        },
        'aromatherapy-bundle': {
            name_ms: 'Pakej Urutan Aromaterapi (10 Sesi)',
            desc_ms: 'Pra-pembelian 10 sesi Urutan Aromaterapi tandatangan kami dan jimat. Sah untuk 12 bulan.'
        },
        'half-day-spa-package': {
            name_ms: 'Pakej Spa Separuh Hari',
            desc_ms: 'Nikmati kombinasi urutan aromaterapi, rawatan muka, dan lulur badan selama 3 jam penuh untuk kesegaran mutlak.'
        },
        'aromatherapy-massage': {
            name_ms: 'Urutan Aromaterapi',
            desc_ms: 'Urutan relaksasi mendalam menggunakan minyak pati terpilih untuk menenangkan sistem saraf dan melegakan ketegangan otot.'
        },
        'deep-tissue': {
            name_ms: 'Urutan Tisu Mendalam Serenity',
            desc_ms: 'Rawatan intensif yang memfokuskan kepada lapisan otot dalam untuk memulihkan badan daripada keletihan kronik.'
        },
        'radiance-organic-facial': {
            name_ms: 'Peremajaan Wajah',
            desc_ms: 'Rawatan mencerahkan wajah dengan ekstrak tumbuhan organik.'
        },
        'hot-stone': {
            name_ms: 'Terapi Batu Hangat',
            desc_ms: 'Batu basalt dipanaskan dan diletakkan pada titik tenaga utama untuk melegakan ketegangan dan memulihkan aliran tenaga.'
        },
        'signature-soul': {
            name_ms: 'Urutan Jiwa Tandatangan',
            desc_ms: 'Gabungan peribadi teknik Swedish, Shiatsu, dan Refleksologi yang disesuaikan dengan keperluan khusus badan anda.'
        },
        'illuminating-peel': {
            name_ms: 'Kulit Berseri',
            desc_ms: 'Enzim buah-buahan untuk mencerahkan dan menghaluskan kulit kusam.'
        },
        'pure-hydration': {
            name_ms: 'Hidrasi Tulen',
            desc_ms: 'Rawatan muka mengunci kelembapan dengan asid hyaluronik.'
        },
        'detox-body-scrub': {
            name_ms: 'Lulur Badan',
            desc_ms: 'Rawatan pengelupasan dengan garam laut semulajadi untuk kulit sehalus sutera.'
        }
    };

    const lang = state.language || 'en';
    if (lang === 'ms' && dict[serviceId] && dict[serviceId][field + '_ms']) {
        return dict[serviceId][field + '_ms'];
    }

    return fallback;
};

export function translateStaticHtml() {
    window.translateStaticHtml = translateStaticHtml;
    document.querySelectorAll('[data-translate]').forEach(el => {
        const key = el.getAttribute('data-translate');
        const translation = t(key);
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
            el.placeholder = translation;
        } else {
            el.innerHTML = translation;
        }
    });

    // Sync language switcher text/states
    const desktopLangBtnText = document.getElementById('lang-toggle-text');
    if (desktopLangBtnText) {
        desktopLangBtnText.innerText = state.language === 'ms' ? 'BM' : 'EN';
    }
    const mobileLangBtnText = document.getElementById('mobile-lang-toggle-text');
    if (mobileLangBtnText) {
        mobileLangBtnText.innerText = state.language === 'ms' ? 'Bahasa: BM' : 'Language: EN';
    }
};

export function toggleLanguage(event) {
    window.toggleLanguage = toggleLanguage;
    if (event && event.stopPropagation) event.stopPropagation();
    state.language = state.language === 'en' ? 'ms' : 'en';
    saveState();
    translateStaticHtml();

    // Re-render the active views so dynamic templates pickup new language instantly
    if (typeof window.renderActiveViewContents === 'function') {
        window.renderActiveViewContents(state.currentView);
    }
    if (state.currentView === 'home') {
        window.renderHomeView();
        window.renderActivePackagesWidget();
    } else if (state.currentView === 'dashboard') {
        window.renderDashboardView();
    } else if (state.currentView === 'services-catalog') {
        window.renderServicesCatalogView();
    } else if (state.currentView === 'profile') {
        window.renderProfileView();
    } else if (state.currentView === 'wallet') {
        window.renderWalletView();
    } else if (state.currentView === 'booking-history') {
        window.renderBookingHistoryView();
    }

    if (document.getElementById('payment-methods-container')) {
        window.renderPaymentMethodSelection();
    }

    if (typeof window.updateNavbarAuth === 'function') {
        window.updateNavbarAuth();
    }
};

window.t = t;
window.getServiceTranslation = getServiceTranslation;
window.translateStaticHtml = translateStaticHtml;
window.toggleLanguage = toggleLanguage;

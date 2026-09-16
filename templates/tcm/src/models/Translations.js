import { tenantId, currentTenant, DEFAULT_TENANTS } from '../models/Tenant.js';
import { SERVICES, THERAPISTS, getSharedData, syncServices, syncTherapists } from '../models/Database.js';
import { DEFAULT_STATE, state, loadState, saveState } from '../models/State.js';

// 1.5 TCM TRI-LOCALE TRANSLATIONS (ENGLISH, BAHASA MALAYSIA, SINGAPORE CHINESE)
export const TRANSLATIONS = {
    en: {
        // Nav & General Buttons
        nav_home: "Home",
        nav_service: "Services",
        nav_blog: "Articles",
        btn_book_now: "Book Now",
        nav_profile: "Profile",
        btn_sign_out: "Sign Out",
        btn_sign_in: "Sign In",
        nav_contact: "Contact",

        // About Page
        nav_about: "About Us",
        about_tag: "Our Clinic Heritage",
        about_title: "Harmonizing Qi, Body & Mind Through Authentic TCM",
        about_desc: "Founded with a mission to deliver safe, licensed, and compassionate Traditional Chinese Medicine, our clinic blends centuries-old diagnostic wisdom with modern hygienic clinical standards to help you restore vitality.",
        about_team_title: "Meet Our TCM Physicians",

        // Contact Page
        contact_tag: "GET IN TOUCH",
        contact_title: "We'd Love to Assist Your Wellness Journey",
        contact_desc: "Whether you have questions regarding acupuncture, herbal therapy, or scheduling a consultation, our team is ready to assist you.",

        btn_register: "Register",
        btn_back: "Back",
        btn_continue: "Continue",
        btn_confirm: "Confirm Appointment",
        btn_use_package: "Use Package",
        btn_topup: "Top Up Now",
        btn_reschedule: "Reschedule",
        btn_cancel: "Cancel",
        btn_view_qr: "View QR Code",
        hero_title: "Embrace Traditional Healing in Modern Comfort",
        hero_subtitle: "Personalized TCM treatments tailored to your needs — online telemedicine, house calls, and painless laser acupuncture.",
        footer_rights: "© 2026 TCM Homecare. All Rights Reserved.",

        // Why Choose Us Section
        why_choose_us_title: "Why Choose TCM Homecare?",
        why_choose_us_feat1_title: "Certified TCM Physicians",
        why_choose_us_feat1_desc: "All practitioners are registered with the Traditional Chinese Medicine Practitioners Board with extensive hospital clinical experience.",
        why_choose_us_feat2_title: "Premium Herbal Formulations",
        why_choose_us_feat2_desc: "We exclusively prescribe laboratory-tested, heavy-metal-free concentrated Chinese herbal granules for maximum efficacy and safety.",
        why_choose_us_feat3_title: "Holistic Diagnosis",
        why_choose_us_feat3_desc: "In-depth pulse feeling and tongue evaluation to identify the root imbalance rather than merely treating superficial symptoms.",

        // Headers & Stepper Titles
        step1_title: "Select Service (Step 1)",
        step1_subtitle: "Choose from our clinical TCM therapies, herbal consultations, and restorative courses.",
        step2_title: "Select Your Practitioner",
        step2_subtitle: "Choose your preferred licensed TCM physician or orthopedic tuina master.",
        step3_title: "New Reservation",
        step3_subtitle: "Select your preferred date and clinic slot to schedule your appointment.",
        step4_title: "Review & Confirm",
        step4_subtitle: "Please verify your appointment and patient details before confirmation.",
        guest_info_title: "Patient & Guest Information",
        payment_method_title: "Payment Method",
        booking_summary_title: "Appointment Summary",
        lbl_service: "SERVICE",
        lbl_therapist: "PRACTITIONER",
        lbl_date_time: "DATE & TIME",
        lbl_subtotal: "Subtotal",
        lbl_tax: "GST (9%)",
        lbl_total: "Total",
        lbl_est_total: "Estimated Total",

        // Success View
        success_title: "Your TCM Appointment is Confirmed!",
        success_subtitle: "We look forward to welcoming you to our clinic. Your appointment details are outlined below.",
        prep_tips_title: "Patient Preparation Tips",
        tip1_title: "Arrive 10 Minutes Early",
        tip1_desc: "Please arrive promptly to complete preliminary pulse and blood pressure intake.",
        tip2_title: "Wear Loose Clothing",
        tip2_desc: "Loose and comfortable clothing facilitates easy access for acupuncture and tuina bodywork.",
        tip3_title: "Avoid Heavy Meals Before Treatment",
        tip3_desc: "A light snack 1 hour prior is recommended; avoid empty stomach or excessive fullness.",
        btn_return_home: "Return to Clinic Home",

        // Profile & Wallet Views
        welcome_back: "Welcome Back",
        wallet_balance_title: "Available Clinic Balance",
        btn_manage_wallet: "Manage Wallet",
        btn_history: "History",
        perk_title: "Health Package Perk",
        perk_desc: "Earn 5% health rebate credits on every package top-up this month.",
        settings_title: "Account Settings",
        setting_personal: "Personal Details",
        setting_history: "Appointment History",
        setting_notifications: "Notifications",
        setting_privacy: "Privacy & Security",
        next_appointment_title: "Next Scheduled Appointment",
        no_upcoming_appts: "No upcoming clinic appointments",
        appt_book_today: "Book your next consultation or acupuncture session today.",
        btn_book_now_arrow: "Book Now &rarr;",
        wallet_header_title: "Clinic Wallet & Credits",
        wallet_header_subtitle: "Manage your prepaid clinic balance and review treatment transactions.",
        quick_recharge_title: "Quick Balance Recharge",
        quick_recharge_subtitle: "Select a preset credit amount to top up your clinic wallet.",
        popular_badge: "Popular",
        topup_title: "Top-Up Clinic Wallet",
        topup_subtitle: "Add funds securely for hassle-free treatment reservations and member rates.",
        btn_back_to_wallet: "Back to Wallet",
        tab_upcoming: "Upcoming Appointments",
        tab_past: "Past Consultations",
        status_confirmed: "Confirmed",
        status_completed: "Completed",
        status_cancelled: "Cancelled",
        no_history_found: "No appointment records found.",
        btn_explore_services: "Explore TCM Services",
        lbl_therapist_strong: "Practitioner:",
        login_modal_title: "Sign In to Patient Portal",
        login_modal_subtitle: "Access your prepaid clinic balance, view consultation history, and manage appointments.",
        placeholder_email: "Email Address",
        placeholder_password: "Password",
        no_account_lbl: "New patient without an account?",
        btn_sign_in_now: "Sign In",
        active_packages_widget_title: "Your Active Treatment Packages",
        remaining_quota_lbl: "Remaining sessions:",
        lbl_sessions: "sessions",
        of_lbl: "of",
        cat_all: "All",
        cat_acupuncture: "Acupuncture",
        cat_tuina: "Tuina Therapy",
        cat_consultation: "Physician Consultation",
        cat_therapeutic: "Therapeutic",
        cat_packages: "Treatment Packages",
        cat_signature: "Acupuncture",
        cat_massage: "Tuina Bodywork",
        cat_facial: "Consultation",
        cat_body: "Therapeutic",
        about_vision_title: "Our Vision",
        about_vision_desc: "To be the most respected integrative TCM healthcare practice in Southeast Asia, revitalizing preventive healthcare through compassionate expertise.",
        about_mission_title: "Our Mission",
        about_mission_desc: "Delivering scientifically validated, hygienic, and personalized TCM therapies tailored to the unique physiological constitutions of modern individuals.",
        blog_subtitle: "TCM Health Insights",
        blog_title: "TCM Meridian & Wellness Journal",
        blog_desc: "Read practical insights from our licensed physicians on dietary balance, seasonal meridian care, acupressure relief, and stress management.",
        awards_tag: "Clinical Excellence",
        awards_title: "Trusted Healthcare & TCM Center",
        awards_desc: "Recognized for high medical hygiene standards, ethical practice, and exceptional patient care in holistic healthcare.",
        testimonials_tag: "Patient Testimonials",
        testimonials_title: "Trusted by Over 2,500+ Patients",
        testimonials_desc: "Discover real patient recoveries from chronic back pain, migraine, fatigue, and muscular strain through our dedicated TCM therapies."
    },
    ms: {
        // Nav & General Buttons
        nav_home: "Laman Utama",
        nav_service: "Perkhidmatan",
        nav_blog: "Artikel",
        btn_book_now: "Tempah Sekarang",
        nav_profile: "Profil",
        btn_sign_out: "Log Keluar",
        btn_sign_in: "Log Masuk",
        nav_contact: "Hubungi",

        // About Page
        nav_about: "Tentang Kami",
        about_tag: "Warisan Klinik Kami",
        about_title: "Menyelaraskan Qi, Tubuh & Minda Melalui Perubatan Tradisional Cina",
        about_desc: "Diasaskan dengan misi menyediakan Perubatan Tradisional Cina yang selamat, berlesen, dan beretika, klinik kami menggabungkan kearifan diagnostik turun-temurun dengan piawaian klinikal kebersihan moden untuk memulihkan kecergasan anda.",
        about_team_title: "Temui Pengamal Perubatan Tradisional Cina Kami",

        // Contact Page
        contact_tag: "HUBUNGI KAMI",
        contact_title: "Kami Sedia Membantu Pemulihan Kesihatan Anda",
        contact_desc: "Sama ada anda mempunyai pertanyaan mengenai akupunktur, preskripsi herba, atau penjadualan sesi konsultasi, pasukan kami sentiasa bersedia membantu anda.",

        btn_register: "Daftar Akaun",
        btn_back: "Kembali",
        btn_continue: "Teruskan",
        btn_confirm: "Sahkan Janji Temu",
        btn_use_package: "Gunakan Pakej",
        btn_topup: "Tambah Nilai Sekarang",
        btn_reschedule: "Jadual Semula",
        btn_cancel: "Batal",
        btn_view_qr: "Lihat Kod QR",
        hero_title: "Hayati Penyembuhan Tradisional dalam Keselesaan Moden",
        hero_subtitle: "Rawatan TCM diperibadikan untuk keperluan anda — teleperubatan dalam talian, lawatan ke rumah, dan akupunktur laser tanpa kesakitan.",
        footer_rights: "© 2026 TCM Homecare. Hak Cipta Terpelihara.",

        // Why Choose Us Section
        why_choose_us_title: "Mengapa Memilih TCM Homecare?",
        why_choose_us_feat1_title: "Pengamal TCM Bertauliah",
        why_choose_us_feat1_desc: "Semua pengamal berdaftar dengan Lembaga Pengamal Perubatan Tradisional Cina serta mempunyai pengalaman klinikal hospital yang luas.",
        why_choose_us_feat2_title: "Formulasi Herba Berkualiti Tinggi",
        why_choose_us_feat2_desc: "Kami hanya mempreskripsikan butiran herba pekat yang diuji makmal dan bebas logam berat demi keselamatan serta keberkesanan maksimum.",
        why_choose_us_feat3_title: "Diagnosis Holistik Menyeluruh",
        why_choose_us_feat3_desc: "Pemeriksaan nadi dan lidah yang mendalam untuk mengenal pasti punca ketidakseimbangan tubuh, bukan sekadar merawat simptom luaran.",

        // Headers & Stepper Titles
        step1_title: "Pilih Perkhidmatan (Langkah 1)",
        step1_subtitle: "Pilih daripada terapi klinikal TCM, konsultasi herba, dan pakej pemulihan kami.",
        step2_title: "Pilih Pengamal Anda",
        step2_subtitle: "Pilih pengamal TCM berlesen atau pakar tuina ortopedik pilihan anda.",
        step3_title: "Tempahan Baharu",
        step3_subtitle: "Pilih tarikh dan masa yang sesuai untuk menjadualkan janji temu anda.",
        step4_title: "Semak & Sahkan",
        step4_subtitle: "Sila semak butiran janji temu dan maklumat pesakit anda sebelum pengesahan.",
        guest_info_title: "Maklumat Pesakit & Tetamu",
        payment_method_title: "Kaedah Pembayaran",
        booking_summary_title: "Ringkasan Janji Temu",
        lbl_service: "PERKHIDMATAN",
        lbl_therapist: "PENGAMAL",
        lbl_date_time: "TARIKH & MASA",
        lbl_subtotal: "Jumlah Kecil",
        lbl_tax: "Cukai GST (9%)",
        lbl_total: "Jumlah",
        lbl_est_total: "Anggaran Jumlah",

        // Success View
        success_title: "Janji Temu TCM Anda Telah Disahkan!",
        success_subtitle: "Kami mengalu-alukan kedatangan anda ke klinik kami. Butiran tempahan anda tertera di bawah.",
        prep_tips_title: "Panduan Persediaan Pesakit",
        tip1_title: "Tiba 10 Minit Lebih Awal",
        tip1_desc: "Sila tiba awal untuk pemeriksaan tekanan darah dan rekod nadi awal.",
        tip2_title: "Pakai Pakaian Longgar",
        tip2_desc: "Pakaian longgar dan selesa memudahkan akses rawatan akupunktur dan tuina.",
        tip3_title: "Elakkan Makan Terlalu Kenyang Sebelum Sesi",
        tip3_desc: "Snek ringan 1 jam sebelum rawatan disyorkan; elakkan perut kosong atau terlalu kenyang.",
        btn_return_home: "Kembali ke Laman Utama",

        // Profile & Wallet Views
        welcome_back: "Selamat Kembali",
        wallet_balance_title: "Baki Klinik Tersedia",
        btn_manage_wallet: "Urus Dompet",
        btn_history: "Sejarah",
        perk_title: "Kelebihan Pakej Kesihatan",
        perk_desc: "Dapatkan rebat kesihatan 5% untuk setiap tambah nilai pakej bulan ini.",
        settings_title: "Tetapan Akaun",
        setting_personal: "Butiran Peribadi",
        setting_history: "Sejarah Janji Temu",
        setting_notifications: "Pemberitahuan",
        setting_privacy: "Privasi & Keselamatan",
        next_appointment_title: "Janji Temu Seterusnya",
        no_upcoming_appts: "Tiada janji temu akan datang",
        appt_book_today: "Tempah sesi konsultasi atau akupunktur anda yang seterusnya hari ini.",
        btn_book_now_arrow: "Tempah Sekarang &rarr;",
        wallet_header_title: "Dompet Klinik & Kredit",
        wallet_header_subtitle: "Urus baki prabayar klinik anda dan semak sejarah transaksi rawatan.",
        quick_recharge_title: "Tambah Nilai Pantas",
        quick_recharge_subtitle: "Pilih amaun pratetap untuk menambah nilai dompet klinik anda.",
        popular_badge: "Pilihan Ramai",
        topup_title: "Tambah Nilai Dompet Klinik",
        topup_subtitle: "Tambah dana dengan selamat untuk tempahan janji temu lancar dan kadar ahli.",
        btn_back_to_wallet: "Kembali ke Dompet",
        tab_upcoming: "Janji Temu Akan Datang",
        tab_past: "Konsultasi Terdahulu",
        status_confirmed: "Disahkan",
        status_completed: "Selesai",
        status_cancelled: "Dibatalkan",
        no_history_found: "Tiada rekod janji temu dijumpai.",
        btn_explore_services: "Terokai Perkhidmatan TCM",
        lbl_therapist_strong: "Pengamal:",
        login_modal_title: "Log Masuk ke Portal Pesakit",
        login_modal_subtitle: "Akses baki prabayar klinik anda, lihat sejarah rawatan, dan urus janji temu.",
        placeholder_email: "Alamat E-mel",
        placeholder_password: "Kata Laluan",
        no_account_lbl: "Pesakit baharu tanpa akaun?",
        btn_sign_in_now: "Log Masuk",
        active_packages_widget_title: "Pakej Rawatan Aktif Anda",
        remaining_quota_lbl: "Baki sesi:",
        lbl_sessions: "sesi",
        of_lbl: "daripada",
        cat_all: "Semua",
        cat_acupuncture: "Akupunktur",
        cat_tuina: "Terapi Tuina",
        cat_consultation: "Konsultasi Pengamal",
        cat_therapeutic: "Terapeutik",
        cat_packages: "Pakej Rawatan",
        cat_signature: "Akupunktur",
        cat_massage: "Tuina",
        cat_facial: "Konsultasi",
        cat_body: "Terapeutik",
        about_vision_title: "Visi Kami",
        about_vision_desc: "Menjadi amalan penjagaan kesihatan integratif TCM yang paling dihormati di Asia Tenggara, memperkasakan kesihatan pencegahan melalui kepakaran penuh ihsan.",
        about_mission_title: "Misi Kami",
        about_mission_desc: "Menyediakan terapi TCM yang disahkan secara saintifik, bersih, dan diperibadikan mengikut perlembagaan fisiologi individu moden.",
        blog_subtitle: "Wawasan Kesihatan TCM",
        blog_title: "Jurnal Kesejahteraan & Meridian TCM",
        blog_desc: "Ketahui panduan praktikal daripada pengamal bertauliah kami mengenai pemakanan seimbang, penjagaan meridian mengikut musim, dan pelepasan tekanan.",
        awards_tag: "Kecemerlangan Klinikal",
        awards_title: "Pusat Perubatan Tradisional Cina Dipercayai",
        awards_desc: "Diiktiraf atas standard kebersihan klinikal yang tinggi, etika perubatan, dan penjagaan pesakit yang luar biasa.",
        testimonials_tag: "Pengalaman Pesakit",
        testimonials_title: "Dipercayai Oleh Lebih 2,500+ Pesakit",
        testimonials_desc: "Ketahui kisah pemulihan pesakit daripada sakit belakang kronik, migrain, keletihan, dan ketegangan otot melalui rawatan TCM kami."
    },
    zh: {
        // Nav & General Buttons
        nav_home: "首页",
        nav_service: "医疗服务",
        nav_blog: "中医养生",
        btn_book_now: "立即预约",
        nav_profile: "个人中心",
        btn_sign_out: "退出登录",
        btn_sign_in: "登录",
        nav_contact: "联系我们",

        // About Page
        nav_about: "关于诊所",
        about_tag: "医馆传承",
        about_title: "调和气血，固本培元，承启正统中医",
        about_desc: "秉承仁心仁术的中医执业准则，我们将千年中医辨证精髓与现代严谨洁净的临床规范相融合，为每位就诊者提供专业、安全且卓有成效的个性化调理。",
        about_team_title: "资深驻诊中医师",

        // Contact Page
        contact_tag: "联系我们",
        contact_title: "我们竭诚为您提供健康咨询",
        contact_desc: "无论您是对针灸疗法、中药调理有疑问，或是需要预约医师面诊，我们的医疗团队随时为您提供协助。",

        btn_register: "注册账户",
        btn_back: "返回",
        btn_continue: "继续",
        btn_confirm: "确认预约",
        btn_use_package: "使用配套",
        btn_topup: "立即充值",
        btn_reschedule: "改期",
        btn_cancel: "取消预约",
        btn_view_qr: "查看二维码",
        hero_title: "现代舒适中体验传统中医调理",
        hero_subtitle: "为您量身定制的中医调理方案 — 在线问诊、上门护理与无痛激光针灸。",
        footer_rights: "© 2026 TCM Homecare。版权所有。",

        // Why Choose Us Section
        why_choose_us_title: "为什么选择 TCM Homecare？",
        why_choose_us_feat1_title: "政府注册中医师",
        why_choose_us_feat1_desc: "所有驻诊医师均持有新加坡中医管理委员会执照，具备深厚的大学中医背景及丰富临床经验。",
        why_choose_us_feat2_title: "道地精萃浓缩中药",
        why_choose_us_feat2_desc: "严格选用经重金属及微生物检测合格的道地浓缩中药颗粒，即冲即服，安全高效。",
        why_choose_us_feat3_title: "四诊合参深度辨证",
        why_choose_us_feat3_desc: "望闻问切，细致审视舌脉体质，追溯病因根本，而非单纯对症处理表面症状。",

        // Headers & Stepper Titles
        step1_title: "选择服务项目 (第一步)",
        step1_subtitle: "请挑选适合您体质的中医调理、针灸推拿或养生疗程配套。",
        step2_title: "选择主理医师",
        step2_subtitle: "请选择您信赖的注册中医师或资深正骨推拿师。",
        step3_title: "预约时间",
        step3_subtitle: "选择方便的门诊日期与就诊时段。",
        step4_title: "核对并确认",
        step4_subtitle: "请核对您的预约详情与就诊人信息。",
        guest_info_title: "就诊人信息",
        payment_method_title: "支付方式",
        booking_summary_title: "预约概览",
        lbl_service: "服务项目",
        lbl_therapist: "主理医师",
        lbl_date_time: "预约时间",
        lbl_subtotal: "小计",
        lbl_tax: "消费税 (9%)",
        lbl_total: "总计",
        lbl_est_total: "预估总计",

        // Success View
        success_title: "您的中医就诊预约已确认！",
        success_subtitle: "我们期待在医馆迎接您的到来。以下是您的完整预约凭证。",
        prep_tips_title: "就诊温馨提示",
        tip1_title: "请提前10分钟到达",
        tip1_desc: "便于在面诊前测量血压并完成初诊信息登记。",
        tip2_title: "建议穿着宽松衣物",
        tip2_desc: "宽松舒适的衣物方便进行肢体穴位针灸及推拿调理。",
        tip3_title: "避免空腹或过饱面诊",
        tip3_desc: "建议在诊疗前1小时适当进食清淡食物，避免空腹针灸导致晕针。",
        btn_return_home: "返回诊所首页",

        // Profile & Wallet Views
        welcome_back: "欢迎回来",
        wallet_balance_title: "可用健康钱包余额",
        btn_manage_wallet: "钱包管理",
        btn_history: "就诊历史",
        perk_title: "会员充值权益",
        perk_desc: "本月充值养生配套立享5%健康返现积分奖励。",
        settings_title: "账户设置",
        setting_personal: "个人档案",
        setting_history: "历史就诊记录",
        setting_notifications: "提醒通知",
        setting_privacy: "隐私与安全",
        next_appointment_title: "下次预约时间",
        no_upcoming_appts: "暂无待就诊预约",
        appt_book_today: "立即安排下一次中医师把脉问诊或针灸调理。",
        btn_book_now_arrow: "立即预约 &rarr;",
        wallet_header_title: "健康钱包与就诊账单",
        wallet_header_subtitle: "管理您的预付款余额，实时查阅各项诊疗扣费明细。",
        quick_recharge_title: "快捷余额充值",
        quick_recharge_subtitle: "选择预设充值金额，快速充值至您的健康钱包。",
        popular_badge: "推荐",
        topup_title: "充值就诊钱包",
        topup_subtitle: "安全充值余额，尊享会员就诊优惠与免排队快捷扣费体验。",
        btn_back_to_wallet: "返回钱包",
        tab_upcoming: "待就诊预约",
        tab_past: "历史门诊记录",
        status_confirmed: "已确认",
        status_completed: "已完成",
        status_cancelled: "已取消",
        no_history_found: "未找到预约记录。",
        btn_explore_services: "浏览中医项目",
        lbl_therapist_strong: "主诊医师:",
        login_modal_title: "登录就诊人通道",
        login_modal_subtitle: "查看您的充值余额、门诊历史及预约管理。",
        placeholder_email: "电子邮箱",
        placeholder_password: "登录密码",
        no_account_lbl: "尚无就诊账户？",
        btn_sign_in_now: "立即登录",
        active_packages_widget_title: "您的生效中疗程配套",
        remaining_quota_lbl: "剩余可用次数:",
        lbl_sessions: "次",
        of_lbl: "/",
        cat_all: "全部",
        cat_acupuncture: "精准针灸",
        cat_tuina: "正骨推拿",
        cat_consultation: "四诊把脉",
        cat_therapeutic: "拔罐艾灸",
        cat_packages: "疗程配套",
        cat_signature: "精准针灸",
        cat_massage: "推拿正骨",
        cat_facial: "四诊问诊",
        cat_body: "传统理疗",
        about_vision_title: "诊所愿景",
        about_vision_desc: "成为东南亚备受赞誉的现代化整合中医机构，以仁心仁术守护民众体魄。",
        about_mission_title: "医疗使命",
        about_mission_desc: "遵循科学循证与传统精髓，为现代人体质定制卫生、安全、纯正的中医诊疗方案。",
        blog_subtitle: "中医科普",
        blog_title: "经络养生与体质调理专栏",
        blog_desc: "由注册中医师撰写四季养生、穴位自疗、食疗药膳及缓解慢性疲劳的专业科普文章。",
        awards_tag: "临床荣誉",
        awards_title: "值得信赖的中医医疗机构",
        awards_desc: "荣获多项医疗卫生规范与优质病患服务认可，恪守崇高医疗道德。",
        testimonials_tag: "就诊回响",
        testimonials_title: "逾 2,500+ 位就诊者的信赖见证",
        testimonials_desc: "阅读病患在慢性腰颈椎劳损、偏头痛、内伤杂病及亚健康调理中的真实康复历程。"
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
        const brandName = (currentTenant && currentTenant.name) ? currentTenant.name : 'TCM Homecare';
        text = text.replace(/TCM\s*Homecare/gi, brandName)
            .replace(/Yong\s*Kang\s*TCM\s*&\s*Acupuncture/gi, brandName)
            .replace(/Yong\s*Kang/gi, brandName)
            .replace(/Serenity\s*&\s*Soul/gi, brandName)
            .replace(/Serenity/gi, brandName);
    }
    return text;
};

export function getServiceTranslation(serviceId, field, fallback) {
    window.getServiceTranslation = getServiceTranslation;
    const dict = {
        'tcm-teleconsult-intro': {
            name_ms: 'Konsultasi Video TCM Dalam Talian (Tawaran Pengenalan)',
            desc_ms: 'Mulakan perjalanan kesihatan anda bersama pengamal bertauliah melalui panggilan video selamat. Penilaian gaya hidup dan simptom komprehensif.',
            name_zh: '线上中医视频问诊 (首诊特惠)',
            desc_zh: '由注册执业中医师进行一对一线上视频四诊，详尽评估体质与生活作息，提供贴心中医调理建议。'
        },
        'tcm-laser-acupuncture': {
            name_ms: 'Terapi Akupunktur Laser Tanpa Sakit',
            desc_ms: 'Akupunktur laser aras rendah moden yang selesa sepenuhnya tanpa jarum. Amat sesuai untuk mereka yang bimbang jarum, kanak-kanak, dan warga emas.',
            name_zh: '现代无痛舒适激光针灸',
            desc_zh: '采用前沿低能量激光照射经络腧穴，完全无痛无创，特别适合对针刺敏感者、老人与儿童。'
        },
        'tcm-homecare-house-call': {
            name_ms: 'Lawatan Rawatan TCM Ke Rumah Peribadi',
            desc_ms: 'Lawatan pengamal profesional ke rumah anda di serata Singapura untuk rawatan akupunktur, tuina, atau diagnosis herba dalam keselesaan kediaman anda.',
            name_zh: '专业上门中医诊疗与出诊服务',
            desc_zh: '专业中医师全岛上门服务，在您私密舒适的家中提供针灸、正骨推拿及道地中药把脉问诊。'
        },
        'tcm-pain-relief-bundle': {
            name_ms: 'Pakej Tuina Ortopedik & Pelepasan Sakit (10 Sesi)',
            desc_ms: 'Program pemulihan sakit berstruktur untuk sakit leher kronik, bahu, pinggang dan linu panggul dengan pakar TCM berdaftar.',
            name_zh: '正骨推拿与痛症理疗疗程 (10次)',
            desc_zh: '由资深中医师主理，针对颈椎病、肩周炎、腰腿痛及坐骨神经痛的综合康复理疗方案。'
        },
        'tcm-vitality-package': {
            name_ms: 'Pakej Lengkap Kecergasan Meridian TCM (5 Sesi)',
            desc_ms: 'Kursus holistik komprehensif menggabungkan rundingan pengamal, akupunktur sasaran, dan tuina meridian untuk kecergasan berpanjangan.',
            name_zh: '综合经络元气调理疗程 (5次)',
            desc_zh: '涵盖中医把脉辨证、精准经络针灸与中医推拿理疗，全面调和五脏六腑阴阳气血。'
        },
        'acupuncture-session': {
            name_ms: 'Terapi Meridian Akupunktur',
            desc_ms: 'Terapi jarum steril khusus untuk melancarkan sekatan Qi, melegakan kesakitan badan kronik, dan menyelaraskan sistem organ.',
            name_zh: '精准经络针灸治疗',
            desc_zh: '采用一次性无菌针灸针，疏通经络气血郁滞，缓解急慢性疼痛，调理脏腑功能。'
        },
        'tcm-herbal-consultation': {
            name_ms: 'Rundingan Nadi & Herba TCM',
            desc_ms: 'Pemeriksaan nadi komprehensif, analisis lidah, dan preskripsi ubat herba diperibadikan oleh pengamal TCM bertauliah.',
            name_zh: '中医辨证把脉与草药问诊',
            desc_zh: '由资深注册中医师进行四诊（望闻问切），结合体质分析开具个性化中药调理方案。'
        },
        'tcm-tuina-therapy': {
            name_ms: 'Kerja Badan Tuina Terapeutik TCM',
            desc_ms: 'Kerja badan perubatan Cina tradisional untuk menangani penyakit muskuloskeletal, kekakuan sendi, dan penjajaran struktur badan.',
            name_zh: '中医骨伤与经络推拿调理',
            desc_zh: '传承中医经络推拿手法与正骨理筋，缓解肌肉劳损、关节僵硬并纠正骨骼轻度错缝。'
        },
        'cupping-gua-sha': {
            name_ms: 'Detoks Bekam Api & Gua Sha',
            desc_ms: 'Sedutan cawan kaca api asli digabungkan dengan kikisan batu jed untuk melepaskan kelembapan patogen dan merangsang peredaran mikro darah.',
            name_zh: '传统拔火罐与温润刮痧排毒',
            desc_zh: '采用玻璃真空火罐与天然玉石刮痧板，祛除体内风寒湿邪，活血化瘀，深层排毒。'
        },
        'moxibustion-therapy': {
            name_ms: 'Ritual Pemanasan Moksa Herba',
            desc_ms: 'Aplikasi herba mugwort matang yang dibakar di atas meridian akupunktur untuk menghangatkan saluran, mengusir sejuk, dan menguatkan tenaga.',
            name_zh: '温阳通络本草艾灸疗法',
            desc_zh: '精选陈年艾绒温灸特定穴位，温经散寒、行气通络、补中益气，提升机体免疫力。'
        }
    };

    const lang = state.language || 'en';
    if (dict[serviceId]) {
        if (lang === 'ms' && dict[serviceId][field + '_ms']) {
            return dict[serviceId][field + '_ms'];
        }
        if (lang === 'zh' && dict[serviceId][field + '_zh']) {
            return dict[serviceId][field + '_zh'];
        }
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

    // Sync language switcher text/states (Supports en, ms, zh)
    const desktopLangBtnText = document.getElementById('lang-toggle-text');
    if (desktopLangBtnText) {
        desktopLangBtnText.innerText = state.language === 'zh' ? '中文' : (state.language === 'ms' ? 'BM' : 'EN');
    }
    const mobileLangBtnText = document.getElementById('mobile-lang-toggle-text');
    if (mobileLangBtnText) {
        mobileLangBtnText.innerText = state.language === 'zh' ? '语言: 中文' : (state.language === 'ms' ? 'Bahasa: BM' : 'Language: EN');
    }
};

export function toggleLanguage(event) {
    window.toggleLanguage = toggleLanguage;
    if (event && event.stopPropagation) event.stopPropagation();
    
    // Cycle en -> ms -> zh -> en
    if (state.language === 'en') {
        state.language = 'ms';
    } else if (state.language === 'ms') {
        state.language = 'zh';
    } else {
        state.language = 'en';
    }
    
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

import { tenantId, currentTenant, DEFAULT_TENANTS } from '../models/Tenant.js';
import { SERVICES, THERAPISTS, getSharedData, syncServices, syncTherapists } from '../models/Database.js';
import { TRANSLATIONS, t, getServiceTranslation, translateStaticHtml, toggleLanguage } from '../models/Translations.js';
import { DEFAULT_STATE, state, loadState, saveState } from '../models/State.js';
import { isLoggedIn, updateNavbarAuth, userSignOut } from '../controllers/AuthController.js';
import { navigateTo, updateTenantLinks, updateNavbarActiveState, updateStepperUI, navigateToAllServicesWithFilter } from '../controllers/Router.js';
import { renderActiveViewContents, updateHeaderWalletDisplay, renderHomeView, renderServicesCatalogView, renderSelectServiceView, renderSelectTherapistView, renderSelectTimeView, renderConfirmBookingView, renderActivePackagesWidget, renderPaymentMethodSelection, startBookingWithService } from '../views/Renderers.js';
import { renderSidebarSummary, renderSuccessView } from '../views/SidebarSummary.js';
import { resetBookingFlow, nextStep, prevStep } from '../controllers/BookingController.js';
import { showNotification } from '../views/Toast.js';
import { renderProfileView, renderWalletView, renderTopupView, renderPersonalDetailsView, renderBookingHistoryView, renderNotificationsView, renderPrivacySecurityView, renderRescheduleView } from '../views/ProfileViews.js';
import { renderAllServicesView } from '../views/CatalogViews.js';
import { openPaymentMethodsModal, closePaymentMethodsModal } from '../views/PaymentModal.js';
import { renderBookPackageView, renderActivePackagesView } from '../views/PackageViews.js';

// Dynamic Cliniva Branch DOM Binding
export function applyTenantDynamicBranding() {
    if (!currentTenant) return;
    try {
        // 1. Document Title
        document.title = `${currentTenant.name} — Premier TCM & Acupuncture Clinic`;

        // 2. Top Navigation Brand Name & Logo
        const brandNameEl = document.getElementById('spaNavBrandName');
        if (brandNameEl) brandNameEl.textContent = currentTenant.name;
        const brandLogoEl = document.getElementById('spaNavBrandLogo');
        if (brandLogoEl && currentTenant.logo) {
            if (currentTenant.logo.startsWith('data:') || currentTenant.logo.startsWith('http')) {
                brandLogoEl.innerHTML = `<img src="${currentTenant.logo}" class="w-7 h-7 rounded-full object-cover inline-block">`;
            } else {
                brandLogoEl.textContent = currentTenant.logo;
            }
        }

        // 3. Hero Section Subtitle
        if (currentTenant.tagline) {
            const heroSub = document.querySelector('[data-translate="hero_subtitle"]');
            if (heroSub) heroSub.textContent = currentTenant.tagline;
        }

        // 4. About Section Clinic Name
        const aboutTitle = document.querySelector('.font-serif.text-xl.font-bold.block.mb-1');
        if (aboutTitle) aboutTitle.textContent = `${currentTenant.name} TCM Clinic`;

        // 5. WhatsApp Integration
        if (currentTenant.phone) {
            const cleanPhone = currentTenant.phone.replace(/[^0-9]/g, '');
            window.__branchWhatsAppUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent('Hello ' + currentTenant.name + ', I would like to inquire about TCM consultations and acupuncture appointments.')}`;
        }
    } catch (e) {
        console.warn('[AppInit] Error applying tenant branding:', e);
    }
}

// 9. APP INITIALIZATION
document.addEventListener('DOMContentLoaded', () => {
    applyTenantDynamicBranding();
    // Force the very first view to landing page, regardless of auth status.
    window.__forceLandingEntry = true;
    navigateTo('home');
    window.__forceLandingEntry = false;
    updateNavbarAuth();
    setTimeout(applyTenantDynamicBranding, 100);
});

// Mobile Hamburger Dropdown Menu Helpers
export function toggleMobileMenu() {
    window.toggleMobileMenu = toggleMobileMenu;
    const dropdown = document.getElementById('mobile-menu-dropdown');
    if (dropdown) {
        const isHidden = dropdown.style.display === 'none' || dropdown.style.display === '';
        if (isHidden) {
            window.updateMobileMenuUI();
            dropdown.style.display = 'flex';
            dropdown.style.flexDirection = 'column';
            dropdown.style.gap = '1rem';
        } else {
            dropdown.style.display = 'none';
        }
    }
};

export function closeMobileMenu() {
    window.closeMobileMenu = closeMobileMenu;
    const dropdown = document.getElementById('mobile-menu-dropdown');
    if (dropdown) {
        dropdown.style.display = 'none';
    }
};

export function updateMobileMenuUI() {
    window.updateMobileMenuUI = updateMobileMenuUI;
    const usernameEl = document.getElementById('mobile-menu-username');
    const userroleEl = document.getElementById('mobile-menu-userrole');
    const authBtn = document.getElementById('mobile-menu-auth-btn');
    const avatarContainer = document.getElementById('mobile-menu-avatar-container');
    
    if (!usernameEl || !userroleEl || !authBtn || !avatarContainer) return;
    
    const loggedIn = isLoggedIn();
    if (loggedIn) {
        const name = localStorage.getItem('user_name') || 'Eleanor Vance';
        usernameEl.textContent = name;
        userroleEl.textContent = state.language === 'ms' ? 'Pesakit' : (state.language === 'zh' ? '患者' : 'Patient');
        
        // Show avatar circle EV
        const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
        avatarContainer.innerHTML = `<span class="font-bold text-sm text-[#164e3f]">${initials}</span>`;
        avatarContainer.className = "w-12 h-12 rounded-full bg-[#164e3f]/15 flex items-center justify-center overflow-hidden";
        
        // Auth button as sign out
        authBtn.innerHTML = `<span class="material-symbols-outlined text-[20px]">logout</span>${state.language === 'ms' ? 'Log Keluar' : (state.language === 'zh' ? '登出' : 'Sign Out')}`;
        authBtn.className = "flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-50 text-red-600 hover:text-red-700 transition-colors cursor-pointer text-sm font-semibold text-left";
    } else {
        usernameEl.textContent = state.language === 'ms' ? 'Pengguna Tetamu' : (state.language === 'zh' ? '访客' : 'Guest User');
        userroleEl.textContent = state.language === 'ms' ? 'Belum Log Masuk' : (state.language === 'zh' ? '未登录' : 'Not Logged In');
        avatarContainer.innerHTML = `<span class="material-symbols-outlined text-[24px]">person</span>`;
        avatarContainer.className = "w-12 h-12 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center overflow-hidden";
        
        // Auth button as sign in
        authBtn.innerHTML = `<span class="material-symbols-outlined text-[20px]">login</span>${state.language === 'ms' ? 'Log Masuk' : (state.language === 'zh' ? '登录' : 'Sign In')}`;
        authBtn.className = "flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#164e3f]/10 text-[#164e3f] transition-colors cursor-pointer text-sm font-semibold text-left";
    }
};

export function handleMobileMenuAuth() {
    window.handleMobileMenuAuth = handleMobileMenuAuth;
    window.closeMobileMenu();
    const loggedIn = isLoggedIn();
    if (loggedIn) {
        userSignOut();
    } else {
        requireLogin(() => navigateTo('profile'));
    }
};

// Document click listener to close dropdown on click outside
document.addEventListener('click', function(e) {
    const dropdown = document.getElementById('mobile-menu-dropdown');
    const hamburger = document.getElementById('mobile-hamburger-btn');
    if (dropdown && dropdown.style.display !== 'none' && dropdown.style.display !== '') {
        if (!dropdown.contains(e.target) && !hamburger.contains(e.target)) {
            dropdown.style.display = 'none';
        }
    }
});

// Mobile Bottom Navigation Bar — shows Back & Continue on steps 1-3 (mobile only)
export function updateMobileBottomNav(viewId) {
    const nav = document.getElementById('mobile-booking-nav');
    if (!nav) return;

    const viewsWithNav = {
        'select-service': { step: 1, label: state.language === 'ms' ? 'Teruskan ke Pengamal' : (state.language === 'zh' ? '下一步：选择医师' : 'Continue to Practitioner') },
        'select-therapist': { step: 2, label: state.language === 'ms' ? 'Teruskan ke Tarikh & Masa' : (state.language === 'zh' ? '下一步：选择时间' : 'Continue to Date & Time') },
        'select-time': { step: 3, label: state.language === 'ms' ? 'Semak Tempahan' : (state.language === 'zh' ? '核对预约详情' : 'Review Reservation') },
    };

    const stepConfig = viewsWithNav[viewId];
    if (stepConfig) {
        nav.classList.add('show-mobile-nav');
        const continueBtn = document.getElementById('mobile-nav-continue-btn');
        const continueLabel = document.getElementById('mobile-nav-continue-label');
        if (continueLabel) continueLabel.textContent = stepConfig.label;
        if (continueBtn) continueBtn.onclick = () => window.nextStep(stepConfig.step);
    } else {
        nav.classList.remove('show-mobile-nav');
    }
}
window.updateMobileBottomNav = updateMobileBottomNav;

// ── BLOG ARTICLE VIEW LOGIC ──────────────────────────────────
export const BLOG_ARTICLES = {
    1: {
        title: {
            en: "Meridian Acupuncture & Qi Balance: Clinical Relief for Chronic Pain",
            ms: "Akupunktur Meridian & Keseimbangan Qi: Kelegaan Klinikal untuk Kesakitan Kronik",
            zh: "经络针灸与气血平衡：缓解慢性疼痛的临床中医疗法"
        },
        meta: {
            en: "TCM Clinical Insight • 5 min read",
            ms: "Wawasan Klinikal TCM • 5 min baca",
            zh: "中医临床见解 • 5 分钟阅读"
        },
        img: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?q=80&w=600&auto=format&fit=crop",
        content: {
            en: `
                <p>In Traditional Chinese Medicine (TCM), pain is understood through the fundamental tenet: <em>"Where there is stagnation, there is pain; where there is free flow, there is no pain"</em> (通则不痛，痛则不通). Chronic musculoskeletal discomfort and migraines often trace back to Qi and blood stagnation along bodily meridians.</p>
                <p>Clinical acupuncture utilizes ultra-fine, sterile filiform needles placed at targeted acupoints to stimulate neuromuscular junctions. Modern biochemical research confirms that needling activates endogenous opioid release (endorphins and enkephalins), dilates local microvasculature, and inhibits nociceptive pain pathways in the spinal dorsal horn.</p>
                <p>Under the care of a licensed TCMPB physician, acupuncture restores systemic homeostasis, alleviates neurovascular tension, and reinforces the body's natural regenerative capacity without pharmaceutical dependence.</p>
            `,
            ms: `
                <p>Dalam Perubatan Tradisional Cina (TCM), kesakitan difahami melalui prinsip asas: <em>"Di mana terdapat sekatan, di situ ada kesakitan; di mana aliran lancar, tiada kesakitan"</em>. Ketidakselesaan muskuloskeletal kronik dan migrain kerap berpunca daripada genangan Qi dan peredaran darah di sepanjang meridian tubuh.</p>
                <p>Akupunktur klinikal menggunakan jarum filiform steril yang amat halus pada titik akupunktur terpilih untuk merangsang persimpangan neuromuskular. Kajian biokimia moden mengesahkan bahawa tusukan jarum mencetuskan pelepasan opioid endogen (endorfin), melancarkan saluran mikrovaskular tempatan, dan melegakan laluan isyarat kesakitan pada saraf tunjang.</p>
                <p>Di bawah bimbingan pengamal TCM berdaftar, rawatan akupunktur memulihkan keseimbangan homeostasis badan, melegakan ketegangan neurovaskular, dan menyokong daya pemulihan semula jadi tubuh tanpa kebergantungan ubat-ubatan.</p>
            `,
            zh: `
                <p>中医理论认为，“通则不痛，痛则不通”。慢性肌肉骨骼疼痛、关节僵硬及偏头痛，往往源于人体经络中的气血瘀滞与气机失调。</p>
                <p>临床针灸采用高规格医用无菌极细毫针，精准施术于特定穴位，刺激神经肌接头。现代生物医学研究表明，针刺能促进机体释放内源性阿片肽（如内啡肽），扩张微循环血管，并在脊髓后角抑制疼痛信号传递。</p>
                <p>在新加坡TCMPB注册中医师的专业施针下，针灸能有效调节脏腑经络、疏通气血、缓解神经血管紧张，激发人体自愈本能。</p>
            `
        }
    },
    2: {
        title: {
            en: "The Four Diagnostic Methods: Pulse, Tongue, and Body Constitution",
            ms: "Empat Kaedah Diagnosis TCM: Nadi, Lidah, dan Perlembagaan Tubuh",
            zh: "中医望闻问切：舌诊、脉诊与九大体质辨识"
        },
        meta: {
            en: "Holistic Health • 4 min read",
            ms: "Kesihatan Holistik • 4 min baca",
            zh: "全方位健康指南 • 4 分钟阅读"
        },
        img: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=600&auto=format&fit=crop",
        content: {
            en: `
                <p>Unlike symptomatic treatments that only suppress isolated indicators, TCM diagnoses each patient through <strong>Wang (Observation), Wen (Listening & Smelling), Wen (Inquiring), and Qie (Palpation)</strong>.</p>
                <p><strong>Tongue Diagnosis:</strong> The tongue reflects the condition of internal Zang-Fu organs. The tongue body reveals the abundance or depletion of Qi and Blood, while tongue coating thickness and color indicate the presence of Pathogenic Dampness, Cold, or Internal Heat.</p>
                <p><strong>Pulse Palpation:</strong> By palpating the radial artery at Cun, Guan, and Chi positions on both wrists at varying depths, our registered physicians evaluate the functional vitality of your Heart, Liver, Spleen, Lung, and Kidney meridians.</p>
            `,
            ms: `
                <p>Berbeza dengan rawatan simptomatik yang sekadar meredakan tanda luaran, diagnosis TCM menilai setiap pesakit secara menyeluruh melalui <strong>Wang (Memerhati), Wen (Mendengar & Menghidu), Wen (Bertanya), dan Qie (Meraba Nadi)</strong>.</p>
                <p><strong>Diagnosis Lidah:</strong> Lidah mencerminkan keadaan organ dalaman Zang-Fu. Badan lidah menzahirkan kecukupan atau kekurangan Qi dan Darah, manakala ketebalan dan warna lapisan lidah menunjukkan kehadiran Lembapan Patogenik, Sejuk, atau Haba Dalaman.</p>
                <p><strong>Pemeriksaan Nadi:</strong> Melalui palpasi arteri radial pada kedudukan Cun, Guan, dan Chi di kedua-dua pergelangan tangan, pengamal TCM kami menilai kecergasan fungsi meridian Jantung, Hati, Limpa, Paru-paru, dan Buah Pinggang.</p>
            `,
            zh: `
                <p>与仅针对单一症状的对症治疗不同，传统中医讲究“望、闻、问、切”四诊合参，辨证求因。</p>
                <p><strong>舌诊探秘：</strong>舌体为脏腑之镜。舌质的荣枯红淡直接反映气血盛衰；舌苔之厚薄、润燥与色泽，则精准揭示体内湿热、虚寒或痰湿之邪。</p>
                <p><strong>寸关尺脉诊：</strong>医师通过切按双侧桡动脉寸、关、尺三部，分轻、中、重三候，深入体察心、肝、脾、肺、肾诸脏腑经络之气机起伏，从而制定精准的个性化调理方案。</p>
            `
        }
    },
    3: {
        title: {
            en: "Cupping & Gua Sha: Releasing Myofascial Adhesions and Blood Stasis",
            ms: "Bekam & Gua Sha: Melegakan Ketegangan Myofasial dan Takungan Darah",
            zh: "拔罐与刮痧疗法：通透经络、祛湿排毒与深层肌膜舒缓"
        },
        meta: {
            en: "Therapeutic Practice • 6 min read",
            ms: "Amalan Terapi • 6 min baca",
            zh: "中医特色理疗 • 6 分钟阅读"
        },
        img: "https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?q=80&w=600&auto=format&fit=crop",
        content: {
            en: `
                <p>Traditional cupping (拔罐) and Gua Sha (刮痧) are cornerstone therapeutic practices in TCM used for centuries to detoxify the interstitial matrix and dispel external wind-dampness pathogens.</p>
                <ul class="list-disc pl-4 space-y-1">
                    <li><strong>Negative Pressure Decompression:</strong> Fire cupping creates suction that gently lifts superficial fascia, stimulating capillary micro-perfusion and accelerating the lymphatic clearance of cellular metabolic debris.</li>
                    <li><strong>Microcirculation Restoration:</strong> Gua Sha uses a smooth buffalo horn or jade tool along myofascial lines, releasing ischemic contractures ("knots") and bringing stagnant, deoxygenated blood (Sha) to the surface.</li>
                    <li><strong>Clinical Aftercare:</strong> Keep treated areas covered and warm, drink warm water, and avoid air-conditioned drafts or cold showers for at least 4 hours post-treatment.</li>
                </ul>
            `,
            ms: `
                <p>Terapi bekam tradisional (拔罐) dan Gua Sha (刮痧) merupakan rawatan asas dalam TCM yang telah diamalkan turun-temurun untuk menyingkirkan patogen angin dan lembapan serta melancarkan saluran darah.</p>
                <ul class="list-disc pl-4 space-y-1">
                    <li><strong>Dekompresi Tekanan Negatif:</strong> Bekam angin atau api menghasilkan sedutan lembut yang mengangkat fasia superfisial, merangsang mikrosirkulasi kapilari dan mempercepatkan penyingkiran sisa metabolik sel melalui sistem limfa.</li>
                    <li><strong>Pemulihan Peredaran Darah:</strong> Gua Sha menggunakan alat tanduk kerbau atau jed licin di sepanjang jalur otot, meleraikan simpulan otot tegang dan membawa darah bertakung ke permukaan kulit untuk diserap semula secara semula jadi.</li>
                    <li><strong>Penjagaan Selepas Rawatan:</strong> Pastikan bahagian yang dirawat sentiasa terlindung dan hangat, minum air suam, serta elakkan hembusan angin penyaman udara terus atau mandi air sejuk selama sekurang-kurangnya 4 jam selepas sesi.</li>
                </ul>
            `,
            zh: `
                <p>拔罐与刮痧是中医疗法中极具代表性的外治法，历经千年传承，具有疏经活血、祛风除湿、清热拔毒之功效。</p>
                <ul class="list-disc pl-4 space-y-1">
                    <li><strong>负压吸附调理：</strong>拔罐形成的温热负压能舒缓深层筋膜粘连，激发局部微循环充血，加速淋巴代谢废物的排出。</li>
                    <li><strong>经络刮拭出痧：</strong>水牛角或天然玉石刮痧板沿经络走向循行施术，可迅速松解肌肉僵硬与结节，促使皮下微小郁血透出（出痧），从而达到化瘀通滞之效。</li>
                    <li><strong>理疗后调护须知：</strong>理疗后毛孔疏松，须注意防风保暖；请饮用适量温开水，4小时内切忌吹强冷风或洗冷水澡。</li>
                </ul>
            `
        }
    }
};

export function openBlogArticle(id) {
    window.openBlogArticle = openBlogArticle;
    const article = BLOG_ARTICLES[id];
    if (!article) return;

    const modal = document.getElementById('blog-article-modal');
    const img = document.getElementById('blog-modal-img');
    const meta = document.getElementById('blog-modal-meta');
    const title = document.getElementById('blog-modal-title');
    const content = document.getElementById('blog-modal-content');

    const lang = state.language || 'en';

    if (modal && img && meta && title && content) {
        img.src = article.img;
        meta.textContent = article.meta[lang] || article.meta['en'];
        title.textContent = article.title[lang] || article.title['en'];
        content.innerHTML = article.content[lang] || article.content['en'];
        modal.classList.remove('hidden');
    }
};

export function closeBlogArticle() {
    window.closeBlogArticle = closeBlogArticle;
    const modal = document.getElementById('blog-article-modal');
    if (modal) {
        modal.classList.add('hidden');
    }
};

// ── PRACTITIONER / PHYSICIAN BIO MODAL HANDLERS ─────────────────────────────
export function openTherapistBio(therapistId) {
    window.openTherapistBio = openTherapistBio;
    const therapist = THERAPISTS[therapistId];
    if (!therapist || therapist.id === 'no-preference') return;

    const modal = document.getElementById('therapist-bio-modal');
    const img = document.getElementById('therapist-modal-img');
    const name = document.getElementById('therapist-modal-name');
    const role = document.getElementById('therapist-modal-role');
    const score = document.getElementById('therapist-modal-score');
    const exp = document.getElementById('therapist-modal-exp');
    const bio = document.getElementById('therapist-modal-bio');
    const specialtiesContainer = document.getElementById('therapist-modal-specialties');
    const certsContainer = document.getElementById('therapist-modal-certs');
    const selectBtn = document.getElementById('therapist-modal-select-btn');

    if (modal && name) {
        if (img) img.src = therapist.image || 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80';
        name.textContent = therapist.name;
        if (role) role.textContent = therapist.role || 'TCM Physician';
        if (score) score.textContent = therapist.rating ? `${therapist.rating} (${therapist.reviews || 50})` : '4.9 (120)';
        if (exp) exp.textContent = therapist.experienceYears || '10+ Years Clinical Experience';
        if (bio) bio.textContent = therapist.fullBio || therapist.description;

        // Populate specialties badges
        if (specialtiesContainer) {
            specialtiesContainer.innerHTML = (therapist.specialties || []).map(s => `
                <span class="px-2.5 py-1 bg-[#164e3f]/10 text-[#164e3f] font-bold text-[10px] rounded-full uppercase tracking-wider">${s}</span>
            `).join('');
        }

        // Populate certifications list
        if (certsContainer) {
            certsContainer.innerHTML = (therapist.certifications || [
                'Registered TCM Physician (TCMPB Singapore)',
                'Bachelor of Traditional Chinese Medicine (BUCM)',
                'Certified Clinical Acupuncturist & Tuina Specialist'
            ]).map(c => `
                <div class="flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <span class="material-symbols-outlined text-[#164e3f] text-base">verified</span>
                    <span class="font-medium text-slate-700 text-xs">${c}</span>
                </div>
            `).join('');
        }

        // Wire select button
        if (selectBtn) {
            selectBtn.onclick = function() {
                if (window.selectTherapist) {
                    window.selectTherapist(therapist.id);
                }
                closeTherapistBio();
            };
        }

        modal.classList.remove('hidden');
    }
};

export function closeTherapistBio() {
    window.closeTherapistBio = closeTherapistBio;
    const modal = document.getElementById('therapist-bio-modal');
    if (modal) {
        modal.classList.add('hidden');
    }
};

// ── LEAVE REVIEW / RATING MODAL HANDLERS ─────────────────────
export let activeReviewBookingId = null;
export let currentReviewRating = 5;

export function setReviewRating(rating) {
    currentReviewRating = rating;
    const picker = document.getElementById('review-star-picker');
    const label = document.getElementById('review-rating-label');

    const labels = {
        1: '1.0 - Needs Improvement',
        2: '2.0 - Fair Session',
        3: '3.0 - Satisfactory',
        4: '4.0 - Very Good',
        5: '5.0 - Outstanding'
    };

    if (picker) {
        const btns = picker.querySelectorAll('button');
        btns.forEach((btn, index) => {
            const icon = btn.querySelector('.material-symbols-outlined');
            if (icon) {
                if (index < rating) {
                    icon.classList.add('fill-current');
                    btn.className = 'star-btn hover:scale-110 transition-transform text-amber-400';
                } else {
                    icon.classList.remove('fill-current');
                    btn.className = 'star-btn hover:scale-110 transition-transform text-slate-300';
                }
            }
        });
    }

    if (label) {
        label.textContent = labels[rating] || `${rating}.0`;
    }
}
window.setReviewRating = setReviewRating;

export function openLeaveReviewModal(bookingId) {
    if (!state.bookings) {
        state.bookings = [];
    }

    let booking = state.bookings.find(b => String(b.id) === String(bookingId));
    
    // Fallback if booking not found in state
    if (!booking) {
        booking = {
            id: bookingId || 'booking-2',
            serviceName: 'Acupuncture & Meridian Therapy',
            therapist: 'Physician Chen Wei Lin',
            status: 'Completed'
        };
        state.bookings.push(booking);
    }

    activeReviewBookingId = booking.id;
    currentReviewRating = 5;

    const modal = document.getElementById('leave-review-modal');
    const subtitle = document.getElementById('review-modal-subtitle');
    const input = document.getElementById('review-comments-input');

    if (modal) {
        if (subtitle) {
            subtitle.textContent = `Share your clinical feedback for ${booking.serviceName} with ${booking.therapist}`;
        }
        if (input) input.value = '';
        setReviewRating(5);
        modal.classList.remove('hidden');
        modal.style.display = 'flex';
    } else {
        console.error('leave-review-modal element not found in DOM!');
    }
}
window.openLeaveReviewModal = openLeaveReviewModal;

export function closeLeaveReviewModal() {
    const modal = document.getElementById('leave-review-modal');
    if (modal) {
        modal.classList.add('hidden');
        modal.style.display = 'none';
    }
}
window.closeLeaveReviewModal = closeLeaveReviewModal;

export function submitTreatmentReview() {
    if (!activeReviewBookingId) return;

    if (!state.bookings) state.bookings = [];
    let booking = state.bookings.find(b => String(b.id) === String(activeReviewBookingId));
    const input = document.getElementById('review-comments-input');
    const commentText = input ? input.value.trim() : '';

    if (!booking) {
        booking = {
            id: activeReviewBookingId,
            serviceName: 'TCM Clinical Session',
            therapist: 'Physician Chen Wei Lin',
            status: 'Completed'
        };
        state.bookings.push(booking);
    }

    booking.hasReviewed = true;
    booking.review = {
        rating: currentReviewRating,
        comment: commentText || 'Excellent clinical consultation and effective acupuncture relief!',
        date: 'Just now'
    };

    saveState();
    closeLeaveReviewModal();

    showNotification(
        state.language === 'ms' 
            ? 'Terima kasih! Ulasan klinikal anda telah berjaya dihantar.' 
            : (state.language === 'zh' ? '非常感谢！您的调理反馈已成功提交。' : 'Thank you! Your clinical review has been submitted successfully.'), 
        'success'
    );

    if (state.currentView === 'booking-history') {
        renderBookingHistoryView();
    }
}
window.submitTreatmentReview = submitTreatmentReview;

// E-Gift Card Handlers
export let selectedGiftCardAmount = 50;

export function openSendGiftCardModal() {
    const modal = document.getElementById('send-giftcard-modal');
    if (modal) {
        modal.classList.remove('hidden');
        modal.style.display = 'flex';
    }
}
window.openSendGiftCardModal = openSendGiftCardModal;

export function closeSendGiftCardModal() {
    const modal = document.getElementById('send-giftcard-modal');
    if (modal) {
        modal.classList.add('hidden');
        modal.style.display = 'none';
    }
}
window.closeSendGiftCardModal = closeSendGiftCardModal;

export function setGiftAmount(amount) {
    selectedGiftCardAmount = amount;
    document.querySelectorAll('.gift-amount-btn').forEach(btn => {
        if (btn.textContent.includes(String(amount))) {
            btn.className = 'gift-amount-btn py-2 rounded-xl bg-[#164e3f] text-white text-xs font-bold transition-all shadow-sm';
        } else {
            btn.className = 'gift-amount-btn py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:border-[#164e3f] hover:bg-[#164e3f]/5 transition-all';
        }
    });
}
window.setGiftAmount = setGiftAmount;

export function submitSendGiftCard() {
    const nameInput = document.getElementById('giftcard-recipient-name');
    const emailInput = document.getElementById('giftcard-recipient-email');
    const msgInput = document.getElementById('giftcard-message-input');

    const name = nameInput ? nameInput.value.trim() : '';
    const email = emailInput ? emailInput.value.trim() : '';
    const message = msgInput ? msgInput.value.trim() : '';

    if (!name || !email) {
        showNotification(state.language === 'ms' ? 'Sila isi nama dan e-mel penerima.' : (state.language === 'zh' ? '请填写收件人姓名与电邮。' : 'Please enter recipient name and email.'), 'error');
        return;
    }

    const currency = currentTenant?.currency || 'SGD';
    const amount = parseFloat(selectedGiftCardAmount) || 50;
    if (state.walletBalance < amount) {
        showNotification(state.language === 'ms' ? `Baki dompet anda tidak mencukupi (${currency} ${state.walletBalance.toFixed(2)}).` : (state.language === 'zh' ? `您的钱包余额不足 (${currency} ${state.walletBalance.toFixed(2)})。` : `Insufficient wallet balance (${currency} ${state.walletBalance.toFixed(2)}).`), 'error');
        return;
    }

    state.walletBalance -= amount;
    state.transactions.unshift({
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
        description: `E-Gift Card to ${name} (${email})`,
        amount: -amount,
        status: 'Completed'
    });

    state.notifications.unshift({
        id: 'notif-' + Date.now(),
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
        text: state.language === 'ms'
            ? `E-Gift Card ${currency} ${amount.toFixed(2)} berjaya dihantar kepada ${name} (${email}).`
            : (state.language === 'zh'
                ? `电子礼品卡 ${currency} ${amount.toFixed(2)} 已成功赠予 ${name} (${email})。`
                : `E-Gift Card ${currency} ${amount.toFixed(2)} successfully sent to ${name} (${email}).`)
    });

    closeSendGiftCardModal();

    if (nameInput) nameInput.value = '';
    if (emailInput) emailInput.value = '';
    if (msgInput) msgInput.value = '';

    const successMsg = state.language === 'ms'
        ? `E-Gift Card bernilai ${currency} ${amount.toFixed(2)} telah berjaya dikirim kepada ${name}!`
        : (state.language === 'zh' ? `面值 ${currency} ${amount.toFixed(2)} 的电子礼品卡已成功发送给 ${name}！` : `E-Gift Card of ${currency} ${amount.toFixed(2)} successfully sent to ${name}!`);
    showNotification(successMsg, 'success');
    renderWalletView();
    saveState();
}
window.submitSendGiftCard = submitSendGiftCard;

// Redeem Loyalty Points Handlers
export function openRedeemPointsModal() {
    const modal = document.getElementById('redeem-points-modal');
    if (modal) {
        modal.classList.remove('hidden');
        modal.style.display = 'flex';
    }
}
window.openRedeemPointsModal = openRedeemPointsModal;

export function closeRedeemPointsModal() {
    const modal = document.getElementById('redeem-points-modal');
    if (modal) {
        modal.classList.add('hidden');
        modal.style.display = 'none';
    }
}
window.closeRedeemPointsModal = closeRedeemPointsModal;

export function redeemRewardItem(pointsNeeded, creditReward, title) {
    if (!state.loyaltyPoints) state.loyaltyPoints = 350;

    const currency = currentTenant?.currency || 'SGD';

    if (state.loyaltyPoints < pointsNeeded) {
        showNotification(
            state.language === 'ms'
                ? `Mata ganjaran kesihatan anda tidak mencukupi (${state.loyaltyPoints} Pts / ${pointsNeeded} Pts).`
                : (state.language === 'zh' ? `您的积分不足 (${state.loyaltyPoints} 积分 / 所需 ${pointsNeeded} 积分)。` : `Insufficient Reward Points (${state.loyaltyPoints} Pts / ${pointsNeeded} Pts).`),
            'error'
        );
        return;
    }

    state.loyaltyPoints -= pointsNeeded;
    state.walletBalance += creditReward;

    state.transactions.unshift({
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
        description: `Rewards Redeem: ${title}`,
        amount: creditReward,
        status: 'Completed'
    });

    state.notifications.unshift({
        id: 'notif-' + Date.now(),
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
        text: state.language === 'ms'
            ? `Berjaya menukar ${pointsNeeded} Pts untuk ${title} (+${currency} ${creditReward.toFixed(2)} Baki).`
            : (state.language === 'zh'
                ? `成功使用 ${pointsNeeded} 积分兑换 ${title} (+${currency} ${creditReward.toFixed(2)} 余额)。`
                : `Successfully redeemed ${pointsNeeded} Pts for ${title} (+${currency} ${creditReward.toFixed(2)} Balance).`)
    });

    closeRedeemPointsModal();

    const successMsg = state.language === 'ms'
        ? `Tahniah! ${title} telah ditukar. Baki dompet anda bertambah ${currency} ${creditReward.toFixed(2)}!`
        : (state.language === 'zh'
            ? `恭喜！${title} 兑换成功。您的钱包余额已增加 ${currency} ${creditReward.toFixed(2)}！`
            : `Congratulations! ${title} redeemed. ${currency} ${creditReward.toFixed(2)} added to your wallet!`);

    showNotification(successMsg, 'success');
    renderWalletView();
    saveState();
}
window.redeemRewardItem = redeemRewardItem;

// ── CONTACT FORM HANDLER ─────────────────────────────
export function submitContactForm() {
    window.submitContactForm = submitContactForm;
    const nameInput = document.getElementById('contact-name');
    const emailInput = document.getElementById('contact-email');
    const msgInput = document.getElementById('contact-message');
    const subjectInput = document.getElementById('contact-subject');

    if (nameInput) nameInput.value = '';
    if (emailInput) emailInput.value = '';
    if (msgInput) msgInput.value = '';
    if (subjectInput) subjectInput.value = '';

    showNotification(
        state.language === 'ms' 
            ? 'Terima kasih! Mesej anda telah dihantar. Pihak klinik TCM kami akan menghubungi anda segera.' 
            : (state.language === 'zh' ? '谢谢！您的咨询讯息已发送。我们中医团队将尽快与您联系。' : 'Thank you! Your message has been sent. Our TCM clinic team will get back to you shortly.'), 
        'success'
    );
}
window.submitContactForm = submitContactForm;

// ── PRACTITIONER / PHYSICIAN PROFILE MODAL HANDLERS ─────────────────────────────
export function openTherapistModal(therapistId) {
    window.openTherapistModal = openTherapistModal;
    const therapist = THERAPISTS[therapistId];
    if (!therapist || therapist.id === 'no-preference') return;

    const modal = document.getElementById('modal-therapist-profile');
    const content = document.getElementById('therapist-modal-content');
    
    const img = document.getElementById('tp-image');
    const name = document.getElementById('tp-name');
    const role = document.getElementById('tp-role');
    const rating = document.getElementById('tp-rating');
    const exp = document.getElementById('tp-experience');
    const bio = document.getElementById('tp-bio');
    const certsContainer = document.getElementById('tp-certs');
    const selectBtn = document.getElementById('tp-select-btn');

    if (modal && name) {
        if (img) img.src = therapist.image || 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80';
        name.textContent = therapist.name;
        if (role) role.textContent = therapist.role || 'TCM Physician';
        if (rating) rating.textContent = therapist.rating ? `${therapist.rating} (${therapist.reviews || 50} reviews)` : '4.9 (120 reviews)';
        if (exp) exp.textContent = therapist.experienceYears || '10+ Years Clinical Experience';
        if (bio) bio.textContent = therapist.fullBio || therapist.description;

        // Populate certifications list
        if (certsContainer) {
            certsContainer.innerHTML = (therapist.certifications || [
                'Registered TCM Physician (TCMPB Singapore)',
                'Bachelor of Traditional Chinese Medicine (BUCM)',
                'Certified Clinical Acupuncturist & Tuina Specialist'
            ]).map(c => `
                <li class="flex items-center gap-2">
                    <span class="material-symbols-outlined text-[#164e3f] text-sm font-bold">check_circle</span>
                    ${c}
                </li>
            `).join('');
        }

        // Wire select button
        if (selectBtn) {
            selectBtn.onclick = function() {
                if (window.selectTherapist) {
                    window.selectTherapist(therapist.id);
                }
                closeTherapistModal();
            };
        }

        modal.classList.remove('hidden');
        modal.style.display = 'flex';
        // Trigger animation
        setTimeout(() => {
            if (content) {
                content.classList.remove('scale-95', 'opacity-0');
                content.classList.add('scale-100', 'opacity-100');
            }
        }, 10);
    }
}

export function closeTherapistModal() {
    window.closeTherapistModal = closeTherapistModal;
    const modal = document.getElementById('modal-therapist-profile');
    const content = document.getElementById('therapist-modal-content');
    
    if (content) {
        content.classList.remove('scale-100', 'opacity-100');
        content.classList.add('scale-95', 'opacity-0');
    }
    
    setTimeout(() => {
        if (modal) {
            modal.classList.add('hidden');
            modal.style.display = 'none';
        }
    }, 300);
}

window.toggleMobileMenu = toggleMobileMenu;
window.closeMobileMenu = closeMobileMenu;
window.updateMobileMenuUI = updateMobileMenuUI;
window.handleMobileMenuAuth = handleMobileMenuAuth;
window.openBlogArticle = openBlogArticle;
window.closeBlogArticle = closeBlogArticle;
window.openTherapistBio = openTherapistBio;
window.closeTherapistBio = closeTherapistBio;
window.openTherapistModal = openTherapistModal;
window.closeTherapistModal = closeTherapistModal;

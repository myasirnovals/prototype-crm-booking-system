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
        document.title = `${currentTenant.name} — Luxury Spa Sanctuary`;

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

        // 4. About Section Sanctuary Name
        const aboutTitle = document.querySelector('.font-serif.text-xl.font-bold.block.mb-1');
        if (aboutTitle) aboutTitle.textContent = `${currentTenant.name} Sanctuary`;

        // 5. WhatsApp Integration
        if (currentTenant.phone) {
            const cleanPhone = currentTenant.phone.replace(/[^0-9]/g, '');
            window.__branchWhatsAppUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent('Hello ' + currentTenant.name + ', I would like to inquire about spa appointments.')}`;
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
        userroleEl.textContent = 'Customer';
        
        // Show avatar circle EV
        const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
        avatarContainer.innerHTML = `<span class="font-bold text-sm text-[#3c4c2b]">${initials}</span>`;
        avatarContainer.className = "w-12 h-12 rounded-full bg-[#50613f]/15 flex items-center justify-center overflow-hidden";
        
        // Auth button as sign out
        authBtn.innerHTML = `<span class="material-symbols-outlined text-[20px]">logout</span>Sign Out`;
        authBtn.className = "flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-50 text-red-600 hover:text-red-700 transition-colors cursor-pointer text-sm font-semibold text-left";
    } else {
        usernameEl.textContent = 'Guest User';
        userroleEl.textContent = 'Not Logged In';
        avatarContainer.innerHTML = `<span class="material-symbols-outlined text-[24px]">person</span>`;
        avatarContainer.className = "w-12 h-12 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center overflow-hidden";
        
        // Auth button as sign in
        authBtn.innerHTML = `<span class="material-symbols-outlined text-[20px]">login</span>Sign In`;
        authBtn.className = "flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#50613f]/10 text-[#50613f] transition-colors cursor-pointer text-sm font-semibold text-left";
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
    const nav = document.getElementById('mobile-bottom-nav');
    const backBtn = document.getElementById('mobile-back-btn');
    const continueBtn = document.getElementById('mobile-continue-btn');
    if (!nav || !backBtn || !continueBtn) return;

    const bookingSteps = {
        'select-service':   { step: 1, back: () => resetBookingFlow(),          continueLabel: 'Continue' },
        'select-therapist': { step: 2, back: () => navigateTo('select-service'), continueLabel: 'Continue' },
        'select-time':      { step: 3, back: () => navigateTo('select-therapist'), continueLabel: 'Continue' },
    };

    const stepConfig = bookingSteps[viewId];
    if (stepConfig) {
        nav.classList.add('show-mobile-nav');
        // Wire up Back
        backBtn.onclick = stepConfig.back;
        // Wire up Continue (reuse existing nextStep validation)
        continueBtn.textContent = '';
        continueBtn.innerHTML = `${stepConfig.continueLabel} <span class="material-symbols-outlined text-[18px]">arrow_forward</span>`;
        continueBtn.onclick = () => window.nextStep(stepConfig.step);
    } else {
        nav.classList.remove('show-mobile-nav');
    }
}
// Expose so navigateTo (declared before this function) can call it
window.updateMobileBottomNav = updateMobileBottomNav;

// ── BLOG ARTICLE VIEW LOGIC ──────────────────────────────────
export const BLOG_ARTICLES = {
    1: {
        title: {
            en: "The Science of Relaxation: How Spa Treatments Lower Cortisol",
            ms: "Sains Relaksasi: Bagaimana Rawatan Spa Mengurangkan Kortisol"
        },
        meta: {
            en: "Mindfulness • 5 min read",
            ms: "Minda Sedar • 5 min baca"
        },
        img: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=600&auto=format&fit=crop",
        content: {
            en: `
                <p>Cortisol, often referred to as the "stress hormone," is essential for managing our fight-or-flight response. However, chronically high levels of cortisol due to work stress, lack of sleep, and busy lifestyles can lead to sleep disorders, immune system suppression, and muscle tension.</p>
                <p>Scientific studies show that tactile stimulation, such as moderate-pressure massage, prompts a physiological shift in the body. When you receive a deep tissue massage or stone therapy, sensory receptors under the skin send signals to the brain to decrease active sympathetic nervous activity (the flight response) and activate the parasympathetic nervous system (the rest-and-digest response).</p>
                <p>In addition, specialized spa experiences incorporate elements of aromatherapy (such as lavender and chamomile) and soundscapes, which trigger emotional calming centers in the amygdala. This holistic approach has been measured to reduce salivary cortisol levels by up to 31% after a single 60-minute session, while simultaneously increasing dopamine and serotonin levels. Taking time for a spa treatment isn't just pampering—it's a clinically supported path to hormonal balance and peace of mind.</p>
            `,
            ms: `
                <p>Kortisol, sering disebut sebagai "hormon stres," adalah penting untuk menguruskan respon lawan-atau-lari kita. Walau bagaimanapun, tahap kortisol yang kronik tinggi akibat tekanan kerja, kurang tidur, dan gaya hidup sibuk boleh menyebabkan gangguan tidur, kelemahan sistem imun, dan ketegangan otot.</p>
                <p>Kajian saintifik menunjukkan bahawa rangsangan sentuhan, seperti urutan tekanan sederhana, mencetuskan perubahan fisiologi dalam badan. Apabila anda menerima urutan tisu mendalam atau terapi batu, reseptor deria di bawah kulit menghantar isyarat ke otak untuk mengurangkan aktiviti saraf simpatetik aktif dan mengaktifkan sistem saraf parasimpatetik (respon rehat-dan-cerna).</p>
                <p>Di samping itu, pengalaman spa khusus menggabungkan elemen aromaterapi (seperti lavender dan chamomile) dan bunyi tenang, yang merangsang pusat penenang emosi di amigdala. Pendekatan holistik ini telah terbukti mengurangkan tahap kortisol air liur sehingga 31% selepas satu sesi 60 minit, sambil meningkatkan tahap dopamin dan serotonin secara serentak. Meluangkan masa untuk rawatan spa bukan sekadar memanjakan diri—ia adalah langkah yang disokong secara klinikal untuk keseimbangan hormon dan ketenangan fikiran.</p>
            `
        }
    },
    2: {
        title: {
            en: "Deep Tissue vs. Aromatherapy: Which Massage is Right for You?",
            ms: "Urutan Tisu Mendalam vs. Aromaterapi: Mana Satu Sesuai Untuk Anda?"
        },
        meta: {
            en: "Therapy Guide • 4 min read",
            ms: "Panduan Terapi • 4 min baca"
        },
        img: "https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?q=80&w=600&auto=format&fit=crop",
        content: {
            en: `
                <p>Choosing the right massage can significantly impact your spa experience. Two of our most popular offerings, Deep Tissue Massage and Aromatherapy Massage, target completely different aspects of your well-being.</p>
                <p><strong>Deep Tissue Massage</strong> focuses on realigning deep layers of muscles and connective tissue. It is highly recommended for individuals experiencing chronic aches, pain, or stiffness in areas like the neck, upper back, and shoulders. During this therapy, the therapist uses slow, deliberate strokes and intense direct pressure to break down adhesions (muscle knots).</p>
                <p><strong>Aromatherapy Massage</strong>, on the other hand, is designed for emotional and physical relaxation. It uses light, sweeping strokes combined with customized essential oil blends extracted from herbs and flowers. If you are struggling with emotional stress, anxiety, or insomnia, Aromatherapy is the perfect choice to soothe your senses and melt away daily tension without intense muscle manipulation.</p>
            `,
            ms: `
                <p>Memilih urutan yang betul boleh memberi kesan ketara kepada pengalaman spa anda. Dua daripada tawaran paling popular kami, Urutan Tisu Mendalam dan Urutan Aromaterapi, menyasarkan aspek kesejahteraan diri yang berbeza.</p>
                <p><strong>Urutan Tisu Mendalam</strong> menumpukan pada menyelaraskan semula lapisan dalam otot dan tisu penghubung. Ia sangat disyorkan untuk individu yang mengalami sakit kronik, ketegangan atau kekakuan di bahagian leher, belakang bahagian atas, dan bahu. Semasa terapi ini, terapis menggunakan tekanan langsung yang kuat untuk merungkaikan simpulan otot.</p>
                <p><strong>Urutan Aromaterapi</strong> pula direka untuk relaksasi emosi dan fizikal. Ia menggunakan sapuan ringan yang digabungkan dengan campuran minyak pati tersuai yang diekstrak daripada herba dan bunga. Jika anda bergelut dengan tekanan emosi, kebimbangan atau insomnia, Aromaterapi adalah pilihan terbaik untuk menenangkan deria anda tanpa manipulasi otot yang kuat.</p>
            `
        }
    },
    3: {
        title: {
            en: "Post-Spa Aftercare: 5 Habits to Maximize Treatment Benefits",
            ms: "Penjagaan Selepas Spa: 5 Tabiat Memaksimumkan Manfaat Rawatan"
        },
        meta: {
            en: "Wellness Tips • 6 min read",
            ms: "Tips Kesihatan • 6 min baca"
        },
        img: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?q=80&w=600&auto=format&fit=crop",
        content: {
            en: `
                <p>To prolong the post-spa glow and muscular relief, what you do after your session is just as important as the treatment itself. Follow these five aftercare habits:</p>
                <ul class="list-disc pl-4 space-y-1">
                    <li><strong>1. Rehydrate Immediately:</strong> Massages release metabolic waste from muscle tissues into your circulation. Drinking plenty of water helps flush out these toxins and prevents soreness.</li>
                    <li><strong>2. Take a Warm Bath:</strong> Continuing the heat therapy at home with Epsom salts helps relax remaining muscle fibers and softens the skin.</li>
                    <li><strong>3. Eat a Light Meal:</strong> Since digestion slows down during deep relaxation, avoid heavy, greasy meals. Opt for fresh fruits, salads, or clear soups.</li>
                    <li><strong>4. Postpone Intense Workouts:</strong> Give your muscles at least 24 hours to recover before engaging in heavy lifting or high-intensity training.</li>
                    <li><strong>5. Unplug and Rest:</strong> Allow your mind to stay calm by limiting screen time and getting at least 8 hours of sleep.</li>
                </ul>
            `,
            ms: `
                <p>Untuk memanjakan diri lebih lama dan mengekalkan kelegaan otot selepas spa, apa yang anda lakukan selepas sesi anda adalah sama pentingnya dengan rawatan itu sendiri. Ikuti lima tabiat penjagaan selepas spa ini:</p>
                <ul class="list-disc pl-4 space-y-1">
                    <li><strong>1. Hidrat Semula Segera:</strong> Urutan melepaskan bahan buangan metabolik dari tisu otot ke dalam peredaran darah anda. Minum banyak air membantu menyingkirkan toksin ini dan mengelakkan lenguh.</li>
                    <li><strong>2. Mandi Air Hangat:</strong> Meneruskan terapi haba di rumah dengan garam Epsom membantu melegakan baki serat otot dan melembutkan kulit.</li>
                    <li><strong>3. Makan Makanan Ringan:</strong> Memandangkan pencernaan menjadi perlahan semasa relaksasi mendalam, elakkan makanan berat yang berminyak. Pilih buah-buahan segar, salad, atau sup kosong.</li>
                    <li><strong>4. Tangguhkan Senaman Berat:</strong> Beri otot anda sekurang-kurangnya 24 jam untuk pulih sebelum melakukan aktiviti angkat berat atau latihan berintensiti tinggi.</li>
                    <li><strong>5. Berehat dan Lapang Fikiran:</strong> Biarkan minda anda kekal tenang dengan mengehadkan masa skrin dan mendapatkan sekurang-kurangnya 8 jam tidur.</li>
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

// ── THERAPIST BIO MODAL HANDLERS ─────────────────────────────
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
        if (role) role.textContent = therapist.role || 'Therapist';
        if (score) score.textContent = therapist.rating ? `${therapist.rating} (${therapist.reviews || 50})` : '4.9 (120)';
        if (exp) exp.textContent = therapist.experienceYears || '5+ Years Experience';
        if (bio) bio.textContent = therapist.fullBio || therapist.description;

        // Populate specialties badges
        if (specialtiesContainer) {
            specialtiesContainer.innerHTML = (therapist.specialties || []).map(s => `
                <span class="px-2.5 py-1 bg-primary/10 text-primary font-bold text-[10px] rounded-full uppercase tracking-wider">${s}</span>
            `).join('');
        }

        // Populate certifications list
        if (certsContainer) {
            certsContainer.innerHTML = (therapist.certifications || [
                'Certified International Spa Practitioner (CISP)',
                'Traditional Healing Massage Diploma'
            ]).map(c => `
                <div class="flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <span class="material-symbols-outlined text-[#50613f] text-base">verified</span>
                    <span class="font-medium text-slate-700 text-xs">${c}</span>
                </div>
            `).join('');
        }

        // Wire select button
        if (selectBtn) {
            selectBtn.onclick = function() {
                selectTherapist(therapist.id);
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
    console.log('Opening leave review modal for booking:', bookingId);

    if (!state.bookings) {
        state.bookings = [];
    }

    let booking = state.bookings.find(b => String(b.id) === String(bookingId));
    
    // Fallback if booking not found in state
    if (!booking) {
        booking = {
            id: bookingId || 'booking-2',
            serviceName: 'Aromatherapy Massage',
            therapist: 'Sari',
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
            subtitle.textContent = `Share your feedback for ${booking.serviceName} with ${booking.therapist}`;
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
            serviceName: 'Spa Treatment',
            therapist: 'Therapist',
            status: 'Completed'
        };
        state.bookings.push(booking);
    }

    booking.hasReviewed = true;
    booking.review = {
        rating: currentReviewRating,
        comment: commentText || 'Wonderful session and deeply relaxing experience!',
        date: 'Just now'
    };

    saveState();
    closeLeaveReviewModal();

    showNotification(
        state.language === 'ms' 
            ? 'Terima kasih! Ulasan anda telah berjaya dihantar.' 
            : 'Thank you! Your treatment review has been submitted successfully.', 
        'success'
    );

    if (state.currentView === 'booking-history') {
        renderBookingHistoryView();
    }
}
window.submitTreatmentReview = submitTreatmentReview;

// E-Gift Card Handlers (Task 6)
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
            btn.className = 'gift-amount-btn py-2 rounded-xl bg-[#50613f] text-white text-xs font-bold transition-all shadow-sm';
        } else {
            btn.className = 'gift-amount-btn py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:border-[#50613f] hover:bg-[#50613f]/5 transition-all';
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
        showNotification(state.language === 'ms' ? 'Sila isi nama dan e-mel penerima.' : 'Please enter recipient name and email.', 'error');
        return;
    }

    const amount = parseFloat(selectedGiftCardAmount) || 50;
    if (state.walletBalance < amount) {
        showNotification(state.language === 'ms' ? `Baki dompet anda tidak mencukupi (MYR ${state.walletBalance.toFixed(2)}).` : `Insufficient wallet balance (MYR ${state.walletBalance.toFixed(2)}).`, 'error');
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
            ? `E-Gift Card MYR ${amount.toFixed(2)} berjaya dihantar kepada ${name} (${email}).`
            : `E-Gift Card MYR ${amount.toFixed(2)} successfully sent to ${name} (${email}).`
    });

    closeSendGiftCardModal();

    if (nameInput) nameInput.value = '';
    if (emailInput) emailInput.value = '';
    if (msgInput) msgInput.value = '';

    const successMsg = state.language === 'ms'
        ? `E-Gift Card bernilai MYR ${amount.toFixed(2)} telah berjaya dikirim kepada ${name}!`
        : `E-Gift Card of MYR ${amount.toFixed(2)} successfully sent to ${name}!`;
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

    if (state.loyaltyPoints < pointsNeeded) {
        showNotification(
            state.language === 'ms'
                ? `Poin Serenity anda tidak mencukupi (${state.loyaltyPoints} Pts / ${pointsNeeded} Pts).`
                : `Insufficient Serenity Points (${state.loyaltyPoints} Pts / ${pointsNeeded} Pts).`,
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
            ? `Berjaya menukar ${pointsNeeded} Pts untuk ${title} (+MYR ${creditReward.toFixed(2)} Saldo).`
            : `Successfully redeemed ${pointsNeeded} Pts for ${title} (+MYR ${creditReward.toFixed(2)} Balance).`
    });

    closeRedeemPointsModal();

    const successMsg = state.language === 'ms'
        ? `Tahniah! ${title} telah ditukar. Saldo dompet anda bertambah MYR ${creditReward.toFixed(2)}!`
        : `Congratulations! ${title} redeemed. MYR ${creditReward.toFixed(2)} added to your wallet!`;

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
            ? 'Terima kasih! Mesej anda telah dihantar. Kami akan menghubungi anda segera.' 
            : 'Thank you! Your message has been sent. We will get back to you shortly.', 
        'success'
    );
}
window.submitContactForm = submitContactForm;

// ── THERAPIST PROFILE MODAL HANDLERS ─────────────────────────────
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
        if (role) role.textContent = therapist.role || 'Therapist';
        if (rating) rating.textContent = therapist.rating ? `${therapist.rating} (${therapist.reviews || 50} reviews)` : '4.9 (120 reviews)';
        if (exp) exp.textContent = therapist.experienceYears || '5+ Years';
        if (bio) bio.textContent = therapist.fullBio || therapist.description;

        // Populate certifications list
        if (certsContainer) {
            certsContainer.innerHTML = (therapist.certifications || [
                'Certified International Spa Practitioner (CISP)',
                'Traditional Healing Massage Diploma'
            ]).map(c => `
                <li class="flex items-center gap-2">
                    <span class="material-symbols-outlined text-[#50613f] text-sm font-bold">check_circle</span>
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

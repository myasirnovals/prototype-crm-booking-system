import { tenantId, currentTenant, DEFAULT_TENANTS } from '../models/Tenant.js';
import { SERVICES, THERAPISTS, getSharedData, syncServices, syncTherapists } from '../models/Database.js';
import { TRANSLATIONS, t, getServiceTranslation, translateStaticHtml, toggleLanguage } from '../models/Translations.js';
import { DEFAULT_STATE, state, loadState, saveState } from '../models/State.js';
import { isLoggedIn, updateNavbarAuth } from '../controllers/AuthController.js';
import { navigateTo, updateTenantLinks, updateNavbarActiveState, updateStepperUI, navigateToAllServicesWithFilter } from '../controllers/Router.js';
import { renderSidebarSummary, renderSuccessView } from '../views/SidebarSummary.js';
import { resetBookingFlow, nextStep, prevStep } from '../controllers/BookingController.js';
import { showNotification } from '../views/Toast.js';
import { renderProfileView, renderWalletView, renderTopupView, renderPersonalDetailsView, renderBookingHistoryView, renderNotificationsView, renderPrivacySecurityView, renderRescheduleView } from '../views/ProfileViews.js';
import { renderAllServicesView } from '../views/CatalogViews.js';
import { openPaymentMethodsModal, closePaymentMethodsModal } from '../views/PaymentModal.js';
import { renderBookPackageView, renderActivePackagesView } from '../views/PackageViews.js';

// 4. RENDERERS
export function renderActiveViewContents(viewId) {
    try {
        // Selalu perbarui header wallet di setiap navigasi
        updateHeaderWalletDisplay();

        if (viewId === 'home') {
            renderHomeView();
        } else if (viewId === 'dashboard') {
            renderDashboardView();
        } else if (viewId === 'about') {
            renderAboutView();
        } else if (viewId === 'services-catalog') {
            renderServicesCatalogView();
        } else if (viewId === 'select-service') {
            renderSelectServiceView();
        } else if (viewId === 'select-therapist') {
            renderSelectTherapistView();
        } else if (viewId === 'select-time') {
            renderSelectTimeView();
        } else if (viewId === 'confirm-booking') {
            renderConfirmBookingView();
        } else if (viewId === 'success') {
            renderSuccessView();
        } else if (viewId === 'profile') {
            renderProfileView();
        } else if (viewId === 'wallet') {
            renderWalletView();
        } else if (viewId === 'topup') {
            renderTopupView();
        } else if (viewId === 'personal-details') {
            renderPersonalDetailsView();
        } else if (viewId === 'booking-history') {
            renderBookingHistoryView();
        } else if (viewId === 'notifications') {
            renderNotificationsView();
        } else if (viewId === 'privacy-security') {
            renderPrivacySecurityView();
        } else if (viewId === 'all-services') {
            renderAllServicesView();
        } else if (viewId === 'book-package') {
            renderBookPackageView();
        } else if (viewId === 'active-packages') {
            renderActivePackagesView();
        } else if (viewId === 'reschedule') {
            renderRescheduleView();
        }
    } catch (err) {
        console.error(`[SPA Error] Failed to render view '${viewId}':`, err);
        const container = document.getElementById(`${viewId}-container`) || document.getElementById(`view-${viewId}`);
        if (container) {
            container.innerHTML = `
                <div class="max-w-xl mx-auto my-12 p-8 bg-red-50 border border-red-200 rounded-3xl text-center shadow-sm">
                    <span class="material-symbols-outlined text-red-500 text-5xl mb-3">error_outline</span>
                    <h3 class="font-serif text-xl font-bold text-red-900 mb-2">Gagal Memuat Halaman (${viewId})</h3>
                    <p class="text-xs text-red-700 font-medium mb-4">${err.message || err}</p>
                    <div class="bg-white p-3 rounded-xl border border-red-200 text-left mb-6 overflow-x-auto">
                        <code class="text-[11px] text-red-800 font-mono block whitespace-pre-wrap">${err.stack || err}</code>
                    </div>
                    <div class="flex items-center justify-center gap-3">
                        <button onclick="location.reload()" class="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-sm">
                            Muat Ulang Halaman
                        </button>
                        <button onclick="navigateTo('home')" class="bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold text-xs px-5 py-2.5 rounded-xl transition-all">
                            Kembali ke Beranda
                        </button>
                    </div>
                </div>
            `;
        }
    }
}

// Update Wallet Balance & Packages in Nav Header
export function updateHeaderWalletDisplay() {
    const balances = document.querySelectorAll('.wallet-balance-text');
    const loggedIn = isLoggedIn();
    const currency = currentTenant?.currency || 'SGD';
    balances.forEach(bal => {
        if (loggedIn) {
            bal.textContent = `${currency} ${state.walletBalance.toFixed(2)}`;
        } else {
            bal.textContent = `${currency} 0.00`;
        }
    });

    const walletPills = document.querySelectorAll('.wallet-nav-pill');
    walletPills.forEach(pill => {
        pill.classList.remove('hidden');
    });
}

// RENDER: HOME VIEW (REBUILT WITH ORIENTAL HERITAGE TCM CARDS)
export function renderHomeView() {
    const container = document.getElementById('home-dynamic-content');
    if (!container) return;

    // Sync from localStorage state first
    syncServices();

    const currency = currentTenant?.currency || 'SGD';
    const featured = Object.values(SERVICES).filter(s => s.showOnHome);
    featured.sort((a, b) => (b.bestValue ? 1 : 0) - (a.bestValue ? 1 : 0));
    const slicedFeatured = featured.slice(0, 5);

    let gridHtml = '';
    if (slicedFeatured.length === 0) {
        gridHtml = `
            <div class="col-span-12 text-center py-12 bg-white rounded-3xl border border-[#e7dfd1]">
                <span class="material-symbols-outlined text-5xl text-[#164e3f]/40 mb-3">medical_services</span>
                <p class="text-sm text-slate-600">${state.language === 'ms' ? 'Tiada perkhidmatan pilihan dipilih.' : (state.language === 'zh' ? '暂无推荐的中医诊疗项目。' : 'No featured TCM treatments selected.')}</p>
            </div>
        `;
    } else {
        const patterns = [
            { cols: 'md:col-span-12', isLarge: true },
            { cols: 'md:col-span-8', isLarge: false },
            { cols: 'md:col-span-4', isLarge: false, isSmall: true },
            { cols: 'md:col-span-4', isLarge: false, isSmall: true },
            { cols: 'md:col-span-8', isLarge: false }
        ];

        gridHtml = slicedFeatured.map((s, idx) => {
            const pattern = patterns[idx % patterns.length];
            const isLarge = pattern.isLarge;
            const isSmall = pattern.isSmall;
            const isPackage = s.type === 'packages';
            const badgeLabel = isPackage 
                ? (state.language === 'ms' ? 'PAKEJ KLINIKAL' : (state.language === 'zh' ? '核心配套' : 'CLINICAL BUNDLE'))
                : (s.type ? s.type.toUpperCase() : 'TCM');

            // Calculate saving percent and badge html
            const discountPercent = (s.regularPrice && s.regularPrice > s.price) ? Math.round(((s.regularPrice - s.price) / s.regularPrice) * 100) : 0;
            const discountBadgeHtml = discountPercent > 0 
                ? `<div class="absolute top-4 left-4 bg-[#b93826] text-white px-3 py-1 rounded-full font-bold text-[9px] uppercase tracking-wider shadow-sm z-10">${state.language === 'ms' ? 'JIMAT' : (state.language === 'zh' ? '立省' : 'SAVE')} ${discountPercent}%</div>` 
                : '';

            if (isLarge) {
                // md:col-span-12
                return `
                    <div class="md:col-span-12 min-h-[320px] tcm-card shadow-sm group overflow-hidden flex flex-col md:flex-row relative flex-shrink-0 w-[85vw] sm:w-[360px] md:w-auto bg-white">
                        ${s.bestValue ? `<div class="absolute top-4 right-4 bg-[#c59b27] text-white px-3.5 py-1 rounded-full font-bold text-[10px] uppercase tracking-wider shadow-sm z-10">${state.language === 'ms' ? 'Nilai Terbaik' : (state.language === 'zh' ? '超值推荐' : 'Best Value')}</div>` : ''}
                        ${discountBadgeHtml}
                        <div class="w-full md:w-[320px] h-56 md:h-auto shrink-0 p-6 flex">
                            <img class="w-full h-full object-cover rounded-2xl group-hover:scale-105 transition-transform duration-500" src="${s.image}" alt="${s.name}">
                        </div>
                        <div class="flex-grow p-6 md:p-8 flex flex-col justify-between">
                            <div>
                                <div class="flex gap-2 mb-3">
                                    <span class="px-3 py-1 bg-[#164e3f]/10 text-[#164e3f] text-[11px] font-bold rounded-full">${badgeLabel}</span>
                                    ${isPackage ? `<span class="px-3 py-1 bg-[#c59b27]/15 text-[#8c6521] text-[11px] font-bold rounded-full">${state.language === 'ms' ? 'Pakej Rawatan' : (state.language === 'zh' ? '疗程配套' : 'Treatment Course')}</span>` : ''}
                                </div>
                                <h3 class="font-title-md text-xl mb-2 font-bold font-serif text-[#0f3d32]">${getServiceTranslation(s.id, 'name', s.name)}</h3>
                                <p class="text-body-sm text-xs text-slate-600 line-clamp-3 leading-relaxed">${getServiceTranslation(s.id, 'desc', s.description)}</p>
                            </div>
                            <div class="flex items-center justify-between mt-auto pt-4 border-t border-[#e7dfd1]">
                                <div>
                                    ${s.regularPrice && s.regularPrice > s.price ? `<span class="text-slate-400 text-[11px] block line-through decoration-red-500">${currency} ${s.regularPrice.toFixed(2)} (${state.language === 'ms' ? 'Biasa' : (state.language === 'zh' ? '原价' : 'Regular')})</span>` : ''}
                                    <span class="font-serif text-2xl text-[#0f3d32] font-bold">${currency} ${s.price}</span>
                                </div>
                                <button onclick="startBookingWithService('${s.id}')" class="${s.bestValue ? 'btn-tcm-gold' : 'btn-tcm-primary'} px-6 py-2.5 rounded-full font-bold transition-all text-xs flex items-center gap-1.5 shadow-sm text-white">
                                    ${isPackage ? (state.language === 'ms' ? 'Tempah Pakej' : (state.language === 'zh' ? '预约配套' : 'Book Package')) : (state.language === 'ms' ? 'Tempah Rawatan' : (state.language === 'zh' ? '预约诊疗' : 'Book Service'))} <span class="material-symbols-outlined text-sm ml-1">calendar_month</span>
                                </button>
                            </div>
                        </div>
                    </div>
                `;
            } else if (isSmall) {
                // md:col-span-4
                return `
                    <div class="md:col-span-4 tcm-card shadow-sm group overflow-hidden flex flex-col p-4 animate-fade-in relative flex-shrink-0 w-[85vw] sm:w-[360px] md:w-auto bg-white">
                        ${s.bestValue ? `<div class="absolute top-4 right-4 bg-[#c59b27] text-white px-3.5 py-1 rounded-full font-bold text-[9px] uppercase tracking-wider shadow-sm z-10">${state.language === 'ms' ? 'Nilai Terbaik' : (state.language === 'zh' ? '超值推荐' : 'Best Value')}</div>` : ''}
                        ${discountBadgeHtml}
                        <div class="w-full h-56 md:h-[180px] rounded-2xl overflow-hidden mb-4 shrink-0">
                            <img class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src="${s.image}" alt="${s.name}">
                        </div>
                        <div class="flex-grow flex flex-col justify-between">
                            <div>
                                <div class="mb-1">
                                    <span class="px-2.5 py-0.5 bg-[#164e3f]/10 text-[#164e3f] text-[10px] font-bold rounded-full">${badgeLabel}</span>
                                </div>
                                <h3 class="font-title-md text-sm font-bold font-serif text-[#0f3d32] mb-1 line-clamp-1 leading-snug">${getServiceTranslation(s.id, 'name', s.name)}</h3>
                                <p class="text-body-sm text-[11px] text-slate-600 line-clamp-3 leading-relaxed">${getServiceTranslation(s.id, 'desc', s.description)}</p>
                            </div>
                            <div class="flex justify-between items-center mt-auto pt-3 border-t border-[#e7dfd1]">
                                <div class="flex flex-col">
                                    ${s.regularPrice && s.regularPrice > s.price ? `<span class="text-slate-400 text-[10px] line-through decoration-red-500">${currency} ${s.regularPrice.toFixed(2)}</span>` : ''}
                                    <span class="font-serif text-sm text-[#0f3d32] font-bold">${currency} ${s.price}</span>
                                </div>
                                <button onclick="startBookingWithService('${s.id}')" class="${s.bestValue ? 'btn-tcm-gold' : 'btn-tcm-primary'} px-3.5 py-1.5 rounded-full font-bold text-[10px] shadow-sm transition-all whitespace-nowrap text-white">
                                    ${isPackage ? (state.language === 'ms' ? 'Tempah Pakej' : (state.language === 'zh' ? '预约配套' : 'Book Package')) : (state.language === 'ms' ? 'Tempah Rawatan' : (state.language === 'zh' ? '预约诊疗' : 'Book Service'))}
                                </button>
                            </div>
                        </div>
                    </div>
                `;
            } else {
                // md:col-span-8
                const imgFirst = (idx % 4 === 1);
                const imgOrderClass = imgFirst ? 'order-1' : 'order-1 md:order-2';
                const contentOrderClass = imgFirst ? 'order-2' : 'order-2 md:order-1';
                const imgHtml = `
                    <div class="w-full md:w-[250px] h-56 md:h-auto shrink-0 p-5 flex ${imgOrderClass}">
                        <img class="w-full h-full object-cover rounded-2xl group-hover:scale-105 transition-transform duration-500" src="${s.image}" alt="${s.name}">
                    </div>
                `;
                const contentHtml = `
                    <div class="flex-grow p-6 flex flex-col justify-between ${contentOrderClass}">
                        <div>
                            <div class="mb-2">
                                <span class="px-2.5 py-0.5 bg-[#164e3f]/10 text-[#164e3f] text-[10px] font-bold rounded-full">${badgeLabel}</span>
                            </div>
                            <h3 class="font-title-md text-base font-bold font-serif text-[#0f3d32] mb-2">${getServiceTranslation(s.id, 'name', s.name)}</h3>
                            <p class="text-body-sm text-xs text-slate-600 line-clamp-3 leading-relaxed">${getServiceTranslation(s.id, 'desc', s.description)}</p>
                        </div>
                        <div class="flex items-center justify-between mt-auto pt-4 border-t border-[#e7dfd1]">
                            <div class="flex flex-col">
                                ${s.regularPrice && s.regularPrice > s.price ? `<span class="text-slate-400 text-[10px] line-through decoration-red-500">${currency} ${s.regularPrice.toFixed(2)}</span>` : ''}
                                <span class="font-serif text-base text-[#0f3d32] font-bold">${currency} ${s.price}</span>
                            </div>
                            <button onclick="startBookingWithService('${s.id}')" class="${s.bestValue ? 'btn-tcm-gold' : 'btn-tcm-primary'} px-4 py-2 rounded-full font-bold text-xs shadow-sm transition-all text-white">
                                ${isPackage ? (state.language === 'ms' ? 'Tempah Pakej' : (state.language === 'zh' ? '预约配套' : 'Book Package')) : (state.language === 'ms' ? 'Tempah Rawatan' : (state.language === 'zh' ? '预约诊疗' : 'Book Service'))}
                            </button>
                        </div>
                    </div>
                `;

                return `
                    <div class="md:col-span-8 tcm-card shadow-sm group overflow-hidden flex flex-col md:flex-row relative flex-shrink-0 w-[85vw] sm:w-[360px] md:w-auto bg-white">
                        ${s.bestValue ? `<div class="absolute top-4 right-4 bg-[#c59b27] text-white px-3.5 py-1 rounded-full font-bold text-[9px] uppercase tracking-wider shadow-sm z-10">${state.language === 'ms' ? 'Nilai Terbaik' : (state.language === 'zh' ? '超值推荐' : 'Best Value')}</div>` : ''}
                        ${discountBadgeHtml}
                        ${imgHtml}
                        ${contentHtml}
                    </div>
                `;
            }
        }).join('');
    }

    container.innerHTML = `
        <div class="max-w-container-max mx-auto px-4 md:px-margin-desktop py-12">
            <!-- Section Title -->
            <div class="text-center mb-10 animate-fade-in">
                <span class="tcm-seal text-[10px] mb-2 inline-block">
                    ${state.language === 'ms' ? 'Rawatan Pilihan Klinikal' : (state.language === 'zh' ? '名医亲诊 • 辨证施治' : 'Featured Clinical Treatments')}
                </span>
                <h2 class="font-headline-lg text-3xl md:text-4xl text-[#0f3d32] mb-3 font-bold font-serif">
                    ${state.language === 'ms' ? 'Katalog Perkhidmatan Utama' : (state.language === 'zh' ? '特色诊疗项目' : 'Clinical Treatment Catalog')}
                </h2>
                <p class="font-body-sm text-xs md:text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
                    ${state.language === 'ms' ? 'Pilih daripada rawatan akupunktur sasaran, tuina ortopedik, dan preskripsi herba holistik kami.' : (state.language === 'zh' ? '传承正统中医辨证施治精髓，提供把脉问诊、经络针灸、正骨推拿及温阳艾灸。' : 'Choose from our certified acupuncture, orthopedic tuina, pulse consultation, and herbal therapies.')}
                </p>
            </div>

            <!-- Bento Grid Container (Flex scroll on mobile, Grid on desktop) -->
            <div class="flex overflow-x-auto pb-4 gap-6 hide-scrollbar md:grid md:grid-cols-12 md:overflow-visible">
                ${gridHtml}
            </div>
        </div>
    `;

    // Render active packages if owned
    renderActivePackagesWidget();
}

export function renderServicesCatalogView() {
    const container = document.getElementById('services-catalog-container');
    if (!container) return;

    syncServices();
    const currency = currentTenant?.currency || 'SGD';

    container.innerHTML = `
        <!-- Hero Section with Main Headline -->
        <div class="relative w-full min-h-[420px] flex items-center justify-center bg-[#faf7f2] border-b border-[#e7dfd1] overflow-hidden">
            <!-- Background Image with Fade/Overlay -->
            <div class="absolute inset-0 w-full h-full opacity-20">
                <img class="w-full h-full object-cover" src="https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&w=1600&h=700&q=80" alt="TCM Clinic & Acupuncture">
            </div>
            <div class="absolute inset-0 bg-gradient-to-b from-[#faf7f2]/40 via-[#faf7f2]/80 to-[#faf7f2]"></div>
            
            <div class="relative max-w-3xl text-center z-10 px-6 py-14 flex flex-col items-center">
                <span class="tcm-seal text-xs mb-3 animate-fade-in">
                    ${state.language === 'ms' ? 'KEMAHIRAN & KEARIFAN TRADISIONAL CINA' : (state.language === 'zh' ? '辨证施治 • 固本培元' : 'TIME-HONORED CLINICAL WISDOM')}
                </span>
                <h1 class="font-serif text-3xl md:text-5xl text-[#0f3d32] font-bold leading-tight mb-4 animate-fade-in">
                    ${state.language === 'ms' ? 'Rawatan Klinikal & Pakej Kesihatan Holistik' : (state.language === 'zh' ? '纯正中医特色专科与综合疗程' : 'Certified Clinical TCM Therapies & Wellness Courses')}
                </h1>
                <p class="text-xs md:text-sm text-slate-700 leading-relaxed max-w-xl mx-auto mb-6 animate-fade-in">
                    ${state.language === 'ms' ? 'Terokai rawatan akupunktur sasaran, tuina ortopedik, dan preskripsi herba holistik yang dikendalikan oleh pengamal perubatan berlesen TCMPB.' : (state.language === 'zh' ? '汇聚四诊合参、精准经络针灸、正骨推拿及温阳艾灸，由经验丰富的新加坡注册中医师团队亲自主诊。' : 'Experience personalized meridian acupuncture, orthopedic tuina, pulse consultation, and lab-tested herbal remedies administered by certified physicians.')}
                </p>
                <button onclick="navigateTo('all-services')" class="btn-tcm-primary text-white px-8 py-3 rounded-full font-bold text-xs shadow-md hover:shadow-xl transition-all flex items-center gap-2 animate-fade-in">
                    ${state.language === 'ms' ? 'Lihat Semua Rawatan & Pakej' : (state.language === 'zh' ? '查看全系诊疗与配套' : 'View Full Treatment Catalog')} <span class="material-symbols-outlined text-sm font-bold">arrow_forward</span>
                </button>
            </div>
        </div>

        <div class="max-w-container-max mx-auto px-4 md:px-margin-desktop py-16 flex flex-col gap-16">
            
            <!-- Section 1: Featured TCM Packages -->
            <div>
                <div class="flex justify-between items-end mb-8 border-b border-[#e7dfd1] pb-4">
                    <div>
                        <span class="tcm-seal text-[10px] mb-1 inline-block">
                            ${state.language === 'ms' ? 'Pakej Berbilang Sesi' : (state.language === 'zh' ? '多疗程系统调理' : 'Structured Treatment Plans')}
                        </span>
                        <h2 class="font-serif text-2xl font-bold text-[#0f3d32] mb-1">${state.language === 'ms' ? 'Pakej Rawatan Pilihan' : (state.language === 'zh' ? '核心疗程配套' : 'Featured Clinical Bundles')}</h2>
                        <p class="text-xs text-slate-600">${state.language === 'ms' ? 'Pakej berbilang sesi untuk pemulihan berstruktur dan hasil optimum' : (state.language === 'zh' ? '系统性针对颈椎劳损、慢性腰腿痛及体质虚寒提供持续调理' : 'Multi-session clinical regimens tailored for enduring pain recovery and vitality')}</p>
                    </div>
                    <a onclick="navigateToAllServicesWithFilter('packages')" class="text-xs font-bold text-[#c59b27] hover:text-[#9a7718] cursor-pointer flex items-center gap-1 transition-colors">
                        ${state.language === 'ms' ? 'Lihat Semua Pakej' : (state.language === 'zh' ? '查看全部配套' : 'See All Bundles')} <span class="material-symbols-outlined text-[14px]">arrow_right_alt</span>
                    </a>
                </div>

                <!-- Grid 2 Columns -->
                <div class="flex overflow-x-auto pb-4 gap-6 hide-scrollbar md:grid md:grid-cols-2 md:overflow-visible">
                    ${(() => {
                        const p1 = SERVICES['tcm-pain-relief-bundle'];
                        if (!p1) return '';
                        const discountPercent = (p1.regularPrice && p1.regularPrice > p1.price) ? Math.round(((p1.regularPrice - p1.price) / p1.regularPrice) * 100) : 0;
                        const discountBadgeHtml = discountPercent > 0 ? `<div class="absolute top-4 left-4 bg-[#b93826] text-white px-3 py-1 rounded-full font-bold text-[9px] uppercase tracking-wider shadow-sm z-10">${state.language === 'ms' ? 'JIMAT' : (state.language === 'zh' ? '立省' : 'SAVE')} ${discountPercent}%</div>` : '';
                        return `
                            <div class="bg-white tcm-card overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col sm:flex-row relative flex-shrink-0 w-[85vw] sm:w-[450px] md:w-auto">
                                <div class="w-full sm:w-5/12 h-48 sm:h-auto relative shrink-0">
                                    ${discountBadgeHtml}
                                    <img class="w-full h-full object-cover" src="${p1.image}" alt="${p1.name}">
                                </div>
                                <div class="p-6 flex flex-col justify-between flex-grow">
                                    <div>
                                        <span class="px-2.5 py-0.5 bg-[#c59b27]/15 text-[#8c6521] text-[10px] font-bold rounded-full uppercase tracking-wider mb-2 inline-block">${p1.badge || 'PACKAGE DEAL'}</span>
                                        <h3 class="font-serif text-lg font-bold text-[#0f3d32] mb-2">${getServiceTranslation(p1.id, 'name', p1.name)}</h3>
                                        <p class="text-xs text-slate-600 leading-relaxed mb-3 line-clamp-3">${getServiceTranslation(p1.id, 'desc', p1.description)}</p>
                                        <div class="mt-2 mb-4 p-2.5 bg-[#faf8f5] rounded-xl border border-[#e7dfd1]">
                                            <div class="text-[9px] font-bold uppercase tracking-wider text-[#164e3f] mb-1 flex items-center gap-1 font-semibold">
                                                <span class="material-symbols-outlined text-[12px] text-[#164e3f]">healing</span>
                                                ${state.language === 'ms' ? 'Butiran Sesi:' : (state.language === 'zh' ? '疗程安排:' : 'Regimen Details:')}
                                            </div>
                                            <p class="text-[10px] text-slate-700 font-medium">10x ${state.language === 'ms' ? 'Sesi Tuina & Akupunktur (60 Minit/Sesi)' : (state.language === 'zh' ? '正骨推拿与针灸理疗 (每次60分钟)' : 'Tuina & Acupuncture Sessions (60 Mins/ea)')}</p>
                                        </div>
                                    </div>
                                    
                                    <div class="flex justify-between items-center mt-auto border-t border-slate-100 pt-4">
                                        <div class="flex flex-col">
                                            ${p1.regularPrice && p1.regularPrice > p1.price ? `<span class="text-[10px] text-slate-400 line-through decoration-red-500">${currency} ${p1.regularPrice.toFixed(2)}</span>` : `<span class="text-[10px] text-slate-400 uppercase tracking-wider">${state.language === 'ms' ? 'Nilai Pakej' : (state.language === 'zh' ? '配套总价' : 'Package Value')}</span>`}
                                            <span class="font-serif font-bold text-[#0f3d32] text-lg">${currency} ${p1.price}</span>
                                        </div>
                                        <button onclick="startBookingWithService('tcm-pain-relief-bundle')" class="btn-tcm-gold text-white font-bold text-xs px-5 py-2.5 rounded-full transition-all">${state.language === 'ms' ? 'Tempah Pakej' : (state.language === 'zh' ? '预约配套' : 'Book Package')}</button>
                                    </div>
                                </div>
                            </div>
                        `;
                    })()}

                    ${(() => {
                        const p2 = SERVICES['tcm-vitality-package'];
                        if (!p2) return '';
                        const discountPercent = (p2.regularPrice && p2.regularPrice > p2.price) ? Math.round(((p2.regularPrice - p2.price) / p2.regularPrice) * 100) : 0;
                        const discountBadgeHtml = discountPercent > 0 ? `<div class="absolute top-4 left-4 bg-[#b93826] text-white px-3 py-1 rounded-full font-bold text-[9px] uppercase tracking-wider shadow-sm z-10">${state.language === 'ms' ? 'JIMAT' : (state.language === 'zh' ? '立省' : 'SAVE')} ${discountPercent}%</div>` : '';
                        return `
                            <div class="bg-white tcm-card overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col sm:flex-row relative flex-shrink-0 w-[85vw] sm:w-[450px] md:w-auto">
                                <div class="w-full sm:w-5/12 h-48 sm:h-auto relative shrink-0">
                                    ${discountBadgeHtml}
                                    <img class="w-full h-full object-cover" src="${p2.image}" alt="${p2.name}">
                                </div>
                                <div class="p-6 flex flex-col justify-between flex-grow">
                                    <div>
                                        <span class="px-2.5 py-0.5 bg-[#164e3f]/10 text-[#164e3f] text-[10px] font-bold rounded-full uppercase tracking-wider mb-2 inline-block">${p2.badge || 'POPULAR COURSE'}</span>
                                        <h3 class="font-serif text-lg font-bold text-[#0f3d32] mb-2">${getServiceTranslation(p2.id, 'name', p2.name)}</h3>
                                        <p class="text-xs text-slate-600 leading-relaxed mb-3 line-clamp-3">${getServiceTranslation(p2.id, 'desc', p2.description)}</p>
                                        <div class="mt-2 mb-4 p-2.5 bg-[#faf8f5] rounded-xl border border-[#e7dfd1]">
                                            <div class="text-[9px] font-bold uppercase tracking-wider text-[#164e3f] mb-1 flex items-center gap-1 font-semibold">
                                                <span class="material-symbols-outlined text-[12px] text-[#164e3f]">medication</span>
                                                ${state.language === 'ms' ? 'Butiran Sesi:' : (state.language === 'zh' ? '疗程安排:' : 'Regimen Details:')}
                                            </div>
                                            <p class="text-[10px] text-slate-700 font-medium">5x ${state.language === 'ms' ? 'Konsultasi Nadi, Akupunktur & Tuina' : (state.language === 'zh' ? '四诊问诊、辩证针灸与理筋推拿' : 'Pulse Diagnosis, Acupuncture & Tuina')}</p>
                                        </div>
                                    </div>
                                    
                                    <div class="flex justify-between items-center mt-auto border-t border-slate-100 pt-4">
                                        <div class="flex flex-col">
                                            ${p2.regularPrice && p2.regularPrice > p2.price ? `<span class="text-[10px] text-slate-400 line-through decoration-red-500">${currency} ${p2.regularPrice.toFixed(2)}</span>` : `<span class="text-[10px] text-slate-400 uppercase tracking-wider">${state.language === 'ms' ? 'Nilai Pakej' : (state.language === 'zh' ? '配套总价' : 'Package Value')}</span>`}
                                            <span class="font-serif font-bold text-[#0f3d32] text-lg">${currency} ${p2.price}</span>
                                        </div>
                                        <button onclick="startBookingWithService('tcm-vitality-package')" class="btn-tcm-primary text-white font-bold text-xs px-5 py-2.5 rounded-full transition-all">${state.language === 'ms' ? 'Tempah Pakej' : (state.language === 'zh' ? '预约配套' : 'Book Package')}</button>
                                    </div>
                                </div>
                            </div>
                        `;
                    })()}
                </div>
            </div>

            <!-- Section 2: Signature Clinical TCM Therapies -->
            <div>
                <div class="flex justify-between items-end mb-8 border-b border-[#e7dfd1] pb-4">
                    <div>
                        <span class="tcm-seal text-[10px] mb-1 inline-block">
                            ${state.language === 'ms' ? 'Terapi Sasaran' : (state.language === 'zh' ? '单项专科诊疗' : 'Targeted Therapies')}
                        </span>
                        <h2 class="font-serif text-2xl font-bold text-[#0f3d32] mb-1">${state.language === 'ms' ? 'Rawatan Klinikal Pilihan' : (state.language === 'zh' ? '特色专科诊疗' : 'Signature TCM Therapies')}</h2>
                        <p class="text-xs text-slate-600">${state.language === 'ms' ? 'Terapi individu yang dikendalikan dengan ketepatan perubatan berasaskan diagnosis nadi.' : (state.language === 'zh' ? '遵循辨证施治准则，根据舌脉精细诊断施以个性化针灸及手法调理。' : 'Individual treatment sessions administered according to four-diagnosis clinical assessment.')}</p>
                    </div>
                    <a onclick="navigateToAllServicesWithFilter('acupuncture')" class="text-xs font-bold text-[#c59b27] hover:text-[#9a7718] cursor-pointer flex items-center gap-1 transition-colors">
                        ${state.language === 'ms' ? 'Lihat Semua' : (state.language === 'zh' ? '查看全部' : 'See All')} <span class="material-symbols-outlined text-[14px]">arrow_right_alt</span>
                    </a>
                </div>

                <!-- Grid 3 Columns -->
                <div class="flex overflow-x-auto pb-4 gap-6 hide-scrollbar md:grid md:grid-cols-3 md:overflow-visible">
                    <!-- Therapy 1: Acupuncture Meridian Therapy -->
                    <div class="bg-white tcm-card overflow-hidden shadow-sm hover:shadow-md transition-all group flex flex-col justify-between flex-shrink-0 w-[85vw] sm:w-[320px] md:w-auto">
                        <div class="w-full h-56 shrink-0 overflow-hidden relative">
                            <img class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src="https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&w=400&h=260&q=80" alt="Acupuncture Meridian Therapy">
                        </div>
                        <div class="p-6 flex flex-col justify-between flex-grow">
                            <div>
                                <span class="tcm-seal text-[9px] mb-2 inline-block">${state.language === 'ms' ? 'AKUPUNKTUR STERIL' : (state.language === 'zh' ? '无菌经络针灸' : 'STERILE ACUPUNCTURE')}</span>
                                <h3 class="font-serif text-base font-bold text-[#0f3d32] mb-2">${getServiceTranslation('acupuncture-session', 'name', 'Acupuncture Meridian Therapy')}</h3>
                                <p class="text-xs text-slate-600 leading-relaxed mb-6">${getServiceTranslation('acupuncture-session', 'desc', 'Targeted sterile acupuncture meridian therapy to unblock Qi stagnation, relieve chronic body pain, and harmonize organ systems.')}</p>
                            </div>
                            
                            <div class="flex justify-between items-center border-t border-slate-100 pt-4 mt-auto">
                                <div class="flex flex-col">
                                    <div class="flex items-center gap-1.5 text-slate-500 mb-0.5">
                                        <span class="material-symbols-outlined text-[16px] text-slate-400">schedule</span>
                                        <span class="text-[11px] font-semibold">${state.language === 'ms' ? '45 Minit' : (state.language === 'zh' ? '45分钟' : '45 Mins')}</span>
                                    </div>
                                    <span class="text-xs font-bold text-[#0f3d32]">${currency} 85</span>
                                </div>
                                <button onclick="startBookingWithService('acupuncture-session')" class="btn-tcm-primary text-white font-bold text-xs px-4 py-2 rounded-full transition-all whitespace-nowrap">
                                    ${state.language === 'ms' ? 'Tempah Rawatan' : (state.language === 'zh' ? '预约诊疗' : 'Book Therapy')}
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Therapy 2: Therapeutic TCM Tuina -->
                    <div class="bg-white tcm-card overflow-hidden shadow-sm hover:shadow-md transition-all group flex flex-col justify-between flex-shrink-0 w-[85vw] sm:w-[320px] md:w-auto">
                        <div class="w-full h-56 shrink-0 overflow-hidden relative">
                            <img class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src="https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&w=400&h=260&q=80" alt="Therapeutic TCM Tuina Bodywork">
                        </div>
                        <div class="p-6 flex flex-col justify-between flex-grow">
                            <div>
                                <span class="tcm-seal text-[9px] mb-2 inline-block">${state.language === 'ms' ? 'TUINA ORTOPEDIK' : (state.language === 'zh' ? '中医正骨推拿' : 'ORTHOPEDIC TUINA')}</span>
                                <h3 class="font-serif text-base font-bold text-[#0f3d32] mb-2">${getServiceTranslation('tcm-tuina-therapy', 'name', 'Therapeutic TCM Tuina Bodywork')}</h3>
                                <p class="text-xs text-slate-600 leading-relaxed mb-6">${getServiceTranslation('tcm-tuina-therapy', 'desc', 'Traditional Chinese medical bodywork addressing musculoskeletal ailments, joint stiffness, and deep structural alignment.')}</p>
                            </div>
                            
                            <div class="flex justify-between items-center border-t border-slate-100 pt-4 mt-auto">
                                <div class="flex flex-col">
                                    <div class="flex items-center gap-1.5 text-slate-500 mb-0.5">
                                        <span class="material-symbols-outlined text-[16px] text-slate-400">schedule</span>
                                        <span class="text-[11px] font-semibold">${state.language === 'ms' ? '60 Minit' : (state.language === 'zh' ? '60分钟' : '60 Mins')}</span>
                                    </div>
                                    <span class="text-xs font-bold text-[#0f3d32]">${currency} 98</span>
                                </div>
                                <button onclick="startBookingWithService('tcm-tuina-therapy')" class="btn-tcm-primary text-white font-bold text-xs px-4 py-2 rounded-full transition-all whitespace-nowrap">
                                    ${state.language === 'ms' ? 'Tempah Rawatan' : (state.language === 'zh' ? '预约诊疗' : 'Book Therapy')}
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Therapy 3: Pulse & Tongue Consultation -->
                    <div class="bg-white tcm-card overflow-hidden shadow-sm hover:shadow-md transition-all group flex flex-col justify-between flex-shrink-0 w-[85vw] sm:w-[320px] md:w-auto">
                        <div class="w-full h-56 shrink-0 overflow-hidden relative">
                            <img class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=400&h=260&q=80" alt="TCM Pulse & Herbal Consultation">
                        </div>
                        <div class="p-6 flex flex-col justify-between flex-grow">
                            <div>
                                <span class="tcm-seal text-[9px] mb-2 inline-block">${state.language === 'ms' ? 'KONSULTASI NADI' : (state.language === 'zh' ? '四诊把脉问诊' : 'PULSE DIAGNOSIS')}</span>
                                <h3 class="font-serif text-base font-bold text-[#0f3d32] mb-2">${getServiceTranslation('tcm-herbal-consultation', 'name', 'TCM Pulse & Herbal Consultation')}</h3>
                                <p class="text-xs text-slate-600 leading-relaxed mb-6">${getServiceTranslation('tcm-herbal-consultation', 'desc', 'Comprehensive pulse examination, tongue analysis, and personalized herbal medication prescription by a certified TCM physician.')}</p>
                            </div>
                            
                            <div class="flex justify-between items-center border-t border-slate-100 pt-4 mt-auto">
                                <div class="flex flex-col">
                                    <div class="flex items-center gap-1.5 text-slate-500 mb-0.5">
                                        <span class="material-symbols-outlined text-[16px] text-slate-400">schedule</span>
                                        <span class="text-[11px] font-semibold">${state.language === 'ms' ? '30 Minit' : (state.language === 'zh' ? '30分钟' : '30 Mins')}</span>
                                    </div>
                                    <span class="text-xs font-bold text-[#0f3d32]">${currency} 60</span>
                                </div>
                                <button onclick="startBookingWithService('tcm-herbal-consultation')" class="btn-tcm-primary text-white font-bold text-xs px-4 py-2 rounded-full transition-all whitespace-nowrap">
                                    ${state.language === 'ms' ? 'Tempah Konsultasi' : (state.language === 'zh' ? '预约问诊' : 'Book Consultation')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Section 3: Cupping & Moxibustion Restorative Care -->
            <div>
                <div class="flex justify-between items-end mb-8 border-b border-[#e7dfd1] pb-4">
                    <div>
                        <span class="tcm-seal text-[10px] mb-1 inline-block">
                            ${state.language === 'ms' ? 'Terapi Pemulihan Tambahan' : (state.language === 'zh' ? '拔罐与温阳艾灸' : 'Restorative Care')}
                        </span>
                        <h2 class="font-serif text-2xl font-bold text-[#0f3d32] mb-1">${state.language === 'ms' ? 'Bekam Api & Terapi Moksa' : (state.language === 'zh' ? '传统火罐与艾灸理疗' : 'Fire Cupping & Moxibustion Therapies')}</h2>
                        <p class="text-xs text-slate-600">${state.language === 'ms' ? 'Melegakan kelembapan angin patogenik dan menghangatkan meridian tubuh.' : (state.language === 'zh' ? '驱除体内风寒湿邪，温通经脉，激发人体自愈免疫机制。' : 'Expelling pathogenic dampness and warming channels to invigorate microcirculation.')}</p>
                    </div>
                    <a onclick="navigateToAllServicesWithFilter('therapeutic')" class="text-xs font-bold text-[#c59b27] hover:text-[#9a7718] cursor-pointer flex items-center gap-1 transition-colors">
                        ${state.language === 'ms' ? 'Lihat Semua' : (state.language === 'zh' ? '查看全部' : 'See All')} <span class="material-symbols-outlined text-[14px]">arrow_right_alt</span>
                    </a>
                </div>

                <!-- Grid 2 Columns -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <!-- Cupping -->
                    <div class="bg-white tcm-card p-6 flex flex-col justify-between">
                        <div class="flex gap-4 items-start">
                            <div class="w-24 h-24 rounded-2xl overflow-hidden shrink-0 bg-stone-100">
                                <img src="https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?auto=format&fit=crop&w=300&q=80" class="w-full h-full object-cover" alt="Fire Cupping & Gua Sha">
                            </div>
                            <div class="flex-grow">
                                <span class="tcm-seal text-[9px] mb-1 inline-block">DETOX RITUAL</span>
                                <h3 class="font-serif text-base font-bold text-[#0f3d32] mb-1">${getServiceTranslation('cupping-gua-sha', 'name', 'Fire Cupping & Gua Sha Detox')}</h3>
                                <p class="text-xs text-slate-600 leading-relaxed line-clamp-2">${getServiceTranslation('cupping-gua-sha', 'desc', 'Authentic glass cup fire suction combined with jade scraping to release pathogenic dampness.')}</p>
                            </div>
                        </div>
                        <div class="flex justify-between items-center border-t border-slate-100 pt-4 mt-4">
                            <span class="font-serif text-base font-bold text-[#0f3d32]">${currency} 68</span>
                            <button onclick="startBookingWithService('cupping-gua-sha')" class="btn-tcm-primary text-white font-bold text-xs px-4 py-2 rounded-full">
                                ${state.language === 'ms' ? 'Tempah Rawatan' : (state.language === 'zh' ? '预约理疗' : 'Book Therapy')}
                            </button>
                        </div>
                    </div>

                    <!-- Moxibustion -->
                    <div class="bg-white tcm-card p-6 flex flex-col justify-between">
                        <div class="flex gap-4 items-start">
                            <div class="w-24 h-24 rounded-2xl overflow-hidden shrink-0 bg-stone-100">
                                <img src="https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=300&q=80" class="w-full h-full object-cover" alt="Warm Herbal Moxibustion">
                            </div>
                            <div class="flex-grow">
                                <span class="tcm-seal text-[9px] mb-1 inline-block">WARM CHANNELS</span>
                                <h3 class="font-serif text-base font-bold text-[#0f3d32] mb-1">${getServiceTranslation('moxibustion-therapy', 'name', 'Warm Herbal Moxibustion Ritual')}</h3>
                                <p class="text-xs text-slate-600 leading-relaxed line-clamp-2">${getServiceTranslation('moxibustion-therapy', 'desc', 'Application of burning aged mugwort herb above acupuncture meridians to warm the channels and dispel cold.')}</p>
                            </div>
                        </div>
                        <div class="flex justify-between items-center border-t border-slate-100 pt-4 mt-4">
                            <span class="font-serif text-base font-bold text-[#0f3d32]">${currency} 78</span>
                            <button onclick="startBookingWithService('moxibustion-therapy')" class="btn-tcm-primary text-white font-bold text-xs px-4 py-2 rounded-full">
                                ${state.language === 'ms' ? 'Tempah Rawatan' : (state.language === 'zh' ? '预约理疗' : 'Book Therapy')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    `;
}

export function renderDashboardView() {
    const container = document.getElementById('dashboard-container');
    if (!container) return;

    const currency = currentTenant?.currency || 'SGD';
    const userName = localStorage.getItem(`${tenantId}_user_name`) || state.guestInfo.name || (state.language === 'zh' ? '贵宾会员' : (state.language === 'ms' ? 'Ahli' : 'Member'));
    const now = new Date();
    const startOfWeek = new Date(now);
    const mondayOffset = (now.getDay() + 6) % 7;
    startOfWeek.setDate(now.getDate() - mondayOffset);
    startOfWeek.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const formatDayLabel = date => date.toLocaleDateString(state.language === 'ms' ? 'ms-MY' : (state.language === 'zh' ? 'zh-SG' : 'en-US'), { weekday: 'short' });
    const formatWeekday = date => date.toLocaleDateString(state.language === 'ms' ? 'ms-MY' : (state.language === 'zh' ? 'zh-SG' : 'en-US'), { weekday: 'short', month: 'short', day: 'numeric' });
    const parseBookingDate = value => {
        const parsed = new Date(value);
        return isNaN(parsed) ? null : parsed;
    };
    const bookingsThisWeek = state.bookings
        .map(booking => ({ ...booking, parsedDate: parseBookingDate(booking.date) }))
        .filter(booking => booking.parsedDate && booking.parsedDate >= startOfWeek && booking.parsedDate <= endOfWeek)
        .sort((a, b) => a.parsedDate - b.parsedDate);
    const weekDays = Array.from({ length: 7 }, (_, index) => {
        const date = new Date(startOfWeek);
        date.setDate(startOfWeek.getDate() + index);
        const dayBookings = bookingsThisWeek.filter(booking => booking.parsedDate.toDateString() === date.toDateString());
        return { date, dayBookings };
    });

    const upcoming = state.bookings.filter(b => b.status === 'Upcoming');
    upcoming.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        if (isNaN(dateA) || isNaN(dateB)) return 0;
        return dateA - dateB;
    });
    const nextBooking = upcoming[0] || null;
    const activePackagesCount = Object.values(state.activePackages || {}).filter(count => Number(count) > 0).length;
    const transactionCount = Array.isArray(state.transactions) ? state.transactions.length : 0;

    container.innerHTML = `
        <div class="max-w-container-max mx-auto px-4 md:px-margin-desktop py-10 md:py-12">
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div class="lg:col-span-8 bg-white tcm-card p-6 md:p-8 shadow-sm overflow-hidden relative">
                    <div class="absolute -right-10 -top-10 w-44 h-44 rounded-full bg-[#164e3f]/10 blur-3xl"></div>
                    <div class="relative z-10">
                        <span class="tcm-seal text-[10px] mb-2 inline-block">${state.language === 'ms' ? 'Papan Pemuka Kesihatan' : (state.language === 'zh' ? '个人健康中心' : 'Clinical Health Dashboard')}</span>
                        <h1 class="font-serif text-3xl md:text-4xl text-[#0f3d32] font-bold leading-tight mb-3">${state.language === 'ms' ? 'Selamat kembali' : (state.language === 'zh' ? '欢迎回来' : 'Welcome back')}, ${userName}</h1>
                        <p class="text-xs md:text-sm text-slate-600 leading-relaxed max-w-2xl">${state.language === 'ms' ? 'Ruang peribadi anda untuk memantau janji temu TCM, baki dompet klinikal, dan pakej rawatan aktif tanpa kembali ke halaman utama.' : (state.language === 'zh' ? '在此便捷查看您的中医问诊预约、数码医疗金余额及正在调理中的专属疗程配套。' : 'Your personal space to track TCM appointments, clinic wallet balance, and active treatment regimens.')}</p>

                        <div class="flex flex-wrap gap-3 mt-6">
                            <button onclick="navigateTo('services-catalog')" class="btn-tcm-gold text-white px-5 py-2.5 rounded-full text-xs font-bold shadow-sm transition-all flex items-center gap-2">
                                <span class="material-symbols-outlined text-sm">healing</span> ${state.language === 'ms' ? 'Tempah Rawatan' : (state.language === 'zh' ? '预约诊疗' : 'Book Therapy')}
                            </button>
                            <button onclick="navigateTo('wallet')" class="bg-white border border-[#164e3f]/30 hover:border-[#164e3f] hover:bg-[#164e3f]/5 text-[#164e3f] px-5 py-2.5 rounded-full text-xs font-bold transition-all flex items-center gap-2">
                                <span class="material-symbols-outlined text-sm">account_balance_wallet</span> ${state.language === 'ms' ? 'Buka Dompet' : (state.language === 'zh' ? '诊所钱包' : 'Open Wallet')}
                            </button>
                            <button onclick="navigateTo('profile')" class="bg-white border border-[#164e3f]/30 hover:border-[#164e3f] hover:bg-[#164e3f]/5 text-[#164e3f] px-5 py-2.5 rounded-full text-xs font-bold transition-all flex items-center gap-2">
                                <span class="material-symbols-outlined text-sm">person</span> ${state.language === 'ms' ? 'Profil Saya' : (state.language === 'zh' ? '个人档案' : 'My Profile')}
                            </button>
                        </div>
                    </div>
                </div>

                <div class="lg:col-span-4 grid grid-cols-2 gap-4">
                    <div class="bg-gradient-to-br from-[#164e3f] to-[#0f3d32] text-white rounded-3xl p-5 shadow-sm relative overflow-hidden">
                        <div class="absolute -right-4 -bottom-4 opacity-15"><span class="material-symbols-outlined text-7xl">account_balance_wallet</span></div>
                        <span class="text-[10px] font-bold uppercase tracking-wider text-white/80 block mb-1">${state.language === 'ms' ? 'Baki Dompet' : (state.language === 'zh' ? '钱包余额' : 'Wallet Balance')}</span>
                        <div class="font-serif text-2xl font-bold">${currency} ${state.walletBalance.toFixed(2)}</div>
                    </div>
                    <div class="bg-white tcm-card p-5 shadow-sm">
                        <span class="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">${state.language === 'ms' ? 'Janji Temu' : (state.language === 'zh' ? '预约记录' : 'Bookings')}</span>
                        <div class="font-serif text-2xl font-bold text-[#0f3d32]">${state.bookings.length}</div>
                    </div>
                    <div class="bg-white tcm-card p-5 shadow-sm">
                        <span class="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">${state.language === 'ms' ? 'Pakej Aktif' : (state.language === 'zh' ? '有效配套' : 'Active Packages')}</span>
                        <div class="font-serif text-2xl font-bold text-[#0f3d32]">${activePackagesCount}</div>
                    </div>
                    <div class="bg-white tcm-card p-5 shadow-sm">
                        <span class="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">${state.language === 'ms' ? 'Transaksi' : (state.language === 'zh' ? '账单明细' : 'Transactions')}</span>
                        <div class="font-serif text-2xl font-bold text-[#0f3d32]">${transactionCount}</div>
                    </div>
                </div>
            </div>

            <div class="mt-6 bg-white tcm-card p-6 md:p-8 shadow-sm">
                <div class="flex flex-col md:flex-row md:items-end md:justify-between gap-2 mb-5">
                    <div>
                        <span class="tcm-seal text-[10px] mb-2 inline-block">${state.language === 'ms' ? 'Jadual Mingguan' : (state.language === 'zh' ? '本周诊疗日程' : 'Weekly Schedule')}</span>
                        <h2 class="font-serif text-xl text-[#0f3d32] font-bold">${formatWeekday(startOfWeek)} - ${formatWeekday(endOfWeek)}</h2>
                        <p class="text-xs text-slate-600 mt-1">${bookingsThisWeek.length > 0 ? (state.language === 'ms' ? `Anda mempunyai ${bookingsThisWeek.length} jadual rawatan pada minggu ini.` : (state.language === 'zh' ? `您本周共有 ${bookingsThisWeek.length} 个调理预约。` : `You have ${bookingsThisWeek.length} scheduled sessions this week.`)) : (state.language === 'ms' ? 'Tiada janji temu dijadualkan pada minggu ini.' : (state.language === 'zh' ? '本周暂无诊疗预约。' : 'No appointments scheduled for this week.'))}</p>
                    </div>
                    <button onclick="navigateTo('booking-history')" class="self-start md:self-auto text-xs font-bold text-[#c59b27] hover:text-[#9a7718] flex items-center gap-1 transition-colors">
                        ${state.language === 'ms' ? 'Buka Sejarah Janji Temu' : (state.language === 'zh' ? '查看预约历史' : 'Open Booking History')} <span class="material-symbols-outlined text-xs">arrow_forward</span>
                    </button>
                </div>

                <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                    ${weekDays.map(({ date, dayBookings }) => {
                        const isToday = date.toDateString() === now.toDateString();
                        const hasBooking = dayBookings.length > 0;
                        const firstBooking = dayBookings[0];
                        return `
                            <div class="rounded-2xl border p-4 min-h-[140px] flex flex-col justify-between ${isToday ? 'border-[#164e3f] bg-[#164e3f]/5 shadow-sm' : 'border-[#e7dfd1] bg-[#faf8f5]'}">
                                <div class="flex items-start justify-between gap-2 mb-3">
                                    <div>
                                        <p class="text-[10px] font-bold uppercase tracking-wider ${isToday ? 'text-[#164e3f]' : 'text-slate-400'}">${formatDayLabel(date)}</p>
                                        <p class="font-serif text-lg font-bold text-[#0f3d32]">${date.getDate()}</p>
                                    </div>
                                    <span class="text-[10px] font-bold px-2 py-1 rounded-full ${hasBooking ? 'bg-[#164e3f] text-white' : 'bg-white text-slate-400 border border-slate-200'}">${hasBooking ? `${dayBookings.length}` : '0'}</span>
                                </div>
                                <div class="flex flex-col gap-2">
                                    ${hasBooking ? `
                                        <div class="text-xs font-semibold text-[#0f3d32] line-clamp-2">${firstBooking.serviceName}</div>
                                        <div class="text-[11px] text-slate-500">${firstBooking.time}</div>
                                        ${dayBookings.length > 1 ? `<div class="text-[10px] font-bold text-[#c59b27]">+${dayBookings.length - 1} ${state.language === 'ms' ? 'lagi' : (state.language === 'zh' ? '项' : 'more')}</div>` : ''}
                                    ` : `
                                        <div class="text-[11px] text-slate-400">${state.language === 'ms' ? 'Kosong' : (state.language === 'zh' ? '无预约' : 'Free')}</div>
                                    `}
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>

                <div class="mt-5 rounded-2xl border border-[#e7dfd1] bg-[#faf8f5] p-4">
                    <div class="flex items-center gap-2 mb-2 text-[#8c6521] font-bold text-xs uppercase tracking-wider">
                        <span class="material-symbols-outlined text-[18px]">event_available</span>
                        ${state.language === 'ms' ? 'Sorotan Minggu Ini' : (state.language === 'zh' ? '本周就诊备忘' : 'This Week at a Glance')}
                    </div>
                    <div class="flex flex-col gap-2">
                        ${bookingsThisWeek.length > 0 ? bookingsThisWeek.map(booking => `
                            <div class="flex items-center justify-between gap-3 rounded-xl bg-white border border-[#e7dfd1] px-4 py-3">
                                <div>
                                    <p class="text-xs font-bold text-[#0f3d32]">${booking.serviceName}</p>
                                    <p class="text-[11px] text-slate-500">${booking.date} • ${booking.time} • ${booking.therapist}</p>
                                </div>
                                <span class="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#164e3f]/10 text-[#164e3f]">${booking.status}</span>
                            </div>
                        `).join('') : `
                            <div class="rounded-xl bg-white border border-[#e7dfd1] px-4 py-3 text-xs text-slate-500">
                                ${state.language === 'ms' ? 'Tiada jadual untuk minggu ini. Tempah rawatan untuk melihatnya muncul di sini.' : (state.language === 'zh' ? '本周暂无就诊安排。预约疗程后将自动在此呈现。' : 'There are no appointments this week. Book a therapy to see it here.')}
                            </div>
                        `}
                    </div>
                </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
                <div class="lg:col-span-7 bg-white tcm-card p-6 md:p-8 shadow-sm">
                    <div class="flex items-center justify-between mb-5">
                        <h2 class="font-serif text-xl text-[#0f3d32] font-bold">${state.language === 'ms' ? 'Ringkasan Terkini' : (state.language === 'zh' ? '当前摘要' : 'Current Summary')}</h2>
                        <button onclick="navigateTo('booking-history')" class="text-xs font-bold text-[#c59b27] hover:text-[#9a7718] flex items-center gap-1 transition-colors">
                            ${state.language === 'ms' ? 'Lihat Sejarah' : (state.language === 'zh' ? '查看明细' : 'View History')} <span class="material-symbols-outlined text-xs">arrow_forward</span>
                        </button>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="rounded-2xl bg-[#faf8f5] border border-[#e7dfd1] p-4">
                            <span class="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-2">${state.language === 'ms' ? 'Janji Temu Seterusnya' : (state.language === 'zh' ? '下一次就诊' : 'Next Appointment')}</span>
                            ${nextBooking ? `
                                <h3 class="font-serif text-base font-bold text-[#0f3d32] mb-1">${nextBooking.serviceName}</h3>
                                <p class="text-xs text-slate-600">${nextBooking.date} • ${nextBooking.time}</p>
                                <p class="text-xs text-slate-500 mt-2">${state.language === 'ms' ? 'Pengamal' : (state.language === 'zh' ? '执业医师' : 'Physician')}: ${nextBooking.therapist}</p>
                            ` : `
                                <p class="text-xs text-slate-500">${state.language === 'ms' ? 'Belum ada janji temu akan datang.' : (state.language === 'zh' ? '暂无待进行的预约。' : 'No upcoming appointment yet.')}</p>
                            `}
                        </div>
                        <div class="rounded-2xl bg-[#fbf6ec] border border-[#ecdcb9] p-4">
                            <span class="text-[10px] font-bold uppercase tracking-wider text-[#8c6521] block mb-2">${state.language === 'ms' ? 'Akses Pantas' : (state.language === 'zh' ? '便捷通道' : 'Quick Access')}</span>
                            <div class="flex flex-col gap-2">
                                <button onclick="navigateTo('wallet')" class="text-left text-xs font-semibold text-[#0f3d32] hover:text-[#164e3f] transition-colors">${state.language === 'ms' ? 'Buka & tambah nilai dompet' : (state.language === 'zh' ? '充值与查询余额' : 'Open and top up wallet')}</button>
                                <button onclick="navigateTo('profile')" class="text-left text-xs font-semibold text-[#0f3d32] hover:text-[#164e3f] transition-colors">${state.language === 'ms' ? 'Urus profil dan tetapan' : (state.language === 'zh' ? '个人病历与档案' : 'Manage profile and settings')}</button>
                                <button onclick="navigateTo('all-services')" class="text-left text-xs font-semibold text-[#0f3d32] hover:text-[#164e3f] transition-colors">${state.language === 'ms' ? 'Semak semua perkhidmatan' : (state.language === 'zh' ? '浏览全系特色诊疗' : 'Browse all clinical services')}</button>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="lg:col-span-5 bg-white tcm-card p-6 md:p-8 shadow-sm">
                    <div class="flex items-center justify-between mb-5">
                        <h2 class="font-serif text-xl text-[#0f3d32] font-bold">${state.language === 'ms' ? 'Aktiviti Anda' : (state.language === 'zh' ? '动态提醒' : 'Your Activity')}</h2>
                        <span class="text-[10px] font-bold uppercase tracking-wider text-[#164e3f]">${state.language === 'ms' ? 'Langsung' : (state.language === 'zh' ? '实时' : 'Live')}</span>
                    </div>
                    <div class="space-y-4">
                        <div class="flex items-start gap-3 p-4 rounded-2xl bg-[#faf8f5] border border-[#e7dfd1]">
                            <div class="w-10 h-10 rounded-xl bg-[#164e3f]/10 text-[#164e3f] flex items-center justify-center shrink-0"><span class="material-symbols-outlined text-lg">calendar_month</span></div>
                            <div>
                                <p class="text-xs font-semibold text-[#0f3d32]">${state.language === 'ms' ? 'Tempahan anda kini disambung ke papan pemuka.' : (state.language === 'zh' ? '您的临床预约已同步至此健康中心。' : 'Your clinical bookings flow directly into this dashboard.')}</p>
                                <p class="text-[11px] text-slate-500 mt-1">${state.language === 'ms' ? 'Anda boleh semak jadual, dompet, dan pakej tanpa kembali ke halaman utama.' : (state.language === 'zh' ? '可随时复核接诊时间、调理进度与剩余课时。' : 'You can review schedules, wallet, and packages anytime.')}</p>
                            </div>
                        </div>
                        <div class="flex items-start gap-3 p-4 rounded-2xl bg-[#faf8f5] border border-[#e7dfd1]">
                            <div class="w-10 h-10 rounded-xl bg-[#c59b27]/15 text-[#c59b27] flex items-center justify-center shrink-0"><span class="material-symbols-outlined text-lg">stars</span></div>
                            <div>
                                <p class="text-xs font-semibold text-[#0f3d32]">${state.language === 'ms' ? 'Pakej aktif dan baki tersimpan kekal terpapar di sini.' : (state.language === 'zh' ? '多疗程专属配套与调理进度一目了然。' : 'Active packages and balance stay visible here.')}</p>
                                <p class="text-[11px] text-slate-500 mt-1">${state.language === 'ms' ? 'Pusat sehenti untuk pemulihan dan kesihatan berterusan anda.' : (state.language === 'zh' ? '尊享纯正中医一站式辨证施治与疗程跟踪服务。' : 'One-stop portal for your ongoing healing and recovery.')}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

export function renderActivePackagesWidget() {
    const widget = document.getElementById('owned-packages-widget');
    if (!widget) return;

    if (!isLoggedIn()) {
        widget.innerHTML = '';
        widget.classList.add('hidden');
        return;
    }

    const ownedKeys = Object.keys(state.activePackages).filter(k => state.activePackages[k] > 0);
    if (ownedKeys.length === 0) {
        widget.innerHTML = '';
        widget.classList.add('hidden');
        return;
    }

    widget.classList.remove('hidden');
    let html = `
        <div class="tcm-card rounded-2xl p-6 mb-8 max-w-container-max mx-auto px-4 md:px-margin-desktop bg-[#faf8f5]">
            <h4 class="font-serif text-[#0f3d32] font-bold flex items-center gap-2 mb-3">
                <span class="material-symbols-outlined text-[#c59b27]">stars</span> ${t('active_packages_widget_title')}
            </h4>
            <div class="flex overflow-x-auto md:grid md:grid-cols-2 gap-4 pb-3 md:pb-0 hide-scrollbar scroll-smooth">
    `;

    ownedKeys.forEach(key => {
        const bundle = SERVICES[key];
        const remaining = state.activePackages[key];
        html += `
            <div class="flex-shrink-0 w-[85vw] sm:w-[320px] md:w-auto flex justify-between items-center bg-white p-4 rounded-xl border border-[#e7dfd1] shadow-sm">
                <div>
                    <p class="font-semibold font-serif text-[#0f3d32]">${bundle.name}</p>
                    <p class="text-xs text-slate-500">${t('remaining_quota_lbl')} ${remaining} ${t('of_lbl')} ${bundle.sessions} ${t('lbl_sessions')}</p>
                </div>
                <button onclick="bookPackageSession('${key}')" class="btn-tcm-gold text-white text-xs px-4 py-2 rounded-full transition-all shrink-0 ml-4 font-bold">
                    ${t('btn_use_package')}
                </button>
            </div>
        `;
    });

    html += `</div></div>`;
    widget.innerHTML = html;
}

// Purchase Bundle logic
export function purchaseBundle(bundleId) {
    window.purchaseBundle = purchaseBundle;
    const bundle = SERVICES[bundleId];
    if (!bundle) return;

    if (state.walletBalance < bundle.price) {
        const errorMsg = state.language === 'ms'
            ? `Baki Dompet Yong Kang tidak mencukupi untuk membeli ${getServiceTranslation(bundle.id, 'name', bundle.name)}. Mengarah ke Tambah Nilai...`
            : (state.language === 'zh' ? `诊所钱包余额不足以购买 ${getServiceTranslation(bundle.id, 'name', bundle.name)}，正在转向充值页面...` : `Insufficient clinic wallet balance to purchase ${bundle.name}. Redirecting to Top Up...`);
        showNotification(errorMsg, 'error');
        setTimeout(() => {
            navigateTo('topup');
        }, 1500);
        return;
    }

    state.walletBalance -= bundle.price;
    const prevSessions = state.activePackages[bundleId] || 0;
    state.activePackages[bundleId] = prevSessions + bundle.sessions;
    state.packageTotalSessions[bundleId] = (state.packageTotalSessions[bundleId] || 0) + bundle.sessions;
    if (state.booking.therapist) {
        state.packageTherapists[bundleId] = state.booking.therapist;
    }

    updateHeaderWalletDisplay();
    renderActivePackagesWidget();
    saveState();
    const successMsg = state.language === 'ms'
        ? `Berjaya membeli ${getServiceTranslation(bundle.id, 'name', bundle.name)}! ${bundle.sessions} sesi ditambahkan ke pakej aktif anda.`
        : (state.language === 'zh' ? `成功开通 ${getServiceTranslation(bundle.id, 'name', bundle.name)}！共 ${bundle.sessions} 次调理已记入您的档案。` : `Success purchasing ${bundle.name}! ${bundle.sessions} sessions added to your active packages.`);
    showNotification(successMsg, 'success');
};

// Book a session from an active package
export function bookPackageSession(bundleId) {
    window.bookPackageSession = bookPackageSession;
    const bundle = SERVICES[bundleId];
    const sessionsLeft = state.activePackages[bundleId] || 0;
    if (!bundle) return;
    if (sessionsLeft <= 0) {
        showNotification(state.language === 'ms' ? 'Semua sesi untuk pakej ini telah digunakan.' : (state.language === 'zh' ? '该配套的所有疗程已全部使用完毕。' : 'All sessions for this package have been used.'), 'error');
        return;
    }

    state.pkgBooking = {
        bundleId: bundleId,
        date: null,
        time: null,
        monthOffset: 0
    };

    saveState();
    navigateTo('book-package');
};

// Start Booking flow from Homepage/Service
export function startBookingWithService(serviceId) {
    window.startBookingWithService = startBookingWithService;
    if (serviceId) {
        const service = SERVICES[serviceId];
        if (service) {
            state.booking.service = service;
            state.serviceCategory = service.type;
        }
    } else {
        state.booking.service = null;
        state.serviceCategory = 'all';
    }
    navigateTo('select-service');
};

// RENDER: STEP 1: SELECT SERVICE VIEW
export function renderSelectServiceView() {
    const container = document.getElementById('services-list-container');
    if (!container) return;

    syncServices();
    const currency = currentTenant?.currency || 'SGD';
    const category = state.serviceCategory || 'all';

    // Sync tab button styles
    document.querySelectorAll('.cat-tab-btn').forEach(btn => {
        btn.className = 'cat-tab-btn px-5 py-2 rounded-full font-serif text-xs whitespace-nowrap bg-[#faf8f5] text-slate-600 hover:bg-[#f0eae1] border border-[#e7dfd1] transition-colors';
    });
    const activeBtn = document.getElementById(`cat-tab-${category}`);
    if (activeBtn) {
        activeBtn.className = 'cat-tab-btn px-5 py-2 rounded-full font-serif text-xs whitespace-nowrap bg-[#164e3f] text-white font-bold border border-[#164e3f] shadow-sm';
    }

    const servicesToRender = Object.values(SERVICES).filter(srv => {
        if (category === 'all') return true;
        if (category === 'packages') return srv.type === 'packages';
        return srv.type === category;
    });
    servicesToRender.sort((a, b) => (b.bestValue ? 1 : 0) - (a.bestValue ? 1 : 0));

    let html = '';
    servicesToRender.forEach(srv => {
        const isSelected = state.booking.service && state.booking.service.id === srv.id;
        const isPackageDeal = srv.badge === 'PACKAGE DEAL' || srv.type === 'packages';
        const discountPercent = (srv.regularPrice && srv.regularPrice > srv.price) ? Math.round(((srv.regularPrice - srv.price) / srv.regularPrice) * 100) : 0;

        html += `
            <div class="tcm-card p-6 flex flex-col md:flex-row gap-6 items-start md:items-center transition-all duration-300 relative overflow-hidden bg-white ${isSelected ? 'ring-2 ring-[#164e3f] border-transparent' : 'hover:border-[#164e3f]/40'}">
                ${srv.bestValue ? `<div class="absolute top-0 right-0 bg-[#c59b27] text-white px-4 py-1 rounded-bl-lg font-bold text-[9px] uppercase tracking-wider z-10">${state.language === 'ms' ? 'NILAI TERBAIK' : (state.language === 'zh' ? '超值推荐' : 'BEST VALUE')}</div>` : discountPercent > 0 ? `<div class="absolute top-0 right-0 bg-[#b93826] text-white px-4 py-1 rounded-bl-lg font-bold text-[9px] uppercase tracking-wider z-10">${state.language === 'ms' ? 'JIMAT' : (state.language === 'zh' ? '立省' : 'SAVE')} ${discountPercent}%</div>` : isPackageDeal ? `<div class="absolute top-0 right-0 bg-[#164e3f] text-white px-4 py-1 rounded-bl-lg font-bold text-[9px] uppercase tracking-wider z-10">${state.language === 'ms' ? 'PAKEJ BERKALA' : (state.language === 'zh' ? '疗程配套' : 'CLINICAL COURSE')}</div>` : ''}
                
                <div class="w-full md:w-44 h-32 rounded-2xl overflow-hidden flex-shrink-0 relative">
                    ${isSelected ? `
                        <div class="absolute inset-0 bg-[#164e3f]/25 z-10 flex items-center justify-center backdrop-blur-[1px]">
                            <div class="w-8 h-8 rounded-full bg-[#164e3f] text-white flex items-center justify-center shadow-md">
                                <span class="material-symbols-outlined text-[20px]">check</span>
                            </div>
                        </div>
                    ` : ''}
                    <img class="w-full h-full object-cover" src="${srv.image}" alt="${srv.name}">
                </div>
                
                <div class="flex-grow flex flex-col gap-1.5 pt-2 md:pt-0">
                    <div class="flex justify-between items-start flex-wrap gap-2">
                        <div>
                            <span class="tcm-seal text-[9px] mb-1 inline-block">${srv.type.toUpperCase()}</span>
                            <h3 class="font-serif text-base text-[#0f3d32] font-bold">${getServiceTranslation(srv.id, 'name', srv.name)}</h3>
                        </div>
                        ${srv.regularPrice && srv.regularPrice > srv.price ? `
                            <div class="flex flex-col items-end whitespace-nowrap">
                                <span class="text-[10px] text-slate-400 line-through decoration-red-500">${currency} ${srv.regularPrice.toFixed(2)}</span>
                                <span class="font-serif text-base text-[#0f3d32] font-bold">${currency} ${srv.price}</span>
                                <span class="text-[9px] font-bold text-[#b93826] bg-red-50 px-1.5 py-0.5 rounded-md mt-0.5">${state.language === 'ms' ? 'JIMAT' : (state.language === 'zh' ? '立省' : 'SAVE')} ${currency} ${Math.round(srv.regularPrice - srv.price)}</span>
                            </div>
                        ` : `
                            <span class="font-serif text-base text-[#0f3d32] font-bold whitespace-nowrap">${currency} ${srv.price}</span>
                        `}
                    </div>
                    <p class="text-xs text-slate-600 line-clamp-2 leading-relaxed">${getServiceTranslation(srv.id, 'desc', srv.description)}</p>
                    <div class="flex items-center gap-2 text-slate-500 mt-2 text-xs">
                        <span class="material-symbols-outlined text-base text-[#164e3f]">schedule</span>
                        <span class="font-medium">${state.language === 'ms' ? srv.duration.replace('Mins', 'Minit') : (state.language === 'zh' ? srv.duration.replace('Mins', '分钟') : srv.duration)}</span>
                    </div>
                </div>
                
                <button onclick="selectService('${srv.id}')" class="w-full md:w-auto px-6 py-2 rounded-full font-bold text-xs transition-all flex-shrink-0 mt-4 md:mt-0 ${isSelected ? 'bg-transparent border border-[#164e3f] text-[#164e3f] hover:bg-[#164e3f]/5' : (srv.bestValue ? 'btn-tcm-gold text-white shadow-sm' : 'btn-tcm-primary text-white shadow-sm')}">
                    ${isSelected ? (state.language === 'ms' ? 'Dipilih' : (state.language === 'zh' ? '已选择' : 'Selected')) : (state.language === 'ms' ? 'Pilih Rawatan' : (state.language === 'zh' ? '选择该项' : 'Select'))}
                </button>
            </div>
        `;
    });

    container.innerHTML = html;
    renderSidebarSummary();
}

export function filterServiceCategory(category) {
    window.filterServiceCategory = filterServiceCategory;
    state.serviceCategory = category;
    renderSelectServiceView();
};

export function selectService(serviceId) {
    window.selectService = selectService;
    const srv = SERVICES[serviceId];
    if (!srv) return;

    state.booking.service = srv;
    renderSelectServiceView();
};

// RENDER: STEP 2: SELECT THERAPIST VIEW
export function renderSelectTherapistView() {
    const container = document.getElementById('therapist-grid-container');
    if (!container) return;

    let html = '';
    Object.values(THERAPISTS).forEach(therapist => {
        const isSelected = state.booking.therapist && state.booking.therapist.id === therapist.id;

        const imageHtml = therapist.id === 'no-preference' ? `
            <div class="w-20 h-20 rounded-2xl bg-[#faf8f5] flex items-center justify-center shrink-0 border border-[#e7dfd1]">
                <span class="material-symbols-outlined text-[#164e3f] text-3xl">medical_services</span>
            </div>
        ` : `
            <div class="w-20 h-20 rounded-2xl overflow-hidden shrink-0 border-2 ${isSelected ? 'border-[#164e3f]' : 'border-[#c59b27]/40'} shadow-sm">
                <img class="w-full h-full object-cover" src="${therapist.image}" alt="${therapist.name}">
            </div>
        `;

        html += `
            <div onclick="selectTherapist('${therapist.id}')" class="tcm-card p-6 relative overflow-hidden transition-all duration-300 group cursor-pointer bg-white ${isSelected ? 'ring-2 ring-[#164e3f] border-transparent' : 'hover:border-[#164e3f]/40'}">
                ${isSelected ? `
                    <div class="absolute top-4 right-4 w-6 h-6 rounded-full bg-[#164e3f] text-white flex items-center justify-center shadow-sm">
                        <span class="material-symbols-outlined text-[16px]">check</span>
                    </div>
                ` : ''}
                
                <div class="flex items-start gap-4 mb-4">
                    ${imageHtml}
                    <div>
                        <span class="tcm-seal text-[8px] mb-1 inline-block">${therapist.id === 'no-preference' ? 'AUTO MATCH' : 'TCMPB CERTIFIED'}</span>
                        <h3 class="font-serif text-base text-[#0f3d32] font-bold mb-0.5">${therapist.name}</h3>
                        <p class="text-xs text-[#c59b27] font-semibold mb-2">${therapist.role}</p>
                        <div class="flex flex-wrap gap-1.5">
                            ${therapist.specialties.map(spec => `<span class="px-2 py-0.5 bg-[#164e3f]/10 text-[#164e3f] text-[9px] font-bold rounded-full">${spec}</span>`).join('')}
                        </div>
                    </div>
                </div>
                
                <p class="text-xs text-slate-600 line-clamp-3 mb-4 leading-relaxed">${therapist.description}</p>
                
                <div class="flex items-center gap-2.5 mt-auto">
                    ${therapist.id !== 'no-preference' ? `
                        <button onclick="event.stopPropagation(); window.openTherapistModal('${therapist.id}')" class="flex-1 py-2 px-3 rounded-full border border-[#164e3f]/40 text-[#164e3f] text-xs font-bold hover:bg-[#164e3f]/5 transition-all flex items-center justify-center gap-1.5 cursor-pointer">
                            <span class="material-symbols-outlined text-[15px]">badge</span>
                            ${state.language === 'ms' ? 'Profil Pengamal' : (state.language === 'zh' ? '医师简介' : 'View Bio')}
                        </button>
                    ` : ''}
                    <button onclick="selectTherapist('${therapist.id}')" class="${therapist.id !== 'no-preference' ? 'flex-1' : 'w-full'} py-2 px-4 rounded-full font-bold text-xs transition-colors shadow-sm cursor-pointer ${isSelected ? 'btn-tcm-primary text-white' : 'bg-[#faf8f5] border border-[#e7dfd1] text-[#0f3d32] group-hover:bg-[#164e3f]/10'}">
                        ${isSelected ? (state.language === 'ms' ? 'Dipilih' : (state.language === 'zh' ? '已选定' : 'Selected')) : (state.language === 'ms' ? 'Pilih Pengamal' : (state.language === 'zh' ? '选择医师' : 'Select'))}
                    </button>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
    renderSidebarSummary();
}

export function selectTherapist(therapistId) {
    window.selectTherapist = selectTherapist;
    const therapist = THERAPISTS[therapistId];
    if (!therapist) return;

    state.booking.therapist = therapist;
    renderSelectTherapistView();
};

// RENDER: STEP 3: SELECT DATE & TIME VIEW
export let currentMonth = new Date(new Date().getFullYear(), new Date().getMonth()); // Current month and year
export let selectedDateObj = null;

export function renderSelectTimeView() {
    if (!selectedDateObj) {
        selectedDateObj = new Date(); // Today
        const options = { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' };
        state.booking.date = selectedDateObj.toLocaleDateString('en-US', options);
    }
    if (!state.booking.time) {
        state.booking.time = '11:00 AM';
    }
    renderCalendar();
    renderTimeSlots();
    renderSidebarSummary();
}

export function renderCalendar() {
    const calendarMonthText = document.getElementById('calendar-month-text');
    const calendarGrid = document.getElementById('calendar-days-grid');
    if (!calendarMonthText || !calendarGrid) return;

    calendarMonthText.textContent = currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' });

    // Dynamic offset calculations
    const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const startDayOfWeek = firstDay.getDay(); // 0 is Sun, 1 is Mon, etc.
    let html = '';
    for (let i = 0; i < startDayOfWeek; i++) {
        html += '<div></div>';
    }

    // Dynamic total days calculation
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const tempDate = new Date(year, month + 1, 0);
    const daysInMonth = tempDate.getDate();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let day = 1; day <= daysInMonth; day++) {
        const cellDate = new Date(year, month, day);
        cellDate.setHours(0, 0, 0, 0);

        const isDisabled = cellDate < today;
        const isSelected = selectedDateObj && selectedDateObj.getDate() === day && selectedDateObj.getMonth() === month && selectedDateObj.getFullYear() === year;

        html += `
            <button ${isDisabled ? 'disabled' : ''} onclick="selectDate(${day})" class="h-10 w-10 mx-auto rounded-full font-body-sm text-body-sm flex items-center justify-center transition-colors disabled:opacity-30 disabled:hover:bg-transparent ${isSelected ? 'bg-primary text-white shadow-md font-bold' : 'text-on-surface hover:bg-surface-container-high'}">
                ${day}
            </button>
        `;
    }

    calendarGrid.innerHTML = html;
}

export function prevMonth() {
    window.prevMonth = prevMonth;
    const todayBase = new Date(new Date().getFullYear(), new Date().getMonth(), 1); // Current base month
    const targetMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
    if (targetMonth < todayBase) {
        showNotification(state.language === 'ms' ? 'Tidak boleh memilih bulan yang lepas.' : 'Cannot select past months.', 'info');
        return;
    }
    currentMonth.setMonth(currentMonth.getMonth() - 1);
    renderCalendar();
};

export function nextMonth() {
    window.nextMonth = nextMonth;
    currentMonth.setMonth(currentMonth.getMonth() + 1);
    renderCalendar();
};

export function selectDate(day) {
    window.selectDate = selectDate;
    selectedDateObj = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const options = { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' };
    state.booking.date = selectedDateObj.toLocaleDateString('en-US', options);

    renderCalendar();
    renderSidebarSummary();
};

export function renderTimeSlots() {
    const morningSlotsContainer = document.getElementById('morning-slots-container');
    const afternoonSlotsContainer = document.getElementById('afternoon-slots-container');
    if (!morningSlotsContainer || !afternoonSlotsContainer) return;

    const morningSlots = ['09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM'];
    const afternoonSlots = ['01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM', '06:00 PM'];

    let morningHtml = '';
    morningSlots.forEach(time => {
        const isSelected = state.booking.time === time;
        const isOccupied = time === '12:00 PM'; // simulasi slot penuh

        morningHtml += `
            <button ${isOccupied ? 'disabled' : ''} onclick="selectTime('${time}')" class="px-4 py-2 rounded-lg border font-body-sm text-xs transition-colors ${isSelected ? 'border-primary bg-primary/10 text-primary font-bold' : isOccupied ? 'border-outline-variant text-on-surface opacity-30 cursor-not-allowed bg-surface-container' : 'border-outline-variant text-on-surface hover:border-primary hover:bg-primary/5'}">
                ${time.replace(' AM', '').replace(' PM', '')}
            </button>
        `;
    });
    morningSlotsContainer.innerHTML = morningHtml;

    let afternoonHtml = '';
    afternoonSlots.forEach(time => {
        const isSelected = state.booking.time === time;
        const isOccupied = time === '03:00 PM'; // simulasi slot penuh

        afternoonHtml += `
            <button ${isOccupied ? 'disabled' : ''} onclick="selectTime('${time}')" class="px-4 py-2 rounded-lg border font-body-sm text-xs transition-colors ${isSelected ? 'border-primary bg-primary/10 text-primary font-bold' : isOccupied ? 'border-outline-variant text-on-surface opacity-30 cursor-not-allowed bg-surface-container' : 'border-outline-variant text-on-surface hover:border-primary hover:bg-primary/5'}">
                ${time.replace(' AM', '').replace(' PM', '')}
            </button>
        `;
    });
    afternoonSlotsContainer.innerHTML = afternoonHtml;
}

export function selectTime(time) {
    window.selectTime = selectTime;
    state.booking.time = time;
    renderTimeSlots();
    renderSidebarSummary();
};

// RENDER: STEP 4: CONFIRM BOOKING VIEW
export let isEditingGuest = false;

export function renderConfirmBookingView() {
    renderGuestInfoCard();
    renderPaymentMethodSelection();
    renderSidebarSummary();
}

export function renderGuestInfoCard() {
    const container = document.getElementById('confirm-guest-container');
    if (!container) return;

    if (isEditingGuest) {
        container.innerHTML = `
            <div class="flex items-center justify-between mb-6 border-b border-[#e7dfd1] pb-4">
                <h2 class="font-serif text-base text-[#0f3d32] flex items-center gap-2 font-bold">
                    <span class="material-symbols-outlined text-[#164e3f]">person</span> ${t('guest_info_title')}
                </h2>
                <button onclick="saveGuestInfo()" class="text-[#164e3f] hover:text-[#0f3d32] transition-colors text-xs font-bold underline">${state.language === 'ms' ? 'Simpan' : (state.language === 'zh' ? '保存' : 'Save')}</button>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label class="block text-xs font-bold text-slate-600 mb-1">${state.language === 'ms' ? 'Nama Penuh' : (state.language === 'zh' ? '姓名' : 'Full Name')}</label>
                    <input id="edit-guest-name" type="text" class="w-full bg-white border border-[#e7dfd1] rounded-xl px-3 py-2 text-sm text-slate-800 focus:ring-1 focus:ring-[#164e3f] focus:border-[#164e3f]" value="${state.guestInfo.name}">
                </div>
                <div>
                    <label class="block text-xs font-bold text-slate-600 mb-1">${state.language === 'ms' ? 'Alamat E-mel' : (state.language === 'zh' ? '电子邮箱' : 'Email Address')}</label>
                    <input id="edit-guest-email" type="email" class="w-full bg-white border border-[#e7dfd1] rounded-xl px-3 py-2 text-sm text-slate-800 focus:ring-1 focus:ring-[#164e3f] focus:border-[#164e3f]" value="${state.guestInfo.email}">
                </div>
                <div>
                    <label class="block text-xs font-bold text-slate-600 mb-1">${state.language === 'ms' ? 'Nombor Telefon' : (state.language === 'zh' ? '联系电话' : 'Phone Number')}</label>
                    <input id="edit-guest-phone" type="text" class="w-full bg-white border border-[#e7dfd1] rounded-xl px-3 py-2 text-sm text-slate-800 focus:ring-1 focus:ring-[#164e3f] focus:border-[#164e3f]" value="${state.guestInfo.phone}">
                </div>
                <div class="md:col-span-2">
                    <label class="block text-xs font-bold text-slate-600 mb-1">${state.language === 'ms' ? 'Permintaan Khas / Gejala Sakit' : (state.language === 'zh' ? '特殊就诊需求 / 既往病史' : 'Special Requests / Health Concerns')}</label>
                    <textarea id="edit-guest-requests" rows="3" class="w-full bg-white border border-[#e7dfd1] rounded-xl px-3 py-2 text-sm text-slate-800 focus:ring-1 focus:ring-[#164e3f] focus:border-[#164e3f]">${state.guestInfo.specialRequests}</textarea>
                </div>
            </div>
        `;
    } else {
        container.innerHTML = `
            <div class="flex items-center justify-between mb-6 border-b border-[#e7dfd1] pb-4">
                <h2 class="font-serif text-base text-[#0f3d32] flex items-center gap-2 font-bold">
                    <span class="material-symbols-outlined text-[#164e3f]">person</span> ${t('guest_info_title')}
                </h2>
                <button onclick="toggleEditGuest(true)" class="text-[#164e3f] hover:text-[#0f3d32] transition-colors text-xs font-bold underline">${state.language === 'ms' ? 'Ubah' : (state.language === 'zh' ? '修改' : 'Edit')}</button>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <p class="text-[10px] text-slate-500 mb-1 font-bold uppercase tracking-wider">${state.language === 'ms' ? 'Nama Penuh' : (state.language === 'zh' ? '患者姓名' : 'Full Name')}</p>
                    <p class="font-serif text-sm font-bold text-[#0f3d32]">${state.guestInfo.name}</p>
                </div>
                <div>
                    <p class="text-[10px] text-slate-500 mb-1 font-bold uppercase tracking-wider">${state.language === 'ms' ? 'Alamat E-mel' : (state.language === 'zh' ? '电子邮箱' : 'Email Address')}</p>
                    <p class="text-sm text-slate-800">${state.guestInfo.email}</p>
                </div>
                <div>
                    <p class="text-[10px] text-slate-500 mb-1 font-bold uppercase tracking-wider">${state.language === 'ms' ? 'Nombor Telefon' : (state.language === 'zh' ? '联系电话' : 'Phone Number')}</p>
                    <p class="text-sm text-slate-800">${state.guestInfo.phone}</p>
                </div>
            </div>
            <div class="mt-6 pt-6 border-t border-[#e7dfd1]">
                <p class="text-[10px] text-slate-500 mb-2 font-bold uppercase tracking-wider">${state.language === 'ms' ? 'Permintaan Khas / Gejala Sakit' : (state.language === 'zh' ? '就诊备注' : 'Special Requests')}</p>
                <div class="bg-[#faf8f5] rounded-xl p-4 border border-[#e7dfd1]">
                    <p class="text-xs text-slate-700 italic">"${state.guestInfo.specialRequests || (state.language === 'ms' ? 'Tiada permintaan khas.' : (state.language === 'zh' ? '暂无特殊需求。' : 'No special requests.'))}"</p>
                </div>
            </div>
        `;
    }
}

export function toggleEditGuest(editing) {
    window.toggleEditGuest = toggleEditGuest;
    isEditingGuest = editing;
    renderGuestInfoCard();
};

export function saveGuestInfo() {
    window.saveGuestInfo = saveGuestInfo;
    const name = document.getElementById('edit-guest-name').value;
    const email = document.getElementById('edit-guest-email').value;
    const phone = document.getElementById('edit-guest-phone').value;
    const specialRequests = document.getElementById('edit-guest-requests').value;

    state.guestInfo = { name, email, phone, specialRequests };
    isEditingGuest = false;
    renderGuestInfoCard();
    showNotification(state.language === 'ms' ? 'Maklumat tetamu berjaya dikemas kini.' : (state.language === 'zh' ? '就诊信息更新成功。' : 'Guest information successfully updated.'), 'success');
};

export let selectedPaymentMethod = 'wallet'; // default payment method

export function renderPaymentMethodSelection() {
    const container = document.getElementById('payment-methods-container');
    if (!container) return;

    const currency = currentTenant?.currency || 'SGD';
    const walletName = `${currentTenant?.name || 'Yong Kang TCM'} Clinic Wallet`;
    const methods = [
        { id: 'wallet', name: walletName, icon: 'account_balance_wallet' }
    ];

    const selectedMethod = methods.find(m => m.id === selectedPaymentMethod) || methods[0];
    const selectedDisplayName = selectedMethod.id === 'wallet' ? `${selectedMethod.name} <span class="text-xs text-slate-500 font-normal whitespace-nowrap">(${state.language === 'ms' ? 'Baki' : (state.language === 'zh' ? '余额' : 'Balance')}: ${currency} ${state.walletBalance.toFixed(2)})</span>` : selectedMethod.name;

    let html = `
        <div class="relative w-full text-left" id="payment-dropdown-container">
            <!-- Dropdown Trigger -->
            <button type="button" onclick="togglePaymentDropdown(event)" class="w-full flex items-center justify-between bg-white border ${window.paymentDropdownOpen ? 'border-[#164e3f] ring-1 ring-[#164e3f]' : 'border-[#e7dfd1] hover:border-[#164e3f]/50'} rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none transition-all shadow-sm">
                <div class="flex items-center gap-3 overflow-hidden">
                    <span class="material-symbols-outlined text-[#164e3f] text-xl shrink-0">${selectedMethod.icon}</span>
                    <span class="font-bold text-[#0f3d32] font-serif flex flex-wrap items-center gap-1 text-left">${selectedDisplayName}</span>
                </div>
                <span id="payment-dropdown-icon" class="material-symbols-outlined text-slate-500 transition-transform duration-200 shrink-0" style="transform: ${window.paymentDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)'}">keyboard_arrow_down</span>
            </button>

            <!-- Dropdown Menu -->
            <div id="payment-dropdown-menu" class="${window.paymentDropdownOpen ? '' : 'hidden'} absolute z-[60] w-full mt-2 bg-white border border-[#e7dfd1] rounded-xl shadow-xl overflow-hidden origin-top animate-fade-in">
    `;
    
    methods.forEach(method => {
        const isSelected = selectedPaymentMethod === method.id;
        const displayName = method.id === 'wallet' ? `${method.name} <span class="text-xs text-slate-500 font-normal ml-1 whitespace-nowrap">(${state.language === 'ms' ? 'Baki' : (state.language === 'zh' ? '余额' : 'Balance')}: ${currency} ${state.walletBalance.toFixed(2)})</span>` : method.name;
        
        html += `
                <button type="button" onclick="selectPaymentMethod('${method.id}', event)" class="w-full flex items-center justify-between px-4 py-3.5 hover:bg-[#faf8f5] transition-colors border-b border-[#e7dfd1] last:border-0 ${isSelected ? 'bg-[#164e3f]/5' : ''}">
                    <div class="flex items-center gap-3 overflow-hidden">
                        <span class="material-symbols-outlined text-xl shrink-0 ${isSelected ? 'text-[#164e3f]' : 'text-slate-400'}">${method.icon}</span>
                        <span class="text-sm font-serif text-left ${isSelected ? 'font-bold text-[#164e3f]' : 'font-medium text-slate-700'} flex flex-wrap items-center">${displayName}</span>
                    </div>
                    ${isSelected ? '<span class="material-symbols-outlined text-[#164e3f] text-lg shrink-0 ml-2">check_circle</span>' : ''}
                </button>
        `;
    });

    html += `
            </div>
        </div>
    `;

    container.innerHTML = html;
}

window.paymentDropdownOpen = false;

export function togglePaymentDropdown(event, forceState) {
    window.togglePaymentDropdown = togglePaymentDropdown;
    if (event && event.stopPropagation) {
        event.stopPropagation();
    }
    let resolvedForce = forceState;
    if (typeof event === 'boolean') {
        resolvedForce = event;
    }
    if (typeof resolvedForce === 'boolean') {
        window.paymentDropdownOpen = resolvedForce;
    } else {
        window.paymentDropdownOpen = !window.paymentDropdownOpen;
    }
    renderPaymentMethodSelection();
};

document.addEventListener('click', function(event) {
    const container = document.getElementById('payment-dropdown-container');
    if (container && !container.contains(event.target) && window.paymentDropdownOpen) {
        window.togglePaymentDropdown(false);
    }
});

export function selectPaymentMethod(methodId, event) {
    window.selectPaymentMethod = selectPaymentMethod;
    if (event && event.stopPropagation) {
        event.stopPropagation();
    }
    selectedPaymentMethod = methodId;
    window.paymentDropdownOpen = false;
    renderPaymentMethodSelection();
    renderSidebarSummary(); // recalculate price breakdown if bundle could be applied
};


export function renderAboutView() {
    const container = document.getElementById('about-therapists-container');
    if (!container) return;
    
    // Use the THERAPISTS array from Database.js
    const html = Object.values(THERAPISTS).filter(t => t.id !== 'no-preference').map(therapist => {
        return `
            <div class="glass-card rounded-xl overflow-hidden flex flex-col group border border-outline-variant/30 hover:border-primary/50 transition-colors">
                <div class="h-48 bg-surface-variant relative overflow-hidden">
                    ${therapist.image 
                        ? `<img src="${therapist.image}" alt="${therapist.name}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">`
                        : `<div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5 text-primary text-4xl font-serif">
                            ${therapist.name.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase()}
                           </div>`
                    }
                </div>
                <div class="p-6 flex flex-col flex-1">
                    <h3 class="font-serif text-xl text-on-surface font-bold mb-1">${therapist.name}</h3>
                    <p class="text-xs text-primary font-medium mb-3">${therapist.specialty}</p>
                    <p class="text-xs text-on-surface-variant leading-relaxed line-clamp-3 mb-4 flex-1">${therapist.description}</p>
                    <div class="flex items-center gap-2 mt-auto">
                        <span class="material-symbols-outlined text-amber-400 text-sm">star</span>
                        <span class="text-xs font-semibold text-on-surface">${therapist.rating}</span>
                        <span class="text-xs text-on-surface-variant ml-auto font-medium">${therapist.experience} Exp</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    container.innerHTML = html;
}
window.renderAboutView = renderAboutView;
window.renderActiveViewContents = renderActiveViewContents;
window.updateHeaderWalletDisplay = updateHeaderWalletDisplay;
window.renderHomeView = renderHomeView;
window.renderDashboardView = renderDashboardView;
window.renderServicesCatalogView = renderServicesCatalogView;
window.renderActivePackagesWidget = renderActivePackagesWidget;
window.purchaseBundle = purchaseBundle;
window.bookPackageSession = bookPackageSession;
window.startBookingWithService = startBookingWithService;
window.renderSelectServiceView = renderSelectServiceView;
window.filterServiceCategory = filterServiceCategory;
window.selectService = selectService;
window.renderSelectTherapistView = renderSelectTherapistView;
window.selectTherapist = selectTherapist;
window.renderSelectTimeView = renderSelectTimeView;
window.renderCalendar = renderCalendar;
window.prevMonth = prevMonth;
window.nextMonth = nextMonth;
window.selectDate = selectDate;
window.renderTimeSlots = renderTimeSlots;
window.selectTime = selectTime;
window.renderConfirmBookingView = renderConfirmBookingView;
window.renderActiveViewContents = renderActiveViewContents;
window.updateHeaderWalletDisplay = updateHeaderWalletDisplay;
window.renderHomeView = renderHomeView;
window.renderServicesCatalogView = renderServicesCatalogView;
window.renderActivePackagesWidget = renderActivePackagesWidget;
window.purchaseBundle = purchaseBundle;
window.bookPackageSession = bookPackageSession;
window.startBookingWithService = startBookingWithService;
window.renderSelectServiceView = renderSelectServiceView;
window.filterServiceCategory = filterServiceCategory;
window.selectService = selectService;
window.renderSelectTherapistView = renderSelectTherapistView;
window.selectTherapist = selectTherapist;
window.renderSelectTimeView = renderSelectTimeView;
window.renderCalendar = renderCalendar;
window.prevMonth = prevMonth;
window.nextMonth = nextMonth;
window.selectDate = selectDate;
window.renderTimeSlots = renderTimeSlots;
window.selectTime = selectTime;
window.renderConfirmBookingView = renderConfirmBookingView;
window.renderGuestInfoCard = renderGuestInfoCard;
window.toggleEditGuest = toggleEditGuest;
window.saveGuestInfo = saveGuestInfo;
window.renderPaymentMethodSelection = renderPaymentMethodSelection;
window.togglePaymentDropdown = togglePaymentDropdown;
window.selectPaymentMethod = selectPaymentMethod;

export function resetSelectedDateObj() {
    selectedDateObj = null;
}

export function resetIsEditingGuest() {
    isEditingGuest = false;
}

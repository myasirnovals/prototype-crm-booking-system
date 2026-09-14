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
    balances.forEach(bal => {
        if (loggedIn) {
            bal.textContent = `MYR ${state.walletBalance.toFixed(2)}`;
        } else {
            bal.textContent = `MYR 0.00`;
        }
    });

    const walletPills = document.querySelectorAll('.wallet-nav-pill');
    walletPills.forEach(pill => {
        pill.classList.remove('hidden');
    });
}

// RENDER: HOME VIEW (REBUILT TO MATCH SCREENSHOT DESIGN)
export function renderHomeView() {
    const container = document.getElementById('home-dynamic-content');
    if (!container) return;

    // Sync from localStorage state first
    syncServices();

    const featured = Object.values(SERVICES).filter(s => s.showOnHome);
    featured.sort((a, b) => (b.bestValue ? 1 : 0) - (a.bestValue ? 1 : 0));
    const slicedFeatured = featured.slice(0, 5);

    let gridHtml = '';
    if (slicedFeatured.length === 0) {
        gridHtml = `
            <div class="col-span-12 text-center py-12 bg-white rounded-3xl border border-outline-variant/30">
                <span class="material-symbols-outlined text-5xl text-on-surface-variant/40 mb-3">spa</span>
                <p class="text-sm text-on-surface-variant">${state.language === 'ms' ? 'Tiada perkhidmatan pilihan dipilih. Sila pilih beberapa perkhidmatan dari panel pentadbir.' : 'No featured services selected. Please feature some services from the admin panel.'}</p>
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
                ? 'BUNDLE'
                : (s.type || 'Service').toUpperCase();

            // Calculate saving percent and badge html
            const discountPercent = (s.regularPrice && s.regularPrice > s.price) ? Math.round(((s.regularPrice - s.price) / s.regularPrice) * 100) : 0;
            const discountBadgeHtml = discountPercent > 0 ? `<div class="absolute top-4 left-4 bg-[#EAB308] text-white px-2.5 py-1 rounded-full font-bold text-[9px] uppercase tracking-wider shadow-sm z-10">${state.language === 'ms' ? 'JIMAT' : 'SAVE'} ${discountPercent}%</div>` : '';

            if (isLarge) {
                // md:col-span-12
                return `
                    <div class="md:col-span-12 min-h-[320px] bg-white shadow-sm group rounded-3xl overflow-hidden flex flex-col md:flex-row border border-outline-variant/30 relative flex-shrink-0 w-[85vw] sm:w-[360px] md:w-auto">
                        ${s.bestValue ? `<div class="absolute top-4 right-4 bg-[#FACC15] text-[#241a00] px-3.5 py-1 rounded-full font-bold text-[10px] uppercase tracking-wider shadow-sm z-10">${state.language === 'ms' ? 'Nilai Terbaik' : 'Best Value'}</div>` : ''}
                        ${discountBadgeHtml}
                        <div class="w-full md:w-[320px] h-56 md:h-auto shrink-0 p-6 flex">
                            <img class="w-full h-full object-cover rounded-2xl" src="${s.image}" alt="${s.name}">
                        </div>
                        <div class="flex-grow p-6 md:p-8 flex flex-col justify-between">
                            <div>
                                <div class="flex gap-2 mb-3">
                                    <span class="px-3 py-1 bg-surface-variant/50 text-on-surface-variant text-[11px] font-semibold rounded-full">${badgeLabel}</span>
                                    ${isPackage ? `<span class="px-3 py-1 bg-surface-variant/50 text-on-surface-variant text-[11px] font-semibold rounded-full">Package Deal</span>` : ''}
                                </div>
                                <h3 class="font-title-md text-xl mb-2 font-bold font-serif text-[#3c4c2b]">${getServiceTranslation(s.id, 'name', s.name)}</h3>
                                <p class="text-body-sm text-xs text-on-surface-variant line-clamp-3 leading-relaxed">${getServiceTranslation(s.id, 'desc', s.description)}</p>
                            </div>
                            <div class="flex items-center justify-between mt-auto pt-4 border-t border-outline-variant/20">
                                <div>
                                    ${s.regularPrice && s.regularPrice > s.price ? `<span class="text-on-surface-variant/60 text-[11px] block line-through decoration-red-500">MYR ${s.regularPrice.toFixed(2)} (${state.language === 'ms' ? 'Biasa' : 'Regular'})</span>` : ''}
                                    <span class="font-serif text-2xl text-[#1e293b] font-bold">MYR ${s.price}</span>
                                </div>
                                <button onclick="startBookingWithService('${s.id}')" class="${s.bestValue ? 'bg-[#FACC15] hover:bg-[#eab308] text-[#241a00]' : 'bg-[#50613f] hover:bg-[#3e4b30] text-white'} px-6 py-2.5 rounded-full font-bold transition-all text-xs flex items-center gap-1.5 shadow-sm">
                                    ${isPackage ? (state.language === 'ms' ? 'Tempah Pakej' : 'Book Package') : (state.language === 'ms' ? 'Tempah Rawatan' : 'Book Service')} <span class="material-symbols-outlined text-sm ml-1">calendar_month</span>
                                </button>
                            </div>
                        </div>
                    </div>
                `;
            } else if (isSmall) {
                // md:col-span-4
                return `
                    <div class="md:col-span-4 bg-white shadow-sm group rounded-3xl overflow-hidden flex flex-col border border-outline-variant/30 p-4 animate-fade-in relative flex-shrink-0 w-[85vw] sm:w-[360px] md:w-auto">
                        ${s.bestValue ? `<div class="absolute top-4 right-4 bg-[#FACC15] text-[#241a00] px-3.5 py-1 rounded-full font-bold text-[9px] uppercase tracking-wider shadow-sm z-10">${state.language === 'ms' ? 'Nilai Terbaik' : 'Best Value'}</div>` : ''}
                        ${discountBadgeHtml}
                        <div class="w-full h-56 md:h-[180px] rounded-2xl overflow-hidden mb-4 shrink-0">
                            <img class="w-full h-full object-cover" src="${s.image}" alt="${s.name}">
                        </div>
                        <div class="flex-grow flex flex-col justify-between">
                            <div>
                                <div class="mb-1">
                                    <span class="px-3 py-1 bg-surface-variant/50 text-on-surface-variant text-[11px] font-semibold rounded-full">${badgeLabel}</span>
                                </div>
                                <h3 class="font-title-md text-sm font-bold font-serif text-[#3c4c2b] mb-1 line-clamp-1 leading-snug">${getServiceTranslation(s.id, 'name', s.name)}</h3>
                                <p class="text-body-sm text-[11px] text-on-surface-variant line-clamp-3 leading-relaxed">${getServiceTranslation(s.id, 'desc', s.description)}</p>
                            </div>
                            <div class="flex justify-between items-center mt-auto pt-3 border-t border-outline-variant/10">
                                <div class="flex flex-col">
                                    ${s.regularPrice && s.regularPrice > s.price ? `<span class="text-on-surface-variant/50 text-[10px] line-through decoration-red-500">MYR ${s.regularPrice.toFixed(2)}</span>` : ''}
                                    <span class="font-serif text-sm text-[#1e293b] font-bold">MYR ${s.price}</span>
                                </div>
                                <button onclick="startBookingWithService('${s.id}')" class="${s.bestValue ? 'bg-[#FACC15] hover:bg-[#eab308] text-[#241a00]' : 'bg-[#50613f] hover:bg-[#3e4b30] text-white'} px-3 py-1.5 rounded-full font-bold text-[10px] shadow-sm transition-all whitespace-nowrap">
                                    ${isPackage ? (state.language === 'ms' ? 'Tempah Pakej' : 'Book Package') : (state.language === 'ms' ? 'Tempah Rawatan' : 'Book Service')}
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
                        <img class="w-full h-full object-cover rounded-2xl" src="${s.image}" alt="${s.name}">
                    </div>
                `;
                const contentHtml = `
                    <div class="flex-grow p-6 flex flex-col justify-between ${contentOrderClass}">
                        <div>
                            <div class="mb-2">
                                <span class="px-3 py-1 bg-surface-variant/50 text-on-surface-variant text-[11px] font-semibold rounded-full">${badgeLabel}</span>
                            </div>
                            <h3 class="font-title-md text-base font-bold font-serif text-[#3c4c2b] mb-2">${getServiceTranslation(s.id, 'name', s.name)}</h3>
                            <p class="text-body-sm text-xs text-on-surface-variant line-clamp-3 leading-relaxed">${getServiceTranslation(s.id, 'desc', s.description)}</p>
                        </div>
                        <div class="flex items-center justify-between mt-auto pt-4 border-t border-outline-variant/20">
                            <div class="flex flex-col">
                                ${s.regularPrice && s.regularPrice > s.price ? `<span class="text-on-surface-variant/50 text-[10px] line-through decoration-red-500">MYR ${s.regularPrice.toFixed(2)}</span>` : ''}
                                <span class="font-serif text-base text-[#1e293b] font-bold">MYR ${s.price}</span>
                            </div>
                            <button onclick="startBookingWithService('${s.id}')" class="${s.bestValue ? 'bg-[#FACC15] hover:bg-[#eab308] text-[#241a00]' : 'bg-[#50613f] hover:bg-[#3e4b30] text-white'} px-4 py-2 rounded-full font-bold text-xs shadow-sm transition-all">
                                ${isPackage ? (state.language === 'ms' ? 'Tempah Pakej' : 'Book Package') : (state.language === 'ms' ? 'Tempah Rawatan' : 'Book Service')}
                            </button>
                        </div>
                    </div>
                `;

                return `
                    <div class="md:col-span-8 bg-white shadow-sm group rounded-3xl overflow-hidden flex flex-col md:flex-row border border-outline-variant/30 relative flex-shrink-0 w-[85vw] sm:w-[360px] md:w-auto">
                        ${s.bestValue ? `<div class="absolute top-4 right-4 bg-[#FACC15] text-[#241a00] px-3.5 py-1 rounded-full font-bold text-[9px] uppercase tracking-wider shadow-sm z-10">${state.language === 'ms' ? 'Nilai Terbaik' : 'Best Value'}</div>` : ''}
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
                <h2 class="font-headline-lg text-3xl md:text-4xl text-[#3c4c2b] mb-3 font-bold font-serif">${state.language === 'ms' ? 'Katalog Perkhidmatan' : 'Service Catalog'}</h2>
                <p class="font-body-sm text-xs md:text-sm text-on-surface-variant max-w-lg mx-auto leading-relaxed">${state.language === 'ms' ? 'Pilih daripada pelbagai rawatan holistik kami, direka khas untuk meremajakan minda dan badan anda.' : 'Choose from our range of holistic treatments, tailored to rejuvenate your mind and body.'}</p>
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

    container.innerHTML = `
        <!-- Hero Section with Main Headline -->
        <div class="relative w-full min-h-[400px] flex items-center justify-center bg-[#FAF9F6]">
            <!-- Background Image with Fade/Overlay -->
            <div class="absolute inset-0 w-full h-full opacity-15">
                <img class="w-full h-full object-cover" src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1600&h=700&q=80" alt="Spa Background">
            </div>
            
            <div class="relative max-w-2xl text-center z-10 px-6 py-12 flex flex-col items-center">
                <span class="font-serif text-xs font-bold tracking-[0.2em] text-[#B45309] uppercase block mb-3 animate-fade-in">${state.language === 'ms' ? 'SENI KESEJAHTERAAN' : 'THE ART OF WELLBEING'}</span>
                <h1 class="font-serif text-3xl md:text-5xl text-[#1E293B] font-bold leading-tight mb-4 animate-fade-in">${state.language === 'ms' ? 'Manjakan Diri Anda dengan Ritual Pilihan Kami' : 'Nurture Your Soul with Our Curated Rituals'}</h1>
                <p class="text-xs md:text-sm text-slate-600 leading-relaxed max-w-md mx-auto mb-6 animate-fade-in">${state.language === 'ms' ? 'Terokai tempat perlindungan yang damai melalui rawatan khas kami yang direka untuk memulihkan keseimbangan dan seri wajah.' : 'Explore a sanctuary of peace through our bespoke treatments designed to restore balance and radiance.'}</p>
                <button onclick="navigateTo('all-services')" class="bg-primary hover:bg-[#3e4b30] text-white px-8 py-3 rounded-full font-bold text-xs shadow-sm hover:shadow-lg transition-all flex items-center gap-2 animate-fade-in">
                    ${state.language === 'ms' ? 'Lihat Semua Perkhidmatan & Pakej' : 'See All Services & Packages'} <span class="material-symbols-outlined text-sm font-bold">arrow_forward</span>
                </button>
            </div>
        </div>

        <div class="max-w-container-max mx-auto px-4 md:px-margin-desktop py-16 flex flex-col gap-16">
            
            <!-- Section 1: Featured Packages -->
            <div>
                <div class="flex justify-between items-end mb-8 border-b border-slate-100 pb-4">
                    <div>
                        <h2 class="font-serif text-2xl font-bold text-[#1E293B] mb-1">${state.language === 'ms' ? 'Pakej Pilihan' : 'Featured Packages'}</h2>
                        <p class="text-xs text-slate-500">${state.language === 'ms' ? 'Pakej berbilang sesi untuk hasil yang transformatif' : 'Multi-session bundles for transformative results'}</p>
                    </div>
                    <a onclick="navigateToAllServicesWithFilter('packages')" class="text-xs font-bold text-[#B45309] hover:underline cursor-pointer flex items-center gap-1">
                        ${state.language === 'ms' ? 'Lihat Semua' : 'See All'} <span class="material-symbols-outlined text-[14px]">arrow_right_alt</span>
                    </a>
                </div>

                <!-- Grid 2 Columns (Flex scroll on mobile, Grid on desktop) -->
                <div class="flex overflow-x-auto pb-4 gap-6 hide-scrollbar md:grid md:grid-cols-2 md:overflow-visible">
                    ${(() => {
                        const getIncludesHtml = (p) => {
                            if (!p || !p.services || p.services.length === 0) return '';
                            const subNames = p.services.map(subId => {
                                const subSrv = SERVICES[subId];
                                return subSrv ? subSrv.name : subId;
                            });
                            const sessStr = p.sessions && p.sessions > 1 ? ` (${p.sessions}x)` : '';
                            return `
                                <div class="mt-2 mb-4 p-2.5 bg-slate-50 rounded-xl border border-slate-100/70">
                                    <div class="text-[9px] font-bold uppercase tracking-wider text-[#50613f] mb-1 flex items-center gap-1 font-semibold">
                                        <span class="material-symbols-outlined text-[12px] text-primary">featured_play_list</span>
                                        ${state.language === 'ms' ? 'Pakej Termasuk:' : 'Package Includes:'}
                                    </div>
                                    <ul class="text-[9.5px] text-slate-600 space-y-1 font-medium">
                                        ${subNames.map(name => `<li class="flex items-center gap-1.5"><span class="w-1 h-1 rounded-full bg-[#50613f]/70 shrink-0"></span><span class="truncate">${name}</span>${sessStr}</li>`).join('')}
                                    </ul>
                                </div>
                            `;
                        };

                        const p1 = SERVICES['radiance-bundle'];
                        if (!p1) return '';
                        const discountPercent = (p1.regularPrice && p1.regularPrice > p1.price) ? Math.round(((p1.regularPrice - p1.price) / p1.regularPrice) * 100) : 0;
                        const discountBadgeHtml = discountPercent > 0 ? `<div class="absolute top-4 left-4 bg-[#EAB308] text-white px-3 py-1 rounded-full font-bold text-[9px] uppercase tracking-wider shadow-sm z-10">SAVE ${discountPercent}%</div>` : '';
                        return `
                            <div class="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col sm:flex-row relative flex-shrink-0 w-[85vw] sm:w-[450px] md:w-auto">
                                <div class="w-full sm:w-5/12 h-48 sm:h-auto relative shrink-0">
                                    ${discountBadgeHtml}
                                    <img class="w-full h-full object-cover" src="${p1.image}" alt="${p1.name}">
                                </div>
                                <div class="p-6 flex flex-col justify-between flex-grow">
                                    <div>
                                        <h3 class="font-serif text-lg font-bold text-[#1E293B] mb-2">${getServiceTranslation(p1.id, 'name', p1.name)}</h3>
                                        <p class="text-xs text-slate-500 leading-relaxed mb-3 line-clamp-3">${getServiceTranslation(p1.id, 'desc', p1.description)}</p>
                                        ${getIncludesHtml(p1)}
                                    </div>
                                    
                                    <div class="flex justify-between items-center mt-auto border-t border-slate-50 pt-4">
                                        <div class="flex flex-col">
                                            ${p1.regularPrice && p1.regularPrice > p1.price ? `<span class="text-[10px] text-slate-400 line-through decoration-red-500">MYR ${p1.regularPrice.toFixed(2)}</span>` : `<span class="text-[10px] text-slate-400 uppercase tracking-wider">${state.language === 'ms' ? 'Jumlah Nilai' : 'Total Value'}</span>`}
                                            <span class="font-serif font-bold text-[#1E293B] text-lg">MYR ${p1.price}</span>
                                        </div>
                                        <button onclick="startBookingWithService('radiance-bundle')" class="bg-[#FACC15] hover:bg-[#eab308] text-[#241a00] font-bold text-xs px-6 py-2.5 rounded-full transition-all">${state.language === 'ms' ? 'Tempah Pakej' : 'Book Package'}</button>
                                    </div>
                                </div>
                            </div>
                        `;
                    })()}

                    ${(() => {
                        const getIncludesHtml = (p) => {
                            if (!p || !p.services || p.services.length === 0) return '';
                            const subNames = p.services.map(subId => {
                                const subSrv = SERVICES[subId];
                                return subSrv ? subSrv.name : subId;
                            });
                            const sessStr = p.sessions && p.sessions > 1 ? ` (${p.sessions}x)` : '';
                            return `
                                <div class="mt-2 mb-4 p-2.5 bg-slate-50 rounded-xl border border-slate-100/70">
                                    <div class="text-[9px] font-bold uppercase tracking-wider text-[#50613f] mb-1 flex items-center gap-1 font-semibold">
                                        <span class="material-symbols-outlined text-[12px] text-primary">featured_play_list</span>
                                        ${state.language === 'ms' ? 'Pakej Termasuk:' : 'Package Includes:'}
                                    </div>
                                    <ul class="text-[9.5px] text-slate-600 space-y-1 font-medium">
                                        ${subNames.map(name => `<li class="flex items-center gap-1.5"><span class="w-1 h-1 rounded-full bg-[#50613f]/70 shrink-0"></span><span class="truncate">${name}</span>${sessStr}</li>`).join('')}
                                    </ul>
                                </div>
                            `;
                        };

                        const p2 = SERVICES['aromatherapy-bundle'];
                        if (!p2) return '';
                        const discountPercent = (p2.regularPrice && p2.regularPrice > p2.price) ? Math.round(((p2.regularPrice - p2.price) / p2.regularPrice) * 100) : 0;
                        const discountBadgeHtml = discountPercent > 0 ? `<div class="absolute top-4 left-4 bg-[#EAB308] text-white px-3 py-1 rounded-full font-bold text-[9px] uppercase tracking-wider shadow-sm z-10">SAVE ${discountPercent}%</div>` : '';
                        return `
                            <div class="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col sm:flex-row relative flex-shrink-0 w-[85vw] sm:w-[450px] md:w-auto">
                                <div class="w-full sm:w-5/12 h-48 sm:h-auto relative shrink-0">
                                    ${discountBadgeHtml}
                                    <img class="w-full h-full object-cover" src="${p2.image}" alt="${p2.name}">
                                </div>
                                <div class="p-6 flex flex-col justify-between flex-grow">
                                    <div>
                                        <h3 class="font-serif text-lg font-bold text-[#1E293B] mb-2">${getServiceTranslation(p2.id, 'name', p2.name)}</h3>
                                        <p class="text-xs text-slate-500 leading-relaxed mb-3 line-clamp-3">${getServiceTranslation(p2.id, 'desc', p2.description)}</p>
                                        ${getIncludesHtml(p2)}
                                    </div>
                                    
                                    <div class="flex justify-between items-center mt-auto border-t border-slate-50 pt-4">
                                        <div class="flex flex-col">
                                            ${p2.regularPrice && p2.regularPrice > p2.price ? `<span class="text-[10px] text-slate-400 line-through decoration-red-500">MYR ${p2.regularPrice.toFixed(2)}</span>` : `<span class="text-[10px] text-slate-400 uppercase tracking-wider">${state.language === 'ms' ? 'Jumlah Nilai' : 'Total Value'}</span>`}
                                            <span class="font-serif font-bold text-[#1E293B] text-lg">MYR ${p2.price}</span>
                                        </div>
                                        <button onclick="startBookingWithService('aromatherapy-bundle')" class="bg-[#50613f] hover:bg-[#3e4b30] text-white font-bold text-xs px-6 py-2.5 rounded-full transition-all">${state.language === 'ms' ? 'Tempah Pakej' : 'Book Package'}</button>
                                    </div>
                                </div>
                            </div>
                        `;
                    })()}
                </div>
            </div>

            <!-- Section 2: Signature Treatments -->
            <div>
                <div class="flex justify-between items-end mb-8 border-b border-slate-100 pb-4">
                    <div>
                        <h2 class="font-serif text-2xl font-bold text-[#1E293B] mb-1">${state.language === 'ms' ? 'Rawatan Pilihan' : 'Signature Treatments'}</h2>
                        <p class="text-xs text-slate-500">${state.language === 'ms' ? 'Pengalaman kami yang paling dicari, direka dengan ketepatan dan tujuan.' : 'Our most sought-after experiences, crafted with precision and intention.'}</p>
                    </div>
                    <a onclick="navigateToAllServicesWithFilter('massage')" class="text-xs font-bold text-[#B45309] hover:underline cursor-pointer flex items-center gap-1">
                        ${state.language === 'ms' ? 'Lihat Semua' : 'See All'} <span class="material-symbols-outlined text-[14px]">arrow_right_alt</span>
                    </a>
                </div>

                <!-- Grid 3 Columns (Flex scroll on mobile, Grid on desktop) -->
                <div class="flex overflow-x-auto pb-4 gap-6 hide-scrollbar md:grid md:grid-cols-3 md:overflow-visible">
                    <!-- Treatment 1: Hot Stone Therapy -->
                    <div class="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all group flex flex-col justify-between flex-shrink-0 w-[85vw] sm:w-[320px] md:w-auto">
                        <div class="w-full h-56 shrink-0 overflow-hidden relative">
                            <img class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src="https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?auto=format&fit=crop&w=400&h=260&q=80" alt="Hot Stone Therapy">
                        </div>
                        <div class="p-6 flex flex-col justify-between flex-grow">
                            <div>
                                <span class="font-serif text-[10px] font-bold text-[#50613f] uppercase tracking-wider block mb-2">${state.language === 'ms' ? 'MEMULIHKAN' : 'RESTORATIVE'}</span>
                                <h3 class="font-serif text-base font-bold text-[#1E293B] mb-2">${getServiceTranslation('hot-stone', 'name', 'Hot Stone Therapy')}</h3>
                                <p class="text-xs text-slate-500 leading-relaxed mb-6">${getServiceTranslation('hot-stone', 'desc', 'Basalt stones are heated and placed on key energy points to melt away tension and restore flow.')}</p>
                            </div>
                            
                            <div class="flex justify-between items-center border-t border-slate-50 pt-4 mt-auto">
                                <div class="flex flex-col">
                                    <div class="flex items-center gap-1.5 text-slate-500 mb-0.5">
                                        <span class="material-symbols-outlined text-[16px] text-slate-400">schedule</span>
                                        <span class="text-[11px] font-semibold">${state.language === 'ms' ? '90 Minit' : '90 Minutes'}</span>
                                    </div>
                                    <span class="text-xs font-bold text-[#1E293B]">MYR 165</span>
                                </div>
                                <button onclick="startBookingWithService('hot-stone')" class="bg-[#50613f] hover:bg-[#3e4b30] text-white font-bold text-xs px-4 py-2 rounded-full transition-all whitespace-nowrap">
                                    ${state.language === 'ms' ? 'Tempah Rawatan' : 'Book Service'}
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Treatment 2: Deep Tissue Ritual -->
                    <div class="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all group flex flex-col justify-between flex-shrink-0 w-[85vw] sm:w-[320px] md:w-auto">
                        <div class="w-full h-56 shrink-0 overflow-hidden relative">
                            <img class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src="https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&w=400&h=260&q=80" alt="Deep Tissue Ritual">
                        </div>
                        <div class="p-6 flex flex-col justify-between flex-grow">
                            <div>
                                <span class="font-serif text-[10px] font-bold text-[#50613f] uppercase tracking-wider block mb-2">${state.language === 'ms' ? 'TERAPEUTIK' : 'THERAPEUTIC'}</span>
                                <h3 class="font-serif text-base font-bold text-[#1E293B] mb-2">${getServiceTranslation('deep-tissue', 'name', 'Deep Tissue Ritual')}</h3>
                                <p class="text-xs text-slate-500 leading-relaxed mb-6">${getServiceTranslation('deep-tissue', 'desc', 'Targeted pressure designed to release chronic muscle patterns and alleviate deep-seated stress.')}</p>
                            </div>
                            
                            <div class="flex justify-between items-center border-t border-slate-50 pt-4 mt-auto">
                                <div class="flex flex-col">
                                    <div class="flex items-center gap-1.5 text-slate-500 mb-0.5">
                                        <span class="material-symbols-outlined text-[16px] text-slate-400">schedule</span>
                                        <span class="text-[11px] font-semibold">${state.language === 'ms' ? '90 Minit' : '90 Minutes'}</span>
                                    </div>
                                    <span class="text-xs font-bold text-[#1E293B]">MYR 150</span>
                                </div>
                                <button onclick="startBookingWithService('deep-tissue')" class="bg-[#50613f] hover:bg-[#3e4b30] text-white font-bold text-xs px-4 py-2 rounded-full transition-all whitespace-nowrap">
                                    ${state.language === 'ms' ? 'Tempah Rawatan' : 'Book Service'}
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Treatment 3: Signature Soul Massage -->
                    <div class="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all group flex flex-col justify-between flex-shrink-0 w-[85vw] sm:w-[320px] md:w-auto">
                        <div class="w-full h-56 shrink-0 overflow-hidden relative">
                            <img class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=400&h=260&q=80" alt="Signature Soul Massage">
                        </div>
                        <div class="p-6 flex flex-col justify-between flex-grow">
                            <div>
                                <span class="font-serif text-[10px] font-bold text-[#50613f] uppercase tracking-wider block mb-2">${state.language === 'ms' ? 'KHAS' : 'BESPOKE'}</span>
                                <h3 class="font-serif text-base font-bold text-[#1E293B] mb-2">${getServiceTranslation('signature-soul', 'name', 'Signature Soul Massage')}</h3>
                                <p class="text-xs text-slate-500 leading-relaxed mb-6">${getServiceTranslation('signature-soul', 'desc', "A personalized fusion of Swedish, Shiatsu, and Reflexology techniques tailored to your body's...")}</p>
                            </div>
                            
                            <div class="flex justify-between items-center border-t border-slate-50 pt-4 mt-auto">
                                <div class="flex flex-col">
                                    <div class="flex items-center gap-1.5 text-slate-500 mb-0.5">
                                        <span class="material-symbols-outlined text-[16px] text-slate-400">schedule</span>
                                        <span class="text-[11px] font-semibold">${state.language === 'ms' ? '120 Minit' : '120 Minutes'}</span>
                                    </div>
                                    <span class="text-xs font-bold text-[#1E293B]">MYR 190</span>
                                </div>
                                <button onclick="startBookingWithService('signature-soul')" class="bg-[#50613f] hover:bg-[#3e4b30] text-white font-bold text-xs px-4 py-2 rounded-full transition-all whitespace-nowrap">
                                    ${state.language === 'ms' ? 'Tempah Rawatan' : 'Book Service'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Section 3: Facial & Body Care -->
            <div class="hidden">
                <div class="flex justify-between items-end mb-8 border-b border-slate-100 pb-4">
                    <div>
                        <h2 class="font-serif text-2xl font-bold text-[#1E293B] mb-1">${state.language === 'ms' ? 'Rawatan Muka & Badan' : 'Facial & Body Care'}</h2>
                        <p class="text-xs text-slate-500">${state.language === 'ms' ? 'Bahan botani tulen dan produk penjagaan organik' : 'Pure botanicals and organic care products'}</p>
                    </div>
                    <a onclick="navigateToAllServicesWithFilter('facial')" class="text-xs font-bold text-[#B45309] hover:underline cursor-pointer flex items-center gap-1">
                        ${state.language === 'ms' ? 'Lihat Semua' : 'See All'} <span class="material-symbols-outlined text-[14px]">arrow_right_alt</span>
                    </a>
                </div>

                <!-- Grid 4 Columns -->
                <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <!-- Product 1 -->
                    <div class="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all group flex flex-col justify-between p-4">
                        <div class="w-full h-36 overflow-hidden rounded-xl mb-4 shrink-0">
                            <img class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src="https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?auto=format&fit=crop&w=260&h=200&q=80" alt="Illuminating Peel">
                        </div>
                        <div class="flex-grow flex flex-col justify-between">
                            <div>
                                <h4 class="font-serif font-bold text-sm text-[#1E293B] mb-1">Illuminating Peel</h4>
                                <p class="text-[11px] text-slate-500 leading-relaxed mb-4">${state.language === 'ms' ? 'Enzim buah-buahan untuk mencerahkan dan melicinkan kulit kusam.' : 'Fruit enzymes to brighten and smooth dull skin.'}</p>
                            </div>
                            
                            <div class="flex justify-between items-center mt-auto border-t border-slate-50 pt-3">
                                <span class="font-serif text-sm font-bold text-[#1E293B]">MYR 95.00</span>
                                <a onclick="showNotification(state.language === 'ms' ? 'Illuminating Peel ditambahkan ke troli!' : 'Illuminating Peel added to cart!', 'success'); return false;" class="text-[11px] font-bold text-[#B45309] hover:underline cursor-pointer">${state.language === 'ms' ? 'Tambah ke Troli' : 'Add to Cart'}</a>
                            </div>
                        </div>
                    </div>

                    <!-- Product 2 -->
                    <div class="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all group flex flex-col justify-between p-4">
                        <div class="w-full h-36 overflow-hidden rounded-xl mb-4 shrink-0">
                            <img class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src="https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=260&h=200&q=80" alt="Sea Salt Glow">
                        </div>
                        <div class="flex-grow flex flex-col justify-between">
                            <div>
                                <h4 class="font-serif font-bold text-sm text-[#1E293B] mb-1">Sea Salt Glow</h4>
                                <p class="text-[11px] text-slate-500 leading-relaxed mb-4">${state.language === 'ms' ? 'Ritual pengelupasan untuk kulit licin seperti sutera.' : 'Exfoliating ritual for silky smooth skin.'}</p>
                            </div>
                            
                            <div class="flex justify-between items-center mt-auto border-t border-slate-50 pt-3">
                                <span class="font-serif text-sm font-bold text-[#1E293B]">MYR 110.00</span>
                                <a onclick="showNotification(state.language === 'ms' ? 'Sea Salt Glow ditambahkan ke troli!' : 'Sea Salt Glow added to cart!', 'success'); return false;" class="text-[11px] font-bold text-[#B45309] hover:underline cursor-pointer">${state.language === 'ms' ? 'Tambah ke Troli' : 'Add to Cart'}</a>
                            </div>
                        </div>
                    </div>

                    <!-- Product 3 -->
                    <div class="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all group flex flex-col justify-between p-4">
                        <div class="w-full h-36 overflow-hidden rounded-xl mb-4 shrink-0">
                            <img class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src="https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=260&h=200&q=80" alt="Herbal Detox Wrap">
                        </div>
                        <div class="flex-grow flex flex-col justify-between">
                            <div>
                                <h4 class="font-serif font-bold text-sm text-[#1E293B] mb-1">Herbal Detox Wrap</h4>
                                <p class="text-[11px] text-slate-500 leading-relaxed mb-4">${state.language === 'ms' ? 'Balutan hangat yang diselitkan dengan herba gunung.' : 'Warm wrap infused with mountain herbs.'}</p>
                            </div>
                            
                            <div class="flex justify-between items-center mt-auto border-t border-slate-50 pt-3">
                                <span class="font-serif text-sm font-bold text-[#1E293B]">MYR 150.00</span>
                                <a onclick="showNotification(state.language === 'ms' ? 'Herbal Detox Wrap ditambahkan ke troli!' : 'Herbal Detox Wrap added to cart!', 'success'); return false;" class="text-[11px] font-bold text-[#B45309] hover:underline cursor-pointer">${state.language === 'ms' ? 'Tambah ke Troli' : 'Add to Cart'}</a>
                            </div>
                        </div>
                    </div>

                    <!-- Product 4 -->
                    <div class="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all group flex flex-col justify-between p-4">
                        <div class="w-full h-36 overflow-hidden rounded-xl mb-4 shrink-0">
                            <img class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src="https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=260&h=200&q=80" alt="Pure Hydration">
                        </div>
                        <div class="flex-grow flex flex-col justify-between">
                            <div>
                                <h4 class="font-serif font-bold text-sm text-[#1E293B] mb-1">Pure Hydration</h4>
                                <p class="text-[11px] text-slate-500 leading-relaxed mb-4">${state.language === 'ms' ? 'Rawatan muka mengunci kelembapan dengan asid hialuronik.' : 'Moisture-locking facial with hyaluronic acid.'}</p>
                            </div>
                            
                            <div class="flex justify-between items-center mt-auto border-t border-slate-50 pt-3">
                                <span class="font-serif text-sm font-bold text-[#1E293B]">MYR 120.00</span>
                                <a onclick="showNotification(state.language === 'ms' ? 'Pure Hydration ditambahkan ke troli!' : 'Pure Hydration added to cart!', 'success'); return false;" class="text-[11px] font-bold text-[#B45309] hover:underline cursor-pointer">${state.language === 'ms' ? 'Tambah ke Troli' : 'Add to Cart'}</a>
                            </div>
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

    const userName = localStorage.getItem(`${tenantId}_user_name`) || state.guestInfo.name || 'Member';
    const now = new Date();
    const startOfWeek = new Date(now);
    const mondayOffset = (now.getDay() + 6) % 7;
    startOfWeek.setDate(now.getDate() - mondayOffset);
    startOfWeek.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const formatDayLabel = date => date.toLocaleDateString(state.language === 'ms' ? 'ms-MY' : 'en-US', { weekday: 'short' });
    const formatWeekday = date => date.toLocaleDateString(state.language === 'ms' ? 'ms-MY' : 'en-US', { weekday: 'short', month: 'short', day: 'numeric' });
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
                <div class="lg:col-span-8 bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-outline-variant/30 overflow-hidden relative">
                    <div class="absolute -right-10 -top-10 w-44 h-44 rounded-full bg-primary/10 blur-3xl"></div>
                    <div class="relative z-10">
                        <span class="font-label-caps text-[10px] text-[#B45309] font-bold uppercase tracking-wider block mb-2">${state.language === 'ms' ? 'Papan Pemuka Anda' : 'Your Dashboard'}</span>
                        <h1 class="font-serif text-3xl md:text-4xl text-[#1E293B] font-bold leading-tight mb-3">${state.language === 'ms' ? 'Selamat kembali' : 'Welcome back'}, ${userName}</h1>
                        <p class="text-xs md:text-sm text-on-surface-variant leading-relaxed max-w-2xl">${state.language === 'ms' ? 'Ini ialah ruang peribadi anda untuk pantau tempahan, dompet digital, dan pakej aktif tanpa kembali ke halaman landing.' : 'This is your personal space to track bookings, wallet balance, and active packages without returning to the landing page.'}</p>

                        <div class="flex flex-wrap gap-3 mt-6">
                            <button onclick="navigateTo('services-catalog')" class="bg-[#FACC15] hover:bg-[#eab308] text-[#241a00] px-5 py-2.5 rounded-full text-xs font-bold shadow-sm transition-all flex items-center gap-2">
                                <span class="material-symbols-outlined text-sm">spa</span> ${state.language === 'ms' ? 'Tempah Servis' : 'Book Service'}
                            </button>
                            <button onclick="navigateTo('wallet')" class="bg-white border border-outline-variant/60 hover:border-primary hover:bg-primary/5 text-[#50613f] px-5 py-2.5 rounded-full text-xs font-bold transition-all flex items-center gap-2">
                                <span class="material-symbols-outlined text-sm">account_balance_wallet</span> ${state.language === 'ms' ? 'Buka Dompet' : 'Open Wallet'}
                            </button>
                            <button onclick="navigateTo('profile')" class="bg-white border border-outline-variant/60 hover:border-primary hover:bg-primary/5 text-[#50613f] px-5 py-2.5 rounded-full text-xs font-bold transition-all flex items-center gap-2">
                                <span class="material-symbols-outlined text-sm">person</span> ${state.language === 'ms' ? 'Profil Saya' : 'My Profile'}
                            </button>
                        </div>
                    </div>
                </div>

                <div class="lg:col-span-4 grid grid-cols-2 gap-4">
                    <div class="bg-primary text-white rounded-3xl p-5 shadow-sm relative overflow-hidden">
                        <div class="absolute -right-4 -bottom-4 opacity-15"><span class="material-symbols-outlined text-7xl">account_balance_wallet</span></div>
                        <span class="text-[10px] font-bold uppercase tracking-wider text-white/80 block mb-1">${state.language === 'ms' ? 'Baki Dompet' : 'Wallet Balance'}</span>
                        <div class="font-serif text-2xl font-bold">MYR ${state.walletBalance.toFixed(2)}</div>
                    </div>
                    <div class="bg-white rounded-3xl p-5 shadow-sm border border-outline-variant/30">
                        <span class="text-[10px] font-bold uppercase tracking-wider text-outline block mb-1">${state.language === 'ms' ? 'Janji Temu' : 'Bookings'}</span>
                        <div class="font-serif text-2xl font-bold text-[#1E293B]">${state.bookings.length}</div>
                    </div>
                    <div class="bg-white rounded-3xl p-5 shadow-sm border border-outline-variant/30">
                        <span class="text-[10px] font-bold uppercase tracking-wider text-outline block mb-1">${state.language === 'ms' ? 'Pakej Aktif' : 'Active Packages'}</span>
                        <div class="font-serif text-2xl font-bold text-[#1E293B]">${activePackagesCount}</div>
                    </div>
                    <div class="bg-white rounded-3xl p-5 shadow-sm border border-outline-variant/30">
                        <span class="text-[10px] font-bold uppercase tracking-wider text-outline block mb-1">${state.language === 'ms' ? 'Transaksi' : 'Transactions'}</span>
                        <div class="font-serif text-2xl font-bold text-[#1E293B]">${transactionCount}</div>
                    </div>
                </div>
            </div>

            <div class="mt-6 bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-outline-variant/30">
                <div class="flex flex-col md:flex-row md:items-end md:justify-between gap-2 mb-5">
                    <div>
                        <span class="font-label-caps text-[10px] text-[#B45309] font-bold uppercase tracking-wider block mb-2">${state.language === 'ms' ? 'Jadual Mingguan' : 'Weekly Schedule'}</span>
                        <h2 class="font-serif text-xl text-[#1E293B] font-bold">${formatWeekday(startOfWeek)} - ${formatWeekday(endOfWeek)}</h2>
                        <p class="text-xs text-on-surface-variant mt-1">${bookingsThisWeek.length > 0 ? (state.language === 'ms' ? `Anda mempunyai ${bookingsThisWeek.length} jadual pada minggu ini.` : `You have ${bookingsThisWeek.length} scheduled items this week.`) : (state.language === 'ms' ? 'Tiada tempahan dijadualkan pada minggu ini.' : 'No appointments are scheduled for this week.')}</p>
                    </div>
                    <button onclick="navigateTo('booking-history')" class="self-start md:self-auto text-xs font-bold text-[#B45309] hover:text-[#92400e] flex items-center gap-1 transition-colors">
                        ${state.language === 'ms' ? 'Buka Sejarah Tempahan' : 'Open Booking History'} <span class="material-symbols-outlined text-xs">arrow_forward</span>
                    </button>
                </div>

                <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                    ${weekDays.map(({ date, dayBookings }) => {
                        const isToday = date.toDateString() === now.toDateString();
                        const hasBooking = dayBookings.length > 0;
                        const firstBooking = dayBookings[0];
                        return `
                            <div class="rounded-2xl border p-4 min-h-[140px] flex flex-col justify-between ${isToday ? 'border-[#50613f] bg-[#50613f]/5 shadow-sm' : 'border-outline-variant/30 bg-[#F8FAF8]'}">
                                <div class="flex items-start justify-between gap-2 mb-3">
                                    <div>
                                        <p class="text-[10px] font-bold uppercase tracking-wider ${isToday ? 'text-[#50613f]' : 'text-outline'}">${formatDayLabel(date)}</p>
                                        <p class="font-serif text-lg font-bold text-[#1E293B]">${date.getDate()}</p>
                                    </div>
                                    <span class="text-[10px] font-bold px-2 py-1 rounded-full ${hasBooking ? 'bg-[#50613f] text-white' : 'bg-white text-outline border border-outline-variant/30'}">${hasBooking ? `${dayBookings.length}` : '0'}</span>
                                </div>
                                <div class="flex flex-col gap-2">
                                    ${hasBooking ? `
                                        <div class="text-xs font-semibold text-[#1E293B] line-clamp-2">${firstBooking.serviceName}</div>
                                        <div class="text-[11px] text-on-surface-variant">${firstBooking.time}</div>
                                        ${dayBookings.length > 1 ? `<div class="text-[10px] font-bold text-[#B45309]">+${dayBookings.length - 1} ${state.language === 'ms' ? 'lagi' : 'more'}</div>` : ''}
                                    ` : `
                                        <div class="text-[11px] text-on-surface-variant">${state.language === 'ms' ? 'Kosong' : 'Free'}</div>
                                    `}
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>

                <div class="mt-5 rounded-2xl border border-outline-variant/25 bg-[#FEFCE8] p-4">
                    <div class="flex items-center gap-2 mb-2 text-amber-700 font-bold text-xs uppercase tracking-wider">
                        <span class="material-symbols-outlined text-[18px]">event_available</span>
                        ${state.language === 'ms' ? 'Sorotan Minggu Ini' : 'This Week at a Glance'}
                    </div>
                    <div class="flex flex-col gap-2">
                        ${bookingsThisWeek.length > 0 ? bookingsThisWeek.map(booking => `
                            <div class="flex items-center justify-between gap-3 rounded-xl bg-white/80 border border-amber-100 px-4 py-3">
                                <div>
                                    <p class="text-xs font-bold text-[#1E293B]">${booking.serviceName}</p>
                                    <p class="text-[11px] text-on-surface-variant">${booking.date} • ${booking.time} • ${booking.therapist}</p>
                                </div>
                                <span class="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#50613f]/10 text-[#50613f]">${booking.status}</span>
                            </div>
                        `).join('') : `
                            <div class="rounded-xl bg-white/80 border border-amber-100 px-4 py-3 text-xs text-on-surface-variant">
                                ${state.language === 'ms' ? 'Tiada jadual untuk minggu ini. Tempah servis untuk melihatnya muncul di sini.' : 'There are no appointments this week. Book a service and it will appear here.'}
                            </div>
                        `}
                    </div>
                </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
                <div class="lg:col-span-7 bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-outline-variant/30">
                    <div class="flex items-center justify-between mb-5">
                        <h2 class="font-serif text-xl text-[#1E293B] font-bold">${state.language === 'ms' ? 'Ringkasan Terkini' : 'Current Summary'}</h2>
                        <button onclick="navigateTo('booking-history')" class="text-xs font-bold text-[#B45309] hover:text-[#92400e] flex items-center gap-1 transition-colors">
                            ${state.language === 'ms' ? 'Lihat Sejarah' : 'View History'} <span class="material-symbols-outlined text-xs">arrow_forward</span>
                        </button>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="rounded-2xl bg-[#F8FAF8] border border-outline-variant/25 p-4">
                            <span class="text-[10px] font-bold uppercase tracking-wider text-outline block mb-2">${state.language === 'ms' ? 'Tempahan Seterusnya' : 'Next Booking'}</span>
                            ${nextBooking ? `
                                <h3 class="font-serif text-base font-bold text-[#1E293B] mb-1">${nextBooking.serviceName}</h3>
                                <p class="text-xs text-on-surface-variant">${nextBooking.date} • ${nextBooking.time}</p>
                                <p class="text-xs text-on-surface-variant mt-2">${state.language === 'ms' ? 'Terapis' : 'Therapist'}: ${nextBooking.therapist}</p>
                            ` : `
                                <p class="text-xs text-on-surface-variant">${state.language === 'ms' ? 'Belum ada tempahan akan datang.' : 'No upcoming booking yet.'}</p>
                            `}
                        </div>
                        <div class="rounded-2xl bg-[#FEFCE8] border border-amber-200/60 p-4">
                            <span class="text-[10px] font-bold uppercase tracking-wider text-amber-700 block mb-2">${state.language === 'ms' ? 'Akses Pantas' : 'Quick Access'}</span>
                            <div class="flex flex-col gap-2">
                                <button onclick="navigateTo('wallet')" class="text-left text-xs font-semibold text-[#1E293B] hover:text-[#50613f] transition-colors">${state.language === 'ms' ? 'Buka & tambah dompet' : 'Open and top up wallet'}</button>
                                <button onclick="navigateTo('profile')" class="text-left text-xs font-semibold text-[#1E293B] hover:text-[#50613f] transition-colors">${state.language === 'ms' ? 'Urus profil dan tetapan' : 'Manage profile and settings'}</button>
                                <button onclick="navigateTo('all-services')" class="text-left text-xs font-semibold text-[#1E293B] hover:text-[#50613f] transition-colors">${state.language === 'ms' ? 'Semak semua servis' : 'Browse all services'}</button>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="lg:col-span-5 bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-outline-variant/30">
                    <div class="flex items-center justify-between mb-5">
                        <h2 class="font-serif text-xl text-[#1E293B] font-bold">${state.language === 'ms' ? 'Aktiviti Anda' : 'Your Activity'}</h2>
                        <span class="text-[10px] font-bold uppercase tracking-wider text-[#50613f]">${state.language === 'ms' ? 'Langsung' : 'Live'}</span>
                    </div>
                    <div class="space-y-4">
                        <div class="flex items-start gap-3 p-4 rounded-2xl bg-[#F8FAF8] border border-outline-variant/25">
                            <div class="w-10 h-10 rounded-xl bg-[#50613f]/10 text-[#50613f] flex items-center justify-center shrink-0"><span class="material-symbols-outlined text-lg">calendar_month</span></div>
                            <div>
                                <p class="text-xs font-semibold text-[#1E293B]">${state.language === 'ms' ? 'Tempahan anda kini disambung ke dashboard.' : 'Your bookings now flow into this dashboard.'}</p>
                                <p class="text-[11px] text-on-surface-variant mt-1">${state.language === 'ms' ? 'Anda boleh semak jadual, dompet, dan pakej tanpa kembali ke landing page.' : 'You can review schedule, wallet, and packages without going back to the landing page.'}</p>
                            </div>
                        </div>
                        <div class="flex items-start gap-3 p-4 rounded-2xl bg-[#F8FAF8] border border-outline-variant/25">
                            <div class="w-10 h-10 rounded-xl bg-[#B45309]/10 text-[#B45309] flex items-center justify-center shrink-0"><span class="material-symbols-outlined text-lg">stars</span></div>
                            <div>
                                <p class="text-xs font-semibold text-[#1E293B]">${state.language === 'ms' ? 'Pakej aktif dan simpanan kekal terpapar di sini.' : 'Active packages and savings stay visible here.'}</p>
                                <p class="text-[11px] text-on-surface-variant mt-1">${state.language === 'ms' ? 'Panel ini direka sebagai pintu masuk utama user selepas log masuk.' : 'This panel is the main user entry point after login.'}</p>
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
        <div class="glass-panel rounded-2xl p-6 border border-primary/20 bg-primary-fixed/10 mb-8 max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
            <h4 class="font-title-md text-primary font-bold flex items-center gap-2 mb-3">
                <span class="material-symbols-outlined text-primary">stars</span> ${t('active_packages_widget_title')}
            </h4>
            <div class="flex overflow-x-auto md:grid md:grid-cols-2 gap-4 pb-3 md:pb-0 hide-scrollbar scroll-smooth">
    `;

    ownedKeys.forEach(key => {
        const bundle = SERVICES[key];
        const remaining = state.activePackages[key];
        html += `
            <div class="flex-shrink-0 w-[85vw] sm:w-[320px] md:w-auto flex justify-between items-center bg-white/60 p-4 rounded-xl border border-outline-variant/30 shadow-sm">
                <div>
                    <p class="font-semibold text-on-surface">${bundle.name}</p>
                    <p class="text-xs text-on-surface-variant">${t('remaining_quota_lbl')} ${remaining} ${t('of_lbl')} ${bundle.sessions} ${t('lbl_sessions')}</p>
                </div>
                <button onclick="bookPackageSession('${key}')" class="bg-primary text-white text-xs px-4 py-2 rounded-full hover:bg-primary-container hover:text-on-primary-container transition-colors shrink-0 ml-4">
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
            ? `Baki Dompet Serenity tidak mencukupi untuk membeli ${getServiceTranslation(bundle.id, 'name', bundle.name)}. Mengarah ke Tambah Nilai...`
            : `Insufficient Serenity Wallet balance to purchase ${bundle.name}. Redirecting to Top Up...`;
        showNotification(errorMsg, 'error');
        setTimeout(() => {
            navigateTo('topup');
        }, 1500);
        return;
    }

    state.walletBalance -= bundle.price;
    // Track sessions
    const prevSessions = state.activePackages[bundleId] || 0;
    state.activePackages[bundleId] = prevSessions + bundle.sessions;
    state.packageTotalSessions[bundleId] = (state.packageTotalSessions[bundleId] || 0) + bundle.sessions;
    // Store the therapist that was selected at booking time
    if (state.booking.therapist) {
        state.packageTherapists[bundleId] = state.booking.therapist;
    }

    updateHeaderWalletDisplay();
    renderActivePackagesWidget();
    saveState();
    const successMsg = state.language === 'ms'
        ? `Berjaya membeli ${getServiceTranslation(bundle.id, 'name', bundle.name)}! ${bundle.sessions} sesi ditambahkan ke pakej aktif anda.`
        : `Success purchasing ${bundle.name}! ${bundle.sessions} sessions added to your active packages.`;
    showNotification(successMsg, 'success');
};

// Book a session from an active package (routes to dedicated book-package view)
export function bookPackageSession(bundleId) {
    window.bookPackageSession = bookPackageSession;
    const bundle = SERVICES[bundleId];
    const sessionsLeft = state.activePackages[bundleId] || 0;
    if (!bundle) return;
    if (sessionsLeft <= 0) {
        showNotification(state.language === 'ms' ? 'Semua sesi untuk pakej ini telah digunakan.' : 'All sessions for this package have been used.', 'error');
        return;
    }

    // Set package booking state context
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

    // Filter services based on selected category tab
    const category = state.serviceCategory;

    // Sync tab button styles
    document.querySelectorAll('.cat-tab-btn').forEach(btn => {
        btn.className = 'cat-tab-btn px-5 py-2 rounded-full font-title-md text-xs whitespace-nowrap bg-surface-variant text-on-surface-variant hover:bg-surface-container-high transition-colors';
    });
    const activeBtn = document.getElementById(`cat-tab-${category}`);
    if (activeBtn) {
        activeBtn.className = 'cat-tab-btn px-5 py-2 rounded-full font-title-md text-xs whitespace-nowrap bg-primary/10 text-primary font-semibold border border-primary/20';
    }

    const servicesToRender = Object.values(SERVICES).filter(srv => {
        if (category === 'all') return true;
        if (category === 'packages') return srv.type === 'packages';
        return srv.type === category;
    });
    // Sort so bestValue is at the top of the list
    servicesToRender.sort((a, b) => (b.bestValue ? 1 : 0) - (a.bestValue ? 1 : 0));

    let html = '';
    servicesToRender.forEach(srv => {
        const isSelected = state.booking.service && state.booking.service.id === srv.id;
        const isPackageDeal = srv.badge === 'PACKAGE DEAL';

        html += `
            <div class="glass-card rounded-xl p-6 flex flex-col md:flex-row gap-6 items-start md:items-center transition-all duration-300 relative overflow-hidden ${isSelected ? 'ring-2 ring-primary border-transparent' : 'border border-outline-variant/30 hover:border-primary/50'}">
                ${srv.bestValue ? `<div class="absolute top-0 right-0 bg-[#EAB308] text-white px-4 py-1 rounded-bl-lg font-label-caps text-[9px] font-bold uppercase tracking-wider z-10">BEST VALUE</div>` : (srv.regularPrice && srv.regularPrice > srv.price) ? `<div class="absolute top-0 right-0 bg-[#EAB308] text-white px-4 py-1 rounded-bl-lg font-label-caps text-[9px] font-bold uppercase tracking-wider z-10">SAVE ${Math.round(((srv.regularPrice - srv.price)/srv.regularPrice)*100)}%</div>` : isPackageDeal ? `<div class="absolute top-0 right-0 bg-[#EAB308] text-white px-4 py-1 rounded-bl-lg font-label-caps text-[9px] font-bold uppercase tracking-wider z-10">PACKAGE DEAL</div>` : ''}
                
                <div class="w-full md:w-44 h-28 rounded-lg overflow-hidden flex-shrink-0 relative">
                    ${isSelected ? `
                        <div class="absolute inset-0 bg-[#50613f]/15 z-10 flex items-center justify-center backdrop-blur-[1px]">
                            <div class="w-8 h-8 rounded-full bg-[#50613f] text-white flex items-center justify-center">
                                <span class="material-symbols-outlined text-[20px]">check</span>
                            </div>
                        </div>
                    ` : ''}
                    <img class="w-full h-full object-cover" src="${srv.image}" alt="${srv.name}">
                </div>
                
                <div class="flex-grow flex flex-col gap-1.5 pt-2 md:pt-0">
                    <div class="flex justify-between items-start flex-wrap gap-2">
                        <h3 class="font-title-md text-base text-on-surface font-semibold">${getServiceTranslation(srv.id, 'name', srv.name)}</h3>
                        ${srv.regularPrice && srv.regularPrice > srv.price ? `
                            <div class="flex flex-col items-end whitespace-nowrap">
                                <span class="text-[10px] text-on-surface-variant/50 line-through decoration-red-500">MYR ${srv.regularPrice.toFixed(2)}</span>
                                <span class="font-title-md text-base text-[#1E293B] font-bold">MYR ${srv.price}</span>
                                <span class="text-[9px] font-bold text-[#b45309] bg-[#b45309]/10 px-1.5 py-0.5 rounded-md mt-0.5">SAVE MYR ${Math.round(srv.regularPrice - srv.price)}</span>
                            </div>
                        ` : `
                            <span class="font-title-md text-base text-[#1E293B] font-bold whitespace-nowrap">From MYR ${srv.price}</span>
                        `}
                    </div>
                    <p class="font-body-sm text-xs text-on-surface-variant line-clamp-2 leading-relaxed">${getServiceTranslation(srv.id, 'desc', srv.description)}</p>
                    <div class="flex items-center gap-2 text-outline mt-2 text-xs">
                        <span class="material-symbols-outlined text-base">schedule</span>
                        <span class="font-body-sm">${state.language === 'ms' ? srv.duration.replace('Mins', 'Minit') : srv.duration}</span>
                    </div>
                </div>
                
                <button onclick="selectService('${srv.id}')" class="w-full md:w-auto px-6 py-2 rounded-lg font-semibold text-xs transition-all flex-shrink-0 mt-4 md:mt-0 ${isSelected ? 'bg-transparent border border-primary text-primary hover:bg-primary/5' : 'bg-primary text-white hover:bg-primary-container hover:text-on-primary-container'}">
                    ${isSelected ? (state.language === 'ms' ? 'Dipilih' : 'Selected') : (state.language === 'ms' ? 'Pilih' : 'Select')}
                </button>
            </div>
        `;
    });

    container.innerHTML = html;

    // Update Sidebar
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
            <div class="w-20 h-20 rounded-full bg-surface-container flex items-center justify-center shrink-0 border border-outline-variant/30">
                <span class="material-symbols-outlined text-[#50613f] text-3xl">spa</span>
            </div>
        ` : `
            <div class="w-20 h-20 rounded-full overflow-hidden shrink-0 border-2 ${isSelected ? 'border-primary' : 'border-primary/10'}">
                <img class="w-full h-full object-cover" src="${therapist.image}" alt="${therapist.name}">
            </div>
        `;

        html += `
            <div onclick="selectTherapist('${therapist.id}')" class="glass-card rounded-xl p-6 relative overflow-hidden transition-all duration-300 group cursor-pointer ${isSelected ? 'ring-2 ring-primary border-transparent' : 'border border-outline-variant/30 hover:border-primary/50'}">
                ${isSelected ? `
                    <div class="absolute top-4 right-4 w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center">
                        <span class="material-symbols-outlined text-[16px]">check</span>
                    </div>
                ` : ''}
                
                <div class="flex items-start gap-4 mb-4">
                    ${imageHtml}
                    <div>
                        <h3 class="font-title-md text-title-md text-on-surface font-semibold mb-0.5">${therapist.name}</h3>
                        <p class="font-body-sm text-body-sm text-secondary font-semibold mb-2">${therapist.role}</p>
                        <div class="flex flex-wrap gap-2">
                            ${therapist.specialties.map(spec => `<span class="px-2.5 py-0.5 bg-primary/10 text-primary font-label-caps text-[9px] rounded-full uppercase">${spec}</span>`).join('')}
                        </div>
                    </div>
                </div>
                
                <p class="font-body-sm text-body-sm text-on-surface-variant line-clamp-3 mb-4">${therapist.description}</p>
                
                <div class="flex items-center gap-2.5 mt-auto">
                    ${therapist.id !== 'no-preference' ? `
                        <button onclick="event.stopPropagation(); window.openTherapistModal('${therapist.id}')" class="flex-1 py-2.5 px-3 rounded-lg border border-primary/30 text-primary text-xs font-semibold hover:bg-primary/5 transition-all flex items-center justify-center gap-1.5 cursor-pointer">
                            <span class="material-symbols-outlined text-[16px]">badge</span>
                            ${state.language === 'ms' ? 'Lihat Bio' : 'View Bio'}
                        </button>
                    ` : ''}
                    <button onclick="selectTherapist('${therapist.id}')" class="${therapist.id !== 'no-preference' ? 'flex-1' : 'w-full'} py-2.5 px-4 rounded-lg font-semibold text-xs transition-colors shadow-sm cursor-pointer ${isSelected ? 'bg-primary text-white' : 'bg-transparent border border-outline text-on-surface group-hover:bg-primary/5'}">
                        ${isSelected ? (state.language === 'ms' ? 'Dipilih' : 'Selected') : (state.language === 'ms' ? 'Pilih' : 'Select')}
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
            <div class="flex items-center justify-between mb-6 border-b border-surface-variant pb-4">
                <h2 class="font-title-md text-base text-[#1E293B] flex items-center gap-2 font-semibold">
                    <span class="material-symbols-outlined text-[#50613f]">person</span> ${t('guest_info_title')}
                </h2>
                <button onclick="saveGuestInfo()" class="text-[#50613f] hover:text-[#3e4b30] transition-colors font-label-caps text-xs font-semibold underline">${state.language === 'ms' ? 'Simpan' : 'Save'}</button>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label class="block text-xs font-label-caps text-on-surface-variant mb-1 font-semibold">${state.language === 'ms' ? 'Nama Penuh' : 'Full Name'}</label>
                    <input id="edit-guest-name" type="text" class="w-full bg-white border border-outline-variant rounded-lg px-3 py-2 text-sm text-on-surface focus:ring-primary focus:border-primary" value="${state.guestInfo.name}">
                </div>
                <div>
                    <label class="block text-xs font-label-caps text-on-surface-variant mb-1 font-semibold">${state.language === 'ms' ? 'Alamat E-mel' : 'Email Address'}</label>
                    <input id="edit-guest-email" type="email" class="w-full bg-white border border-outline-variant rounded-lg px-3 py-2 text-sm text-on-surface focus:ring-primary focus:border-primary" value="${state.guestInfo.email}">
                </div>
                <div>
                    <label class="block text-xs font-label-caps text-on-surface-variant mb-1 font-semibold">${state.language === 'ms' ? 'Nombor Telefon' : 'Phone Number'}</label>
                    <input id="edit-guest-phone" type="text" class="w-full bg-white border border-outline-variant rounded-lg px-3 py-2 text-sm text-on-surface focus:ring-primary focus:border-primary" value="${state.guestInfo.phone}">
                </div>
                <div class="md:col-span-2">
                    <label class="block text-xs font-label-caps text-on-surface-variant mb-1 font-semibold">${state.language === 'ms' ? 'Permintaan Khas' : 'Special Requests'}</label>
                    <textarea id="edit-guest-requests" rows="3" class="w-full bg-white border border-outline-variant rounded-lg px-3 py-2 text-sm text-on-surface focus:ring-primary focus:border-primary">${state.guestInfo.specialRequests}</textarea>
                </div>
            </div>
        `;
    } else {
        container.innerHTML = `
            <div class="flex items-center justify-between mb-6 border-b border-surface-variant pb-4">
                <h2 class="font-title-md text-base text-[#1E293B] flex items-center gap-2 font-semibold">
                    <span class="material-symbols-outlined text-[#50613f]">person</span> ${t('guest_info_title')}
                </h2>
                <button onclick="toggleEditGuest(true)" class="text-[#50613f] hover:text-[#3e4b30] transition-colors font-label-caps text-xs font-semibold underline">${state.language === 'ms' ? 'Ubah' : 'Edit'}</button>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <p class="font-label-caps text-[10px] text-on-surface-variant mb-1 font-semibold uppercase tracking-wider">${state.language === 'ms' ? 'Nama Penuh' : 'Full Name'}</p>
                    <p class="font-body-lg text-sm text-on-surface">${state.guestInfo.name}</p>
                </div>
                <div>
                    <p class="font-label-caps text-[10px] text-on-surface-variant mb-1 font-semibold uppercase tracking-wider">${state.language === 'ms' ? 'Alamat E-mel' : 'Email Address'}</p>
                    <p class="font-body-lg text-sm text-on-surface">${state.guestInfo.email}</p>
                </div>
                <div>
                    <p class="font-label-caps text-[10px] text-on-surface-variant mb-1 font-semibold uppercase tracking-wider">${state.language === 'ms' ? 'Nombor Telefon' : 'Phone Number'}</p>
                    <p class="font-body-lg text-sm text-on-surface">${state.guestInfo.phone}</p>
                </div>
            </div>
            <div class="mt-6 pt-6 border-t border-surface-variant">
                <p class="font-label-caps text-[10px] text-on-surface-variant mb-2 font-semibold uppercase tracking-wider">${state.language === 'ms' ? 'Permintaan Khas' : 'Special Requests'}</p>
                <div class="bg-surface-container-lowest/50 rounded-lg p-4 border border-outline-variant/30">
                    <p class="font-body-sm text-xs text-on-surface italic">"${state.guestInfo.specialRequests || (state.language === 'ms' ? 'Tiada permintaan khas.' : 'No special requests.')}"</p>
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
    showNotification(state.language === 'ms' ? 'Maklumat tetamu berjaya dikemas kini.' : 'Guest information successfully updated.', 'success');
};

export let selectedPaymentMethod = 'wallet'; // default payment method

export function renderPaymentMethodSelection() {
    const container = document.getElementById('payment-methods-container');
    if (!container) return;

    const walletName = currentTenant.logo ? `${currentTenant.logo} Wallet` : `${currentTenant.name} Wallet`;
    const methods = [
        { id: 'wallet', name: walletName, icon: 'account_balance_wallet' }
    ];

    const selectedMethod = methods.find(m => m.id === selectedPaymentMethod) || methods[0];
    const selectedDisplayName = selectedMethod.id === 'wallet' ? `${selectedMethod.name} <span class="text-xs text-on-surface-variant font-normal whitespace-nowrap">(Balance: MYR ${state.walletBalance.toFixed(2)})</span>` : selectedMethod.name;

    let html = `
        <div class="relative w-full text-left" id="payment-dropdown-container">
            <!-- Dropdown Trigger -->
            <button type="button" onclick="togglePaymentDropdown(event)" class="w-full flex items-center justify-between bg-white border ${window.paymentDropdownOpen ? 'border-primary ring-1 ring-primary' : 'border-outline-variant hover:border-outline'} rounded-xl px-4 py-3 text-sm text-on-surface focus:outline-none transition-all shadow-sm">
                <div class="flex items-center gap-3 overflow-hidden">
                    <span class="material-symbols-outlined text-primary text-xl shrink-0">${selectedMethod.icon}</span>
                    <span class="font-semibold text-[#1E293B] font-body-lg flex flex-wrap items-center gap-1 text-left">${selectedDisplayName}</span>
                </div>
                <span id="payment-dropdown-icon" class="material-symbols-outlined text-on-surface-variant transition-transform duration-200 shrink-0" style="transform: ${window.paymentDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)'}">keyboard_arrow_down</span>
            </button>

            <!-- Dropdown Menu -->
            <div id="payment-dropdown-menu" class="${window.paymentDropdownOpen ? '' : 'hidden'} absolute z-[60] w-full mt-2 bg-white border border-outline-variant/50 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] overflow-hidden origin-top animate-fade-in">
    `;
    
    methods.forEach(method => {
        const isSelected = selectedPaymentMethod === method.id;
        const displayName = method.id === 'wallet' ? `${method.name} <span class="text-xs text-on-surface-variant font-normal ml-1 whitespace-nowrap">(Balance: MYR ${state.walletBalance.toFixed(2)})</span>` : method.name;
        
        html += `
                <button type="button" onclick="selectPaymentMethod('${method.id}', event)" class="w-full flex items-center justify-between px-4 py-3.5 hover:bg-surface-container-low transition-colors border-b border-outline-variant/30 last:border-0 ${isSelected ? 'bg-primary/5' : ''}">
                    <div class="flex items-center gap-3 overflow-hidden">
                        <span class="material-symbols-outlined text-xl shrink-0 ${isSelected ? 'text-primary' : 'text-on-surface-variant'}">${method.icon}</span>
                        <span class="text-sm font-body-lg text-left ${isSelected ? 'font-bold text-primary' : 'font-medium text-[#1E293B]'} flex flex-wrap items-center">${displayName}</span>
                    </div>
                    ${isSelected ? '<span class="material-symbols-outlined text-primary text-lg shrink-0 ml-2">check_circle</span>' : ''}
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

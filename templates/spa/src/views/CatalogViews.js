import { tenantId, currentTenant, DEFAULT_TENANTS } from '../models/Tenant.js';
import { SERVICES, THERAPISTS, getSharedData, syncServices, syncTherapists } from '../models/Database.js';
import { TRANSLATIONS, t, getServiceTranslation, translateStaticHtml, toggleLanguage } from '../models/Translations.js';
import { DEFAULT_STATE, state, loadState, saveState } from '../models/State.js';
import { isLoggedIn, updateNavbarAuth } from '../controllers/AuthController.js';
import { navigateTo, updateTenantLinks, updateNavbarActiveState, updateStepperUI, navigateToAllServicesWithFilter } from '../controllers/Router.js';
import { renderActiveViewContents, updateHeaderWalletDisplay, renderHomeView, renderServicesCatalogView, renderSelectServiceView, renderSelectTherapistView, renderSelectTimeView, renderConfirmBookingView, renderActivePackagesWidget, renderPaymentMethodSelection, startBookingWithService } from '../views/Renderers.js';
import { renderSidebarSummary, renderSuccessView } from '../views/SidebarSummary.js';
import { resetBookingFlow, nextStep, prevStep } from '../controllers/BookingController.js';
import { showNotification } from '../views/Toast.js';
import { renderProfileView, renderWalletView, renderTopupView, renderPersonalDetailsView, renderBookingHistoryView, renderNotificationsView, renderPrivacySecurityView, renderRescheduleView } from '../views/ProfileViews.js';
import { openPaymentMethodsModal, closePaymentMethodsModal } from '../views/PaymentModal.js';
import { renderBookPackageView, renderActivePackagesView } from '../views/PackageViews.js';

// 6. ALL SERVICES & PACKAGES CATALOG VIEW
export function renderAllServicesView() {
    const container = document.getElementById('all-services-container');
    if (!container) return;

    if (typeof state.searchQuery === 'undefined') state.searchQuery = '';
    if (typeof state.activeCategoryFilter === 'undefined') state.activeCategoryFilter = 'all';

    const query = state.searchQuery.toLowerCase().trim();
    const activeFilter = state.activeCategoryFilter;

    // Filter services dynamically from the SERVICES database
    const filtered = Object.values(SERVICES).filter(srv => {
        const matchesCategory = activeFilter === 'all' || srv.type === activeFilter;
        const matchesSearch = srv.name.toLowerCase().includes(query) || srv.description.toLowerCase().includes(query);
        return matchesCategory && matchesSearch;
    });
    // Sort so bestValue is at the top of the catalog
    filtered.sort((a, b) => (b.bestValue ? 1 : 0) - (a.bestValue ? 1 : 0));

    // Generate tabs
    const categories = [
        { id: 'all', label: 'All Treatments' },
        { id: 'packages', label: 'Packages / Bundles' },
        { id: 'massage', label: 'Massage Therapy' },
        { id: 'facial', label: 'Facial Care' },
        { id: 'body', label: 'Body Treatments' }
    ];

    let tabsHtml = categories.map(cat => {
        const isActive = activeFilter === cat.id;
        return `
            <button onclick="setAllServicesFilter('${cat.id}')" class="px-5 py-2 rounded-full font-title-md text-xs whitespace-nowrap transition-all ${isActive ? 'bg-[#50613f] text-white font-bold shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}">
                ${cat.label}
            </button>
        `;
    }).join('');

    let gridHtml = '';
    if (filtered.length === 0) {
        gridHtml = `
            <div class="col-span-full text-center py-16 bg-white rounded-3xl border border-outline-variant/30 p-8 shadow-sm">
                <span class="material-symbols-outlined text-4xl text-on-surface-variant/40 mb-3">search_off</span>
                <p class="text-sm font-semibold text-on-surface-variant">No treatments match your search criteria.</p>
                <p class="text-xs text-on-surface-variant/70 mt-1">Try checking your spelling or selecting another category.</p>
            </div>
        `;
    } else {
        filtered.forEach(srv => {
            const isPackage = srv.type === 'packages';
            const badgeLabel = isPackage ? 'Bundle' : (srv.type || 'Service').toUpperCase();
            
            const discountPercent = (srv.regularPrice && srv.regularPrice > srv.price) ? Math.round(((srv.regularPrice - srv.price) / srv.regularPrice) * 100) : 0;
            const discountBadgeHtml = discountPercent > 0 
                ? `<div class="absolute top-4 left-4 bg-[#EAB308] text-white px-3 py-1 rounded-full font-bold text-[9px] uppercase tracking-wider shadow-sm z-10">SAVE ${discountPercent}%</div>`
                : `<div class="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-primary px-3 py-1 rounded-full font-bold text-[9px] uppercase tracking-wider shadow-sm border border-outline-variant/20">${badgeLabel}</div>`;

            let includesHtml = '';
            if (isPackage && srv.services && srv.services.length > 0) {
                const subNames = srv.services.map(subId => {
                    const subSrv = SERVICES[subId];
                    return subSrv ? subSrv.name : subId;
                });
                const sessStr = srv.sessions && srv.sessions > 1 ? ` (${srv.sessions}x)` : '';
                includesHtml = `
                    <div class="mt-3 mb-5 p-3.5 bg-slate-50 rounded-2xl border border-slate-100/70">
                        <div class="text-[10px] font-bold uppercase tracking-wider text-[#50613f] mb-2 flex items-center gap-1 font-semibold">
                            <span class="material-symbols-outlined text-[14px] text-primary">featured_play_list</span>
                            Package Includes:
                        </div>
                        <ul class="text-[10.5px] text-slate-600 space-y-1.5 font-medium">
                            ${subNames.map(name => `<li class="flex items-center gap-2"><span class="w-1.5 h-1.5 rounded-full bg-[#50613f]/70 shrink-0"></span><span class="truncate">${name}</span>${sessStr}</li>`).join('')}
                        </ul>
                    </div>
                `;
            }

            gridHtml += `
                <div class="bg-white border border-outline-variant/30 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all group flex flex-col justify-between relative">
                    ${srv.bestValue ? `<div class="absolute top-0 right-0 bg-[#EAB308] text-white px-4 py-1 rounded-bl-lg font-label-caps text-[9px] font-bold uppercase tracking-wider z-10">BEST VALUE</div>` : ''}
                    <div class="w-full h-52 shrink-0 overflow-hidden relative bg-slate-100">
                        <img class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src="${srv.image || 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=400&h=300&q=80'}" alt="${srv.name}">
                        ${discountBadgeHtml}
                    </div>
                    <div class="p-6 flex flex-col justify-between flex-grow">
                        <div>
                            <h3 class="font-serif text-base font-bold text-[#1E293B] mb-2 line-clamp-1 leading-snug">${srv.name}</h3>
                            <p class="text-xs text-slate-500 leading-relaxed mb-4 line-clamp-3">${srv.description}</p>
                            ${includesHtml}
                        </div>
                        
                        <div class="flex justify-between items-center border-t border-slate-100 pt-4 mt-auto">
                            <div class="flex flex-col justify-end">
                                <div class="flex items-center gap-1 text-slate-500 mb-0.5">
                                    <span class="material-symbols-outlined text-[14px]">schedule</span>
                                    <span class="text-[10px] font-medium">${srv.duration || '60 Mins'}</span>
                                </div>
                                ${srv.regularPrice && srv.regularPrice > srv.price ? `<span class="text-on-surface-variant/50 text-[10px] line-through decoration-red-500">MYR ${srv.regularPrice.toFixed(2)}</span>` : ''}
                                <span class="font-serif font-bold text-[#1E293B] text-base">MYR ${srv.price}</span>
                            </div>
                            <button onclick="startBookingWithService('${srv.id}')" class="${srv.bestValue ? 'bg-[#FACC15] hover:bg-[#eab308] text-[#241a00]' : 'bg-[#50613f] hover:bg-[#3e4b30] text-white'} font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-1">
                                ${isPackage ? 'Book Package' : 'Book Service'} <span class="material-symbols-outlined text-sm">calendar_month</span>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        });
    }

    container.innerHTML = `
        <div class="space-y-8">
            <!-- Header and Navigation -->
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-outline-variant/20">
                <div class="flex items-center gap-3">
                    <button onclick="navigateTo('services-catalog')" class="w-10 h-10 rounded-full bg-primary/5 hover:bg-primary/10 text-primary flex items-center justify-center transition-colors">
                        <span class="material-symbols-outlined">arrow_back</span>
                    </button>
                    <div>
                        <span class="font-label-caps text-[10px] text-[#B45309] font-bold uppercase tracking-wider block">Spa Catalog</span>
                        <h1 class="font-serif text-2xl md:text-3xl text-[#1E293B] font-bold">All Services & Packages</h1>
                    </div>
                </div>
                
                <!-- Search bar -->
                <div class="relative w-full md:w-80">
                    <span class="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
                    <input type="text" id="all-services-search" placeholder="Search treatments..." value="${state.searchQuery}" oninput="searchAllServices(this.value)" class="w-full pl-10 pr-4 py-2.5 rounded-full border border-outline-variant/60 focus:outline-none focus:border-primary text-xs font-semibold text-on-surface">
                    ${state.searchQuery ? `
                        <button onclick="searchAllServices(''); document.getElementById('all-services-search').value=''" class="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                            <span class="material-symbols-outlined text-base">close</span>
                        </button>
                    ` : ''}
                </div>
            </div>

            <!-- Categories Tabs -->
            <div class="flex gap-3 overflow-x-auto pb-2 hide-scrollbar">
                ${tabsHtml}
            </div>

            <!-- Services Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                ${gridHtml}
            </div>
        </div>
    `;
}
window.renderAllServicesView = renderAllServicesView;

export function setAllServicesFilter(category) {
    window.setAllServicesFilter = setAllServicesFilter;
    state.activeCategoryFilter = category;
    renderAllServicesView();
};

export function searchAllServices(query) {
    window.searchAllServices = searchAllServices;
    state.searchQuery = query;
    renderAllServicesView();
};

window.setAllServicesFilter = setAllServicesFilter;
window.searchAllServices = searchAllServices;

import { tenantId, currentTenant, DEFAULT_TENANTS } from '../models/Tenant.js';
import { SERVICES, THERAPISTS, getSharedData, syncServices, syncTherapists } from '../models/Database.js';
import { TRANSLATIONS, t, getServiceTranslation, translateStaticHtml, toggleLanguage } from '../models/Translations.js';
import { DEFAULT_STATE, state, loadState, saveState } from '../models/State.js';
import { isLoggedIn, updateNavbarAuth } from '../controllers/AuthController.js';
import { renderActiveViewContents, updateHeaderWalletDisplay, renderHomeView, renderServicesCatalogView, renderSelectServiceView, renderSelectTherapistView, renderSelectTimeView, renderConfirmBookingView, renderActivePackagesWidget, renderPaymentMethodSelection, startBookingWithService } from '../views/Renderers.js';
import { renderSidebarSummary, renderSuccessView } from '../views/SidebarSummary.js';
import { resetBookingFlow, nextStep, prevStep } from '../controllers/BookingController.js';
import { showNotification } from '../views/Toast.js';
import { renderProfileView, renderWalletView, renderTopupView, renderPersonalDetailsView, renderBookingHistoryView, renderNotificationsView, renderPrivacySecurityView, renderRescheduleView } from '../views/ProfileViews.js';
import { renderAllServicesView } from '../views/CatalogViews.js';
import { openPaymentMethodsModal, closePaymentMethodsModal } from '../views/PaymentModal.js';
import { renderBookPackageView, renderActivePackagesView } from '../views/PackageViews.js';

// 3. CORE ROUTING & VIEW CONTROLLER
export function navigateTo(viewId) {
    if (viewId === 'home' && isLoggedIn() && !window.__forceLandingEntry) {
        viewId = 'dashboard';
    }

    const wizardViews = ['select-therapist', 'select-time', 'confirm-booking'];
    if (wizardViews.includes(viewId) && (!state.booking || !state.booking.service)) {
        navigateTo('select-service');
        return;
    }

    state.currentView = viewId;

    // Hide all view sections
    document.querySelectorAll('.view-section').forEach(sec => {
        sec.classList.add('hidden');
    });

    // Show target section
    const targetSection = document.getElementById(`view-${viewId}`);
    if (targetSection) {
        targetSection.classList.remove('hidden');
    }

    // Update Stepper state (for steps 1-4)
    updateStepperUI(viewId);

    // Update dynamic elements
    renderActiveViewContents(viewId);

    // Update active state of navbar menu items
    updateNavbarActiveState(viewId);

    // Mobile bottom nav bar: always visible on booking steps 1-3
    const _mobileNav = document.getElementById('mobile-bottom-nav');
    const _backBtn   = document.getElementById('mobile-back-btn');
    const _contBtn   = document.getElementById('mobile-continue-btn');
    if (_mobileNav && _backBtn && _contBtn) {
        if (viewId === 'select-service') {
            _mobileNav.classList.add('show-mobile-nav');
            _backBtn.onclick = () => resetBookingFlow();
            _contBtn.onclick = () => window.nextStep(1);
        } else if (viewId === 'select-therapist') {
            _mobileNav.classList.add('show-mobile-nav');
            _backBtn.onclick = () => navigateTo('select-service');
            _contBtn.onclick = () => window.nextStep(2);
        } else if (viewId === 'select-time') {
            _mobileNav.classList.add('show-mobile-nav');
            _backBtn.onclick = () => navigateTo('select-therapist');
            _contBtn.onclick = () => window.nextStep(3);
        } else {
            _mobileNav.classList.remove('show-mobile-nav');
        }
    }

    // Scroll to top instantly
    window.scrollTo(0, 0);
    saveState();
    updateTenantLinks();
}
window.navigateTo = navigateTo;

export function updateTenantLinks() {
    document.querySelectorAll('a').forEach(a => {
        const href = a.getAttribute('href');
        if (href && (href.includes('register.html') || href.includes('login.html') || href.includes('index.html'))) {
            try {
                // Resolve relative path using window location
                const url = new URL(href, window.location.origin + window.location.pathname);
                url.searchParams.set('tenant', tenantId);
                // If the original URL had search params or hash, keep them
                const origUrl = new URL(href, window.location.origin);
                origUrl.searchParams.forEach((val, key) => {
                    url.searchParams.set(key, val);
                });
                url.searchParams.set('tenant', tenantId);
                a.setAttribute('href', url.pathname + url.search + origUrl.hash);
            } catch (e) {
                const separator = href.includes('?') ? '&' : '?';
                if (!href.includes('tenant=')) {
                    a.setAttribute('href', href + separator + 'tenant=' + tenantId);
                }
            }
        }
    });
}
window.updateTenantLinks = updateTenantLinks;

document.addEventListener('DOMContentLoaded', () => {
    updateTenantLinks();
});

export function navigateToAllServicesWithFilter(filterId) {
    window.navigateToAllServicesWithFilter = navigateToAllServicesWithFilter;
    state.activeCategoryFilter = filterId;
    state.searchQuery = '';
    navigateTo('all-services');
};

export function updateNavbarActiveState(viewId) {
    const homeLinks = document.querySelectorAll('[onclick="resetBookingFlow()"]');
    const serviceLinks = document.querySelectorAll('[onclick="navigateTo(\'services-catalog\')"]');
    const contactLinks = document.querySelectorAll('[onclick="navigateTo(\'contact\')"]');
    const aboutLinks = document.querySelectorAll('[onclick="navigateTo(\'about\')"]');

    if (viewId === 'home' || viewId === 'dashboard') {
        homeLinks.forEach(link => {
            if (link.tagName === 'A') {
                link.className = 'text-sm font-semibold text-primary transition-colors duration-300 cursor-pointer';
            }
        });
        serviceLinks.forEach(link => {
            if (link.tagName === 'A') {
                link.className = 'text-sm font-semibold text-on-surface-variant/60 hover:text-primary transition-colors duration-300 cursor-pointer';
            }
        });
        contactLinks.forEach(link => {
            if (link.tagName === 'A') {
                link.className = 'text-sm font-semibold text-on-surface-variant/60 hover:text-primary transition-colors duration-300 cursor-pointer';
            }
        });
    } else if (['services-catalog', 'select-service', 'select-therapist', 'select-time', 'confirm-booking'].includes(viewId)) {
        homeLinks.forEach(link => {
            if (link.tagName === 'A') {
                link.className = 'text-sm font-semibold text-on-surface-variant/60 hover:text-primary transition-colors duration-300 cursor-pointer';
            }
        });
        serviceLinks.forEach(link => {
            if (link.tagName === 'A') {
                link.className = 'text-sm font-semibold text-primary transition-colors duration-300 cursor-pointer';
            }
        });
        contactLinks.forEach(link => {
            if (link.tagName === 'A') {
                link.className = 'text-sm font-semibold text-on-surface-variant/60 hover:text-primary transition-colors duration-300 cursor-pointer';
            }
        });
    } else if (viewId === 'contact') {
        homeLinks.forEach(link => {
            if (link.tagName === 'A') {
                link.className = 'text-sm font-semibold text-on-surface-variant/60 hover:text-primary transition-colors duration-300 cursor-pointer';
            }
        });
        serviceLinks.forEach(link => {
            if (link.tagName === 'A') {
                link.className = 'text-sm font-semibold text-on-surface-variant/60 hover:text-primary transition-colors duration-300 cursor-pointer';
            }
        });
        contactLinks.forEach(link => {
            if (link.tagName === 'A') {
                link.className = 'text-sm font-semibold text-primary transition-colors duration-300 cursor-pointer';
            }
        });
    } else {
        homeLinks.forEach(link => {
            if (link.tagName === 'A') {
                link.className = 'text-sm font-semibold text-on-surface-variant/60 hover:text-primary transition-colors duration-300 cursor-pointer';
            }
        });
        serviceLinks.forEach(link => {
            if (link.tagName === 'A') {
                link.className = 'text-sm font-semibold text-on-surface-variant/60 hover:text-primary transition-colors duration-300 cursor-pointer';
            }
        });
        contactLinks.forEach(link => {
            if (link.tagName === 'A') {
                link.className = 'text-sm font-semibold text-on-surface-variant/60 hover:text-primary transition-colors duration-300 cursor-pointer';
            }
        });
    }

    // Mobile bottom nav active highlight updates
    const tabs = {
        'home': 'mobile-tab-home',
        'services-catalog': 'mobile-tab-services',
        'all-services': 'mobile-tab-services',
        'select-service': 'mobile-tab-services',
        'select-therapist': 'mobile-tab-services',
        'select-time': 'mobile-tab-services',
        'confirm-booking': 'mobile-tab-services',
        'wallet': 'mobile-tab-wallet',
        'topup': 'mobile-tab-wallet',
        'profile': 'mobile-tab-profile',
        'reschedule': 'mobile-tab-profile',
        'book-package': 'mobile-tab-services'
    };
    
    document.querySelectorAll('.mobile-tab-btn').forEach(btn => {
        btn.classList.remove('text-[#50613f]', 'font-bold');
        btn.classList.add('text-slate-400');
        const icon = btn.querySelector('.material-symbols-outlined');
        if (icon) icon.classList.remove('filled');
    });
    
    const activeTabId = tabs[viewId];
    if (activeTabId) {
        const activeBtn = document.getElementById(activeTabId);
        if (activeBtn) {
            activeBtn.classList.remove('text-slate-400');
            activeBtn.classList.add('text-[#50613f]', 'font-bold');
            const icon = activeBtn.querySelector('.material-symbols-outlined');
            if (icon) icon.classList.add('filled');
        }
    }
}

export function updateStepperUI(viewId) {
    // Clear all stepper containers first
    ['stepper-select-service', 'stepper-select-therapist', 'stepper-select-time', 'stepper-confirm-booking'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.innerHTML = '';
    });

    let activeStep = 0;
    let containerId = '';
    if (viewId === 'select-service') { activeStep = 1; containerId = 'stepper-select-service'; }
    else if (viewId === 'select-therapist') { activeStep = 2; containerId = 'stepper-select-therapist'; }
    else if (viewId === 'select-time') { activeStep = 3; containerId = 'stepper-select-time'; }
    else if (viewId === 'confirm-booking') { activeStep = 4; containerId = 'stepper-confirm-booking'; }

    if (!containerId) return;

    const container = document.getElementById(containerId);
    if (!container) return;

    let progressWidth = 0;
    if (activeStep === 2) progressWidth = 33.3;
    else if (activeStep === 3) progressWidth = 66.6;
    else if (activeStep === 4) progressWidth = 100;

    container.innerHTML = `
        <div class="relative flex items-center justify-between w-full max-w-sm mx-auto mb-10 mt-4">
            <!-- Connecting Line Background -->
            <div class="absolute left-0 right-0 top-4 h-[2px] bg-slate-200/80 z-0"></div>
            <!-- Connecting Line Active Progress -->
            <div class="absolute left-0 top-4 h-[2px] bg-[#50613f] z-0 transition-all duration-500" style="width: ${progressWidth}%"></div>
            
            <!-- Step 1 -->
            <div class="relative z-10 flex flex-col items-center">
                <div class="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 ${activeStep >= 1 ? 'bg-[#50613f] text-white border-2 border-[#50613f]' : 'bg-slate-200 text-slate-500 border-2 border-transparent'}">
                    ${activeStep > 1 ? '<span class="material-symbols-outlined text-[16px] font-bold">check</span>' : '1'}
                </div>
                <span class="text-[10px] font-bold mt-2 ${activeStep >= 1 ? 'text-[#50613f]' : 'text-slate-400'} uppercase tracking-wider">${t('lbl_service')}</span>
            </div>
            
            <!-- Step 2 -->
            <div class="relative z-10 flex flex-col items-center">
                <div class="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 ${activeStep >= 2 ? 'bg-[#50613f] text-white border-2 border-[#50613f]' : 'bg-slate-200 text-slate-500 border-2 border-transparent'}">
                    ${activeStep > 2 ? '<span class="material-symbols-outlined text-[16px] font-bold">check</span>' : '2'}
                </div>
                <span class="text-[10px] font-bold mt-2 ${activeStep >= 2 ? 'text-[#50613f]' : 'text-slate-400'} uppercase tracking-wider">${t('lbl_therapist')}</span>
            </div>
            
            <!-- Step 3 -->
            <div class="relative z-10 flex flex-col items-center">
                <div class="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 ${activeStep >= 3 ? 'bg-[#50613f] text-white border-2 border-[#50613f]' : 'bg-slate-200 text-slate-500 border-2 border-transparent'}">
                    ${activeStep > 3 ? '<span class="material-symbols-outlined text-[16px] font-bold">check</span>' : '3'}
                </div>
                <span class="text-[10px] font-bold mt-2 ${activeStep >= 3 ? 'text-[#50613f]' : 'text-slate-400'} uppercase tracking-wider">${state.language === 'ms' ? 'Waktu' : 'Time'}</span>
            </div>
            
            <!-- Step 4 -->
            <div class="relative z-10 flex flex-col items-center">
                <div class="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 ${activeStep >= 4 ? 'bg-[#50613f] text-white border-2 border-[#50613f]' : 'bg-slate-200 text-slate-500 border-2 border-transparent'}">
                    4
                </div>
                <span class="text-[10px] font-bold mt-2 ${activeStep >= 4 ? 'text-[#50613f]' : 'text-slate-400'} uppercase tracking-wider">${state.language === 'ms' ? 'Sahkan' : 'Confirm'}</span>
            </div>
        </div>
    `;
}

window.navigateToAllServicesWithFilter = navigateToAllServicesWithFilter;
window.updateNavbarActiveState = updateNavbarActiveState;
window.updateStepperUI = updateStepperUI;


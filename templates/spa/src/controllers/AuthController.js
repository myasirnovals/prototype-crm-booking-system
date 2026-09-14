import { tenantId, currentTenant, DEFAULT_TENANTS } from '../models/Tenant.js';
import { SERVICES, THERAPISTS, getSharedData, syncServices, syncTherapists } from '../models/Database.js';
import { TRANSLATIONS, t, getServiceTranslation, translateStaticHtml, toggleLanguage } from '../models/Translations.js';
import { DEFAULT_STATE, state, loadState, saveState } from '../models/State.js';
import { navigateTo, updateTenantLinks, updateNavbarActiveState, updateStepperUI, navigateToAllServicesWithFilter } from '../controllers/Router.js';
import { renderActiveViewContents, updateHeaderWalletDisplay, renderHomeView, renderServicesCatalogView, renderSelectServiceView, renderSelectTherapistView, renderSelectTimeView, renderConfirmBookingView, renderActivePackagesWidget, renderPaymentMethodSelection, startBookingWithService } from '../views/Renderers.js';
import { renderSidebarSummary, renderSuccessView } from '../views/SidebarSummary.js';
import { resetBookingFlow, nextStep, prevStep } from '../controllers/BookingController.js';
import { showNotification } from '../views/Toast.js';
import { renderProfileView, renderWalletView, renderTopupView, renderPersonalDetailsView, renderBookingHistoryView, renderNotificationsView, renderPrivacySecurityView, renderRescheduleView } from '../views/ProfileViews.js';
import { renderAllServicesView } from '../views/CatalogViews.js';
import { openPaymentMethodsModal, closePaymentMethodsModal } from '../views/PaymentModal.js';
import { renderBookPackageView, renderActivePackagesView } from '../views/PackageViews.js';

// ── AUTH HELPERS ────────────────────────────────────────────
// Read auth from localStorage (persisted across sessions)
export function isLoggedIn() {
    return localStorage.getItem(`${tenantId}_user_logged_in`) === 'true';
}

// Show the login modal; after success, run callback
export function requireLogin(callback) {
    window.requireLogin = requireLogin;
    if (isLoggedIn()) {
        if (callback) callback();
        return;
    }
    // Store the pending action
    window._loginCallback = callback || null;
    const modal = document.getElementById('user-login-modal');
    if (modal) modal.style.display = 'flex';
    // Hide mobile bottom nav while login modal is open
    const bottomNav = document.getElementById('mobile-bottom-nav');
    if (bottomNav) bottomNav.classList.remove('show-mobile-nav');
};

// Close the login modal and restore bottom nav if needed
export function closeLoginModal() {
    window.closeLoginModal = closeLoginModal;
    const modal = document.getElementById('user-login-modal');
    if (modal) modal.style.display = 'none';
    // Restore bottom nav bar if on a booking step
    const _nav = document.getElementById('mobile-bottom-nav');
    if (_nav) {
        const bookingViews = ['select-service', 'select-therapist', 'select-time'];
        if (bookingViews.includes(state.currentView)) {
            _nav.classList.add('show-mobile-nav');
        } else {
            _nav.classList.remove('show-mobile-nav');
        }
    }
};

// Called by login modal on successful login
export function onLoginSuccess() {
    window.onLoginSuccess = onLoginSuccess;
    const modal = document.getElementById('user-login-modal');
    if (modal) modal.style.display = 'none';
    updateNavbarAuth();
    // Restore bottom nav bar if on a booking step
    const _nav = document.getElementById('mobile-bottom-nav');
    if (_nav) {
        const bookingViews = ['select-service', 'select-therapist', 'select-time'];
        if (bookingViews.includes(state.currentView)) {
            _nav.classList.add('show-mobile-nav');
        } else {
            _nav.classList.remove('show-mobile-nav');
        }
    }
    if (window._loginCallback) {
        const cb = window._loginCallback;
        window._loginCallback = null;
        cb();
    } else {
        navigateTo('dashboard');
    }
};

// Logout user
export function userSignOut() {
    window.userSignOut = userSignOut;
    localStorage.removeItem(`${tenantId}_user_logged_in`);
    localStorage.removeItem(`${tenantId}_user_name`);
    localStorage.removeItem(`${tenantId}_user_email`);
    state.currentView = 'home';
    updateNavbarAuth();
    navigateTo('home');
};

// Update navbar person icon tooltip / appearance
export function updateNavbarAuth() {
    const loggedIn = isLoggedIn();
    const name = localStorage.getItem(`${tenantId}_user_name`) || '';
    const avatar = document.getElementById('nav-user-btn');
    const homeLabels = document.querySelectorAll('[data-translate="nav_home"]');
    if (avatar) {
        if (loggedIn) {
            avatar.setAttribute('title', name ? `Hi, ${name}` : 'My Account');
            avatar.style.background = 'rgba(80,97,63,0.15)';
        } else {
            avatar.setAttribute('title', 'Login / Register');
            avatar.style.background = '';
        }
    }
    homeLabels.forEach(label => {
        label.innerHTML = loggedIn ? 'Dashboard' : 'Home';
    });
    // Refresh wallet balance text
    updateHeaderWalletDisplay();
    // Refresh active packages widget on home
    renderActivePackagesWidget();
}

window.isLoggedIn = isLoggedIn;
window.requireLogin = requireLogin;
window.closeLoginModal = closeLoginModal;
window.onLoginSuccess = onLoginSuccess;
window.userSignOut = userSignOut;
window.updateNavbarAuth = updateNavbarAuth;

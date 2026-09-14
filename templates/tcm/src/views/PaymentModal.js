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
import { renderAllServicesView } from '../views/CatalogViews.js';
import { renderBookPackageView, renderActivePackagesView } from '../views/PackageViews.js';

// 7. SAVED PAYMENT METHODS MODAL MANAGER
export function openPaymentMethodsModal() {
    window.openPaymentMethodsModal = openPaymentMethodsModal;
    const modal = document.getElementById('modal-payment-methods');
    if (!modal) return;

    renderSavedCards();

    // Show modal with animation
    modal.classList.remove('hidden');
    // Force reflow
    modal.offsetHeight;
    modal.classList.remove('opacity-0');
};

export function closePaymentMethodsModal() {
    window.closePaymentMethodsModal = closePaymentMethodsModal;
    const modal = document.getElementById('modal-payment-methods');
    if (!modal) return;

    modal.classList.add('opacity-0');
    setTimeout(() => {
        modal.classList.add('hidden');
        window.hideAddNewCardForm();
    }, 300);
};

export function renderSavedCards() {
    const container = document.getElementById('saved-cards-list');
    if (!container) return;

    if (!state.savedCards || state.savedCards.length === 0) {
        container.innerHTML = `
            <div class="text-center py-6 text-on-surface-variant opacity-60">
                <span class="material-symbols-outlined text-3xl mb-1">credit_card_off</span>
                <p class="text-xs">No saved payment methods found.</p>
            </div>
        `;
        return;
    }

    let html = '';
    state.savedCards.forEach(card => {
        const icon = card.brand.toLowerCase() === 'visa' ? 'credit_card' : 'credit_card'; 
        const brandColor = card.brand.toLowerCase() === 'visa' ? 'text-primary' : 'text-secondary';
        
        html += `
            <div class="flex items-center justify-between p-4 bg-slate-50 border border-outline-variant/40 rounded-2xl relative group">
                <div class="flex items-center gap-3">
                    <span class="material-symbols-outlined ${brandColor} text-xl">${icon}</span>
                    <div>
                        <div class="flex items-center gap-1.5 flex-wrap">
                            <span class="text-xs font-bold text-on-surface">${card.brand} ending in ${card.last4}</span>
                            ${card.isDefault ? `<span class="px-2 py-0.5 bg-primary/10 text-primary text-[8px] font-bold rounded uppercase">Default</span>` : ''}
                        </div>
                        <span class="text-[10px] text-on-surface-variant block mt-0.5">Expires ${card.expiry}</span>
                    </div>
                </div>
                <div class="flex items-center gap-1.5">
                    ${!card.isDefault ? `
                        <button onclick="setDefaultCard('${card.id}')" class="text-[10px] font-bold text-primary hover:underline cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                            Set Default
                        </button>
                    ` : ''}
                    <button onclick="deleteSavedCard('${card.id}')" class="w-7 h-7 rounded-full hover:bg-red-50 text-red-500 hover:text-red-700 flex items-center justify-center transition-colors cursor-pointer" title="Delete card">
                        <span class="material-symbols-outlined text-base">delete</span>
                    </button>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

export function showAddNewCardForm() {
    window.showAddNewCardForm = showAddNewCardForm;
    const form = document.getElementById('add-card-form');
    const toggleBtn = document.getElementById('btn-add-card-toggle');
    if (form) form.classList.remove('hidden');
    if (toggleBtn) toggleBtn.classList.add('hidden');
};

export function hideAddNewCardForm() {
    window.hideAddNewCardForm = hideAddNewCardForm;
    const form = document.getElementById('add-card-form');
    const toggleBtn = document.getElementById('btn-add-card-toggle');
    if (form) {
        form.classList.add('hidden');
        form.reset();
    }
    if (toggleBtn) toggleBtn.classList.remove('hidden');
};

export function handleAddNewCard(event) {
    window.handleAddNewCard = handleAddNewCard;
    event.preventDefault();
    const numberInput = document.getElementById('new-card-number').value.replace(/\s+/g, '');
    const expiryInput = document.getElementById('new-card-expiry').value.trim();
    const cvvInput = document.getElementById('new-card-cvv').value.trim();

    if (numberInput.length < 12) {
        showNotification(state.language === 'ms' ? 'Panjang nombor kad tidak sah.' : 'Invalid card number length.', 'error');
        return;
    }

    const last4 = numberInput.substring(numberInput.length - 4);
    // Simple brand detection
    const isVisa = numberInput.startsWith('4');
    const brand = isVisa ? 'Visa' : 'Mastercard';

    const newCard = {
        id: 'card-' + Date.now(),
        brand,
        last4,
        expiry: expiryInput,
        isDefault: !state.savedCards || state.savedCards.length === 0
    };

    if (!state.savedCards) state.savedCards = [];
    state.savedCards.push(newCard);

    saveState();
    renderSavedCards();
    window.hideAddNewCardForm();
    const addedMsg = state.language === 'ms'
        ? `Berjaya menambah ${brand} baru yang berakhir dengan ${last4}.`
        : `Added new ${brand} ending in ${last4} successfully.`;
    showNotification(addedMsg, 'success');
};

export function deleteSavedCard(cardId) {
    window.deleteSavedCard = deleteSavedCard;
    const confirmMsg = state.language === 'ms'
        ? "Adakah anda pasti mahu memadamkan kaedah pembayaran ini?"
        : "Are you sure you want to delete this payment method?";
    if (confirm(confirmMsg)) {
        const idx = state.savedCards.findIndex(c => c.id === cardId);
        if (idx !== -1) {
            const removed = state.savedCards.splice(idx, 1)[0];
            if (removed.isDefault && state.savedCards.length > 0) {
                state.savedCards[0].isDefault = true;
            }
            saveState();
            renderSavedCards();
            showNotification(state.language === 'ms' ? 'Kaedah pembayaran berjaya dipadamkan.' : 'Payment method deleted successfully.', 'success');
        }
    }
};

export function setDefaultCard(cardId) {
    window.setDefaultCard = setDefaultCard;
    state.savedCards.forEach(c => {
        c.isDefault = c.id === cardId;
    });
    saveState();
    renderSavedCards();
    showNotification(state.language === 'ms' ? 'Kaedah pembayaran lalai dikemas kini.' : 'Default payment method updated.', 'success');
};

window.openPaymentMethodsModal = openPaymentMethodsModal;
window.closePaymentMethodsModal = closePaymentMethodsModal;
window.renderSavedCards = renderSavedCards;
window.showAddNewCardForm = showAddNewCardForm;
window.hideAddNewCardForm = hideAddNewCardForm;
window.handleAddNewCard = handleAddNewCard;
window.deleteSavedCard = deleteSavedCard;
window.setDefaultCard = setDefaultCard;

import { tenantId, currentTenant, DEFAULT_TENANTS } from '../models/Tenant.js';
import { SERVICES, THERAPISTS, getSharedData, syncServices, syncTherapists } from '../models/Database.js';
import { TRANSLATIONS, t, getServiceTranslation, translateStaticHtml, toggleLanguage } from '../models/Translations.js';
import { DEFAULT_STATE, state, loadState, saveState } from '../models/State.js';
import { isLoggedIn, updateNavbarAuth } from '../controllers/AuthController.js';
import { navigateTo, updateTenantLinks, updateNavbarActiveState, updateStepperUI, navigateToAllServicesWithFilter } from '../controllers/Router.js';
import { renderActiveViewContents, updateHeaderWalletDisplay, renderHomeView, renderServicesCatalogView, renderSelectServiceView, renderSelectTherapistView, renderSelectTimeView, renderConfirmBookingView, renderActivePackagesWidget, renderPaymentMethodSelection, startBookingWithService } from '../views/Renderers.js';
import { resetBookingFlow, nextStep, prevStep } from '../controllers/BookingController.js';
import { showNotification } from '../views/Toast.js';
import { renderProfileView, renderWalletView, renderTopupView, renderPersonalDetailsView, renderBookingHistoryView, renderNotificationsView, renderPrivacySecurityView, renderRescheduleView } from '../views/ProfileViews.js';
import { renderAllServicesView } from '../views/CatalogViews.js';
import { openPaymentMethodsModal, closePaymentMethodsModal } from '../views/PaymentModal.js';
import { renderBookPackageView, renderActivePackagesView } from '../views/PackageViews.js';

// 5. SIDEBAR SUMMARY BUILDER
export function renderSidebarSummary() {
    let targetId = 'booking-sidebar-summary';
    if (state.currentView === 'select-therapist') targetId = 'booking-sidebar-summary-therapist';
    else if (state.currentView === 'select-time') targetId = 'booking-sidebar-summary-time';
    else if (state.currentView === 'confirm-booking') targetId = 'booking-sidebar-summary-confirm';

    const sidebar = document.getElementById(targetId);
    if (!sidebar) return;

    const service = state.booking.service;
    const therapist = state.booking.therapist;
    const date = state.booking.date;
    const time = state.booking.time;

    let subtotal = service ? service.price : 0;
    let tax = subtotal * 0.07;
    let total = subtotal + tax;

    let html = `
        <h2 class="font-headline-lg text-lg text-[#1E293B] border-b border-surface-variant pb-4 font-bold mb-6">${t('booking_summary_title')}</h2>
        <div class="flex flex-col gap-5">
            <!-- Service Info -->
            <div class="flex gap-3 items-start">
                <div class="w-10 h-10 rounded-lg bg-[#50613f]/10 flex items-center justify-center shrink-0 text-primary">
                    <span class="material-symbols-outlined text-lg">spa</span>
                </div>
                <div>
                    <span class="font-label-caps text-[9px] text-outline mb-0.5 block uppercase font-bold tracking-wider">${t('lbl_service')}</span>
                    ${service ? `
                        <h3 class="font-title-md text-xs font-semibold text-[#1E293B]">${service.name}</h3>
                        <p class="font-body-sm text-[11px] text-on-surface-variant">${service.duration || ''} • MYR ${service.price}</p>
                    ` : `
                        <h3 class="font-title-md text-xs font-semibold text-on-surface-variant"><span class="italic text-on-surface-variant opacity-60 text-xs">${state.language === 'ms' ? 'Belum dipilih' : 'To be selected'}</span></h3>
                    `}
                </div>
            </div>
            
            <!-- Therapist Info -->
            <div class="flex gap-3 items-start">
                <div class="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center shrink-0 overflow-hidden">
                    ${therapist && therapist.image ? `
                        <img class="w-full h-full object-cover" src="${therapist.image}">
                    ` : `
                        <div class="w-10 h-10 rounded-lg bg-[#50613f]/10 flex items-center justify-center text-primary shrink-0">
                            <span class="material-symbols-outlined text-lg">person</span>
                        </div>
                    `}
                </div>
                <div>
                    <span class="font-label-caps text-[9px] text-outline mb-0.5 block uppercase font-bold tracking-wider">${t('lbl_therapist')}</span>
                    ${therapist ? `
                        <h3 class="font-title-md text-xs font-semibold text-[#1E293B]">${therapist.name}</h3>
                        <p class="font-body-sm text-[11px] text-on-surface-variant">${therapist.role || ''}</p>
                    ` : `
                        <h3 class="font-title-md text-xs font-semibold text-on-surface-variant"><span class="italic text-on-surface-variant opacity-60 text-xs">${state.language === 'ms' ? 'Belum dipilih' : 'To be selected'}</span></h3>
                    `}
                </div>
            </div>
            
            <!-- Schedule Info -->
            <div class="flex gap-3 items-start">
                <div class="w-10 h-10 rounded-lg bg-[#50613f]/10 flex items-center justify-center shrink-0 text-primary">
                    <span class="material-symbols-outlined text-lg">calendar_month</span>
                </div>
                <div>
                    <span class="font-label-caps text-[9px] text-outline mb-0.5 block uppercase font-bold tracking-wider">${t('lbl_date_time')}</span>
                    ${date ? `
                        <h3 class="font-title-md text-xs font-semibold text-[#1E293B]">${date}</h3>
                        <p class="font-body-sm text-[11px] text-[#50613f] font-bold">${time || (state.language === 'ms' ? 'Belum dipilih' : 'To be selected')}</p>
                    ` : `
                        <h3 class="font-title-md text-xs font-semibold text-on-surface-variant"><span class="italic text-on-surface-variant opacity-60 text-xs">${state.language === 'ms' ? 'Belum dipilih' : 'To be selected'}</span></h3>
                    `}
                </div>
            </div>
        </div>
    `;

    // Price breakdown
    const isServiceSelected = !!service;
    const isConfirmOrTime = state.currentView === 'confirm-booking' || state.currentView === 'select-time';

    html += `
        <div class="mt-6 pt-6 border-t border-surface-variant">
            <div class="flex justify-between items-center mb-2 text-on-surface-variant text-xs">
                <span>${t('lbl_subtotal')}</span>
                <span>MYR ${isServiceSelected ? service.price.toFixed(2) : '0.00'}</span>
            </div>
            <div class="flex justify-between items-center mb-3 text-on-surface-variant text-xs">
                <span>${t('lbl_tax')}</span>
                <span>MYR ${(isServiceSelected ? (service.price * 0.07) : 0).toFixed(2)}</span>
            </div>
            <div class="flex justify-between items-center pt-3 border-t border-outline-variant/30 font-semibold text-xs">
                <span class="text-on-surface">${isConfirmOrTime ? t('lbl_total') : t('lbl_est_total')}</span>
                <span class="font-serif text-base text-[#1E293B] font-bold">MYR ${total.toFixed(2)}</span>
            </div>

            ${state.currentView === 'confirm-booking' ? `
                <div class="mt-4 p-3 bg-amber-50 rounded-2xl border border-amber-200/70 text-left space-y-2">
                    <div class="flex justify-between items-center text-xs text-amber-900 font-bold">
                        <span>${state.language === 'ms' ? 'Deposit 50% Hari Ini:' : '50% Deposit Due Today:'}</span>
                        <span class="text-amber-700 font-serif text-sm font-bold">MYR ${(total * 0.5).toFixed(2)}</span>
                    </div>
                    <div class="flex justify-between items-center text-[11px] text-slate-600 font-semibold border-t border-amber-200/50 pt-1.5">
                        <span>${state.language === 'ms' ? 'Baki Dibayar di Spa:' : 'Remaining Balance at Spa:'}</span>
                        <span>MYR ${(total * 0.5).toFixed(2)}</span>
                    </div>
                    <div class="text-[10px] text-amber-800 leading-tight pt-1.5 border-t border-amber-200/50 flex items-start gap-1">
                        <span class="material-symbols-outlined text-[13px] shrink-0 text-amber-600">info</span>
                        <span><strong>${state.language === 'ms' ? 'Polisi Pembatalan:' : 'Cancellation Policy:'}</strong> ${state.language === 'ms' ? 'Pembatalan percuma sehingga 24j sebelum slot. Pembatalan dalam 24j merampas deposit 50%.' : 'Free cancellation up to 24h prior. Cancellations within 24h forfeit the 50% deposit.'}</span>
                    </div>
                </div>
            ` : ''}
        </div>
    `;

    // Append Stepper Actions directly below Summary Booking in the sidebar
    if (state.currentView === 'select-service') {
        html += `
            <div class="hidden md:flex justify-between items-center mt-6 pt-6 border-t border-outline-variant/30 gap-3">
                <button onclick="resetBookingFlow()" class="px-5 py-2 rounded-lg border border-outline text-[#50613f] hover:bg-[#50613f]/5 text-xs font-bold flex items-center gap-1.5 transition-all w-1/2 justify-center">
                    <span class="material-symbols-outlined text-xs">arrow_back</span> ${t('btn_back')}
                </button>
                <button onclick="nextStep(1)" class="px-6 py-2.5 rounded-lg bg-primary text-white font-bold text-xs hover:shadow-lg transition-all flex items-center gap-1.5 w-1/2 justify-center">
                    ${t('btn_continue')} <span class="material-symbols-outlined text-xs">arrow_forward</span>
                </button>
            </div>
        `;
    } else if (state.currentView === 'select-therapist') {
        html += `
            <div class="hidden md:flex justify-between items-center mt-6 pt-6 border-t border-outline-variant/30 gap-3">
                <button onclick="navigateTo('select-service')" class="px-5 py-2 rounded-lg border border-outline text-[#50613f] hover:bg-[#50613f]/5 text-xs font-bold flex items-center gap-1.5 transition-all w-1/2 justify-center">
                    <span class="material-symbols-outlined text-xs">arrow_back</span> ${t('btn_back')}
                </button>
                <button onclick="nextStep(2)" class="px-6 py-2.5 rounded-lg bg-primary text-white font-bold text-xs hover:shadow-lg transition-all flex items-center gap-1.5 w-1/2 justify-center">
                    ${t('btn_continue')} <span class="material-symbols-outlined text-xs">arrow_forward</span>
                </button>
            </div>
        `;
    } else if (state.currentView === 'select-time') {
        html += `
            <div class="hidden md:flex justify-between items-center mt-6 pt-6 border-t border-outline-variant/30 gap-3">
                <button onclick="navigateTo('select-therapist')" class="px-5 py-2 rounded-lg border border-outline text-[#50613f] hover:bg-[#50613f]/5 text-xs font-bold flex items-center gap-1.5 transition-all w-1/2 justify-center">
                    <span class="material-symbols-outlined text-xs">arrow_back</span> ${t('btn_back')}
                </button>
                <button onclick="nextStep(3)" class="px-6 py-2.5 rounded-lg bg-primary text-white font-bold text-xs hover:shadow-lg transition-all flex items-center gap-1.5 w-1/2 justify-center">
                    ${t('btn_continue')} <span class="material-symbols-outlined text-xs">arrow_forward</span>
                </button>
            </div>
        `;
    } else if (state.currentView === 'confirm-booking') {
        html += `
            <div class="flex flex-col gap-3 mt-6 pt-6 border-t border-outline-variant/30">
                <button onclick="confirmReservation()" class="w-full py-3 rounded-xl bg-primary hover:bg-[#3e4b30] text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2">
                    ${t('btn_confirm')} <span class="material-symbols-outlined text-sm">check_circle</span>
                </button>
                <button onclick="prevStep(4)" class="w-full py-2.5 rounded-xl border border-outline text-[#50613f] hover:bg-[#50613f]/5 text-xs font-bold transition-all text-center">
                    ${t('btn_back')}
                </button>
            </div>
        `;
    }

    sidebar.innerHTML = html;

    // Sync to mobile summary modal
    const modalContent = document.getElementById('mobile-summary-modal-content');
    if (modalContent) {
        modalContent.innerHTML = html;
    }

}

// RENDER: SUCCESS VIEW
export function renderSuccessView() {
    const container = document.getElementById('success-details-card');
    if (!container) return;

    const service = state.booking.service;
    const therapist = state.booking.therapist;
    const date = state.booking.date;
    const time = state.booking.time;
    const resId = state.successResId || ('RES-' + Math.floor(1000 + Math.random() * 9000));
    // Clear temporary success reservation ID
    state.successResId = null;

    container.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-12 gap-8 text-left">
            <!-- Left Side Details -->
            <div class="md:col-span-7 space-y-5">
                <!-- Reservation ID -->
                <div class="flex items-center gap-3 pb-4 border-b border-outline-variant/30">
                    <div>
                        <span class="font-label-caps text-[9px] text-outline uppercase font-bold tracking-wider mb-0.5 block">RESERVATION ID</span>
                        <span class="font-title-md text-base font-bold text-[#1E293B]">#${resId}</span>
                    </div>
                    <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-semibold border border-emerald-200">
                        <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> ${t('status_confirmed')}
                    </span>
                </div>
                
                <!-- Service -->
                <div>
                    <span class="font-label-caps text-[9px] text-outline uppercase font-bold tracking-wider mb-0.5 block">${t('lbl_service')}</span>
                    <h3 class="font-title-md text-sm font-bold text-[#1E293B]">${service ? service.name : ''}</h3>
                    <p class="font-body-sm text-xs text-on-surface-variant">${service ? service.duration : ''}</p>
                </div>
                
                <!-- Therapist & Date/Time Row -->
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <span class="font-label-caps text-[9px] text-outline uppercase font-bold tracking-wider mb-0.5 block">${t('lbl_therapist')}</span>
                        <div class="flex items-center gap-2 mt-1">
                            ${therapist && therapist.image ? `
                                <img class="w-6 h-6 rounded-full object-cover" src="${therapist.image}">
                            ` : `
                                <div class="w-6 h-6 rounded-full bg-surface-container flex items-center justify-center">
                                    <span class="material-symbols-outlined text-sm text-[#50613f]">spa</span>
                                </div>
                            `}
                            <span class="font-title-md text-xs font-semibold text-[#1E293B]">${therapist ? therapist.name : (state.language === 'ms' ? 'Tiada Pilihan' : 'No Preference')}</span>
                        </div>
                    </div>
                    <div>
                        <span class="font-label-caps text-[9px] text-outline uppercase font-bold tracking-wider mb-0.5 block">${t('lbl_date_time')}</span>
                        <span class="font-title-md text-xs font-semibold text-[#1E293B] block mt-1">${date || ''}</span>
                        <p class="font-body-sm text-xs text-primary font-bold">${time || ''}</p>
                    </div>
                </div>
                

            </div>
            
            <!-- Right Side Actions & QR -->
            <div class="md:col-span-5 flex flex-col justify-center">
                <div class="flex flex-col items-center gap-4 bg-white/45 p-6 rounded-xl border border-outline-variant/30 w-full max-w-[240px] mx-auto md:ml-auto">
                    <div class="w-32 h-32 bg-[#1E293B] rounded-lg p-2 flex items-center justify-center shrink-0">
                        <!-- Simulated QR Code SVG -->
                        <svg class="w-full h-full text-white" viewBox="0 0 100 100" fill="currentColor">
                            <!-- top left square -->
                            <rect x="0" y="0" width="25" height="25"/>
                            <rect x="5" y="5" width="15" height="15" fill="#1E293B"/>
                            <rect x="8" y="8" width="9" height="9" fill="white"/>
                            <!-- top right square -->
                            <rect x="75" y="0" width="25" height="25"/>
                            <rect x="80" y="5" width="15" height="15" fill="#1E293B"/>
                            <rect x="83" y="8" width="9" height="9" fill="white"/>
                            <!-- bottom left square -->
                            <rect x="0" y="75" width="25" height="25"/>
                            <rect x="5" y="80" width="15" height="15" fill="#1E293B"/>
                            <rect x="8" y="83" width="9" height="9" fill="white"/>
                            <!-- random block details -->
                            <rect x="35" y="5" width="10" height="25"/>
                            <rect x="55" y="10" width="15" height="10"/>
                            <rect x="35" y="40" width="25" height="10"/>
                            <rect x="10" y="35" width="15" height="15"/>
                            <rect x="35" y="60" width="45" height="10"/>
                            <rect x="35" y="80" width="15" height="15"/>
                            <rect x="60" y="80" width="20" height="10"/>
                            <rect x="70" y="35" width="15" height="20"/>
                        </svg>
                    </div>
                    <span class="font-body-sm text-[10px] text-on-surface-variant text-center">Scan at reception upon arrival</span>
                    
                    <button class="w-full py-2 bg-[#EAB308] hover:bg-[#ca9b00] text-white font-semibold text-[11px] rounded-lg flex items-center justify-center gap-1.5 transition-all">
                        <span class="material-symbols-outlined text-xs">calendar_today</span> Add to Calendar
                    </button>
                    
                    <button class="w-full py-2 bg-transparent border border-outline text-[#1E293B] hover:bg-[#1E293B]/5 font-semibold text-[11px] rounded-lg flex items-center justify-center gap-1.5 transition-all">
                        <span class="material-symbols-outlined text-xs">download</span> Download Ticket
                    </button>
                </div>
            </div>
        </div>
    `;
}

window.renderSidebarSummary = renderSidebarSummary;
window.renderSuccessView = renderSuccessView;

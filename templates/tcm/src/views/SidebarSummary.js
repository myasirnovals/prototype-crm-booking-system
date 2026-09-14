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

    const currency = currentTenant?.currency || 'SGD';
    const service = state.booking.service;
    const therapist = state.booking.therapist;
    const date = state.booking.date;
    const time = state.booking.time;

    let subtotal = service ? service.price : 0;
    let tax = subtotal * 0.07;
    let total = subtotal + tax;

    let html = `
        <h2 class="font-serif text-lg text-[#0f3d32] border-b border-[#e7dfd1] pb-4 font-bold mb-6">${t('booking_summary_title')}</h2>
        <div class="flex flex-col gap-5">
            <!-- Service Info -->
            <div class="flex gap-3 items-start">
                <div class="w-10 h-10 rounded-xl bg-[#164e3f]/10 flex items-center justify-center shrink-0 text-[#164e3f]">
                    <span class="material-symbols-outlined text-lg">healing</span>
                </div>
                <div>
                    <span class="tcm-seal text-[8px] mb-0.5 block">${t('lbl_service')}</span>
                    ${service ? `
                        <h3 class="font-serif text-xs font-bold text-[#0f3d32]">${service.name}</h3>
                        <p class="text-[11px] text-slate-500">${service.duration || ''} • ${currency} ${service.price}</p>
                    ` : `
                        <h3 class="text-xs text-slate-400 italic">${state.language === 'ms' ? 'Belum dipilih' : (state.language === 'zh' ? '待选择' : 'To be selected')}</h3>
                    `}
                </div>
            </div>
            
            <!-- Therapist Info -->
            <div class="flex gap-3 items-start">
                <div class="w-10 h-10 rounded-xl bg-[#faf8f5] flex items-center justify-center shrink-0 overflow-hidden border border-[#e7dfd1]">
                    ${therapist && therapist.image ? `
                        <img class="w-full h-full object-cover" src="${therapist.image}">
                    ` : `
                        <div class="w-10 h-10 rounded-xl bg-[#164e3f]/10 flex items-center justify-center text-[#164e3f] shrink-0">
                            <span class="material-symbols-outlined text-lg">medical_services</span>
                        </div>
                    `}
                </div>
                <div>
                    <span class="tcm-seal text-[8px] mb-0.5 block">${t('lbl_therapist')}</span>
                    ${therapist ? `
                        <h3 class="font-serif text-xs font-bold text-[#0f3d32]">${therapist.name}</h3>
                        <p class="text-[11px] text-[#c59b27] font-medium">${therapist.role || ''}</p>
                    ` : `
                        <h3 class="text-xs text-slate-400 italic">${state.language === 'ms' ? 'Belum dipilih' : (state.language === 'zh' ? '待选择' : 'To be selected')}</h3>
                    `}
                </div>
            </div>
            
            <!-- Schedule Info -->
            <div class="flex gap-3 items-start">
                <div class="w-10 h-10 rounded-xl bg-[#164e3f]/10 flex items-center justify-center shrink-0 text-[#164e3f]">
                    <span class="material-symbols-outlined text-lg">calendar_month</span>
                </div>
                <div>
                    <span class="tcm-seal text-[8px] mb-0.5 block">${t('lbl_date_time')}</span>
                    ${date ? `
                        <h3 class="font-serif text-xs font-bold text-[#0f3d32]">${date}</h3>
                        <p class="text-[11px] text-[#164e3f] font-bold">${time || (state.language === 'ms' ? 'Belum dipilih' : (state.language === 'zh' ? '待选择' : 'To be selected'))}</p>
                    ` : `
                        <h3 class="text-xs text-slate-400 italic">${state.language === 'ms' ? 'Belum dipilih' : (state.language === 'zh' ? '待选择' : 'To be selected')}</h3>
                    `}
                </div>
            </div>
        </div>
    `;

    // Price breakdown
    const isServiceSelected = !!service;
    const isConfirmOrTime = state.currentView === 'confirm-booking' || state.currentView === 'select-time';

    html += `
        <div class="mt-6 pt-6 border-t border-[#e7dfd1]">
            <div class="flex justify-between items-center mb-2 text-slate-600 text-xs">
                <span>${t('lbl_subtotal')}</span>
                <span>${currency} ${isServiceSelected ? service.price.toFixed(2) : '0.00'}</span>
            </div>
            <div class="flex justify-between items-center mb-3 text-slate-600 text-xs">
                <span>${t('lbl_tax')}</span>
                <span>${currency} ${(isServiceSelected ? (service.price * 0.07) : 0).toFixed(2)}</span>
            </div>
            <div class="flex justify-between items-center pt-3 border-t border-[#e7dfd1] font-semibold text-xs">
                <span class="text-[#0f3d32]">${isConfirmOrTime ? t('lbl_total') : t('lbl_est_total')}</span>
                <span class="font-serif text-base text-[#0f3d32] font-bold">${currency} ${total.toFixed(2)}</span>
            </div>

            ${state.currentView === 'confirm-booking' ? `
                <div class="mt-4 p-3 bg-[#faf8f5] rounded-2xl border border-[#e7dfd1] text-left space-y-2">
                    <div class="flex justify-between items-center text-xs text-[#0f3d32] font-bold">
                        <span>${state.language === 'ms' ? 'Deposit 50% Hari Ini:' : (state.language === 'zh' ? '今日支付 50% 订金:' : '50% Deposit Due Today:')}</span>
                        <span class="text-[#b93826] font-serif text-sm font-bold">${currency} ${(total * 0.5).toFixed(2)}</span>
                    </div>
                    <div class="flex justify-between items-center text-[11px] text-slate-600 font-semibold border-t border-[#e7dfd1] pt-1.5">
                        <span>${state.language === 'ms' ? 'Baki Dibayar di Klinik TCM:' : (state.language === 'zh' ? '到店支付余款:' : 'Remaining Balance at Clinic:')}</span>
                        <span>${currency} ${(total * 0.5).toFixed(2)}</span>
                    </div>
                    <div class="text-[10px] text-slate-600 leading-tight pt-1.5 border-t border-[#e7dfd1] flex items-start gap-1">
                        <span class="material-symbols-outlined text-[13px] shrink-0 text-[#c59b27]">info</span>
                        <span><strong>${state.language === 'ms' ? 'Polisi Pembatalan:' : (state.language === 'zh' ? '取消政策:' : 'Cancellation Policy:')}</strong> ${state.language === 'ms' ? 'Pembatalan percuma sehingga 24j sebelum slot. Pembatalan dalam 24j merampas deposit 50%.' : (state.language === 'zh' ? '预约开始前24小时可免费取消；24小时内取消将扣除50%订金。' : 'Free cancellation up to 24h prior. Cancellations within 24h forfeit the 50% deposit.')}</span>
                    </div>
                </div>
            ` : ''}
        </div>
    `;

    // Stepper Actions
    if (state.currentView === 'select-service') {
        html += `
            <div class="hidden md:flex justify-between items-center mt-6 pt-6 border-t border-[#e7dfd1] gap-3">
                <button onclick="resetBookingFlow()" class="px-5 py-2 rounded-full border border-[#164e3f]/40 text-[#164e3f] hover:bg-[#164e3f]/5 text-xs font-bold flex items-center gap-1.5 transition-all w-1/2 justify-center">
                    <span class="material-symbols-outlined text-xs">arrow_back</span> ${t('btn_back')}
                </button>
                <button onclick="nextStep(1)" class="btn-tcm-primary px-6 py-2.5 rounded-full text-white font-bold text-xs shadow-sm hover:shadow-md transition-all flex items-center gap-1.5 w-1/2 justify-center">
                    ${t('btn_continue')} <span class="material-symbols-outlined text-xs">arrow_forward</span>
                </button>
            </div>
        `;
    } else if (state.currentView === 'select-therapist') {
        html += `
            <div class="hidden md:flex justify-between items-center mt-6 pt-6 border-t border-[#e7dfd1] gap-3">
                <button onclick="navigateTo('select-service')" class="px-5 py-2 rounded-full border border-[#164e3f]/40 text-[#164e3f] hover:bg-[#164e3f]/5 text-xs font-bold flex items-center gap-1.5 transition-all w-1/2 justify-center">
                    <span class="material-symbols-outlined text-xs">arrow_back</span> ${t('btn_back')}
                </button>
                <button onclick="nextStep(2)" class="btn-tcm-primary px-6 py-2.5 rounded-full text-white font-bold text-xs shadow-sm hover:shadow-md transition-all flex items-center gap-1.5 w-1/2 justify-center">
                    ${t('btn_continue')} <span class="material-symbols-outlined text-xs">arrow_forward</span>
                </button>
            </div>
        `;
    } else if (state.currentView === 'select-time') {
        html += `
            <div class="hidden md:flex justify-between items-center mt-6 pt-6 border-t border-[#e7dfd1] gap-3">
                <button onclick="navigateTo('select-therapist')" class="px-5 py-2 rounded-full border border-[#164e3f]/40 text-[#164e3f] hover:bg-[#164e3f]/5 text-xs font-bold flex items-center gap-1.5 transition-all w-1/2 justify-center">
                    <span class="material-symbols-outlined text-xs">arrow_back</span> ${t('btn_back')}
                </button>
                <button onclick="nextStep(3)" class="btn-tcm-primary px-6 py-2.5 rounded-full text-white font-bold text-xs shadow-sm hover:shadow-md transition-all flex items-center gap-1.5 w-1/2 justify-center">
                    ${t('btn_continue')} <span class="material-symbols-outlined text-xs">arrow_forward</span>
                </button>
            </div>
        `;
    } else if (state.currentView === 'confirm-booking') {
        html += `
            <div class="flex flex-col gap-3 mt-6 pt-6 border-t border-[#e7dfd1]">
                <button onclick="confirmReservation()" class="btn-tcm-primary w-full py-3 rounded-full text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2">
                    ${t('btn_confirm')} <span class="material-symbols-outlined text-sm">check_circle</span>
                </button>
                <button onclick="prevStep(4)" class="w-full py-2.5 rounded-full border border-[#164e3f]/40 text-[#164e3f] hover:bg-[#164e3f]/5 text-xs font-bold transition-all text-center">
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
    state.successResId = null;

    container.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-12 gap-8 text-left">
            <!-- Left Side Details -->
            <div class="md:col-span-7 space-y-5">
                <!-- Reservation ID -->
                <div class="flex items-center gap-3 pb-4 border-b border-[#e7dfd1]">
                    <div>
                        <span class="tcm-seal text-[8px] uppercase font-bold tracking-wider mb-0.5 block">RESERVATION ID</span>
                        <span class="font-serif text-base font-bold text-[#0f3d32]">#${resId}</span>
                    </div>
                    <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                        <span class="w-1.5 h-1.5 rounded-full bg-emerald-600"></span> ${t('status_confirmed')}
                    </span>
                </div>
                
                <!-- Service -->
                <div>
                    <span class="tcm-seal text-[8px] uppercase font-bold tracking-wider mb-0.5 block">${t('lbl_service')}</span>
                    <h3 class="font-serif text-sm font-bold text-[#0f3d32]">${service ? service.name : ''}</h3>
                    <p class="text-xs text-slate-500">${service ? service.duration : ''}</p>
                </div>
                
                <!-- Therapist & Date/Time Row -->
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <span class="tcm-seal text-[8px] uppercase font-bold tracking-wider mb-0.5 block">${t('lbl_therapist')}</span>
                        <div class="flex items-center gap-2 mt-1">
                            ${therapist && therapist.image ? `
                                <img class="w-7 h-7 rounded-xl object-cover border border-[#e7dfd1]" src="${therapist.image}">
                            ` : `
                                <div class="w-7 h-7 rounded-xl bg-[#164e3f]/10 flex items-center justify-center">
                                    <span class="material-symbols-outlined text-sm text-[#164e3f]">medical_services</span>
                                </div>
                            `}
                            <span class="font-serif text-xs font-bold text-[#0f3d32]">${therapist ? therapist.name : (state.language === 'ms' ? 'Tiada Pilihan' : (state.language === 'zh' ? '按科室统筹' : 'No Preference'))}</span>
                        </div>
                    </div>
                    <div>
                        <span class="tcm-seal text-[8px] uppercase font-bold tracking-wider mb-0.5 block">${t('lbl_date_time')}</span>
                        <span class="font-serif text-xs font-bold text-[#0f3d32] block mt-1">${date || ''}</span>
                        <p class="text-xs text-[#164e3f] font-bold">${time || ''}</p>
                    </div>
                </div>
            </div>
            
            <!-- Right Side Actions & QR -->
            <div class="md:col-span-5 flex flex-col justify-center">
                <div class="flex flex-col items-center gap-4 bg-[#faf8f5] p-6 rounded-2xl border border-[#e7dfd1] w-full max-w-[240px] mx-auto md:ml-auto">
                    <div class="w-32 h-32 bg-[#0f3d32] rounded-xl p-2 flex items-center justify-center shrink-0 shadow-md">
                        <!-- Simulated QR Code SVG -->
                        <svg class="w-full h-full text-white" viewBox="0 0 100 100" fill="currentColor">
                            <rect x="0" y="0" width="25" height="25"/>
                            <rect x="5" y="5" width="15" height="15" fill="#0f3d32"/>
                            <rect x="8" y="8" width="9" height="9" fill="white"/>
                            <rect x="75" y="0" width="25" height="25"/>
                            <rect x="80" y="5" width="15" height="15" fill="#0f3d32"/>
                            <rect x="83" y="8" width="9" height="9" fill="white"/>
                            <rect x="0" y="75" width="25" height="25"/>
                            <rect x="5" y="80" width="15" height="15" fill="#0f3d32"/>
                            <rect x="8" y="83" width="9" height="9" fill="white"/>
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
                    <span class="text-[10px] text-slate-500 text-center font-medium">${state.language === 'ms' ? 'Imbas di kaunter klinik semasa ketibaan' : (state.language === 'zh' ? '到店出示二维码快速签到' : 'Scan at clinic reception upon arrival')}</span>
                    
                    <button class="btn-tcm-gold w-full py-2 text-white font-bold text-[11px] rounded-full flex items-center justify-center gap-1.5 transition-all shadow-sm">
                        <span class="material-symbols-outlined text-xs">calendar_today</span> ${state.language === 'ms' ? 'Tambah ke Kalendar' : (state.language === 'zh' ? '加入日程' : 'Add to Calendar')}
                    </button>
                    
                    <button class="w-full py-2 bg-white border border-[#e7dfd1] text-[#0f3d32] hover:bg-[#faf8f5] font-bold text-[11px] rounded-full flex items-center justify-center gap-1.5 transition-all shadow-sm">
                        <span class="material-symbols-outlined text-xs">download</span> ${state.language === 'ms' ? 'Muat Turun Tiket' : (state.language === 'zh' ? '下载就诊凭证' : 'Download Ticket')}
                    </button>
                </div>
            </div>
        </div>
    `;
}

window.renderSidebarSummary = renderSidebarSummary;
window.renderSuccessView = renderSuccessView;

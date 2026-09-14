import { tenantId, currentTenant, DEFAULT_TENANTS } from '../models/Tenant.js';
import { SERVICES, THERAPISTS, getSharedData, syncServices, syncTherapists } from '../models/Database.js';
import { TRANSLATIONS, t, getServiceTranslation, translateStaticHtml, toggleLanguage } from '../models/Translations.js';
import { DEFAULT_STATE, state, loadState, saveState } from '../models/State.js';
import { isLoggedIn, updateNavbarAuth, requireLogin } from '../controllers/AuthController.js';
import { navigateTo, updateTenantLinks, updateNavbarActiveState, updateStepperUI, navigateToAllServicesWithFilter } from '../controllers/Router.js';
import { renderActiveViewContents, updateHeaderWalletDisplay, renderHomeView, renderServicesCatalogView, renderSelectServiceView, renderSelectTherapistView, renderSelectTimeView, renderConfirmBookingView, renderActivePackagesWidget, renderPaymentMethodSelection, startBookingWithService, selectedPaymentMethod, resetSelectedDateObj, resetIsEditingGuest } from '../views/Renderers.js';
import { renderSidebarSummary, renderSuccessView } from '../views/SidebarSummary.js';
import { showNotification } from '../views/Toast.js';
import { renderProfileView, renderWalletView, renderTopupView, renderPersonalDetailsView, renderBookingHistoryView, renderNotificationsView, renderPrivacySecurityView, renderRescheduleView } from '../views/ProfileViews.js';
import { renderAllServicesView } from '../views/CatalogViews.js';
import { openPaymentMethodsModal, closePaymentMethodsModal } from '../views/PaymentModal.js';
import { renderBookPackageView, renderActivePackagesView } from '../views/PackageViews.js';

// 6. ACTION BUTTON HANDLERS FOR THE STEPS
export function nextStep(currentStep) {
    window.nextStep = nextStep;
    if (currentStep === 1) {
        if (!state.booking.service) {
            showNotification(state.language === 'ms' ? 'Sila pilih perkhidmatan rawatan untuk meneruskan.' : (state.language === 'zh' ? '请先选择诊疗服务以继续。' : 'Please select a clinical service first to proceed.'), 'warning');
            return;
        }
        navigateTo('select-therapist');
    } else if (currentStep === 2) {
        if (!state.booking.therapist) {
            showNotification(state.language === 'ms' ? 'Sila pilih pengamal TCM untuk meneruskan.' : (state.language === 'zh' ? '请先选择中医师以继续。' : 'Please select a TCM physician first to proceed.'), 'warning');
            return;
        }
        navigateTo('select-time');
    } else if (currentStep === 3) {
        if (!state.booking.date || !state.booking.time) {
            showNotification(state.language === 'ms' ? 'Sila pilih tarikh dan masa untuk meneruskan.' : (state.language === 'zh' ? '请选择预约日期与时间以继续。' : 'Please select a date and time first to proceed.'), 'warning');
            return;
        }
        navigateTo('confirm-booking');
    }
};

export function prevStep(currentStep) {
    window.prevStep = prevStep;
    if (currentStep === 2) navigateTo('select-service');
    else if (currentStep === 3) navigateTo('select-therapist');
    else if (currentStep === 4) navigateTo('select-time');
};

export function confirmReservation() {
    window.confirmReservation = confirmReservation;
    const service = state.booking.service;
    if (!service) return;

    requireLogin(() => {
        const currency = currentTenant?.currency || 'SGD';
        const clinicAddress = currentTenant?.address || 'Yong Kang TCM Clinic, 54 Pagoda Street, Chinatown, Singapore 059213';

        // --- Package Session Mode: deduct 1 session, no payment needed ---
        if (state.packageBookingMode) {
            const bundleId = state.packageBookingMode;
            if ((state.activePackages[bundleId] || 0) <= 0) {
                showNotification(state.language === 'ms' ? 'Semua sesi pakej telah habis.' : (state.language === 'zh' ? '此配套的所有疗程次数已用罄。' : 'All sessions for this package have been used.'), 'error');
                return;
            }
            state.activePackages[bundleId]--;
            state.packageBookingMode = null; // clear mode after use

            const resId = 'RES-' + Math.floor(1000 + Math.random() * 9000);

            // Add to booking history
            state.bookings.unshift({
                id: 'booking-' + Date.now(),
                resId: resId,
                serviceName: service.name,
                serviceType: service.type,
                date: state.booking.date || new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' }),
                time: state.booking.time || '11:00 AM',
                therapist: state.booking.therapist ? state.booking.therapist.name : 'Physician Chen Wei Lin',
                location: clinicAddress,
                price: 0,
                status: 'Upcoming'
            });

            // Add notification
            state.notifications.unshift({
                id: 'notif-' + Date.now(),
                date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
                text: state.language === 'ms'
                    ? `Janji Temu Disahkan: Sesi pakej anda untuk ${getServiceTranslation(service.id, 'name', service.name)} telah ditempah.`
                    : (state.language === 'zh'
                        ? `预约已确认: 您的 ${getServiceTranslation(service.id, 'name', service.name)} 疗程配套时段已预约。`
                        : `Appointment Confirmed: Your package session for ${service.name} has been booked.`)
            });

            state.successResId = resId;

            showNotification(state.language === 'ms' ? 'Sesi berjaya ditempah! 1 sesi ditolak dari pakej anda.' : (state.language === 'zh' ? '时段预约成功！已扣除1次配套疗程。' : 'Session successfully booked! 1 session deducted from your package.'), 'success');
            navigateTo('success');
            return;
        }

        // --- Standard Booking ---
        const subtotal = service.price;
        const tax = 0; // Medical / clinical consultation exempt or 0%
        const total = subtotal + tax;
        const depositAmount = total * 0.5;
        const balanceDue = total * 0.5;

        if (selectedPaymentMethod === 'wallet') {
            if (state.walletBalance < depositAmount) {
                const errorMsg = state.language === 'ms'
                    ? `Baki dompet tidak mencukupi untuk deposit 50% (${currency} ${depositAmount.toFixed(2)}). Mengarah ke Tambah Nilai...`
                    : (state.language === 'zh'
                        ? `钱包余额不足以支付50%订金 (${currency} ${depositAmount.toFixed(2)})。正在跳转至充值...`
                        : `Insufficient wallet balance for 50% deposit (${currency} ${depositAmount.toFixed(2)}). Redirecting to Top Up...`);
                showNotification(errorMsg, 'error');
                setTimeout(() => {
                    navigateTo('topup');
                }, 1500);
                return;
            }
            state.walletBalance -= depositAmount;

            // Add wallet transaction log
            state.transactions.unshift({
                date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
                description: state.language === 'ms' ? `Deposit 50%: ${getServiceTranslation(service.id, 'name', service.name)}` : (state.language === 'zh' ? `50% 订金: ${getServiceTranslation(service.id, 'name', service.name)}` : `50% Deposit: ${service.name}`),
                amount: -depositAmount,
                status: 'Completed'
            });
        }

        // Earn Loyalty Points (10 pts per 10 currency spent on deposit)
        const earnedPoints = Math.max(10, Math.floor(depositAmount / 10) * 10);
        state.loyaltyPoints = (state.loyaltyPoints || 350) + earnedPoints;

        const resId = 'RES-' + Math.floor(1000 + Math.random() * 9000);

        // Add to booking history
        state.bookings.unshift({
            id: 'booking-' + Date.now(),
            resId: resId,
            serviceName: service.name,
            serviceType: service.type,
            date: state.booking.date || new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' }),
            time: state.booking.time || '11:00 AM',
            therapist: state.booking.therapist ? state.booking.therapist.name : 'Physician Chen Wei Lin',
            location: clinicAddress,
            price: total,
            depositPaid: depositAmount,
            balanceDue: balanceDue,
            status: 'Upcoming'
        });

        // Add notification
        state.notifications.unshift({
            id: 'notif-' + Date.now(),
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
            text: state.language === 'ms'
                ? `Janji Temu Disahkan: Deposit 50% (${currency} ${depositAmount.toFixed(2)}) dibayar. +${earnedPoints} Mata Ganjaran ditambah!`
                : (state.language === 'zh'
                    ? `预约已确认: 已支付50%订金 (${currency} ${depositAmount.toFixed(2)})。获得 +${earnedPoints} 积分！`
                    : `Appointment Confirmed: 50% deposit (${currency} ${depositAmount.toFixed(2)}) paid. +${earnedPoints} Loyalty Points earned!`)
        });

        state.successResId = resId;
        navigateTo('success');

        showNotification(state.language === 'ms' ? 'Tempahan klinikal anda telah berjaya disimpan.' : (state.language === 'zh' ? '您的中医预约已成功记录。' : 'Your clinical reservation has been saved successfully.'), 'success');
    });
};

export function resetBookingFlow() {
    window.resetBookingFlow = resetBookingFlow;
    // Reset booking state
    state.booking = {
        service: null,
        therapist: null,
        date: null,
        time: null
    };
    resetSelectedDateObj();
    resetIsEditingGuest();
    navigateTo('home');
};

window.nextStep = nextStep;
window.prevStep = prevStep;
window.confirmReservation = confirmReservation;
window.resetBookingFlow = resetBookingFlow;

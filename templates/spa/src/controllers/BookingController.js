import { tenantId, currentTenant, currentBranch, DEFAULT_TENANTS } from '../models/Tenant.js';
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
import { supabaseService } from '../../../../js/services/supabase.service.js';

// 6. ACTION BUTTON HANDLERS FOR THE STEPS
export function nextStep(currentStep) {
    window.nextStep = nextStep;
    if (currentStep === 1) {
        if (!state.booking.service) {
            showNotification(state.language === 'ms' ? 'Sila pilih perkhidmatan terlebih dahulu untuk meneruskan.' : 'Please select a service first to proceed.', 'warning');
            return;
        }
        navigateTo('select-therapist');
    } else if (currentStep === 2) {
        if (!state.booking.therapist) {
            showNotification(state.language === 'ms' ? 'Sila pilih terapis terlebih dahulu untuk meneruskan.' : 'Please select a therapist first to proceed.', 'warning');
            return;
        }
        navigateTo('select-time');
    } else if (currentStep === 3) {
        if (!state.booking.date || !state.booking.time) {
            showNotification(state.language === 'ms' ? 'Sila pilih tarikh dan masa terlebih dahulu untuk meneruskan.' : 'Please select a date and time first to proceed.', 'warning');
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

    const curr = (currentBranch && currentBranch.currency) || 'SGD';
    const branchId = (currentBranch && currentBranch.id) || 'sg-orchard';
    const branchName = (currentBranch && currentBranch.name) || 'Serenity & Soul Sanctuary';
    const branchAddress = (currentBranch && currentBranch.address) || '290 Orchard Road, Paragon Medical #14-02, Singapore 238859';

    // Execution routine: supports both Registered Users and Guest Clients
    const executeBooking = () => {
        // --- Package Session Mode: deduct 1 session, no payment needed ---
        if (state.packageBookingMode) {
            const bundleId = state.packageBookingMode;
            if ((state.activePackages[bundleId] || 0) <= 0) {
                showNotification(state.language === 'ms' ? 'Semua sesi pakej telah habis.' : 'All sessions for this package have been used.', 'error');
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
                therapist: state.booking.therapist ? state.booking.therapist.name : 'Assigned Specialist',
                location: `${branchName}, ${branchAddress}`,
                price: 0,
                status: 'Upcoming'
            });

            // Add notification
            state.notifications.unshift({
                id: 'notif-' + Date.now(),
                date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
                text: state.language === 'ms'
                    ? `Janji Temu Disahkan: Sesi pakej anda untuk ${getServiceTranslation(service.id, 'name', service.name)} telah ditempah.`
                    : `Appointment Confirmed: Your package session for ${service.name} has been booked.`
            });

            state.successResId = resId;

            // Persist to Supabase in background
            supabaseService.createBooking({
                code: resId,
                patientName: state.user?.name || state.guestInfo?.name || 'Guest Client',
                patientPhone: state.user?.phone || state.guestInfo?.phone || null,
                patientEmail: state.user?.email || state.guestInfo?.email || null,
                branchId: branchId,
                branchName: branchName,
                branchAddress: branchAddress,
                serviceId: service.id,
                serviceName: service.name,
                practitionerId: state.booking.therapist?.id || null,
                practitionerName: state.booking.therapist?.name || 'Assigned Specialist',
                scheduleDate: state.booking.date || new Date().toISOString().slice(0, 10),
                schedule: state.booking.time || '11:00 AM',
                room: 'VIP Aromatherapy Suite',
                depositPaid: '0.00',
                paymentStatus: 'PACKAGE_SESSION',
                status: 'CONFIRMED',
                templateType: 'wellness'
            }).catch(e => console.warn('[Supabase Booking] Package session error:', e));

            showNotification(state.language === 'ms' ? 'Sesi berjaya ditempah! 1 sesi ditolak dari pakej anda.' : 'Session successfully booked! 1 session deducted from your package.', 'success');
            navigateTo('success');
            return;
        }

        // --- Standard Booking (Guest or User) ---
        const subtotal = service.price;
        const tax = subtotal * 0.07;
        const total = subtotal + tax;
        const depositAmount = total * 0.5;
        const balanceDue = total * 0.5;

        if (selectedPaymentMethod === 'wallet' && isLoggedIn()) {
            if (state.walletBalance < depositAmount) {
                const errorMsg = state.language === 'ms'
                    ? `Baki dompet tidak mencukupi untuk deposit 50% (${curr} ${depositAmount.toFixed(2)}). Mengarah ke Tambah Nilai...`
                    : `Insufficient wallet balance for 50% deposit (${curr} ${depositAmount.toFixed(2)}). Redirecting to Top Up...`;
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
                description: state.language === 'ms' ? `Deposit 50%: ${getServiceTranslation(service.id, 'name', service.name)}` : `50% Deposit: ${service.name}`,
                amount: -depositAmount,
                status: 'Completed'
            });
        }

        // Earn Loyalty Points (10 pts per 10 currency units)
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
            therapist: state.booking.therapist ? state.booking.therapist.name : 'Assigned Specialist',
            location: `${branchName}, ${branchAddress}`,
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
                ? `Janji Temu Disahkan: Deposit 50% (${curr} ${depositAmount.toFixed(2)}) dibayar. +${earnedPoints} Poin Kesetiaan ditambah!`
                : `Appointment Confirmed: 50% deposit (${curr} ${depositAmount.toFixed(2)}) paid. +${earnedPoints} Loyalty Points earned!`
        });

        state.successResId = resId;

        // Persist to Supabase Cloud Database & auto-generate queue ticket
        supabaseService.createBooking({
            code: resId,
            patientName: state.user?.name || state.guestInfo?.name || 'Guest Client',
            patientPhone: state.user?.phone || state.guestInfo?.phone || null,
            patientEmail: state.user?.email || state.guestInfo?.email || null,
            branchId: branchId,
            branchName: branchName,
            branchAddress: branchAddress,
            serviceId: service.id,
            serviceName: service.name,
            practitionerId: state.booking.therapist?.id || null,
            practitionerName: state.booking.therapist?.name || 'Assigned Specialist',
            scheduleDate: state.booking.date || new Date().toISOString().slice(0, 10),
            schedule: state.booking.time || '11:00 AM',
            room: 'VIP Aromatherapy Suite',
            depositPaid: depositAmount.toFixed(2),
            paymentStatus: 'DEPOSIT_PAID',
            status: 'CONFIRMED',
            templateType: 'wellness'
        }).catch(err => {
            console.warn('[BookingController] Supabase live booking sync error:', err);
        });

        navigateTo('success');
        showNotification(state.language === 'ms' ? 'Tempahan anda telah berjaya disimpan.' : 'Your reservation has been saved successfully.', 'success');
    };

    // If package booking mode, check login only if required; otherwise support Guest seamlessly
    if (state.packageBookingMode && !isLoggedIn()) {
        requireLogin(executeBooking);
    } else {
        executeBooking();
    }
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

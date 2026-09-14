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
import { openPaymentMethodsModal, closePaymentMethodsModal } from '../views/PaymentModal.js';

// 8. RENDER: BOOK PACKAGE SESSION VIEW
export function renderBookPackageView() {
    const container = document.getElementById('book-package-container');
    if (!container) return;

    if (!state.pkgBooking) {
        container.innerHTML = `<p class="text-center py-12 text-on-surface-variant">No active package booking session initialized.</p>`;
        return;
    }

    const bundleId = state.pkgBooking.bundleId || 'radiance-bundle';
    const bundle = SERVICES[bundleId];
    if (!bundle) return;

    const sessionsLeft = state.activePackages[bundleId] || 0;
    const therapist = state.packageTherapists?.[bundleId]
        || THERAPISTS['stf-1']
        || THERAPISTS['no-preference']
        || { name: state.language === 'ms' ? 'Terapis Belum Dipilih' : 'Therapist Not Selected', role: 'Therapist', image: null };

    // Initial date if null
    if (!state.pkgBooking.date) {
        const defaultDate = new Date(); // Use actual current date!
        const options = { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' };
        state.pkgBooking.date = defaultDate.toLocaleDateString('en-US', options);
    }
    if (!state.pkgBooking.time) {
        state.pkgBooking.time = '11:00 AM';
    }

    // Parse selected date
    let selDate = new Date(state.pkgBooking.date);
    if (isNaN(selDate.getTime())) {
        selDate = new Date();
    }

    // Month to render
    const baseMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const renderMonth = new Date(baseMonth.getFullYear(), baseMonth.getMonth() + (state.pkgBooking.monthOffset || 0), 1);
    const monthText = renderMonth.toLocaleString('default', { month: 'long', year: 'numeric' });

    // Calendar Cells offset
    const startDayOfWeek = renderMonth.getDay();
    let calendarDaysHtml = '';
    for (let i = 0; i < startDayOfWeek; i++) {
        calendarDaysHtml += '<div></div>'; 
    }

    const year = renderMonth.getFullYear();
    const month = renderMonth.getMonth();
    const tempDate = new Date(year, month + 1, 0);
    const daysInMonth = tempDate.getDate();

    const today = new Date(); // Actual today
    today.setHours(0, 0, 0, 0);

    for (let day = 1; day <= daysInMonth; day++) {
        const cellDate = new Date(year, month, day);
        cellDate.setHours(0, 0, 0, 0);

        const isDisabled = cellDate < today;
        const isSelected = selDate.getDate() === day && selDate.getMonth() === month && selDate.getFullYear() === year;

        calendarDaysHtml += `
            <button ${isDisabled ? 'disabled' : ''} onclick="selectPackageDate(${day})" class="h-10 w-10 mx-auto rounded-full font-body-sm text-body-sm flex items-center justify-center transition-colors disabled:opacity-30 disabled:hover:bg-transparent ${isSelected ? 'bg-[#50613f] text-white shadow-md font-bold' : 'text-on-surface hover:bg-surface-container-high'}">
                ${day}
            </button>
        `;
    }

    // Time Slots
    const morningSlots = ['09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM'];
    const afternoonSlots = ['01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM', '06:00 PM'];

    let morningSlotsHtml = '';
    morningSlots.forEach(t => {
        const isSelected = state.pkgBooking.time === t;
        const isOccupied = t === '12:00 PM';
        morningSlotsHtml += `
            <button ${isOccupied ? 'disabled' : ''} onclick="selectPackageTime('${t}')" class="px-4 py-2 rounded-lg border font-body-sm text-xs transition-colors ${isSelected ? 'border-[#50613f] bg-[#50613f]/10 text-[#50613f] font-bold' : isOccupied ? 'border-outline-variant text-on-surface opacity-30 cursor-not-allowed bg-surface-container' : 'border-outline-variant text-on-surface hover:border-[#50613f] hover:bg-[#50613f]/5'}">
                ${t.replace(' AM', '').replace(' PM', '')}
            </button>
        `;
    });

    let afternoonSlotsHtml = '';
    afternoonSlots.forEach(t => {
        const isSelected = state.pkgBooking.time === t;
        const isOccupied = t === '03:00 PM';
        afternoonSlotsHtml += `
            <button ${isOccupied ? 'disabled' : ''} onclick="selectPackageTime('${t}')" class="px-4 py-2 rounded-lg border font-body-sm text-xs transition-colors ${isSelected ? 'border-[#50613f] bg-[#50613f]/10 text-[#50613f] font-bold' : isOccupied ? 'border-outline-variant text-on-surface opacity-30 cursor-not-allowed bg-surface-container' : 'border-outline-variant text-on-surface hover:border-[#50613f] hover:bg-[#50613f]/5'}">
                ${t.replace(' AM', '').replace(' PM', '')}
            </button>
        `;
    });

    container.innerHTML = `
        <div class="mb-8 text-center md:text-left">
            <h1 class="font-serif text-3xl text-[#1E293B] font-bold mb-1">Use Package Session</h1>
            <p class="font-body-sm text-xs text-on-surface-variant">Schedule a treatment session for your active package.</p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <!-- Left side: Calendar & Time Slots -->
            <div class="lg:col-span-8 space-y-6">
                <div class="glass-panel rounded-3xl p-6 md:p-8 bg-white shadow-sm border border-outline-variant/30">
                    <h2 class="font-title-md text-base text-[#50613f] mb-6 flex items-center gap-2 font-semibold">
                        <span class="material-symbols-outlined">calendar_month</span> Select Date &amp; Time
                    </h2>

                    <!-- Calendar Card -->
                    <div class="mb-8 border border-outline-variant/30 rounded-2xl p-4 bg-white/45">
                        <div class="flex justify-between items-center mb-6">
                            <button onclick="changePackageMonth(-1)" class="p-2 hover:bg-surface-container rounded-full text-on-surface-variant transition-colors">
                                <span class="material-symbols-outlined">chevron_left</span>
                            </button>
                            <span class="font-title-md text-base font-semibold text-[#1E293B]">${monthText}</span>
                            <button onclick="changePackageMonth(1)" class="p-2 hover:bg-surface-container rounded-full text-on-surface-variant transition-colors">
                                <span class="material-symbols-outlined">chevron_right</span>
                            </button>
                        </div>
                        <div class="grid grid-cols-7 gap-2 text-center mb-2">
                            <div class="font-label-caps text-[10px] text-outline uppercase font-semibold">Sun</div>
                            <div class="font-label-caps text-[10px] text-outline uppercase font-semibold">Mon</div>
                            <div class="font-label-caps text-[10px] text-outline uppercase font-semibold">Tue</div>
                            <div class="font-label-caps text-[10px] text-outline uppercase font-semibold">Wed</div>
                            <div class="font-label-caps text-[10px] text-outline uppercase font-semibold">Thu</div>
                            <div class="font-label-caps text-[10px] text-outline uppercase font-semibold">Fri</div>
                            <div class="font-label-caps text-[10px] text-outline uppercase font-semibold">Sat</div>
                        </div>
                        <div class="grid grid-cols-7 gap-2 text-center">
                            ${calendarDaysHtml}
                        </div>
                    </div>

                    <!-- Time Slots Card -->
                    <div class="border-t border-outline-variant/30 pt-6">
                        <div class="space-y-6">
                            <div>
                                <h3 class="font-title-md text-xs font-bold text-on-surface-variant mb-3 uppercase tracking-wider">${state.language === 'ms' ? 'Pagi' : 'Morning'} (09:00 - 12:00)</h3>
                                <div class="flex flex-wrap gap-3">
                                    ${morningSlotsHtml}
                                </div>
                            </div>
                            <div>
                                <h3 class="font-title-md text-xs font-bold text-on-surface-variant mb-3 uppercase tracking-wider">${state.language === 'ms' ? 'Petang' : 'Afternoon'} (13:00 - 18:00)</h3>
                                <div class="flex flex-wrap gap-3">
                                    ${afternoonSlotsHtml}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Right side: Sidebar Summary -->
            <div class="lg:col-span-4">
                <div class="glass-panel rounded-3xl p-6 md:p-8 bg-white border border-outline-variant/30 shadow-sm space-y-6 sticky top-8 flex flex-col justify-between">
                    <div>
                        <h2 class="font-serif text-lg text-[#1E293B] font-bold border-b border-outline-variant/20 pb-4 mb-6">Booking Summary</h2>
                        <div class="flex flex-col gap-5">
                            <!-- Service Info -->
                            <div class="flex gap-3 items-start">
                                <div class="w-10 h-10 rounded-lg bg-[#50613f]/10 flex items-center justify-center shrink-0 text-primary">
                                    <span class="material-symbols-outlined text-lg">spa</span>
                                </div>
                                <div>
                                    <span class="font-label-caps text-[9px] text-outline mb-0.5 block uppercase font-bold tracking-wider">SERVICE</span>
                                    <h3 class="font-title-md text-xs font-semibold text-[#1E293B]">${bundle.name}</h3>
                                    <p class="font-body-sm text-[11px] text-on-surface-variant">Remaining: ${sessionsLeft} Session(s)</p>
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
                                    <span class="font-label-caps text-[9px] text-outline mb-0.5 block uppercase font-bold tracking-wider">THERAPIST</span>
                                    <h3 class="font-title-md text-xs font-semibold text-[#1E293B]">${therapist?.name || (state.language === 'ms' ? 'Terapis Belum Dipilih' : 'Therapist Not Selected')}</h3>
                                    <p class="font-body-sm text-[11px] text-on-surface-variant">${therapist?.role || 'Therapist'}</p>
                                </div>
                            </div>
                            
                            <!-- Schedule Info -->
                            <div class="flex gap-3 items-start">
                                <div class="w-10 h-10 rounded-lg bg-[#50613f]/10 flex items-center justify-center shrink-0 text-primary">
                                    <span class="material-symbols-outlined text-lg">calendar_month</span>
                                </div>
                                <div>
                                    <span class="font-label-caps text-[9px] text-outline mb-0.5 block uppercase font-bold tracking-wider">DATE & TIME</span>
                                    ${state.pkgBooking.date ? `
                                        <h3 class="font-title-md text-xs font-semibold text-[#1E293B]">${state.pkgBooking.date}</h3>
                                        <p class="font-body-sm text-[11px] text-[#50613f] font-bold">${state.pkgBooking.time || 'To be selected'}</p>
                                    ` : `
                                        <h3 class="font-title-md text-xs font-semibold text-on-surface-variant"><span class="italic text-on-surface-variant opacity-60 text-xs">To be selected</span></h3>
                                    `}
                                </div>
                            </div>

                        </div>
                    </div>

                    <!-- Payment Details (Prepaid Package) -->
                    <div class="border-t border-outline-variant/20 pt-4 space-y-4">
                        <div class="space-y-2 text-xs">
                            <div class="flex justify-between text-on-surface-variant">
                                <span>Subtotal</span>
                                <span>MYR 0.00</span>
                            </div>
                            <div class="flex justify-between text-on-surface-variant">
                                <span>Tax (7%)</span>
                                <span>MYR 0.00</span>
                            </div>
                            <div class="border-t border-outline-variant/10 pt-3 flex justify-between items-center">
                                <span class="font-bold text-[#1E293B]">Estimated Total</span>
                                <span class="font-serif text-lg font-bold text-[#1E293B]">MYR 0.00</span>
                            </div>
                        </div>

                        <!-- Confirm Actions -->
                        <div class="pt-2">
                            <button onclick="confirmPackageBooking()" class="w-full bg-[#50613f] hover:bg-[#3e4b30] text-white font-bold text-xs py-3 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2">
                                Confirm Session Booking <span class="material-symbols-outlined text-sm">check_circle</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}
window.renderBookPackageView = renderBookPackageView;

export function selectPackageDate(day) {
    window.selectPackageDate = selectPackageDate;
    const baseMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const renderMonth = new Date(baseMonth.getFullYear(), baseMonth.getMonth() + (state.pkgBooking.monthOffset || 0), day);
    const options = { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' };
    state.pkgBooking.date = renderMonth.toLocaleDateString('en-US', options);

    saveState();
    renderBookPackageView();
};

export function selectPackageTime(time) {
    window.selectPackageTime = selectPackageTime;
    state.pkgBooking.time = time;
    saveState();
    renderBookPackageView();
};

export function changePackageMonth(offset) {
    window.changePackageMonth = changePackageMonth;
    const targetOffset = (state.pkgBooking.monthOffset || 0) + offset;
    if (targetOffset < 0) {
        showNotification(state.language === 'ms' ? 'Tidak boleh memilih bulan yang lepas.' : 'Cannot select past months.', 'info');
        return;
    }
    state.pkgBooking.monthOffset = targetOffset;
    saveState();
    renderBookPackageView();
};

export function cancelPackageBookingFlow() {
    window.cancelPackageBookingFlow = cancelPackageBookingFlow;
    state.pkgBooking = null;
    saveState();
    navigateTo('home');
};

export function confirmPackageBooking() {
    window.confirmPackageBooking = confirmPackageBooking;
    const bundleId = state.pkgBooking.bundleId;
    const bundle = SERVICES[bundleId];
    if (!bundle) return;

    if ((state.activePackages[bundleId] || 0) <= 0) {
        showNotification(state.language === 'ms' ? 'Semua sesi pakej telah habis.' : 'All package sessions have been used.', 'error');
        return;
    }

    // Deduct session
    state.activePackages[bundleId]--;
    const therapist = state.packageTherapists?.[bundleId]
        || THERAPISTS['stf-1']
        || THERAPISTS['no-preference']
        || { name: state.language === 'ms' ? 'Terapis Belum Dipilih' : 'Therapist Not Selected', role: 'Therapist', image: null };
    const resId = 'RES-' + Math.floor(1000 + Math.random() * 9000);

    // Record booking history
    state.bookings.unshift({
        id: 'booking-' + Date.now(),
        resId: resId,
        serviceName: bundle.name,
        serviceType: bundle.type,
        date: state.pkgBooking.date,
        time: state.pkgBooking.time,
        therapist: therapist?.name || (state.language === 'ms' ? 'Terapis Belum Dipilih' : 'Therapist Not Selected'),
        location: 'Serenity & Soul Sanctuary, 12 Orchard Road, Singapore 238886',
        price: 0,
        status: 'Upcoming'
    });

    // Record notification
    state.notifications.unshift({
        id: 'notif-' + Date.now(),
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
        text: state.language === 'ms'
            ? `Sesi Pakej Ditempah: Sesi pakej anda untuk ${getServiceTranslation(bundle.id, 'name', bundle.name)} dijadualkan pada ${state.pkgBooking.date} pada jam ${state.pkgBooking.time}.`
            : `Package Session Booked: Your package session for ${bundle.name} is scheduled on ${state.pkgBooking.date} at ${state.pkgBooking.time}.`
    });

    // Populate state.booking so renderSuccessView renders it perfectly
    state.booking.service = {
        name: bundle.name,
        duration: '60 Mins',
        price: 0
    };
    state.booking.therapist = therapist;
    state.booking.date = state.pkgBooking.date;
    state.booking.time = state.pkgBooking.time;
    state.successResId = resId;

    // Reset flow states
    state.pkgBooking = null;
    saveState();
    
    // Update view widget
    renderActivePackagesWidget();
    
    // Go to success view!
    navigateTo('success');
    showNotification(state.language === 'ms' ? 'Sesi pakej berjaya dijadualkan!' : 'Package session successfully scheduled!', 'success');
};

// 8.1 RENDER: ALL ACTIVE PACKAGES CATALOG VIEW
export function renderActivePackagesView() {
    const container = document.getElementById('all-active-packages-container');
    if (!container) return;

    const pkgKeys = Object.keys(state.activePackages);
    if (pkgKeys.length === 0) {
        container.innerHTML = `
            <div class="col-span-full text-center py-16 bg-white rounded-3xl border border-outline-variant/30 p-8 shadow-sm">
                <span class="material-symbols-outlined text-4xl text-on-surface-variant/40 mb-3">package_2</span>
                <p class="text-sm font-semibold text-on-surface-variant">You have no active packages.</p>
                <p class="text-xs text-on-surface-variant/70 mt-1">Purchase a package from the services tab to start booking sessions.</p>
            </div>
        `;
        return;
    }

    const iconMap = { packages: 'package_2', massage: 'spa', facial: 'face', body: 'self_care', signature: 'star' };
    
    let html = '';
    pkgKeys.forEach(bundleId => {
        const bundle = SERVICES[bundleId];
        if (!bundle) return;
        const sessionsLeft = state.activePackages[bundleId];
        const totalSessions = state.packageTotalSessions[bundleId] || bundle.sessions || 10;
        const pct = Math.round((sessionsLeft / totalSessions) * 100);
        const isActive = sessionsLeft > 0;
        const statusBadge = isActive
            ? `<span class="bg-[#e8f5e9] text-[#2e7d32] text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">Active</span>`
            : `<span class="bg-[#FEE2E2] text-[#B91C1C] text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">Exhausted</span>`;
        const icon = iconMap[bundle.type] || 'spa';

        html += `
            <div class="bg-white rounded-3xl p-6 border border-outline-variant/30 relative flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-300 min-h-[260px]">
                <div>
                    <div class="flex justify-between items-center mb-4">
                        <div class="w-10 h-10 rounded-lg bg-[#50613f]/10 flex items-center justify-center text-[#50613f]">
                            <span class="material-symbols-outlined text-lg">${icon}</span>
                        </div>
                        ${statusBadge}
                    </div>
                    <h3 class="font-serif text-base font-bold text-[#3c4c2b] mb-1 line-clamp-1">${bundle.name}</h3>
                    <p class="text-[11px] text-slate-500 line-clamp-2 leading-relaxed mb-4">${bundle.description}</p>
                    
                    <div class="mb-4">
                        <div class="flex justify-between text-[10px] font-semibold text-slate-600 mb-1">
                            <span>Sessions Remaining</span>
                            <span>${sessionsLeft} / ${totalSessions}</span>
                        </div>
                        <div class="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div class="h-full bg-[#50613f] transition-all duration-500" style="width: ${pct}%"></div>
                        </div>
                    </div>
                </div>
                <div>
                    ${isActive ? `
                        <button onclick="bookPackageSession('${bundleId}')" class="w-full bg-[#FACC15] text-[#241a00] hover:bg-[#eab308] font-bold text-xs py-2.5 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2">
                            <span class="material-symbols-outlined text-sm">calendar_month</span> Book a Session
                        </button>
                    ` : `
                        <button disabled class="w-full bg-slate-100 text-slate-400 font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-2 cursor-not-allowed">
                            <span class="material-symbols-outlined text-sm">check_circle</span> All Sessions Used
                        </button>
                    `}
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}
window.renderActivePackagesView = renderActivePackagesView;

// 8.2 DIALOG/MODAL: QR CODE TICKET MANAGER
export function openQrTicketModal(bookingId) {
    window.openQrTicketModal = openQrTicketModal;
    const modal = document.getElementById('modal-qr-ticket');
    const content = document.getElementById('qr-ticket-modal-content');
    if (!modal || !content) return;

    const booking = state.bookings.find(b => b.id === bookingId);
    if (!booking) return;

    const resId = booking.resId || 'RES-2209';
    const duration = booking.serviceName.includes('Bundle') ? '60 Mins' : '90 Mins';

    content.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-12 gap-8 text-left p-2">
            <!-- Left Side Details -->
            <div class="md:col-span-7 space-y-5">
                <div class="flex items-center gap-3 pb-4 border-b border-outline-variant/30">
                    <div>
                        <span class="font-label-caps text-[9px] text-outline uppercase font-bold tracking-wider mb-0.5 block">RESERVATION ID</span>
                        <span class="font-title-md text-base font-bold text-[#1E293B]">#${resId}</span>
                    </div>
                    <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e8f5e9] text-[#2e7d32] text-[10px] font-semibold border border-[#a3cfbb]">
                        <span class="w-1.5 h-1.5 rounded-full bg-[#2e7d32]"></span> Confirmed
                    </span>
                </div>
                
                <div>
                    <span class="font-label-caps text-[9px] text-outline uppercase font-bold tracking-wider mb-0.5 block">SERVICE</span>
                    <h3 class="font-title-md text-sm font-bold text-[#1E293B]">${booking.serviceName}</h3>
                    <p class="font-body-sm text-xs text-on-surface-variant">${duration}</p>
                </div>
                
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <span class="font-label-caps text-[9px] text-outline uppercase font-bold tracking-wider mb-0.5 block">THERAPIST</span>
                        <div class="flex items-center gap-2 mt-1">
                            <div class="w-6 h-6 rounded-full bg-surface-container flex items-center justify-center">
                                <span class="material-symbols-outlined text-sm text-[#50613f]">spa</span>
                            </div>
                            <span class="font-title-md text-xs font-semibold text-[#1E293B]">${booking.therapist}</span>
                        </div>
                    </div>
                    <div>
                        <span class="font-label-caps text-[9px] text-outline uppercase font-bold tracking-wider mb-0.5 block">DATE & TIME</span>
                        <span class="font-title-md text-xs font-semibold text-[#1E293B] block mt-1">${booking.date}</span>
                        <p class="font-body-sm text-xs text-[#50613f] font-bold">${booking.time}</p>
                    </div>
                </div>
                

            </div>
            
            <!-- Right Side Actions & QR -->
            <div class="md:col-span-5 flex flex-col justify-center">
                <div class="flex flex-col items-center gap-4 bg-white/45 p-6 rounded-xl border border-outline-variant/30 w-full max-w-[240px] mx-auto md:ml-auto">
                    <div class="w-32 h-32 bg-[#1E293B] rounded-lg p-2 flex items-center justify-center shrink-0">
                        <svg class="w-full h-full text-white" viewBox="0 0 100 100" fill="currentColor">
                            <rect x="0" y="0" width="25" height="25"/>
                            <rect x="5" y="5" width="15" height="15" fill="#1E293B"/>
                            <rect x="8" y="8" width="9" height="9" fill="white"/>
                            <rect x="75" y="0" width="25" height="25"/>
                            <rect x="80" y="5" width="15" height="15" fill="#1E293B"/>
                            <rect x="83" y="8" width="9" height="9" fill="white"/>
                            <rect x="0" y="75" width="25" height="25"/>
                            <rect x="5" y="80" width="15" height="15" fill="#1E293B"/>
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

    modal.classList.remove('hidden');
    modal.offsetHeight;
    modal.classList.remove('opacity-0');
};

export function closeQrTicketModal() {
    window.closeQrTicketModal = closeQrTicketModal;
    const modal = document.getElementById('modal-qr-ticket');
    if (!modal) return;

    modal.classList.add('opacity-0');
    setTimeout(() => {
        modal.classList.add('hidden');
    }, 300);
};

window.selectPackageDate = selectPackageDate;
window.selectPackageTime = selectPackageTime;
window.changePackageMonth = changePackageMonth;
window.cancelPackageBookingFlow = cancelPackageBookingFlow;
window.confirmPackageBooking = confirmPackageBooking;
window.openQrTicketModal = openQrTicketModal;
window.closeQrTicketModal = closeQrTicketModal;

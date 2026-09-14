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

    const currency = currentTenant?.currency || 'SGD';
    const bundleId = state.pkgBooking.bundleId || 'tcm-pain-relief-bundle';
    const bundle = SERVICES[bundleId];
    if (!bundle) return;

    const sessionsLeft = state.activePackages[bundleId] || 0;
    const therapist = state.packageTherapists?.[bundleId]
        || THERAPISTS['stf-1']
        || THERAPISTS['no-preference']
        || { name: state.language === 'ms' ? 'Pengamal Belum Dipilih' : (state.language === 'zh' ? '未选择执业医师' : 'Physician Not Selected'), role: 'TCM Physician', image: null };

    // Initial date if null
    if (!state.pkgBooking.date) {
        const defaultDate = new Date();
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

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let day = 1; day <= daysInMonth; day++) {
        const cellDate = new Date(year, month, day);
        cellDate.setHours(0, 0, 0, 0);

        const isDisabled = cellDate < today;
        const isSelected = selDate.getDate() === day && selDate.getMonth() === month && selDate.getFullYear() === year;

        calendarDaysHtml += `
            <button ${isDisabled ? 'disabled' : ''} onclick="selectPackageDate(${day})" class="h-10 w-10 mx-auto rounded-full font-body-sm text-body-sm flex items-center justify-center transition-colors disabled:opacity-30 disabled:hover:bg-transparent ${isSelected ? 'bg-[#164e3f] text-white shadow-md font-bold' : 'text-on-surface hover:bg-surface-container-high'}">
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
            <button ${isOccupied ? 'disabled' : ''} onclick="selectPackageTime('${t}')" class="px-4 py-2 rounded-lg border font-body-sm text-xs transition-colors ${isSelected ? 'border-[#164e3f] bg-[#164e3f]/10 text-[#164e3f] font-bold' : isOccupied ? 'border-outline-variant text-on-surface opacity-30 cursor-not-allowed bg-surface-container' : 'border-outline-variant text-on-surface hover:border-[#164e3f] hover:bg-[#164e3f]/5'}">
                ${t.replace(' AM', '').replace(' PM', '')}
            </button>
        `;
    });

    let afternoonSlotsHtml = '';
    afternoonSlots.forEach(t => {
        const isSelected = state.pkgBooking.time === t;
        const isOccupied = t === '03:00 PM';
        afternoonSlotsHtml += `
            <button ${isOccupied ? 'disabled' : ''} onclick="selectPackageTime('${t}')" class="px-4 py-2 rounded-lg border font-body-sm text-xs transition-colors ${isSelected ? 'border-[#164e3f] bg-[#164e3f]/10 text-[#164e3f] font-bold' : isOccupied ? 'border-outline-variant text-on-surface opacity-30 cursor-not-allowed bg-surface-container' : 'border-outline-variant text-on-surface hover:border-[#164e3f] hover:bg-[#164e3f]/5'}">
                ${t.replace(' AM', '').replace(' PM', '')}
            </button>
        `;
    });

    const practitionerLabel = state.language === 'ms' ? 'PENGAMAL TCM' : (state.language === 'zh' ? '中医师' : 'TCM PHYSICIAN');
    const practitionerNotSelected = state.language === 'ms' ? 'Pengamal Belum Dipilih' : (state.language === 'zh' ? '未选择执业医师' : 'Physician Not Selected');

    container.innerHTML = `
        <div class="mb-8 text-center md:text-left">
            <h1 class="font-serif text-3xl text-[#164e3f] font-bold mb-1">${state.language === 'ms' ? 'Gunakan Sesi Pakej' : (state.language === 'zh' ? '预约疗程配套' : 'Use Package Session')}</h1>
            <p class="font-body-sm text-xs text-on-surface-variant">${state.language === 'ms' ? 'Jadualkan sesi rawatan untuk pakej aktif anda.' : (state.language === 'zh' ? '为您的有效配套预约单次理疗时段。' : 'Schedule a clinical session for your active TCM package.')}</p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <!-- Left side: Calendar & Time Slots -->
            <div class="lg:col-span-8 space-y-6">
                <div class="tcm-card rounded-3xl p-6 md:p-8 bg-white shadow-sm border border-[#164e3f]/15">
                    <h2 class="font-title-md text-base text-[#164e3f] mb-6 flex items-center gap-2 font-semibold font-serif">
                        <span class="material-symbols-outlined">calendar_month</span> ${state.language === 'ms' ? 'Pilih Tarikh & Masa' : (state.language === 'zh' ? '选择日期与时间' : 'Select Date & Time')}
                    </h2>

                    <!-- Calendar Card -->
                    <div class="mb-8 border border-[#164e3f]/15 rounded-2xl p-4 bg-[#faf7f2]/60">
                        <div class="flex justify-between items-center mb-6">
                            <button onclick="changePackageMonth(-1)" class="p-2 hover:bg-surface-container rounded-full text-on-surface-variant transition-colors">
                                <span class="material-symbols-outlined">chevron_left</span>
                            </button>
                            <span class="font-title-md text-base font-semibold text-[#164e3f]">${monthText}</span>
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
                    <div class="border-t border-[#164e3f]/15 pt-6">
                        <div class="space-y-6">
                            <div>
                                <h3 class="font-title-md text-xs font-bold text-on-surface-variant mb-3 uppercase tracking-wider">${state.language === 'ms' ? 'Pagi' : (state.language === 'zh' ? '上午' : 'Morning')} (09:00 - 12:00)</h3>
                                <div class="flex flex-wrap gap-3">
                                    ${morningSlotsHtml}
                                </div>
                            </div>
                            <div>
                                <h3 class="font-title-md text-xs font-bold text-on-surface-variant mb-3 uppercase tracking-wider">${state.language === 'ms' ? 'Petang' : (state.language === 'zh' ? '下午' : 'Afternoon')} (13:00 - 18:00)</h3>
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
                <div class="tcm-card rounded-3xl p-6 md:p-8 bg-white border border-[#164e3f]/15 shadow-sm space-y-6 sticky top-8 flex flex-col justify-between">
                    <div>
                        <h2 class="font-serif text-lg text-[#164e3f] font-bold border-b border-[#164e3f]/15 pb-4 mb-6">${state.language === 'ms' ? 'Ringkasan Tempahan' : (state.language === 'zh' ? '预约摘要' : 'Booking Summary')}</h2>
                        <div class="flex flex-col gap-5">
                            <!-- Service Info -->
                            <div class="flex gap-3 items-start">
                                <div class="w-10 h-10 rounded-lg bg-[#164e3f]/10 flex items-center justify-center shrink-0 text-[#164e3f]">
                                    <span class="material-symbols-outlined text-lg">medical_services</span>
                                </div>
                                <div>
                                    <span class="font-label-caps text-[9px] text-outline mb-0.5 block uppercase font-bold tracking-wider">${state.language === 'ms' ? 'RAWATAN' : (state.language === 'zh' ? '理疗项目' : 'SERVICE')}</span>
                                    <h3 class="font-title-md text-xs font-semibold text-[#164e3f]">${bundle.name}</h3>
                                    <p class="font-body-sm text-[11px] text-on-surface-variant">${state.language === 'ms' ? 'Baki Sesi' : (state.language === 'zh' ? '剩余次数' : 'Remaining')}: ${sessionsLeft} ${state.language === 'ms' ? 'Sesi' : (state.language === 'zh' ? '次' : 'Session(s)')}</p>
                                </div>
                            </div>
                            
                            <!-- Practitioner Info -->
                            <div class="flex gap-3 items-start">
                                <div class="w-10 h-10 rounded-full bg-[#164e3f]/10 flex items-center justify-center shrink-0 overflow-hidden">
                                    ${therapist && therapist.image ? `
                                        <img class="w-full h-full object-cover" src="${therapist.image}">
                                    ` : `
                                        <div class="w-10 h-10 rounded-lg bg-[#164e3f]/10 flex items-center justify-center text-[#164e3f] shrink-0">
                                            <span class="material-symbols-outlined text-lg">person</span>
                                        </div>
                                    `}
                                </div>
                                <div>
                                    <span class="font-label-caps text-[9px] text-outline mb-0.5 block uppercase font-bold tracking-wider">${practitionerLabel}</span>
                                    <h3 class="font-title-md text-xs font-semibold text-[#164e3f]">${therapist?.name || practitionerNotSelected}</h3>
                                    <p class="font-body-sm text-[11px] text-on-surface-variant">${therapist?.role || 'TCM Physician'}</p>
                                </div>
                            </div>
                            
                            <!-- Schedule Info -->
                            <div class="flex gap-3 items-start">
                                <div class="w-10 h-10 rounded-lg bg-[#164e3f]/10 flex items-center justify-center shrink-0 text-[#164e3f]">
                                    <span class="material-symbols-outlined text-lg">calendar_month</span>
                                </div>
                                <div>
                                    <span class="font-label-caps text-[9px] text-outline mb-0.5 block uppercase font-bold tracking-wider">${state.language === 'ms' ? 'TARIKH & MASA' : (state.language === 'zh' ? '日期与时间' : 'DATE & TIME')}</span>
                                    ${state.pkgBooking.date ? `
                                        <h3 class="font-title-md text-xs font-semibold text-[#164e3f]">${state.pkgBooking.date}</h3>
                                        <p class="font-body-sm text-[11px] text-[#164e3f] font-bold">${state.pkgBooking.time || 'To be selected'}</p>
                                    ` : `
                                        <h3 class="font-title-md text-xs font-semibold text-on-surface-variant"><span class="italic text-on-surface-variant opacity-60 text-xs">To be selected</span></h3>
                                    `}
                                </div>
                            </div>

                        </div>
                    </div>

                    <!-- Payment Details (Prepaid Package) -->
                    <div class="border-t border-[#164e3f]/15 pt-4 space-y-4">
                        <div class="space-y-2 text-xs">
                            <div class="flex justify-between text-on-surface-variant">
                                <span>${state.language === 'ms' ? 'Jumlah Kecil' : (state.language === 'zh' ? '小计' : 'Subtotal')}</span>
                                <span>${currency} 0.00</span>
                            </div>
                            <div class="flex justify-between text-on-surface-variant">
                                <span>${state.language === 'ms' ? 'Cukai (0%)' : (state.language === 'zh' ? '税费 (0%)' : 'Tax (0%)')}</span>
                                <span>${currency} 0.00</span>
                            </div>
                            <div class="border-t border-[#164e3f]/15 pt-3 flex justify-between items-center">
                                <span class="font-bold text-[#164e3f]">${state.language === 'ms' ? 'Jumlah Anggaran' : (state.language === 'zh' ? '应付总额' : 'Estimated Total')}</span>
                                <span class="font-serif text-lg font-bold text-[#164e3f]">${currency} 0.00</span>
                            </div>
                        </div>

                        <!-- Confirm Actions -->
                        <div class="pt-2">
                            <button onclick="confirmPackageBooking()" class="w-full btn-tcm-primary text-white font-bold text-xs py-3 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2">
                                ${state.language === 'ms' ? 'Sahkan Tempahan Sesi' : (state.language === 'zh' ? '确认预约此疗程' : 'Confirm Session Booking')} <span class="material-symbols-outlined text-sm">check_circle</span>
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
        showNotification(state.language === 'ms' ? 'Tidak boleh memilih bulan yang lepas.' : (state.language === 'zh' ? '无法选择已过去的月份。' : 'Cannot select past months.'), 'info');
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
        showNotification(state.language === 'ms' ? 'Semua sesi pakej telah habis.' : (state.language === 'zh' ? '配套次数已用罄。' : 'All package sessions have been used.'), 'error');
        return;
    }

    // Deduct session
    state.activePackages[bundleId]--;
    const therapist = state.packageTherapists?.[bundleId]
        || THERAPISTS['stf-1']
        || THERAPISTS['no-preference']
        || { name: state.language === 'ms' ? 'Pengamal Belum Dipilih' : (state.language === 'zh' ? '未选择执业医师' : 'Physician Not Selected'), role: 'TCM Physician', image: null };
    const resId = 'RES-' + Math.floor(1000 + Math.random() * 9000);

    // Record booking history
    state.bookings.unshift({
        id: 'booking-' + Date.now(),
        resId: resId,
        serviceName: bundle.name,
        serviceType: bundle.type,
        date: state.pkgBooking.date,
        time: state.pkgBooking.time,
        therapist: therapist?.name || (state.language === 'ms' ? 'Pengamal Belum Dipilih' : (state.language === 'zh' ? '未选择执业医师' : 'Physician Not Selected')),
        location: currentTenant?.address || 'Yong Kang TCM Clinic, 54 Pagoda Street, Chinatown, Singapore 059213',
        price: 0,
        status: 'Upcoming'
    });

    // Record notification
    state.notifications.unshift({
        id: 'notif-' + Date.now(),
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
        text: state.language === 'ms'
            ? `Sesi Pakej Ditempah: Sesi pakej anda untuk ${getServiceTranslation(bundle.id, 'name', bundle.name)} dijadualkan pada ${state.pkgBooking.date} pada jam ${state.pkgBooking.time}.`
            : (state.language === 'zh'
                ? `已预约疗程配套: 您预约的 ${getServiceTranslation(bundle.id, 'name', bundle.name)} 已安排在 ${state.pkgBooking.date} ${state.pkgBooking.time}。`
                : `Package Session Booked: Your package session for ${bundle.name} is scheduled on ${state.pkgBooking.date} at ${state.pkgBooking.time}.`)
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
    showNotification(state.language === 'ms' ? 'Sesi pakej berjaya dijadualkan!' : (state.language === 'zh' ? '疗程配套预约成功！' : 'Package session successfully scheduled!'), 'success');
};

// 8.1 RENDER: ALL ACTIVE PACKAGES CATALOG VIEW
export function renderActivePackagesView() {
    const container = document.getElementById('all-active-packages-container');
    if (!container) return;

    const pkgKeys = Object.keys(state.activePackages);
    if (pkgKeys.length === 0) {
        container.innerHTML = `
            <div class="col-span-full text-center py-16 bg-white rounded-3xl border border-[#164e3f]/15 p-8 shadow-sm">
                <span class="material-symbols-outlined text-4xl text-[#164e3f]/40 mb-3">package_2</span>
                <p class="text-sm font-semibold text-on-surface-variant">${state.language === 'ms' ? 'Anda tidak mempunyai pakej aktif.' : (state.language === 'zh' ? '您当前没有有效的疗程配套。' : 'You have no active packages.')}</p>
                <p class="text-xs text-on-surface-variant/70 mt-1">${state.language === 'ms' ? 'Langgan pakej dari tab rawatan untuk mula menempah sesi.' : (state.language === 'zh' ? '从服务疗程中购买配套，即可开始预约诊疗。' : 'Purchase a package from the services tab to start booking sessions.')}</p>
            </div>
        `;
        return;
    }

    const iconMap = { packages: 'package_2', acupuncture: 'healing', tuina: 'accessibility_new', consultation: 'vital_signs', therapeutic: 'local_fire_department' };
    
    let html = '';
    pkgKeys.forEach(bundleId => {
        const bundle = SERVICES[bundleId];
        if (!bundle) return;
        const sessionsLeft = state.activePackages[bundleId];
        const totalSessions = state.packageTotalSessions[bundleId] || bundle.sessions || 10;
        const pct = Math.round((sessionsLeft / totalSessions) * 100);
        const isActive = sessionsLeft > 0;
        const statusBadge = isActive
            ? `<span class="bg-[#164e3f]/10 text-[#164e3f] text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">${state.language === 'ms' ? 'Aktif' : (state.language === 'zh' ? '有效' : 'Active')}</span>`
            : `<span class="bg-[#b93826]/10 text-[#b93826] text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">${state.language === 'ms' ? 'Habis' : (state.language === 'zh' ? '已用罄' : 'Exhausted')}</span>`;
        const icon = iconMap[bundle.type] || 'healing';

        html += `
            <div class="tcm-card bg-white rounded-3xl p-6 border border-[#164e3f]/15 relative flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-300 min-h-[260px]">
                <div>
                    <div class="flex justify-between items-center mb-4">
                        <div class="w-10 h-10 rounded-lg bg-[#164e3f]/10 flex items-center justify-center text-[#164e3f]">
                            <span class="material-symbols-outlined text-lg">${icon}</span>
                        </div>
                        ${statusBadge}
                    </div>
                    <h3 class="font-serif text-base font-bold text-[#164e3f] mb-1 line-clamp-1">${bundle.name}</h3>
                    <p class="text-[11px] text-slate-500 line-clamp-2 leading-relaxed mb-4">${bundle.description}</p>
                    
                    <div class="mb-4">
                        <div class="flex justify-between text-[10px] font-semibold text-slate-600 mb-1">
                            <span>${state.language === 'ms' ? 'Baki Sesi Rawatan' : (state.language === 'zh' ? '剩余调理次数' : 'Sessions Remaining')}</span>
                            <span>${sessionsLeft} / ${totalSessions}</span>
                        </div>
                        <div class="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div class="h-full bg-[#164e3f] transition-all duration-500" style="width: ${pct}%"></div>
                        </div>
                    </div>
                </div>
                <div>
                    ${isActive ? `
                        <button onclick="bookPackageSession('${bundleId}')" class="w-full btn-tcm-gold text-[#0f3d32] font-bold text-xs py-2.5 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2">
                            <span class="material-symbols-outlined text-sm">calendar_month</span> ${state.language === 'ms' ? 'Tempah Sesi' : (state.language === 'zh' ? '预约单次疗程' : 'Book a Session')}
                        </button>
                    ` : `
                        <button disabled class="w-full bg-slate-100 text-slate-400 font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-2 cursor-not-allowed">
                            <span class="material-symbols-outlined text-sm">check_circle</span> ${state.language === 'ms' ? 'Semua Sesi Digunakan' : (state.language === 'zh' ? '所有疗程已使用' : 'All Sessions Used')}
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
    const duration = booking.serviceName.includes('Bundle') || booking.serviceName.includes('Package') ? '60 Mins' : '60 Mins';

    content.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-12 gap-8 text-left p-2">
            <!-- Left Side Details -->
            <div class="md:col-span-7 space-y-5">
                <div class="flex items-center gap-3 pb-4 border-b border-[#164e3f]/15">
                    <div>
                        <span class="font-label-caps text-[9px] text-outline uppercase font-bold tracking-wider mb-0.5 block">${state.language === 'ms' ? 'ID TEMPAHAN' : (state.language === 'zh' ? '预约编号' : 'RESERVATION ID')}</span>
                        <span class="font-title-md text-base font-bold text-[#164e3f]">#${resId}</span>
                    </div>
                    <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#164e3f]/10 text-[#164e3f] text-[10px] font-semibold border border-[#164e3f]/25">
                        <span class="w-1.5 h-1.5 rounded-full bg-[#164e3f]"></span> ${state.language === 'ms' ? 'Disahkan' : (state.language === 'zh' ? '已确认' : 'Confirmed')}
                    </span>
                </div>
                
                <div>
                    <span class="font-label-caps text-[9px] text-outline uppercase font-bold tracking-wider mb-0.5 block">${state.language === 'ms' ? 'RAWATAN' : (state.language === 'zh' ? '理疗项目' : 'SERVICE')}</span>
                    <h3 class="font-title-md text-sm font-bold text-[#164e3f]">${booking.serviceName}</h3>
                    <p class="font-body-sm text-xs text-on-surface-variant">${duration}</p>
                </div>
                
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <span class="font-label-caps text-[9px] text-outline uppercase font-bold tracking-wider mb-0.5 block">${state.language === 'ms' ? 'PENGAMAL TCM' : (state.language === 'zh' ? '执业医师' : 'PRACTITIONER')}</span>
                        <div class="flex items-center gap-2 mt-1">
                            <div class="w-6 h-6 rounded-full bg-[#164e3f]/10 flex items-center justify-center">
                                <span class="material-symbols-outlined text-sm text-[#164e3f]">person</span>
                            </div>
                            <span class="font-title-md text-xs font-semibold text-[#164e3f]">${booking.therapist}</span>
                        </div>
                    </div>
                    <div>
                        <span class="font-label-caps text-[9px] text-outline uppercase font-bold tracking-wider mb-0.5 block">${state.language === 'ms' ? 'TARIKH & MASA' : (state.language === 'zh' ? '日期与时间' : 'DATE & TIME')}</span>
                        <span class="font-title-md text-xs font-semibold text-[#164e3f] block mt-1">${booking.date}</span>
                        <p class="font-body-sm text-xs text-[#164e3f] font-bold">${booking.time}</p>
                    </div>
                </div>
                
                <div>
                    <span class="font-label-caps text-[9px] text-outline uppercase font-bold tracking-wider mb-0.5 block">${state.language === 'ms' ? 'LOKASI KLINIK' : (state.language === 'zh' ? '诊所地点' : 'CLINIC LOCATION')}</span>
                    <p class="font-body-sm text-xs text-on-surface-variant mt-0.5">${booking.location || (currentTenant?.address || 'Yong Kang TCM Clinic, 54 Pagoda Street, Chinatown, Singapore 059213')}</p>
                </div>
            </div>
            
            <!-- Right Side Actions & QR -->
            <div class="md:col-span-5 flex flex-col justify-center">
                <div class="flex flex-col items-center gap-4 bg-[#faf7f2] p-6 rounded-xl border border-[#164e3f]/20 w-full max-w-[240px] mx-auto md:ml-auto shadow-inner">
                    <div class="w-32 h-32 bg-[#0f3d32] rounded-lg p-2 flex items-center justify-center shrink-0 shadow">
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
                    <span class="font-body-sm text-[10px] text-[#164e3f] font-medium text-center">${state.language === 'ms' ? 'Imbas di kaunter klinik semasa tiba' : (state.language === 'zh' ? '到店后请在诊所前台扫码核销' : 'Scan at clinic reception upon arrival')}</span>
                    
                    <button class="w-full py-2 btn-tcm-gold text-[#0f3d32] font-semibold text-[11px] rounded-lg flex items-center justify-center gap-1.5 transition-all">
                        <span class="material-symbols-outlined text-xs">calendar_today</span> ${state.language === 'ms' ? 'Tambah ke Kalendar' : (state.language === 'zh' ? '添加到日历' : 'Add to Calendar')}
                    </button>
                    
                    <button class="w-full py-2 bg-transparent border border-[#164e3f]/40 text-[#164e3f] hover:bg-[#164e3f]/5 font-semibold text-[11px] rounded-lg flex items-center justify-center gap-1.5 transition-all">
                        <span class="material-symbols-outlined text-xs">download</span> ${state.language === 'ms' ? 'Muat Turun Tiket' : (state.language === 'zh' ? '下载凭证' : 'Download Ticket')}
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

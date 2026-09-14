import { tenantId, currentTenant, DEFAULT_TENANTS } from '../models/Tenant.js';
import { SERVICES, THERAPISTS, getSharedData, syncServices, syncTherapists } from '../models/Database.js';
import { TRANSLATIONS, t, getServiceTranslation, translateStaticHtml, toggleLanguage } from '../models/Translations.js';
import { DEFAULT_STATE, state, loadState, saveState } from '../models/State.js';
import { isLoggedIn, updateNavbarAuth, userSignOut } from '../controllers/AuthController.js';
import { navigateTo, updateTenantLinks, updateNavbarActiveState, updateStepperUI, navigateToAllServicesWithFilter } from '../controllers/Router.js';
import { renderActiveViewContents, updateHeaderWalletDisplay, renderHomeView, renderServicesCatalogView, renderSelectServiceView, renderSelectTherapistView, renderSelectTimeView, renderConfirmBookingView, renderActivePackagesWidget, renderPaymentMethodSelection, startBookingWithService } from '../views/Renderers.js';
import { renderSidebarSummary, renderSuccessView } from '../views/SidebarSummary.js';
import { resetBookingFlow, nextStep, prevStep } from '../controllers/BookingController.js';
import { showNotification } from '../views/Toast.js';
import { renderAllServicesView } from '../views/CatalogViews.js';
import { openPaymentMethodsModal, closePaymentMethodsModal } from '../views/PaymentModal.js';
import { renderBookPackageView, renderActivePackagesView } from '../views/PackageViews.js';

// 8. PROFILE, WALLET, & TOPUP VIEWS
export function renderProfileView() {
    const container = document.getElementById('profile-container');
    if (!container) return;

    const upcoming = state.bookings.filter(b => b.status === 'Upcoming');
    let nextAppHtml = '';
    if (upcoming.length > 0) {
        upcoming.sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            if (isNaN(dateA) || isNaN(dateB)) return 0;
            return dateA - dateB;
        });
        const nextApp = upcoming[0];
        nextAppHtml = `
            <!-- Next Appointment Card -->
            <div class="bg-[#F1F5F9]/60 rounded-3xl p-6 border border-outline-variant/30 shadow-sm">
                <div class="flex justify-between items-center mb-4">
                    <span class="font-label-caps text-[9px] text-[#B45309] font-bold uppercase tracking-wider">${t('next_appointment_title')}</span>
                    <span class="material-symbols-outlined text-on-surface-variant text-lg">schedule</span>
                </div>
                <h3 class="font-serif text-sm font-bold text-[#1E293B] mb-1">${nextApp.serviceName}</h3>
                <p class="font-body-sm text-[11px] text-on-surface-variant mb-4">${nextApp.date} • ${nextApp.time}</p>
                <button onclick="rescheduleBooking('${nextApp.id}')" class="text-[#B45309] hover:text-[#92400e] font-bold text-[11px] transition-colors">
                    ${t('btn_reschedule')}
                </button>
            </div>
        `;
    } else {
        nextAppHtml = `
            <!-- Next Appointment Card -->
            <div class="bg-[#F1F5F9]/60 rounded-3xl p-6 border border-outline-variant/30 shadow-sm flex flex-col justify-between min-h-[160px]">
                <div class="flex justify-between items-center mb-2">
                    <span class="font-label-caps text-[9px] text-slate-400 font-bold uppercase tracking-wider">${t('next_appointment_title')}</span>
                    <span class="material-symbols-outlined text-slate-400 text-lg">schedule</span>
                </div>
                <div class="text-center py-4 flex-grow flex flex-col justify-center">
                    <p class="text-xs text-on-surface-variant font-medium">${t('no_upcoming_appts')}</p>
                    <p class="text-[10px] text-on-surface-variant/70 mt-0.5">${t('appt_book_today')}</p>
                </div>
                <button onclick="navigateTo('select-service')" class="text-[#B45309] hover:text-[#92400e] font-bold text-[11px] transition-colors text-left mt-2">
                    ${t('btn_book_now_arrow')}
                </button>
            </div>
        `;
    }

    container.innerHTML = `
        <div class="max-w-container-max mx-auto py-8">
            <!-- Welcome Banner Card -->
            <div class="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-outline-variant/30 flex flex-col md:flex-row items-center gap-6 mb-8">
                <div class="relative shrink-0">
                    <img class="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border-4 border-[#50613f]/10" src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&h=300&q=80" alt="${state.guestInfo.name}">
                    <button onclick="navigateTo('personal-details')" class="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#B45309] text-white flex items-center justify-center border-2 border-white hover:bg-[#92400e] transition-colors shadow-sm">
                        <span class="material-symbols-outlined text-sm font-bold">edit</span>
                    </button>
                </div>
                <div class="text-center md:text-left">
                    <span class="font-label-caps text-[10px] md:text-xs text-[#B45309] uppercase tracking-wider font-semibold block mb-1">${t('welcome_back')}</span>
                    <h1 class="font-serif text-3xl md:text-4xl text-[#1E293B] font-bold mb-2">${state.guestInfo.name}</h1>
                    <p class="font-body-sm text-xs md:text-sm text-on-surface-variant max-w-xl leading-relaxed">${state.language === 'ms' ? 'Tempat ketenangan anda menanti. Hari ini adalah hari yang sempurna untuk mencari keseimbangan dalaman dan memulihkan semangat anda.' : 'Your sanctuary awaits. Today is a perfect day to find your inner balance and restore your spirit.'}</p>
                </div>
            </div>
            
            <!-- Two Columns -->
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <!-- Left Column (Active Packages & Digital Wallet) -->
                <div class="lg:col-span-8 space-y-8">
                    <!-- My Active Packages -->
                    <div class="glass-panel rounded-3xl p-6 md:p-8">
                        <div class="flex justify-between items-center mb-6">
                            <h2 class="font-serif text-xl md:text-2xl text-[#1E293B] font-bold">${state.language === 'ms' ? 'Pakej Aktif Saya' : 'My Active Packages'}</h2>
                            <button onclick="navigateTo('active-packages')" class="text-[#B45309] hover:text-[#92400e] font-semibold text-xs flex items-center gap-1 transition-colors">
                                ${state.language === 'ms' ? 'Lihat Semua' : 'View All'} <span class="material-symbols-outlined text-xs">arrow_forward</span>
                            </button>
                        </div>
                        
                        <!-- Packages Grid (Dynamic from state.activePackages) -->
                        <div class="flex overflow-x-auto md:grid md:grid-cols-2 gap-6 pb-3 md:pb-0 hide-scrollbar scroll-smooth" id="profile-packages-grid">
                            ${(function () {
            const pkgKeys = Object.keys(state.activePackages);
            if (pkgKeys.length === 0) {
                return `<p class="text-sm text-on-surface-variant col-span-2 text-center py-6">${state.language === 'ms' ? 'Anda tidak mempunyai pakej aktif. Beli pakej untuk bermula.' : 'You have no active packages. Purchase a package to get started.'}</p>`;
            }
            const iconMap = { packages: 'package_2', massage: 'spa', facial: 'face', body: 'self_care', signature: 'star' };
            return pkgKeys.map(bundleId => {
                const bundle = SERVICES[bundleId];
                if (!bundle) return '';
                const sessionsLeft = state.activePackages[bundleId];
                const totalSessions = state.packageTotalSessions[bundleId] || bundle.sessions || 10;
                const pct = Math.round((sessionsLeft / totalSessions) * 100);
                const therapist = state.packageTherapists[bundleId];
                const isActive = sessionsLeft > 0;
                const statusBadge = isActive
                    ? `<span class="bg-[#e8f5e9] text-[#2e7d32] text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">${state.language === 'ms' ? 'Aktif' : 'Active'}</span>`
                    : `<span class="bg-[#FEE2E2] text-[#B91C1C] text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">${state.language === 'ms' ? 'Habis' : 'Exhausted'}</span>`;
                const icon = iconMap[bundle.type] || 'spa';
                return `
                                        <div class="flex-shrink-0 w-[85vw] sm:w-[320px] md:w-auto bg-white rounded-2xl p-5 border border-outline-variant/30 relative flex flex-col justify-between shadow-sm">
                                            <div>
                                                <div class="flex justify-between items-center mb-4">
                                                    <div class="w-10 h-10 rounded-lg bg-[#50613f]/10 flex items-center justify-center text-primary">
                                                        <span class="material-symbols-outlined text-lg">${icon}</span>
                                                    </div>
                                                    ${statusBadge}
                                                </div>
                                                <h3 class="font-serif text-base text-[#1E293B] font-bold mb-1">${bundle.name}</h3>
                                                <p class="font-body-sm text-xs text-on-surface-variant mb-3 line-clamp-2">${bundle.description}</p>
                                                ${therapist ? `
                                                <div class="flex items-center gap-2 bg-[#f0f4e8] rounded-lg px-3 py-2 mb-3">
                                                    <span class="material-symbols-outlined text-[#50613f] text-sm">person</span>
                                                    <span class="text-[11px] font-semibold text-[#3c4c2b]">${state.language === 'ms' ? 'Terapis' : 'Therapist'}: ${therapist.name}</span>
                                                </div>` : ''}
                                            </div>
                                            <div>
                                                <div class="flex justify-between text-[11px] text-on-surface-variant font-semibold mb-1">
                                                    <span>${state.language === 'ms' ? 'Baki Sesi' : 'Sessions Remaining'}</span>
                                                    <span>${sessionsLeft} / ${totalSessions}</span>
                                                </div>
                                                <div class="w-full bg-[#F1F5F9] rounded-full h-1.5 mb-4 overflow-hidden">
                                                    <div class="bg-[#50613f] h-1.5 rounded-full transition-all" style="width: ${pct}%"></div>
                                                </div>
                                                ${isActive ? `
                                                <button onclick="bookPackageSession('${bundleId}')" class="w-full bg-[#FACC15] text-[#241a00] hover:bg-[#eab308] font-bold text-xs py-2.5 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2">
                                                    <span class="material-symbols-outlined text-sm">calendar_month</span> ${state.language === 'ms' ? 'Tempah Sesi' : 'Book a Session'}
                                                </button>` : `
                                                <button disabled class="w-full bg-slate-100 text-slate-400 font-bold text-xs py-2.5 rounded-xl cursor-not-allowed flex items-center justify-center gap-2">
                                                    <span class="material-symbols-outlined text-sm">block</span> ${state.language === 'ms' ? 'Semua Sesi Digunakan' : 'All Sessions Used'}
                                                </button>`}
                                            </div>
                                        </div>
                                    `;
            }).join('');
        })()}
                        </div>
                    </div>
                    
                    <!-- Digital Wallet Card -->
                    <div class="bg-white rounded-3xl overflow-hidden border border-outline-variant/30 grid grid-cols-1 md:grid-cols-2 shadow-sm">
                        <!-- Left Side -->
                        <div class="p-6 md:p-8 flex flex-col justify-between">
                            <div>
                                <span class="font-label-caps text-[10px] text-[#B45309] font-bold uppercase tracking-wider block mb-1">${state.language === 'ms' ? 'Dompet Digital' : 'Digital Wallet'}</span>
                                <span class="text-xs text-on-surface-variant block mb-2">${t('wallet_balance_title')}</span>
                                <span class="font-serif text-3xl text-[#1E293B] font-bold block mb-6">MYR ${state.walletBalance.toFixed(2)}</span>
                            </div>
                            <div class="flex gap-3">
                                <button onclick="navigateTo('wallet')" class="bg-[#50613f] text-white hover:bg-[#3e4b30] font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-2">
                                    <span class="material-symbols-outlined text-sm">account_balance_wallet</span> ${t('btn_manage_wallet')}
                                </button>
                                <button onclick="navigateTo('wallet')" class="bg-white border border-outline text-[#50613f] hover:bg-[#50613f]/5 font-bold text-xs px-4 py-2.5 rounded-xl transition-all flex items-center gap-1">
                                    ${t('btn_history')}
                                </button>
                            </div>
                        </div>
                        <!-- Right Side (Green Banner Perk) -->
                        <div class="bg-[#50613f] p-8 text-white relative overflow-hidden flex flex-col justify-center min-h-[160px]">
                            <div class="absolute -right-4 -bottom-6 text-white/5 pointer-events-none select-none">
                                <span class="material-symbols-outlined text-[180px]">account_balance_wallet</span>
                            </div>
                            <div class="relative z-10">
                                <span class="font-label-caps text-[10px] text-[#FACC15] font-bold uppercase tracking-wider block mb-2">${t('perk_title')}</span>
                                <h3 class="font-serif text-xl font-bold mb-1">${t('perk_desc')}</h3>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Right Column (Account Settings & Next Appointment) -->
                <div class="lg:col-span-4 space-y-6">
                    <!-- Account Settings Card -->
                    <div class="bg-white rounded-3xl p-6 shadow-sm border border-outline-variant/30">
                        <h2 class="font-serif text-lg text-[#1E293B] font-bold mb-4 px-2">${t('settings_title')}</h2>
                        
                        <div class="flex flex-col">
                            <a href="#" onclick="navigateTo('personal-details'); return false;" class="flex justify-between items-center py-3.5 px-2 hover:bg-[#50613f]/5 rounded-xl transition-colors group">
                                <div class="flex items-center gap-3">
                                    <span class="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors text-lg">person</span>
                                    <span class="font-body-md text-xs font-semibold text-on-surface">${t('setting_personal')}</span>
                                </div>
                                <span class="material-symbols-outlined text-on-surface-variant text-sm">chevron_right</span>
                            </a>
                            <a href="#" onclick="navigateTo('booking-history'); return false;" class="flex justify-between items-center py-3.5 px-2 hover:bg-[#50613f]/5 rounded-xl transition-colors group">
                                <div class="flex items-center gap-3">
                                    <span class="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors text-lg">history</span>
                                    <span class="font-body-md text-xs font-semibold text-on-surface">${t('setting_history')}</span>
                                </div>
                                <span class="material-symbols-outlined text-on-surface-variant text-sm">chevron_right</span>
                            </a>
                            <a href="#" onclick="navigateTo('notifications'); return false;" class="flex justify-between items-center py-3.5 px-2 hover:bg-[#50613f]/5 rounded-xl transition-colors group">
                                <div class="flex items-center gap-3">
                                    <span class="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors text-lg">notifications</span>
                                    <span class="font-body-md text-xs font-semibold text-on-surface">${t('setting_notifications')}</span>
                                </div>
                                <span class="material-symbols-outlined text-on-surface-variant text-sm">chevron_right</span>
                            </a>
                            <a href="#" onclick="navigateTo('privacy-security'); return false;" class="flex justify-between items-center py-3.5 px-2 hover:bg-[#50613f]/5 rounded-xl transition-colors group">
                                <div class="flex items-center gap-3">
                                    <span class="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors text-lg">shield</span>
                                    <span class="font-body-md text-xs font-semibold text-on-surface">${t('setting_privacy')}</span>
                                </div>
                                <span class="material-symbols-outlined text-on-surface-variant text-sm">chevron_right</span>
                            </a>
                        </div>
                        
                        <div class="border-t border-outline-variant/30 mt-4 pt-4 flex justify-center">
                            <button onclick="confirmSignOut()" class="text-red-500 hover:text-red-700 font-bold text-xs flex items-center gap-2 py-2 px-4 transition-colors">
                                <span class="material-symbols-outlined text-sm font-bold">logout</span> ${t('btn_sign_out')}
                            </button>
                        </div>
                    </div>
                    
                    <!-- Next Appointment Card -->
                    ${nextAppHtml}
                </div>
            </div>
        </div>
    `;
}

export function renderWalletView() {
    const container = document.getElementById('wallet-container');
    if (!container) return;

    let txHtml = '';
    state.transactions.forEach(tx => {
        const isPositive = tx.amount > 0;
        const amountText = (isPositive ? '+ ' : '- ') + 'MYR ' + Math.abs(tx.amount).toFixed(2);
        const amountClass = isPositive ? 'text-green-600 font-bold' : 'text-[#1E293B] font-semibold';

        let iconHtml = '';
        let translatedDesc = tx.description;
        if (tx.description.toLowerCase().includes('top up')) {
            iconHtml = `<div class="w-8 h-8 rounded-full bg-green-50 text-green-600 flex items-center justify-center shrink-0"><span class="material-symbols-outlined text-base">add</span></div>`;
            translatedDesc = state.language === 'ms' ? 'Tambah Nilai Dompet' : 'Wallet Top Up';
        } else if (tx.description.toLowerCase().includes('gift card')) {
            iconHtml = `<div class="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0"><span class="material-symbols-outlined text-base">card_giftcard</span></div>`;
            translatedDesc = tx.description;
        } else if (tx.description.toLowerCase().includes('facial')) {
            iconHtml = `<div class="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center shrink-0"><span class="material-symbols-outlined text-base">face</span></div>`;
            translatedDesc = state.language === 'ms' ? 'Bayaran Rawatan Muka Pilihan' : 'Signature Facial Payment';
        } else if (tx.description.toLowerCase().includes('massage')) {
            iconHtml = `<div class="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center shrink-0"><span class="material-symbols-outlined text-base">spa</span></div>`;
            translatedDesc = state.language === 'ms' ? 'Bayaran Urutan Tisu Mendalam' : 'Deep Tissue Massage Payment';
        } else {
            iconHtml = `<div class="w-8 h-8 rounded-full bg-amber-50 text-[#B45309] flex items-center justify-center shrink-0"><span class="material-symbols-outlined text-base">stars</span></div>`;
            translatedDesc = state.language === 'ms' ? 'Kredit Bonus Rujukan' : 'Referral Bonus Credit';
        }

        txHtml += `
            <tr class="border-b border-outline-variant/30 hover:bg-slate-50/50 transition-colors">
                <td class="py-4 text-xs font-semibold text-on-surface-variant whitespace-nowrap pr-4">${tx.date}</td>
                <td class="py-4 pr-4">
                    <div class="flex items-center gap-3">
                        ${iconHtml}
                        <span class="font-body-md text-xs font-bold text-[#1E293B] whitespace-nowrap">${translatedDesc}</span>
                    </div>
                </td>
                <td class="py-4 pr-4">
                    <span class="bg-green-50 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider whitespace-nowrap">${state.language === 'ms' ? 'Selesai' : 'Completed'}</span>
                </td>
                <td class="py-4 text-right ${amountClass} whitespace-nowrap">${amountText}</td>
            </tr>
        `;
    });

    const loyaltyPoints = state.loyaltyPoints || 350;

    container.innerHTML = `
        <div class="max-w-container-max mx-auto py-8">
            <!-- Header Title -->
            <div class="mb-8">
                <h1 class="font-serif text-3xl text-[#1E293B] font-bold mb-1">${t('wallet_header_title')}</h1>
                <p class="font-body-sm text-xs text-on-surface-variant">${t('wallet_header_subtitle')}</p>
            </div>
            
            <!-- Cards Grid (Left: Balance, Middle: Loyalty Points, Right: Quick Recharge) -->
            <div class="grid grid-cols-1 md:grid-cols-12 gap-6 mb-8">
                <!-- Available Balance Card -->
                <div class="md:col-span-5 bg-white rounded-3xl p-6 shadow-sm border border-outline-variant/30 flex flex-col justify-between gap-4">
                    <div>
                        <span class="font-label-caps text-[10px] text-outline font-bold uppercase tracking-wider block mb-1">${t('wallet_balance_title')}</span>
                        <span class="font-serif text-3xl text-[#1E293B] font-bold block mt-1">MYR ${state.walletBalance.toFixed(2)}</span>
                    </div>
                    <div class="flex flex-wrap gap-2.5">
                        <button onclick="navigateToTopUp(100)" class="flex-1 bg-[#50613f] text-white hover:bg-[#3e4b30] font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer">
                            <span class="material-symbols-outlined text-sm">add_circle</span> ${t('btn_topup')}
                        </button>
                        <button onclick="openSendGiftCardModal()" class="flex-1 bg-amber-600 text-white hover:bg-amber-700 font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer">
                            <span class="material-symbols-outlined text-sm">card_giftcard</span> ${state.language === 'ms' ? 'Kirim Gift Card' : 'Send Gift Card'}
                        </button>
                    </div>
                </div>

                <!-- Loyalty Rewards Points Card -->
                <div class="md:col-span-3 bg-gradient-to-br from-amber-500 to-amber-600 text-white rounded-3xl p-6 shadow-md flex flex-col justify-between relative overflow-hidden">
                    <div class="absolute -right-4 -bottom-4 opacity-15">
                        <span class="material-symbols-outlined text-8xl">stars</span>
                    </div>
                    <div>
                        <span class="text-[10px] font-bold uppercase tracking-wider text-amber-100 block mb-1">Serenity Rewards</span>
                        <h3 class="font-serif text-2xl font-bold flex items-center gap-1.5">
                            <span class="material-symbols-outlined text-xl">stars</span> ${loyaltyPoints} Pts
                        </h3>
                    </div>
                    <div>
                        <p class="text-[10px] text-amber-100 font-medium leading-tight my-2">
                            Earn 10 points for every MYR 10 spent on deposits.
                        </p>
                        <button onclick="openRedeemPointsModal()" class="w-full bg-white/20 hover:bg-white/30 backdrop-blur-md text-white font-bold text-xs py-2 rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer">
                            <span class="material-symbols-outlined text-sm">workspace_premium</span> Redeem Points
                        </button>
                    </div>
                </div>
                
                <!-- Quick Recharge Card -->
                <div class="md:col-span-4 bg-white rounded-3xl p-6 shadow-sm border border-outline-variant/30 flex flex-col justify-between">
                    <div>
                        <div class="flex items-center gap-2 mb-1">
                            <span class="material-symbols-outlined text-[#B45309] text-base">bolt</span>
                            <h2 class="font-serif text-base text-[#1E293B] font-bold">${t('quick_recharge_title')}</h2>
                        </div>
                    </div>
                    
                    <!-- Presets Grid -->
                    <div class="grid grid-cols-2 gap-2.5 mt-3">
                        <button onclick="navigateToTopUp(50)" class="bg-white hover:bg-slate-50 border border-outline-variant/60 rounded-xl p-2.5 flex flex-col items-center justify-center transition-all group hover:border-[#50613f] hover:text-[#50613f]">
                            <span class="font-serif text-xs font-bold text-[#1E293B]">MYR 50</span>
                        </button>
                        <button onclick="navigateToTopUp(100)" class="bg-white hover:bg-slate-50 border border-outline-variant/60 rounded-xl p-2.5 flex flex-col items-center justify-center transition-all group hover:border-[#50613f] hover:text-[#50613f] relative overflow-visible">
                            <span class="font-serif text-xs font-bold text-[#1E293B]">MYR 100</span>
                        </button>
                        <button onclick="navigateToTopUp(200)" class="bg-white hover:bg-slate-50 border border-outline-variant/60 rounded-xl p-2.5 flex flex-col items-center justify-center transition-all group hover:border-[#50613f] hover:text-[#50613f]">
                            <span class="font-serif text-xs font-bold text-[#1E293B]">MYR 200</span>
                        </button>
                        <button onclick="navigateToTopUp('custom')" class="bg-white hover:bg-slate-50 border border-outline-variant/60 rounded-xl p-2.5 flex flex-col items-center justify-center transition-all group hover:border-[#50613f] hover:text-[#50613f]">
                            <span class="font-serif text-xs font-bold text-[#1E293B] flex items-center gap-0.5">${state.language === 'ms' ? 'Kustom' : 'Custom'}</span>
                        </button>
                    </div>
                </div>
            </div>
            
            <!-- Recent Transactions Card -->
            <div class="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-outline-variant/30">
                <div class="flex justify-between items-center mb-6">
                    <div class="flex items-center gap-2">
                        <span class="material-symbols-outlined text-on-surface-variant text-lg">history</span>
                        <h2 class="font-serif text-lg text-[#1E293B] font-bold">${state.language === 'ms' ? 'Transaksi Terkini' : 'Recent Transactions'}</h2>
                    </div>
                    <a href="#" class="text-[#B45309] hover:text-[#92400e] font-semibold text-xs flex items-center gap-1 transition-colors">
                        ${state.language === 'ms' ? 'Lihat Semua' : 'View All'} <span class="material-symbols-outlined text-xs">arrow_forward</span>
                    </a>
                </div>
                
                <div class="overflow-x-auto hide-scrollbar">
                    <table class="w-full text-left border-collapse">
                        <thead>
                            <tr class="border-b border-outline-variant/60 text-outline text-[10px] uppercase font-bold tracking-wider whitespace-nowrap">
                                <th class="pb-3 pr-4">${state.language === 'ms' ? 'Tarikh' : 'Date'}</th>
                                <th class="pb-3 pr-4">${state.language === 'ms' ? 'Keterangan' : 'Description'}</th>
                                <th class="pb-3 pr-4">Status</th>
                                <th class="pb-3 text-right">${state.language === 'ms' ? 'Jumlah' : 'Amount'}</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${txHtml}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
}

export function renderTopupView() {
    const container = document.getElementById('topup-container');
    if (!container) return;

    state.topupPaymentMethod = state.topupPaymentMethod || 'card';
    state.selectedEWallet = state.selectedEWallet || 'tng';

    const currentBalance = (typeof state.walletBalance === 'number' && !isNaN(state.walletBalance)) ? state.walletBalance : 250.00;
    const selectedAmount = state.selectedTopUpAmount !== undefined ? state.selectedTopUpAmount : 100;
    const method = state.topupPaymentMethod;
    const ewallet = state.selectedEWallet;

    let displayAmount = selectedAmount === 'custom' ? (parseFloat(document.getElementById('custom-topup-input')?.value) || 150) : parseFloat(selectedAmount);

    let paymentFieldsHtml = '';

    if (method === 'card') {
        paymentFieldsHtml = `
            <div class="space-y-4">
                <div>
                    <label class="block text-[10px] font-bold text-outline uppercase tracking-wider mb-1">${state.language === 'ms' ? 'Nombor Kad' : 'Card Number'}</label>
                    <div class="relative">
                        <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">credit_card</span>
                        <input type="text" id="stripe-card-number" placeholder="4532 0000 0000 0000" value="4532 8890 1234 5678" class="w-full pl-11 pr-4 py-2.5 rounded-xl border border-outline-variant/60 focus:outline-none focus:border-primary text-xs font-semibold text-on-surface">
                    </div>
                </div>
                
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-[10px] font-bold text-outline uppercase tracking-wider mb-1">${state.language === 'ms' ? 'Tarikh Luput' : 'Expiry Date'}</label>
                        <input type="text" id="stripe-card-expiry" placeholder="MM/YY" value="12/28" class="w-full px-4 py-2.5 rounded-xl border border-outline-variant/60 focus:outline-none focus:border-primary text-xs font-semibold text-on-surface">
                    </div>
                    <div>
                        <label class="block text-[10px] font-bold text-outline uppercase tracking-wider mb-1">CVC</label>
                        <input type="text" id="stripe-card-cvc" placeholder="123" value="888" class="w-full px-4 py-2.5 rounded-xl border border-outline-variant/60 focus:outline-none focus:border-primary text-xs font-semibold text-on-surface">
                    </div>
                </div>
                
                <div>
                    <label class="block text-[10px] font-bold text-outline uppercase tracking-wider mb-1">${state.language === 'ms' ? 'Nama Pada Kad' : 'Name on Card'}</label>
                    <input type="text" id="stripe-card-name" placeholder="e.g. Jane Doe" value="${state.guestInfo.name}" class="w-full px-4 py-2.5 rounded-xl border border-outline-variant/60 focus:outline-none focus:border-primary text-xs font-semibold text-on-surface">
                </div>

                <button type="button" onclick="submitTopUpProcess('card')" class="w-full mt-6 bg-[#50613f] text-white hover:bg-[#3e4b30] font-bold text-xs py-3 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 hover:shadow-lg">
                    <span class="material-symbols-outlined text-sm">lock</span> ${state.language === 'ms' ? 'Bayar Melalui Kad' : 'Pay with Card'} (MYR ${displayAmount.toFixed(2)})
                </button>
            </div>
        `;
    } else if (method === 'qr') {
        paymentFieldsHtml = `
            <div class="text-center py-2">
                <div class="bg-gradient-to-br from-pink-500 via-rose-600 to-rose-700 text-white font-bold text-[11px] py-1.5 px-4 rounded-t-2xl tracking-wider uppercase flex items-center justify-center gap-1.5 shadow-sm">
                    <span class="material-symbols-outlined text-sm">qr_code_2</span> DuitNow QR / QRIS Instant Payment
                </div>
                
                <div class="bg-stone-50 border-x border-b border-stone-200 rounded-b-2xl p-6 flex flex-col items-center">
                    <div class="bg-white p-4 rounded-2xl shadow-md border border-stone-200 mb-3 relative group">
                        <img src="https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=DuitNow-Serenity-Soul-Spa-MYR-${displayAmount}" alt="DuitNow QR Code" class="w-44 h-44 rounded-lg object-contain">
                        <div class="absolute inset-0 bg-white/90 backdrop-blur-xs flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl">
                            <span class="material-symbols-outlined text-emerald-600 text-3xl mb-1">center_focus_strong</span>
                            <span class="text-[10px] font-bold text-stone-700">Imbas Menggunakan Aplikasi Bank</span>
                        </div>
                    </div>

                    <div class="inline-flex items-center gap-1.5 bg-amber-100 text-amber-900 px-3 py-1 rounded-full text-[11px] font-bold mb-3 border border-amber-300">
                        <span class="material-symbols-outlined text-xs">payments</span> Total: MYR ${displayAmount.toFixed(2)}
                    </div>

                    <p class="text-xs text-stone-600 font-medium max-w-xs leading-relaxed mb-4">
                        ${state.language === 'ms' 
                            ? 'Buka mana-mana aplikasi Bank (Maybank2u, CIMB, RHB) atau E-Wallet (Touch \'n Go, GrabPay, ShopeePay) lalu imbas kod QR di atas.' 
                            : 'Open any Banking App (Maybank2u, CIMB, RHB) or E-Wallet (Touch \'n Go, GrabPay, ShopeePay) and scan the QR code above.'}
                    </p>

                    <button type="button" onclick="submitTopUpProcess('qr')" class="w-full bg-[#50613f] text-white hover:bg-[#3e4b30] font-bold text-xs py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-2">
                        <span class="material-symbols-outlined text-sm">verified</span> ${state.language === 'ms' ? 'Simulasi Bayar QR' : 'Simulate QR Scan & Pay'} (MYR ${displayAmount.toFixed(2)})
                    </button>
                </div>
            </div>
        `;
    } else if (method === 'ewallet') {
        paymentFieldsHtml = `
            <div class="space-y-4">
                <div>
                    <label class="block text-[10px] font-bold text-outline uppercase tracking-wider mb-2">${state.language === 'ms' ? 'Pilih E-Wallet' : 'Choose E-Wallet Provider'}</label>
                    <div class="grid grid-cols-2 gap-3">
                        <button type="button" onclick="setEWalletBrand('tng')" class="flex items-center gap-3 p-3 rounded-xl border transition-all ${ewallet === 'tng' ? 'border-blue-600 bg-blue-50 text-blue-900 font-bold ring-1 ring-blue-600' : 'border-stone-200 bg-white text-stone-700 hover:border-stone-400'}">
                            <div class="w-8 h-8 rounded-lg bg-blue-600 text-white font-black text-xs flex items-center justify-center shrink-0">TnG</div>
                            <div class="text-left"><div class="text-xs font-bold">Touch 'n Go</div><div class="text-[9px] opacity-75">eWallet</div></div>
                        </button>
                        <button type="button" onclick="setEWalletBrand('grabpay')" class="flex items-center gap-3 p-3 rounded-xl border transition-all ${ewallet === 'grabpay' ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold ring-1 ring-emerald-600' : 'border-stone-200 bg-white text-stone-700 hover:border-stone-400'}">
                            <div class="w-8 h-8 rounded-lg bg-emerald-600 text-white font-black text-xs flex items-center justify-center shrink-0">Grab</div>
                            <div class="text-left"><div class="text-xs font-bold">GrabPay</div><div class="text-[9px] opacity-75">Instant Wallet</div></div>
                        </button>
                        <button type="button" onclick="setEWalletBrand('shopeepay')" class="flex items-center gap-3 p-3 rounded-xl border transition-all ${ewallet === 'shopeepay' ? 'border-orange-600 bg-orange-50 text-orange-900 font-bold ring-1 ring-orange-600' : 'border-stone-200 bg-white text-stone-700 hover:border-stone-400'}">
                            <div class="w-8 h-8 rounded-lg bg-orange-500 text-white font-black text-xs flex items-center justify-center shrink-0">Shopee</div>
                            <div class="text-left"><div class="text-xs font-bold">ShopeePay</div><div class="text-[9px] opacity-75">Coins Bonus</div></div>
                        </button>
                        <button type="button" onclick="setEWalletBrand('boost')" class="flex items-center gap-3 p-3 rounded-xl border transition-all ${ewallet === 'boost' ? 'border-red-600 bg-red-50 text-red-900 font-bold ring-1 ring-red-600' : 'border-stone-200 bg-white text-stone-700 hover:border-stone-400'}">
                            <div class="w-8 h-8 rounded-lg bg-red-600 text-white font-black text-xs flex items-center justify-center shrink-0">Boost</div>
                            <div class="text-left"><div class="text-xs font-bold">Boost eWallet</div><div class="text-[9px] opacity-75">Cashback</div></div>
                        </button>
                    </div>
                </div>

                <div>
                    <label class="block text-[10px] font-bold text-outline uppercase tracking-wider mb-1">${state.language === 'ms' ? 'Nombor Telefon E-Wallet' : 'E-Wallet Registered Phone Number'}</label>
                    <div class="relative">
                        <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">smartphone</span>
                        <input type="text" id="ewallet-phone-input" placeholder="+60 12-345 6789" value="+60 12-345 6789" class="w-full pl-11 pr-4 py-2.5 rounded-xl border border-outline-variant/60 focus:outline-none focus:border-primary text-xs font-semibold text-on-surface">
                    </div>
                </div>

                <button type="button" onclick="submitTopUpProcess('ewallet')" class="w-full mt-6 bg-[#50613f] text-white hover:bg-[#3e4b30] font-bold text-xs py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-2">
                    <span class="material-symbols-outlined text-sm">smartphone</span> ${state.language === 'ms' ? 'Bayar Melalui E-Wallet' : 'Pay via E-Wallet'} (MYR ${displayAmount.toFixed(2)})
                </button>
            </div>
        `;
    }

    container.innerHTML = `
        <div class="max-w-xl mx-auto py-8">
            <!-- Back to Wallet Link -->
            <button onclick="navigateTo('wallet')" class="flex items-center gap-1.5 text-xs font-semibold text-[#B45309] hover:underline mb-6">
                <span class="material-symbols-outlined text-sm font-bold">arrow_back</span> ${state.language === 'ms' ? 'Kembali ke Dompet' : 'Back to Wallet'}
            </button>
            
            <!-- Page Title & Subtitle -->
            <div class="text-center mb-8">
                <h1 class="font-serif text-3xl md:text-4xl text-[#1E293B] font-bold mb-2">${state.language === 'ms' ? 'Tambah Nilai Dompet Spa Anda' : 'Top-Up Your Sanctuary Wallet'}</h1>
                <p class="font-body-sm text-xs text-on-surface-variant max-w-md mx-auto leading-relaxed">${state.language === 'ms' ? 'Tambah dana dengan selamat menggunakan Kad Kredit, DuitNow QR, atau E-Wallet.' : 'Add funds securely using Credit Card, DuitNow QR, or E-Wallets.'}</p>
            </div>
            
            <!-- Current Balance Card -->
            <div class="bg-white rounded-3xl p-6 border border-outline-variant/30 shadow-sm text-center mb-6">
                <span class="font-label-caps text-[9px] text-[#B45309] font-bold uppercase tracking-wider block mb-1">${state.language === 'ms' ? 'Baki Semasa' : 'Current Balance'}</span>
                <div class="font-serif text-2xl text-[#1E293B] font-bold">
                    MYR <span class="font-serif text-3xl font-bold">${currentBalance.toFixed(2)}</span>
                </div>
            </div>
            
            <!-- Top Up Form Card -->
            <div class="bg-white rounded-3xl p-6 md:p-8 border border-outline-variant/30 shadow-sm">
                <!-- Select Amount Section -->
                <div class="mb-6">
                    <h3 class="font-serif text-sm font-bold text-[#1E293B] mb-3">${state.language === 'ms' ? 'Pilih Jumlah Top Up' : 'Select Top Up Amount'}</h3>
                    <div class="grid grid-cols-4 gap-3 mb-4">
                        <button type="button" onclick="selectTopUpAmount(50)" id="topup-amt-50" class="topup-amount-btn border rounded-xl py-3 font-semibold text-xs transition-all text-center">
                            MYR 50
                        </button>
                        <button type="button" onclick="selectTopUpAmount(100)" id="topup-amt-100" class="topup-amount-btn border rounded-xl py-3 font-semibold text-xs transition-all text-center">
                            MYR 100
                        </button>
                        <button type="button" onclick="selectTopUpAmount(200)" id="topup-amt-200" class="topup-amount-btn border rounded-xl py-3 font-semibold text-xs transition-all text-center">
                            MYR 200
                        </button>
                        <button type="button" onclick="selectTopUpAmount('custom')" id="topup-amt-custom" class="topup-amount-btn border rounded-xl py-3 font-semibold text-xs transition-all text-center">
                            ${state.language === 'ms' ? 'Lain-lain' : 'Custom'}
                        </button>
                    </div>
                    
                    <!-- Custom Amount Input Field -->
                    <div id="custom-amount-wrapper" class="${selectedAmount === 'custom' ? '' : 'hidden'}">
                        <label class="block text-[11px] font-bold text-outline uppercase tracking-wider mb-1">${state.language === 'ms' ? 'Jumlah Tersuai (MYR)' : 'Custom Amount (MYR)'}</label>
                        <div class="relative">
                            <span class="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-on-surface-variant">MYR</span>
                            <input type="number" id="custom-topup-input" value="150" min="10" step="5" oninput="renderTopupView()" class="w-full pl-12 pr-4 py-2.5 rounded-xl border border-outline-variant/60 focus:outline-none focus:border-primary text-xs font-semibold text-on-surface">
                        </div>
                    </div>
                </div>

                <!-- Payment Method Selector Tabs -->
                <div class="border-t border-outline-variant/30 pt-6 mb-6">
                    <h3 class="font-serif text-sm font-bold text-[#1E293B] mb-3">${state.language === 'ms' ? 'Pilih Kaedah Pembayaran' : 'Select Payment Method'}</h3>
                    <div class="grid grid-cols-3 gap-2">
                        <button type="button" onclick="setTopUpPaymentMethod('card')" class="flex flex-col items-center gap-1.5 p-3 rounded-2xl border text-xs font-bold transition-all ${method === 'card' ? 'bg-[#50613f] text-white border-[#50613f] shadow-md' : 'bg-stone-50 border-stone-200 text-stone-700 hover:border-stone-400'}">
                            <span class="material-symbols-outlined text-lg">credit_card</span>
                            <span class="text-[11px]">${state.language === 'ms' ? 'Kad Kredit / Debit' : 'Credit / Debit Card'}</span>
                        </button>
                        <button type="button" onclick="setTopUpPaymentMethod('qr')" class="flex flex-col items-center gap-1.5 p-3 rounded-2xl border text-xs font-bold transition-all ${method === 'qr' ? 'bg-[#50613f] text-white border-[#50613f] shadow-md' : 'bg-stone-50 border-stone-200 text-stone-700 hover:border-stone-400'}">
                            <span class="material-symbols-outlined text-lg">qr_code_scanner</span>
                            <span class="text-[11px]">${state.language === 'ms' ? 'Kod QR (DuitNow)' : 'QR Code (DuitNow)'}</span>
                        </button>
                        <button type="button" onclick="setTopUpPaymentMethod('ewallet')" class="flex flex-col items-center gap-1.5 p-3 rounded-2xl border text-xs font-bold transition-all ${method === 'ewallet' ? 'bg-[#50613f] text-white border-[#50613f] shadow-md' : 'bg-stone-50 border-stone-200 text-stone-700 hover:border-stone-400'}">
                            <span class="material-symbols-outlined text-lg">account_balance_wallet</span>
                            <span class="text-[11px]">${state.language === 'ms' ? 'E-Wallet Digital' : 'Digital E-Wallet'}</span>
                        </button>
                    </div>
                </div>
                
                <!-- Dynamic Payment Method Fields -->
                <div>
                    ${paymentFieldsHtml}
                </div>

                <!-- Security Note Footer -->
                <div class="flex items-center justify-center gap-1 mt-6 text-[10px] text-on-surface-variant font-semibold">
                    <span class="material-symbols-outlined text-[12px] text-emerald-600">verified_user</span>
                    <span>${state.language === 'ms' ? 'Pembayaran disulitkan dengan selamat (SSL 256-bit).' : 'Payments are securely encrypted via SSL 256-bit.'}</span>
                </div>
            </div>
        </div>
    `;

    selectTopUpAmount(selectedAmount);
}

export function setTopUpPaymentMethod(method) {
    window.setTopUpPaymentMethod = setTopUpPaymentMethod;
    state.topupPaymentMethod = method;
    renderTopupView();
};

export function setEWalletBrand(brand) {
    window.setEWalletBrand = setEWalletBrand;
    state.selectedEWallet = brand;
    renderTopupView();
};

export function selectTopUpAmount(amount) {
    state.selectedTopUpAmount = amount;

    document.querySelectorAll('.topup-amount-btn').forEach(btn => {
        btn.classList.remove('bg-[#50613f]', 'border-[#50613f]', 'text-white', 'font-bold');
        btn.classList.add('bg-stone-50', 'border-stone-200', 'text-stone-700');
    });

    const activeBtn = document.getElementById(`topup-amt-${amount}`);
    if (activeBtn) {
        activeBtn.classList.remove('bg-stone-50', 'border-stone-200', 'text-stone-700');
        activeBtn.classList.add('bg-[#50613f]', 'border-[#50613f]', 'text-white', 'font-bold');
    }

    const wrapper = document.getElementById('custom-amount-wrapper');
    if (wrapper) {
        if (amount === 'custom') {
            wrapper.classList.remove('hidden');
        } else {
            wrapper.classList.add('hidden');
        }
    }
}
window.selectTopUpAmount = selectTopUpAmount;

export function navigateToTopUp(amount) {
    window.navigateToTopUp = navigateToTopUp;
    state.selectedTopUpAmount = amount || 100;
    navigateTo('topup');
};

export function submitTopUpProcess(method) {
    window.submitTopUpProcess = submitTopUpProcess;
    let amount = 0;
    if (state.selectedTopUpAmount === 'custom') {
        const customVal = parseFloat(document.getElementById('custom-topup-input')?.value);
        if (isNaN(customVal) || customVal <= 0) {
            showNotification(state.language === 'ms' ? 'Sila masukkan jumlah yang sah.' : 'Please enter a valid amount.', 'error');
            return;
        }
        amount = customVal;
    } else {
        amount = parseFloat(state.selectedTopUpAmount || 100);
    }

    if (method === 'card') {
        const cardNum = document.getElementById('stripe-card-number')?.value.trim();
        if (!cardNum) {
            showNotification(state.language === 'ms' ? 'Sila masukkan nombor kad.' : 'Please enter card number.', 'error');
            return;
        }
    } else if (method === 'ewallet') {
        const phone = document.getElementById('ewallet-phone-input')?.value.trim();
        if (!phone) {
            showNotification(state.language === 'ms' ? 'Sila masukkan nombor telefon E-Wallet.' : 'Please enter E-Wallet registered phone number.', 'error');
            return;
        }
    }

    let bonusText = '';
    if (amount === 200) {
        state.walletBalance += 10.00;
        bonusText = state.language === 'ms' ? ' (+ Bonus MYR 10.00)' : ' (+ MYR 10.00 Bonus)';
    }

    state.walletBalance += amount;

    const methodLabels = {
        card: 'Credit/Debit Card',
        qr: 'DuitNow QR / QRIS',
        ewallet: `E-Wallet (${(state.selectedEWallet || 'TnG').toUpperCase()})`
    };

    const dateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
    state.transactions.unshift({
        date: dateStr,
        description: `Wallet Top Up (${methodLabels[method] || 'Online'})`,
        amount: amount + (amount === 200 ? 10 : 0),
        status: 'Completed'
    });

    const msg = state.language === 'ms'
        ? `Berjaya menambah MYR ${amount.toFixed(2)}${bonusText} menggunakan ${methodLabels[method] || 'pembayaran online'}!`
        : `Successfully topped up MYR ${amount.toFixed(2)}${bonusText} via ${methodLabels[method] || 'online payment'}!`;

    updateHeaderWalletDisplay();
    showNotification(msg, 'success');
    navigateTo('wallet');
};

// --- SUB-VIEWS FOR ACCOUNT SETTINGS ---

// 1. PERSONAL DETAILS
export function renderPersonalDetailsView() {
    const container = document.getElementById('personal-details-container');
    if (!container) return;

    container.innerHTML = `
        <div class="max-w-2xl mx-auto">
            <!-- Header and Navigation -->
            <div class="flex items-center gap-3 mb-8">
                <button onclick="navigateTo('profile')" class="w-10 h-10 rounded-full bg-primary/5 hover:bg-primary/10 text-primary flex items-center justify-center transition-colors">
                    <span class="material-symbols-outlined">arrow_back</span>
                </button>
                <div>
                    <span class="font-label-caps text-[10px] text-[#B45309] font-bold uppercase tracking-wider block">${t('settings_title')}</span>
                    <h1 class="font-serif text-2xl md:text-3xl text-[#1E293B] font-bold">${t('setting_personal')}</h1>
                </div>
            </div>

            <!-- Card Form -->
            <div class="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-outline-variant/30">
                <form id="personal-details-form" onsubmit="savePersonalDetails(event)" class="space-y-6">
                    <!-- Avatar section -->
                    <div class="flex flex-col items-center sm:flex-row gap-6 pb-6 border-b border-outline-variant/30">
                        <div class="relative shrink-0">
                            <img class="w-20 h-20 rounded-full object-cover border-4 border-[#50613f]/10" src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&h=300&q=80" alt="${state.guestInfo.name}">
                            <div class="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-[#B45309] text-white flex items-center justify-center border border-white cursor-pointer hover:bg-[#92400e] transition-colors">
                                <span class="material-symbols-outlined text-[12px] font-bold">photo_camera</span>
                            </div>
                        </div>
                        <div class="text-center sm:text-left">
                            <h3 class="font-serif text-base text-[#1E293B] font-bold mb-1">${state.language === 'ms' ? 'Gambar Profil' : 'Profile Photo'}</h3>
                            <p class="font-body-sm text-[11px] text-on-surface-variant max-w-xs leading-relaxed">${state.language === 'ms' ? 'Kemaskinikan foto anda untuk memperibadikan pengalaman spa anda. JPG atau PNG, maks 2MB.' : 'Update your photo to personalize your spa experience. JPG or PNG, max 2MB.'}</p>
                        </div>
                    </div>

                    <!-- Fields Grid -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label class="block text-[10px] font-bold text-outline uppercase tracking-wider mb-2">${state.language === 'ms' ? 'Nama Penuh' : 'Full Name'}</label>
                            <input type="text" id="pd-name" value="${state.guestInfo.name}" required class="w-full px-4 py-2.5 rounded-xl border border-outline-variant/60 focus:outline-none focus:border-primary text-xs font-semibold text-on-surface">
                        </div>
                        <div>
                            <label class="block text-[10px] font-bold text-outline uppercase tracking-wider mb-2">${state.language === 'ms' ? 'Alamat E-mel' : 'Email Address'}</label>
                            <input type="email" id="pd-email" value="${state.guestInfo.email}" required class="w-full px-4 py-2.5 rounded-xl border border-outline-variant/60 focus:outline-none focus:border-primary text-xs font-semibold text-on-surface">
                        </div>
                        <div>
                            <label class="block text-[10px] font-bold text-outline uppercase tracking-wider mb-2">${state.language === 'ms' ? 'Nombor Telefon' : 'Phone Number'}</label>
                            <input type="tel" id="pd-phone" value="${state.guestInfo.phone}" required class="w-full px-4 py-2.5 rounded-xl border border-outline-variant/60 focus:outline-none focus:border-primary text-xs font-semibold text-on-surface">
                        </div>
                        <div>
                            <label class="block text-[10px] font-bold text-outline uppercase tracking-wider mb-2">${state.language === 'ms' ? 'Tarikh Lahir' : 'Date of Birth'}</label>
                            <input type="date" id="pd-dob" value="1994-08-14" class="w-full px-4 py-2.5 rounded-xl border border-outline-variant/60 focus:outline-none focus:border-primary text-xs font-semibold text-on-surface">
                        </div>
                        <div class="md:col-span-2">
                            <label class="block text-[10px] font-bold text-outline uppercase tracking-wider mb-2">${state.language === 'ms' ? 'Jantina' : 'Gender'}</label>
                            <div class="flex gap-6 mt-1">
                                <label class="flex items-center gap-2 cursor-pointer text-xs font-semibold text-on-surface">
                                    <input type="radio" name="pd-gender" value="female" checked class="text-primary focus:ring-primary border-outline-variant"> ${state.language === 'ms' ? 'Perempuan' : 'Female'}
                                </label>
                                <label class="flex items-center gap-2 cursor-pointer text-xs font-semibold text-on-surface">
                                    <input type="radio" name="pd-gender" value="male" class="text-primary focus:ring-primary border-outline-variant"> ${state.language === 'ms' ? 'Lelaki' : 'Male'}
                                </label>
                                <label class="flex items-center gap-2 cursor-pointer text-xs font-semibold text-on-surface">
                                    <input type="radio" name="pd-gender" value="other" class="text-primary focus:ring-primary border-outline-variant"> ${state.language === 'ms' ? 'Tidak mahu menyatakan' : 'Prefer not to say'}
                                </label>
                            </div>
                        </div>
                        <div class="md:col-span-2">
                            <label class="block text-[10px] font-bold text-outline uppercase tracking-wider mb-2">${state.language === 'ms' ? 'Permintaan Khas / Nota Perubatan' : 'Special Requests / Medical Notes'}</label>
                            <textarea id="pd-requests" rows="3" class="w-full px-4 py-2.5 rounded-xl border border-outline-variant/60 focus:outline-none focus:border-primary text-xs font-semibold text-on-surface resize-none">${state.guestInfo.specialRequests}</textarea>
                        </div>
                    </div>

                    <!-- Actions -->
                    <div class="flex gap-4 pt-4 border-t border-outline-variant/30 justify-end">
                        <button type="button" onclick="navigateTo('profile')" class="px-5 py-2.5 rounded-xl border border-outline text-[#50613f] hover:bg-[#50613f]/5 text-xs font-bold transition-all">
                            ${state.language === 'ms' ? 'Batal' : 'Cancel'}
                        </button>
                        <button type="submit" class="px-6 py-2.5 rounded-xl bg-primary hover:bg-[#3e4b30] text-white font-bold text-xs transition-all shadow-sm">
                            ${state.language === 'ms' ? 'Simpan Perubahan' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
}
window.renderPersonalDetailsView = renderPersonalDetailsView;

export function savePersonalDetails(event) {
    window.savePersonalDetails = savePersonalDetails;
    event.preventDefault();
    const name = document.getElementById('pd-name').value.trim();
    const email = document.getElementById('pd-email').value.trim();
    const phone = document.getElementById('pd-phone').value.trim();
    const requests = document.getElementById('pd-requests').value.trim();

    if (!name || !email || !phone) {
        showNotification(state.language === 'ms' ? 'Nama, e-mel dan nombor telefon diperlukan.' : 'Name, email and phone number are required.', 'error');
        return;
    }

    state.guestInfo.name = name;
    state.guestInfo.email = email;
    state.guestInfo.phone = phone;
    state.guestInfo.specialRequests = requests;

    showNotification(state.language === 'ms' ? 'Butiran peribadi berjaya dikemas kini.' : 'Personal details updated successfully.', 'success');
    navigateTo('profile');
};

// 2. BOOKING HISTORY
export let activeHistoryTab = 'upcoming';

export function renderBookingHistoryView() {
    const container = document.getElementById('booking-history-container');
    if (!container) return;

    // Filter bookings based on activeHistoryTab
    const filteredBookings = state.bookings.filter(b => {
        if (activeHistoryTab === 'upcoming') {
            return b.status === 'Upcoming';
        } else {
            return b.status === 'Completed' || b.status === 'Cancelled';
        }
    });

    let listHtml = '';
    if (filteredBookings.length === 0) {
        listHtml = `
            <div class="text-center py-12 bg-white rounded-3xl border border-outline-variant/30 p-8 shadow-sm">
                <span class="material-symbols-outlined text-4xl text-on-surface-variant/40 mb-3">calendar_today</span>
                <p class="text-sm font-semibold text-on-surface-variant">No ${activeHistoryTab} appointments found.</p>
                <p class="text-xs text-on-surface-variant/70 mt-1">Book your next relaxing treatment from our services page.</p>
                <button onclick="navigateTo('services-catalog')" class="mt-4 px-5 py-2.5 rounded-full bg-[#FACC15] text-[#241a00] hover:bg-[#eab308] font-bold text-xs shadow-sm">Explore Services</button>
            </div>
        `;
    } else {
        const iconMap = { signature: 'star', massage: 'spa', facial: 'face', body: 'self_care', packages: 'package_2' };
        
        filteredBookings.forEach(booking => {
            const icon = iconMap[booking.serviceType] || 'spa';
            const showCancel = booking.status === 'Upcoming';
            const statusBadge = booking.status === 'Upcoming' 
                ? `<span class="bg-[#e8f5e9] text-[#2e7d32] text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">${t('status_confirmed')}</span>`
                : booking.status === 'Cancelled'
                ? `<span class="bg-red-50 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">${t('status_cancelled')}</span>`
                : `<span class="bg-green-50 text-green-600 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">${t('status_completed')}</span>`;

            listHtml += `
                <div class="bg-white rounded-2xl p-5 border border-outline-variant/30 relative flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm hover:shadow-md transition-shadow">
                    <div class="flex items-start gap-4">
                        <div class="w-12 h-12 rounded-xl bg-[#50613f]/10 text-primary flex items-center justify-center shrink-0">
                            <span class="material-symbols-outlined text-xl">${icon}</span>
                        </div>
                        <div>
                            <div class="flex items-center gap-2 mb-1.5 flex-wrap">
                                <h3 class="font-serif text-base text-[#1E293B] font-bold">${booking.serviceName}</h3>
                                ${statusBadge}
                            </div>
                            <div class="space-y-1">
                                <p class="font-body-sm text-xs text-on-surface-variant flex items-center gap-1.5">
                                    <span class="material-symbols-outlined text-sm text-[#50613f]">schedule</span>
                                    <span>${booking.date} • ${booking.time}</span>
                                </p>
                                <p class="font-body-sm text-[11px] text-on-surface-variant flex items-center gap-1.5">
                                    <span class="material-symbols-outlined text-sm text-[#50613f]">person</span>
                                    <span>${state.language === 'ms' ? 'Terapis' : 'Therapist'}: <strong class="text-on-surface">${booking.therapist}</strong></span>
                                </p>

                            </div>
                        </div>
                    </div>
                    <div class="flex flex-col gap-3 border-t md:border-t-0 border-outline-variant/20 pt-3.5 md:pt-0 w-full md:w-auto md:items-end">
                        <div class="flex justify-between items-center w-full md:w-auto md:justify-end gap-2">
                            <span class="text-[11px] font-semibold text-on-surface-variant md:hidden">${state.language === 'ms' ? 'Harga' : 'Price'}</span>
                            <span class="font-serif text-base text-[#1E293B] font-bold">MYR ${parseFloat(booking.price).toFixed(2)}</span>
                        </div>
                        ${showCancel ? `
                        <div class="flex gap-2 w-full md:w-auto justify-start md:justify-end flex-wrap sm:flex-nowrap">
                            <button onclick="openQrTicketModal('${booking.id}')" class="flex-1 md:flex-initial justify-center px-3 py-2 rounded-lg bg-[#50613f]/10 hover:bg-[#50613f]/25 text-[#50613f] text-[10px] font-bold transition-all flex items-center gap-1 shadow-sm">
                                <span class="material-symbols-outlined text-[12px] font-bold">qr_code</span> ${t('btn_view_qr')}
                            </button>
                            <button onclick="rescheduleBooking('${booking.id}')" class="flex-1 md:flex-initial justify-center px-3 py-2 rounded-lg border border-outline text-on-surface-variant hover:bg-slate-50 text-[10px] font-bold transition-all text-center">${t('btn_reschedule')}</button>
                            <button onclick="cancelBooking('${booking.id}')" class="flex-1 md:flex-initial justify-center px-3 py-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 text-[10px] font-bold transition-all text-center">${t('btn_cancel')}</button>
                        </div>
                        ` : (booking.status === 'Completed' ? `
                        <div class="flex gap-2 w-full md:w-auto justify-start md:justify-end">
                            ${booking.hasReviewed ? `
                                <span class="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 text-[11px] font-bold border border-amber-200">
                                    <span class="material-symbols-outlined text-sm fill-current text-amber-500">star</span>
                                    ${state.language === 'ms' ? 'Ulasan Terkirim' : 'Reviewed'} (${booking.review ? booking.review.rating : 5}★)
                                </span>
                            ` : `
                                <button onclick="openLeaveReviewModal('${booking.id}')" class="px-4 py-2 rounded-xl bg-[#50613f] hover:bg-[#3e4b30] text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer">
                                    <span class="material-symbols-outlined text-sm">rate_review</span>
                                    ${state.language === 'ms' ? 'Beri Ulasan' : 'Leave Review'}
                                </button>
                            `}
                        </div>
                        ` : '')}
                    </div>
                </div>
            `;
        });
    }

    container.innerHTML = `
        <div class="max-w-4xl mx-auto">
            <!-- Header and Navigation -->
            <div class="flex items-center gap-3 mb-8">
                <button onclick="navigateTo('profile')" class="w-10 h-10 rounded-full bg-primary/5 hover:bg-primary/10 text-primary flex items-center justify-center transition-colors">
                    <span class="material-symbols-outlined">arrow_back</span>
                </button>
                <div>
                    <span class="font-label-caps text-[10px] text-[#B45309] font-bold uppercase tracking-wider block">${t('settings_title')}</span>
                    <h1 class="font-serif text-2xl md:text-3xl text-[#1E293B] font-bold">${t('setting_history')}</h1>
                </div>
            </div>

            <!-- Tab Selectors -->
            <div class="flex border-b border-outline-variant/30 mb-6">
                <button onclick="setHistoryTab('upcoming')" class="px-6 py-3 font-title-md text-xs font-bold border-b-2 transition-all ${activeHistoryTab === 'upcoming' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-primary'}">
                    ${t('tab_upcoming')}
                </button>
                <button onclick="setHistoryTab('past')" class="px-6 py-3 font-title-md text-xs font-bold border-b-2 transition-all ${activeHistoryTab === 'past' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-primary'}">
                    ${t('tab_past')}
                </button>
            </div>

            <!-- Bookings List -->
            <div class="space-y-4">
                ${listHtml}
            </div>
        </div>
    `;
}
window.renderBookingHistoryView = renderBookingHistoryView;

export function setHistoryTab(tab) {
    window.setHistoryTab = setHistoryTab;
    activeHistoryTab = tab;
    renderBookingHistoryView();
};

export function rescheduleBooking(bookingId) {
    window.rescheduleBooking = rescheduleBooking;
    const booking = state.bookings.find(b => b.id === bookingId);
    if (booking) {
        state.rescheduleBooking = {
            bookingId: bookingId,
            date: booking.date,
            time: booking.time,
            monthOffset: 0
        };
        saveState();
        navigateTo('reschedule');
        showNotification(state.language === 'ms' ? 'Proses penjadualan semula dimulakan. Sila pilih slot baru.' : 'Reschedule process initiated. Please pick a new slot.', 'info');
    }
};

export function renderRescheduleView() {
    const container = document.getElementById('reschedule-container');
    if (!container) return;

    if (!state.rescheduleBooking) {
        container.innerHTML = `<p class="text-center py-12 text-on-surface-variant">${state.language === 'ms' ? 'Tiada sesi penjadualan semula janji temu dimulakan.' : 'No reschedule booking session initialized.'}</p>`;
        return;
    }

    const bookingId = state.rescheduleBooking.bookingId;
    const booking = state.bookings.find(b => b.id === bookingId);
    if (!booking) {
        container.innerHTML = `<p class="text-center py-12 text-on-surface-variant">${state.language === 'ms' ? 'Tempahan tidak ditemui.' : 'Booking not found.'}</p>`;
        return;
    }

    // Default dates if null
    if (!state.rescheduleBooking.date) {
        const defaultDate = new Date();
        const options = { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' };
        state.rescheduleBooking.date = defaultDate.toLocaleDateString('en-US', options);
    }
    if (!state.rescheduleBooking.time) {
        state.rescheduleBooking.time = '11:00 AM';
    }

    // Parse selected date
    let selDate = new Date(state.rescheduleBooking.date);
    if (isNaN(selDate.getTime())) {
        selDate = new Date();
    }

    // Month to render
    const baseMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const renderMonth = new Date(baseMonth.getFullYear(), baseMonth.getMonth() + (state.rescheduleBooking.monthOffset || 0), 1);
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
            <button ${isDisabled ? 'disabled' : ''} onclick="selectRescheduleDate(${day})" class="h-10 w-10 mx-auto rounded-full font-body-sm text-body-sm flex items-center justify-center transition-colors disabled:opacity-30 disabled:hover:bg-transparent ${isSelected ? 'bg-[#50613f] text-white shadow-md font-bold' : 'text-on-surface hover:bg-surface-container-high'}">
                ${day}
            </button>
        `;
    }

    // Time Slots
    const morningSlots = ['09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM'];
    const afternoonSlots = ['01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM', '06:00 PM'];

    let morningSlotsHtml = '';
    morningSlots.forEach(t => {
        const isSelected = state.rescheduleBooking.time === t;
        const isOccupied = t === '12:00 PM';
        morningSlotsHtml += `
            <button ${isOccupied ? 'disabled' : ''} onclick="selectRescheduleTime('${t}')" class="px-4 py-2 rounded-lg border font-body-sm text-xs transition-colors ${isSelected ? 'border-[#50613f] bg-[#50613f]/10 text-[#50613f] font-bold' : isOccupied ? 'border-outline-variant text-on-surface opacity-30 cursor-not-allowed bg-surface-container' : 'border-outline-variant text-on-surface hover:border-[#50613f] hover:bg-[#50613f]/5'}">
                ${t.replace(' AM', '').replace(' PM', '')}
            </button>
        `;
    });

    let afternoonSlotsHtml = '';
    afternoonSlots.forEach(t => {
        const isSelected = state.rescheduleBooking.time === t;
        const isOccupied = t === '03:00 PM';
        afternoonSlotsHtml += `
            <button ${isOccupied ? 'disabled' : ''} onclick="selectRescheduleTime('${t}')" class="px-4 py-2 rounded-lg border font-body-sm text-xs transition-colors ${isSelected ? 'border-[#50613f] bg-[#50613f]/10 text-[#50613f] font-bold' : isOccupied ? 'border-outline-variant text-on-surface opacity-30 cursor-not-allowed bg-surface-container' : 'border-outline-variant text-on-surface hover:border-[#50613f] hover:bg-[#50613f]/5'}">
                ${t.replace(' AM', '').replace(' PM', '')}
            </button>
        `;
    });

    container.innerHTML = `
        <div class="mb-8 text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-4 animate-fade-in">
            <div>
                <h1 class="font-serif text-3xl text-[#1E293B] font-bold mb-1">Reschedule Appointment</h1>
                <p class="font-body-sm text-xs text-on-surface-variant">Select a new date and time slot for your reservation.</p>
            </div>
            <button onclick="navigateTo('booking-history')" class="px-4 py-2 rounded-xl border border-outline hover:bg-slate-50 text-secondary font-bold text-xs flex items-center gap-1 transition-colors">
                <span class="material-symbols-outlined text-sm">arrow_back</span> Back to History
            </button>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <!-- Left side: Calendar & Time Slots -->
            <div class="lg:col-span-8 space-y-6">
                <div class="glass-panel rounded-3xl p-6 md:p-8 bg-white shadow-sm border border-outline-variant/30">
                    <h2 class="font-title-md text-base text-[#50613f] mb-6 flex items-center gap-2 font-semibold">
                        <span class="material-symbols-outlined">calendar_month</span> Select New Date &amp; Time
                    </h2>

                    <!-- Calendar Card -->
                    <div class="mb-8 border border-outline-variant/30 rounded-2xl p-4 bg-white/45">
                        <div class="flex justify-between items-center mb-6">
                            <button onclick="changeRescheduleMonth(-1)" class="p-2 hover:bg-surface-container rounded-full text-on-surface-variant transition-colors">
                                <span class="material-symbols-outlined">chevron_left</span>
                            </button>
                            <span class="font-title-md text-base font-semibold text-[#1E293B]">${monthText}</span>
                            <button onclick="changeRescheduleMonth(1)" class="p-2 hover:bg-surface-container rounded-full text-on-surface-variant transition-colors">
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
                        <h2 class="font-serif text-lg text-[#1E293B] font-bold border-b border-outline-variant/20 pb-4 mb-6">Reschedule Summary</h2>
                        <div class="flex flex-col gap-5">
                            <!-- Service Info -->
                            <div class="flex gap-3 items-start">
                                <div class="w-10 h-10 rounded-lg bg-[#50613f]/10 flex items-center justify-center shrink-0 text-primary">
                                    <span class="material-symbols-outlined text-lg">spa</span>
                                </div>
                                <div>
                                    <span class="font-label-caps text-[9px] text-outline mb-0.5 block uppercase font-bold tracking-wider">SERVICE</span>
                                    <h3 class="font-title-md text-xs font-semibold text-[#1E293B]">${booking.serviceName}</h3>
                                </div>
                            </div>
                            
                            <!-- Therapist Info -->
                            <div class="flex gap-3 items-start">
                                <div class="w-10 h-10 rounded-lg bg-[#50613f]/10 flex items-center justify-center text-primary shrink-0">
                                    <span class="material-symbols-outlined text-lg">person</span>
                                </div>
                                <div>
                                    <span class="font-label-caps text-[9px] text-outline mb-0.5 block uppercase font-bold tracking-wider">THERAPIST</span>
                                    <h3 class="font-title-md text-xs font-semibold text-[#1E293B]">${booking.therapist}</h3>
                                </div>
                            </div>
                            
                            <!-- Schedule Info -->
                            <div class="flex gap-3 items-start">
                                <div class="w-10 h-10 rounded-lg bg-[#50613f]/10 flex items-center justify-center shrink-0 text-primary">
                                    <span class="material-symbols-outlined text-lg">calendar_month</span>
                                </div>
                                <div>
                                    <span class="font-label-caps text-[9px] text-outline mb-0.5 block uppercase font-bold tracking-wider">NEW DATE & TIME</span>
                                    ${state.rescheduleBooking.date ? `
                                        <h3 class="font-title-md text-xs font-semibold text-[#1E293B]">${state.rescheduleBooking.date}</h3>
                                        <p class="font-body-sm text-[11px] text-[#50613f] font-bold">${state.rescheduleBooking.time || 'To be selected'}</p>
                                    ` : `
                                        <h3 class="font-title-md text-xs font-semibold text-on-surface-variant"><span class="italic text-on-surface-variant opacity-60 text-xs">To be selected</span></h3>
                                    `}
                                </div>
                            </div>

                        </div>
                    </div>

                    <!-- Payment Details (Free Reschedule) -->
                    <div class="border-t border-outline-variant/20 pt-4 space-y-4">
                        <div class="space-y-2 text-xs">
                            <div class="flex justify-between text-on-surface-variant">
                                <span>Reschedule Fee</span>
                                <span class="line-through text-outline">MYR 20.00</span>
                            </div>
                            <div class="flex justify-between text-[#2e7d32] font-semibold">
                                <span>Discount</span>
                                <span>-MYR 20.00 (Free)</span>
                            </div>
                            <div class="border-t border-outline-variant/10 pt-3 flex justify-between items-center">
                                <span class="font-bold text-[#1E293B]">Total Fee</span>
                                <span class="font-serif text-lg font-bold text-[#1E293B]">MYR 0.00</span>
                            </div>
                        </div>

                        <!-- Confirm Actions -->
                        <div class="pt-2">
                            <button onclick="confirmReschedule()" class="w-full bg-[#50613f] hover:bg-[#3e4b30] text-white font-bold text-xs py-3 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2">
                                Confirm Reschedule <span class="material-symbols-outlined text-sm">check_circle</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}
window.renderRescheduleView = renderRescheduleView;

export function selectRescheduleDate(day) {
    window.selectRescheduleDate = selectRescheduleDate;
    const baseMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const renderMonth = new Date(baseMonth.getFullYear(), baseMonth.getMonth() + (state.rescheduleBooking.monthOffset || 0), day);
    const options = { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' };
    state.rescheduleBooking.date = renderMonth.toLocaleDateString('en-US', options);

    saveState();
    renderRescheduleView();
};

export function selectRescheduleTime(time) {
    window.selectRescheduleTime = selectRescheduleTime;
    state.rescheduleBooking.time = time;
    saveState();
    renderRescheduleView();
};

export function changeRescheduleMonth(offset) {
    window.changeRescheduleMonth = changeRescheduleMonth;
    const targetOffset = (state.rescheduleBooking.monthOffset || 0) + offset;
    if (targetOffset < 0) {
        showNotification(state.language === 'ms' ? 'Tidak boleh memilih bulan yang lepas.' : 'Cannot select past months.', 'info');
        return;
    }
    state.rescheduleBooking.monthOffset = targetOffset;
    saveState();
    renderRescheduleView();
};

export function confirmReschedule() {
    window.confirmReschedule = confirmReschedule;
    const bookingId = state.rescheduleBooking.bookingId;
    const booking = state.bookings.find(b => b.id === bookingId);
    if (!booking) return;

    // Update appointment date & time
    const oldDate = booking.date;
    const oldTime = booking.time;
    booking.date = state.rescheduleBooking.date;
    booking.time = state.rescheduleBooking.time;

    // Record notification
    state.notifications.unshift({
        id: 'notif-' + Date.now(),
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
        text: state.language === 'ms'
            ? `Jadual Semula: Janji temu anda untuk ${booking.serviceName} telah dijadualkan semula dari ${oldDate} pada ${oldTime} kepada ${booking.date} pada ${booking.time}.`
            : `Rescheduled: Your appointment for ${booking.serviceName} has been rescheduled from ${oldDate} at ${oldTime} to ${booking.date} at ${booking.time}.`
    });

    // Populate state.booking so renderSuccessView renders it perfectly
    state.booking.service = {
        name: booking.serviceName,
        duration: '60 Mins',
        price: parseFloat(booking.price) || 0
    };
    state.booking.therapist = { name: booking.therapist, role: 'Specialist' };
    state.booking.date = booking.date;
    state.booking.time = booking.time;
    state.successResId = booking.resId;

    // Reset reschedule states
    state.rescheduleBooking = null;
    saveState();
    
    // Go to success view!
    navigateTo('success');
    showNotification(state.language === 'ms' ? 'Janji temu berjaya dijadualkan semula!' : 'Appointment successfully rescheduled!', 'success');
};

export let activeCancelBookingId = null;

export function cancelBooking(bookingId) {
    window.cancelBooking = cancelBooking;
    if (!state.bookings) return;
    let booking = state.bookings.find(b => String(b.id) === String(bookingId));
    if (!booking) return;

    activeCancelBookingId = bookingId;
    const deposit = booking.depositPaid || (booking.price ? booking.price * 0.5 : 50.00);

    const modal = document.getElementById('cancel-booking-modal');
    const serviceTitle = document.getElementById('cancel-modal-service-name');
    const depositEl = document.getElementById('cancel-modal-deposit-amount');

    if (serviceTitle) serviceTitle.textContent = `${booking.serviceName} (${booking.date} at ${booking.time})`;
    if (depositEl) depositEl.textContent = `MYR ${parseFloat(deposit).toFixed(2)}`;

    if (modal) {
        modal.classList.remove('hidden');
        modal.style.display = 'flex';
    }
};

export function closeCancelBookingModal() {
    window.closeCancelBookingModal = closeCancelBookingModal;
    const modal = document.getElementById('cancel-booking-modal');
    if (modal) {
        modal.classList.add('hidden');
        modal.style.display = 'none';
    }
};

export function confirmCancelBooking() {
    window.confirmCancelBooking = confirmCancelBooking;
    if (!activeCancelBookingId || !state.bookings) return;
    const booking = state.bookings.find(b => String(b.id) === String(activeCancelBookingId));
    if (!booking) return;

    const depositForfeited = booking.depositPaid || (booking.price ? booking.price * 0.5 : 50.00);
    booking.status = 'Cancelled';
    booking.forfeitedDeposit = depositForfeited;

    // Transaction log of forfeit per 24h policy
    state.transactions.unshift({
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
        description: state.language === 'ms' ? `Deposit Dirampas (Denda 24j): ${booking.serviceName}` : `Deposit Forfeited (24h Policy): ${booking.serviceName}`,
        amount: 0,
        status: 'Completed'
    });

    // Add notification
    state.notifications.unshift({
        id: 'notif-' + Date.now(),
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
        text: state.language === 'ms'
            ? `Dibatalkan: Tempahan ${booking.serviceName} dibatalkan. Deposit 50% (MYR ${parseFloat(depositForfeited).toFixed(2)}) dirampas mengikut polisi.`
            : `Cancelled: Reservation for ${booking.serviceName} cancelled. 50% deposit (MYR ${parseFloat(depositForfeited).toFixed(2)}) forfeited per policy.`
    });

    closeCancelBookingModal();

    const successMsg = state.language === 'ms'
        ? `Tempahan dibatalkan. Deposit 50% (MYR ${parseFloat(depositForfeited).toFixed(2)}) dirampas mengikut polisi pembatalan.`
        : `Reservation cancelled. 50% deposit (MYR ${parseFloat(depositForfeited).toFixed(2)}) forfeited per cancellation policy.`;
    showNotification(successMsg, 'warning');
    renderBookingHistoryView();
    saveState();
};

// 3. NOTIFICATIONS
export function renderNotificationsView() {
    const container = document.getElementById('notifications-container');
    if (!container) return;

    let logHtml = '';
    if (state.notifications.length === 0) {
        logHtml = `<p class="text-xs text-on-surface-variant text-center py-6">${state.language === 'ms' ? 'Tiada log notifikasi ditemui.' : 'No notification logs found.'}</p>`;
    } else {
        state.notifications.forEach(notif => {
            logHtml += `
                <div class="flex gap-3 py-4 border-b border-outline-variant/20 last:border-b-0">
                    <div class="w-8 h-8 rounded-full bg-[#50613f]/10 text-primary flex items-center justify-center shrink-0">
                        <span class="material-symbols-outlined text-base">notifications</span>
                    </div>
                    <div class="flex-grow">
                        <p class="text-xs font-semibold text-on-surface leading-relaxed">${notif.text}</p>
                        <span class="text-[10px] text-on-surface-variant font-medium mt-1 block">${notif.date}</span>
                    </div>
                </div>
            `;
        });
    }

    container.innerHTML = `
        <div class="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
            <!-- Left Column: Navigation and Preferences Form -->
            <div class="lg:col-span-6 space-y-6">
                <!-- Header -->
                <div class="flex items-center gap-3">
                    <button onclick="navigateTo('profile')" class="w-10 h-10 rounded-full bg-primary/5 hover:bg-primary/10 text-primary flex items-center justify-center transition-colors">
                        <span class="material-symbols-outlined">arrow_back</span>
                    </button>
                    <div>
                        <span class="font-label-caps text-[10px] text-[#B45309] font-bold uppercase tracking-wider block">${t('settings_title')}</span>
                        <h1 class="font-serif text-2xl md:text-3xl text-[#1E293B] font-bold">${t('setting_notifications')}</h1>
                    </div>
                </div>

                <!-- Preferences Card -->
                <div class="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-outline-variant/30">
                    <h2 class="font-serif text-base text-[#1E293B] font-bold mb-4">${state.language === 'ms' ? 'Saluran Notifikasi' : 'Notification Channels'}</h2>
                    <form onsubmit="saveNotificationPreferences(event)" class="space-y-6">
                        <!-- Email Toggle -->
                        <div class="flex items-center justify-between">
                            <div>
                                <h3 class="text-xs font-semibold text-on-surface mb-0.5">${state.language === 'ms' ? 'Notifikasi E-mel' : 'Email Notifications'}</h3>
                                <p class="text-[11px] text-on-surface-variant leading-normal max-w-xs">${state.language === 'ms' ? 'Terima pengesahan tempahan, resit, dan surat berita.' : 'Receive booking confirmations, receipts, and newsletters.'}</p>
                            </div>
                            <label class="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" id="notif-email" ${state.notificationPreferences.email ? 'checked' : ''} class="sr-only peer">
                                <div class="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                            </label>
                        </div>

                        <!-- SMS Toggle -->
                        <div class="flex items-center justify-between">
                            <div>
                                <h3 class="text-xs font-semibold text-on-surface mb-0.5">${state.language === 'ms' ? 'Amaran SMS' : 'SMS Alerts'}</h3>
                                <p class="text-[11px] text-on-surface-variant leading-normal max-w-xs">${state.language === 'ms' ? 'Terima peringatan dan notifikasi jadual waktu nyata.' : 'Receive real-time scheduling reminders and notifications.'}</p>
                            </div>
                            <label class="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" id="notif-sms" ${state.notificationPreferences.sms ? 'checked' : ''} class="sr-only peer">
                                <div class="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                            </label>
                        </div>

                        <!-- Push Toggle -->
                        <div class="flex items-center justify-between">
                            <div>
                                <h3 class="text-xs font-semibold text-on-surface mb-0.5">${state.language === 'ms' ? 'Notifikasi Tolak' : 'Push Notifications'}</h3>
                                <p class="text-[11px] text-on-surface-variant leading-normal max-w-xs">${state.language === 'ms' ? 'Dapatkan amaran terus pada pelayar anda tentang promosi khas.' : 'Get alerts directly on your browser about special promos.'}</p>
                            </div>
                            <label class="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" id="notif-push" ${state.notificationPreferences.push ? 'checked' : ''} class="sr-only peer">
                                <div class="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                            </label>
                        </div>

                        <!-- Action Buttons -->
                        <div class="flex gap-3 justify-end pt-4 border-t border-outline-variant/30">
                            <button type="button" onclick="navigateTo('profile')" class="px-5 py-2.5 rounded-xl border border-outline text-[#50613f] hover:bg-[#50613f]/5 text-xs font-bold transition-all">
                                ${state.language === 'ms' ? 'Batal' : 'Cancel'}
                            </button>
                            <button type="submit" class="px-6 py-2.5 rounded-xl bg-primary hover:bg-[#3e4b30] text-white font-bold text-xs transition-all shadow-sm">
                                ${state.language === 'ms' ? 'Simpan Tetapan' : 'Save Settings'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <!-- Right Column: Notifications Log History -->
            <div class="lg:col-span-6 space-y-4">
                <div class="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-outline-variant/30 h-full flex flex-col">
                    <h2 class="font-serif text-base text-[#1E293B] font-bold mb-4">${state.language === 'ms' ? 'Sejarah Notifikasi' : 'Notification History'}</h2>
                    <div class="divide-y divide-outline-variant/10 overflow-y-auto max-h-[400px] pr-2 flex-grow">
                        ${logHtml}
                    </div>
                </div>
            </div>
        </div>
    `;
}
window.renderNotificationsView = renderNotificationsView;

export function saveNotificationPreferences(event) {
    window.saveNotificationPreferences = saveNotificationPreferences;
    event.preventDefault();
    const email = document.getElementById('notif-email').checked;
    const sms = document.getElementById('notif-sms').checked;
    const push = document.getElementById('notif-push').checked;

    state.notificationPreferences.email = email;
    state.notificationPreferences.sms = sms;
    state.notificationPreferences.push = push;

    showNotification(state.language === 'ms' ? 'Tetapan notifikasi berjaya disimpan.' : 'Notification preferences saved successfully.', 'success');
    navigateTo('profile');
};

// 4. PRIVACY & SECURITY
export function renderPrivacySecurityView() {
    const container = document.getElementById('privacy-security-container');
    if (!container) return;

    container.innerHTML = `
        <div class="max-w-2xl mx-auto">
            <!-- Header and Navigation -->
            <div class="flex items-center gap-3 mb-8">
                <button onclick="navigateTo('profile')" class="w-10 h-10 rounded-full bg-primary/5 hover:bg-primary/10 text-primary flex items-center justify-center transition-colors">
                    <span class="material-symbols-outlined">arrow_back</span>
                </button>
                <div>
                    <span class="font-label-caps text-[10px] text-[#B45309] font-bold uppercase tracking-wider block">${t('settings_title')}</span>
                    <h1 class="font-serif text-2xl md:text-3xl text-[#1E293B] font-bold">${t('setting_privacy')}</h1>
                </div>
            </div>

            <!-- Settings Card -->
            <div class="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-outline-variant/30 space-y-8">
                <!-- Change Password Form -->
                <div>
                    <h2 class="font-serif text-base text-[#1E293B] font-bold mb-4 pb-2 border-b border-outline-variant/20">${state.language === 'ms' ? 'Tukar Kata Laluan' : 'Change Password'}</h2>
                    <form onsubmit="savePassword(event)" class="space-y-4">
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label class="block text-[10px] font-bold text-outline uppercase tracking-wider mb-2">${state.language === 'ms' ? 'Kata Laluan Semasa' : 'Current Password'}</label>
                                <input type="password" id="ps-current-pwd" placeholder="••••••••" required class="w-full px-4 py-2.5 rounded-xl border border-outline-variant/60 focus:outline-none focus:border-primary text-xs font-semibold text-on-surface">
                            </div>
                            <div>
                                <label class="block text-[10px] font-bold text-outline uppercase tracking-wider mb-2">${state.language === 'ms' ? 'Kata Laluan Baru' : 'New Password'}</label>
                                <input type="password" id="ps-new-pwd" placeholder="••••••••" required class="w-full px-4 py-2.5 rounded-xl border border-outline-variant/60 focus:outline-none focus:border-primary text-xs font-semibold text-on-surface">
                            </div>
                            <div>
                                <label class="block text-[10px] font-bold text-outline uppercase tracking-wider mb-2">${state.language === 'ms' ? 'Sahkan Kata Laluan Baru' : 'Confirm New Password'}</label>
                                <input type="password" id="ps-confirm-pwd" placeholder="••••••••" required class="w-full px-4 py-2.5 rounded-xl border border-outline-variant/60 focus:outline-none focus:border-primary text-xs font-semibold text-on-surface">
                            </div>
                        </div>
                        <div class="flex justify-end mt-2">
                            <button type="submit" class="px-5 py-2.5 rounded-xl bg-primary hover:bg-[#3e4b30] text-white font-bold text-xs transition-all shadow-sm">${state.language === 'ms' ? 'Kemas Kini Kata Laluan' : 'Update Password'}</button>
                        </div>
                    </form>
                </div>

                <!-- Account Security Settings -->
                <div>
                    <h2 class="font-serif text-base text-[#1E293B] font-bold mb-4 pb-2 border-b border-outline-variant/20">${state.language === 'ms' ? 'Keselamatan Akaun' : 'Account Security'}</h2>
                    <form onsubmit="savePrivacySettings(event)" class="space-y-4">
                        <!-- 2FA Checkbox -->
                        <div class="flex items-start gap-3">
                            <input type="checkbox" id="ps-2fa" ${state.privacySettings.twoFactor ? 'checked' : ''} class="mt-1 rounded text-primary focus:ring-primary border-outline-variant">
                            <div>
                                <label for="ps-2fa" class="text-xs font-bold text-on-surface block cursor-pointer">${state.language === 'ms' ? 'Aktifkan Pengesahan Dua Faktor (2FA)' : 'Enable Two-Factor Authentication (2FA)'}</label>
                                <p class="text-[11px] text-on-surface-variant leading-relaxed">${state.language === 'ms' ? 'Lindungi akaun anda dengan memerlukan kod pengesahan sebagai tambahan kepada kata laluan anda.' : 'Secure your account by requiring an verification code in addition to your password.'}</p>
                            </div>
                        </div>

                        <!-- Data Sharing -->
                        <div class="flex items-start gap-3">
                            <input type="checkbox" id="ps-data" ${state.privacySettings.dataSharing ? 'checked' : ''} class="mt-1 rounded text-primary focus:ring-primary border-outline-variant">
                            <div>
                                <label for="ps-data" class="text-xs font-bold text-on-surface block cursor-pointer">${state.language === 'ms' ? 'Pengalaman & Syor Peribadi' : 'Personalized Experience & Recommendations'}</label>
                                <p class="text-[11px] text-on-surface-variant leading-relaxed">${state.language === 'ms' ? 'Benarkan Serenity & Soul menganalisis log rawatan untuk mengesyorkan minyak pati dan kekerapan terapi yang dikurasi.' : 'Allow Serenity & Soul to analyze treatment logs to recommend curated essential oils and therapy frequencies.'}</p>
                            </div>
                        </div>

                        <!-- Actions -->
                        <div class="flex gap-3 justify-end pt-4 border-t border-outline-variant/30">
                            <button type="button" onclick="navigateTo('profile')" class="px-5 py-2.5 rounded-xl border border-outline text-[#50613f] hover:bg-[#50613f]/5 text-xs font-bold transition-all">
                                ${state.language === 'ms' ? 'Batal' : 'Cancel'}
                            </button>
                            <button type="submit" class="px-6 py-2.5 rounded-xl bg-primary hover:bg-[#3e4b30] text-white font-bold text-xs transition-all shadow-sm">
                                ${state.language === 'ms' ? 'Simpan Tetapan' : 'Save Settings'}
                            </button>
                        </div>
                    </form>
                </div>

                <!-- Danger Zone -->
                <div class="p-6 border border-red-200 bg-red-50/50 rounded-2xl">
                    <h3 class="text-xs font-bold text-red-800 flex items-center gap-1.5 mb-2">
                        <span class="material-symbols-outlined text-sm font-bold">warning</span> ${state.language === 'ms' ? 'Zon Bahaya' : 'Danger Zone'}
                    </h3>
                    <p class="text-[11px] text-red-700 leading-relaxed mb-4">${state.language === 'ms' ? `Nyahaktifkan dan padam data akaun anda secara kekal. Tindakan ini tidak boleh ditarik balik dan anda akan kehilangan baki dompet yang ada (MYR ${state.walletBalance.toFixed(2)}).` : `Permanently deactivate and delete your account data. This action is irreversible and you will forfeit any existing wallet balance (MYR ${state.walletBalance.toFixed(2)}).`}</p>
                    <button type="button" onclick="deleteAccount()" class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-[10px] uppercase tracking-wider rounded-xl transition-all shadow-sm">${state.language === 'ms' ? 'Padam Akaun' : 'Delete Account'}</button>
                </div>
            </div>
        </div>
    `;
}
window.renderPrivacySecurityView = renderPrivacySecurityView;

export function savePassword(event) {
    window.savePassword = savePassword;
    event.preventDefault();
    const currentPwd = document.getElementById('ps-current-pwd').value;
    const newPwd = document.getElementById('ps-new-pwd').value;
    const confirmPwd = document.getElementById('ps-confirm-pwd').value;

    if (newPwd !== confirmPwd) {
        showNotification(state.language === 'ms' ? 'Kata laluan baru dan pengesahan kata laluan tidak sepadan.' : 'New password and password confirmation do not match.', 'error');
        return;
    }

    if (newPwd.length < 6) {
        showNotification(state.language === 'ms' ? 'Kata laluan mestilah sekurang-kurangnya 6 aksara.' : 'Password must be at least 6 characters long.', 'error');
        return;
    }

    // Reset password inputs
    document.getElementById('ps-current-pwd').value = '';
    document.getElementById('ps-new-pwd').value = '';
    document.getElementById('ps-confirm-pwd').value = '';

    showNotification(state.language === 'ms' ? 'Kata laluan anda telah berjaya ditukar.' : 'Your password has been changed successfully.', 'success');
};

export function savePrivacySettings(event) {
    window.savePrivacySettings = savePrivacySettings;
    event.preventDefault();
    const twoFactor = document.getElementById('ps-2fa').checked;
    const dataSharing = document.getElementById('ps-data').checked;

    state.privacySettings.twoFactor = twoFactor;
    state.privacySettings.dataSharing = dataSharing;

    showNotification(state.language === 'ms' ? 'Tetapan privasi berjaya disimpan.' : 'Privacy settings saved successfully.', 'success');
    navigateTo('profile');
};

export function deleteAccount() {
    window.deleteAccount = deleteAccount;
    const confirmMsg = state.language === 'ms'
        ? "AMARAN: Adakah anda pasti mahu memadamkan akaun anda? Ini adalah kekal dan baki dompet anda yang tinggal sebanyak MYR " + state.walletBalance.toFixed(2) + " akan dilucuthakkan."
        : "WARNING: Are you sure you want to delete your account? This is permanent and your remaining wallet balance of MYR " + state.walletBalance.toFixed(2) + " will be forfeited.";
    if (confirm(confirmMsg)) {
        // Reset state to Guest
        state.guestInfo = {
            name: 'Guest User',
            email: 'guest@example.com',
            phone: '',
            specialRequests: ''
        };
        state.walletBalance = 0.00;
        state.bookings = [];
        state.transactions = [];
        state.notifications = [];
        updateHeaderWalletDisplay();
        showNotification(state.language === 'ms' ? 'Akaun berjaya dipadamkan.' : 'Account successfully deleted.', 'success');
        navigateTo('home');
    }
};

// 5. SIGN OUT MODAL
export function confirmSignOut() {
    window.confirmSignOut = confirmSignOut;
    let modal = document.getElementById('sign-out-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'sign-out-modal';
        modal.className = 'fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm opacity-0 transition-opacity duration-300 pointer-events-none';
        modal.innerHTML = `
            <div class="bg-white rounded-3xl p-6 md:p-8 max-w-sm w-[90%] border border-outline-variant/30 shadow-2xl transform scale-95 transition-transform duration-300 text-center">
                <div class="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4">
                    <span class="material-symbols-outlined text-2xl font-bold">logout</span>
                </div>
                <h3 class="font-serif text-lg text-[#1E293B] font-bold mb-2">Sign Out</h3>
                <p class="text-xs text-on-surface-variant leading-relaxed mb-6">Are you sure you want to sign out of Serenity & Soul? Your current progress and session state will be reset.</p>
                <div class="flex gap-3 justify-center">
                    <button onclick="cancelSignOut()" class="px-5 py-2.5 rounded-xl border border-outline text-[#50613f] hover:bg-[#50613f]/5 text-xs font-bold transition-all w-full">
                        Cancel
                    </button>
                    <button onclick="performSignOut()" class="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-all w-full shadow-sm">
                        Sign Out
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    setTimeout(() => {
        modal.classList.remove('pointer-events-none', 'opacity-0');
        modal.querySelector('.transform').classList.remove('scale-95');
    }, 50);
};

export function cancelSignOut() {
    window.cancelSignOut = cancelSignOut;
    const modal = document.getElementById('sign-out-modal');
    if (modal) {
        modal.classList.add('pointer-events-none', 'opacity-0');
        modal.querySelector('.transform').classList.add('scale-95');
    }
};

export function performSignOut() {
    window.performSignOut = performSignOut;
    window.cancelSignOut();

    // Reset session variables
    state.guestInfo = {
        name: 'Eleanor Vance',
        email: 'eleanor.v@example.com',
        phone: '+65 9123 4567',
        specialRequests: 'Please ensure the massage room is slightly warm, and avoid using lavender oils due to a mild allergy. Thank you.'
    };
    state.walletBalance = 250.00;
    
    // Reset active packages sessions back to full
    state.activePackages = {
        'aromatherapy-bundle': 2,
        'radiance-bundle': 4
    };
    
    // Clear custom bookings
    state.bookings = [
        {
            id: 'booking-1',
            serviceName: 'Healing Stone Therapy',
            serviceType: 'signature',
            date: 'Thursday, Oct 24, 2026',
            time: '02:00 PM',
            therapist: 'Sari',
            location: 'Serenity Orchard Wing',
            price: 180,
            status: 'Upcoming'
        },
        {
            id: 'booking-2',
            serviceName: 'Aromatherapy Massage',
            serviceType: 'massage',
            date: 'Wednesday, Oct 15, 2025',
            time: '10:00 AM',
            therapist: 'Sari',
            location: 'Serenity Orchard Wing',
            price: 120,
            status: 'Completed'
        },
        {
            id: 'booking-3',
            serviceName: 'Signature Facial',
            serviceType: 'facial',
            date: 'Monday, Oct 02, 2025',
            time: '03:30 PM',
            therapist: 'Dewi',
            location: 'Serenity Orchard Wing',
            price: 85,
            status: 'Completed'
        }
    ];

    updateHeaderWalletDisplay();
    showNotification(state.language === 'ms' ? 'Berjaya log keluar.' : 'Signed out successfully.', 'success');
    userSignOut();
};

window.renderProfileView = renderProfileView;
window.renderWalletView = renderWalletView;
window.renderTopupView = renderTopupView;
window.setTopUpPaymentMethod = setTopUpPaymentMethod;
window.setEWalletBrand = setEWalletBrand;
window.navigateToTopUp = navigateToTopUp;
window.submitTopUpProcess = submitTopUpProcess;
window.savePersonalDetails = savePersonalDetails;
window.setHistoryTab = setHistoryTab;
window.rescheduleBooking = rescheduleBooking;
window.selectRescheduleDate = selectRescheduleDate;
window.selectRescheduleTime = selectRescheduleTime;
window.changeRescheduleMonth = changeRescheduleMonth;
window.confirmReschedule = confirmReschedule;
window.cancelBooking = cancelBooking;
window.closeCancelBookingModal = closeCancelBookingModal;
window.confirmCancelBooking = confirmCancelBooking;
window.saveNotificationPreferences = saveNotificationPreferences;
window.savePassword = savePassword;
window.savePrivacySettings = savePrivacySettings;
window.deleteAccount = deleteAccount;
window.confirmSignOut = confirmSignOut;
window.cancelSignOut = cancelSignOut;
window.performSignOut = performSignOut;

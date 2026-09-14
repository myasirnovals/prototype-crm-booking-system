import { tenantId, currentTenant, DEFAULT_TENANTS } from '../models/Tenant.js';
import { SERVICES, THERAPISTS, getSharedData, syncServices, syncTherapists } from '../models/Database.js';

// 2. GLOBAL APPLICATION STATE
export const DEFAULT_STATE = {
    language: 'en',
    walletBalance: 250.00,
    selectedTopUpAmount: 100,
    activePackages: {
        'tcm-pain-relief-bundle': 3,
        'tcm-vitality-package': 2
    },
    // Stores the total sessions bought for each package (used for progress bar)
    packageTotalSessions: {
        'tcm-pain-relief-bundle': 10,
        'tcm-vitality-package': 5
    },
    // Stores which practitioner was chosen at purchase time, per package
    packageTherapists: {
        'tcm-pain-relief-bundle': null,
        'tcm-vitality-package': null
    },
    // When true, confirmation should deduct a package session (not charge wallet)
    packageBookingMode: null, // bundleId or null
    transactions: [
        { date: 'Oct 24, 2026', description: 'Clinic Wallet Top Up', amount: 100.00, status: 'Completed' },
        { date: 'Oct 15, 2026', description: 'Acupuncture Meridian Therapy Payment', amount: -85.00, status: 'Completed' },
        { date: 'Oct 02, 2026', description: 'TCM Pulse & Herbal Consultation Payment', amount: -60.00, status: 'Completed' },
        { date: 'Sep 28, 2026', description: 'Health Reward Bonus Credit', amount: 25.00, status: 'Completed' }
    ],
    booking: {
        service: null,
        therapist: null,
        date: null,
        time: null
    },
    guestInfo: {
        name: 'Eleanor Vance',
        email: 'eleanor.v@example.com',
        phone: '+65 9123 4567',
        specialRequests: 'Mild neck stiffness and chronic migraine; prefers gentle acupuncture needle insertion.'
    },
    bookings: [
        {
            id: 'booking-1',
            serviceName: 'Acupuncture Meridian Therapy',
            serviceType: 'acupuncture',
            date: 'Thursday, Oct 24, 2026',
            time: '02:00 PM',
            therapist: 'Physician Chen Wei Lin',
            location: 'Chinatown Main Clinic',
            price: 85,
            status: 'Upcoming'
        },
        {
            id: 'booking-2',
            serviceName: 'Therapeutic TCM Tuina Bodywork',
            serviceType: 'tuina',
            date: 'Wednesday, Oct 15, 2026',
            time: '10:00 AM',
            therapist: 'Master Lim Keng Hock',
            location: 'Chinatown Main Clinic',
            price: 98,
            status: 'Completed'
        },
        {
            id: 'booking-3',
            serviceName: 'TCM Pulse & Herbal Consultation',
            serviceType: 'consultation',
            date: 'Monday, Oct 02, 2026',
            time: '03:30 PM',
            therapist: 'Physician Tan Mei Ling',
            location: 'Chinatown Main Clinic',
            price: 60,
            status: 'Completed'
        }
    ],
    notifications: [
        { id: 'notif-1', date: 'Oct 24, 2026', text: 'Appointment Confirmed: Your Acupuncture Meridian Therapy with Physician Chen Wei Lin has been scheduled.' },
        { id: 'notif-2', date: 'Oct 24, 2026', text: 'Clinic Wallet Top-up: Successful top-up of credits to your digital health wallet.' },
        { id: 'notif-3', date: 'Sep 28, 2026', text: 'Welcome to TCM Homecare: Embark on your holistic balance and healing journey.' }
    ],
    notificationPreferences: {
        email: true,
        sms: true,
        push: false
    },
    privacySettings: {
        twoFactor: false,
        dataSharing: true
    },
    savedCards: [
        { id: 'card-1', brand: 'Visa', last4: '4242', expiry: '12/26', isDefault: true },
        { id: 'card-2', brand: 'Mastercard', last4: '8888', expiry: '09/25', isDefault: false }
    ],
    pkgBooking: null,
    currentView: 'home',
    serviceCategory: 'all',
    homeServiceCategory: 'all'
};

export let state = { ...DEFAULT_STATE };

export function loadState() {
    const saved = localStorage.getItem(`${tenantId}_state`);
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            state = { ...DEFAULT_STATE, ...parsed };
            state.guestInfo = { ...DEFAULT_STATE.guestInfo, ...(parsed.guestInfo || {}) };
            if (typeof state.walletBalance !== 'number' || isNaN(state.walletBalance)) {
                state.walletBalance = 250.00;
            }
            if (typeof state.loyaltyPoints !== 'number' || isNaN(state.loyaltyPoints)) {
                state.loyaltyPoints = 350;
            }
            if (!Array.isArray(state.transactions)) {
                state.transactions = [...DEFAULT_STATE.transactions];
            }
            if (!state.language) {
                state.language = 'en';
            }
            state.booking = {
                service: null,
                therapist: null,
                date: null,
                time: null
            };
            state.packageBookingMode = null;
        } catch (e) {
            console.error("Failed to load state from localStorage", e);
            state = { ...DEFAULT_STATE };
        }
    } else {
        state = { ...DEFAULT_STATE };
    }
}

export function saveState() {
    localStorage.setItem(`${tenantId}_state`, JSON.stringify(state));
}

// Load initial state
loadState();

window.loadState = loadState;
window.saveState = saveState;

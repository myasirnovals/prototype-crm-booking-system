import { tenantId, currentTenant, DEFAULT_TENANTS } from '../models/Tenant.js';
import { SERVICES, THERAPISTS, getSharedData, syncServices, syncTherapists } from '../models/Database.js';

// 2. GLOBAL APPLICATION STATE
export const DEFAULT_STATE = {
    language: 'en',
    walletBalance: 250.00,
    selectedTopUpAmount: 100,
    activePackages: {
        'aromatherapy-bundle': 2,
        'radiance-bundle': 4
    },
    // Stores the total sessions bought for each package (used for progress bar)
    packageTotalSessions: {
        'aromatherapy-bundle': 10,
        'radiance-bundle': 10
    },
    // Stores which therapist was chosen at purchase time, per package
    packageTherapists: {
        'aromatherapy-bundle': null,
        'radiance-bundle': null
    },
    // When true, confirmation should deduct a package session (not charge wallet)
    packageBookingMode: null, // bundleId or null
    transactions: [
        { date: 'Oct 24, 2023', description: 'Wallet Top Up', amount: 100.00, status: 'Completed' },
        { date: 'Oct 15, 2023', description: 'Deep Tissue Massage Payment', amount: -120.00, status: 'Completed' },
        { date: 'Oct 02, 2023', description: 'Signature Facial Payment', amount: -85.00, status: 'Completed' },
        { date: 'Sep 28, 2023', description: 'Referral Bonus Credit', amount: 25.00, status: 'Completed' }
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
        specialRequests: 'Please ensure the massage room is slightly warm, and avoid using lavender oils due to a mild allergy. Thank you.'
    },
    bookings: [
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
    ],
    notifications: [
        { id: 'notif-1', date: 'Oct 24, 2026', text: 'Appointment Confirmed: Your Healing Stone Therapy with Sari on Thursday, Oct 24 has been confirmed.' },
        { id: 'notif-2', date: 'Oct 24, 2025', text: 'Wallet Top-up: Successful top-up of MYR 100.00 to your digital wallet.' },
        { id: 'notif-3', date: 'Sep 28, 2025', text: 'Welcome to Serenity & Soul: Find your inner balance with our exclusive services.' }
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

// Shared State for Serenity & Soul Admin Interface
// Implements localStorage persistence for a fully interactive prototype.

const DEFAULT_SERVICES = [
  { id: 'radiance-bundle', name: 'Radiance Facial Bundle', price: 850, regularPrice: 950, duration: 60, category: 'Packages', desc: "Commit to your skin's health with our 10-session package. Regular treatments yield lasting, radiant results. Enjoy significant savings when booking this comprehensive care package.", img: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&w=800&q=80', showOnHome: true, services: ['radiance-organic-facial'], sessions: 10 },
  { id: 'aromatherapy-bundle', name: 'Aromatherapy Massage Package (10 Sessions)', price: 1000, regularPrice: 1200, duration: 60, category: 'Packages', desc: 'Pre-purchase 10 sessions of our signature Aromatherapy Massage and save. Valid for 12 months.', img: 'https://images.alodokter.com/dk0z4ums3/image/upload/v1763539055/attached_image/aromatherapy-massage-ketahui-manfaatnya-untuk-kesehatan-0-alodokter.jpg', showOnHome: false, services: ['aromatherapy-massage'], sessions: 10 },
  { id: 'half-day-spa-package', name: 'Half-Day Spa Package', price: 250, regularPrice: 300, duration: 180, category: 'Packages', desc: 'Enjoy a combination of aromatherapy massage, facial, and body scrub for 3 full hours of ultimate relaxation.', img: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80', showOnHome: true, services: ['aromatherapy-massage', 'radiance-organic-facial', 'detox-body-scrub'], sessions: 1 },
  { id: 'aromatherapy-massage', name: 'Aromatherapy Massage', price: 120, duration: 60, category: 'Massage', desc: 'Deep relaxation massage using selected essential oils that soothe the nervous system and relieve muscle tension. A holistic experience.', img: 'https://images.alodokter.com/dk0z4ums3/image/upload/v1763539055/attached_image/aromatherapy-massage-ketahui-manfaatnya-untuk-kesehatan-0-alodokter.jpg', showOnHome: true },
  { id: 'deep-tissue', name: 'Serenity Signature Deep Tissue', price: 150, duration: 90, category: 'Therapeutic', desc: 'Intensive treatment focusing on deep muscle layers to restore the body from chronic fatigue.', img: 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&w=800&q=80', showOnHome: false },
  { id: 'radiance-organic-facial', name: 'Facial Rejuvenation', price: 95, duration: 60, category: 'Skincare', desc: 'Brightening facial treatment with organic plant extracts.', img: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&w=800&q=80', showOnHome: true },
  { id: 'hot-stone', name: 'Hot Stone Therapy', price: 165, duration: 90, category: 'Signature', desc: 'Basalt stones are heated and placed on key energy points to melt away tension and restore vital energy flow.', img: 'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?auto=format&fit=crop&w=800&q=80', showOnHome: false },
  { id: 'signature-soul', name: 'Signature Soul Massage', price: 190, duration: 120, category: 'Signature', desc: "A personalized fusion of Swedish, Shiatsu, and Reflexology techniques tailored to your body's specific needs.", img: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80', showOnHome: false },
  { id: 'illuminating-peel', name: 'Illuminating Peel', price: 95, duration: 45, category: 'Skincare', desc: 'Fruit enzymes to brighten and smooth dull skin.', img: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80', showOnHome: false },
  { id: 'pure-hydration', name: 'Pure Hydration', price: 120, duration: 60, category: 'Skincare', desc: 'Deep hydration facial restoring radiance.', img: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&w=800&q=80', showOnHome: false },
  { id: 'detox-body-scrub', name: 'Body Scrub', price: 85, duration: 30, category: 'Body', desc: 'Exfoliating treatment with natural sea salts.', img: 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&w=800&q=80', showOnHome: true }
];

const DEFAULT_STAFF = [
  { id: 'stf-1', name: 'Siti Rahma', specialization: 'Deep Tissue', tags: ['Deep Tissue', 'Reflexology'], rating: 4.9, reviews: 120, status: 'Active', avatar: 'SR', color: 'rgba(105,122,86,0.25)', textColor: '#3c4c2b', img: '' },
  { id: 'stf-2', name: 'Budi Santoso', specialization: 'Acupuncture', tags: ['Acupuncture', 'Therapeutic'], rating: 4.8, reviews: 85, status: 'Active', avatar: 'BS', color: '#dde4e3', textColor: '#45483f', img: '' },
  { id: 'stf-3', name: 'Lestari Ayu', specialization: 'Holistic Facial', tags: ['Holistic Facial', 'Skin Care'], rating: 5.0, reviews: 42, status: 'Active', avatar: 'LA', color: '#e8e2d6', textColor: '#1e1c14', img: '' },
  { id: 'stf-4', name: 'Elena Rossi', specialization: 'Aromatherapy', tags: ['Aromatherapy', 'Massage'], rating: 4.7, reviews: 63, status: 'Active', avatar: 'ER', color: '#d6e9bd', textColor: '#111f05', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDXL1nXvHoMpWBFsWneY6ACc6JQ_VKO_v2oSlwtQVZc-FWNW2VuAbUHLk5GqiSuek7bIeMnvfNXdEZf4L6cuC4IFMx6ePqcI7WDBfvUnP_jD0mGvM220IeAc8iNLtSzyDAq3YFbqEFmpzukgL815IuiITu_N9Y08FzpLJRdCfl1LXNLIAi3jwRANg85m7DdZVx3B_E1dh8Ok9TMbuG8YYgdlnrhKrlFYMmb3mBDexoGKCGazk2j6AGsqQ' },
  { id: 'stf-5', name: 'Sarah Lin', specialization: 'Lead Esthetician', tags: ['Facial Therapy', 'Anti-Aging'], rating: 5.0, reviews: 42, status: 'On Leave', avatar: 'SL', color: '#e8efef', textColor: '#75786e', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBdj4trpzamnfWlTIxIHxZdnFubSewIWpR395mGHVaXj0VFcRztpDs19DvEoz7IZSFDWcCSZZ00vfU1Fpv15n4nDohZzyyZ0vGnR_gtoGepVvp_GbdsXE3l6sHOE_Cv69W9dHR5xp7O5VanfAlOaRUNkehCWFaXGtBn2fz5Uyfc6IMdD6j9AOdU4pxf6LknCWqAY_yEZTMZ_blnoyfLuzgpV-6mqEyFyTws9f91EEKBbKGXNVO4DZl6Aw' }
];

const DEFAULT_RESERVATIONS = [
  { id: 'RES-001', customer: 'Eleanor Vance', service: 'Deep Tissue', therapistId: 'stf-4', timeSlot: '10:00', duration: 120, date: '2025-07-03', status: 'Confirmed' },
  { id: 'RES-002', customer: 'Mr. Reza', service: 'Express Massage', therapistId: 'stf-1', timeSlot: '13:00', duration: 60, date: '2025-07-03', status: 'Pending' },
  { id: 'RES-003', customer: 'Diana K.', service: 'Acupuncture', therapistId: 'stf-2', timeSlot: '09:00', duration: 60, date: '2025-07-03', status: 'Pending' },
  { id: 'RES-004', customer: 'Hendra K.', service: 'Acupuncture', therapistId: 'stf-2', timeSlot: '11:00', duration: 60, date: '2025-07-03', status: 'Confirmed' },
  { id: 'RES-005', customer: 'Nia Ramadhani', service: 'Premium Glow Facial', therapistId: 'stf-3', timeSlot: '13:00', duration: 120, date: '2025-07-03', status: 'Confirmed' },
  { id: 'RES-006', customer: 'James W.', service: 'Relaxation Massage', therapistId: 'stf-4', timeSlot: '15:00', duration: 60, date: '2025-07-03', status: 'Pending' }
];

const DEFAULT_ROOMS = [
  { id: 1, name: 'Room 1', status: 'Occupied' },
  { id: 2, name: 'Room 2', status: 'Occupied' },
  { id: 3, name: 'Room 3', status: 'Vacant' },
  { id: 4, name: 'Room 4', status: 'Occupied' },
  { id: 5, name: 'Room 5', status: 'Vacant' }
];

// Helper to read active branch ID
function getTenantId() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('branch') || urlParams.get('id') || 'default-spa';
}

const DEFAULT_SPA_ADMIN = {
  id: 'default-spa',
  name: 'Serenity & Soul',
  logo: 'Serenity',
  colors: {
    primary: '#50613f',
    secondary: '#fed65b',
    background: '#f4fbfa',
    surfaceContainer: '#e8efef'
  },
  adminEmail: 'admin@serenity.com',
  adminPassword: 'admin123'
};

const DEFAULT_CUSTOMERS = [
  {
    id: 'cust-1',
    name: 'Eleanor Vance',
    email: 'eleanor.vance@gmail.com',
    phone: '+60 12-345 6789',
    avatar: 'EV',
    tier: 'VIP Platinum',
    totalVisits: 14,
    totalSpent: 2150.00,
    preferredTherapist: 'Sari',
    preferredTreatment: 'Aromatherapy Massage & Glow Facial',
    skinAllergies: 'Sensitive skin (Avoid harsh scrubs)',
    preferences: 'Prefers lavender essential oil, warm tea post-session',
    lastVisit: '2026-07-20',
    notes: [
      { date: '2026-07-20', author: 'Siti Rahma', text: 'Enjoys firm pressure on neck and shoulder area.' }
    ]
  },
  {
    id: 'cust-2',
    name: 'Nia Ramadhani',
    email: 'nia.ramadhani@yahoo.com',
    phone: '+60 17-889 1234',
    avatar: 'NR',
    tier: 'Gold Member',
    totalVisits: 8,
    totalSpent: 1240.00,
    preferredTherapist: 'Siti Rahma',
    preferredTreatment: 'Signature Soul Massage',
    skinAllergies: 'N/A',
    preferences: 'Requests quiet room, low ambient lighting',
    lastVisit: '2026-07-28',
    notes: [
      { date: '2026-07-28', author: 'Siti Rahma', text: 'Loved the hot stone treatment upgrade.' }
    ]
  },
  {
    id: 'cust-3',
    name: 'Mr. Reza',
    email: 'reza.k@techcorp.com',
    phone: '+60 19-334 5566',
    avatar: 'MR',
    tier: 'Silver Member',
    totalVisits: 5,
    totalSpent: 680.00,
    preferredTherapist: 'Budi Santoso',
    preferredTreatment: 'Deep Tissue Massage',
    skinAllergies: 'Nut oil allergy (Use Jojoba oil only)',
    preferences: 'Focus on lower back tension',
    lastVisit: '2026-07-15',
    notes: [
      { date: '2026-07-15', author: 'Budi Santoso', text: 'Lower back stiffness improved.' }
    ]
  },
  {
    id: 'cust-4',
    name: 'Diana K.',
    email: 'diana.k@beautyblog.com',
    phone: '+60 11-234 9988',
    avatar: 'DK',
    tier: 'VIP Platinum',
    totalVisits: 19,
    totalSpent: 3100.00,
    preferredTherapist: 'Lestari Ayu',
    preferredTreatment: 'Radiance Organic Facial',
    skinAllergies: 'N/A',
    preferences: 'Subscribes to monthly facial packages',
    lastVisit: '2026-07-25',
    notes: [
      { date: '2026-07-25', author: 'Lestari Ayu', text: 'Purchased 10-session Radiance Bundle.' }
    ]
  }
];

// Helper to initialize local storage for a specific tenant
function initStorage(tId) {
  const activeT = tId || getTenantId();
  const SERVICES_KEY = `${activeT}_admin_services`;
  const STAFF_KEY = `${activeT}_admin_staff`;
  const RESERVATIONS_KEY = `${activeT}_admin_reservations`;
  const ROOMS_KEY = `${activeT}_admin_rooms`;
  const CUSTOMERS_KEY = `${activeT}_admin_customers`;

  const existing = localStorage.getItem(SERVICES_KEY);
  if (!existing || !existing.includes('1200')) {
    localStorage.setItem(SERVICES_KEY, JSON.stringify(DEFAULT_SERVICES));
  }
  if (!localStorage.getItem(STAFF_KEY)) {
    localStorage.setItem(STAFF_KEY, JSON.stringify(DEFAULT_STAFF));
  }
  if (!localStorage.getItem(RESERVATIONS_KEY)) {
    localStorage.setItem(RESERVATIONS_KEY, JSON.stringify(DEFAULT_RESERVATIONS));
  }
  if (!localStorage.getItem(ROOMS_KEY)) {
    localStorage.setItem(ROOMS_KEY, JSON.stringify(DEFAULT_ROOMS));
  }
  const custRaw = localStorage.getItem(CUSTOMERS_KEY);
  if (!custRaw || custRaw === '[]') {
    localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(DEFAULT_CUSTOMERS));
  }
}

function getSharedData(type) {
  return [];
}

// Data accessor functions
const AdminState = {
  getTenantId: getTenantId,
  
  getTenants: () => {
    return { [DEFAULT_SPA_ADMIN.id]: DEFAULT_SPA_ADMIN };
  },
  
  saveTenants: (data) => {},
  
  getCurrentTenant: () => {
    return DEFAULT_SPA_ADMIN;
  },

  getServices: () => {
    const tId = getTenantId();
    initStorage(tId);
    const own = JSON.parse(localStorage.getItem(`${tId}_admin_services`)) || [];
    const shared = getSharedData('services');
    return own.concat(shared);
  },
  saveServices: (data) => {
    const tId = getTenantId();
    const own = data.filter(s => !s.isShared);
    localStorage.setItem(`${tId}_admin_services`, JSON.stringify(own));
  },
  
  getStaff: () => {
    const tId = getTenantId();
    initStorage(tId);
    const own = JSON.parse(localStorage.getItem(`${tId}_admin_staff`)) || [];
    const shared = getSharedData('staff');
    return own.concat(shared);
  },
  saveStaff: (data) => {
    const tId = getTenantId();
    const own = data.filter(s => !s.isShared);
    localStorage.setItem(`${tId}_admin_staff`, JSON.stringify(own));
  },

  getReservations: () => {
    const tId = getTenantId();
    initStorage(tId);
    const own = JSON.parse(localStorage.getItem(`${tId}_admin_reservations`)) || [];
    const shared = getSharedData('reservations');
    return own.concat(shared);
  },
  saveReservations: (data) => {
    const tId = getTenantId();
    const own = data.filter(r => !r.isShared);
    localStorage.setItem(`${tId}_admin_reservations`, JSON.stringify(own));
  },

  getRooms: () => {
    const tId = getTenantId();
    initStorage(tId);
    const own = JSON.parse(localStorage.getItem(`${tId}_admin_rooms`)) || [];
    const shared = getSharedData('rooms');
    return own.concat(shared);
  },
  saveRooms: (data) => {
    const tId = getTenantId();
    const own = data.filter(r => !r.isShared);
    localStorage.setItem(`${tId}_admin_rooms`, JSON.stringify(own));
  },

  getCustomers: () => {
    const tId = getTenantId();
    initStorage(tId);
    const own = JSON.parse(localStorage.getItem(`${tId}_admin_customers`)) || [];
    const shared = getSharedData('customers');
    return own.concat(shared);
  },
  saveCustomers: (data) => {
    const tId = getTenantId();
    const own = data.filter(c => !c.isShared);
    localStorage.setItem(`${tId}_admin_customers`, JSON.stringify(own));
  },

  // Add Reservation
  addReservation: (res) => {
    const list = AdminState.getReservations();
    const newId = 'RES-' + String(list.length + 1).padStart(3, '0');
    const newRes = { id: newId, ...res };
    list.push(newRes);
    AdminState.saveReservations(list);
    return newRes;
  },

  // Edit / Update Reservation status
  updateReservationStatus: (id, status) => {
    const list = AdminState.getReservations();
    const item = list.find(r => r.id === id);
    if (item) {
      item.status = status;
      AdminState.saveReservations(list);
    }
  },

  // Add Staff
  addStaff: (member) => {
    const list = AdminState.getStaff();
    const newId = 'stf-' + (list.length + 1);
    const avatar = member.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    const newMember = {
      id: newId,
      avatar,
      rating: 5.0,
      reviews: 0,
      color: '#e8efef',
      textColor: '#45483f',
      ...member
    };
    list.push(newMember);
    AdminState.saveStaff(list);
    return newMember;
  },

  // Toggle Room Status
  toggleRoomStatus: (id) => {
    const rooms = AdminState.getRooms();
    const room = rooms.find(r => r.id === id);
    if (room) {
      room.status = room.status === 'Occupied' ? 'Vacant' : 'Occupied';
      AdminState.saveRooms(rooms);
    }
  },

  // Toggle Home Visibility
  toggleShowOnHome: (id) => {
    const list = AdminState.getServices();
    const srv = list.find(s => s.id === id);
    if (srv) {
      if (!srv.showOnHome) {
        const featuredCount = list.filter(s => s.showOnHome).length;
        if (featuredCount >= 5) {
          alert("Maximum of 5 featured services/packages can be displayed on the homepage.");
          return false;
        }
      } else {
        if (srv.bestValue) {
          srv.bestValue = false;
        }
      }
      srv.showOnHome = !srv.showOnHome;
      AdminState.saveServices(list);
      return true;
    }
    return false;
  },

  // Toggle Best Value (Star)
  toggleBestValue: (id) => {
    const list = AdminState.getServices();
    const srv = list.find(s => s.id === id);
    if (srv) {
      if (!srv.showOnHome) {
        alert("Only services/packages featured on the homepage (with the home icon active) can be marked as Best Value.");
        return false;
      }
      const wasBestValue = srv.bestValue;
      list.forEach(s => {
        s.bestValue = false;
      });
      srv.bestValue = !wasBestValue;
      AdminState.saveServices(list);
      return true;
    }
    return false;
  }
};

// Apply tenant styling and config
function applyTenantBranding(tenant) {
  if (!tenant) return;
  document.title = document.title.replace(/Serenity\s*&\s*Soul/i, tenant.name);

  const brandLogos = document.querySelectorAll('.brand-logo');
  brandLogos.forEach(el => {
    el.textContent = tenant.name;
  });

  const headerDesc = document.querySelector('.page-header p');
  if (headerDesc) {
    headerDesc.textContent = headerDesc.textContent.replace(/Serenity\s*&\s*Soul/gi, tenant.name);
  }
}

// Overwrite logOut helper globally
window.adminSignOut = function() {
  sessionStorage.removeItem('admin_logged_in');
  sessionStorage.removeItem('admin_email');
  sessionStorage.removeItem('admin_tenant');
  window.location.replace('login.html');
};

// Initialize styling on load
document.addEventListener('DOMContentLoaded', () => {
  const current = AdminState.getCurrentTenant();
  applyTenantBranding(current);
});

if (typeof module !== 'undefined' && module.exports) {
  module.exports = AdminState;
}
window.AdminState = AdminState;

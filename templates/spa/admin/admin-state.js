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

// Helper to read active tenant ID
function getTenantId() {
  const urlParams = new URLSearchParams(window.location.search);
  const tenantFromUrl = urlParams.get('tenant');
  if (tenantFromUrl) {
    sessionStorage.setItem('admin_tenant', tenantFromUrl);
    return tenantFromUrl;
  }
  const sessionTenant = sessionStorage.getItem('admin_tenant');
  if (sessionTenant) {
    return sessionTenant;
  }
  return 'serenity'; // Fallback
}

const DEFAULT_TENANTS = {
  serenity: {
    id: 'serenity',
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
  },
  zenith: {
    id: 'zenith',
    name: 'Zenith Wellness',
    logo: 'Zenith',
    colors: {
      primary: '#1e40af', // Blue
      secondary: '#f59e0b', // Amber
      background: '#f8fafc', // Slate
      surfaceContainer: '#f1f5f9'
    },
    adminEmail: 'admin@zenith.com',
    adminPassword: 'admin123'
  }
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
  const currentTId = getTenantId();
  const tenants = JSON.parse(localStorage.getItem('spa_tenants')) || DEFAULT_TENANTS;
  let sharedItems = [];
  
  Object.keys(tenants).forEach(tId => {
    if (tId === currentTId) return;
    const t = tenants[tId];
    if (t.sharing && Array.isArray(t.sharing.sharedWith) && t.sharing.sharedWith.includes(currentTId)) {
      if (Array.isArray(t.sharing.sharedTypes) && t.sharing.sharedTypes.includes(type)) {
        const storageKey = `${tId}_admin_${type}`;
        const rawData = localStorage.getItem(storageKey);
        if (rawData) {
          try {
            const items = JSON.parse(rawData);
            if (Array.isArray(items)) {
              items.forEach(item => {
                item.originalId = item.id;
                item.id = `${tId}_${item.id}`;
                item.isShared = true;
                item.sharedFromId = tId;
                item.sharedFromName = t.name;
              });
              sharedItems = sharedItems.concat(items);
            }
          } catch (e) {
            console.error(`Failed to parse shared data for ${tId} type ${type}`, e);
          }
        }
      }
    }
  });
  return sharedItems;
}

// Data accessor functions
const AdminState = {
  getTenantId: getTenantId,
  
  getTenants: () => {
    let tenants = localStorage.getItem('spa_tenants');
    if (!tenants) {
      localStorage.setItem('spa_tenants', JSON.stringify(DEFAULT_TENANTS));
      tenants = JSON.stringify(DEFAULT_TENANTS);
    }
    return JSON.parse(tenants);
  },
  
  saveTenants: (data) => {
    localStorage.setItem('spa_tenants', JSON.stringify(data));
  },
  
  getCurrentTenant: () => {
    const list = AdminState.getTenants();
    const tId = getTenantId();
    return list[tId] || list['serenity'];
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

// Inject Tenant settings modal
function injectTenantSettingsModal() {
  const dropdown = document.querySelector('.settings-dropdown') || document.getElementById('settings-panel');
  if (dropdown && !document.getElementById('tenant-settings-opt')) {
    const opt = document.createElement('div');
    opt.className = 'settings-menu-item';
    opt.id = 'tenant-settings-opt';
    opt.innerHTML = `<span class="material-symbols-outlined">settings</span>Tenant Settings`;
    opt.onclick = () => window.openTenantSettingsModal();
    const signOutBtn = dropdown.querySelector('[onclick="adminSignOut()"]');
    if (signOutBtn) {
      dropdown.insertBefore(opt, signOutBtn);
    } else {
      dropdown.insertBefore(opt, dropdown.firstChild);
    }
  }

  if (document.getElementById('tenant-settings-modal')) return;

  const modal = document.createElement('div');
  modal.id = 'tenant-settings-modal';
  modal.style.cssText = 'display:none;position:fixed;inset:0;z-index:99999;align-items:center;justify-content:center;';
  modal.innerHTML = `
    <div onclick="window.closeTenantSettingsModal()" style="position:absolute;inset:0;background:rgba(0,0,0,0.55);backdrop-filter:blur(4px);"></div>
    <div style="position:relative;z-index:1;width:100%;max-width:500px;margin:16px;background:#fff;border-radius:20px;padding:32px;box-shadow:0 10px 30px rgba(0,0,0,0.15);max-height:90vh;overflow-y:auto;font-family:'Manrope',sans-serif;color:#333;">
      <button onclick="window.closeTenantSettingsModal()" style="position:absolute;top:16px;right:16px;background:none;border:none;cursor:pointer;color:#75786e;"><span class="material-symbols-outlined">close</span></button>
      <h2 style="margin:0 0 20px;font-family:'Playfair Display',serif;color:#111;font-size:1.5rem;">Tenant & Application Settings</h2>
      
      <div style="display:flex;gap:8px;margin-bottom:20px;border-bottom:1px solid #eee;padding-bottom:12px;">
        <button id="ts-tab-config" onclick="window.switchTenantTab('config')" style="flex:1;padding:8px;border:none;background:#50613f;color:#fff;border-radius:8px;font-size:0.75rem;font-weight:700;cursor:pointer;transition:all 0.2s;">Configure Current</button>
        <button id="ts-tab-sharing" onclick="window.switchTenantTab('sharing')" style="flex:1;padding:8px;border:none;background:#eee;color:#555;border-radius:8px;font-size:0.75rem;font-weight:700;cursor:pointer;transition:all 0.2s;">Data Sharing</button>
        <button id="ts-tab-create" onclick="window.switchTenantTab('create')" style="flex:1;padding:8px;border:none;background:#eee;color:#555;border-radius:8px;font-size:0.75rem;font-weight:700;cursor:pointer;transition:all 0.2s;">Create New Tenant</button>
      </div>

      <div id="tenant-form-config">
        <form onsubmit="window.saveTenantConfig(event)" style="display:flex;flex-direction:column;gap:14px;">
          <div>
            <label style="display:block;font-size:0.72rem;font-weight:700;text-transform:uppercase;color:#555;margin-bottom:4px;">App Name</label>
            <input type="text" id="cfg-app-name" style="width:100%;padding:10px;border:1px solid #ccc;border-radius:8px;outline:none;" required>
          </div>
          <input type="hidden" id="cfg-color-primary">
          <input type="hidden" id="cfg-color-secondary">
          <div>
            <label style="display:block;font-size:0.72rem;font-weight:700;text-transform:uppercase;color:#555;margin-bottom:4px;">Admin Email</label>
            <input type="email" id="cfg-admin-email" style="width:100%;padding:10px;border:1px solid #ccc;border-radius:8px;outline:none;" required>
          </div>
          <div>
            <label style="display:block;font-size:0.72rem;font-weight:700;text-transform:uppercase;color:#555;margin-bottom:4px;">Admin Password</label>
            <input type="password" id="cfg-admin-password" style="width:100%;padding:10px;border:1px solid #ccc;border-radius:8px;outline:none;" required>
          </div>
          <div style="display:flex; gap:10px; margin-top:8px;">
            <button type="submit" class="btn-login" style="flex:1; padding:12px;background:#50613f;color:#fff;border:none;border-radius:8px;font-weight:700;cursor:pointer;">Save Settings</button>
            <a href="../index.html?tenant=${getTenantId()}" target="_blank" style="display:inline-flex; align-items:center; justify-content:center; padding:12px; border:1px solid #50613f; color:#50613f; border-radius:8px; text-decoration:none; font-weight:700; cursor:pointer; flex:1; gap:6px;">
              <span class="material-symbols-outlined" style="font-size:18px;">open_in_new</span> Client Portal
            </a>
          </div>
        </form>
      </div>

      <div id="tenant-form-sharing" style="display:none;">
        <form onsubmit="window.saveSharingConfig(event)" style="display:flex;flex-direction:column;gap:14px;">
          <div>
            <label style="display:block;font-size:0.72rem;font-weight:700;text-transform:uppercase;color:#555;margin-bottom:6px;">Select Data to Share</label>
            <div style="display:flex;flex-direction:column;gap:8px;background:#f8fafc;padding:12px;border-radius:8px;border:1px solid #e2e8f0;">
              <label style="display:flex;align-items:center;gap:8px;font-size:0.85rem;cursor:pointer;margin:0;">
                <input type="checkbox" id="share-services" style="cursor:pointer;margin:0;"> Services & Packages
              </label>
              <label style="display:flex;align-items:center;gap:8px;font-size:0.85rem;cursor:pointer;margin:0;">
                <input type="checkbox" id="share-staff" style="cursor:pointer;margin:0;"> Staff & Therapists
              </label>
              <label style="display:flex;align-items:center;gap:8px;font-size:0.85rem;cursor:pointer;margin:0;">
                <input type="checkbox" id="share-reservations" style="cursor:pointer;margin:0;"> Reservations & Appointments
              </label>
              <label style="display:flex;align-items:center;gap:8px;font-size:0.85rem;cursor:pointer;margin:0;">
                <input type="checkbox" id="share-rooms" style="cursor:pointer;margin:0;"> Spa Rooms
              </label>
              <label style="display:flex;align-items:center;gap:8px;font-size:0.85rem;color:#94a3b8;cursor:not-allowed;margin:0;" title="Revenue cannot be shared with other tenants for privacy reasons.">
                <input type="checkbox" id="share-revenue" disabled style="cursor:not-allowed;margin:0;"> Revenue (Restricted 🔒)
              </label>
            </div>
          </div>
          <div>
            <label style="display:block;font-size:0.72rem;font-weight:700;text-transform:uppercase;color:#555;margin-bottom:6px;">Share With Tenants</label>
            <div id="share-tenants-list" style="display:flex;flex-direction:column;gap:8px;max-height:150px;overflow-y:auto;background:#f8fafc;padding:12px;border-radius:8px;border:1px solid #e2e8f0;">
              <!-- Dynamically populated checkbox list of other tenants -->
            </div>
          </div>
          <button type="submit" class="btn-login" style="padding:12px;background:#50613f;color:#fff;border:none;border-radius:8px;font-weight:700;cursor:pointer;margin-top:8px;">Save Sharing Settings</button>
        </form>
      </div>

      <div id="tenant-form-create" style="display:none;">
        <form onsubmit="window.createNewTenant(event)" style="display:flex;flex-direction:column;gap:14px;">
          <div>
            <label style="display:block;font-size:0.72rem;font-weight:700;text-transform:uppercase;color:#555;margin-bottom:4px;">Tenant ID (lowercase, e.g. "aura")</label>
            <input type="text" id="cre-id" placeholder="aura" style="width:100%;padding:10px;border:1px solid #ccc;border-radius:8px;outline:none;" required>
          </div>
          <div>
            <label style="display:block;font-size:0.72rem;font-weight:700;text-transform:uppercase;color:#555;margin-bottom:4px;">App Name</label>
            <input type="text" id="cre-name" placeholder="Aura Spa Sanctuary" style="width:100%;padding:10px;border:1px solid #ccc;border-radius:8px;outline:none;" required>
          </div>
          <input type="hidden" id="cre-color-primary" value="#50613f">
          <input type="hidden" id="cre-color-secondary" value="#fed65b">
          <div>
            <label style="display:block;font-size:0.72rem;font-weight:700;text-transform:uppercase;color:#555;margin-bottom:4px;">Admin Email</label>
            <input type="email" id="cre-admin-email" placeholder="admin@aura.com" style="width:100%;padding:10px;border:1px solid #ccc;border-radius:8px;outline:none;" required>
          </div>
          <div>
            <label style="display:block;font-size:0.72rem;font-weight:700;text-transform:uppercase;color:#555;margin-bottom:4px;">Admin Password</label>
            <input type="password" id="cre-admin-password" placeholder="admin123" style="width:100%;padding:10px;border:1px solid #ccc;border-radius:8px;outline:none;" required>
          </div>
          <button type="submit" class="btn-login" style="padding:12px;background:#50613f;color:#fff;border:none;border-radius:8px;font-weight:700;cursor:pointer;margin-top:8px;">Create Tenant</button>
        </form>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

// Modal helper functions
window.openTenantSettingsModal = function() {
  const modal = document.getElementById('tenant-settings-modal');
  if (!modal) return;
  const current = AdminState.getCurrentTenant();
  const tId = getTenantId();
  
  document.getElementById('cfg-app-name').value = current.name || '';
  document.getElementById('cfg-color-primary').value = current.colors?.primary || '#50613f';
  document.getElementById('cfg-color-secondary').value = current.colors?.secondary || '#fed65b';
  document.getElementById('cfg-admin-email').value = current.adminEmail || '';
  document.getElementById('cfg-admin-password').value = current.adminPassword || '';

  // Load Data Sharing tab checkboxes
  const currentSharing = current.sharing || { sharedTypes: [], sharedWith: [] };
  document.getElementById('share-services').checked = (currentSharing.sharedTypes || []).includes('services');
  document.getElementById('share-staff').checked = (currentSharing.sharedTypes || []).includes('staff');
  document.getElementById('share-reservations').checked = (currentSharing.sharedTypes || []).includes('reservations');
  document.getElementById('share-rooms').checked = (currentSharing.sharedTypes || []).includes('rooms');

  const tenantsList = AdminState.getTenants();
  const otherTenants = Object.values(tenantsList).filter(t => t.id !== tId);
  const tenantsContainer = document.getElementById('share-tenants-list');
  if (tenantsContainer) {
    if (otherTenants.length === 0) {
      tenantsContainer.innerHTML = '<span style="font-size:0.8rem;color:#888;font-style:italic;">No other tenants available. Create one to share data.</span>';
    } else {
      tenantsContainer.innerHTML = otherTenants.map(t => {
        const checked = (currentSharing.sharedWith || []).includes(t.id) ? 'checked' : '';
        return `
          <label style="display:flex;align-items:center;gap:8px;font-size:0.85rem;cursor:pointer;margin:0;">
            <input type="checkbox" name="share-tenant-cb" value="${t.id}" ${checked} style="cursor:pointer;margin:0;"> ${t.name} (${t.id})
          </label>
        `;
      }).join('');
    }
  }

  window.switchTenantTab('config');
  modal.style.display = 'flex';
};

window.closeTenantSettingsModal = function() {
  const modal = document.getElementById('tenant-settings-modal');
  if (modal) modal.style.display = 'none';
};

window.switchTenantTab = function(tab) {
  const configTab = document.getElementById('tenant-form-config');
  const sharingTab = document.getElementById('tenant-form-sharing');
  const createTab = document.getElementById('tenant-form-create');
  const btnConfig = document.getElementById('ts-tab-config');
  const btnSharing = document.getElementById('ts-tab-sharing');
  const btnCreate = document.getElementById('ts-tab-create');
  
  if (tab === 'config') {
    configTab.style.display = 'block';
    sharingTab.style.display = 'none';
    createTab.style.display = 'none';
    btnConfig.style.background = 'var(--primary-color, #50613f)';
    btnConfig.style.color = '#fff';
    btnSharing.style.background = '#eee';
    btnSharing.style.color = '#555';
    btnCreate.style.background = '#eee';
    btnCreate.style.color = '#555';
  } else if (tab === 'sharing') {
    configTab.style.display = 'none';
    sharingTab.style.display = 'block';
    createTab.style.display = 'none';
    btnConfig.style.background = '#eee';
    btnConfig.style.color = '#555';
    btnSharing.style.background = 'var(--primary-color, #50613f)';
    btnSharing.style.color = '#fff';
    btnCreate.style.background = '#eee';
    btnCreate.style.color = '#555';
  } else {
    configTab.style.display = 'none';
    sharingTab.style.display = 'none';
    createTab.style.display = 'block';
    btnConfig.style.background = '#eee';
    btnConfig.style.color = '#555';
    btnSharing.style.background = '#eee';
    btnSharing.style.color = '#555';
    btnCreate.style.background = 'var(--primary-color, #50613f)';
    btnCreate.style.color = '#fff';
  }
};

window.showCustomToast = function(message, type = 'success', onDismiss = null) {
  const toast = document.createElement('div');
  const bg = type === 'success' ? '#50613f' : '#ba1a1a';
  toast.style.cssText = `position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:${bg};color:#fff;padding:12px 24px;border-radius:30px;font-family:'Manrope',sans-serif;font-size:0.9rem;font-weight:600;box-shadow:0 4px 12px rgba(0,0,0,0.15);z-index:999999;opacity:0;transition:opacity 0.3s ease;display:flex;align-items:center;gap:8px;text-align:center;`;
  toast.innerHTML = `<span class="material-symbols-outlined" style="font-size:18px;">${type === 'success' ? 'check_circle' : 'error'}</span><span>${message.replace(/\n/g, '<br>')}</span>`;
  document.body.appendChild(toast);
  requestAnimationFrame(() => { toast.style.opacity = '1'; });
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => {
      if (document.body.contains(toast)) document.body.removeChild(toast);
      if (onDismiss) onDismiss();
    }, 300);
  }, 2000);
};

window.saveTenantConfig = function(e) {
  e.preventDefault();
  const tenants = AdminState.getTenants();
  const tId = getTenantId();
  if (tenants[tId]) {
    tenants[tId].name = document.getElementById('cfg-app-name').value;
    tenants[tId].colors = {
      primary: document.getElementById('cfg-color-primary').value,
      secondary: document.getElementById('cfg-color-secondary').value,
      background: '#f4fbfa',
      surfaceContainer: '#e8efef'
    };
    tenants[tId].adminEmail = document.getElementById('cfg-admin-email').value;
    tenants[tId].adminPassword = document.getElementById('cfg-admin-password').value;
    
    AdminState.saveTenants(tenants);
    applyTenantBranding(tenants[tId]);
    window.closeTenantSettingsModal();
    window.showCustomToast("Tenant settings saved successfully!", "success", () => {
      window.location.reload();
    });
  }
};

window.saveSharingConfig = function(e) {
  e.preventDefault();
  const tenants = AdminState.getTenants();
  const tId = getTenantId();
  if (tenants[tId]) {
    const sharedTypes = [];
    if (document.getElementById('share-services').checked) sharedTypes.push('services');
    if (document.getElementById('share-staff').checked) sharedTypes.push('staff');
    if (document.getElementById('share-reservations').checked) sharedTypes.push('reservations');
    if (document.getElementById('share-rooms').checked) sharedTypes.push('rooms');
    
    const sharedWith = [];
    const checkboxes = document.getElementsByName('share-tenant-cb');
    checkboxes.forEach(cb => {
      if (cb.checked) sharedWith.push(cb.value);
    });
    
    tenants[tId].sharing = {
      sharedTypes,
      sharedWith
    };
    
    AdminState.saveTenants(tenants);
    window.closeTenantSettingsModal();
    window.showCustomToast("Sharing configurations saved successfully!", "success", () => {
      window.location.reload();
    });
  }
};

window.createNewTenant = function(e) {
  e.preventDefault();
  const tenants = AdminState.getTenants();
  const newId = document.getElementById('cre-id').value.trim().toLowerCase();
  
  if (tenants[newId]) {
    window.showCustomToast("Tenant ID already exists! Please use a different ID.", "error");
    return;
  }

  const name = document.getElementById('cre-name').value.trim();
  const primary = document.getElementById('cre-color-primary').value;
  const secondary = document.getElementById('cre-color-secondary').value;
  const email = document.getElementById('cre-admin-email').value.trim();
  const pass = document.getElementById('cre-admin-password').value;

  tenants[newId] = {
    id: newId,
    name: name,
    logo: name.split(' ')[0],
    colors: {
      primary: primary,
      secondary: secondary,
      background: '#f8fafc',
      surfaceContainer: '#f1f5f9'
    },
    adminEmail: email,
    adminPassword: pass
  };

  AdminState.saveTenants(tenants);
  initStorage(newId); // Pre-populate default data keys for the new tenant
  
  window.closeTenantSettingsModal();
  
  const host = window.location.origin;
  const adminUrl = `${host}/admin/login.html?tenant=${newId}`;
  const userUrl = `${host}/index.html?tenant=${newId}`;
  
  window.showCustomToast(`Tenant "${name}" created successfully!`, "success", () => {
    window.location.reload();
  });
};

// Overwrite logOut helper globally
window.adminSignOut = function() {
  const tId = getTenantId();
  sessionStorage.removeItem('admin_logged_in');
  sessionStorage.removeItem('admin_email');
  sessionStorage.removeItem('admin_tenant');
  window.location.replace(`login.html?tenant=${tId}`);
};

// Initialize styling and modal on load
document.addEventListener('DOMContentLoaded', () => {
  const current = AdminState.getCurrentTenant();
  applyTenantBranding(current);
  injectTenantSettingsModal();
});

if (typeof module !== 'undefined' && module.exports) {
  module.exports = AdminState;
}
window.AdminState = AdminState;

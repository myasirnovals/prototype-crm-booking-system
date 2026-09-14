/**
 * booking-engine.js — Standalone Pre-Login & Guest Booking Controller for NutriFlow
 * 
 * Provides an interactive, seamless booking experience on index.html identical to SPA template:
 * - View switching: 'home', 'booking', 'booking-success'
 * - 4-step wizard: Service -> Specialist & Method -> Date & Time -> Details & Payment
 * - Live summary sidebar (desktop) & sticky mobile navigation
 * - In-place auth modal with guest checkout support
 * - Dynamic branch identity binding (?branch=...)
 * - Strict localization compliance (EN default, MS, ZH — ZERO Indonesian text)
 */

// Default Services Dataset
export const NUTRITION_SERVICES = [
  {
    id: 'srv-initial-consult',
    title: 'Comprehensive Initial Consultation',
    category: 'Clinical Nutrition',
    duration: '60 min',
    price: 150,
    type: 'Virtual or In-Person',
    image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&auto=format&fit=crop&q=80',
    description: 'In-depth assessment of dietary habits, metabolic health markers, clinical history, and customized baseline nutrition protocol.',
    popular: true,
    features: ['Body composition review', 'Nutrient deficiency screening', 'Personalized macro targets']
  },
  {
    id: 'srv-follow-up',
    title: 'Dietary Progress & Macro Review',
    category: 'Follow-Up',
    duration: '30 min',
    price: 75,
    type: 'Virtual Only',
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&auto=format&fit=crop&q=80',
    description: 'Bi-weekly evaluation of meal log consistency, satiety adjustments, and calorie progression coaching.',
    popular: false,
    features: ['Meal log troubleshooting', 'Progressive calorie adjustment', 'Direct Q&A with dietitian']
  },
  {
    id: 'srv-body-comp',
    title: 'Metabolic & InBody Composition Scan',
    category: 'Clinical Assessment',
    duration: '45 min',
    price: 120,
    type: 'In-Clinic Only',
    image: 'https://images.unsplash.com/photo-1518481612222-68bbe828ecd1?w=600&auto=format&fit=crop&q=80',
    description: 'Medical-grade InBody 770 bioelectrical impedance analysis measuring skeletal muscle mass, visceral fat level, and BMR.',
    popular: false,
    features: ['Segmental lean analysis', 'Visceral fat scoring', 'Basal metabolic rate calculation']
  },
  {
    id: 'srv-sports-nutrition',
    title: 'Athletic Performance & Fueling Plan',
    category: 'Sports Dietetics',
    duration: '60 min',
    price: 160,
    type: 'Virtual or In-Person',
    image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80',
    description: 'Targeted peri-workout carbohydrate timing, hydration strategy, and recovery supplementation for athletes.',
    popular: false,
    features: ['Race-day fueling guide', 'Electrolyte balancing', 'Lean mass preservation']
  },
  {
    id: 'srv-gut-health',
    title: 'Gut Microbiome & IBS Protocol',
    category: 'Specialized Care',
    duration: '60 min',
    price: 180,
    type: 'Virtual or In-Person',
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80',
    description: 'Elimination-reintroduction FODMAP guidance, microbial flora support, and dietary inflammation mitigation.',
    popular: false,
    features: ['FODMAP phase planning', 'Digestive symptom tracking', 'Prebiotic & probiotic optimization']
  }
];

// Specialists Dataset
export const NUTRITION_SPECIALISTS = [
  {
    id: 'spec-sarah-jenkins',
    name: 'Dr. Sarah Jenkins, RD',
    role: 'Clinical Nutritionist & Lead Dietitian',
    specialty: 'Metabolic Health & Clinical Nutrition',
    rating: '4.9',
    reviewsCount: 142,
    avatar: 'https://i.pravatar.cc/150?img=47',
    experience: '12+ yrs experience',
    availableModes: ['Online', 'In-Clinic']
  },
  {
    id: 'spec-michael-roberts',
    name: 'Michael Roberts, MSc',
    role: 'Sports Dietitian & Performance Coach',
    specialty: 'Athletic Performance & Muscle Gain',
    rating: '4.8',
    reviewsCount: 98,
    avatar: 'https://i.pravatar.cc/150?img=11',
    experience: '8+ yrs experience',
    availableModes: ['Online', 'In-Clinic']
  },
  {
    id: 'spec-amanda-lee',
    name: 'Amanda Lee, RD',
    role: 'Weight Management Specialist',
    specialty: 'Sustainable Weight Loss & Habits',
    rating: '4.9',
    reviewsCount: 116,
    avatar: 'https://i.pravatar.cc/150?img=5',
    experience: '10+ yrs experience',
    availableModes: ['Online', 'In-Clinic']
  },
  {
    id: 'spec-emily-chen',
    name: 'Dr. Emily Chen, PhD',
    role: 'Gut Microbiome & Clinical Dietitian',
    specialty: 'IBS, Gut Health & Food Sensitivities',
    rating: '5.0',
    reviewsCount: 84,
    avatar: 'https://i.pravatar.cc/150?img=49',
    experience: '14+ yrs experience',
    availableModes: ['Online', 'In-Clinic']
  }
];

// Time Slots
export const MORNING_SLOTS = ['09:00 AM', '09:30 AM', '10:30 AM', '11:30 AM'];
export const AFTERNOON_SLOTS = ['01:30 PM', '02:30 PM', '03:30 PM', '04:30 PM', '05:30 PM'];

// Engine State
class NutriBookingEngine {
  constructor() {
    this.currentView = 'home';
    this.currentStep = 1;

    this.booking = {
      service: NUTRITION_SERVICES[0],
      specialist: NUTRITION_SPECIALISTS[0],
      method: 'Online', // 'Online' or 'In-Clinic'
      date: this._getDefaultDate(),
      time: '10:30 AM',
      name: '',
      email: '',
      phone: '',
      notes: '',
      paymentMethod: 'paynow'
    };

    this.confirmedAppointment = null;
    this.activeBranch = null;
  }

  init() {
    this._loadBranchContext();
    this._checkAuthDisplay();
    this._bindUrlParameters();
    this._renderServicesGrid();
    this._renderSpecialistsGrid();
    this._renderCalendar();
    this._renderTimeSlots();
    this.updateSummary();

    // Check URL to auto-open booking
    const url = new URL(window.location.href);
    const tab = url.searchParams.get('tab');
    const specParam = url.searchParams.get('specialist');
    const srvParam = url.searchParams.get('service');

    if (specParam) {
      const matchSpec = NUTRITION_SPECIALISTS.find(s => s.name.toLowerCase().includes(specParam.toLowerCase()) || s.id === specParam);
      if (matchSpec) this.booking.specialist = matchSpec;
    }
    if (srvParam) {
      const matchSrv = NUTRITION_SERVICES.find(s => s.id === srvParam || s.title.toLowerCase().includes(srvParam.toLowerCase()));
      if (matchSrv) this.booking.service = matchSrv;
    }

    if (tab === 'booking' || tab === 'book-wizard' || url.hash.includes('booking')) {
      this.navigateTo('booking');
    }
  }

  _getDefaultDate() {
    const d = new Date();
    d.setDate(d.getDate() + 1); // Tomorrow by default
    return d.toISOString().split('T')[0];
  }

  _loadBranchContext() {
    const url = new URL(window.location.href);
    const branchId = url.searchParams.get('branch');
    if (!branchId) return;

    try {
      const storedBranches = JSON.parse(localStorage.getItem('cliniva_branches') || '[]');
      const branch = storedBranches.find(b => b.id === branchId || b.slug === branchId);
      if (branch) {
        this.activeBranch = branch;
        // Update brand labels if present
        const brandEls = document.querySelectorAll('.branch-dynamic-name');
        brandEls.forEach(el => { el.innerText = branch.name; });
        const logoEls = document.querySelectorAll('.branch-dynamic-logo');
        logoEls.forEach(el => { el.innerText = branch.logoEmoji || '🥗'; });
      }
    } catch (e) {
      console.warn('[NutriFlow] Failed to load branch context:', e);
    }
  }

  _checkAuthDisplay() {
    const isLogged = localStorage.getItem('nutriflow_client_logged') === 'true';
    const clientName = localStorage.getItem('nutriflow_client_logged_name') || 'Sarah Jenkins';
    const authBtn = document.getElementById('nav-auth-btn');
    const authMobileBtn = document.getElementById('nav-mobile-auth-btn');

    if (authBtn) {
      if (isLogged) {
        authBtn.innerHTML = `
          <div class="flex items-center gap-2 text-primary font-bold text-xs bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl transition-all border border-emerald-200/60">
            <span class="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-[10px]">
              ${clientName.split(' ').map(n=>n[0]).join('').substring(0, 2)}
            </span>
            <span class="hidden sm:inline">${clientName}</span>
          </div>
        `;
        authBtn.onclick = () => { window.location.href = './dashboard.html'; };
      } else {
        authBtn.innerHTML = `Sign In`;
        authBtn.onclick = (e) => {
          e.preventDefault();
          this.openAuthModal();
        };
      }
    }

    if (authMobileBtn) {
      if (isLogged) {
        authMobileBtn.innerText = `Portal (${clientName})`;
        authMobileBtn.onclick = () => { window.location.href = './dashboard.html'; };
      } else {
        authMobileBtn.innerText = `Sign In`;
        authMobileBtn.onclick = (e) => {
          e.preventDefault();
          this.openAuthModal();
        };
      }
    }
  }

  _bindUrlParameters() {
    // Preserve ?branch= on links
    const url = new URL(window.location.href);
    const branch = url.searchParams.get('branch');
    if (branch) {
      document.querySelectorAll('a').forEach(a => {
        const href = a.getAttribute('href');
        if (href && !href.startsWith('#') && !href.startsWith('javascript') && !href.startsWith('mailto') && !href.startsWith('tel')) {
          try {
            const targetUrl = new URL(href, window.location.href);
            if (!targetUrl.searchParams.has('branch')) {
              targetUrl.searchParams.set('branch', branch);
              a.setAttribute('href', targetUrl.pathname + targetUrl.search + targetUrl.hash);
            }
          } catch(e) {}
        }
      });
    }
  }

  // ================= VIEW SWITCHING =================
  navigateTo(viewId) {
    this.currentView = viewId;

    const viewHome = document.getElementById('view-home');
    const viewBooking = document.getElementById('view-booking');
    const viewSuccess = document.getElementById('view-booking-success');

    if (viewHome) viewHome.classList.add('hidden');
    if (viewBooking) viewBooking.classList.add('hidden');
    if (viewSuccess) viewSuccess.classList.add('hidden');

    if (viewId === 'home') {
      if (viewHome) viewHome.classList.remove('hidden');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (viewId === 'booking') {
      if (viewBooking) viewBooking.classList.remove('hidden');
      this.goToStep(this.currentStep || 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (viewId === 'success') {
      if (viewSuccess) viewSuccess.classList.remove('hidden');
      this._renderSuccessView();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  // ================= STEPPER =================
  goToStep(stepNum) {
    this.currentStep = stepNum;

    // Hide all step bodies
    for (let i = 1; i <= 4; i++) {
      const el = document.getElementById(`booking-step-${i}`);
      if (el) el.classList.add('hidden');
    }

    const currentEl = document.getElementById(`booking-step-${stepNum}`);
    if (currentEl) currentEl.classList.remove('hidden');

    // Update Stepper Indicators
    this._updateStepperUI(stepNum);
    this.updateSummary();

    // Auto focus top of step container on mobile
    const container = document.getElementById('booking-wizard-content');
    if (container && window.innerWidth < 768) {
      container.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  _updateStepperUI(activeStep) {
    const progressLine = document.getElementById('wizard-progress-bar');
    if (progressLine) {
      const pct = ((activeStep - 1) / 3) * 100;
      progressLine.style.width = `${pct}%`;
    }

    for (let i = 1; i <= 4; i++) {
      const node = document.getElementById(`step-indicator-${i}`);
      const circle = document.getElementById(`step-circle-${i}`);
      const label = document.getElementById(`step-label-${i}`);

      if (!node || !circle) continue;

      if (i < activeStep) {
        // Completed step
        circle.className = 'w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs shadow-sm ring-4 ring-emerald-50 transition-all';
        circle.innerHTML = '<span class="material-symbols-outlined text-[18px]">check</span>';
        if (label) label.className = 'mt-1.5 text-[11px] font-bold text-primary transition-colors';
      } else if (i === activeStep) {
        // Active step
        circle.className = 'w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs shadow-md ring-4 ring-emerald-100 transition-all scale-105';
        circle.innerText = i;
        if (label) label.className = 'mt-1.5 text-[11px] font-black text-slate-900 transition-colors';
      } else {
        // Future step
        circle.className = 'w-9 h-9 rounded-full bg-white text-slate-400 border border-slate-200 flex items-center justify-center font-bold text-xs transition-all';
        circle.innerText = i;
        if (label) label.className = 'mt-1.5 text-[11px] font-medium text-slate-400 transition-colors';
      }
    }
  }

  // ================= STEP 1: SERVICES =================
  _renderServicesGrid() {
    const grid = document.getElementById('engine-services-grid');
    if (!grid) return;

    grid.innerHTML = NUTRITION_SERVICES.map(srv => {
      const isSelected = this.booking.service.id === srv.id;
      return `
        <div onclick="window.nutriBooking.selectService('${srv.id}')"
             class="group relative bg-white rounded-2xl border ${isSelected ? 'border-primary ring-2 ring-primary/20 shadow-md bg-emerald-50/20' : 'border-slate-200/80 hover:border-primary/50 hover:shadow-lg'} p-5 cursor-pointer transition-all flex flex-col justify-between">
          
          <!-- Selected Check Badge -->
          <div class="absolute top-4 right-4 z-10 w-6 h-6 rounded-full ${isSelected ? 'bg-primary text-white shadow-sm' : 'border border-slate-200 bg-white text-transparent group-hover:border-primary/40'} flex items-center justify-center transition-all">
            <span class="material-symbols-outlined text-[16px]">check</span>
          </div>

          <div>
            <!-- Image & Duration Badge -->
            <div class="relative w-full h-36 rounded-xl overflow-hidden mb-4 bg-slate-100">
              <img src="${srv.image}" alt="${srv.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
              <div class="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent"></div>
              
              <div class="absolute bottom-2.5 left-2.5 flex items-center gap-1.5">
                <span class="bg-white/90 backdrop-blur-xs text-slate-800 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-xs">
                  <span class="material-symbols-outlined text-[12px] text-primary">schedule</span>
                  ${srv.duration}
                </span>
                <span class="bg-emerald-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs">
                  ${srv.type}
                </span>
              </div>
            </div>

            <!-- Title & Description -->
            <div class="text-left">
              <span class="text-[10px] font-bold text-primary uppercase tracking-wider">${srv.category}</span>
              <h4 class="text-base font-bold text-slate-900 leading-snug mt-0.5 group-hover:text-primary transition-colors">${srv.title}</h4>
              <p class="text-xs text-slate-500 line-clamp-2 mt-1.5 leading-relaxed">${srv.description}</p>
            </div>
          </div>

          <!-- Price & Selection Indicator -->
          <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <div>
              <span class="text-[10px] text-slate-400 font-bold uppercase block">Session Fee</span>
              <span class="text-lg font-extrabold text-slate-900">$${srv.price}.00</span>
            </div>
            <button type="button" class="text-xs font-bold px-3.5 py-1.5 rounded-xl transition-all ${isSelected ? 'bg-primary text-white shadow-xs' : 'bg-slate-100 group-hover:bg-primary/10 text-slate-700 group-hover:text-primary'}">
              ${isSelected ? 'Selected' : 'Select'}
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  selectService(serviceId) {
    const match = NUTRITION_SERVICES.find(s => s.id === serviceId);
    if (match) {
      this.booking.service = match;
      this._renderServicesGrid();
      this.updateSummary();
    }
  }

  // ================= STEP 2: SPECIALIST & METHOD =================
  _renderSpecialistsGrid() {
    const grid = document.getElementById('engine-specialists-grid');
    if (!grid) return;

    grid.innerHTML = NUTRITION_SPECIALISTS.map(spec => {
      const isSelected = this.booking.specialist.id === spec.id;
      return `
        <div onclick="window.nutriBooking.selectSpecialist('${spec.id}')"
             class="group relative bg-white rounded-2xl border ${isSelected ? 'border-primary ring-2 ring-primary/20 shadow-md bg-emerald-50/20' : 'border-slate-200/80 hover:border-primary/50 hover:shadow-lg'} p-4 cursor-pointer transition-all flex items-center gap-4">
          
          <!-- Avatar -->
          <div class="relative shrink-0">
            <div class="w-14 h-14 rounded-full overflow-hidden border-2 ${isSelected ? 'border-primary' : 'border-slate-100'} shadow-sm">
              <img src="${spec.avatar}" alt="${spec.name}" class="w-full h-full object-cover">
            </div>
            <span class="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white"></span>
          </div>

          <!-- Info -->
          <div class="flex-1 text-left min-w-0">
            <div class="flex items-center gap-1.5">
              <h4 class="text-sm font-bold text-slate-900 truncate">${spec.name}</h4>
              <span class="flex items-center text-[10px] font-bold text-amber-500 bg-amber-50 px-1.5 py-0.5 rounded">
                ★ ${spec.rating}
              </span>
            </div>
            <p class="text-xs text-primary font-semibold truncate mt-0.5">${spec.role}</p>
            <p class="text-[11px] text-slate-400 truncate mt-0.5">${spec.specialty} • ${spec.experience}</p>
          </div>

          <!-- Radio Indicator -->
          <div class="shrink-0 w-5 h-5 rounded-full border ${isSelected ? 'border-primary bg-primary text-white' : 'border-slate-300 text-transparent'} flex items-center justify-center">
            <span class="material-symbols-outlined text-[14px]">check</span>
          </div>
        </div>
      `;
    }).join('');

    this._renderMethodButtons();
  }

  selectSpecialist(specialistId) {
    const match = NUTRITION_SPECIALISTS.find(s => s.id === specialistId);
    if (match) {
      this.booking.specialist = match;
      this._renderSpecialistsGrid();
      this.updateSummary();
    }
  }

  _renderMethodButtons() {
    const onlineBtn = document.getElementById('method-btn-online');
    const clinicBtn = document.getElementById('method-btn-clinic');

    if (onlineBtn && clinicBtn) {
      if (this.booking.method === 'Online') {
        onlineBtn.className = 'flex-1 p-4 rounded-2xl border-2 border-primary bg-emerald-50/40 text-left transition-all relative flex flex-col gap-1 shadow-sm';
        clinicBtn.className = 'flex-1 p-4 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 text-left transition-all relative flex flex-col gap-1';
        onlineBtn.querySelector('.method-check')?.classList.remove('hidden');
        clinicBtn.querySelector('.method-check')?.classList.add('hidden');
      } else {
        clinicBtn.className = 'flex-1 p-4 rounded-2xl border-2 border-primary bg-emerald-50/40 text-left transition-all relative flex flex-col gap-1 shadow-sm';
        onlineBtn.className = 'flex-1 p-4 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 text-left transition-all relative flex flex-col gap-1';
        clinicBtn.querySelector('.method-check')?.classList.remove('hidden');
        onlineBtn.querySelector('.method-check')?.classList.add('hidden');
      }
    }
  }

  selectMethod(method) {
    this.booking.method = method;
    this._renderMethodButtons();
    this.updateSummary();
  }

  // ================= STEP 3: CALENDAR & SLOTS =================
  _renderCalendar() {
    const container = document.getElementById('engine-calendar-grid');
    const monthYearLabel = document.getElementById('engine-calendar-month');
    if (!container) return;

    const today = new Date();
    const curYear = today.getFullYear();
    const curMonth = today.getMonth();

    if (monthYearLabel) {
      monthYearLabel.innerText = today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }

    const firstDayIndex = new Date(curYear, curMonth, 1).getDay();
    const daysInMonth = new Date(curYear, curMonth + 1, 0).getDate();
    const todayDay = today.getDate();

    let html = '';
    // Empty slots for alignment
    for (let i = 0; i < firstDayIndex; i++) {
      html += `<div class="p-2 text-center text-xs text-slate-300"></div>`;
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${curYear}-${String(curMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const isPast = day < todayDay;
      const isSelected = this.booking.date === dateStr;

      if (isPast) {
        html += `<div class="p-2.5 text-center text-xs text-slate-300 cursor-not-allowed font-medium">${day}</div>`;
      } else if (isSelected) {
        html += `
          <button type="button" onclick="window.nutriBooking.selectDate('${dateStr}')"
                  class="w-9 h-9 mx-auto rounded-xl bg-primary text-white font-bold text-xs flex items-center justify-center shadow-md ring-2 ring-emerald-200 transition-all">
            ${day}
          </button>
        `;
      } else {
        html += `
          <button type="button" onclick="window.nutriBooking.selectDate('${dateStr}')"
                  class="w-9 h-9 mx-auto rounded-xl hover:bg-emerald-50 text-slate-700 hover:text-primary font-semibold text-xs flex items-center justify-center transition-all">
            ${day}
          </button>
        `;
      }
    }

    container.innerHTML = html;
  }

  selectDate(dateStr) {
    this.booking.date = dateStr;
    this._renderCalendar();
    this.updateSummary();
  }

  _renderTimeSlots() {
    const morningContainer = document.getElementById('engine-morning-slots');
    const afternoonContainer = document.getElementById('engine-afternoon-slots');

    const renderSlots = (slots, container) => {
      if (!container) return;
      container.innerHTML = slots.map(slot => {
        const isSelected = this.booking.time === slot;
        return `
          <button type="button" onclick="window.nutriBooking.selectTime('${slot}')"
                  class="py-2 px-3 rounded-xl text-xs font-bold transition-all text-center ${
                    isSelected
                      ? 'bg-primary text-white shadow-sm ring-2 ring-primary/20'
                      : 'bg-white border border-slate-200 text-slate-700 hover:border-primary/50 hover:bg-emerald-50/30'
                  }">
            ${slot}
          </button>
        `;
      }).join('');
    };

    renderSlots(MORNING_SLOTS, morningContainer);
    renderSlots(AFTERNOON_SLOTS, afternoonContainer);
  }

  selectTime(timeStr) {
    this.booking.time = timeStr;
    this._renderTimeSlots();
    this.updateSummary();
  }

  // ================= STEP 4: DETAILS & PAYMENT =================
  selectPaymentMethod(methodKey) {
    this.booking.paymentMethod = methodKey;

    document.querySelectorAll('.engine-pay-option').forEach(el => {
      el.classList.remove('border-primary', 'bg-emerald-50/40', 'ring-2', 'ring-primary/20');
      el.classList.add('border-slate-200', 'bg-white');
      el.querySelector('.pay-check')?.classList.add('hidden');
    });

    const activeEl = document.getElementById(`pay-method-${methodKey}`);
    if (activeEl) {
      activeEl.classList.remove('border-slate-200', 'bg-white');
      activeEl.classList.add('border-primary', 'bg-emerald-50/40', 'ring-2', 'ring-primary/20');
      activeEl.querySelector('.pay-check')?.classList.remove('hidden');
    }

    this.updateSummary();
  }

  // ================= LIVE SUMMARY SIDEBAR =================
  updateSummary() {
    const srv = this.booking.service;
    const spec = this.booking.specialist;

    const subtotal = srv.price;
    const tax = +(subtotal * 0.07).toFixed(2); // 7% GST / Service Tax
    const total = +(subtotal + tax).toFixed(2);

    // Populate Sidebar elements
    const setInner = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.innerText = val;
    };

    setInner('summary-service-title', srv.title);
    setInner('summary-service-duration', srv.duration);
    setInner('summary-specialist-name', spec.name);
    setInner('summary-specialist-role', spec.role);
    setInner('summary-method-label', `${this.booking.method} Consultation`);

    // Date display
    try {
      const d = new Date(this.booking.date + 'T00:00:00');
      const formattedDate = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
      setInner('summary-datetime-label', `${formattedDate} at ${this.booking.time}`);
    } catch(e) {
      setInner('summary-datetime-label', `${this.booking.date} at ${this.booking.time}`);
    }

    setInner('summary-subtotal', `$${subtotal}.00`);
    setInner('summary-tax', `$${tax.toFixed(2)}`);
    setInner('summary-total', `$${total.toFixed(2)}`);

    // Image
    const imgEl = document.getElementById('summary-service-img');
    if (imgEl && imgEl.src !== srv.image) {
      imgEl.src = srv.image;
    }

    // Step 4 final review card
    setInner('review-service-title', srv.title);
    setInner('review-specialist-name', spec.name);
    setInner('review-method', this.booking.method);
    setInner('review-total-amount', `$${total.toFixed(2)}`);
  }

  // ================= SUBMISSION & AUTH INTERCEPTION =================
  handleStepSubmit(step) {
    if (step === 1) {
      this.goToStep(2);
    } else if (step === 2) {
      this.goToStep(3);
    } else if (step === 3) {
      this.goToStep(4);
    } else if (step === 4) {
      this._finalizeBooking();
    }
  }

  _finalizeBooking() {
    // Read input fields
    const name = document.getElementById('input-client-name')?.value.trim() || 'Valued Guest';
    const email = document.getElementById('input-client-email')?.value.trim() || '';
    const phone = document.getElementById('input-client-phone')?.value.trim() || '';
    const notes = document.getElementById('input-client-notes')?.value.trim() || '';

    if (!email) {
      this._showToast('Please enter your email address to receive confirmation.', 'warning');
      document.getElementById('input-client-email')?.focus();
      return;
    }

    this.booking.name = name;
    this.booking.email = email;
    this.booking.phone = phone;
    this.booking.notes = notes;

    const isLogged = localStorage.getItem('nutriflow_client_logged') === 'true';

    if (!isLogged) {
      // Prompt modal with options: Sign In, Demo Sign-In, or Continue as Guest
      this.openAuthModal((authedUser) => {
        if (authedUser) {
          this.booking.name = authedUser.name || name;
          this.booking.email = authedUser.email || email;
        }
        this._executeBookingConfirmation();
      });
    } else {
      this._executeBookingConfirmation();
    }
  }

  _executeBookingConfirmation() {
    const srv = this.booking.service;
    const spec = this.booking.specialist;
    const subtotal = srv.price;
    const tax = +(subtotal * 0.07).toFixed(2);
    const total = +(subtotal + tax).toFixed(2);
    const refCode = 'NF-' + Math.floor(1000 + Math.random() * 9000);

    const aptRecord = {
      id: `apt-${Date.now()}`,
      refCode: refCode,
      clientName: this.booking.name,
      clientEmail: this.booking.email,
      clientPhone: this.booking.phone,
      serviceId: srv.id,
      serviceTitle: srv.title,
      duration: srv.duration,
      specialistName: spec.name,
      specialistAvatar: spec.avatar,
      method: this.booking.method,
      date: this.booking.date,
      time: this.booking.time,
      price: total,
      subtotal: subtotal,
      tax: tax,
      paymentMethod: this.booking.paymentMethod,
      status: 'Confirmed',
      paymentStatus: this.booking.paymentMethod === 'clinic' ? 'Pay at Clinic' : 'Paid Online',
      createdAt: new Date().toISOString()
    };

    // Store in localStorage
    try {
      const existing = JSON.parse(localStorage.getItem('nutriflow_appointments') || '[]');
      existing.unshift(aptRecord);
      localStorage.setItem('nutriflow_appointments', JSON.stringify(existing));

      // Record transaction
      const txs = JSON.parse(localStorage.getItem('nutriflow_payment_transactions') || '[]');
      txs.unshift({
        id: `tx-${Date.now()}`,
        appointmentId: aptRecord.id,
        refCode: refCode,
        clientName: this.booking.name,
        serviceTitle: srv.title,
        amount: total,
        paymentMethod: this.booking.paymentMethod.toUpperCase(),
        status: aptRecord.paymentStatus,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
      });
      localStorage.setItem('nutriflow_payment_transactions', JSON.stringify(txs));
    } catch(e) {
      console.warn('[NutriFlow] Storage warning:', e);
    }

    this.confirmedAppointment = aptRecord;
    this._checkAuthDisplay();
    this.navigateTo('success');
  }

  _renderSuccessView() {
    const apt = this.confirmedAppointment;
    if (!apt) return;

    const setInner = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.innerText = val;
    };

    setInner('success-ref-code', apt.refCode);
    setInner('success-client-name', apt.clientName);
    setInner('success-service-title', apt.serviceTitle);
    setInner('success-specialist', apt.specialistName);
    setInner('success-method', `${apt.method} Consultation`);

    try {
      const d = new Date(apt.date + 'T00:00:00');
      const formattedDate = d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
      setInner('success-datetime', `${formattedDate} at ${apt.time}`);
    } catch(e) {
      setInner('success-datetime', `${apt.date} at ${apt.time}`);
    }

    setInner('success-amount', `$${apt.price.toFixed(2)}`);
    setInner('success-payment-status', apt.paymentStatus);
  }

  // ================= IN-PLACE AUTH MODAL =================
  openAuthModal(callback) {
    this._authCallback = callback || null;
    const modal = document.getElementById('nutriflow-login-modal');
    if (modal) {
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }
  }

  closeAuthModal() {
    const modal = document.getElementById('nutriflow-login-modal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  }

  continueAsGuest() {
    this.closeAuthModal();
    if (this._authCallback) {
      const cb = this._authCallback;
      this._authCallback = null;
      cb(null); // Proceed without user account
    }
  }

  demoSignIn() {
    localStorage.setItem('nutriflow_client_logged', 'true');
    localStorage.setItem('nutriflow_client_logged_name', 'Sarah Jenkins');
    localStorage.setItem('nutriflow_client_email', 'sarah.j@email.com');
    this._checkAuthDisplay();
    this.closeAuthModal();

    if (this._authCallback) {
      const cb = this._authCallback;
      this._authCallback = null;
      cb({ name: 'Sarah Jenkins', email: 'sarah.j@email.com' });
    } else {
      this._showToast('Welcome back, Sarah Jenkins!', 'success');
    }
  }

  handleCustomAuth(e) {
    e.preventDefault();
    const email = document.getElementById('auth-modal-email')?.value.trim();
    const password = document.getElementById('auth-modal-password')?.value;

    if (!email || !password) {
      this._showToast('Please enter both email and password.', 'warning');
      return;
    }

    // Register / Login user
    const derivedName = email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Valued Client';
    localStorage.setItem('nutriflow_client_logged', 'true');
    localStorage.setItem('nutriflow_client_logged_name', derivedName);
    localStorage.setItem('nutriflow_client_email', email);
    this._checkAuthDisplay();
    this.closeAuthModal();

    if (this._authCallback) {
      const cb = this._authCallback;
      this._authCallback = null;
      cb({ name: derivedName, email: email });
    } else {
      this._showToast(`Welcome, ${derivedName}!`, 'success');
    }
  }

  // ================= UTILITIES =================
  downloadInvoicePDF() {
    const apt = this.confirmedAppointment;
    this._showToast(`Downloading official invoice for Ref: ${apt ? apt.refCode : 'NF-Receipt'} (PDF simulated)...`, 'success');
  }

  resetBookingAndHome() {
    this.currentStep = 1;
    this.confirmedAppointment = null;
    this.navigateTo('home');
  }

  _showToast(msg, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] px-5 py-3 rounded-2xl text-xs font-bold shadow-2xl flex items-center gap-2 border transition-all animate-bounce ${
      type === 'success' ? 'bg-emerald-900 text-white border-emerald-700' :
      type === 'warning' ? 'bg-amber-900 text-white border-amber-700' :
      'bg-slate-900 text-white border-slate-700'
    }`;
    toast.innerHTML = `
      <span class="material-symbols-outlined text-[16px]">
        ${type === 'success' ? 'check_circle' : type === 'warning' ? 'warning' : 'info'}
      </span>
      <span>${msg}</span>
    `;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.remove();
    }, 3500);
  }
}

// Global Singleton Instance
export const nutriBooking = new NutriBookingEngine();
window.nutriBooking = nutriBooking;

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => nutriBooking.init());
} else {
  nutriBooking.init();
}

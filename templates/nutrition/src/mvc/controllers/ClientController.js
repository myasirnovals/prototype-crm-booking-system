/**
 * ClientController — Orchestrator untuk seluruh alur Client Portal.
 *
 * Menghubungkan Model ↔ View ↔ DOM events.
 * Menginisialisasi state, routing, form handlers, dan interaksi pengguna.
 *
 * SRS acuan: seluruh FR untuk Client App (AUTH, DASH, DIARY, SCAN, PROG, APPT, MSG, dll.)
 */
import { Store } from '../core/Store.js';
import { router } from '../core/Router.js';
import { toast } from '../core/Toast.js';
import { clientModel } from '../models/ClientModel.js';
import { diaryModel } from '../models/DiaryModel.js';
import { programModel } from '../models/ProgramModel.js';
import { appointmentModel } from '../models/AppointmentModel.js';
import { scanModel } from '../models/ScanModel.js';
import { offlineQueue } from '../core/OfflineQueue.js';

import { dashboardView } from '../views/DashboardView.js';
import { mealPlanView } from '../views/MealPlanView.js';
import { appointmentView } from '../views/AppointmentView.js';
import { profileView } from '../views/ProfileView.js';
import { bookingView } from '../views/BookingView.js';
import { chatView } from '../views/ChatView.js';
import { scannerView } from '../views/ScannerView.js';
import { nutritionChatView } from '../views/NutritionChatView.js';

export class ClientController {
  constructor() {
    this._bindEvents();
  }

  init() {
    // 1. Cek session
    this._checkSession();

    // 2. Load state dari localStorage via Store
    const store = Store.getInstance();
    store.loadFromStorage();

    // 3. Init model defaults
    clientModel.init();
    diaryModel.init();
    programModel.init();
    appointmentModel.init();
    scanModel.init();

    // 4. Beranda
    this._handleOnboarding();
    this._syncUI();
  }

  // ============ SESSION ============
  _checkSession() {
    const url = new URL(window.location);
    const isPreview = url.searchParams.get('preview') === 'true';
    const guest = url.searchParams.get('client');
    const progId = url.searchParams.get('programId');

    if (isPreview && (progId || guest)) {
      Store.getInstance().guestPreview = true;
      Store.getInstance().guestProgramId = progId;
      if (guest) {
        Store.getInstance().state.loggedClientName = guest;
        Store.getInstance().persist();
      }
      return;
    }

    const logged = localStorage.getItem('nutriflow_client_logged');
    if (logged !== 'true') {
      window.location.href = './login.html';
    }
  }

  _handleOnboarding() {
    const clientName = clientModel.getLoggedClientName();
    const seedClients = ['Sarah Jenkins', 'Marcus Reid', 'Elena Lopez'];
    const isTriggered = localStorage.getItem('nutriflow_trigger_onboarding') === 'true';
    const hasIntake = !!clientModel.getProfile(clientName);

    if (!hasIntake && !seedClients.includes(clientName)) {
      localStorage.removeItem('nutriflow_trigger_onboarding');
      setTimeout(() => {
        router.navigate('profile');
        setTimeout(() => {
          if (window.openOnboardingModal) window.openOnboardingModal();
        }, 500);
        toast.show('Welcome! Please complete your Medical Intake Profile.', 'info');
      }, 400);
    } else if (isTriggered) {
      localStorage.removeItem('nutriflow_trigger_onboarding');
      setTimeout(() => {
        router.navigate('profile');
        setTimeout(() => {
          if (window.openOnboardingModal) window.openOnboardingModal();
        }, 500);
        toast.show('Welcome! Please complete your Medical Intake Profile.', 'info');
      }, 400);
    }
  }

  _syncUI() {
    const clientName = clientModel.getLoggedClientName();
    router.navigate('dashboard');
    const welcome = document.getElementById('client-welcome-name-label');
    if (welcome) welcome.innerText = `Good morning, ${clientName.split(' ')[0]}!`;

    // Practitioner info
    const clients = clientModel.getClients();
    const info = clients.find((c) => c.name === clientName);
    const therapist = info?.therapist || 'Dr. Hasan';
    const docName = document.getElementById('dedicated-practitioner-name');
    const docAvatar = document.getElementById('dedicated-practitioner-avatar');
    if (docName) docName.innerText = therapist;
    if (docAvatar) docAvatar.innerText = therapist.split(' ').map((s) => s[0]).join('').substring(0, 2).toUpperCase();

    dashboardView.render();
    mealPlanView.render();
    appointmentView.render();
    profileView.render();

    if (Store.getInstance().guestPreview) {
      router.navigate('meal-plans');
      const links = document.getElementById('nav-links-container');
      if (links) links.classList.add('hidden');
      const right = document.getElementById('nav-right-container');
      if (right) {
        right.innerHTML = `<button onclick="openRegistrationModal()" class="bg-[#86f2e4] hover:bg-[#6be0d2] text-slate-800 font-extrabold text-[10px] uppercase tracking-wider px-4 py-2 rounded-xl transition-all cursor-pointer shadow-md">Register</button>`;
      }
      const banner = document.getElementById('guest-preview-banner');
      if (banner) {
        banner.classList.remove('hidden');
        banner.classList.add('flex');
        const sp = document.getElementById('guest-specialist-name');
        if (sp) sp.innerText = therapist;
      }
    }
  }

  // ============ BIND DOM EVENTS ============
  _bindEvents() {
    // Navigasi
    window.navigateTo = (viewId) => router.navigate(viewId);

    // Dashboard
    window.toggleWaterGlass = (index) => {
      const clientName = clientModel.getLoggedClientName();
      const current = clientModel.getWaterGlasses(clientName);
      clientModel.setWaterGlasses(clientName, index <= current ? index - 1 : index);
      dashboardView.render();
    };

    window.toggleLogMeal = (day, slotName) => {
      const clientName = clientModel.getLoggedClientName();
      diaryModel.toggleLogMeal(clientName, day, slotName);
      dashboardView.render();
      mealPlanView.render();
      toast.show(`Meal ${slotName} updated.`, 'success');
    };

    window.toggleMealAccordion = (slotName) => {
      if (window.innerWidth >= 768) return;
      document.querySelectorAll('.dashboard-meal-accordion-item').forEach((item) => {
        const body = item.querySelector('.accordion-body');
        const chevron = item.querySelector('.accordion-chevron');
        if (item.dataset.slot === slotName) {
          const hidden = body.classList.contains('hidden');
          if (hidden) { body.classList.remove('hidden'); if (chevron) chevron.classList.add('rotate-180'); }
          else { body.classList.add('hidden'); if (chevron) chevron.classList.remove('rotate-180'); }
        } else {
          if (body) body.classList.add('hidden');
          if (chevron) chevron.classList.remove('rotate-180');
        }
      });
    };

    // Meals
    window.selectMealDay = (day) => {
      mealPlanView.selectDay(day);
    };

    window.viewRecipeDetails = (title, type, image, kcal, p, c, fat, ...args) => {
      // Delegated to existing modal functions in main.js
    };

    // Appointments
    window.joinVideoCall = (aptId) => {
      const apt = appointmentModel.getAppointments().find((a) => a.id === aptId);
      if (!apt) return;
      const clientName = clientModel.getLoggedClientName();
      const clients = clientModel.getClients();
      const info = clients.find((c) => c.name === clientName);
      toast.show(`Connecting to video session with ${info?.therapist || 'Dr. Hasan'}...`, 'success');
      setTimeout(() => {
        window.location.href = `./telehealth.html?practitioner=${encodeURIComponent(info?.therapist || 'Dr. Hasan')}`;
      }, 850);
    };

    window.rescheduleAppointment = (aptId) => {
      document.getElementById('reschedule-apt-id').value = aptId;
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dateEl = document.getElementById('reschedule-date');
      if (dateEl) dateEl.value = tomorrow.toISOString().split('T')[0];
      const modal = document.getElementById('reschedule-modal');
      if (modal) { modal.classList.remove('hidden'); modal.classList.add('flex'); }
    };

    window.closeRescheduleModal = () => {
      const modal = document.getElementById('reschedule-modal');
      if (modal) { modal.classList.add('hidden'); modal.classList.remove('flex'); }
    };

    window.handleRescheduleSubmit = (e) => {
      e.preventDefault();
      const aptId = document.getElementById('reschedule-apt-id')?.value;
      const date = document.getElementById('reschedule-date')?.value;
      const time = document.getElementById('reschedule-time')?.value;
      if (appointmentModel.rescheduleAppointment(aptId, date, time)) {
        appointmentModel.persist();
        toast.show('Reschedule request submitted!', 'success');
      }
      window.closeRescheduleModal();
      appointmentView.render();
    };

    // Booking Wizard
    window.selectBookingService = (srvId) => bookingView.selectService(srvId);
    window.selectBookingMethod = (method) => bookingView.selectMethod(method);
    window.selectBookingDate = (dateStr) => bookingView.selectDate(dateStr);
    window.selectBookingSlot = (slot) => bookingView.selectSlot(slot);
    window.advanceBookingStep = (num) => bookingView.advanceStep(num);
    window.goBackToBookingStep = (num) => bookingView.goBack(num);
    window.resetBookingWizardStateAndExit = () => {
      bookingView.reset();
      router.navigate('appointments');
    };

    window.handleDetailsSubmit = (e) => {
      e.preventDefault();
      this._handlePaymentFlow();
    };

    window.processSimulatedPayment = () => {
      this._completePayment();
    };

    // Scanner
    window.openFoodScannerModal = () => scannerView.open();
    window.closeFoodScannerModal = () => scannerView.close();
    window.selectScanSample = (sampleId) => scannerView.selectSample(sampleId);
    window.handleImageUpload = (event) => {
      const input = event.target;
      if (!input) return;
      if (input.files && input.files[0]) {
        scannerView.handleImageUpload(input.files[0]);
      }
    };

    window.triggerBarcodeScan = () => {
      scannerView.handleBarcodeScan();
    };

    window.cancelBarcodeScan = () => {
      scannerView.cancelBarcodeScan();
    };

    window.applyScanEdits = () => {
      if (scannerView.applyEdits()) toast.show('Scan result updated. You can now log this meal.', 'success');
    };

    window.logScannedMeal = () => {
      const meal = scannerView.logMeal();
      if (!meal) return;
      const clientName = clientModel.getLoggedClientName();
      const day = mealPlanView.selectedDay;
      const slot = scannerView.activeScanSlot || 'Breakfast';
      diaryModel.addMeal(clientName, day, slot, meal);
      if (!navigator.onLine) offlineQueue.enqueue('diary-entry', { clientName, day, slot, meal });
      scannerView.close();
      dashboardView.render();
      mealPlanView.render();
      toast.show(navigator.onLine ? `Logged "${meal.title}" as ${slot}!` : `Saved offline. "${meal.title}" will sync when connected.`, 'success');
    };

    // Notifications
    window.toggleClientNotifications = (e) => {
      if (e) e.stopPropagation();
      const dd = document.getElementById('client-notifications-dropdown');
      if (!dd) return;
      dd.classList.toggle('hidden');
    };

    window.markClientNotificationsRead = () => {
      const dd = document.getElementById('client-notifications-dropdown');
      const badge = document.getElementById('client-notifications-badge');
      Store.getInstance().state.unreadNotifications = 0;
      Store.getInstance().persist();
      if (badge) badge.classList.add('hidden');
      setTimeout(() => { if (dd) dd.classList.add('hidden'); }, 1000);
    };

    // Chat
    window.handleProgramChatSubmit = (e) => {
      e.preventDefault();
      const input = document.getElementById('program-chat-input');
      if (!input) return;
      const text = input.value.trim();
      if (!text) return;
      const clientName = clientModel.getLoggedClientName();
      chatView.submitMessage(clientName, text);
      input.value = '';
      // Auto-reply
      setTimeout(() => {
        const msg = { sender: 'doctor', senderName: 'Dr. Hasan', text: `Thanks for your message! I'll review and get back to you shortly.`, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
        const clients = clientModel.getClients();
        const info = clients.find((c) => c.name === clientName);
        const progId = info?.activeProgramId || 'prog-sarah';
        programModel.addMessage(`${progId}_${clientName}`, msg);
        chatView.render();
      }, 2000);
    };

    // Nutrition Chat
    window.submitClientFoodChatMessage = () => {
      const input = document.getElementById('client-food-chat-input');
      if (!input) return;
      const text = input.value.trim();
      if (!text) return;
      const clientName = clientModel.getLoggedClientName();
      nutritionChatView.submitMessage(clientName, text);
      input.value = '';
    };

    window.triggerClientChatScanner = () => {
      scannerView.open('Discussion');
    };

    // Intake Form
    window.handleDedicatedIntakeSubmit = (e) => {
      if (e) e.preventDefault();
      const clientName = clientModel.getLoggedClientName();
      const name = document.getElementById('intake-page-name')?.value || clientName;
      const dob = document.getElementById('intake-page-dob')?.value || '';
      const sex = document.getElementById('intake-page-sex')?.value || 'Female';
      const height = parseFloat(document.getElementById('intake-page-height')?.value) || 0;
      const weight = parseFloat(document.getElementById('intake-page-weight')?.value) || 0;
      const targetWeight = parseFloat(document.getElementById('intake-page-target-weight')?.value) || 0;
      const goal = document.getElementById('intake-page-goal')?.value || 'Weight Loss & Fat Reduction';
      const dietPref = document.getElementById('intake-page-diet')?.value || 'None';
      const notes = document.getElementById('intake-page-notes')?.value || '';

      const allergies = [];
      document.querySelectorAll('input[name="intake-page-allergies"]:checked').forEach((cb) => allergies.push(cb.value));
      const conditions = [];
      document.querySelectorAll('input[name="intake-page-conditions"]:checked').forEach((cb) => conditions.push(cb.value));

      clientModel.saveProfile(clientName, { name, dob, sex, height, weight, targetWeight, goal, allergies, conditions, dietPref, notes });

      if (name !== clientName) {
        localStorage.setItem('nutriflow_client_logged_name', name);
      }

      // Update weight history
      if (weight > 0) {
        clientModel.addWeightEntry(clientName, weight);
      }

      const banner = document.getElementById('onboarding-incomplete-banner');
      if (banner) banner.classList.add('hidden');
      toast.show('Health profile saved successfully!', 'success');
      window.closeIntakeEditMode();
      profileView.render();
    };

    window.openIntakeEditMode = () => {
      const viewPanel = document.getElementById('intake-view-panel');
      const editPanel = document.getElementById('intake-edit-panel');
      const editBtn = document.getElementById('intake-edit-btn');
      if (viewPanel) viewPanel.classList.add('hidden');
      if (editPanel) editPanel.classList.remove('hidden');
      if (editBtn) editBtn.classList.add('hidden');
    };

    window.closeIntakeEditMode = () => {
      const viewPanel = document.getElementById('intake-view-panel');
      const editPanel = document.getElementById('intake-edit-panel');
      const editBtn = document.getElementById('intake-edit-btn');
      if (viewPanel) viewPanel.classList.remove('hidden');
      if (editPanel) editPanel.classList.add('hidden');
      if (editBtn) editBtn.classList.remove('hidden');
    };

    // Stats Log
    window.handleStatsLogSubmit = (e) => {
      e.preventDefault();
      const weight = parseFloat(document.getElementById('stats-weight')?.value);
      const waist = parseFloat(document.getElementById('stats-waist')?.value);
      const hip = parseFloat(document.getElementById('stats-hip')?.value);
      if (!weight || !waist || !hip) return;
      const clientName = clientModel.getLoggedClientName();
      clientModel.addWeightEntry(clientName, weight);
      clientModel.addMeasurementEntry(clientName, waist, hip);
      localStorage.setItem('nutriflow_last_logged_date', new Date().toDateString());
      toast.show('Stats logged successfully!', 'success');
      profileView.render();
    };

    // Review
    window.openLeaveReviewModal = (specialistName) => {
      const el = document.getElementById('review-specialist-name');
      const title = document.getElementById('review-modal-specialist-title');
      if (el) el.value = specialistName;
      if (title) title.innerText = specialistName;
      const modal = document.getElementById('leave-review-modal');
      if (modal) { modal.classList.remove('hidden'); modal.classList.add('flex'); }
    };

    window.closeLeaveReviewModal = () => {
      const modal = document.getElementById('leave-review-modal');
      if (modal) { modal.classList.add('hidden'); modal.classList.remove('flex'); }
    };

    window.setStarRating = (rating) => {
      document.querySelectorAll('#star-rating-picker .material-symbols-outlined').forEach((el, i) => {
        el.innerText = i < rating ? 'star' : 'star_border';
      });
      const input = document.getElementById('review-rating-value');
      if (input) input.value = rating;
    };

    window.handleReviewSubmit = (e) => {
      e.preventDefault();
      window.closeLeaveReviewModal();
      toast.show('Thank you for your review!', 'success');
    };

    // Registration Modal
    window.openRegistrationModal = () => {
      const modal = document.getElementById('registration-modal');
      if (modal) { modal.classList.remove('hidden'); modal.classList.add('flex'); }
      const nameInput = document.getElementById('reg-name');
      if (nameInput) nameInput.value = clientModel.getLoggedClientName();
    };

    window.closeRegistrationModal = () => {
      const modal = document.getElementById('registration-modal');
      if (modal) { modal.classList.add('hidden'); modal.classList.remove('flex'); }
    };

    window.handleRegistrationSubmit = (e) => {
      e.preventDefault();
      const name = document.getElementById('reg-name')?.value;
      const email = document.getElementById('reg-email')?.value;
      if (name && email) {
        localStorage.setItem('nutriflow_client_logged', 'true');
        localStorage.setItem('nutriflow_client_logged_name', name);
        window.closeRegistrationModal();
        window.location.reload();
      }
    };

    // Payment Gateway
    window.selectCheckoutPaymentMethod = (key) => {
      document.querySelectorAll('.pay-method-opt').forEach((el) => {
        el.className = 'pay-method-opt bg-surface border border-outline-variant/30 rounded-xl p-3 cursor-pointer hover:border-primary transition-all flex flex-col items-center text-center gap-1.5 active:scale-95';
      });
      const opt = document.getElementById(`pay-opt-${key}`);
      if (opt) opt.className = 'pay-method-opt bg-surface border-2 border-primary rounded-xl p-3 cursor-pointer hover:border-primary transition-all flex flex-col items-center text-center gap-1.5 active:scale-95 shadow-sm';
      const input = document.getElementById('selected-checkout-pay-method');
      if (input) input.value = key;
    };

    window.openPaymentGatewayModal = (apt) => {
      this._pendingApt = apt;
      const method = document.getElementById('selected-checkout-pay-method')?.value || 'qr';
      ['qr', 'ewallet', 'fpx', 'card'].forEach((k) => {
        const v = document.getElementById(`gateway-view-${k}`);
        if (v) { v.classList.add('hidden'); v.classList.remove('flex'); }
      });
      const target = document.getElementById(`gateway-view-${method}`);
      if (target) { target.classList.remove('hidden'); target.classList.add('flex'); }
      const total = document.getElementById('gateway-total-amount');
      if (total) total.innerText = `RM${apt.price}.00 MYR`;
      const modal = document.getElementById('payment-gateway-modal');
      if (modal) { modal.classList.remove('hidden'); modal.classList.add('flex'); }
      const btn = document.getElementById('gateway-submit-btn');
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = `<span class="material-symbols-outlined text-[18px]">verified</span> Complete Payment (RM${apt.price}.00)`;
      }
    };

    window.closePaymentGatewayModal = () => {
      const modal = document.getElementById('payment-gateway-modal');
      if (modal) { modal.classList.add('hidden'); modal.classList.remove('flex'); }
    };

    // Member/Plan
    window.openMembershipModal = () => {
      const modal = document.getElementById('membership-modal');
      if (modal) { modal.classList.remove('hidden'); modal.classList.add('flex'); }
    };
    window.closeMembershipModal = () => {
      const modal = document.getElementById('membership-modal');
      if (modal) { modal.classList.add('hidden'); modal.classList.remove('flex'); }
    };

    // Help
    window.toggleFAQItem = (el) => {
      const content = el.nextElementSibling;
      const chevron = el.querySelector('.chevron-icon');
      if (content) content.classList.toggle('hidden');
      if (chevron) chevron.classList.toggle('rotate-180');
    };
    window.filterHelpFAQ = () => {
      const q = (document.getElementById('help-search')?.value || '').toLowerCase();
      document.querySelectorAll('.faq-item').forEach((item) => {
        item.style.display = item.innerText.toLowerCase().includes(q) ? '' : 'none';
      });
    };
    window.filterHelpTopic = (topic) => {
      document.querySelectorAll('.faq-item').forEach((item) => {
        item.style.display = item.dataset.topic === topic || topic === 'all' ? '' : 'none';
      });
      document.querySelectorAll('.topic-card').forEach((c) => {
        c.classList.toggle('ring-2', c.querySelector('span')?.innerText.toLowerCase().includes(topic) || topic === 'all');
      });
    };

    // Sign Out
    window.handleClientSignOut = () => {
      localStorage.removeItem('nutriflow_client_logged');
      localStorage.removeItem('nutriflow_client_logged_name');
      toast.show('Signed out.');
      setTimeout(() => { window.location.href = './login.html'; }, 400);
    };
  }

  _handlePaymentFlow() {
    const name = document.getElementById('details-name')?.value || 'Client';
    const email = document.getElementById('details-email')?.value || '';
    const phone = document.getElementById('details-phone')?.value || '';
    const concerns = document.getElementById('details-concerns')?.value || '';

    const services = bookingView.currentTherapistServices;
    const srv = services.find((s) => s.id === bookingView.flow.selectedServiceId) || services[0] || { id: 'default', title: 'Consultation', price: 150, duration: '60 min' };

    const apt = {
      id: `apt-${Date.now()}`,
      clientName: name,
      clientEmail: email,
      clientPhone: phone,
      serviceId: srv.id,
      serviceTitle: srv.title,
      price: srv.price || 150,
      duration: srv.duration || '60 min',
      therapist: bookingView.flow.selectedSpecialist || 'Dr. Hasan',
      date: bookingView.flow.selectedDate || new Date().toISOString().split('T')[0],
      time: bookingView.flow.selectedSlot || '10:00 AM',
      status: 'pending',
      paymentStatus: 'pending',
      type: bookingView.flow.selectedMethod || 'Online',
      concerns,
      uploadedFile: bookingView.flow.uploadedFile || null,
    };

    window.openPaymentGatewayModal(apt);
  }

  _completePayment() {
    const apt = this._pendingApt;
    if (!apt) return;

    const method = document.getElementById('selected-checkout-pay-method')?.value || 'qr';
    const methodNames = { qr: 'PayNow SG', ewallet: 'GrabPay', fpx: 'FAST Transfer', card: 'Visa/MC' };
    apt.status = 'approved';
    apt.paymentStatus = 'paid';
    apt.paymentMethod = methodNames[method] || 'PayNow SG';

    appointmentModel.addAppointment(apt);
    appointmentModel.persist();

    // Record transaction
    const txKey = 'nutriflow_payment_transactions';
    const txs = JSON.parse(localStorage.getItem(txKey) || '[]');
    txs.unshift({
      id: `tx-${Date.now()}`,
      appointmentId: apt.id,
      clientName: apt.clientName,
      serviceTitle: apt.serviceTitle,
      amount: apt.price,
      paymentMethod: methodNames[method] || 'PayNow SG',
      status: 'paid',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
    });
    localStorage.setItem(txKey, JSON.stringify(txs));

    window.closePaymentGatewayModal();

    // Success screen
    document.getElementById('success-service-title').innerText = apt.serviceTitle;
    document.getElementById('success-date').innerText = new Date(apt.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    document.getElementById('success-time').innerText = apt.time;
    document.getElementById('success-practitioner').innerText = apt.therapist;
    document.getElementById('success-method').innerText = `${apt.type} Session`;
    document.getElementById('success-price').innerText = `RM${apt.price}.00 MYR (PAID via ${methodNames[method]})`;

    bookingView.advanceStep(5);
    toast.show(`Payment successful! Confirmed via ${methodNames[method]}.`, 'success');
    this._pendingApt = null;
  }
}

// Singleton instance
export const clientController = new ClientController();

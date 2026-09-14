/**
 * BookingView — Render booking wizard: service selection, method, date/time, details, payment, success.
 *
 * SRS acuan: FR-APPT-01..09, FR-SVC-01..03, FR-PAY-01..07.
 */
import { clientModel } from '../models/ClientModel.js';
import { appointmentModel } from '../models/AppointmentModel.js';

export class BookingView {
  constructor() {
    this.flow = {
      step: 1,
      selectedServiceId: null,
      selectedSpecialist: null,
      selectedMethod: null,
      selectedDate: null,
      selectedSlot: null,
      uploadedFile: null,
    };
    this.currentTherapistServices = [];
  }

  render() {
    this._renderStepper();
    this._showCurrentStep();
  }

  _renderStepper() {
    const step = this.flow.step;
    const stepperContainer = document.getElementById('booking-stepper-container');
    const wizardHeader = document.getElementById('booking-wizard-header');

    if (step === 5) {
      if (stepperContainer) stepperContainer.classList.add('hidden');
      if (wizardHeader) wizardHeader.classList.add('hidden');
    } else {
      if (stepperContainer) stepperContainer.classList.remove('hidden');
      if (wizardHeader) wizardHeader.classList.remove('hidden');
    }

    for (let i = 1; i <= 4; i++) {
      const node = document.getElementById(`step-node-${i}`);
      if (!node) continue;
      const circle = node.querySelector('.rounded-full');
      const line = document.getElementById('booking-stepper-progress-line');

      if (i < step) {
        node.className = 'relative z-10 flex flex-col items-center bg-surface px-1 md:px-2';
        if (circle) {
          circle.className = 'w-8 h-8 md:w-10 md:h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs md:text-label-md shadow-md';
          circle.innerHTML = '<span class="material-symbols-outlined text-sm md:text-[16px]">check</span>';
        }
      } else if (i === step) {
        node.className = 'relative z-10 flex flex-col items-center bg-surface px-1 md:px-2';
        if (circle) {
          circle.className = 'w-8 h-8 md:w-10 md:h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs md:text-label-md shadow-md';
          circle.innerText = i;
        }
      } else {
        node.className = 'relative z-10 flex flex-col items-center bg-surface px-1 md:px-2';
        if (circle) {
          circle.className = 'w-8 h-8 md:w-10 md:h-10 rounded-full bg-surface text-on-surface-variant border-2 border-surface-variant flex items-center justify-center font-bold text-xs md:text-label-md';
          circle.innerText = i;
        }
      }

      if (line) {
        if (step === 1) line.style.width = '0%';
        if (step === 2) line.style.width = '33%';
        if (step === 3) line.style.width = '66%';
        if (step >= 4) line.style.width = '100%';
      }
    }
  }

  _showCurrentStep() {
    document.querySelectorAll('.booking-step-container').forEach((c) => c.classList.add('hidden'));
    const current = document.getElementById(`booking-step-${this.flow.step}`);
    if (current) current.classList.remove('hidden');

    if (this.flow.step === 1) this._renderStep1();
    if (this.flow.step === 3) this._renderStep3();
    if (this.flow.step === 4) this._renderStep4();
  }

  _renderStep1() {
    const grid = document.getElementById('booking-services-grid');
    if (!grid) return;

    const clientName = clientModel.getLoggedClientName();
    const clients = clientModel.getClients();
    const clientDetails = clients.find((c) => c.name === clientName);
    const therapist = clientDetails?.therapist || 'Dr. Hasan';
    this.flow.selectedSpecialist = therapist;

    let services = appointmentModel.getServices(therapist);
    if (!services.length) {
      services = [
        { id: 'srv-hasan-1', title: 'Weight Loss Consultation', description: 'A dedicated session focusing on weight loss strategies.', duration: '60 min', type: 'Virtual or In-Person', price: 150, image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=500' },
        { id: 'srv-hasan-2', title: 'Weekly Meal Review', description: 'A 30-minute check-in to adjust your weekly calorie limits.', duration: '30 min', type: 'Virtual Only', price: 75, image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=500' },
      ];
      appointmentModel.setServices(therapist, services);
    }
    this.currentTherapistServices = services;

    grid.innerHTML = services
      .map((srv) => {
        const selected = this.flow.selectedServiceId === srv.id;
        return `
          <div onclick="selectBookingService('${srv.id}')" class="service-card rounded-2xl overflow-hidden cursor-pointer flex flex-col h-full bg-white relative group border ${selected ? 'border-primary ring-2 ring-primary bg-surface' : 'border-outline-variant/30 hover:border-primary/50'}">
            <div class="absolute top-3 right-3 z-10 ${selected ? 'opacity-100' : 'opacity-0'} group-hover:opacity-100 transition-opacity">
              <span class="material-symbols-outlined text-primary bg-white rounded-full p-1 shadow-sm">check_circle</span>
            </div>
            <div class="h-32 w-full relative overflow-hidden shrink-0">
              <img class="w-full h-full object-cover" src="${srv.image}" alt="${srv.title}" loading="lazy">
              <div class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
            </div>
            <div class="p-4 flex flex-col flex-grow text-left">
              <h3 class="font-bold text-on-surface text-sm leading-tight mb-1">${srv.title}</h3>
              <p class="text-[10px] text-on-surface-variant flex-grow line-clamp-2 leading-relaxed mb-3">${srv.description}</p>
              <div class="flex items-center gap-3 text-[10px] text-on-surface-variant font-medium mb-3">
                <div class="flex items-center gap-1"><span class="material-symbols-outlined text-secondary text-[14px]" aria-hidden="true">schedule</span><span>${srv.duration}</span></div>
                <span>•</span>
                <div class="flex items-center gap-1"><span class="material-symbols-outlined text-secondary text-[14px]" aria-hidden="true">payments</span><span>$${srv.price}</span></div>
              </div>
            </div>
          </div>`;
      })
      .join('');

    const nextBtn = document.getElementById('booking-next-btn-1');
    if (nextBtn) {
      if (this.flow.selectedServiceId) {
        nextBtn.classList.remove('opacity-50', 'cursor-not-allowed');
        nextBtn.disabled = false;
      } else {
        nextBtn.classList.add('opacity-50', 'cursor-not-allowed');
        nextBtn.disabled = true;
      }
    }
  }

  _renderStep3() {
    // Render calendar + time slots
    const srv = this.currentTherapistServices.find((s) => s.id === this.flow.selectedServiceId) || this.currentTherapistServices[0];
    if (!srv) return;

    const setText = (id, val) => { const el = document.getElementById(id); if (el) el.innerText = val; };
    setText('booking-summary-service-img', (img) => { if (img) img.src = srv.image || 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=500'; });
    document.getElementById('booking-summary-service-img').src = srv.image || 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=500';
    setText('booking-summary-service-title', srv.title);
    setText('booking-summary-service-duration', srv.duration);
    setText('booking-summary-service-therapist', this.flow.selectedSpecialist || 'Dr. Hasan');
    setText('booking-summary-service-method', `${this.flow.selectedMethod || 'Online'} Consultation`);
    setText('booking-summary-service-cost', `$${srv.price}.00`);

    // Calendar grid
    const grid = document.getElementById('booking-calendar-grid');
    if (!grid) return;
    const today = new Date();
    const curYear = today.getFullYear();
    const curMonth = today.getMonth();
    const firstDay = new Date(curYear, curMonth, 1).getDay();
    const totalDays = new Date(curYear, curMonth + 1, 0).getDate();
    const prevTotal = new Date(curYear, curMonth, 0).getDate();

    setText('calendar-month-year', `${today.toLocaleString('default', { month: 'long' })} ${curYear}`);

    let daysHtml = '';
    for (let i = firstDay - 1; i >= 0; i--) {
      daysHtml += `<div class="p-3 text-center text-xs font-semibold text-outline-variant/30">${prevTotal - i}</div>`;
    }
    const todayDayNum = today.getDate();
    for (let day = 1; day <= totalDays; day++) {
      const dateStr = `${curYear}-${String(curMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const isSelected = this.flow.selectedDate === dateStr;
      const isPast = day < todayDayNum;
      let cls = 'p-3 text-center text-xs font-semibold rounded-lg cursor-pointer transition-all ';
      if (isSelected) cls += 'bg-primary text-white shadow-md font-bold';
      else if (isPast) cls += 'text-outline-variant/30 cursor-not-allowed';
      else cls += 'hover:bg-surface-container-low text-on-background';
      daysHtml += `<div ${isPast ? '' : `onclick="selectBookingDate('${dateStr}')"`} class="${cls}">${day}</div>`;
    }
    const used = firstDay + totalDays;
    const rem = (7 - (used % 7)) % 7;
    for (let day = 1; day <= rem; day++) {
      daysHtml += `<div class="p-3 text-center text-xs font-semibold text-outline-variant/30">${day}</div>`;
    }
    grid.innerHTML = daysHtml;

    // Time slots
    const morningHtml = this._buildSlots(['08:00 AM', '09:00 AM', '09:30 AM', '10:30 AM'], 'booking-morning-slots');
    const afternoonHtml = this._buildSlots(['01:00 PM', '02:30 PM', '04:00 PM', '04:30 PM'], 'booking-afternoon-slots');
    document.getElementById('booking-morning-slots').innerHTML = morningHtml;
    document.getElementById('booking-afternoon-slots').innerHTML = afternoonHtml;

    const nextBtn = document.getElementById('booking-next-btn-3');
    if (nextBtn) {
      if (this.flow.selectedDate && this.flow.selectedSlot) {
        nextBtn.classList.remove('opacity-50', 'cursor-not-allowed');
        nextBtn.disabled = false;
      } else {
        nextBtn.classList.add('opacity-50', 'cursor-not-allowed');
        nextBtn.disabled = true;
      }
    }
  }

  _buildSlots(slots, containerId) {
    return slots
      .map((slot) => {
        const isSelected = this.flow.selectedSlot === slot;
        const isBooked = slot === '04:30 PM';
        let cls = 'w-full py-2.5 rounded-xl border text-xs font-bold transition-all text-center ';
        if (isSelected) cls += 'bg-primary border-primary text-white shadow-sm';
        else if (isBooked) cls += 'bg-surface-container border-outline-variant/10 text-outline-variant/30 cursor-not-allowed';
        else cls += 'bg-surface border-outline-variant/40 text-on-surface-variant hover:border-primary hover:text-primary';
        return `<button ${isBooked ? '' : `onclick="selectBookingSlot('${slot}')"`} class="${cls}">${slot}</button>`;
      })
      .join('');
  }

  _renderStep4() {
    const clientName = clientModel.getLoggedClientName();
    const nameInput = document.getElementById('details-name');
    const emailInput = document.getElementById('details-email');
    if (nameInput && !nameInput.value) nameInput.value = clientName;
    if (emailInput && !emailInput.value) {
      emailInput.value = `${clientName.toLowerCase().replace(/\s+/g, '.')}@email.com`;
    }
  }

  selectService(srvId) {
    this.flow.selectedServiceId = srvId;
    this.render();
  }

  selectMethod(method) {
    this.flow.selectedMethod = method;
    document.querySelectorAll('.method-card').forEach((card) => {
      card.className = 'method-card bg-surface border border-outline-variant/30 rounded-2xl p-5 cursor-pointer hover:border-primary/50 transition-all flex flex-col gap-3 relative group';
      const ind = card.querySelector('.check-indicator');
      if (ind) ind.classList.add('opacity-0');
    });
    const active = document.getElementById(`method-card-${method}`);
    if (active) {
      active.className = 'method-card bg-surface border border-primary ring-2 ring-primary rounded-2xl p-5 cursor-pointer transition-all flex flex-col gap-3 relative group';
      const ind = active.querySelector('.check-indicator');
      if (ind) ind.classList.remove('opacity-0');
    }
    const btn = document.getElementById('booking-next-btn-2');
    if (btn) {
      btn.classList.remove('opacity-50', 'cursor-not-allowed');
      btn.disabled = false;
    }
  }

  selectDate(dateStr) {
    this.flow.selectedDate = dateStr;
    this.flow.selectedSlot = null;
    this.render();
  }

  selectSlot(slot) {
    this.flow.selectedSlot = slot;
    this.render();
  }

  advanceStep(num) {
    this.flow.step = num;
    this.render();
  }

  goBack(num) {
    this.flow.step = num;
    this.render();
  }

  reset() {
    this.flow = { step: 1, selectedServiceId: null, selectedSpecialist: null, selectedMethod: null, selectedDate: null, selectedSlot: null, uploadedFile: null };
    this.currentTherapistServices = [];
  }
}

export const bookingView = new BookingView();

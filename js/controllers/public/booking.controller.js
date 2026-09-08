/**
 * Cliniva — Booking Controller
 * SOLID: Single Responsibility for Booking Form DOM events, Multi-Template Switching & Real Reservation Persistence
 */

import { CLINIC_BRANCHES, CLINIC_SERVICES, PRACTITIONERS } from "../../config/clinic-data.js";
import { bookingService } from "../../services/booking.service.js";
import { soundService } from "../../services/sound.service.js";
import { i18nService } from "../../services/i18n.service.js";

export class BookingController {
  constructor(uiController) {
    this.ui = uiController;
    this.activeTemplate = bookingService.getActiveTemplateId() || "tcm";
    this.selectedBranch = "sg-orchard";
    this.selectedService = null;
    this.selectedPractitioner = "Dr. Wong Mei Ling";
    this.selectedSlot = "10:30";
    this.selectedPainSpots = new Set(["Lower Back / Lumbar"]);
    this.patientName = "Amanda Tan";
    this.patientPhone = "+65 8123 4567";
  }

  init() {
    this.setupTemplateSwitcher();
    this.renderServiceCards();
    this.renderPractitionerSelect();
    this.setupBranchPicker();
    this.setupSlotSelection();
    this.setupIntakeInteractions();
    this.setupPatientInputs();
    this.setupCheckoutButton();
    this.startInitialSlotHold();
    this.updateSummary();

    document.addEventListener("cliniva:languageChanged", () => {
      this.renderServiceCards();
      this.renderPractitionerSelect();
      this.updateSummary();
    });
  }

  /* -------------------------------------------------------------
   * 1. TEMPLATE SWITCHER (TCM vs WELLNESS / SPA)
   * ------------------------------------------------------------- */
  setupTemplateSwitcher() {
    const pills = document.querySelectorAll(".template-pill");
    pills.forEach((pill) => {
      pill.addEventListener("click", () => {
        const targetTemplate = pill.dataset.template;
        if (!targetTemplate) return;

        pills.forEach((p) => {
          p.classList.remove("active");
          p.style.borderColor = "transparent";
        });
        pill.classList.add("active");
        pill.style.borderColor = "var(--primary)";

        this.activeTemplate = targetTemplate;
        bookingService.setActiveTemplate(targetTemplate);
        soundService.playClickTone();

        // Toggle Intake Section Visibility
        const tcmIntake = document.getElementById("bookingIntakeTcm");
        const wellnessIntake = document.getElementById("bookingIntakeWellness");
        if (tcmIntake) tcmIntake.style.display = targetTemplate === "tcm" ? "block" : "none";
        if (wellnessIntake) wellnessIntake.style.display = targetTemplate === "wellness" ? "block" : "none";

        this.renderServiceCards();
        this.renderPractitionerSelect();
        this.updateSummary();
      });
    });
  }

  /* -------------------------------------------------------------
   * 2. DYNAMIC SERVICE CARDS RENDERING
   * ------------------------------------------------------------- */
  renderServiceCards() {
    const container = document.getElementById("bookingServiceCards");
    if (!container) return;

    const services = bookingService.getServices(this.activeTemplate);
    if (!services || services.length === 0) return;

    // Retain selected service if it belongs to current template, otherwise default to first
    const prevSelectedId = this.selectedService ? this.selectedService.id : null;
    this.selectedService = services.find((s) => s.id === prevSelectedId) || services[0];

    const branch = CLINIC_BRANCHES.find((b) => b.id === this.selectedBranch) || CLINIC_BRANCHES[0];
    const isMY = branch.region === "my";

    const badgeMap = {
      "Best Seller": "badge.bestSeller",
      "Recommended": "badge.recommended",
      "Luxury": "badge.luxury",
      "Most Popular": "badge.mostPopular",
      "Popular": "badge.mostPopular",
      "Essential": "badge.essential",
      "Signature": "badge.signature"
    };

    container.innerHTML = services.map((s) => {
      const depositLabel = i18nService.t("booking.sumDepositPrefix", "Deposit");
      const serviceName = s.nameI18n ? i18nService.t(s.nameI18n, s.name) : s.name;
      const serviceDesc = s.descriptionI18n ? i18nService.t(s.descriptionI18n, s.description) : s.description;
      const minLabel = i18nService.t("common.min", "min");
      const badgeKey = s.badge ? badgeMap[s.badge] : null;
      const translatedBadge = badgeKey ? i18nService.t(badgeKey, s.badge) : (s.badge || "");

      const priceStr = isMY ? `MYR ${s.priceMYR}` : `SGD ${s.priceSGD}`;
      const depositStr = isMY ? `${depositLabel} MYR ${s.depositMYR}` : `${depositLabel} SGD ${s.depositSGD}`;
      const activeClass = s.id === this.selectedService.id ? "active" : "";
      const badgeHtml = s.badge ? `<span class="pill" style="font-size:10px; padding:2px 8px; float:right; background:rgba(15,118,110,0.1); color:var(--primary); font-weight:800;">${translatedBadge}</span>` : "";

      return `
        <div class="service-card ${activeClass}" data-service-id="${s.id}" style="cursor:pointer;">
          ${badgeHtml}
          <h4 style="margin-top:2px;">${serviceName}</h4>
          <small style="color:var(--primary-dark); font-weight:700;">${s.durationMinutes} ${minLabel} · ${priceStr}</small>
          <p style="font-size:11px; color:var(--muted); margin-top:6px; line-height:1.4;">${serviceDesc}</p>
          <div style="font-size:11px; font-weight:700; color:var(--text); margin-top:8px;">${depositStr}</div>
        </div>
      `;
    }).join("");

    // Setup click handlers
    const cards = container.querySelectorAll(".service-card");
    cards.forEach((card) => {
      card.addEventListener("click", () => {
        cards.forEach((c) => c.classList.remove("active"));
        card.classList.add("active");

        const sId = card.dataset.serviceId;
        this.selectedService = services.find((s) => s.id === sId) || services[0];
        soundService.playClickTone();
        this.updateSummary();
      });
    });
  }

  /* -------------------------------------------------------------
   * 3. PRACTITIONER SELECTOR
   * ------------------------------------------------------------- */
  renderPractitionerSelect() {
    const select = document.getElementById("bookingPractitionerSelect");
    if (!select) return;

    const practitioners = bookingService.getPractitioners(this.selectedBranch, this.activeTemplate);
    if (!practitioners || practitioners.length === 0) return;

    const prevSelectedName = this.selectedPractitioner;
    const activePrac = practitioners.find((p) => p.name === prevSelectedName) || practitioners[0];
    this.selectedPractitioner = activePrac.name;

    select.innerHTML = practitioners.map((p) => {
      const selected = p.name === this.selectedPractitioner ? "selected" : "";
      const pTitle = p.titleI18n ? i18nService.t(p.titleI18n, p.title) : p.title;
      return `<option value="${p.name}" ${selected}>${p.name} — ${pTitle} (${p.specialty})</option>`;
    }).join("");

    select.addEventListener("change", (e) => {
      this.selectedPractitioner = e.target.value;
      soundService.playClickTone();
      this.updateSummary();
    });
  }

  /* -------------------------------------------------------------
   * 4. BRANCH & SLOT PICKERS
   * ------------------------------------------------------------- */
  setupBranchPicker() {
    const branchSelect = document.getElementById("bookingBranchSelect");
    if (branchSelect) {
      branchSelect.addEventListener("change", (e) => {
        this.selectedBranch = e.target.value;
        soundService.playClickTone();
        this.renderPractitionerSelect();
        this.renderServiceCards();
        this.updateSummary();
      });
    }
  }

  setupSlotSelection() {
    const slots = document.querySelectorAll("#bookingSlotGrid .slot");
    slots.forEach((slot) => {
      slot.addEventListener("click", () => {
        slots.forEach((item) => item.classList.remove("active"));
        slot.classList.add("active");

        this.selectedSlot = slot.textContent.trim();
        soundService.playClickTone();
        this.startInitialSlotHold();
        this.updateSummary();
      });
    });
  }

  /* -------------------------------------------------------------
   * 5. INTAKE & PATIENT INPUTS
   * ------------------------------------------------------------- */
  setupIntakeInteractions() {
    // TCM Pain Map Spot Tags
    const painTags = document.querySelectorAll("#bookingPainSpotsGrid .pain-spot-tag");
    painTags.forEach((tag) => {
      tag.addEventListener("click", () => {
        const spot = tag.dataset.spot || tag.textContent.trim();
        if (this.selectedPainSpots.has(spot)) {
          this.selectedPainSpots.delete(spot);
          tag.classList.remove("active");
        } else {
          this.selectedPainSpots.add(spot);
          tag.classList.add("active");
        }
        soundService.playClickTone();
      });
    });

    // Wellness Aroma & Pressure
    const aromaSelect = document.getElementById("bookingAromaSelect");
    const pressureSelect = document.getElementById("bookingPressureSelect");
    if (aromaSelect) aromaSelect.addEventListener("change", () => soundService.playClickTone());
    if (pressureSelect) pressureSelect.addEventListener("change", () => soundService.playClickTone());
  }

  setupPatientInputs() {
    const nameInput = document.getElementById("bookingPatientName");
    const phoneInput = document.getElementById("bookingPatientPhone");

    if (nameInput) {
      nameInput.addEventListener("input", (e) => {
        this.patientName = e.target.value.trim() || "Amanda Tan";
        const sumName = document.getElementById("sumPatientName");
        if (sumName) sumName.textContent = this.patientName;
      });
    }

    if (phoneInput) {
      phoneInput.addEventListener("input", (e) => {
        this.patientPhone = e.target.value.trim() || "+65 8123 4567";
      });
    }
  }

  /* -------------------------------------------------------------
   * 6. SLOT HOLD TIMER
   * ------------------------------------------------------------- */
  startInitialSlotHold() {
    const holdDisplay = document.getElementById("sumHoldTimer");
    bookingService.startSlotHold(
      { slot: this.selectedSlot },
      (timeFormatted) => {
        if (holdDisplay) {
          const leftText = i18nService.t("common.timeLeft", "left");
          holdDisplay.textContent = `${timeFormatted} ${leftText}`;
        }
      },
      () => {
        if (this.ui) {
          this.ui.showToast("Slot hold expired. Please re-select your preferred slot time.", "⏰");
        }
      }
    );
  }

  /* -------------------------------------------------------------
   * 7. LIVE SUMMARY SYNCHRONIZATION
   * ------------------------------------------------------------- */
  updateSummary() {
    const branch = CLINIC_BRANCHES.find((b) => b.id === this.selectedBranch) || CLINIC_BRANCHES[0];
    const isMY = branch.region === "my";

    if (!this.selectedService) {
      const services = bookingService.getServices(this.activeTemplate);
      this.selectedService = services[0];
    }

    const depositText = isMY
      ? `MYR ${this.selectedService.depositMYR}.00`
      : `SGD ${this.selectedService.depositSGD}.00`;

    const elPatient = document.getElementById("sumPatientName");
    const elBranch = document.getElementById("sumBranchName");
    const elService = document.getElementById("sumServiceName");
    const elPrac = document.getElementById("sumPractitionerName");
    const elSchedule = document.getElementById("sumScheduleTime");
    const elDeposit = document.getElementById("sumDepositAmount");

    if (elPatient) elPatient.textContent = this.patientName;
    if (elBranch) elBranch.textContent = branch.name;
    if (elService && this.selectedService) {
      const serviceName = this.selectedService.nameI18n
        ? i18nService.t(this.selectedService.nameI18n, this.selectedService.name)
        : this.selectedService.name;
      elService.textContent = serviceName;
    }
    if (elPrac) elPrac.textContent = this.selectedPractitioner;
    if (elSchedule) {
      const todayText = i18nService.t("common.today", "Today");
      elSchedule.textContent = `${todayText}, ${this.selectedSlot} SGT`;
    }
    if (elDeposit) elDeposit.textContent = depositText;
  }

  /* -------------------------------------------------------------
   * 8. WORKING CHECKOUT & DYNAMIC TICKET REDIRECT
   * ------------------------------------------------------------- */
  setupCheckoutButton() {
    const checkoutBtn = document.getElementById("bookingSubmitBtn");
    if (!checkoutBtn) return;

    checkoutBtn.addEventListener("click", () => {
      const patientName = document.getElementById("bookingPatientName")?.value.trim() || this.patientName;
      const patientPhone = document.getElementById("bookingPatientPhone")?.value.trim() || this.patientPhone;

      if (!patientName) {
        alert("Please enter patient full name.");
        return;
      }
      if (!patientPhone) {
        alert("Please enter patient WhatsApp mobile number.");
        return;
      }

      soundService.playQueueChime();

      const branch = CLINIC_BRANCHES.find((b) => b.id === this.selectedBranch) || CLINIC_BRANCHES[0];
      const isMY = branch.region === "my";
      const depositStr = isMY
        ? `MYR ${this.selectedService.depositMYR}.00`
        : `SGD ${this.selectedService.depositSGD}.00`;

      // Compile Intake Assessment String
      let intakeData = "";
      if (this.activeTemplate === "tcm") {
        const spots = Array.from(this.selectedPainSpots).join(", ") || "General Body Fatigue";
        intakeData = `Pain Areas: ${spots}`;
      } else {
        const aroma = document.getElementById("bookingAromaSelect")?.value || "Balinese Lemongrass";
        const pressure = document.getElementById("bookingPressureSelect")?.value || "Medium";
        intakeData = `Aromatherapy: ${aroma} | Pressure: ${pressure}`;
      }

      const notes = document.getElementById("bookingNotesInput")?.value.trim();
      if (notes) {
        intakeData += ` | Notes: ${notes}`;
      }

      // Create persistent booking
      const booking = bookingService.createBooking({
        patientName: patientName,
        patientPhone: patientPhone,
        branchId: branch.id,
        branchName: branch.name,
        branchAddress: branch.address,
        serviceId: this.selectedService.id,
        serviceName: this.selectedService.name,
        practitionerName: this.selectedPractitioner,
        schedule: `Wednesday, ${this.selectedSlot} SGT`,
        room: branch.rooms[0] || "Suite 01",
        depositPaid: depositStr,
        paymentStatus: `DEPOSIT PAID (${depositStr})`,
        templateType: this.activeTemplate,
        intakeData: intakeData
      });

      if (this.ui) {
        this.ui.showToast(`✓ Booking ${booking.code} confirmed! Redirecting to E-Ticket...`, "🎉");
      }

      // Auto redirect to dynamic ticket with booking code
      setTimeout(() => {
        window.location.href = `ticket.html?code=${encodeURIComponent(booking.code)}`;
      }, 1000);
    });
  }
}

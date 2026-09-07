/**
 * Cliniva — Patient Booking Wizard Controller (booking.html)
 * SOLID: Single Responsibility for 4-Step Patient Booking Flow, Dynamic Super Admin Business Template Adapters, & Deposit Settlement
 */

import { authService, USER_ROLES } from "../services/auth.service.js";
import { storageService } from "../services/storage.service.js";
import { bookingService } from "../services/booking.service.js";
import { soundService } from "../services/sound.service.js";
import { intakeFormComponent } from "../components/intake-form.component.js";
import { i18nService } from "../services/i18n.service.js";

export class PatientBookingController {
  constructor() {
    this.BRANCHES_KEY = "cliniva_branches";
    this.currentStep = 1;

    // Read active template configured by Super Admin (default: wellness)
    this.activeTemplateId = bookingService.getActiveTemplateId() || "wellness";

    this.branches = this.loadBranches();
    this.selectedBranch = this.branches[0];

    this.bookingDraft = {
      branchId: this.selectedBranch.id,
      branchName: this.selectedBranch.name,
      branchAddress: this.selectedBranch.address,
      currency: this.selectedBranch.currency,
      templateType: this.activeTemplateId,
      serviceName: "Traditional Balinese Aromatherapy Massage",
      serviceDuration: "75 min",
      servicePrice: "SGD 130.00",
      depositAmount: "SGD 35.00",
      room: "Private VIP Couple Spa Suite (Jacuzzi)",
      practitionerName: "Earliest Available Specialist",
      scheduleDate: "Wednesday, 9 September 2026",
      scheduleSlot: "10:30 SGT",
      chiefComplaint: "General wellness & tension release",
      painMarker: "",
      painBodyPart: "",
      painScale: "",
      intakeData: ""
    };
  }

  init() {
    // Session Guard: Verify user has USER role (Patient)
    const session = authService.requireAuth([USER_ROLES.USER]);
    if (!session) return;

    // Read latest template set by Super Admin
    this.activeTemplateId = bookingService.getActiveTemplateId() || "wellness";
    this.bookingDraft.templateType = this.activeTemplateId;

    this.renderPatientHeader(session.user);
    this.initInteractiveMap();
    this.setupBranchPills();
    this.setupLocationDetector();
    this.setupAdminTemplateSwitcher();

    // Apply template configuration to all steps
    this.applyTemplate(this.activeTemplateId, false);

    this.setupStepNavigation();
    this.setupSlotChoices();
    this.setupCheckoutAction(session.user);

    // Listen for template changes dispatched by Super Admin / Owner portal
    document.addEventListener("cliniva:templateChanged", (e) => {
      const newTmpl = e.detail?.templateId;
      if (newTmpl && newTmpl !== this.activeTemplateId) {
        this.applyTemplate(newTmpl, false);
      }
    });

    // Reactively re-render components on language change
    document.addEventListener("cliniva:languageChanged", () => {
      this.renderTemplateConsultationInfo();
      this.renderPractitioners();
      this.renderDynamicIntakeForm();
      if (this.currentStep === 4) {
        this.renderSummaryStep();
      }
    });
  }

  loadBranches() {
    const defaultBranches = [
      {
        id: "sg-orchard",
        name: "Orchard Wellness & Medical Center",
        region: "Singapore",
        address: "Paragon Medical #14-02, Singapore 238859",
        currency: "SGD",
        hours: "Mon - Sat (08:30 - 20:00 SGT)",
        lat: 1.3039,
        lng: 103.8358,
        badge: "🇸🇬 SINGAPORE FLAGSHIP",
        icon: "🇸🇬"
      },
      {
        id: "my-kl",
        name: "Kuala Lumpur Healthcare Pavilion",
        region: "Malaysia",
        address: "Pavilion Embassy Tower, Jalan Ampang, Kuala Lumpur",
        currency: "MYR",
        hours: "Mon - Sat (09:00 - 18:00 MYT)",
        lat: 3.1593,
        lng: 101.7196,
        badge: "🇲🇾 KUALA LUMPUR SUITE",
        icon: "🇲🇾"
      },
      {
        id: "my-penang",
        name: "Penang Wellness & Care Center",
        region: "Malaysia",
        address: "Gurney Walk, Persiaran Gurney, Penang",
        currency: "MYR",
        hours: "Tue - Sun (10:00 - 19:00 MYT)",
        lat: 5.4332,
        lng: 100.3106,
        badge: "🇲🇾 PENANG BRANCH",
        icon: "🇲🇾"
      }
    ];

    const stored = storageService.get(this.BRANCHES_KEY, null);
    if (!stored || !Array.isArray(stored) || stored.length < 3) {
      storageService.set(this.BRANCHES_KEY, defaultBranches);
      return defaultBranches;
    }
    return stored;
  }

  renderPatientHeader(user) {
    const nameEl = document.getElementById("bookingPatientName");
    const contactEl = document.getElementById("bookingPatientContact");
    if (nameEl) nameEl.textContent = user.name;
    if (contactEl) contactEl.textContent = user.contact || "+65 8123 4567";

    const signOutBtn = document.getElementById("bookingSignOutBtn");
    if (signOutBtn) {
      signOutBtn.addEventListener("click", () => {
        if (confirm(i18nService.t("booking.confirmSignOut", "Are you sure you want to sign out?"))) {
          authService.logout();
        }
      });
    }
  }

  /* ------------------------------------------------------------------
   * SUPER ADMIN TEMPLATE SWITCHER (EXECUTIVE CONTROL)
   * ------------------------------------------------------------------ */
  setupAdminTemplateSwitcher() {
    const pills = document.querySelectorAll("#adminTemplatePills .admin-tmpl-pill");
    pills.forEach((pill) => {
      pill.addEventListener("click", () => {
        const targetTemplate = pill.dataset.template;
        if (targetTemplate && targetTemplate !== this.activeTemplateId) {
          this.setTemplate(targetTemplate);
        }
      });
    });
  }

  setTemplate(templateId) {
    soundService.playClickTone();
    bookingService.setActiveTemplate(templateId);
    this.applyTemplate(templateId, true);
  }

  applyTemplate(templateId, playTone = false) {
    this.activeTemplateId = String(templateId).trim().toLowerCase();
    this.bookingDraft.templateType = this.activeTemplateId;

    // Update switcher pills active state
    const pills = document.querySelectorAll("#adminTemplatePills .admin-tmpl-pill");
    pills.forEach((p) => {
      p.classList.toggle("active", p.dataset.template === this.activeTemplateId);
    });

    // Update active badge text in admin banner
    const badgeTextEl = document.getElementById("adminActiveTemplateBadgeText");
    if (badgeTextEl) {
      badgeTextEl.textContent = `Live Template: ${this.getTemplateDisplayName(this.activeTemplateId)}`;
    }

    // Render step 1 consultation overview
    this.renderTemplateConsultationInfo();

    // Render step 2 practitioners filtered by template
    this.renderPractitioners();

    // Render step 3 intake form
    this.renderDynamicIntakeForm();

    // If on summary step, update summary details
    if (this.currentStep === 4) {
      this.renderSummaryStep();
    }

    if (playTone) {
      soundService.playQueueChime();
    }
  }

  getTemplateDisplayName(templateId) {
    switch (templateId) {
      case "physio":
      case "physiotherapy":
        return "🏃 Physiotherapy & Rehab";
      case "nutrition":
        return "🥗 NutriFlow Nutrition & Dietetics";
      case "tcm":
        return "🌿 Traditional Chinese Medicine (TCM)";
      case "wellness":
      case "spa":
      default:
        return "🌸 Wellness & Luxury Spa";
    }
  }

  /* ------------------------------------------------------------------
   * LEAFLET INTERACTIVE MAP & BRANCH CONTROLS
   * ------------------------------------------------------------------ */
  initInteractiveMap() {
    const mapContainer = document.getElementById("clinicInteractiveMap");
    if (!mapContainer) return;

    const defaultCoords = [this.selectedBranch.lat, this.selectedBranch.lng];

    if (typeof window !== "undefined" && typeof window.L !== "undefined") {
      try {
        this.map = window.L.map("clinicInteractiveMap", {
          center: defaultCoords,
          zoom: 13,
          scrollWheelZoom: false
        });

        window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 18
        }).addTo(this.map);

        this.markers = {};

        this.branches.forEach((b) => {
          const pinHtml = `<div class="custom-map-pin ${b.id === this.selectedBranch.id ? "active-pin" : ""}" id="pin-${b.id}">${b.icon || "📍"}</div>`;
          const customIcon = window.L.divIcon({
            html: pinHtml,
            className: "custom-div-icon",
            iconSize: [38, 38],
            iconAnchor: [19, 19],
            popupAnchor: [0, -20]
          });

          const marker = window.L.marker([b.lat, b.lng], { icon: customIcon }).addTo(this.map);

          const popupContent = `
            <div style="font-family:inherit; min-width:190px;">
              <strong style="font-size:13px; color:var(--text); display:block; margin-bottom:2px;">${b.name}</strong>
              <div style="font-size:11px; color:var(--muted); line-height:1.3;">${b.address}</div>
              <div style="margin-top:6px; font-size:10px; font-weight:800; color:var(--primary);">${b.badge}</div>
            </div>
          `;

          marker.bindPopup(popupContent, { className: "cliniva-map-popup" });

          marker.on("click", () => {
            soundService.playClickTone();
            this.selectBranch(b, false);
          });

          this.markers[b.id] = marker;
        });

        // Open initial popup
        if (this.markers[this.selectedBranch.id]) {
          this.markers[this.selectedBranch.id].openPopup();
        }
      } catch (e) {
        console.warn("Leaflet map initialization warning:", e);
      }
    }
  }

  setupBranchPills() {
    const pills = document.querySelectorAll("#clinicMapPills .clinic-pill");
    pills.forEach((pill) => {
      pill.addEventListener("click", () => {
        soundService.playClickTone();
        const branchId = pill.dataset.branchId;
        const targetBranch = this.branches.find((b) => b.id === branchId);
        if (targetBranch) {
          this.selectBranch(targetBranch, true);
        }
      });
    });
  }

  selectBranch(branch, flyTo = true) {
    this.selectedBranch = branch;
    this.bookingDraft.branchId = branch.id;
    this.bookingDraft.branchName = branch.name;
    this.bookingDraft.branchAddress = branch.address;
    this.bookingDraft.currency = branch.currency;

    // Update active state on pills
    const pills = document.querySelectorAll("#clinicMapPills .clinic-pill");
    pills.forEach((p) => {
      p.classList.toggle("active", p.dataset.branchId === branch.id);
    });

    // Update Info Bar Card
    const titleEl = document.getElementById("activeClinicTitle");
    const badgeEl = document.getElementById("activeClinicBadge");
    const addrEl = document.getElementById("activeClinicAddress");
    const metaEl = document.getElementById("activeClinicMeta");
    const distEl = document.getElementById("activeClinicDistanceBadge");

    if (titleEl) titleEl.textContent = branch.name;
    if (badgeEl) badgeEl.textContent = branch.badge;
    if (addrEl) addrEl.textContent = `${branch.region} · ${branch.address}`;
    if (metaEl) metaEl.textContent = `Currency: ${branch.currency} · Hours: ${branch.hours}`;
    if (distEl) {
      distEl.textContent = branch.distance ? `📍 ~${branch.distance} km` : "📍 Selected on Map";
    }

    // Fly map & update active pin styling
    if (this.map && branch.lat && branch.lng) {
      if (flyTo) {
        this.map.flyTo([branch.lat, branch.lng], 13, { duration: 1.2 });
      }
      if (this.markers && this.markers[branch.id]) {
        this.markers[branch.id].openPopup();
      }

      document.querySelectorAll(".custom-map-pin").forEach((p) => p.classList.remove("active-pin"));
      const activePin = document.getElementById(`pin-${branch.id}`);
      if (activePin) activePin.classList.add("active-pin");
    }

    // Update consultation info and practitioners with the new currency
    this.renderTemplateConsultationInfo();
    this.renderPractitioners();
  }

  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth radius in KM
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 10) / 10;
  }

  setupLocationDetector() {
    const btn = document.getElementById("btnDetectLocation");
    if (!btn) return;

    btn.addEventListener("click", () => {
      soundService.playClickTone();
      if (!navigator.geolocation) {
        alert(i18nService.t("booking.geo.unsupported", "Geolocation is not supported by your browser."));
        return;
      }

      btn.disabled = true;
      btn.innerHTML = `<span>⏳</span> <span>${i18nService.t("booking.geo.searching", "Searching for nearest clinic...")}</span>`;

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          btn.disabled = false;
          const userLat = pos.coords.latitude;
          const userLng = pos.coords.longitude;

          let nearestBranch = this.branches[0];
          let minDistance = Infinity;

          this.branches.forEach((b) => {
            const dist = this.calculateDistance(userLat, userLng, b.lat, b.lng);
            b.distance = dist;
            if (dist < minDistance) {
              minDistance = dist;
              nearestBranch = b;
            }
          });

          btn.innerHTML = `<span>📍</span> <span>${i18nService.t("booking.geo.nearest", "Nearest:")} ${nearestBranch.name} (~${minDistance} km)</span>`;
          this.selectBranch(nearestBranch, true);
          soundService.playQueueChime();
        },
        (err) => {
          btn.disabled = false;
          btn.innerHTML = `<span>📍</span> <span>Detect Nearest Clinic</span>`;
          console.warn("Geolocation warning:", err);
          alert(i18nService.t("booking.geo.failed", "Unable to detect your GPS coordinates automatically. Showing Singapore Orchard branch."));
          this.selectBranch(this.branches[0], true);
        },
        { timeout: 8000 }
      );
    });
  }

  /* ------------------------------------------------------------------
   * STEP 1: TEMPLATE CONSULTATION SESSION OVERVIEW
   * (Replaces manual service picking — configured directly by Super Admin)
   * ------------------------------------------------------------------ */
  renderTemplateConsultationInfo() {
    const container = document.getElementById("templateConsultationBanner");
    if (!container) return;

    const consultation = bookingService.getTemplateConsultation(this.activeTemplateId, this.selectedBranch.currency);
    if (!consultation) return;

    // Synchronize booking draft
    this.bookingDraft.serviceName = consultation.serviceName;
    this.bookingDraft.serviceDuration = consultation.duration;
    this.bookingDraft.servicePrice = consultation.price;
    this.bookingDraft.depositAmount = consultation.deposit;
    this.bookingDraft.room = consultation.defaultRoom;
    this.bookingDraft.templateType = this.activeTemplateId;

    // Apply accent color to banner
    container.style.setProperty("--tmpl-accent", consultation.accentColor);

    let badgeIcon = "🌸";
    let badgeText = "Wellness & Spa Protocol";
    let badgeBg = "#fefce8";
    let badgeColor = "#854d0e";
    let badgeBorder = "#fef08a";

    if (this.activeTemplateId === "physio") {
      badgeIcon = "🏃";
      badgeText = "Physiotherapy & Rehab Protocol";
      badgeBg = "#f0f9ff";
      badgeColor = "#0369a1";
      badgeBorder = "#bae6fd";
    } else if (this.activeTemplateId === "tcm") {
      badgeIcon = "🌿";
      badgeText = "TCM Meridian & Acupressure Protocol";
      badgeBg = "#f0fdfa";
      badgeColor = "#0f766e";
      badgeBorder = "#99f6e4";
    } else if (this.activeTemplateId === "nutrition") {
      badgeIcon = "🥗";
      badgeText = "Clinical Nutrition & Dietetics Protocol";
      badgeBg = "#f0fdf4";
      badgeColor = "#15803d";
      badgeBorder = "#bbf7d0";
    }

    // Update active clinic badge in info bar
    const clinicBadgeEl = document.getElementById("activeClinicBadge");
    if (clinicBadgeEl) {
      clinicBadgeEl.textContent = `${badgeIcon} ${consultation.templateName.toUpperCase()}`;
      clinicBadgeEl.style.background = badgeBg;
      clinicBadgeEl.style.color = badgeColor;
    }

    container.innerHTML = `
      <div class="consultation-header-row">
        <div>
          <div class="consultation-badge-pill" style="background:${badgeBg}; color:${badgeColor}; border:1px solid ${badgeBorder};">
            <span>${badgeIcon}</span> <span>${badgeText}</span>
          </div>
          <h3 class="consultation-title">${consultation.serviceName} (${consultation.duration})</h3>
          <p class="consultation-desc">${consultation.description}</p>
        </div>

        <div class="consultation-pricing-box">
          <div class="consultation-price-label">Standard Session Fee</div>
          <div class="consultation-price-val">${consultation.price}</div>
          <div class="consultation-deposit-val">Slot Deposit: ${consultation.deposit}</div>
        </div>
      </div>

      <div class="consultation-inclusions-grid">
        <div class="inclusion-card">
          <div class="inclusion-icon-title">
            <span>👨‍⚕️</span> <span>Attending Specialist</span>
          </div>
          <div class="inclusion-desc">${consultation.practitionerTitle} dedicated to your session</div>
        </div>

        <div class="inclusion-card">
          <div class="inclusion-icon-title">
            <span>📋</span> <span>Clinical Intake</span>
          </div>
          <div class="inclusion-desc">Specialized intake assessment form tailored for this clinic model</div>
        </div>

        <div class="inclusion-card">
          <div class="inclusion-icon-title">
            <span>🛋️</span> <span>Private Suite / Bed</span>
          </div>
          <div class="inclusion-desc">${consultation.defaultRoom} reserved for your scheduled time</div>
        </div>

        <div class="inclusion-card">
          <div class="inclusion-icon-title">
            <span>🛡️</span> <span>PDPA &amp; Verified Ticket</span>
          </div>
          <div class="inclusion-desc">Instant digital e-ticket issued with official queue verification</div>
        </div>
      </div>

      <div class="consultation-footer-note">
        <span style="color:#16a34a;">●</span>
        <span>Pre-configured by Super Admin: Patients do not need to manually choose treatment items. Proceed directly to choose your attending specialist &amp; time slot.</span>
      </div>
    `;
  }

  /* ------------------------------------------------------------------
   * STEP NAVIGATION (1 -> 2 -> 3 -> 4)
   * ------------------------------------------------------------------ */
  setupStepNavigation() {
    // Next buttons
    const toStep2Btn = document.getElementById("toStep2Btn");
    const toStep3Btn = document.getElementById("toStep3Btn");
    const toStep4Btn = document.getElementById("toStep4Btn");

    // Back buttons
    const backToStep1Btn = document.getElementById("backToStep1Btn");
    const backToStep2Btn = document.getElementById("backToStep2Btn");
    const backToStep3Btn = document.getElementById("backToStep3Btn");

    if (toStep2Btn) toStep2Btn.addEventListener("click", () => this.goToStep(2));
    if (toStep3Btn) toStep3Btn.addEventListener("click", () => this.goToStep(3));
    if (toStep4Btn) {
      toStep4Btn.addEventListener("click", () => {
        this.captureIntakeFormData();
        this.renderSummaryStep();
        this.goToStep(4);
      });
    }

    if (backToStep1Btn) backToStep1Btn.addEventListener("click", () => this.goToStep(1));
    if (backToStep2Btn) backToStep2Btn.addEventListener("click", () => this.goToStep(2));
    if (backToStep3Btn) backToStep3Btn.addEventListener("click", () => this.goToStep(3));
  }

  goToStep(stepNumber) {
    soundService.playClickTone();
    this.currentStep = stepNumber;

    // Update wizard indicators
    for (let i = 1; i <= 4; i++) {
      const node = document.getElementById(`wizardStep${i}`);
      const pane = document.getElementById(`bookingStepPane${i}`);

      if (node) {
        node.classList.remove("active", "completed");
        if (i === stepNumber) {
          node.classList.add("active");
        } else if (i < stepNumber) {
          node.classList.add("completed");
        }
      }

      if (pane) {
        pane.style.display = i === stepNumber ? "block" : "none";
      }
    }

    if (stepNumber === 1 && this.map) {
      setTimeout(() => {
        this.map.invalidateSize();
      }, 150);
    }

    if (stepNumber === 3) {
      this.renderDynamicIntakeForm();
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  /* ------------------------------------------------------------------
   * STEP 2: SELECT SPECIALIST & TIME SLOT
   * (Dynamically filtered by active template)
   * ------------------------------------------------------------------ */
  renderPractitioners() {
    const container = document.getElementById("bookingPractitionerList");
    if (!container) return;

    const templatePractitioners = bookingService.getPractitioners(this.selectedBranch.id, this.activeTemplateId);

    const earliestSpecialist = {
      id: "earliest",
      name: i18nService.t("booking.doctor.earliestName", "Earliest Available Specialist"),
      title: i18nService.t("booking.doctor.earliestTitle", `First available certified practitioner for ${this.getTemplateDisplayName(this.activeTemplateId)}`),
      specialty: i18nService.t("booking.doctor.earliestDesc", "Ideal for prompt attention without waiting for a specific physician."),
      avatarEmoji: "⚡"
    };

    const list = [earliestSpecialist, ...(templatePractitioners || [])];

    container.innerHTML = list
      .map(
        (p, idx) => `
        <div class="practitioner-choice-card ${idx === 0 ? "selected" : ""}" data-practitioner-name="${p.name}">
          <div style="display:flex; justify-content:space-between; align-items:flex-start;">
            <strong style="font-size:14px; display:block; color:var(--text);">${p.name}</strong>
            ${p.avatarEmoji ? `<span style="font-size:20px;">${p.avatarEmoji}</span>` : ""}
          </div>
          <span style="font-size:12px; color:var(--primary); font-weight:700;">${p.title}</span>
          <p style="font-size:11px; color:var(--muted); margin:4px 0 0; line-height:1.35;">${p.specialty || ""}</p>
        </div>
      `
      )
      .join("");

    this.bookingDraft.practitionerName = list[0].name;

    const cards = container.querySelectorAll(".practitioner-choice-card");
    cards.forEach((card) => {
      card.addEventListener("click", () => {
        soundService.playClickTone();
        cards.forEach((c) => c.classList.remove("selected"));
        card.classList.add("selected");
        this.bookingDraft.practitionerName = card.dataset.practitionerName || list[0].name;
      });
    });
  }

  setupSlotChoices() {
    const slotBtns = document.querySelectorAll(".slot-choice-btn");
    slotBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        soundService.playClickTone();
        slotBtns.forEach((b) => b.classList.remove("selected"));
        btn.classList.add("selected");
        this.bookingDraft.scheduleSlot = btn.dataset.slot || "10:30 SGT";

        const slotHoldBanner = document.getElementById("slotHoldAlert");
        if (slotHoldBanner) {
          slotHoldBanner.style.display = "block";
        }
      });
    });
  }

  /* ------------------------------------------------------------------
   * STEP 3: DYNAMIC SPECIALIZED INTAKE FORM
   * ------------------------------------------------------------------ */
  renderDynamicIntakeForm() {
    const container = document.getElementById("dynamicIntakeContainer");
    if (!container) return;

    const step3Title = document.getElementById("step3PaneTitle");
    const step3Desc = document.getElementById("step3PaneDesc");

    if (this.activeTemplateId === "wellness" || this.activeTemplateId === "spa") {
      if (step3Title) step3Title.textContent = "Spa Preferences & Wellness Intake Assessment";
      if (step3Desc) step3Desc.textContent = "Customize your aromatherapy essential oil, massage pressure level, and target therapy focus areas.";
    } else if (this.activeTemplateId === "physio" || this.activeTemplateId === "physiotherapy") {
      if (step3Title) step3Title.textContent = "Physiotherapy & Musculoskeletal Assessment";
      if (step3Desc) step3Desc.textContent = "Specify pain points, onset duration, and functional mobility limitations for your physiotherapist.";
    } else if (this.activeTemplateId === "nutrition") {
      if (step3Title) step3Title.textContent = "Nutritional & Metabolic Profile Assessment";
      if (step3Desc) step3Desc.textContent = "Provide biometric data, primary health goals, and dietary restrictions for clinical dietetic consult.";
    } else if (this.activeTemplateId === "tcm") {
      if (step3Title) step3Title.textContent = "TCM Meridian & Body Pain Assessment";
      if (step3Desc) step3Desc.textContent = "Mark your discomfort zones and indicate pulse, tongue, and meridian symptom duration for your TCM physician.";
    } else {
      if (step3Title) step3Title.textContent = "Clinical Intake & Assessment";
      if (step3Desc) step3Desc.textContent = "Provide your patient details and intake notes to help your practitioner prepare in advance.";
    }

    intakeFormComponent.mount(container, this.activeTemplateId, this.bookingDraft, (data) => {
      this.bookingDraft.intakeData = data.summaryText || "";
      this.bookingDraft.chiefComplaint = data.chiefComplaint || "";
    });
  }

  captureIntakeFormData() {
    const data = intakeFormComponent.getIntakeData();
    this.bookingDraft.intakeDetails = data;
    this.bookingDraft.intakeData = data.summaryText || "Assessment completed";
    this.bookingDraft.chiefComplaint = data.chiefComplaint || data.summaryText || "Routine Consultation";
    this.bookingDraft.templateType = this.activeTemplateId;
    if (data.painScale) {
      this.bookingDraft.painScale = data.painScale;
    }
  }

  /* ------------------------------------------------------------------
   * STEP 4: SUMMARY & DIGITAL E-TICKET CONFIRMATION
   * ------------------------------------------------------------------ */
  renderSummaryStep() {
    const templateEl = document.getElementById("summaryTemplateVal");
    const branchEl = document.getElementById("summaryBranchVal");
    const serviceEl = document.getElementById("summaryServiceVal");
    const doctorEl = document.getElementById("summaryDoctorVal");
    const scheduleEl = document.getElementById("summaryScheduleVal");
    const roomEl = document.getElementById("summaryRoomVal");
    const complaintEl = document.getElementById("summaryComplaintVal");
    const priceEl = document.getElementById("summaryPriceVal");
    const depositEl = document.getElementById("summaryDepositVal");

    if (templateEl) templateEl.textContent = this.getTemplateDisplayName(this.activeTemplateId);
    if (branchEl) branchEl.textContent = `${this.bookingDraft.branchName} (${this.bookingDraft.branchAddress})`;
    if (serviceEl) serviceEl.textContent = `${this.bookingDraft.serviceName} (${this.bookingDraft.serviceDuration})`;
    if (doctorEl) doctorEl.textContent = this.bookingDraft.practitionerName;
    if (scheduleEl) scheduleEl.textContent = `${this.bookingDraft.scheduleDate} · ${this.bookingDraft.scheduleSlot}`;
    if (roomEl) roomEl.textContent = this.bookingDraft.room || "Private Consultation Suite 01";

    if (complaintEl) {
      complaintEl.textContent = this.bookingDraft.chiefComplaint || this.bookingDraft.intakeData || "Routine Clinical Assessment";
    }

    if (priceEl) priceEl.textContent = this.bookingDraft.servicePrice;
    if (depositEl) depositEl.textContent = this.bookingDraft.depositAmount;
  }

  setupCheckoutAction(user) {
    const confirmBtn = document.getElementById("confirmBookingCheckoutBtn");
    if (!confirmBtn) return;

    confirmBtn.addEventListener("click", () => {
      confirmBtn.disabled = true;
      confirmBtn.textContent = i18nService.t("booking.processingDeposit", "Processing Deposit Payment...");

      setTimeout(() => {
        soundService.playQueueChime();

        // Generate booking record
        const now = new Date();
        const codeSuffix = Math.floor(1000 + Math.random() * 9000);
        const bookingCode = `BK-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}-${codeSuffix}`;

        const newBooking = {
          code: bookingCode,
          patientName: user.name || "Amanda Tan",
          patientPhone: user.contact || "+65 8123 4567",
          branchName: this.bookingDraft.branchName,
          branchAddress: this.bookingDraft.branchAddress,
          serviceName: this.bookingDraft.serviceName,
          practitionerName: this.bookingDraft.practitionerName,
          schedule: this.bookingDraft.scheduleSlot,
          room: this.bookingDraft.room || "Private Consultation Suite 01",
          depositPaid: this.bookingDraft.depositAmount,
          paymentStatus: `DEPOSIT PAID (${this.bookingDraft.depositAmount})`,
          complaint: this.bookingDraft.chiefComplaint,
          templateType: this.activeTemplateId,
          intakeData: this.bookingDraft.intakeData,
          painScale: this.bookingDraft.painScale || "N/A",
          createdAt: now.toISOString()
        };

        // Save to booking list
        const existingBookings = bookingService.getAllBookings();
        existingBookings.unshift(newBooking);
        storageService.set("cliniva_bookings", existingBookings);

        alert(i18nService.t("booking.confirmedAlert", `✓ Appointment ${bookingCode} confirmed! Deposit verified. Redirecting to your digital E-Ticket.`));
        window.location.href = `ticket.html?code=${encodeURIComponent(bookingCode)}`;
      }, 1000);
    });
  }
}

/**
 * Cliniva — Patient Booking Wizard Controller (booking.html)
 * SOLID: Single Responsibility for 4-Step Patient Booking Flow, Dynamic Branch Services, & Deposit Settlement
 */

import { authService, USER_ROLES } from "../services/auth.service.js";
import { storageService } from "../services/storage.service.js";
import { bookingService } from "../services/booking.service.js";
import { soundService } from "../services/sound.service.js";

export class PatientBookingController {
  constructor() {
    this.BRANCHES_KEY = "cliniva_branches";
    this.currentStep = 1;

    this.branches = this.loadBranches();
    this.selectedBranch = this.branches[0];

    this.bookingDraft = {
      branchId: this.selectedBranch.id,
      branchName: this.selectedBranch.name,
      branchAddress: this.selectedBranch.address,
      currency: this.selectedBranch.currency,
      serviceName: "Physiotherapy & Spine Rehabilitation",
      serviceDuration: "60 mins",
      servicePrice: this.selectedBranch.currency === "SGD" ? "SGD 120.00" : "MYR 180.00",
      depositAmount: this.selectedBranch.currency === "SGD" ? "SGD 30.00" : "MYR 50.00",
      practitionerName: "Earliest Available Specialist",
      scheduleDate: "Wednesday, 9 September 2026",
      scheduleSlot: "10:30 SGT",
      chiefComplaint: "Sharp lower back pain (L4-L5) upon forward bending after marathon.",
      painMarker: "marker-lumbar",
      painBodyPart: "Lower Back (L4-L5 Lumbar)",
      painScale: 7,
      intakeData: ""
    };

    // Wellness & Spa specific selections
    this.selectedAromaOil = "Lemongrass";
    this.selectedPressure = "Medium";
    this.selectedSpaFocus = new Set(["Full Body Balanced", "Upper Back & Shoulders"]);
  }

  init() {
    // Session Guard: Verify user has USER role (Patient)
    const session = authService.requireAuth([USER_ROLES.USER]);
    if (!session) return;

    this.renderPatientHeader(session.user);
    this.initInteractiveMap();
    this.setupBranchPills();
    this.setupLocationDetector();
    this.renderServices();
    this.setupStepNavigation();
    this.setupPractitionerChoices();
    this.setupSlotChoices();
    this.setupPainMapInteractions();
    this.setupWellnessIntakeInteractions();
    this.setupCheckoutAction(session.user);
  }

  loadBranches() {
    const defaultBranches = [
      {
        id: "sg-orchard",
        name: "Orchard Wellness Clinic",
        region: "Singapore",
        address: "Paragon Medical #14-02, Singapore 238859",
        profileType: "WELLNESS",
        templateId: "wellness",
        currency: "SGD",
        hours: "Senin - Sabtu (08:30 - 20:00 SGT)",
        lat: 1.3039,
        lng: 103.8358,
        badge: "🌸 LUXURY WELLNESS SPA",
        icon: "🌸"
      },
      {
        id: "my-kl",
        name: "Kuala Lumpur Integrated Care",
        region: "Malaysia",
        address: "Pavilion Embassy Tower, Jalan Ampang, Kuala Lumpur",
        profileType: "MEDICAL_CLINIC",
        templateId: "tcm",
        currency: "MYR",
        hours: "Senin - Sabtu (09:00 - 18:00 MYT)",
        lat: 3.1593,
        lng: 101.7196,
        badge: "🌿 INTEGRATED PHYSIO & TCM",
        icon: "🏥"
      },
      {
        id: "my-penang",
        name: "Penang TCM & Physio Center",
        region: "Malaysia",
        address: "Gurney Walk, Persiaran Gurney, Penang",
        profileType: "TCM_ACUPUNCTURE",
        templateId: "tcm",
        currency: "MYR",
        hours: "Selasa - Minggu (10:00 - 19:00 MYT)",
        lat: 5.4332,
        lng: 100.3106,
        badge: "🌿 TCM & ACUPUNCTURE",
        icon: "🌿"
      }
    ];

    const stored = storageService.get(this.BRANCHES_KEY, null);
    if (!stored || !Array.isArray(stored) || !stored[0]?.lat) {
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
        if (confirm("Apakah Anda yakin ingin keluar?")) {
          authService.logout();
        }
      });
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
    if (metaEl) metaEl.textContent = `Mata Uang: ${branch.currency} · Jam: ${branch.hours}`;
    if (distEl) {
      distEl.textContent = branch.distance ? `📍 ~${branch.distance} km dari lokasi Anda` : "📍 Terpilih pada Peta";
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

    // Sync active template and re-render services
    bookingService.setActiveTemplate(branch.templateId || "tcm");
    this.renderServices();

    // Toggle Step 3 Intake Assessment Panes (TCM Pain Map vs Wellness Spa Preferences)
    const tcmPane = document.getElementById("intakeTcmContainer");
    const wellnessPane = document.getElementById("intakeWellnessContainer");
    const step3Title = document.getElementById("step3PaneTitle");
    const step3Desc = document.getElementById("step3PaneDesc");

    if (branch.templateId === "wellness") {
      if (tcmPane) tcmPane.style.display = "none";
      if (wellnessPane) wellnessPane.style.display = "grid";
      if (step3Title) step3Title.textContent = "Spa Preferences & Wellness Intake Assessment";
      if (step3Desc) step3Desc.textContent = "Customize your aromatherapy essential oil, massage pressure, and target therapy focus areas.";
    } else {
      if (tcmPane) tcmPane.style.display = "grid";
      if (wellnessPane) wellnessPane.style.display = "none";
      if (step3Title) step3Title.textContent = "Patient Information & Pain Map Intake Assessment";
      if (step3Desc) step3Desc.textContent = "Provide your patient details, discomfort areas, and intake notes to help your doctor prepare in advance.";
    }
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
        alert("Geolocation tidak didukung pada peramban ini.");
        return;
      }

      btn.disabled = true;
      btn.innerHTML = `<span>⏳</span> <span>Mencari lokasi terdekat...</span>`;

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

          btn.innerHTML = `<span>📍</span> <span>Terdekat: ${nearestBranch.name} (~${minDistance} km)</span>`;
          this.selectBranch(nearestBranch, true);
          soundService.playQueueChime();
        },
        (err) => {
          btn.disabled = false;
          btn.innerHTML = `<span>📍</span> <span>Detect Nearest Clinic</span>`;
          console.warn("Geolocation warning:", err);
          alert("Tidak dapat mendeteksi lokasi GPS Anda secara otomatis. Menampilkan cabang utama Singapore Orchard.");
          this.selectBranch(this.branches[0], true);
        },
        { timeout: 8000 }
      );
    });
  }

  renderServices() {
    const container = document.getElementById("bookingServiceList");
    if (!container) return;

    const isSGD = this.selectedBranch.currency === "SGD";
    const templateId = this.selectedBranch.templateId || "tcm";
    const templateServices = bookingService.getServices(templateId);

    const services = templateServices.map((s) => {
      const priceStr = isSGD ? `SGD ${s.priceSGD}.00` : `MYR ${s.priceMYR}.00`;
      const depositStr = isSGD ? `SGD ${s.depositSGD}.00` : `MYR ${s.depositMYR}.00`;
      return {
        id: s.id,
        title: s.name,
        duration: `${s.durationMinutes} mins`,
        price: priceStr,
        deposit: depositStr,
        desc: s.description,
        badge: s.badge
      };
    });

    // Set initial selected service
    this.bookingDraft.serviceName = services[0].title;
    this.bookingDraft.serviceDuration = services[0].duration;
    this.bookingDraft.servicePrice = services[0].price;
    this.bookingDraft.depositAmount = services[0].deposit;

    container.innerHTML = services
      .map(
        (s, idx) => `
        <div class="service-choice-card ${idx === 0 ? "selected" : ""}" data-title="${s.title}" data-duration="${s.duration}" data-price="${s.price}" data-deposit="${s.deposit}">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:4px;">
            <strong style="font-size:14px; color:var(--text);">${s.title}</strong>
            ${s.badge ? `<span class="pill" style="font-size:10px; padding:2px 8px; background:rgba(15,118,110,0.1); color:var(--primary); font-weight:800;">${s.badge}</span>` : ""}
          </div>
          <span style="font-size:11px; color:var(--muted); margin-bottom:8px; display:block;">${s.duration}</span>
          <p style="font-size:12px; color:var(--text-secondary); margin:0 0 12px; line-height:1.4;">${s.desc}</p>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-top:auto; padding-top:8px; border-top:1px dashed var(--line);">
            <div class="service-card-price" style="font-size:14px; font-weight:800; color:var(--primary);">${s.price}</div>
            <small style="font-size:11px; color:var(--muted); font-weight:700;">Deposit: ${s.deposit}</small>
          </div>
        </div>
      `
      )
      .join("");

    container.querySelectorAll(".service-choice-card").forEach((card) => {
      card.addEventListener("click", () => {
        soundService.playClickTone();
        container.querySelectorAll(".service-choice-card").forEach((c) => c.classList.remove("selected"));
        card.classList.add("selected");

        this.bookingDraft.serviceName = card.dataset.title;
        this.bookingDraft.serviceDuration = card.dataset.duration;
        this.bookingDraft.servicePrice = card.dataset.price;
        this.bookingDraft.depositAmount = card.dataset.deposit;
      });
    });
  }

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

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  setupPractitionerChoices() {
    const cards = document.querySelectorAll(".practitioner-choice-card");
    cards.forEach((card) => {
      card.addEventListener("click", () => {
        soundService.playClickTone();
        cards.forEach((c) => c.classList.remove("selected"));
        card.classList.add("selected");
        this.bookingDraft.practitionerName = card.dataset.practitionerName || "Dr. Lim Wei Han";
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

  setupPainMapInteractions() {
    const markers = document.querySelectorAll(".booking-pain-marker");
    const activeMarkerText = document.getElementById("selectedPainLocationText");

    markers.forEach((marker) => {
      marker.addEventListener("click", () => {
        soundService.playClickTone();
        markers.forEach((m) => {
          m.style.background = "#94a3b8";
          m.classList.remove("selected");
        });

        marker.style.background = "#ef4444";
        marker.classList.add("selected");

        const bodyPart = marker.dataset.bodyPart || "Pinggang Bawah (L4-L5 Lumbar)";
        this.bookingDraft.painMarker = marker.id;
        this.bookingDraft.painBodyPart = bodyPart;

        if (activeMarkerText) {
          activeMarkerText.textContent = `Titik Terpilih: ${bodyPart}`;
        }
      });
    });

    // Pain Scale Slider
    const painRange = document.getElementById("painScaleRange");
    const painDisplay = document.getElementById("painScaleDisplay");

    if (painRange && painDisplay) {
      painRange.addEventListener("input", (e) => {
        const val = e.target.value;
        this.bookingDraft.painScale = parseInt(val, 10);
        painDisplay.textContent = `${val} / 10`;

        if (val <= 3) {
          painDisplay.style.color = "#16a34a";
        } else if (val <= 6) {
          painDisplay.style.color = "#d97706";
        } else {
          painDisplay.style.color = "#ef4444";
        }
      });
    }
  }

  setupWellnessIntakeInteractions() {
    // Aroma Choice Cards
    const cards = document.querySelectorAll(".aroma-choice-card");
    cards.forEach((card) => {
      card.addEventListener("click", () => {
        soundService.playClickTone();
        cards.forEach((c) => {
          c.classList.remove("selected");
          c.style.borderColor = "#e2e8f0";
          c.style.background = "#fff";
        });
        card.classList.add("selected");
        card.style.borderColor = "var(--primary)";
        card.style.background = "#f0fdf4";
        this.selectedAromaOil = card.dataset.oil || "Lemongrass";
      });
    });

    // Pressure Pills
    const pressurePills = document.querySelectorAll(".pressure-pills-row .pressure-pill");
    pressurePills.forEach((pill) => {
      pill.addEventListener("click", () => {
        soundService.playClickTone();
        pressurePills.forEach((p) => {
          p.classList.remove("active");
          p.style.borderColor = "var(--line)";
          p.style.color = "var(--text)";
          p.style.fontWeight = "700";
        });
        pill.classList.add("active");
        pill.style.borderColor = "var(--primary)";
        pill.style.color = "var(--primary-dark)";
        pill.style.fontWeight = "800";
        this.selectedPressure = pill.dataset.pressure || "Medium";
      });
    });

    // Focus Tags
    const tags = document.querySelectorAll(".spa-focus-tags .spa-focus-tag");
    tags.forEach((tag) => {
      tag.addEventListener("click", () => {
        soundService.playClickTone();
        const focusArea = tag.dataset.focus || tag.textContent.trim();
        if (this.selectedSpaFocus.has(focusArea)) {
          this.selectedSpaFocus.delete(focusArea);
          tag.classList.remove("active");
          tag.style.borderColor = "var(--line)";
          tag.style.background = "#fff";
          tag.style.color = "var(--text)";
        } else {
          this.selectedSpaFocus.add(focusArea);
          tag.classList.add("active");
          tag.style.borderColor = "var(--primary)";
          tag.style.background = "var(--primary)";
          tag.style.color = "#fff";
        }
      });
    });
  }

  captureIntakeFormData() {
    if (this.selectedBranch.templateId === "wellness") {
      const notesEl = document.getElementById("inputSpaNotes");
      const notes = notesEl && notesEl.value.trim() ? notesEl.value.trim() : "Standard luxury relaxation";
      const focusStr = Array.from(this.selectedSpaFocus).join(", ") || "Full Body Balanced";

      this.bookingDraft.intakeData = `Aroma: ${this.selectedAromaOil} | Pressure: ${this.selectedPressure} | Focus: ${focusStr} | Notes: ${notes}`;
      this.bookingDraft.chiefComplaint = `Aroma: ${this.selectedAromaOil} (${this.selectedPressure} Pressure) · Focus: ${focusStr}`;
      this.bookingDraft.painBodyPart = `Spa Aromatherapy (${this.selectedAromaOil})`;
    } else {
      const complaintEl = document.getElementById("inputChiefComplaint");
      const complaint = complaintEl && complaintEl.value.trim() ? complaintEl.value.trim() : "General discomfort";

      this.bookingDraft.chiefComplaint = complaint;
      this.bookingDraft.intakeData = `Pain Focus: ${this.bookingDraft.painBodyPart} | Scale: ${this.bookingDraft.painScale}/10 | Notes: ${complaint}`;
    }
  }

  renderSummaryStep() {
    const branchEl = document.getElementById("summaryBranchVal");
    const serviceEl = document.getElementById("summaryServiceVal");
    const doctorEl = document.getElementById("summaryDoctorVal");
    const scheduleEl = document.getElementById("summaryScheduleVal");
    const complaintEl = document.getElementById("summaryComplaintVal");
    const priceEl = document.getElementById("summaryPriceVal");
    const depositEl = document.getElementById("summaryDepositVal");

    if (branchEl) branchEl.textContent = `${this.bookingDraft.branchName} (${this.bookingDraft.branchAddress})`;
    if (serviceEl) serviceEl.textContent = `${this.bookingDraft.serviceName} (${this.bookingDraft.serviceDuration})`;
    if (doctorEl) doctorEl.textContent = this.bookingDraft.practitionerName;
    if (scheduleEl) scheduleEl.textContent = `${this.bookingDraft.scheduleDate} · ${this.bookingDraft.scheduleSlot}`;

    if (complaintEl) {
      if (this.selectedBranch.templateId === "wellness") {
        complaintEl.textContent = `Preferensi Spa: ${this.bookingDraft.intakeData}`;
      } else {
        complaintEl.textContent = `${this.bookingDraft.painBodyPart} (Skala Nyeri: ${this.bookingDraft.painScale}/10) — "${this.bookingDraft.chiefComplaint}"`;
      }
    }

    if (priceEl) priceEl.textContent = this.bookingDraft.servicePrice;
    if (depositEl) depositEl.textContent = this.bookingDraft.depositAmount;
  }

  setupCheckoutAction(user) {
    const confirmBtn = document.getElementById("confirmBookingCheckoutBtn");
    if (!confirmBtn) return;

    confirmBtn.addEventListener("click", () => {
      confirmBtn.disabled = true;
      confirmBtn.textContent = "Processing Deposit Payment...";

      setTimeout(() => {
        soundService.playQueueChime();

        // Generate booking record
        const now = new Date();
        const codeSuffix = Math.floor(1000 + Math.random() * 9000);
        const bookingCode = `BK-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}-${codeSuffix}`;

        const isWellness = this.selectedBranch.templateId === "wellness";
        const newBooking = {
          code: bookingCode,
          patientName: user.name || "Amanda Tan",
          patientPhone: user.contact || "+65 8123 4567",
          branchName: this.bookingDraft.branchName,
          branchAddress: this.bookingDraft.branchAddress,
          serviceName: this.bookingDraft.serviceName,
          practitionerName: this.bookingDraft.practitionerName,
          schedule: this.bookingDraft.scheduleSlot,
          room: isWellness ? "Private Spa Suite 01" : "Room A2 (TCM/Physio)",
          depositPaid: this.bookingDraft.depositAmount,
          paymentStatus: `DEPOSIT PAID (${this.bookingDraft.depositAmount})`,
          complaint: this.bookingDraft.chiefComplaint,
          templateType: this.selectedBranch.templateId || "tcm",
          intakeData: this.bookingDraft.intakeData,
          painScale: isWellness ? "N/A (Spa Relaxation)" : `${this.bookingDraft.painScale} / 10`,
          createdAt: now.toISOString()
        };

        // Save to booking list
        const existingBookings = bookingService.getAllBookings();
        existingBookings.unshift(newBooking);
        storageService.set("cliniva_bookings", existingBookings);

        alert(`✓ Appointment ${bookingCode} confirmed! Deposit verified. Redirecting to your digital E-Ticket.`);
        window.location.href = `ticket.html?code=${encodeURIComponent(bookingCode)}`;
      }, 1000);
    });
  }
}

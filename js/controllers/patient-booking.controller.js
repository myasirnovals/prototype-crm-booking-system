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
      serviceName: "Fisioterapi & Tulang Belakang",
      serviceDuration: "60 Menit",
      servicePrice: this.selectedBranch.currency === "SGD" ? "SGD 120.00" : "MYR 180.00",
      depositAmount: this.selectedBranch.currency === "SGD" ? "SGD 30.00" : "MYR 50.00",
      practitionerName: "Jadwal Tercepat (Dokter mana saja)",
      scheduleDate: "Wednesday, 9 September 2026",
      scheduleSlot: "10:30 SGT",
      chiefComplaint: "Nyeri tajam pinggang bawah (L4-L5) saat membungkuk setelah maraton.",
      painMarker: "marker-lumbar",
      painBodyPart: "Pinggang Bawah (L4-L5 Lumbar)",
      painScale: 7
    };
  }

  init() {
    // Session Guard: Verify user has USER role (Patient)
    const session = authService.requireAuth([USER_ROLES.USER]);
    if (!session) return;

    this.renderPatientHeader(session.user);
    this.renderBranchChoices();
    this.renderServices();
    this.setupStepNavigation();
    this.setupPractitionerChoices();
    this.setupSlotChoices();
    this.setupPainMapInteractions();
    this.setupCheckoutAction(session.user);
  }

  loadBranches() {
    const defaultBranches = [
      {
        id: "sg-orchard",
        name: "Orchard Wellness Clinic",
        region: "Singapore",
        address: "Paragon Medical #14-02, Singapore 238859",
        profileType: "TCM_PHYSIO",
        currency: "SGD",
        hours: "Senin - Sabtu (08:30 - 20:00 SGT)"
      },
      {
        id: "my-kl",
        name: "Kuala Lumpur Integrated Care",
        region: "Malaysia",
        address: "Pavilion Embassy Tower, Jalan Ampang, Kuala Lumpur",
        profileType: "MEDICAL_CLINIC",
        currency: "MYR",
        hours: "Senin - Sabtu (09:00 - 18:00 MYT)"
      },
      {
        id: "my-penang",
        name: "Penang TCM & Physio Center",
        region: "Malaysia",
        address: "Gurney Walk, Persiaran Gurney, Penang",
        profileType: "TCM_ACUPUNCTURE",
        currency: "MYR",
        hours: "Selasa - Minggu (10:00 - 19:00 MYT)"
      }
    ];

    return storageService.get(this.BRANCHES_KEY, defaultBranches);
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

  renderBranchChoices() {
    const container = document.getElementById("bookingBranchList");
    if (!container) return;

    container.innerHTML = this.branches
      .map(
        (b) => `
        <div class="branch-choice-card ${b.id === this.selectedBranch.id ? "selected" : ""}" data-branch-id="${b.id}">
          <strong style="font-size:15px; color:var(--text); display:block;">${b.name}</strong>
          <div style="font-size:12px; color:var(--muted); margin-top:4px;">${b.region} · ${b.address}</div>
          <div style="margin-top:10px; font-size:11px; font-weight:700; color:var(--primary);">
            Mata Uang: ${b.currency} · Jam: ${b.hours}
          </div>
        </div>
      `
      )
      .join("");

    container.querySelectorAll(".branch-choice-card").forEach((card) => {
      card.addEventListener("click", () => {
        soundService.playClickTone();
        const branchId = card.dataset.branchId;
        this.selectedBranch = this.branches.find((b) => b.id === branchId) || this.branches[0];

        this.bookingDraft.branchId = this.selectedBranch.id;
        this.bookingDraft.branchName = this.selectedBranch.name;
        this.bookingDraft.branchAddress = this.selectedBranch.address;
        this.bookingDraft.currency = this.selectedBranch.currency;

        container.querySelectorAll(".branch-choice-card").forEach((c) => c.classList.remove("selected"));
        card.classList.add("selected");

        this.renderServices();
      });
    });
  }

  renderServices() {
    const container = document.getElementById("bookingServiceList");
    if (!container) return;

    const isSGD = this.selectedBranch.currency === "SGD";
    let services = [];

    if (this.selectedBranch.profileType === "TCM_PHYSIO") {
      services = [
        {
          id: "physio-spine",
          title: "Fisioterapi & Tulang Belakang",
          duration: "60 Menit",
          price: isSGD ? "SGD 120.00" : "MYR 180.00",
          desc: "Penanganan spasme lumbar L4-L5, dekompresi tulang belakang, & terapi postur."
        },
        {
          id: "physio-sport",
          title: "Rehabilitasi Cedera Olahraga",
          duration: "75 Menit",
          price: isSGD ? "SGD 140.00" : "MYR 220.00",
          desc: "Pemulihan pasca rekonstruksi ligamen (ACL/MCL) dan terapi Shockwave."
        },
        {
          id: "physio-neck",
          title: "Terapi Leher & Sendi Bahu",
          duration: "45 Menit",
          price: isSGD ? "SGD 95.00" : "MYR 150.00",
          desc: "Pelepasan ketegangan trapezius spasm dan mobilisasi sendi cervical."
        }
      ];
    } else if (this.selectedBranch.profileType === "TCM_ACUPUNCTURE") {
      services = [
        {
          id: "tcm-acupuncture",
          title: "Akupunktur Medis & Tuina",
          duration: "50 Menit",
          price: isSGD ? "SGD 110.00" : "MYR 140.00",
          desc: "Stimulasi titik meridian tubuh, pelancaran sirkulasi darah dan pereda nyeri sendi."
        },
        {
          id: "tcm-cupping",
          title: "Bekam Kering & Terapi Herbal",
          duration: "45 Menit",
          price: isSGD ? "SGD 85.00" : "MYR 110.00",
          desc: "Relaksasi otot dalam dan detoksifikasi sistem limfatik sesuai formula TCM."
        }
      ];
    } else {
      services = [
        {
          id: "clinic-consult",
          title: "Konsultasi Dokter & Terapi Terpadu",
          duration: "40 Menit",
          price: isSGD ? "SGD 130.00" : "MYR 160.00",
          desc: "Pemeriksaan medis terpadu, diagnosis awal, dan rujukan EMR terenkripsi."
        },
        {
          id: "clinic-rehab",
          title: "Fisioterapi Medis & SIMRS Bridging",
          duration: "60 Menit",
          price: isSGD ? "SGD 150.00" : "MYR 190.00",
          desc: "Sesi rehabilitasi terstandarisasi dengan bridging laporan ke RS mitra."
        }
      ];
    }

    // Set initial selected service
    this.bookingDraft.serviceName = services[0].title;
    this.bookingDraft.serviceDuration = services[0].duration;
    this.bookingDraft.servicePrice = services[0].price;
    this.bookingDraft.depositAmount = isSGD ? "SGD 30.00" : "MYR 50.00";

    container.innerHTML = services
      .map(
        (s, idx) => `
        <div class="service-choice-card ${idx === 0 ? "selected" : ""}" data-title="${s.title}" data-duration="${s.duration}" data-price="${s.price}">
          <strong style="font-size:15px; color:var(--text); margin-bottom:4px;">${s.title}</strong>
          <span style="font-size:11px; color:var(--muted); margin-bottom:8px;">${s.duration}</span>
          <p style="font-size:12px; color:var(--text-secondary); margin:0 0 12px; line-height:1.4;">${s.desc}</p>
          <div class="service-card-price">${s.price}</div>
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

  captureIntakeFormData() {
    const complaintEl = document.getElementById("inputChiefComplaint");
    if (complaintEl && complaintEl.value.trim()) {
      this.bookingDraft.chiefComplaint = complaintEl.value.trim();
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
    if (complaintEl) complaintEl.textContent = `${this.bookingDraft.painBodyPart} (Skala Nyeri: ${this.bookingDraft.painScale}/10) — "${this.bookingDraft.chiefComplaint}"`;
    if (priceEl) priceEl.textContent = this.bookingDraft.servicePrice;
    if (depositEl) depositEl.textContent = this.bookingDraft.depositAmount;
  }

  setupCheckoutAction(user) {
    const confirmBtn = document.getElementById("confirmBookingCheckoutBtn");
    if (!confirmBtn) return;

    confirmBtn.addEventListener("click", () => {
      confirmBtn.disabled = true;
      confirmBtn.textContent = "Memproses Pembayaran Deposit...";

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
          room: "Room A2 (Physio Suite)",
          paymentStatus: `DEPOSIT PAID (${this.bookingDraft.depositAmount})`,
          complaint: this.bookingDraft.chiefComplaint,
          painScale: `${this.bookingDraft.painScale} / 10`,
          createdAt: now.toISOString()
        };

        // Save to booking list
        const existingBookings = bookingService.getAllBookings();
        existingBookings.unshift(newBooking);
        storageService.set("cliniva_bookings", existingBookings);

        alert(`Reservasi ${bookingCode} Berhasil! Deposit telah terverifikasi. Anda dialihkan ke E-Tiket Digital.`);
        window.location.href = "ticket.html";
      }, 1000);
    });
  }
}

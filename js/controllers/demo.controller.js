/**
 * Cliniva — Product Demo Controller
 * SOLID: Single Responsibility for Complete Product Demo Sandbox Interactions
 */

import { CLINIC_BRANCHES, CLINIC_SERVICES, PRACTITIONERS, DEFAULT_SLOTS } from "../config/clinic-data.js";
import { bookingService } from "../services/booking.service.js";
import { notificationService } from "../services/notification.service.js";
import { soundService } from "../services/sound.service.js";

export class DemoController {
  constructor() {
    this.currentStep = 1;
    this.selectedMode = "in-clinic"; // 'in-clinic' or 'homecare'
    this.selectedBranch = CLINIC_BRANCHES[0];
    this.selectedService = CLINIC_SERVICES[0];
    this.selectedPractitioner = PRACTITIONERS[0];
    this.selectedDate = new Date().toISOString().split("T")[0];
    this.selectedSlot = DEFAULT_SLOTS[1];
    this.selectedPainSpots = new Set(["Pinggang / Lumbar"]);
    this.selectedPayType = "deposit"; // 'deposit', 'full', 'clinic'
    this.patientName = "Amanda Tan";
    this.patientPhone = "+65 8123 4567";
    this.holdTimerInterval = null;
    this.holdSeconds = 600;
  }

  init() {
    this.setupRoleSwitcher();
    this.setupWizardNavigation();
    this.setupServiceAndBranchPickers();
    this.setupDatePicker();
    this.setupPaymentSelection();
    this.setupPainMap();
    this.setupTripleConstraintLive();
    this.setupCheckoutDemo();
    this.setupStaffOperations();
    this.setupWhatsAppSimulator();
    this.setupROICalculator();
    this.updateWizardSummary();
  }

  /* -------------------------------------------------------------
   * 1. TOPBAR ROLE / PERSPECTIVE SWITCHER
   * ------------------------------------------------------------- */
  setupRoleSwitcher() {
    const roleButtons = document.querySelectorAll(".demo-role-btn");
    const panes = document.querySelectorAll(".demo-pane");

    roleButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const target = btn.dataset.pane;
        soundService.playClickTone();

        roleButtons.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");

        panes.forEach((pane) => {
          pane.classList.remove("active");
          if (pane.id === target) {
            pane.classList.add("active");
          }
        });
      });
    });
  }

  /* -------------------------------------------------------------
   * 2. PATIENT BOOKING 5-STEP WIZARD
   * ------------------------------------------------------------- */
  setupWizardNavigation() {
    const nextBtns = document.querySelectorAll(".btn-wizard-next");
    const prevBtns = document.querySelectorAll(".btn-wizard-prev");
    const stepItems = document.querySelectorAll(".wizard-step-item");

    nextBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        if (this.currentStep < 5) {
          this.goToStep(this.currentStep + 1);
        }
      });
    });

    prevBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        if (this.currentStep > 1) {
          this.goToStep(this.currentStep - 1);
        }
      });
    });

    stepItems.forEach((item) => {
      item.addEventListener("click", () => {
        const step = parseInt(item.dataset.step, 10);
        if (step) this.goToStep(step);
      });
    });
  }

  goToStep(step) {
    this.currentStep = step;
    soundService.playClickTone();

    // Update Step Indicators
    const stepItems = document.querySelectorAll(".wizard-step-item");
    stepItems.forEach((item) => {
      const s = parseInt(item.dataset.step, 10);
      item.classList.remove("active", "completed");
      if (s === step) item.classList.add("active");
      else if (s < step) item.classList.add("completed");
    });

    // Update Step Panels
    const panels = document.querySelectorAll(".wizard-step-panel");
    panels.forEach((p) => {
      p.classList.remove("active");
      if (p.id === `wizardStep${step}`) {
        p.classList.add("active");
      }
    });

    if (step === 3) {
      this.startSlotHoldTimer();
    }

    this.updateWizardSummary();
    window.scrollTo({ top: 120, behavior: "smooth" });
  }

  /* -------------------------------------------------------------
   * 3. SERVICE, BRANCH & RESOURCE PICKERS
   * ------------------------------------------------------------- */
  setupServiceAndBranchPickers() {
    // Mode Switcher (In-Clinic vs Homecare)
    const modeTabs = document.querySelectorAll(".service-mode-tab");
    modeTabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        modeTabs.forEach((t) => t.classList.remove("active"));
        tab.classList.add("active");
        this.selectedMode = tab.dataset.mode || "in-clinic";
        soundService.playClickTone();

        const homecareInfo = document.getElementById("homecareTravelBox");
        if (homecareInfo) {
          homecareInfo.style.display = this.selectedMode === "homecare" ? "block" : "none";
        }
        this.updateWizardSummary();
      });
    });

    // Service Cards
    const serviceCards = document.querySelectorAll(".demo-service-card");
    serviceCards.forEach((card) => {
      card.addEventListener("click", () => {
        serviceCards.forEach((c) => c.classList.remove("active"));
        card.classList.add("active");

        const serviceId = card.dataset.service;
        this.selectedService = CLINIC_SERVICES.find((s) => s.id === serviceId) || CLINIC_SERVICES[0];
        soundService.playClickTone();

        // Adjust dynamic intake form fields based on service profile
        this.adjustIntakeFormProfile(serviceId);
        this.updateTripleConstraintInspector();
        this.updateWizardSummary();
      });
    });

    // Branch Selector
    const branchSelect = document.getElementById("demoBranchSelect");
    if (branchSelect) {
      branchSelect.addEventListener("change", (e) => {
        const branchId = e.target.value;
        this.selectedBranch = CLINIC_BRANCHES.find((b) => b.id === branchId) || CLINIC_BRANCHES[0];
        this.updateTripleConstraintInspector();
        this.updateWizardSummary();
      });
    }

    // Practitioner Selector
    const pracSelect = document.getElementById("demoPracSelect");
    if (pracSelect) {
      pracSelect.addEventListener("change", (e) => {
        const pracId = e.target.value;
        this.selectedPractitioner = PRACTITIONERS.find((p) => p.id === pracId) || PRACTITIONERS[0];
        this.updateTripleConstraintInspector();
        this.updateWizardSummary();
      });
    }

    // Slot Grid
    const slotElements = document.querySelectorAll(".demo-slot");
    slotElements.forEach((slot) => {
      slot.addEventListener("click", () => {
        slotElements.forEach((s) => s.classList.remove("active"));
        slot.classList.add("active");
        this.selectedSlot = slot.textContent.trim();
        soundService.playClickTone();
        this.startSlotHoldTimer();
        this.updateWizardSummary();
      });
    });
  }

  /* -------------------------------------------------------------
   * 4. DATE PICKER WITH ANTI-PAST CONSTRAINT
   * ------------------------------------------------------------- */
  setupDatePicker() {
    const dateInput = document.getElementById("demoDateInput");
    if (!dateInput) return;

    const today = new Date().toISOString().split("T")[0];
    dateInput.min = today;
    dateInput.value = today;
    this.selectedDate = today;

    dateInput.addEventListener("change", (e) => {
      if (e.target.value < today) {
        e.target.value = today;
        alert("⚠️ Tanggal tidak dapat dipilih ke masa lalu. Sistem telah mengembalikan pilihan ke hari ini.");
      }
      this.selectedDate = e.target.value || today;
      this.updateWizardSummary();
    });
  }

  /* -------------------------------------------------------------
   * 5. PAYMENT SELECTION (DEPOSIT / FULL / CLINIC)
   * ------------------------------------------------------------- */
  setupPaymentSelection() {
    const payCards = document.querySelectorAll(".pay-option-card");
    payCards.forEach((card) => {
      card.addEventListener("click", () => {
        payCards.forEach((c) => c.classList.remove("active"));
        card.classList.add("active");

        const radio = card.querySelector('input[type="radio"]');
        if (radio) radio.checked = true;

        this.selectedPayType = card.dataset.paytype || "deposit";
        soundService.playClickTone();

        const desc = document.getElementById("payTypeDesc");
        if (desc) {
          if (this.selectedPayType === "deposit") {
            desc.innerHTML = "💡 <strong>Uang Muka:</strong> Bayar uang muka sekarang untuk mengunci slot, sisa tagihan dilunasi di meja kasir setelah terapi selesai.";
          } else if (this.selectedPayType === "full") {
            desc.innerHTML = "💡 <strong>Bayar Penuh:</strong> Bayar lunas 100% via instant gateway untuk administrasi cepat dan bebas antre di kasir klinik.";
          } else if (this.selectedPayType === "clinic") {
            desc.innerHTML = "💡 <strong>Bayar di Tempat:</strong> Tidak perlu bayar sekarang. Pelunasan tagihan dilakukan langsung di meja kasir/resepsionis saat kedatangan.";
          }
        }

        this.updateWizardSummary();
      });
    });
  }

  adjustIntakeFormProfile(serviceId) {
    const tcmGroup = document.getElementById("intakeGroupTCM");
    const spaGroup = document.getElementById("intakeGroupSpa");
    const medGroup = document.getElementById("intakeGroupMedical");

    if (tcmGroup) tcmGroup.style.display = serviceId === "tcm" || serviceId === "physio" ? "block" : "none";
    if (spaGroup) spaGroup.style.display = serviceId === "wellness" ? "block" : "none";
    if (medGroup) medGroup.style.display = serviceId === "referral" ? "block" : "none";
  }

  /* -------------------------------------------------------------
   * 6. VISUAL BODY PAIN MAP
   * ------------------------------------------------------------- */
  setupPainMap() {
    const tags = document.querySelectorAll(".pain-spot-tag");
    tags.forEach((tag) => {
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
        this.updateWizardSummary();
      });
    });
  }

  /* -------------------------------------------------------------
   * 7. TRIPLE-CONSTRAINT LIVE VALIDATION
   * ------------------------------------------------------------- */
  setupTripleConstraintLive() {
    this.updateTripleConstraintInspector();
  }

  updateTripleConstraintInspector() {
    const pracElem = document.getElementById("tcPractitionerVal");
    const roomElem = document.getElementById("tcRoomVal");
    const equipElem = document.getElementById("tcEquipVal");

    if (pracElem) pracElem.textContent = `${this.selectedPractitioner?.name || "Dr. Lim"} (Ready)`;
    if (roomElem) roomElem.textContent = `${this.selectedBranch?.rooms[0] || "Room A1"} (Available)`;
    if (equipElem) {
      equipElem.textContent = this.selectedService?.requiresEquipment || "Standard Consultation Kit";
    }
  }

  startSlotHoldTimer() {
    if (this.holdTimerInterval) clearInterval(this.holdTimerInterval);
    this.holdSeconds = 600;

    const holdDisplay = document.getElementById("demoHoldTimerDisplay");
    this.holdTimerInterval = setInterval(() => {
      this.holdSeconds -= 1;
      const min = Math.floor(this.holdSeconds / 60);
      const sec = this.holdSeconds % 60;
      const formatted = `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;

      if (holdDisplay) holdDisplay.textContent = `${formatted} left`;

      if (this.holdSeconds <= 0) {
        clearInterval(this.holdTimerInterval);
        if (holdDisplay) holdDisplay.textContent = "00:00 (Expired)";
      }
    }, 1000);
  }

  /* -------------------------------------------------------------
   * 8. CHECKOUT & TICKET SIMULATION
   * ------------------------------------------------------------- */
  setupCheckoutDemo() {
    const handleCheckout = () => {
      soundService.playQueueChime();

      const isMY = this.selectedBranch.region === "my";
      const curr = isMY ? "MYR" : "SGD";
      const price = isMY ? this.selectedService.priceMYR : this.selectedService.priceSGD;
      const deposit = isMY ? this.selectedService.depositMYR : this.selectedService.depositSGD;

      let paymentText = "";
      if (this.selectedPayType === "deposit") {
        paymentText = `${curr} ${deposit}.00 (Deposit Dibayar, Sisa ${curr} ${price - deposit}.00 di Kasir)`;
      } else if (this.selectedPayType === "full") {
        paymentText = `${curr} ${price}.00 (Lunas 100%)`;
      } else {
        paymentText = `Bayar di Tempat (${curr} ${price}.00 saat kedatangan)`;
      }

      const booking = bookingService.createBooking({
        patientName: this.patientName,
        branchName: this.selectedBranch.name,
        schedule: `${this.selectedDate}, ${this.selectedSlot}`,
        serviceName: this.selectedService.name,
        practitionerName: this.selectedPractitioner.name,
        depositPaid: paymentText
      });

      // Trigger notification log
      notificationService.logNotification({
        channel: "WHATSAPP",
        recipient: this.patientPhone,
        status: "DELIVERED",
        bookingCode: booking.code
      });

      alert(`🎉 RESERVASI BERHASIL DISIMULASIKAN!\n\nKode Booking: ${booking.code}\nPasien: ${this.patientName}\nLayanan: ${this.selectedService.name}\nTanggal & Jam: ${this.selectedDate} • ${this.selectedSlot}\nStatus Pembayaran: ${paymentText}\n\nNotifikasi WhatsApp & Tiket Digital telah diterbitkan!`);

      // Switch to WhatsApp simulator to show live effect
      const waTab = document.querySelector('[data-pane="paneWhatsAppSimulator"]');
      if (waTab) waTab.click();
    };

    const confirmBtn = document.getElementById("btnConfirmDemoBooking");
    if (confirmBtn) confirmBtn.addEventListener("click", handleCheckout);

    const bottomCheckoutBtn = document.getElementById("btnBottomCheckout");
    if (bottomCheckoutBtn) bottomCheckoutBtn.addEventListener("click", handleCheckout);
  }

  updateWizardSummary() {
    const isMY = this.selectedBranch.region === "my";
    const curr = isMY ? "MYR" : "SGD";
    const price = isMY ? this.selectedService.priceMYR : this.selectedService.priceSGD;
    const deposit = isMY ? this.selectedService.depositMYR : this.selectedService.depositSGD;

    const summaryBranch = document.getElementById("summaryBranch");
    const summaryService = document.getElementById("summaryService");
    const summaryPrac = document.getElementById("summaryPractitioner");
    const summarySchedule = document.getElementById("summarySchedule");
    const summaryPayLabel = document.getElementById("summaryPayLabel");
    const summaryDeposit = document.getElementById("summaryDeposit");
    const summaryPain = document.getElementById("summaryPain");
    const confirmBtn = document.getElementById("btnConfirmDemoBooking");
    const bottomCheckoutBtn = document.getElementById("btnBottomCheckout");

    if (summaryBranch) summaryBranch.textContent = this.selectedBranch.name;
    if (summaryService) summaryService.textContent = `${this.selectedService.name} (${curr} ${price})`;
    if (summaryPrac) summaryPrac.textContent = this.selectedPractitioner.name;
    if (summarySchedule) summarySchedule.textContent = `${this.selectedDate || "Today"}, ${this.selectedSlot}`;
    if (summaryPain) {
      summaryPain.textContent = this.selectedPainSpots.size > 0
        ? Array.from(this.selectedPainSpots).join(", ")
        : "General Wellness";
    }

    // Dynamic Payment Summary based on selectedPayType
    if (this.selectedPayType === "deposit") {
      if (summaryPayLabel) summaryPayLabel.textContent = "Biaya Deposit (Online):";
      if (summaryDeposit) {
        summaryDeposit.textContent = `${curr} ${deposit}.00 (Sisa ${curr} ${price - deposit}.00 di Kasir)`;
        summaryDeposit.style.color = "var(--primary-dark)";
      }
      if (confirmBtn) confirmBtn.textContent = `⚡ Selesaikan Pembayaran Deposit (${curr} ${deposit}.00) & Terbitkan Tiket →`;
      if (bottomCheckoutBtn) bottomCheckoutBtn.textContent = `💳 Bayar Deposit (${curr} ${deposit}.00) & Checkout →`;
    } else if (this.selectedPayType === "full") {
      if (summaryPayLabel) summaryPayLabel.textContent = "Total Pembayaran (Lunas):";
      if (summaryDeposit) {
        summaryDeposit.textContent = `${curr} ${price}.00 (Lunas / 100%)`;
        summaryDeposit.style.color = "var(--success-dark)";
      }
      if (confirmBtn) confirmBtn.textContent = `⚡ Selesaikan Bayar Penuh (${curr} ${price}.00) & Terbitkan Tiket →`;
      if (bottomCheckoutBtn) bottomCheckoutBtn.textContent = `💳 Bayar Penuh (${curr} ${price}.00) & Checkout →`;
    } else if (this.selectedPayType === "clinic") {
      if (summaryPayLabel) summaryPayLabel.textContent = "Metode Pembayaran:";
      if (summaryDeposit) {
        summaryDeposit.textContent = `Bayar di Tempat (${curr} ${price}.00 saat kedatangan)`;
        summaryDeposit.style.color = "var(--text)";
      }
      if (confirmBtn) confirmBtn.textContent = `⚡ Konfirmasi Reservasi (Bayar di Klinik) & Terbitkan Tiket →`;
      if (bottomCheckoutBtn) bottomCheckoutBtn.textContent = `💳 Konfirmasi Booking (Bayar di Klinik) →`;
    }
  }

  /* -------------------------------------------------------------
   * 9. STAFF OPERATIONS DEMO
   * ------------------------------------------------------------- */
  setupStaffOperations() {
    const callQueueBtns = document.querySelectorAll(".btn-demo-call-queue");
    callQueueBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const queueNo = btn.dataset.queue || "A-01";
        const patient = btn.dataset.patient || "Patient";
        soundService.playQueueChime();
        alert(`🔊 [Simulasi Audio Chime Aktif]\nMemanggil Antrean ${queueNo} atas nama ${patient} menuju Ruangan Fisioterapi 1.`);
      });
    });

    window.openDemoSIMRSInspection = () => {
      soundService.playClickTone();
      alert(`[SIMRS Ephemeral Proxy Webhook Payload]\n\n{\n  "event": "referral.forwarded",\n  "booking_code": "BK-20260901-0812",\n  "ephemeral_ttl": "72_hours",\n  "simrs_endpoint": "https://simrs.hospital-partner.com/v1/bridge",\n  "hmac_signature": "sha256=9f83...a1b2",\n  "status": "FORWARDED_SUCCESS"\n}`);
    };

    window.openDemoPOSModal = (queue) => {
      soundService.playClickTone();
      const amount = prompt(`Pelunasan Kasir POS Antrean ${queue}. Masukkan nominal pelunasan (SGD/MYR):`, "65.00");
      if (amount) {
        soundService.playQueueChime();
        alert(`Pelunasan tagihan ${queue} sebesar ${amount} berhasil dicatat di kasir! E-Receipt dikirimkan.`);
      }
    };
  }

  /* -------------------------------------------------------------
   * 10. WHATSAPP 2-WAY SIMULATOR
   * ------------------------------------------------------------- */
  setupWhatsAppSimulator() {
    const confirmAttendanceBtn = document.getElementById("waBtnConfirmAttendance");
    const rescheduleBtn = document.getElementById("waBtnReschedule");
    const mapsBtn = document.getElementById("waBtnMaps");

    if (confirmAttendanceBtn) {
      confirmAttendanceBtn.addEventListener("click", () => {
        soundService.playQueueChime();
        const chatBody = document.querySelector(".wa-demo-body");
        if (chatBody) {
          const reply = document.createElement("div");
          reply.className = "wa-msg wa-outgoing";
          reply.textContent = "✅ Ya, saya konfirmasi akan hadir tepat waktu.";
          chatBody.appendChild(reply);

          setTimeout(() => {
            const botReply = document.createElement("div");
            botReply.className = "wa-msg wa-incoming";
            botReply.textContent = "Terima kasih Amanda! Status kehadiran Anda telah terverifikasi di sistem resepsionis klinik.";
            chatBody.appendChild(botReply);
          }, 600);
        }
      });
    }

    if (rescheduleBtn) {
      rescheduleBtn.addEventListener("click", () => {
        soundService.playClickTone();
        alert("Simulasi Reschedule: Link token reschedule mandiri 1-klik terbuka di browser pasien tanpa perlu login.");
      });
    }

    if (mapsBtn) {
      mapsBtn.addEventListener("click", () => {
        soundService.playClickTone();
        alert("Membuka rute Google Maps / Waze menuju Paragon Medical Orchard Singapore.");
      });
    }
  }

  /* -------------------------------------------------------------
   * 11. ROI & COMPARATIVE CALCULATOR
   * ------------------------------------------------------------- */
  setupROICalculator() {
    const slider = document.getElementById("roiApptSlider");
    const apptCountVal = document.getElementById("roiApptCountVal");
    const savedLossVal = document.getElementById("roiSavedLossVal");
    const noShowBeforeVal = document.getElementById("roiNoShowBeforeVal");
    const noShowAfterVal = document.getElementById("roiNoShowAfterVal");

    if (slider) {
      slider.addEventListener("input", (e) => {
        const appts = parseInt(e.target.value, 10);
        if (apptCountVal) apptCountVal.textContent = `${appts} pasien / bulan`;

        // Baseline: 24.8% no show rate with email only
        const noShowBefore = Math.round(appts * 0.248);
        // With WhatsApp multi-stage reminders: 3.2%
        const noShowAfter = Math.round(appts * 0.032);
        const preventedNoShows = noShowBefore - noShowAfter;

        // Average consultation / therapy fee: SGD 95
        const savedAmount = preventedNoShows * 95;

        if (noShowBeforeVal) noShowBeforeVal.textContent = `${noShowBefore} no-shows`;
        if (noShowAfterVal) noShowAfterVal.textContent = `${noShowAfter} no-shows`;
        if (savedLossVal) savedLossVal.textContent = `SGD ${savedAmount.toLocaleString("en-US")}`;
      });
    }
  }
}

/**
 * Cliniva — Product Demo Controller
 * SOLID: Single Responsibility for Complete Product Demo Sandbox Interactions across ALL User Roles
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
    this.selectedPainSpots = new Set(["Lower Back / Lumbar"]);
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
    this.setupReceptionist();
    this.setupDoctor();
    this.setupWhatsAppSimulator();
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
        window.scrollTo({ top: 80, behavior: "smooth" });
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
        alert("⚠️ Cannot select past dates. Selection reset to today.");
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
            desc.innerHTML = "💡 <strong>Deposit:</strong> Pay deposit now to lock the slot, balance settled at counter after therapy.";
          } else if (this.selectedPayType === "full") {
            desc.innerHTML = "💡 <strong>Pay in Full:</strong> Pay 100% online for expedited front-desk clearance and priority access.";
          } else if (this.selectedPayType === "clinic") {
            desc.innerHTML = "💡 <strong>Pay at Clinic:</strong> No upfront payment. Settle full amount directly at clinic counter upon arrival.";
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
        paymentText = `${curr} ${deposit}.00 (Deposit Paid, Balance ${curr} ${price - deposit}.00 at Counter)`;
      } else if (this.selectedPayType === "full") {
        paymentText = `${curr} ${price}.00 (Paid in Full / 100%)`;
      } else {
        paymentText = `Pay at Clinic (${curr} ${price}.00 upon arrival)`;
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

      alert(`🎉 RESERVATION CONFIRMED!\n\nBooking Code: ${booking.code}\nPatient: ${this.patientName}\nService: ${this.selectedService.name}\nDate & Time: ${this.selectedDate} • ${this.selectedSlot}\nPayment Status: ${paymentText}\n\nWhatsApp notification & digital e-ticket issued!`);

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

    if (this.selectedPayType === "deposit") {
      if (summaryPayLabel) summaryPayLabel.textContent = "Online Deposit:";
      if (summaryDeposit) {
        summaryDeposit.textContent = `${curr} ${deposit}.00 (Balance ${curr} ${price - deposit}.00 at Counter)`;
        summaryDeposit.style.color = "var(--primary-dark)";
      }
      if (confirmBtn) confirmBtn.textContent = `⚡ Complete Deposit (${curr} ${deposit}.00) & Issue Ticket →`;
      if (bottomCheckoutBtn) bottomCheckoutBtn.textContent = `💳 Pay Deposit (${curr} ${deposit}.00) & Checkout →`;
    } else if (this.selectedPayType === "full") {
      if (summaryPayLabel) summaryPayLabel.textContent = "Total Payment (Full):";
      if (summaryDeposit) {
        summaryDeposit.textContent = `${curr} ${price}.00 (Paid in Full / 100%)`;
        summaryDeposit.style.color = "var(--success-dark)";
      }
      if (confirmBtn) confirmBtn.textContent = `⚡ Pay in Full (${curr} ${price}.00) & Issue Ticket →`;
      if (bottomCheckoutBtn) bottomCheckoutBtn.textContent = `💳 Pay in Full (${curr} ${price}.00) & Checkout →`;
    } else if (this.selectedPayType === "clinic") {
      if (summaryPayLabel) summaryPayLabel.textContent = "Payment Method:";
      if (summaryDeposit) {
        summaryDeposit.textContent = `Pay at Clinic (${curr} ${price}.00 upon arrival)`;
        summaryDeposit.style.color = "var(--text)";
      }
      if (confirmBtn) confirmBtn.textContent = `⚡ Confirm Booking (Pay at Clinic) & Issue Ticket →`;
      if (bottomCheckoutBtn) bottomCheckoutBtn.textContent = `💳 Confirm Booking (Pay at Clinic) →`;
    }
  }

  /* -------------------------------------------------------------
   * 9. RECEPTIONIST & FRONT-DESK WORKFLOW
   * ------------------------------------------------------------- */
  setupReceptionist() {
    // Quick Walk-In Modal
    const openModalBtn = document.getElementById("btnOpenWalkInModal");
    const closeModalBtn = document.getElementById("btnCloseWalkInModal");
    const modal = document.getElementById("modalWalkIn");
    const form = document.getElementById("formQuickWalkIn");

    if (openModalBtn && modal) {
      openModalBtn.addEventListener("click", () => {
        soundService.playClickTone();
        modal.classList.add("active");
      });
    }

    if (closeModalBtn && modal) {
      closeModalBtn.addEventListener("click", () => {
        modal.classList.remove("active");
      });
    }

    if (form && modal) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        soundService.playQueueChime();
        const name = document.getElementById("walkInName").value || "Walk-In Patient";
        const service = document.getElementById("walkInService").value || "Physiotherapy";
        modal.classList.remove("active");
        form.reset();

        alert(`🎟️ WALK-IN TICKET ISSUED!\n\nQueue Number: D-04\nPatient: ${name}\nService: ${service}\nStatus: Ready to be called at reception.`);
      });
    }

    // Queue Call Buttons
    const callQueueBtns = document.querySelectorAll(".btn-demo-call-queue");
    callQueueBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const queueNo = btn.dataset.queue || "A-01";
        const patient = btn.dataset.patient || "Patient";
        const room = btn.dataset.room || "Therapy Room";
        soundService.playQueueChime();
        alert(`🔊 [Audio Chime Simulation Active]\n"Queue Number ${queueNo}, ${patient}, please proceed to ${room}."`);
      });
    });

    window.openDemoSIMRSInspection = () => {
      soundService.playClickTone();
      alert(`[SIMRS Ephemeral Proxy Webhook Payload]\n\n{\n  "event": "referral.forwarded",\n  "booking_code": "BK-20260901-0812",\n  "ephemeral_ttl": "72_hours",\n  "simrs_endpoint": "https://simrs.hospital-partner.com/v1/bridge",\n  "hmac_signature": "sha256=9f83...a1b2",\n  "status": "FORWARDED_SUCCESS"\n}`);
    };

    window.openDemoPOSModal = (queue, patient, balance) => {
      soundService.playClickTone();
      const confirmed = confirm(`POS Cashier Settlement for Queue ${queue} (${patient}).\n\nBalance Due: SGD/MYR ${balance}\nMethod: Debit/Credit EDC or PayNow/DuitNow.\n\nProceed with settlement?`);
      if (confirmed) {
        soundService.playQueueChime();
        alert(`✓ Queue ${queue} (${patient}) payment of ${balance} COMPLETED! E-Receipt sent to patient's WhatsApp.`);
      }
    };
  }

  /* -------------------------------------------------------------
   * 10. DOCTOR / PRACTITIONER WORKFLOW
   * ------------------------------------------------------------- */
  setupDoctor() {
    const docSlider = document.getElementById("docPainScaleSlider");
    const docPainVal = document.getElementById("docPainScaleVal");

    if (docSlider && docPainVal) {
      docSlider.addEventListener("input", (e) => {
        const v = parseInt(e.target.value, 10);
        let desc = "Pain Free";
        if (v > 7) desc = "Severe Pain";
        else if (v > 4) desc = "Moderate Pain";
        else if (v > 0) desc = "Mild Pain";

        docPainVal.textContent = `${v} / 10 (${desc})`;
      });
    }

    const completeBtn = document.getElementById("btnDoctorCompleteSession");
    if (completeBtn) {
      completeBtn.addEventListener("click", () => {
        soundService.playQueueChime();
        alert(`✓ THERAPY SESSION COMPLETED!\n\nPatient: Amanda Tan\nPain Evaluation: Reduced from 8/10 to ${docSlider ? docSlider.value : 3}/10.\nRemaining Package: 5 of 8 sessions.\n\nSystem automatically sent WhatsApp Therapy Summary & Home Exercise guide to patient.`);
      });
    }
  }

  /* -------------------------------------------------------------
   * 11. WHATSAPP 2-WAY SIMULATOR
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
          reply.textContent = "✅ Yes, I confirm I will attend on time.";
          chatBody.appendChild(reply);

          setTimeout(() => {
            const botReply = document.createElement("div");
            botReply.className = "wa-msg wa-incoming";
            botReply.textContent = "Thank you Amanda! Your attendance status has been confirmed at the clinic reception.";
            chatBody.appendChild(botReply);
          }, 600);
        }
      });
    }

    if (rescheduleBtn) {
      rescheduleBtn.addEventListener("click", () => {
        soundService.playClickTone();
        alert("Reschedule Simulation: 1-click self-service reschedule link opened in patient's browser without requiring login.");
      });
    }

    if (mapsBtn) {
      mapsBtn.addEventListener("click", () => {
        soundService.playClickTone();
        alert("Opening Google Maps / Waze directions to Paragon Medical Orchard Singapore.");
      });
    }
  }
}

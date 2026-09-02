/**
 * Cliniva — Booking Controller
 * SOLID: Single Responsibility for Booking Form DOM events & State Synchronization
 */

import { bookingService } from "../services/booking.service.js";
import { soundService } from "../services/sound.service.js";

export class BookingController {
  constructor(uiController) {
    this.ui = uiController;
    this.selectedBranch = "sg-orchard";
    this.selectedService = "physio";
    this.selectedPractitioner = "Fastest Available";
    this.selectedSlot = "10:30";
    this.patientName = "Amanda Tan";
  }

  init() {
    this.setupServiceSelection();
    this.setupSlotSelection();
    this.setupBranchPicker();
    this.setupCheckoutButton();
    this.startInitialSlotHold();
  }

  setupServiceSelection() {
    const serviceCards = document.querySelectorAll(".service-card");
    serviceCards.forEach((card) => {
      card.addEventListener("click", () => {
        serviceCards.forEach((item) => item.classList.remove("active"));
        card.classList.add("active");

        const title = card.querySelector("h4")?.textContent.toLowerCase() || "";
        if (title.includes("physio")) this.selectedService = "physio";
        else if (title.includes("tcm")) this.selectedService = "tcm";
        else if (title.includes("wellness")) this.selectedService = "wellness";
        else if (title.includes("referral")) this.selectedService = "referral";

        soundService.playClickTone();
        this.updateSummary();
      });
    });
  }

  setupSlotSelection() {
    const slots = document.querySelectorAll(".slot");
    slots.forEach((slot) => {
      slot.addEventListener("click", () => {
        const parent = slot.parentElement;
        parent.querySelectorAll(".slot").forEach((item) => item.classList.remove("active"));
        slot.classList.add("active");

        this.selectedSlot = slot.textContent.trim();
        soundService.playClickTone();
        this.startInitialSlotHold();
        this.updateSummary();
      });
    });
  }

  setupBranchPicker() {
    const branchSelect = document.querySelector("#booking select");
    if (branchSelect) {
      branchSelect.addEventListener("change", (e) => {
        this.selectedBranch = e.target.value;
        this.updateSummary();
      });
    }
  }

  startInitialSlotHold() {
    const holdDisplay = document.querySelector(".mini-checkout strong:nth-of-type(2)");
    bookingService.startSlotHold(
      { slot: this.selectedSlot },
      (timeFormatted) => {
        if (holdDisplay) {
          holdDisplay.textContent = `${timeFormatted} left`;
        }
      },
      () => {
        if (this.ui) {
          this.ui.showToast("Slot hold expired. Please re-select your preferred time slot.", "⏰");
        }
      }
    );
  }

  updateSummary() {
    const summaryList = document.querySelector(".summary-list");
    if (!summaryList) return;

    const services = bookingService.getServices();
    const currentService = services.find((s) => s.id === this.selectedService) || services[0];

    const branchName = this.selectedBranch.includes("Kuala")
      ? "Kuala Lumpur Integrated Care"
      : this.selectedBranch.includes("Penang")
      ? "Penang TCM & Physio Center"
      : "Orchard Wellness Clinic";

    const isMY = branchName.includes("Malaysia") || branchName.includes("Kuala") || branchName.includes("Penang");
    const depositStr = isMY
      ? `Deposit · MYR ${currentService.depositMYR}`
      : `Deposit · SGD ${currentService.depositSGD}`;

    // Update mini-checkout deposit text in hero mockup if exists
    const heroDeposit = document.querySelector(".mini-checkout strong:first-of-type");
    if (heroDeposit) {
      heroDeposit.textContent = isMY ? `MYR ${currentService.depositMYR}.00` : `SGD ${currentService.depositSGD}.00`;
    }

    const items = summaryList.querySelectorAll(".summary-item strong");
    if (items.length >= 6) {
      items[0].textContent = this.patientName;
      items[1].textContent = branchName;
      items[2].textContent = `Wed, ${this.selectedSlot} AM`;
      items[3].textContent = "Practitioner ✅ Room ✅ Equipment ✅";
      items[4].textContent = depositStr;
      items[5].textContent = "WhatsApp + Email fallback";
    }
  }

  setupCheckoutButton() {
    const checkoutBtn = document.querySelector(".booking-preview .btn-primary");
    if (checkoutBtn) {
      checkoutBtn.addEventListener("click", () => {
        soundService.playQueueChime();

        const booking = bookingService.createBooking({
          patientName: this.patientName,
          branchName: "Orchard Wellness Clinic",
          schedule: `Wed, ${this.selectedSlot} AM`,
          serviceName: this.selectedService.toUpperCase(),
          practitionerName: "Dr. Lim Wei Han",
          depositPaid: "SGD 30.00"
        });

        if (this.ui) {
          this.ui.showToast(`Booking ${booking.code} confirmed! E-Ticket generated.`, "🎉");
        }

        // Auto redirect to ticket or show confirmation
        setTimeout(() => {
          window.location.href = "ticket.html";
        }, 1200);
      });
    }
  }
}

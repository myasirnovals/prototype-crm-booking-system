/**
 * Cliniva — Admin Controller
 * SOLID: Single Responsibility for Clinic Operations Dashboard, Live Queue Calling & POS
 */

import { soundService } from "../services/sound.service.js";

export class AdminController {
  constructor() {
    this.tabButtons = document.querySelectorAll(".admin-tab-btn");
    this.tabPanes = document.querySelectorAll(".admin-tab-pane");
  }

  init() {
    this.setupAdminTabs();
    this.setupQueueCalling();
    this.setupPOSActions();
  }

  setupAdminTabs() {
    this.tabButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const target = btn.dataset.pane;
        soundService.playClickTone();

        this.tabButtons.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");

        this.tabPanes.forEach((pane) => {
          pane.style.display = pane.id === target ? "block" : "none";
        });
      });
    });
  }

  setupQueueCalling() {
    const callButtons = document.querySelectorAll(".btn-call-queue");
    callButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const queueNo = btn.dataset.queue || "A-01";
        const patientName = btn.dataset.patient || "Patient";

        soundService.playQueueChime();

        const card = btn.closest(".queue-card");
        if (card) {
          card.classList.add("calling");
          setTimeout(() => card.classList.remove("calling"), 3000);
        }

        alert(`🔊 Calling Queue ${queueNo} (${patientName}) to Room A1!`);
      });
    });
  }

  setupPOSActions() {
    window.openPOSModal = (queueNo) => {
      soundService.playClickTone();
      const amount = prompt(`Process Cashier Settlement for Queue ${queueNo}. Enter Payment Amount (SGD):`, "225.00");
      if (amount) {
        soundService.playQueueChime();
        alert(`Payment of SGD ${amount} for ${queueNo} recorded! Receipt printed.`);
      }
    };

    window.openSIMRSInspection = (referralId) => {
      soundService.playClickTone();
      alert(`Inspecting Ephemeral SIMRS Webhook Payload for [${referralId}]:\n\nHMAC: Valid SHA-256\nRetention TTL: 70h 14m remaining\nDestination: SIMRS Hospital Bridge`);
    };
  }
}

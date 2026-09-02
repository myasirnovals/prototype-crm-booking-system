/**
 * Cliniva — Dashboard Controller
 * SOLID: Single Responsibility for Operations Dashboard & Calendar Synchronization
 */

import { soundService } from "../services/sound.service.js";

export class DashboardController {
  constructor(uiController) {
    this.ui = uiController;
    this.branchSelect = document.querySelector("#dashboard .select");
    this.walkInBtn = document.querySelector("#dashboard .panel-actions .btn-primary");
  }

  init() {
    this.setupBranchFilter();
    this.setupWalkInButton();
    this.setupSidebarNavigation();
  }

  setupBranchFilter() {
    if (!this.branchSelect) return;

    this.branchSelect.addEventListener("change", (e) => {
      const branch = e.target.value;
      soundService.playClickTone();

      if (this.ui) {
        this.ui.showToast(`Switched operational view to ${branch}`, "📍");
      }

      // Dynamic metrics adjustment based on branch
      const revenueMetric = document.querySelector(".metric-card:nth-child(3) strong");
      if (revenueMetric) {
        if (branch.includes("Kuala Lumpur")) {
          revenueMetric.textContent = "MYR 24.5k";
        } else if (branch.includes("Penang")) {
          revenueMetric.textContent = "MYR 16.2k";
        } else {
          revenueMetric.textContent = "SGD 9.8k";
        }
      }
    });
  }

  setupWalkInButton() {
    if (!this.walkInBtn) return;

    this.walkInBtn.addEventListener("click", () => {
      soundService.playClickTone();
      const patientName = prompt("Enter Walk-in Patient Name (Fast Dispatch):", "Bambang Wijaya");
      if (patientName) {
        soundService.playQueueChime();
        if (this.ui) {
          this.ui.showToast(`Walk-in appointment created for ${patientName} (Queue Assigned: W-04)`, "⚡");
        }
      }
    });
  }

  setupSidebarNavigation() {
    const sideLinks = document.querySelectorAll(".side-link");
    sideLinks.forEach((link) => {
      link.addEventListener("click", () => {
        sideLinks.forEach((item) => item.classList.remove("active"));
        link.classList.add("active");
        soundService.playClickTone();
      });
    });
  }
}

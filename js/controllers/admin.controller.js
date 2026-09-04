/**
 * Cliniva — Admin / Receptionist Controller
 * SOLID: Single Responsibility for Clinic Operations Dashboard, Live Queue Calling & POS
 */

import { authService, USER_ROLES } from "../services/auth.service.js";
import { soundService } from "../services/sound.service.js";
import { i18nService } from "../services/i18n.service.js";
import { storageService } from "../services/storage.service.js";

export class AdminController {
  constructor() {
    this.tabButtons = document.querySelectorAll(".admin-tab-btn");
    this.tabPanes = document.querySelectorAll(".admin-tab-pane");
    this.signOutBtn = document.getElementById("adminSignOutBtn");
    this.walkInBtn = document.getElementById("adminWalkInBtn");
  }

  init() {
    // Session Guard: Verify user has RECEPTIONIST or OWNER role
    const session = authService.requireAuth([USER_ROLES.RECEPTIONIST, USER_ROLES.OWNER]);
    if (!session) return;

    this.renderUserInfo(session.user, session.role);
    this.setupAdminTabs();
    this.setupQueueCalling();
    this.setupPOSActions();
    this.setupWalkInDispatcher();
    this.setupClinicConfig();
    this.setupSignOut();
  }

  renderUserInfo(user, role) {
    const nameEl = document.getElementById("adminStaffName");
    const roleBadge = document.getElementById("adminRoleBadge");
    const ownerLink = document.getElementById("adminOwnerPanelLink");

    if (nameEl) nameEl.textContent = user.name;
    if (roleBadge) roleBadge.textContent = `🏥 ${user.title || "Front Desk Receptionist"} (${user.branchName || "Orchard SG"})`;

    // Strict security: Only OWNER role can see and access Owner HQ panel
    if (ownerLink) {
      ownerLink.style.display = role === USER_ROLES.OWNER ? "inline-flex" : "none";
    }
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

        alert(`🔊 Calling Queue Number ${queueNo}: [${patientName}] to Consultation Room.`);
      });
    });
  }

  setupWalkInDispatcher() {
    if (this.walkInBtn) {
      this.walkInBtn.addEventListener("click", () => {
        soundService.playClickTone();
        const patientName = prompt("Walk-In Patient Registration.\nEnter Patient Full Name:", "David Lee");
        if (!patientName) return;

        const service = prompt("Select Service (1: Physiotherapy, 2: TCM Acupuncture, 3: Wellness Spa):", "1");
        const serviceName = service === "2" ? "TCM Acupuncture" : service === "3" ? "Wellness Spa Therapy" : "Physiotherapy & Spine";

        soundService.playQueueChime();
        alert(`✓ Walk-in patient [${patientName}] registered successfully for [${serviceName}]!\nQueue Ticket: D-04 issued.`);
      });
    }
  }

  setupPOSActions() {
    window.openPOSModal = (queueNo) => {
      soundService.playClickTone();
      const amount = prompt(`POS Cashier Settlement for Queue #${queueNo}.\nEnter Payment Amount (SGD/MYR):`, "90.00");
      if (amount) {
        soundService.playQueueChime();
        alert(`✓ Settlement recorded: ${amount} received via POS Cashier for Queue #${queueNo}. Receipt issued.`);
      }
    };

    window.openSIMRSInspection = (code) => {
      soundService.playClickTone();
      alert(`[SIMRS Bridge Payload: ${code}]\nStatus: FORWARDED\nProtocol: HL7 / FHIR Ephemeral\nTTL: 72 Hours retention policy active.`);
    };
  }

  setupClinicConfig() {
    const configForm = document.getElementById("clinicConfigForm");
    if (configForm) {
      configForm.addEventListener("submit", (e) => {
        e.preventDefault();
        soundService.playClickTone();
        const clinicName = document.getElementById("cfgClinicName").value;
        const template = document.getElementById("cfgTemplateSelect").value;
        storageService.set("cliniva_active_template", template);
        storageService.set("cliniva_clinic_name", clinicName);
        alert(`✓ Clinic configuration saved successfully!\nActive Template: ${template}\nBrand Name: ${clinicName}`);
      });
    }
  }

  setupSignOut() {
    if (this.signOutBtn) {
      this.signOutBtn.addEventListener("click", () => {
        authService.signOut();
        window.location.href = "sign-in.html";
      });
    }
  }
}

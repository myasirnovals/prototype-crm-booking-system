/**
 * Cliniva — Receptionist Controller
 * SOLID: Single Responsibility for Front Desk Operations, Dynamic Live Queue Calling, Cashier POS & Template Configuration
 */

import { authService, USER_ROLES } from "../services/auth.service.js";
import { soundService } from "../services/sound.service.js";
import { i18nService } from "../services/i18n.service.js";
import { storageService } from "../services/storage.service.js";
import { bookingService } from "../services/booking.service.js";

export class ReceptionistController {
  constructor() {
    this.tabButtons = document.querySelectorAll(".admin-tab-btn");
    this.tabPanes = document.querySelectorAll(".admin-tab-pane");
    this.signOutBtn = document.getElementById("adminSignOutBtn");
    this.walkInBtn = document.getElementById("adminWalkInBtn");
    this.queueGrid = document.getElementById("receptionistLiveQueueGrid");
  }

  init() {
    // Session Guard: Verify user has RECEPTIONIST or OWNER role
    const session = authService.requireAuth([USER_ROLES.RECEPTIONIST, USER_ROLES.OWNER]);
    if (!session) return;

    this.renderUserInfo(session.user, session.role);
    this.setupAdminTabs();
    this.renderLiveQueue();
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

  /**
   * Render Live Queue dynamically from storage + default queue items
   */
  renderLiveQueue() {
    if (!this.queueGrid) return;

    const realBookings = bookingService.getAllBookings();
    const defaultCards = [
      {
        queue: "A-01",
        patient: "Rendra Pratama",
        service: "Clinical Acupuncture · Physician Huang Wei",
        statusBadge: "READY",
        badgeColor: "#0f766e",
        badgeBg: "#f0fdfa",
        template: "tcm"
      },
      {
        queue: "B-02",
        patient: "Amanda Tan",
        service: "Physiotherapy & Spine · Dr. Lim",
        statusBadge: "WAITING",
        badgeColor: "#b45309",
        badgeBg: "#fef3c7",
        template: "physio"
      },
      {
        queue: "C-03",
        patient: "Jason Lee",
        service: "Wellness Spa Aromatherapy · Therapist Sarah",
        statusBadge: "CHECKED-IN",
        badgeColor: "#0369a1",
        badgeBg: "#e0f2fe",
        template: "wellness"
      }
    ];

    // Format any new real bookings created online
    const onlineCardsHtml = realBookings.map((b, idx) => {
      const qCode = `Q-${String(idx + 1).padStart(2, "0")}`;
      const isWellness = b.templateType === "wellness";
      const borderAccent = isWellness ? "#b45309" : "#0f766e";
      const badgeText = isWellness ? "🌸 SPA ONLINE" : "🌿 TCM ONLINE";

      return `
        <div class="queue-card" style="border-left:4px solid ${borderAccent};">
          <div style="display:flex; justify-content:space-between; align-items:flex-start;">
            <span class="queue-number" style="color:${borderAccent};">${qCode}</span>
            <span class="badge-live" style="background:${isWellness ? '#fef3c7' : '#f0fdfa'}; color:${borderAccent}; font-weight:800;">${badgeText}</span>
          </div>
          <h4 style="margin:8px 0 4px;">${b.patientName}</h4>
          <p style="font-size:12px; color:var(--muted); margin-bottom:8px;">${b.serviceName} · ${b.practitionerName}</p>
          <div style="font-size:11px; color:#475569; margin-bottom:12px; background:#f8fafc; padding:4px 8px; border-radius:4px;">
            ${b.intakeData ? b.intakeData : b.schedule}
          </div>
          <button class="btn btn-sm btn-primary full btn-call-queue" data-queue="${qCode}" data-patient="${b.patientName}">
            🔊 Call Next Patient (Audio Chime)
          </button>
        </div>
      `;
    }).join("");

    const defaultCardsHtml = defaultCards.map((c) => `
      <div class="queue-card">
        <div style="display:flex; justify-content:space-between; align-items:flex-start;">
          <span class="queue-number">${c.queue}</span>
          <span class="badge-live" style="background:${c.badgeBg}; color:${c.badgeColor};">${c.statusBadge}</span>
        </div>
        <h4 style="margin:8px 0 4px;">${c.patient}</h4>
        <p style="font-size:12px; color:var(--muted); margin-bottom:14px;">${c.service}</p>
        <button class="btn btn-sm btn-primary full btn-call-queue" data-queue="${c.queue}" data-patient="${c.patient}">
          🔊 Call Next Patient (Audio Chime)
        </button>
      </div>
    `).join("");

    this.queueGrid.innerHTML = onlineCardsHtml + defaultCardsHtml;
    this.setupQueueCalling();
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

        alert(`🔊 Calling Queue Number ${queueNo}: [${patientName}] to Treatment Suite.`);
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
        const serviceName = service === "2" ? "TCM Electro-Acupuncture" : service === "3" ? "Balinese Aromatherapy Spa" : "Physiotherapy & Spine";

        // Save real walk-in booking
        const newBooking = bookingService.createBooking({
          patientName: patientName,
          patientPhone: "+65 8000 1234",
          serviceName: serviceName,
          practitionerName: "Fastest Available",
          schedule: "Today, Walk-in Immediate",
          depositPaid: "Cash At Counter",
          paymentStatus: "PAID AT COUNTER",
          intakeData: "Walk-in registration via front desk"
        });

        soundService.playQueueChime();
        this.renderLiveQueue();
        alert(`✓ Walk-in patient [${patientName}] registered successfully for [${serviceName}]!\nQueue Ticket: ${newBooking.code} issued.`);
      });
    }
  }

  setupPOSActions() {
    window.openPOSModal = (queueNo) => {
      soundService.playClickTone();
      const amount = prompt(`[POS Cashier: Queue ${queueNo}]\nEnter final payment amount to settle:`, "SGD 90.00");
      if (amount) {
        soundService.playQueueChime();
        alert(`✓ Payment of ${amount} received for Queue ${queueNo}!\nReceipt sent via WhatsApp to patient.`);
      }
    };

    window.triggerSIMRSBridge = (code) => {
      soundService.playClickTone();
      alert(`[SIMRS Bridge Payload: ${code}]\nStatus: FORWARDED\nProtocol: HL7 / FHIR Ephemeral\nTTL: 72 Hours retention policy active.`);
    };
  }

  setupClinicConfig() {
    const configForm = document.getElementById("clinicConfigForm");
    const tplSelect = document.getElementById("cfgTemplateSelect");

    // Pre-populate with currently active template
    if (tplSelect) {
      const activeTpl = bookingService.getActiveTemplateId();
      tplSelect.value = activeTpl ? activeTpl.toUpperCase() : "TCM";
    }

    if (configForm) {
      configForm.addEventListener("submit", (e) => {
        e.preventDefault();
        soundService.playClickTone();
        const clinicName = document.getElementById("cfgClinicName").value;
        const template = document.getElementById("cfgTemplateSelect").value;

        bookingService.setActiveTemplate(template.toLowerCase());
        storageService.set("cliniva_active_template", template.toLowerCase());
        storageService.set("cliniva_clinic_name", clinicName);

        this.renderLiveQueue();
        alert(`✓ Clinic configuration saved successfully!\nActive Business Template: ${template}\nClinic Name: ${clinicName}`);
      });
    }
  }

  setupSignOut() {
    if (this.signOutBtn) {
      this.signOutBtn.addEventListener("click", () => {
        soundService.playClickTone();
        authService.logout();
      });
    }
  }
}

// Backward compatibility alias
export const AdminController = ReceptionistController;

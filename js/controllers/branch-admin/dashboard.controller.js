/**
 * Cliniva — Branch Admin Controller
 * SOLID: Single Responsibility for Branch Operations: Front Desk, Live Queue Calling,
 * Practitioner/Doctor Management, Room Schedule, and POS Cashier Settlement.
 */

import { authService, USER_ROLES } from "../../services/auth.service.js";
import { soundService } from "../../services/sound.service.js";
import { storageService } from "../../services/storage.service.js";
import { bookingService } from "../../services/booking.service.js";
import { notificationService } from "../../services/notification.service.js";
import { supabaseService } from "../../services/supabase.service.js";
import { i18nService } from "../../services/i18n.service.js";

export class BranchAdminController {
  constructor() {
    this.currentUser = null;
    this.branchId = null;
    this.tabButtons = [];
    this.tabPanes = [];
    this.queueGrid = null;
    this.queueTableBody = null;
    this.queueUnsubscribe = null;
    this.queueItems = [];
  }

  init() {
    // Session Guard: Allow BRANCH_ADMIN, OWNER, and legacy aliases
    let session = authService.getCurrentSession();

    // Prototype Direct Access Handling:
    // If opened directly in browser without prior login, auto-provision default demo session
    // for Siti Rahmah (Branch Admin) so all interactive controls work immediately without crashing.
    if (!session || !session.user) {
      session = {
        role: USER_ROLES.BRANCH_ADMIN,
        user: {
          id: "usr-branchadmin-01",
          name: "Siti Rahmah",
          email: "reception@orchardclinic.sg",
          phone: "+65 9222 3333",
          role: USER_ROLES.BRANCH_ADMIN,
          title: "Lead Branch Admin & Front Desk",
          branchId: "sg-orchard",
          branchName: "Orchard Wellness Clinic (SG)",
          region: "sg",
          avatar: "🏪",
          onboardingCompleted: true
        }
      };
      storageService.set(authService.SESSION_KEY, session);
    } else {
      // Validate role if an existing session is present
      const allowedRoles = [
        USER_ROLES.BRANCH_ADMIN,
        USER_ROLES.STAFF,
        USER_ROLES.OWNER,
        "BRANCH_MANAGER",
        "RECEPTIONIST"
      ];
      if (!allowedRoles.includes(session.role)) {
        console.warn(`[BranchAdmin] Role ${session.role} not authorized for Branch Admin console. Redirecting...`);
        authService.requireAuth(allowedRoles, "../../pages/public/sign-in.html");
        return;
      }
    }

    this.currentUser = session.user;
    this.branchId = session.user.branchId || "sg-orchard";

    // Expose instance globally for inline onclick handlers
    window.branchAdminInstance = this;

    this.tabButtons = document.querySelectorAll(".admin-tab-btn");
    this.tabPanes = document.querySelectorAll(".admin-tab-pane");
    this.queueGrid = document.getElementById("receptionistLiveQueueGrid");
    this.queueTableBody = document.getElementById("todayQueueTableBody");

    this.renderUserInfo(session.user, session.role);
    this.setupTabs();
    this.setupChimeSound();
    this.renderLiveQueue();
    this.setupRealtimeQueue();
    this.setupWalkInDispatcher();
    this.renderBranchPractitioners();
    this.setupPractitionerModal();
    this.renderBranchStock();
    this.setupBranchConfig();
    this.setupSignOut();
  }

  // ─────────────────────────────────────────────────────────────────────────
  // USER & BRANCH INFO
  // ─────────────────────────────────────────────────────────────────────────

  renderUserInfo(user, role) {
    const nameEl = document.getElementById("adminStaffName");
    const titleEl = document.getElementById("adminStaffTitle");
    const branchBadge = document.getElementById("branchNameHeader");
    const ownerLink = document.getElementById("adminOwnerPanelLink");

    if (nameEl) nameEl.textContent = user.name || "Siti Rahmah";
    if (titleEl) titleEl.textContent = user.title || "Lead Branch Admin & Front Desk";
    if (branchBadge) branchBadge.textContent = user.branchName || "Orchard Wellness Clinic (SG)";

    // Owner link only visible if current session is OWNER
    if (ownerLink) {
      ownerLink.style.display = role === USER_ROLES.OWNER ? "inline-flex" : "none";
    }

    // Role-based restrictions: Staff role is strictly locked to front desk & operational tabs
    if (role === USER_ROLES.STAFF) {
      const settingsTabBtn = document.querySelector('.admin-tab-btn[data-pane="paneClinicSettings"]');
      if (settingsTabBtn) {
        settingsTabBtn.style.display = "none";
      }
      const editProfileBtn = document.getElementById("editProfileBtn");
      if (editProfileBtn) {
        editProfileBtn.style.display = "none";
      }
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // TABS NAVIGATION
  // ─────────────────────────────────────────────────────────────────────────

  setupTabs() {
    this.tabButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const target = btn.dataset.pane;
        soundService.playClickTone?.();

        this.tabButtons.forEach((b) => {
          if (b.dataset.pane === target) {
            b.classList.add("active");
          } else {
            b.classList.remove("active");
          }
        });

        this.tabPanes.forEach((pane) => {
          pane.style.display = pane.id === target ? "block" : "none";
        });
        const paneId = btn.dataset.pane;
        this.tabButtons.forEach((b) => b.classList.remove("active"));
        this.tabPanes.forEach((p) => (p.style.display = "none"));

        btn.classList.add("active");
        const targetPane = document.getElementById(paneId);
        if (targetPane) targetPane.style.display = "block";

        // Sync mobile bottom navigation bar active button
        const mobBtns = document.querySelectorAll(".ba-mob-btn");
        mobBtns.forEach((mb) => {
          if (mb.dataset.pane === paneId) mb.classList.add("active");
          else mb.classList.remove("active");
        });
      });
    });

    // Mobile Navigation Button Handler
    const mobBtns = document.querySelectorAll(".ba-mob-btn");
    mobBtns.forEach((mb) => {
      mb.addEventListener("click", () => {
        const paneId = mb.dataset.pane;
        const matchingDesktopBtn = Array.from(this.tabButtons).find(b => b.dataset.pane === paneId);
        if (matchingDesktopBtn) matchingDesktopBtn.click();
      });
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // CHIME AUDIO SYNTHESIZER
  // ─────────────────────────────────────────────────────────────────────────

  setupChimeSound() {
    const btn = document.getElementById("btnTestChime");
    if (btn) {
      btn.addEventListener("click", () => {
        soundService.playQueueChime();
      });
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // LIVE QUEUE OPERATIONS
  // ─────────────────────────────────────────────────────────────────────────

  getDefaultTodayQueue() {
    return [
      {
        id: "q-01",
        queue: "A-01",
        patient: "Amanda Tan",
        regNo: "REG-2026-0901",
        service: "Physiotherapy & Spine Rehab · Dr. Lim Wei Han",
        doctor: "Dr. Lim Wei Han",
        time: "10:30",
        room: "Room A2",
        statusBadge: "WAITING",
        badgeColor: "#0f766e",
        badgeBg: "#f0fdfa"
      },
      {
        id: "q-02",
        queue: "B-02",
        patient: "Jason Lee",
        regNo: "REG-2026-0902",
        service: "Aromatherapy Body Therapy · Sarah Tan",
        doctor: "Therapist Sarah Tan",
        time: "11:00",
        room: "VIP Suite 2",
        statusBadge: "READY",
        badgeColor: "#d97706",
        badgeBg: "#fffbeb"
      },
      {
        id: "q-03",
        queue: "C-03",
        patient: "Nur Aisyah",
        regNo: "REG-2026-0903",
        service: "TCM Herbal & Acupuncture · Dr. Wong",
        doctor: "Physician Wong",
        time: "11:30",
        room: "Suite 1",
        statusBadge: "CHECKED-IN",
        badgeColor: "#0369a1",
        badgeBg: "#e0f2fe"
      },
      {
        id: "q-04",
        queue: "A-04",
        patient: "Siti Rahmawati",
        regNo: "REG-2026-0904",
        service: "General Consultation · Dr. Kevin Wijaya",
        doctor: "Dr. Kevin Wijaya",
        time: "10:15",
        room: "Room 1",
        statusBadge: "WAITING",
        badgeColor: "#b45309",
        badgeBg: "#fef3c7"
      },
      {
        id: "q-05",
        queue: "B-05",
        patient: "Dewi Lestari",
        regNo: "REG-2026-0905",
        service: "Physiotherapy Rehab · Dr. Lim",
        doctor: "Dr. Lim Wei Han",
        time: "10:45",
        room: "Bed A2",
        statusBadge: "IN_CONSULT",
        badgeColor: "#7c3aed",
        badgeBg: "#f5f3ff"
      }
    ];
  }

  async renderLiveQueue() {
    const queueStorageKey = `cliniva_queue_${this.branchId}`;
    let items = storageService.get(queueStorageKey, null);

    // If Supabase is available, sync live queue from Cloud (SSOT)
    if (supabaseService.isAvailable()) {
      try {
        const cloudQueue = await supabaseService.fetchLiveQueue(this.branchId);
        if (cloudQueue && Array.isArray(cloudQueue) && cloudQueue.length > 0) {
          items = cloudQueue;
        }
      } catch (err) {
        console.warn("[BranchAdmin] Failed to fetch cloud queue, using local:", err);
      }
    }

    if (!items || items.length === 0) {
      items = this.getDefaultTodayQueue();
      storageService.set(queueStorageKey, items);
    }

    this.queueItems = items;

    // Update metric counters
    const waitingEl = document.getElementById("statWaitingCount");
    const inConsultEl = document.getElementById("statInConsultCount");
    const totalTodayEl = document.getElementById("statPatientsToday");

    if (waitingEl) waitingEl.textContent = items.filter(q => q.statusBadge === "WAITING" || q.statusBadge === "READY").length;
    if (inConsultEl) inConsultEl.textContent = items.filter(q => q.statusBadge === "CHECKED-IN" || q.statusBadge === "IN_CONSULT").length;
    if (totalTodayEl) totalTodayEl.textContent = items.length + 37;

    const labelCall = i18nService.t("branchAdmin.btnCallPatient", "🔊 Call Patient (Chime)");
    const labelStart = i18nService.t("branchAdmin.btnStartConsult", "🩺 Start Consultation");
    const labelComplete = i18nService.t("branchAdmin.btnCompleteQueue", "✅ Complete & Approve");
    const labelFinished = i18nService.t("branchAdmin.btnFinishedQueue", "✓ Appointment Completed");

    // 1. Render Cards Grid
    if (this.queueGrid) {
      this.queueGrid.innerHTML = "";
      items.forEach((item) => {
        const card = document.createElement("div");
        card.className = "queue-card";
        
        let actionBtnHtml = "";
        if (item.statusBadge === "WAITING") {
          actionBtnHtml = `<button type="button" class="btn btn-sm btn-primary full btn-action-step" data-action="call">${labelCall}</button>`;
        } else if (item.statusBadge === "READY") {
          actionBtnHtml = `<button type="button" class="btn btn-sm btn-secondary full btn-action-step" data-action="start" style="background:#7c3aed; color:#fff;">${labelStart}</button>`;
        } else if (item.statusBadge === "IN_CONSULT") {
          actionBtnHtml = `<button type="button" class="btn btn-sm btn-success full btn-action-step" data-action="complete" style="background:#16a34a; color:#fff;">${labelComplete}</button>`;
        } else {
          actionBtnHtml = `<button type="button" class="btn btn-sm btn-soft full" disabled style="opacity:0.75; font-weight:700;">${labelFinished}</button>`;
        }

        card.innerHTML = `
          <div style="display:flex; justify-content:space-between; align-items:flex-start;">
            <span class="queue-number">${item.queue}</span>
            <span class="badge-live" style="background:${item.badgeBg || '#f0fdfa'}; color:${item.badgeColor || '#0f766e'};">${item.statusBadge}</span>
          </div>
          <h4 style="margin:8px 0 4px;">${item.patient}</h4>
          <p style="font-size:12px; color:var(--muted); margin-bottom:14px;">${item.service}</p>
          ${actionBtnHtml}
        `;

        card.querySelector(".btn-action-step")?.addEventListener("click", (e) => {
          const action = e.currentTarget.dataset.action;
          if (action === "call") this.callPatient(item);
          else if (action === "start") this.updateQueueItemStatus(item, "IN_CONSULT");
          else if (action === "complete") this.updateQueueItemStatus(item, "COMPLETED");
        });

        this.queueGrid.appendChild(card);
      });
    }

    // 2. Render Today's Active Queue Table
    if (this.queueTableBody) {
      this.queueTableBody.innerHTML = "";
      const tabCall = i18nService.t("branchAdmin.tabActionCall", "🔊 Call");
      const tabStart = i18nService.t("branchAdmin.tabActionStart", "🩺 Start");
      const tabComplete = i18nService.t("branchAdmin.tabActionComplete", "✅ Complete");
      const tabFinished = i18nService.t("branchAdmin.tabActionFinished", "✓ Finished");

      items.forEach((item) => {
        const tr = document.createElement("tr");
        const serviceName = item.service ? item.service.split("·")[0].trim() : "Consultation";
        const doctorName = item.doctor || (item.service && item.service.includes("·") ? item.service.split("·")[1].trim() : "Specialist on Duty");

        let tableActionHtml = "";
        if (item.statusBadge === "WAITING") {
          tableActionHtml = `<button type="button" class="btn btn-sm btn-primary btn-tab-action" data-action="call" style="padding:4px 8px; font-size:11px;">${tabCall}</button>`;
        } else if (item.statusBadge === "READY") {
          tableActionHtml = `<button type="button" class="btn btn-sm btn-tab-action" data-action="start" style="padding:4px 8px; font-size:11px; background:#7c3aed; color:#fff;">${tabStart}</button>`;
        } else if (item.statusBadge === "IN_CONSULT") {
          tableActionHtml = `<button type="button" class="btn btn-sm btn-tab-action" data-action="complete" style="padding:4px 8px; font-size:11px; background:#16a34a; color:#fff;">${tabComplete}</button>`;
        } else {
          tableActionHtml = `<span style="font-size:11px; color:#16a34a; font-weight:800;">${tabFinished}</span>`;
        }

        tr.innerHTML = `
          <td><strong style="font-size:14px; color:${item.badgeColor || 'var(--primary)'};">${item.queue}</strong></td>
          <td>
            <div style="font-weight:700;">${item.patient}</div>
            <small style="color:var(--muted); font-size:11px;">${item.regNo || '#' + item.queue}</small>
          </td>
          <td>
            <div style="font-weight:600;">${serviceName}</div>
            <small style="color:var(--muted); font-size:11px;">${doctorName}</small>
          </td>
          <td><span style="font-weight:700; font-size:12px;">${item.time || '09:00'}</span></td>
          <td><span style="font-size:12px;">${item.room || 'Room A1'}</span></td>
          <td>
            <span class="status-pill" style="background:${item.badgeBg || '#f1f5f9'}; color:${item.badgeColor || '#0f766e'}; font-size:11px; padding:3px 8px; border:1px solid ${item.badgeColor || '#cbd5e1'}40;">
              ● ${item.statusBadge}
            </span>
          </td>
          <td style="text-align:center;">
            ${tableActionHtml}
          </td>
        `;

        tr.querySelector(".btn-tab-action")?.addEventListener("click", (e) => {
          const action = e.currentTarget.dataset.action;
          if (action === "call") this.callPatient(item);
          else if (action === "start") this.updateQueueItemStatus(item, "IN_CONSULT");
          else if (action === "complete") this.updateQueueItemStatus(item, "COMPLETED");
        });

        this.queueTableBody.appendChild(tr);
      });
    }
  }

  async updateQueueItemStatus(item, newStatus) {
    const queueStorageKey = `cliniva_queue_${this.branchId}`;
    let items = storageService.get(queueStorageKey, null) || this.queueItems || [];

    const target = items.find(q => q.id === item.id || q.queue === item.queue);
    if (target) {
      target.statusBadge = newStatus;
      if (newStatus === "READY") {
        target.badgeColor = "#0f766e";
        target.badgeBg = "#f0fdfa";
      } else if (newStatus === "IN_CONSULT") {
        target.badgeColor = "#7c3aed";
        target.badgeBg = "#f5f3ff";
      } else if (newStatus === "COMPLETED") {
        target.badgeColor = "#16a34a";
        target.badgeBg = "#f0fdf4";
      }
    }

    storageService.set(queueStorageKey, items);
    this.queueItems = items;

    if (supabaseService.isAvailable() && item.id) {
      try {
        await supabaseService.updateQueueStatus(item.id, newStatus, {
          statusBadge: newStatus,
          badgeColor: target?.badgeColor,
          badgeBg: target?.badgeBg
        });
      } catch (err) {
        console.warn("[BranchAdmin] Failed to update cloud status:", err);
      }
    }

    if (newStatus === "COMPLETED") {
      const msg = i18nService.t("branchAdmin.alertCompleted", "✅ Appointment [{queue}] {patient} approved & completed on-site.")
        .replace("{queue}", item.queue).replace("{patient}", item.patient);
      alert(msg);
    } else if (newStatus === "IN_CONSULT") {
      const msg = i18nService.t("branchAdmin.alertInConsult", "🩺 Patient [{queue}] {patient} entered {room} for consultation.")
        .replace("{queue}", item.queue).replace("{patient}", item.patient).replace("{room}", item.room || "Room");
      alert(msg);
    }

    this.renderLiveQueue();
  }

  async callPatient(item) {
    soundService.playQueueChime();
    await this.updateQueueItemStatus(item, "READY");

    if (notificationService && typeof notificationService.addSystemNotification === "function") {
      notificationService.addSystemNotification({
        title: i18nService.t("branchAdmin.callPatientTitle", "Calling Patient") + ` ${item.queue}`,
        message: i18nService.t("branchAdmin.callPatientMsg", "[{queue}] {patient} — please proceed to {room}.")
          .replace("{queue}", item.queue).replace("{patient}", item.patient).replace("{room}", item.room || i18nService.t("branchAdmin.practiceRoom", "Practice Room")),
        category: "QUEUE",
        type: "info"
      });
    }
    alert(i18nService.t("branchAdmin.callPatientAlert", "🔊 Calling Queue [{queue}]: {patient} — please enter {room}.")
      .replace("{queue}", item.queue).replace("{patient}", item.patient).replace("{room}", item.room || i18nService.t("branchAdmin.practiceRoom", "Practice Room")));
  }

  /**
   * Subscribe to Supabase Realtime WebSocket for live queue updates across devices
   */
  async setupRealtimeQueue() {
    if (!supabaseService.isAvailable()) return;

    if (this.queueUnsubscribe) {
      this.queueUnsubscribe();
      this.queueUnsubscribe = null;
    }

    try {
      this.queueUnsubscribe = await supabaseService.subscribeToQueue(this.branchId, (payload) => {
        console.info("[BranchAdmin] Live queue update received via Supabase Realtime:", payload);
        this.renderLiveQueue();
        if (payload.eventType === "UPDATE" && payload.new?.status === "READY") {
          soundService.playQueueChime();
        }
      });
    } catch (err) {
      console.warn("[BranchAdmin] Realtime subscription error:", err);
    }
  }

  setupWalkInDispatcher() {
    const walkInBtn = document.getElementById("adminWalkInBtn");
    if (!walkInBtn) return;

    walkInBtn.addEventListener("click", async () => {
      const name = prompt(i18nService.t("branchAdmin.walkInNamePrompt", "Walk-In Patient Name:"), i18nService.t("branchAdmin.walkInNameDefault", "Walk-In Patient"));
      if (!name) return;

      const service = prompt(i18nService.t("branchAdmin.walkInServicePrompt", "Service Required:"), i18nService.t("branchAdmin.walkInServiceDefault", "General Consultation / Physiotherapy")) || i18nService.t("branchAdmin.walkInServiceDefault", "General Consultation");

      const queueStorageKey = `cliniva_queue_${this.branchId}`;
      const queueItems = storageService.get(queueStorageKey, []) || [];
      const newQueueNumber = `W-0${queueItems.length + 1}`;

      const walkInItem = {
        id: `q-walkin-${Date.now()}`,
        queue: newQueueNumber,
        patient: name,
        regNo: `WALKIN-${Date.now().toString().slice(-4)}`,
        service: service,
        doctor: i18nService.t("branchAdmin.walkInDoctor", "Duty Doctor (Walk-In)"),
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        room: i18nService.t("branchAdmin.frontDeskRoom", "Front Desk"),
        statusBadge: "READY",
        badgeColor: "#0f766e",
        badgeBg: "#f0fdfa"
      };

      queueItems.unshift(walkInItem);
      storageService.set(queueStorageKey, queueItems);

      // Push to Supabase Cloud if available
      if (supabaseService.isAvailable()) {
        try {
          await supabaseService.addWalkInQueue({
            queueNumber: newQueueNumber,
            branchId: this.branchId,
            patientName: name,
            serviceName: service
          });
        } catch (err) {
          console.warn("[BranchAdmin] Cloud walk-in push failed:", err);
        }
      }

      this.renderLiveQueue();
      soundService.playSuccessChime?.();
      if (notificationService && typeof notificationService.addSystemNotification === "function") {
        notificationService.addSystemNotification({
          title: i18nService.t("branchAdmin.walkInRegistered", "Walk-In Patient Registered"),
          message: i18nService.t("branchAdmin.walkInRegisteredMsg", "{name} ({queue}) successfully registered for {service}.")
            .replace("{name}", name).replace("{queue}", newQueueNumber).replace("{service}", service),
          category: "QUEUE",
          type: "info"
        });
      }
      alert(i18nService.t("branchAdmin.walkInSuccess", "✓ Walk-in patient registered. Queue Number: {queue}").replace("{queue}", newQueueNumber));
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // PRACTITIONERS / DOCTORS MANAGEMENT (Branch Scope)
  // ─────────────────────────────────────────────────────────────────────────

  renderBranchPractitioners() {
    const tbody = document.getElementById("branchPractitionersTableBody");
    const activeDocsCountEl = document.getElementById("statActiveDocs");
    if (!tbody) return;

    const users = authService.getUsers();
    // Filter practitioners in this branch
    let practitioners = users.filter(
      (u) => u.role === USER_ROLES.PRACTITIONER && (u.branchId === this.branchId || !u.branchId)
    );

    // Fallback default doctors if empty
    if (practitioners.length === 0) {
      practitioners = [
        {
          name: "Dr. Lim Wei Han",
          specialty: "Sports Rehabilitation & Spine",
          room: "Ruang A2 (Physio Suite)",
          email: "dr.lim@orchardclinic.sg",
          status: "BERTUGAS"
        },
        {
          name: "Physician Huang Wei",
          specialty: "TCM & Clinical Acupuncture",
          room: "Ruang TCM 1",
          email: "dr.huang@orchardclinic.sg",
          status: "BERTUGAS"
        },
        {
          name: "Therapist Sarah Chen",
          specialty: "Wellness Aromatherapy & Rehab",
          room: "Suite Bed 3",
          email: "sarah.chen@orchardclinic.sg",
          status: "OFF"
        }
      ];
    }

    if (activeDocsCountEl) {
      const activeCount = practitioners.filter(p => p.status !== "OFF").length;
      activeDocsCountEl.textContent = `${activeCount}`;
    }

    tbody.innerHTML = "";
    practitioners.forEach((doc) => {
      const isOff = doc.status === "OFF";
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>
          <div style="font-weight:700; color:var(--text);">${doc.name}</div>
          <small style="color:var(--muted);">${doc.title || i18nService.t("branchAdmin.clinicPractitioner", "Clinic Practitioner")}</small>
        </td>
        <td><span class="pill" style="font-size:11px;">${doc.specialty || "General Specialist"}</span></td>
        <td>${doc.room || i18nService.t("branchAdmin.consultationRoom", "Consultation Room")}</td>
        <td style="font-family:monospace; font-size:12px;">${doc.email}</td>
        <td>
          <span class="status-pill ${isOff ? "cancelled" : "confirmed"}">
            ${isOff ? "● " + i18nService.t("branchAdmin.statusOff", "OFF") : "● " + i18nService.t("branchAdmin.statusOnDuty", "ON DUTY")}
          </span>
        </td>
        <td>
          <button type="button" class="btn btn-sm btn-soft btn-toggle-doc-status">
            ${isOff ? i18nService.t("branchAdmin.activateShift", "Activate Shift") : i18nService.t("branchAdmin.markBreak", "Mark as Break")}
          </button>
        </td>
      `;

      tr.querySelector(".btn-toggle-doc-status")?.addEventListener("click", () => {
        doc.status = isOff ? "ON_DUTY" : "OFF";
        soundService.playClickTone?.();
        this.renderBranchPractitioners();
      });

      tbody.appendChild(tr);
    });
  }

  setupPractitionerModal() {
    const modal = document.getElementById("addPractitionerModal");
    const openBtn = document.getElementById("btnOpenAddPractitionerModal");
    const closeBtn = document.getElementById("btnClosePractitionerModal");
    const cancelBtn = document.getElementById("btnCancelAddPractitioner");
    const form = document.getElementById("addPractitionerForm");

    if (!modal) return;

    const closeModal = () => modal.classList.remove("active");
    const openModal = () => {
      form?.reset();
      modal.classList.add("active");
    };

    openBtn?.addEventListener("click", openModal);
    closeBtn?.addEventListener("click", closeModal);
    cancelBtn?.addEventListener("click", closeModal);

    form?.addEventListener("submit", (e) => {
      e.preventDefault();

      const name = document.getElementById("pracName")?.value.trim();
      const specialty = document.getElementById("pracSpecialty")?.value.trim();
      const room = document.getElementById("pracRoom")?.value.trim();
      const email = document.getElementById("pracEmail")?.value.trim();
      const phone = document.getElementById("pracPhone")?.value.trim();

      if (!name || !email) {
        alert(i18nService.t("branchAdmin.practitionerNameEmailRequired", "Practitioner name and email are required."));
        return;
      }

      // Add user via authService
      const newDoc = {
        name,
        specialty,
        room: room || i18nService.t("branchAdmin.consultationRoom", "Consultation Room"),
        email,
        phone,
        password: "cliniva2026",
        role: USER_ROLES.PRACTITIONER,
        branchId: this.branchId,
        branchName: this.currentUser?.branchName || "Orchard Wellness Clinic",
        title: i18nService.t("branchAdmin.practitionerTitle", "Branch Doctor / Practitioner"),
        status: "ON_DUTY",
        onboardingCompleted: true
      };

      if (typeof authService.createUserAccount === "function") {
        authService.createUserAccount(newDoc);
      } else if (typeof authService.createUser === "function") {
        authService.createUser(newDoc);
      }
      soundService.playSuccessChime?.();
      closeModal();
      this.renderBranchPractitioners();
      alert(i18nService.t("branchAdmin.practitionerAdded", "✓ {name} has been successfully added as a practitioner at this branch.").replace("{name}", name));
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // BRANCH INVENTORY / STOCK
  // ─────────────────────────────────────────────────────────────────────────

  renderBranchStock() {
    const tbody = document.getElementById("branchStockTableBody");
    if (!tbody) return;

    const stockItems = [
      { name: "Sterile Acupuncture Needles (Box 100 pcs)", cat: "TCM Consumables", qty: 48, min: 20, status: i18nService.t("branchAdmin.stockSafe", "SAFE") },
      { name: "Lavender Herbal Aromatherapy Oil (500ml)", cat: "Wellness / Spa", qty: 8, min: 10, status: i18nService.t("branchAdmin.stockLow", "LOW STOCK") },
      { name: "Medical Grade Kinesio Tape (Roll)", cat: "Physiotherapy", qty: 32, min: 15, status: i18nService.t("branchAdmin.stockSafe", "SAFE") },
      { name: "Traditional Herbal Foot Soak Sachet", cat: "TCM Therapy", qty: 120, min: 30, status: i18nService.t("branchAdmin.stockSafe", "SAFE") },
      { name: "Disposable Therapy Bed Paper Roll", cat: "Clinic Supplies", qty: 6, min: 5, status: i18nService.t("branchAdmin.stockRestock", "RESTOCK NEEDED") }
    ];

    tbody.innerHTML = "";
    stockItems.forEach((item) => {
      const isLow = item.qty <= item.min;
      const textColor = isLow ? "#ef4444" : "var(--text)";
      const statusClass = isLow ? "cancelled" : "confirmed";
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td style="font-weight:700;">${item.name}</td>
        <td><span class="pill" style="font-size:11px;">${item.cat}</span></td>
        <td><strong style="color:${textColor}; font-size:14px;">${item.qty} unit</strong></td>
        <td style="color:var(--muted);">${item.min} unit</td>
        <td>
          <span class="status-pill ${statusClass}">
            ${item.status}
          </span>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }


  // ─────────────────────────────────────────────────────────────────────────
  // BRANCH CONFIGURATION
  // ─────────────────────────────────────────────────────────────────────────

  setupBranchConfig() {
    const form = document.getElementById("branchConfigForm");
    if (!form) return;

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const branchName = document.getElementById("cfgBranchName")?.value.trim();
      const branchPhone = document.getElementById("cfgBranchPhone")?.value.trim();
      const branchAddress = document.getElementById("cfgBranchAddress")?.value.trim();

      const branchBadge = document.getElementById("branchNameHeader");
      if (branchBadge && branchName) {
        branchBadge.textContent = branchName;
      }

      soundService.playClickTone?.();
      alert(i18nService.t("branchAdmin.branchConfigSaved", "✓ Branch information saved:\n{name}\n{phone}\n{address}")
        .replace("{name}", branchName).replace("{phone}", branchPhone).replace("{address}", branchAddress));
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // SIGN OUT
  // ─────────────────────────────────────────────────────────────────────────

  setupSignOut() {
    const signOutBtn = document.getElementById("adminSignOutBtn");
    if (!signOutBtn) return;

    signOutBtn.addEventListener("click", () => {
      soundService.playClickTone?.();
      authService.signOut();
      window.location.href = "../../pages/public/sign-in.html";
    });
  }
}

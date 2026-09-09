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
      });
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // AUDIO CHIME
  // ─────────────────────────────────────────────────────────────────────────

  setupChimeSound() {
    const testBtn = document.getElementById("btnTestChime");
    if (testBtn) {
      testBtn.addEventListener("click", () => {
        soundService.playQueueChime();
      });
    }

    const refreshBtn = document.getElementById("btnRefreshQueue");
    if (refreshBtn) {
      refreshBtn.addEventListener("click", () => {
        this.renderLiveQueue();
        soundService.playClickTone?.();
      });
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // LIVE QUEUE
  // ─────────────────────────────────────────────────────────────────────────

  // ─────────────────────────────────────────────────────────────────────────
  // LIVE QUEUE (TODAY ACTIVE QUEUE)
  // ─────────────────────────────────────────────────────────────────────────

  getDefaultTodayQueue() {
    return [
      {
        id: "q-01",
        queue: "A-01",
        patient: "Rendra Pratama",
        regNo: "REG-2026-0901",
        service: "Clinical Acupuncture · Physician Huang Wei",
        doctor: "Physician Huang Wei",
        time: "09:00",
        room: "Ruang A1",
        statusBadge: "READY",
        badgeColor: "#0f766e",
        badgeBg: "#f0fdfa"
      },
      {
        id: "q-02",
        queue: "B-02",
        patient: "Amanda Tan",
        regNo: "REG-2026-0902",
        service: "Physiotherapy & Spine · Dr. Lim",
        doctor: "Dr. Lim Wei Han",
        time: "09:30",
        room: "Ruang Bed A2",
        statusBadge: "WAITING",
        badgeColor: "#b45309",
        badgeBg: "#fef3c7"
      },
      {
        id: "q-03",
        queue: "C-03",
        patient: "Jason Lee",
        regNo: "REG-2026-0903",
        service: "Wellness Spa Aromatherapy · Therapist Sarah",
        doctor: "Therapist Sarah",
        time: "10:00",
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
        service: "Konsultasi Dokter Umum · Dr. Kevin Wijaya",
        doctor: "Dr. Kevin Wijaya",
        time: "10:15",
        room: "Ruang Konsul 1",
        statusBadge: "WAITING",
        badgeColor: "#b45309",
        badgeBg: "#fef3c7"
      },
      {
        id: "q-05",
        queue: "B-05",
        patient: "Dewi Lestari",
        regNo: "REG-2026-0905",
        service: "Fisioterapi & Rehabilitasi · Dr. Lim",
        doctor: "Dr. Lim Wei Han",
        time: "10:45",
        room: "Ruang Bed A2",
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

    // 1. Render Cards Grid
    if (this.queueGrid) {
      this.queueGrid.innerHTML = "";
      items.forEach((item) => {
        const card = document.createElement("div");
        card.className = "queue-card";
        
        let actionBtnHtml = "";
        if (item.statusBadge === "WAITING") {
          actionBtnHtml = `<button type="button" class="btn btn-sm btn-primary full btn-action-step" data-action="call">🔊 Panggil Pasien (Chime)</button>`;
        } else if (item.statusBadge === "READY") {
          actionBtnHtml = `<button type="button" class="btn btn-sm btn-secondary full btn-action-step" data-action="start" style="background:#7c3aed; color:#fff;">🩺 Mulai Konsultasi (Masuk)</button>`;
        } else if (item.statusBadge === "IN_CONSULT") {
          actionBtnHtml = `<button type="button" class="btn btn-sm btn-success full btn-action-step" data-action="complete" style="background:#16a34a; color:#fff;">✅ Selesaikan &amp; Approve</button>`;
        } else {
          actionBtnHtml = `<button type="button" class="btn btn-sm btn-soft full" disabled style="opacity:0.75; font-weight:700;">✓ Janji Temu Selesai</button>`;
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
      items.forEach((item) => {
        const tr = document.createElement("tr");
        const serviceName = item.service ? item.service.split("·")[0].trim() : "Konsultasi";
        const doctorName = item.doctor || (item.service && item.service.includes("·") ? item.service.split("·")[1].trim() : "Dokter Bertugas");

        let tableActionHtml = "";
        if (item.statusBadge === "WAITING") {
          tableActionHtml = `<button type="button" class="btn btn-sm btn-primary btn-tab-action" data-action="call" style="padding:4px 8px; font-size:11px;">🔊 Panggil</button>`;
        } else if (item.statusBadge === "READY") {
          tableActionHtml = `<button type="button" class="btn btn-sm btn-tab-action" data-action="start" style="padding:4px 8px; font-size:11px; background:#7c3aed; color:#fff;">🩺 Mulai</button>`;
        } else if (item.statusBadge === "IN_CONSULT") {
          tableActionHtml = `<button type="button" class="btn btn-sm btn-tab-action" data-action="complete" style="padding:4px 8px; font-size:11px; background:#16a34a; color:#fff;">✅ Selesai</button>`;
        } else {
          tableActionHtml = `<span style="font-size:11px; color:#16a34a; font-weight:800;">✓ Selesai</span>`;
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
          <td><span style="font-size:12px;">${item.room || 'Ruang Konsul'}</span></td>
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
      alert(`✅ Janji Temu [${item.queue}] ${item.patient} telah disetujui & diselesaikan di klinik.`);
    } else if (newStatus === "IN_CONSULT") {
      alert(`🩺 Pasien [${item.queue}] ${item.patient} telah masuk ke ${item.room || 'Ruang Praktik'} untuk sesi konsultasi.`);
    }

    this.renderLiveQueue();
  }

  async callPatient(item) {
    soundService.playQueueChime();
    await this.updateQueueItemStatus(item, "READY");

    if (notificationService && typeof notificationService.addSystemNotification === "function") {
      notificationService.addSystemNotification({
        title: `Panggilan Pasien ${item.queue}`,
        message: `[${item.queue}] ${item.patient} silakan menuju ke ${item.room || 'Ruang Praktik'}.`,
        category: "QUEUE",
        type: "info"
      });
    }
    alert(`🔊 Memanggil Nomor Antrean [${item.queue}]: ${item.patient} silakan masuk ke ${item.room || 'Ruang Praktik'}.`);
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
      const name = prompt("Nama Pasien Datang Langsung (Walk-In):", "Pasien Walk-In");
      if (!name) return;

      const service = prompt("Layanan yang Dibutuhkan:", "Konsultasi Fisioterapi / Akupunktur") || "Konsultasi Umum";

      const queueStorageKey = `cliniva_queue_${this.branchId}`;
      const queueItems = storageService.get(queueStorageKey, []) || [];
      const newQueueNumber = `W-0${queueItems.length + 1}`;

      const walkInItem = {
        id: `q-walkin-${Date.now()}`,
        queue: newQueueNumber,
        patient: name,
        regNo: `WALKIN-${Date.now().toString().slice(-4)}`,
        service: service,
        doctor: "Dokter Jaga (Walk-In)",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        room: "Ruang Meja Depan",
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
          title: "Pasien Walk-In Terdaftar",
          message: `${name} (${newQueueNumber}) berhasil didaftarkan untuk ${service}.`,
          category: "QUEUE",
          type: "info"
        });
      }
      alert(`✓ Pasien walk-in berhasil didaftarkan dengan Nomor Antrean: ${newQueueNumber}`);
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
          <small style="color:var(--muted);">${doc.title || "Praktisi Klinik"}</small>
        </td>
        <td><span class="pill" style="font-size:11px;">${doc.specialty || "General Specialist"}</span></td>
        <td>${doc.room || "Ruang Konsultasi"}</td>
        <td style="font-family:monospace; font-size:12px;">${doc.email}</td>
        <td>
          <span class="status-pill ${isOff ? "cancelled" : "confirmed"}">
            ${isOff ? "● OFF" : "● BERTUGAS"}
          </span>
        </td>
        <td>
          <button type="button" class="btn btn-sm btn-soft btn-toggle-doc-status">
            ${isOff ? "Aktifkan Shift" : "Tandai Istirahat"}
          </button>
        </td>
      `;

      tr.querySelector(".btn-toggle-doc-status")?.addEventListener("click", () => {
        doc.status = isOff ? "BERTUGAS" : "OFF";
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
        alert("Nama dan email dokter wajib diisi.");
        return;
      }

      // Add user via authService
      const newDoc = {
        name,
        specialty,
        room: room || "Ruang Konsultasi",
        email,
        phone,
        password: "cliniva2026",
        role: USER_ROLES.PRACTITIONER,
        branchId: this.branchId,
        branchName: this.currentUser?.branchName || "Orchard Wellness Clinic",
        title: "Dokter / Praktisi Cabang",
        status: "BERTUGAS",
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
      alert(`✓ Berhasil menambahkan ${name} sebagai praktisi di cabang ini!`);
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // BRANCH INVENTORY / STOCK
  // ─────────────────────────────────────────────────────────────────────────

  renderBranchStock() {
    const tbody = document.getElementById("branchStockTableBody");
    if (!tbody) return;

    const stockItems = [
      { name: "Jarum Akupunktur Steril (Box 100 pcs)", cat: "TCM Consumables", qty: 48, min: 20, status: "AMAN" },
      { name: "Minyak Aromaterapi Lavender Herbal (500ml)", cat: "Wellness / Spa", qty: 8, min: 10, status: "MENIPIS" },
      { name: "Kinesio Tape Medical Grade (Roll)", cat: "Physiotherapy", qty: 32, min: 15, status: "AMAN" },
      { name: "Sachet Herbal Rendam Kaki Tradisional", cat: "TCM Therapy", qty: 120, min: 30, status: "AMAN" },
      { name: "Kertas Bed Terapi Disposable (Roll)", cat: "Clinic Supplies", qty: 6, min: 5, status: "PERLU RESTOK" }
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
      alert(`✓ Informasi cabang berhasil disimpan:\n${branchName}\n${branchPhone}\n${branchAddress}`);
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

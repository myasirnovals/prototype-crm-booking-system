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

export class BranchAdminController {
  constructor() {
    this.currentUser = null;
    this.branchId = null;
    this.tabButtons = [];
    this.tabPanes = [];
    this.queueGrid = null;
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

    this.renderUserInfo(session.user, session.role);
    this.setupTabs();
    this.setupChimeSound();
    this.renderLiveQueue();
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

        this.tabButtons.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");

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

  renderLiveQueue() {
    if (!this.queueGrid) return;

    // Load branch queue items
    const queueStorageKey = `cliniva_queue_${this.branchId}`;
    let queueItems = storageService.get(queueStorageKey, null);

    if (!queueItems || queueItems.length === 0) {
      queueItems = [
        {
          queue: "A-01",
          patient: "Rendra Pratama",
          service: "Clinical Acupuncture · Physician Huang Wei",
          statusBadge: "READY",
          badgeColor: "#0f766e",
          badgeBg: "#f0fdfa"
        },
        {
          queue: "B-02",
          patient: "Amanda Tan",
          service: "Physiotherapy & Spine · Dr. Lim",
          statusBadge: "WAITING",
          badgeColor: "#b45309",
          badgeBg: "#fef3c7"
        },
        {
          queue: "C-03",
          patient: "Jason Lee",
          service: "Wellness Spa Aromatherapy · Therapist Sarah",
          statusBadge: "CHECKED-IN",
          badgeColor: "#0369a1",
          badgeBg: "#e0f2fe"
        }
      ];
      storageService.set(queueStorageKey, queueItems);
    }

    // Update metric counters
    const waitingEl = document.getElementById("statWaitingCount");
    const inConsultEl = document.getElementById("statInConsultCount");
    const totalTodayEl = document.getElementById("statPatientsToday");

    if (waitingEl) waitingEl.textContent = queueItems.filter(q => q.statusBadge === "WAITING" || q.statusBadge === "READY").length;
    if (inConsultEl) inConsultEl.textContent = queueItems.filter(q => q.statusBadge === "CHECKED-IN" || q.statusBadge === "IN_CONSULT").length + 2;
    if (totalTodayEl) totalTodayEl.textContent = queueItems.length + 38;

    this.queueGrid.innerHTML = "";

    queueItems.forEach((item) => {
      const card = document.createElement("div");
      card.className = "queue-card";
      card.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:flex-start;">
          <span class="queue-number">${item.queue}</span>
          <span class="badge-live" style="background:${item.badgeBg}; color:${item.badgeColor};">${item.statusBadge}</span>
        </div>
        <h4 style="margin:8px 0 4px;">${item.patient}</h4>
        <p style="font-size:12px; color:var(--muted); margin-bottom:14px;">${item.service}</p>
        <button type="button" class="btn btn-sm btn-primary full btn-call-patient" data-queue="${item.queue}" data-patient="${item.patient}">
          🔊 Panggil Pasien (Audio Chime)
        </button>
      `;

      card.querySelector(".btn-call-patient")?.addEventListener("click", () => {
        soundService.playQueueChime();
        if (notificationService && typeof notificationService.addSystemNotification === "function") {
          notificationService.addSystemNotification({
            title: `Panggilan Pasien ${item.queue}`,
            message: `[${item.queue}] ${item.patient} silakan menuju ke Ruang Praktik.`,
            category: "QUEUE",
            type: "info"
          });
        }
        alert(`🔊 Memanggil Nomor Antrean [${item.queue}]: ${item.patient} silakan masuk ke Ruang Praktik.`);
      });

      this.queueGrid.appendChild(card);
    });
  }

  setupWalkInDispatcher() {
    const walkInBtn = document.getElementById("adminWalkInBtn");
    if (!walkInBtn) return;

    walkInBtn.addEventListener("click", () => {
      const name = prompt("Nama Pasien Datang Langsung (Walk-In):", "Pasien Walk-In");
      if (!name) return;

      const service = prompt("Layanan yang Dibutuhkan:", "Konsultasi Fisioterapi / Akupunktur") || "Konsultasi Umum";

      const queueStorageKey = `cliniva_queue_${this.branchId}`;
      const queueItems = storageService.get(queueStorageKey, []) || [];
      const newQueueNumber = `W-0${queueItems.length + 1}`;

      queueItems.unshift({
        queue: newQueueNumber,
        patient: name,
        service: service,
        statusBadge: "READY",
        badgeColor: "#0f766e",
        badgeBg: "#f0fdfa"
      });

      storageService.set(queueStorageKey, queueItems);
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
      activeDocsCountEl.textContent = `${activeCount} Dokter Bertugas`;
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
  // POS ACTIONS & SETTLEMENT
  // ─────────────────────────────────────────────────────────────────────────

  openPOSModal(queueNo) {
    soundService.playClickTone?.();
    const confirmed = confirm(`Proses checkout kasir untuk antrean ${queueNo}?\nDeposit online telah diverifikasi.`);
    if (confirmed) {
      soundService.playSuccessChime?.();
      if (notificationService && typeof notificationService.addSystemNotification === "function") {
        notificationService.addSystemNotification({
          title: `Kasir POS: Antrean ${queueNo} Lunas`,
          message: `Pelunasan tagihan checkout antrean ${queueNo} berhasil diselesaikan.`,
          category: "SESSION",
          type: "success"
        });
      }
      alert(`✓ Transaksi kasir untuk antrean ${queueNo} berhasil diselesaikan!\nStruk pembayaran telah dicetak.`);
    }
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

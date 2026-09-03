/**
 * Cliniva — Admin / Receptionist Controller
 * SOLID: Single Responsibility for Clinic Operations Dashboard, Live Queue Calling & POS
 */

import { authService, USER_ROLES } from "../services/auth.service.js";
import { soundService } from "../services/sound.service.js";

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

    this.renderUserInfo(session.user);
    this.setupAdminTabs();
    this.setupQueueCalling();
    this.setupPOSActions();
    this.setupWalkInDispatcher();
    this.setupSignOut();
  }

  renderUserInfo(user) {
    const nameEl = document.getElementById("adminStaffName");
    const roleBadge = document.getElementById("adminRoleBadge");
    if (nameEl) nameEl.textContent = user.name;
    if (roleBadge) roleBadge.textContent = `🏥 ${user.title || "Front Desk Receptionist"} (${user.branchName || "Orchard SG"})`;
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

        alert(`🔊 Memanggil Nomor Antrean ${queueNo} atas nama ${patientName} ke Ruang Pemeriksaan!`);
      });
    });
  }

  setupWalkInDispatcher() {
    if (this.walkInBtn) {
      this.walkInBtn.addEventListener("click", () => {
        soundService.playClickTone();
        const patientName = prompt("Pendaftaran Pasien Walk-in / Telepon.\nMasukkan Nama Pasien:", "Budi Santoso");
        if (!patientName) return;

        const service = prompt("Pilih Layanan (1: Fisioterapi, 2: TCM Akupunktur, 3: Wellness):", "1");
        const serviceName = service === "2" ? "TCM Akupunktur" : service === "3" ? "Wellness Therapy" : "Fisioterapi";

        soundService.playQueueChime();
        alert(`✓ Pasien Walk-in [${patientName}] berhasil didaftarkan untuk [${serviceName}]!\nNomor Antrean: D-04 tercetak.`);
      });
    }
  }

  setupPOSActions() {
    window.openPOSModal = (queueNo) => {
      soundService.playClickTone();
      const amount = prompt(`Proses Pelunasan Kasir POS untuk Antrean ${queueNo}.\nMasukkan Jumlah Pembayaran (SGD):`, "90.00");
      if (amount) {
        soundService.playQueueChime();
        alert(`✓ Pembayaran SGD ${amount} untuk antrean ${queueNo} berhasil dicatat! Struk pembayaran tercetak.`);
      }
    };

    window.openSIMRSInspection = (referralId) => {
      soundService.playClickTone();
      alert(`Inspeksi Ephemeral SIMRS Webhook Payload [${referralId}]:\n\nHMAC: Valid SHA-256\nRetention TTL: 70 Jam tersisa\nStatus: FORWARDED TO HOSPITAL SIMRS`);
    };
  }

  setupSignOut() {
    if (this.signOutBtn) {
      this.signOutBtn.addEventListener("click", () => {
        soundService.playClickTone();
        if (confirm("Apakah Anda yakin ingin keluar dari panel Operasional?")) {
          authService.logout();
        }
      });
    }
  }
}

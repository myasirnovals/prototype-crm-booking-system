/**
 * Cliniva — Owner / Executive Dashboard Controller
 * SOLID: Single Responsibility for Executive Macro Analytics, Multi-Branch Management & Audit Logging
 */

import { authService, USER_ROLES } from "../services/auth.service.js";
import { storageService } from "../services/storage.service.js";
import { soundService } from "../services/sound.service.js";

export class OwnerController {
  constructor() {
    this.BRANCHES_KEY = "cliniva_branches";
    this.PROFILE_KEY = "cliniva_intake_profile";

    this.tabButtons = document.querySelectorAll(".owner-tab-btn");
    this.tabPanes = document.querySelectorAll(".owner-tab-pane");
    this.profileCards = document.querySelectorAll(".profile-card");
    this.signOutBtn = document.getElementById("ownerSignOutBtn");

    // Modal Elements
    this.modalOverlay = document.getElementById("branchModalOverlay");
    this.closeModalBtn = document.getElementById("closeBranchModalBtn");
    this.cancelModalBtn = document.getElementById("cancelBranchModalBtn");
    this.branchEditForm = document.getElementById("branchEditForm");
    this.branchCardsContainer = document.getElementById("branchCardsContainer");
    this.branchLogoPreview = document.getElementById("editBranchLogoPreview");
    this.branchLogoInput = document.getElementById("editBranchLogoFile");

    this.branches = this.loadBranches();
    this.tempLogoDataUrl = null;
  }

  init() {
    // Session Guard: Verify user has OWNER role
    const session = authService.requireAuth([USER_ROLES.OWNER]);
    if (!session) return;

    this.renderUserInfo(session.user);
    this.setupTabs();
    this.renderBranchCards();
    this.setupBranchModal();
    this.setupAdaptiveProfileCatalog();
    this.setupSignOut();
  }

  renderUserInfo(user) {
    const nameEl = document.getElementById("ownerUserName");
    const roleEl = document.getElementById("ownerUserRole");
    if (nameEl) nameEl.textContent = user.name;
    if (roleEl) roleEl.textContent = user.title || "Chief Executive & Clinic Owner";
  }

  setupTabs() {
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

  loadBranches() {
    const defaultBranches = [
      {
        id: "sg-orchard",
        name: "Orchard Wellness Clinic",
        region: "Singapore",
        address: "Paragon Medical #14-02, Singapore 238859",
        profileType: "TCM_PHYSIO",
        currency: "SGD",
        revenue: "SGD 84,500.00",
        occupancy: "92.1%",
        practitioners: "3 Praktisi Bertugas",
        phone: "+65 8123 4567",
        hours: "Senin - Sabtu (08:30 - 20:00 SGT)",
        status: "AKTIF",
        logoUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' rx='20' fill='%230f766e'/%3E%3Ctext x='50' y='64' font-size='42' font-family='sans-serif' font-weight='900' fill='white' text-anchor='middle'%3E✦%3C/text%3E%3C/svg%3E"
      },
      {
        id: "my-kl",
        name: "Kuala Lumpur Integrated Care",
        region: "Malaysia",
        address: "Pavilion Embassy Tower, Jalan Ampang, Kuala Lumpur",
        profileType: "MEDICAL_CLINIC",
        currency: "MYR",
        revenue: "MYR 142,200.00",
        occupancy: "86.5%",
        practitioners: "2 Dokter Spesialis",
        phone: "+60 12 345 6789",
        hours: "Senin - Sabtu (09:00 - 18:00 MYT)",
        status: "AKTIF",
        logoUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' rx='20' fill='%230284c7'/%3E%3Ctext x='50' y='64' font-size='42' font-family='sans-serif' font-weight='900' fill='white' text-anchor='middle'%3E✦%3C/text%3E%3C/svg%3E"
      },
      {
        id: "my-penang",
        name: "Penang TCM & Physio Center",
        region: "Malaysia",
        address: "Gurney Walk, Persiaran Gurney, Penang",
        profileType: "TCM_ACUPUNCTURE",
        currency: "MYR",
        revenue: "MYR 78,800.00",
        occupancy: "81.0%",
        practitioners: "2 Praktisi TCM",
        phone: "+60 17 888 9922",
        hours: "Selasa - Minggu (10:00 - 19:00 MYT)",
        status: "AKTIF",
        logoUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' rx='20' fill='%23d97706'/%3E%3Ctext x='50' y='64' font-size='42' font-family='sans-serif' font-weight='900' fill='white' text-anchor='middle'%3E✦%3C/text%3E%3C/svg%3E"
      }
    ];

    return storageService.get(this.BRANCHES_KEY, defaultBranches);
  }

  saveBranches() {
    storageService.set(this.BRANCHES_KEY, this.branches);
  }

  getProfileTypeLabel(type) {
    switch (type) {
      case "TCM_PHYSIO":
        return "Fisioterapi & Postur (Body Pain Map)";
      case "TCM_ACUPUNCTURE":
        return "Traditional Chinese Medicine (TCM)";
      case "SPA_WELLNESS":
        return "Spa & Wellness";
      case "MEDICAL_CLINIC":
        return "Klinik Medis & Faskes";
      default:
        return "Layanan Terpadu";
    }
  }

  renderBranchCards() {
    if (!this.branchCardsContainer) return;

    this.branchCardsContainer.innerHTML = this.branches
      .map((b) => {
        const isAktif = b.status === "AKTIF";
        const statusBadge = isAktif
          ? `<span class="status-pill confirmed">● Aktif</span>`
          : `<span class="status-pill cancelled">● Tutup Sementara</span>`;

        return `
          <div class="branch-card" id="card-${b.id}">
            <div class="branch-card-header">
              <div style="display:flex; align-items:center; gap:12px;">
                <img src="${b.logoUrl}" alt="${b.name}" style="width:36px; height:36px; border-radius:var(--radius-sm); object-fit:contain; border:1px solid var(--line); background:#fff;" />
                <div>
                  <strong style="font-size:15px; display:block; color:var(--text);">${b.name}</strong>
                  <div style="font-size:11px; color:var(--muted);">${b.region} · ${b.address}</div>
                </div>
              </div>
              <div>${statusBadge}</div>
            </div>

            <div style="margin:12px 0 14px; padding:8px 12px; background:#f8fafc; border-radius:var(--radius-sm); border:1px solid var(--line); font-size:12px;">
              <span style="color:var(--muted);">Profil Bisnis:</span>
              <strong style="color:var(--primary-dark); margin-left:4px;">${this.getProfileTypeLabel(b.profileType)}</strong>
            </div>

            <div class="summary-row">
              <span style="color:var(--muted);">Pendapatan Bulan Ini:</span>
              <strong>${b.revenue}</strong>
            </div>
            <div class="summary-row">
              <span style="color:var(--muted);">Okupansi Jadwal:</span>
              <strong>${b.occupancy}</strong>
            </div>
            <div class="summary-row">
              <span style="color:var(--muted);">Praktisi Bertugas:</span>
              <strong>${b.practitioners}</strong>
            </div>
            <div class="summary-row">
              <span style="color:var(--muted);">Jam Operasional:</span>
              <span style="font-size:12px; font-weight:600;">${b.hours}</span>
            </div>

            <div style="margin-top:16px; padding-top:14px; border-top:1px solid var(--line); display:flex; justify-content:space-between; align-items:center;">
              <span style="font-size:11px; color:var(--muted);">WhatsApp: ${b.phone}</span>
              <button type="button" class="btn btn-sm btn-soft edit-branch-btn" data-branch-id="${b.id}">
                Kelola Cabang
              </button>
            </div>
          </div>
        `;
      })
      .join("");

    // Attach click events to "Kelola Cabang" buttons
    this.branchCardsContainer.querySelectorAll(".edit-branch-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        soundService.playClickTone();
        const branchId = btn.dataset.branchId;
        this.openBranchModal(branchId);
      });
    });
  }

  setupBranchModal() {
    if (!this.modalOverlay) return;

    const closeModal = () => this.closeBranchModal();

    if (this.closeModalBtn) this.closeModalBtn.addEventListener("click", closeModal);
    if (this.cancelModalBtn) this.cancelModalBtn.addEventListener("click", closeModal);

    // Close on overlay backdrop click
    this.modalOverlay.addEventListener("click", (e) => {
      if (e.target === this.modalOverlay) closeModal();
    });

    // Close on ESC key
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.modalOverlay.style.display !== "none") {
        closeModal();
      }
    });

    // Handle Logo File Upload Preview inside Modal
    if (this.branchLogoInput) {
      this.branchLogoInput.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
          alert("Ukuran berkas logo maksimal 2MB.");
          return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
          this.tempLogoDataUrl = event.target.result;
          if (this.branchLogoPreview) {
            this.branchLogoPreview.src = this.tempLogoDataUrl;
          }
        };
        reader.readAsDataURL(file);
      });
    }

    // Handle Form Submit
    if (this.branchEditForm) {
      this.branchEditForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const id = document.getElementById("editBranchId").value;
        const branch = this.branches.find((b) => b.id === id);
        if (!branch) return;

        branch.name = document.getElementById("editBranchName").value.trim();
        branch.region = document.getElementById("editBranchRegion").value.trim();
        branch.profileType = document.getElementById("editBranchProfileType").value;
        branch.address = document.getElementById("editBranchAddress").value.trim();
        branch.phone = document.getElementById("editBranchPhone").value.trim();
        branch.hours = document.getElementById("editBranchHours").value.trim();
        branch.currency = document.getElementById("editBranchCurrency").value;
        branch.status = document.getElementById("editBranchStatus").value;

        if (this.tempLogoDataUrl) {
          branch.logoUrl = this.tempLogoDataUrl;
        }

        // Persist to storage
        this.saveBranches();

        // Re-render UI
        this.renderBranchCards();

        // Append to Audit Trail
        this.addAuditEntry("Dr. Hendra Wijaya", `Update Konfigurasi: ${branch.name}`, branch.id, `Status: ${branch.status} · ${branch.profileType}`);

        soundService.playQueueChime();
        this.closeBranchModal();
        alert(`Konfigurasi cabang "${branch.name}" berhasil disimpan.`);
      });
    }
  }

  openBranchModal(branchId) {
    const branch = this.branches.find((b) => b.id === branchId);
    if (!branch) return;

    this.tempLogoDataUrl = null;

    document.getElementById("editBranchId").value = branch.id;
    document.getElementById("editBranchName").value = branch.name;
    document.getElementById("editBranchRegion").value = branch.region;
    document.getElementById("editBranchProfileType").value = branch.profileType;
    document.getElementById("editBranchAddress").value = branch.address;
    document.getElementById("editBranchPhone").value = branch.phone;
    document.getElementById("editBranchHours").value = branch.hours;
    document.getElementById("editBranchCurrency").value = branch.currency;
    document.getElementById("editBranchStatus").value = branch.status;

    if (this.branchLogoPreview) {
      this.branchLogoPreview.src = branch.logoUrl;
    }
    if (this.branchLogoInput) {
      this.branchLogoInput.value = "";
    }

    const titleEl = document.getElementById("branchModalTitle");
    if (titleEl) {
      titleEl.textContent = `Konfigurasi Cabang: ${branch.name}`;
    }

    this.modalOverlay.style.display = "flex";
  }

  closeBranchModal() {
    if (this.modalOverlay) {
      this.modalOverlay.style.display = "none";
    }
    this.tempLogoDataUrl = null;
  }

  addAuditEntry(actor, event, code, details) {
    const tableBody = document.getElementById("auditTrailTableBody");
    if (!tableBody) return;

    const now = new Date();
    const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${timeStr}</td>
      <td>${actor}</td>
      <td>${event}</td>
      <td>${code}</td>
      <td>${details}</td>
      <td><span class="status-pill confirmed">● Recorded</span></td>
    `;
    tableBody.insertBefore(tr, tableBody.firstChild);
  }

  setupAdaptiveProfileCatalog() {
    this.profileCards.forEach((card) => {
      card.addEventListener("click", () => {
        const profile = card.dataset.profile;
        soundService.playClickTone();

        this.profileCards.forEach((c) => c.classList.remove("active"));
        card.classList.add("active");

        storageService.set(this.PROFILE_KEY, profile);
        this.addAuditEntry("Dr. Hendra Wijaya", "Set Default Intake Blueprint", "BLUEPRINT", `Tipe: ${profile}`);
      });
    });
  }

  setupSignOut() {
    if (!this.signOutBtn) return;
    this.signOutBtn.addEventListener("click", () => {
      if (confirm("Apakah Anda yakin ingin keluar dari panel eksekutif?")) {
        authService.logout();
      }
    });
  }
}

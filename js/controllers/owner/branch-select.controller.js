/**
 * Cliniva — Branch Selection Gateway Controller
 * SOLID: Single Responsibility for Branch Switching & Multi-Branch Tenant Navigation
 * Flow based on Scraping Data/alur aplikasi booking system.xml (Owner -> First: No -> Choose Branch -> Dashboard)
 */

import { authService, USER_ROLES } from "../../services/auth.service.js";
import { storageService } from "../../services/storage.service.js";
import { soundService } from "../../services/sound.service.js";
import { bookingService } from "../../services/booking.service.js";

export class BranchSelectController {
  constructor() {
    this.currentUser = null;
    this.branches = [];
    this.brandProfile = null;
  }

  init() {
    // 1. Auth Guard: Verify user is logged in
    const session = authService.getCurrentSession();
    if (!session || !session.user) {
      window.location.href = "../../pages/public/sign-in.html";
      return;
    }

    this.currentUser = session.user;

    // 2. If onboarding not completed yet, enforce setup branch wizard first
    if (this.currentUser.role === USER_ROLES.OWNER && this.currentUser.onboardingCompleted === false) {
      window.location.href = "../../pages/owner/onboarding.html";
      return;
    }

    this.loadBrandProfile();
    this.loadBranches();
    this.renderHeader();
    this.renderBranchCards();
    this.setupModal();
    this.setupSignOut();
  }

  loadBrandProfile() {
    const defaultProfile = {
      name: this.currentUser.brandName || "Dennis Health & Wellness Hub",
      tagline: this.currentUser.brandTagline || "Holistic Recovery & Vitality Redefined",
      logo: this.currentUser.brandLogo || "🌿",
      region: this.currentUser.region || "sg"
    };
    this.brandProfile = storageService.get("cliniva_brand_profile", defaultProfile);
  }

  loadBranches() {
    let stored = storageService.get("cliniva_branches", null);

    if (!stored || !Array.isArray(stored) || stored.length === 0) {
      // Default initial branch for Dennis if not created yet
      const defaultBranch = {
        id: "br-sg-orchard-01",
        name: this.currentUser.branchName && this.currentUser.branchName !== "Setup Pending" 
          ? this.currentUser.branchName 
          : "Paragon Medical Flagship (Cabang 1)",
        code: "SG-01",
        address: "290 Orchard Road, #09-12 Paragon Medical Suites, Singapore 238859",
        phone: "+65 6733 8899",
        hours: "09:00 - 20:00 (Sen - Sab)",
        rooms: "4",
        template: this.currentUser.activeTemplate || "physio",
        currency: "SGD",
        revenue: "SGD 18,450.00",
        occupancy: "82%",
        status: "ACTIVE",
        isPrimary: true,
        createdAt: new Date().toISOString()
      };
      stored = [defaultBranch];
      storageService.set("cliniva_branches", stored);
      storageService.set("cliniva_active_branch_id", defaultBranch.id);
    }

    // Deduplicate any existing duplicate branches in storage
    stored = this.deduplicateBranches(stored);
    storageService.set("cliniva_branches", stored);

    this.branches = stored;
  }

  deduplicateBranches(branches) {
    if (!Array.isArray(branches)) return [];
    const activeBranchId = storageService.get("cliniva_active_branch_id", null);

    // Deduplicate by ID and by normalized Name
    const seenNames = new Set();
    const seenIds = new Set();
    const result = [];

    // Sort to prioritize currently active branch first, then primary branches
    const sorted = [...branches].sort((a, b) => {
      if (a.id === activeBranchId) return -1;
      if (b.id === activeBranchId) return 1;
      if (a.isPrimary) return -1;
      if (b.isPrimary) return 1;
      return 0;
    });

    for (const b of sorted) {
      if (!b || !b.id) continue;
      const cleanName = (b.name || "").trim().toLowerCase();

      if (seenIds.has(b.id)) continue;
      if (cleanName && seenNames.has(cleanName)) continue;

      seenIds.add(b.id);
      if (cleanName) seenNames.add(cleanName);
      result.push(b);
    }

    // Ensure active branch ID is valid
    if (result.length > 0 && !result.some((b) => b.id === activeBranchId)) {
      storageService.set("cliniva_active_branch_id", result[0].id);
    }

    return result;
  }

  renderHeader() {
    const userLabel = document.getElementById("gatewayLoggedInAs");
    if (userLabel && this.currentUser) {
      userLabel.innerHTML = `Signed in as <strong>${this.currentUser.name}</strong> (${this.currentUser.title || "Owner"})`;
    }

    const titleEl = document.getElementById("gatewayBrandTitle");
    const taglineEl = document.getElementById("gatewayBrandTagline");
    const logoEl = document.getElementById("gatewayBrandLogo");

    if (titleEl) titleEl.textContent = this.brandProfile.name || "Clinic Enterprise";
    if (taglineEl) taglineEl.textContent = this.brandProfile.tagline || "";

    if (logoEl) {
      const logoVal = this.brandProfile.logo || "🌿";
      if (logoVal.startsWith("data:image") || logoVal.startsWith("http") || logoVal.includes("/")) {
        logoEl.innerHTML = `<img src="${logoVal}" alt="Brand Logo">`;
      } else {
        logoEl.textContent = logoVal;
      }
    }

    const countBadge = document.getElementById("branchCountBadge");
    if (countBadge) {
      countBadge.textContent = `${this.branches.length} Cabang Terdaftar`;
    }
  }

  getTemplateMeta(templateId) {
    switch (templateId) {
      case "tcm":
        return { label: "🌿 TCM & Akupunktur", color: "#065f46", bg: "#d1fae5", icon: "🌿" };
      case "wellness":
        return { label: "🌸 Wellness & Spa", color: "#9d174d", bg: "#fce7f3", icon: "🌸" };
      case "nutrition":
        return { label: "🥗 Klinik Nutrisi & Diet", color: "#166534", bg: "#dcfce7", icon: "🥗" };
      case "physio":
      default:
        return { label: "🏃 Fisioterapi & Rehab", color: "#0f766e", bg: "#ccfbf1", icon: "🏃" };
    }
  }

  renderBranchCards() {
    const container = document.getElementById("branchCardsGrid");
    if (!container) return;

    const activeBranchId = storageService.get("cliniva_active_branch_id", this.branches[0]?.id);

    const cardsHtml = this.branches.map((b) => {
      const meta = this.getTemplateMeta(b.template);
      const isActive = b.id === activeBranchId;
      const roomsCount = Array.isArray(b.rooms) ? b.rooms.length : (b.rooms || "4");

      // Isolasi logo cabang: Hanya cabang primer yang menggunakan fallback Brand Profile.
      // Cabang kedua dan seterusnya memprioritaskan b.logo mandiri atau default ikon template (anti-duplikasi foto cabang 1).
      const logoSrc = b.isPrimary ? (b.logo || this.brandProfile?.logo) : b.logo;
      const hasImageLogo = logoSrc && (logoSrc.startsWith("data:image") || logoSrc.startsWith("http") || logoSrc.includes("/"));
      const logoContent = hasImageLogo
        ? `<img src="${logoSrc}" alt="${b.name}">`
        : `<span>${b.logo || meta.icon || "🌿"}</span>`;

      return `
        <div class="gateway-header-card branch-card-row ${isActive ? "is-active" : ""}" data-branch-id="${b.id}">
          <div class="gateway-brand-info">
            <div class="gateway-brand-logo">
              ${logoContent}
            </div>
            <div class="branch-brand-text">
              <div style="display:flex; gap:8px; align-items:center; margin-bottom:6px; flex-wrap:wrap;">
                <span class="pill" style="background:${meta.bg}; color:${meta.color}; font-weight:800; font-size:11px; padding:3px 8px;">
                  ${meta.label}
                </span>
                <span class="pill" style="background:#dcfce7; color:#15803d; font-weight:800; font-size:10px; padding:2px 6px;">
                  ● AKTIF
                </span>
                ${isActive ? `<span class="pill" style="background:#0f766e; color:#ffffff; font-weight:800; font-size:10px; padding:2px 6px;">SEDANG DIBUKA</span>` : ""}
              </div>
              <h2>${b.name}</h2>
              <p>📍 ${b.address}</p>
              <div class="branch-meta-row">
                <span class="branch-meta-item">📞 <strong>${b.phone || "-"}</strong></span>
                <span class="branch-meta-item">⏰ <strong>${b.hours || "09:00 - 20:00"}</strong></span>
                <span class="branch-meta-item">🚪 <strong>${roomsCount} Ruang Terapi</strong></span>
              </div>
            </div>
          </div>

          <div class="branch-action-wrap">
            <button type="button" class="btn btn-primary select-branch-btn" data-branch-id="${b.id}" style="padding:12px 24px; font-weight:800; white-space:nowrap; border-radius:12px; font-size:13px; ${isActive ? 'background:#0f766e; border-color:#0f766e;' : ''}">
              ${isActive ? "Buka Dashboard Cabang Aktif →" : "Pilih &amp; Masuk Dashboard →"}
            </button>
          </div>
        </div>
      `;
    }).join("");

    container.innerHTML = cardsHtml;

    // Attach click listeners to cards and buttons
    container.querySelectorAll(".select-branch-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const branchId = btn.dataset.branchId;
        this.selectBranchAndGo(branchId);
      });
    });

    container.querySelectorAll(".branch-card-row").forEach((card) => {
      card.addEventListener("click", () => {
        const branchId = card.dataset.branchId;
        this.selectBranchAndGo(branchId);
      });
    });
  }

  selectBranchAndGo(branchId) {
    const branch = this.branches.find((b) => b.id === branchId);
    if (!branch) return;

    soundService.playQueueChime();

    // 1. Set Active Branch in Storage
    storageService.set("cliniva_active_branch_id", branch.id);

    // 2. Synchronize active business template
    if (branch.template) {
      bookingService.setActiveTemplate(branch.template);
    }

    // 3. Navigate to dedicated Owner Dashboard
    setTimeout(() => {
      window.location.href = "../../pages/owner/dashboard.html";
    }, 400);
  }

  setupModal() {
    const btnOpen = document.getElementById("btnOpenNewBranchModal");
    const modalOverlay = document.getElementById("newBranchModalOverlay");
    const btnClose = document.getElementById("btnCloseNewBranchModal");
    const btnCancel = document.getElementById("btnCancelNewBranch");
    const form = document.getElementById("createBranchForm");

    if (btnOpen) {
      btnOpen.addEventListener("click", () => this.openNewBranchModal());
    }

    const closeModal = () => {
      if (modalOverlay) modalOverlay.style.display = "none";
    };

    if (btnClose) btnClose.addEventListener("click", closeModal);
    if (btnCancel) btnCancel.addEventListener("click", closeModal);

    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();

        const name = document.getElementById("newBranchName")?.value.trim();
        const template = document.getElementById("newBranchTemplate")?.value || "physio";
        const address = document.getElementById("newBranchAddress")?.value.trim();
        const phone = document.getElementById("newBranchPhone")?.value.trim() || "+65 6888 1234";
        const hours = document.getElementById("newBranchHours")?.value.trim() || "09:00 - 20:00";
        const rooms = document.getElementById("newBranchRooms")?.value || "4";

        if (!name || !address) {
          alert("Mohon lengkapi nama dan alamat cabang baru.");
          return;
        }

        const meta = this.getTemplateMeta(template);
        const newBranchId = `br-sg-${Date.now().toString().slice(-4)}`;
        const newBranch = {
          id: newBranchId,
          name,
          code: `SG-0${this.branches.length + 1}`,
          address,
          phone,
          hours,
          rooms,
          template,
          logo: meta.icon, // Tetapkan ikon template cabang mandiri agar tidak menduplikasi foto cabang 1
          currency: "SGD",
          revenue: "SGD 0.00",
          occupancy: "0.0%",
          status: "ACTIVE",
          isPrimary: false,
          createdAt: new Date().toISOString()
        };

        this.branches.push(newBranch);
        storageService.set("cliniva_branches", this.branches);

        soundService.playQueueChime();
        closeModal();
        form.reset();

        // Immediately activate newly created branch and enter dashboard
        this.selectBranchAndGo(newBranchId);
      });
    }
  }

  openNewBranchModal() {
    const modalOverlay = document.getElementById("newBranchModalOverlay");
    const nameInput = document.getElementById("newBranchName");
    if (nameInput && !nameInput.value) {
      const nextNum = this.branches.length + 1;
      nameInput.placeholder = `e.g. Marina Bay Clinic (Cabang ${nextNum})`;
    }
    if (modalOverlay) {
      modalOverlay.style.display = "flex";
      soundService.playClickTone();
    }
  }

  setupSignOut() {
    const btn = document.getElementById("gatewaySignOutBtn");
    if (btn) {
      btn.addEventListener("click", () => {
        authService.logout();
      });
    }
  }
}

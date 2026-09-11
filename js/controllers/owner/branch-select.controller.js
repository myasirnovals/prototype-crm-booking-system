/**
 * Cliniva — Branch Selection Gateway Controller
 * SOLID: Single Responsibility for Branch Switching & Multi-Branch Tenant Navigation
 * Flow based on Scraping Data/alur aplikasi booking system.xml (Owner -> First: No -> Choose Branch -> Dashboard)
 */

import { authService, USER_ROLES } from "../../services/auth.service.js";
import { storageService } from "../../services/storage.service.js";
import { soundService } from "../../services/sound.service.js";
import { bookingService } from "../../services/booking.service.js";
import { i18nService } from "../../services/i18n.service.js";
import { supabaseService } from "../../services/supabase.service.js";

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

    document.addEventListener("cliniva:languageChanged", () => {
      this.renderHeader();
      this.renderBranchCards();
    });
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
          : "Paragon Medical Flagship (Branch 1)",
        code: "SG-01",
        address: "290 Orchard Road, #09-12 Paragon Medical Suites, Singapore 238859",
        phone: "+65 6733 8899",
        hours: "09:00 - 20:00 (Mon - Sat)",
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
      countBadge.textContent = `${this.branches.length} ${i18nService.t("owner.gateway.branchCount", "Registered Branches")}`;
    }
  }

  getTemplateMeta(templateId) {
    switch (templateId) {
      case "tcm":
        return { label: i18nService.t("template.tcm.name", "🌿 TCM & Acupuncture"), color: "#065f46", bg: "#d1fae5", icon: "🌿" };
      case "wellness":
        return { label: i18nService.t("template.wellness.name", "🌸 Wellness & Spa"), color: "#9d174d", bg: "#fce7f3", icon: "🌸" };
      case "nutrition":
        return { label: i18nService.t("template.nutrition.name", "🥗 Nutrition & Dietetics"), color: "#166534", bg: "#dcfce7", icon: "🥗" };
      case "physio":
      default:
        return { label: i18nService.t("template.physio.name", "🏃 Physiotherapy & Rehab"), color: "#0f766e", bg: "#ccfbf1", icon: "🏃" };
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
                  ${i18nService.t("owner.activeBranchBadge", "● ACTIVE")}
                </span>
                ${isActive ? `<span class="pill" style="background:#0f766e; color:#ffffff; font-weight:800; font-size:10px; padding:2px 6px;">${i18nService.t("owner.gateway.openNow", "OPEN NOW")}</span>` : ""}
              </div>
              <h2>${b.name}</h2>
              <p>📍 ${b.address}</p>
              <div class="branch-meta-row">
                <span class="branch-meta-item">📞 <strong>${b.phone || "-"}</strong></span>
                <span class="branch-meta-item">⏰ <strong>${b.hours || "09:00 - 20:00"}</strong></span>
                <span class="branch-meta-item">🚪 <strong>${roomsCount} Rooms</strong></span>
              </div>
            </div>
          </div>

          <div class="branch-action-wrap" style="display:flex; gap:8px; flex-wrap:wrap; align-items:center;">
            <button type="button" class="btn btn-sm btn-soft copy-branch-link-btn" data-branch-id="${b.id}" style="padding:10px 16px; font-weight:700; white-space:nowrap; border-radius:12px; font-size:12px; display:inline-flex; align-items:center; gap:6px;">
              🔗 <span data-i18n="owner.copyBookingLink">${i18nService.t("owner.copyBookingLink", "Copy Booking Link")}</span>
            </button>
            <button type="button" class="btn btn-primary select-branch-btn" data-branch-id="${b.id}" style="padding:12px 24px; font-weight:800; white-space:nowrap; border-radius:12px; font-size:13px; ${isActive ? 'background:#0f766e; border-color:#0f766e;' : ''}">
              ${isActive ? i18nService.t("owner.gateway.openActive", "Open Active Branch Dashboard →") : i18nService.t("owner.gateway.chooseAndEnter", "Select & Open Dashboard →")}
            </button>
          </div>
        </div>
      `;
    }).join("");

    container.innerHTML = cardsHtml;

    // Attach click listeners to cards and buttons
    container.querySelectorAll(".copy-branch-link-btn").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        e.stopPropagation();
        const branchId = btn.dataset.branchId;
        const origin = window.location.origin;
        const pathname = window.location.pathname;
        const basePath = pathname.substring(0, pathname.lastIndexOf("/pages/"));
        const url = `${origin}${basePath}/pages/public/booking.html?branch=${encodeURIComponent(branchId)}`;

        try {
          await navigator.clipboard.writeText(url);
          soundService.playSuccess();
          const originalHtml = btn.innerHTML;
          btn.innerHTML = `✅ ${i18nService.t("owner.copied", "Copied!")}`;
          btn.style.background = "#dcfce7";
          btn.style.color = "#15803d";
          setTimeout(() => {
            btn.innerHTML = originalHtml;
            btn.style.background = "";
            btn.style.color = "";
          }, 2000);
        } catch (err) {
          prompt(i18nService.t("owner.copyManualPrompt", "Copy this branch booking link:"), url);
        }
      });
    });

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
    const logoInput = document.getElementById("newBranchLogoFileInput");
    const dropZone = document.getElementById("newBranchLogoDropZone");
    const previewEmoji = document.getElementById("newBranchLogoPreviewEmoji");
    const previewImage = document.getElementById("newBranchLogoPreviewImage");
    const hiddenLogoVal = document.getElementById("newBranchSelectedLogoInput");
    const btnRemoveLogo = document.getElementById("btnRemoveNewBranchLogo");
    const uploadTitle = document.getElementById("newBranchLogoUploadTitle");
    const postalInput = document.getElementById("newBranchPostal");
    const addressInput = document.getElementById("newBranchAddress");
    const postalFeedback = document.getElementById("postalFeedback");

    // OneMap API Auto-fill (Singapore Postal Code Validation)
    if (postalInput && addressInput) {
      postalInput.addEventListener("input", async (e) => {
        const postalCode = e.target.value.trim();

        if (/^\d{6}$/.test(postalCode)) {
          if (postalFeedback) {
            postalFeedback.textContent = "⏳ " + i18nService.t("owner.gateway.searchingAddress", "Searching address...");
            postalFeedback.style.display = "block";
            postalFeedback.style.color = "#0f766e";
          }

          try {
            const response = await fetch(`https://www.onemap.gov.sg/api/common/elastic/search?searchVal=${postalCode}&returnGeom=N&getAddrDetails=Y&pageNum=1`);
            const data = await response.json();

            if (data.found > 0) {
              const result = data.results[0];
              const blk = result.BLK_NO === "NIL" ? "" : `${result.BLK_NO} `;
              const road = result.ROAD_NAME === "NIL" ? "" : result.ROAD_NAME;
              const building = result.BUILDING === "NIL" ? "" : `, ${result.BUILDING}`;

              addressInput.value = `${blk}${road}${building}, Singapore ${result.POSTAL}`;

              if (postalFeedback) {
                postalFeedback.textContent = "✅ " + i18nService.t("owner.gateway.addressFound", "Address found");
                postalFeedback.style.color = "#16a34a";
              }
            } else {
              if (postalFeedback) {
                postalFeedback.textContent = "❌ " + i18nService.t("owner.gateway.invalidPostal", "Invalid postal code");
                postalFeedback.style.color = "#ef4444";
              }
            }
          } catch (error) {
            console.error("Error fetching OneMap API:", error);
            if (postalFeedback) {
              postalFeedback.textContent = "⚠️ " + i18nService.t("owner.gateway.connectionFailed", "Connection failed");
              postalFeedback.style.color = "#ef4444";
            }
          }
        } else {
          if (postalFeedback) postalFeedback.style.display = "none";
        }
      });
    }
    // AKHIR MODIFIKASI

    if (btnOpen) {
      btnOpen.addEventListener("click", () => this.openNewBranchModal());
    }

    const closeModal = () => {
      if (modalOverlay) modalOverlay.style.display = "none";
    };

    // AWAL MODIFIKASI: Logika Upload Logo Cabang
    if (dropZone && logoInput) {
      dropZone.addEventListener("click", () => logoInput.click());

      logoInput.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate image file size (max 3MB)
        if (file.size > 3 * 1024 * 1024) {
          alert(i18nService.t("owner.gateway.maxImageSize", "Maximum image file size is 3MB."));
          return;
        }

        const reader = new FileReader();
        reader.onload = (ev) => {
          const dataUrl = ev.target.result;
          hiddenLogoVal.value = dataUrl;
          previewImage.src = dataUrl;
          previewImage.style.display = "block";
          previewEmoji.style.display = "none";
          btnRemoveLogo.style.display = "inline-block";
          uploadTitle.textContent = i18nService.t("owner.gateway.logoUploaded", "Logo uploaded successfully");
        };
        reader.readAsDataURL(file);
      });
    }

    if (btnRemoveLogo) {
      btnRemoveLogo.addEventListener("click", (e) => {
        e.stopPropagation();
        logoInput.value = "";
        hiddenLogoVal.value = "";
        previewImage.src = "";
        previewImage.style.display = "none";
        previewEmoji.style.display = "block";
        btnRemoveLogo.style.display = "none";
        uploadTitle.textContent = i18nService.t("owner.gateway.clickUploadLogo", "Click to upload branch logo");
      });
    }
    // AKHIR MODIFIKASI

    if (btnClose) btnClose.addEventListener("click", closeModal);
    if (btnCancel) btnCancel.addEventListener("click", closeModal);

    if (modalOverlay) {
      modalOverlay.addEventListener("click", (e) => {
        // Pastikan yang diklik adalah background gelapnya, bukan area dalam form
        if (e.target === modalOverlay) {
          closeModal();
        }
      });
    }

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
          alert(i18nService.t("owner.gateway.branchNameAddressRequired", "Please fill in the new branch name and address."));
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
          logo: document.getElementById("newBranchSelectedLogoInput")?.value || meta.icon,
          currency: "SGD",
          revenue: "SGD 0.00",
          occupancy: "0.0%",
          status: "ACTIVE",
          isPrimary: false,
          createdAt: new Date().toISOString()
        };

        this.branches.push(newBranch);
        storageService.set("cliniva_branches", this.branches);

        // Record Branch Subscription Plan
        const selectedPlan = document.querySelector('input[name="subsPlan"]:checked');
        const planDuration = selectedPlan ? parseInt(selectedPlan.value, 10) : 12;
        const planPrice = selectedPlan ? parseFloat(selectedPlan.dataset.price) : 948;

        const subscription = {
          id: `sub-${Date.now()}`,
          ownerId: this.currentUser ? this.currentUser.id : null,
          ownerEmail: this.currentUser ? this.currentUser.email : null,
          template,
          branchId: newBranchId,
          branchName: name,
          durationMonths: planDuration,
          amount: planPrice,
          currency: "SGD",
          status: "ACTIVE",
          paidAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + planDuration * 30 * 24 * 60 * 60 * 1000).toISOString()
        };
        const existingSubs = storageService.get("cliniva_owner_subscriptions", []);
        storageService.set("cliniva_owner_subscriptions", [subscription, ...existingSubs]);

        // Sync to Supabase Cloud if available
        if (supabaseService.isAvailable()) {
          supabaseService.upsertBranch({
            id: newBranchId,
            name,
            address,
            phone,
            hours,
            regionCode: "sg",
            region: "Singapore",
            country: "Singapore",
            currency: "SGD"
          }).catch(err => console.warn("[BranchSelect] Cloud branch sync failed:", err));
        }

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
      nameInput.placeholder = `e.g. Marina Bay Clinic (Branch ${nextNum})`;
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

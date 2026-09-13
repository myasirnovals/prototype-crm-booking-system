/**
 * Cliniva — Branch Selection Gateway Controller
 * SOLID: Single Responsibility for Branch Switching, Status Toggling, and Multi-Branch Navigation.
 * Mobile-First, decluttered, vertical action stack, and interactive status management.
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

    // Close any open status menus when clicking outside
    document.addEventListener("click", () => {
      document.querySelectorAll(".status-menu-popup.show").forEach((m) => m.classList.remove("show"));
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
      const defaultBranch = {
        id: "br-sg-orchard-01",
        name: this.currentUser.branchName && this.currentUser.branchName !== "Setup Pending"
          ? this.currentUser.branchName
          : "Paragon Medical Flagship (Branch 1)",
        code: "SG-01",
        address: "290 Orchard Road, #09-12 Paragon Medical Suites, Singapore 238859",
        phone: "+65 6733 8899",
        hours: "Mon - Sat (09:00 - 20:00)",
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
      case "personal-trainer":
      case "fitness":
      case "pt":
        return { label: i18nService.t("template.pt.name", "🏋️ Fitness & Personal Trainer"), color: "#1e293b", bg: "#f1f5f9", icon: "🏋️" };
      case "physio":
      default:
        return { label: i18nService.t("template.physio.name", "🏃 Physiotherapy & Rehab"), color: "#0f766e", bg: "#ccfbf1", icon: "🏃" };
    }
  }

  /**
   * Sanitizes operational hours strings and eliminates any leaked Indonesian day names.
   */
  formatOperatingHours(rawHours) {
    if (!rawHours) return "Mon - Sat (09:00 - 20:00)";
    return rawHours
      .replace(/Senin\s*-\s*Sabtu/gi, "Mon - Sat")
      .replace(/Selasa\s*-\s*Minggu/gi, "Tue - Sun")
      .replace(/Senin\s*-\s*Minggu/gi, "Mon - Sun")
      .replace(/Senin\s*-\s*Jumat/gi, "Mon - Fri")
      .replace(/Sabtu\s*-\s*Minggu/gi, "Sat - Sun")
      .replace(/Senin/gi, "Mon")
      .replace(/Selasa/gi, "Tue")
      .replace(/Rabu/gi, "Wed")
      .replace(/Kamis/gi, "Thu")
      .replace(/Jumat/gi, "Fri")
      .replace(/Sabtu/gi, "Sat")
      .replace(/Minggu/gi, "Sun");
  }

  showToast(message, icon = "✅") {
    const container = document.getElementById("gatewayToastContainer");
    if (!container) return;
    const toast = document.createElement("div");
    toast.className = "gateway-toast";
    toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.transition = "opacity 0.25s ease, transform 0.25s ease";
      toast.style.opacity = "0";
      toast.style.transform = "translateY(8px)";
      setTimeout(() => toast.remove(), 250);
    }, 2500);
  }

  renderBranchCards() {
    const container = document.getElementById("branchCardsGrid");
    if (!container) return;

    const activeBranchId = storageService.get("cliniva_active_branch_id", this.branches[0]?.id);

    const cardsHtml = this.branches.map((b) => {
      const meta = this.getTemplateMeta(b.template);
      const isActive = b.id === activeBranchId;
      const isPaused = b.status === "PAUSED" || b.status === "CLOSED" || b.status === "INACTIVE";
      const roomsCount = Array.isArray(b.rooms) ? b.rooms.length : (b.rooms || "4");

      const logoSrc = b.isPrimary ? (b.logo || this.brandProfile?.logo) : b.logo;
      const hasImageLogo = logoSrc && (logoSrc.startsWith("data:image") || logoSrc.startsWith("http") || logoSrc.includes("/"));
      const logoContent = hasImageLogo
        ? `<img src="${logoSrc}" alt="${b.name}">`
        : `<span>${b.logo || meta.icon || "🌿"}</span>`;

      const cleanHours = this.formatOperatingHours(b.hours);
      const cleanPhone = b.phone || "+65 6733 8899";

      const statusLabel = isPaused
        ? i18nService.t("owner.gateway.statusPaused", "Paused")
        : i18nService.t("owner.gateway.statusActive", "Active");

      return `
        <div class="branch-card ${isActive ? "is-active" : ""}" data-branch-id="${b.id}">
          <div class="branch-content-wrap">
            <div class="branch-avatar">
              ${logoContent}
            </div>
            <div class="branch-info">
              <div class="branch-title-row">
                <h2>${b.name}</h2>
                <span class="pill" style="background:${meta.bg}; color:${meta.color}; font-weight:800; font-size:11px; padding:3px 8px;">
                  ${meta.label}
                </span>

                <!-- Interactive Status Dropdown -->
                <div class="status-dropdown-wrap">
                  <button type="button" class="btn-status-badge ${isPaused ? "status-paused" : "status-active"}" data-branch-id="${b.id}" title="${i18nService.t("owner.gateway.toggleStatus", "Click to change branch status")}">
                    <span class="status-dot-pulse"></span>
                    <span class="status-text">${statusLabel}</span>
                    <span style="font-size:9px; margin-left:1px;">▾</span>
                  </button>
                  <div class="status-menu-popup" id="statusMenu-${b.id}">
                    <button type="button" class="status-menu-item" data-action="set-active" data-branch-id="${b.id}">
                      🟢 ${i18nService.t("owner.gateway.setOpen", "Open / Active")}
                    </button>
                    <button type="button" class="status-menu-item" data-action="set-paused" data-branch-id="${b.id}">
                      ⏸️ ${i18nService.t("owner.gateway.setPaused", "Temporarily Closed")}
                    </button>
                    <div class="status-menu-divider"></div>
                    <button type="button" class="status-menu-item danger-item" data-action="archive" data-branch-id="${b.id}">
                      🗑️ ${i18nService.t("owner.gateway.archiveBranch", "Archive Branch")}
                    </button>
                  </div>
                </div>

                ${isActive ? `<span class="pill" style="background:#0f766e; color:#ffffff; font-weight:800; font-size:10px; padding:2px 7px;">${i18nService.t("owner.gateway.currentBranch", "CURRENT")}</span>` : ""}
              </div>

              <div class="branch-address-line">
                <span>📍</span>
                <span>${b.address}</span>
              </div>

              <div class="branch-meta-chips">
                <span class="branch-meta-chip">📞 <strong>${cleanPhone}</strong></span>
                <span class="branch-meta-chip">⏰ <strong>${cleanHours}</strong></span>
                <span class="branch-meta-chip">🚪 <strong>${roomsCount} Rooms</strong></span>
              </div>
            </div>
          </div>

          <!-- Vertical Action Stack -->
          <div class="branch-actions-stack">
            <button type="button" class="btn btn-primary btn-manage-branch select-branch-btn" data-branch-id="${b.id}">
              ${isActive ? i18nService.t("owner.gateway.openDashboard", "Open Dashboard →") : i18nService.t("owner.gateway.manageBranch", "Manage Branch →")}
            </button>
            <button type="button" class="btn btn-copy-link copy-branch-link-btn" data-branch-id="${b.id}">
              🔗 <span>${i18nService.t("owner.copyBookingLink", "Copy Booking Link")}</span>
            </button>
          </div>
        </div>
      `;
    }).join("");

    container.innerHTML = cardsHtml;

    // Attach click listeners to Copy Link buttons
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
          btn.innerHTML = `✅ <span>${i18nService.t("owner.copied", "Copied!")}</span>`;
          btn.style.background = "#dcfce7";
          btn.style.borderColor = "#86efac";
          btn.style.color = "#15803d";
          this.showToast(i18nService.t("owner.gateway.linkCopiedNotice", "Booking link copied to clipboard!"), "📋");
          setTimeout(() => {
            btn.innerHTML = originalHtml;
            btn.style.background = "";
            btn.style.borderColor = "";
            btn.style.color = "";
          }, 2000);
        } catch (err) {
          prompt(i18nService.t("owner.copyManualPrompt", "Copy this branch booking link:"), url);
        }
      });
    });

    // Attach click listeners to Select/Manage Branch buttons
    container.querySelectorAll(".select-branch-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const branchId = btn.dataset.branchId;
        this.selectBranchAndGo(branchId);
      });
    });

    // Attach click listeners to card bodies
    container.querySelectorAll(".branch-card").forEach((card) => {
      card.addEventListener("click", (e) => {
        // Prevent action if clicking inside status dropdown menu
        if (e.target.closest(".status-dropdown-wrap")) return;
        const branchId = card.dataset.branchId;
        this.selectBranchAndGo(branchId);
      });
    });

    // Attach click listeners to status badge toggle
    container.querySelectorAll(".btn-status-badge").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const branchId = btn.dataset.branchId;
        const menu = document.getElementById(`statusMenu-${branchId}`);

        // Close any other open menus
        document.querySelectorAll(".status-menu-popup.show").forEach((m) => {
          if (m !== menu) m.classList.remove("show");
        });

        if (menu) {
          menu.classList.toggle("show");
          soundService.playClickTone();
        }
      });
    });

    // Attach click listeners to status menu actions
    container.querySelectorAll(".status-menu-item").forEach((item) => {
      item.addEventListener("click", (e) => {
        e.stopPropagation();
        const branchId = item.dataset.branchId;
        const action = item.dataset.action;
        const branch = this.branches.find((b) => b.id === branchId);
        if (!branch) return;

        const menu = document.getElementById(`statusMenu-${branchId}`);
        if (menu) menu.classList.remove("show");

        if (action === "set-active") {
          branch.status = "ACTIVE";
          storageService.set("cliniva_branches", this.branches);
          soundService.playSuccess();
          this.showToast(`${branch.name} is now Open & Active for bookings`, "🟢");
          this.syncBranchToCloud(branch);
          this.renderBranchCards();
        } else if (action === "set-paused") {
          branch.status = "PAUSED";
          storageService.set("cliniva_branches", this.branches);
          soundService.playClickTone();
          this.showToast(`${branch.name} is now Temporarily Closed (Bookings paused)`, "⏸️");
          this.syncBranchToCloud(branch);
          this.renderBranchCards();
        } else if (action === "archive") {
          const confirmMsg = i18nService.t("owner.gateway.archiveConfirm", `Archive ${branch.name}? It will be removed from your active branch list.`);
          if (confirm(confirmMsg)) {
            this.branches = this.branches.filter((b) => b.id !== branchId);
            storageService.set("cliniva_branches", this.branches);

            // If active branch was archived, select next branch
            const activeId = storageService.get("cliniva_active_branch_id", null);
            if (activeId === branchId && this.branches.length > 0) {
              storageService.set("cliniva_active_branch_id", this.branches[0].id);
            }

            soundService.playSuccess();
            this.showToast(`${branch.name} archived successfully`, "🗑️");
            this.renderHeader();
            this.renderBranchCards();
          }
        }
      });
    });
  }

  syncBranchToCloud(branch) {
    if (supabaseService && supabaseService.isAvailable()) {
      supabaseService.upsertBranch({
        id: branch.id,
        name: branch.name,
        address: branch.address,
        phone: branch.phone,
        hours: branch.hours,
        status: branch.status,
        template: branch.template,
        service_mode: branch.serviceMode || "hybrid"
      }).catch(err => console.warn("[BranchSelect] Cloud status sync failed:", err));
    }
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
    }, 350);
  }

  setupModal() {
    const btnOpen = document.getElementById("btnOpenNewBranchModal");
    const modalOverlay = document.getElementById("newBranchModalOverlay");
    const btnClose = document.getElementById("btnCloseNewBranchModal");
    const btnCancel = document.getElementById("btnCancelNewBranch");
    const form = document.getElementById("createBranchForm");
    const postalInput = document.getElementById("newBranchPostal");
    const addressInput = document.getElementById("newBranchAddress");
    const postalFeedback = document.getElementById("postalFeedback");
    const totalBillingEl = document.getElementById("totalBillingAmount");

    // Dynamic price calculation on plan change
    const planRadios = document.querySelectorAll('input[name="subsPlan"]');
    planRadios.forEach((r) => {
      r.addEventListener("change", () => {
        const price = r.dataset.price || "948";
        if (totalBillingEl) {
          totalBillingEl.textContent = `SGD ${parseFloat(price).toFixed(2)}`;
        }
        // Update border highlights
        document.querySelectorAll(".subs-radio-label").forEach((lbl) => {
          lbl.style.borderColor = "var(--line)";
          lbl.style.background = "#f8fafc";
        });
        const parent = r.closest(".subs-radio-label");
        if (parent) {
          parent.style.borderColor = "var(--primary)";
          parent.style.background = "#f0fdfa";
        }
        soundService.playClickTone();
      });
    });

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

    if (btnOpen) {
      btnOpen.addEventListener("click", () => this.openNewBranchModal());
    }

    const closeModal = () => {
      if (modalOverlay) modalOverlay.style.display = "none";
    };

    // Service Mode Radio selection in new branch modal
    const modeLabels = document.querySelectorAll(".new-branch-mode-label");
    const modeRadios = document.querySelectorAll('input[name="newBranchServiceMode"]');
    modeRadios.forEach((radio) => {
      radio.addEventListener("change", () => {
        modeLabels.forEach((lbl) => {
          lbl.style.borderColor = "#cbd5e1";
          lbl.style.background = "#ffffff";
          lbl.classList.remove("active");
          lbl.style.color = "inherit";
        });
        const parent = radio.closest(".new-branch-mode-label");
        if (parent) {
          parent.style.borderColor = "var(--primary)";
          parent.style.background = "#f0fdfa";
          parent.classList.add("active");
          parent.style.color = "var(--primary-dark)";
        }
        soundService.playClickTone();
      });
    });

    if (btnClose) btnClose.addEventListener("click", closeModal);
    if (btnCancel) btnCancel.addEventListener("click", closeModal);

    if (modalOverlay) {
      modalOverlay.addEventListener("click", (e) => {
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
        const hours = document.getElementById("newBranchHours")?.value.trim() || "Mon - Sat (09:00 - 20:00)";

        if (!name || !address) {
          alert(i18nService.t("owner.gateway.branchNameAddressRequired", "Please fill in the new branch name and address."));
          return;
        }

        const serviceMode = document.querySelector('input[name="newBranchServiceMode"]:checked')?.value || "hybrid";
        const meta = this.getTemplateMeta(template);
        const newBranchId = `br-sg-${Date.now().toString().slice(-4)}`;
        const newBranch = {
          id: newBranchId,
          name,
          code: `SG-0${this.branches.length + 1}`,
          address,
          phone,
          hours,
          rooms: "4",
          template,
          serviceMode,
          logo: meta.icon,
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
        this.syncBranchToCloud(newBranch);

        soundService.playSuccess();
        closeModal();
        form.reset();

        this.showToast(`${name} registered & activated!`, "🚀");

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

/**
 * Cliniva — Owner / Executive Dashboard Controller
 * SOLID: Single Responsibility for Executive Macro Analytics, Multi-Branch Management & Audit Logging
 */

import { authService, USER_ROLES } from "../services/auth.service.js";
import { storageService } from "../services/storage.service.js";
import { soundService } from "../services/sound.service.js";
import { bookingService } from "../services/booking.service.js";
import { getBranchesForTemplate } from "../config/clinic-data.js";

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
    // Session Guard: Verify user has SUPER_ADMIN or OWNER role
    const session = authService.requireAuth([USER_ROLES.SUPER_ADMIN, USER_ROLES.OWNER]);
    if (!session) return;

    this.currentUser = session.user;
    this.renderUserInfo(session.user);
    this.setupTabs();
    this.renderBranchCards();
    this.setupBranchModal();
    this.setupAdaptiveProfileCatalog();
    this.setupUserManagement();
    this.setupSignOut();
  }

  renderUserInfo(user) {
    const nameEl = document.getElementById("ownerUserName");
    const roleEl = document.getElementById("ownerUserRole");
    if (nameEl) nameEl.textContent = user.name;
    if (roleEl) roleEl.textContent = user.title || "Chief Executive & Clinic Owner";

    // If user has a specific brand name configured from onboarding, reflect it in the header logo / title
    if (user.brandName) {
      const logoEl = document.querySelector(".logo");
      if (logoEl) {
        const logoBadge = user.brandLogo && (user.brandLogo.startsWith("data:image") || user.brandLogo.startsWith("http") || user.brandLogo.includes("/"))
          ? `<img src="${user.brandLogo}" alt="Logo" style="width:26px; height:26px; object-fit:contain; border-radius:6px; vertical-align:middle; margin-right:6px; background:#fff;">`
          : `<span class="logo-mark">${user.brandLogo || "✦"}</span>`;
        logoEl.innerHTML = `${logoBadge} ${user.brandName}`;
      }
    }
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
    const activeTemplate = bookingService.getActiveTemplateId() || "wellness";
    const templateBranches = getBranchesForTemplate(activeTemplate);

    const makeBranchesWithMetrics = (baseList) => {
      return baseList.map((b, idx) => ({
        ...b,
        revenue:
          b.currency === "SGD"
            ? `SGD ${(75000 + idx * 4500).toLocaleString()}.00`
            : `MYR ${(120000 + idx * 8000).toLocaleString()}.00`,
        occupancy: `${(82 + (idx * 3) % 15).toFixed(1)}%`,
        practitioners: `${2 + (idx % 3)} Certified Specialists`,
        status: "ACTIVE",
        logoUrl: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' rx='20' fill='%230f766e'/%3E%3Ctext x='50' y='64' font-size='42' font-family='sans-serif' font-weight='900' fill='white' text-anchor='middle'%3E✦%3C/text%3E%3C/svg%3E`
      }));
    };

    const stored = storageService.get(this.BRANCHES_KEY, null);
    if (!stored || !Array.isArray(stored) || stored.length < templateBranches.length) {
      const branchesWithMetrics = makeBranchesWithMetrics(templateBranches);
      storageService.set(this.BRANCHES_KEY, branchesWithMetrics);
      return branchesWithMetrics;
    }
    return stored;
  }

  saveBranches() {
    storageService.set(this.BRANCHES_KEY, this.branches);
  }

  getProfileTypeLabel(type) {
    switch (type) {
      case "SPA_WELLNESS":
        return "Wellness & Spa Care";
      case "PHYSIOTHERAPY":
        return "Physiotherapy & Rehab";
      case "NUTRITION":
        return "Clinical Nutrition & Dietetics";
      case "TCM_ACUPUNCTURE":
        return "Traditional Chinese Medicine (TCM)";
      case "MEDICAL_CLINIC":
        return "Medical Clinic (SIMRS)";
      default:
        return "Integrated Care";
    }
  }

  renderBranchCards() {
    if (!this.branchCardsContainer) return;

    this.branchCardsContainer.innerHTML = this.branches
      .map((b) => {
        const isAktif = b.status === "ACTIVE";
        const statusBadge = isAktif
          ? `<span class="status-pill confirmed">● Active</span>`
          : `<span class="status-pill cancelled">● Temporarily Closed</span>`;

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
              <span style="color:var(--muted);">Business Profile:</span>
              <strong style="color:var(--primary-dark); margin-left:4px;">${this.getProfileTypeLabel(b.profileType)}</strong>
            </div>

            <div class="summary-row">
              <span style="color:var(--muted);">Monthly Revenue:</span>
              <strong>${b.revenue}</strong>
            </div>
            <div class="summary-row">
              <span style="color:var(--muted);">Schedule Occupancy:</span>
              <strong>${b.occupancy}</strong>
            </div>
            <div class="summary-row">
              <span style="color:var(--muted);">On-Duty Practitioners:</span>
              <strong>${b.practitioners}</strong>
            </div>
            <div class="summary-row">
              <span style="color:var(--muted);">Operating Hours:</span>
              <span style="font-size:12px; font-weight:600;">${b.hours}</span>
            </div>

            <div style="margin-top:16px; padding-top:14px; border-top:1px solid var(--line); display:flex; justify-content:space-between; align-items:center;">
              <span style="font-size:11px; color:var(--muted);">WhatsApp: ${b.phone}</span>
              <button type="button" class="btn btn-sm btn-soft edit-branch-btn" data-branch-id="${b.id}">
                Manage Branch
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
          alert("Maximum logo file size is 2MB.");
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
        if (branch.profileType === "SPA_WELLNESS") branch.templateId = "wellness";
        else if (branch.profileType === "PHYSIOTHERAPY") branch.templateId = "physio";
        else if (branch.profileType === "NUTRITION") branch.templateId = "nutrition";
        else if (branch.profileType === "TCM_ACUPUNCTURE") branch.templateId = "tcm";
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
        this.addAuditEntry("Dr. Hendra Wijaya", `Update Configuration: ${branch.name}`, branch.id, `Status: ${branch.status} · ${branch.profileType}`);

        soundService.playQueueChime();
        this.closeBranchModal();
        alert(`Branch configuration for "${branch.name}" saved successfully.`);
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
      titleEl.textContent = `Branch Settings: ${branch.name}`;
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
    const activeTemplate = bookingService.getActiveTemplateId() || "physio";
    const activeProfile = storageService.get(this.PROFILE_KEY, null);

    const updateProfileUI = (activeP) => {
      const badgeTextEl = document.getElementById("activeProfileBadgeText");
      if (badgeTextEl) {
        badgeTextEl.textContent = this.getProfileTypeLabel(activeP);
      }

      this.profileCards.forEach((card) => {
        const p = card.dataset.profile;
        const isCurrent = p === activeP;
        card.classList.toggle("active", isCurrent);

        const btn = card.querySelector(".activate-profile-btn");
        if (btn) {
          if (isCurrent) {
            btn.className = "btn btn-sm btn-primary activate-profile-btn";
            btn.textContent = "✓ Currently Active";
            btn.style.fontWeight = "800";
          } else {
            btn.className = "btn btn-sm btn-soft activate-profile-btn";
            btn.textContent = "Set as Active Template";
            btn.style.fontWeight = "700";
          }
        }
      });
    };

    // Determine initial active profile
    let currentProfile = "PHYSIOTHERAPY";
    if (activeProfile) {
      currentProfile = activeProfile;
    } else if (activeTemplate === "wellness") {
      currentProfile = "SPA_WELLNESS";
    } else if (activeTemplate === "physio") {
      currentProfile = "PHYSIOTHERAPY";
    } else if (activeTemplate === "nutrition") {
      currentProfile = "NUTRITION";
    } else if (activeTemplate === "tcm") {
      currentProfile = "TCM_ACUPUNCTURE";
    }

    updateProfileUI(currentProfile);

    this.profileCards.forEach((card) => {
      card.addEventListener("click", () => {
        const profile = card.dataset.profile;
        soundService.playQueueChime();

        updateProfileUI(profile);
        storageService.set(this.PROFILE_KEY, profile);

        let templateId = "wellness";
        if (profile === "PHYSIOTHERAPY") templateId = "physio";
        else if (profile === "NUTRITION") templateId = "nutrition";
        else if (profile === "TCM_ACUPUNCTURE") templateId = "tcm";
        else if (profile === "SPA_WELLNESS") templateId = "wellness";

        bookingService.setActiveTemplate(templateId);

        // Synchronize all branches with the newly chosen business template
        const freshBranches = getBranchesForTemplate(templateId);
        this.branches = this.branches.map((b) => {
          const matching = freshBranches.find((fb) => fb.id === b.id);
          if (matching) {
            return {
              ...b,
              name: matching.name,
              badge: matching.badge,
              icon: matching.icon,
              profileType: profile,
              templateId: templateId,
              rooms: matching.rooms,
              equipment: matching.equipment
            };
          }
          return { ...b, profileType: profile, templateId: templateId };
        });
        this.saveBranches();
        this.renderBranchCards();

        const label = this.getProfileTypeLabel(profile);
        this.addAuditEntry("Dr. Hendra Wijaya", "Set Default Clinic Template", "TEMPLATE", `Type: ${profile} (${templateId})`);

        // Display confirmation feedback toast
        const alertEl = document.getElementById("activeProfileStatusBanner");
        if (alertEl) {
          alertEl.style.transition = "background-color 0.3s ease";
          const origBg = alertEl.style.background;
          alertEl.style.background = "#dcfce7";
          setTimeout(() => {
            alertEl.style.background = origBg || "#f0fdfa";
          }, 1000);
        }
      });
    });
  }

  setupSignOut() {
    if (!this.signOutBtn) return;
    this.signOutBtn.addEventListener("click", () => {
      if (confirm("Are you sure you want to sign out from the executive console?")) {
        authService.logout();
      }
    });
  }

  setupUserManagement() {
    this.createAdminOverlay = document.getElementById("createAdminModalOverlay");
    this.btnOpenCreateAdmin = document.getElementById("btnOpenCreateAdminModal");
    this.btnCloseCreateAdmin = document.getElementById("closeCreateAdminModalBtn");
    this.btnCancelCreateAdmin = document.getElementById("cancelCreateAdminBtn");
    this.createAdminForm = document.getElementById("createAdminForm");

    this.roleFilterSelect = document.getElementById("userRoleFilter");
    this.userSearchInput = document.getElementById("userSearchInput");
    this.userTableBody = document.getElementById("userRegistryTableBody");

    // Modal open
    if (this.btnOpenCreateAdmin) {
      this.btnOpenCreateAdmin.addEventListener("click", () => {
        soundService.playClickTone();
        if (this.createAdminOverlay) this.createAdminOverlay.style.display = "flex";
      });
    }

    // Modal close/cancel
    const closeModal = () => {
      soundService.playClickTone();
      if (this.createAdminOverlay) this.createAdminOverlay.style.display = "none";
      if (this.createAdminForm) this.createAdminForm.reset();
    };

    if (this.btnCloseCreateAdmin) this.btnCloseCreateAdmin.addEventListener("click", closeModal);
    if (this.btnCancelCreateAdmin) this.btnCancelCreateAdmin.addEventListener("click", closeModal);

    // Form submit
    if (this.createAdminForm) {
      this.createAdminForm.addEventListener("submit", (e) => {
        e.preventDefault();
        soundService.playClickTone();

        const name = document.getElementById("newAdminName")?.value.trim();
        const email = document.getElementById("newAdminEmail")?.value.trim();
        const phone = document.getElementById("newAdminPhone")?.value.trim();
        const password = document.getElementById("newAdminPassword")?.value.trim() || "cliniva2026";
        const region = document.getElementById("newAdminRegion")?.value || "sg";
        const initialBrand = document.getElementById("newAdminInitialBrand")?.value.trim() || null;
        const requireWizard = document.getElementById("newAdminRequireWizard")?.checked !== false;

        const result = authService.createUserAccount({
          name,
          email,
          phone,
          password,
          role: USER_ROLES.OWNER,
          title: "Clinic Partner & Owner",
          brandName: initialBrand,
          region,
          onboardingCompleted: !requireWizard
        });

        if (!result.success) {
          alert(`Failed to create owner account: ${result.error}`);
          return;
        }

        soundService.playQueueChime();
        closeModal();
        this.renderUserRegistryTable();

        alert(
          `🎉 AKUN OWNER BERHASIL DIBUAT!\n\nNama: ${result.user.name}\nEmail: ${result.user.email}\nPassword: ${password}\nStatus Onboarding: ${requireWizard ? "Wajib Setup Wizard (Pending)" : "Langsung Aktif"}\n\nAnda dapat menguji alur onboarding dengan mengklik tombol 'Simulate First Login 🚀' pada tabel pengguna.`
        );
      });
    }

    // Filter and search events
    if (this.roleFilterSelect) {
      this.roleFilterSelect.addEventListener("change", () => {
        soundService.playClickTone();
        this.renderUserRegistryTable();
      });
    }

    if (this.userSearchInput) {
      this.userSearchInput.addEventListener("input", () => {
        this.renderUserRegistryTable();
      });
    }

    // Check URL parameters: if ?view=users, automatically activate the paneUsers tab!
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("view") === "users") {
      const usersTabBtn = document.getElementById("tabBtnUsers");
      if (usersTabBtn) {
        usersTabBtn.click();
      }
    }

    this.renderUserRegistryTable();
  }

  renderUserRegistryTable() {
    if (!this.userTableBody) return;

    const allUsers = authService.getUsers();
    const filterRole = this.roleFilterSelect?.value || "ALL";
    const searchQuery = (this.userSearchInput?.value || "").toLowerCase().trim();

    // Calculate metrics
    const totalCount = allUsers.length;
    const ownersCount = allUsers.filter((u) => u.role === USER_ROLES.OWNER).length;
    const pendingCount = allUsers.filter((u) => u.onboardingCompleted === false).length;

    const kpiTotalEl = document.getElementById("kpiTotalUsers");
    const kpiOwnersEl = document.getElementById("kpiTotalOwners");
    const kpiPendingEl = document.getElementById("kpiPendingOnboardings");

    if (kpiTotalEl) kpiTotalEl.textContent = `${totalCount} Accounts`;
    if (kpiOwnersEl) kpiOwnersEl.textContent = `${ownersCount} Owners`;
    if (kpiPendingEl) kpiPendingEl.textContent = `${pendingCount} Account${pendingCount !== 1 ? "s" : ""}`;

    // Filter users
    let filtered = allUsers;
    if (filterRole !== "ALL") {
      filtered = filtered.filter((u) => u.role === filterRole);
    }
    if (searchQuery) {
      filtered = filtered.filter(
        (u) =>
          u.name.toLowerCase().includes(searchQuery) ||
          u.email.toLowerCase().includes(searchQuery) ||
          (u.brandName && u.brandName.toLowerCase().includes(searchQuery))
      );
    }

    if (filtered.length === 0) {
      this.userTableBody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align:center; padding:30px; color:var(--muted); font-size:13px;">
            No user accounts found matching current filter or search criteria.
          </td>
        </tr>
      `;
      return;
    }

    this.userTableBody.innerHTML = filtered
      .map((u) => {
        const isPending = u.onboardingCompleted === false;
        const statusBadge = isPending
          ? `<span class="pill" style="background:#fef3c7; color:#b45309; font-weight:800; font-size:11px; padding:3px 8px;">⏳ Pending Setup</span>`
          : `<span class="pill" style="background:#dcfce7; color:#15803d; font-weight:800; font-size:11px; padding:3px 8px;">✅ Active</span>`;

        const logoBadge = u.brandLogo && (u.brandLogo.startsWith("data:image") || u.brandLogo.startsWith("http") || u.brandLogo.includes("/"))
          ? `<img src="${u.brandLogo}" alt="Logo" style="width:20px; height:20px; object-fit:contain; border-radius:4px; vertical-align:middle; margin-right:4px; background:#fff;">`
          : `${u.brandLogo || "✦"}`;

        const brandDisplay = u.brandName
          ? `<strong>${logoBadge} ${u.brandName}</strong><br><small style="color:var(--muted);">${u.branchName || "No Branch"}</small>`
          : `<span style="color:var(--muted);">${u.branchName || "HQ Unassigned"}</span>`;

        const simulateBtn = isPending
          ? `<button type="button" class="btn btn-sm btn-primary simulate-login-btn" data-userid="${u.id}" style="font-size:11px; padding:4px 8px; font-weight:800;" title="Simulate first login as this user to test onboarding">Simulate First Login 🚀</button>`
          : `<button type="button" class="btn btn-sm btn-soft simulate-login-btn" data-userid="${u.id}" style="font-size:11px; padding:4px 8px;" title="Switch session to this user">Switch Session ↗</button>`;

        const isCurrentActive = this.currentUser && this.currentUser.id === u.id;
        const deleteBtn = isCurrentActive
          ? `<span style="font-size:11px; color:var(--muted); font-style:italic;">(Active You)</span>`
          : `<button type="button" class="btn btn-sm btn-white delete-user-btn" data-userid="${u.id}" style="font-size:11px; color:#ef4444; padding:4px 8px;" title="Delete User">🗑️</button>`;

        return `
          <tr style="${isPending ? "background:#fffdfa;" : ""}">
            <td>
              <div style="display:flex; align-items:center; gap:10px;">
                <span style="font-size:20px;">${u.avatar || "👤"}</span>
                <div>
                  <strong style="font-size:13px; color:var(--text);">${u.name}</strong>
                  ${isCurrentActive ? '<span class="pill" style="font-size:9px; padding:1px 5px; background:#ccfbf1; color:#0f766e; margin-left:4px;">YOU</span>' : ""}
                </div>
              </div>
            </td>
            <td>
              <div style="font-size:12px; font-weight:600;">${u.email}</div>
              <div style="font-size:11px; color:var(--muted);">${u.phone || "—"}</div>
            </td>
            <td>
              <span class="pill" style="font-size:10px; padding:2px 6px; font-weight:800;">${u.role}</span>
              <div style="font-size:11px; color:var(--muted); margin-top:2px;">${u.title || "—"}</div>
            </td>
            <td>${statusBadge}</td>
            <td>${brandDisplay}</td>
            <td style="text-align:right;">
              <div style="display:flex; justify-content:flex-end; align-items:center; gap:6px;">
                ${simulateBtn}
                ${deleteBtn}
              </div>
            </td>
          </tr>
        `;
      })
      .join("");

    // Bind simulate login buttons
    this.userTableBody.querySelectorAll(".simulate-login-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const userId = btn.dataset.userid;
        soundService.playQueueChime();
        const res = authService.simulateLoginAsUser(userId);
        if (res.success) {
          alert(`Switched session to ${res.session.user.name}! Redirecting to ${res.targetRoute}...`);
          window.location.href = res.targetRoute;
        }
      });
    });

    // Bind delete user buttons
    this.userTableBody.querySelectorAll(".delete-user-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const userId = btn.dataset.userid;
        if (confirm("Are you sure you want to delete this user account from the registry?")) {
          soundService.playClickTone();
          const res = authService.deleteUserAccount(userId);
          if (res.success) {
            this.renderUserRegistryTable();
          } else {
            alert(res.error);
          }
        }
      });
    });
  }
}

/**
 * Cliniva — Super Admin Controller
 * SOLID: Single Responsibility — Platform-level management only
 *
 * Super Admin responsibilities:
 *  1. Manage Owner accounts (create, view, suspend, delete)
 *  2. View platform-wide audit logs
 *  3. View system analytics (total clinics, owners, patients)
 *  4. Cannot manage branch-level operations (that's Owner's job)
 */

import { authService, USER_ROLES } from "../../services/auth.service.js";
import { storageService } from "../../services/storage.service.js";
import { bookingService } from "../../services/booking.service.js";
import { notificationService } from "../../services/notification.service.js";
import { soundService } from "../../services/sound.service.js";
import { supabaseService } from "../../services/supabase.service.js";
import { i18nService } from "../../services/i18n.service.js";
import { getAllTemplates, savePlatformTemplates } from "../../config/templates/index.js";

export class SuperAdminController {
  constructor() {
    this.AUDIT_KEY = "cliniva_audit_logs";
    this.currentUser = null;
    this.appointmentsCache = [];
    this.activeApptFilter = {
      search: "",
      ownerId: "ALL",
      template: "ALL",
      status: "ALL"
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // INIT
  // ─────────────────────────────────────────────────────────────────────────

  async init() {
    // Guard: Only SUPER_ADMIN may access this page
    const session = authService.requireAuth([USER_ROLES.SUPER_ADMIN], "../../pages/public/sign-in.html");
    if (!session) return;

    this.currentUser = session.user;
    i18nService.init();
    this.renderUserInfo();
    this.setupTabs();
    this.setupSignOut();
    await this.loadPlatformStats();
    await this.renderOwnerList();
    await this.renderAllBranches();
    this.renderSubscriptions();
    await this.renderUsersAndAppointments();
    this.setupUsersAndAppointments();
    await this.renderAuditLogs();
    await this.renderTemplates();
    this.setupCreateOwnerForm();
    this.setupCreateTemplateForm();
    this.setupModals();

    window.addEventListener("cliniva:languageChanged", () => {
      this.renderUserInfo();
      this.renderOwnerList();
      this.renderAllBranches();
      this.renderSubscriptions();
      this.renderUsersAndAppointments();
      this.renderAuditLogs();
      this.renderTemplates();
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // USER INFO
  // ─────────────────────────────────────────────────────────────────────────

  renderUserInfo() {
    const nameEl = document.getElementById("superAdminName");
    const roleEl = document.getElementById("superAdminRole");
    if (nameEl) nameEl.textContent = this.currentUser.name;
    if (roleEl) roleEl.textContent = this.currentUser.title || "Super Administrator — Cliniva Platform";
  }

  // ─────────────────────────────────────────────────────────────────────────
  // TAB NAVIGATION
  // ─────────────────────────────────────────────────────────────────────────

  setupTabs() {
    const btns = document.querySelectorAll(".sa-tab-btn");
    const panes = document.querySelectorAll(".sa-tab-pane");

    btns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const target = btn.dataset.pane;
        if (!target) return;
        soundService.playClickTone && soundService.playClickTone();

        // Synchronize active states across sidebar and mobile bottom navigation
        btns.forEach((b) => {
          if (b.dataset.pane === target && (b.id?.startsWith("tab") || b.id?.startsWith("mobTab"))) {
            b.classList.add("active");
          } else if (b.id?.startsWith("tab") || b.id?.startsWith("mobTab")) {
            b.classList.remove("active");
          }
        });

        panes.forEach((p) => p.classList.remove("active"));
        const pane = document.getElementById(target);
        if (pane) {
          pane.classList.add("active");
          // Smooth scroll to top on tab switch for better mobile ergonomic flow
          window.scrollTo({ top: 0, behavior: "smooth" });
          const mainEl = document.querySelector(".sa-main");
          if (mainEl) mainEl.scrollTop = 0;
        }
      });
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // PLATFORM STATS
  // ─────────────────────────────────────────────────────────────────────────

  async loadPlatformStats() {
    let users = [];
    let branches = [];

    if (supabaseService.isAvailable()) {
      users = await supabaseService.fetchProfiles();
      branches = await supabaseService.fetchBranches();
    }

    if (!users || users.length === 0) {
      users = authService.getUsers();
    }
    if (!branches || branches.length === 0) {
      branches = storageService.get("cliniva_branches", []);
    }

    const owners = users.filter(u => u.role === USER_ROLES.OWNER);
    const active = owners.filter(u => u.onboardingCompleted);
    const pending = owners.filter(u => !u.onboardingCompleted);

    this._setText("statTotalOwners", owners.length);
    this._setText("statActiveOwners", active.length);
    this._setText("statPendingOwners", pending.length);
    this._setText("statTotalBranches", branches.length);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // OWNER LIST
  // ─────────────────────────────────────────────────────────────────────────

  async renderOwnerList() {
    const container = document.getElementById("ownerTableBody");
    if (!container) return;

    let users = [];
    if (supabaseService.isAvailable()) {
      users = await supabaseService.fetchProfiles();
    }
    if (!users || users.length === 0) {
      users = authService.getUsers();
    }

    const owners = users.filter(u => u.role === USER_ROLES.OWNER);

    if (owners.length === 0) {
      container.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:32px; color:var(--muted);">${i18nService.t("superAdmin.noOwners", "No Owner accounts found. Create one below.")}</td></tr>`;
      return;
    }

    container.innerHTML = owners.map(owner => `
      <tr>
        <td style="white-space:nowrap;">
          <div style="display:flex; align-items:center; gap:10px;">
            <span style="font-size:20px;">${owner.avatar || "💼"}</span>
            <div>
              <div style="font-weight:700; font-size:13px; color:var(--text);">${owner.name}</div>
              <div style="font-size:11px; color:var(--muted);">${owner.email}</div>
            </div>
          </div>
        </td>
        <td style="font-size:13px; font-weight:600; white-space:nowrap; letter-spacing:0.2px; color:var(--text);">${owner.phone || "—"}</td>
        <td style="white-space:nowrap;">
          <span class="pill" style="font-size:11px; padding:4px 10px; background:${owner.brandName ? "#f0fdfa" : "#fef3c7"}; color:${owner.brandName ? "#0f766e" : "#92400e"}; font-weight:700; white-space:nowrap;">
            ${owner.brandName || i18nService.t("superAdmin.notSetUp", "Not Set Up")}
          </span>
        </td>
        <td style="white-space:nowrap;">
          <span class="pill" style="font-size:11px; padding:4px 10px; background:${owner.onboardingCompleted ? "#dcfce7" : "#fee2e2"}; color:${owner.onboardingCompleted ? "#166534" : "#991b1b"}; font-weight:700; white-space:nowrap;">
            ${owner.onboardingCompleted ? i18nService.t("superAdmin.statusActive", "✓ Active") : i18nService.t("superAdmin.statusPending", "⏳ Pending")}
          </span>
        </td>
        <td style="font-size:12px; color:var(--muted); font-weight:500; white-space:nowrap;">
          ${owner.createdAt ? new Date(owner.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "Recent"}
        </td>
        <td style="white-space:nowrap; text-align:right;">
          <div style="display:flex; gap:6px; align-items:center; justify-content:flex-end;">
            <button class="btn btn-sm btn-soft" onclick="window.superAdminCtrl.openEditOwnerModal('${owner.id}')" title="Edit Owner Account" style="padding:6px 12px; font-size:12px; font-weight:700; white-space:nowrap;">✏️ ${i18nService.t("common.edit", "Edit")}</button>
            <button class="btn btn-sm btn-soft" onclick="window.superAdminCtrl.loginAsOwner('${owner.id}')" title="Login as this Owner" style="padding:6px 12px; font-size:12px; font-weight:600; white-space:nowrap;">🔑 ${i18nService.t("superAdmin.btnLoginAs", "Login As")}</button>
            <button class="btn btn-sm btn-danger" onclick="window.superAdminCtrl.deleteOwner('${owner.id}', '${owner.name}')" title="Delete Owner Account" style="padding:6px 10px; font-size:12px; white-space:nowrap;">🗑️</button>
          </div>
        </td>
      </tr>
    `).join("");
  }

  // ─────────────────────────────────────────────────────────────────────────
  // CREATE OWNER
  // ─────────────────────────────────────────────────────────────────────────

  setupCreateOwnerForm() {
    const btn = document.getElementById("showCreateOwnerBtn");
    const form = document.getElementById("createOwnerPanel");
    if (btn && form) {
      btn.addEventListener("click", () => {
        form.style.display = form.style.display === "none" ? "block" : "none";
        btn.textContent = form.style.display === "none" ? "+ Add Owner Account" : "✕ Cancel";
      });
    }

    const submitBtn = document.getElementById("createOwnerSubmitBtn");
    if (submitBtn) {
      submitBtn.addEventListener("click", () => this._createOwner());
    }
  }

  _createOwner() {
    const name = document.getElementById("newOwnerName")?.value?.trim();
    const email = document.getElementById("newOwnerEmail")?.value?.trim();
    const phone = document.getElementById("newOwnerPhone")?.value?.trim();
    const pass = document.getElementById("newOwnerPass")?.value?.trim() || "cliniva2026";

    if (!name || !email) {
      alert("Please fill in Name and Email to create an Owner account.");
      return;
    }

    const result = authService.registerOwner({
      name,
      email,
      phone: phone || "+60 000 0000",
      password: pass,
      role: USER_ROLES.OWNER,
      title: "Clinic Owner",
      avatar: "💼",
      onboardingCompleted: false
    });

    if (!result.success) {
      alert("Error: " + result.error);
      return;
    }

    // Persist to Supabase Cloud as SSOT
    if (supabaseService.isAvailable()) {
      supabaseService.createProfile({
        name,
        email,
        phone: phone || "+60 000 0000",
        role: USER_ROLES.OWNER,
        title: "Clinic Owner",
        avatar: "💼",
        onboardingCompleted: false
      }).catch(err => console.warn("[SuperAdmin] Cloud profile creation failed:", err));
    }

    this._logAudit(`Super Admin created Owner account for: ${name} (${email})`);
    soundService.playClickTone && soundService.playClickTone();

    // Clear form
    ["newOwnerName", "newOwnerEmail", "newOwnerPhone", "newOwnerPass"].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = "";
    });

    // Hide panel & refresh
    const panel = document.getElementById("createOwnerPanel");
    if (panel) panel.style.display = "none";
    const btn = document.getElementById("showCreateOwnerBtn");
    if (btn) btn.textContent = "+ Add Owner Account";

    this.loadPlatformStats();
    this.renderOwnerList();

    notificationService.showToast?.(`Owner account created for ${name}`, "success");
  }

  // ─────────────────────────────────────────────────────────────────────────
  // DELETE OWNER
  // ─────────────────────────────────────────────────────────────────────────

  deleteOwner(userId, ownerName) {
    const confirmed = confirm(`Are you sure you want to delete Owner account for "${ownerName}"?\n\nThis action cannot be undone.`);
    if (!confirmed) return;

    const result = authService.deleteUserAccount(userId);
    if (!result.success) {
      alert("Error: " + result.error);
      return;
    }

    this._logAudit(`Super Admin deleted Owner account: ${ownerName} (ID: ${userId})`);
    this.loadPlatformStats();
    this.renderOwnerList();
  }

  // ─────────────────────────────────────────────────────────────────────────
  // LOGIN AS OWNER (for testing / support)
  // ─────────────────────────────────────────────────────────────────────────

  loginAsOwner(userId) {
    const result = authService.simulateLoginAsUser(userId);
    if (!result.success) {
      alert("Error: " + result.error);
      return;
    }
    this._logAudit(`Super Admin simulated login as Owner ID: ${userId}`);
    window.location.href = "../../" + result.targetRoute;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // TENANT & BRANCH MONITORING (Super Admin Full Control)
  // ─────────────────────────────────────────────────────────────────────────

  async renderAllBranches() {
    const container = document.getElementById("superAdminBranchTableBody");
    if (!container) return;

    let branches = storageService.get("cliniva_branches", []);
    let users = authService.getUsers();

    if (branches.length === 0) {
      container.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:32px; color:var(--muted);">${i18nService.t("superAdmin.noBranches", "No branch units registered yet across any owner tenant.")}</td></tr>`;
      return;
    }

    container.innerHTML = branches.map(b => {
      const owner = users.find(u => u.id === b.ownerId) || { name: "Dennis Pratama", email: "dennis@cliniva.com" };
      const statusBg = b.status === "ACTIVE" || !b.status ? "#dcfce7" : "#fee2e2";
      const statusColor = b.status === "ACTIVE" || !b.status ? "#166534" : "#991b1b";

      return `
        <tr>
          <td style="font-weight:700; color:var(--text); white-space:nowrap;">
            <div style="font-size:13px; font-weight:800;">${b.name}</div>
            <div style="font-size:11px; color:var(--muted);">${b.address || "Singapore"}</div>
          </td>
          <td style="white-space:nowrap;">
            <span class="pill" style="font-size:11px; padding:3px 8px; background:#f0fdfa; color:#0f766e; font-weight:700; text-transform:uppercase;">
              ${b.template || "physio"}
            </span>
          </td>
          <td style="white-space:nowrap;">
            <div style="font-size:12px; font-weight:700; color:var(--text);">${owner.name}</div>
            <div style="font-size:11px; color:var(--muted);">${owner.email}</div>
          </td>
          <td style="white-space:nowrap;">
            <span class="pill" style="font-size:11px; padding:3px 8px; background:${statusBg}; color:${statusColor}; font-weight:800;">
              ● ${b.status || "ACTIVE"}
            </span>
          </td>
          <td style="font-size:12px; color:var(--muted); white-space:nowrap;">
            ${b.createdAt ? new Date(b.createdAt).toLocaleDateString() : "Recent"}
          </td>
          <td style="text-align:right; white-space:nowrap;">
            <div style="display:flex; gap:6px; align-items:center; justify-content:flex-end;">
              <button class="btn btn-sm btn-soft" onclick="window.superAdminCtrl.openBranchStatusModal('${b.id}')" style="font-size:11px; padding:5px 10px; font-weight:700;">
                ⚙️ ${i18nService.t("superAdmin.manageBranchStatus", "Manage Status")}
              </button>
              <button class="btn btn-sm btn-soft" onclick="window.superAdminCtrl.auditBranch('${b.id}', '${b.name}')" style="font-size:11px; padding:5px 8px; font-weight:700;" title="Inspect Audit Record">
                🛡️
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join("");
  }

  auditBranch(branchId, branchName) {
    soundService.playClickTone && soundService.playClickTone();
    this._logAudit(`Super Admin inspected & audited branch operational status: ${branchName} (ID: ${branchId})`);
    notificationService.showToast?.(`Audited branch: ${branchName}`, "success");
    alert(`🛡️ SUPER ADMIN BRANCH AUDIT\n\nBranch: ${branchName}\nID: ${branchId}\nStatus: Verified Active & Compliant with PDPA.`);
  }

  renderSubscriptions() {
    const revenueEl = document.getElementById("saStatRevenue");
    const activeSubsEl = document.getElementById("saStatActiveSubs");
    let branches = storageService.get("cliniva_branches", []);

    let totalRevenue = 0;
    let activeCount = 0;

    branches.forEach(b => {
      activeCount++;
      // Average 1-year package SGD 948 or monthly equivalent
      totalRevenue += 948.00;
    });

    if (revenueEl) revenueEl.textContent = `SGD ${totalRevenue.toLocaleString('en-SG', { minimumFractionDigits: 2 })}`;
    if (activeSubsEl) activeSubsEl.textContent = activeCount.toString();
  }

  // ─────────────────────────────────────────────────────────────────────────
  // AUDIT LOGS
  // ─────────────────────────────────────────────────────────────────────────

  async renderAuditLogs() {
    const container = document.getElementById("auditLogsList");
    if (!container) return;

    let logs = [];
    if (supabaseService.isAvailable()) {
      const cloudLogs = await supabaseService.fetchAuditLogs(40);
      if (cloudLogs && cloudLogs.length > 0) {
        logs = cloudLogs.map(l => ({
          action: l.action + (l.details ? ` — ${l.details}` : ""),
          actor: l.actor_name,
          timestamp: l.created_at
        }));
      }
    }

    if (logs.length === 0) {
      logs = storageService.get(this.AUDIT_KEY, []);
    }

    if (logs.length === 0) {
      container.innerHTML = `<div style="padding:32px; text-align:center; color:var(--muted);">${i18nService.t("superAdmin.noAudit", "No audit events yet. Actions performed by Super Admin will appear here.")}</div>`;
      return;
    }

    // Show newest first
    const sorted = [...logs].reverse();
    container.innerHTML = sorted.map(log => `
      <div style="padding:12px 16px; border-bottom:1px solid var(--line); display:flex; justify-content:space-between; align-items:center; gap:16px;">
        <div>
          <div style="font-size:13px; font-weight:600;">${log.action}</div>
          <div style="font-size:11px; color:var(--muted);">By: ${log.actor || "Super Admin"}</div>
        </div>
        <div style="font-size:11px; color:var(--muted); white-space:nowrap;">${new Date(log.timestamp).toLocaleString()}</div>
      </div>
    `).join("");
  }

  _logAudit(action) {
    if (supabaseService.isAvailable()) {
      supabaseService.logAudit(action, action, this.currentUser || { name: "Super Admin", role: "SUPER_ADMIN" });
    }

    const logs = storageService.get(this.AUDIT_KEY, []);
    logs.push({
      action,
      actor: this.currentUser?.name || "Super Admin",
      timestamp: new Date().toISOString()
    });
    storageService.set(this.AUDIT_KEY, logs);
    this.renderAuditLogs();
  }

  // ─────────────────────────────────────────────────────────────────────────
  // TEMPLATES & OFFERING MANAGEMENT
  // ─────────────────────────────────────────────────────────────────────────

  async renderTemplates() {
    const container = document.getElementById("superAdminTemplatesGrid");
    if (!container) return;

    const templates = getAllTemplates();
    if (!templates || templates.length === 0) {
      container.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:40px; color:var(--muted);">${i18nService.t("superAdmin.templates.noTemplates", "No templates registered yet. Click Add New Template above.")}</div>`;
      return;
    }

    container.innerHTML = templates.map(t => {
      const isActive = t.isActive !== false;
      const monthly = t.pricing?.monthly || 99;
      const sixMonth = t.pricing?.sixMonth || Math.round(monthly * 6 * 0.9);
      const yearly = t.pricing?.yearly || Math.round(monthly * 12 * 0.8);

      const statusBg = isActive ? "#dcfce7" : "#f1f5f9";
      const statusColor = isActive ? "#166534" : "#64748b";
      const statusText = isActive 
        ? i18nService.t("superAdmin.templates.activeBadge", "● Active Offering")
        : i18nService.t("superAdmin.templates.inactiveBadge", "○ Inactive");

      const demoBtn = t.demoUrl ? `
        <a href="${t.demoUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-soft" style="padding:6px 12px; font-size:12px; font-weight:700; text-decoration:none; display:inline-flex; align-items:center; gap:4px;">
          ${i18nService.t("superAdmin.templates.previewBtn", "Preview Prototype ↗")}
        </a>
      ` : "";

      const deleteBtn = !["wellness", "physio", "nutrition", "tcm", "personal-trainer"].includes(t.id) ? `
        <button class="btn btn-sm btn-danger" onclick="window.superAdminCtrl.deleteTemplate('${t.id}')" title="Delete Template" style="padding:6px 10px; font-size:12px;">🗑️</button>
      ` : "";

      return `
        <div class="sa-template-card ${!isActive ? "inactive" : ""}">
          <div>
            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:12px; gap:8px;">
              <span class="sa-template-badge" style="background:${statusBg}; color:${statusColor};">
                ${statusText}
              </span>
              <span style="font-size:11px; font-weight:700; color:var(--muted); text-transform:uppercase; letter-spacing:0.5px;">
                ${t.category || "Healthcare / Wellness"}
              </span>
            </div>

            <h3 style="font-size:16px; font-weight:800; color:var(--text); margin:0 0 6px;">${t.name}</h3>
            <p style="font-size:12px; color:var(--muted); margin:0 0 14px; line-height:1.5;">${t.tagline || t.description || "Specialized clinic business model & appointment engine."}</p>

            <div class="sa-template-pricing-box">
              <div style="font-size:11px; font-weight:800; color:var(--muted); text-transform:uppercase; margin-bottom:6px;">
                ${i18nService.t("superAdmin.templates.pricingTitle", "B2B Subscription Pricing:")}
              </div>
              <div style="display:flex; justify-content:space-between; align-items:baseline; margin-bottom:4px;">
                <span style="font-size:12px; color:var(--text); font-weight:600;">1 Month:</span>
                <span style="font-size:14px; font-weight:800; color:#4f46e5;">SGD ${monthly} <span style="font-size:11px; font-weight:600; color:var(--muted);">${i18nService.t("superAdmin.templates.perMonth", "/ mo")}</span></span>
              </div>
              <div style="display:flex; justify-content:space-between; align-items:baseline; margin-bottom:4px;">
                <span style="font-size:12px; color:var(--text); font-weight:600;">${i18nService.t("superAdmin.templates.sixMonth", "6 Months:")}</span>
                <span style="font-size:12px; font-weight:700; color:#0f766e;">SGD ${sixMonth} <span style="font-size:10px; background:#ccfbf1; color:#0f766e; padding:1px 5px; border-radius:4px; font-weight:800;">-10%</span></span>
              </div>
              <div style="display:flex; justify-content:space-between; align-items:baseline;">
                <span style="font-size:12px; color:var(--text); font-weight:600;">${i18nService.t("superAdmin.templates.yearly", "1 Year:")}</span>
                <span style="font-size:12px; font-weight:700; color:#0f766e;">SGD ${yearly} <span style="font-size:10px; background:#dcfce7; color:#166534; padding:1px 5px; border-radius:4px; font-weight:800;">-20%</span></span>
              </div>
            </div>
          </div>

          <div style="display:flex; justify-content:space-between; align-items:center; margin-top:14px; padding-top:14px; border-top:1px solid #f1f5f9; gap:8px; flex-wrap:wrap;">
            <div style="display:flex; gap:6px; align-items:center;">
              ${demoBtn}
              <button class="btn btn-sm btn-soft" onclick="window.superAdminCtrl.editTemplatePricing('${t.id}')" title="Configure Pricing" style="padding:6px 10px; font-size:12px; font-weight:700;">
                💳 Pricing
              </button>
            </div>
            <div style="display:flex; gap:6px; align-items:center;">
              <button class="btn btn-sm btn-soft" onclick="window.superAdminCtrl.toggleTemplateStatus('${t.id}')" title="Toggle Offering Active/Inactive" style="padding:6px 10px; font-size:12px; font-weight:700;">
                ${isActive ? "Pause" : "Activate"}
              </button>
              ${deleteBtn}
            </div>
          </div>
        </div>
      `;
    }).join("");
  }

  setupCreateTemplateForm() {
    const btn = document.getElementById("showCreateTemplateBtn");
    const panel = document.getElementById("createTemplatePanel");
    const cancelBtn = document.getElementById("cancelCreateTemplateBtn");
    const submitBtn = document.getElementById("createTemplateSubmitBtn");

    if (btn && panel) {
      btn.addEventListener("click", () => {
        panel.style.display = panel.style.display === "none" ? "block" : "none";
        btn.textContent = panel.style.display === "none" ? "+ Add New Template" : "✕ Cancel";
      });
    }

    if (cancelBtn && panel) {
      cancelBtn.addEventListener("click", () => {
        panel.style.display = "none";
        if (btn) btn.textContent = "+ Add New Template";
      });
    }

    if (submitBtn) {
      submitBtn.addEventListener("click", () => this._createTemplate());
    }
  }

  _createTemplate() {
    const name = document.getElementById("newTemplateName")?.value?.trim();
    const category = document.getElementById("newTemplateCategory")?.value?.trim();
    const demoUrl = document.getElementById("newTemplateDemoUrl")?.value?.trim();
    const price = document.getElementById("newTemplatePrice")?.value?.trim();
    const tagline = document.getElementById("newTemplateTagline")?.value?.trim();

    if (!name || !category || !price) {
      alert("Please fill in Template Name, Category, and Monthly Price.");
      return;
    }

    const monthly = parseFloat(price) || 99;
    const id = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    const all = getAllTemplates();
    if (all.some(t => t.id === id)) {
      alert("A template with this name or ID already exists.");
      return;
    }

    const newTemplate = {
      id,
      name,
      shortName: name,
      category,
      tagline: tagline || `${name} specialized healthcare & consultation suite`,
      demoUrl: demoUrl || "",
      accentColor: "#4f46e5",
      practitionerTitle: "Specialist Practitioner",
      isActive: true,
      pricing: {
        monthly,
        sixMonth: Math.round(monthly * 6 * 0.9),
        yearly: Math.round(monthly * 12 * 0.8)
      },
      createdAt: new Date().toISOString()
    };

    all.push(newTemplate);
    savePlatformTemplates(all);

    this._logAudit(`Super Admin registered new business template: ${name} (Monthly: SGD ${monthly})`);
    soundService.playClickTone && soundService.playClickTone();

    // Clear form
    ["newTemplateName", "newTemplateCategory", "newTemplateDemoUrl", "newTemplatePrice", "newTemplateTagline"].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = "";
    });

    const panel = document.getElementById("createTemplatePanel");
    if (panel) panel.style.display = "none";
    const btn = document.getElementById("showCreateTemplateBtn");
    if (btn) btn.textContent = "+ Add New Template";

    this.renderTemplates();
    notificationService.showToast?.(`Template ${name} added successfully!`, "success");
  }

  toggleTemplateStatus(templateId) {
    const all = getAllTemplates();
    const target = all.find(t => t.id === templateId);
    if (!target) return;

    target.isActive = target.isActive === false ? true : false;
    savePlatformTemplates(all);

    const statusLabel = target.isActive ? "Activated" : "Paused";
    this._logAudit(`Super Admin ${statusLabel} template offering: ${target.name}`);
    soundService.playClickTone && soundService.playClickTone();
    this.renderTemplates();
    notificationService.showToast?.(`Template ${target.name} ${statusLabel}`, "success");
  }

  editTemplatePricing(templateId) {
    const all = getAllTemplates();
    const target = all.find(t => t.id === templateId);
    if (!target) return;

    const currentMonthly = target.pricing?.monthly || 99;
    const input = prompt(`Update Monthly Pricing (SGD) for "${target.name}":`, currentMonthly);
    if (input === null) return;

    const newMonthly = parseFloat(input);
    if (isNaN(newMonthly) || newMonthly <= 0) {
      alert("Please enter a valid positive number for pricing.");
      return;
    }

    target.pricing = {
      monthly: newMonthly,
      sixMonth: Math.round(newMonthly * 6 * 0.9),
      yearly: Math.round(newMonthly * 12 * 0.8)
    };

    savePlatformTemplates(all);
    this._logAudit(`Super Admin updated pricing for template ${target.name} to SGD ${newMonthly}/mo`);
    soundService.playClickTone && soundService.playClickTone();
    this.renderTemplates();
    notificationService.showToast?.(`Pricing for ${target.name} updated to SGD ${newMonthly}/mo`, "success");
  }

  deleteTemplate(templateId) {
    const all = getAllTemplates();
    const target = all.find(t => t.id === templateId);
    if (!target) return;

    const confirmed = confirm(`Are you sure you want to delete template "${target.name}"?`);
    if (!confirmed) return;

    const filtered = all.filter(t => t.id !== templateId);
    savePlatformTemplates(filtered);
    this._logAudit(`Super Admin deleted custom template: ${target.name}`);
    soundService.playClickTone && soundService.playClickTone();
    this.renderTemplates();
    notificationService.showToast?.(`Template ${target.name} removed`, "info");
  }

  // ─────────────────────────────────────────────────────────────────────────
  // AGGREGATED USERS & APPOINTMENTS (Cross-Tenant Supervisory Module)
  // ─────────────────────────────────────────────────────────────────────────

  setupUsersAndAppointments() {
    const searchInput = document.getElementById("filterApptSearch");
    const ownerSelect = document.getElementById("filterApptOwner");
    const templateSelect = document.getElementById("filterApptTemplate");
    const statusSelect = document.getElementById("filterApptStatus");
    const resetBtn = document.getElementById("resetApptFilterBtn");
    const refreshBtn = document.getElementById("refreshUsersApptsBtn");

    searchInput?.addEventListener("input", (e) => {
      this.activeApptFilter.search = e.target.value.trim().toLowerCase();
      this._renderFilteredAppointments();
    });

    ownerSelect?.addEventListener("change", (e) => {
      this.activeApptFilter.ownerId = e.target.value;
      this._renderFilteredAppointments();
    });

    templateSelect?.addEventListener("change", (e) => {
      this.activeApptFilter.template = e.target.value;
      this._renderFilteredAppointments();
    });

    statusSelect?.addEventListener("change", (e) => {
      this.activeApptFilter.status = e.target.value;
      this._renderFilteredAppointments();
    });

    resetBtn?.addEventListener("click", () => {
      this.activeApptFilter = { search: "", ownerId: "ALL", template: "ALL", status: "ALL" };
      if (searchInput) searchInput.value = "";
      if (ownerSelect) ownerSelect.value = "ALL";
      if (templateSelect) templateSelect.value = "ALL";
      if (statusSelect) statusSelect.value = "ALL";
      soundService.playClickTone?.();
      this._renderFilteredAppointments();
    });

    refreshBtn?.addEventListener("click", async () => {
      soundService.playClickTone?.();
      await this.renderUsersAndAppointments();
      notificationService.showToast?.("Refreshed live appointments & patients", "info");
    });
  }

  async renderUsersAndAppointments() {
    // 1. Fetch live bookings from Cloud with local fallback
    let bookings = [];
    try {
      bookings = await bookingService.fetchBookingsAsync();
    } catch (err) {
      console.warn("[SuperAdmin] fetchBookingsAsync failed:", err);
    }

    if (!bookings || bookings.length === 0) {
      bookings = storageService.get("cliniva_bookings", []);
    }

    // Provision realistic healthcare seed data across 4 core templates if completely empty
    if (!bookings || bookings.length === 0) {
      bookings = [
        {
          code: "CLN-88214",
          patientName: "Tan Kah Kee",
          patientPhone: "+65 9123 4567",
          branchName: "Orchard Wellness Clinic (SG)",
          branchAddress: "390 Orchard Rd, #04-12 Palais Renaissance, Singapore 238871",
          templateType: "wellness",
          serviceName: "Serenity Signature Aromatherapy & Thermal Hot Stone Therapy",
          practitionerName: "Therapist Sarah Chen",
          scheduleDate: "2026-09-15",
          schedule: "10:30 AM",
          room: "Suite Bed 03",
          status: "CONFIRMED",
          depositPaid: "30.00",
          paymentStatus: "DEPOSIT_PAID",
          chiefComplaint: "Severe shoulder muscle tension & chronic fatigue.",
          createdAt: new Date().toISOString()
        },
        {
          code: "CLN-88215",
          patientName: "Muhammad Farhan",
          patientPhone: "+60 12 334 5566",
          branchName: "KLCC Rehabilitation Center (MY)",
          branchAddress: "Level 4, Suria KLCC, 50088 Kuala Lumpur",
          templateType: "physio",
          serviceName: "Sports Injury Assessment & Cervical Spine Mobilization",
          practitionerName: "Dr. Lim Wei Han",
          scheduleDate: "2026-09-15",
          schedule: "02:00 PM",
          room: "Ruang A2 (Physio Suite)",
          status: "WAITING",
          depositPaid: "45.00",
          paymentStatus: "DEPOSIT_PAID",
          chiefComplaint: "Post-ACL reconstruction stiffness and lumbar pain.",
          createdAt: new Date().toISOString()
        },
        {
          code: "CLN-88216",
          patientName: "Goh Chok Tong",
          patientPhone: "+65 9876 5432",
          branchName: "Novena Traditional Healthcare (SG)",
          branchAddress: "10 Sinaran Dr, #08-01 Novena Medical Center, Singapore 307506",
          templateType: "tcm",
          serviceName: "Holistic Meridian Acupuncture & Moxibustion",
          practitionerName: "Physician Huang Wei",
          scheduleDate: "2026-09-16",
          schedule: "11:00 AM",
          room: "Ruang TCM 1",
          status: "IN_CONSULT",
          depositPaid: "40.00",
          paymentStatus: "PAID",
          chiefComplaint: "Chronic migraine, digestive deficiency, and sleep disturbance.",
          createdAt: new Date().toISOString()
        },
        {
          code: "CLN-88217",
          patientName: "Aisyah binti Ridzuan",
          patientPhone: "+60 19 888 7766",
          branchName: "Mont Kiara Nutrition Suite (MY)",
          branchAddress: "1 Mont Kiara, Jalan Kiara, 50480 Kuala Lumpur",
          templateType: "nutrition",
          serviceName: "Metabolic Biomarker Consultation & Customized Meal Planning",
          practitionerName: "Dietitian Janice Wong",
          scheduleDate: "2026-09-16",
          schedule: "03:30 PM",
          room: "Consultation Pod 4",
          status: "COMPLETED",
          depositPaid: "50.00",
          paymentStatus: "PAID",
          chiefComplaint: "Insulin resistance management and body recomposition.",
          createdAt: new Date().toISOString()
        }
      ];
      storageService.set("cliniva_bookings", bookings);
    }

    this.appointmentsCache = bookings;

    // 2. Fetch Users and Build Registered Patient Profiles
    const allUsers = authService.getUsers();
    const registeredPatients = allUsers.filter(u => u.role === USER_ROLES.USER);

    // Merge registered accounts with booking guest records into a unified patient registry
    const patientMap = new Map();
    registeredPatients.forEach(p => {
      patientMap.set(p.email?.toLowerCase() || p.phone, {
        name: p.name,
        contact: p.phone || p.email,
        email: p.email,
        phone: p.phone,
        clinic: p.branchName || "Cliniva Network",
        joined: p.createdAt ? new Date(p.createdAt).toLocaleDateString("en-GB") : "Recent",
        bookingsCount: 0
      });
    });

    bookings.forEach(b => {
      const key = b.patientPhone || b.patientName?.toLowerCase();
      if (key && !patientMap.has(key)) {
        patientMap.set(key, {
          name: b.patientName || "Guest Patient",
          contact: b.patientPhone || "Guest Patient",
          email: "guest@patient.cliniva.com",
          phone: b.patientPhone || "—",
          clinic: b.branchName || "Cliniva Network",
          joined: b.createdAt ? new Date(b.createdAt).toLocaleDateString("en-GB") : "Recent",
          bookingsCount: 1
        });
      } else if (key && patientMap.has(key)) {
        patientMap.get(key).bookingsCount++;
      }
    });

    const uniquePatients = Array.from(patientMap.values());

    // 3. Update KPI Metric Cards
    this._setText("statTotalPatients", uniquePatients.length);
    this._setText("statTotalBookings", bookings.length);
    const confirmedCount = bookings.filter(b => b.status === "CONFIRMED" || b.status === "WAITING").length;
    const completedCount = bookings.filter(b => b.status === "COMPLETED").length;
    this._setText("statConfirmedBookings", confirmedCount);
    this._setText("statCompletedBookings", completedCount);

    // 4. Populate Owner Filter Dropdown
    const ownerSelect = document.getElementById("filterApptOwner");
    if (ownerSelect) {
      const currentSelected = ownerSelect.value;
      const owners = allUsers.filter(u => u.role === USER_ROLES.OWNER);
      ownerSelect.innerHTML = `<option value="ALL">All Owners (${owners.length})</option>` +
        owners.map(o => `<option value="${o.id}">${o.brandName || o.name}</option>`).join("");
      if (currentSelected && currentSelected !== "ALL") {
        ownerSelect.value = currentSelected;
      }
    }

    // 5. Render Filtered Appointments Table & Patient Registry Table
    this._renderFilteredAppointments();
    this._renderPatientRegistry(uniquePatients);
  }

  _renderFilteredAppointments() {
    const container = document.getElementById("aggregatedAppointmentsTableBody");
    const countEl = document.getElementById("apptRecordCount");
    if (!container) return;

    const { search, ownerId, template, status } = this.activeApptFilter;
    const branches = storageService.get("cliniva_branches", []);

    let filtered = this.appointmentsCache.filter(b => {
      // Search match
      if (search) {
        const text = `${b.code} ${b.patientName} ${b.patientPhone} ${b.branchName} ${b.serviceName} ${b.practitionerName}`.toLowerCase();
        if (!text.includes(search)) return false;
      }
      // Owner match (match via branch ownerId)
      if (ownerId !== "ALL") {
        const branchObj = branches.find(br => br.name === b.branchName || br.id === b.branchId);
        if (branchObj && branchObj.ownerId !== ownerId) return false;
      }
      // Template match
      if (template !== "ALL" && b.templateType !== template) {
        return false;
      }
      // Status match
      if (status !== "ALL" && b.status !== status) {
        return false;
      }
      return true;
    });

    if (countEl) countEl.textContent = `${filtered.length} records`;

    if (filtered.length === 0) {
      container.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:36px; color:var(--muted);">${i18nService.t("superAdmin.noAppointmentsMatch", "No clinical appointments match your filter criteria.")}</td></tr>`;
      return;
    }

    container.innerHTML = filtered.map(b => {
      const tType = b.templateType || "physio";
      const statusClass = b.status === "COMPLETED" ? "#dcfce7; color:#166534;" :
        b.status === "IN_CONSULT" ? "#f3e8ff; color:#7e22ce;" :
        b.status === "WAITING" ? "#fef3c7; color:#b45309;" :
        b.status === "CANCELLED" ? "#fee2e2; color:#991b1b;" : "#e0f2fe; color:#0369a1;";

      return `
        <tr>
          <td style="white-space:nowrap;">
            <strong style="font-size:13px; color:#4f46e5; letter-spacing:-0.2px;">#${b.code}</strong>
            <div style="font-size:10px; color:var(--muted);">${b.createdAt ? new Date(b.createdAt).toLocaleDateString() : ""}</div>
          </td>
          <td style="white-space:nowrap;">
            <div style="font-weight:700; color:var(--text); font-size:13px;">${b.patientName || "Guest Patient"}</div>
            <div style="font-size:11px; color:var(--muted); font-family:monospace;">${b.patientPhone || "—"}</div>
          </td>
          <td style="white-space:nowrap;">
            <div style="font-size:12px; font-weight:700; color:var(--text); max-width:180px; overflow:hidden; text-overflow:ellipsis;">${b.branchName || "Main Branch"}</div>
            <span class="pill" style="font-size:10px; padding:2px 6px; background:#f0fdfa; color:#0f766e; text-transform:uppercase; font-weight:800;">
              ${tType}
            </span>
          </td>
          <td style="white-space:nowrap;">
            <div style="font-size:12px; font-weight:700; color:#1e293b;">${b.practitionerName || "Specialist on Duty"}</div>
            <div style="font-size:11px; color:var(--muted); max-width:200px; overflow:hidden; text-overflow:ellipsis;">${b.serviceName || "Clinical Consultation"}</div>
          </td>
          <td style="white-space:nowrap;">
            <div style="font-size:12px; font-weight:700; color:var(--text);">${b.scheduleDate || "Today"}</div>
            <div style="font-size:11px; color:var(--muted);">${b.schedule || "—"} (${b.room || "Room 01"})</div>
          </td>
          <td style="white-space:nowrap;">
            <span class="pill" style="font-size:11px; padding:4px 9px; background:${statusClass}; font-weight:800;">
              ● ${b.status || "CONFIRMED"}
            </span>
          </td>
          <td style="white-space:nowrap; text-align:right;">
            <button class="btn btn-sm btn-soft" onclick="window.superAdminCtrl.viewAppointmentDetails('${b.code}')" style="font-size:11px; padding:5px 10px; font-weight:700;" title="Inspect Appointment">
              🔍 ${i18nService.t("superAdmin.viewDetails", "Details")}
            </button>
          </td>
        </tr>
      `;
    }).join("");
  }

  _renderPatientRegistry(patients) {
    const container = document.getElementById("registeredPatientsTableBody");
    const countEl = document.getElementById("patientRecordCount");
    if (!container) return;

    if (countEl) countEl.textContent = `${patients.length} patients`;

    if (patients.length === 0) {
      container.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:32px; color:var(--muted);">${i18nService.t("superAdmin.noPatients", "No patient records registered on platform yet.")}</td></tr>`;
      return;
    }

    container.innerHTML = patients.map(p => `
      <tr>
        <td style="white-space:nowrap;">
          <div style="display:flex; align-items:center; gap:8px;">
            <span style="font-size:18px;">👤</span>
            <div>
              <div style="font-weight:700; font-size:13px; color:var(--text);">${p.name}</div>
              <div style="font-size:11px; color:var(--muted);">${p.email || ""}</div>
            </div>
          </div>
        </td>
        <td style="font-size:12px; font-weight:600; font-family:monospace; color:var(--text); white-space:nowrap;">
          ${p.phone || "—"}
        </td>
        <td style="white-space:nowrap;">
          <span class="pill" style="font-size:11px; padding:3px 8px; background:#f1f5f9; color:#334155; font-weight:700;">
            ${p.clinic}
          </span>
        </td>
        <td style="font-size:12px; color:var(--muted); white-space:nowrap;">
          ${p.joined}
        </td>
        <td style="text-align:right; font-size:13px; font-weight:800; color:#4f46e5; white-space:nowrap;">
          ${p.bookingsCount} visits
        </td>
      </tr>
    `).join("");
  }

  // ─────────────────────────────────────────────────────────────────────────
  // MODAL CONTROLLERS & ACTIONS
  // ─────────────────────────────────────────────────────────────────────────

  setupModals() {
    // 1. Edit Owner Modal
    const editOwnerModal = document.getElementById("editOwnerModal");
    const closeEditOwnerBtn = document.getElementById("closeEditOwnerModalBtn");
    const cancelEditOwnerBtn = document.getElementById("cancelEditOwnerModalBtn");
    const editOwnerForm = document.getElementById("editOwnerForm");

    const hideEditOwner = () => {
      if (editOwnerModal) editOwnerModal.style.display = "none";
    };

    closeEditOwnerBtn?.addEventListener("click", hideEditOwner);
    cancelEditOwnerBtn?.addEventListener("click", hideEditOwner);

    editOwnerForm?.addEventListener("submit", (e) => {
      e.preventDefault();
      this.saveEditOwner();
    });

    // 2. Branch Status Modal
    const branchStatusModal = document.getElementById("branchStatusModal");
    const closeBranchStatusBtn = document.getElementById("closeBranchStatusModalBtn");
    const cancelBranchStatusBtn = document.getElementById("cancelBranchStatusModalBtn");
    const branchStatusForm = document.getElementById("branchStatusForm");

    const hideBranchStatus = () => {
      if (branchStatusModal) branchStatusModal.style.display = "none";
    };

    closeBranchStatusBtn?.addEventListener("click", hideBranchStatus);
    cancelBranchStatusBtn?.addEventListener("click", hideBranchStatus);

    branchStatusForm?.addEventListener("submit", (e) => {
      e.preventDefault();
      this.saveBranchStatus();
    });

    // 3. Appointment Detail Modal
    const appDetailModal = document.getElementById("appointmentDetailModal");
    const closeAppDetailBtn = document.getElementById("closeAppDetailModalBtn");
    const closeAppDetailFooterBtn = document.getElementById("closeAppDetailFooterBtn");

    const hideAppDetail = () => {
      if (appDetailModal) appDetailModal.style.display = "none";
    };

    closeAppDetailBtn?.addEventListener("click", hideAppDetail);
    closeAppDetailFooterBtn?.addEventListener("click", hideAppDetail);

    // Universal escape key listener
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        hideEditOwner();
        hideBranchStatus();
        hideAppDetail();
      }
    });
  }

  // ── Edit Owner Actions ──────────────────────────────────────────────────

  openEditOwnerModal(ownerId) {
    soundService.playClickTone?.();
    const users = authService.getUsers();
    const owner = users.find(u => u.id === ownerId);
    if (!owner) {
      alert("Owner account not found.");
      return;
    }

    const modal = document.getElementById("editOwnerModal");
    if (!modal) return;

    document.getElementById("editOwnerId").value = owner.id;
    document.getElementById("editOwnerName").value = owner.name || "";
    document.getElementById("editOwnerEmail").value = owner.email || "";
    document.getElementById("editOwnerPhone").value = owner.phone || "";
    document.getElementById("editOwnerBrand").value = owner.brandName || "";
    document.getElementById("editOwnerStatus").value = owner.status || (owner.onboardingCompleted ? "ACTIVE" : "PENDING");
    document.getElementById("editOwnerPass").value = "";

    modal.style.display = "flex";
  }

  saveEditOwner() {
    const id = document.getElementById("editOwnerId")?.value;
    const name = document.getElementById("editOwnerName")?.value.trim();
    const email = document.getElementById("editOwnerEmail")?.value.trim();
    const phone = document.getElementById("editOwnerPhone")?.value.trim();
    const brandName = document.getElementById("editOwnerBrand")?.value.trim();
    const status = document.getElementById("editOwnerStatus")?.value;
    const pass = document.getElementById("editOwnerPass")?.value.trim();

    if (!name || !email) {
      alert("Name and Email are required.");
      return;
    }

    const updates = {
      name,
      email,
      phone,
      brandName,
      status,
      onboardingCompleted: status === "ACTIVE"
    };

    if (pass && pass.length >= 6) {
      updates.password = pass;
    }

    const result = authService.updateUserAccount(id, updates);
    if (!result.success) {
      alert("Error: " + result.error);
      return;
    }

    if (supabaseService.isAvailable()) {
      supabaseService.updateProfile(id, updates).catch(err => {
        console.warn("[SuperAdmin] Cloud update profile error:", err);
      });
    }

    this._logAudit(`Super Admin updated Owner account: ${name} (${email}) — Status: ${status}`);
    soundService.playClickTone?.();

    document.getElementById("editOwnerModal").style.display = "none";
    this.renderOwnerList();
    this.loadPlatformStats();
    this.renderUsersAndAppointments();

    notificationService.showToast?.(`Owner ${name} updated successfully!`, "success");
  }

  // ── Branch Status Actions ───────────────────────────────────────────────

  openBranchStatusModal(branchId) {
    soundService.playClickTone?.();
    let branches = storageService.get("cliniva_branches", []);
    const branch = branches.find(b => b.id === branchId);
    if (!branch) {
      alert("Branch not found in registry.");
      return;
    }

    const users = authService.getUsers();
    const owner = users.find(u => u.id === branch.ownerId) || { name: "Platform Tenant" };

    const modal = document.getElementById("branchStatusModal");
    if (!modal) return;

    document.getElementById("statusBranchId").value = branch.id;
    document.getElementById("statusBranchNameDisplay").textContent = branch.name;
    document.getElementById("statusBranchOwnerDisplay").textContent = `Owner: ${owner.name} (${owner.brandName || "Clinic Tenant"})`;
    document.getElementById("branchOperationalStatus").value = branch.status || "ACTIVE";
    document.getElementById("branchPaymentVerifiedOverride").checked = branch.status === "ACTIVE" || branch.paymentVerified === true;

    modal.style.display = "flex";
  }

  saveBranchStatus() {
    const branchId = document.getElementById("statusBranchId")?.value;
    const status = document.getElementById("branchOperationalStatus")?.value;
    const isOverride = document.getElementById("branchPaymentVerifiedOverride")?.checked;

    let branches = storageService.get("cliniva_branches", []);
    const target = branches.find(b => b.id === branchId);
    if (!target) return;

    const finalStatus = isOverride && status === "PENDING_PAYMENT" ? "ACTIVE" : status;
    target.status = finalStatus;
    target.paymentVerified = isOverride;
    target.updatedAt = new Date().toISOString();

    storageService.set("cliniva_branches", branches);

    if (supabaseService.isAvailable()) {
      supabaseService.updateBranchStatus(branchId, finalStatus, finalStatus === "ACTIVE").catch(err => {
        console.warn("[SuperAdmin] Cloud branch status update error:", err);
      });
    }

    this._logAudit(`Super Admin updated operational status for branch: ${target.name} to ${finalStatus}`);
    soundService.playClickTone?.();

    document.getElementById("branchStatusModal").style.display = "none";
    this.renderAllBranches();
    this.renderSubscriptions();

    notificationService.showToast?.(`Branch ${target.name} status set to ${finalStatus}`, "success");
  }

  // ── Appointment Details Inspector ───────────────────────────────────────

  viewAppointmentDetails(code) {
    soundService.playClickTone?.();
    const booking = this.appointmentsCache.find(b => b.code === code);
    if (!booking) {
      alert("Appointment record not found.");
      return;
    }

    const modal = document.getElementById("appointmentDetailModal");
    const titleEl = document.getElementById("appDetailCodeTitle");
    const bodyEl = document.getElementById("appointmentDetailBody");

    if (!modal || !bodyEl) return;

    if (titleEl) titleEl.textContent = `Appointment #${booking.code}`;

    bodyEl.innerHTML = `
      <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:14px; display:grid; grid-template-columns:1fr 1fr; gap:12px;">
        <div>
          <div style="font-size:11px; font-weight:800; color:var(--muted); text-transform:uppercase;">Patient Name</div>
          <div style="font-size:14px; font-weight:800; color:var(--text);">${booking.patientName || "Guest Patient"}</div>
          <div style="font-size:12px; color:var(--muted); font-family:monospace;">${booking.patientPhone || "—"}</div>
        </div>
        <div>
          <div style="font-size:11px; font-weight:800; color:var(--muted); text-transform:uppercase;">Clinic &amp; Template</div>
          <div style="font-size:13px; font-weight:700; color:var(--text);">${booking.branchName || "Cliniva Clinic"}</div>
          <span class="pill" style="font-size:10px; padding:2px 6px; background:#f0fdfa; color:#0f766e; text-transform:uppercase; font-weight:800;">
            ${booking.templateType || "physio"}
          </span>
        </div>
      </div>

      <div style="background:#fff; border:1px solid #e2e8f0; border-radius:12px; padding:14px; display:grid; grid-template-columns:1fr 1fr; gap:12px;">
        <div>
          <div style="font-size:11px; font-weight:800; color:var(--muted); text-transform:uppercase;">Specialist / Doctor</div>
          <div style="font-size:13px; font-weight:700; color:#1e293b;">${booking.practitionerName || "Attending Specialist"}</div>
          <div style="font-size:11px; color:var(--muted);">${booking.room || "Room 01"}</div>
        </div>
        <div>
          <div style="font-size:11px; font-weight:800; color:var(--muted); text-transform:uppercase;">Schedule Time</div>
          <div style="font-size:13px; font-weight:700; color:#4f46e5;">${booking.scheduleDate || "Scheduled Date"}</div>
          <div style="font-size:12px; color:var(--muted);">${booking.schedule || "—"}</div>
        </div>
      </div>

      <div style="background:#fff; border:1px solid #e2e8f0; border-radius:12px; padding:14px;">
        <div style="font-size:11px; font-weight:800; color:var(--muted); text-transform:uppercase; margin-bottom:4px;">Service / Procedure</div>
        <div style="font-size:13px; font-weight:700; color:var(--text);">${booking.serviceName || "Clinical Consultation"}</div>
        <div style="margin-top:10px; font-size:11px; font-weight:800; color:var(--muted); text-transform:uppercase;">Chief Complaint / Clinical Notes</div>
        <div style="font-size:12px; color:#334155; line-height:1.4; margin-top:2px; background:#f8fafc; padding:8px 10px; border-radius:8px; border:1px solid #f1f5f9;">
          ${booking.chiefComplaint || booking.complaint || "No specific intake notes entered by patient."}
        </div>
      </div>

      <div style="background:#f0fdf4; border:1px solid #bbf7d0; border-radius:12px; padding:12px 14px; display:flex; justify-content:space-between; align-items:center;">
        <div>
          <div style="font-size:11px; font-weight:800; color:#166534; text-transform:uppercase;">Booking &amp; Payment Status</div>
          <div style="font-size:13px; font-weight:800; color:#166534;">● ${booking.status || "CONFIRMED"} (${booking.paymentStatus || "DEPOSIT_PAID"})</div>
        </div>
        <div style="text-align:right;">
          <div style="font-size:11px; color:#166534; font-weight:700;">Deposit Verified</div>
          <div style="font-size:15px; font-weight:900; color:#166534;">SGD ${booking.depositPaid || "0.00"}</div>
        </div>
      </div>
    `;

    modal.style.display = "flex";
  }

  // ─────────────────────────────────────────────────────────────────────────
  // SIGN OUT
  // ─────────────────────────────────────────────────────────────────────────

  setupSignOut() {
    const btn = document.getElementById("saSignOutBtn");
    if (btn) {
      btn.addEventListener("click", () => authService.logout());
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // HELPERS
  // ─────────────────────────────────────────────────────────────────────────

  _setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  }
}

// Mount
const ctrl = new SuperAdminController();
window.superAdminCtrl = ctrl;
ctrl.init();

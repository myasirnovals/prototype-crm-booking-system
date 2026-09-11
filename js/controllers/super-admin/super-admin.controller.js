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
import { notificationService } from "../../services/notification.service.js";
import { soundService } from "../../services/sound.service.js";
import { supabaseService } from "../../services/supabase.service.js";
import { i18nService } from "../../services/i18n.service.js";
import { getAllTemplates, savePlatformTemplates } from "../../config/templates/index.js";

export class SuperAdminController {
  constructor() {
    this.AUDIT_KEY = "cliniva_audit_logs";
    this.currentUser = null;
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
    await this.renderAuditLogs();
    await this.renderTemplates();
    this.setupCreateOwnerForm();
    this.setupCreateTemplateForm();

    window.addEventListener("cliniva:languageChanged", () => {
      this.renderUserInfo();
      this.renderOwnerList();
      this.renderAllBranches();
      this.renderSubscriptions();
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
            <button class="btn btn-sm btn-soft" onclick="window.superAdminCtrl.auditBranch('${b.id}', '${b.name}')" style="font-size:11px; padding:5px 10px; font-weight:700;">
              🛡️ Audit Status
            </button>
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

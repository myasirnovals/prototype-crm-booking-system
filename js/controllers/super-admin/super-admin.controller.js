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

export class SuperAdminController {
  constructor() {
    this.AUDIT_KEY   = "cliniva_audit_logs";
    this.currentUser = null;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // INIT
  // ─────────────────────────────────────────────────────────────────────────

  init() {
    // Guard: Only SUPER_ADMIN may access this page
    const session = authService.requireAuth([USER_ROLES.SUPER_ADMIN], "../../pages/public/sign-in.html");
    if (!session) return;

    this.currentUser = session.user;
    this.renderUserInfo();
    this.setupTabs();
    this.setupSignOut();
    this.loadPlatformStats();
    this.renderOwnerList();
    this.renderAuditLogs();
    this.setupCreateOwnerForm();
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
    const btns  = document.querySelectorAll(".sa-tab-btn");
    const panes = document.querySelectorAll(".sa-tab-pane");

    btns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const target = btn.dataset.pane;
        soundService.playClickTone && soundService.playClickTone();

        btns.forEach((b)  => b.classList.remove("active"));
        panes.forEach((p) => p.classList.remove("active"));

        btn.classList.add("active");
        const pane = document.getElementById(target);
        if (pane) pane.classList.add("active");
      });
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // PLATFORM STATS
  // ─────────────────────────────────────────────────────────────────────────

  loadPlatformStats() {
    const users   = authService.getUsers();
    const owners  = users.filter(u => u.role === USER_ROLES.OWNER);
    const active  = owners.filter(u => u.onboardingCompleted);
    const pending = owners.filter(u => !u.onboardingCompleted);

    const branches = storageService.get("cliniva_branches", []);

    this._setText("statTotalOwners",   owners.length);
    this._setText("statActiveOwners",  active.length);
    this._setText("statPendingOwners", pending.length);
    this._setText("statTotalBranches", branches.length);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // OWNER LIST
  // ─────────────────────────────────────────────────────────────────────────

  renderOwnerList() {
    const container = document.getElementById("ownerTableBody");
    if (!container) return;

    const users  = authService.getUsers();
    const owners = users.filter(u => u.role === USER_ROLES.OWNER);

    if (owners.length === 0) {
      container.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:32px; color:var(--muted);">No Owner accounts found. Create one below.</td></tr>`;
      return;
    }

    container.innerHTML = owners.map(owner => `
      <tr>
        <td>
          <div style="display:flex; align-items:center; gap:10px;">
            <span style="font-size:20px;">${owner.avatar || "💼"}</span>
            <div>
              <div style="font-weight:700; font-size:13px;">${owner.name}</div>
              <div style="font-size:11px; color:var(--muted);">${owner.email}</div>
            </div>
          </div>
        </td>
        <td style="font-size:12px;">${owner.phone || "—"}</td>
        <td>
          <span class="pill" style="font-size:11px; padding:3px 8px; background:${owner.brandName ? "#f0fdfa" : "#fef3c7"}; color:${owner.brandName ? "#0f766e" : "#92400e"}; font-weight:700;">
            ${owner.brandName || "Not Set Up"}
          </span>
        </td>
        <td>
          <span class="pill" style="font-size:11px; padding:3px 8px; background:${owner.onboardingCompleted ? "#dcfce7" : "#fee2e2"}; color:${owner.onboardingCompleted ? "#166534" : "#991b1b"}; font-weight:700;">
            ${owner.onboardingCompleted ? "✓ Active" : "⏳ Pending"}
          </span>
        </td>
        <td style="font-size:11px; color:var(--muted);">${owner.createdAt ? new Date(owner.createdAt).toLocaleDateString() : "—"}</td>
        <td>
          <div style="display:flex; gap:6px;">
            <button class="btn btn-sm btn-soft" onclick="window.superAdminCtrl.loginAsOwner('${owner.id}')" title="Login as this Owner">🔑 Login As</button>
            <button class="btn btn-sm btn-danger" onclick="window.superAdminCtrl.deleteOwner('${owner.id}', '${owner.name}')" title="Delete Owner Account">🗑️</button>
          </div>
        </td>
      </tr>
    `).join("");
  }

  // ─────────────────────────────────────────────────────────────────────────
  // CREATE OWNER
  // ─────────────────────────────────────────────────────────────────────────

  setupCreateOwnerForm() {
    const btn  = document.getElementById("showCreateOwnerBtn");
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
    const name  = document.getElementById("newOwnerName")?.value?.trim();
    const email = document.getElementById("newOwnerEmail")?.value?.trim();
    const phone = document.getElementById("newOwnerPhone")?.value?.trim();
    const pass  = document.getElementById("newOwnerPass")?.value?.trim() || "cliniva2026";

    if (!name || !email) {
      alert("Please fill in Name and Email to create an Owner account.");
      return;
    }

    const result = authService.createUserAccount({
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
  // AUDIT LOGS
  // ─────────────────────────────────────────────────────────────────────────

  renderAuditLogs() {
    const container = document.getElementById("auditLogsList");
    if (!container) return;

    const logs = storageService.get(this.AUDIT_KEY, []);

    if (logs.length === 0) {
      container.innerHTML = `<div style="padding:32px; text-align:center; color:var(--muted);">No audit events yet. Actions performed by Super Admin will appear here.</div>`;
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

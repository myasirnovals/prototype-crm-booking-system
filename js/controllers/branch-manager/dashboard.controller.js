/**
 * Cliniva — Branch Manager Controller
 * SOLID: Single Responsibility — Branch-level staff & operations management only
 *
 * Branch Manager responsibilities:
 *  1. Manage Practitioners within their assigned branch
 *  2. Manage Receptionists within their assigned branch
 *  3. View branch-level operations summary
 *  4. Cannot manage other branches (scoped to their branchId)
 *  5. Cannot create/delete Owner accounts (that's Super Admin's job)
 */

import { authService, USER_ROLES } from "../../services/auth.service.js";
import { storageService } from "../../services/storage.service.js";
import { notificationService } from "../../services/notification.service.js";
import { soundService } from "../../services/sound.service.js";

export class BranchManagerController {
  constructor() {
    this.AUDIT_KEY   = "cliniva_audit_logs";
    this.currentUser = null;
    this.branchId    = null;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // INIT
  // ─────────────────────────────────────────────────────────────────────────

  init() {
    // Guard: Only BRANCH_MANAGER may access this page
    const session = authService.requireAuth([USER_ROLES.BRANCH_MANAGER], "../../pages/public/sign-in.html");
    if (!session) return;

    this.currentUser = session.user;
    this.branchId    = session.user.branchId;

    this.renderUserInfo();
    this.setupTabs();
    this.setupSignOut();
    this.loadBranchStats();
    this.renderStaffList(USER_ROLES.PRACTITIONER, "practitionerTableBody");
    this.renderStaffList(USER_ROLES.RECEPTIONIST,  "receptionistTableBody");
    this.setupAddStaffForm();
  }

  // ─────────────────────────────────────────────────────────────────────────
  // USER INFO
  // ─────────────────────────────────────────────────────────────────────────

  renderUserInfo() {
    this._setText("bmName",       this.currentUser.name);
    this._setText("bmRole",       `Branch Manager — ${this.currentUser.branchName || "Branch"}`);
    this._setText("bmBranchName", this.currentUser.branchName || "—");
  }

  // ─────────────────────────────────────────────────────────────────────────
  // TABS
  // ─────────────────────────────────────────────────────────────────────────

  setupTabs() {
    const btns  = document.querySelectorAll(".bm-tab-btn");
    const panes = document.querySelectorAll(".bm-tab-pane");

    btns.forEach(btn => {
      btn.addEventListener("click", () => {
        const target = btn.dataset.pane;
        soundService.playClickTone?.();
        btns.forEach(b  => b.classList.remove("active"));
        panes.forEach(p => p.classList.remove("active"));
        btn.classList.add("active");
        document.getElementById(target)?.classList.add("active");
      });
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // BRANCH STATS
  // ─────────────────────────────────────────────────────────────────────────

  loadBranchStats() {
    const users         = authService.getUsers();
    const branchUsers   = users.filter(u => u.branchId === this.branchId);
    const practitioners = branchUsers.filter(u => u.role === USER_ROLES.PRACTITIONER);
    const receptionists = branchUsers.filter(u => u.role === USER_ROLES.RECEPTIONIST);

    this._setText("statPractitioners", practitioners.length);
    this._setText("statReceptionists", receptionists.length);
    this._setText("statTotalStaff",    practitioners.length + receptionists.length);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // STAFF LIST (Practitioners & Receptionists)
  // ─────────────────────────────────────────────────────────────────────────

  renderStaffList(role, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const users = authService.getUsers();
    const staff = users.filter(u => u.branchId === this.branchId && u.role === role);

    if (staff.length === 0) {
      container.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:28px; color:var(--muted);">No ${role === USER_ROLES.PRACTITIONER ? "practitioners" : "receptionists"} found for this branch. Add one below.</td></tr>`;
      return;
    }

    container.innerHTML = staff.map(s => `
      <tr>
        <td>
          <div style="display:flex; align-items:center; gap:10px;">
            <span style="font-size:20px;">${s.avatar || "👤"}</span>
            <div>
              <div style="font-weight:700; font-size:13px;">${s.name}</div>
              <div style="font-size:11px; color:var(--muted);">${s.email}</div>
            </div>
          </div>
        </td>
        <td style="font-size:12px;">${s.title || "—"}</td>
        <td style="font-size:12px; color:var(--muted);">${s.specialty || s.room || "—"}</td>
        <td style="font-size:11px; color:var(--muted);">${s.phone || "—"}</td>
        <td>
          <button class="btn btn-sm btn-danger"
            onclick="window.branchMgrCtrl.removeStaff('${s.id}', '${s.name}')">
            🗑️ Remove
          </button>
        </td>
      </tr>
    `).join("");
  }

  // ─────────────────────────────────────────────────────────────────────────
  // ADD STAFF
  // ─────────────────────────────────────────────────────────────────────────

  setupAddStaffForm() {
    // Toggle panels
    ["showAddPractitionerBtn", "showAddReceptionistBtn"].forEach(btnId => {
      const btn = document.getElementById(btnId);
      if (!btn) return;
      const panelId = btnId === "showAddPractitionerBtn" ? "addPractitionerPanel" : "addReceptionistPanel";
      btn.addEventListener("click", () => {
        const panel = document.getElementById(panelId);
        if (!panel) return;
        panel.style.display = panel.style.display === "none" ? "block" : "none";
        btn.textContent = panel.style.display === "none"
          ? (btnId === "showAddPractitionerBtn" ? "+ Add Practitioner" : "+ Add Receptionist")
          : "✕ Cancel";
      });
    });

    // Submit handlers
    document.getElementById("addPractitionerBtn")?.addEventListener("click", () => this._addStaff(USER_ROLES.PRACTITIONER));
    document.getElementById("addReceptionistBtn")?.addEventListener("click",  () => this._addStaff(USER_ROLES.RECEPTIONIST));
  }

  _addStaff(role) {
    const prefix = role === USER_ROLES.PRACTITIONER ? "prac" : "rec";
    const name     = document.getElementById(`${prefix}Name`)?.value?.trim();
    const email    = document.getElementById(`${prefix}Email`)?.value?.trim();
    const phone    = document.getElementById(`${prefix}Phone`)?.value?.trim();
    const title    = document.getElementById(`${prefix}Title`)?.value?.trim();
    const specialty = document.getElementById(`${prefix}Specialty`)?.value?.trim();

    if (!name || !email) {
      alert("Please fill in Name and Email.");
      return;
    }

    const result = authService.createUserAccount({
      name,
      email,
      phone:    phone || "+60 000 0000",
      password: "cliniva2026",
      role,
      title:    title || (role === USER_ROLES.PRACTITIONER ? "Practitioner" : "Receptionist"),
      specialty: specialty || null,
      avatar:   role === USER_ROLES.PRACTITIONER ? "🧑‍⚕️" : "🛎️",
      branchId:   this.branchId,
      branchName: this.currentUser.branchName,
      onboardingCompleted: true
    });

    if (!result.success) { alert("Error: " + result.error); return; }

    this._logAudit(`Branch Manager ${this.currentUser.name} added ${role}: ${name} to ${this.currentUser.branchName}`);
    soundService.playClickTone?.();

    // Reset form fields
    [`${prefix}Name`, `${prefix}Email`, `${prefix}Phone`, `${prefix}Title`, `${prefix}Specialty`].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = "";
    });

    // Hide panel & refresh
    const panelId = role === USER_ROLES.PRACTITIONER ? "addPractitionerPanel" : "addReceptionistPanel";
    const panel   = document.getElementById(panelId);
    if (panel) panel.style.display = "none";

    const tableId = role === USER_ROLES.PRACTITIONER ? "practitionerTableBody" : "receptionistTableBody";
    this.loadBranchStats();
    this.renderStaffList(role, tableId);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // REMOVE STAFF
  // ─────────────────────────────────────────────────────────────────────────

  removeStaff(userId, staffName) {
    if (!confirm(`Remove "${staffName}" from this branch?\n\nThis will delete their account.`)) return;

    const result = authService.deleteUserAccount(userId);
    if (!result.success) { alert("Error: " + result.error); return; }

    this._logAudit(`Branch Manager removed staff: ${staffName} from ${this.currentUser.branchName}`);
    this.loadBranchStats();
    this.renderStaffList(USER_ROLES.PRACTITIONER, "practitionerTableBody");
    this.renderStaffList(USER_ROLES.RECEPTIONIST,  "receptionistTableBody");
  }

  // ─────────────────────────────────────────────────────────────────────────
  // SIGN OUT
  // ─────────────────────────────────────────────────────────────────────────

  setupSignOut() {
    document.getElementById("bmSignOutBtn")?.addEventListener("click", () => authService.logout());
  }

  // ─────────────────────────────────────────────────────────────────────────
  // HELPERS
  // ─────────────────────────────────────────────────────────────────────────

  _setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  _logAudit(action) {
    const logs = storageService.get(this.AUDIT_KEY, []);
    logs.push({ action, actor: this.currentUser?.name, timestamp: new Date().toISOString() });
    storageService.set(this.AUDIT_KEY, logs);
  }
}

// Mount
const ctrl = new BranchManagerController();
window.branchMgrCtrl = ctrl;
ctrl.init();

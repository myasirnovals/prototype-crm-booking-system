/**
 * Cliniva — Navbar & Role-Based Navigation Service
 * SOLID: Single Responsibility Principle for Global Navigation, Role Visibility & Secure Navbar Filtering
 */

import { authService, USER_ROLES } from "./auth.service.js";

class NavbarService {
  constructor() {
    this.session = null;
  }

  /**
   * Synchronize the entire DOM for role-aware navigation visibility
   */
  sync() {
    this.session = authService.getCurrentSession();
    const role = this.session?.role || "GUEST";
    const user = this.session?.user || null;

    // 1. Tag body element with current role for CSS rules
    document.body.dataset.userRole = role;
    document.body.classList.remove("role-GUEST", "role-OWNER", "role-PRACTITIONER", "role-RECEPTIONIST", "role-USER");
    document.body.classList.add(`role-${role}`);

    // 2. Filter elements with explicit role attributes
    this.filterRoleElements(role);

    // 3. Render Role-Aware user badge in global navbars (e.g. index.html)
    this.renderGlobalNavActions(role, user);

    // 4. Secure ticket.html header actions if present
    this.secureTicketNav(role);
  }

  /**
   * Filter elements with data-role-access and data-hide-from attributes
   */
  filterRoleElements(role) {
    // Elements hidden specifically from certain roles (e.g. data-hide-from="PATIENT" or "USER")
    document.querySelectorAll("[data-hide-from]").forEach((el) => {
      const hideList = el.dataset.hideFrom.split(",").map((s) => s.trim().toUpperCase());
      const roleAlias = role === USER_ROLES.USER ? "PATIENT" : role;

      if (hideList.includes(role) || hideList.includes(roleAlias)) {
        el.style.display = "none";
        el.setAttribute("aria-hidden", "true");
      }
    });

    // Elements requiring specific roles
    document.querySelectorAll("[data-role-access]").forEach((el) => {
      const allowed = el.dataset.roleAccess.split(",").map((s) => s.trim().toUpperCase());
      let hasAccess = false;

      if (allowed.includes("ALL")) {
        hasAccess = true;
      } else if (allowed.includes("STAFF") && [USER_ROLES.OWNER, USER_ROLES.RECEPTIONIST, USER_ROLES.PRACTITIONER].includes(role)) {
        hasAccess = true;
      } else if (allowed.includes(role)) {
        hasAccess = true;
      } else if (allowed.includes("PATIENT") && role === USER_ROLES.USER) {
        hasAccess = true;
      } else if (allowed.includes("GUEST") && role === "GUEST") {
        hasAccess = true;
      }

      if (!hasAccess) {
        el.style.display = "none";
        el.setAttribute("aria-hidden", "true");
      } else {
        el.style.display = "";
        el.removeAttribute("aria-hidden");
      }
    });
  }

  /**
   * Secure ticket.html navigation bar so patients NEVER see operational buttons
   */
  secureTicketNav(role) {
    const ticketNav = document.getElementById("ticketNavActions");
    if (!ticketNav) return;    if (role === USER_ROLES.USER || role === "GUEST") {
      ticketNav.innerHTML = `
        <a href="patient-portal.html" class="btn btn-sm btn-soft">← Patient Portal</a>
        <a href="booking.html" class="btn btn-sm btn-primary">+ New Booking</a>
      `;
    } else if (role === USER_ROLES.OWNER) {
      ticketNav.innerHTML = `
        <a href="owner.html" class="btn btn-sm btn-soft">← Owner Console</a>
        <a href="admin.html" class="btn btn-sm btn-primary">Operations Panel →</a>
      `;
    } else if (role === USER_ROLES.RECEPTIONIST) {
      ticketNav.innerHTML = `
        <a href="admin.html" class="btn btn-sm btn-primary">← Operations Panel</a>
      `;
    } else if (role === USER_ROLES.PRACTITIONER) {
      ticketNav.innerHTML = `
        <a href="practitioner.html" class="btn btn-sm btn-primary">← Practitioner Workspace</a>
      `;
    }
  }

  /**
   * Render dynamic user widget on index.html navbar (.nav-actions)
   */
  renderGlobalNavActions(role, user) {
    const navActions = document.querySelector(".nav-actions");
    if (!navActions) return;

    // Keep the language switcher if present
    const langSwitcher = navActions.querySelector(".lang-switcher-wrap");
    const langHtml = langSwitcher ? langSwitcher.outerHTML : "";

    if (role === "GUEST" || !user) {
      // If guest and already rendered in static HTML, do not overwrite DOM or break language switcher
      const existingGetStarted = navActions.querySelector('a[href="onboarding.html"]');
      if (existingGetStarted) {
        return;
      }

      // If resetting from logged-in session back to guest
      navActions.innerHTML = `
        ${langHtml}
        <a href="sign-in.html" class="btn btn-soft" data-i18n="nav.signIn">Sign In</a>
        <a href="onboarding.html" class="btn btn-primary" data-i18n="nav.getStarted">Get Started</a>
      `;
      return;
    }

    if (role === USER_ROLES.USER && user) {
      // PATIENT LOGGED IN: Strictly patient options only. NO staff/operational buttons!
      navActions.innerHTML = `
        ${langHtml}
        <div style="display:flex; align-items:center; gap:12px;">
          <div style="text-align:right; line-height:1.2;">
            <div style="font-size:12px; font-weight:800; color:var(--text);">${user.name}</div>
            <div style="font-size:10px; color:#16a34a; font-weight:700;">🛡️ Verified Patient</div>
          </div>
          <a href="patient-portal.html" class="btn btn-sm btn-primary">Patient Portal →</a>
          <button type="button" class="btn btn-sm btn-soft global-nav-signout" title="Sign Out">Sign Out</button>
        </div>
      `;
    } else if (role === USER_ROLES.PRACTITIONER && user) {
      navActions.innerHTML = `
        ${langHtml}
        <div style="display:flex; align-items:center; gap:12px;">
          <div style="text-align:right; line-height:1.2;">
            <div style="font-size:12px; font-weight:800; color:var(--text);">${user.name}</div>
            <div style="font-size:10px; color:#0284c7; font-weight:700;">🧑‍⚕️ ${user.title || "Practitioner"}</div>
          </div>
          <a href="practitioner.html" class="btn btn-sm btn-primary">Practitioner Workspace →</a>
          <button type="button" class="btn btn-sm btn-soft global-nav-signout" title="Sign Out">Sign Out</button>
        </div>
      `;
    } else if (role === USER_ROLES.RECEPTIONIST && user) {
      navActions.innerHTML = `
        ${langHtml}
        <div style="display:flex; align-items:center; gap:12px;">
          <div style="text-align:right; line-height:1.2;">
            <div style="font-size:12px; font-weight:800; color:var(--text);">${user.name}</div>
            <div style="font-size:10px; color:#d97706; font-weight:700;">🛎️ Front Desk</div>
          </div>
          <a href="admin.html" class="btn btn-sm btn-primary">Operations Panel →</a>
          <button type="button" class="btn btn-sm btn-soft global-nav-signout" title="Sign Out">Sign Out</button>
        </div>
      `;
    } else if (role === USER_ROLES.OWNER && user) {
      navActions.innerHTML = `
        ${langHtml}
        <div style="display:flex; align-items:center; gap:12px;">
          <div style="text-align:right; line-height:1.2;">
            <div style="font-size:12px; font-weight:800; color:var(--text);">${user.name}</div>
            <div style="font-size:10px; color:#0f766e; font-weight:700;">👑 Owner HQ</div>
          </div>
          <a href="owner.html" class="btn btn-sm btn-primary">Owner Console →</a>
          <a href="admin.html" class="btn btn-sm btn-soft">Operations</a>
          <button type="button" class="btn btn-sm btn-soft global-nav-signout" title="Sign Out">Sign Out</button>
        </div>
      `;
    }

    // Attach Sign Out listener to dynamic buttons
    document.querySelectorAll(".global-nav-signout").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (confirm("Are you sure you want to sign out?")) {
          authService.logout();
        }
      });
    });
  }

  /**
   * Return HTML string for role-aware mobile drawer links
   */
  getMobileDrawerAuthLinks() {
    this.session = authService.getCurrentSession();
    const role = this.session?.role || "GUEST";
    const user = this.session?.user || null;

    if (role === USER_ROLES.USER && user) {
      return `
        <div style="padding:10px 0; font-size:12px; color:var(--text); font-weight:800;">
          👤 ${user.name} (Patient)
        </div>
        <a href="patient-portal.html" class="btn btn-primary full">Patient Portal</a>
        <button type="button" class="btn btn-soft full global-nav-signout" style="margin-top:8px;">Sign Out</button>
      `;
    } else if (role === USER_ROLES.PRACTITIONER && user) {
      return `
        <div style="padding:10px 0; font-size:12px; color:var(--text); font-weight:800;">
          🧑‍⚕️ ${user.name}
        </div>
        <a href="practitioner.html" class="btn btn-primary full">Practitioner Workspace</a>
        <button type="button" class="btn btn-soft full global-nav-signout" style="margin-top:8px;">Sign Out</button>
      `;
    } else if (role === USER_ROLES.RECEPTIONIST && user) {
      return `
        <div style="padding:10px 0; font-size:12px; color:var(--text); font-weight:800;">
          🛎️ ${user.name} (Receptionist)
        </div>
        <a href="admin.html" class="btn btn-primary full">Operations Panel</a>
        <button type="button" class="btn btn-soft full global-nav-signout" style="margin-top:8px;">Sign Out</button>
      `;
    } else if (role === USER_ROLES.OWNER && user) {
      return `
        <div style="padding:10px 0; font-size:12px; color:var(--text); font-weight:800;">
          👑 ${user.name} (Owner)
        </div>
        <a href="owner.html" class="btn btn-primary full">Owner HQ Console</a>
        <a href="admin.html" class="btn btn-soft full" style="margin-top:8px;">Operations Panel</a>
        <button type="button" class="btn btn-soft full global-nav-signout" style="margin-top:8px;">Sign Out</button>
      `;
    }

    return `
      <a href="sign-in.html" class="btn btn-soft full">Sign In</a>
      <a href="onboarding.html" class="btn btn-primary full">Get Started</a>
    `;
  }
}

export const navbarService = new NavbarService();

/**
 * Cliniva Component — Global Notification Bar & Activity Drawer
 * SOLID: Single Responsibility for Header Notification Bell, Badge Counter & Activity Drawer Dropdown
 */

import { notificationService } from "../services/notification.service.js";
import { soundService } from "../services/sound.service.js";

export class NotificationBarComponent {
  constructor(containerId = "notificationBarContainer") {
    this.containerId = containerId;
    this.container = null;
    this.isOpen = false;

    this.onNotificationAdded = this.handleNotificationAdded.bind(this);
    this.onNotificationsUpdated = this.handleNotificationsUpdated.bind(this);
    this.onDocumentClick = this.handleDocumentClick.bind(this);
    this.onKeyDown = this.handleKeyDown.bind(this);
  }

  mount() {
    this.container = document.getElementById(this.containerId);
    if (!this.container) return false;

    this.renderStructure();
    this.bindEvents();
    this.renderNotifications();

    return true;
  }

  renderStructure() {
    this.container.innerHTML = `
      <div class="notif-bell-wrapper" id="notifBellWrapper">
        <button type="button" class="notif-bell-btn" id="notifBellBtn" aria-label="Notifications" title="System Activity Notifications" aria-expanded="false">
          <span class="notif-bell-icon">🔔</span>
          <span class="notif-badge" id="notifUnreadBadge" style="display:none;">0</span>
        </button>

        <div class="notif-dropdown" id="notifDropdown" aria-hidden="true">
          <div class="notif-dropdown-header">
            <div style="display:flex; align-items:center; gap:8px;">
              <span style="font-size:13px; font-weight:800; color:var(--text);">Activity Notifications</span>
              <span class="notif-count-pill" id="notifCountPill">0 new</span>
            </div>
            <button type="button" class="notif-action-btn" id="notifMarkAllReadBtn">
              Mark all read
            </button>
          </div>

          <div class="notif-list" id="notifListContainer">
            <!-- Dynamic notification list items rendered here -->
          </div>

          <div class="notif-dropdown-footer">
            <span style="font-size:11px; color:var(--muted);">Live clinic activity stream</span>
            <button type="button" class="notif-clear-btn" id="notifClearAllBtn">Clear all</button>
          </div>
        </div>
      </div>
    `;

    this.bellBtn = document.getElementById("notifBellBtn");
    this.dropdown = document.getElementById("notifDropdown");
    this.badge = document.getElementById("notifUnreadBadge");
    this.countPill = document.getElementById("notifCountPill");
    this.listContainer = document.getElementById("notifListContainer");
    this.markAllReadBtn = document.getElementById("notifMarkAllReadBtn");
    this.clearAllBtn = document.getElementById("notifClearAllBtn");
  }

  bindEvents() {
    if (this.bellBtn) {
      this.bellBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.toggleDropdown();
      });
    }

    if (this.markAllReadBtn) {
      this.markAllReadBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        soundService.playClickTone();
        notificationService.markAllSystemNotificationsAsRead();
      });
    }

    if (this.clearAllBtn) {
      this.clearAllBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        soundService.playClickTone();
        notificationService.clearAllSystemNotifications();
      });
    }

    // Close on outside click
    document.addEventListener("click", this.onDocumentClick);
    document.addEventListener("keydown", this.onKeyDown);

    // Subscribe to system notification events
    if (typeof window !== "undefined") {
      window.addEventListener("cliniva:systemNotificationAdded", this.onNotificationAdded);
      window.addEventListener("cliniva:systemNotificationsUpdated", this.onNotificationsUpdated);
    }
  }

  toggleDropdown() {
    this.isOpen = !this.isOpen;
    if (!this.dropdown) return;

    if (this.isOpen) {
      this.dropdown.classList.add("open");
      this.dropdown.setAttribute("aria-hidden", "false");
      if (this.bellBtn) this.bellBtn.setAttribute("aria-expanded", "true");
      soundService.playClickTone();
    } else {
      this.closeDropdown();
    }
  }

  closeDropdown() {
    this.isOpen = false;
    if (this.dropdown) {
      this.dropdown.classList.remove("open");
      this.dropdown.setAttribute("aria-hidden", "true");
    }
    if (this.bellBtn) {
      this.bellBtn.setAttribute("aria-expanded", "false");
    }
  }

  handleDocumentClick(e) {
    if (!this.isOpen) return;
    const wrapper = document.getElementById("notifBellWrapper");
    if (wrapper && !wrapper.contains(e.target)) {
      this.closeDropdown();
    }
  }

  handleKeyDown(e) {
    if (e.key === "Escape" && this.isOpen) {
      this.closeDropdown();
    }
  }

  handleNotificationAdded() {
    // Re-render list & badge
    this.renderNotifications();

    // Pulse animation on badge
    if (this.badge) {
      this.badge.classList.remove("pulse");
      void this.badge.offsetWidth; // trigger reflow
      this.badge.classList.add("pulse");
    }
  }

  handleNotificationsUpdated() {
    this.renderNotifications();
  }

  renderNotifications() {
    const notifications = notificationService.getSystemNotifications();
    const unreadCount = notificationService.getUnreadCount();

    // 1. Update Badge
    if (this.badge) {
      if (unreadCount > 0) {
        this.badge.style.display = "inline-flex";
        this.badge.textContent = String(unreadCount > 99 ? "99+" : unreadCount);
      } else {
        this.badge.style.display = "none";
        this.badge.textContent = "0";
      }
    }

    // 2. Update Header Count Pill
    if (this.countPill) {
      this.countPill.textContent = `${unreadCount} unread`;
      this.countPill.style.background = unreadCount > 0 ? "rgba(2, 132, 199, 0.1)" : "#f1f5f9";
      this.countPill.style.color = unreadCount > 0 ? "#0284c7" : "#64748b";
    }

    // 3. Render List Items
    if (!this.listContainer) return;

    if (!notifications || notifications.length === 0) {
      this.listContainer.innerHTML = `
        <div class="notif-empty-state">
          <span style="font-size:24px;">🔕</span>
          <div style="font-size:13px; font-weight:700; color:var(--text); margin-top:6px;">No Notifications Yet</div>
          <p style="font-size:11px; color:var(--muted); margin:4px 0 0;">
            Clinic activity updates like queue calls, therapy completions, and security alerts will appear here.
          </p>
        </div>
      `;
      return;
    }

    this.listContainer.innerHTML = "";

    notifications.forEach((item) => {
      const itemEl = document.createElement("div");
      itemEl.className = `notif-item notif-type-${item.type || "info"} ${item.read ? "read" : "unread"}`;
      itemEl.dataset.id = item.id;

      const icon = this.getCategoryIcon(item.category);

      itemEl.innerHTML = `
        <div class="notif-item-icon">${icon}</div>
        <div class="notif-item-body">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:6px;">
            <span class="notif-item-title">${item.title || "Notification"}</span>
            <span class="notif-item-time">${item.timestamp || ""}</span>
          </div>
          <p class="notif-item-msg">${item.message || ""}</p>
        </div>
        ${!item.read ? `<span class="notif-unread-dot" title="Unread"></span>` : ""}
      `;

      itemEl.addEventListener("click", () => {
        if (!item.read) {
          notificationService.markNotificationAsRead(item.id);
        }
      });

      this.listContainer.appendChild(itemEl);
    });
  }

  getCategoryIcon(category) {
    switch (category) {
      case "QUEUE":
        return "📢";
      case "SESSION":
        return "🩺";
      case "SECURITY":
        return "🔑";
      case "RESERVATION":
        return "📅";
      case "PROFILE":
        return "👤";
      default:
        return "ℹ️";
    }
  }

  destroy() {
    document.removeEventListener("click", this.onDocumentClick);
    document.removeEventListener("keydown", this.onKeyDown);
    if (typeof window !== "undefined") {
      window.removeEventListener("cliniva:systemNotificationAdded", this.onNotificationAdded);
      window.removeEventListener("cliniva:systemNotificationsUpdated", this.onNotificationsUpdated);
    }
  }
}

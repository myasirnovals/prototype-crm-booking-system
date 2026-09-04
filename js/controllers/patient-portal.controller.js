/**
 * Cliniva — Patient Self-Service Portal Controller
 * SOLID: Single Responsibility for Patient Ticket Viewer, Live Queue Tracker & Reschedule
 */

import { authService, USER_ROLES } from "../services/auth.service.js";
import { soundService } from "../services/sound.service.js";
import { notificationService } from "../services/notification.service.js";

export class PatientPortalController {
  constructor() {
    this.signOutBtn = document.getElementById("patientSignOutBtn");
    this.downloadIcsBtn = document.getElementById("patientDownloadIcsBtn");
    this.rescheduleBtn = document.getElementById("patientRescheduleBtn");
    this.cancelBookingBtn = document.getElementById("patientCancelBtn");
    this.channelRadios = document.querySelectorAll("input[name='patientNotifChannel']");

    this.activeBooking = {
      code: "BK-20260901-0812",
      patientName: "Amanda Tan",
      serviceName: "Physiotherapy & Postural Rehabilitation",
      practitionerName: "Dr. Lim Wei Han",
      branchName: "Orchard Wellness Clinic",
      schedule: "Wed, 10:30 SGT (UTC+8)",
      room: "Room A2 (Level 2)",
      depositPaid: "SGD 30.00",
      queueNumber: "A-01"
    };
  }

  init() {
    // Session Guard: Verify user has USER role
    const session = authService.requireAuth([USER_ROLES.USER]);
    if (!session) return;

    this.renderUserInfo(session.user);
    this.setupActions();
    this.setupSignOut();
  }

  renderUserInfo(user) {
    const nameEl = document.getElementById("patientPortalName");
    const contactEl = document.getElementById("patientPortalContact");
    if (nameEl) nameEl.textContent = user.name;
    if (contactEl) contactEl.textContent = user.phone || user.email;
  }

  setupActions() {
    if (this.downloadIcsBtn) {
      this.downloadIcsBtn.addEventListener("click", () => {
        soundService.playClickTone();
        notificationService.downloadCalendarEvent(this.activeBooking);
      });
    }

    if (this.rescheduleBtn) {
      this.rescheduleBtn.addEventListener("click", () => {
        soundService.playClickTone();
        const newDate = prompt(
          `Reschedule Request for Booking [${this.activeBooking.code}].\nEnter preferred new slot:`,
          "Thu, 03 September 2026 - 14:00"
        );
        if (newDate) {
          soundService.playQueueChime();
          alert(`✓ Appointment rescheduled to: ${newDate}. Updated confirmation sent via WhatsApp!`);
        }
      });
    }

    if (this.cancelBookingBtn) {
      this.cancelBookingBtn.addEventListener("click", () => {
        soundService.playClickTone();
        if (confirm(`Are you sure you want to cancel appointment [${this.activeBooking.code}]? Deposit SGD 30.00 will be refunded per clinic policy.`)) {
          soundService.playQueueChime();
          alert("✓ Your reservation has been cancelled. Deposit refund is being processed.");
        }
      });
    }

    this.channelRadios.forEach((radio) => {
      radio.addEventListener("change", (e) => {
        soundService.playClickTone();
        alert(`✓ Primary notification channel set to: ${e.target.value.toUpperCase()}`);
      });
    });
  }

  setupSignOut() {
    if (this.signOutBtn) {
      this.signOutBtn.addEventListener("click", () => {
        soundService.playClickTone();
        if (confirm("Are you sure you want to sign out from the Patient Portal?")) {
          authService.logout();
        }
      });
    }
  }
}

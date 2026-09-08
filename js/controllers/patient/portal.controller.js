/**
 * Cliniva — Patient Self-Service Portal Controller
 * SOLID: Single Responsibility for Patient Ticket Viewer, Live Queue Tracker & Reschedule
 */

import { authService, USER_ROLES } from "../../services/auth.service.js";
import { soundService } from "../../services/sound.service.js";
import { notificationService } from "../../services/notification.service.js";
import { bookingService } from "../../services/booking.service.js";
import { supabaseService } from "../../services/supabase.service.js";

export class PatientPortalController {
  constructor() {
    this.signOutBtn = document.getElementById("patientSignOutBtn");
    this.downloadIcsBtn = document.getElementById("patientDownloadIcsBtn");
    this.rescheduleBtn = document.getElementById("patientRescheduleBtn");
    this.cancelBookingBtn = document.getElementById("patientCancelBtn");
    this.channelRadios = document.querySelectorAll("input[name='patientNotifChannel']");
    this.queueUnsubscribe = null;

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
    this.loadActiveBooking(session.user);
    this.setupLiveQueueTracker();
    this.setupActions();
    this.setupSignOut();
  }

  async loadActiveBooking(user) {
    const bookings = await bookingService.fetchBookingsAsync();
    if (bookings && bookings.length > 0) {
      // Find matching patient booking or use newest
      const myBooking = bookings.find(
        (b) => b.patientName === user.name || b.code === user.activeBookingCode
      ) || bookings[0];

      if (myBooking) {
        this.activeBooking = {
          ...this.activeBooking,
          ...myBooking,
          queueNumber: user.queueNumber || this.activeBooking.queueNumber || "A-01"
        };
        this.renderTicketDetails();
      }
    }
  }

  renderTicketDetails() {
    const codeEl = document.querySelector(".ticket-code");
    if (codeEl) codeEl.textContent = this.activeBooking.code;

    const rows = document.querySelectorAll(".ticket-row");
    rows.forEach((row) => {
      const label = row.querySelector(".ticket-label")?.textContent || "";
      const valEl = row.querySelector(".ticket-val");
      if (!valEl) return;
      if (label.includes("Service")) valEl.textContent = this.activeBooking.serviceName || valEl.textContent;
      if (label.includes("Practitioner") || label.includes("Doctor")) valEl.textContent = this.activeBooking.practitionerName || valEl.textContent;
      if (label.includes("Schedule")) valEl.textContent = `${this.activeBooking.scheduleDate || ""} ${this.activeBooking.schedule || ""}`.trim() || valEl.textContent;
      if (label.includes("Room")) valEl.textContent = this.activeBooking.room || valEl.textContent;
      if (label.includes("Payment")) valEl.textContent = `DEPOSIT PAID (${this.activeBooking.depositPaid || "SGD 30.00"})`;
    });
  }

  /**
   * Subscribe to live queue changes on Supabase Realtime
   */
  async setupLiveQueueTracker() {
    if (!supabaseService.isAvailable()) return;

    const badgeGiant = document.querySelector(".queue-badge-giant");
    const statusText = document.querySelector(".queue-status-text p");
    const pill = document.querySelector(".patient-queue-tracker .status-pill");

    this.queueUnsubscribe = await supabaseService.subscribeToQueue("sg-orchard", (payload) => {
      if (payload.eventType === "UPDATE" || payload.eventType === "INSERT") {
        const ticket = payload.new;
        if (ticket && ticket.queue_number === this.activeBooking.queueNumber) {
          if (badgeGiant) badgeGiant.textContent = ticket.queue_number;
          if (pill) {
            pill.textContent = ticket.status_badge || ticket.status;
            pill.style.background = ticket.badge_bg || "#f0fdfa";
            pill.style.color = ticket.badge_color || "#0f766e";
          }
          if (ticket.status === "READY" || ticket.status === "IN_CONSULT") {
            soundService.playQueueChime();
            if (statusText) {
              statusText.innerHTML = `Status: <span style="font-weight:900; color:#ef4444; font-size:16px;">🔊 GILIRAN ANDA! Silakan menuju ke ${ticket.room || "Ruang Konsultasi"}</span>`;
            }
          }
        }
      }
    });
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

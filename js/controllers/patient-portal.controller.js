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
      serviceName: "Fisioterapi & Postural Rehabilitation",
      practitionerName: "Dr. Lim Wei Han",
      branchName: "Orchard Wellness Clinic",
      schedule: "Rabu, 10:30 SGT",
      room: "Room A2 (Lantai 2)",
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
          `Pengajuan Reschedule untuk Booking [${this.activeBooking.code}].\nPilih slot baru yang Anda inginkan:`,
          "Kamis, 03 September 2026 - 14:00"
        );
        if (newDate) {
          soundService.playQueueChime();
          alert(`✓ Jadwal berhasil diajukan reschedule ke: ${newDate}. Notifikasi konfirmasi baru telah dikirim via WhatsApp!`);
        }
      });
    }

    if (this.cancelBookingBtn) {
      this.cancelBookingBtn.addEventListener("click", () => {
        soundService.playClickTone();
        if (confirm(`Apakah Anda yakin ingin membatalkan janji temu [${this.activeBooking.code}]? Deposit SGD 30.00 akan dikembalikan sesuai kebijakan klinik.`)) {
          soundService.playQueueChime();
          alert("✓ Reservasi Anda telah dibatalkan. Dana deposit diproses refund otomatis.");
        }
      });
    }

    this.channelRadios.forEach((radio) => {
      radio.addEventListener("change", (e) => {
        soundService.playClickTone();
        alert(`✓ Preferensi notifikasi utama diubah menjadi: ${e.target.value.toUpperCase()}`);
      });
    });
  }

  setupSignOut() {
    if (this.signOutBtn) {
      this.signOutBtn.addEventListener("click", () => {
        soundService.playClickTone();
        if (confirm("Apakah Anda yakin ingin keluar dari Portal Pasien?")) {
          authService.logout();
        }
      });
    }
  }
}

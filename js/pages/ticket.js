/**
 * Cliniva — Digital E-Ticket Viewer Bootstrap
 * SOLID: Entry point for E-Ticket rendering & .ics calendar sync
 */

import { notificationService } from "../services/notification.service.js";
import { bookingService } from "../services/booking.service.js";
import { soundService } from "../services/sound.service.js";
import { navbarService } from "../services/navbar.service.js";
import { i18nService } from "../services/i18n.service.js";

document.addEventListener("DOMContentLoaded", () => {
  i18nService.init();
  navbarService.sync();

  const latestBooking = bookingService.getAllBookings()[0] || {
    code: "BK-20260901-0812",
    patientName: "Amanda Tan",
    branchName: "Orchard Wellness Clinic — Singapore",
    branchAddress: "290 Orchard Road, Paragon Medical #14-02, Singapore",
    serviceName: "Physiotherapy & Spine Rehabilitation",
    practitionerName: "Dr. Lim Wei Han",
    schedule: "Wednesday, 10:30 SGT",
    room: "Room A2 (Level 2)",
    paymentStatus: "DEPOSIT PAID (SGD 30.00)"
  };

  // Populate dynamic ticket values if present
  const codeEl = document.getElementById("ticketCodeVal");
  const patientEl = document.getElementById("ticketPatientVal");
  const serviceEl = document.getElementById("ticketServiceVal");
  const practitionerEl = document.getElementById("ticketPractitionerVal");
  const scheduleEl = document.getElementById("ticketScheduleVal");
  const roomEl = document.getElementById("ticketRoomVal");
  const paymentEl = document.getElementById("ticketPaymentVal");

  if (codeEl) codeEl.textContent = latestBooking.code;
  if (patientEl) patientEl.textContent = latestBooking.patientName;
  if (serviceEl) serviceEl.textContent = latestBooking.serviceName;
  if (practitionerEl) practitionerEl.textContent = latestBooking.practitionerName;
  if (scheduleEl) scheduleEl.textContent = latestBooking.schedule;
  if (roomEl && latestBooking.room) roomEl.textContent = latestBooking.room;
  if (paymentEl && latestBooking.paymentStatus) paymentEl.textContent = latestBooking.paymentStatus;

  // Event handlers
  const icsBtn = document.getElementById("ticketIcsBtn");
  if (icsBtn) {
    icsBtn.addEventListener("click", () => {
      soundService.playClickTone();
      notificationService.generateICSFile({
        code: latestBooking.code,
        serviceName: latestBooking.serviceName,
        practitionerName: latestBooking.practitionerName,
        branchName: latestBooking.branchName,
        branchAddress: latestBooking.branchAddress
      });
    });
  }

  const rescheduleBtn = document.getElementById("ticketRescheduleBtn");
  if (rescheduleBtn) {
    rescheduleBtn.addEventListener("click", () => {
      soundService.playClickTone();
      const newSlot = prompt(`Reschedule appointment ${latestBooking.code}. Enter new preferred slot time:`, "14:00 SGT");
      if (newSlot) {
        soundService.playQueueChime();
        alert(`Appointment ${latestBooking.code} rescheduled to ${newSlot}. Confirmation WhatsApp sent.`);
        if (scheduleEl) scheduleEl.textContent = `Wednesday, ${newSlot}`;
      }
    });
  }

  console.log("Cliniva Ticket Viewer initialized with i18n.");
});

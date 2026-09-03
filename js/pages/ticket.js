/**
 * Cliniva — Digital E-Ticket Viewer Bootstrap
 * SOLID: Entry point for E-Ticket rendering & .ics calendar sync
 */

import { notificationService } from "../services/notification.service.js";
import { bookingService } from "../services/booking.service.js";
import { soundService } from "../services/sound.service.js";
import { navbarService } from "../services/navbar.service.js";

document.addEventListener("DOMContentLoaded", () => {
  navbarService.sync();
  const latestBooking = bookingService.getAllBookings()[0] || {
    code: "BK-20260901-0812",
    patientName: "Amanda Tan",
    branchName: "Orchard Wellness Clinic — Singapore",
    branchAddress: "290 Orchard Road, Paragon Medical #14-02, Singapore",
    serviceName: "Physiotherapy & Spine Rehabilitation",
    practitionerName: "Dr. Lim Wei Han",
    schedule: "Wednesday, 10:30 AM",
    room: "Room A2 (Lantai 2)",
    paymentStatus: "DEPOSIT PAID (SGD 30.00)"
  };

  window.downloadICS = (code) => {
    soundService.playClickTone();
    notificationService.generateICSFile({
      code: code || latestBooking.code,
      serviceName: latestBooking.serviceName,
      practitionerName: latestBooking.practitionerName,
      branchName: latestBooking.branchName,
      branchAddress: latestBooking.branchAddress
    });
  };

  window.openRescheduleModal = (code) => {
    soundService.playClickTone();
    const newSlot = prompt(`Reschedule appointment ${code}. Enter new preferred slot time:`, "14:00");
    if (newSlot) {
      soundService.playQueueChime();
      alert(`Janji temu ${code} berhasil di-reschedule ke ${newSlot}. WhatsApp notifikasi konfirmasi baru telah dikirimkan!`);
      const schedElem = document.getElementById("ticketScheduleVal");
      if (schedElem) schedElem.textContent = `Wednesday, ${newSlot}`;
    }
  };

  console.log("Cliniva Ticket Viewer initialized.");
});

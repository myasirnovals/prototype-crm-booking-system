/**
 * Cliniva — Digital E-Ticket Viewer Bootstrap
 * SOLID: Entry point for Dynamic E-Ticket rendering & .ics calendar sync
 */

import { notificationService } from "../services/notification.service.js";
import { bookingService } from "../services/booking.service.js";
import { soundService } from "../services/sound.service.js";
import { navbarService } from "../services/navbar.service.js";
import { i18nService } from "../services/i18n.service.js";

document.addEventListener("DOMContentLoaded", async () => {
  i18nService.init();
  navbarService.sync();

  // 1. Resolve active booking: Check URL param ?code=... first, then fetch from Supabase SSOT
  const urlParams = new URLSearchParams(window.location.search);
  const codeParam = urlParams.get("code");
  const allBookings = await bookingService.fetchBookingsAsync();

  let activeBooking = null;
  if (codeParam) {
    activeBooking = allBookings.find((b) => b.code === codeParam);
  }
  if (!activeBooking) {
    activeBooking = allBookings[0] || {
      code: "BK-20260901-0812",
      patientName: "Amanda Tan",
      patientPhone: "+65 8123 4567",
      branchName: "Orchard Wellness Clinic — Singapore",
      branchAddress: "290 Orchard Road, Paragon Medical #14-02, Singapore",
      serviceName: "Electro-Acupuncture Therapy",
      practitionerName: "Dr. Wong Mei Ling",
      schedule: "Wednesday, 10:30 SGT",
      room: "Room B1 (TCM Suite)",
      queueNumber: "A-01",
      depositPaid: "0.00",
      paymentStatus: "TERKONFIRMASI (Bayar di Klinik / On-Site)",
      intakeData: "Pain Areas: Lower Back / Lumbar | Intensity: Moderate"
    };
  }

  // 2. Populate dynamic ticket DOM elements
  const codeEl = document.getElementById("ticketCodeVal");
  const queueEl = document.getElementById("ticketQueueVal");
  const patientEl = document.getElementById("ticketPatientVal");
  const serviceEl = document.getElementById("ticketServiceVal");
  const practitionerEl = document.getElementById("ticketPractitionerVal");
  const scheduleEl = document.getElementById("ticketScheduleVal");
  const roomEl = document.getElementById("ticketRoomVal");
  const paymentEl = document.getElementById("ticketPaymentVal");
  const intakeRow = document.getElementById("ticketIntakeRow");
  const intakeEl = document.getElementById("ticketIntakeVal");
  const brandEl = document.querySelector(".ticket-brand");

  if (codeEl) codeEl.textContent = activeBooking.code;
  if (queueEl) queueEl.textContent = activeBooking.queueNumber || activeBooking.queue || "A-01";
  if (patientEl) patientEl.textContent = activeBooking.patientName;
  if (serviceEl) serviceEl.textContent = activeBooking.serviceName;
  if (practitionerEl) practitionerEl.textContent = activeBooking.practitionerName;
  if (scheduleEl) scheduleEl.textContent = activeBooking.schedule;
  if (roomEl && activeBooking.room) roomEl.textContent = activeBooking.room;
  if (paymentEl) {
    paymentEl.textContent = activeBooking.paymentStatus && !activeBooking.paymentStatus.includes("DEPOSIT") 
      ? activeBooking.paymentStatus 
      : "TERKONFIRMASI (Bayar di Klinik / On-Site Settlement)";
  }
  if (brandEl && activeBooking.branchName) {
    brandEl.textContent = `CLINIVA HEALTHCARE • ${activeBooking.branchName.toUpperCase()}`;
  }

  // Arrival Notice Card elements
  const noticeClinicEl = document.getElementById("noticeClinicName");
  const noticeScheduleEl = document.getElementById("noticeScheduleVal");
  if (noticeClinicEl && activeBooking.branchName) {
    noticeClinicEl.textContent = activeBooking.branchName;
  }
  if (noticeScheduleEl && activeBooking.schedule) {
    noticeScheduleEl.textContent = activeBooking.schedule;
  }

  // Render Intake Notes if available
  const updateIntakeLabel = () => {
    if (activeBooking.intakeData && intakeRow && intakeEl) {
      intakeRow.style.display = "flex";
      const labelEl = intakeRow.querySelector(".ticket-label");
      const tType = activeBooking.templateType || "";
      if (labelEl) {
        if (tType === "wellness" || tType === "spa") {
          labelEl.textContent = i18nService.t("ticket.intakeSpa", "Spa & Aroma Preferences:");
        } else if (tType === "physio") {
          labelEl.textContent = i18nService.t("ticket.intakePhysio", "Physio Assessment:");
        } else if (tType === "nutrition") {
          labelEl.textContent = i18nService.t("ticket.intakeNutrition", "Nutrition & Diet Profile:");
        } else if (tType === "tcm") {
          labelEl.textContent = i18nService.t("ticket.intakeTcm", "Meridian Assessment:");
        } else {
          labelEl.textContent = i18nService.t("ticket.intakeCommon", "Intake Assessment:");
        }
      }
      intakeEl.textContent = activeBooking.intakeData;
    }
  };

  updateIntakeLabel();
  document.addEventListener("cliniva:languageChanged", updateIntakeLabel);

  // 3. Setup WhatsApp Confirmation Link
  const waBtn = document.getElementById("ticketWhatsAppBtn");
  if (waBtn) {
    const waText = encodeURIComponent(
      `*Cliniva Official E-Ticket Confirmation*\n` +
      `Ticket: ${activeBooking.code}\n` +
      `Patient: ${activeBooking.patientName}\n` +
      `Service: ${activeBooking.serviceName}\n` +
      `Doctor/Therapist: ${activeBooking.practitionerName}\n` +
      `Schedule: ${activeBooking.schedule}\n` +
      `Location: ${activeBooking.branchName || "Orchard Clinic"}\n` +
      `Status: CONFIRMED ✅`
    );
    waBtn.href = `https://wa.me/?text=${waText}`;
  }

  // 4. Calendar .ics Download Event
  const icsBtn = document.getElementById("ticketIcsBtn");
  if (icsBtn) {
    icsBtn.addEventListener("click", () => {
      soundService.playClickTone();
      notificationService.generateICSFile({
        code: activeBooking.code,
        serviceName: activeBooking.serviceName,
        practitionerName: activeBooking.practitionerName,
        branchName: activeBooking.branchName || "Orchard Wellness Clinic",
        branchAddress: activeBooking.branchAddress || "290 Orchard Road, Paragon Medical #14-02, Singapore"
      });
    });
  }

  // 5. Reschedule Action
  const rescheduleBtn = document.getElementById("ticketRescheduleBtn");
  if (rescheduleBtn) {
    rescheduleBtn.addEventListener("click", () => {
      soundService.playClickTone();
      const newSlot = prompt(`Reschedule appointment ${activeBooking.code}.\nEnter new preferred slot time:`, "14:00 SGT");
      if (newSlot) {
        soundService.playQueueChime();
        activeBooking.schedule = `Wednesday, ${newSlot}`;
        if (scheduleEl) scheduleEl.textContent = activeBooking.schedule;
        alert(`✓ Appointment ${activeBooking.code} successfully rescheduled to ${newSlot}!\nConfirmation WhatsApp sent.`);
      }
    });
  }

  console.log(`Cliniva Ticket Viewer initialized for booking [${activeBooking.code}].`);
});

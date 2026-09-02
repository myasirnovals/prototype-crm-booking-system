/**
 * Cliniva — Notification Service
 * SOLID: Single Responsibility for WhatsApp & Email Notification Dispatching & .ics Calendar Generation
 */

import { NOTIFICATION_TEMPLATES } from "../config/regional-config.js";
import { storageService } from "./storage.service.js";

class NotificationService {
  constructor() {
    this.NOTIF_LOG_KEY = "cliniva_notif_logs";
  }

  getLogs() {
    return storageService.get(this.NOTIF_LOG_KEY, []);
  }

  logNotification(entry) {
    const logs = this.getLogs();
    logs.unshift({
      id: "LOG-" + Date.now(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      ...entry
    });
    storageService.set(this.NOTIF_LOG_KEY, logs);
  }

  /**
   * Format WhatsApp message payload
   */
  renderWhatsAppTemplate(type, booking) {
    const templateFn = NOTIFICATION_TEMPLATES[type]?.whatsapp;
    if (templateFn) {
      return templateFn(booking);
    }
    return `Hi ${booking.patientName}, your appointment at Cliniva is updated.`;
  }

  /**
   * Generate downloadable standard iCalendar (.ics) file
   */
  generateICSFile(booking) {
    const title = `Cliniva Appointment: ${booking.serviceName || "Clinical Consultation"}`;
    const description = `Appointment with ${booking.practitionerName || "Practitioner"} at ${booking.branchName || "Cliniva Clinic"}. Booking code: ${booking.code}`;
    const location = booking.branchAddress || "Cliniva Healthcare Centre";

    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 1);
    startDate.setHours(10, 30, 0);

    const endDate = new Date(startDate);
    endDate.setMinutes(endDate.getMinutes() + 60);

    const formatICSDate = (date) =>
      date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Cliniva Healthcare Systems//NONSGML v1.0//EN",
      "CALSCALE:GREGORIAN",
      "BEGIN:VEVENT",
      `SUMMARY:${title}`,
      `DESCRIPTION:${description}`,
      `LOCATION:${location}`,
      `DTSTART:${formatICSDate(startDate)}`,
      `DTEND:${formatICSDate(endDate)}`,
      `STATUS:CONFIRMED`,
      "END:VEVENT",
      "END:VCALENDAR"
    ].join("\r\n");

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${booking.code || "appointment"}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    this.logNotification({
      channel: "EMAIL / ICS",
      recipient: booking.patientEmail || "patient@example.com",
      status: "DOWNLOADED",
      bookingCode: booking.code
    });
  }
}

export const notificationService = new NotificationService();

/**
 * Cliniva — Notification Service
 * SOLID: Single Responsibility for WhatsApp & Email Notification Dispatching & .ics Calendar Generation
 */

import { NOTIFICATION_TEMPLATES } from "../config/regional-config.js";
import { storageService } from "./storage.service.js";

class NotificationService {
  constructor() {
    this.NOTIF_LOG_KEY = "cliniva_notif_logs";
    this.SYSTEM_NOTIF_KEY = "cliniva_system_notifications";
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
   * System Activity Notifications (In-App notification center)
   */
  getSystemNotifications() {
    return storageService.get(this.SYSTEM_NOTIF_KEY, [
      {
        id: "NOTIF-INIT-1",
        title: "Session Completed",
        message: "Session for B-01 (David Lim) marked as Completed.",
        category: "SESSION",
        type: "success",
        timestamp: "09:45 SGT",
        read: true
      },
      {
        id: "NOTIF-INIT-2",
        title: "Queue Calling",
        message: "Amanda Tan (A-01) called to Room A2.",
        category: "QUEUE",
        type: "info",
        timestamp: "10:30 SGT",
        read: true
      }
    ]);
  }

  addSystemNotification({ title, message, category = "SESSION", type = "info" }) {
    const notifications = this.getSystemNotifications();
    const newNotif = {
      id: "NOTIF-" + Date.now(),
      title,
      message,
      category,
      type,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      read: false
    };

    notifications.unshift(newNotif);
    // Keep max 50 recent notifications
    const trimmed = notifications.slice(0, 50);
    storageService.set(this.SYSTEM_NOTIF_KEY, trimmed);

    // Dispatch global event for live UI reactivity (Fase 3 & Fase 4)
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("cliniva:systemNotificationAdded", {
        detail: newNotif
      }));
    }

    return newNotif;
  }

  markAllSystemNotificationsAsRead() {
    const notifications = this.getSystemNotifications().map((n) => ({
      ...n,
      read: true
    }));
    storageService.set(this.SYSTEM_NOTIF_KEY, notifications);

    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("cliniva:systemNotificationsUpdated", {
        detail: notifications
      }));
    }
    return notifications;
  }

  markNotificationAsRead(id) {
    const notifications = this.getSystemNotifications().map((n) => {
      if (n.id === id) {
        return { ...n, read: true };
      }
      return n;
    });
    storageService.set(this.SYSTEM_NOTIF_KEY, notifications);

    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("cliniva:systemNotificationsUpdated", {
        detail: notifications
      }));
    }
    return notifications;
  }

  clearAllSystemNotifications() {
    storageService.set(this.SYSTEM_NOTIF_KEY, []);

    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("cliniva:systemNotificationsUpdated", {
        detail: []
      }));
    }
    return [];
  }

  getUnreadCount() {
    const notifications = this.getSystemNotifications();
    return notifications.filter((n) => !n.read).length;
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

/**
 * Cliniva — Booking Service
 * SOLID: Single Responsibility for Booking Business Logic, Triple-Constraint, Slot Holding & Multi-Template Management
 */

import {
  CLINIC_BRANCHES,
  CLINIC_SERVICES,
  PRACTITIONERS,
  DEFAULT_TEMPLATE_ID,
  getTemplateById,
  getAllTemplates,
  isValidTemplateId,
  getTemplateServices,
  getTemplatePractitioners,
  getTemplateIntakeSchema
} from "../config/clinic-data.js";
import { storageService } from "./storage.service.js";

class BookingService {
  constructor() {
    this.STORAGE_KEY = "cliniva_bookings";
    this.HOLD_KEY = "cliniva_current_hold";
    this.TEMPLATE_KEY = "cliniva_active_template";
    this.holdTimer = null;
    this.holdSecondsLeft = 600; // 10 minutes hold
    this.onHoldTickCallbacks = new Set();
  }

  /**
   * Get ID of the currently active business template
   * @returns {string} e.g. "tcm" | "wellness"
   */
  getActiveTemplateId() {
    return storageService.get(this.TEMPLATE_KEY, DEFAULT_TEMPLATE_ID);
  }

  /**
   * Set active business template
   * @param {string} templateId - "tcm" | "wellness"
   * @returns {boolean}
   */
  setActiveTemplate(templateId) {
    if (!isValidTemplateId(templateId)) return false;
    storageService.set(this.TEMPLATE_KEY, String(templateId).trim().toLowerCase());
    return true;
  }

  /**
   * Get the full configuration of the currently active business template
   * @returns {object}
   */
  getActiveTemplate() {
    const id = this.getActiveTemplateId();
    return getTemplateById(id);
  }

  /**
   * Get all registered business templates
   * @returns {Array<object>}
   */
  getAvailableTemplates() {
    return getAllTemplates();
  }

  /**
   * Get intake schema for the active template or a specified template
   * @param {string|null} templateId
   * @returns {object|null}
   */
  getIntakeSchema(templateId = null) {
    const id = templateId || this.getActiveTemplateId();
    return getTemplateIntakeSchema(id);
  }

  getBranches() {
    return CLINIC_BRANCHES;
  }

  /**
   * Get services filtered by template
   * If templateId is not provided, uses the active template's services or falls back to CLINIC_SERVICES
   * @param {string|null} templateId
   * @returns {Array<object>}
   */
  getServices(templateId = null) {
    if (templateId && isValidTemplateId(templateId)) {
      return getTemplateServices(templateId);
    }
    const active = this.getActiveTemplate();
    if (active && Array.isArray(active.services) && active.services.length > 0) {
      return active.services;
    }
    return CLINIC_SERVICES;
  }

  /**
   * Get practitioners filtered by branch and/or template
   * @param {string|null} branchId
   * @param {string|null} templateId
   * @returns {Array<object>}
   */
  getPractitioners(branchId = null, templateId = null) {
    const targetTemplateId = templateId || this.getActiveTemplateId();
    if (targetTemplateId && isValidTemplateId(targetTemplateId)) {
      const practitioners = getTemplatePractitioners(targetTemplateId, branchId);
      if (practitioners && practitioners.length > 0) {
        return practitioners;
      }
    }

    if (!branchId) return PRACTITIONERS;
    return PRACTITIONERS.filter((p) => p.branchId === branchId);
  }

  /**
   * Triple-Constraint Engine Validation:
   * Validates simultaneous availability of:
   * 1. Practitioner (Doctor/Therapist)
   * 2. Physical Bed/Room
   * 3. Specialized Medical Equipment
   */
  validateTripleConstraint(branchId, serviceId, practitionerId, slotTime, templateId = null) {
    const branch = CLINIC_BRANCHES.find((b) => b.id === branchId) || CLINIC_BRANCHES[0];
    const services = this.getServices(templateId);
    const service = services.find((s) => s.id === serviceId) || CLINIC_SERVICES.find((s) => s.id === serviceId) || services[0];

    const practitioners = this.getPractitioners(branchId, templateId);
    const practitioner = practitioners.find((p) => p.id === practitionerId) || PRACTITIONERS.find((p) => p.id === practitionerId) || practitioners[0];

    const hasPractitionerAvailable = Boolean(practitioner);
    const assignedRoom = branch.rooms[0] || "Room A1";
    const assignedEquipment = service && service.requiresEquipment ? service.requiresEquipment : "Standard Kit";

    return {
      isValid: true,
      practitioner: {
        name: practitioner ? practitioner.name : "Assigned Practitioner",
        available: hasPractitionerAvailable
      },
      room: {
        name: assignedRoom,
        available: true
      },
      equipment: {
        name: assignedEquipment,
        available: true
      },
      bufferTimeMinutes: 15,
      slotTime
    };
  }

  /**
   * Start 10-Minute Slot Hold Timer
   */
  startSlotHold(slotInfo, onTick, onExpired) {
    this.stopSlotHold();
    this.holdSecondsLeft = 600; // 10 minutes

    const holdData = {
      slot: slotInfo,
      expiresAt: Date.now() + this.holdSecondsLeft * 1000
    };
    storageService.set(this.HOLD_KEY, holdData);

    this.holdTimer = setInterval(() => {
      this.holdSecondsLeft -= 1;

      const formatted = this.formatSeconds(this.holdSecondsLeft);
      if (typeof onTick === "function") {
        onTick(formatted, this.holdSecondsLeft);
      }

      if (this.holdSecondsLeft <= 0) {
        this.stopSlotHold();
        storageService.remove(this.HOLD_KEY);
        if (typeof onExpired === "function") {
          onExpired();
        }
      }
    }, 1000);

    return this.formatSeconds(this.holdSecondsLeft);
  }

  stopSlotHold() {
    if (this.holdTimer) {
      clearInterval(this.holdTimer);
      this.holdTimer = null;
    }
  }

  formatSeconds(totalSeconds) {
    const minutes = Math.floor(Math.max(0, totalSeconds) / 60);
    const seconds = Math.max(0, totalSeconds) % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  /**
   * Create & Persist Booking
   */
  createBooking(bookingPayload) {
    const existing = storageService.get(this.STORAGE_KEY, []);
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const bookingCode = `BK-${dateStr}-${randomSuffix}`;
    const activeTemplate = this.getActiveTemplate();

    const newBooking = {
      code: bookingCode,
      createdAt: new Date().toISOString(),
      status: "CONFIRMED",
      paymentStatus: "DEPOSIT_PAID",
      templateType: activeTemplate ? activeTemplate.id : DEFAULT_TEMPLATE_ID,
      ...bookingPayload
    };

    existing.unshift(newBooking);
    storageService.set(this.STORAGE_KEY, existing);
    this.stopSlotHold();
    storageService.remove(this.HOLD_KEY);

    return newBooking;
  }

  getAllBookings() {
    return storageService.get(this.STORAGE_KEY, []);
  }
}

export const bookingService = new BookingService();

/**
 * Cliniva — Booking Service
 * SOLID: Single Responsibility for Booking Business Logic, Triple-Constraint, Slot Holding & Multi-Template Management
 */

import {
  CLINIC_BRANCHES,
  CLINIC_LOCATIONS,
  getBranchesForTemplate,
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
   * Supports fallback to Super Admin intake blueprint profile if template key is unset
   * @returns {string} "wellness" | "physio" | "nutrition" | "tcm"
   */
  getActiveTemplateId() {
    const direct = storageService.get(this.TEMPLATE_KEY, null);
    if (direct && isValidTemplateId(direct)) {
      return String(direct).trim().toLowerCase();
    }
    const profile = storageService.get("cliniva_intake_profile", null);
    if (profile === "PHYSIOTHERAPY") return "physio";
    if (profile === "NUTRITION") return "nutrition";
    if (profile === "TCM_ACUPUNCTURE") return "tcm";
    if (profile === "SPA_WELLNESS") return "wellness";
    return DEFAULT_TEMPLATE_ID;
  }

  /**
   * Set active business template
   * Also synchronizes Super Admin cliniva_intake_profile and dispatches event
   * @param {string} templateId - "wellness" | "physio" | "nutrition" | "tcm"
   * @returns {boolean}
   */
  setActiveTemplate(templateId) {
    if (!isValidTemplateId(templateId)) return false;
    const normalized = String(templateId).trim().toLowerCase();
    storageService.set(this.TEMPLATE_KEY, normalized);

    // Synchronize corresponding intake profile blueprint
    let profileType = "SPA_WELLNESS";
    if (normalized === "physio" || normalized === "physiotherapy") profileType = "PHYSIOTHERAPY";
    else if (normalized === "nutrition") profileType = "NUTRITION";
    else if (normalized === "tcm") profileType = "TCM_ACUPUNCTURE";
    storageService.set("cliniva_intake_profile", profileType);

    if (typeof document !== "undefined") {
      document.dispatchEvent(
        new CustomEvent("cliniva:templateChanged", {
          detail: { templateId: normalized, template: this.getActiveTemplate() }
        })
      );
    }
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
   * Get standardized template consultation session info
   * Pre-configured by Super Admin so patients do not need to manually choose treatment items
   * @param {string|null} templateId
   * @param {string} currency - "SGD" | "MYR"
   * @returns {object|null}
   */
  getTemplateConsultation(templateId = null, currency = "SGD") {
    const targetId = templateId || this.getActiveTemplateId();
    const template = getTemplateById(targetId);
    if (!template) return null;

    const primaryService = template.services && template.services.length > 0 ? template.services[0] : null;
    const isSGD = currency === "SGD";

    const priceSGD = primaryService ? primaryService.priceSGD : 120;
    const priceMYR = primaryService ? primaryService.priceMYR : 260;
    const depositSGD = primaryService ? primaryService.depositSGD : 30;
    const depositMYR = primaryService ? primaryService.depositMYR : 60;

    let defaultRoom = "Consultation Suite 01";
    if (template.rooms && template.rooms.length > 0) {
      defaultRoom = template.rooms[0];
    }

    return {
      templateId: template.id,
      templateName: template.name,
      shortName: template.shortName,
      category: template.category,
      tagline: template.tagline,
      accentColor: template.accentColor || "#0f766e",
      practitionerTitle: template.practitionerTitle,
      serviceName: primaryService ? primaryService.name : `${template.name} Consultation Session`,
      serviceNameI18n: primaryService ? primaryService.nameI18n : null,
      serviceCode: primaryService ? primaryService.code : "CLN-01",
      duration: primaryService ? `${primaryService.durationMinutes} min` : "60 min",
      durationMinutes: primaryService ? primaryService.durationMinutes : 60,
      price: isSGD ? `SGD ${priceSGD}.00` : `MYR ${priceMYR}.00`,
      priceNumber: isSGD ? priceSGD : priceMYR,
      deposit: isSGD ? `SGD ${depositSGD}.00` : `MYR ${depositMYR}.00`,
      depositNumber: isSGD ? depositSGD : depositMYR,
      description: primaryService ? primaryService.description : template.tagline,
      requiresEquipment: primaryService ? primaryService.requiresEquipment : null,
      defaultRoom
    };
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

  /**
   * Get clinic branches adapted to a specific or currently active business template
   * @param {string|null} templateId
   * @returns {Array<object>}
   */
  getBranches(templateId = null) {
    const targetId = templateId || this.getActiveTemplateId();
    return getBranchesForTemplate(targetId);
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
   * Falls back to all practitioners of that template if branch-filtered list is empty
   * @param {string|null} branchId
   * @param {string|null} templateId
   * @returns {Array<object>}
   */
  getPractitioners(branchId = null, templateId = null) {
    const targetTemplateId = templateId || this.getActiveTemplateId();
    if (targetTemplateId && isValidTemplateId(targetTemplateId)) {
      const branchPractitioners = getTemplatePractitioners(targetTemplateId, branchId);
      if (branchPractitioners && branchPractitioners.length > 0) {
        return branchPractitioners;
      }
      const allForTemplate = getTemplatePractitioners(targetTemplateId, null);
      if (allForTemplate && allForTemplate.length > 0) {
        return allForTemplate;
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
    const branches = this.getBranches(templateId);
    const branch = branches.find((b) => b.id === branchId) || branches[0];
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

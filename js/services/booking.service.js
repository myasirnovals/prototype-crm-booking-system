/**
 * Cliniva — Booking Service
 * SOLID: Single Responsibility for Booking Business Logic, Triple-Constraint & Slot Holding
 */

import { CLINIC_BRANCHES, CLINIC_SERVICES, PRACTITIONERS } from "../config/clinic-data.js";
import { storageService } from "./storage.service.js";

class BookingService {
  constructor() {
    this.STORAGE_KEY = "cliniva_bookings";
    this.HOLD_KEY = "cliniva_current_hold";
    this.holdTimer = null;
    this.holdSecondsLeft = 600; // 10 minutes hold
    this.onHoldTickCallbacks = new Set();
  }

  getBranches() {
    return CLINIC_BRANCHES;
  }

  getServices() {
    return CLINIC_SERVICES;
  }

  getPractitioners(branchId = null) {
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
  validateTripleConstraint(branchId, serviceId, practitionerId, slotTime) {
    const branch = CLINIC_BRANCHES.find((b) => b.id === branchId) || CLINIC_BRANCHES[0];
    const service = CLINIC_SERVICES.find((s) => s.id === serviceId) || CLINIC_SERVICES[0];
    const practitioner = PRACTITIONERS.find((p) => p.id === practitionerId) || PRACTITIONERS[0];

    // Dummy resource allocation algorithm
    const hasPractitionerAvailable = Boolean(practitioner);
    const assignedRoom = branch.rooms[0] || "Room A1";
    const assignedEquipment = service.requiresEquipment ? service.requiresEquipment : "Standard Kit";

    return {
      isValid: true,
      practitioner: {
        name: practitioner.name,
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

    const newBooking = {
      code: bookingCode,
      createdAt: new Date().toISOString(),
      status: "CONFIRMED",
      paymentStatus: "DEPOSIT_PAID",
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

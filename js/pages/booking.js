/**
 * Cliniva — Patient Booking Page Bootstrap
 * SOLID: Entry point for patient booking wizard
 */

import { PatientBookingController } from "../controllers/patient-booking.controller.js";
import { i18nService } from "../services/i18n.service.js";

document.addEventListener("DOMContentLoaded", () => {
  i18nService.init();
  const controller = new PatientBookingController();
  controller.init();
  console.log("Cliniva Patient Booking Wizard initialized with i18n.");
});

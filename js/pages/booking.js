/**
 * Cliniva — Patient Booking Page Bootstrap
 * SOLID: Entry point for patient booking wizard
 */

import { PatientBookingController } from "../controllers/patient-booking.controller.js";

document.addEventListener("DOMContentLoaded", () => {
  const controller = new PatientBookingController();
  controller.init();
  console.log("Cliniva Patient Booking Wizard initialized.");
});

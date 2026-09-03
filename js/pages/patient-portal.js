/**
 * Cliniva — Patient Self-Service Portal Bootstrap
 * SOLID: Entry point for Patient Ticket, Live Queue Tracker & Rescheduling
 */

import { PatientPortalController } from "../controllers/patient-portal.controller.js";

document.addEventListener("DOMContentLoaded", () => {
  const patientPortal = new PatientPortalController();
  patientPortal.init();

  console.log("Cliniva Patient Portal Controller initialized.");
});

/**
 * Cliniva — Patient Self-Service Portal Bootstrap
 * SOLID: Entry point for Patient Ticket, Live Queue Tracker & Rescheduling
 */

import { PatientPortalController } from "../controllers/patient-portal.controller.js";
import { i18nService } from "../services/i18n.service.js";

document.addEventListener("DOMContentLoaded", () => {
  i18nService.init();
  const patientPortal = new PatientPortalController();
  patientPortal.init();

  console.log("Cliniva Patient Portal Controller initialized with i18n.");
});

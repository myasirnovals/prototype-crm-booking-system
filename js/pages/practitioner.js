/**
 * Cliniva — Practitioner / Doctor Workspace Bootstrap
 * SOLID: Entry point for Practitioner Schedule, Chime Calling & Body Pain Map
 */

import { PractitionerController } from "../controllers/practitioner.controller.js";
import { i18nService } from "../services/i18n.service.js";

document.addEventListener("DOMContentLoaded", () => {
  i18nService.init();
  const practitioner = new PractitionerController();
  practitioner.init();

  console.log("Cliniva Practitioner Controller initialized with i18n.");
});

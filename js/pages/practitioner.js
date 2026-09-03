/**
 * Cliniva — Practitioner / Doctor Workspace Bootstrap
 * SOLID: Entry point for Practitioner Schedule, Chime Calling & Body Pain Map
 */

import { PractitionerController } from "../controllers/practitioner.controller.js";

document.addEventListener("DOMContentLoaded", () => {
  const practitioner = new PractitionerController();
  practitioner.init();

  console.log("Cliniva Practitioner Controller initialized.");
});

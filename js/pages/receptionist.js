/**
 * Cliniva — Receptionist Operations Bootstrap
 * SOLID: Entry point for Reception Desk, Live Queue, and POS Cashier
 */

import { ReceptionistController } from "../controllers/receptionist.controller.js";
import { i18nService } from "../services/i18n.service.js";

document.addEventListener("DOMContentLoaded", () => {
  i18nService.init();
  const receptionist = new ReceptionistController();
  receptionist.init();

  console.log("Cliniva Receptionist Controller initialized with i18n.");
});

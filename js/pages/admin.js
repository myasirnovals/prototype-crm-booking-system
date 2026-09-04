/**
 * Cliniva — Admin Dashboard Bootstrap
 * SOLID: Entry point for Operations Dashboard, Live Queue and SIMRS Bridging Hub
 */

import { AdminController } from "../controllers/admin.controller.js";
import { i18nService } from "../services/i18n.service.js";

document.addEventListener("DOMContentLoaded", () => {
  i18nService.init();
  const admin = new AdminController();
  admin.init();

  console.log("Cliniva Admin Controller initialized with i18n.");
});

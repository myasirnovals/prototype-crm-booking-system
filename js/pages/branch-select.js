/**
 * Cliniva — Branch Selection Gateway Page Bootstrap
 * SOLID: Entry point for branch gateway page
 */

import { BranchSelectController } from "../controllers/branch-select.controller.js";
import { i18nService } from "../services/i18n.service.js";

document.addEventListener("DOMContentLoaded", () => {
  i18nService.init();

  const controller = new BranchSelectController();
  controller.init();

  console.log("Cliniva Branch Select Controller initialized.");
});

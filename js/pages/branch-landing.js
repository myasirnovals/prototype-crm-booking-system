/**
 * Cliniva — Public Branch Landing Page Bootstrap
 * SOLID: Entry point for Public B2C Branch Storefront (branch.html)
 */

import { branchLandingController } from "../controllers/public/branch-landing.controller.js";
import { i18nService } from "../services/i18n.service.js";

document.addEventListener("DOMContentLoaded", () => {
  // Initialize internationalization first
  i18nService.init();

  // Initialize the Branch Landing Controller
  branchLandingController.init();
});

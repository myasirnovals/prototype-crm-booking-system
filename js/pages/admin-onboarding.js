/**
 * Cliniva — Admin Onboarding Setup Wizard Page Bootstrap
 * SOLID: Entry point for WordPress-style setup wizard for newly provisioned clinic owners
 */

import { AdminOnboardingController } from "../controllers/admin-onboarding.controller.js";
import { i18nService } from "../services/i18n.service.js";

document.addEventListener("DOMContentLoaded", () => {
  i18nService.init();

  const wizard = new AdminOnboardingController();
  wizard.init();

  console.log("Cliniva Admin Onboarding Setup Wizard initialized successfully.");
});

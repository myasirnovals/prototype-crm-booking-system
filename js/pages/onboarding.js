/**
 * Cliniva — Onboarding Page Bootstrap
 * SOLID: Entry point for clinic onboarding and Super Admin creation
 */

import { OnboardingController } from "../controllers/onboarding.controller.js";
import { i18nService } from "../services/i18n.service.js";

document.addEventListener("DOMContentLoaded", () => {
  i18nService.init();

  const onboarding = new OnboardingController();
  onboarding.init();

  console.log("Cliniva Clinic Onboarding & Provisioning initialized successfully with i18n multilingual support.");
});

/**
 * Cliniva — Onboarding Page Bootstrap
 * SOLID: Entry point for clinic onboarding and Super Admin creation
 */

import { OnboardingController } from "../controllers/onboarding.controller.js";

document.addEventListener("DOMContentLoaded", () => {
  const onboarding = new OnboardingController();
  onboarding.init();

  console.log("Cliniva Clinic Onboarding & Provisioning initialized successfully.");
});

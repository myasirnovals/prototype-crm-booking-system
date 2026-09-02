/**
 * Cliniva — Auth Page Bootstrap
 * SOLID: Entry point for Sign In and OTP authentication
 */

import { AuthController } from "../controllers/auth.controller.js";
import { i18nService } from "../services/i18n.service.js";

document.addEventListener("DOMContentLoaded", () => {
  i18nService.init();

  const auth = new AuthController();
  auth.init();

  console.log("Cliniva Auth Controller initialized with i18n multilingual support.");
});

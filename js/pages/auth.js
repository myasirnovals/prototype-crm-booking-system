/**
 * Cliniva — Auth Page Bootstrap
 * SOLID: Entry point for Sign In and OTP authentication
 */

import { AuthController } from "../controllers/public/auth.controller.js";
import { i18nService } from "../services/i18n.service.js";

function initAuthPage() {
  try {
    i18nService.init();

    const auth = new AuthController();
    auth.init();

    console.log("Cliniva Auth Controller initialized with i18n multilingual support.");
  } catch (err) {
    console.error("[Cliniva Auth] Initialization error:", err);
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initAuthPage);
} else {
  // Document already parsed / ready (e.g. extension injection, caching, module delay)
  initAuthPage();
}

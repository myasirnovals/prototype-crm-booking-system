/**
 * Cliniva — Admin Onboarding Setup Wizard Page Bootstrap
 * SOLID: Entry point for WordPress-style setup wizard for newly provisioned clinic owners
 *
 * Prototype Note: Automatically injects a demo "Dennis Pratama" owner session
 * when no session is found, allowing direct URL access on Vercel for demo/review.
 */

import { AdminOnboardingController } from "../controllers/owner/onboarding.controller.js";
import { i18nService } from "../services/i18n.service.js";
import { storageService } from "../services/storage.service.js";

// ── Prototype Demo Session Injection ──────────────────────────────────────────
// If no session exists (direct URL access or fresh browser), inject Dennis demo
// so the wizard is immediately accessible without going through sign-in.
(function injectDemoSessionIfNeeded() {
  const SESSION_KEY = "cliniva_auth_session";
  const existing = storageService.get(SESSION_KEY, null);
  if (!existing) {
    const demoSession = {
      role: "OWNER",
      user: {
        id: "usr-owner-dennis",
        email: "dennis@cliniva.com",
        phone: "+65 8999 7788",
        name: "Dennis Pratama",
        title: "New Clinic Partner & Owner",
        role: "OWNER",
        branchId: null,
        branchName: "Setup Pending",
        region: "sg",
        avatar: "💼",
        onboardingCompleted: false,
        createdAt: "2026-09-08T08:30:00.000Z"
      },
      loginAt: new Date().toISOString(),
      isDemo: true
    };
    storageService.set(SESSION_KEY, demoSession);
    console.info("[Cliniva] No session found — injected demo Owner session for wizard preview.");
  }
})();

document.addEventListener("DOMContentLoaded", () => {
  i18nService.init();

  const wizard = new AdminOnboardingController();
  wizard.init();

  console.log("Cliniva Admin Onboarding Setup Wizard initialized successfully.");
});

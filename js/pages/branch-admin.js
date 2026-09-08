/**
 * Cliniva — Branch Admin Operations Bootstrap
 * SOLID: Entry Point for Branch Admin Console (Front Desk, Live Queue, Doctors, & POS)
 */

import { BranchAdminController } from "../controllers/branch-admin/dashboard.controller.js";
import { NotificationBarComponent } from "../components/notification-bar.component.js";
import { ProfileModalComponent } from "../components/profile-modal.component.js";
import { i18nService } from "../services/i18n.service.js";

document.addEventListener("DOMContentLoaded", () => {
  // 1. Initialize Localization
  try {
    i18nService.init?.();
  } catch (err) {
    console.warn("[BranchAdmin] i18n initialization warning:", err);
  }

  // 2. Initialize Global Notification Bar & Activity Drawer
  try {
    const notifBar = new NotificationBarComponent("notificationBarContainer");
    notifBar.mount();
  } catch (err) {
    console.warn("[BranchAdmin] NotificationBarComponent mount warning:", err);
  }

  // 3. Initialize Staff Profile Modal
  try {
    const profileModal = new ProfileModalComponent();
    profileModal.mount();
  } catch (err) {
    console.warn("[BranchAdmin] ProfileModalComponent mount warning:", err);
  }

  // 4. Initialize Language Switcher Dropdown
  const langSelect = document.querySelector(".lang-select");
  if (langSelect) {
    langSelect.addEventListener("change", (e) => {
      i18nService.setLanguage?.(e.target.value);
    });
  }

  // 5. Initialize Branch Admin Controller
  try {
    const branchAdmin = new BranchAdminController();
    branchAdmin.init();
    console.log("Cliniva Branch Admin Controller, Notification Bar & Profile Modal initialized.");
  } catch (err) {
    console.error("[BranchAdmin] Fatal error initializing BranchAdminController:", err);
  }
});

/**
 * Cliniva — Branch Admin Operations Bootstrap
 * SOLID: Entry Point for Branch Admin Console (Front Desk, Live Queue, Doctors, & POS)
 */

import { BranchAdminController } from "../controllers/branch-admin/dashboard.controller.js";
import { notificationService } from "../services/notification.service.js";
import { i18nService } from "../services/i18n.service.js";

document.addEventListener("DOMContentLoaded", () => {
  // 1. Initialize Notification Bar
  const notifContainer = document.getElementById("notificationBarContainer");
  if (notifContainer) {
    notificationService.init(notifContainer);
  }

  // 2. Initialize Language Switcher
  const langSelect = document.querySelector(".lang-select");
  if (langSelect) {
    langSelect.addEventListener("change", (e) => {
      i18nService.setLanguage(e.target.value);
    });
  }

  // 3. Initialize Branch Admin Controller
  const branchAdmin = new BranchAdminController();
  branchAdmin.init();
});

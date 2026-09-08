/**
 * Cliniva — Dedicated Clinic Owner Dashboard Bootstrap
 * SOLID: Entry point for Owner Dashboard & Branch Operations
 */

import { OwnerDashboardController } from "../controllers/owner-dashboard.controller.js";
import { NotificationBarComponent } from "../components/notification-bar.component.js";
import { i18nService } from "../services/i18n.service.js";

document.addEventListener("DOMContentLoaded", () => {
  i18nService.init();

  const notifBar = new NotificationBarComponent("notificationBarContainer");
  notifBar.mount();

  const controller = new OwnerDashboardController();
  controller.init();

  console.log("Cliniva Owner Dashboard Controller & Notification Bar initialized.");
});

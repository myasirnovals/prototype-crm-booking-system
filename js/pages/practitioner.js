/**
 * Cliniva — Practitioner / Doctor Workspace Bootstrap
 * SOLID: Entry point for Practitioner Schedule, Chime Calling & Body Pain Map
 */

import { PractitionerController } from "../controllers/practitioner.controller.js";
import { NotificationBarComponent } from "../components/notification-bar.component.js";
import { i18nService } from "../services/i18n.service.js";

document.addEventListener("DOMContentLoaded", () => {
  i18nService.init();

  const notifBar = new NotificationBarComponent("notificationBarContainer");
  notifBar.mount();

  const practitioner = new PractitionerController();
  practitioner.init();

  console.log("Cliniva Practitioner Controller & Notification Bar initialized.");
});

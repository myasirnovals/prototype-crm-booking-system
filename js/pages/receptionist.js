/**
 * Cliniva — Receptionist Operations Bootstrap
 * SOLID: Entry point for Reception Desk, Live Queue, and POS Cashier
 */

import { ReceptionistController } from "../controllers/receptionist/dashboard.controller.js";
import { NotificationBarComponent } from "../components/notification-bar.component.js";
import { ProfileModalComponent } from "../components/profile-modal.component.js";
import { i18nService } from "../services/i18n.service.js";

document.addEventListener("DOMContentLoaded", () => {
  i18nService.init();

  const notifBar = new NotificationBarComponent("notificationBarContainer");
  notifBar.mount();

  const profileModal = new ProfileModalComponent();
  profileModal.mount();

  const receptionist = new ReceptionistController();
  receptionist.init();

  console.log("Cliniva Receptionist Controller, Notification Bar & Profile Modal initialized.");
});

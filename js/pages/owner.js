/**
 * Cliniva — Owner Executive Dashboard Bootstrap
 * SOLID: Entry point for Owner Dashboard & Executive Analytics
 */

import { OwnerController } from "../controllers/owner.controller.js";
import { NotificationBarComponent } from "../components/notification-bar.component.js";
import { ProfileModalComponent } from "../components/profile-modal.component.js";
import { i18nService } from "../services/i18n.service.js";

document.addEventListener("DOMContentLoaded", () => {
  i18nService.init();

  const notifBar = new NotificationBarComponent("notificationBarContainer");
  notifBar.mount();

  const profileModal = new ProfileModalComponent();
  profileModal.mount();

  const owner = new OwnerController();
  owner.init();

  console.log("Cliniva Owner Controller, Notification Bar & Profile Modal initialized.");
});

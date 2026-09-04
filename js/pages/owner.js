/**
 * Cliniva — Owner Executive Dashboard Bootstrap
 * SOLID: Entry point for Owner Dashboard & Executive Analytics
 */

import { OwnerController } from "../controllers/owner.controller.js";
import { i18nService } from "../services/i18n.service.js";

document.addEventListener("DOMContentLoaded", () => {
  i18nService.init();
  const owner = new OwnerController();
  owner.init();

  console.log("Cliniva Owner Controller initialized with i18n.");
});

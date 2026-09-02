/**
 * Cliniva — Product Demo Page Bootstrap
 * SOLID: Entry point for interactive sandbox demonstration
 */

import { DemoController } from "../controllers/demo.controller.js";
import { i18nService } from "../services/i18n.service.js";

document.addEventListener("DOMContentLoaded", () => {
  i18nService.init();

  const demo = new DemoController();
  demo.init();

  console.log("Cliniva Product Demo & Interactive Sandbox initialized successfully with i18n multilingual support.");
});

/**
 * Cliniva — Product Demo Page Bootstrap
 * SOLID: Entry point for interactive sandbox demonstration
 */

import { DemoController } from "../controllers/demo.controller.js";

document.addEventListener("DOMContentLoaded", () => {
  const demo = new DemoController();
  demo.init();

  console.log("Cliniva Product Demo & Interactive Sandbox initialized successfully.");
});

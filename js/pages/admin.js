/**
 * Cliniva — Admin Dashboard Bootstrap
 * SOLID: Entry point for Operations Dashboard, Live Queue and SIMRS Bridging Hub
 */

import { AdminController } from "../controllers/admin.controller.js";

document.addEventListener("DOMContentLoaded", () => {
  const admin = new AdminController();
  admin.init();

  console.log("Cliniva Admin Controller initialized.");
});

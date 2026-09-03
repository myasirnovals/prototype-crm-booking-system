/**
 * Cliniva — Owner Executive Dashboard Bootstrap
 * SOLID: Entry point for Owner Dashboard & Executive Analytics
 */

import { OwnerController } from "../controllers/owner.controller.js";

document.addEventListener("DOMContentLoaded", () => {
  const owner = new OwnerController();
  owner.init();

  console.log("Cliniva Owner Controller initialized.");
});

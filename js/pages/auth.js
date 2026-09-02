/**
 * Cliniva — Auth Page Bootstrap
 * SOLID: Entry point for Sign In and OTP authentication
 */

import { AuthController } from "../controllers/auth.controller.js";

document.addEventListener("DOMContentLoaded", () => {
  const auth = new AuthController();
  auth.init();

  console.log("Cliniva Auth Controller initialized.");
});

/**
 * Cliniva — Main Page Bootstrap
 * SOLID: Entry point orchestrating UI, Booking, and Dashboard controllers
 */

import { UIController } from "../controllers/ui.controller.js";
import { BookingController } from "../controllers/booking.controller.js";
import { DashboardController } from "../controllers/dashboard.controller.js";

document.addEventListener("DOMContentLoaded", () => {
  const ui = new UIController();
  ui.init();

  const booking = new BookingController(ui);
  booking.init();

  const dashboard = new DashboardController(ui);
  dashboard.init();

  console.log("Cliniva Booking & CRM System initialized successfully with SOLID architecture.");
});

/**
 * Cliniva — Product Demo Page Bootstrap
 * SOLID: Entry point for interactive sandbox demonstration
 * Mounts modular role components into the DOM before initializing i18n and controller logic
 */

import { DemoController } from "../controllers/demo.controller.js";
import { i18nService } from "../services/i18n.service.js";

// Import modular demo components
import { renderPatientWizard } from "../components/demo/patient-wizard.component.js";
import { renderReceptionistDesk } from "../components/demo/receptionist-desk.component.js";
import { renderDoctorConsole } from "../components/demo/doctor-console.component.js";
import { renderBranchAdmin } from "../components/demo/branch-admin.component.js";
import { renderOwnerHq } from "../components/demo/owner-hq.component.js";
import { renderWhatsAppSimulator } from "../components/demo/whatsapp-simulator.component.js";
import { renderWalkInModal } from "../components/demo/walkin-modal.component.js";

document.addEventListener("DOMContentLoaded", () => {
  // 1. Mount modular role panes into main container
  const container = document.getElementById("demoContainer");
  if (container) {
    container.innerHTML = `
      ${renderPatientWizard()}
      ${renderReceptionistDesk()}
      ${renderDoctorConsole()}
      ${renderBranchAdmin()}
      ${renderOwnerHq()}
      ${renderWhatsAppSimulator()}
    `;
  }

  // 2. Mount modals into modal container
  const modalContainer = document.getElementById("demoModalContainer");
  if (modalContainer) {
    modalContainer.innerHTML = renderWalkInModal();
  }

  // 3. Initialize i18n translations across all mounted components
  i18nService.init();

  // 4. Initialize Demo Controller event listeners and sandbox state
  const demo = new DemoController();
  demo.init();

  console.log("Cliniva Modular Product Demo initialized successfully with full i18n multilingual support.");
});

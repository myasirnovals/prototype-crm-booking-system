/**
 * Cliniva — Onboarding Controller
 * SOLID: Single Responsibility for Clinic Registration & Super Admin Provisioning
 */

import { storageService } from "../services/storage.service.js";
import { soundService } from "../services/sound.service.js";

export class OnboardingController {
  constructor() {
    this.currentStep = 1;
    this.selectedSpecialty = "physio";
  }

  init() {
    this.setupStepper();
    this.setupSpecialtyCards();
    this.setupFormSubmission();
  }

  setupStepper() {
    const btnNext1 = document.getElementById("btnNextStep1");
    const btnNext2 = document.getElementById("btnNextStep2");
    const btnPrev2 = document.getElementById("btnPrevStep2");
    const btnPrev3 = document.getElementById("btnPrevStep3");

    if (btnNext1) {
      btnNext1.addEventListener("click", () => {
        const clinicName = document.getElementById("clinicName").value.trim();
        if (!clinicName) {
          alert("Silakan masukkan nama klinik Anda.");
          return;
        }
        this.goToStep(2);
      });
    }

    if (btnNext2) {
      btnNext2.addEventListener("click", () => {
        const ownerName = document.getElementById("ownerName").value.trim();
        const ownerEmail = document.getElementById("ownerEmail").value.trim();
        const ownerPass = document.getElementById("ownerPassword").value;
        const confirmPass = document.getElementById("confirmPassword").value;

        if (!ownerName || !ownerEmail) {
          alert("Silakan lengkapi nama pemilik dan email resmi.");
          return;
        }

        if (ownerPass !== confirmPass) {
          alert("Kata sandi dan konfirmasi kata sandi tidak cocok.");
          return;
        }

        this.goToStep(3);
      });
    }

    if (btnPrev2) btnPrev2.addEventListener("click", () => this.goToStep(1));
    if (btnPrev3) btnPrev3.addEventListener("click", () => this.goToStep(2));
  }

  goToStep(step) {
    this.currentStep = step;
    soundService.playClickTone();

    // Update Step Indicators
    for (let i = 1; i <= 3; i++) {
      const ind = document.getElementById(`stepIndicator${i}`);
      const panel = document.getElementById(`onboardingStep${i}`);

      if (ind) {
        ind.classList.remove("active");
        if (i === step) ind.classList.add("active");
      }

      if (panel) {
        panel.style.display = i === step ? "block" : "none";
      }
    }
  }

  setupSpecialtyCards() {
    const cards = document.querySelectorAll(".specialty-card");
    cards.forEach((card) => {
      card.addEventListener("click", () => {
        cards.forEach((c) => c.classList.remove("active"));
        card.classList.add("active");
        this.selectedSpecialty = card.dataset.specialty || "physio";
        soundService.playClickTone();
      });
    });
  }

  setupFormSubmission() {
    const form = document.getElementById("onboardingForm");
    const overlay = document.getElementById("provisioningOverlay");
    const statusText = document.getElementById("provisioningStatusText");
    const logBox = document.getElementById("provisioningLog");

    if (!form) return;

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      soundService.playClickTone();

      const clinicName = document.getElementById("clinicName")?.value || "My Clinic";
      const ownerName = document.getElementById("ownerName")?.value || "Clinic Owner";
      const ownerEmail = document.getElementById("ownerEmail")?.value || "admin@clinic.com";
      const region = document.getElementById("clinicRegion")?.value || "sg";

      // Show Provisioning Animation
      if (overlay) overlay.classList.add("active");

      const tenantId = `tenant_${region}_${Date.now().toString().slice(-6)}`;

      // Step 1
      setTimeout(() => {
        if (statusText) statusText.textContent = `Membuat Tenant ID: ${tenantId}...`;
        if (logBox) logBox.innerHTML += `<br>&gt; [OK] Created tenant '${clinicName}' (ID: ${tenantId})`;
      }, 700);

      // Step 2
      setTimeout(() => {
        if (statusText) statusText.textContent = "Mengonfigurasi Hak Akses SUPER_ADMIN & RBAC...";
        if (logBox) logBox.innerHTML += `<br>&gt; [OK] Bound user '${ownerEmail}' with role 'SUPER_ADMIN'`;
      }, 1400);

      // Step 3
      setTimeout(() => {
        if (statusText) statusText.textContent = "Menginisialisasi Triple-Constraint Engine & WhatsApp Gateway...";
        if (logBox) logBox.innerHTML += "<br>&gt; [OK] Triple-Constraint Resource Engine: Active";
      }, 2100);

      // Step 4: Finalize & Redirect
      setTimeout(() => {
        soundService.playQueueChime();

        // Save active session for Super Admin
        storageService.set("active_tenant", {
          id: tenantId,
          name: clinicName,
          owner: ownerName,
          email: ownerEmail,
          region: region,
          role: "SUPER_ADMIN"
        });

        alert(`🎉 SELAMAT! PENDAFTARAN KLINIK BERHASIL!\n\nTenant: ${clinicName}\nOwner / Super Admin: ${ownerName} (${ownerEmail})\nTenant ID: ${tenantId}\n\nSistem mengalihkan Anda ke Konsol Super Admin...`);

        // Redirect to Demo Super Admin view or Admin Panel
        window.location.href = "demo.html";
      }, 3000);
    });
  }
}

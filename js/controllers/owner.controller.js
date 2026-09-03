/**
 * Cliniva — Owner / Executive Dashboard Controller
 * SOLID: Single Responsibility for Executive Macro Analytics, Clinic Identity & Adaptive Profile
 */

import { authService, USER_ROLES } from "../services/auth.service.js";
import { storageService } from "../services/storage.service.js";
import { soundService } from "../services/sound.service.js";

export class OwnerController {
  constructor() {
    this.BRANDING_KEY = "cliniva_custom_branding";
    this.PROFILE_KEY = "cliniva_intake_profile";

    this.tabButtons = document.querySelectorAll(".owner-tab-btn");
    this.tabPanes = document.querySelectorAll(".owner-tab-pane");
    this.profileCards = document.querySelectorAll(".profile-card");
    this.logoInput = document.getElementById("logoFileInput");
    this.logoPreview = document.getElementById("logoPreview");
    this.brandForm = document.getElementById("clinicBrandForm");
    this.signOutBtn = document.getElementById("ownerSignOutBtn");
  }

  init() {
    // Session Guard: Verify user has OWNER role
    const session = authService.requireAuth([USER_ROLES.OWNER]);
    if (!session) return;

    this.renderUserInfo(session.user);
    this.setupTabs();
    this.setupBrandingConfig();
    this.setupAdaptiveProfile();
    this.setupSignOut();
  }

  renderUserInfo(user) {
    const nameEl = document.getElementById("ownerUserName");
    const roleEl = document.getElementById("ownerUserRole");
    if (nameEl) nameEl.textContent = user.name;
    if (roleEl) roleEl.textContent = user.title || "Chief Executive & Owner";
  }

  setupTabs() {
    this.tabButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const target = btn.dataset.pane;
        soundService.playClickTone();

        this.tabButtons.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");

        this.tabPanes.forEach((pane) => {
          pane.style.display = pane.id === target ? "block" : "none";
        });
      });
    });
  }

  setupBrandingConfig() {
    // Load existing branding from storage
    const currentBranding = storageService.get(this.BRANDING_KEY, {
      clinicName: "Cliniva Healthcare & Wellness",
      tagline: "Integrated Clinical Appointment & Patient Relationship Management",
      whatsappNumber: "+65 8123 4567",
      officialEmail: "contact@orchardclinic.sg",
      address: "290 Orchard Road, Paragon Medical #14-02, Singapore 238859",
      operatingHours: "Senin - Sabtu (08:30 - 20:00 SGT)",
      logoDataUrl: null
    });

    // Populate inputs if present
    const nameInput = document.getElementById("inputClinicName");
    const taglineInput = document.getElementById("inputClinicTagline");
    const waInput = document.getElementById("inputClinicWA");
    const emailInput = document.getElementById("inputClinicEmail");
    const addressInput = document.getElementById("inputClinicAddress");
    const hoursInput = document.getElementById("inputClinicHours");

    if (nameInput) nameInput.value = currentBranding.clinicName;
    if (taglineInput) taglineInput.value = currentBranding.tagline;
    if (waInput) waInput.value = currentBranding.whatsappNumber;
    if (emailInput) emailInput.value = currentBranding.officialEmail;
    if (addressInput) addressInput.value = currentBranding.address;
    if (hoursInput) hoursInput.value = currentBranding.operatingHours;

    if (currentBranding.logoDataUrl && this.logoPreview) {
      this.logoPreview.src = currentBranding.logoDataUrl;
    }

    // Handle Logo File Upload with Live Preview
    if (this.logoInput) {
      this.logoInput.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
          alert("Ukuran berkas logo maksimal 2MB.");
          return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
          const dataUrl = event.target.result;
          if (this.logoPreview) {
            this.logoPreview.src = dataUrl;
          }
          currentBranding.logoDataUrl = dataUrl;
          storageService.set(this.BRANDING_KEY, currentBranding);
          soundService.playClickTone();
          alert("✓ Logo resmi klinik berhasil diperbarui & disimpan secara dinamis!");
        };
        reader.readAsDataURL(file);
      });
    }

    // Handle Form Submit
    if (this.brandForm) {
      this.brandForm.addEventListener("submit", (e) => {
        e.preventDefault();
        soundService.playQueueChime();

        currentBranding.clinicName = nameInput?.value.trim() || currentBranding.clinicName;
        currentBranding.tagline = taglineInput?.value.trim() || currentBranding.tagline;
        currentBranding.whatsappNumber = waInput?.value.trim() || currentBranding.whatsappNumber;
        currentBranding.officialEmail = emailInput?.value.trim() || currentBranding.officialEmail;
        currentBranding.address = addressInput?.value.trim() || currentBranding.address;
        currentBranding.operatingHours = hoursInput?.value.trim() || currentBranding.operatingHours;

        storageService.set(this.BRANDING_KEY, currentBranding);

        const statusBox = document.getElementById("brandSaveStatus");
        if (statusBox) {
          statusBox.innerHTML = `✓ Konfigurasi profil & identitas resmi <strong>${currentBranding.clinicName}</strong> berhasil diperbarui ke seluruh cabang!`;
          statusBox.style.display = "block";
          setTimeout(() => (statusBox.style.display = "none"), 4000);
        }
      });
    }
  }

  setupAdaptiveProfile() {
    const activeProfile = storageService.get(this.PROFILE_KEY, "TCM_PHYSIO");

    this.profileCards.forEach((card) => {
      if (card.dataset.profile === activeProfile) {
        card.classList.add("active");
      } else {
        card.classList.remove("active");
      }

      card.addEventListener("click", () => {
        soundService.playClickTone();
        this.profileCards.forEach((c) => c.classList.remove("active"));
        card.classList.add("active");

        const selected = card.dataset.profile;
        storageService.set(this.PROFILE_KEY, selected);

        alert(`✓ Profil bisnis klinik diubah menjadi: ${card.querySelector("h3")?.innerText || selected}. Formulir intake pasien pada index.html otomatis menyesuaikan.`);
      });
    });
  }

  setupSignOut() {
    if (this.signOutBtn) {
      this.signOutBtn.addEventListener("click", () => {
        soundService.playClickTone();
        if (confirm("Apakah Anda yakin ingin keluar dari panel Owner?")) {
          authService.logout();
        }
      });
    }
  }
}

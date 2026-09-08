/**
 * Cliniva — Admin Onboarding Setup Wizard Controller
 * SOLID: Single Responsibility for WordPress-style setup wizard, brand initialization,
 * 4-specialty template selection, and initial branch provisioning.
 */

import { authService, USER_ROLES } from "../services/auth.service.js";
import { storageService } from "../services/storage.service.js";
import { soundService } from "../services/sound.service.js";
import { bookingService } from "../services/booking.service.js";

export class AdminOnboardingController {
  constructor() {
    this.currentStep = 1;
    this.selectedLogo = "🌿";
    this.selectedTemplate = "physio";
    this.currentUser = null;
  }

  init() {
    // Auth Guard: must be authenticated
    const session = authService.getCurrentSession();
    if (!session || !session.user) {
      window.location.href = "sign-in.html";
      return;
    }

    this.currentUser = session.user;
    this.renderUserInfo();
    this.setupStepperButtons();
    this.setupLogoPicker();
    this.setupTemplateSelection();
    this.setupLaunchButton();
    this.setupSignOut();
  }

  renderUserInfo() {
    const el = document.getElementById("wizardLoggedInAs");
    if (el && this.currentUser) {
      el.innerHTML = `Signed in as <strong>${this.currentUser.name}</strong> (${this.currentUser.email})`;
    }
  }

  setupStepperButtons() {
    const btnNext1 = document.getElementById("btnNext1");
    const btnNext2 = document.getElementById("btnNext2");
    const btnNext3 = document.getElementById("btnNext3");

    const btnPrev2 = document.getElementById("btnPrev2");
    const btnPrev3 = document.getElementById("btnPrev3");
    const btnPrev4 = document.getElementById("btnPrev4");

    if (btnNext1) {
      btnNext1.addEventListener("click", () => {
        const brandName = document.getElementById("brandNameInput")?.value.trim();
        if (!brandName) {
          alert("Please enter your clinic / practice brand name.");
          return;
        }
        this.goToStep(2);
      });
    }

    if (btnNext2) {
      btnNext2.addEventListener("click", () => {
        this.goToStep(3);
      });
    }

    if (btnNext3) {
      btnNext3.addEventListener("click", () => {
        const branchName = document.getElementById("branchNameInput")?.value.trim();
        const branchAddress = document.getElementById("branchAddressInput")?.value.trim();

        if (!branchName || !branchAddress) {
          alert("Please fill in both the Branch Name and Physical Address for Cabang 1.");
          return;
        }

        this.updateReviewSummary();
        this.goToStep(4);
      });
    }

    if (btnPrev2) btnPrev2.addEventListener("click", () => this.goToStep(1));
    if (btnPrev3) btnPrev3.addEventListener("click", () => this.goToStep(2));
    if (btnPrev4) btnPrev4.addEventListener("click", () => this.goToStep(3));
  }

  goToStep(step) {
    this.currentStep = step;
    soundService.playClickTone();

    // Update node states
    for (let i = 1; i <= 4; i++) {
      const node = document.getElementById(`wizardNode${i}`);
      const panel = document.getElementById(`wizardStep${i}`);

      if (node) {
        node.classList.remove("active", "completed");
        const circle = node.querySelector(".wizard-step-circle");

        if (i < step) {
          node.classList.add("completed");
          if (circle) circle.textContent = "✓";
        } else if (i === step) {
          node.classList.add("active");
          if (circle) circle.textContent = i.toString();
        } else {
          if (circle) circle.textContent = i.toString();
        }
      }

      if (panel) {
        panel.style.display = i === step ? "block" : "none";
      }
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  setupLogoPicker() {
    const buttons = document.querySelectorAll(".logo-choice-btn");
    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        buttons.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        this.selectedLogo = btn.dataset.emoji || "🌿";
        const input = document.getElementById("selectedLogoEmoji");
        if (input) input.value = this.selectedLogo;
        soundService.playClickTone();
      });
    });
  }

  setupTemplateSelection() {
    const cards = document.querySelectorAll(".template-card");
    cards.forEach((card) => {
      card.addEventListener("click", () => {
        cards.forEach((c) => c.classList.remove("active"));
        card.classList.add("active");
        this.selectedTemplate = card.dataset.template || "physio";
        const input = document.getElementById("selectedTemplateId");
        if (input) input.value = this.selectedTemplate;
        soundService.playClickTone();
      });
    });
  }

  getTemplateLabel(templateId) {
    switch (templateId) {
      case "tcm":
        return "🌿 Traditional Chinese Medicine (TCM)";
      case "wellness":
        return "🌸 Wellness & Spa Care";
      case "physio":
        return "🏃 Physiotherapy & Sports Rehab";
      case "nutrition":
        return "🥗 Clinical Nutrition & Dietetics";
      default:
        return "🏃 Physiotherapy & Sports Rehab";
    }
  }

  updateReviewSummary() {
    const brandName = document.getElementById("brandNameInput")?.value.trim() || "My Clinic Hub";
    const brandTagline = document.getElementById("brandTaglineInput")?.value.trim() || "Excellence in Clinical Care";
    const branchName = document.getElementById("branchNameInput")?.value.trim() || "Cabang 1";
    const branchAddress = document.getElementById("branchAddressInput")?.value.trim() || "Singapore";
    const region = document.getElementById("brandRegionSelect")?.value || "sg";

    const logoEl = document.getElementById("reviewLogoBadge");
    const brandTitleEl = document.getElementById("reviewBrandTitle");
    const brandTaglineEl = document.getElementById("reviewBrandTagline");
    const templateValEl = document.getElementById("reviewTemplateVal");
    const branchValEl = document.getElementById("reviewBranchVal");
    const addressValEl = document.getElementById("reviewAddressVal");
    const regionValEl = document.getElementById("reviewRegionVal");
    const ownerValEl = document.getElementById("reviewOwnerVal");

    if (logoEl) logoEl.textContent = this.selectedLogo;
    if (brandTitleEl) brandTitleEl.textContent = brandName;
    if (brandTaglineEl) brandTaglineEl.textContent = brandTagline;
    if (templateValEl) templateValEl.textContent = this.getTemplateLabel(this.selectedTemplate);
    if (branchValEl) branchValEl.textContent = branchName;
    if (addressValEl) addressValEl.textContent = branchAddress;
    if (regionValEl) regionValEl.textContent = region === "sg" ? "🇸🇬 Singapore (SGD)" : "🇲🇾 Malaysia (MYR)";
    if (ownerValEl && this.currentUser) {
      ownerValEl.textContent = `${this.currentUser.name} (${this.currentUser.email})`;
    }
  }

  setupLaunchButton() {
    const launchBtn = document.getElementById("btnLaunchClinic");
    if (!launchBtn) return;

    launchBtn.addEventListener("click", () => {
      soundService.playQueueChime();
      launchBtn.disabled = true;
      launchBtn.innerHTML = "⏳ Provisioning Tenant & Setting Up First Branch...";

      const brandName = document.getElementById("brandNameInput")?.value.trim() || "My Clinic";
      const brandTagline = document.getElementById("brandTaglineInput")?.value.trim() || "";
      const brandDesc = document.getElementById("brandDescInput")?.value.trim() || "";
      const region = document.getElementById("brandRegionSelect")?.value || "sg";
      const branchName = document.getElementById("branchNameInput")?.value.trim() || "Cabang 1";
      const branchAddress = document.getElementById("branchAddressInput")?.value.trim() || "Clinic Address";
      const branchPhone = document.getElementById("branchPhoneInput")?.value.trim() || "+65 6733 8899";
      const branchHours = document.getElementById("branchHoursInput")?.value.trim() || "09:00 - 20:00";
      const branchRooms = document.getElementById("branchRoomsInput")?.value || "4";

      const branchId = `br-${region}-${Date.now().toString().slice(-4)}`;

      // 1. Create First Branch Object
      const newBranch = {
        id: branchId,
        name: branchName,
        code: `${region.toUpperCase()}-01`,
        address: branchAddress,
        phone: branchPhone,
        hours: branchHours,
        rooms: branchRooms,
        template: this.selectedTemplate,
        currency: region === "sg" ? "SGD" : "MYR",
        revenue: region === "sg" ? "SGD 0.00" : "MYR 0.00",
        occupancy: "0.0%",
        practitioners: "1 Senior Specialist",
        status: "ACTIVE",
        isPrimary: true,
        createdAt: new Date().toISOString()
      };

      // 2. Save Branch to Branches Storage
      let currentBranches = storageService.get("cliniva_branches", []);
      // If user had no custom branches, start clean with this new primary branch
      currentBranches = [newBranch, ...currentBranches.filter((b) => b.id !== branchId)];
      storageService.set("cliniva_branches", currentBranches);
      storageService.set("cliniva_active_branch_id", branchId);

      // 3. Save Brand Profile
      const brandProfile = {
        name: brandName,
        tagline: brandTagline,
        logo: this.selectedLogo,
        description: brandDesc,
        region: region,
        primaryTemplate: this.selectedTemplate,
        ownerId: this.currentUser.id,
        createdAt: new Date().toISOString()
      };
      storageService.set("cliniva_brand_profile", brandProfile);

      // 4. Set Active Template in Booking Service
      bookingService.setActiveTemplate(this.selectedTemplate);
      storageService.set("cliniva_intake_profile", this.selectedTemplate.toUpperCase());

      // 5. Complete User Onboarding in AuthService
      authService.completeUserOnboarding(this.currentUser.id, {
        brandName,
        brandLogo: this.selectedLogo,
        brandTagline,
        activeTemplate: this.selectedTemplate,
        branchId,
        branchName
      });

      setTimeout(() => {
        alert(
          `🎉 ONBOARDING SELESAI!\n\nBrand: ${brandName}\nTemplate Lini Bisnis: ${this.getTemplateLabel(this.selectedTemplate)}\nCabang 1: ${branchName}\n\nSistem mengalihkan Anda ke Executive Dashboard...`
        );
        window.location.href = "owner.html";
      }, 900);
    });
  }

  setupSignOut() {
    const btn = document.getElementById("wizardSignOutBtn");
    if (btn) {
      btn.addEventListener("click", () => {
        if (confirm("Are you sure you want to sign out and complete onboarding later?")) {
          authService.logout();
        }
      });
    }
  }
}

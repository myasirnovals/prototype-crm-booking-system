/**
 * Cliniva — Admin Onboarding Setup Wizard Controller
 * SOLID: Single Responsibility for WordPress-style setup wizard, brand initialization,
 * 4-specialty template selection, and initial branch provisioning.
 */

import { authService, USER_ROLES } from "../../services/auth.service.js";
import { storageService } from "../../services/storage.service.js";
import { soundService } from "../../services/sound.service.js";
import { bookingService } from "../../services/booking.service.js";

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
      window.location.href = "../../pages/public/sign-in.html";
      return;
    }

    this.currentUser = session.user;
    this.renderUserInfo();
    this.setupStepperButtons();
    this.setupLogoPicker();
    this.setupTemplateSelection();
    this.setupLaunchButton();
    this.setupSignOut();
    this.updateReviewSummary();
    this.goToStep(1, false);
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
        this.goToStep(2, true);
      });
    }

    if (btnNext2) {
      btnNext2.addEventListener("click", () => {
        this.goToStep(3, true);
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
        this.goToStep(4, true);
      });
    }

    if (btnPrev2) btnPrev2.addEventListener("click", () => this.goToStep(1, true));
    if (btnPrev3) btnPrev3.addEventListener("click", () => this.goToStep(2, true));
    if (btnPrev4) btnPrev4.addEventListener("click", () => this.goToStep(3, true));
  }

  goToStep(step, playSound = false) {
    this.currentStep = step;
    if (playSound) {
      soundService.playClickTone();
    }

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
        if (i === step) {
          panel.classList.add("active");
          panel.style.setProperty("display", "block", "important");
        } else {
          panel.classList.remove("active");
          panel.style.setProperty("display", "none", "important");
        }
      }
    }

    if (playSound) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  setupLogoPicker() {
    const fileInput = document.getElementById("brandLogoFileInput");
    const dropZone = document.getElementById("logoDropZone");
    const btnBrowse = document.getElementById("btnBrowseLogo");
    const btnRemove = document.getElementById("btnRemoveLogo");
    const previewEmoji = document.getElementById("logoPreviewEmoji");
    const previewImage = document.getElementById("logoPreviewImage");
    const uploadTitle = document.getElementById("logoUploadTitle");
    const hiddenInput = document.getElementById("selectedLogoInput");
    const presetButtons = document.querySelectorAll(".logo-choice-btn");

    const setLogoState = (logoVal, isImage = false) => {
      this.selectedLogo = logoVal;
      if (hiddenInput) hiddenInput.value = logoVal;

      if (isImage) {
        if (previewImage) {
          previewImage.src = logoVal;
          previewImage.style.display = "block";
        }
        if (previewEmoji) previewEmoji.style.display = "none";
        if (btnRemove) btnRemove.style.display = "inline-flex";
        if (uploadTitle) uploadTitle.textContent = "Logo gambar berhasil diunggah (Klik untuk mengganti)";
        presetButtons.forEach((b) => b.classList.remove("active"));
      } else {
        if (previewImage) {
          previewImage.src = "";
          previewImage.style.display = "none";
        }
        if (previewEmoji) {
          previewEmoji.textContent = logoVal;
          previewEmoji.style.display = "block";
        }
        if (btnRemove) btnRemove.style.display = "none";
        if (uploadTitle) uploadTitle.textContent = "Klik untuk Mengunggah Logo atau Tarik File Gambar ke Sini";
        presetButtons.forEach((b) => {
          b.classList.toggle("active", b.dataset.emoji === logoVal);
        });
      }

      this.updateReviewSummary();
    };

    const processFile = (file) => {
      if (!file) return;
      if (!file.type.startsWith("image/")) {
        alert("Mohon pilih file gambar yang valid (PNG, JPG, WebP, SVG).");
        return;
      }
      if (file.size > 3 * 1024 * 1024) {
        alert("Ukuran gambar maksimal 3MB.");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target.result;
        setLogoState(dataUrl, true);
        soundService.playClickTone();
      };
      reader.readAsDataURL(file);
    };

    if (btnBrowse && fileInput) {
      btnBrowse.addEventListener("click", (e) => {
        e.stopPropagation();
        fileInput.click();
      });
    }

    if (dropZone && fileInput) {
      dropZone.addEventListener("click", () => {
        fileInput.click();
      });

      dropZone.addEventListener("dragover", (e) => {
        e.preventDefault();
        dropZone.classList.add("dragover");
      });

      dropZone.addEventListener("dragleave", () => {
        dropZone.classList.remove("dragover");
      });

      dropZone.addEventListener("drop", (e) => {
        e.preventDefault();
        dropZone.classList.remove("dragover");
        if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
          processFile(e.dataTransfer.files[0]);
        }
      });

      fileInput.addEventListener("change", () => {
        if (fileInput.files && fileInput.files[0]) {
          processFile(fileInput.files[0]);
        }
      });
    }

    if (btnRemove) {
      btnRemove.addEventListener("click", (e) => {
        e.stopPropagation();
        if (fileInput) fileInput.value = "";
        setLogoState("🌿", false);
        soundService.playClickTone();
      });
    }

    // Preset quick emblem clicks
    presetButtons.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        if (fileInput) fileInput.value = "";
        const emoji = btn.dataset.emoji || "🌿";
        setLogoState(emoji, false);
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

    if (logoEl) {
      if (this.selectedLogo && (this.selectedLogo.startsWith("data:image") || this.selectedLogo.startsWith("http") || this.selectedLogo.includes("/"))) {
        logoEl.innerHTML = `<img src="${this.selectedLogo}" alt="Brand Logo" style="width:100%; height:100%; object-fit:contain; padding:4px;">`;
      } else {
        logoEl.textContent = this.selectedLogo || "🌿";
      }
    }
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
      // If user had no custom branches, start clean with this new primary branch, ensuring no duplicate branch names
      currentBranches = [
        newBranch,
        ...currentBranches.filter(
          (b) => b.id !== branchId && (b.name || "").trim().toLowerCase() !== branchName.trim().toLowerCase()
        )
      ];
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
          `🎉 ONBOARDING SELESAI!\n\nBrand: ${brandName}\nTemplate Lini Bisnis: ${this.getTemplateLabel(this.selectedTemplate)}\nCabang 1: ${branchName}\n\nSistem mengalihkan Anda ke Dashboard Owner...`
        );
        window.location.href = "../../pages/owner/dashboard.html";
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

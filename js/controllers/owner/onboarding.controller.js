/**
 * Cliniva — Admin Onboarding Setup Wizard Controller
 * SOLID: Single Responsibility for WordPress-style setup wizard, brand initialization,
 * 5-specialty template selection, dynamic service delivery modes, and OneMap postal lookup.
 */

import { authService, USER_ROLES } from "../../services/auth.service.js";
import { storageService } from "../../services/storage.service.js";
import { soundService } from "../../services/sound.service.js";
import { bookingService } from "../../services/booking.service.js";
import { i18nService } from "../../services/i18n.service.js";
import { supabaseService } from "../../services/supabase.service.js";
import { getTemplateById } from "../../config/templates/index.js";

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
    this.checkReturningOwner();
    this.setupStepperButtons();
    this.setupLogoPicker();
    this.setupTemplateSelection();
    this.setupPostalCodeLookup();
    this.setupServiceModeSelection();
    this.setupSubscriptionBilling();
    this.setupLaunchButton();
    this.setupSignOut();

    const initialMode = document.querySelector('input[name="wizardServiceMode"]:checked')?.value || "hybrid";
    this.applyServiceModeDynamicUI(initialMode);
    this.updateSubscriptionPricing();
    this.updateReviewSummary();

    this.goToStep(1, false);

    window.addEventListener("cliniva:languageChanged", () => {
      const currentMode = document.querySelector('input[name="wizardServiceMode"]:checked')?.value || "hybrid";
      this.applyServiceModeDynamicUI(currentMode);
      this.updateSubscriptionPricing();
      this.updateReviewSummary();
    });

    const regionSelect = document.getElementById("brandRegionSelect");
    if (regionSelect) {
      regionSelect.addEventListener("change", () => {
        this.handleRegionChange();
        this.updateSubscriptionPricing();
        this.updateReviewSummary();
      });
    }
  }

  renderUserInfo() {
    const el = document.getElementById("wizardLoggedInAs");
    if (el && this.currentUser) {
      el.innerHTML = `Signed in as <strong>${this.currentUser.name}</strong> (${this.currentUser.email})`;
    }
  }

  checkReturningOwner() {
    const existingBrand = storageService.get("cliniva_brand_profile", null);
    const existingBranches = storageService.get("cliniva_branches", []);
    const isReturning = Boolean(
      this.currentUser.onboardingCompleted ||
      existingBrand ||
      (Array.isArray(existingBranches) && existingBranches.length > 0)
    );

    if (isReturning) {
      const banner = document.getElementById("returningOwnerBanner");
      if (banner) {
        banner.style.display = "block";
        const brandNameEl = document.getElementById("returningBrandName");
        if (brandNameEl) {
          brandNameEl.textContent = (existingBrand && existingBrand.name)
            ? existingBrand.name
            : (this.currentUser.brandName || "Dennis Health & Wellness Hub");
        }
      }

      // Pre-fill existing brand details into Step 2 inputs if available
      if (existingBrand) {
        const brandNameInput = document.getElementById("brandNameInput");
        const brandTaglineInput = document.getElementById("brandTaglineInput");
        const brandDescInput = document.getElementById("brandDescInput");
        const brandRegionSelect = document.getElementById("brandRegionSelect");
        if (brandNameInput && existingBrand.name) brandNameInput.value = existingBrand.name;
        if (brandTaglineInput && existingBrand.tagline) brandTaglineInput.value = existingBrand.tagline;
        if (brandDescInput && existingBrand.description) brandDescInput.value = existingBrand.description;
        if (brandRegionSelect && existingBrand.region) brandRegionSelect.value = existingBrand.region;
        if (existingBrand.logo) {
          this.setLogoState(existingBrand.logo, existingBrand.logo.startsWith("data:") || existingBrand.logo.startsWith("http"));
        }
      }

      const btnContinueFastTrack = document.getElementById("btnContinueFastTrack");
      if (btnContinueFastTrack) {
        btnContinueFastTrack.addEventListener("click", () => {
          soundService.playClickTone();
          const step1 = document.getElementById("wizardStep1");
          if (step1) {
            step1.scrollIntoView({ behavior: "smooth" });
          }
        });
      }
    }
  }

  setupStepperButtons() {
    const btnNext1 = document.getElementById("btnNext1");
    const btnNext2 = document.getElementById("btnNext2");
    const btnNext3 = document.getElementById("btnNext3");

    const btnPrev2 = document.getElementById("btnPrev2");
    const btnPrev3 = document.getElementById("btnPrev3");
    const btnPrev4 = document.getElementById("btnPrev4");

    // Step 1 -> Step 2 (Template -> Brand & Branch Config)
    if (btnNext1) {
      btnNext1.addEventListener("click", () => {
        if (!this.selectedTemplate) {
          alert("Please select a practice template to continue.");
          return;
        }
        this.goToStep(2, true);
      });
    }

    // Step 2 -> Step 3 (Brand & Branch -> Subscription Billing)
    if (btnNext2) {
      btnNext2.addEventListener("click", () => {
        const brandName = document.getElementById("brandNameInput")?.value.trim();
        const branchName = document.getElementById("branchNameInput")?.value.trim();
        const branchAddress = document.getElementById("branchAddressInput")?.value.trim();

        if (!brandName) {
          alert("Please enter your clinic / practice brand name.");
          return;
        }
        if (!branchName) {
          alert("Please fill in the Branch Name.");
          return;
        }
        if (!branchAddress) {
          alert("Please fill in the Physical Address (or use Postal Code Lookup).");
          return;
        }

        this.updateSubscriptionPricing();
        this.goToStep(3, true);
      });
    }

    // Step 3 -> Step 4 (Subscription Billing -> Launch Review)
    if (btnNext3) {
      btnNext3.addEventListener("click", () => {
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

  setLogoState(logoVal, isImage = false) {
    this.selectedLogo = logoVal;
    const hiddenInput = document.getElementById("selectedLogoInput");
    const previewEmoji = document.getElementById("logoPreviewEmoji");
    const previewImage = document.getElementById("logoPreviewImage");
    const btnRemove = document.getElementById("btnRemoveLogo");
    const uploadTitle = document.getElementById("logoUploadTitle");
    const presetButtons = document.querySelectorAll(".logo-choice-btn");

    if (hiddenInput) hiddenInput.value = logoVal;

    if (isImage) {
      if (previewImage) {
        previewImage.src = logoVal;
        previewImage.style.display = "block";
      }
      if (previewEmoji) previewEmoji.style.display = "none";
      if (btnRemove) btnRemove.style.display = "inline-flex";
      if (uploadTitle) uploadTitle.textContent = i18nService.t("onboarding.logoUploaded", "Logo image uploaded successfully (Click to replace)");
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
      if (uploadTitle) uploadTitle.textContent = i18nService.t("onboarding.logoUploadTitle", "Click to Upload Logo or Drag Image File Here");
      presetButtons.forEach((b) => {
        b.classList.toggle("active", b.dataset.emoji === logoVal);
      });
    }

    this.updateReviewSummary();
  }

  setupLogoPicker() {
    const fileInput = document.getElementById("brandLogoFileInput");
    const dropZone = document.getElementById("logoDropZone");
    const btnBrowse = document.getElementById("btnBrowseLogo");
    const btnRemove = document.getElementById("btnRemoveLogo");
    const presetButtons = document.querySelectorAll(".logo-choice-btn");

    const processFile = (file) => {
      if (!file) return;
      if (!file.type.startsWith("image/")) {
        alert(i18nService.t("owner.invalidImage", "Please select a valid image file (PNG, JPG, WebP, SVG)."));
        return;
      }
      if (file.size > 3 * 1024 * 1024) {
        alert(i18nService.t("owner.imageSize", "Maximum image size is 3MB."));
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target.result;
        this.setLogoState(dataUrl, true);
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
        this.setLogoState("🌿", false);
        soundService.playClickTone();
      });
    }

    // Preset quick emblem clicks
    presetButtons.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        if (fileInput) fileInput.value = "";
        const emoji = btn.dataset.emoji || "🌿";
        this.setLogoState(emoji, false);
        soundService.playClickTone();
      });
    });
  }

  setupTemplateSelection() {
    const cards = document.querySelectorAll(".template-card");
    const track = document.getElementById("templateCarouselTrack");
    const btnPrev = document.getElementById("btnPrevTemplate");
    const btnNext = document.getElementById("btnNextTemplate");
    const counterPill = document.getElementById("templateCounterPill");
    const dots = document.querySelectorAll(".template-dot");

    const lightbox = document.getElementById("templateLightboxModal");
    const lightboxImg = document.getElementById("lightboxImage");
    const lightboxTitle = document.getElementById("lightboxTemplateTitle");
    const btnCloseLightbox = document.getElementById("btnCloseLightbox");
    const btnSelectFromLightbox = document.getElementById("btnSelectFromLightbox");

    const templateList = ["tcm", "wellness", "physio", "nutrition", "personal-trainer"];
    let currentTemplateIndex = templateList.indexOf(this.selectedTemplate);
    if (currentTemplateIndex === -1) currentTemplateIndex = 2; // Default: physio

    let currentLightboxTemplate = null;

    const updateCarousel = (index, playSound = false) => {
      if (index < 0) index = templateList.length - 1;
      if (index >= templateList.length) index = 0;
      currentTemplateIndex = index;

      // 1. Slide Track (Single card viewport)
      if (track) {
        track.style.transform = `translateX(-${currentTemplateIndex * 100}%)`;
      }

      // 2. Mark Active Card
      cards.forEach((card, idx) => {
        card.classList.toggle("active", idx === currentTemplateIndex);
      });

      // 3. Mark Active Dot
      dots.forEach((dot, idx) => {
        dot.classList.toggle("active", idx === currentTemplateIndex);
      });

      // 4. Update Selected Template in Controller & Hidden Input
      this.selectedTemplate = templateList[currentTemplateIndex];
      const input = document.getElementById("selectedTemplateId");
      if (input) input.value = this.selectedTemplate;

      // 5. Update Dynamic Counter Pill
      if (counterPill) {
        const fullTitle = this.getTemplateLabel(this.selectedTemplate);
        counterPill.textContent = `Template ${currentTemplateIndex + 1} of ${templateList.length}: ${fullTitle}`;
      }

      // 6. Update dependent step states
      this.updateSubscriptionPricing();
      this.updateReviewSummary();

      if (playSound) {
        soundService.playClickTone();
      }
    };

    // Next Template (Icon Button)
    if (btnNext) {
      btnNext.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        updateCarousel(currentTemplateIndex + 1, true);
      });
    }

    // Prev Template (Icon Button)
    if (btnPrev) {
      btnPrev.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        updateCarousel(currentTemplateIndex - 1, true);
      });
    }

    // Dot Indicators Click
    dots.forEach((dot) => {
      dot.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const idx = parseInt(dot.dataset.index, 10);
        if (!isNaN(idx)) {
          updateCarousel(idx, true);
        }
      });
    });

    // Touch Swipe Gesture on Track for Mobile Devices
    let touchStartX = 0;
    let touchEndX = 0;
    if (track) {
      track.addEventListener("touchstart", (e) => {
        if (e.changedTouches && e.changedTouches[0]) {
          touchStartX = e.changedTouches[0].screenX;
        }
      }, { passive: true });

      track.addEventListener("touchend", (e) => {
        if (e.changedTouches && e.changedTouches[0]) {
          touchEndX = e.changedTouches[0].screenX;
          const diff = touchEndX - touchStartX;
          if (Math.abs(diff) > 40) {
            if (diff < 0) {
              updateCarousel(currentTemplateIndex + 1, true); // Swipe left -> Next
            } else {
              updateCarousel(currentTemplateIndex - 1, true); // Swipe right -> Prev
            }
          }
        }
      }, { passive: true });
    }

    // Keyboard Arrow Keys (Left / Right) when in Step 1
    window.addEventListener("keydown", (e) => {
      if (this.currentStep === 1) {
        if (e.key === "ArrowLeft") {
          updateCarousel(currentTemplateIndex - 1, true);
        } else if (e.key === "ArrowRight") {
          updateCarousel(currentTemplateIndex + 1, true);
        }
      }
    });

    // Card Clicks & Screenshot Zoom Lightbox
    cards.forEach((card, idx) => {
      card.addEventListener("click", (e) => {
        // If user clicked the zoom preview button, open modal
        const zoomBtn = e.target.closest(".btn-preview-zoom");
        if (zoomBtn) {
          e.stopPropagation();
          const imgSrc = zoomBtn.dataset.preview;
          const title = zoomBtn.dataset.title;
          const templateId = card.dataset.template;

          currentLightboxTemplate = templateId;
          if (lightboxImg) lightboxImg.src = imgSrc;
          if (lightboxTitle) lightboxTitle.textContent = title;
          if (lightbox) {
            lightbox.style.display = "flex";
            soundService.playClickTone();
          }
          return;
        }

        // Clicking on the card ensures it is selected and centered
        updateCarousel(idx, true);
      });
    });

    // Close Lightbox Modal
    if (btnCloseLightbox && lightbox) {
      btnCloseLightbox.addEventListener("click", () => {
        lightbox.style.display = "none";
        soundService.playClickTone();
      });
      lightbox.addEventListener("click", (e) => {
        if (e.target === lightbox) {
          lightbox.style.display = "none";
        }
      });
    }

    // Select Template from Lightbox Modal Action
    if (btnSelectFromLightbox && lightbox) {
      btnSelectFromLightbox.addEventListener("click", () => {
        if (currentLightboxTemplate) {
          const targetIndex = templateList.indexOf(currentLightboxTemplate);
          if (targetIndex !== -1) {
            updateCarousel(targetIndex, false);
            soundService.playQueueChime();
          }
        }
        lightbox.style.display = "none";
      });
    }

    // Initialize initial position and active states
    updateCarousel(currentTemplateIndex, false);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // ONEMAP POSTAL CODE LOOKUP & AUTO-FILL
  // ─────────────────────────────────────────────────────────────────────────

  setupPostalCodeLookup() {
    const postalInput = document.getElementById("branchPostalInput");
    const btnLookup = document.getElementById("btnLookupPostal");
    const addressInput = document.getElementById("branchAddressInput");
    const feedback = document.getElementById("wizardPostalFeedback");

    const executeLookup = async () => {
      if (!postalInput) return;
      const postalCode = postalInput.value.trim();
      const region = document.getElementById("brandRegionSelect")?.value || "sg";

      if (region === "sg") {
        if (!/^\d{6}$/.test(postalCode)) {
          if (feedback) {
            feedback.textContent = "⚠️ " + i18nService.t("owner.onboarding.postalInvalid", "Enter a valid 6-digit postal code");
            feedback.style.display = "block";
            feedback.style.color = "#ef4444";
          }
          return;
        }

        if (feedback) {
          feedback.textContent = "⏳ " + i18nService.t("owner.onboarding.postalSearching", "Searching address on OneMap...");
          feedback.style.display = "block";
          feedback.style.color = "var(--primary)";
        }

        try {
          const response = await fetch(
            `https://www.onemap.gov.sg/api/common/elastic/search?searchVal=${postalCode}&returnGeom=N&getAddrDetails=Y&pageNum=1`
          );
          const data = await response.json();

          if (data && data.found > 0 && Array.isArray(data.results) && data.results.length > 0) {
            const result = data.results[0];
            const blk = result.BLK_NO && result.BLK_NO !== "NIL" ? `${result.BLK_NO} ` : "";
            const road = result.ROAD_NAME && result.ROAD_NAME !== "NIL" ? result.ROAD_NAME : "";
            const building = result.BUILDING && result.BUILDING !== "NIL" ? `, ${result.BUILDING}` : "";
            const postal = result.POSTAL || postalCode;

            const fullAddress = `${blk}${road}${building}, Singapore ${postal}`;
            if (addressInput) addressInput.value = fullAddress;

            if (feedback) {
              feedback.textContent = "✅ " + i18nService.t("owner.onboarding.postalFound", "Address found & auto-filled");
              feedback.style.color = "#16a34a";
            }
            soundService.playClickTone();
            this.updateReviewSummary();
          } else {
            if (feedback) {
              feedback.textContent = "❌ " + i18nService.t("owner.onboarding.postalNotFound", "Postal code not found in Singapore registry");
              feedback.style.color = "#ef4444";
            }
          }
        } catch (err) {
          console.warn("[OneMap Lookup] Error fetching address:", err);
          if (feedback) {
            feedback.textContent = "⚠️ Connection to OneMap failed. Please type address manually.";
            feedback.style.color = "#ef4444";
          }
        }
      } else {
        // Malaysia Region feedback
        if (feedback) {
          feedback.textContent = "ℹ️ Malaysian postal code verified. Please ensure building & street are accurate.";
          feedback.style.display = "block";
          feedback.style.color = "var(--primary)";
        }
        this.updateReviewSummary();
      }
    };

    if (btnLookup) {
      btnLookup.addEventListener("click", (e) => {
        e.preventDefault();
        executeLookup();
      });
    }

    if (postalInput) {
      postalInput.addEventListener("input", (e) => {
        const val = e.target.value.trim();
        const region = document.getElementById("brandRegionSelect")?.value || "sg";
        if (region === "sg" && /^\d{6}$/.test(val)) {
          executeLookup();
        } else if (!val) {
          if (feedback) feedback.style.display = "none";
        }
      });

      postalInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          executeLookup();
        }
      });
    }
  }

  handleRegionChange() {
    const region = document.getElementById("brandRegionSelect")?.value || "sg";
    const postalLabel = document.getElementById("branchPostalLabel");
    const postalInput = document.getElementById("branchPostalInput");
    const feedback = document.getElementById("wizardPostalFeedback");

    if (region === "my") {
      if (postalLabel) postalLabel.textContent = i18nService.t("owner.onboarding.postalLabelMY", "Postal Code (MY)");
      if (postalInput) {
        postalInput.placeholder = "e.g. 50450";
        postalInput.maxLength = 5;
        if (postalInput.value === "238859") postalInput.value = "50450";
      }
      const addressInput = document.getElementById("branchAddressInput");
      if (addressInput && addressInput.value.includes("Singapore")) {
        addressInput.value = "Level 8, Menara Ken TTDI, Jalan Burhanuddin Helmi, 60000 Kuala Lumpur";
      }
      const phoneInput = document.getElementById("branchPhoneInput");
      if (phoneInput && phoneInput.value.startsWith("+65")) {
        phoneInput.value = "+60 3 7728 8899";
      }
    } else {
      if (postalLabel) postalLabel.textContent = i18nService.t("owner.onboarding.postalLabel", "Postal Code (SG)");
      if (postalInput) {
        postalInput.placeholder = "e.g. 238859";
        postalInput.maxLength = 6;
        if (postalInput.value === "50450") postalInput.value = "238859";
      }
      const addressInput = document.getElementById("branchAddressInput");
      if (addressInput && addressInput.value.includes("Kuala Lumpur")) {
        addressInput.value = "290 Orchard Road, #09-12 Paragon Medical Suites, Singapore 238859";
      }
      const phoneInput = document.getElementById("branchPhoneInput");
      if (phoneInput && phoneInput.value.startsWith("+60")) {
        phoneInput.value = "+65 6733 8899";
      }
    }

    if (feedback) feedback.style.display = "none";
  }

  // ─────────────────────────────────────────────────────────────────────────
  // DYNAMIC SERVICE DELIVERY MODEL ADAPTATION
  // ─────────────────────────────────────────────────────────────────────────

  setupServiceModeSelection() {
    const labels = document.querySelectorAll(".service-mode-label");
    const radios = document.querySelectorAll('input[name="wizardServiceMode"]');

    radios.forEach((radio) => {
      radio.addEventListener("change", () => {
        labels.forEach((lbl) => {
          lbl.style.borderColor = "#cbd5e1";
          lbl.style.background = "#ffffff";
          lbl.classList.remove("active");
          const strong = lbl.querySelector("strong");
          if (strong) strong.style.color = "#1e293b";
        });

        const parentLabel = radio.closest(".service-mode-label");
        if (parentLabel) {
          parentLabel.style.borderColor = "var(--primary)";
          parentLabel.style.background = "#f0fdfa";
          parentLabel.classList.add("active");
          const strong = parentLabel.querySelector("strong");
          if (strong) strong.style.color = "var(--primary-dark)";
        }

        soundService.playClickTone();
        this.applyServiceModeDynamicUI(radio.value);
        this.updateReviewSummary();
      });
    });
  }

  applyServiceModeDynamicUI(mode = "hybrid") {
    const addrLabel = document.getElementById("branchAddressLabel");
    const addrHelp = document.getElementById("branchAddressHelp");
    const addrInput = document.getElementById("branchAddressInput");
    const coverageField = document.getElementById("branchCoverageRadiusField");
    const hoursLabel = document.getElementById("branchHoursLabel");
    const hoursInput = document.getElementById("branchHoursInput");
    const capacityLabel = document.getElementById("branchCapacityLabel");
    const capacityHelp = document.getElementById("branchCapacityHelp");
    const roomsSelect = document.getElementById("branchRoomsInput");
    const branchNameInput = document.getElementById("branchNameInput");

    const prevCapacityVal = roomsSelect ? roomsSelect.value : "4";

    if (mode === "in_clinic") {
      // 1. In-Clinic Only
      if (addrLabel) addrLabel.textContent = i18nService.t("owner.onboarding.addrLabelClinic", "Clinic Physical Address");
      if (addrHelp) addrHelp.textContent = "Physical facility address where patients arrive for therapy sessions & consultations.";
      if (addrInput) addrInput.placeholder = "Building, Street, Unit & Postal Code";

      if (coverageField) coverageField.style.display = "none";

      if (hoursLabel) hoursLabel.textContent = i18nService.t("owner.onboarding.hoursLabelClinic", "Clinic Operating Hours");
      if (hoursInput && (hoursInput.value.includes("Home:") || hoursInput.value.includes("Dispatch"))) {
        hoursInput.value = "09:00 - 20:00 (Mon - Sat)";
      }

      if (capacityLabel) capacityLabel.textContent = i18nService.t("owner.onboarding.capacityLabelClinic", "Treatment Capacity / Clinic Therapy Suites");
      if (capacityHelp) capacityHelp.textContent = "Total private rooms or treatment bays available for simultaneous appointments.";

      if (roomsSelect) {
        roomsSelect.innerHTML = `
          <option value="2">2 Private Therapy Rooms (Boutique Practice)</option>
          <option value="4">4 Private Therapy Suites (Standard Clinic)</option>
          <option value="6">6 Multi-Bed Treatment Bays (High Volume)</option>
          <option value="8">8+ Large Enterprise Clinical Facility</option>
        `;
        roomsSelect.value = prevCapacityVal;
      }

      if (branchNameInput && (branchNameInput.value.includes("Dispatch") || branchNameInput.value.includes("Home Care Hub"))) {
        branchNameInput.value = "Paragon Medical Flagship (Branch 1)";
      }
    } else if (mode === "home_care") {
      // 2. Home Care Only
      if (addrLabel) addrLabel.textContent = i18nService.t("owner.onboarding.addrLabelHomeCare", "Operations & Dispatch Office Address");
      if (addrHelp) addrHelp.textContent = "Administrative headquarters or dispatch office for mobile therapy team (no patient walk-ins).";
      if (addrInput) addrInput.placeholder = "Headquarters / Dispatch Unit, Building, Street, Postal Code";

      if (coverageField) coverageField.style.display = "block";

      if (hoursLabel) hoursLabel.textContent = i18nService.t("owner.onboarding.hoursLabelHomeCare", "Home Visit Dispatch Service Hours");
      if (hoursInput && (hoursInput.value === "09:00 - 20:00 (Mon - Sat)" || hoursInput.value.includes("Clinic:"))) {
        hoursInput.value = "08:00 - 21:00 (Daily On-Demand Dispatch)";
      }

      if (capacityLabel) capacityLabel.textContent = i18nService.t("owner.onboarding.capacityLabelHomeCare", "Active Fleet Capacity / Mobile Therapists");
      if (capacityHelp) capacityHelp.textContent = "Total active certified mobile practitioners traveling to patients' addresses.";

      if (roomsSelect) {
        roomsSelect.innerHTML = `
          <option value="2">2 Mobile Practitioners (Up to 8 home visits/day)</option>
          <option value="4">4 Mobile Practitioners (Up to 16 home visits/day)</option>
          <option value="6">6 Certified Home Care Specialists (Up to 24 home visits/day)</option>
          <option value="8">8+ Enterprise Mobile Fleet (35+ home visits/day)</option>
        `;
        roomsSelect.value = prevCapacityVal;
      }

      if (branchNameInput && (branchNameInput.value.includes("Flagship") || branchNameInput.value.includes("Home Care Hub"))) {
        branchNameInput.value = "Dennis Mobile Care Dispatch (Central Hub)";
      }
    } else {
      // 3. Hybrid (Both)
      if (addrLabel) addrLabel.textContent = i18nService.t("owner.onboarding.addrLabelHybrid", "Clinic Physical Address & Service Hub");
      if (addrHelp) addrHelp.textContent = "Main physical clinic facility for walk-ins and central dispatch hub for traveling therapists.";
      if (addrInput) addrInput.placeholder = "Building, Street, Unit & Postal Code";

      if (coverageField) coverageField.style.display = "block";

      if (hoursLabel) hoursLabel.textContent = i18nService.t("owner.onboarding.hoursLabelHybrid", "Facility & Home Visit Operating Hours");
      if (hoursInput && (hoursInput.value === "09:00 - 20:00 (Mon - Sat)" || hoursInput.value.includes("Daily On-Demand"))) {
        hoursInput.value = "Clinic: 09:00 - 20:00 | Home Visits: 08:00 - 21:00";
      }

      if (capacityLabel) capacityLabel.textContent = i18nService.t("owner.onboarding.capacityLabelHybrid", "Hybrid Operational Capacity (Suites + Mobile Fleet)");
      if (capacityHelp) capacityHelp.textContent = "Combined operational capacity across private facility rooms and traveling specialists.";

      if (roomsSelect) {
        roomsSelect.innerHTML = `
          <option value="2">2 Therapy Rooms + 2 Mobile Specialists</option>
          <option value="4">4 Therapy Suites + 4 Mobile Practitioners (Standard)</option>
          <option value="6">6 Clinic Bays + 6 Home Visit Specialists</option>
          <option value="8">8+ Enterprise Suites & Island-wide Mobile Fleet</option>
        `;
        roomsSelect.value = prevCapacityVal;
      }

      if (branchNameInput && (branchNameInput.value.includes("Flagship") || branchNameInput.value.includes("Dispatch (Central Hub)"))) {
        branchNameInput.value = "Paragon Medical & Home Care Hub (Branch 1)";
      }
    }
  }

  setupSubscriptionBilling() {
    const subsRadios = document.querySelectorAll('input[name="wizardSubsPlan"]');
    subsRadios.forEach((radio) => {
      radio.addEventListener("change", (e) => {
        const region = document.getElementById("brandRegionSelect")?.value || "sg";
        const currency = region === "sg" ? "SGD" : "MYR";
        const price = parseFloat(e.target.dataset.price || "948").toFixed(2);
        const totalBillingAmount = document.getElementById("wizardTotalBillingAmount");
        if (totalBillingAmount) totalBillingAmount.textContent = `${currency} ${price}`;

        document.querySelectorAll(".subs-radio-label-wizard").forEach((label) => {
          label.style.borderColor = "var(--line)";
          label.style.background = "#f8fafc";
          const title = label.querySelector("span:first-of-type");
          if (title) title.style.color = "var(--text)";
        });

        const selectedLabel = e.target.closest(".subs-radio-label-wizard");
        if (selectedLabel) {
          selectedLabel.style.borderColor = "var(--primary)";
          selectedLabel.style.background = "#f0fdfa";
          const title = selectedLabel.querySelector("span:first-of-type");
          if (title) title.style.color = "var(--primary)";
        }

        this.updateReviewSummary();
      });
    });
  }

  updateSubscriptionPricing() {
    const tConfig = getTemplateById(this.selectedTemplate);
    const monthly = tConfig?.pricing?.monthly || 99;
    const sixMonth = tConfig?.pricing?.sixMonth || Math.round(monthly * 6 * 0.9);
    const yearly = tConfig?.pricing?.yearly || Math.round(monthly * 12 * 0.8);

    const region = document.getElementById("brandRegionSelect")?.value || "sg";
    const currency = region === "sg" ? "SGD" : "MYR";

    const plan1Radio = document.querySelector('input[name="wizardSubsPlan"][value="1"]');
    const plan6Radio = document.querySelector('input[name="wizardSubsPlan"][value="6"]');
    const plan12Radio = document.querySelector('input[name="wizardSubsPlan"][value="12"]');

    if (plan1Radio) plan1Radio.dataset.price = monthly;
    if (plan6Radio) plan6Radio.dataset.price = sixMonth;
    if (plan12Radio) plan12Radio.dataset.price = yearly;

    const plan1Text = document.getElementById("plan1mText");
    const plan6Text = document.getElementById("plan6mText");
    const plan1yText = document.getElementById("plan1yText");

    if (plan1Text) plan1Text.textContent = `${currency} ${monthly}/mo`;
    if (plan6Text) plan6Text.innerHTML = `${currency} ${Math.round(sixMonth / 6)}/mo (<span data-i18n="owner.onboarding.save10">Save 10%</span>)`;
    if (plan1yText) plan1yText.innerHTML = `${currency} ${Math.round(yearly / 12)}/mo (<span data-i18n="owner.onboarding.save20">Save 20%</span>)`;

    const selectedRadio = document.querySelector('input[name="wizardSubsPlan"]:checked');
    const activePrice = selectedRadio ? parseFloat(selectedRadio.dataset.price).toFixed(2) : parseFloat(yearly).toFixed(2);
    const totalBillingAmount = document.getElementById("wizardTotalBillingAmount");
    if (totalBillingAmount) totalBillingAmount.textContent = `${currency} ${activePrice}`;
  }

  getTemplateLabel(templateId) {
    switch (templateId) {
      case "tcm":
        return `🌿 ${i18nService.t("template.tcm.title", "Traditional Chinese Medicine (TCM)")}`;
      case "wellness":
        return `🌸 ${i18nService.t("template.wellness.title", "Wellness & Spa Care")}`;
      case "physio":
        return `🏃 ${i18nService.t("template.physio.title", "Physiotherapy & Sports Rehab")}`;
      case "nutrition":
        return `🥗 ${i18nService.t("template.nutrition.title", "Clinical Nutrition & Dietetics")}`;
      case "personal-trainer":
        return `🏋️ ${i18nService.t("template.pt.title", "Personal Trainer & Fitness")}`;
      default:
        return `🏃 ${i18nService.t("template.physio.title", "Physiotherapy & Sports Rehab")}`;
    }
  }

  updateReviewSummary() {
    const brandName = document.getElementById("brandNameInput")?.value.trim() || "My Clinic Hub";
    const brandTagline = document.getElementById("brandTaglineInput")?.value.trim() || "Excellence in Clinical Care";
    const branchName = document.getElementById("branchNameInput")?.value.trim() || "Branch 1";
    const branchAddress = document.getElementById("branchAddressInput")?.value.trim() || "Singapore";
    const region = document.getElementById("brandRegionSelect")?.value || "sg";

    const logoEl = document.getElementById("reviewLogoBadge");
    const brandTitleEl = document.getElementById("reviewBrandTitle");
    const brandTaglineEl = document.getElementById("reviewBrandTagline");
    const templateValEl = document.getElementById("reviewTemplateVal");
    const branchValEl = document.getElementById("reviewBranchVal");
    const serviceModeValEl = document.getElementById("reviewServiceModeVal");
    const addressValEl = document.getElementById("reviewAddressVal");
    const coverageRow = document.getElementById("reviewCoverageRow");
    const coverageValEl = document.getElementById("reviewCoverageVal");
    const capacityValEl = document.getElementById("reviewCapacityVal");
    const regionValEl = document.getElementById("reviewRegionVal");
    const planValEl = document.getElementById("reviewPlanVal");
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

    const mode = document.querySelector('input[name="wizardServiceMode"]:checked')?.value || "hybrid";
    if (serviceModeValEl) {
      if (mode === "in_clinic") {
        serviceModeValEl.textContent = "🏥 " + i18nService.t("owner.onboarding.modeInClinicTitle", "In-Clinic Facility Only");
      } else if (mode === "home_care") {
        serviceModeValEl.textContent = "🏠 " + i18nService.t("owner.onboarding.modeHomeCareTitle", "Home Care Only (Home Visit)");
      } else {
        serviceModeValEl.textContent = "✨ " + i18nService.t("owner.onboarding.modeHybridTitle", "Hybrid (Both In-Clinic & Home Care)");
      }
    }

    if (addressValEl) addressValEl.textContent = branchAddress;

    // Coverage Area Row in Review Card
    if (coverageRow) {
      if (mode === "in_clinic") {
        coverageRow.style.display = "none";
      } else {
        coverageRow.style.display = "flex";
        const coverageSelect = document.getElementById("branchCoverageRadiusInput");
        if (coverageValEl && coverageSelect) {
          coverageValEl.textContent = coverageSelect.options[coverageSelect.selectedIndex]?.text || "15 km Radius";
        }
      }
    }

    // Capacity Row in Review Card
    if (capacityValEl) {
      const roomsSelect = document.getElementById("branchRoomsInput");
      if (roomsSelect) {
        capacityValEl.textContent = roomsSelect.options[roomsSelect.selectedIndex]?.text || "4 Units";
      }
    }

    if (regionValEl) regionValEl.textContent = region === "sg" ? "🇸🇬 Singapore (SGD)" : "🇲🇾 Malaysia (MYR)";

    if (planValEl) {
      const selectedPlan = document.querySelector('input[name="wizardSubsPlan"]:checked');
      const planDuration = selectedPlan ? selectedPlan.value : "12";
      const planPrice = selectedPlan ? selectedPlan.dataset.price : "948";
      const currency = region === "sg" ? "SGD" : "MYR";
      const durationLabel = planDuration === "1" ? "1 Month" : (planDuration === "6" ? "6 Months" : "1 Year");
      planValEl.textContent = `${durationLabel} (${currency} ${parseFloat(planPrice).toFixed(2)})`;
    }

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
      launchBtn.innerHTML = i18nService.t("owner.onboarding.launchProcessing", "⏳ Processing Payment & Provisioning Tenant...");

      const brandName = document.getElementById("brandNameInput")?.value.trim() || "My Clinic";
      const brandTagline = document.getElementById("brandTaglineInput")?.value.trim() || "";
      const brandDesc = document.getElementById("brandDescInput")?.value.trim() || "";
      const region = document.getElementById("brandRegionSelect")?.value || "sg";
      const branchName = document.getElementById("branchNameInput")?.value.trim() || "Branch 1";
      const branchPostal = document.getElementById("branchPostalInput")?.value.trim() || "";
      const branchAddress = document.getElementById("branchAddressInput")?.value.trim() || "Clinic Address";
      const branchPhone = document.getElementById("branchPhoneInput")?.value.trim() || "+65 6733 8899";
      const branchHours = document.getElementById("branchHoursInput")?.value.trim() || "09:00 - 20:00";
      const branchRooms = document.getElementById("branchRoomsInput")?.value || "4";
      const serviceMode = document.querySelector('input[name="wizardServiceMode"]:checked')?.value || "hybrid";
      const coverageRadius = document.getElementById("branchCoverageRadiusInput")?.value || "15km";

      const branchId = `br-${region}-${Date.now().toString().slice(-4)}`;

      // 1. Create First Branch Object
      const newBranch = {
        id: branchId,
        name: branchName,
        code: `${region.toUpperCase()}-01`,
        postalCode: branchPostal,
        address: branchAddress,
        phone: branchPhone,
        hours: branchHours,
        rooms: branchRooms,
        template: this.selectedTemplate,
        serviceMode: serviceMode,
        coverageRadius: serviceMode === "in_clinic" ? null : coverageRadius,
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
      currentBranches = [
        newBranch,
        ...currentBranches.filter(
          (b) => b.id !== branchId && (b.name || "").trim().toLowerCase() !== branchName.trim().toLowerCase()
        )
      ];
      storageService.set("cliniva_branches", currentBranches);
      storageService.set("cliniva_active_branch_id", branchId);

      // 2b. Save B2B Subscription Record
      const selectedPlan = document.querySelector('input[name="wizardSubsPlan"]:checked');
      const planDuration = selectedPlan ? parseInt(selectedPlan.value, 10) : 12;
      const planPrice = selectedPlan ? parseFloat(selectedPlan.dataset.price) : 948;

      const subscription = {
        id: `sub-${Date.now()}`,
        ownerId: this.currentUser.id,
        ownerEmail: this.currentUser.email,
        template: this.selectedTemplate,
        branchId: branchId,
        branchName: branchName,
        durationMonths: planDuration,
        amount: planPrice,
        currency: region === "sg" ? "SGD" : "MYR",
        status: "ACTIVE",
        paidAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + planDuration * 30 * 24 * 60 * 60 * 1000).toISOString()
      };
      const existingSubs = storageService.get("cliniva_owner_subscriptions", []);
      storageService.set("cliniva_owner_subscriptions", [subscription, ...existingSubs]);

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
        branchName,
        serviceMode
      });

      // 6. Sync to Supabase Cloud if available
      if (supabaseService.isAvailable()) {
        supabaseService.upsertBranch({
          id: branchId,
          name: branchName,
          postal_code: branchPostal,
          address: branchAddress,
          phone: branchPhone,
          hours: branchHours,
          regionCode: region,
          region: region === "sg" ? "Singapore" : "Malaysia",
          country: region === "sg" ? "Singapore" : "Malaysia",
          currency: region === "sg" ? "SGD" : "MYR",
          template: this.selectedTemplate,
          service_mode: serviceMode,
          coverage_radius: serviceMode === "in_clinic" ? null : coverageRadius
        }).catch((err) => console.warn("[Onboarding] Cloud branch sync failed:", err));
      }

      setTimeout(() => {
        const alertMsg = (i18nService.t("onboarding.completeAlert", "🎉 ONBOARDING COMPLETE!\n\nBrand: {brand}\nTemplate: {template}\nBranch 1: {branch}\n\nRedirecting to Owner Dashboard..."))
          .replace("{brand}", brandName)
          .replace("{template}", this.getTemplateLabel(this.selectedTemplate))
          .replace("{branch}", branchName);
        alert(alertMsg);
        window.location.href = "../../pages/owner/dashboard.html";
      }, 1500);
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

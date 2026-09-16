/**
 * Cliniva — Public Branch Landing Page Controller (branch.html)
 * SOLID: Single Responsibility Principle for Public B2C Clinic Branch Storefront
 * Handles dynamic branch lookup, template theme auras (Wellness/Spa, Physio, Nutrition),
 * services & specialists display, simulated prototype URL generation, and frictionless guest booking routing.
 */

import { storageService } from "../../services/storage.service.js";
import { bookingService } from "../../services/booking.service.js";
import { i18nService } from "../../services/i18n.service.js";
import { soundService } from "../../services/sound.service.js";
import { getTemplateById, DEFAULT_TEMPLATE_ID } from "../../config/templates/index.js";
import { CLINIC_LOCATIONS } from "../../config/clinic-data.js";

export class BranchLandingController {
  constructor() {
    this.BRANCHES_KEY = "cliniva_branches";
    this.selectedBranch = null;
    this.templateConfig = null;
    this.branchId = null;
    this.currency = "SGD";
  }

  init() {
    // 1. Resolve Target Branch & Template from URL Parameters
    const urlParams = new URLSearchParams(window.location.search);
    const targetParam = urlParams.get("branch") || urlParams.get("id");
    const templateParam = urlParams.get("template");

    this.loadBranchData(targetParam, templateParam);

    // If wellness / spa template, seamlessly transition to the luxury SPA storefront experience!
    if (this.selectedBranch && (this.selectedBranch.template === "wellness" || this.selectedBranch.template === "spa")) {
      const spaUrl = `../../templates/spa/index.html?branch=${encodeURIComponent(this.selectedBranch.id)}`;
      window.location.replace(spaUrl);
      return;
    }
    if (this.selectedBranch && (this.selectedBranch.template === "physiotherapy" || this.selectedBranch.template === "physio")) {
      const physioUrl = `../../templates/physiotherapy/index.html?branch=${encodeURIComponent(this.selectedBranch.id)}`;
      window.location.replace(physioUrl);
      return;
    }
    if (this.selectedBranch && this.selectedBranch.template === "nutrition") {
      const nutritionUrl = `../../templates/nutrition/index.html?branch=${encodeURIComponent(this.selectedBranch.id)}`;
      window.location.replace(nutritionUrl);
      return;
    }
    if (this.selectedBranch && (this.selectedBranch.template === "fitness" || this.selectedBranch.template === "personal_trainer")) {
      const fitnessUrl = `../../templates/personal_trainer/index.html?branch=${encodeURIComponent(this.selectedBranch.id)}`;
      window.location.replace(fitnessUrl);
      return;
    }
    if (this.selectedBranch && this.selectedBranch.template === "tcm") {
      const tcmUrl = `../../templates/tcm/index.html?branch=${encodeURIComponent(this.selectedBranch.id)}`;
      window.location.replace(tcmUrl);
      return;
    }

    // 2. Set DOM Body Theme Attribute for Instant CSS Theming
    if (this.templateConfig && this.templateConfig.id) {
      document.body.setAttribute("data-template", this.templateConfig.id);
    }

    // 3. Initialize Language Switcher & Reactive Translation Listener
    this.initLanguageSwitcher();

    // 4. Render Dynamic UI Components
    this.renderAll();

    // 5. Bind Interactive Events (Copy Link, QR Modal, etc.)
    this.bindEvents();

    console.info(
      "[BranchLandingController] Initialized for branch:",
      this.selectedBranch?.id,
      "name:",
      this.selectedBranch?.name,
      "template:",
      this.templateConfig?.id
    );
  }

  loadBranchData(targetBranchId, templateOverride = null) {
    const storedBranches = storageService.get(this.BRANCHES_KEY, []);
    let match = null;

    // A. Match target branch from stored branches (Owner / Super Admin created)
    if (Array.isArray(storedBranches) && storedBranches.length > 0) {
      if (targetBranchId) {
        const cleanTarget = String(targetBranchId).trim().toLowerCase();
        // Exact ID match
        match = storedBranches.find((b) => b.id && b.id.toLowerCase() === cleanTarget);

        // Slug / sanitized match
        if (!match) {
          match = storedBranches.find((b) => {
            const slug = b.id ? b.id.toLowerCase().replace(/[^a-z0-9]/g, "-") : "";
            const nameSlug = b.name ? b.name.toLowerCase().replace(/[^a-z0-9]/g, "-") : "";
            return slug === cleanTarget || nameSlug.includes(cleanTarget) || cleanTarget.includes(nameSlug);
          });
        }
      }

      // If no target provided or not matched, check active branch ID or fallback to first stored branch
      if (!match) {
        const activeBranchId = storageService.get("cliniva_active_branch_id", null);
        if (activeBranchId) {
          match = storedBranches.find((b) => b.id === activeBranchId);
        }
        if (!match && !targetBranchId) {
          match = storedBranches[0];
        }
      }
    }

    // B. If still no match, check Master CLINIC_LOCATIONS or default template profiles
    if (!match) {
      const loc = (targetBranchId && CLINIC_LOCATIONS.find((l) => l.id === targetBranchId)) || CLINIC_LOCATIONS[0];
      const templateKey = templateOverride || bookingService.getActiveTemplateId() || DEFAULT_TEMPLATE_ID;
      const tData = loc.templates?.[templateKey] || loc.templates?.[DEFAULT_TEMPLATE_ID] || loc.templates?.wellness || {};

      match = {
        id: loc.id || "sg-orchard",
        name: tData.name || (templateKey === "physio" ? "PhysioCare Elite Rehab" : templateKey === "nutrition" ? "NutriFlow Dietetics Center" : "Orchard Wellness & Luxury Spa"),
        badge: tData.badge || (templateKey === "physio" ? "🏃 CLINICAL SPORTS REHAB" : templateKey === "nutrition" ? "🥗 CLINICAL NUTRITION & DIETETICS" : "🌸 LUXURY WELLNESS SPA"),
        icon: tData.icon || (templateKey === "physio" ? "🏃" : templateKey === "nutrition" ? "🥗" : "🌸"),
        template: templateKey,
        region: loc.region || "Singapore",
        regionCode: loc.regionCode || "sg",
        currency: loc.currency || "SGD",
        address: loc.address || "290 Orchard Road, Paragon Medical Suites #14-02, Singapore 238859",
        hours: loc.hours || "Mon - Sat (08:30 - 20:00 SGT)",
        phone: loc.phone || "+65 6738 1234",
        rooms: tData.rooms || ["Suite 01", "Suite 02", "Therapy Room 03", "VIP Room 04"],
        equipment: tData.equipment || []
      };
    }

    // Allow explicit query param override (e.g. ?template=physio) for demonstration testing
    if (templateOverride) {
      match.template = templateOverride;
    }

    this.selectedBranch = match;
    this.currency = match.currency || (match.regionCode === "my" ? "MYR" : "SGD");

    // Resolve Template Configuration (Wellness, Physio, Nutrition, etc.)
    const templateId = match.template || match.templateId || bookingService.getActiveTemplateId() || DEFAULT_TEMPLATE_ID;
    this.templateConfig = getTemplateById(templateId);

    // Apply template fallback badge and icon if missing
    if (!this.selectedBranch.badge && this.templateConfig) {
      this.selectedBranch.badge = `${this.templateConfig.shortName || this.templateConfig.name}`.toUpperCase();
    }
    if (!this.selectedBranch.icon && this.templateConfig) {
      this.selectedBranch.icon = templateId === "physio" ? "🏃" : templateId === "nutrition" ? "🥗" : "🌸";
    }
  }

  renderAll() {
    this.renderHeaderAndProtoUrl();
    this.renderHeroSection();
    this.renderHighlights();
    this.renderServicesGrid();
    this.renderSpecialistsGrid();
    this.renderFacilitiesSection();
    this.renderLocationAndContact();
    this.renderStickyMobileBar();
    this.renderQrCode();
  }

  renderHeaderAndProtoUrl() {
    const branch = this.selectedBranch;
    const template = this.templateConfig;

    // Simulated Subdomain (e.g. orchard-wellness.cliniva.app)
    const slug = branch.id
      ? branch.id.toLowerCase().replace(/[^a-z0-9]/g, "-")
      : (branch.name || "branch").toLowerCase().replace(/[^a-z0-9]/g, "-");
    const protoUrl = `https://${slug}.cliniva.app`;

    const protoEl = document.getElementById("protoUrlDisplay");
    if (protoEl) protoEl.textContent = protoUrl;

    // Page Title
    const titleEl = document.getElementById("branchPageTitle");
    if (titleEl) {
      titleEl.textContent = `${branch.name} — Cliniva Healthcare`;
    }

    // Header Title & Badge
    const headerName = document.getElementById("branchHeaderName");
    if (headerName) headerName.textContent = branch.name;

    const headerBadge = document.getElementById("branchHeaderBadge");
    if (headerBadge) {
      headerBadge.textContent = branch.badge || `${template.shortName || template.name}`.toUpperCase();
    }

    // Update Header CTA Link
    const headerCta = document.getElementById("headerBookCta");
    if (headerCta) {
      headerCta.href = `../../pages/public/booking.html?branch=${encodeURIComponent(branch.id)}`;
    }
  }

  renderHeroSection() {
    const branch = this.selectedBranch;
    const template = this.templateConfig;
    const tId = template.id || "wellness";

    const heroTitle = document.getElementById("branchHeroTitle");
    if (heroTitle) heroTitle.textContent = branch.name;

    const heroTagline = document.getElementById("branchHeroTagline");
    if (heroTagline) {
      heroTagline.textContent = branch.tagline || template.tagline || `${template.name} consultation and therapy services in a private clinical environment.`;
    }

    const catIcon = document.getElementById("heroCategoryIcon");
    if (catIcon) {
      catIcon.textContent = branch.icon || (tId === "physio" ? "🏃" : tId === "nutrition" ? "🥗" : "🌸");
    }

    const catText = document.getElementById("heroCategoryText");
    if (catText) {
      catText.textContent = (template.category || template.name).toUpperCase();
    }

    const regionText = document.getElementById("heroRegionText");
    if (regionText) regionText.textContent = (branch.region || "SINGAPORE").toUpperCase();

    // Template-Specific Trust Metrics
    this.renderTrustMetrics(tId);

    // Book CTA Link
    const heroBookBtn = document.getElementById("heroBookBtn");
    if (heroBookBtn) {
      heroBookBtn.href = `../../pages/public/booking.html?branch=${encodeURIComponent(branch.id)}`;
    }

    // WhatsApp Front Desk Link
    const whatsAppBtn = document.getElementById("heroWhatsAppBtn");
    if (whatsAppBtn) {
      const cleanPhone = (branch.phone || "+6567381234").replace(/[^0-9]/g, "");
      const waMsg = encodeURIComponent(`Hello ${branch.name}, I would like to inquire about booking an appointment.`);
      whatsAppBtn.href = `https://wa.me/${cleanPhone}?text=${waMsg}`;
    }
  }

  renderTrustMetrics(templateId) {
    const trustRow = document.querySelector(".branch-trust-row");
    if (!trustRow) return;

    if (templateId === "physio" || templateId === "physiotherapy") {
      trustRow.innerHTML = `
        <div class="trust-item">
          <span class="trust-stars">★★★★★</span>
          <span class="trust-text"><strong>4.9 / 5.0</strong> (2,100+ Recovered Patients)</span>
        </div>
        <div class="trust-item">
          <span class="trust-icon">🩺</span>
          <span class="trust-text">Board-Certified Physiotherapists</span>
        </div>
        <div class="trust-item">
          <span class="trust-icon">🔬</span>
          <span class="trust-text">Shockwave &amp; Ultrasound Labs</span>
        </div>
        <div class="trust-item">
          <span class="trust-icon">⏱️</span>
          <span class="trust-text">1-on-1 Dedicated Rehab Care</span>
        </div>
      `;
    } else if (templateId === "nutrition") {
      trustRow.innerHTML = `
        <div class="trust-item">
          <span class="trust-stars">★★★★★</span>
          <span class="trust-text"><strong>4.9 / 5.0</strong> (1,800+ Personalized Meal Plans)</span>
        </div>
        <div class="trust-item">
          <span class="trust-icon">🥗</span>
          <span class="trust-text">Registered Clinical Dietitians</span>
        </div>
        <div class="trust-item">
          <span class="trust-icon">📊</span>
          <span class="trust-text">Dual-Frequency InBody Composition</span>
        </div>
        <div class="trust-item">
          <span class="trust-icon">📱</span>
          <span class="trust-text">Digital Diet &amp; Calorie App Sync</span>
        </div>
      `;
    } else {
      // Default: Wellness & Spa (Serenity Style)
      trustRow.innerHTML = `
        <div class="trust-item">
          <span class="trust-stars">★★★★★</span>
          <span class="trust-text"><strong>4.9 / 5.0</strong> (1,450+ Verified Spa Guests)</span>
        </div>
        <div class="trust-item">
          <span class="trust-icon">🌸</span>
          <span class="trust-text">Licensed Spa Masseurs &amp; Therapists</span>
        </div>
        <div class="trust-item">
          <span class="trust-icon">🚪</span>
          <span class="trust-text">Private Soundproof Suites</span>
        </div>
        <div class="trust-item">
          <span class="trust-icon">⏱️</span>
          <span class="trust-text">60/75/90 Min Full Relaxation</span>
        </div>
      `;
    }
  }

  renderHighlights() {
    const branch = this.selectedBranch;
    const template = this.templateConfig;
    const tId = template.id || "wellness";

    const roomCount = branch.rooms ? (Array.isArray(branch.rooms) ? branch.rooms.length : branch.rooms) : 4;
    const roomEl = document.getElementById("statRoomCount");
    const roomSubEl = document.querySelector('[data-i18n="branchLanding.statRoomsSub"]');

    if (roomEl) {
      if (tId === "physio") {
        roomEl.textContent = `${roomCount} Rehab Suites`;
        if (roomSubEl) roomSubEl.textContent = "Ergonomic clinical beds";
      } else if (tId === "nutrition") {
        roomEl.textContent = `${roomCount} Consultation Suites`;
        if (roomSubEl) roomSubEl.textContent = "Private metabolic analysis";
      } else {
        roomEl.textContent = `${roomCount} Private Suites`;
        if (roomSubEl) roomSubEl.textContent = "Sanitized & soundproofed";
      }
    }

    const hoursEl = document.getElementById("statOperatingHours");
    if (hoursEl) hoursEl.textContent = branch.hours || "Mon - Sat (08:30 - 20:00)";

    const addrEl = document.getElementById("statShortAddress");
    if (addrEl) {
      const parts = (branch.address || "").split(",");
      addrEl.textContent = parts[0] || branch.address || "Medical Suites";
    }
  }

  renderServicesGrid() {
    const container = document.getElementById("branchServicesGrid");
    if (!container) return;

    const template = this.templateConfig;
    const services = (this.selectedBranch.services && this.selectedBranch.services.length > 0)
      ? this.selectedBranch.services
      : (template.services || bookingService.getServices(template.id));
    const isSGD = this.currency === "SGD";

    if (!services || services.length === 0) {
      container.innerHTML = `<p style="text-align:center; color:var(--muted); padding:30px;">No treatments configured for this branch yet.</p>`;
      return;
    }

    const cardsHtml = services.map((svc) => {
      const priceVal = isSGD ? svc.priceSGD : svc.priceMYR;
      const priceFormatted = `${this.currency} ${Number(priceVal || 0).toFixed(2)}`;
      const bookUrl = `../../pages/public/booking.html?branch=${encodeURIComponent(this.selectedBranch.id)}&service=${encodeURIComponent(svc.id)}`;
      const localizedTitle = svc.nameI18n ? i18nService.t(svc.nameI18n, svc.name) : svc.name;
      const localizedDesc = svc.descriptionI18n ? i18nService.t(svc.descriptionI18n, svc.description) : svc.description;

      return `
        <article class="service-card" data-service-id="${svc.id}">
          <div class="service-card-top">
            <span class="service-duration-badge">⏱️ ${svc.durationMinutes || 60} min</span>
            ${svc.badge ? `<span class="service-featured-badge">✦ ${svc.badge}</span>` : ""}
          </div>

          <h3 class="service-title">${localizedTitle}</h3>
          <p class="service-desc">${localizedDesc || "Comprehensive treatment session with personalized assessment and dedicated practitioner care."}</p>

          <div class="service-meta-box">
            <div class="service-meta-row">
              <span class="service-meta-label">Category:</span>
              <span class="service-meta-val">${svc.category || "Consultation & Therapy"}</span>
            </div>
            ${svc.requiresEquipment ? `
              <div class="service-meta-row">
                <span class="service-meta-label">Equipment:</span>
                <span class="service-meta-val">🔬 ${svc.requiresEquipment}</span>
              </div>
            ` : ""}
          </div>

          <div class="service-price-row">
            <div>
              <div class="service-price-amount">${priceFormatted}</div>
              <span class="service-price-sub">Pay at Clinic Counter</span>
            </div>
            <a href="${bookUrl}" class="btn btn-primary btn-book-service">
              Select &amp; Book →
            </a>
          </div>
        </article>
      `;
    }).join("");

    container.innerHTML = cardsHtml;
  }

  renderSpecialistsGrid() {
    const container = document.getElementById("branchSpecialistsGrid");
    if (!container) return;

    const template = this.templateConfig;
    const specialists = (this.selectedBranch.practitioners && this.selectedBranch.practitioners.length > 0)
      ? this.selectedBranch.practitioners
      : bookingService.getPractitioners(this.selectedBranch.id, template.id);

    const countEl = document.getElementById("statSpecialistCount");
    if (countEl) {
      if (template.id === "physio") {
        countEl.textContent = `${specialists.length} Attending Physiotherapists`;
      } else if (template.id === "nutrition") {
        countEl.textContent = `${specialists.length} Registered Dietitians`;
      } else {
        countEl.textContent = `${specialists.length} Licensed Spa Therapists`;
      }
    }

    if (!specialists || specialists.length === 0) {
      container.innerHTML = `<p style="text-align:center; color:var(--muted); padding:30px;">Specialist profiles are being updated for this branch.</p>`;
      return;
    }

    const cardsHtml = specialists.map((spec) => {
      const bookDoctorUrl = `../../pages/public/booking.html?branch=${encodeURIComponent(this.selectedBranch.id)}&doctor=${encodeURIComponent(spec.id)}`;
      const title = spec.title || template.practitionerTitle || "Clinical Specialist";

      return `
        <article class="specialist-card" data-practitioner-id="${spec.id}">
          <div class="specialist-header">
            <div class="specialist-avatar">🧑‍⚕️</div>
            <div class="specialist-name-group">
              <h3 class="specialist-name">${spec.name}</h3>
              <span class="specialist-title">${title}</span>
            </div>
          </div>

          <div class="specialist-tags">
            <span class="specialist-tag">Specialty: ${spec.specialty || "General Care"}</span>
            <span class="specialist-tag">1-on-1 Consultation</span>
          </div>

          <div class="specialist-avail">
            <span class="status-pulse-dot" style="width:6px; height:6px;"></span>
            <span>Next Available Slot: Today</span>
          </div>

          <a href="${bookDoctorUrl}" class="btn btn-soft btn-book-specialist">
            Book with ${spec.name.split(" ")[0]} →
          </a>
        </article>
      `;
    }).join("");

    container.innerHTML = cardsHtml;
  }

  renderFacilitiesSection() {
    const branch = this.selectedBranch;
    const template = this.templateConfig;
    const tId = template.id || "wellness";

    const equipDesc = document.getElementById("facilityEquipmentDesc");
    if (equipDesc) {
      if (branch.equipment && branch.equipment.length > 0) {
        equipDesc.textContent = `Equipped with professional hardware: ${branch.equipment.join(", ")} regularly calibrated to clinical standards.`;
      } else if (tId === "physio") {
        equipDesc.textContent = `Equipped with certified clinical rehabilitation gear: Radial Shockwave Therapy Unit, Dual-Frequency Ultrasound Scanners, Spinal Decompression Traction Table, EMG Biofeedback Monitors, and Functional Rehabilitation Gym.`;
      } else if (tId === "nutrition") {
        equipDesc.textContent = `Equipped with medical-grade assessment technology: InBody 770 Multi-Frequency Body Composition Analyzer, Indirect Calorimeter (RMR Metabolic Chamber), Continuous Glucose Monitoring (CGM) Sensors, and Private Dietary Planning Suites.`;
      } else {
        equipDesc.textContent = `Equipped with luxury spa hardware: Aromatherapy Essential Diffusers, Heated Hydrotherapy Tables, Himalayan Salt Ionizers, Thermal Herbal Steamers, and Private Jacuzzi Suites.`;
      }
    }
  }

  renderLocationAndContact() {
    const branch = this.selectedBranch;

    // Location details
    const locBranchName = document.getElementById("locationBranchName");
    if (locBranchName) locBranchName.textContent = branch.name;

    const locAddr = document.getElementById("locationAddressText");
    if (locAddr) locAddr.textContent = branch.address || "Medical Suites Floor";

    const locHours = document.getElementById("locationHoursText");
    if (locHours) locHours.textContent = branch.hours || "Mon - Sat: 08:30 - 20:00 SGT";

    const phoneLink = document.getElementById("locationPhoneLink");
    if (phoneLink) {
      phoneLink.textContent = branch.phone || "+65 6738 1234";
      phoneLink.href = `tel:${(branch.phone || "+6567381234").replace(/[^0-9+]/g, "")}`;
    }

    // Google Maps & Waze Links
    const mapsBtn = document.getElementById("btnGoogleMaps");
    if (mapsBtn) {
      const query = encodeURIComponent(`${branch.name} ${branch.address}`);
      mapsBtn.href = `https://www.google.com/maps/search/?api=1&query=${query}`;
    }

    const wazeBtn = document.getElementById("btnWaze");
    if (wazeBtn) {
      const query = encodeURIComponent(branch.address || branch.name);
      wazeBtn.href = `https://waze.com/ul?q=${query}&navigate=yes`;
    }

    // WhatsApp Direct Button
    const waDirectBtn = document.getElementById("btnWhatsAppDirect");
    if (waDirectBtn) {
      const cleanPhone = (branch.phone || "+6567381234").replace(/[^0-9]/g, "");
      const waMsg = encodeURIComponent(`Hi ${branch.name}, I have a question about booking an appointment.`);
      waDirectBtn.href = `https://wa.me/${cleanPhone}?text=${waMsg}`;
    }

    // Map Card Preview Details
    const mapName = document.getElementById("mapBranchName");
    if (mapName) mapName.textContent = branch.name;

    const mapSub = document.getElementById("mapAddressSub");
    if (mapSub) mapSub.textContent = branch.address || "";

    const mapPin = document.getElementById("mapPinIcon");
    if (mapPin) mapPin.textContent = branch.icon || "📍";
  }

  renderStickyMobileBar() {
    const branch = this.selectedBranch;
    const mobName = document.getElementById("mobStickyBranchName");
    if (mobName) mobName.textContent = branch.name;

    const mobBtn = document.getElementById("mobStickyBookBtn");
    if (mobBtn) {
      mobBtn.href = `../../pages/public/booking.html?branch=${encodeURIComponent(branch.id)}`;
    }
  }

  renderQrCode() {
    const branch = this.selectedBranch;
    const protoUrl = document.getElementById("protoUrlDisplay")?.textContent || window.location.href;

    const qrTitle = document.getElementById("qrBranchTitle");
    if (qrTitle) qrTitle.textContent = branch.name;

    const qrUrlText = document.getElementById("qrBranchUrlText");
    if (qrUrlText) qrUrlText.textContent = protoUrl;
  }

  initLanguageSwitcher() {
    const select = document.getElementById("branchLangSelect");
    if (!select) return;

    // Set initial value from i18nService
    select.value = i18nService.currentLocale || "en";

    select.addEventListener("change", (e) => {
      const newLang = e.target.value;
      i18nService.setLocale(newLang);
    });

    // Listen for reactive language change
    document.addEventListener("cliniva:languageChanged", (e) => {
      if (select) select.value = e.detail?.locale || "en";
      this.renderServicesGrid();
      this.renderSpecialistsGrid();
    });
  }

  bindEvents() {
    // 1. Copy Simulated Prototype Link
    const copyProtoBtn = document.getElementById("btnCopyProtoUrl");
    if (copyProtoBtn) {
      copyProtoBtn.addEventListener("click", () => {
        const protoUrl = document.getElementById("protoUrlDisplay")?.textContent || window.location.href;
        this.copyToClipboard(protoUrl, i18nService.t("branchLanding.linkCopiedToast", "Public branch link copied to clipboard!"));
      });
    }

    // 2. Copy Physical Address
    const copyAddrBtn = document.getElementById("btnCopyAddress");
    if (copyAddrBtn) {
      copyAddrBtn.addEventListener("click", () => {
        const addr = this.selectedBranch?.address || "";
        this.copyToClipboard(addr, i18nService.t("branchLanding.addressCopiedToast", "Clinic address copied to clipboard!"));
      });
    }

    // 3. QR Code Modal Show/Hide
    const openQrBtn = document.getElementById("btnOpenQrModal");
    const qrModal = document.getElementById("qrModal");
    const closeQrBtn = document.getElementById("btnCloseQrModal");
    const closeQrBtnAction = document.getElementById("btnCloseQrModalAction");

    const openModal = () => {
      if (qrModal) {
        qrModal.style.display = "flex";
        qrModal.setAttribute("aria-hidden", "false");
        try { soundService.playClickTone?.(); } catch (_) {}
      }
    };

    const closeModal = () => {
      if (qrModal) {
        qrModal.style.display = "none";
        qrModal.setAttribute("aria-hidden", "true");
      }
    };

    if (openQrBtn) openQrBtn.addEventListener("click", openModal);
    if (closeQrBtn) closeQrBtn.addEventListener("click", closeModal);
    if (closeQrBtnAction) closeQrBtnAction.addEventListener("click", closeModal);
    if (qrModal) {
      qrModal.addEventListener("click", (e) => {
        if (e.target === qrModal) closeModal();
      });
    }

    // 4. Copy Link inside QR Modal
    const copyQrUrlBtn = document.getElementById("btnCopyQrUrl");
    if (copyQrUrlBtn) {
      copyQrUrlBtn.addEventListener("click", () => {
        const protoUrl = document.getElementById("protoUrlDisplay")?.textContent || window.location.href;
        this.copyToClipboard(protoUrl, i18nService.t("branchLanding.linkCopiedToast", "Public branch link copied!"));
      });
    }
  }

  async copyToClipboard(text, toastMessage) {
    try {
      await navigator.clipboard.writeText(text);
      try { soundService.playSuccess?.(); } catch (_) {}
      this.showToast(toastMessage || "Copied to clipboard!");
    } catch (_) {
      prompt("Copy to clipboard:", text);
    }
  }

  showToast(message) {
    const toast = document.getElementById("branchToast");
    if (!toast) return;
    toast.textContent = `✅ ${message}`;
    toast.style.display = "flex";
    setTimeout(() => {
      toast.style.display = "none";
    }, 2400);
  }
}

export const branchLandingController = new BranchLandingController();

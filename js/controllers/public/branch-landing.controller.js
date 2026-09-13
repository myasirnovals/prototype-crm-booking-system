/**
 * Cliniva — Public Branch Landing Page Controller (branch.html)
 * SOLID: Single Responsibility Principle for Public B2C Clinic Branch Storefront
 * Handles dynamic branch lookup, template theme auras, services & specialists display,
 * simulated prototype URL generation, and frictionless guest booking routing.
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
    // 1. Resolve Target Branch from URL Parameter or Default
    const urlParams = new URLSearchParams(window.location.search);
    this.branchId = urlParams.get("branch") || "sg-orchard";

    this.loadBranchData(this.branchId);

    // 2. Initialize Language Switcher & Reactive Translation Listener
    this.initLanguageSwitcher();

    // 3. Render Dynamic UI Components
    this.renderAll();

    // 4. Bind Interactive Events (Copy Link, QR Modal, etc.)
    this.bindEvents();

    console.info("[BranchLandingController] Initialized for branch:", this.selectedBranch?.id, "template:", this.templateConfig?.id);
  }

  loadBranchData(targetBranchId) {
    // Check stored branches (created by Owner or Super Admin)
    const storedBranches = storageService.get(this.BRANCHES_KEY, []);
    let match = null;

    if (Array.isArray(storedBranches) && storedBranches.length > 0) {
      match = storedBranches.find((b) => b.id === targetBranchId);
    }

    // If not found in custom branches, match against master CLINIC_LOCATIONS
    if (!match) {
      const loc = CLINIC_LOCATIONS.find((l) => l.id === targetBranchId) || CLINIC_LOCATIONS[0];
      const templateKey = bookingService.getActiveTemplateId() || DEFAULT_TEMPLATE_ID;
      const tData = loc.templates[templateKey] || loc.templates[DEFAULT_TEMPLATE_ID] || loc.templates.wellness;

      match = {
        id: loc.id,
        name: tData.name,
        badge: tData.badge,
        icon: tData.icon,
        template: templateKey,
        region: loc.region,
        regionCode: loc.regionCode,
        currency: loc.currency,
        address: loc.address,
        hours: loc.hours,
        phone: loc.phone,
        rooms: tData.rooms || ["Consultation Suite 01", "Therapy Room 02"],
        equipment: tData.equipment || ["Standard Clinical Kit"]
      };
    }

    this.selectedBranch = match;
    this.currency = match.currency || (match.regionCode === "my" ? "MYR" : "SGD");

    // Resolve Template Configuration
    const templateId = match.template || match.templateId || bookingService.getActiveTemplateId() || DEFAULT_TEMPLATE_ID;
    this.templateConfig = getTemplateById(templateId);
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
      : "branch";
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
      headerBadge.textContent = branch.badge || `${template.name.toUpperCase()}`;
      if (template.accentColor) {
        headerBadge.style.color = template.accentColor;
        headerBadge.style.borderColor = `${template.accentColor}40`;
      }
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

    const heroTitle = document.getElementById("branchHeroTitle");
    if (heroTitle) heroTitle.textContent = branch.name;

    const heroTagline = document.getElementById("branchHeroTagline");
    if (heroTagline) heroTagline.textContent = template.tagline || `${template.name} consultation and therapy services.`;

    const catIcon = document.getElementById("heroCategoryIcon");
    if (catIcon) catIcon.textContent = branch.icon || "🏥";

    const catText = document.getElementById("heroCategoryText");
    if (catText) catText.textContent = template.category ? template.category.toUpperCase() : template.name.toUpperCase();

    const regionText = document.getElementById("heroRegionText");
    if (regionText) regionText.textContent = (branch.region || "SINGAPORE").toUpperCase();

    // Backdrop Accent Aura
    const heroBackdrop = document.getElementById("branchHeroBackdrop");
    if (heroBackdrop && template.accentColor) {
      heroBackdrop.style.background = `radial-gradient(circle, ${template.accentColor}22 0%, ${template.accentColor}00 70%)`;
    }

    // Book CTA Link
    const heroBookBtn = document.getElementById("heroBookBtn");
    if (heroBookBtn) {
      heroBookBtn.href = `../../pages/public/booking.html?branch=${encodeURIComponent(branch.id)}`;
      if (template.accentColor) {
        heroBookBtn.style.backgroundColor = template.accentColor;
        heroBookBtn.style.borderColor = template.accentColor;
      }
    }

    // WhatsApp Front Desk Link
    const whatsAppBtn = document.getElementById("heroWhatsAppBtn");
    if (whatsAppBtn) {
      const cleanPhone = (branch.phone || "+6567381234").replace(/[^0-9]/g, "");
      const waMsg = encodeURIComponent(`Hello ${branch.name}, I would like to inquire about booking an appointment.`);
      whatsAppBtn.href = `https://wa.me/${cleanPhone}?text=${waMsg}`;
    }
  }

  renderHighlights() {
    const branch = this.selectedBranch;

    const roomCount = branch.rooms ? branch.rooms.length : 4;
    const roomEl = document.getElementById("statRoomCount");
    if (roomEl) roomEl.textContent = `${roomCount} Private Suites`;

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
    const services = template.services || bookingService.getServices(template.id);
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
          <p class="service-desc">${localizedDesc || "Clinical therapy session with personalized assessment and dedicated practitioner care."}</p>

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
            <a href="${bookUrl}" class="btn btn-primary btn-book-service" style="${template.accentColor ? `background:${template.accentColor}; border-color:${template.accentColor};` : ""}">
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
    const specialists = bookingService.getPractitioners(this.selectedBranch.id, template.id);

    const countEl = document.getElementById("statSpecialistCount");
    if (countEl) {
      countEl.textContent = `${specialists.length} Attending Specialists`;
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
              <span class="specialist-title" style="${template.accentColor ? `color:${template.accentColor};` : ""}">${title}</span>
            </div>
          </div>

          <div class="specialist-tags">
            <span class="specialist-tag">Specialty: ${spec.specialty || "General Practice"}</span>
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
    const equipDesc = document.getElementById("facilityEquipmentDesc");
    if (equipDesc && branch.equipment && branch.equipment.length > 0) {
      equipDesc.textContent = `Equipped with professional clinical hardware: ${branch.equipment.join(", ")} regularly calibrated to international standards.`;
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
      if (this.templateConfig?.accentColor) {
        mobBtn.style.backgroundColor = this.templateConfig.accentColor;
        mobBtn.style.borderColor = this.templateConfig.accentColor;
      }
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

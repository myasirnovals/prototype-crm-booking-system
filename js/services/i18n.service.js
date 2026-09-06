/**
 * Cliniva — Internationalization (i18n) Service
 * SOLID: Single Responsibility for Multilingual Translations (EN / MS / ZH)
 */

import { en } from "../locales/en.js";
import { ms } from "../locales/ms.js";
import { zh } from "../locales/zh.js";
import { storageService } from "./storage.service.js";

class I18nService {
  constructor() {
    this.locales = { en, ms, zh };
    this.currentLang = storageService.get("cliniva_lang", "en");
  }

  init() {
    // If not explicitly set by user, default to English (Standard for SG & MY business)
    if (!storageService.get("cliniva_lang")) {
      const navLang = navigator.language || navigator.userLanguage || "en";
      if (navLang.startsWith("zh")) this.currentLang = "zh";
      else if (navLang.startsWith("ms")) this.currentLang = "ms";
      else this.currentLang = "en";
      storageService.set("cliniva_lang", this.currentLang);
    }

    this.applyTranslations();
    this.setupLanguageSwitchers();
  }

  t(key, fallback = "") {
    const dict = this.locales[this.currentLang] || this.locales.en;
    return dict[key] || this.locales.en[key] || fallback || key;
  }

  translate(key, fallback = "") {
    return this.t(key, fallback);
  }

  setLanguage(lang) {
    if (!this.locales[lang]) return;
    this.currentLang = lang;
    storageService.set("cliniva_lang", lang);
    if (typeof document !== "undefined") {
      this.applyTranslations();
      this.updateSwitcherUI();

      document.dispatchEvent(
        new CustomEvent("cliniva:languageChanged", {
          detail: { lang, t: (k, f) => this.t(k, f) }
        })
      );
    }
  }

  applyTranslations(root = (typeof document !== "undefined" ? document : null)) {
    if (!root) return;
    // Update text / innerHTML
    const elements = root.querySelectorAll("[data-i18n]");
    elements.forEach((el) => {
      const key = el.dataset.i18n;
      const translation = this.t(key);
      if (translation) {
        el.innerHTML = translation;
      }
    });

    // Update placeholders
    const placeholders = root.querySelectorAll("[data-i18n-placeholder]");
    placeholders.forEach((el) => {
      const key = el.dataset.i18nPlaceholder;
      const translation = this.t(key);
      if (translation) {
        el.placeholder = translation;
      }
    });

    // Update title attributes
    const titles = root.querySelectorAll("[data-i18n-title]");
    titles.forEach((el) => {
      const key = el.dataset.i18nTitle;
      const translation = this.t(key);
      if (translation) {
        el.title = translation;
      }
    });

    // Update aria-label attributes
    const arias = root.querySelectorAll("[data-i18n-aria-label]");
    arias.forEach((el) => {
      const key = el.dataset.i18nAriaLabel;
      const translation = this.t(key);
      if (translation) {
        el.setAttribute("aria-label", translation);
      }
    });

    // Update document title if present
    const titleEl = root.querySelector("title[data-i18n]");
    if (titleEl) {
      const titleKey = titleEl.dataset.i18n;
      const translatedTitle = this.t(titleKey);
      if (translatedTitle) document.title = translatedTitle;
    }

    // Set html lang attribute
    document.documentElement.lang = this.currentLang;
  }

  setupLanguageSwitchers() {
    const switchers = document.querySelectorAll(".lang-dropdown, .lang-select");
    switchers.forEach((select) => {
      select.value = this.currentLang;
      select.addEventListener("change", (e) => {
        this.setLanguage(e.target.value);
      });
    });

    this.updateSwitcherUI();
  }

  updateSwitcherUI() {
    const selects = document.querySelectorAll(".lang-dropdown, .lang-select");
    selects.forEach((s) => {
      s.value = this.currentLang;
      const optEn = s.querySelector('option[value="en"]');
      const optZh = s.querySelector('option[value="zh"]');
      const optMs = s.querySelector('option[value="ms"]');
      if (optEn) optEn.textContent = "🇬🇧 English";
      if (optZh) optZh.textContent = "🇸🇬 华语 (Singapura)";
      if (optMs) optMs.textContent = "🇲🇾 Bahasa Melayu (Malaysia)";
    });

    const activeBadges = document.querySelectorAll(".current-lang-text");
    activeBadges.forEach((b) => {
      const label = this.currentLang === "zh" ? "🇸🇬 华语 (Singapura)" : this.currentLang === "ms" ? "🇲🇾 Bahasa Melayu (Malaysia)" : "🇬🇧 English";
      b.textContent = label;
    });
  }
}

export const i18nService = new I18nService();

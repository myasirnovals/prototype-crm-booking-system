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
    // If not set, check browser language
    if (!storageService.get("cliniva_lang")) {
      const navLang = navigator.language || navigator.userLanguage || "en";
      if (navLang.startsWith("zh")) this.currentLang = "zh";
      else if (navLang.startsWith("ms") || navLang.startsWith("id")) this.currentLang = "ms";
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

  setLanguage(lang) {
    if (!this.locales[lang]) return;
    this.currentLang = lang;
    storageService.set("cliniva_lang", lang);
    this.applyTranslations();
    this.updateSwitcherUI();

    document.dispatchEvent(
      new CustomEvent("cliniva:languageChanged", {
        detail: { lang, t: (k, f) => this.t(k, f) }
      })
    );
  }

  applyTranslations(root = document) {
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
    });

    const activeBadges = document.querySelectorAll(".current-lang-text");
    activeBadges.forEach((b) => {
      const label = this.currentLang === "zh" ? "🇨🇳 中文" : this.currentLang === "ms" ? "🇲🇾 Melayu" : "🇬🇧 English";
      b.textContent = label;
    });
  }
}

export const i18nService = new I18nService();

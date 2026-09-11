/**
 * Cliniva — Business Template Registry
 * SOLID: Open/Closed Principle (OCP)
 * Easily register new clinic/business templates without modifying existing ones.
 */

import { TCM_TEMPLATE } from "./tcm.template.js";
import { WELLNESS_TEMPLATE } from "./wellness.template.js";
import { PHYSIO_TEMPLATE } from "./physio.template.js";
import { NUTRITION_TEMPLATE } from "./nutrition.template.js";
import { PERSONAL_TRAINER_TEMPLATE } from "./personal-trainer.template.js";

export const DEFAULT_TEMPLATE_ID = "wellness";

export const CLINIC_TEMPLATES = {
  wellness: WELLNESS_TEMPLATE,
  spa: WELLNESS_TEMPLATE,
  physio: PHYSIO_TEMPLATE,
  physiotherapy: PHYSIO_TEMPLATE,
  nutrition: NUTRITION_TEMPLATE,
  tcm: TCM_TEMPLATE,
  "personal-trainer": PERSONAL_TRAINER_TEMPLATE,
  fitness: PERSONAL_TRAINER_TEMPLATE,
  pt: PERSONAL_TRAINER_TEMPLATE
};

/**
 * Get a specific template by ID with safe fallback to DEFAULT_TEMPLATE_ID
 * @param {string} templateId - "wellness" | "physio" | "nutrition" | "tcm" | "personal-trainer"
 * @returns {object} Template configuration object
 */
export function getTemplateById(templateId = DEFAULT_TEMPLATE_ID) {
  if (!templateId) return CLINIC_TEMPLATES[DEFAULT_TEMPLATE_ID];
  const normalized = String(templateId).trim().toLowerCase();
  // Check local dynamic templates first if available in browser storage
  if (typeof window !== "undefined" && window.localStorage) {
    try {
      const stored = localStorage.getItem("cliniva_platform_templates");
      if (stored) {
        const dynamicList = JSON.parse(stored);
        const match = dynamicList.find(t => t.id === normalized);
        if (match) return match;
      }
    } catch (_) {}
  }
  return CLINIC_TEMPLATES[normalized] || CLINIC_TEMPLATES[DEFAULT_TEMPLATE_ID];
}

/**
 * Get list of all registered templates as an array
 * Merges built-in templates with any dynamic templates created by Super Admin
 * @returns {Array<object>}
 */
export function getAllTemplates() {
  const baseTemplates = [
    WELLNESS_TEMPLATE,
    PHYSIO_TEMPLATE,
    NUTRITION_TEMPLATE,
    TCM_TEMPLATE,
    PERSONAL_TRAINER_TEMPLATE
  ];

  if (typeof window !== "undefined" && window.localStorage) {
    try {
      const stored = localStorage.getItem("cliniva_platform_templates");
      if (stored) {
        const dynamicList = JSON.parse(stored);
        if (Array.isArray(dynamicList) && dynamicList.length > 0) {
          // Merge dynamic templates, allowing custom added templates
          const baseMap = new Map(baseTemplates.map(t => [t.id, t]));
          dynamicList.forEach(item => {
            if (baseMap.has(item.id)) {
              baseMap.set(item.id, { ...baseMap.get(item.id), ...item });
            } else {
              baseMap.set(item.id, item);
            }
          });
          return Array.from(baseMap.values());
        }
      }
    } catch (_) {}
  }

  return baseTemplates;
}

/**
 * Save updated platform templates configured by Super Admin
 * @param {Array<object>} templates
 */
export function savePlatformTemplates(templates) {
  if (typeof window !== "undefined" && window.localStorage) {
    localStorage.setItem("cliniva_platform_templates", JSON.stringify(templates));
  }
}

/**
 * Check if a given template ID is valid and registered
 * @param {string} templateId
 * @returns {boolean}
 */
export function isValidTemplateId(templateId) {
  if (!templateId) return false;
  const normalized = String(templateId).trim().toLowerCase();
  if (CLINIC_TEMPLATES[normalized]) return true;
  const all = getAllTemplates();
  return all.some(t => t.id === normalized);
}

/**
 * Get all services for a given template
 * @param {string} templateId
 * @returns {Array<object>}
 */
export function getTemplateServices(templateId = DEFAULT_TEMPLATE_ID) {
  const template = getTemplateById(templateId);
  return template ? template.services || [] : [];
}

/**
 * Get all practitioners for a given template with optional branch filtering
 * @param {string} templateId
 * @param {string|null} branchId
 * @returns {Array<object>}
 */
export function getTemplatePractitioners(templateId = DEFAULT_TEMPLATE_ID, branchId = null) {
  const template = getTemplateById(templateId);
  if (!template) return [];
  const practitioners = template.practitioners || [];
  if (!branchId) return practitioners;
  return practitioners.filter((p) => p.branchId === branchId);
}

/**
 * Get the intake schema for a given template
 * @param {string} templateId
 * @returns {object|null}
 */
export function getTemplateIntakeSchema(templateId = DEFAULT_TEMPLATE_ID) {
  const template = getTemplateById(templateId);
  return template ? template.intakeSchema : null;
}

export {
  TCM_TEMPLATE,
  WELLNESS_TEMPLATE,
  PHYSIO_TEMPLATE,
  NUTRITION_TEMPLATE,
  PERSONAL_TRAINER_TEMPLATE
};

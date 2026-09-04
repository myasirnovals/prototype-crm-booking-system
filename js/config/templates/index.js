/**
 * Cliniva — Business Template Registry
 * SOLID: Open/Closed Principle (OCP)
 * Easily register new clinic/business templates without modifying existing ones.
 */

import { TCM_TEMPLATE } from "./tcm.template.js";
import { WELLNESS_TEMPLATE } from "./wellness.template.js";

export const DEFAULT_TEMPLATE_ID = "tcm";

export const CLINIC_TEMPLATES = {
  tcm: TCM_TEMPLATE,
  wellness: WELLNESS_TEMPLATE
};

/**
 * Get a specific template by ID with safe fallback to DEFAULT_TEMPLATE_ID
 * @param {string} templateId - "tcm" | "wellness"
 * @returns {object} Template configuration object
 */
export function getTemplateById(templateId = DEFAULT_TEMPLATE_ID) {
  if (!templateId) return CLINIC_TEMPLATES[DEFAULT_TEMPLATE_ID];
  const normalized = String(templateId).trim().toLowerCase();
  return CLINIC_TEMPLATES[normalized] || CLINIC_TEMPLATES[DEFAULT_TEMPLATE_ID];
}

/**
 * Get list of all registered templates as an array
 * @returns {Array<object>}
 */
export function getAllTemplates() {
  return Object.values(CLINIC_TEMPLATES);
}

/**
 * Check if a given template ID is valid and registered
 * @param {string} templateId
 * @returns {boolean}
 */
export function isValidTemplateId(templateId) {
  if (!templateId) return false;
  const normalized = String(templateId).trim().toLowerCase();
  return Boolean(CLINIC_TEMPLATES[normalized]);
}

/**
 * Get all services for a given template
 * @param {string} templateId
 * @returns {Array<object>}
 */
export function getTemplateServices(templateId = DEFAULT_TEMPLATE_ID) {
  const template = getTemplateById(templateId);
  return template ? template.services : [];
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
  if (!branchId) return template.practitioners;
  return template.practitioners.filter((p) => p.branchId === branchId);
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

export { TCM_TEMPLATE, WELLNESS_TEMPLATE };

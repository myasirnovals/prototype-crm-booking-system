/**
 * Cliniva — Clinic Master Data Configuration
 * SOLID: Open for extension with new branches, services, practitioners, and business templates
 * Delegates template specific logic to modular templates under /templates
 */

import {
  CLINIC_TEMPLATES,
  DEFAULT_TEMPLATE_ID,
  getTemplateById,
  getAllTemplates,
  isValidTemplateId,
  getTemplateServices,
  getTemplatePractitioners,
  getTemplateIntakeSchema,
  TCM_TEMPLATE,
  WELLNESS_TEMPLATE,
  PHYSIO_TEMPLATE,
  NUTRITION_TEMPLATE
} from "./templates/index.js";

// Re-export template registry for universal access
export {
  CLINIC_TEMPLATES,
  DEFAULT_TEMPLATE_ID,
  getTemplateById,
  getAllTemplates,
  isValidTemplateId,
  getTemplateServices,
  getTemplatePractitioners,
  getTemplateIntakeSchema,
  TCM_TEMPLATE,
  WELLNESS_TEMPLATE,
  PHYSIO_TEMPLATE,
  NUTRITION_TEMPLATE
};

/**
 * Get services filtered by business template (TCM / Wellness)
 * @param {string} templateId - "tcm" | "wellness"
 * @returns {Array<object>}
 */
export function getServicesByTemplate(templateId = DEFAULT_TEMPLATE_ID) {
  return getTemplateServices(templateId);
}

/**
 * Get practitioners filtered by template and optional branch
 * @param {string} templateId - "tcm" | "wellness"
 * @param {string|null} branchId
 * @returns {Array<object>}
 */
export function getPractitionersByTemplate(templateId = DEFAULT_TEMPLATE_ID, branchId = null) {
  return getTemplatePractitioners(templateId, branchId);
}

/**
 * Get active template configuration object
 * @param {string} templateId
 * @returns {object}
 */
export function getActiveTemplateConfig(templateId = DEFAULT_TEMPLATE_ID) {
  return getTemplateById(templateId);
}

export const CLINIC_BRANCHES = [
  {
    id: "sg-orchard",
    name: "Orchard Wellness & Luxury Spa",
    region: "sg",
    country: "Singapore",
    currency: "SGD",
    distance: "1.8 km away",
    templateId: "wellness",
    profileType: "SPA_WELLNESS",
    badge: "🌸 LUXURY WELLNESS SPA",
    icon: "🌸",
    lat: 1.3039,
    lng: 103.8358,
    hours: "Senin - Sabtu (08:30 - 20:00 SGT)",
    address: "290 Orchard Road, Paragon Medical #14-02, Singapore 238859",
    rooms: [
      "Private Couple VIP Suite (Jacuzzi)",
      "Aroma Relaxation Cabin 01",
      "Aroma Relaxation Cabin 02",
      "Foot Reflexology & Herbal Lounge"
    ],
    equipment: [
      "Hot Stone Basalt Warmer Unit",
      "Essential Oil Ultrasonic Diffuser",
      "Hydrotherapy Jacuzzi Tub",
      "Foot Reflexology Herbal Steam Basin"
    ]
  },
  {
    id: "my-kl",
    name: "Kuala Lumpur Physiotherapy & Sports Rehab",
    region: "my",
    country: "Malaysia",
    currency: "MYR",
    distance: "City Centre",
    templateId: "physio",
    profileType: "PHYSIOTHERAPY",
    badge: "🏃 PHYSIO & SPORTS REHAB",
    icon: "🏃",
    lat: 3.1593,
    lng: 101.7196,
    hours: "Senin - Sabtu (09:00 - 18:00 MYT)",
    address: "Pavilion Embassy Tower, Jalan Ampang, 50450 Kuala Lumpur",
    rooms: [
      "Rehab Gym & Motion Analysis Bay",
      "Spinal Decompression Suite 101",
      "Manual Therapy Cabin 01",
      "Observation & Ultrasound Bed 01"
    ],
    equipment: [
      "Shockwave Therapy Unit",
      "Spinal Decompression Table",
      "Laser Therapy Machine",
      "Diagnostic Ultrasound Scanner"
    ]
  },
  {
    id: "my-penang",
    name: "Penang Clinical Nutrition & Dietetics Care",
    region: "my",
    country: "Malaysia",
    currency: "MYR",
    distance: "Gurney Drive",
    templateId: "nutrition",
    profileType: "NUTRITION",
    badge: "🥗 CLINICAL NUTRITION CARE",
    icon: "🥗",
    lat: 5.4332,
    lng: 100.3106,
    hours: "Selasa - Minggu (10:00 - 19:00 MYT)",
    address: "Gurney Walk, Persiaran Gurney, 10250 George Town, Penang",
    rooms: [
      "Nutritional Consultation Suite 101",
      "Body Composition Analysis Bay",
      "Metabolic Diagnostics Corner",
      "Dietary Education Seminar Room"
    ],
    equipment: [
      "Body Composition Bio-Impedance Scanner",
      "Point-of-Care Blood Glucose & Lipid Analyzer",
      "Metabolic Indirect Calorimetry Unit",
      "Digital Food Portions Display Scale"
    ]
  }
];

/**
 * Standard CLINIC_SERVICES for legacy & general backwards compatibility
 */
export const CLINIC_SERVICES = [
  {
    id: "physio",
    name: "Physiotherapy",
    durationMinutes: 60,
    priceSGD: 120,
    priceMYR: 280,
    depositSGD: 30,
    depositMYR: 70,
    description: "Postural assessment, manual therapy & sports rehabilitation.",
    requiresEquipment: "Shockwave Therapy Unit"
  },
  {
    id: "tcm",
    name: "TCM Consult",
    durationMinutes: 45,
    priceSGD: 90,
    priceMYR: 210,
    depositSGD: 25,
    depositMYR: 50,
    description: "Pulse diagnosis, herbal prescription & acupuncture therapy.",
    requiresEquipment: "Electro-Acupuncture Stimulator"
  },
  {
    id: "wellness",
    name: "Wellness Therapy",
    durationMinutes: 75,
    priceSGD: 150,
    priceMYR: 350,
    depositSGD: 40,
    depositMYR: 90,
    description: "Deep tissue recovery, herbal aroma relaxation & myofascial release.",
    requiresEquipment: null
  },
  {
    id: "referral",
    name: "Medical Referral",
    durationMinutes: 30,
    priceSGD: 0,
    priceMYR: 0,
    depositSGD: 0,
    depositMYR: 0,
    description: "Insurance / Faskes BPJS bridging intake with SIMRS ephemeral document proxy.",
    requiresEquipment: null
  }
];

export const PRACTITIONERS = [
  {
    id: "dr-lim",
    name: "Dr. Lim Wei Han",
    title: "Senior Physiotherapist",
    branchId: "sg-orchard",
    specialty: "Sports Rehabilitation & Spine"
  },
  {
    id: "dr-wong",
    name: "Dr. Wong Mei Ling",
    title: "Registered TCM Physician",
    branchId: "sg-orchard",
    specialty: "Acupuncture & Internal Medicine"
  },
  {
    id: "therapist-sarah",
    name: "Therapist Sarah Tan",
    title: "Lead Clinical & Spa Therapist",
    branchId: "sg-orchard",
    specialty: "Balinese Aromatherapy & Myofascial Release"
  },
  {
    id: "sinse-huang",
    name: "Sinse Huang Wei, B.Med (TCM)",
    title: "Chief Acupuncturist",
    branchId: "my-kl",
    specialty: "Neurological Acupuncture"
  },
  {
    id: "therapist-ayu",
    name: "Therapist Ayu Dewi",
    title: "Senior Balinese Spa Specialist",
    branchId: "my-kl",
    specialty: "Traditional Lulur, Herbal Bath & Stress Relief"
  },
  {
    id: "sinse-tan",
    name: "Sinse Tan Kok Leong",
    title: "Senior Tuina Specialist",
    branchId: "my-penang",
    specialty: "Musculoskeletal Realignment & Cupping"
  },
  {
    id: "therapist-michael",
    name: "Therapist Michael Chen",
    title: "Reflexology & Deep Tissue Specialist",
    branchId: "my-penang",
    specialty: "Foot Reflexology Acupressure & Post-Workout Recovery"
  }
];

export const DEFAULT_SLOTS = [
  "09:00",
  "10:30",
  "11:45",
  "14:00",
  "15:30",
  "16:15",
  "17:00",
  "18:30"
];

export const INITIAL_ACTIVITY_LOGS = [
  {
    icon: "✅",
    title: "Booking confirmed",
    description: "Amanda Tan confirmed her 10:30 physiotherapy session.",
    timestamp: "2 mins ago"
  },
  {
    icon: "💬",
    title: "Reminder sent",
    description: "WhatsApp H-3 reminder sent to 18 patients.",
    timestamp: "15 mins ago"
  },
  {
    icon: "💳",
    title: "Deposit received",
    description: "MYR 80 deposit paid via DuitNow QR.",
    timestamp: "34 mins ago"
  },
  {
    icon: "🔁",
    title: "Referral forwarded",
    description: "Document sent securely to EMR webhook with 72h TTL.",
    timestamp: "1 hour ago"
  }
];

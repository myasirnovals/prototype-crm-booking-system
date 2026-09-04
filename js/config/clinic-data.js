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
  WELLNESS_TEMPLATE
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
  WELLNESS_TEMPLATE
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
    name: "Orchard Wellness Clinic",
    region: "sg",
    country: "Singapore",
    currency: "SGD",
    distance: "1.8 km away",
    address: "290 Orchard Road, Paragon Medical #14-02, Singapore 238859",
    rooms: [
      "Room A1 (Consultation)",
      "Room A2 (Physio)",
      "Room B1 (TCM Suite)",
      "Private VIP Spa Suite (with Jacuzzi)",
      "Bed 01 (Observation)"
    ],
    equipment: [
      "Shockwave Therapy Unit",
      "Electro-Acupuncture Stimulator",
      "Ultrasound Scanner",
      "Hot Stone Basalt Warmer Unit",
      "Essential Oil Ultrasonic Diffuser"
    ]
  },
  {
    id: "my-kl",
    name: "Kuala Lumpur Integrated Care",
    region: "my",
    country: "Malaysia",
    currency: "MYR",
    distance: "City Centre",
    address: "Pavilion Embassy Tower, Jalan Ampang, 50450 Kuala Lumpur",
    rooms: [
      "Suite 101",
      "Suite 102",
      "Rehab Gym Bed 1",
      "Aroma Relaxation Cabin 01",
      "Rehab Gym Bed 2"
    ],
    equipment: [
      "Spinal Decompression Table",
      "Laser Therapy Machine",
      "Vacuum Cupping Apparatus",
      "Hydrotherapy Jacuzzi Tub"
    ]
  },
  {
    id: "my-penang",
    name: "Penang TCM & Physio Center",
    region: "my",
    country: "Malaysia",
    currency: "MYR",
    distance: "Gurney Drive",
    address: "Gurney Walk, Persiaran Gurney, 10250 George Town, Penang",
    rooms: [
      "Herbal Room 1",
      "Acupuncture Bed 01",
      "Acupuncture Bed 02",
      "Foot Reflexology & Herbal Lounge"
    ],
    equipment: [
      "Infrared Moxibustion Unit",
      "Vacuum Cupping Apparatus",
      "Foot Reflexology Herbal Steam Basin"
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

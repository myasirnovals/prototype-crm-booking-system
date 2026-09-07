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

export const CLINIC_LOCATIONS = [
  {
    id: "sg-orchard",
    regionCode: "sg",
    region: "Singapore",
    country: "Singapore",
    currency: "SGD",
    lat: 1.3039,
    lng: 103.8358,
    address: "290 Orchard Road, Paragon Medical #14-02, Singapore 238859",
    hours: "Mon - Sat (08:30 - 20:00 SGT)",
    phone: "+65 6738 1234",
    distanceKm: 1.8,
    templates: {
      wellness: {
        name: "Orchard Wellness & Luxury Spa",
        badge: "🌸 LUXURY WELLNESS SPA",
        icon: "🌸",
        profileType: "SPA_WELLNESS",
        rooms: [
          "Private Couple VIP Suite (Jacuzzi)",
          "Aroma Relaxation Cabin 01",
          "Aroma Relaxation Cabin 02",
          "Foot Reflexology Lounge"
        ],
        equipment: [
          "Hot Stone Basalt Warmer",
          "Ultrasonic Aroma Diffuser",
          "Hydrotherapy Jacuzzi Tub",
          "Steam Basin"
        ]
      },
      physio: {
        name: "Orchard Spine & Sports Physiotherapy",
        badge: "🏃 SPORTS REHAB & PHYSIO",
        icon: "🏃",
        profileType: "PHYSIOTHERAPY",
        rooms: [
          "Biomechanics & Motion Analysis Bay",
          "Spinal Decompression Suite 01",
          "Manual Therapy Suite",
          "Cryo-Recovery Room"
        ],
        equipment: [
          "Shockwave Therapy Unit",
          "Spinal Decompression Table",
          "High-Power Laser Machine",
          "Diagnostic Ultrasound"
        ]
      },
      nutrition: {
        name: "Orchard Clinical Nutrition & Dietetics Hub",
        badge: "🥗 CLINICAL NUTRITION CARE",
        icon: "🥗",
        profileType: "NUTRITION",
        rooms: [
          "Metabolic Consultation Suite 01",
          "Body Composition Analysis Bay",
          "Nutritional Counseling Lab",
          "Dietary Workshop Room"
        ],
        equipment: [
          "Medical Bio-Impedance Analyzer (BIA)",
          "Indirect Calorimeter",
          "Point-of-Care Lipid/Glucose Analyzer",
          "Nutrient Portion Scale"
        ]
      },
      tcm: {
        name: "Orchard TCM & Premium Acupuncture Centre",
        badge: "🌿 TCM & MERIDIAN ACUPUNCTURE",
        icon: "🌿",
        profileType: "TCM_ACUPUNCTURE",
        rooms: [
          "TCM Consultation Suite 01",
          "Meridian Acupuncture Suite A",
          "Herbal Therapy & Cupping Suite",
          "Moxibustion Chamber"
        ],
        equipment: [
          "Electro-Acupuncture Stimulator",
          "Vacuum Cupping Apparatus",
          "Infrared Moxibustion Unit",
          "Pulse Diagnostic Scanner"
        ]
      }
    }
  },
  {
    id: "sg-novena",
    regionCode: "sg",
    region: "Singapore",
    country: "Singapore",
    currency: "SGD",
    lat: 1.3204,
    lng: 103.8436,
    address: "8 Sinaran Drive, Novena Specialist Center #08-11, Singapore 307683",
    hours: "Mon - Sat (09:00 - 19:30 SGT)",
    phone: "+65 6255 5678",
    distanceKm: 3.2,
    templates: {
      wellness: {
        name: "Novena Holistic Wellness Sanctuary",
        badge: "🌸 HOLISTIC WELLNESS SANCTUARY",
        icon: "🌸",
        profileType: "SPA_WELLNESS",
        rooms: [
          "Holistic Aromatherapy Suite",
          "Swedish Massage Cabin",
          "Sound Healing & Rest Lounge",
          "Botanical Bath Suite"
        ],
        equipment: [
          "Ultrasonic Aroma Diffuser",
          "Hot Stone Basalt Warmer",
          "Singing Bowl Soundscape Unit",
          "Herbal Steam Canopy"
        ]
      },
      physio: {
        name: "Novena Musculoskeletal & Ortho Rehab",
        badge: "🏃 ORTHO & SPINE REHAB",
        icon: "🏃",
        profileType: "PHYSIOTHERAPY",
        rooms: [
          "Orthopedic Rehab Gym",
          "Post-Op Joint Recovery Suite",
          "Manual Therapy Cabin 02",
          "Ultrasound Diagnostic Bay"
        ],
        equipment: [
          "Shockwave Therapy Unit",
          "Continuous Passive Motion (CPM) Machine",
          "Spinal Traction Unit",
          "Therapeutic Ultrasound"
        ]
      },
      nutrition: {
        name: "Novena Metabolic & Weight Management Lab",
        badge: "🥗 METABOLIC HEALTH LAB",
        icon: "🥗",
        profileType: "NUTRITION",
        rooms: [
          "Clinical Dietetics Cabin 01",
          "Metabolic Profiling Suite",
          "Body Scan Diagnostic Corner",
          "Bariatric Nutrition Lounge"
        ],
        equipment: [
          "InBody 770 Clinical Analyzer",
          "Resting Metabolic Rate Cart",
          "Continuous Glucose Monitoring (CGM) Reader",
          "Food Model Kit"
        ]
      },
      tcm: {
        name: "Novena Herbal Medicine & Meridian Care",
        badge: "🌿 HERBAL & MERIDIAN CARE",
        icon: "🌿",
        profileType: "TCM_ACUPUNCTURE",
        rooms: [
          "Sinse Pulse Diagnostic Room",
          "Acupuncture Therapy Cabin",
          "Cupping & Scraping Room",
          "Herbal Decoction Dispensary"
        ],
        equipment: [
          "Electro-Acupuncture Stimulator",
          "Smokeless Moxa Chamber",
          "Cupping Set",
          "Digital Herbal Scale"
        ]
      }
    }
  },
  {
    id: "sg-marinabay",
    regionCode: "sg",
    region: "Singapore",
    country: "Singapore",
    currency: "SGD",
    lat: 1.2805,
    lng: 103.8540,
    address: "8 Marina Boulevard, MBFC Tower 1 #04-02, Singapore 018981",
    hours: "Mon - Fri (08:00 - 20:00 SGT), Sat (09:00 - 16:00 SGT)",
    phone: "+65 6532 8899",
    distanceKm: 2.5,
    templates: {
      wellness: {
        name: "Marina Bay Sensory Day Spa & Hydro",
        badge: "🌸 EXECUTIVE SENSORY SPA",
        icon: "🌸",
        profileType: "SPA_WELLNESS",
        rooms: [
          "Executive Hydro-Spa Suite",
          "Express De-Stress Pod 01",
          "Deep Tissue Cabin",
          "Aroma Oxygen Lounge"
        ],
        equipment: [
          "Hydrotherapy Jet Tub",
          "Aroma Diffuser",
          "Hyperbaric Oxygen Pod",
          "Basalt Stone Heater"
        ]
      },
      physio: {
        name: "Marina Bay Performance & Movement Lab",
        badge: "🏃 PERFORMANCE MOVEMENT LAB",
        icon: "🏃",
        profileType: "PHYSIOTHERAPY",
        rooms: [
          "Ergonomic Spine Analysis Bay",
          "High-Performance Rehab Gym",
          "Dry Needling Room",
          "Hydrotherapy Recovery Tank"
        ],
        equipment: [
          "Spinal Decompression Table",
          "3D Motion Capture Sensor",
          "Class IV Deep Tissue Laser",
          "Shockwave Unit"
        ]
      },
      nutrition: {
        name: "Marina Bay Executive Dietary Wellness",
        badge: "🥗 EXECUTIVE DIETARY WELLNESS",
        icon: "🥗",
        profileType: "NUTRITION",
        rooms: [
          "Executive Nutrition Suite",
          "Stress & Cortisol Diet Lab",
          "Body Composition Scanner",
          "Longevity Consultation Room"
        ],
        equipment: [
          "Clinical BIA Body Composition Scanner",
          "Biochemical Biomarker Point-of-Care",
          "Nutritional Software Terminal"
        ]
      },
      tcm: {
        name: "Marina Bay Holistic Acupressure Sanctuary",
        badge: "🌿 ACUPRESSURE & QI BALANCE",
        icon: "🌿",
        profileType: "TCM_ACUPUNCTURE",
        rooms: [
          "Qi Balance Consultation Suite",
          "Meridian Stress Relief Room",
          "Auricular Acupuncture Bay",
          "TCM Wellness Tea Corner"
        ],
        equipment: [
          "Electro-Acupuncture Stimulator",
          "Ear Acupoint Detector",
          "Vacuum Cupping Apparatus",
          "Herbal Compress Steamer"
        ]
      }
    }
  },
  {
    id: "sg-jurong",
    regionCode: "sg",
    region: "Singapore",
    country: "Singapore",
    currency: "SGD",
    lat: 1.3331,
    lng: 103.7436,
    address: "2 Venture Drive, Vision Exchange Medical Suites #03-18, Singapore 608526",
    hours: "Mon - Sat (09:00 - 19:00 SGT)",
    phone: "+65 6899 3322",
    distanceKm: 12.4,
    templates: {
      wellness: {
        name: "Jurong Lake Wellness Retreat",
        badge: "🌸 BOTANICAL RELAXATION RETREAT",
        icon: "🌸",
        profileType: "SPA_WELLNESS",
        rooms: [
          "Botanical Garden Spa Room",
          "Couples Relaxation Suite",
          "Foot Reflexology Lounge",
          "Herbal Steam Suite"
        ],
        equipment: [
          "Hot Stone Basalt Unit",
          "Ultrasonic Essential Oil Diffuser",
          "Herbal Foot Spa Bath",
          "Heated Treatment Bed"
        ]
      },
      physio: {
        name: "Jurong West Sports Physiotherapy Centre",
        badge: "🏃 SPORTS INJURY & MOBILITY",
        icon: "🏃",
        profileType: "PHYSIOTHERAPY",
        rooms: [
          "Functional Movement Studio",
          "Spine Mobilization Room",
          "Post-Surgical Rehab Suite",
          "Shockwave Therapy Bay"
        ],
        equipment: [
          "Radial Shockwave Unit",
          "Spinal Traction Bed",
          "Electrotherapy TENS/EMS",
          "Goniometric Mobility Kit"
        ]
      },
      nutrition: {
        name: "Jurong Community Nutrition & Gut Health",
        badge: "🥗 GUT & METABOLIC HEALTH",
        icon: "🥗",
        profileType: "NUTRITION",
        rooms: [
          "Gut Microbiome Consult Suite",
          "Body Composition Bay",
          "Family Dietary Planning Room",
          "Culinary Demo Station"
        ],
        equipment: [
          "Bio-Impedance BIA Scanner",
          "Microbiome Test Sampling Kit",
          "Calorie Expenditure Monitor"
        ]
      },
      tcm: {
        name: "Jurong Traditional Chinese Medicine Clinic",
        badge: "🌿 TRADITIONAL CHINESE MEDICINE",
        icon: "🌿",
        profileType: "TCM_ACUPUNCTURE",
        rooms: [
          "TCM Diagnosis Room",
          "Acupuncture Therapy Bay",
          "Tuina Massage Cabin",
          "Herbal Medicine Storage & Prep"
        ],
        equipment: [
          "Acupuncture Needle Electro-Stimulator",
          "Bamboo Cupping Set",
          "Moxibustion Heat Lamp",
          "TCM Pulse Diagnostic Instrument"
        ]
      }
    }
  },
  {
    id: "sg-tampines",
    regionCode: "sg",
    region: "Singapore",
    country: "Singapore",
    currency: "SGD",
    lat: 1.3532,
    lng: 103.9452,
    address: "1 Tampines Central 5, CPF Tampines Building #05-01, Singapore 529508",
    hours: "Mon - Sat (08:30 - 19:30 SGT)",
    phone: "+65 6788 4411",
    distanceKm: 14.1,
    templates: {
      wellness: {
        name: "Tampines Oasis Spa & Recovery",
        badge: "🌸 OASIS BODY & FOOT SPA",
        icon: "🌸",
        profileType: "SPA_WELLNESS",
        rooms: [
          "Oasis Bodywork Suite",
          "Reflexology Acupressure Hall",
          "Aroma Therapy Cabin",
          "Lulur Scrub Room"
        ],
        equipment: [
          "Basalt Stone Warmer",
          "Essential Oil Steam Diffuser",
          "Foot Hydro-Jet Basin",
          "Body Scrub Table"
        ]
      },
      physio: {
        name: "Tampines Movement Rehab & Joint Clinic",
        badge: "🏃 JOINT REHAB & MOVEMENT",
        icon: "🏃",
        profileType: "PHYSIOTHERAPY",
        rooms: [
          "Joint Mobilization Bay",
          "Spinal Therapy Room",
          "Geriatric & Sports Rehab Studio",
          "Cryo-Compression Bay"
        ],
        equipment: [
          "Focused Shockwave Unit",
          "Cervical/Lumbar Traction Unit",
          "Pneumatic Compression Boots",
          "Ultrasound Therapy"
        ]
      },
      nutrition: {
        name: "Tampines Family Nutrition & Lifestyle Clinic",
        badge: "🥗 FAMILY NUTRITION CARE",
        icon: "🥗",
        profileType: "NUTRITION",
        rooms: [
          "Pediatric & Family Consult Room",
          "Body Composition Scanner",
          "Diet Counseling Booth",
          "Lifestyle Health Hub"
        ],
        equipment: [
          "Multi-Frequency BIA Analyzer",
          "Digital Height-Weight Stadiometer",
          "Nutritional Analysis Terminal"
        ]
      },
      tcm: {
        name: "Tampines TCM Wellness & Cupping Lounge",
        badge: "🌿 TCM CUPPING & TUINA",
        icon: "🌿",
        profileType: "TCM_ACUPUNCTURE",
        rooms: [
          "Sinse Consultation Room",
          "Meridian Cupping Suite",
          "Acupuncture Bed Area",
          "Herbal Tea Dispensary"
        ],
        equipment: [
          "Electronic Meridian Stimulator",
          "Fire/Vacuum Cupping Set",
          "Infrared Thermal Therapy Lamp",
          "Pulse Wave Monitor"
        ]
      }
    }
  },
  {
    id: "my-kl",
    regionCode: "my",
    region: "Malaysia",
    country: "Malaysia",
    currency: "MYR",
    lat: 3.1593,
    lng: 101.7196,
    address: "Pavilion Embassy Tower, Jalan Ampang, 50450 Kuala Lumpur",
    hours: "Mon - Sat (09:00 - 18:00 MYT)",
    phone: "+60 3 2181 2233",
    distanceKm: 315,
    templates: {
      wellness: {
        name: "KLCC Grand Wellness Spa & Suites",
        badge: "🌸 GRAND WELLNESS SPA",
        icon: "🌸",
        profileType: "SPA_WELLNESS",
        rooms: [
          "Royal Malay Urut Suite",
          "Aromatherapy Jacuzzi Cabin",
          "VIP Couples Haven",
          "Reflexology Garden"
        ],
        equipment: [
          "Herbal Compress Steamer",
          "Hydrotherapy Jacuzzi",
          "Basalt Stone Warmer",
          "Essential Oil Diffuser"
        ]
      },
      physio: {
        name: "Kuala Lumpur Physiotherapy & Sports Rehab",
        badge: "🏃 PHYSIO & SPORTS REHAB",
        icon: "🏃",
        profileType: "PHYSIOTHERAPY",
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
      nutrition: {
        name: "KL Pavilion Clinical Nutrition & BIA Center",
        badge: "🥗 CLINICAL NUTRITION & BIA",
        icon: "🥗",
        profileType: "NUTRITION",
        rooms: [
          "Clinical Dietetics Suite 101",
          "Body Composition Analysis Bay",
          "Metabolic Diagnostics Corner",
          "Dietary Seminar Room"
        ],
        equipment: [
          "Body Composition Bio-Impedance Scanner",
          "Point-of-Care Blood Glucose & Lipid Analyzer",
          "Metabolic Indirect Calorimetry Unit",
          "Digital Food Portions Display Scale"
        ]
      },
      tcm: {
        name: "KL Chinese Medical Hall & Acupuncture",
        badge: "🌿 TCM ACUPUNCTURE & HERBS",
        icon: "🌿",
        profileType: "TCM_ACUPUNCTURE",
        rooms: [
          "Chief Sinse Consultation Suite",
          "Neurological Acupuncture Bay",
          "Tuina Realignment Room",
          "Herbal Medicine Cabinet"
        ],
        equipment: [
          "Electro-Acupuncture Stimulator",
          "Vacuum Cupping Apparatus",
          "Infrared Moxibustion Unit",
          "Pulse Diagnostic Scanner"
        ]
      }
    }
  },
  {
    id: "my-pj",
    regionCode: "my",
    region: "Malaysia",
    country: "Malaysia",
    currency: "MYR",
    lat: 3.1042,
    lng: 101.6420,
    address: "The Pinnacle Sunway, Level 15, Bandar Sunway, 47500 Petaling Jaya, Selangor",
    hours: "Mon - Sat (09:30 - 18:30 MYT)",
    phone: "+60 3 5638 8822",
    distanceKm: 320,
    templates: {
      wellness: {
        name: "Pinnacle Aromatherapy & Day Spa",
        badge: "🌸 AROMA THERAPY SPA",
        icon: "🌸",
        profileType: "SPA_WELLNESS",
        rooms: [
          "Pinnacle Aromatherapy Cabin",
          "Deep Muscle Treatment Suite",
          "Foot Reflexology Room",
          "Floral Bath Sanctuary"
        ],
        equipment: [
          "Ultrasonic Aroma Diffuser",
          "Hot Stone Warmer",
          "Herbal Steam Basin",
          "Hydro Massage Tub"
        ]
      },
      physio: {
        name: "PJ Pinnacle Sports Injury & Rehab Centre",
        badge: "🏃 SPORTS INJURY & REHAB",
        icon: "🏃",
        profileType: "PHYSIOTHERAPY",
        rooms: [
          "Athletic Performance Lab",
          "Spinal Care Suite",
          "Post-Op Physical Therapy Bay",
          "Joint Mobilization Cabin"
        ],
        equipment: [
          "Radial Shockwave Unit",
          "Spinal Decompression Table",
          "Interferential Current (IFC) Machine",
          "Cryo-Cuff Unit"
        ]
      },
      nutrition: {
        name: "PJ Sunway Metabolic Health & Dietetics Suite",
        badge: "🥗 METABOLIC HEALTH SUITE",
        icon: "🥗",
        profileType: "NUTRITION",
        rooms: [
          "Metabolic Consultation Bay",
          "Clinical BIA Suite",
          "Sports Nutrition Assessment Room",
          "Meal Planning Corner"
        ],
        equipment: [
          "Medical BIA Body Scanner",
          "Metabolic Rate Measurement Device",
          "Food Scale & Software Kit"
        ]
      },
      tcm: {
        name: "Petaling Jaya TCM Meridian & Tuina Centre",
        badge: "🌿 MERIDIAN & TUINA CARE",
        icon: "🌿",
        profileType: "TCM_ACUPUNCTURE",
        rooms: [
          "TCM Examination Suite",
          "Meridian Tuina Therapy Room",
          "Acupoint Therapy Cabin",
          "Herbal Brew Corner"
        ],
        equipment: [
          "Electro-Acupuncture Stimulator",
          "Glass Cupping Set",
          "Moxibustion Heat Lamp",
          "Herbal Extract Machine"
        ]
      }
    }
  },
  {
    id: "my-penang",
    regionCode: "my",
    region: "Malaysia",
    country: "Malaysia",
    currency: "MYR",
    lat: 5.4332,
    lng: 100.3106,
    address: "Gurney Walk, Persiaran Gurney, 10250 George Town, Penang",
    hours: "Tue - Sun (10:00 - 19:00 MYT)",
    phone: "+60 4 228 9922",
    distanceKm: 598,
    templates: {
      wellness: {
        name: "Penang Gurney Coastal Wellness Spa",
        badge: "🌸 COASTAL RELAXATION SPA",
        icon: "🌸",
        profileType: "SPA_WELLNESS",
        rooms: [
          "Coastal Aromatherapy Suite",
          "Sea Breeze Relaxation Deck",
          "Herbal Body Scrub Cabin",
          "Deep Tissue Lounge"
        ],
        equipment: [
          "Essential Oil Diffuser",
          "Hot Basalt Stone Warmer",
          "Body Scrub Table",
          "Herbal Foot Basin"
        ]
      },
      physio: {
        name: "Penang Gurney Physical Therapy & Ortho",
        badge: "🏃 PHYSICAL THERAPY & ORTHO",
        icon: "🏃",
        profileType: "PHYSIOTHERAPY",
        rooms: [
          "Ortho Rehab Studio",
          "Manual Therapy Cabin 01",
          "Spinal Extension Suite",
          "Sports Recovery Bay"
        ],
        equipment: [
          "Shockwave Therapy Machine",
          "Spinal Decompression Table",
          "Therapeutic Ultrasound",
          "Laser Therapy Machine"
        ]
      },
      nutrition: {
        name: "Penang Clinical Nutrition & Dietetics Care",
        badge: "🥗 CLINICAL NUTRITION CARE",
        icon: "🥗",
        profileType: "NUTRITION",
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
      },
      tcm: {
        name: "Penang Heritage TCM & Herbal Pharmacy",
        badge: "🌿 HERITAGE TCM CLINIC",
        icon: "🌿",
        profileType: "TCM_ACUPUNCTURE",
        rooms: [
          "Heritage Sinse Consultation Room",
          "Meridian Tuina Suite",
          "Acupoint Therapy Cabin",
          "Authentic Herbal Dispensary"
        ],
        equipment: [
          "Electro-Acupuncture Stimulator",
          "Traditional Fire Cupping Set",
          "Infrared Thermal Lamp",
          "Pulse Wave Monitor"
        ]
      }
    }
  },
  {
    id: "my-jb",
    regionCode: "my",
    region: "Malaysia",
    country: "Malaysia",
    currency: "MYR",
    lat: 1.5005,
    lng: 103.7745,
    address: "The Mall Mid Valley Southkey #02-45, 80150 Johor Bahru, Johor",
    hours: "Mon - Sun (10:00 - 20:00 MYT)",
    phone: "+60 7 338 7711",
    distanceKm: 28,
    templates: {
      wellness: {
        name: "Johor Bahru Waterfront Spa Haven",
        badge: "🌸 WATERFRONT SPA HAVEN",
        icon: "🌸",
        profileType: "SPA_WELLNESS",
        rooms: [
          "Waterfront VIP Suite",
          "Balinese Aromatherapy Room",
          "Foot Reflexology Lounge",
          "Herbal Steam Canopy"
        ],
        equipment: [
          "Ultrasonic Aroma Diffuser",
          "Hot Stone Warmer",
          "Hydrotherapy Tub",
          "Herbal Steam Basin"
        ]
      },
      physio: {
        name: "JB Mid Valley Sports Rehab & Spinal Center",
        badge: "🏃 SPORTS REHAB & SPINAL",
        icon: "🏃",
        profileType: "PHYSIOTHERAPY",
        rooms: [
          "Spinal Decompression Suite",
          "Active Rehab Gymnasium",
          "Manual Therapy Suite 01",
          "Ultrasound Diagnostic Bay"
        ],
        equipment: [
          "Shockwave Therapy Unit",
          "Spinal Decompression Table",
          "Laser Therapy Machine",
          "Ultrasound Scanner"
        ]
      },
      nutrition: {
        name: "JB Mid Valley Clinical Nutrition Centre",
        badge: "🥗 CLINICAL NUTRITION CENTRE",
        icon: "🥗",
        profileType: "NUTRITION",
        rooms: [
          "Clinical Nutrition Suite",
          "Body Scan Diagnostic Bay",
          "Metabolic Assessment Room",
          "Diet Consultation Booth"
        ],
        equipment: [
          "Clinical Bio-Impedance BIA Scanner",
          "Point-of-Care Lipid Analyzer",
          "Dietary Software Terminal"
        ]
      },
      tcm: {
        name: "JB Southkey TCM & Traditional Healing Hub",
        badge: "🌿 TRADITIONAL HEALING HUB",
        icon: "🌿",
        profileType: "TCM_ACUPUNCTURE",
        rooms: [
          "Chief Sinse Consultation Suite",
          "Acupuncture Therapy Cabin",
          "Cupping & Moxa Bay",
          "Herbal Medicine Dispensary"
        ],
        equipment: [
          "Electro-Acupuncture Stimulator",
          "Vacuum Cupping Apparatus",
          "Infrared Moxa Lamp",
          "Pulse Diagnostic Device"
        ]
      }
    }
  }
];

/**
 * Get branches dynamically adapted to a business template
 * @param {string} templateId - "wellness" | "physio" | "nutrition" | "tcm"
 * @returns {Array<object>}
 */
export function getBranchesForTemplate(templateId = DEFAULT_TEMPLATE_ID) {
  let normalized = String(templateId || DEFAULT_TEMPLATE_ID).trim().toLowerCase();
  if (normalized === "physiotherapy") normalized = "physio";
  else if (normalized === "spa") normalized = "wellness";

  return CLINIC_LOCATIONS.map((loc) => {
    const override =
      loc.templates[normalized] || loc.templates[DEFAULT_TEMPLATE_ID] || loc.templates.wellness;
    return {
      id: loc.id,
      regionCode: loc.regionCode,
      region: loc.region,
      country: loc.country,
      currency: loc.currency,
      lat: loc.lat,
      lng: loc.lng,
      address: loc.address,
      hours: loc.hours,
      phone: loc.phone,
      distanceKm: loc.distanceKm,
      templateId: normalized,
      profileType: override.profileType,
      name: override.name,
      badge: override.badge,
      icon: override.icon,
      rooms: override.rooms,
      equipment: override.equipment
    };
  });
}

export const CLINIC_BRANCHES = getBranchesForTemplate(DEFAULT_TEMPLATE_ID);

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

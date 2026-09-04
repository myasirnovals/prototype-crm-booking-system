/**
 * Cliniva — Wellness & Spa Business Template
 * SOLID: Single Responsibility Principle (SRP) for Wellness, Spa & Relaxation Domain Data
 */

export const WELLNESS_TEMPLATE = {
  id: "wellness",
  name: "Wellness & Luxury Spa Care",
  shortName: "Wellness / Spa",
  category: "Wellness, Body Care & Relaxation",
  tagline: "Holistic rejuvenation, aromatherapy indulgence & deep muscle stress relief",
  accentColor: "#b45309", // Warm Amber / Earthy Sand Gold
  practitionerTitle: "Senior Spa Therapist / Masseuse",
  practitionerTitleI18n: "template.wellness.practitionerTitle",

  intakeType: "WELLNESS_PREFERENCES",
  intakeSchema: {
    type: "WELLNESS_PREFERENCES",
    title: "Aromatherapy & Therapy Preferences",
    titleI18n: "template.wellness.intakeTitle",
    description: "Personalize your bespoke spa experience with preferred aroma essential oils and massage pressure levels.",
    descriptionI18n: "template.wellness.intakeDesc",

    aromaOils: [
      { id: "lavender", label: "French Lavender (Calming, Stress Relief & Sleep Aid)", default: true },
      { id: "lemongrass", label: "Balinese Lemongrass (Energizing, Detox & Circulation)" },
      { id: "eucalyptus", label: "Eucalyptus & Mint (Deep Muscle Ease & Respiratory Clarity)" },
      { id: "frangipani", label: "Tropical Frangipani (Exotic Floral Glow & Skin Softening)" }
    ],

    pressureLevels: [
      { id: "soft", label: "Gentle (Soft Swedish strokes for pure calm)", level: 1 },
      { id: "medium", label: "Moderate (Balanced rhythmic pressure for tension release)", level: 2, default: true },
      { id: "deep", label: "Deep / Strong (Intensive trigger point & deep tissue release)", level: 3 }
    ],

    focusAreas: [
      { id: "neck-shoulder", label: "Neck, Trapezius & Shoulder Desk-Strain" },
      { id: "lower-back", label: "Lower Back & Lumbar Tension" },
      { id: "legs-feet", label: "Calves, Tired Feet & Reflex Acupressure" },
      { id: "full-body", label: "Whole Body Balanced Harmony" }
    ],

    specialNotes: [
      { id: "sensitive-skin", label: "Sensitive skin / nut oil allergy" },
      { id: "pregnancy", label: "Pregnancy / prenatal care required" },
      { id: "recent-bruise", label: "Avoid recent sports injury / bruised area" }
    ]
  },

  services: [
    {
      id: "wellness-balinese",
      name: "Traditional Balinese Aromatherapy Massage",
      nameI18n: "template.wellness.serviceBalinese",
      code: "SPA-01",
      durationMinutes: 75,
      priceSGD: 130,
      priceMYR: 290,
      depositSGD: 35,
      depositMYR: 75,
      description: "Full-body rhythmic massage using pure organic botanical oils. Combines gentle acupressure, palm pressure, and skin rolling to melt muscular tension.",
      descriptionI18n: "template.wellness.serviceBalineseDesc",
      requiresEquipment: "Essential Oil Ultrasonic Diffuser",
      category: "Signature Massage",
      badge: "Best Seller"
    },
    {
      id: "wellness-deep-tissue",
      name: "Deep Tissue Stress Relief Spa",
      nameI18n: "template.wellness.serviceDeepTissue",
      code: "SPA-02",
      durationMinutes: 60,
      priceSGD: 140,
      priceMYR: 310,
      depositSGD: 40,
      depositMYR: 85,
      description: "Targeted slow strokes and firm friction focusing on deep layers of muscle and connective tissue to alleviate chronic neck, shoulder, and lumbar tightness.",
      descriptionI18n: "template.wellness.serviceDeepTissueDesc",
      requiresEquipment: "Hot Stone Basalt Warmer Unit",
      category: "Therapeutic Bodywork",
      badge: "Recommended"
    },
    {
      id: "wellness-scrub-bath",
      name: "Herbal Body Scrub & Floral Bath",
      nameI18n: "template.wellness.serviceScrub",
      code: "SPA-03",
      durationMinutes: 90,
      priceSGD: 180,
      priceMYR: 390,
      depositSGD: 50,
      depositMYR: 110,
      description: "Invigorating organic rice and botanical lulur scrub to slough off dead skin cells, followed by a warm essential oil jacuzzi petal bath.",
      descriptionI18n: "template.wellness.serviceScrubDesc",
      requiresEquipment: "Hydrotherapy Jacuzzi Tub",
      category: "Body Ritual",
      badge: "Luxury"
    },
    {
      id: "wellness-reflexology",
      name: "Foot Reflexology & Acupressure",
      nameI18n: "template.wellness.serviceReflexology",
      code: "SPA-04",
      durationMinutes: 45,
      priceSGD: 85,
      priceMYR: 190,
      depositSGD: 25,
      depositMYR: 50,
      description: "Acupressure mapped to meridian reflex zones on the soles of the feet, restoring organ vitality, easing fluid retention, and soothing tired legs.",
      descriptionI18n: "template.wellness.serviceReflexologyDesc",
      requiresEquipment: null,
      category: "Reflexology",
      badge: null
    }
  ],

  practitioners: [
    {
      id: "therapist-sarah",
      name: "Therapist Sarah Tan",
      title: "Lead Clinical & Spa Therapist",
      titleI18n: "demo.doctor3Title",
      branchId: "sg-orchard",
      specialty: "Balinese Aromatherapy & Deep Myofascial Release",
      experienceYears: 10,
      avatarEmoji: "💆‍♀️"
    },
    {
      id: "therapist-ayu",
      name: "Therapist Ayu Dewi",
      title: "Senior Balinese Spa Specialist",
      titleI18n: "template.wellness.therapistAyuTitle",
      branchId: "my-kl",
      specialty: "Traditional Lulur, Herbal Bath & Stress Relief",
      experienceYears: 15,
      avatarEmoji: "🌸"
    },
    {
      id: "therapist-michael",
      name: "Therapist Michael Chen",
      title: "Reflexology & Deep Tissue Practitioner",
      titleI18n: "template.wellness.therapistMichaelTitle",
      branchId: "my-penang",
      specialty: "Foot Reflexology Acupressure & Post-Workout Recovery",
      experienceYears: 8,
      avatarEmoji: "💆‍♂️"
    }
  ],

  rooms: [
    "Private VIP Couple Spa Suite (with Jacuzzi)",
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
};

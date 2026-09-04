/**
 * Cliniva — TCM (Traditional Chinese Medicine) Business Template
 * SOLID: Single Responsibility Principle (SRP) for TCM Clinical Domain Data
 */

export const TCM_TEMPLATE = {
  id: "tcm",
  name: "Traditional Chinese Medicine",
  shortName: "TCM Clinic",
  category: "Traditional Medicine & Meridian Therapy",
  tagline: "Pulse diagnosis, meridian balance & ancient natural healing arts",
  accentColor: "#0f766e", // Medical Jade / Herbal Teal
  practitionerTitle: "Sinse / TCM Physician",
  practitionerTitleI18n: "template.tcm.practitionerTitle",

  intakeType: "PAIN_MAP",
  intakeSchema: {
    type: "PAIN_MAP",
    title: "Body Pain & Meridian Assessment",
    titleI18n: "template.tcm.intakeTitle",
    description: "Mark your pain points and indicate symptom duration for your TCM physician.",
    descriptionI18n: "template.tcm.intakeDesc",
    regions: [
      { id: "head", label: "Head & Migraine / Pelipis", labelI18n: "demo.painHead" },
      { id: "neck", label: "Neck & Upper Cervical / Leher", labelI18n: "demo.painNeck" },
      { id: "upper-back", label: "Upper Back & Shoulder / Punggung", labelI18n: "demo.painUpperBack" },
      { id: "lower-back", label: "Lower Back / Lumbar / Pinggang", labelI18n: "demo.painLowerBack" },
      { id: "knee", label: "Knee Joint / Lutut", labelI18n: "demo.painKnee" },
      { id: "ankle", label: "Ankle & Foot / Pergelangan Kaki", labelI18n: "demo.painAnkle" }
    ],
    symptoms: [
      { id: "chronic-ache", label: "Dull chronic ache (> 3 months)" },
      { id: "acute-stiffness", label: "Morning stiffness & restricted mobility" },
      { id: "qi-deficiency", label: "Fatigue, cold extremities & low energy (Qi deficiency)" },
      { id: "meridian-blockage", label: "Sharp stabbing sensation along meridian path" }
    ],
    severityScale: { min: 1, max: 10, default: 6, label: "VAS Pain Scale (1-10)" }
  },

  services: [
    {
      id: "tcm-acupuncture",
      name: "Electro-Acupuncture Therapy",
      nameI18n: "template.tcm.serviceAcupuncture",
      code: "TCM-01",
      durationMinutes: 45,
      priceSGD: 90,
      priceMYR: 210,
      depositSGD: 25,
      depositMYR: 50,
      description: "Meridian stimulation using ultra-fine micro needles with gentle electric pulses to relieve pain and restore Qi flow.",
      descriptionI18n: "template.tcm.serviceAcupunctureDesc",
      requiresEquipment: "Electro-Acupuncture Stimulator",
      category: "Acupuncture",
      badge: "Most Popular"
    },
    {
      id: "tcm-cupping",
      name: "Therapeutic Cupping & Bloodletting",
      nameI18n: "template.tcm.serviceCupping",
      code: "TCM-02",
      durationMinutes: 30,
      priceSGD: 70,
      priceMYR: 160,
      depositSGD: 20,
      depositMYR: 45,
      description: "Vacuum suction therapy along the Bladder Meridian to draw out dampness, detoxify tissues, and boost local micro-circulation.",
      descriptionI18n: "template.tcm.serviceCuppingDesc",
      requiresEquipment: "Vacuum Cupping Apparatus",
      category: "Detox Therapy",
      badge: null
    },
    {
      id: "tcm-herbal",
      name: "TCM Pulse & Herbal Consultation",
      nameI18n: "template.tcm.serviceHerbal",
      code: "TCM-03",
      durationMinutes: 30,
      priceSGD: 65,
      priceMYR: 150,
      depositSGD: 20,
      depositMYR: 40,
      description: "Traditional radial pulse examination, tongue inspection, and personalized granule prescription for internal harmony.",
      descriptionI18n: "template.tcm.serviceHerbalDesc",
      requiresEquipment: null,
      category: "Internal Medicine",
      badge: null
    },
    {
      id: "tcm-tuina",
      name: "Tuina Meridian Manual Therapy",
      nameI18n: "template.tcm.serviceTuina",
      code: "TCM-04",
      durationMinutes: 60,
      priceSGD: 110,
      priceMYR: 250,
      depositSGD: 30,
      depositMYR: 65,
      description: "Acupressure manipulation, joint alignment, and deep myofascial release along Chinese energetic meridians.",
      descriptionI18n: "template.tcm.serviceTuinaDesc",
      requiresEquipment: "Infrared Moxibustion Unit",
      category: "Manual Therapy",
      badge: "Recommended"
    }
  ],

  practitioners: [
    {
      id: "dr-wong",
      name: "Dr. Wong Mei Ling",
      title: "Registered TCM Physician",
      titleI18n: "demo.doctor1Title",
      branchId: "sg-orchard",
      specialty: "Acupuncture & Internal Meridian Medicine",
      experienceYears: 14,
      avatarEmoji: "👩‍⚕️"
    },
    {
      id: "sinse-huang",
      name: "Sinse Huang Wei, B.Med (TCM)",
      title: "Chief Acupuncturist",
      titleI18n: "demo.doctor2Title",
      branchId: "my-kl",
      specialty: "Neurological Acupuncture & Stroke Recovery",
      experienceYears: 20,
      avatarEmoji: "👨‍⚕️"
    },
    {
      id: "sinse-tan",
      name: "Sinse Tan Kok Leong",
      title: "Senior Tuina Specialist",
      titleI18n: "demo.doctor3Title",
      branchId: "my-penang",
      specialty: "Musculoskeletal Realignment & Cupping",
      experienceYears: 12,
      avatarEmoji: "🧑‍⚕️"
    }
  ],

  rooms: [
    "TCM Consultation Suite 01",
    "Acupuncture Bed Suite A",
    "Acupuncture Bed Suite B",
    "Herbal Preparation & Dispensary Corner"
  ],

  equipment: [
    "Electro-Acupuncture Stimulator",
    "Vacuum Cupping Apparatus",
    "Infrared Moxibustion Unit",
    "Pulse Diagnostic Waveform Scanner"
  ]
};

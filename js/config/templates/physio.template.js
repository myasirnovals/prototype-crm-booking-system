/**
 * Cliniva — Physiotherapy & Sports Rehabilitation Business Template
 * SOLID: Single Responsibility Principle (SRP) for Physiotherapy Clinical Domain Data
 * Reference: prototype_application_physioterapy
 */

export const PHYSIO_TEMPLATE = {
  id: "physio",
  name: "Physiotherapy & Sports Rehabilitation",
  shortName: "Physio Clinic",
  category: "Physical Therapy & Musculoskeletal Rehab",
  tagline: "Evidence-based manual therapy, joint mobility & athletic recovery",
  accentColor: "#0284c7", // Clinical Blue / Ocean Cyan
  practitionerTitle: "Senior Physiotherapist / Rehab Specialist",
  practitionerTitleI18n: "template.physio.practitionerTitle",

  intakeType: "PHYSIOTHERAPY",
  intakeSchema: {
    type: "PHYSIOTHERAPY",
    title: "Musculoskeletal & Pain Assessment",
    titleI18n: "template.physio.intakeTitle",
    description: "Specify your pain location, onset duration, and severity to help your physiotherapist tailor your rehabilitation plan.",
    descriptionI18n: "template.physio.intakeDesc",

    painLocations: [
      { id: "neck", label: "Neck (Cervical Spine)", icon: "settings_accessibility" },
      { id: "shoulder", label: "Shoulder & Rotator Cuff", icon: "back_hand" },
      { id: "upper-back", label: "Upper Back (Thoracic)", icon: "accessibility_new" },
      { id: "lower-back", label: "Lower Back (Lumbar / Sciatica)", icon: "accessibility_new" },
      { id: "knee", label: "Knee Joint & Ligaments", icon: "downhill_skiing" },
      { id: "ankle-foot", label: "Ankle & Foot (Achilles/Plantar)", icon: "directions_walk" },
      { id: "hip", label: "Hip & Pelvic Girdle", icon: "accessibility" },
      { id: "elbow-wrist", label: "Elbow & Wrist / RSI", icon: "pan_tool" }
    ],

    durations: [
      { id: "acute", label: "Acute", sublabel: "< 1 week (recent injury/onset)", default: true },
      { id: "subacute", label: "Subacute", sublabel: "1 - 4 weeks (lingering stiffness)" },
      { id: "chronic", label: "Chronic", sublabel: "> 4 weeks (long-term recurring pain)" }
    ],

    severityScale: {
      min: 1,
      max: 10,
      default: 6,
      label: "VAS Pain Scale (1-10)"
    },

    commonTriggers: [
      { id: "sitting", label: "Prolonged desk sitting / computer work" },
      { id: "bending", label: "Forward bending / lifting heavy items" },
      { id: "sports", label: "Running / high-impact sports activity" },
      { id: "sleep", label: "Awakening at night / morning stiffness" }
    ]
  },

  services: [
    {
      id: "physio-initial",
      name: "Comprehensive Initial Physio Assessment",
      nameI18n: "template.physio.serviceInitial",
      code: "PT-01",
      durationMinutes: 60,
      priceSGD: 120,
      priceMYR: 260,
      depositSGD: 30,
      depositMYR: 60,
      description: "In-depth postural, biomechanical & range-of-motion diagnostic assessment followed by targeted initial manual therapy.",
      descriptionI18n: "template.physio.serviceInitialDesc",
      requiresEquipment: "Diagnostic Ultrasound Scanner",
      category: "Assessment & Diagnosis",
      badge: "Essential"
    },
    {
      id: "physio-spinal",
      name: "Spinal Decompression & Lumbar Rehab",
      nameI18n: "template.physio.serviceSpinal",
      code: "PT-02",
      durationMinutes: 45,
      priceSGD: 110,
      priceMYR: 240,
      depositSGD: 30,
      depositMYR: 50,
      description: "Non-invasive motorized spinal elongation combined with core stabilization exercises to relieve disc pressure and sciatica.",
      descriptionI18n: "template.physio.serviceSpinalDesc",
      requiresEquipment: "Spinal Decompression Table",
      category: "Spine Care",
      badge: "Most Popular"
    },
    {
      id: "physio-sports",
      name: "Sports Injury & Shockwave Recovery",
      nameI18n: "template.physio.serviceSports",
      code: "PT-03",
      durationMinutes: 45,
      priceSGD: 130,
      priceMYR: 280,
      depositSGD: 35,
      depositMYR: 70,
      description: "High-energy acoustic radial shockwave therapy for chronic tendonitis, plantar fasciitis, and rapid muscle recovery.",
      descriptionI18n: "template.physio.serviceSportsDesc",
      requiresEquipment: "Shockwave Therapy Unit",
      category: "Sports Rehab",
      badge: "Advanced"
    },
    {
      id: "physio-manual",
      name: "Joint Mobilization & Dry Needling",
      nameI18n: "template.physio.serviceManual",
      code: "PT-04",
      durationMinutes: 45,
      priceSGD: 100,
      priceMYR: 220,
      depositSGD: 25,
      depositMYR: 50,
      description: "Passive accessory joint mobilization coupled with trigger point dry needling for rapid myofascial tension release.",
      descriptionI18n: "template.physio.serviceManualDesc",
      requiresEquipment: null,
      category: "Manual Therapy",
      badge: null
    }
  ],

  practitioners: [
    {
      id: "dr-lim",
      name: "Dr. Lim Wei Han, PT, M.Sc",
      title: "Senior Physiotherapist & Clinical Lead",
      branchId: "my-kl",
      specialty: "Spinal Biomechanics & Sports Injury Rehabilitation",
      experienceYears: 14,
      avatarEmoji: "👨‍⚕️"
    },
    {
      id: "dr-marcus",
      name: "Dr. Marcus Wong, PT, CMP",
      title: "Certified Mulligan Practitioner",
      branchId: "my-kl",
      specialty: "Peripheral Joint Mobilization & Dry Needling",
      experienceYears: 10,
      avatarEmoji: "🧑‍⚕️"
    },
    {
      id: "pt-sarah-m",
      name: "Sarah Mitchell, B.Physio",
      title: "Lead Musculoskeletal Specialist",
      branchId: "sg-orchard",
      specialty: "Rotator Cuff & Post-Operative ACL Rehabilitation",
      experienceYears: 8,
      avatarEmoji: "👩‍⚕️"
    }
  ],

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
};

/**
 * Cliniva — Personal Trainer & Fitness Coaching Business Template
 * SOLID: Single Responsibility Principle (SRP) for Fitness, Gym & Personal Training Domain Data
 */

export const PERSONAL_TRAINER_TEMPLATE = {
  id: "personal-trainer",
  name: "Personal Trainer & Fitness Coaching",
  shortName: "Personal Trainer",
  category: "Fitness & Strength Conditioning",
  tagline: "Dedicated 1-on-1 fitness coaching, physique transformation, and athletic performance training",
  accentColor: "#dc2626", // Dynamic Red / Energetic Crimson
  practitionerTitle: "Certified Personal Trainer / Coach",
  practitionerTitleI18n: "template.personalTrainer.practitionerTitle",
  demoUrl: "https://prototype-application-personal-trai.vercel.app/app.html",

  pricing: {
    monthly: 99,
    sixMonth: 534, // ~10% discount
    yearly: 948   // ~20% discount (79/mo)
  },

  intakeType: "FITNESS_GOALS",
  intakeSchema: {
    type: "FITNESS_GOALS",
    title: "Fitness Profile & Training Goals",
    titleI18n: "template.personalTrainer.intakeTitle",
    description: "Tell your coach about your current conditioning level, target milestones, and workout preferences.",
    descriptionI18n: "template.personalTrainer.intakeDesc",

    primaryGoals: [
      { id: "fat-loss", label: "Fat Loss & Body Recomposition", default: true },
      { id: "muscle-hypertrophy", label: "Muscle Building & Strength Gain" },
      { id: "endurance-cardio", label: "Cardiovascular Endurance & Stamina" },
      { id: "mobility-posture", label: "Postural Correction & Core Mobility" },
      { id: "athletic-prep", label: "Sport-Specific Conditioning" }
    ],

    experienceLevels: [
      { id: "beginner", label: "Beginner (New to structured gym workouts)", level: 1 },
      { id: "intermediate", label: "Intermediate (6-24 months consistent training)", level: 2, default: true },
      { id: "advanced", label: "Advanced (2+ years intensive strength training)", level: 3 }
    ],

    trainingFrequency: [
      { id: "2-days", label: "2 Days / Week" },
      { id: "3-days", label: "3 Days / Week (Recommended)", default: true },
      { id: "4-days", label: "4-5 Days / Week (High Intensity)" }
    ]
  },

  services: [
    {
      id: "pt-1on1-transformation",
      name: "1-on-1 Physique Transformation Coaching",
      nameI18n: "template.personalTrainer.service1",
      durationMin: 60,
      price: 110,
      currency: "SGD",
      category: "Personal Training",
      description: "Comprehensive strength, hypertrophy, and conditioning session with real-time biometric form correction."
    },
    {
      id: "pt-athletic-conditioning",
      name: "Functional Movement & Athletic Performance",
      nameI18n: "template.personalTrainer.service2",
      durationMin: 60,
      price: 125,
      currency: "SGD",
      category: "Performance Coaching",
      description: "Agility, power output, plyometrics, and mobility training for peak athletic performance."
    },
    {
      id: "pt-intake-assessment",
      name: "Comprehensive Fitness Assessment & InBody Scan",
      nameI18n: "template.personalTrainer.service3",
      durationMin: 45,
      price: 75,
      currency: "SGD",
      category: "Assessment",
      description: "InBody bioimpedance body composition analysis, posture evaluation, and baseline endurance testing."
    }
  ],

  practitioners: [
    {
      id: "coach-marcus-tan",
      name: "Marcus Tan, CSCS",
      title: "Head Performance Coach & Strength Specialist",
      specialties: ["Hypertrophy", "Powerlifting", "Olympic Weightlifting"],
      rating: 4.96,
      reviewsCount: 164,
      avatar: "🏋️",
      availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    },
    {
      id: "coach-elena-vance",
      name: "Elena Vance, NASM-CPT",
      title: "Senior Functional Movement & Mobility Coach",
      specialties: ["Fat Loss", "Core Conditioning", "Kettlebell Athletics"],
      rating: 4.93,
      reviewsCount: 138,
      avatar: "💪",
      availableDays: ["Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    }
  ],

  rooms: [
    { id: "pt-zone-a", name: "Strength & Free Weights Arena (Zone A)" },
    { id: "pt-zone-b", name: "High-Performance Turf & Conditioning (Zone B)" },
    { id: "pt-zone-c", name: "Private Assessment & Biometrics Suite" }
  ]
};

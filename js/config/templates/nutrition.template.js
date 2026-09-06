/**
 * Cliniva — Clinical Nutrition & Dietetics Business Template
 * SOLID: Single Responsibility Principle (SRP) for Nutrition & Dietary Domain Data
 * Reference: prototype_application_nutrition
 */

export const NUTRITION_TEMPLATE = {
  id: "nutrition",
  name: "Clinical Nutrition & Dietetics",
  shortName: "Nutrition Clinic",
  category: "Dietetics, Metabolic Health & Functional Nutrition",
  tagline: "Personalized meal planning, metabolic assessment & evidence-based nutrition coaching",
  accentColor: "#16a34a", // Health Green / Emerald Vitality
  practitionerTitle: "Registered Dietitian / Clinical Nutritionist",
  practitionerTitleI18n: "template.nutrition.practitionerTitle",

  intakeType: "NUTRITION",
  intakeSchema: {
    type: "NUTRITION",
    title: "Nutritional & Metabolic Profile Assessment",
    titleI18n: "template.nutrition.intakeTitle",
    description: "Provide your biometric measurements, primary dietary goals, food sensitivities, and medical background for a personalized consultation.",
    descriptionI18n: "template.nutrition.intakeDesc",

    goals: [
      { id: "weight-loss", label: "Weight Loss & Fat Reduction", icon: "scale", default: true },
      { id: "muscle-gain", label: "Muscle Hypertrophy & Strength", icon: "fitness_center" },
      { id: "metabolic-health", label: "Blood Sugar & Metabolic Control", icon: "monitor_heart" },
      { id: "digestive-gut", label: "Gut Health & IBS Relief", icon: "spa" },
      { id: "sports-performance", label: "Athletic & Endurance Fueling", icon: "bolt" },
      { id: "general-vitality", label: "Healthy Aging & Longevity", icon: "favorite" }
    ],

    dietaryPatterns: [
      { id: "standard", label: "Standard / Omnivore (No specific restrictions)" },
      { id: "halal", label: "Halal Dietary Compliance" },
      { id: "vegetarian", label: "Vegetarian (Lacto-Ovo)" },
      { id: "vegan", label: "Strict Plant-Based / Vegan" },
      { id: "pescatarian", label: "Pescatarian (Fish & Seafood)" },
      { id: "keto-lowcarb", label: "Keto / Low-Carbohydrate" },
      { id: "mediterranean", label: "Mediterranean Heart-Healthy" },
      { id: "gluten-free", label: "Celiac / Gluten-Free" }
    ],

    commonAllergies: [
      { id: "dairy", label: "Dairy / Lactose" },
      { id: "gluten", label: "Gluten / Wheat" },
      { id: "peanuts", label: "Peanuts" },
      { id: "tree-nuts", label: "Tree Nuts (Almonds/Walnuts)" },
      { id: "shellfish", label: "Shellfish / Crustaceans" },
      { id: "eggs", label: "Eggs" },
      { id: "soy", label: "Soybeans" },
      { id: "none", label: "No Known Food Allergies", default: true }
    ],

    medicalConditions: [
      { id: "diabetes", label: "Type 2 Diabetes / Pre-diabetes" },
      { id: "hypertension", label: "High Blood Pressure (Hypertension)" },
      { id: "cholesterol", label: "High Cholesterol / Dyslipidemia" },
      { id: "gerd-ibs", label: "GERD / Acid Reflux / IBS" },
      { id: "thyroid", label: "Hypothyroid / Hashimoto's" },
      { id: "pcos", label: "PCOS (Hormonal Balance)" },
      { id: "none", label: "No Pre-existing Conditions", default: true }
    ],

    activityLevels: [
      { id: "sedentary", label: "Sedentary (Desk job, minimal exercise)", multiplier: 1.2 },
      { id: "light", label: "Lightly Active (1-3 light workout days/week)", multiplier: 1.375, default: true },
      { id: "moderate", label: "Moderately Active (3-5 intense gym days/week)", multiplier: 1.55 },
      { id: "very-active", label: "Very Active / Competitive Athlete (6-7 days/week)", multiplier: 1.725 }
    ]
  },

  services: [
    {
      id: "nutri-initial",
      name: "Comprehensive Clinical Dietitian Consultation",
      nameI18n: "template.nutrition.serviceInitial",
      code: "NUT-01",
      durationMinutes: 60,
      priceSGD: 110,
      priceMYR: 240,
      depositSGD: 25,
      depositMYR: 50,
      description: "Full nutritional audit, resting metabolic rate estimation, body composition analysis, and personalized starter meal blueprint.",
      descriptionI18n: "template.nutrition.serviceInitialDesc",
      requiresEquipment: "Body Composition Bio-Impedance Scanner",
      category: "Initial Consult",
      badge: "Most Popular"
    },
    {
      id: "nutri-metabolic",
      name: "Metabolic & Blood Glucose Optimization",
      nameI18n: "template.nutrition.serviceMetabolic",
      code: "NUT-02",
      durationMinutes: 45,
      priceSGD: 95,
      priceMYR: 210,
      depositSGD: 25,
      depositMYR: 45,
      description: "Targeted clinical nutrition plan for insulin sensitivity, HbA1c lowering, and sustainable lipid profile management.",
      descriptionI18n: "template.nutrition.serviceMetabolicDesc",
      requiresEquipment: "Point-of-Care Blood Glucose & Lipid Analyzer",
      category: "Metabolic Health",
      badge: "Clinical"
    },
    {
      id: "nutri-gut",
      name: "Gut Microbiome & Food Intolerance Therapy",
      nameI18n: "template.nutrition.serviceGut",
      code: "NUT-03",
      durationMinutes: 45,
      priceSGD: 105,
      priceMYR: 230,
      depositSGD: 25,
      depositMYR: 50,
      description: "Low-FODMAP elimination and reintroduction protocol to heal leaky gut, relieve IBS bloating, and rebuild microbiome diversity.",
      descriptionI18n: "template.nutrition.serviceGutDesc",
      requiresEquipment: null,
      category: "Digestive Health",
      badge: null
    },
    {
      id: "nutri-sports",
      name: "Sports Nutrition & Body Recomposition",
      nameI18n: "template.nutrition.serviceSports",
      code: "NUT-04",
      durationMinutes: 45,
      priceSGD: 115,
      priceMYR: 250,
      depositSGD: 30,
      depositMYR: 55,
      description: "Macronutrient periodization, race-day glycogen loading, hydration strategies, and recovery supplementation for athletes.",
      descriptionI18n: "template.nutrition.serviceSportsDesc",
      requiresEquipment: "Body Composition Bio-Impedance Scanner",
      category: "Performance",
      badge: "Pro"
    }
  ],

  practitioners: [
    {
      id: "dietitian-elena",
      name: "Elena Lopez, RD, M.Sc",
      title: "Registered Clinical Dietitian",
      branchId: "my-penang",
      specialty: "Metabolic Health, Diabetes Management & Weight Loss",
      experienceYears: 11,
      avatarEmoji: "👩‍⚕️"
    },
    {
      id: "dr-kevin-tan",
      name: "Dr. Kevin Tan, Ph.D, CNS",
      title: "Sports Nutrition Specialist & Biochemist",
      branchId: "my-penang",
      specialty: "Body Recomposition, Gut Microbiome & Athletic Fueling",
      experienceYears: 13,
      avatarEmoji: "👨‍⚕️"
    },
    {
      id: "dietitian-amirah",
      name: "Amirah binti Razak, B.Sc (Nutr)",
      title: "Holistic Wellness & Maternal Dietitian",
      branchId: "my-kl",
      specialty: "PCOS, Prenatal Nutrition & Anti-Inflammatory Diets",
      experienceYears: 7,
      avatarEmoji: "🧕"
    }
  ],

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
};

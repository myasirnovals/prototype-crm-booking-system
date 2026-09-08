/**
 * Cliniva — Role-Based Access Control (RBAC) & Routes Configuration
 * SOLID: Open/Closed Principle — defines roles, permissions, routes, and initial credentials
 *
 * Actor Hierarchy:
 *   Super Admin     → Platform-level: manage Owner accounts, audit logs, analytics
 *   Owner           → Brand-level: create branches, assign Branch Manager to a branch
 *   Branch Manager  → Branch-level: manage Practitioners, Receptionists within one branch
 *   Practitioner    → Clinical: consultations, patient queue, medical notes
 *   Receptionist    → Operational: check-in, POS, waiting room queue
 *   User/Patient    → Self-service: booking, e-ticket, portal
 */

export const USER_ROLES = {
  SUPER_ADMIN:     "SUPER_ADMIN",
  OWNER:           "OWNER",
  BRANCH_MANAGER:  "BRANCH_MANAGER", // Admin of a single branch, assigned by Owner
  PRACTITIONER:    "PRACTITIONER",
  RECEPTIONIST:    "RECEPTIONIST",
  USER:            "USER"            // Patient / Client
};

export const ROLE_CONFIG = {
  [USER_ROLES.SUPER_ADMIN]: {
    name: "Super Admin",
    homeRoute: "pages/super-admin/index.html",
    badge: "👑 Super Admin",
    color: "#6d28d9",
    description: "Platform multi-tenant management: Owner accounts, audit logs & system analytics"
  },
  [USER_ROLES.OWNER]: {
    name: "Owner",
    homeRoute: "pages/owner/dashboard.html",
    badge: "💼 Clinic Owner",
    color: "#0f766e",
    description: "Brand management: create branches, assign Branch Manager, view cross-branch reports"
  },
  [USER_ROLES.BRANCH_MANAGER]: {
    name: "Branch Manager",
    homeRoute: "pages/branch-manager/index.html",
    badge: "🏢 Branch Manager",
    color: "#0369a1",
    description: "Branch-level management: add Practitioners & Receptionists, manage daily operations"
  },
  [USER_ROLES.PRACTITIONER]: {
    name: "Practitioner / Doctor / Therapist",
    homeRoute: "pages/practitioner/index.html",
    badge: "🧑‍⚕️ Clinical Practitioner",
    color: "#0284c7",
    description: "Doctor's consultation schedule, patient intake, interactive body pain map & chime calling"
  },
  [USER_ROLES.RECEPTIONIST]: {
    name: "Receptionist / Front Desk",
    homeRoute: "pages/receptionist/index.html",
    badge: "🛎️ Clinic Receptionist",
    color: "#d97706",
    description: "Live waiting room queue, master calendar, cashier POS & walk-in dispatcher"
  },
  [USER_ROLES.USER]: {
    name: "User / Patient",
    homeRoute: "pages/patient/index.html",
    badge: "👤 Verified Patient",
    color: "#16a34a",
    description: "Personal self-service portal, digital e-ticket QR, live queue tracker & booking history"
  }
};

export const REGISTERED_USERS = [
  // ── Super Admin ──────────────────────────────────────────────────────────
  {
    id: "usr-superadmin-01",
    email: "superadmin@cliniva.com",
    phone: "+65 9000 1111",
    password: "cliniva2026",
    role: USER_ROLES.SUPER_ADMIN,
    name: "Dr. Hendra Wijaya",
    title: "Chief Medical Officer & Super Admin",
    branchId: null,
    branchName: null,
    region: "sg",
    avatar: "👑",
    onboardingCompleted: true,
    createdAt: "2026-09-01T08:00:00.000Z"
  },

  // ── Owner ─────────────────────────────────────────────────────────────────
  {
    id: "usr-owner-dennis",
    email: "owner@cliniva.com",
    phone: "+65 8999 7788",
    password: "cliniva2026",
    role: USER_ROLES.OWNER,
    name: "Dennis Pratama",
    title: "Clinic Owner",
    branchId: null,
    branchName: "Setup Pending",
    brandName: null,
    brandLogo: null,
    region: "sg",
    avatar: "💼",
    onboardingCompleted: false,
    createdAt: "2026-09-08T08:30:00.000Z"
  },

  // ── Branch Manager ────────────────────────────────────────────────────────
  {
    id: "usr-branchmgr-01",
    email: "manager@orchardclinic.sg",
    phone: "+65 9333 4444",
    password: "cliniva2026",
    role: USER_ROLES.BRANCH_MANAGER,
    name: "Rachel Tan",
    title: "Branch Manager",
    branchId: "sg-orchard",
    branchName: "Orchard Wellness Clinic",
    region: "sg",
    avatar: "🏢",
    onboardingCompleted: true,
    createdAt: "2026-09-01T08:00:00.000Z"
  },

  // ── Practitioner ──────────────────────────────────────────────────────────
  {
    id: "usr-practitioner-01",
    email: "dr.lim@orchardclinic.sg",
    phone: "+65 9111 2222",
    password: "cliniva2026",
    role: USER_ROLES.PRACTITIONER,
    name: "Dr. Lim Wei Han",
    title: "Senior Physiotherapist",
    specialty: "Sports Rehabilitation & Spine",
    room: "Room A2 (Physio Suite)",
    branchId: "sg-orchard",
    branchName: "Orchard Wellness Clinic",
    region: "sg",
    avatar: "🧑‍⚕️",
    onboardingCompleted: true,
    createdAt: "2026-09-01T08:00:00.000Z"
  },

  // ── Receptionist ──────────────────────────────────────────────────────────
  {
    id: "usr-receptionist-01",
    email: "reception@orchardclinic.sg",
    phone: "+65 9222 3333",
    password: "cliniva2026",
    role: USER_ROLES.RECEPTIONIST,
    name: "Siti Rahmah",
    title: "Lead Front Desk Receptionist",
    branchId: "sg-orchard",
    branchName: "Orchard Wellness Clinic",
    region: "sg",
    avatar: "🛎️",
    onboardingCompleted: true,
    createdAt: "2026-09-01T08:00:00.000Z"
  },

  // ── Patient / User ────────────────────────────────────────────────────────
  {
    id: "usr-patient-01",
    email: "amanda@tan.sg",
    phone: "+65 8123 4567",
    password: "cliniva2026",
    otp: "123456",
    role: USER_ROLES.USER,
    name: "Amanda Tan",
    title: "Registered Patient",
    branchId: "sg-orchard",
    branchName: "Orchard Wellness Clinic",
    region: "sg",
    avatar: "👤",
    activeBookingCode: "BK-20260901-0812",
    queueNumber: "A-01",
    onboardingCompleted: true,
    createdAt: "2026-09-01T08:00:00.000Z"
  }
];

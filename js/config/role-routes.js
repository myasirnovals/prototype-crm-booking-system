/**
 * Cliniva — Role-Based Access Control (RBAC) & Routes Configuration
 * SOLID: Open/Closed Principle — defines roles, permissions, routes, and initial credentials
 */

export const USER_ROLES = {
  SUPER_ADMIN: "SUPER_ADMIN",
  OWNER: "OWNER",
  PRACTITIONER: "PRACTITIONER",
  RECEPTIONIST: "RECEPTIONIST",
  USER: "USER" // Patient / Client
};

export const ROLE_CONFIG = {
  [USER_ROLES.SUPER_ADMIN]: {
    name: "Super Admin",
    homeRoute: "owner.html",
    badge: "👑 Super Admin",
    color: "#0f766e",
    description: "Platform multi-tenant analytics, clinic accounts provisioning & audit logs"
  },
  [USER_ROLES.OWNER]: {
    name: "Owner",
    homeRoute: "owner-dashboard.html",
    badge: "💼 Clinic Owner",
    color: "#0f766e",
    description: "Clinic brand management, branch operations, revenue & staff"
  },
  [USER_ROLES.PRACTITIONER]: {
    name: "Practitioner / Doctor / Therapist",
    homeRoute: "practitioner.html",
    badge: "🧑‍⚕️ Clinical Practitioner",
    color: "#0284c7",
    description: "Doctor's consultation schedule, patient intake, interactive body pain map & chime calling"
  },
  [USER_ROLES.RECEPTIONIST]: {
    name: "Receptionist / Front Desk",
    homeRoute: "receptionist.html",
    badge: "🛎️ Clinic Receptionist",
    color: "#d97706",
    description: "Live waiting room queue, master calendar, cashier POS & walk-in dispatcher"
  },
  [USER_ROLES.USER]: {
    name: "User / Patient",
    homeRoute: "patient-portal.html",
    badge: "👤 Verified Patient",
    color: "#16a34a",
    description: "Personal self-service portal, digital e-ticket QR, live queue tracker & booking history"
  }
};

export const REGISTERED_USERS = [
  {
    id: "usr-superadmin-01",
    email: "owner@cliniva.com",
    phone: "+65 9000 1111",
    password: "cliniva2026",
    role: USER_ROLES.SUPER_ADMIN,
    name: "Dr. Hendra Wijaya",
    title: "Chief Medical Officer & Super Admin",
    branchId: "sg-orchard",
    branchName: "Orchard Wellness Clinic (HQ)",
    region: "sg",
    avatar: "👑",
    onboardingCompleted: true,
    createdAt: "2026-09-01T08:00:00.000Z"
  },
  {
    id: "usr-owner-dennis",
    email: "dennis@cliniva.com",
    phone: "+65 8999 7788",
    password: "cliniva2026",
    role: USER_ROLES.OWNER,
    name: "Dennis Pratama",
    title: "Clinic Owner",
    branchId: null,
    branchName: "Setup Pending",
    region: "sg",
    avatar: "💼",
    onboardingCompleted: false,
    createdAt: "2026-09-08T08:30:00.000Z"
  },
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


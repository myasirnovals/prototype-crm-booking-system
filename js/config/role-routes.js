/**
 * Cliniva — Role-Based Access Control (RBAC) & Routes Configuration
 * SOLID: Open/Closed Principle — defines roles, permissions, routes, and initial credentials
 */

export const USER_ROLES = {
  OWNER: "OWNER",
  PRACTITIONER: "PRACTITIONER",
  RECEPTIONIST: "RECEPTIONIST",
  USER: "USER" // Patient / Client
};

export const ROLE_CONFIG = {
  [USER_ROLES.OWNER]: {
    name: "Owner / Super Admin",
    homeRoute: "owner.html",
    badge: "👑 Executive Owner",
    color: "#0f766e",
    description: "Multi-branch analytics, clinic identity & logo configuration, audit logs"
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
    id: "usr-owner-01",
    email: "owner@cliniva.com",
    phone: "+65 9000 1111",
    password: "cliniva2026",
    role: USER_ROLES.OWNER,
    name: "Dr. Hendra Wijaya",
    title: "Chief Medical Officer & Clinic Owner",
    branchId: "sg-orchard",
    branchName: "Orchard Wellness Clinic (HQ)",
    region: "sg",
    avatar: "👑"
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
    avatar: "🧑‍⚕️"
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
    avatar: "🛎️"
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
    queueNumber: "A-01"
  }
];

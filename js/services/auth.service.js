/**
 * Cliniva — Authentication & Role-Based Access Control (RBAC) Service
 * SOLID: Single Responsibility Principle for Authentication, Session Lifecycle & Route Guards
 */

import { USER_ROLES, ROLE_CONFIG, REGISTERED_USERS } from "../config/role-routes.js";
import { storageService } from "./storage.service.js";
import { notificationService } from "./notification.service.js";
import { supabaseService } from "./supabase.service.js";

class AuthService {
  constructor() {
    this.SESSION_KEY = "cliniva_auth_session";
    this.USERS_STORAGE_KEY = "cliniva_users_registry";
    this.DEFAULT_OTP = "123456";
  }

  /**
   * Get all registered users from storage with fallback to initial default
   */
  getUsers() {
    let stored = storageService.get(this.USERS_STORAGE_KEY, null);
    if (stored && Array.isArray(stored) && stored.length > 0) {
      let changed = false;
      REGISTERED_USERS.forEach((defaultUser) => {
        const foundIndex = stored.findIndex(
          (u) => u.id === defaultUser.id || u.email.toLowerCase() === defaultUser.email.toLowerCase()
        );
        if (foundIndex === -1) {
          stored.push({ ...defaultUser });
          changed = true;
        } else if (defaultUser.role && stored[foundIndex].role !== defaultUser.role) {
          // Keep roles synchronized if changed in config (e.g. SUPER_ADMIN vs OWNER)
          stored[foundIndex].role = defaultUser.role;
          changed = true;
        }
      });
      if (changed) {
        storageService.set(this.USERS_STORAGE_KEY, stored);
      }
      return stored;
    }
    storageService.set(this.USERS_STORAGE_KEY, REGISTERED_USERS);
    return [...REGISTERED_USERS];
  }

  /**
   * Save user registry to local storage
   */
  saveUsers(users) {
    storageService.set(this.USERS_STORAGE_KEY, users);
    return users;
  }

  /**
   * Get currently active session
   */
  getCurrentSession() {
    return storageService.get(this.SESSION_KEY, null);
  }

  /**
   * Get active user object
   */
  getCurrentUser() {
    const session = this.getCurrentSession();
    return session ? session.user : null;
  }

  /**
   * Check if any user is authenticated
   */
  isAuthenticated() {
    return Boolean(this.getCurrentSession());
  }

  /**
   * Check if active session matches a given role
   */
  hasRole(role) {
    const session = this.getCurrentSession();
    return session ? session.role === role : false;
  }

  /**
   * Get default home page route for a specific role
   */
  getHomeRouteForRole(role) {
    const config = ROLE_CONFIG[role];
    return config ? config.homeRoute : "index.html";
  }

  /**
   * Determine exact target route based on user role and diagram flow
   * Flow according to alur aplikasi booking system.xml:
   *
   * Super Admin      → pages/super-admin/index.html
   * Owner (first)    → pages/owner/onboarding.html  (Setup Branch)
   * Owner (return)   → pages/owner/branch-select.html → pages/owner/dashboard.html
   * Branch Admin     → pages/branch-admin/index.html (Front Desk, Queue, Doctors, POS)
   * Practitioner     → pages/practitioner/index.html
   * Patient/User     → pages/patient/index.html
   */
  getHomeRouteForUser(user) {
    if (!user) return "index.html";

    if (user.role === USER_ROLES.SUPER_ADMIN) {
      return "pages/super-admin/index.html";
    }

    if (user.role === USER_ROLES.OWNER) {
      if (user.onboardingCompleted === false) {
        return "pages/owner/onboarding.html"; // First time = Yes → Setup Branch
      } else {
        return "pages/owner/branch-select.html"; // Returning → Choose Branch
      }
    }

    if (
      user.role === USER_ROLES.BRANCH_ADMIN ||
      user.role === "BRANCH_MANAGER" ||
      user.role === "RECEPTIONIST"
    ) {
      return "pages/branch-admin/index.html";
    }

    if (user.role === USER_ROLES.PRACTITIONER) {
      return "pages/practitioner/index.html";
    }

    if (user.role === USER_ROLES.USER) {
      return "pages/patient/index.html";
    }

    return this.getHomeRouteForRole(user.role);
  }

  /**
   * Resolve home route purely by role identifier
   */
  getHomeRouteForRole(role) {
    if (
      role === USER_ROLES.BRANCH_ADMIN ||
      role === "BRANCH_MANAGER" ||
      role === "RECEPTIONIST"
    ) {
      return "pages/branch-admin/index.html";
    }
    return ROLE_CONFIG[role]?.homeRoute || "index.html";
  }

  /**
   * Authenticate user with Email / Identifier & Password (Supabase SSOT + Fallback)
   */
  async loginWithCredentials(identifier, password, preferredRole = null, region = "sg") {
    if (!identifier || !password) {
      return { success: false, error: "Please enter your email/contact and password." };
    }

    const cleanIdentifier = identifier.trim().toLowerCase();
    let user = null;

    // 1. Check Supabase profiles table directly (Single Source of Truth)
    if (supabaseService.isAvailable()) {
      try {
        let profile = await supabaseService.getProfileByEmail(cleanIdentifier);
        if (!profile && preferredRole) {
          profile = await supabaseService.getProfileByRole(preferredRole);
        }
        if (profile) {
          user = profile;
        }
      } catch (err) {
        console.warn("[AuthService] Supabase profile query failed, using local fallback:", err);
      }
    }

    // 2. Fallback to registered users if not connected or not found
    if (!user) {
      const users = this.getUsers();
      if (preferredRole) {
        user = users.find((u) => 
          (u.email.toLowerCase() === cleanIdentifier || u.phone.replace(/\s+/g, "") === cleanIdentifier.replace(/\s+/g, "")) &&
          u.role === preferredRole
        );
        if (!user && (cleanIdentifier === "owner@cliniva.com" || cleanIdentifier === "dennis@cliniva.com") && preferredRole === USER_ROLES.OWNER) {
          user = users.find((u) => u.role === USER_ROLES.OWNER);
        }
      }
      if (!user) {
        user = users.find((u) => 
          u.email.toLowerCase() === cleanIdentifier || 
          u.phone.replace(/\s+/g, "") === cleanIdentifier.replace(/\s+/g, "")
        );
      }
      if (!user && preferredRole) {
        user = users.find((u) => u.role === preferredRole);
      }
    }

    // Verify password (demo accepts "cliniva2026" or user's custom updated password)
    if (!user || (password !== user.password && password !== "cliniva2026")) {
      return { 
        success: false, 
        error: "Invalid credentials. Please use your updated password, demo account, or password: cliniva2026" 
      };
    }

    const targetRoute = this.getHomeRouteForUser(user);

    const session = {
      type: user.role === USER_ROLES.USER ? "PATIENT" : "STAFF",
      role: user.role,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        title: user.title,
        specialty: user.specialty || null,
        room: user.room || null,
        branchId: user.branchId,
        branchName: user.branchName,
        brandName: user.brandName || null,
        brandLogo: user.brandLogo || null,
        activeTemplate: user.activeTemplate || null,
        region: user.region || region,
        avatar: user.avatar,
        onboardingCompleted: user.onboardingCompleted !== false
      },
      targetRoute,
      loggedInAt: new Date().toISOString()
    };

    storageService.set(this.SESSION_KEY, session);

    // Audit log in cloud (non-blocking)
    if (supabaseService.isAvailable()) {
      try {
        supabaseService.logAudit?.("LOGIN", `User ${user.email} (${user.role}) logged in`, user)?.catch?.((err) => {
          console.warn("[AuthService] Background audit log error:", err);
        });
      } catch (err) {
        console.warn("[AuthService] Failed to record audit log:", err);
      }
    }

    return { success: true, session, targetRoute };
  }

  /**
   * Fast 1-Click Demo Login by Role Key (Supabase SSOT + Fallback)
   */
  async loginByRoleKey(roleKey) {
    let user = null;

    if (supabaseService.isAvailable()) {
      try {
        user = await supabaseService.getProfileByRole(roleKey);
      } catch (err) {
        console.warn("[AuthService] Supabase role lookup failed:", err);
      }
    }

    if (!user) {
      const users = this.getUsers();
      user = users.find((u) => u.role === roleKey);
    }

    if (!user) {
      return { success: false, error: `Demo account for role ${roleKey} not found.` };
    }

    const targetRoute = this.getHomeRouteForUser(user);

    const session = {
      type: user.role === USER_ROLES.USER ? "PATIENT" : "STAFF",
      role: user.role,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        title: user.title,
        specialty: user.specialty || null,
        room: user.room || null,
        branchId: user.branchId,
        branchName: user.branchName,
        brandName: user.brandName || null,
        brandLogo: user.brandLogo || null,
        activeTemplate: user.activeTemplate || null,
        region: user.region || "sg",
        avatar: user.avatar,
        onboardingCompleted: user.onboardingCompleted !== false
      },
      targetRoute,
      loggedInAt: new Date().toISOString()
    };

    storageService.set(this.SESSION_KEY, session);

    if (supabaseService.isAvailable()) {
      try {
        supabaseService.logAudit?.("DEMO_LOGIN", `1-Click login as ${roleKey} (${user.name})`, user)?.catch?.((err) => {
          console.warn("[AuthService] Background audit log error:", err);
        });
      } catch (err) {
        console.warn("[AuthService] Failed to record audit log:", err);
      }
    }

    return { success: true, session, targetRoute };
  }

  /**
   * Reset / Change user password directly in-app without external SMTP email
   */
  resetPassword(identifier, newPassword, confirmPassword) {
    if (!identifier || !identifier.trim()) {
      return { success: false, error: "Please enter your registered work email or phone number." };
    }

    if (!newPassword || newPassword.length < 6) {
      return { success: false, error: "New password must be at least 6 characters long." };
    }

    if (newPassword !== confirmPassword) {
      return { success: false, error: "Password confirmation does not match the new password." };
    }

    const cleanIdentifier = identifier.trim().toLowerCase();
    const users = this.getUsers();

    const userIndex = users.findIndex((u) =>
      u.email.toLowerCase() === cleanIdentifier ||
      u.phone.replace(/\s+/g, "") === cleanIdentifier.replace(/\s+/g, "") ||
      u.id.toLowerCase() === cleanIdentifier
    );

    if (userIndex === -1) {
      return {
        success: false,
        error: `Account for "${identifier}" not found. Please verify your email or use a registered staff account (e.g. owner@cliniva.com, dr.lim@orchardclinic.sg, reception@orchardclinic.sg).`
      };
    }

    // Update password in registry
    users[userIndex].password = newPassword;
    users[userIndex].passwordUpdatedAt = new Date().toISOString();
    this.saveUsers(users);

    // If currently logged in as this user, update active session
    const currentSession = this.getCurrentSession();
    if (currentSession && currentSession.user && currentSession.user.id === users[userIndex].id) {
      currentSession.user.passwordUpdatedAt = users[userIndex].passwordUpdatedAt;
      storageService.set(this.SESSION_KEY, currentSession);
    }

    // Log security notification to notification center
    notificationService.addSystemNotification({
      title: "Password Reset",
      message: `Password for ${users[userIndex].name} (${users[userIndex].role}) has been updated.`,
      category: "SECURITY",
      type: "warning"
    });

    return {
      success: true,
      user: users[userIndex],
      message: `Password for ${users[userIndex].name} (${users[userIndex].email}) has been successfully updated! You can now sign in with your new password.`
    };
  }

  /**
   * Update user textual profile information (name, phone, title, specialty, room)
   */
  updateUserProfile(userId, profileData) {
    if (!userId) {
      return { success: false, error: "User ID is required." };
    }

    const users = this.getUsers();
    let userIndex = users.findIndex((u) => u.id === userId);

    if (userIndex === -1) {
      const currentSession = this.getCurrentSession();
      if (currentSession && currentSession.user) {
        if (currentSession.user.email) {
          userIndex = users.findIndex((u) => u.email.toLowerCase() === currentSession.user.email.toLowerCase());
        }
        if (userIndex === -1 && currentSession.user.id === userId) {
          users.push({ ...currentSession.user });
          userIndex = users.length - 1;
        }
      }
    }

    if (userIndex === -1) {
      return { success: false, error: "User not found in registry." };
    }

    // Update allowed fields (strictly textual, no photo upload)
    if (profileData.name) users[userIndex].name = profileData.name.trim();
    if (profileData.phone) users[userIndex].phone = profileData.phone.trim();
    if (profileData.title) users[userIndex].title = profileData.title.trim();
    if (profileData.specialty !== undefined) users[userIndex].specialty = profileData.specialty?.trim() || null;
    if (profileData.room !== undefined) users[userIndex].room = profileData.room?.trim() || null;
    if (profileData.branchName) users[userIndex].branchName = profileData.branchName.trim();

    this.saveUsers(users);

    // Synchronize current active session if updating self
    const currentSession = this.getCurrentSession();
    if (currentSession && currentSession.user && currentSession.user.id === userId) {
      currentSession.user = {
        ...currentSession.user,
        ...users[userIndex]
      };
      storageService.set(this.SESSION_KEY, currentSession);
    }

    notificationService.addSystemNotification({
      title: "Profile Updated",
      message: `Profile data updated for ${users[userIndex].name} (${users[userIndex].role}).`,
      category: "PROFILE",
      type: "info"
    });

    return {
      success: true,
      user: users[userIndex],
      message: "Profile information updated successfully."
    };
  }

  /**
   * Register a new Owner account (created by Super Admin)
   */
  registerOwner(data) {
    if (!data || !data.name || !data.email) {
      return { success: false, error: "Name and Email are required." };
    }
    const users = this.getUsers();
    if (users.some((u) => u.email && u.email.toLowerCase() === data.email.toLowerCase())) {
      return { success: false, error: "An account with this email already exists." };
    }
    const newOwner = {
      id: "usr-owner-" + Date.now(),
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      phone: data.phone ? data.phone.trim() : "",
      password: data.password || "cliniva2026",
      role: USER_ROLES.OWNER,
      title: data.title || "Clinic Owner",
      avatar: data.avatar || "💼",
      branchId: null,
      branchName: "Setup Pending",
      brandName: null,
      brandLogo: null,
      region: data.region || "sg",
      onboardingCompleted: false,
      createdAt: new Date().toISOString()
    };
    users.push(newOwner);
    this.saveUsers(users);
    return { success: true, user: newOwner };
  }

  /**
   * Delete user account from registry
   */
  deleteUserAccount(userId) {
    if (!userId) {
      return { success: false, error: "User ID is required." };
    }
    let users = this.getUsers();
    const target = users.find((u) => u.id === userId);
    if (!target) {
      return { success: false, error: "User not found in registry." };
    }
    if (target.role === USER_ROLES.SUPER_ADMIN) {
      return { success: false, error: "Super Admin accounts cannot be deleted." };
    }
    users = users.filter((u) => u.id !== userId);
    this.saveUsers(users);
    return { success: true, message: `Account for ${target.name} deleted.` };
  }

  /**
   * Generate & Request Patient OTP
   */
  requestPatientOtp(contact, channel = "whatsapp", countryCode = "+65") {
    if (!contact) {
      return { success: false, error: "Please enter your WhatsApp number or email to receive OTP." };
    }

    const fullContact = `${countryCode} ${contact}`.trim();

    return {
      success: true,
      channel,
      contact: fullContact,
      demoOtp: this.DEFAULT_OTP,
      message: `OTP verification code sent via ${channel === "whatsapp" ? "WhatsApp" : "Email"} to ${fullContact}.`
    };
  }

  /**
   * Verify Patient OTP and create Patient session
   */
  verifyPatientOtp(otp, consentAccepted, contact = "+65 8123 4567") {
    if (!otp || otp.length !== 6) {
      return { success: false, error: "Please enter all 6 digits of the OTP code." };
    }

    if (otp !== this.DEFAULT_OTP) {
      return { success: false, error: "Invalid OTP code. For demo testing, use: 123456." };
    }

    if (!consentAccepted) {
      return { success: false, error: "Please accept the privacy consent and terms before continuing." };
    }

    // Use default patient demo account or create dynamic
    const defaultPatient = this.getUsers().find((u) => u.role === USER_ROLES.USER);
    const user = defaultPatient ? { ...defaultPatient } : {
      id: "usr-patient-dynamic",
      name: "Amanda Tan",
      email: contact.includes("@") ? contact : "patient@cliniva.com",
      phone: contact,
      role: USER_ROLES.USER,
      title: "Registered Patient",
      branchId: "sg-orchard",
      branchName: "Orchard Wellness Clinic",
      region: "sg",
      avatar: "👤"
    };

    const targetRoute = this.getHomeRouteForRole(USER_ROLES.USER);

    const session = {
      type: "PATIENT",
      role: USER_ROLES.USER,
      user,
      consentAccepted: true,
      targetRoute,
      loggedInAt: new Date().toISOString()
    };

    storageService.set(this.SESSION_KEY, session);
    return { success: true, session, targetRoute };
  }

  /**
   * Helper to dynamically compute relative path to pages/public/sign-in.html
   */
  getSignInUrl() {
    const path = (typeof window !== "undefined" && window.location && window.location.pathname)
      ? window.location.pathname.replace(/\\/g, "/")
      : "";
    if (path.includes("/pages/")) {
      const afterPages = path.substring(path.indexOf("/pages/") + 7);
      const depth = afterPages.split("/").length;
      const prefix = "../".repeat(depth);
      return `${prefix}pages/public/sign-in.html`;
    }
    return "pages/public/sign-in.html";
  }

  /**
   * Route Guard: Protect pages by requiring authentication & allowed roles
   */
  requireAuth(allowedRoles = [], fallbackUrl = null) {
    const session = this.getCurrentSession();
    const loginUrl = fallbackUrl || this.getSignInUrl();

    if (!session || !session.user) {
      console.warn("[AuthService] Akses ditolak: Sesi tidak ditemukan. Mengalihkan ke login...");
      window.location.href = loginUrl;
      return null;
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(session.role)) {
      console.warn(`[AuthService] Akses dibatasi untuk role ${session.role}. Mengalihkan ke halaman yang diizinkan...`);
      const userHome = this.getHomeRouteForRole(session.role);
      const isInsidePages = typeof window !== "undefined" && window.location.pathname.includes("/pages/");
      window.location.href = isInsidePages && userHome.startsWith("pages/") ? `../../${userHome}` : userHome;
      return null;
    }

    return session;
  }

  /**
   * Log out active session (supports both logout and signOut)
   */
  logout() {
    storageService.remove(this.SESSION_KEY);
    window.location.href = this.getSignInUrl();
    return true;
  }

  signOut() {
    return this.logout();
  }

  /**
   * Create a new Admin/Owner or Staff account (Super Admin action)
   */
  createUserAccount(userData) {
    if (!userData.email || !userData.name) {
      return { success: false, error: "Please provide full name and valid email." };
    }

    const cleanEmail = userData.email.trim().toLowerCase();
    const users = this.getUsers();

    if (users.some((u) => u.email.toLowerCase() === cleanEmail)) {
      return { success: false, error: `An account with email '${cleanEmail}' already exists.` };
    }

    const newUser = {
      id: `usr-${userData.role ? userData.role.toLowerCase() : "owner"}-${Date.now().toString().slice(-6)}`,
      name: userData.name.trim(),
      email: cleanEmail,
      phone: userData.phone?.trim() || "+65 8000 0000",
      password: userData.password?.trim() || "cliniva2026",
      role: userData.role || USER_ROLES.OWNER,
      title: userData.title || (userData.role === USER_ROLES.OWNER ? "Clinic Partner & Owner" : "Clinic Staff"),
      specialty: userData.specialty || null,
      room: userData.room || null,
      status: userData.status || "ON_DUTY",
      branchId: userData.branchId || null,
      branchName: userData.branchName || "Pending Setup",
      brandName: userData.brandName || null,
      brandLogo: userData.brandLogo || "💼",
      region: userData.region || "sg",
      avatar: userData.avatar || (userData.role === USER_ROLES.OWNER ? "💼" : "👤"),
      onboardingCompleted: userData.onboardingCompleted ?? false,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    this.saveUsers(users);

    if (notificationService && typeof notificationService.addSystemNotification === "function") {
      notificationService.addSystemNotification({
        title: "New Account Provisioned",
        message: `Account created for ${newUser.name} (${newUser.email}).`,
        category: "AUDIT",
        type: "info"
      });
    }

    return { success: true, user: newUser };
  }

  /**
   * Alias for createUserAccount
   */
  createUser(userData) {
    return this.createUserAccount(userData);
  }

  /**
   * Delete user account by ID (Cannot delete currently active user)
   */
  deleteUserAccount(userId) {
    const current = this.getCurrentUser();
    if (current && current.id === userId) {
      return { success: false, error: "You cannot delete your own active account." };
    }

    let users = this.getUsers();
    const target = users.find((u) => u.id === userId);
    if (!target) {
      return { success: false, error: "User account not found." };
    }

    users = users.filter((u) => u.id !== userId);
    this.saveUsers(users);

    if (notificationService && typeof notificationService.addSystemNotification === "function") {
      notificationService.addSystemNotification({
        title: "User Account Removed",
        message: `Account for ${target.name} (${target.email}) was removed from the registry.`,
        category: "AUDIT",
        type: "warning"
      });
    }

    return { success: true };
  }

  /**
   * Complete Setup Wizard Onboarding for a User
   */
  completeUserOnboarding(userId, onboardingData) {
    const users = this.getUsers();
    const userIndex = users.findIndex((u) => u.id === userId);
    if (userIndex === -1) {
      return { success: false, error: "Target user not found." };
    }

    const user = users[userIndex];
    user.onboardingCompleted = true;
    if (onboardingData.brandName) user.brandName = onboardingData.brandName;
    if (onboardingData.brandLogo) user.brandLogo = onboardingData.brandLogo;
    if (onboardingData.brandTagline) user.brandTagline = onboardingData.brandTagline;
    if (onboardingData.activeTemplate) user.activeTemplate = onboardingData.activeTemplate;
    if (onboardingData.branchId) user.branchId = onboardingData.branchId;
    if (onboardingData.branchName) user.branchName = onboardingData.branchName;
    if (onboardingData.ownerName) user.name = onboardingData.ownerName;

    users[userIndex] = user;
    this.saveUsers(users);

    // Update active session if matching
    const currentSession = this.getCurrentSession();
    if (currentSession && currentSession.user && currentSession.user.id === userId) {
      currentSession.user = {
        ...currentSession.user,
        name: user.name,
        brandName: user.brandName,
        brandLogo: user.brandLogo,
        branchId: user.branchId,
        branchName: user.branchName,
        activeTemplate: user.activeTemplate,
        onboardingCompleted: true
      };
      storageService.set(this.SESSION_KEY, currentSession);
    }

    if (notificationService && typeof notificationService.addSystemNotification === "function") {
      notificationService.addSystemNotification({
        title: "Clinic Onboarding Completed",
        message: `${user.brandName || user.name} completed setup for branch: ${user.branchName}.`,
        category: "SYSTEM",
        type: "success"
      });
    }

    return { success: true, user };
  }

  /**
   * Simulate login as any user in the registry (Super Admin testing convenience)
   */
  simulateLoginAsUser(userId) {
    const users = this.getUsers();
    const user = users.find((u) => u.id === userId);
    if (!user) {
      return { success: false, error: "User not found in registry." };
    }

    const targetRoute = this.getHomeRouteForUser(user);

    const session = {
      type: user.role === USER_ROLES.USER ? "PATIENT" : "STAFF",
      role: user.role,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        title: user.title,
        specialty: user.specialty || null,
        room: user.room || null,
        branchId: user.branchId,
        branchName: user.branchName,
        brandName: user.brandName || null,
        brandLogo: user.brandLogo || null,
        activeTemplate: user.activeTemplate || null,
        region: user.region || "sg",
        avatar: user.avatar,
        onboardingCompleted: user.onboardingCompleted !== false
      },
      targetRoute,
      loggedInAt: new Date().toISOString()
    };

    storageService.set(this.SESSION_KEY, session);
    return { success: true, session, targetRoute };
  }
}

export const authService = new AuthService();
export { USER_ROLES, ROLE_CONFIG, REGISTERED_USERS };

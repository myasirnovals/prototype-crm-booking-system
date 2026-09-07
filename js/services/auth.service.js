/**
 * Cliniva — Authentication & Role-Based Access Control (RBAC) Service
 * SOLID: Single Responsibility Principle for Authentication, Session Lifecycle & Route Guards
 */

import { USER_ROLES, ROLE_CONFIG, REGISTERED_USERS } from "../config/role-routes.js";
import { storageService } from "./storage.service.js";
import { notificationService } from "./notification.service.js";

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
    const stored = storageService.get(this.USERS_STORAGE_KEY, null);
    if (stored && Array.isArray(stored) && stored.length > 0) {
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
   * Authenticate user with Email / Identifier & Password
   */
  loginWithCredentials(identifier, password, preferredRole = null, region = "sg") {
    if (!identifier || !password) {
      return { success: false, error: "Please enter your email/contact and password." };
    }

    const cleanIdentifier = identifier.trim().toLowerCase();
    const users = this.getUsers();

    // Find registered user in dynamic registry
    let user = users.find((u) => 
      u.email.toLowerCase() === cleanIdentifier || 
      u.phone.replace(/\s+/g, "") === cleanIdentifier.replace(/\s+/g, "")
    );

    // Fallback: If not found by email, match by preferredRole if provided
    if (!user && preferredRole) {
      user = users.find((u) => u.role === preferredRole);
    }

    // Verify password (demo accepts "cliniva2026" or user's custom updated password)
    if (!user || (password !== user.password && password !== "cliniva2026")) {
      return { 
        success: false, 
        error: "Invalid credentials. Please use your updated password, demo account, or password: cliniva2026" 
      };
    }

    const targetRoute = this.getHomeRouteForRole(user.role);

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
        region: user.region || region,
        avatar: user.avatar
      },
      targetRoute,
      loggedInAt: new Date().toISOString()
    };

    storageService.set(this.SESSION_KEY, session);
    return { success: true, session, targetRoute };
  }

  /**
   * Fast 1-Click Demo Login by Role Key (OWNER, PRACTITIONER, RECEPTIONIST, USER)
   */
  loginByRoleKey(roleKey) {
    const users = this.getUsers();
    const user = users.find((u) => u.role === roleKey);
    if (!user) {
      return { success: false, error: `Demo account for role ${roleKey} not found.` };
    }

    const targetRoute = this.getHomeRouteForRole(user.role);

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
        region: user.region || "sg",
        avatar: user.avatar
      },
      targetRoute,
      loggedInAt: new Date().toISOString()
    };

    storageService.set(this.SESSION_KEY, session);
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
    const defaultPatient = this.USERS.find((u) => u.role === USER_ROLES.USER);
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
   * Route Guard: Protect pages by requiring authentication & allowed roles
   */
  requireAuth(allowedRoles = [], fallbackUrl = "sign-in.html") {
    const session = this.getCurrentSession();

    if (!session || !session.user) {
      console.warn("[AuthService] Akses ditolak: Sesi tidak ditemukan. Mengalihkan ke login...");
      window.location.href = fallbackUrl;
      return null;
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(session.role)) {
      console.warn(`[AuthService] Akses dibatasi untuk role ${session.role}. Mengalihkan ke halaman yang diizinkan...`);
      const userHome = this.getHomeRouteForRole(session.role);
      window.location.href = userHome;
      return null;
    }

    return session;
  }

  /**
   * Log out active session (supports both logout and signOut)
   */
  logout() {
    storageService.remove(this.SESSION_KEY);
    window.location.href = "sign-in.html";
    return true;
  }

  signOut() {
    return this.logout();
  }
}

export const authService = new AuthService();
export { USER_ROLES, ROLE_CONFIG, REGISTERED_USERS };

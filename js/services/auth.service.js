/**
 * Cliniva — Authentication Service
 * SOLID: Single Responsibility for Role-Based Access Control & Patient OTP Verification
 */

import { DEMO_CREDENTIALS } from "../config/regional-config.js";
import { storageService } from "./storage.service.js";

class AuthService {
  constructor() {
    this.SESSION_KEY = "cliniva_auth_session";
    this.generatedOtp = DEMO_CREDENTIALS.patient.demoOtp;
  }

  getCurrentSession() {
    return storageService.get(this.SESSION_KEY, null);
  }

  isAuthenticated() {
    return Boolean(this.getCurrentSession());
  }

  /**
   * Authenticate Clinic Staff / Admin
   */
  loginStaff(email, password, role, region = "sg") {
    if (!email || !password) {
      return { success: false, error: "Please provide both work email and password." };
    }

    if (!email.includes("@")) {
      return { success: false, error: "Please enter a valid work email address." };
    }

    const session = {
      type: "STAFF",
      email,
      role,
      region,
      loggedInAt: new Date().toISOString()
    };

    storageService.set(this.SESSION_KEY, session);
    return { success: true, session };
  }

  /**
   * Generate & Send Patient OTP
   */
  requestPatientOtp(contact, channel, countryCode) {
    if (!contact) {
      return { success: false, error: "Please enter your phone number or email to receive OTP." };
    }

    // Demo fixed OTP for easy presentation
    this.generatedOtp = "123456";

    return {
      success: true,
      channel,
      contact: `${countryCode} ${contact}`,
      demoOtp: this.generatedOtp,
      message: `OTP sent via ${channel === "whatsapp" ? "WhatsApp" : "Email"} to ${countryCode} ${contact}.`
    };
  }

  /**
   * Verify Patient OTP
   */
  verifyPatientOtp(otp, consentAccepted, contact) {
    if (!otp || otp.length !== 6) {
      return { success: false, error: "Please enter the complete 6-digit OTP." };
    }

    if (otp !== this.generatedOtp) {
      return { success: false, error: "Invalid OTP. For this demo, please use 123456." };
    }

    if (!consentAccepted) {
      return { success: false, error: "Please accept communication consent before continuing." };
    }

    const session = {
      type: "PATIENT",
      contact,
      consentAccepted: true,
      loggedInAt: new Date().toISOString()
    };

    storageService.set(this.SESSION_KEY, session);
    return { success: true, session };
  }

  logout() {
    storageService.remove(this.SESSION_KEY);
    return true;
  }
}

export const authService = new AuthService();

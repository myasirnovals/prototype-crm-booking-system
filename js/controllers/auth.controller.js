/**
 * Cliniva — Auth Controller
 * SOLID: Single Responsibility for Sign-In Interactions, Quick Role Login & OTP Verification
 */

import { authService, USER_ROLES } from "../services/auth.service.js";
import { soundService } from "../services/sound.service.js";

export class AuthController {
  constructor() {
    this.modeButtons = document.querySelectorAll(".mode-btn");
    this.forms = document.querySelectorAll(".form");
    this.regionCards = document.querySelectorAll(".region-card");
    this.togglePasswordBtn = document.getElementById("togglePassword");
    this.staffPassword = document.getElementById("staffPassword");
    this.staffForm = document.getElementById("staffForm");
    this.staffStatus = document.getElementById("staffStatus");
    this.sendOtpBtn = document.getElementById("sendOtpBtn");
    this.otpArea = document.getElementById("otpArea");
    this.patientStatus = document.getElementById("patientStatus");
    this.patientForm = document.getElementById("patientForm");
    this.otpInputs = document.querySelectorAll(".otp-input");
    this.quickRoleCards = document.querySelectorAll(".demo-role-card");
    this.selectedRegion = "sg";
  }

  init() {
    this.setupModeSwitching();
    this.setupRegionSelection();
    this.setupPasswordToggle();
    this.setupStaffForm();
    this.setupOtpWorkflow();
    this.setupQuickDemoLogin();
  }

  setupModeSwitching() {
    this.modeButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const mode = button.dataset.mode;
        soundService.playClickTone();

        this.modeButtons.forEach((btn) => btn.classList.remove("active"));
        button.classList.add("active");

        this.forms.forEach((form) => form.classList.remove("active"));

        if (mode === "staff") {
          document.getElementById("staffForm")?.classList.add("active");
        } else {
          document.getElementById("patientForm")?.classList.add("active");
        }
      });
    });
  }

  setupRegionSelection() {
    this.regionCards.forEach((card) => {
      card.addEventListener("click", () => {
        this.regionCards.forEach((item) => item.classList.remove("active"));
        card.classList.add("active");
        this.selectedRegion = card.dataset.region || "sg";
        soundService.playClickTone();
      });
    });
  }

  setupPasswordToggle() {
    if (!this.togglePasswordBtn || !this.staffPassword) return;

    this.togglePasswordBtn.addEventListener("click", () => {
      const isPassword = this.staffPassword.type === "password";
      this.staffPassword.type = isPassword ? "text" : "password";
      this.togglePasswordBtn.textContent = isPassword ? "HIDE" : "SHOW";
    });
  }

  /**
   * 1-Click Fast Demo Login for all 4 roles
   */
  setupQuickDemoLogin() {
    this.quickRoleCards.forEach((card) => {
      card.addEventListener("click", () => {
        const roleKey = card.dataset.role;
        soundService.playQueueChime();

        card.style.transform = "scale(0.96)";
        setTimeout(() => (card.style.transform = ""), 200);

        const result = authService.loginByRoleKey(roleKey);
        if (!result.success) {
          alert(result.error);
          return;
        }

        const activeStatus = document.querySelector(".form.active .status-box") || this.staffStatus;
        if (activeStatus) {
          this.showSuccess(
            activeStatus,
            `⚡ Signed in as <strong>${result.session.user.name}</strong> (${result.session.user.title})! Redirecting to ${result.targetRoute}...`
          );
        }

        setTimeout(() => {
          window.location.href = result.targetRoute;
        }, 800);
      });
    });
  }

  setupStaffForm() {
    if (!this.staffForm) return;

    this.staffForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const email = document.getElementById("staffEmail")?.value.trim() || "";
      const password = document.getElementById("staffPassword")?.value.trim() || "";
      const role = document.getElementById("staffRole")?.value || null;

      this.resetStatus(this.staffStatus);

      const result = authService.loginWithCredentials(email, password, role, this.selectedRegion);

      if (!result.success) {
        this.showError(this.staffStatus, result.error);
        return;
      }

      soundService.playQueueChime();
      this.showSuccess(
        this.staffStatus,
        `✓ Success! Signed in as <strong>${result.session.user.name}</strong>. Redirecting to ${result.targetRoute}...`
      );

      setTimeout(() => {
        window.location.href = result.targetRoute;
      }, 900);
    });
  }

  setupOtpWorkflow() {
    if (!this.sendOtpBtn) return;

    this.sendOtpBtn.addEventListener("click", () => {
      const contact = document.getElementById("patientContact")?.value.trim() || "";
      const channel = document.getElementById("patientChannel")?.value || "whatsapp";
      const countryCode = document.getElementById("countryCode")?.value || "+65";

      this.resetStatus(this.patientStatus);

      const result = authService.requestPatientOtp(contact, channel, countryCode);

      if (!result.success) {
        this.showError(this.patientStatus, result.error);
        return;
      }

      soundService.playClickTone();
      if (this.otpArea) this.otpArea.style.display = "block";
      this.showSuccess(
        this.patientStatus,
        `${result.message} Demo verification code: <strong>${result.demoOtp}</strong>`
      );

      const firstOtp = this.otpInputs[0];
      if (firstOtp) firstOtp.focus();
    });

    // Auto advance between 6 OTP inputs
    this.otpInputs.forEach((input, index) => {
      input.addEventListener("input", () => {
        input.value = input.value.replace(/[^0-9]/g, "");

        if (input.value && index < this.otpInputs.length - 1) {
          this.otpInputs[index + 1].focus();
        }
      });

      input.addEventListener("keydown", (event) => {
        if (event.key === "Backspace" && !input.value && index > 0) {
          this.otpInputs[index - 1].focus();
        }
      });
    });

    if (!this.patientForm) return;

    this.patientForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const otp = Array.from(this.otpInputs).map((input) => input.value).join("");
      const consent = document.getElementById("consentCheck")?.checked;
      const contact = document.getElementById("patientContact")?.value || "";

      this.resetStatus(this.patientStatus);

      const result = authService.verifyPatientOtp(otp, consent, contact);

      if (!result.success) {
        this.showError(this.patientStatus, result.error);
        return;
      }

      soundService.playQueueChime();
      this.showSuccess(
        this.patientStatus,
        `✓ OTP verified! Signed in as <strong>${result.session.user.name}</strong>. Redirecting to Patient Portal...`
      );

      setTimeout(() => {
        window.location.href = result.targetRoute;
      }, 900);
    });
  }

  resetStatus(elem) {
    if (!elem) return;
    elem.className = "status-box";
    elem.innerHTML = "";
  }

  showError(elem, message) {
    if (!elem) return;
    elem.className = "status-box error";
    elem.innerHTML = message;
  }

  showSuccess(elem, message) {
    if (!elem) return;
    elem.className = "status-box success";
    elem.innerHTML = message;
  }
}

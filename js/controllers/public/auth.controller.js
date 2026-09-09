/**
 * Cliniva — Auth Controller
 * SOLID: Single Responsibility for Sign-In Interactions, Quick Role Login & OTP Verification
 */

import { authService, USER_ROLES } from "../../services/auth.service.js";
import { soundService } from "../../services/sound.service.js";
import { isSupabaseConfigured, getActiveSupabaseConfig, setSupabaseCredentials } from "../../config/supabase.js";

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

    // Reset Password Modal Elements
    this.forgotPasswordBtn = document.getElementById("forgotPasswordBtn");
    this.resetModal = document.getElementById("resetPasswordModal");
    this.closeResetModalBtn = document.getElementById("closeResetModalBtn");
    this.cancelResetBtn = document.getElementById("cancelResetBtn");
    this.resetForm = document.getElementById("resetPasswordForm");
    this.resetIdentifier = document.getElementById("resetIdentifier");
    this.resetNewPassword = document.getElementById("resetNewPassword");
    this.resetConfirmPassword = document.getElementById("resetConfirmPassword");
    this.toggleResetPasswordBtn = document.getElementById("toggleResetPassword");
    this.resetStatusBox = document.getElementById("resetPasswordStatus");
  }

  init() {
    this.setupModeSwitching();
    this.setupRegionSelection();
    this.setupPasswordToggle();
    this.setupStaffForm();
    this.setupForgotPasswordModal();
    this.setupOtpWorkflow();
    this.setupQuickDemoLogin();
    this.setupCloudModal();
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
      card.addEventListener("click", async () => {
        const roleKey = card.dataset.role;
        const userEmail = card.dataset.userEmail;
        soundService.playQueueChime?.();

        card.style.transform = "scale(0.96)";
        setTimeout(() => (card.style.transform = ""), 200);

        const activeStatus = document.querySelector(".form.active .status-box") || this.staffStatus;
        if (activeStatus) {
          this.showSuccess(activeStatus, `⏳ Sedang memproses login...`);
        }

        try {
          let result;
          if (userEmail) {
            result = await authService.loginWithCredentials(userEmail, "cliniva2026");
          } else {
            result = await authService.loginByRoleKey(roleKey);
          }

          if (!result || !result.success) {
            const errMsg = result?.error || "Gagal melakukan demo login.";
            if (activeStatus) this.showError(activeStatus, errMsg);
            else alert(errMsg);
            return;
          }

          if (activeStatus) {
            this.showSuccess(
              activeStatus,
              `⚡ Signed in as <strong>${result.session.user.name}</strong> (${result.session.user.title})! Redirecting to ${result.targetRoute}...`
            );
          }

          setTimeout(() => {
            window.location.href = this.resolveRedirect(result.targetRoute);
          }, 700);
        } catch (err) {
          console.error("[AuthController] Quick demo login error:", err);
          if (activeStatus) {
            this.showError(activeStatus, `Terjadi kesalahan saat masuk: ${err.message || err}`);
          } else {
            alert(`Terjadi kesalahan saat masuk: ${err.message || err}`);
          }
        }
      });
    });
  }

  setupStaffForm() {
    if (!this.staffForm) return;

    const staffRoleSelect = document.getElementById("staffRole");
    const staffEmailInput = document.getElementById("staffEmail");

    if (staffRoleSelect && staffEmailInput) {
      staffRoleSelect.addEventListener("change", () => {
        const role = staffRoleSelect.value;
        if (role === USER_ROLES.OWNER) {
          staffEmailInput.value = "dennis@cliniva.com";
        } else if (role === USER_ROLES.SUPER_ADMIN) {
          staffEmailInput.value = "owner@cliniva.com";
        } else if (role === USER_ROLES.PRACTITIONER) {
          staffEmailInput.value = "dr.lim@orchardclinic.sg";
        } else if (
          role === USER_ROLES.BRANCH_ADMIN ||
          role === "BRANCH_ADMIN" ||
          role === "BRANCH_MANAGER" ||
          role === "RECEPTIONIST"
        ) {
          staffEmailInput.value = "reception@orchardclinic.sg";
        }
      });
    }

    // Quick action buttons (WhatsApp OTP & Email Magic Link)
    const quickActionBtns = document.querySelectorAll(".quick-actions .btn");
    quickActionBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        soundService.playClickTone?.();
        const patientTab = document.querySelector('.mode-btn[data-mode="patient"]');
        if (patientTab) patientTab.click();

        const channelSelect = document.getElementById("patientChannel");
        if (channelSelect) {
          if (btn.textContent.includes("WhatsApp")) {
            channelSelect.value = "whatsapp";
          } else if (btn.textContent.includes("Email")) {
            channelSelect.value = "email";
          }
        }
      });
    });

    this.staffForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const email = document.getElementById("staffEmail")?.value.trim() || "";
      const password = document.getElementById("staffPassword")?.value.trim() || "";
      const role = document.getElementById("staffRole")?.value || null;

      this.resetStatus(this.staffStatus);
      this.showSuccess(this.staffStatus, "⏳ Memverifikasi akun...");

      try {
        const result = await authService.loginWithCredentials(email, password, role, this.selectedRegion);

        if (!result || !result.success) {
          this.showError(this.staffStatus, result?.error || "Gagal masuk.");
          return;
        }

        soundService.playQueueChime?.();
        this.showSuccess(
          this.staffStatus,
          `✓ Success! Signed in as <strong>${result.session.user.name}</strong>. Redirecting to ${result.targetRoute}...`
        );

        setTimeout(() => {
          window.location.href = this.resolveRedirect(result.targetRoute);
        }, 800);
      } catch (err) {
        console.error("[AuthController] Staff submit error:", err);
        this.showError(this.staffStatus, `Gagal masuk: ${err.message || err}`);
      }
    });
  }

  /**
   * In-App Reset Password Workflow (Direct without external SMTP email)
   */
  setupForgotPasswordModal() {
    if (!this.forgotPasswordBtn || !this.resetModal) return;

    const openModal = () => {
      soundService.playClickTone();
      const currentEmail = document.getElementById("staffEmail")?.value.trim() || "";
      if (this.resetIdentifier && currentEmail) {
        this.resetIdentifier.value = currentEmail;
      }
      if (this.resetNewPassword) this.resetNewPassword.value = "";
      if (this.resetConfirmPassword) this.resetConfirmPassword.value = "";
      this.resetStatus(this.resetStatusBox);

      this.resetModal.style.display = "flex";
      this.resetModal.setAttribute("aria-hidden", "false");
      if (this.resetNewPassword) {
        setTimeout(() => this.resetNewPassword.focus(), 60);
      }
    };

    const closeModal = () => {
      soundService.playClickTone();
      this.resetModal.style.display = "none";
      this.resetModal.setAttribute("aria-hidden", "true");
    };

    this.forgotPasswordBtn.addEventListener("click", openModal);
    this.closeResetModalBtn?.addEventListener("click", closeModal);
    this.cancelResetBtn?.addEventListener("click", closeModal);

    // Close when clicking outside modal card
    this.resetModal.addEventListener("click", (e) => {
      if (e.target === this.resetModal) {
        closeModal();
      }
    });

    // Close on ESC key
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.resetModal.style.display === "flex") {
        closeModal();
      }
    });

    // Toggle reset password visibility
    if (this.toggleResetPasswordBtn && this.resetNewPassword) {
      this.toggleResetPasswordBtn.addEventListener("click", () => {
        const isPassword = this.resetNewPassword.type === "password";
        this.resetNewPassword.type = isPassword ? "text" : "password";
        if (this.resetConfirmPassword) {
          this.resetConfirmPassword.type = isPassword ? "text" : "password";
        }
        this.toggleResetPasswordBtn.textContent = isPassword ? "HIDE" : "SHOW";
      });
    }

    // Submit reset password form
    if (this.resetForm) {
      this.resetForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const identifier = this.resetIdentifier?.value.trim() || "";
        const newPassword = this.resetNewPassword?.value.trim() || "";
        const confirmPassword = this.resetConfirmPassword?.value.trim() || "";

        this.resetStatus(this.resetStatusBox);

        const result = authService.resetPassword(identifier, newPassword, confirmPassword);

        if (!result.success) {
          this.showError(this.resetStatusBox, result.error);
          return;
        }

        soundService.playQueueChime();
        this.showSuccess(
          this.resetStatusBox,
          `✓ ${result.message}`
        );

        // Auto-update staff password input on main sign-in form
        if (this.staffPassword) {
          this.staffPassword.value = newPassword;
        }

        // Close modal after brief feedback and update main form status
        setTimeout(() => {
          this.resetModal.style.display = "none";
          this.resetModal.setAttribute("aria-hidden", "true");
          this.showSuccess(
            this.staffStatus,
            `🔑 Password untuk <strong>${result.user.name}</strong> berhasil diperbarui. Silakan klik <strong>Sign In to Dashboard →</strong>.`
          );
        }, 1300);
      });
    }
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
        window.location.href = this.resolveRedirect(result.targetRoute);
      }, 900);
    });
  }

  resolveRedirect(targetRoute) {
    if (!targetRoute) return "../../index.html";
    if (window.location.pathname.includes("/pages/")) {
      return targetRoute.startsWith("pages/") ? `../../${targetRoute}` : targetRoute;
    }
    return targetRoute;
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

  // ─────────────────────────────────────────────────────────────────────────
  // SUPABASE CLOUD BACKEND CONFIGURATION MODAL
  // ─────────────────────────────────────────────────────────────────────────

  setupCloudModal() {
    const banner = document.getElementById("cloudStatusBanner");
    const dot = document.getElementById("cloudStatusDot");
    const text = document.getElementById("cloudStatusText");
    const openBtn = document.getElementById("btnOpenCloudModal");
    const modal = document.getElementById("cloudConfigModal");
    const closeBtn = document.getElementById("btnCloseCloudModal");
    const cancelBtn = document.getElementById("btnCancelCloudModal");
    const saveBtn = document.getElementById("btnSaveCloudModal");
    const disconnectBtn = document.getElementById("btnDisconnectCloud");
    const urlInput = document.getElementById("inputSupabaseUrl");
    const keyInput = document.getElementById("inputSupabaseKey");
    const statusBox = document.getElementById("cloudModalStatus");

    if (!modal) return;

    const updateStatusDisplay = () => {
      const isCloud = isSupabaseConfigured();
      if (isCloud) {
        if (dot) dot.style.background = "#10b981"; // Emerald green
        if (text) text.innerHTML = "Mode: <strong style='color:#059669;'>Supabase Cloud Aktif</strong> (PostgreSQL + Realtime)";
      } else {
        if (dot) dot.style.background = "#f59e0b"; // Amber
        if (text) text.innerHTML = "Mode: <span style='color:#b45309;'>Local Storage (Demo Offline)</span>";
      }
    };

    updateStatusDisplay();

    const openModal = () => {
      soundService.playClickTone?.();
      const cfg = getActiveSupabaseConfig();
      if (urlInput) urlInput.value = cfg.url || "";
      if (keyInput) keyInput.value = cfg.anonKey || "";
      if (statusBox) statusBox.style.display = "none";
      modal.style.display = "flex";
    };

    const closeModal = () => {
      soundService.playClickTone?.();
      modal.style.display = "none";
    };

    openBtn?.addEventListener("click", openModal);
    closeBtn?.addEventListener("click", closeModal);
    cancelBtn?.addEventListener("click", closeModal);

    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeModal();
    });

    saveBtn?.addEventListener("click", () => {
      const url = urlInput?.value.trim() || "";
      const key = keyInput?.value.trim() || "";

      if (!url || !key) {
        if (statusBox) {
          statusBox.style.display = "block";
          statusBox.style.color = "#ef4444";
          statusBox.textContent = "Mohon isi Project URL dan Anon Key dengan lengkap.";
        }
        return;
      }

      setSupabaseCredentials(url, key);
      soundService.playSuccessChime?.();
      if (statusBox) {
        statusBox.style.display = "block";
        statusBox.style.color = "#059669";
        statusBox.textContent = "✓ Kredensial tersimpan! Memuat ulang sistem...";
      }

      setTimeout(() => {
        window.location.reload();
      }, 700);
    });

    disconnectBtn?.addEventListener("click", () => {
      if (confirm("Putuskan koneksi Supabase dan kembali ke Local Storage mode?")) {
        setSupabaseCredentials("", "");
        soundService.playClickTone?.();
        window.location.reload();
      }
    });
  }
}

/**
 * Cliniva Component — Edit User Profile Modal (Textual Update)
 * SOLID: Single Responsibility for Staff Textual Profile Updating & UI Synchronization
 */

import { authService } from "../services/auth.service.js";
import { soundService } from "../services/sound.service.js";

export class ProfileModalComponent {
  constructor() {
    this.modalId = "editProfileModal";
    this.modal = null;
    this.currentUser = null;

    this.onDocumentClick = this.handleDocumentClick.bind(this);
    this.onKeyDown = this.handleKeyDown.bind(this);
  }

  mount() {
    this.injectModalMarkup();
    this.bindEvents();
    return true;
  }

  injectModalMarkup() {
    if (document.getElementById(this.modalId)) {
      this.modal = document.getElementById(this.modalId);
      this.modal.style.display = "none";
      this.modal.classList.remove("open");
      return;
    }

    const modalEl = document.createElement("div");
    modalEl.id = this.modalId;
    modalEl.className = "auth-modal-backdrop";
    modalEl.style.display = "none";
    modalEl.setAttribute("aria-hidden", "true");

    modalEl.innerHTML = `
      <div class="auth-modal-card profile-modal-card" role="dialog" aria-labelledby="profileModalTitle">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:16px;">
          <div style="display:flex; align-items:center; gap:10px;">
            <span style="font-size:24px;">👤</span>
            <div>
              <h3 id="profileModalTitle" style="margin:0; font-size:18px; font-weight:900; color:var(--text);">Edit Staff Profile</h3>
              <p style="margin:2px 0 0; font-size:12px; color:var(--muted);">Update textual profile & operational station info</p>
            </div>
          </div>
          <button type="button" class="auth-modal-close" id="closeProfileModalBtn" aria-label="Close" style="cursor:pointer; position:relative; z-index:10;">&times;</button>
        </div>

        <!-- Policy Alert: Strictly textual, no photo upload as instructed by Mentor -->
        <div class="profile-policy-alert" style="background:#f0fdfa; border:1px solid #ccfbf1; border-radius:var(--radius-sm); padding:10px 14px; margin-bottom:18px; display:flex; gap:10px; align-items:center;">
          <span style="font-size:18px;">ℹ️</span>
          <div style="font-size:11px; color:var(--primary-dark); line-height:1.45;">
            <strong>Clinic IT Policy:</strong> Profile photos and access privileges are centrally provisioned by the Super Admin. You can update your contact numbers, title, and room assignment below.
          </div>
        </div>

        <form id="editProfileForm" onsubmit="return false;" style="display:flex; flex-direction:column; gap:14px;">
          <div>
            <label for="editProfileName" style="display:block; font-size:12px; font-weight:800; color:var(--text); margin-bottom:5px;">Full Name *</label>
            <input type="text" id="editProfileName" class="form-input" style="width:100%; box-sizing:border-box; padding:10px 12px; font-size:13px; font-weight:600; border-radius:var(--radius-sm); border:1px solid var(--line);" required>
          </div>

          <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
            <div>
              <label for="editProfileTitle" style="display:block; font-size:12px; font-weight:800; color:var(--text); margin-bottom:5px;">Professional Title / Role</label>
              <input type="text" id="editProfileTitle" class="form-input" style="width:100%; box-sizing:border-box; padding:10px 12px; font-size:13px; font-weight:600; border-radius:var(--radius-sm); border:1px solid var(--line);">
            </div>
            <div>
              <label for="editProfileRoom" style="display:block; font-size:12px; font-weight:800; color:var(--text); margin-bottom:5px;">Practice Room / Counter</label>
              <input type="text" id="editProfileRoom" class="form-input" placeholder="e.g. Room A2, Counter 1" style="width:100%; box-sizing:border-box; padding:10px 12px; font-size:13px; font-weight:600; border-radius:var(--radius-sm); border:1px solid var(--line);">
            </div>
          </div>

          <div id="editProfileSpecialtyGroup">
            <label for="editProfileSpecialty" style="display:block; font-size:12px; font-weight:800; color:var(--text); margin-bottom:5px;">Clinical Specialty / Focus</label>
            <input type="text" id="editProfileSpecialty" class="form-input" placeholder="e.g. Musculoskeletal Physiotherapy" style="width:100%; box-sizing:border-box; padding:10px 12px; font-size:13px; font-weight:600; border-radius:var(--radius-sm); border:1px solid var(--line);">
          </div>

          <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
            <div>
              <label for="editProfilePhone" style="display:block; font-size:12px; font-weight:800; color:var(--text); margin-bottom:5px;">WhatsApp Number</label>
              <input type="text" id="editProfilePhone" class="form-input" placeholder="+65 9123 4567" style="width:100%; box-sizing:border-box; padding:10px 12px; font-size:13px; font-weight:600; border-radius:var(--radius-sm); border:1px solid var(--line);">
            </div>
            <div>
              <label for="editProfileEmail" style="display:block; font-size:12px; font-weight:800; color:var(--muted); margin-bottom:5px;">Work Email 🔒</label>
              <input type="email" id="editProfileEmail" class="form-input" style="width:100%; box-sizing:border-box; padding:10px 12px; font-size:13px; background:#f8fafc; color:#64748b; border:1px solid var(--line); cursor:not-allowed;" disabled>
            </div>
          </div>

          <div id="editProfileStatus" style="display:none; padding:10px 12px; border-radius:var(--radius-sm); font-size:12px; font-weight:700;"></div>

          <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:8px;">
            <button type="button" class="btn btn-sm btn-white" id="cancelProfileBtn" style="font-weight:700; cursor:pointer; position:relative; z-index:10;">Cancel</button>
            <button type="button" class="btn btn-sm btn-primary" id="saveProfileBtn" style="font-weight:800; cursor:pointer; position:relative; z-index:10;">
              💾 Save Changes
            </button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(modalEl);
    this.modal = modalEl;
  }

  bindEvents() {
    const closeBtn = document.getElementById("closeProfileModalBtn");
    const cancelBtn = document.getElementById("cancelProfileBtn");
    const saveBtn = document.getElementById("saveProfileBtn");

    if (closeBtn) {
      closeBtn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.close();
      };
      closeBtn.addEventListener("click", () => this.close());
    }

    if (cancelBtn) {
      cancelBtn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.close();
      };
      cancelBtn.addEventListener("click", () => this.close());
    }

    if (saveBtn) {
      saveBtn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.save();
      };
      saveBtn.addEventListener("click", () => this.save());
    }

    // Connect trigger buttons in header directly
    const triggers = document.querySelectorAll(".profile-edit-trigger, #editProfileBtn");
    triggers.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        soundService.playClickTone();
        this.open();
      });
    });

    // Global document event delegation for any edit button
    document.addEventListener("click", (e) => {
      const trigger = e.target.closest && e.target.closest(".profile-edit-trigger, #editProfileBtn");
      if (trigger) {
        e.preventDefault();
        e.stopPropagation();
        soundService.playClickTone();
        this.open();
      }
    });

    // Close on outside backdrop click
    if (this.modal) {
      this.modal.addEventListener("click", this.onDocumentClick);
    }
    document.addEventListener("keydown", this.onKeyDown);
  }

  open(customUser = null) {
    let user = customUser;
    if (!user) {
      const session = authService.getCurrentSession();
      if (session && session.user) {
        user = session.user;
      } else {
        const path = (typeof window !== "undefined" && window.location ? window.location.pathname : "").toLowerCase();
        let role = "PRACTITIONER";
        if (path.includes("owner")) role = "OWNER";
        else if (path.includes("receptionist")) role = "RECEPTIONIST";

        const users = authService.getUsers();
        user = users.find((u) => u.role === role) || users[0];
      }
    }

    this.currentUser = user;
    if (!this.currentUser) {
      console.warn("[ProfileModalComponent] No active user session found.");
      return;
    }

    this.populateFields(this.currentUser);

    const statusEl = document.getElementById("editProfileStatus");
    if (statusEl) {
      statusEl.style.display = "none";
      statusEl.textContent = "";
    }

    if (this.modal) {
      this.modal.style.display = "flex";
      this.modal.classList.add("open");
      this.modal.setAttribute("aria-hidden", "false");
    }

    const nameInput = document.getElementById("editProfileName");
    if (nameInput) {
      setTimeout(() => nameInput.focus(), 80);
    }
  }

  populateFields(user) {
    if (!user) return;
    const nameEl = document.getElementById("editProfileName");
    const titleEl = document.getElementById("editProfileTitle");
    const specialtyEl = document.getElementById("editProfileSpecialty");
    const roomEl = document.getElementById("editProfileRoom");
    const phoneEl = document.getElementById("editProfilePhone");
    const emailEl = document.getElementById("editProfileEmail");

    if (nameEl) nameEl.value = user.name || "";
    if (titleEl) titleEl.value = user.title || user.specialty || "";
    if (specialtyEl) specialtyEl.value = user.specialty || "";
    if (roomEl) roomEl.value = user.room || "";
    if (phoneEl) phoneEl.value = user.phone || "";
    if (emailEl) emailEl.value = user.email || "";
  }

  close() {
    soundService.playClickTone();
    if (this.modal) {
      this.modal.style.display = "none";
      this.modal.classList.remove("open");
      this.modal.setAttribute("aria-hidden", "true");
    }
    const statusEl = document.getElementById("editProfileStatus");
    if (statusEl) {
      statusEl.style.display = "none";
      statusEl.textContent = "";
    }
  }

  handleDocumentClick(e) {
    if (e.target === this.modal) {
      this.close();
    }
  }

  handleKeyDown(e) {
    if (e.key === "Escape" && this.modal && (this.modal.classList.contains("open") || this.modal.style.display === "flex")) {
      this.close();
    }
  }

  save() {
    if (!this.currentUser) {
      const session = authService.getCurrentSession();
      if (session && session.user) {
        this.currentUser = session.user;
      } else {
        const path = (typeof window !== "undefined" && window.location ? window.location.pathname : "").toLowerCase();
        let role = "PRACTITIONER";
        if (path.includes("owner")) role = "OWNER";
        else if (path.includes("receptionist")) role = "RECEPTIONIST";

        const users = authService.getUsers();
        this.currentUser = users.find((u) => u.role === role) || users[0];
      }
    }

    if (!this.currentUser) return;

    const nameInput = document.getElementById("editProfileName");
    const titleInput = document.getElementById("editProfileTitle");
    const specialtyInput = document.getElementById("editProfileSpecialty");
    const roomInput = document.getElementById("editProfileRoom");
    const phoneInput = document.getElementById("editProfilePhone");
    const statusEl = document.getElementById("editProfileStatus");

    const nameVal = nameInput?.value.trim();
    if (!nameVal || nameVal.length < 3) {
      if (statusEl) {
        statusEl.style.display = "block";
        statusEl.style.background = "#fee2e2";
        statusEl.style.color = "#b91c1c";
        statusEl.textContent = "Please enter a valid full name (minimum 3 characters).";
      }
      return;
    }

    const profileData = {
      name: nameVal,
      title: titleInput?.value.trim() || "",
      specialty: specialtyInput?.value.trim() || "",
      room: roomInput?.value.trim() || "",
      phone: phoneInput?.value.trim() || ""
    };

    const res = authService.updateUserProfile(this.currentUser.id, profileData);

    if (res.success) {
      soundService.playSuccessChime();
      this.currentUser = res.user;

      // Live update DOM topbar elements across pages
      this.updateHeaderUI(res.user);

      if (statusEl) {
        statusEl.style.display = "block";
        statusEl.style.background = "#dcfce7";
        statusEl.style.color = "#15803d";
        statusEl.textContent = "✓ Profile updated successfully! Changes applied immediately.";
      }

      // Broadcast event for live UI reactivity
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("cliniva:userProfileUpdated", {
          detail: res.user
        }));
      }

      setTimeout(() => {
        this.close();
      }, 700);
    } else {
      if (statusEl) {
        statusEl.style.display = "block";
        statusEl.style.background = "#fee2e2";
        statusEl.style.color = "#b91c1c";
        statusEl.textContent = res.error || "Failed to update profile.";
      }
    }
  }

  updateHeaderUI(user) {
    // 1. Doctor / Practitioner Dashboard
    const docName = document.getElementById("doctorUserName");
    const docTitle = document.getElementById("doctorUserTitle");
    const docRoom = document.getElementById("doctorUserRoom");
    if (docName) docName.textContent = user.name;
    if (docTitle) docTitle.textContent = user.title || user.specialty || "Practitioner";
    if (docRoom) docRoom.textContent = `📍 ${user.room || "Consultation Room"}`;

    // 2. Receptionist Dashboard
    const recName = document.getElementById("adminStaffName");
    if (recName) recName.textContent = user.name;

    // 3. Owner Dashboard
    const ownerName = document.getElementById("ownerUserName");
    const ownerRole = document.getElementById("ownerUserRole");
    if (ownerName) ownerName.textContent = user.name;
    if (ownerRole && user.title) ownerRole.textContent = user.title;
  }
}

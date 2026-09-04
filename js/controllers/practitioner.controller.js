/**
 * Cliniva — Practitioner / Doctor Workspace Controller
 * SOLID: Single Responsibility for Doctor Schedule, Patient Queue Calling & Body Pain Map
 */

import { authService, USER_ROLES } from "../services/auth.service.js";
import { soundService } from "../services/sound.service.js";

export class PractitionerController {
  constructor() {
    this.sessionCards = document.querySelectorAll(".patient-session-card");
    this.callQueueBtn = document.getElementById("doctorCallQueueBtn");
    this.callingBanner = document.getElementById("doctorCallingBanner");
    this.statusSelect = document.getElementById("sessionStatusSelect");
    this.currentPatientName = document.getElementById("currentPatientName");
    this.currentQueueBadge = document.getElementById("currentQueueBadge");
    this.intakeChiefComplaint = document.getElementById("intakeChiefComplaint");
    this.intakePainScale = document.getElementById("intakePainScale");
    this.intakeDuration = document.getElementById("intakeDuration");
    this.painMarkers = document.querySelectorAll(".pain-marker");
    this.signOutBtn = document.getElementById("doctorSignOutBtn");

    this.activePatient = {
      queueNo: "A-01",
      name: "Amanda Tan",
      service: "Fisioterapi & Postural Rehabilitation",
      complaint: "Nyeri tajam pada pinggang bawah (L4-L5) saat membungkuk setelah cedera olahraga lari maraton.",
      painScale: "7 / 10 (Nyeri Sedang-Berat)",
      duration: "3 minggu terakhir",
      activeMarker: "marker-lumbar",
      status: "IN_PROGRESS"
    };
  }

  init() {
    // Session Guard: Verify user has PRACTITIONER role
    const session = authService.requireAuth([USER_ROLES.PRACTITIONER]);
    if (!session) return;

    this.renderUserInfo(session.user);
    this.setupPatientSelection();
    this.setupQueueCalling();
    this.setupStatusUpdates();
    this.setupPainMapInteractions();
    this.setupSignOut();
  }

  renderUserInfo(user) {
    const nameEl = document.getElementById("doctorUserName");
    const titleEl = document.getElementById("doctorUserTitle");
    const roomEl = document.getElementById("doctorUserRoom");
    if (nameEl) nameEl.textContent = user.name;
    if (titleEl) titleEl.textContent = user.specialty || user.title;
    if (roomEl) roomEl.textContent = `📍 ${user.room || "Room A2 (Physio Suite)"}`;
  }

  setupPatientSelection() {
    this.sessionCards.forEach((card) => {
      card.addEventListener("click", () => {
        soundService.playClickTone();
        this.sessionCards.forEach((c) => c.classList.remove("active"));
        card.classList.add("active");

        const queueNo = card.dataset.queue;
        const name = card.dataset.name;
        const complaint = card.dataset.complaint;
        const painScale = card.dataset.pain;
        const markerId = card.dataset.marker;

        this.activePatient.queueNo = queueNo;
        this.activePatient.name = name;
        this.activePatient.complaint = complaint;
        this.activePatient.painScale = painScale;
        this.activePatient.activeMarker = markerId;

        // Update View
        if (this.currentPatientName) this.currentPatientName.textContent = name;
        if (this.currentQueueBadge) this.currentQueueBadge.textContent = queueNo;
        if (this.intakeChiefComplaint) this.intakeChiefComplaint.textContent = complaint;
        if (this.intakePainScale) this.intakePainScale.textContent = painScale;

        // Highlight marker on body pain map
        this.highlightPainMarker(markerId);
      });
    });
  }

  highlightPainMarker(markerId) {
    this.painMarkers.forEach((marker) => {
      if (marker.id === markerId) {
        marker.style.background = "#ef4444";
        marker.style.transform = "translate(-50%, -50%) scale(1.35)";
      } else {
        marker.style.background = "#94a3b8";
        marker.style.transform = "translate(-50%, -50%) scale(1)";
      }
    });
  }

  setupQueueCalling() {
    if (!this.callQueueBtn) return;

    this.callQueueBtn.addEventListener("click", () => {
      soundService.playQueueChime();

      if (this.callingBanner) {
        this.callingBanner.classList.add("chime-active");
        this.callingBanner.innerHTML = `
          <div>
            <span style="font-size:11px; text-transform:uppercase; letter-spacing:1px; opacity:0.9;">🔊 CALLING TO CONSULTATION ROOM</span>
            <h3 style="margin:4px 0 0; font-size:20px;">Queue ${this.activePatient.queueNo} — ${this.activePatient.name}</h3>
          </div>
          <span class="badge-live" style="background:#fff; color:#0369a1; font-weight:900;">LIVE CALLING</span>
        `;

        setTimeout(() => {
          this.callingBanner.classList.remove("chime-active");
        }, 4000);
      }

      alert(`🔊 Voice Calling Simulation:\n"Queue Number ${this.activePatient.queueNo}, ${this.activePatient.name}, please proceed to Consultation Room."`);
    });
  }

  setupStatusUpdates() {
    if (!this.statusSelect) return;

    this.statusSelect.addEventListener("change", (e) => {
      const newStatus = e.target.value;
      soundService.playClickTone();
      alert(`✓ Session status for ${this.activePatient.name} updated to: ${newStatus}`);
    });
  }

  setupPainMapInteractions() {
    this.painMarkers.forEach((marker) => {
      marker.addEventListener("click", () => {
        soundService.playClickTone();
        const part = marker.dataset.bodyPart || "Pain Area";
        const note = marker.dataset.clinicalNote || "Pain complaint reported by patient.";
        alert(`🩺 Anatomical Point: ${part}\nClinical Note: ${note}`);
      });
    });
  }

  setupSignOut() {
    if (this.signOutBtn) {
      this.signOutBtn.addEventListener("click", () => {
        soundService.playClickTone();
        if (confirm("Are you sure you want to sign out from the Practitioner workspace?")) {
          authService.logout();
        }
      });
    }
  }
}

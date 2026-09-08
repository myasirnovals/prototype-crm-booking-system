/**
 * Cliniva — Practitioner / Doctor Workspace Controller
 * SOLID: Single Responsibility for Doctor Schedule, Patient Queue Calling, Treatment Session Management & Body Pain Map
 */

import { authService, USER_ROLES } from "../../services/auth.service.js";
import { soundService } from "../../services/sound.service.js";
import { storageService } from "../../services/storage.service.js";
import { notificationService } from "../../services/notification.service.js";

export class PractitionerController {
  constructor() {
    this.SESSION_STORAGE_KEY = "cliniva_practitioner_sessions";

    this.queueListContainer = document.getElementById("doctorPatientQueueList");
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

    // Clinical Treatment Notes elements
    this.treatmentNotesInput = document.getElementById("treatmentNotesInput");
    this.saveTreatmentNotesBtn = document.getElementById("saveTreatmentNotesBtn");
    this.treatmentNotesSavedTime = document.getElementById("treatmentNotesSavedTime");
    this.notesPatientName = document.getElementById("notesPatientName");
    this.toastContainer = document.getElementById("practitionerToastContainer");

    this.sessions = [];
    this.activePatient = null;
  }

  init() {
    // Session Guard: Verify user has PRACTITIONER role
    const session = authService.requireAuth([USER_ROLES.PRACTITIONER]);
    if (!session) return;

    this.renderUserInfo(session.user);
    this.loadSessions();
    this.renderQueueList();
    this.setupQueueCalling();
    this.setupStatusUpdates();
    this.setupTreatmentNotes();
    this.setupPainMapInteractions();
    this.setupSignOut();
  }

  renderUserInfo(user) {
    const nameEl = document.getElementById("doctorUserName");
    const titleEl = document.getElementById("doctorUserTitle");
    const roomEl = document.getElementById("doctorUserRoom");
    if (nameEl) nameEl.textContent = user.name || "Dr. Lim Wei Han";
    if (titleEl) titleEl.textContent = user.specialty || user.title || "Senior Physiotherapist";
    if (roomEl) roomEl.textContent = `📍 ${user.room || "Room A2 (Physio Suite)"}`;
  }

  /**
   * Load consultation sessions from LocalStorage or initialize with defaults
   */
  loadSessions() {
    const defaultSessions = [
      {
        queueNo: "A-01",
        name: "Amanda Tan",
        phone: "+65 9123 4567",
        service: "Physiotherapy & Spine Rehab",
        time: "10:30 SGT",
        complaint: "Sharp lower back pain (L4-L5) during forward bend after marathon. Difficulty sitting upright >20 mins.",
        painScale: "7 / 10 (Moderate-Severe)",
        duration: "Last 3 weeks",
        activeMarker: "marker-lumbar",
        status: "IN_PROGRESS",
        notes: "Initial consultation completed. Trigger point dry needling & lumbar stabilization exercises recommended.",
        notesUpdatedAt: "10:35 SGT",
        startedAt: "10:30 SGT",
        completedAt: null
      },
      {
        queueNo: "B-02",
        name: "Jason Lee",
        phone: "+65 8234 5678",
        service: "Sports Knee Rehabilitation",
        time: "11:45 SGT",
        complaint: "Post-operative rehabilitation for right knee ACL reconstruction. Stiffness upon full extension.",
        painScale: "5 / 10 (Moderate)",
        duration: "4 weeks post-op",
        activeMarker: "marker-knee",
        status: "WAITING",
        notes: "",
        notesUpdatedAt: null,
        startedAt: null,
        completedAt: null
      },
      {
        queueNo: "C-03",
        name: "Nur Aisyah",
        phone: "+60 12-345 6789",
        service: "Postural Cervical Therapy",
        time: "14:00 SGT",
        complaint: "Chronic upper neck and trapezius spasm due to prolonged laptop posture.",
        painScale: "6 / 10 (Moderate)",
        duration: "2 months",
        activeMarker: "marker-cervical",
        status: "WAITING",
        notes: "",
        notesUpdatedAt: null,
        startedAt: null,
        completedAt: null
      }
    ];

    let stored = storageService.get(this.SESSION_STORAGE_KEY, null);

    if (!stored || !Array.isArray(stored) || stored.length === 0) {
      this.sessions = defaultSessions;
      this.saveSessions();
    } else {
      this.sessions = stored;
    }

    // Set initial active patient (first IN_PROGRESS or first WAITING, fallback index 0)
    const activeOne = this.sessions.find((s) => s.status === "IN_PROGRESS") || this.sessions[0];
    this.activePatient = activeOne;
  }

  saveSessions() {
    storageService.set(this.SESSION_STORAGE_KEY, this.sessions);
  }

  /**
   * Render patient queue list dynamically into sidebar
   */
  renderQueueList() {
    if (!this.queueListContainer) return;

    this.queueListContainer.innerHTML = "";

    this.sessions.forEach((patient) => {
      const card = document.createElement("div");
      card.className = `patient-session-card ${this.activePatient && this.activePatient.queueNo === patient.queueNo ? "active" : ""}`;
      card.dataset.queue = patient.queueNo;

      const statusBadge = this.getStatusBadgeMarkup(patient.status);

      card.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
          <span class="queue-number" style="font-size:20px; font-weight:900;">${patient.queueNo}</span>
          <span class="session-time-badge">${patient.time}</span>
        </div>
        <h4 style="margin:0 0 4px; font-size:14px; font-weight:800;">${patient.name}</h4>
        <div style="font-size:12px; color:var(--muted); margin-bottom:8px;">${patient.service}</div>
        <div class="session-status-container">${statusBadge}</div>
      `;

      card.addEventListener("click", () => {
        this.selectPatient(patient.queueNo);
      });

      this.queueListContainer.appendChild(card);
    });

    if (this.activePatient) {
      this.syncActivePatientView();
    }
  }

  /**
   * Generate HTML for status pill based on status value
   */
  getStatusBadgeMarkup(status) {
    switch (status) {
      case "IN_PROGRESS":
        return `<span class="session-status-pill status-in-progress"><span class="status-dot"></span>In Therapy</span>`;
      case "COMPLETED":
        return `<span class="session-status-pill status-completed"><span class="status-dot"></span>Completed</span>`;
      case "NO_SHOW":
        return `<span class="session-status-pill status-noshow"><span class="status-dot"></span>No-Show</span>`;
      case "WAITING":
      default:
        return `<span class="session-status-pill status-waiting"><span class="status-dot"></span>Waiting Lounge</span>`;
    }
  }

  /**
   * Select a patient from the queue and update all workspace details
   */
  selectPatient(queueNo) {
    const found = this.sessions.find((s) => s.queueNo === queueNo);
    if (!found) return;

    this.activePatient = found;
    soundService.playClickTone();

    // Update active class on queue cards
    const cards = this.queueListContainer.querySelectorAll(".patient-session-card");
    cards.forEach((card) => {
      card.classList.toggle("active", card.dataset.queue === queueNo);
    });

    this.syncActivePatientView();
  }

  /**
   * Synchronize the main workspace views with current active patient data
   */
  syncActivePatientView() {
    if (!this.activePatient) return;

    // Top banner
    if (this.currentPatientName) this.currentPatientName.textContent = this.activePatient.name;
    if (this.currentQueueBadge) this.currentQueueBadge.textContent = this.activePatient.queueNo;

    // Update service in banner if present
    const serviceSub = this.callingBanner?.querySelector("div > div");
    if (serviceSub) {
      serviceSub.textContent = `Service: ${this.activePatient.service} · Room A2`;
    }

    // Session Status Select dropdown
    if (this.statusSelect) {
      this.statusSelect.value = this.activePatient.status || "WAITING";
    }

    // Intake records
    if (this.intakeChiefComplaint) this.intakeChiefComplaint.textContent = this.activePatient.complaint;
    if (this.intakePainScale) this.intakePainScale.textContent = this.activePatient.painScale;
    if (this.intakeDuration) this.intakeDuration.textContent = this.activePatient.duration || "N/A";

    // Notes panel
    if (this.notesPatientName) this.notesPatientName.textContent = this.activePatient.name;
    if (this.treatmentNotesInput) this.treatmentNotesInput.value = this.activePatient.notes || "";
    if (this.treatmentNotesSavedTime) {
      if (this.activePatient.notesUpdatedAt) {
        this.treatmentNotesSavedTime.textContent = `Last saved at ${this.activePatient.notesUpdatedAt}`;
      } else if (this.activePatient.notes && this.activePatient.notes.length > 0) {
        this.treatmentNotesSavedTime.textContent = "Saved";
      } else {
        this.treatmentNotesSavedTime.textContent = "Not saved yet";
      }
    }

    // Highlight body pain map
    if (this.activePatient.activeMarker) {
      this.highlightPainMarker(this.activePatient.activeMarker);
    }
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

  /**
   * Audio chime queue calling action
   */
  setupQueueCalling() {
    if (!this.callQueueBtn) return;

    this.callQueueBtn.addEventListener("click", () => {
      if (!this.activePatient) return;

      // 1. Play hospital chime
      soundService.playQueueChime();

      // 2. Visual banner pulse
      if (this.callingBanner) {
        this.callingBanner.classList.add("chime-active");
        setTimeout(() => {
          this.callingBanner.classList.remove("chime-active");
        }, 4000);
      }

      // 3. Auto-transition from WAITING to IN_PROGRESS
      if (this.activePatient.status === "WAITING") {
        this.activePatient.status = "IN_PROGRESS";
        this.activePatient.startedAt = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        if (this.statusSelect) {
          this.statusSelect.value = "IN_PROGRESS";
        }
        this.saveSessions();
        this.updateCardStatusBadge(this.activePatient.queueNo, "IN_PROGRESS");
      }

      // 4. Log system notification
      notificationService.addSystemNotification({
        title: "Queue Calling",
        message: `Queue ${this.activePatient.queueNo} (${this.activePatient.name}) called to Consultation Room A2.`,
        category: "QUEUE",
        type: "info"
      });

      // 5. Toast feedback
      this.showToast(
        "🔊 Calling Patient",
        `Queue ${this.activePatient.queueNo} — ${this.activePatient.name} called to Room A2.`,
        "info"
      );
    });
  }

  /**
   * Session Status Change dropdown handler
   */
  setupStatusUpdates() {
    if (!this.statusSelect) return;

    this.statusSelect.addEventListener("change", (e) => {
      const newStatus = e.target.value;
      if (!this.activePatient) return;

      this.activePatient.status = newStatus;

      const nowTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

      if (newStatus === "IN_PROGRESS") {
        if (!this.activePatient.startedAt) this.activePatient.startedAt = nowTime;
        soundService.playClickTone();
        this.showToast(
          "Treatment In Progress",
          `Consultation started for ${this.activePatient.name} (${this.activePatient.queueNo}).`,
          "info"
        );
        notificationService.addSystemNotification({
          title: "Session In Progress",
          message: `Consultation started for ${this.activePatient.name} (${this.activePatient.queueNo}).`,
          category: "SESSION",
          type: "info"
        });
      } else if (newStatus === "COMPLETED") {
        this.activePatient.completedAt = nowTime;
        soundService.playSuccessChime();
        this.showToast(
          "Consultation Completed",
          `Therapy session for ${this.activePatient.name} has been marked as completed. Room buffer active.`,
          "success"
        );
        notificationService.addSystemNotification({
          title: "Session Completed",
          message: `Therapy session for ${this.activePatient.name} (${this.activePatient.queueNo}) successfully completed.`,
          category: "SESSION",
          type: "success"
        });
      } else if (newStatus === "NO_SHOW") {
        soundService.playClickTone();
        this.showToast(
          "Patient No-Show",
          `Status updated to No-Show for ${this.activePatient.name}. Front desk notified.`,
          "warning"
        );
        notificationService.addSystemNotification({
          title: "Patient No-Show",
          message: `Queue ${this.activePatient.queueNo} (${this.activePatient.name}) marked as No-Show.`,
          category: "SESSION",
          type: "warning"
        });
      } else {
        // WAITING
        soundService.playClickTone();
        this.showToast(
          "Status Updated",
          `Status set to Waiting Lounge for ${this.activePatient.name}.`,
          "info"
        );
      }

      // Persist to storage
      this.saveSessions();

      // Update badge on sidebar card
      this.updateCardStatusBadge(this.activePatient.queueNo, newStatus);

      // Broadcast event
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("cliniva:sessionStatusChanged", {
          detail: { ...this.activePatient }
        }));
      }
    });
  }

  /**
   * Update the status badge of a specific patient card in the sidebar
   */
  updateCardStatusBadge(queueNo, status) {
    if (!this.queueListContainer) return;
    const card = this.queueListContainer.querySelector(`.patient-session-card[data-queue="${queueNo}"]`);
    if (card) {
      const container = card.querySelector(".session-status-container");
      if (container) {
        container.innerHTML = this.getStatusBadgeMarkup(status);
      }
    }
  }

  /**
   * Clinical Treatment & Observation Notes
   */
  setupTreatmentNotes() {
    if (!this.saveTreatmentNotesBtn || !this.treatmentNotesInput) return;

    this.saveTreatmentNotesBtn.addEventListener("click", () => {
      if (!this.activePatient) return;

      const notesText = this.treatmentNotesInput.value.trim();
      const nowTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

      this.activePatient.notes = notesText;
      this.activePatient.notesUpdatedAt = nowTime;

      this.saveSessions();

      if (this.treatmentNotesSavedTime) {
        this.treatmentNotesSavedTime.textContent = `Last saved today at ${nowTime}`;
      }

      soundService.playClickTone();

      this.showToast(
        "Clinical Notes Saved",
        `Treatment record for ${this.activePatient.name} saved successfully to electronic health record.`,
        "success"
      );

      notificationService.addSystemNotification({
        title: "Clinical Notes Saved",
        message: `Dr. Lim Wei Han saved clinical treatment notes for ${this.activePatient.name} (${this.activePatient.queueNo}).`,
        category: "SESSION",
        type: "success"
      });

      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("cliniva:treatmentNotesSaved", {
          detail: { ...this.activePatient }
        }));
      }
    });
  }

  /**
   * Show non-blocking toast feedback
   */
  showToast(title, message, type = "info") {
    if (!this.toastContainer) return;

    const toast = document.createElement("div");
    toast.className = `practitioner-toast toast-${type}`;

    let icon = "ℹ️";
    if (type === "success") icon = "✅";
    if (type === "warning") icon = "⚠️";

    toast.innerHTML = `
      <div class="toast-icon">${icon}</div>
      <div class="toast-content">
        <div class="toast-title">${title}</div>
        <p class="toast-message">${message}</p>
      </div>
    `;

    toast.addEventListener("click", () => {
      if (typeof toast.remove === "function") {
        toast.remove();
      } else if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    });

    this.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateX(20px)";
      setTimeout(() => {
        if (typeof toast.remove === "function") {
          toast.remove();
        } else if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 250);
    }, 3500);
  }

  setupPainMapInteractions() {
    this.painMarkers.forEach((marker) => {
      marker.addEventListener("click", () => {
        soundService.playClickTone();
        const part = marker.dataset.bodyPart || "Pain Area";
        const note = marker.dataset.clinicalNote || "Pain complaint reported by patient.";

        this.showToast(
          `🩺 ${part}`,
          note,
          "info"
        );
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


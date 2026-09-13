/**
 * Cliniva — Dedicated Clinic Owner Dashboard Controller
 * SOLID: Single Responsibility for Branch Operations, Modul 1 (Branch), Modul 2 (Staff),
 * and Modul 3 (Practitioners)
 * Adheres strictly to Scraping Data/alur aplikasi booking system.xml
 */

import { authService, USER_ROLES } from "../../services/auth.service.js";
import { storageService } from "../../services/storage.service.js";
import { notificationService } from "../../services/notification.service.js";
import { soundService } from "../../services/sound.service.js";
import { bookingService } from "../../services/booking.service.js";
import { i18nService } from "../../services/i18n.service.js";
import { getTemplateServices } from "../../config/templates/index.js";

export class OwnerDashboardController {
  constructor() {
    this.currentUser = null;
    this.brandProfile = null;
    this.branches = [];
    this.activeBranch = null;

    // Local data state for active branch
    this.activeBranchStaff = [];
    this.activeBranchPractitioners = [];
    this.activeBranchQueue = [];
    this.activeBranchServices = [];
    this.activeBranchSubscription = null;
    this.activeBranchInvoices = [];
  }

  init() {
    // 1. Authenticate user & RBAC verification
    const session = authService.getCurrentSession();
    if (!session || !session.user) {
      window.location.href = "../../pages/public/sign-in.html";
      return;
    }

    this.currentUser = session.user;

    // If Owner hasn't completed onboarding, redirect to Setup Branch wizard
    if (this.currentUser.role === USER_ROLES.OWNER && this.currentUser.onboardingCompleted === false) {
      window.location.href = "../../pages/owner/onboarding.html";
      return;
    }

    this.loadBrandProfile();
    this.loadBranchesAndActive();
    this.loadBranchData();
    this.loadBranchServices();
    this.loadBranchSubscription();
    this.renderHeader();
    this.setupTabs();
    this.renderPaneOverview();
    this.renderPaneBranchSettings();
    this.renderPaneBranchStaff();
    this.renderPaneBranchPractitioners();
    this.renderPaneBranchServices();
    this.renderPaneBranchSubscription();
    this.setupModals();
    this.setupSignOut();
    this.setupCopyBranchLink();

    document.addEventListener("cliniva:languageChanged", () => {
      this.renderHeader();
      this.renderPaneOverview();
      this.renderPaneBranchSettings();
      this.renderPaneBranchStaff();
      this.renderPaneBranchPractitioners();
      this.renderPaneBranchServices();
      this.renderPaneBranchSubscription();
    });
  }

  loadBrandProfile() {
    const defaultProfile = {
      name: this.currentUser.brandName || "Dennis Health & Wellness Hub",
      tagline: this.currentUser.brandTagline || "Holistic Recovery & Vitality Redefined",
      logo: this.currentUser.brandLogo || "🌿",
      region: this.currentUser.region || "sg"
    };
    this.brandProfile = storageService.get("cliniva_brand_profile", defaultProfile);
  }

  loadBranchesAndActive() {
    let stored = storageService.get("cliniva_branches", null);

    if (!stored || !Array.isArray(stored) || stored.length === 0) {
      const defaultBranch = {
        id: "br-sg-orchard-01",
        name: this.currentUser.branchName && this.currentUser.branchName !== "Setup Pending"
          ? this.currentUser.branchName
          : "Paragon Medical Flagship (Branch 1)",
        code: "SG-01",
        address: "290 Orchard Road, #09-12 Paragon Medical Suites, Singapore 238859",
        phone: "+65 6733 8899",
        hours: "09:00 - 20:00 (Mon - Sat)",
        rooms: "4",
        template: this.currentUser.activeTemplate || "physio",
        currency: "SGD",
        revenue: "SGD 18,450.00",
        occupancy: "82%",
        status: "ACTIVE",
        isPrimary: true,
        createdAt: new Date().toISOString()
      };
      stored = [defaultBranch];
      storageService.set("cliniva_branches", stored);
    }

    this.branches = stored;

    const activeId = storageService.get("cliniva_active_branch_id", null);
    let matched = this.branches.find((b) => b.id === activeId);

    if (!matched) {
      matched = this.branches[0];
      storageService.set("cliniva_active_branch_id", matched.id);
    }

    this.activeBranch = matched;

    // Synchronize business template
    if (this.activeBranch.template) {
      bookingService.setActiveTemplate(this.activeBranch.template);
    }
  }

  loadBranchData() {
    if (!this.activeBranch) return;
    const branchId = this.activeBranch.id;
    const template = this.activeBranch.template || "physio";

    // 1. Staff
    const staffKey = `cliniva_staff_${branchId}`;
    let staff = storageService.get(staffKey, null);
    if (!staff || !Array.isArray(staff) || staff.length === 0) {
      staff = [
        {
          id: `stf-${branchId}-01`,
          name: "Siti Rahmah",
          role: "Lead Front Desk Receptionist",
          email: "siti.reception@cliniva.com",
          phone: "+65 9112 3344",
          branchName: this.activeBranch.name,
          status: "ACTIVE"
        },
        {
          id: `stf-${branchId}-02`,
          name: "Ahmad Fauzi",
          role: "Branch Operations & Billing Officer",
          email: "ahmad.ops@cliniva.com",
          phone: "+65 9223 5566",
          branchName: this.activeBranch.name,
          status: "ACTIVE"
        }
      ];
      storageService.set(staffKey, staff);
    }
    this.activeBranchStaff = staff;

    // 2. Practitioners
    const pracKey = `cliniva_practitioners_${branchId}`;
    let pracs = storageService.get(pracKey, null);
    if (!pracs || !Array.isArray(pracs) || pracs.length === 0) {
      pracs = this.getDefaultPractitionersForTemplate(template);
      storageService.set(pracKey, pracs);
    }
    this.activeBranchPractitioners = pracs;

    // 3. Live Queue / Appointments
    this.activeBranchQueue = this.getDefaultQueueForTemplate(template);
  }

  getTemplateMeta(templateId) {
    switch (templateId) {
      case "tcm":
        return { label: i18nService.t("template.tcm.name", "🌿 TCM & Acupuncture"), color: "#065f46", bg: "#d1fae5" };
      case "wellness":
        return { label: i18nService.t("template.wellness.name", "🌸 Wellness & Spa"), color: "#9d174d", bg: "#fce7f3" };
      case "nutrition":
        return { label: i18nService.t("template.nutrition.name", "🥗 Nutrition & Dietetics"), color: "#166534", bg: "#dcfce7" };
      case "physio":
      default:
        return { label: i18nService.t("template.physio.name", "🏃 Physiotherapy & Rehab"), color: "#0f766e", bg: "#ccfbf1" };
    }
  }

  getDefaultPractitionersForTemplate(template) {
    switch (template) {
      case "tcm":
        return [
          { id: "pr-1", name: "Dr. Chen Siew Mei, TCM Ph.D", specialty: "Meridian Acupuncture & Pain Rehab", room: "Acupuncture Suite A1", shift: "09:00 - 17:00 (Mon - Sat)", fee: "SGD 130.00", status: "ACTIVE" },
          { id: "pr-2", name: "Master Wang Ting", specialty: "Clinical Herbalist & Detox Cupping", room: "Herbal Suite B1", shift: "13:00 - 20:00 (Tue - Sun)", fee: "SGD 110.00", status: "ACTIVE" }
        ];
      case "wellness":
        return [
          { id: "pr-1", name: "Jessica Miller, CIDESCO", specialty: "Deep Tissue & Aromatherapy", room: "Sakura Spa Suite", shift: "10:00 - 18:00 (Daily)", fee: "SGD 140.00", status: "ACTIVE" },
          { id: "pr-2", name: "Maya Putri", specialty: "Hot Stone Therapy & Neural Calming", room: "Lotus Spa Suite", shift: "12:00 - 20:00 (Wed - Mon)", fee: "SGD 125.00", status: "ACTIVE" }
        ];
      case "nutrition":
        return [
          { id: "pr-1", name: "Dr. Emily Zhao, RD", specialty: "Clinical Diabetes & Metabolic Diet", room: "Consultation Room N1", shift: "09:00 - 17:00 (Mon - Fri)", fee: "SGD 150.00", status: "ACTIVE" },
          { id: "pr-2", name: "David Kurniawan, M.Sc", specialty: "Sports Nutrition & Body Composition", room: "Consultation Room N2", shift: "11:00 - 19:00 (Mon - Sat)", fee: "SGD 135.00", status: "ACTIVE" }
        ];
      case "physio":
      default:
        return [
          { id: "pr-1", name: "Dr. Lim Wei Han, PT", specialty: "Spine Rehabilitation & Posture Alignment", room: "Therapy Bay A2", shift: "09:00 - 17:00 (Mon - Sat)", fee: "SGD 120.00", status: "ACTIVE" },
          { id: "pr-2", name: "Sarah Tan, B.Sc Physio", specialty: "Sports Joint Recovery & Movement Therapy", room: "Therapy Bay B1", shift: "11:00 - 19:00 (Tue - Sun)", fee: "SGD 110.00", status: "ACTIVE" }
        ];
    }
  }

  getDefaultQueueForTemplate(template) {
    switch (template) {
      case "tcm":
        return [
          { queue: "T-01", patient: "Amanda Tan", service: "Meridian Pain Acupuncture", prac: "Dr. Chen Siew Mei", room: "Suite A1", time: "09:30 AM", status: "COMPLETED" },
          { queue: "T-02", patient: "Raymond Goh", service: "Cupping & Herbal Moxa", prac: "Master Wang Ting", room: "Suite B1", time: "11:00 AM", status: "IN_CONSULTATION" },
          { queue: "T-03", patient: "Faridah Binte Omar", service: "Joint Mobility & Herbal Consult", prac: "Dr. Chen Siew Mei", room: "Suite A1", time: "02:15 PM", status: "WAITING" }
        ];
      case "wellness":
        return [
          { queue: "W-01", patient: "Chloe De Silva", service: "Aromatherapy Deep Relax Massage", prac: "Jessica Miller", room: "Suite Sakura", time: "10:30 AM", status: "COMPLETED" },
          { queue: "W-02", patient: "Evelyn Lim", service: "Hot Stone Therapy 90 Mins", prac: "Maya Putri", room: "Suite Lotus", time: "01:00 PM", status: "IN_CONSULTATION" },
          { queue: "W-03", patient: "Marcus Lee", service: "Detox Body Scrub & Reflexology", prac: "Jessica Miller", room: "Suite Sakura", time: "03:30 PM", status: "WAITING" }
        ];
      case "nutrition":
        return [
          { queue: "N-01", patient: "Kenji Sato", service: "Body Composition & Diet Plan", prac: "Dr. Emily Zhao", room: "Room N1", time: "09:00 AM", status: "COMPLETED" },
          { queue: "N-02", patient: "Sarah Lee", service: "Weight Management Consultation", prac: "David Kurniawan", room: "Room N2", time: "11:30 AM", status: "IN_CONSULTATION" },
          { queue: "N-03", patient: "Haji Sulaiman", service: "Low Glycemic Dietary Protocol", prac: "Dr. Emily Zhao", room: "Room N1", time: "02:00 PM", status: "WAITING" }
        ];
      case "physio":
      default:
        return [
          { queue: "P-01", patient: "Amanda Tan", service: "Shoulder & Cervical Spine Rehab", prac: "Dr. Lim Wei Han", room: "Bay A2", time: "09:00 AM", status: "COMPLETED" },
          { queue: "P-02", patient: "David Tan", service: "Post-ACL Knee Physiotherapy", prac: "Sarah Tan", room: "Bay B1", time: "11:00 AM", status: "IN_CONSULTATION" },
          { queue: "P-03", patient: "Jonathan Sim", service: "Dry Needling & Myofascial Release", prac: "Dr. Lim Wei Han", room: "Bay A2", time: "02:30 PM", status: "WAITING" }
        ];
    }
  }

  renderHeader() {
    // Topbar brand logo & name
    const logoEl = document.getElementById("topbarBrandLogo");
    const nameEl = document.getElementById("topbarBrandName");
    const tagEl = document.getElementById("topbarBrandTagline");
    const userEl = document.getElementById("ownerUserName");

    if (nameEl) nameEl.textContent = this.brandProfile.name || "Cliniva Clinic Hub";
    if (tagEl) tagEl.textContent = this.brandProfile.tagline || "";
    if (userEl && this.currentUser) userEl.textContent = this.currentUser.name || "Dennis Pratama";

    if (logoEl) {
      const logoVal = this.brandProfile.logo || "🌿";
      if (logoVal.startsWith("data:image") || logoVal.startsWith("http") || logoVal.includes("/")) {
        logoEl.innerHTML = `<img src="${logoVal}" alt="Brand Logo">`;
      } else {
        logoEl.textContent = logoVal;
      }
    }

    // Topbar active branch pill
    const branchNameEl = document.getElementById("topbarActiveBranchName");
    const branchPillEl = document.getElementById("topbarActiveBranchTemplateBadge");

    if (this.activeBranch) {
      if (branchNameEl) branchNameEl.textContent = this.activeBranch.name;

      const meta = this.getTemplateMeta(this.activeBranch.template);
      if (branchPillEl) {
        branchPillEl.textContent = meta.label;
        branchPillEl.style.color = meta.color;
        branchPillEl.style.background = meta.bg;
      }
    }
  }

  setupTabs() {
    const buttons = document.querySelectorAll(".owner-tab-btn");
    const panes = document.querySelectorAll(".owner-tab-pane");

    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const paneId = btn.dataset.pane;
        if (!paneId) return;
        soundService.playClickTone && soundService.playClickTone();

        // Synchronize active states across sidebar and mobile bottom navigation
        buttons.forEach((b) => {
          if (b.dataset.pane === paneId) {
            b.classList.add("active");
          } else {
            b.classList.remove("active");
          }
        });

        panes.forEach((p) => p.classList.remove("active"));
        const target = document.getElementById(paneId);
        if (target) {
          target.classList.add("active");
          // Smooth scroll to top on tab change for ergonomic flow
          window.scrollTo({ top: 0, behavior: "smooth" });
          const mainEl = document.querySelector(".owner-main");
          if (mainEl) mainEl.scrollTop = 0;
        }
      });
    });
  }

  renderPaneOverview() {
    if (!this.activeBranch) return;

    const bannerName = document.getElementById("bannerBranchName");
    const bannerAddr = document.getElementById("bannerBranchAddress");
    const bannerPill = document.getElementById("bannerTemplatePill");

    const meta = this.getTemplateMeta(this.activeBranch.template);
    if (bannerName) bannerName.textContent = this.activeBranch.name;
    if (bannerAddr) bannerAddr.textContent = this.activeBranch.address;
    if (bannerPill) bannerPill.textContent = `Template: ${meta.label}`;

    // KPI values
    const kpiRev = document.getElementById("kpiRevenue");
    const kpiCurr = document.getElementById("kpiCurrency");
    const kpiOcc = document.getElementById("kpiOccupancy");
    const kpiRooms = document.getElementById("kpiRoomsText");
    const kpiStaff = document.getElementById("kpiStaffCount");

    if (kpiRev) kpiRev.textContent = this.activeBranch.revenue || "SGD 18,450";
    if (kpiCurr) kpiCurr.textContent = this.activeBranch.currency || "SGD";
    if (kpiOcc) kpiOcc.textContent = this.activeBranch.occupancy || "82%";
    if (kpiRooms) kpiRooms.textContent = `${this.activeBranch.rooms || "4"} ` + i18nService.t("owner.activeRooms", "Active Rooms");

    const totalStaffCount = this.activeBranchStaff.length + this.activeBranchPractitioners.length;
    if (kpiStaff) kpiStaff.textContent = `${totalStaffCount} ` + i18nService.t("owner.members", "Members");

    // Render Queue Table
    this.renderQueueTable();

    const btnRefresh = document.getElementById("btnRefreshQueue");
    if (btnRefresh) {
      btnRefresh.addEventListener("click", () => {
        soundService.playSuccess();
        notificationService.info(i18nService.t("owner.queueRefreshed", "Branch queue data refreshed in real-time."));
        this.renderQueueTable();
      });
    }
  }

  renderQueueTable() {
    const tbody = document.getElementById("branchQueueTableBody");
    if (!tbody) return;

    if (!this.activeBranchQueue || this.activeBranchQueue.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" class="owner-table-empty">
            <div class="owner-table-empty-icon">📅</div>
            <div class="owner-table-empty-title">${i18nService.t("owner.table.emptyQueueTitle", "No appointments today")}</div>
            <div class="owner-table-empty-desc">${i18nService.t("owner.table.emptyQueueDesc", "All patient sessions for this branch are completed or not yet scheduled.")}</div>
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = this.activeBranchQueue.map((item, idx) => {
      let statusBadge = `<span class="owner-status-badge neutral">● ${item.status}</span>`;
      if (item.status === "SELESAI" || item.status === "COMPLETED") {
        statusBadge = `<span class="owner-status-badge success">${i18nService.t("owner.table.finished", "✓ Finished")}</span>`;
      } else if (item.status === "SEDANG SESI" || item.status === "IN_CONSULTATION") {
        statusBadge = `<span class="owner-status-badge teal">${i18nService.t("owner.table.inSession", "● In Session")}</span>`;
      } else if (item.status === "MENUNGGU" || item.status === "WAITING") {
        statusBadge = `<span class="owner-status-badge warning">${i18nService.t("owner.table.waiting", "⏳ Waiting")}</span>`;
      }

      return `
        <tr>
          <td class="col-center"><span class="code-badge">${item.queue}</span></td>
          <td><div class="patient-info"><span class="primary-text">${item.patient}</span></div></td>
          <td><span style="color:#0f766e; font-weight:600;">${item.service}</span></td>
          <td><span style="color:var(--text); font-weight:500;">${item.prac}</span></td>
          <td class="col-center"><span class="pill" style="background:#f1f5f9; color:#334155; font-size:11px; font-weight:700;">${item.room}</span></td>
          <td class="col-center"><span style="font-size:12px; color:var(--text); font-variant-numeric:tabular-nums; font-weight:600;">🕒 ${item.time}</span></td>
          <td class="col-center">${statusBadge}</td>
          <td class="col-right">
            ${item.status !== "SELESAI" && item.status !== "COMPLETED"
              ? `<button class="btn-table-action btn-table-success btn-finish-session" data-index="${idx}" title="${i18nService.t("owner.table.markFinished", "Mark Finished ✓")}">${i18nService.t("owner.table.markFinished", "Mark Finished ✓")}</button>`
              : `<span style="font-size:11.5px; font-weight:700; color:var(--muted); display:inline-flex; align-items:center; gap:4px;">${i18nService.t("owner.table.finished", "✓ Finished")}</span>`}
          </td>
        </tr>
      `;
    }).join("");

    tbody.querySelectorAll(".btn-finish-session").forEach((btn) => {
      btn.addEventListener("click", () => {
        const idx = parseInt(btn.dataset.index, 10);
        if (this.activeBranchQueue[idx]) {
          this.activeBranchQueue[idx].status = "SELESAI";
          soundService.playSuccess();
          notificationService.success(`Session for ${this.activeBranchQueue[idx].patient} completed successfully.`);
          this.renderQueueTable();
        }
      });
    });
  }

  renderPaneBranchSettings() {
    if (!this.activeBranch) return;

    const nameInput = document.getElementById("settingBranchName");
    const codeInput = document.getElementById("settingBranchCode");
    const templateName = document.getElementById("settingTemplateName");
    const addrInput = document.getElementById("settingBranchAddress");
    const phoneInput = document.getElementById("settingBranchPhone");
    const hoursInput = document.getElementById("settingBranchHours");
    const roomsSelect = document.getElementById("settingBranchRooms");

    if (nameInput) nameInput.value = this.activeBranch.name || "";
    if (codeInput) codeInput.value = this.activeBranch.code || this.activeBranch.id || "";
    if (addrInput) addrInput.value = this.activeBranch.address || "";
    if (phoneInput) phoneInput.value = this.activeBranch.phone || "";
    if (hoursInput) hoursInput.value = this.activeBranch.hours || "09:00 - 20:00 (Sen - Sab)";
    if (roomsSelect) roomsSelect.value = this.activeBranch.rooms || "4";

    if (templateName) {
      const meta = this.getTemplateMeta(this.activeBranch.template);
      templateName.textContent = meta.label;
      templateName.style.color = meta.color;
    }

    const form = document.getElementById("branchSettingsForm");
    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();

        this.activeBranch.name = nameInput.value.trim();
        this.activeBranch.address = addrInput.value.trim();
        this.activeBranch.phone = phoneInput.value.trim();
        this.activeBranch.hours = hoursInput.value.trim();
        this.activeBranch.rooms = roomsSelect.value;

        // Save into branches array in storage
        const idx = this.branches.findIndex((b) => b.id === this.activeBranch.id);
        if (idx !== -1) {
          this.branches[idx] = { ...this.activeBranch };
          storageService.set("cliniva_branches", this.branches);
        }

        soundService.playSuccess();
        notificationService.success(i18nService.t("owner.branchSettingsSaved", "Branch settings updated successfully!"));
        this.renderHeader();
        this.renderPaneOverview();
      });
    }
  }

  renderPaneBranchStaff() {
    const tbody = document.getElementById("branchStaffTableBody");
    if (!tbody) return;

    if (!this.activeBranchStaff || this.activeBranchStaff.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" class="owner-table-empty">
            <div class="owner-table-empty-icon">👥</div>
            <div class="owner-table-empty-title">${i18nService.t("owner.table.emptyStaffTitle", "No staff registered yet")}</div>
            <div class="owner-table-empty-desc">${i18nService.t("owner.table.emptyStaffDesc", "Add receptionists or admin staff for this active branch.")}</div>
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = this.activeBranchStaff.map((stf, idx) => `
      <tr>
        <td>
          <div class="staff-info">
            <span class="primary-text">${stf.name}</span>
          </div>
        </td>
        <td><span class="pill" style="background:#f1f5f9; color:#334155; font-size:11px; font-weight:700;">${stf.role}</span></td>
        <td><span style="font-family:ui-monospace, monospace; font-size:12px; color:var(--muted);">${stf.email}</span></td>
        <td><span style="font-size:12px; font-weight:600; font-variant-numeric:tabular-nums;">${stf.phone}</span></td>
        <td><span style="font-size:12px; color:#0f766e; font-weight:700;">🏢 ${stf.branchName}</span></td>
        <td class="col-center"><span class="owner-status-badge success">● ${stf.status === "AKTIF" ? "ACTIVE" : stf.status}</span></td>
        <td class="col-right">
          <button class="btn-table-action btn-table-danger btn-delete-staff" data-index="${idx}" title="Delete staff">🗑️ Delete</button>
        </td>
      </tr>
    `).join("");

    tbody.querySelectorAll(".btn-delete-staff").forEach((btn) => {
      btn.addEventListener("click", () => {
        const idx = parseInt(btn.dataset.index, 10);
        const name = this.activeBranchStaff[idx]?.name;
        if (confirm(`Remove staff member ${name} from this branch?`)) {
          this.activeBranchStaff.splice(idx, 1);
          storageService.set(`cliniva_staff_${this.activeBranch.id}`, this.activeBranchStaff);
          soundService.playDelete();
          notificationService.info(`Staff member ${name} removed from branch.`);
          this.renderPaneBranchStaff();
        }
      });
    });
  }


  renderPaneBranchPractitioners() {
    const tbody = document.getElementById("branchPractitionersTableBody");
    if (!tbody) return;

    if (!this.activeBranchPractitioners || this.activeBranchPractitioners.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" class="owner-table-empty">
            <div class="owner-table-empty-icon">🧑‍⚕️</div>
            <div class="owner-table-empty-title">${i18nService.t("owner.table.emptyPracTitle", "No practitioners on duty yet")}</div>
            <div class="owner-table-empty-desc">${i18nService.t("owner.table.emptyPracDesc", "Schedule clinical practitioners or therapists for this active branch.")}</div>
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = this.activeBranchPractitioners.map((prac, idx) => `
      <tr>
        <td>
          <div class="prac-info">
            <span class="primary-text">${prac.name}</span>
          </div>
        </td>
        <td><span style="color:#0f766e; font-weight:700; font-size:12px;">${prac.specialty}</span></td>
        <td class="col-center"><span class="pill" style="background:#f1f5f9; color:#334155; font-size:11px; font-weight:700;">${prac.room}</span></td>
        <td><span style="font-size:12px; color:var(--text); font-variant-numeric:tabular-nums; font-weight:500;">${prac.shift}</span></td>
        <td class="col-right"><span class="price-text">${prac.fee}</span></td>
        <td class="col-center"><span class="owner-status-badge success">● ${prac.status === "AKTIF" ? "ACTIVE" : prac.status}</span></td>
        <td class="col-right">
          <button class="btn-table-action btn-table-danger btn-delete-prac" data-index="${idx}" title="Remove practitioner">🗑️ Delete</button>
        </td>
      </tr>
    `).join("");

    tbody.querySelectorAll(".btn-delete-prac").forEach((btn) => {
      btn.addEventListener("click", () => {
        const idx = parseInt(btn.dataset.index, 10);
        const name = this.activeBranchPractitioners[idx]?.name;
        if (confirm(`Remove practitioner ${name} from branch schedule?`)) {
          this.activeBranchPractitioners.splice(idx, 1);
          storageService.set(`cliniva_practitioners_${this.activeBranch.id}`, this.activeBranchPractitioners);
          soundService.playDelete();
          notificationService.info(`Practitioner ${name} removed from branch schedule.`);
          this.renderPaneBranchPractitioners();
        }
      });
    });
  }

  loadBranchServices() {
    if (!this.activeBranch) return;
    const branchId = this.activeBranch.id;
    const template = this.activeBranch.template || "physio";
    const key = `cliniva_services_${branchId}`;

    let services = storageService.get(key, null);
    if (!services || !Array.isArray(services) || services.length === 0) {
      const templateServices = getTemplateServices(template);
      services = templateServices.map((s, idx) => ({
        id: s.id || `srv-${branchId}-${idx + 1}`,
        name: s.name,
        code: s.code || `SRV-0${idx + 1}`,
        category: s.category || "Clinical Treatment",
        durationMinutes: s.durationMinutes || 45,
        priceSGD: s.priceSGD || 120,
        priceMYR: s.priceMYR || 260,
        description: s.description || "",
        status: "ACTIVE"
      }));
      storageService.set(key, services);
    }
    this.activeBranchServices = services;
  }

  loadBranchSubscription() {
    if (!this.activeBranch) return;
    const branchId = this.activeBranch.id;
    const allSubs = storageService.get("cliniva_owner_subscriptions", []);

    let sub = allSubs.find((s) => s.branchId === branchId);
    if (!sub) {
      // Synthesize an active annual license for this branch
      sub = {
        id: `sub-${branchId}`,
        invoiceNo: `INV-2026-${this.activeBranch.code || "SG01"}`,
        ownerId: this.currentUser ? this.currentUser.id : null,
        ownerEmail: this.currentUser ? this.currentUser.email : null,
        template: this.activeBranch.template || "physio",
        branchId: branchId,
        branchName: this.activeBranch.name,
        durationMonths: 12,
        amount: 948.00,
        currency: "SGD",
        gateway: "PayNow SG / Stripe Corporate",
        status: "ACTIVE",
        paidAt: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(),
        expiresAt: new Date(Date.now() + 337 * 24 * 60 * 60 * 1000).toISOString()
      };
      allSubs.unshift(sub);
      storageService.set("cliniva_owner_subscriptions", allSubs);
    }

    this.activeBranchSubscription = sub;
    this.activeBranchInvoices = allSubs.filter((s) => s.branchId === branchId || !s.branchId);
  }

  renderPaneBranchServices() {
    const tbody = document.getElementById("branchServicesTableBody");
    if (!tbody) return;

    if (!this.activeBranchServices || this.activeBranchServices.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" class="owner-table-empty">
            <div class="owner-table-empty-icon">🩺</div>
            <div class="owner-table-empty-title">${i18nService.t("owner.table.emptyServicesTitle", "No services configured yet")}</div>
            <div class="owner-table-empty-desc">${i18nService.t("owner.table.emptyServicesDesc", "Add clinical services or treatments offered at this branch.")}</div>
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = this.activeBranchServices.map((srv, idx) => {
      const isActive = srv.status === "ACTIVE";
      const badgeClass = isActive ? "success" : "neutral";
      const badgeText = isActive ? i18nService.t("owner.services.activeStatus", "● Active") : i18nService.t("owner.services.inactiveStatus", "○ Inactive");

      return `
        <tr>
          <td>
            <div style="font-weight:700; font-size:13px; color:var(--text);">${srv.name}</div>
            <div style="font-family:ui-monospace, monospace; font-size:11px; color:var(--muted);">${srv.code || "-"}</div>
          </td>
          <td><span class="pill" style="background:#f1f5f9; color:#334155; font-size:11px; font-weight:700;">${srv.category}</span></td>
          <td class="col-center"><span style="font-size:12px; font-weight:600; color:var(--text); font-variant-numeric:tabular-nums;">⏱️ ${srv.durationMinutes} mins</span></td>
          <td class="col-right"><span class="price-text">SGD ${parseFloat(srv.priceSGD || 0).toFixed(2)}</span></td>
          <td><span style="font-size:12px; color:var(--muted); display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;">${srv.description || "-"}</span></td>
          <td class="col-center">
            <button type="button" class="btn-toggle-service-status owner-status-badge ${badgeClass}" data-index="${idx}" style="cursor:pointer; border:none; background:transparent;" title="Toggle Active / Inactive">
              ${badgeText}
            </button>
          </td>
          <td class="col-right">
            <button type="button" class="btn-table-action btn-table-danger btn-delete-service" data-index="${idx}" title="Delete service">🗑️ Delete</button>
          </td>
        </tr>
      `;
    }).join("");

    tbody.querySelectorAll(".btn-toggle-service-status").forEach((btn) => {
      btn.addEventListener("click", () => {
        const idx = parseInt(btn.dataset.index, 10);
        if (this.activeBranchServices[idx]) {
          const current = this.activeBranchServices[idx].status;
          this.activeBranchServices[idx].status = current === "ACTIVE" ? "INACTIVE" : "ACTIVE";
          storageService.set(`cliniva_services_${this.activeBranch.id}`, this.activeBranchServices);
          soundService.playSuccess();
          notificationService.info(`Service status updated to ${this.activeBranchServices[idx].status}.`);
          this.renderPaneBranchServices();
        }
      });
    });

    tbody.querySelectorAll(".btn-delete-service").forEach((btn) => {
      btn.addEventListener("click", () => {
        const idx = parseInt(btn.dataset.index, 10);
        const name = this.activeBranchServices[idx]?.name;
        if (confirm(`Remove service "${name}" from this branch catalog?`)) {
          this.activeBranchServices.splice(idx, 1);
          storageService.set(`cliniva_services_${this.activeBranch.id}`, this.activeBranchServices);
          soundService.playDelete();
          notificationService.info(`Service "${name}" removed from catalog.`);
          this.renderPaneBranchServices();
        }
      });
    });
  }

  renderPaneBranchSubscription() {
    const cardContainer = document.getElementById("branchLicenseCardContainer");
    const tbody = document.getElementById("branchInvoicesTableBody");

    if (cardContainer && this.activeBranchSubscription) {
      const sub = this.activeBranchSubscription;
      const expiresAt = new Date(sub.expiresAt);
      const now = new Date();
      const daysLeft = Math.max(0, Math.ceil((expiresAt - now) / (1000 * 60 * 60 * 24)));
      const meta = this.getTemplateMeta(this.activeBranch.template);
      const isExpiringSoon = daysLeft <= 30;

      cardContainer.innerHTML = `
        <div style="background:#ffffff; border:1px solid var(--line); border-radius:16px; padding:24px; box-shadow:0 1px 3px rgba(0,0,0,0.04);">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:16px; margin-bottom:20px;">
            <div>
              <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px;">
                <span class="pill" style="background:${meta.bg}; color:${meta.color}; font-weight:800; font-size:11px; padding:3px 8px;">
                  ${meta.label}
                </span>
                <span class="pill" style="background:#dcfce7; color:#15803d; font-weight:800; font-size:11px; padding:3px 8px;">
                  ● ACTIVE LICENSE
                </span>
              </div>
              <h3 style="font-size:20px; font-weight:800; margin:0 0 4px; color:var(--text);">
                Enterprise ${sub.durationMonths}-Month SaaS License
              </h3>
              <p style="font-size:12px; color:var(--muted); margin:0;">
                Assigned Branch: <strong>${sub.branchName || this.activeBranch.name}</strong> (${this.activeBranch.code || this.activeBranch.id})
              </p>
            </div>

            <div style="text-align:right;">
              <div style="font-size:11px; color:var(--muted); font-weight:700; text-transform:uppercase;">Days Remaining</div>
              <div style="font-size:28px; font-weight:900; color:${isExpiringSoon ? '#ef4444' : '#0f766e'}; line-height:1.1;">
                ${daysLeft} <span style="font-size:13px; font-weight:700; color:var(--muted);">Days</span>
              </div>
              <div style="font-size:11px; color:var(--muted);">Expires on ${expiresAt.toLocaleDateString('en-SG', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
            </div>
          </div>

          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:12px; padding:16px; background:#f8fafc; border-radius:12px; border:1px solid var(--line);">
            <div>
              <div style="font-size:11px; color:var(--muted);">Annual Plan Fee</div>
              <div style="font-size:15px; font-weight:800; color:var(--text);">SGD ${parseFloat(sub.amount || 948).toFixed(2)}</div>
            </div>
            <div>
              <div style="font-size:11px; color:var(--muted);">Included Branch Quota</div>
              <div style="font-size:13px; font-weight:700; color:#0f766e;">✓ Unlimited Patient Bookings</div>
            </div>
            <div>
              <div style="font-size:11px; color:var(--muted);">Cloud Sync &amp; Realtime</div>
              <div style="font-size:13px; font-weight:700; color:#0f766e;">✓ PostgreSQL + Realtime Live Queue</div>
            </div>
            <div>
              <div style="font-size:11px; color:var(--muted);">WhatsApp Engine</div>
              <div style="font-size:13px; font-weight:700; color:#0f766e;">✓ 2-Way Interactive Confirmation</div>
            </div>
          </div>
        </div>
      `;
    }

    if (tbody) {
      if (!this.activeBranchInvoices || this.activeBranchInvoices.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="7" class="owner-table-empty">
              <div class="owner-table-empty-icon">💳</div>
              <div class="owner-table-empty-title">No billing invoices found</div>
              <div class="owner-table-empty-desc">Transactions and renewal invoices will appear here.</div>
            </td>
          </tr>
        `;
        return;
      }

      tbody.innerHTML = this.activeBranchInvoices.map((inv, idx) => {
        const dateStr = inv.paidAt
          ? new Date(inv.paidAt).toLocaleDateString('en-SG', { day: 'numeric', month: 'short', year: 'numeric' })
          : "Recently Paid";
        const meta = this.getTemplateMeta(inv.template || this.activeBranch.template);

        return `
          <tr>
            <td>
              <span style="font-family:ui-monospace, monospace; font-weight:800; font-size:12px; color:var(--text);">
                ${inv.invoiceNo || `INV-2026-${(idx + 1).toString().padStart(3, '0')}`}
              </span>
            </td>
            <td>
              <span class="pill" style="background:${meta.bg}; color:${meta.color}; font-weight:800; font-size:11px;">
                ${meta.label}
              </span>
            </td>
            <td class="col-center"><span style="font-weight:700; font-size:12px;">${inv.durationMonths || 12} Months</span></td>
            <td class="col-right"><span class="price-text">SGD ${parseFloat(inv.amount || 948).toFixed(2)}</span></td>
            <td><span style="font-size:12px; color:var(--muted); font-variant-numeric:tabular-nums;">🗓️ ${dateStr}</span></td>
            <td class="col-center"><span class="owner-status-badge success">● PAID</span></td>
            <td class="col-right">
              <button type="button" class="btn-table-action btn-download-receipt" data-index="${idx}" style="color:#0f766e; border-color:#99f6e4; background:#f0fdfa;" title="View Official Receipt">
                📄 Receipt PDF
              </button>
            </td>
          </tr>
        `;
      }).join("");

      tbody.querySelectorAll(".btn-download-receipt").forEach((btn) => {
        btn.addEventListener("click", () => {
          const idx = parseInt(btn.dataset.index, 10);
          const inv = this.activeBranchInvoices[idx];
          soundService.playSuccess();
          notificationService.success(`Official invoice ${inv.invoiceNo || "INV-2026"} downloaded.`);
        });
      });
    }
  }

  setupModals() {
    // 1. Staff Modal
    const btnOpenStaff = document.getElementById("btnOpenAddStaffModal");
    const staffOverlay = document.getElementById("addStaffModalOverlay");
    const btnCloseStaff = document.getElementById("btnCloseStaffModal");
    const btnCancelStaff = document.getElementById("btnCancelStaffModal");
    const staffForm = document.getElementById("addStaffForm");

    if (btnOpenStaff) btnOpenStaff.addEventListener("click", () => staffOverlay.style.display = "flex");
    const closeStaffModal = () => staffOverlay.style.display = "none";
    if (btnCloseStaff) btnCloseStaff.addEventListener("click", closeStaffModal);
    if (btnCancelStaff) btnCancelStaff.addEventListener("click", closeStaffModal);

    if (staffForm) {
      staffForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const newStaff = {
          id: `stf-${this.activeBranch.id}-${Date.now()}`,
          name: document.getElementById("newStaffName").value.trim(),
          email: document.getElementById("newStaffEmail").value.trim(),
          phone: document.getElementById("newStaffPhone").value.trim(),
          role: document.getElementById("newStaffRole").value,
          branchName: this.activeBranch.name,
          status: "ACTIVE"
        };
        this.activeBranchStaff.push(newStaff);
        storageService.set(`cliniva_staff_${this.activeBranch.id}`, this.activeBranchStaff);
        soundService.playSuccess();
        notificationService.showToast
          ? notificationService.showToast(`Staff member ${newStaff.name} added successfully!`, "success")
          : notificationService.success?.(`Staff member ${newStaff.name} added successfully!`);
        staffForm.reset();
        closeStaffModal();
        this.renderPaneBranchStaff();
      });
    }

    // 2. Practitioner Modal
    const btnOpenPrac = document.getElementById("btnOpenAddPractitionerModal");
    const pracOverlay = document.getElementById("addPractitionerModalOverlay");
    const btnClosePrac = document.getElementById("btnClosePractitionerModal");
    const btnCancelPrac = document.getElementById("btnCancelPractitionerModal");
    const pracForm = document.getElementById("addPractitionerForm");

    if (btnOpenPrac) btnOpenPrac.addEventListener("click", () => pracOverlay.style.display = "flex");
    const closePracModal = () => pracOverlay.style.display = "none";
    if (btnClosePrac) btnClosePrac.addEventListener("click", closePracModal);
    if (btnCancelPrac) btnCancelPrac.addEventListener("click", closePracModal);

    if (pracForm) {
      pracForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const newPrac = {
          id: `pr-${Date.now()}`,
          name: document.getElementById("newPracName").value.trim(),
          specialty: document.getElementById("newPracSpecialty").value.trim(),
          room: document.getElementById("newPracRoom").value.trim(),
          shift: document.getElementById("newPracShift").value.trim(),
          fee: document.getElementById("newPracFee").value.trim(),
          status: "ACTIVE"
        };
        this.activeBranchPractitioners.push(newPrac);
        storageService.set(`cliniva_practitioners_${this.activeBranch.id}`, this.activeBranchPractitioners);
        soundService.playSuccess();
        notificationService.showToast
          ? notificationService.showToast(`Practitioner ${newPrac.name} scheduled successfully!`, "success")
          : notificationService.success?.(`Practitioner ${newPrac.name} scheduled successfully!`);
        pracForm.reset();
        closePracModal();
        this.renderPaneBranchPractitioners();
      });
    }

    // 3. Service Modal
    const btnOpenService = document.getElementById("btnOpenAddServiceModal");
    const serviceOverlay = document.getElementById("addServiceModalOverlay");
    const btnCloseService = document.getElementById("btnCloseServiceModal");
    const btnCancelService = document.getElementById("btnCancelServiceModal");
    const serviceForm = document.getElementById("addServiceForm");

    if (btnOpenService) btnOpenService.addEventListener("click", () => serviceOverlay.style.display = "flex");
    const closeServiceModal = () => serviceOverlay.style.display = "none";
    if (btnCloseService) btnCloseService.addEventListener("click", closeServiceModal);
    if (btnCancelService) btnCancelService.addEventListener("click", closeServiceModal);

    if (serviceForm) {
      serviceForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const name = document.getElementById("newServiceName")?.value.trim();
        const category = document.getElementById("newServiceCategory")?.value.trim() || "General Consultation";
        const duration = parseInt(document.getElementById("newServiceDuration")?.value, 10) || 45;
        const price = parseFloat(document.getElementById("newServicePrice")?.value) || 120;
        const code = document.getElementById("newServiceCode")?.value.trim() || `PT-0${this.activeBranchServices.length + 1}`;
        const desc = document.getElementById("newServiceDescription")?.value.trim() || "";

        const newService = {
          id: `srv-${this.activeBranch.id}-${Date.now()}`,
          name,
          category,
          durationMinutes: duration,
          priceSGD: price,
          priceMYR: Math.round(price * 2.2),
          code,
          description: desc,
          status: "ACTIVE"
        };

        this.activeBranchServices.push(newService);
        storageService.set(`cliniva_services_${this.activeBranch.id}`, this.activeBranchServices);
        soundService.playSuccess();
        notificationService.success(`Service "${newService.name}" published to branch catalog!`);
        serviceForm.reset();
        closeServiceModal();
        this.renderPaneBranchServices();
      });
    }

    // 4. Renew Subscription Modal
    const btnOpenRenew = document.getElementById("btnOpenRenewModal");
    const renewOverlay = document.getElementById("renewSubscriptionModalOverlay");
    const btnCloseRenew = document.getElementById("btnCloseRenewModal");
    const btnCancelRenew = document.getElementById("btnCancelRenewModal");
    const renewForm = document.getElementById("renewSubscriptionForm");
    const renewTotalAmount = document.getElementById("renewTotalAmount");

    if (btnOpenRenew) btnOpenRenew.addEventListener("click", () => renewOverlay.style.display = "flex");
    const closeRenewModal = () => renewOverlay.style.display = "none";
    if (btnCloseRenew) btnCloseRenew.addEventListener("click", closeRenewModal);
    if (btnCancelRenew) btnCancelRenew.addEventListener("click", closeRenewModal);

    // Update total price when plan radio changes
    const planRadios = document.querySelectorAll('input[name="renewPlan"]');
    planRadios.forEach((radio) => {
      radio.addEventListener("change", (e) => {
        const price = e.target.dataset.price;
        if (renewTotalAmount && price) {
          renewTotalAmount.textContent = `SGD ${parseFloat(price).toFixed(2)}`;
        }
      });
    });

    if (renewForm) {
      renewForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const selectedRadio = document.querySelector('input[name="renewPlan"]:checked');
        const planMonths = selectedRadio ? parseInt(selectedRadio.value, 10) : 12;
        const planPrice = selectedRadio ? parseFloat(selectedRadio.dataset.price) : 948;

        const currentExpires = this.activeBranchSubscription?.expiresAt
          ? new Date(this.activeBranchSubscription.expiresAt)
          : new Date();
        const baseDate = currentExpires > new Date() ? currentExpires : new Date();
        const newExpires = new Date(baseDate.getTime() + planMonths * 30 * 24 * 60 * 60 * 1000);

        const newInvoice = {
          id: `sub-${Date.now()}`,
          invoiceNo: `INV-${new Date().getFullYear()}-${this.activeBranch.code || "SG01"}-${Math.floor(100 + Math.random() * 900)}`,
          ownerId: this.currentUser ? this.currentUser.id : null,
          ownerEmail: this.currentUser ? this.currentUser.email : null,
          template: this.activeBranch.template || "physio",
          branchId: this.activeBranch.id,
          branchName: this.activeBranch.name,
          durationMonths: planMonths,
          amount: planPrice,
          currency: "SGD",
          gateway: "PayNow SG / Stripe Corporate",
          status: "ACTIVE",
          paidAt: new Date().toISOString(),
          expiresAt: newExpires.toISOString()
        };

        const allSubs = storageService.get("cliniva_owner_subscriptions", []);
        // Update active subscription expiry
        const subIndex = allSubs.findIndex((s) => s.branchId === this.activeBranch.id);
        if (subIndex !== -1) {
          allSubs[subIndex].expiresAt = newExpires.toISOString();
          allSubs[subIndex].durationMonths = (allSubs[subIndex].durationMonths || 0) + planMonths;
        }
        allSubs.unshift(newInvoice);
        storageService.set("cliniva_owner_subscriptions", allSubs);

        this.loadBranchSubscription();
        soundService.playSuccess();
        notificationService.success(`SaaS License extended by ${planMonths} months! Valid until ${newExpires.toLocaleDateString('en-SG', { day: 'numeric', month: 'short', year: 'numeric' })}.`);
        closeRenewModal();
        this.renderPaneBranchSubscription();
      });
    }
  }

  setupSignOut() {
    const btn = document.getElementById("ownerSignOutBtn");
    if (btn) {
      btn.addEventListener("click", () => {
        soundService.playSignOut();
        authService.signOut();
      });
    }
  }

  setupCopyBranchLink() {
    const btn = document.getElementById("btnCopyBranchBookingLink");
    if (!btn) return;

    btn.addEventListener("click", () => {
      soundService.playClickTone();
      const branchId = this.activeBranch ? this.activeBranch.id : "sg-orchard";
      const origin = window.location.origin + window.location.pathname.replace('/pages/owner/dashboard.html', '');
      const shareUrl = `${origin}/pages/public/branch.html?branch=${encodeURIComponent(branchId)}`;

      navigator.clipboard.writeText(shareUrl).then(() => {
        const msg = i18nService.t("owner.linkCopiedToast", "✅ Patient booking link copied to clipboard!");
        if (notificationService.showToast) {
          notificationService.showToast(msg, "success");
        } else if (notificationService.success) {
          notificationService.success(msg);
        }
      }).catch((err) => {
        console.error("Clipboard copy failed", err);
        prompt("Copy this branch booking link:", shareUrl);
      });
    });
  }
}

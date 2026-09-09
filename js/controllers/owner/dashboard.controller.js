/**
 * Cliniva — Dedicated Clinic Owner Dashboard Controller
 * SOLID: Single Responsibility for Branch Operations, Modul 1 (Branch), Modul 2 (Staff),
 * Modul 3 (Template Inventory), and Modul 4 (Practitioners)
 * Adheres strictly to Scraping Data/alur aplikasi booking system.xml
 */

import { authService, USER_ROLES } from "../../services/auth.service.js";
import { storageService } from "../../services/storage.service.js";
import { notificationService } from "../../services/notification.service.js";
import { soundService } from "../../services/sound.service.js";
import { bookingService } from "../../services/booking.service.js";

export class OwnerDashboardController {
  constructor() {
    this.currentUser = null;
    this.brandProfile = null;
    this.branches = [];
    this.activeBranch = null;

    // Local data state for active branch
    this.activeBranchStaff = [];
    this.activeBranchInventory = [];
    this.activeBranchPractitioners = [];
    this.activeBranchQueue = [];
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
    this.renderHeader();
    this.setupTabs();
    this.renderPaneOverview();
    this.renderPaneBranchSettings();
    this.renderPaneBranchStaff();
    this.renderPaneBranchInventory();
    this.renderPaneBranchPractitioners();
    this.setupModals();
    this.setupSignOut();
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
          : "Paragon Medical Flagship (Cabang 1)",
        code: "SG-01",
        address: "290 Orchard Road, #09-12 Paragon Medical Suites, Singapore 238859",
        phone: "+65 6733 8899",
        hours: "09:00 - 20:00 (Sen - Sab)",
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
          status: "AKTIF"
        },
        {
          id: `stf-${branchId}-02`,
          name: "Ahmad Fauzi",
          role: "Branch Operations & Billing Officer",
          email: "ahmad.ops@cliniva.com",
          phone: "+65 9223 5566",
          branchName: this.activeBranch.name,
          status: "AKTIF"
        }
      ];
      storageService.set(staffKey, staff);
    }
    this.activeBranchStaff = staff;

    // 2. Inventory (Template Adaptive)
    const invKey = `cliniva_inventory_${branchId}`;
    let inventory = storageService.get(invKey, null);
    if (!inventory || !Array.isArray(inventory) || inventory.length === 0) {
      inventory = this.getDefaultInventoryForTemplate(template);
      storageService.set(invKey, inventory);
    }
    this.activeBranchInventory = inventory;

    // 3. Practitioners
    const pracKey = `cliniva_practitioners_${branchId}`;
    let pracs = storageService.get(pracKey, null);
    if (!pracs || !Array.isArray(pracs) || pracs.length === 0) {
      pracs = this.getDefaultPractitionersForTemplate(template);
      storageService.set(pracKey, pracs);
    }
    this.activeBranchPractitioners = pracs;

    // 4. Live Queue / Appointments
    this.activeBranchQueue = this.getDefaultQueueForTemplate(template);
  }

  getTemplateMeta(templateId) {
    switch (templateId) {
      case "tcm":
        return { label: "🌿 TCM & Akupunktur", color: "#065f46", bg: "#d1fae5" };
      case "wellness":
        return { label: "🌸 Wellness & Spa", color: "#9d174d", bg: "#fce7f3" };
      case "nutrition":
        return { label: "🥗 Klinik Nutrisi & Diet", color: "#166534", bg: "#dcfce7" };
      case "physio":
      default:
        return { label: "🏃 Fisioterapi & Rehab", color: "#0f766e", bg: "#ccfbf1" };
    }
  }

  getDefaultInventoryForTemplate(template) {
    switch (template) {
      case "tcm":
        return [
          { id: "inv-1", name: "Jarum Akupunktur Seirin 0.25x40mm", category: "Peralatan Akupunktur", stock: 120, min: 30, price: "SGD 18.00", unit: "Kotak (100 pcs)" },
          { id: "inv-2", name: "Minyak Herbal Moxibustion Concentrated", category: "Minyak Terapi", stock: 22, min: 10, price: "SGD 32.50", unit: "Botol 250ml" },
          { id: "inv-3", name: "Cangkir Bekam Silikon Vakum Set", category: "Alat Bekam", stock: 14, min: 5, price: "SGD 45.00", unit: "Set 12 pcs" },
          { id: "inv-4", name: "Ginseng Radix Grade A Slice", category: "Bahan Herbal", stock: 6, min: 10, price: "SGD 88.00", unit: "Toples 100g" },
          { id: "inv-5", name: "Kertas Meja Terapi Disposable Roll", category: "Perlengkapan Higienis", stock: 35, min: 15, price: "SGD 12.00", unit: "Roll" }
        ];
      case "wellness":
        return [
          { id: "inv-1", name: "Pure French Lavender Essential Oil 500ml", category: "Aromaterapi", stock: 25, min: 8, price: "SGD 42.00", unit: "Botol 500ml" },
          { id: "inv-2", name: "Lemongrass & Ginger Massage Oil Blend", category: "Minyak Pijat", stock: 7, min: 10, price: "SGD 28.00", unit: "Botol 1 Liter" },
          { id: "inv-3", name: "Organic Himalayan Pink Salt Body Scrub", category: "Body Care", stock: 18, min: 5, price: "SGD 35.00", unit: "Jar 500g" },
          { id: "inv-4", name: "Premium Basalt Volcanic Hot Stone Set", category: "Alat Spa", stock: 9, min: 4, price: "SGD 120.00", unit: "Set 16 pcs" },
          { id: "inv-5", name: "Soft Microfiber Therapy Towel Set", category: "Linen & Towels", stock: 48, min: 20, price: "SGD 15.00", unit: "Pak (6 pcs)" }
        ];
      case "nutrition":
        return [
          { id: "inv-1", name: "Clean Whey Isolate Protein Powder 1kg", category: "Suplemen Protein", stock: 34, min: 10, price: "SGD 65.00", unit: "Tub 1kg" },
          { id: "inv-2", name: "Multivitamin & Trace Mineral Daily", category: "Mikronutrien", stock: 8, min: 15, price: "SGD 38.00", unit: "Botol 90 Kapsul" },
          { id: "inv-3", name: "Bio-Impedance Sensor Replacement Pads", category: "Alat Analisis Tubuh", stock: 85, min: 25, price: "SGD 22.00", unit: "Pack 50 lembar" },
          { id: "inv-4", name: "Cliniva Ergonomic Shaker Bottle 750ml", category: "Merchandise Klinis", stock: 42, min: 15, price: "SGD 14.00", unit: "Unit" },
          { id: "inv-5", name: "Plant-Based Omega-3 DHA/EPA Capsules", category: "Asam Lemak Esensial", stock: 19, min: 8, price: "SGD 45.00", unit: "Botol 60 Softgel" }
        ];
      case "physio":
      default:
        return [
          { id: "inv-1", name: "Kinesiology Tape Pro Water-Resistant 5cm", category: "Consumable Taping", stock: 45, min: 15, price: "SGD 14.50", unit: "Roll" },
          { id: "inv-2", name: "Resistance Band 5-Level Loop Set", category: "Alat Latihan Gerak", stock: 16, min: 8, price: "SGD 26.00", unit: "Set 5 pcs" },
          { id: "inv-3", name: "Ultrasound Transmission Gel 5 Liter", category: "Elektroterapi", stock: 4, min: 6, price: "SGD 38.00", unit: "Galon 5L" },
          { id: "inv-4", name: "Reusable Ice & Hot Compression Wrap", category: "Cryotherapy", stock: 24, min: 10, price: "SGD 32.00", unit: "Unit" },
          { id: "inv-5", name: "Disinfectant Spray & Mat Sanitizer", category: "Higienitas Ruang", stock: 15, min: 5, price: "SGD 18.00", unit: "Botol 1L" }
        ];
    }
  }

  getDefaultPractitionersForTemplate(template) {
    switch (template) {
      case "tcm":
        return [
          { id: "pr-1", name: "Dr. Chen Siew Mei, TCM Ph.D", specialty: "Akupunktur Meridian & Nyeri Kronis", room: "Ruang Akupunktur A1", shift: "09:00 - 17:00 (Sen - Sab)", fee: "SGD 130.00", status: "AKTIF" },
          { id: "pr-2", name: "Master Wang Ting", specialty: "Herbalis Klinis & Bekam Detoks", room: "Ruang Herbal B1", shift: "13:00 - 20:00 (Sel - Min)", fee: "SGD 110.00", status: "AKTIF" }
        ];
      case "wellness":
        return [
          { id: "pr-1", name: "Jessica Miller, CIDESCO", specialty: "Deep Tissue & Aromatherapy Massage", room: "Suite Spa Sakura", shift: "10:00 - 18:00 (Setiap Hari)", fee: "SGD 140.00", status: "AKTIF" },
          { id: "pr-2", name: "Maya Putri", specialty: "Hot Stone Therapy & Relaksasi Saraf", room: "Suite Spa Lotus", shift: "12:00 - 20:00 (Rabu - Sen)", fee: "SGD 125.00", status: "AKTIF" }
        ];
      case "nutrition":
        return [
          { id: "pr-1", name: "Dr. Emily Zhao, RD", specialty: "Diet Khusus Diabetes & Komposisi Tubuh", room: "Ruang Konsultasi N1", shift: "09:00 - 17:00 (Sen - Jum)", fee: "SGD 150.00", status: "AKTIF" },
          { id: "pr-2", name: "David Kurniawan, M.Sc", specialty: "Nutrisi Performa Olahraga & Metabolik", room: "Ruang Konsultasi N2", shift: "11:00 - 19:00 (Sen - Sab)", fee: "SGD 135.00", status: "AKTIF" }
        ];
      case "physio":
      default:
        return [
          { id: "pr-1", name: "Dr. Lim Wei Han, PT", specialty: "Rehabilitasi Tulang Belakang & Postur", room: "Ruang Terapi A2", shift: "09:00 - 17:00 (Sen - Sab)", fee: "SGD 120.00", status: "AKTIF" },
          { id: "pr-2", name: "Sarah Tan, B.Sc Physio", specialty: "Cedera Sendi Olahraga & Fisioterapi Gerak", room: "Ruang Terapi B1", shift: "11:00 - 19:00 (Sel - Min)", fee: "SGD 110.00", status: "AKTIF" }
        ];
    }
  }

  getDefaultQueueForTemplate(template) {
    switch (template) {
      case "tcm":
        return [
          { queue: "T-01", patient: "Amanda Tan", service: "Akupunktur Nyeri Leher & Punggung", prac: "Dr. Chen Siew Mei", room: "Ruang A1", time: "09:30 AM", status: "SELESAI" },
          { queue: "T-02", patient: "Raymond Goh", service: "Terapi Bekam & Herbal Moxa", prac: "Master Wang Ting", room: "Ruang B1", time: "11:00 AM", status: "SEDANG SESI" },
          { queue: "T-03", patient: "Faridah Binte Omar", service: "Konsultasi Nyeri Sendi & Ramuan", prac: "Dr. Chen Siew Mei", room: "Ruang A1", time: "02:15 PM", status: "MENUNGGU" }
        ];
      case "wellness":
        return [
          { queue: "W-01", patient: "Chloe De Silva", service: "Aromatherapy Deep Relax Massage", prac: "Jessica Miller", room: "Suite Sakura", time: "10:30 AM", status: "SELESAI" },
          { queue: "W-02", patient: "Evelyn Lim", service: "Hot Stone Therapy 90 Menit", prac: "Maya Putri", room: "Suite Lotus", time: "01:00 PM", status: "SEDANG SESI" },
          { queue: "W-03", patient: "Marcus Lee", service: "Detox Body Scrub & Reflexology", prac: "Jessica Miller", room: "Suite Sakura", time: "03:30 PM", status: "MENUNGGU" }
        ];
      case "nutrition":
        return [
          { queue: "N-01", patient: "Kenji Sato", service: "Evaluasi Komposisi Tubuh & Diet Plan", prac: "Dr. Emily Zhao", room: "Ruang N1", time: "09:00 AM", status: "SELESAI" },
          { queue: "N-02", patient: "Sarah Lee", service: "Konsultasi Manajemen Berat Badan", prac: "David Kurniawan", room: "Ruang N2", time: "11:30 AM", status: "SEDANG SESI" },
          { queue: "N-03", patient: "Haji Sulaiman", service: "Program Diet Glikemik Rendah", prac: "Dr. Emily Zhao", room: "Ruang N1", time: "02:00 PM", status: "MENUNGGU" }
        ];
      case "physio":
      default:
        return [
          { queue: "P-01", patient: "Amanda Tan", service: "Rehabilitasi Nyeri Bahu & Leher", prac: "Dr. Lim Wei Han", room: "Ruang A2", time: "09:00 AM", status: "SELESAI" },
          { queue: "P-02", patient: "David Tan", service: "Fisioterapi Cedera Lutut ACL", prac: "Sarah Tan", room: "Ruang B1", time: "11:00 AM", status: "SEDANG SESI" },
          { queue: "P-03", patient: "Jonathan Sim", service: "Dry Needling & Myofascial Release", prac: "Dr. Lim Wei Han", room: "Ruang A2", time: "02:30 PM", status: "MENUNGGU" }
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

    // Topbar active branch pill (Desktop & Mobile)
    const branchNameEl = document.getElementById("topbarActiveBranchName");
    const branchPillEl = document.getElementById("topbarActiveBranchTemplateBadge");
    const mobBranchName = document.getElementById("mobileActiveBranchName");
    const mobBranchPill = document.getElementById("mobileActiveBranchBadge");

    if (this.activeBranch) {
      if (branchNameEl) branchNameEl.textContent = this.activeBranch.name;
      if (mobBranchName) mobBranchName.textContent = this.activeBranch.name;

      const meta = this.getTemplateMeta(this.activeBranch.template);
      if (branchPillEl) {
        branchPillEl.textContent = meta.label;
        branchPillEl.style.color = meta.color;
        branchPillEl.style.background = meta.bg;
      }
      if (mobBranchPill) {
        mobBranchPill.textContent = meta.label;
        mobBranchPill.style.color = meta.color;
        mobBranchPill.style.background = meta.bg;
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
    if (kpiRooms) kpiRooms.textContent = `${this.activeBranch.rooms || "4"} Ruangan Aktif`;

    const totalStaffCount = this.activeBranchStaff.length + this.activeBranchPractitioners.length;
    if (kpiStaff) kpiStaff.textContent = `${totalStaffCount} Anggota`;

    // Render Queue Table
    this.renderQueueTable();

    const btnRefresh = document.getElementById("btnRefreshQueue");
    if (btnRefresh) {
      btnRefresh.addEventListener("click", () => {
        soundService.playSuccess();
        notificationService.info("Data antrean cabang dimuat ulang secara real-time.");
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
            <div class="owner-table-empty-title">Tidak ada antrean hari ini</div>
            <div class="owner-table-empty-desc">Semua sesi pasien untuk cabang ini telah selesai atau belum dijadwalkan.</div>
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = this.activeBranchQueue.map((item, idx) => {
      let statusBadge = `<span class="owner-status-badge neutral">● ${item.status}</span>`;
      if (item.status === "SELESAI") {
        statusBadge = `<span class="owner-status-badge success">● Selesai</span>`;
      } else if (item.status === "SEDANG SESI") {
        statusBadge = `<span class="owner-status-badge teal">● Sedang Sesi</span>`;
      } else if (item.status === "MENUNGGU") {
        statusBadge = `<span class="owner-status-badge warning">⏳ Menunggu</span>`;
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
            ${item.status !== "SELESAI" 
              ? `<button class="btn-table-action btn-table-success btn-finish-session" data-index="${idx}" title="Tandai sesi telah tuntas">Tandai Selesai ✓</button>`
              : `<span style="font-size:11.5px; font-weight:700; color:var(--muted); display:inline-flex; align-items:center; gap:4px;">✓ Tuntas</span>`}
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
          notificationService.success(`Sesi pasien ${this.activeBranchQueue[idx].patient} berhasil diselesaikan.`);
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
        notificationService.success("Pengaturan cabang berhasil diperbarui!");
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
            <div class="owner-table-empty-title">Belum ada staf terdaftar</div>
            <div class="owner-table-empty-desc">Tambahkan staf resepsionis atau admin untuk cabang aktif ini.</div>
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
        <td class="col-center"><span class="owner-status-badge success">● ${stf.status}</span></td>
        <td class="col-right">
          <button class="btn-table-action btn-table-danger btn-delete-staff" data-index="${idx}" title="Hapus staf dari cabang">🗑️ Hapus</button>
        </td>
      </tr>
    `).join("");

    tbody.querySelectorAll(".btn-delete-staff").forEach((btn) => {
      btn.addEventListener("click", () => {
        const idx = parseInt(btn.dataset.index, 10);
        const name = this.activeBranchStaff[idx]?.name;
        if (confirm(`Hapus staf ${name} dari cabang ini?`)) {
          this.activeBranchStaff.splice(idx, 1);
          storageService.set(`cliniva_staff_${this.activeBranch.id}`, this.activeBranchStaff);
          soundService.playDelete();
          notificationService.info(`Staf ${name} berhasil dihapus dari cabang.`);
          this.renderPaneBranchStaff();
        }
      });
    });
  }

  renderPaneBranchInventory() {
    const tbody = document.getElementById("branchInventoryTableBody");
    if (!tbody) return;

    const lblTemplate = document.getElementById("inventoryTemplateLabel");
    if (lblTemplate && this.activeBranch) {
      const meta = this.getTemplateMeta(this.activeBranch.template);
      lblTemplate.textContent = meta.label;
      lblTemplate.style.color = meta.color;
      lblTemplate.style.background = meta.bg;
    }

    let safeCount = 0;
    let lowCount = 0;
    let criticalCount = 0;

    if (!this.activeBranchInventory || this.activeBranchInventory.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" class="owner-table-empty">
            <div class="owner-table-empty-icon">📦</div>
            <div class="owner-table-empty-title">Katalog inventaris masih kosong</div>
            <div class="owner-table-empty-desc">Tambahkan perlengkapan atau barang inventaris baru khusus cabang ini.</div>
          </td>
        </tr>
      `;
      const elTotal = document.getElementById("invTotalItems");
      const elSafe = document.getElementById("invSafeItems");
      const elLow = document.getElementById("invLowItems");
      const elCrit = document.getElementById("invCriticalItems");
      if (elTotal) elTotal.textContent = 0;
      if (elSafe) elSafe.textContent = 0;
      if (elLow) elLow.textContent = 0;
      if (elCrit) elCrit.textContent = 0;
      return;
    }

    tbody.innerHTML = this.activeBranchInventory.map((item, idx) => {
      let statusClass = "success";
      let statusText = "● Stok Aman";

      if (item.stock === 0) {
        statusClass = "danger";
        statusText = "✕ Stok Habis (Kritis)";
        criticalCount++;
      } else if (item.stock <= item.min) {
        statusClass = "warning";
        statusText = "⚠️ Stok Menipis";
        lowCount++;
      } else {
        safeCount++;
      }

      return `
        <tr>
          <td>
            <div class="item-info">
              <span class="primary-text">${item.name}</span>
              <span class="unit-tag">${item.unit || "Satuan"}</span>
            </div>
          </td>
          <td><span class="pill" style="background:#f1f5f9; color:#475569; font-size:11px; font-weight:600;">${item.category}</span></td>
          <td class="col-right">
            <span class="tabular-num" style="font-size:14px; font-weight:800; color:${item.stock <= item.min ? '#b91c1c' : 'var(--text)'};">
              ${item.stock}
            </span>
          </td>
          <td class="col-right">
            <span class="tabular-num secondary-text">Min. ${item.min}</span>
          </td>
          <td class="col-right">
            <span class="price-text">${item.price}</span>
          </td>
          <td class="col-center">
            <span class="owner-status-badge ${statusClass}">
              ${statusText}
            </span>
          </td>
          <td class="col-right">
            <button class="btn-table-action btn-table-primary btn-add-stock" data-index="${idx}" title="Tambah 10 stok otomatis">
              ＋ 10 Stok
            </button>
          </td>
        </tr>
      `;
    }).join("");

    // Update inventory summary counters
    const elTotal = document.getElementById("invTotalItems");
    const elSafe = document.getElementById("invSafeItems");
    const elLow = document.getElementById("invLowItems");
    const elCrit = document.getElementById("invCriticalItems");

    if (elTotal) elTotal.textContent = this.activeBranchInventory.length;
    if (elSafe) elSafe.textContent = safeCount;
    if (elLow) elLow.textContent = lowCount;
    if (elCrit) elCrit.textContent = criticalCount;

    tbody.querySelectorAll(".btn-add-stock").forEach((btn) => {
      btn.addEventListener("click", () => {
        const idx = parseInt(btn.dataset.index, 10);
        if (this.activeBranchInventory[idx]) {
          this.activeBranchInventory[idx].stock += 10;
          storageService.set(`cliniva_inventory_${this.activeBranch.id}`, this.activeBranchInventory);
          soundService.playSuccess();
          notificationService.success(`Stok ${this.activeBranchInventory[idx].name} ditambah 10 unit.`);
          this.renderPaneBranchInventory();
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
            <div class="owner-table-empty-title">Belum ada praktisi yang bertugas</div>
            <div class="owner-table-empty-desc">Jadwalkan dokter atau praktisi klinis untuk cabang aktif ini.</div>
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
        <td class="col-center"><span class="owner-status-badge success">● ${prac.status}</span></td>
        <td class="col-right">
          <button class="btn-table-action btn-table-danger btn-delete-prac" data-index="${idx}" title="Hapus praktisi dari jadwal cabang">🗑️ Hapus</button>
        </td>
      </tr>
    `).join("");

    tbody.querySelectorAll(".btn-delete-prac").forEach((btn) => {
      btn.addEventListener("click", () => {
        const idx = parseInt(btn.dataset.index, 10);
        const name = this.activeBranchPractitioners[idx]?.name;
        if (confirm(`Hapus praktisi ${name} dari cabang ini?`)) {
          this.activeBranchPractitioners.splice(idx, 1);
          storageService.set(`cliniva_practitioners_${this.activeBranch.id}`, this.activeBranchPractitioners);
          soundService.playDelete();
          notificationService.info(`Praktisi ${name} berhasil dihapus dari jadwal cabang.`);
          this.renderPaneBranchPractitioners();
        }
      });
    });
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
          status: "AKTIF"
        };
        this.activeBranchStaff.push(newStaff);
        storageService.set(`cliniva_staff_${this.activeBranch.id}`, this.activeBranchStaff);
        soundService.playSuccess();
        notificationService.success(`Staf ${newStaff.name} berhasil ditambahkan!`);
        staffForm.reset();
        closeStaffModal();
        this.renderPaneBranchStaff();
      });
    }

    // 2. Inventory Modal
    const btnOpenInv = document.getElementById("btnOpenAddInventoryModal");
    const invOverlay = document.getElementById("addInventoryModalOverlay");
    const btnCloseInv = document.getElementById("btnCloseInventoryModal");
    const btnCancelInv = document.getElementById("btnCancelInventoryModal");
    const invForm = document.getElementById("addInventoryForm");

    if (btnOpenInv) btnOpenInv.addEventListener("click", () => invOverlay.style.display = "flex");
    const closeInvModal = () => invOverlay.style.display = "none";
    if (btnCloseInv) btnCloseInv.addEventListener("click", closeInvModal);
    if (btnCancelInv) btnCancelInv.addEventListener("click", closeInvModal);

    if (invForm) {
      invForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const newItem = {
          id: `inv-${Date.now()}`,
          name: document.getElementById("newInvName").value.trim(),
          category: document.getElementById("newInvCategory").value.trim(),
          stock: parseInt(document.getElementById("newInvStock").value, 10) || 0,
          min: parseInt(document.getElementById("newInvMinAlert").value, 10) || 10,
          price: document.getElementById("newInvPrice").value.trim() || "SGD 25.00",
          unit: "Unit"
        };
        this.activeBranchInventory.push(newItem);
        storageService.set(`cliniva_inventory_${this.activeBranch.id}`, this.activeBranchInventory);
        soundService.playSuccess();
        notificationService.success(`Barang ${newItem.name} berhasil ditambahkan ke inventaris!`);
        invForm.reset();
        closeInvModal();
        this.renderPaneBranchInventory();
      });
    }

    // 3. Practitioner Modal
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
          status: "AKTIF"
        };
        this.activeBranchPractitioners.push(newPrac);
        storageService.set(`cliniva_practitioners_${this.activeBranch.id}`, this.activeBranchPractitioners);
        soundService.playSuccess();
        notificationService.success(`Praktisi ${newPrac.name} berhasil didaftarkan ke cabang!`);
        pracForm.reset();
        closePracModal();
        this.renderPaneBranchPractitioners();
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
}

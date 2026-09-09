/**
 * Cliniva — Supabase Database & Realtime Service
 * SOLID: Single Responsibility for Cloud Database Operations, Realtime Subscriptions & Cloud Fallback
 */

import { getSupabaseClient, isSupabaseConfigured } from "../config/supabase.js";

class SupabaseService {
  constructor() {
    this.activeChannels = new Map();
  }

  /**
   * Check if Supabase cloud backend is available and active
   * @returns {boolean}
   */
  isAvailable() {
    return isSupabaseConfigured();
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 1. BOOKINGS & RESERVATIONS
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Fetch all bookings from Supabase
   * @returns {Promise<Array<object>|null>}
   */
  async fetchBookings() {
    const supabase = await getSupabaseClient();
    if (!supabase) return null;

    try {
      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("[SupabaseService] fetchBookings error:", error);
        return null;
      }
      return data || [];
    } catch (err) {
      console.warn("[SupabaseService] fetchBookings exception:", err);
      return null;
    }
  }

  /**
   * Create new booking in Supabase and optionally auto-generate queue ticket
   * @param {object} bookingPayload
   * @returns {Promise<object|null>}
   */
  async createBooking(bookingPayload) {
    const supabase = await getSupabaseClient();
    if (!supabase) return null;

    try {
      const {
        code,
        patientName,
        patientPhone,
        patientEmail,
        branchId,
        branchName,
        branchAddress,
        serviceId,
        serviceName,
        practitionerId,
        practitionerName,
        schedule,
        scheduleDate,
        room,
        depositPaid,
        paymentStatus,
        status = "CONFIRMED",
        templateType = "wellness",
        complaint,
        painScale,
        intakeData,
        intakeDetails
      } = bookingPayload;

      const newRecord = {
        code,
        patient_name: patientName || "Guest Patient",
        patient_phone: patientPhone || null,
        patient_email: patientEmail || null,
        branch_id: branchId || "sg-orchard",
        branch_name: branchName || "Orchard Wellness Clinic",
        branch_address: branchAddress || "",
        service_id: serviceId || null,
        service_name: serviceName || "General Consultation",
        practitioner_id: practitionerId || null,
        practitioner_name: practitionerName || "Assigned Specialist",
        schedule_date: scheduleDate || new Date().toISOString().slice(0, 10),
        schedule_slot: schedule || "10:00 SGT",
        room: room || "Suite 01",
        deposit_paid: depositPaid || "0.00",
        payment_status: paymentStatus || "DEPOSIT_PAID",
        status,
        template_type: templateType,
        chief_complaint: complaint || "",
        pain_scale: painScale || "N/A",
        intake_data: intakeData || "",
        intake_details: intakeDetails || {}
      };

      const { data, error } = await supabase
        .from("bookings")
        .insert([newRecord])
        .select()
        .single();

      if (error) {
        console.error("[SupabaseService] createBooking error:", error);
        return null;
      }

      // Auto-generate corresponding queue ticket for today
      try {
        const randomNum = Math.floor(1 + Math.random() * 20);
        const prefix = templateType === "physio" ? "P" : templateType === "tcm" ? "T" : "W";
        const queueNo = `${prefix}-${String(randomNum).padStart(2, "0")}`;

        await supabase.from("queue_tickets").insert([
          {
            queue_number: queueNo,
            branch_id: branchId || "sg-orchard",
            booking_id: data.id,
            patient_name: patientName || "Guest Patient",
            patient_phone: patientPhone || null,
            service_name: serviceName || "Consultation",
            practitioner_name: practitionerName || "Assigned Specialist",
            room: room || "Suite 01",
            status: "WAITING",
            status_badge: "WAITING",
            badge_color: "#b45309",
            badge_bg: "#fef3c7"
          }
        ]);
      } catch (qErr) {
        console.warn("[SupabaseService] Failed to create auto-queue ticket:", qErr);
      }

      return data;
    } catch (err) {
      console.warn("[SupabaseService] createBooking exception:", err);
      return null;
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 2. LIVE QUEUE MANAGEMENT
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Fetch live queue tickets for a specific branch
   * @param {string} branchId
   * @returns {Promise<Array<object>|null>}
   */
  async fetchLiveQueue(branchId = "sg-orchard") {
    const supabase = await getSupabaseClient();
    if (!supabase) return null;

    try {
      const { data, error } = await supabase
        .from("queue_tickets")
        .select("*")
        .eq("branch_id", branchId)
        .neq("status", "COMPLETED")
        .order("created_at", { ascending: true });

      if (error) {
        console.error("[SupabaseService] fetchLiveQueue error:", error);
        return null;
      }

      // Map to UI-friendly model matching Cliniva controllers
      return (data || []).map((q) => ({
        id: q.id,
        queue: q.queue_number,
        patient: q.patient_name,
        service: `${q.service_name} · ${q.practitioner_name || "Doctor"}`,
        serviceName: q.service_name,
        practitioner: q.practitioner_name,
        room: q.room,
        status: q.status,
        statusBadge: q.status_badge || q.status,
        badgeColor: q.badge_color || "#0f766e",
        badgeBg: q.badge_bg || "#f0fdfa",
        calledAt: q.called_at,
        createdAt: q.created_at
      }));
    } catch (err) {
      console.warn("[SupabaseService] fetchLiveQueue exception:", err);
      return null;
    }
  }

  /**
   * Update status of a queue ticket
   * @param {string} ticketId
   * @param {string} status - 'WAITING' | 'READY' | 'CHECKED-IN' | 'IN_CONSULT' | 'COMPLETED'
   * @param {object} badgeStyle - { statusBadge, badgeColor, badgeBg }
   * @returns {Promise<boolean>}
   */
  async updateQueueStatus(ticketId, status, badgeStyle = {}) {
    const supabase = await getSupabaseClient();
    if (!supabase) return false;

    try {
      const payload = {
        status,
        status_badge: badgeStyle.statusBadge || status,
        badge_color: badgeStyle.badgeColor || (status === "READY" ? "#0f766e" : "#0369a1"),
        badge_bg: badgeStyle.badgeBg || (status === "READY" ? "#f0fdfa" : "#e0f2fe"),
        updated_at: new Date().toISOString()
      };

      if (status === "READY" || status === "IN_CONSULT") {
        payload.called_at = new Date().toISOString();
      } else if (status === "COMPLETED") {
        payload.completed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from("queue_tickets")
        .update(payload)
        .eq("id", ticketId);

      if (error) {
        console.error("[SupabaseService] updateQueueStatus error:", error);
        return false;
      }
      return true;
    } catch (err) {
      console.warn("[SupabaseService] updateQueueStatus exception:", err);
      return false;
    }
  }

  /**
   * Add a walk-in queue item directly from front-desk
   * @param {object} walkInPayload
   * @returns {Promise<object|null>}
   */
  async addWalkInQueue(walkInPayload) {
    const supabase = await getSupabaseClient();
    if (!supabase) return null;

    try {
      const {
        queueNumber,
        branchId = "sg-orchard",
        patientName,
        serviceName,
        practitionerName,
        room
      } = walkInPayload;

      const record = {
        queue_number: queueNumber,
        branch_id: branchId,
        patient_name: patientName,
        service_name: serviceName,
        practitioner_name: practitionerName || "Earliest Available",
        room: room || "Suite 01",
        status: "CHECKED-IN",
        status_badge: "CHECKED-IN",
        badge_color: "#0369a1",
        badge_bg: "#e0f2fe"
      };

      const { data, error } = await supabase
        .from("queue_tickets")
        .insert([record])
        .select()
        .single();

      if (error) {
        console.error("[SupabaseService] addWalkInQueue error:", error);
        return null;
      }
      return data;
    } catch (err) {
      console.warn("[SupabaseService] addWalkInQueue exception:", err);
      return null;
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 3. REALTIME SUBSCRIPTIONS (WebSocket)
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Subscribe to live queue changes for a branch (Front desk, Doctor room, Patient portal)
   * @param {string} branchId
   * @param {function} onUpdateCallback
   * @returns {Promise<function>} unsubscribe function
   */
  async subscribeToQueue(branchId = "sg-orchard", onUpdateCallback) {
    const supabase = await getSupabaseClient();
    if (!supabase || typeof onUpdateCallback !== "function") {
      return () => {};
    }

    try {
      const channelName = `cliniva_queue_${branchId}`;

      // Clean up previous channel if exists
      if (this.activeChannels.has(channelName)) {
        supabase.removeChannel(this.activeChannels.get(channelName));
        this.activeChannels.delete(channelName);
      }

      const channel = supabase
        .channel(channelName)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "queue_tickets",
            filter: `branch_id=eq.${branchId}`
          },
          (payload) => {
            console.info("[Supabase Realtime] Queue change event received:", payload.eventType, payload.new);
            onUpdateCallback(payload);
          }
        )
        .subscribe((status) => {
          console.info(`[Supabase Realtime] Channel ${channelName} status:`, status);
        });

      this.activeChannels.set(channelName, channel);

      return () => {
        supabase.removeChannel(channel);
        this.activeChannels.delete(channelName);
      };
    } catch (err) {
      console.warn("[SupabaseService] Failed to subscribe to queue realtime:", err);
      return () => {};
    }
  }

  /**
   * Subscribe to new bookings created in realtime
   * @param {function} onBookingCallback
   * @returns {Promise<function>} unsubscribe function
   */
  async subscribeToBookings(onBookingCallback) {
    const supabase = await getSupabaseClient();
    if (!supabase || typeof onBookingCallback !== "function") {
      return () => {};
    }

    try {
      const channelName = "cliniva_bookings_realtime";
      const channel = supabase
        .channel(channelName)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "bookings"
          },
          (payload) => {
            console.info("[Supabase Realtime] New booking created:", payload.new);
            onBookingCallback(payload.new);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } catch (err) {
      console.warn("[SupabaseService] Failed to subscribe to bookings realtime:", err);
      return () => {};
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 4. CLINICAL TREATMENT NOTES & AUDIT
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Save doctor treatment notes & body pain markers
   * @param {object} notesPayload
   * @returns {Promise<boolean>}
   */
  async saveTreatmentNotes(notesPayload) {
    const supabase = await getSupabaseClient();
    if (!supabase) return false;

    try {
      const {
        patientName,
        complaint,
        painScale,
        duration,
        notes,
        painMarkers
      } = notesPayload;

      const record = {
        patient_name: patientName,
        complaint: complaint || "",
        pain_scale: painScale || "",
        duration: duration || "",
        notes: notes || "",
        pain_markers: painMarkers || []
      };

      const { error } = await supabase.from("treatment_notes").insert([record]);
      if (error) {
        console.error("[SupabaseService] saveTreatmentNotes error:", error);
        return false;
      }
      return true;
    } catch (err) {
      console.warn("[SupabaseService] saveTreatmentNotes exception:", err);
      return false;
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 5. USER PROFILES & RBAC AUTH
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Fetch all user profiles from Supabase
   * @returns {Promise<Array<object>>}
   */
  async fetchProfiles() {
    const supabase = await getSupabaseClient();
    if (!supabase) return [];

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: true });

      if (error) {
        console.error("[SupabaseService] fetchProfiles error:", error);
        return [];
      }
      return (data || []).map((p) => ({
        id: p.id,
        email: p.email,
        phone: p.phone,
        name: p.name,
        role: p.role,
        title: p.title,
        specialty: p.specialty,
        room: p.room,
        branchId: p.branch_id,
        branchName: p.branch_name,
        region: p.region || "sg",
        avatar: p.avatar || "👤",
        activeBookingCode: p.active_booking_code,
        queueNumber: p.queue_number,
        onboardingCompleted: p.onboarding_completed !== false,
        createdAt: p.created_at
      }));
    } catch (err) {
      console.warn("[SupabaseService] fetchProfiles exception:", err);
      return [];
    }
  }

  /**
   * Get single profile by email
   * @param {string} email
   * @returns {Promise<object|null>}
   */
  async getProfileByEmail(email) {
    const supabase = await getSupabaseClient();
    if (!supabase || !email) return null;

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .ilike("email", email.trim())
        .maybeSingle();

      if (error || !data) return null;
      return {
        id: data.id,
        email: data.email,
        phone: data.phone,
        name: data.name,
        role: data.role,
        title: data.title,
        specialty: data.specialty,
        room: data.room,
        branchId: data.branch_id,
        branchName: data.branch_name,
        region: data.region || "sg",
        avatar: data.avatar || "👤",
        activeBookingCode: data.active_booking_code,
        queueNumber: data.queue_number,
        onboardingCompleted: data.onboarding_completed !== false,
        createdAt: data.created_at
      };
    } catch (err) {
      console.warn("[SupabaseService] getProfileByEmail exception:", err);
      return null;
    }
  }

  /**
   * Get single profile by role (for 1-click quick demo login)
   * @param {string} role
   * @returns {Promise<object|null>}
   */
  async getProfileByRole(role) {
    const supabase = await getSupabaseClient();
    if (!supabase || !role) return null;

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", role)
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();

      if (error || !data) return null;
      return {
        id: data.id,
        email: data.email,
        phone: data.phone,
        name: data.name,
        role: data.role,
        title: data.title,
        specialty: data.specialty,
        room: data.room,
        branchId: data.branch_id,
        branchName: data.branch_name,
        region: data.region || "sg",
        avatar: data.avatar || "👤",
        activeBookingCode: data.active_booking_code,
        queueNumber: data.queue_number,
        onboardingCompleted: data.onboarding_completed !== false,
        createdAt: data.created_at
      };
    } catch (err) {
      console.warn("[SupabaseService] getProfileByRole exception:", err);
      return null;
    }
  }

  /**
   * Create new profile in Supabase (e.g. Owner account created by Super Admin)
   * @param {object} profile
   * @returns {Promise<object|null>}
   */
  async createProfile(profile) {
    const supabase = await getSupabaseClient();
    if (!supabase) return null;

    try {
      const record = {
        id: profile.id || `usr-${Date.now()}`,
        email: profile.email.toLowerCase().trim(),
        phone: profile.phone || null,
        name: profile.name,
        role: profile.role || "USER",
        title: profile.title || null,
        specialty: profile.specialty || null,
        room: profile.room || null,
        branch_id: profile.branchId || null,
        branch_name: profile.branchName || null,
        region: profile.region || "sg",
        avatar: profile.avatar || "👤",
        onboarding_completed: profile.onboardingCompleted !== false
      };

      const { data, error } = await supabase
        .from("profiles")
        .insert([record])
        .select()
        .single();

      if (error) {
        console.error("[SupabaseService] createProfile error:", error);
        return null;
      }
      return data;
    } catch (err) {
      console.warn("[SupabaseService] createProfile exception:", err);
      return null;
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 6. CLINIC BRANCHES & MASTER DATA
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Fetch clinic branches from Supabase
   * @returns {Promise<Array<object>>}
   */
  async fetchBranches() {
    const supabase = await getSupabaseClient();
    if (!supabase) return [];

    try {
      const { data, error } = await supabase
        .from("branches")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("[SupabaseService] fetchBranches error:", error);
        return [];
      }
      return data || [];
    } catch (err) {
      console.warn("[SupabaseService] fetchBranches exception:", err);
      return [];
    }
  }

  /**
   * Create or update clinic branch in Supabase
   * @param {object} branchData
   * @returns {Promise<object|null>}
   */
  async upsertBranch(branchData) {
    const supabase = await getSupabaseClient();
    if (!supabase) return null;

    try {
      const record = {
        id: branchData.id,
        name: branchData.name,
        region_code: branchData.regionCode || "sg",
        region: branchData.region || "Singapore",
        country: branchData.country || "Singapore",
        currency: branchData.currency || "SGD",
        address: branchData.address,
        phone: branchData.phone || null,
        hours: branchData.hours || null,
        lat: branchData.lat || null,
        lng: branchData.lng || null,
        is_active: true
      };

      const { data, error } = await supabase
        .from("branches")
        .upsert([record])
        .select()
        .single();

      if (error) {
        console.error("[SupabaseService] upsertBranch error:", error);
        return null;
      }
      return data;
    } catch (err) {
      console.warn("[SupabaseService] upsertBranch exception:", err);
      return null;
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 7. AUDIT LOGS & HEALTH CHECK
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Log action to audit trail in Supabase
   * @param {string} action
   * @param {string} details
   * @param {object} actor
   * @returns {Promise<boolean>}
   */
  async logAudit(action, details = "", actor = {}) {
    const supabase = await getSupabaseClient();
    if (!supabase) return false;

    try {
      const actorName = actor?.name || actor?.email || "System User";
      const actorRole = actor?.role || "UNKNOWN";
      const target = actor?.branchName || actor?.branchId || null;

      await supabase.from("audit_logs").insert([
        {
          action: action || "ACTION",
          details: details || "",
          actor_name: actorName,
          actor_role: actorRole,
          target: target,
          created_at: new Date().toISOString()
        }
      ]);
      return true;
    } catch (err) {
      console.warn("[SupabaseService] logAudit failed:", err);
      return false;
    }
  }

  /**
   * Fetch audit trail logs from Supabase
   * @param {number} limit
   * @returns {Promise<Array<object>>}
   */
  async fetchAuditLogs(limit = 50) {
    const supabase = await getSupabaseClient();
    if (!supabase) return [];

    try {
      const { data, error } = await supabase
        .from("audit_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) return [];
      return data || [];
    } catch {
      return [];
    }
  }

  /**
   * Health check to test live connectivity with Supabase Cloud
   * @returns {Promise<{ connected: boolean, message: string }>}
   */
  async checkConnection() {
    if (!this.isAvailable()) {
      return { connected: false, message: "Kredensial Supabase belum diatur." };
    }

    const supabase = await getSupabaseClient();
    if (!supabase) {
      return { connected: false, message: "Gagal memuat client Supabase dari CDN." };
    }

    try {
      const { count, error } = await supabase
        .from("branches")
        .select("*", { count: "exact", head: true });

      if (error) {
        return { connected: false, message: `Database error: ${error.message}` };
      }

      return { connected: true, message: `Terhubung ke PostgreSQL Supabase (${count || 0} cabang).` };
    } catch (err) {
      return { connected: false, message: `Koneksi gagal: ${err.message || err}` };
    }
  }
}

export const supabaseService = new SupabaseService();


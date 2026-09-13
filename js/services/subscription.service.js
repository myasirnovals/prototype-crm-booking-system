/**
 * Cliniva — Subscription & Billing Service
 * SOLID: Single Responsibility Principle for SaaS Subscriptions, Branch Quota,
 * Order Pricing Calculation, Payment Verification, and Invoicing.
 */

import { storageService } from "./storage.service.js";
import { getTemplateById } from "../config/templates/index.js";
import { getSupabaseClient } from "../config/supabase.js";

class SubscriptionService {
  constructor() {
    this.STORAGE_SUBS_KEY = "cliniva_owner_subscriptions";
    this.STORAGE_PAYMENTS_KEY = "cliniva_payments";
    this.STORAGE_ORDERS_KEY = "cliniva_subscription_orders";
  }

  /**
   * Calculate detailed pricing breakdown for subscription order
   * @param {Object} params
   * @param {string} params.templateId - "tcm" | "wellness" | "nutrition" | "physio"
   * @param {number} params.branchQuota - Number of branches (e.g. 1, 2, 3, 5)
   * @param {number} params.durationMonths - 1, 6, 12, 24
   * @param {"SGD" | "MYR"} [params.currency="SGD"]
   * @returns {Object} Price calculation breakdown
   */
  calculateOrderPricing({
    templateId = "wellness",
    branchQuota = 1,
    durationMonths = 12,
    currency = "SGD"
  }) {
    const template = getTemplateById(templateId);
    const quota = Math.max(1, parseInt(branchQuota, 10) || 1);
    const duration = Math.max(1, parseInt(durationMonths, 10) || 12);

    // Base monthly rate per branch
    let baseMonthly = 99.0;
    if (template && template.pricing && template.pricing.monthly) {
      baseMonthly = parseFloat(template.pricing.monthly);
    }
    if (currency === "MYR") {
      baseMonthly = Math.round(baseMonthly * 3.45); // Currency parity
    }

    // Duration discount rate
    let durationDiscountPct = 0;
    if (duration >= 24) {
      durationDiscountPct = 0.30; // 30% off for 2-year
    } else if (duration >= 12) {
      durationDiscountPct = 0.20; // 20% off for 1-year
    } else if (duration >= 6) {
      durationDiscountPct = 0.10; // 10% off for 6-month
    }

    // Volume discount rate for multiple branches
    let volumeDiscountPct = 0;
    if (quota >= 5) {
      volumeDiscountPct = 0.15; // 15% off for 5+ branches
    } else if (quota >= 2) {
      volumeDiscountPct = 0.08; // 8% off for 2-4 branches
    }

    const effectiveRatePerBranchPerMonth = baseMonthly * (1 - durationDiscountPct) * (1 - volumeDiscountPct);
    const subtotal = Math.round(quota * effectiveRatePerBranchPerMonth * duration * 100) / 100;

    // Jurisdictional tax (SG 9% GST, MY 8% SST)
    const taxRate = currency === "MYR" ? 0.08 : 0.09;
    const taxAmount = Math.round(subtotal * taxRate * 100) / 100;
    const totalAmount = Math.round((subtotal + taxAmount) * 100) / 100;

    const standardTotal = baseMonthly * quota * duration;
    const totalSavings = Math.max(0, Math.round((standardTotal - subtotal) * 100) / 100);

    return {
      templateId,
      templateName: template ? template.name : "Practice Template",
      branchQuota: quota,
      durationMonths: duration,
      currency,
      baseMonthly,
      effectiveRatePerBranchPerMonth: Math.round(effectiveRatePerBranchPerMonth * 100) / 100,
      durationDiscountPct: Math.round(durationDiscountPct * 100),
      volumeDiscountPct: Math.round(volumeDiscountPct * 100),
      standardTotal,
      subtotal,
      totalSavings,
      taxRate: Math.round(taxRate * 100),
      taxAmount,
      totalAmount
    };
  }

  /**
   * Create a pending subscription order ready for review and payment
   */
  createSubscriptionOrder({
    ownerId,
    ownerEmail,
    templateId,
    branchQuota = 1,
    durationMonths = 12,
    currency = "SGD",
    branchName = "",
    brandName = ""
  }) {
    const pricing = this.calculateOrderPricing({
      templateId,
      branchQuota,
      durationMonths,
      currency
    });

    const orderId = `ord-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
    const invoiceNo = `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const order = {
      orderId,
      invoiceNo,
      ownerId,
      ownerEmail,
      templateId,
      branchQuota,
      durationMonths,
      currency,
      branchName,
      brandName,
      pricing,
      status: "PENDING",
      createdAt: new Date().toISOString()
    };

    const orders = storageService.get(this.STORAGE_ORDERS_KEY, []);
    storageService.set(this.STORAGE_ORDERS_KEY, [order, ...orders]);

    return order;
  }

  /**
   * Simulate realistic asynchronous payment processing and verification
   * Transitions order to PAID and provisions the active Subscription
   */
  async processPayment({
    orderId,
    paymentMethod = "CREDIT_CARD",
    paymentDetails = {}
  }) {
    const orders = storageService.get(this.STORAGE_ORDERS_KEY, []);
    const orderIndex = orders.findIndex((o) => o.orderId === orderId);

    if (orderIndex === -1) {
      throw new Error(`Order #${orderId} not found`);
    }

    const order = orders[orderIndex];

    // Simulate payment gateway handshake delay
    await new Promise((resolve) => setTimeout(resolve, 1100));

    const paidAt = new Date().toISOString();
    const expiresAt = new Date(Date.now() + order.durationMonths * 30 * 24 * 60 * 60 * 1000).toISOString();

    // 1. Create Verified Subscription Record
    const subscriptionId = `sub-${order.templateId}-${Date.now()}`;
    const subscription = {
      id: subscriptionId,
      orderId: order.orderId,
      invoiceNo: order.invoiceNo,
      ownerId: order.ownerId,
      ownerEmail: order.ownerEmail,
      template: order.templateId,
      templateName: order.pricing.templateName,
      brandName: order.brandName || "",
      branchQuota: order.branchQuota,
      usedBranchCount: 0,
      branchIds: [],
      durationMonths: order.durationMonths,
      amount: order.pricing.totalAmount,
      currency: order.currency,
      paymentMethod,
      gateway: paymentMethod === "PAYNOW_SG"
        ? "PayNow SG Instant QR"
        : paymentMethod === "FPX_MY"
        ? "DuitNow / FPX Online Banking"
        : paymentMethod === "BANK_TRANSFER"
        ? "Corporate Wire Transfer"
        : "Corporate Visa / Mastercard",
      status: "ACTIVE",
      paidAt,
      expiresAt,
      createdAt: paidAt
    };

    // 2. Create Payment Transaction Receipt Record
    const paymentReceipt = {
      id: `pay-${Date.now()}`,
      subscriptionId,
      orderId: order.orderId,
      invoiceNo: order.invoiceNo,
      ownerId: order.ownerId,
      ownerEmail: order.ownerEmail,
      amount: order.pricing.totalAmount,
      currency: order.currency,
      subtotal: order.pricing.subtotal,
      taxAmount: order.pricing.taxAmount,
      paymentMethod,
      gateway: subscription.gateway,
      last4: paymentDetails.last4 || (paymentMethod === "CREDIT_CARD" ? "4242" : "N/A"),
      status: "PAID",
      paidAt
    };

    // 3. Persist Updated Collections
    order.status = "PAID";
    order.subscriptionId = subscriptionId;
    order.paidAt = paidAt;
    orders[orderIndex] = order;
    storageService.set(this.STORAGE_ORDERS_KEY, orders);

    const subscriptions = storageService.get(this.STORAGE_SUBS_KEY, []);
    storageService.set(this.STORAGE_SUBS_KEY, [subscription, ...subscriptions]);

    const payments = storageService.get(this.STORAGE_PAYMENTS_KEY, []);
    storageService.set(this.STORAGE_PAYMENTS_KEY, [paymentReceipt, ...payments]);

    // 4. Sync to Supabase Cloud if connected
    this._syncToSupabase(subscription, paymentReceipt);

    return {
      success: true,
      subscription,
      paymentReceipt,
      order
    };
  }

  /**
   * Get all subscriptions belonging to an Owner
   * Automatically reconciles with legacy branches if none exist
   */
  getOwnerSubscriptions(ownerId) {
    const allSubs = storageService.get(this.STORAGE_SUBS_KEY, []);
    let ownerSubs = allSubs;
    if (ownerId) {
      ownerSubs = allSubs.filter((s) => s.ownerId === ownerId || !s.ownerId);
    }

    // Reconcile if owner has existing branches but no subscription records yet
    if (ownerSubs.length === 0) {
      const branches = storageService.get("cliniva_branches", []);
      if (branches.length > 0) {
        const synthesizedSubs = this._synthesizeSubscriptionsFromBranches(branches, ownerId);
        storageService.set(this.STORAGE_SUBS_KEY, synthesizedSubs);
        return synthesizedSubs;
      }
    }

    // Update usedBranchCount based on real branches currently assigned
    const currentBranches = storageService.get("cliniva_branches", []);
    let updated = false;

    ownerSubs.forEach((sub) => {
      const assigned = currentBranches.filter((b) => {
        if (sub.branchIds && sub.branchIds.includes(b.id)) return true;
        // Fallback match by template if branchIds not yet wired
        if (b.subscriptionId === sub.id) return true;
        if (!b.subscriptionId && b.template === sub.template) return true;
        return false;
      });

      const assignedIds = assigned.map((b) => b.id);
      if (sub.usedBranchCount !== assignedIds.length || JSON.stringify(sub.branchIds) !== JSON.stringify(assignedIds)) {
        sub.branchIds = assignedIds;
        sub.usedBranchCount = assignedIds.length;
        updated = true;
      }
    });

    if (updated) {
      storageService.set(this.STORAGE_SUBS_KEY, allSubs);
    }

    return ownerSubs;
  }

  /**
   * Get all active subscriptions that can accept new branches
   */
  getActiveSubscriptions(ownerId) {
    const subs = this.getOwnerSubscriptions(ownerId);
    const now = new Date();
    return subs.filter((s) => s.status === "ACTIVE" && new Date(s.expiresAt) > now);
  }

  /**
   * Check remaining branch quota for a specific subscription
   */
  checkBranchQuota(subscriptionId) {
    const allSubs = storageService.get(this.STORAGE_SUBS_KEY, []);
    const sub = allSubs.find((s) => s.id === subscriptionId);

    if (!sub) {
      return {
        totalQuota: 0,
        usedCount: 0,
        remainingQuota: 0,
        canAddBranch: false,
        isExpired: false
      };
    }

    const isExpired = sub.status !== "ACTIVE" || new Date(sub.expiresAt) <= new Date();
    const totalQuota = sub.branchQuota || 1;
    const usedCount = (sub.branchIds && sub.branchIds.length) || sub.usedBranchCount || 0;
    const remainingQuota = Math.max(0, totalQuota - usedCount);

    return {
      subscription: sub,
      totalQuota,
      usedCount,
      remainingQuota,
      canAddBranch: !isExpired && remainingQuota > 0,
      isExpired
    };
  }

  /**
   * Assign a newly created branch to a parent subscription, consuming 1 quota slot
   * and enforcing template inheritance
   */
  assignBranchToSubscription(subscriptionId, branch) {
    const allSubs = storageService.get(this.STORAGE_SUBS_KEY, []);
    const subIndex = allSubs.findIndex((s) => s.id === subscriptionId);

    if (subIndex === -1) {
      throw new Error(`Subscription #${subscriptionId} not found`);
    }

    const sub = allSubs[subIndex];
    if (!sub.branchIds) sub.branchIds = [];

    if (!sub.branchIds.includes(branch.id)) {
      sub.branchIds.push(branch.id);
      sub.usedBranchCount = sub.branchIds.length;
    }

    allSubs[subIndex] = sub;
    storageService.set(this.STORAGE_SUBS_KEY, allSubs);

    // Update branch to reference parent subscription and lock template
    branch.subscriptionId = sub.id;
    branch.template = sub.template; // STRICT INHERITANCE
    branch.status = "ACTIVE"; // Only active because parent sub is verified and active!

    // Generate prototype landing page link
    branch.landingUrl = this.generateBranchLandingUrl(branch.code || branch.id, branch.name);

    return {
      success: true,
      subscription: sub,
      branch
    };
  }

  /**
   * Extend an existing subscription (Renewal)
   */
  async renewSubscription(subscriptionId, additionalMonths = 12, paymentMethod = "CREDIT_CARD") {
    const allSubs = storageService.get(this.STORAGE_SUBS_KEY, []);
    const subIndex = allSubs.findIndex((s) => s.id === subscriptionId);

    if (subIndex === -1) throw new Error("Subscription not found");

    const sub = allSubs[subIndex];
    const pricing = this.calculateOrderPricing({
      templateId: sub.template,
      branchQuota: sub.branchQuota,
      durationMonths: additionalMonths,
      currency: sub.currency
    });

    await new Promise((resolve) => setTimeout(resolve, 800));

    const currentExpiry = new Date(sub.expiresAt) > new Date() ? new Date(sub.expiresAt) : new Date();
    const newExpiry = new Date(currentExpiry.getTime() + additionalMonths * 30 * 24 * 60 * 60 * 1000);

    sub.expiresAt = newExpiry.toISOString();
    sub.durationMonths = (sub.durationMonths || 0) + additionalMonths;
    sub.status = "ACTIVE";

    allSubs[subIndex] = sub;
    storageService.set(this.STORAGE_SUBS_KEY, allSubs);

    // Generate renewal invoice & receipt
    const invoiceNo = `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const paymentReceipt = {
      id: `pay-${Date.now()}`,
      subscriptionId: sub.id,
      invoiceNo,
      ownerId: sub.ownerId,
      ownerEmail: sub.ownerEmail,
      amount: pricing.totalAmount,
      currency: sub.currency,
      subtotal: pricing.subtotal,
      taxAmount: pricing.taxAmount,
      paymentMethod,
      gateway: sub.gateway,
      status: "PAID",
      paidAt: new Date().toISOString()
    };

    const payments = storageService.get(this.STORAGE_PAYMENTS_KEY, []);
    storageService.set(this.STORAGE_PAYMENTS_KEY, [paymentReceipt, ...payments]);

    return {
      success: true,
      subscription: sub,
      paymentReceipt
    };
  }

  /**
   * Add branch quota to an active subscription
   */
  async addBranchQuotaToSubscription(subscriptionId, additionalQuota = 1, paymentMethod = "CREDIT_CARD") {
    const allSubs = storageService.get(this.STORAGE_SUBS_KEY, []);
    const subIndex = allSubs.findIndex((s) => s.id === subscriptionId);

    if (subIndex === -1) throw new Error("Subscription not found");

    const sub = allSubs[subIndex];
    const quotaToAdd = Math.max(1, parseInt(additionalQuota, 10) || 1);

    // Calculate pro-rated or standard fee for added branches
    const pricing = this.calculateOrderPricing({
      templateId: sub.template,
      branchQuota: quotaToAdd,
      durationMonths: sub.durationMonths || 12,
      currency: sub.currency
    });

    await new Promise((resolve) => setTimeout(resolve, 800));

    sub.branchQuota = (sub.branchQuota || 1) + quotaToAdd;
    allSubs[subIndex] = sub;
    storageService.set(this.STORAGE_SUBS_KEY, allSubs);

    const invoiceNo = `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const paymentReceipt = {
      id: `pay-${Date.now()}`,
      subscriptionId: sub.id,
      invoiceNo,
      ownerId: sub.ownerId,
      ownerEmail: sub.ownerEmail,
      amount: pricing.totalAmount,
      currency: sub.currency,
      subtotal: pricing.subtotal,
      taxAmount: pricing.taxAmount,
      paymentMethod,
      gateway: sub.gateway,
      status: "PAID",
      paidAt: new Date().toISOString()
    };

    const payments = storageService.get(this.STORAGE_PAYMENTS_KEY, []);
    storageService.set(this.STORAGE_PAYMENTS_KEY, [paymentReceipt, ...payments]);

    return {
      success: true,
      subscription: sub,
      paymentReceipt
    };
  }

  /**
   * Generate clean prototype subdomain / URL for active branch
   * e.g. https://orchard-flagship.cliniva.app
   */
  generateBranchLandingUrl(branchCode, branchName) {
    const slug = (branchName || branchCode || "branch")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    return `https://${slug}.cliniva.app`;
  }

  /**
   * Internal helper: Synthesize initial subscriptions for legacy branch records
   */
  _synthesizeSubscriptionsFromBranches(branches, ownerId) {
    const subs = [];
    const templateGroups = {};

    branches.forEach((branch) => {
      const tmpl = branch.template || "wellness";
      if (!templateGroups[tmpl]) templateGroups[tmpl] = [];
      templateGroups[tmpl].push(branch);
    });

    Object.entries(templateGroups).forEach(([tmpl, branchList]) => {
      const quota = Math.max(branchList.length, 2);
      const subId = `sub-${tmpl}-${Date.now()}`;
      const template = getTemplateById(tmpl);

      branchList.forEach((b) => {
        b.subscriptionId = subId;
        b.template = tmpl;
        if (!b.landingUrl) {
          b.landingUrl = this.generateBranchLandingUrl(b.code || b.id, b.name);
        }
      });

      subs.push({
        id: subId,
        invoiceNo: `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        ownerId: ownerId || null,
        ownerEmail: "owner@cliniva.com",
        template: tmpl,
        templateName: template ? template.name : tmpl.toUpperCase(),
        branchQuota: quota,
        usedBranchCount: branchList.length,
        branchIds: branchList.map((b) => b.id),
        durationMonths: 12,
        amount: 948.0,
        currency: "SGD",
        gateway: "Corporate Stripe / PayNow SG",
        status: "ACTIVE",
        paidAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
        expiresAt: new Date(Date.now() + 340 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString()
      });
    });

    storageService.set("cliniva_branches", branches);
    return subs;
  }

  /**
   * Sync to Supabase Cloud if configured
   */
  async _syncToSupabase(subscription, paymentReceipt) {
    if (!storageService.isCloudMode()) return;
    try {
      const client = await getSupabaseClient();
      if (!client) return;

      await client.from("owner_subscriptions").upsert({
        id: subscription.id,
        owner_id: subscription.ownerId,
        template_id: subscription.template,
        branch_quota: subscription.branchQuota,
        duration_months: subscription.durationMonths,
        amount: subscription.amount,
        currency: subscription.currency,
        status: subscription.status,
        paid_at: subscription.paidAt,
        expires_at: subscription.expiresAt
      });

      await client.from("payments").upsert({
        id: paymentReceipt.id,
        subscription_id: paymentReceipt.subscriptionId,
        invoice_no: paymentReceipt.invoiceNo,
        amount: paymentReceipt.amount,
        currency: paymentReceipt.currency,
        status: paymentReceipt.status,
        gateway: paymentReceipt.gateway,
        paid_at: paymentReceipt.paidAt
      });
    } catch (err) {
      console.warn("[SubscriptionService] Cloud sync fallback to local storage", err);
    }
  }
}

export const subscriptionService = new SubscriptionService();

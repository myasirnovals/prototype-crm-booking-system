import { supabaseService } from '../../../../js/services/supabase.service.js';

// Serenity & Soul - Spa Application Prototype JS
// Branch initialization managed by Cliniva SaaS Platform (Single-tenant template runtime)

export const urlParams = new URLSearchParams(window.location.search);
export const targetBranchId = urlParams.get('branch') || urlParams.get('id') || 'default-spa';
export const tenantId = targetBranchId;
export const branchId = targetBranchId;
window.currentTenantId = tenantId;
window.currentBranchId = branchId;

// Single default theme configuration for Spa template
export const DEFAULT_SPA_THEME = {
  id: 'default-spa',
  name: 'Serenity & Soul',
  tagline: 'Holistic rejuvenation, aromatherapy indulgence & deep muscle stress relief',
  logo: '',
  address: '290 Orchard Road, Paragon Medical #14-02, Singapore 238859',
  phone: '+65 6738 1234',
  hours: 'Mon - Sat (09:00 - 20:00 SGT)',
  currency: 'SGD',
  colors: {
    primary: '#50613f',
    secondary: '#fed65b',
    background: '#f4fbfa',
    surfaceContainer: '#e8efef'
  }
};

let clinivaBranch = null;
try {
  const clinivaBranches = JSON.parse(localStorage.getItem('cliniva_branches')) || [];
  if (Array.isArray(clinivaBranches) && clinivaBranches.length > 0) {
    clinivaBranch = clinivaBranches.find(b => 
      (b.id && b.id.toLowerCase() === targetBranchId.toLowerCase()) ||
      (b.name && b.name.toLowerCase() === targetBranchId.toLowerCase())
    );
    if (!clinivaBranch && (targetBranchId === 'default-spa' || targetBranchId === 'serenity')) {
      clinivaBranch = clinivaBranches.find(b => b.template === 'wellness' || b.template === 'spa');
    }
  }
} catch (e) {
  console.warn('[Branch] cliniva_branches lookup error:', e);
}

export const currentBranch = clinivaBranch ? {
  id: clinivaBranch.id,
  name: clinivaBranch.name || DEFAULT_SPA_THEME.name,
  tagline: clinivaBranch.tagline || DEFAULT_SPA_THEME.tagline,
  logo: clinivaBranch.logo || DEFAULT_SPA_THEME.logo,
  address: clinivaBranch.address || DEFAULT_SPA_THEME.address,
  phone: clinivaBranch.phone || DEFAULT_SPA_THEME.phone,
  hours: clinivaBranch.hours || clinivaBranch.operatingHours || DEFAULT_SPA_THEME.hours,
  currency: clinivaBranch.currency || DEFAULT_SPA_THEME.currency,
  colors: clinivaBranch.colors || DEFAULT_SPA_THEME.colors
} : { ...DEFAULT_SPA_THEME };

// Backward-compatible aliases for existing view/controller imports
export const currentTenant = currentBranch;
export const DEFAULT_TENANTS = { [currentBranch.id]: currentBranch };
export const tenants = DEFAULT_TENANTS;

window.currentTenant = currentTenant;
window.currentBranch = currentBranch;

/**
 * Live Supabase Branch Sync Provider
 * Asynchronously checks Supabase cloud for real-time branch profile updates
 */
export async function initBranchFromSupabase() {
  try {
    const dbBranch = await supabaseService.fetchBranchByIdOrSlug(targetBranchId);
    if (dbBranch) {
      currentBranch.id = dbBranch.id;
      currentBranch.name = dbBranch.name || currentBranch.name;
      currentBranch.address = dbBranch.address || currentBranch.address;
      currentBranch.phone = dbBranch.phone || currentBranch.phone;
      currentBranch.hours = dbBranch.hours || currentBranch.hours;
      currentBranch.currency = dbBranch.currency || currentBranch.currency;
      if (dbBranch.tagline) currentBranch.tagline = dbBranch.tagline;
      if (dbBranch.logo) currentBranch.logo = dbBranch.logo;

      window.currentBranch = currentBranch;
      window.currentTenant = currentBranch;

      console.info('[Tenant] Synced branch from Supabase Cloud:', dbBranch.id, dbBranch.name);
      window.dispatchEvent(new CustomEvent('cliniva:branch-updated', { detail: currentBranch }));
      return currentBranch;
    }
  } catch (err) {
    console.warn('[Tenant] Supabase branch sync fallback:', err);
  }
  return currentBranch;
}

// Trigger async live sync on load
if (typeof window !== 'undefined') {
  initBranchFromSupabase();
}

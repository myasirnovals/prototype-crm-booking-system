// TCM Homecare - Traditional Chinese Medicine with Modern Technology Template
// Branch initialization managed by Cliniva SaaS Platform (Single-tenant template runtime)

export const urlParams = new URLSearchParams(window.location.search);
export const targetBranchId = urlParams.get('branch') || urlParams.get('id') || 'default-tcm';
export const tenantId = targetBranchId;
export const branchId = targetBranchId;
window.currentTenantId = tenantId;
window.currentBranchId = branchId;

// Single default theme configuration for TCM template (TCM Homecare style)
export const DEFAULT_TCM_THEME = {
  id: 'default-tcm',
  name: 'TCM Homecare',
  tagline: 'Personalized Treatments for Your Wellness & Modern Homecare',
  logo: 'https://tcmhomecare.com/wp-content/uploads/2024/03/TCMHomecare_logo.svg',
  address: '1 Irving Place #07-04, The Commerze @ Irving, Singapore 369546',
  phone: '+65 8752 5958',
  hours: 'Mon - Fri (09:00 - 17:00 SGT), Sat by Appointment',
  currency: 'SGD',
  colors: {
    primary: '#046bd2',
    secondary: '#00a86b',
    accent: '#ff6900',
    background: '#f0f5fa',
    surfaceContainer: '#e8f2fc'
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
    if (!clinivaBranch && (targetBranchId === 'default-tcm' || targetBranchId === 'yong-kang' || targetBranchId === 'tcm')) {
      clinivaBranch = clinivaBranches.find(b => b.template === 'tcm');
    }
  }
} catch (e) {
  console.warn('[Branch] cliniva_branches lookup error:', e);
}

export const currentBranch = clinivaBranch ? {
  id: clinivaBranch.id,
  name: clinivaBranch.name || DEFAULT_TCM_THEME.name,
  tagline: clinivaBranch.tagline || DEFAULT_TCM_THEME.tagline,
  logo: clinivaBranch.logo || DEFAULT_TCM_THEME.logo,
  address: clinivaBranch.address || DEFAULT_TCM_THEME.address,
  phone: clinivaBranch.phone || DEFAULT_TCM_THEME.phone,
  hours: clinivaBranch.hours || clinivaBranch.operatingHours || DEFAULT_TCM_THEME.hours,
  currency: clinivaBranch.currency || DEFAULT_TCM_THEME.currency,
  colors: clinivaBranch.colors || DEFAULT_TCM_THEME.colors
} : DEFAULT_TCM_THEME;

// Backward-compatible aliases for existing view/controller imports
export const currentTenant = currentBranch;
export const DEFAULT_TENANTS = { [currentBranch.id]: currentBranch };
export const tenants = DEFAULT_TENANTS;

window.currentTenant = currentTenant;
window.currentBranch = currentBranch;


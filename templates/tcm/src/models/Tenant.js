// Yong Kang TCM & Acupuncture - Traditional Chinese Medicine Template
// Branch initialization managed by Cliniva SaaS Platform (Single-tenant template runtime)

export const urlParams = new URLSearchParams(window.location.search);
export const targetBranchId = urlParams.get('branch') || urlParams.get('id') || 'default-tcm';
export const tenantId = targetBranchId;
export const branchId = targetBranchId;
window.currentTenantId = tenantId;
window.currentBranchId = branchId;

// Single default theme configuration for TCM template
export const DEFAULT_TCM_THEME = {
  id: 'default-tcm',
  name: 'Yong Kang TCM & Acupuncture',
  tagline: 'Authentic Traditional Chinese Medicine, Acupuncture & Herbal Healing',
  logo: '',
  address: '88 Pagoda Street, Chinatown, Singapore',
  phone: '+65 6223 8899',
  hours: 'Mon - Sun (09:30 - 19:30 SGT)',
  currency: 'SGD',
  colors: {
    primary: '#164e3f',
    secondary: '#c89d53',
    background: '#faf8f5',
    surfaceContainer: '#f0eae1'
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


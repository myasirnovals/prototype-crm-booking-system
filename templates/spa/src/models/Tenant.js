// Serenity & Soul - Spa Application Prototype JS

// Dynamic Tenant initialization
export const urlParams = new URLSearchParams(window.location.search);
export const targetBranchId = urlParams.get('branch') || urlParams.get('id') || urlParams.get('tenant') || 'serenity';
export const tenantId = targetBranchId;
window.currentTenantId = tenantId;

export const DEFAULT_TENANTS = {
  serenity: {
    id: 'serenity',
    name: 'Serenity & Soul',
    logo: 'Serenity',
    colors: {
      primary: '#50613f',
      secondary: '#fed65b',
      background: '#f4fbfa',
      surfaceContainer: '#e8efef'
    }
  },
  zenith: {
    id: 'zenith',
    name: 'Zenith Wellness',
    logo: 'Zenith',
    colors: {
      primary: '#1e40af',
      secondary: '#f59e0b',
      background: '#f8fafc',
      surfaceContainer: '#f1f5f9'
    }
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
    if (!clinivaBranch && targetBranchId === 'serenity') {
      clinivaBranch = clinivaBranches.find(b => b.template === 'wellness' || b.template === 'spa');
    }
  }
} catch (e) {
  console.warn('[Tenant] cliniva_branches lookup error:', e);
}

export const tenants = JSON.parse(localStorage.getItem('spa_tenants')) || DEFAULT_TENANTS;
export const currentTenant = clinivaBranch ? {
  id: clinivaBranch.id,
  name: clinivaBranch.name || 'Dennis Spa',
  tagline: clinivaBranch.tagline || 'Holistic rejuvenation, aromatherapy indulgence & deep muscle stress relief',
  logo: clinivaBranch.logo || '🌸',
  address: clinivaBranch.address || '3 LENGKOK MERAK, Singapore',
  phone: clinivaBranch.phone || '+65 6738 1234',
  hours: clinivaBranch.hours || clinivaBranch.operatingHours || 'Mon - Sat (09:00 - 20:00 SGT)',
  currency: clinivaBranch.currency || 'SGD',
  colors: DEFAULT_TENANTS.serenity.colors
} : (tenants[targetBranchId] || tenants['serenity']);

window.currentTenant = currentTenant;

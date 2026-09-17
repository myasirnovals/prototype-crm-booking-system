/**
 * branch-resolver.js
 * Multi-tenant branch context resolver & navbar link synchronizer
 * Ensures brand identity, booking buttons, and navigation stay consistent across all pages.
 */

export function resolveBranch() {
  const urlParams = new URLSearchParams(window.location.search);
  const targetBranchId = urlParams.get('branch') || urlParams.get('id') || 'default-pt';

  const DEFAULT_PT_THEME = {
    id: 'default-pt',
    name: 'Elite Trainer & Performance',
    tagline: 'Dedicated 1-on-1 fitness coaching, physique transformation, and athletic performance training',
    logo: '',
    address: '290 Orchard Road, Paragon Fitness Suites #08-01, Singapore 238859',
    phone: '+65 6738 1234',
    hours: 'Mon - Sun (06:00 - 22:00 SGT)',
    currency: 'SGD'
  };

  let clinivaBranch = null;
  try {
    const clinivaBranches = JSON.parse(localStorage.getItem('cliniva_branches')) || [];
    if (Array.isArray(clinivaBranches) && clinivaBranches.length > 0) {
      clinivaBranch = clinivaBranches.find(b => 
        (b.id && b.id.toLowerCase() === targetBranchId.toLowerCase()) ||
        (b.name && b.name.toLowerCase() === targetBranchId.toLowerCase())
      );
      if (!clinivaBranch && (targetBranchId === 'default-pt' || targetBranchId === 'fitness' || targetBranchId === 'personal-trainer' || targetBranchId === 'pt')) {
        clinivaBranch = clinivaBranches.find(b => 
          b.template === 'personal-trainer' || b.template === 'fitness' || b.template === 'pt' || b.template === 'personal_trainer'
        );
      }
    }
  } catch (e) {
    console.warn('[PersonalTrainer] cliniva_branches lookup error:', e);
  }

  const currentTenant = clinivaBranch ? {
    id: clinivaBranch.id,
    name: clinivaBranch.name || DEFAULT_PT_THEME.name,
    tagline: clinivaBranch.tagline || DEFAULT_PT_THEME.tagline,
    logo: clinivaBranch.logo || DEFAULT_PT_THEME.logo,
    address: clinivaBranch.address || DEFAULT_PT_THEME.address,
    phone: clinivaBranch.phone || DEFAULT_PT_THEME.phone,
    hours: clinivaBranch.hours || clinivaBranch.operatingHours || DEFAULT_PT_THEME.hours,
    currency: clinivaBranch.currency || DEFAULT_PT_THEME.currency
  } : DEFAULT_PT_THEME;

  window.currentTenant = currentTenant;
  window.currentBranch = currentTenant;

  applyBranchBranding(currentTenant);
  syncNavigationLinks(currentTenant);

  return currentTenant;
}

export function applyBranchBranding(tenant) {
  if (!tenant) return;

  // Update brand name text everywhere
  const brandEls = document.querySelectorAll('#pt-brand-name, .pt-brand-name');
  brandEls.forEach(el => {
    el.textContent = tenant.name;
    // Remove data-i18n attribute so i18n translation does not overwrite custom branch name
    el.removeAttribute('data-i18n');
  });

  // Update brand tagline if element exists
  const taglineEl = document.getElementById('pt-brand-tagline');
  if (taglineEl && tenant.tagline) {
    taglineEl.textContent = tenant.tagline;
  }

  // Update document title if needed
  if (tenant.name && !document.title.includes(tenant.name)) {
    const pipeIdx = document.title.indexOf('|');
    const suffix = pipeIdx !== -1 ? document.title.substring(pipeIdx) : `| ${tenant.tagline || 'Elevate Your Fitness'}`;
    document.title = `${tenant.name} ${suffix}`;
  }
}

export function syncNavigationLinks(tenant) {
  if (!tenant || !tenant.id) return;

  const branchParam = `branch=${encodeURIComponent(tenant.id)}`;

  // Helper to preserve or append branch param to relative href
  function appendBranch(href) {
    if (!href || href.startsWith('#') || href.startsWith('javascript:')) return href;
    const parts = href.split('#');
    let path = parts[0];
    const hash = parts.length > 1 ? `#${parts[1]}` : '';

    if (path.includes('branch=')) return href; // Already has branch

    const sep = path.includes('?') ? '&' : '?';
    return `${path}${sep}${branchParam}${hash}`;
  }

  // Synchronize Book Session buttons
  const bookBtns = document.querySelectorAll('#pt-nav-book-btn, #pt-mob-book-btn, a[href*="app.html#booking"], a[href*="app.html"]');
  bookBtns.forEach(btn => {
    btn.href = `./app.html?${branchParam}#booking`;
  });

  // Synchronize internal page links
  const internalLinks = document.querySelectorAll('a[href^="./"], a[href^="about.html"], a[href^="index.html"], a[href^="login.html"]');
  internalLinks.forEach(link => {
    const rawHref = link.getAttribute('href');
    if (rawHref && !rawHref.includes('app.html')) {
      link.href = appendBranch(rawHref);
    }
  });
}

import { changeLanguage, translateDOM } from './i18n.js';
import { resolveBranch, applyBranchBranding, syncNavigationLinks } from './branch-resolver.js';

const select = document.getElementById('lang-select');
const mobileSelect = document.getElementById('mobile-lang-select');

const current = localStorage.getItem('lang') || 'en';
if (select) select.value = current;
if (mobileSelect) mobileSelect.value = current;

const tenant = resolveBranch();

function applyLang(lng) {
    changeLanguage(lng);
    if (select) select.value = lng;
    if (mobileSelect) mobileSelect.value = lng;
    applyBranchBranding(tenant);
    syncNavigationLinks(tenant);
}

if (select) select.addEventListener('change', (e) => applyLang(e.target.value));
if (mobileSelect) mobileSelect.addEventListener('change', (e) => applyLang(e.target.value));

translateDOM();
applyBranchBranding(tenant);
syncNavigationLinks(tenant);
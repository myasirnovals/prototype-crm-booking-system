const fs = require('fs');
const path = require('path');

const code = fs.readFileSync('src/main.old.js', 'utf8');
const lines = code.split(/\r?\n/);

const sections = [
    { name: 'Tenant.js', startLine: 1, endLine: 35, type: 'models' },
    { name: 'Database.js', startLine: 36, endLine: 372, type: 'models' },
    { name: 'Translations.js', startLine: 373, endLine: 773, type: 'models' },
    { name: 'State.js', startLine: 774, endLine: 916, type: 'models' },
    { name: 'AuthController.js', startLine: 917, endLine: 1005, type: 'controllers' },
    { name: 'Router.js', startLine: 1006, endLine: 1229, type: 'controllers' },
    { name: 'Renderers.js', startLine: 1230, endLine: 2389, type: 'views' },
    { name: 'SidebarSummary.js', startLine: 2390, endLine: 2666, type: 'views' },
    { name: 'BookingController.js', startLine: 2667, endLine: 2822, type: 'controllers' },
    { name: 'Toast.js', startLine: 2823, endLine: 2850, type: 'views' },
    { name: 'ProfileViews.js', startLine: 2851, endLine: 4529, type: 'views' },
    { name: 'CatalogViews.js', startLine: 4530, endLine: 4689, type: 'views' },
    { name: 'PaymentModal.js', startLine: 4690, endLine: 4842, type: 'views' },
    { name: 'PackageViews.js', startLine: 4843, endLine: 5352, type: 'views' },
    { name: 'AppInit.js', startLine: 5353, endLine: lines.length, type: 'controllers' }
];

const allImports = `
import { tenantId, currentTenant, DEFAULT_TENANTS } from '../models/Tenant.js';
import { SERVICES, THERAPISTS, getSharedData, syncServices, syncTherapists } from '../models/Database.js';
import { TRANSLATIONS, t, getServiceTranslation, translateStaticHtml, toggleLanguage } from '../models/Translations.js';
import { DEFAULT_STATE, state, loadState, saveState } from '../models/State.js';
import { isLoggedIn, updateNavbarAuth } from '../controllers/AuthController.js';
import { navigateTo, updateTenantLinks, updateNavbarActiveState, updateStepperUI, navigateToAllServicesWithFilter } from '../controllers/Router.js';
import { renderActiveViewContents, updateHeaderWalletDisplay, renderHomeView, renderServicesCatalogView, renderSelectServiceView, renderSelectTherapistView, renderSelectTimeView, renderConfirmBookingView, renderActivePackagesWidget, renderPaymentMethodSelection, startBookingWithService } from '../views/Renderers.js';
import { renderSidebarSummary, renderSuccessView } from '../views/SidebarSummary.js';
import { resetBookingFlow, nextStep, prevStep } from '../controllers/BookingController.js';
import { showToast } from '../views/Toast.js';
import { renderProfileView, renderWalletView, renderTopupView, renderPersonalDetailsView, renderBookingHistoryView, renderNotificationsView, renderPrivacySecurityView, renderRescheduleView } from '../views/ProfileViews.js';
import { renderAllServicesView } from '../views/CatalogViews.js';
import { openPaymentMethodsModal, closePaymentMethodsModal } from '../views/PaymentModal.js';
import { renderBookPackageView, renderActivePackagesView, showQrCode } from '../views/PackageViews.js';
`;

for (const section of sections) {
    let sectionLines = lines.slice(section.startLine - 1, section.endLine);
    let content = sectionLines.join('\n');
    
    // 1. Convert top-level declarations to export
    content = content.replace(/^(const|let|var|function)\s+([a-zA-Z0-9_]+)/gm, 'export $1 $2');

    // 2. Convert window.funcName = function(...) to export function funcName(...) and add window.funcName = funcName
    content = content.replace(/window\.([a-zA-Z0-9_]+)\s*=\s*function\s*\((.*?)\)\s*\{/g, (match, funcName, args) => {
        return `export function ${funcName}(${args}) {\n    window.${funcName} = ${funcName};`;
    });

    // Special fix for Translations.js to remove duplicate t() function
    if (section.name === 'Translations.js') {
        content = content.replace(/export function t\(key\) \{\s*return window\.t\(key\);\s*\}/g, '');
    }
    
    // Ensure folders exist
    const folder = `src/${section.type}`;
    if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder, { recursive: true });
    }

    // Prepare imports for this file
    const fileImports = allImports.split('\n')
        .filter(line => line.trim() !== '' && !line.includes(`../${section.type}/${section.name}`))
        .join('\n');
    
    fs.writeFileSync(`${folder}/${section.name}`, fileImports + '\n\n' + content, 'utf8');
}

// Generate the new main.js that imports everything
const imports = sections.map(s => `import './${s.type}/${s.name}';`).join('\n');
fs.writeFileSync('src/main.js', imports + '\n\nconsole.log("MVC initialized");', 'utf8');

console.log('Rebuilt successfully.');

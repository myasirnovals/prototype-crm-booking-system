const fs = require('fs');
const path = require('path');

const files = [
    { name: 'Tenant.js', type: 'models' },
    { name: 'Database.js', type: 'models' },
    { name: 'Translations.js', type: 'models' },
    { name: 'State.js', type: 'models' },
    { name: 'AuthController.js', type: 'controllers' },
    { name: 'Router.js', type: 'controllers' },
    { name: 'Renderers.js', type: 'views' },
    { name: 'SidebarSummary.js', type: 'views' },
    { name: 'BookingController.js', type: 'controllers' },
    { name: 'Toast.js', type: 'views' },
    { name: 'ProfileViews.js', type: 'views' },
    { name: 'CatalogViews.js', type: 'views' },
    { name: 'PaymentModal.js', type: 'views' },
    { name: 'PackageViews.js', type: 'views' },
    { name: 'AppInit.js', type: 'controllers' }
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

for (const f of files) {
    const filePath = path.join('src', f.type, f.name);
    // Strip out the previous imports first to avoid duplication
    let content = fs.readFileSync(filePath, 'utf8');
    content = content.replace(/import \{.*\} from '.*';\n/g, '');
    
    // Make sure we don't import from ourselves
    let fileImports = allImports.split('\n').filter(line => line.trim() !== '' && !line.includes(`../${f.type}/${f.name}`)).join('\n');
    
    fs.writeFileSync(filePath, fileImports + '\n\n' + content, 'utf8');
}

console.log('Modules configured successfully.');

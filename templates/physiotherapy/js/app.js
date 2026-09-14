/* ============================================
   PhysioCare - Application Bootstrap
   Sets up model instances, mounts views, and
   registers all routes.
   ============================================ */

// ---------- Global Model Instances ----------
const ServiceModel = new Service();
const UserModel = new User();
const TherapistModel = new Therapist();
const AppointmentModel = new Appointment();
const PatientRecordModel = new PatientRecord();
const ConditionModel = new Condition();

// ---------- View Mount Helper ----------
/**
 * Mount a view object into the #app container.
 * Each view exposes an async `render()` returning an HTML string
 * and an optional `init()` called after the DOM is inserted.
 *
 * @param {Object} view - view object with render() and init() methods
 * @param {Object} params - router params (optional)
 */
async function MountView(view, params = {}) {
    const app = document.getElementById('app');
    if (!app) return;

    // Clear previous content
    app.innerHTML = '';

// Optional loading state
    app.innerHTML = `
        <div class="min-h-[60vh] flex flex-col items-center justify-center bg-background text-on-background">
            <div class="w-12 h-12 border-4 border-primary-fixed border-t-primary rounded-full animate-spin mb-4"></div>
            <p class="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest">${t('app.loading')}</p>
        </div>
    `;

    try {
        const html = await view.render(params);
        app.innerHTML = html;

        // Scroll to top on each navigation
        window.scrollTo({ top: 0, behavior: 'auto' });

        // Re-apply Tailwind to any dynamically injected content
        if (window.tailwind && window.tailwind.refresh) {
            window.tailwind.refresh();
        }

        // Call the view's init() hook if present
        if (typeof view.init === 'function') {
            view.init();
        }
    } catch (err) {
        console.error('Failed to render view:', err);
        app.innerHTML = `
            <div class="min-h-[60vh] flex flex-col items-center justify-center bg-background text-on-background px-6 text-center">
<span class="material-symbols-outlined text-[64px] text-error mb-4">error</span>
                <h1 class="font-headline-md text-headline-md text-on-surface mb-2">${t('app.error')}</h1>
                <p class="text-on-surface-variant max-w-md mb-6">${t('app.errorDesc')}</p>
                <a href="#/" class="bg-primary text-on-primary px-8 py-4 rounded-xl font-button-text text-button-text hover:bg-primary-container transition-all shadow-lg">
                    ${t('app.backHome')}
                </a>
            </div>
        `;
    }
}

// ---------- Route Registration ----------
function registerRoutes() {
    // ===== Public / Guest Routes =====
    router.add('/', (params) => GuestController.home(params));
    router.add('/home', (params) => GuestController.home(params));
    router.add('/about', (params) => GuestController.about(params));
    router.add('/services', (params) => GuestController.services(params));
    router.add('/services/:slug', (params) => GuestController.serviceDetail(params));
    router.add('/team', (params) => GuestController.team(params));
    router.add('/articles', (params) => GuestController.articles(params));
    router.add('/contact', (params) => GuestController.contact(params));
    router.add('/ai-triage', (params) => GuestController.aiTriage(params));
    router.add('/booking', (params) => GuestController.booking(params));
    router.add('/conditions', (params) => GuestController.conditions(params));
    router.add('/conditions/:slug', (params) => GuestController.conditionDetail(params));

    // ===== Auth Routes =====
    router.add('/login', (params) => AuthController.login(params));
    router.add('/register', (params) => AuthController.register(params));
    router.add('/forgot-password', (params) => AuthController.forgotPassword(params));

    // ===== Patient Routes =====
    router.add('/patient/dashboard', (params) => PatientController.dashboard(params));
    router.add('/patient/assessment', (params) => PatientController.assessment(params));
    router.add('/patient/payment', (params) => PatientController.payment(params));
    router.add('/patient/booking-success', (params) => PatientController.bookingSuccess(params));
    router.add('/patient/medical-records', (params) => PatientController.medicalRecords(params));
    router.add('/patient/contact-confirmation', (params) => PatientController.contactConfirmation(params));
    router.add('/patient/teleconsultation', (params) => PatientController.teleconsultation(params));
    router.add('/patient/update-booking', (params) => PatientController.updateBooking(params));

    // ===== Admin Routes =====
    router.add('/admin/login', (params) => AdminController.login(params));
    router.add('/admin/dashboard', (params) => AdminController.dashboard(params));
    router.add('/admin/therapists', (params) => AdminController.therapists(params));
    router.add('/admin/branches', (params) => AdminController.branches(params));
    router.add('/admin/patients', (params) => AdminController.patients(params));
}

// ---------- Bootstrap ----------
document.addEventListener('DOMContentLoaded', () => {
    if (typeof I18n !== 'undefined') {
        I18n.init();
    }
    registerRoutes();
    router.resolve();
    if (typeof WhatsAppFab !== 'undefined') {
        WhatsAppFab.init();
    }
});

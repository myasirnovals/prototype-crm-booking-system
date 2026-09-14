/* ============================================
   PhysioCare - Admin Controller
   Handles admin management pages
   ============================================ */

const AdminController = {
    /**
     * Admin dashboard (analytics)
     */
    dashboard(params) {
        MountView(AdminDashboardView, params);
    },

    /**
     * Therapist management
     */
    therapists(params) {
        MountView(AdminTherapistsView, params);
    },

    /**
     * Branch management
     */
    branches(params) {
        MountView(AdminBranchesView, params);
    },

    /**
     * Patient records (EMR)
     */
    patients(params) {
        MountView(AdminPatientsView, params);
    },

    /**
     * Admin login page
     */
    login(params) {
        MountView(AdminLoginView, params);
    }
};

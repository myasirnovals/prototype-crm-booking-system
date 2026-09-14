/* ============================================
   PhysioCare - Guest Controller
   Handles public-facing pages (non-authenticated)
   ============================================ */

const GuestController = {
    /**
     * Homepage
     */
    home(params) {
        MountView(GuestHomeView, params);
    },

    /**
     * About Us page
     */
    about(params) {
        MountView(GuestAboutView, params);
    },

    /**
     * Services catalog
     */
    services(params) {
        MountView(GuestServicesView, params);
    },

    /**
     * Service detail page
     */
    serviceDetail(params) {
        MountView(GuestServiceDetailView, params);
    },

    /**
     * Our team page
     */
    team(params) {
        MountView(GuestTeamView, params);
    },

    /**
     * Education articles page
     */
    articles(params) {
        MountView(GuestArticlesView, params);
    },

    /**
     * Contact & location page
     */
    contact(params) {
        MountView(GuestContactView, params);
    },

    /**
     * AI Triage Assistant (Hilda)
     */
    aiTriage(params) {
        MountView(GuestAITriageView, params);
    },

    /**
     * Online booking page
     */
    booking(params) {
        MountView(GuestBookingView, params);
    },

    /**
     * Conditions catalog
     */
    conditions(params) {
        MountView(GuestConditionsView, params);
    },

    /**
     * Condition detail page
     */
    conditionDetail(params) {
        MountView(GuestConditionDetailView, params);
    }
};

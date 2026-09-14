/* ============================================
   PhysioCare - Patient Controller
   Handles logged-in patient pages
   ============================================ */

const PatientController = {
    /**
     * Patient dashboard (home)
     */
    dashboard(params) {
        MountView(PatientDashboardView, params);
    },

    /**
     * Initial assessment form
     */
    assessment(params) {
        MountView(PatientAssessmentView, params);
    },

    /**
     * Payment confirmation
     */
    payment(params) {
        MountView(PatientPaymentView, params);
    },

    /**
     * Booking success page
     */
    bookingSuccess(params) {
        MountView(PatientBookingSuccessView, params);
    },

    /**
     * Medical records page
     */
    medicalRecords(params) {
        MountView(PatientMedicalRecordsView, params);
    },

    /**
     * Contact confirmation page
     */
    contactConfirmation(params) {
        MountView(PatientContactConfirmationView, params);
    },

    /**
     * Teleconsultation session page
     */
    teleconsultation(params) {
        MountView(PatientTeleconsultationView, params);
    },

    /**
     * Update/Reschedule booking page
     */
    updateBooking(params) {
        MountView(PatientUpdateBookingView, params);
    }
};

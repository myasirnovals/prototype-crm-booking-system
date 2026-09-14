/* ============================================
   PhysioCare - Patient Booking Success View
   ============================================ */

const PatientBookingSuccessView = {
    /**
     * Render the booking success page
     */
    async render() {
        const booking = GuestBookingView.state;
        const appointmentCode = 'PC-' + Math.floor(1000 + Math.random() * 9000);

        return `
        ${NavbarPatient.render('dashboard')}
        <main class="flex-grow flex items-center justify-center px-6 py-16">
            <div class="max-w-2xl w-full text-center">
                <!-- Success Icon -->
                <div class="relative mx-auto mb-8">
                    <div class="w-24 h-24 rounded-full bg-success-green/10 flex items-center justify-center mx-auto">
                        <span class="material-symbols-outlined text-success-green text-[56px]" style="font-variation-settings: 'FILL' 1;">check_circle</span>
                    </div>
                    <div class="absolute inset-0 w-24 h-24 mx-auto rounded-full bg-success-green/20 animate-ping"></div>
                </div>
                <h1 class="font-headline-lg text-headline-lg mb-4">${t('success.title')}</h1>
                <p class="font-body-lg text-body-lg text-on-surface-variant mb-8">
                    ${t('success.sub')}
                </p>
                <!-- Booking Code -->
                <div class="bg-clinical-white rounded-2xl border border-outline-variant/20 shadow-xl p-8 mb-8">
                    <div class="flex items-center justify-between mb-6">
                        <span class="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">${t('success.code')}</span>
                        <span class="font-headline-md text-headline-md text-primary font-bold font-label-sm">${appointmentCode}</span>
                    </div>
                    <div class="space-y-4 border-t border-surface-muted pt-6">
                        <div class="flex justify-between">
                            <span class="text-on-surface-variant">${t('success.service')}</span>
                            <span class="font-bold">${booking.service ? booking.service.name : t('booking.stdPhysio')}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-on-surface-variant">${t('success.therapist')}</span>
                            <span class="font-bold">${booking.therapist ? booking.therapist.name : 'Dr. Sarah Mitchell'}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-on-surface-variant">${t('success.schedule')}</span>
                            <span class="font-bold">${I18n.formatAppointmentSchedule(booking.date || 24, booking.time || '11:45 AM')}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-on-surface-variant">${t('success.total')}</span>
                            <span class="font-bold text-primary">${Service.formatPrice(booking.service ? booking.service.price : 85000)}</span>
                        </div>
                    </div>
                </div>
                <!-- Next Steps -->
                <div class="bg-surface-muted rounded-2xl p-6 mb-8 text-left">
                    <h3 class="font-headline-md text-headline-md mb-4">${t('success.nextSteps')}</h3>
                    <div class="space-y-4">
                        <div class="flex items-start gap-3">
                            <div class="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-sm">1</div>
                            <p class="text-on-surface-variant">${t('success.step1')}</p>
                        </div>
                        <div class="flex items-start gap-3">
                            <div class="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-sm">2</div>
                            <p class="text-on-surface-variant">${t('success.step2')}</p>
                        </div>
                        <div class="flex items-start gap-3">
                            <div class="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-sm">3</div>
                            <p class="text-on-surface-variant">${t('success.step3')}</p>
                        </div>
                    </div>
                </div>
                <div class="flex flex-col sm:flex-row justify-center gap-4">
                    <a href="#/patient/dashboard" class="bg-primary text-on-primary px-8 py-4 rounded-xl font-button-text text-button-text hover:bg-primary-container transition-all shadow-lg">
                        ${t('success.toDashboard')}
                    </a>
                    <a href="#/patient/assessment" class="border-2 border-primary text-primary px-8 py-4 rounded-xl font-button-text text-button-text hover:bg-primary/5 transition-all">
                        ${t('success.fillAssessment')}
                    </a>
                </div>
            </div>
        </main>
${Footer.render()}
        `;
    },

    /**
     * Reset the guest booking state after a successful booking
     * so the next booking starts fresh.
     */
    init() {
        GuestBookingView.state = {
            service: null,
            therapist: null,
            date: '13',
            time: '11:45 AM'
        };
    }
};

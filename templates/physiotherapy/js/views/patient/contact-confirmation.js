/* ============================================
   PhysioCare - Patient Contact Confirmation View
   ============================================ */

const PatientContactConfirmationView = {
    /**
     * Render the contact confirmation page
     */
    async render() {
        const booking = GuestBookingView.state;
        const summaryData = {
            service: booking.service || { name: t('booking.stdPhysio'), shortDescription: t('booking.consult60') },
            therapist: booking.therapist || { name: 'Dr. Sarah Mitchell', image: null, strVerified: true },
            date: I18n.formatAppointmentSchedule(booking.date || 24, booking.time || '10:00 AM — 11:00 AM'),
            time: I18n.formatTimeRange('10:00 AM', '11:00 AM'),
            price: booking.service ? booking.service.price : 85000
        };

        return `
        ${NavbarGuest.render('')}
        <main class="flex-grow max-w-container-max mx-auto w-full px-6 md:px-section-padding-desktop py-stack-lg">
            <!-- Progress -->
            <div class="mb-12 text-center">
                <div class="inline-flex items-center gap-3 bg-secondary/10 text-secondary px-4 py-2 rounded-full font-label-sm text-label-sm">
                    <span class="material-symbols-outlined text-[18px]">contact_phone</span>
                    ${t('contactConf.badge')}
                </div>
                <h1 class="font-headline-lg text-headline-lg text-primary mt-4">${t('contactConf.title')}</h1>
                <p class="font-body-lg text-body-lg text-on-surface-variant">${t('contactConf.sub')}</p>
            </div>
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
                <div class="lg:col-span-8 space-y-gutter">
                    <div class="bg-clinical-white p-8 rounded-xl shadow-[0_20px_40px_rgba(14,116,144,0.05)] border border-surface-muted">
                        <form id="contact-confirm-form" class="space-y-6">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label class="block font-button-text text-button-text text-on-surface-variant mb-2" for="cc-name">${t('contactConf.fullName')}</label>
                                    <input class="w-full px-4 py-3 bg-surface-bright border border-outline-variant rounded-lg font-body-md focus-ring" id="cc-name" type="text" value="James Miller" required>
                                </div>
                                <div>
                                    <label class="block font-button-text text-button-text text-on-surface-variant mb-2" for="cc-phone">${t('contactConf.wa')}</label>
                                    <input class="w-full px-4 py-3 bg-surface-bright border border-outline-variant rounded-lg font-body-md focus-ring" id="cc-phone" type="tel" value="+62 812-3456-7890" required>
                                </div>
                            </div>
                            <div>
                                <label class="block font-button-text text-button-text text-on-surface-variant mb-2" for="cc-email">${t('contactConf.email')}</label>
                                <input class="w-full px-4 py-3 bg-surface-bright border border-outline-variant rounded-lg font-body-md focus-ring" id="cc-email" type="email" value="james.miller@email.com" required>
                            </div>
                            <div>
                                <label class="block font-button-text text-button-text text-on-surface-variant mb-2" for="cc-address">${t('contactConf.address')}</label>
                                <textarea class="w-full px-4 py-3 bg-surface-bright border border-outline-variant rounded-lg font-body-md focus-ring h-24 resize-none" id="cc-address">Jl. Sudirman No. 45, Jakarta Selatan</textarea>
                            </div>
                            <div class="flex items-start gap-3 p-4 bg-surface-muted rounded-lg border border-outline-variant/30">
                                <input class="h-4 w-4 text-primary border-outline-variant rounded focus:ring-primary mt-1" id="cc-wa" type="checkbox" checked>
                                <label class="font-body-md text-body-md text-on-surface-variant" for="cc-wa">
                                    ${t('contactConf.reminder')}
                                </label>
                            </div>
                            <div class="flex flex-col sm:flex-row justify-between gap-4 pt-4">
                                <a href="#/booking" class="flex items-center justify-center gap-2 px-8 py-4 rounded-lg border-2 border-primary text-primary font-button-text hover:bg-surface-muted transition-all active:scale-95">
                                    <span class="material-symbols-outlined">arrow_back</span>
                                    ${t('contactConf.back')}
                                </a>
                                <a href="#/patient/payment" class="flex items-center justify-center gap-2 px-10 py-4 rounded-lg bg-primary text-on-primary font-button-text shadow-lg hover:bg-primary-container transition-all active:scale-95">
                                    ${t('contactConf.proceed')}
                                    <span class="material-symbols-outlined">arrow_forward</span>
                                </a>
                            </div>
                        </form>
                    </div>
                </div>
                <aside class="lg:col-span-4">
                    ${BookingSummaryCard.render(summaryData)}
                </aside>
            </div>
        </main>
        ${Footer.render()}
        `;
    },

    init() {}
};

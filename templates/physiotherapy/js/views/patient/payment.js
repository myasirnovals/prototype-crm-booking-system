/* ============================================
   PhysioCare - Patient Payment View
   ============================================ */

const PatientPaymentView = {
    /**
     * Render the payment page
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

        const paymentMethods = [
            { id: 'qris', name: 'QRIS', icon: 'qr_code_2', desc: t('payment.scanPay'), color: 'bg-primary/10 text-primary' },
            { id: 'transfer', name: t('payment.transferBank'), icon: 'account_balance', desc: 'BCA, BNI, Mandiri', color: 'bg-secondary/10 text-secondary' },
            { id: 'ewallet', name: t('payment.ewallet'), icon: 'account_balance_wallet', desc: 'GoPay, OVO, DANA', color: 'bg-success-green/10 text-success-green' },
            { id: 'card', name: t('payment.creditCard'), icon: 'credit_card', desc: 'Visa, Mastercard', color: 'bg-warning-amber/10 text-warning-amber' }
        ];

        const methodCards = paymentMethods.map(m => `
            <label class="relative flex items-center gap-4 p-4 rounded-lg border-2 border-outline-variant cursor-pointer peer-checked:border-primary peer-checked:bg-primary-fixed/10 transition-all hover:bg-surface-muted">
                <input class="peer sr-only" name="payment" type="radio" value="${m.id}">
                <div class="w-12 h-12 rounded-lg ${m.color} flex items-center justify-center">
                    <span class="material-symbols-outlined">${m.icon}</span>
                </div>
                <div class="flex-grow">
                    <h4 class="font-bold">${m.name}</h4>
                    <p class="text-sm text-on-surface-variant">${m.desc}</p>
                </div>
                <span class="material-symbols-outlined text-primary opacity-0 peer-checked:opacity-100">check_circle</span>
            </label>
        `).join('');

        return `
        ${NavbarGuest.render('')}
        <main class="flex-grow max-w-container-max mx-auto w-full px-6 md:px-section-padding-desktop py-stack-lg">
            <!-- Progress Indicator -->
            <div class="mb-12">
                <div class="flex items-center justify-center max-w-2xl mx-auto">
                    <div class="flex flex-col items-center flex-1">
                        <div class="w-10 h-10 rounded-full bg-success-green flex items-center justify-center text-white mb-2 shadow-sm">
                            <span class="material-symbols-outlined text-[20px]" style="font-variation-settings: 'FILL' 1;">check</span>
                        </div>
                        <span class="font-label-sm text-label-sm text-success-green uppercase tracking-wider">${t('assessment.step1')}</span>
                    </div>
                    <div class="h-[2px] w-12 md:w-24 bg-success-green mb-6"></div>
                    <div class="flex flex-col items-center flex-1">
                        <div class="w-10 h-10 rounded-full bg-success-green flex items-center justify-center text-white mb-2 shadow-sm">
                            <span class="material-symbols-outlined text-[20px]" style="font-variation-settings: 'FILL' 1;">check</span>
                        </div>
                        <span class="font-label-sm text-label-sm text-success-green uppercase tracking-wider">${t('assessment.step2')}</span>
                    </div>
                    <div class="h-[2px] w-12 md:w-24 bg-secondary mb-6"></div>
                    <div class="flex flex-col items-center flex-1">
                        <div class="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-white mb-2 shadow-md ring-4 ring-secondary/20">
                            <span class="font-bold">3</span>
                        </div>
                        <span class="font-label-sm text-label-sm text-secondary font-bold uppercase tracking-wider">${t('assessment.step3')}</span>
                    </div>
                </div>
            </div>
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
                <!-- Payment Left Column -->
                <div class="lg:col-span-8 space-y-gutter">
                    <header>
                        <h1 class="font-headline-lg text-headline-lg text-primary mb-2">${t('payment.title')}</h1>
                        <p class="font-body-lg text-body-lg text-on-surface-variant">${t('payment.sub')}</p>
                    </header>
                    <div class="bg-clinical-white p-8 rounded-xl shadow-[0_20px_40px_rgba(14,116,144,0.05)] border border-surface-muted">
                        <h2 class="font-headline-md text-headline-md mb-6 flex items-center gap-2">
                            <span class="material-symbols-outlined text-primary">point_of_sale</span>
                            ${t('payment.method')}
                        </h2>
                        <div class="flex flex-col gap-4">
                            ${methodCards}
                        </div>
                        <div class="mt-8 p-4 bg-surface-muted rounded-lg border border-outline-variant/30 flex gap-3">
                            <span class="material-symbols-outlined text-warning-amber">info</span>
                            <p class="text-[12px] leading-relaxed text-on-surface-variant">
                                ${t('payment.secure')}
                            </p>
                        </div>
                    </div>
                    <div class="flex flex-col sm:flex-row justify-between gap-4 pt-6">
                        <a href="#/patient/assessment" class="flex items-center justify-center gap-2 px-8 py-4 rounded-lg border-2 border-primary text-primary font-button-text hover:bg-surface-muted transition-all active:scale-95">
                            <span class="material-symbols-outlined">arrow_back</span>
                            ${t('payment.back')}
                        </a>
                        <button id="pay-now" class="flex items-center justify-center gap-2 px-10 py-4 rounded-lg bg-primary text-on-primary font-button-text shadow-lg hover:bg-primary-container transition-all active:scale-95">
                            <span class="material-symbols-outlined">lock</span>
                            ${t('payment.payNow')}
                        </button>
                    </div>
                </div>
                <!-- Booking Summary Sidebar -->
                <aside class="lg:col-span-4">
                    ${BookingSummaryCard.render(summaryData)}
                </aside>
            </div>
        </main>
        ${Footer.render()}
        `;
    },

    init() {
        const payBtn = document.getElementById('pay-now');
        if (!payBtn) return;

        payBtn.addEventListener('click', async () => {
            const user = User.getCurrentUser();
            const booking = GuestBookingView.state;

            // Read the selected payment method (default to QRIS)
            const selectedPayment = document.querySelector('input[name="payment"]:checked');
            const paymentMethod = selectedPayment ? selectedPayment.value : 'qris';

            // Create appointment via the model (which maps fields correctly)
            await AppointmentModel.create({
                patientId: user ? user.patientId : 'PC-8842',
                patientName: user ? user.name : 'James Miller',
                serviceId: booking.service ? booking.service.id : 'standard-physiotherapy',
                serviceName: booking.service ? booking.service.name : t('booking.stdPhysio'),
                therapistId: booking.therapist ? booking.therapist.id : 'therapist-1',
                therapistName: booking.therapist ? booking.therapist.name : 'Dr. Sarah Mitchell',
                date: `Oct ${booking.date || '24'}, 2024`,
                time: booking.time || '11:45 AM',
                location: 'Downtown Medical Plaza, Suite 402',
                price: booking.service ? booking.service.price : 85000,
                paymentMethod
            });

            // Reset booking state so a new booking starts clean
            GuestBookingView.state = { service: null, therapist: null, date: '13', time: '11:45 AM' };

            router.navigate('/patient/booking-success');
        });
    }
};

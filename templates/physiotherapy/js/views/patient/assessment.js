/* ============================================
   PhysioCare - Patient Assessment View
   ============================================ */

const PatientAssessmentView = {
    /**
     * Render the initial assessment page
     */
    async render() {
        // Get booking data from GuestBookingView state if available
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
                        <div class="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-white mb-2 shadow-md ring-4 ring-secondary/20">
                            <span class="font-bold">2</span>
                        </div>
                        <span class="font-label-sm text-label-sm text-secondary font-bold uppercase tracking-wider">${t('assessment.step2')}</span>
                    </div>
                    <div class="h-[2px] w-12 md:w-24 bg-outline-variant mb-6"></div>
                    <div class="flex flex-col items-center flex-1">
                        <div class="w-10 h-10 rounded-full bg-surface-muted border-2 border-outline-variant flex items-center justify-center text-outline mb-2">
                            <span>3</span>
                        </div>
                        <span class="font-label-sm text-label-sm text-outline uppercase tracking-wider">${t('assessment.step3')}</span>
                    </div>
                </div>
            </div>
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
                <!-- Assessment Form -->
                <div class="lg:col-span-8 space-y-gutter">
                    <header>
                        <h1 class="font-headline-lg text-headline-lg text-primary mb-2">${t('assessment.title')}</h1>
                        <p class="font-body-lg text-body-lg text-on-surface-variant">${t('assessment.sub')}</p>
                    </header>
                    <div class="bg-clinical-white p-8 rounded-xl shadow-[0_20px_40px_rgba(14,116,144,0.05)] border border-surface-muted space-y-10">
                        <section class="space-y-4">
                            <label class="block font-headline-md text-headline-md text-on-surface">${t('assessment.painLocation')}</label>
                            <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                <button type="button" class="p-4 rounded-lg border border-outline-variant hover:border-secondary hover:bg-surface-muted transition-all flex flex-col items-center gap-2 group pain-location-btn" data-location="Neck">
                                    <span class="material-symbols-outlined text-outline group-hover:text-secondary">settings_accessibility</span>
                                    <span class="font-body-md text-body-md">${t('assessment.neck')}</span>
                                </button>
                                <button type="button" class="p-4 rounded-lg border border-outline-variant hover:border-secondary hover:bg-surface-muted transition-all flex flex-col items-center gap-2 group pain-location-btn" data-location="Shoulder">
                                    <span class="material-symbols-outlined text-outline group-hover:text-secondary">back_hand</span>
                                    <span class="font-body-md text-body-md">${t('assessment.shoulder')}</span>
                                </button>
                                <button type="button" class="p-4 rounded-lg border border-outline-variant hover:border-secondary hover:bg-surface-muted transition-all flex flex-col items-center gap-2 group pain-location-btn" data-location="Lower Back">
                                    <span class="material-symbols-outlined text-outline group-hover:text-secondary">accessibility_new</span>
                                    <span class="font-body-md text-body-md">${t('assessment.lowerBack')}</span>
                                </button>
                                <button type="button" class="p-4 rounded-lg border border-outline-variant hover:border-secondary hover:bg-surface-muted transition-all flex flex-col items-center gap-2 group pain-location-btn" data-location="Knee">
                                    <span class="material-symbols-outlined text-outline group-hover:text-secondary">downhill_skiing</span>
                                    <span class="font-body-md text-body-md">${t('assessment.knee')}</span>
                                </button>
                            </div>
                            <select id="assessment-other" class="w-full mt-4 p-4 rounded-lg border-outline-variant focus:ring-2 focus:ring-secondary focus:border-secondary bg-surface-muted/50">
                                <option>${t('assessment.otherNotListed')}</option>
                                <option>${t('assessment.ankle')}</option>
                                <option>${t('assessment.hip')}</option>
                                <option>${t('assessment.elbow')}</option>
                                <option>${t('assessment.fullBody')}</option>
                            </select>
                        </section>
                        <section class="space-y-4">
                            <label class="block font-headline-md text-headline-md text-on-surface">${t('assessment.howLong')}</label>
                            <div class="flex flex-wrap gap-4">
                                <label class="relative flex-1 min-w-[140px] cursor-pointer">
                                    <input checked="" class="peer sr-only" name="duration" type="radio">
                                    <div class="p-4 text-center rounded-lg border border-outline-variant peer-checked:border-secondary peer-checked:bg-secondary-fixed/30 peer-checked:text-secondary font-body-md transition-all">
                                        <div class="font-bold">${t('assessment.acute')}</div>
                                        <div class="text-[12px]">${t('assessment.less1wk')}</div>
                                    </div>
                                </label>
                                <label class="relative flex-1 min-w-[140px] cursor-pointer">
                                    <input class="peer sr-only" name="duration" type="radio">
                                    <div class="p-4 text-center rounded-lg border border-outline-variant peer-checked:border-secondary peer-checked:bg-secondary-fixed/30 peer-checked:text-secondary font-body-md transition-all">
                                        <div class="font-bold">${t('assessment.subacute')}</div>
                                        <div class="text-[12px]">${t('assessment.1to4wk')}</div>
                                    </div>
                                </label>
                                <label class="relative flex-1 min-w-[140px] cursor-pointer">
                                    <input class="peer sr-only" name="duration" type="radio">
                                    <div class="p-4 text-center rounded-lg border border-outline-variant peer-checked:border-secondary peer-checked:bg-secondary-fixed/30 peer-checked:text-secondary font-body-md transition-all">
                                        <div class="font-bold">${t('assessment.chronic')}</div>
                                        <div class="text-[12px]">${t('assessment.wk')}</div>
                                    </div>
                                </label>
                            </div>
                        </section>
                        <section class="space-y-6">
                            <div class="flex justify-between items-center">
                                <label class="block font-headline-md text-headline-md text-on-surface">${t('assessment.painScale')}</label>
                                <span class="bg-secondary text-on-primary px-4 py-1 rounded-full font-bold" id="pain-value">5</span>
                            </div>
                            <input class="pain-slider w-full h-3 bg-surface-container rounded-lg appearance-none cursor-pointer" id="pain-slider-input" max="10" min="1" type="range" value="5">
                            <div class="flex justify-between text-[12px] font-label-sm text-on-surface-variant uppercase tracking-widest px-1">
                                <span>${t('assessment.mild')}</span>
                                <span>${t('assessment.moderate')}</span>
                                <span>${t('assessment.severe')}</span>
                            </div>
                        </section>
                        <section class="space-y-4">
                            <label class="block font-headline-md text-headline-md text-on-surface">${t('assessment.symptoms')}</label>
                            <textarea id="assessment-desc" class="w-full p-4 rounded-lg border-outline-variant focus:ring-2 focus:ring-secondary focus:border-secondary bg-surface-muted/50 resize-none font-body-md" placeholder="${t('assessment.symptomsPlaceholder')}" rows="4"></textarea>
                        </section>
                        <section class="space-y-4">
                            <label class="block font-headline-md text-headline-md text-on-surface">${t('assessment.upload')} <span class="font-normal text-on-surface-variant text-body-md">${t('assessment.optional')}</span></label>
                            <div class="border-2 border-dashed border-outline-variant rounded-xl p-8 text-center bg-surface-bright hover:bg-surface-muted transition-colors cursor-pointer group">
                                <span class="material-symbols-outlined text-[48px] text-outline group-hover:text-secondary transition-colors mb-2">cloud_upload</span>
                                <p class="font-body-md text-on-surface">${t('assessment.dragDrop')}</p>
                                <p class="text-[12px] text-on-surface-variant mt-1">${t('assessment.fileHint')}</p>
                                <button class="mt-4 text-secondary font-button-text underline underline-offset-4">${t('assessment.browse')}</button>
                            </div>
                        </section>
                    </div>
                    <div class="flex flex-col sm:flex-row justify-between gap-4 pt-6">
                        <a href="#/booking" class="flex items-center justify-center gap-2 px-8 py-4 rounded-lg border-2 border-primary text-primary font-button-text hover:bg-surface-muted transition-all active:scale-95">
                            <span class="material-symbols-outlined">arrow_back</span>
                            ${t('assessment.back')}
                        </a>
                        <a href="#/patient/payment" id="proceed-payment" class="flex items-center justify-center gap-2 px-10 py-4 rounded-lg bg-primary text-on-primary font-button-text shadow-lg hover:bg-primary-container transition-all active:scale-95">
                            ${t('assessment.proceedPayment')}
                            <span class="material-symbols-outlined">arrow_forward</span>
                        </a>
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
        // Pain slider
        const slider = document.getElementById('pain-slider-input');
        const display = document.getElementById('pain-value');
        if (slider && display) {
            slider.addEventListener('input', (e) => {
                const value = e.target.value;
                display.textContent = value;
                if (value <= 3) {
                    display.className = 'bg-success-green text-on-primary px-4 py-1 rounded-full font-bold transition-colors';
                } else if (value <= 7) {
                    display.className = 'bg-warning-amber text-on-primary px-4 py-1 rounded-full font-bold transition-colors';
                } else {
                    display.className = 'bg-emergency-red text-on-primary px-4 py-1 rounded-full font-bold transition-colors';
                }
            });
        }

        // Pain location buttons
        document.querySelectorAll('.pain-location-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.pain-location-btn').forEach(b => b.classList.remove('active-ring'));
                btn.classList.add('active-ring');
            });
        });
    }
};

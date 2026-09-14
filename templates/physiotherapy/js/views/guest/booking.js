/* ============================================
   PhysioCare - Guest Booking View
   ============================================ */

const GuestBookingView = {
    // Store selected booking data
    state: {
        service: null,
        therapist: null,
        date: '13',
        time: '11:45 AM',
        locationType: 'in-clinic', // 'in-clinic' or 'home-visit'
        useCredit: false
    },

    /**
     * Render the booking page
     */
    async render() {
        const services = await ServiceModel.all();
        const therapists = await TherapistModel.available();

        const serviceCards = services.map(s => `
            <label class="relative group cursor-pointer">
                <input class="peer sr-only" name="service" type="radio" value="${s.id}">
                <div class="p-6 rounded-lg border-2 border-outline-variant peer-checked:border-primary peer-checked:bg-primary-fixed/10 transition-all hover:bg-surface-muted">
                    <div class="flex items-start justify-between mb-2">
                        <span class="material-symbols-outlined text-3xl text-primary" style="font-variation-settings: 'FILL' 1;">${s.icon}</span>
                        <span class="font-label-sm text-label-sm text-secondary">${Service.formatPrice(s.price)}</span>
                    </div>
                    <h3 class="font-bold text-lg mb-1">${s.name}</h3>
                    <p class="text-sm text-on-surface-variant">${s.shortDescription}</p>
                </div>
            </label>
        `).join('');

const therapistCards = therapists.map(th => `
            <label class="flex items-center gap-4 p-4 rounded-lg border border-outline-variant hover:bg-surface-muted cursor-pointer transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary-fixed/5">
                <input class="peer sr-only" name="therapist" type="radio" value="${th.id}">
                <img class="w-16 h-16 rounded-full object-cover border-2 border-clinical-white shadow-sm" data-alt="${th.name}" src="${th.image}" alt="${th.name}">
                <div class="flex-grow">
                    <div class="flex items-center gap-2">
                        <h4 class="font-bold">${th.name}</h4>
                        ${th.strVerified ? `<span class="bg-primary-fixed text-on-primary-fixed-variant text-[10px] px-2 py-0.5 rounded-full font-label-sm uppercase">${t('booking.strVerified')}</span>` : ''}
                    </div>
                    <p class="text-sm text-on-surface-variant">${th.specialization} • ${t('booking.yearsExp', {years: th.experience})}</p>
                    <div class="flex items-center gap-1 text-warning-amber">
                        <span class="material-symbols-outlined text-sm" style="font-variation-settings: 'FILL' 1;">star</span>
                        <span class="text-xs font-bold">${th.rating} (${th.reviews} ${t('booking.reviews')})</span>
                    </div>
                </div>
                <span class="material-symbols-outlined text-primary opacity-0 peer-checked:opacity-100">check_circle</span>
            </label>
        `).join('');

        return `
        ${NavbarGuest.render('')}
        <main class="flex-grow w-full max-w-container-max mx-auto px-4 md:px-section-padding-desktop py-12">
            <!-- Progress Indicator -->
            <div class="mb-12">
                <div class="flex items-center justify-between max-w-3xl mx-auto mb-4">
                    <div class="flex flex-col items-center gap-2">
                        <div class="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold">1</div>
                        <span class="font-label-sm text-label-sm text-primary">${t('booking.selection')}</span>
                    </div>
                    <div class="flex-grow h-[2px] bg-outline-variant mx-4 -mt-6"></div>
                    <div class="flex flex-col items-center gap-2 opacity-50">
                        <div class="w-10 h-10 rounded-full bg-surface-container-highest text-on-surface flex items-center justify-center font-bold">2</div>
                        <span class="font-label-sm text-label-sm text-outline">${t('booking.details')}</span>
                    </div>
                    <div class="flex-grow h-[2px] bg-outline-variant mx-4 -mt-6"></div>
                    <div class="flex flex-col items-center gap-2 opacity-50">
                        <div class="w-10 h-10 rounded-full bg-surface-container-highest text-on-surface flex items-center justify-center font-bold">3</div>
                        <span class="font-label-sm text-label-sm text-outline">${t('booking.payment')}</span>
                    </div>
                </div>
                <h1 class="text-center font-headline-lg text-headline-lg mb-2">${t('booking.title')}</h1>
                <p class="text-center text-on-surface-variant font-body-lg text-body-lg">${t('booking.sub')}</p>
            </div>
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
                <!-- Left Column: Selection Flow -->
                <div class="lg:col-span-8 space-y-stack-lg">
                    <!-- Service Selection -->
                    <section class="bg-clinical-white p-8 rounded-xl shadow-sm">
                        <h2 class="font-headline-md text-headline-md mb-6 flex items-center gap-2">
                            <span class="material-symbols-outlined text-primary">medical_services</span>
                            ${t('booking.selectService')}
                        </h2>
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            ${serviceCards}
                        </div>
                        
                        <!-- Location Type -->
                        <div class="mt-6 pt-6 border-t border-outline-variant">
                            <h3 class="font-bold text-on-surface mb-3 flex items-center gap-2">
                                <span class="material-symbols-outlined text-primary">location_on</span>
                                ${t('booking.locationPrefs')}
                            </h3>
                            <div class="flex gap-4">
                                <label class="flex-1 cursor-pointer">
                                    <input type="radio" name="locationType" value="in-clinic" class="peer sr-only" checked>
                                    <div class="p-4 rounded-lg border border-outline-variant peer-checked:border-primary peer-checked:bg-primary-fixed/10 hover:bg-surface-muted transition-all text-center">
                                        <span class="material-symbols-outlined block mb-1">domain</span>
                                        <span class="font-bold block">${t('booking.inClinic')}</span>
                                        <span class="text-xs text-on-surface-variant">${t('booking.standardRate')}</span>
                                    </div>
                                </label>
                                <label class="flex-1 cursor-pointer">
                                    <input type="radio" name="locationType" value="home-visit" class="peer sr-only">
                                    <div class="p-4 rounded-lg border border-outline-variant peer-checked:border-primary peer-checked:bg-primary-fixed/10 hover:bg-surface-muted transition-all text-center">
                                        <span class="material-symbols-outlined block mb-1">home</span>
                                        <span class="font-bold block">${t('booking.homeVisit')}</span>
                                        <span class="text-xs text-on-surface-variant">${t('booking.transport')}</span>
                                    </div>
                                </label>
                            </div>
                            <!-- Address Field for Home Visit (Hidden by default) -->
                            <div id="home-address-container" class="mt-4 hidden animate-fade-in">
                                <label class="block font-label-sm text-label-sm mb-1 text-on-surface">${t('booking.fullAddress')} <span class="text-error">*</span></label>
                                <textarea id="home-address" class="w-full p-3 rounded-lg border border-outline-variant focus:ring-2 focus:ring-primary outline-none resize-none h-20" placeholder="${t('booking.addressPlaceholder')}"></textarea>
                            </div>
                        </div>
                    </section>
                    <!-- Therapist Selection -->
                    <section class="bg-clinical-white p-8 rounded-xl shadow-sm">
                        <h2 class="font-headline-md text-headline-md mb-6 flex items-center gap-2">
                            <span class="material-symbols-outlined text-primary">group</span>
                            ${t('booking.chooseProfessional')}
                        </h2>
                        <div class="flex flex-col gap-4">
                            ${therapistCards}
                        </div>
                    </section>
                    <!-- Initial Assessment Form -->
                    <section class="bg-clinical-white p-8 rounded-xl shadow-sm">
                        <h2 class="font-headline-md text-headline-md mb-6 flex items-center gap-2">
                            <span class="material-symbols-outlined text-primary">assignment</span>
                            ${t('booking.initialAssessment')}
                        </h2>
                        <div class="space-y-6">
                            <div>
                                <label class="block font-body-md font-bold mb-2 text-on-surface">${t('booking.painLocation')}</label>
                                <select id="pain-location" class="w-full p-3 rounded-lg border border-outline-variant focus:ring-2 focus:ring-primary focus:border-primary outline-none bg-clinical-white">
                                    <option>${t('booking.optionNeck')}</option>
                                    <option>${t('booking.optionLowerBack')}</option>
                                    <option>${t('booking.optionShoulder')}</option>
                                    <option>${t('booking.optionKnee')}</option>
                                    <option>${t('booking.optionAnkle')}</option>
                                    <option>${t('booking.optionOther')}</option>
                                </select>
                            </div>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-gutter">
                                <div>
                                    <label class="block font-body-md font-bold mb-2 text-on-surface">${t('booking.painDuration')}</label>
                                    <div class="flex gap-2">
                                        <label class="flex-1">
                                            <input checked="" class="sr-only peer" name="duration" type="radio">
                                            <div class="text-center py-2 border border-outline-variant rounded-lg peer-checked:bg-primary peer-checked:text-white cursor-pointer hover:bg-surface-muted transition-colors">${t('booking.acute')}</div>
                                        </label>
                                        <label class="flex-1">
                                            <input class="sr-only peer" name="duration" type="radio">
                                            <div class="text-center py-2 border border-outline-variant rounded-lg peer-checked:bg-primary peer-checked:text-white cursor-pointer hover:bg-surface-muted transition-colors">${t('booking.chronic')}</div>
                                        </label>
                                    </div>
                                </div>
                                <div>
                                    <label class="block font-body-md font-bold mb-2 text-on-surface">${t('booking.painScale')}</label>
                                    <input class="w-full h-2 bg-surface-muted rounded-lg appearance-none cursor-pointer accent-primary" max="10" min="1" type="range" value="5">
                                    <div class="flex justify-between text-xs text-outline mt-1 font-label-sm">
                                        <span>${t('booking.mildpain')}</span>
                                        <span>${t('booking.moderate')}</span>
                                        <span>${t('booking.severe')}</span>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label class="block font-body-md font-bold mb-2 text-on-surface">${t('booking.injuryDesc')}</label>
                                <textarea id="pain-description" class="w-full p-3 rounded-lg border border-outline-variant focus:ring-2 focus:ring-primary outline-none h-24 resize-none" placeholder="${t('booking.injuryPlaceholder')}"></textarea>
                            </div>
                        </div>
                    </section>
                </div>
                <!-- Right Column: Date/Time & Summary Sticky -->
                <div class="lg:col-span-4 space-y-stack-lg sticky top-24">
                    <!-- Date/Time Selection -->
                    <section class="bg-clinical-white p-6 rounded-xl shadow-sm">
                        <h2 class="font-headline-md text-headline-md mb-4 flex items-center gap-2">
                            <span class="material-symbols-outlined text-primary">calendar_month</span>
                            ${t('booking.dateTime')}
                        </h2>
                        <div class="mb-6">
                            <label class="block font-label-sm text-xs text-outline mb-2 uppercase">${t('booking.selectDate')}</label>
                            <div class="grid grid-cols-4 gap-2">
<button class="flex flex-col items-center py-2 border border-outline-variant rounded-lg hover:border-primary transition-all date-btn">
                                    <span class="text-[10px] text-outline font-label-sm">${t('booking.dayMon')}</span>
                                    <span class="font-bold">12</span>
                                </button>
                                <button class="flex flex-col items-center py-2 border-2 border-primary bg-primary-fixed/20 rounded-lg date-btn active">
                                    <span class="text-[10px] text-primary font-bold font-label-sm">${t('booking.dayTue')}</span>
                                    <span class="font-bold">13</span>
                                </button>
                                <button class="flex flex-col items-center py-2 border border-outline-variant rounded-lg hover:border-primary transition-all date-btn">
                                    <span class="text-[10px] text-outline font-label-sm">${t('booking.dayWed')}</span>
                                    <span class="font-bold">14</span>
                                </button>
                                <button class="flex flex-col items-center py-2 border border-outline-variant rounded-lg hover:border-primary transition-all date-btn">
                                    <span class="text-[10px] text-outline font-label-sm">${t('booking.dayThu')}</span>
                                    <span class="font-bold">15</span>
                                </button>
                            </div>
                        </div>
                        <div class="mb-6">
                            <label class="block font-label-sm text-xs text-outline mb-2 uppercase">${t('booking.availableSlots')}</label>
                            <div class="grid grid-cols-2 gap-2">
                                <button class="py-2 text-sm border border-outline-variant rounded hover:bg-primary hover:text-white transition-colors time-slot">09:00 AM</button>
                                <button class="py-2 text-sm border border-outline-variant rounded hover:bg-primary hover:text-white transition-colors time-slot">10:30 AM</button>
                                <button class="py-2 text-sm border-2 border-primary bg-primary-fixed/20 rounded font-bold time-slot active">11:45 AM</button>
                                <button class="py-2 text-sm border border-outline-variant rounded hover:bg-primary hover:text-white transition-colors time-slot">02:15 PM</button>
                                <button class="py-2 text-sm border border-outline-variant rounded hover:bg-primary hover:text-white transition-colors time-slot">03:45 PM</button>
                                <button class="py-2 text-sm bg-surface-muted text-outline-variant rounded cursor-not-allowed" disabled>05:00 PM</button>
                            </div>
                        </div>
                    </section>
                    <!-- Booking Summary Card -->
                    <div class="bg-primary p-6 rounded-xl text-on-primary shadow-xl">
                        <h3 class="font-headline-md text-headline-md mb-4">${t('booking.summary')}</h3>
                        <div class="space-y-3 mb-6 pb-6 border-b border-primary-container text-sm">
                            <div class="flex justify-between">
                                <span class="opacity-80">${t('booking.treatment')}</span>
                                <span class="font-bold" id="summary-service">${t('booking.stdPhysio')}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="opacity-80">${t('booking.therapist')}</span>
                                <span class="font-bold" id="summary-therapist">Dr. Sarah Jenkins</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="opacity-80">${t('booking.schedule')}</span>
                                <span class="font-bold" id="summary-schedule">${I18n.formatAppointmentSchedule(this.state.date, this.state.time)}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="opacity-80">${t('booking.location')}</span>
                                <span class="font-bold" id="summary-location">${t('booking.inClinic')}</span>
                            </div>
                            <div class="flex justify-between hidden text-success-green" id="summary-credit-row">
                                <span class="opacity-90">${t('booking.credit')}</span>
                                <span class="font-bold">- Rp 49.000</span>
                            </div>
                        </div>
                        
                        <!-- Teleconsultation Credit Checkbox -->
                        <div class="mb-6 bg-primary-container text-on-primary-container p-3 rounded-lg flex items-start gap-3 border border-primary/20">
                            <input type="checkbox" id="use-credit-checkbox" class="mt-1 w-4 h-4 text-primary focus:ring-primary border-outline-variant rounded">
                            <label for="use-credit-checkbox" class="text-sm cursor-pointer">
                                <span class="font-bold block">${t('booking.redeemCredit')}</span>
                                <span class="opacity-80 text-xs">${t('booking.creditDesc')}</span>
                            </label>
                        </div>
                        
                        <div class="flex justify-between items-center mb-6">
                            <span class="font-headline-md">${t('booking.totalPrice')}</span>
                            <span class="font-headline-md" id="summary-price">${Service.formatPrice(85000)}</span>
                        </div>
                        <button id="proceed-btn" class="w-full bg-clinical-white text-primary py-4 rounded-lg font-button-text hover:bg-surface-bright active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2">
                            ${t('booking.proceed')}
                            <span class="material-symbols-outlined">arrow_forward</span>
                        </button>
                    </div>
                </div>
            </div>
        </main>
        ${Footer.render()}
        `;
    },

    init() {
        const serviceRadios = document.querySelectorAll('input[name="service"]');
        const therapistRadios = document.querySelectorAll('input[name="therapist"]');
        const summaryService = document.getElementById('summary-service');
        const summaryTherapist = document.getElementById('summary-therapist');
        const summaryPrice = document.getElementById('summary-price');
        const summarySchedule = document.getElementById('summary-schedule');
        const summaryLocation = document.getElementById('summary-location');
        const summaryCreditRow = document.getElementById('summary-credit-row');
        
        const locationRadios = document.querySelectorAll('input[name="locationType"]');
        const homeAddressContainer = document.getElementById('home-address-container');
        const creditCheckbox = document.getElementById('use-credit-checkbox');

        // Pre-select first service & therapist
        if (serviceRadios.length) serviceRadios[0].checked = true;
        if (therapistRadios.length) therapistRadios[0].checked = true;

        // Service selection
        serviceRadios.forEach(radio => {
            radio.addEventListener('change', async () => {
                if (radio.checked) {
                    const service = await ServiceModel.bySlug(radio.value);
                    if (service) {
                        this.state.service = service;
                        summaryService.textContent = service.name;
                        this.updateSummary();
                    }
                }
            });
        });

        // Therapist selection
        therapistRadios.forEach(radio => {
            radio.addEventListener('change', async () => {
                if (radio.checked) {
                    const therapist = await TherapistModel.find(radio.value);
                    if (therapist) {
                        this.state.therapist = therapist;
                        summaryTherapist.textContent = therapist.name;
                    }
                }
            });
        });

        const self = this;

        // Date & time selection
        document.querySelectorAll('.date-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.date-btn').forEach(b => {
                    b.classList.remove('border-primary', 'bg-primary-fixed/20', 'active');
                    b.classList.add('border-outline-variant');
                    const day = b.querySelector('.text-[10px]');
                    if (day) { day.classList.remove('text-primary', 'font-bold'); day.classList.add('text-outline'); }
                });
                btn.classList.add('border-primary', 'bg-primary-fixed/20', 'active');
                btn.classList.remove('border-outline-variant');
                const dayLabel = btn.querySelector('.text-[10px]');
                if (dayLabel) { dayLabel.classList.add('text-primary', 'font-bold'); dayLabel.classList.remove('text-outline'); }
                self.state.date = btn.querySelector('span:last-child').textContent;
                self.updateSummary(summarySchedule);
            });
        });

        document.querySelectorAll('.time-slot').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.time-slot').forEach(b => {
                    b.classList.remove('border-primary', 'bg-primary-fixed/20', 'active');
                    b.classList.add('border-outline-variant', 'hover:bg-primary', 'hover:text-white');
                });
                btn.classList.add('border-primary', 'bg-primary-fixed/20', 'active');
                btn.classList.remove('border-outline-variant', 'hover:bg-primary', 'hover:text-white');
                self.state.time = btn.textContent.trim();
                self.updateSummary();
            });
        });

        // Location Type Change
        locationRadios.forEach(radio => {
            radio.addEventListener('change', () => {
                if (radio.checked) {
                    self.state.locationType = radio.value;
                    if (radio.value === 'home-visit') {
                        homeAddressContainer.classList.remove('hidden');
                        summaryLocation.textContent = t('booking.homeVisitSummary');
                    } else {
                        homeAddressContainer.classList.add('hidden');
                        summaryLocation.textContent = t('booking.inClinic');
                    }
                    self.updateSummary();
                }
            });
        });

        // Credit Checkbox Change
        if (creditCheckbox) {
            creditCheckbox.addEventListener('change', (e) => {
                self.state.useCredit = e.target.checked;
                if (self.state.useCredit) {
                    summaryCreditRow.classList.remove('hidden');
                } else {
                    summaryCreditRow.classList.add('hidden');
                }
                self.updateSummary();
            });
        }

        // Auth Guard for Proceed Button
        const proceedBtn = document.getElementById('proceed-btn');
        if (proceedBtn) {
            proceedBtn.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Cek status login
                const user = User.getCurrentUser();
                
                if (!user) {
                    alert(t('booking.loginReq'));
                    // Redirect ke halaman login, bisa menyimpan rute ini untuk redirect kembali
                    window.location.hash = '#/login';
                } else {
                    // Jika sudah login, lanjut ke form asessment / detail kontak
                    window.location.hash = '#/patient/assessment';
                }
            });
        }
    },

    updateSummary() {
        const summarySchedule = document.getElementById('summary-schedule');
        const summaryPrice = document.getElementById('summary-price');
        
        if (summarySchedule) {
            summarySchedule.textContent = I18n.formatAppointmentSchedule(this.state.date, this.state.time);
        }

        if (this.state.service && summaryPrice) {
            let total = this.state.service.price;
            if (this.state.locationType === 'home-visit') {
                total += 50000;
            }
            if (this.state.useCredit) {
                total -= 49000;
            }
            summaryPrice.textContent = Service.formatPrice(Math.max(0, total));
        }
    }
};

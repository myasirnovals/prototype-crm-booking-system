/* ============================================
   PhysioCare - Patient Update Booking View
   ============================================ */

const PatientUpdateBookingView = {
    /**
     * Render the update booking page
     */
    async render(params) {
        const user = User.getCurrentUser();
        const name = user ? user.name : 'James';
        const appId = params && params.id ? params.id : null;
        
        let appointment = null;
        if (appId) {
            appointment = await AppointmentModel.getById(appId);
        }

        if (!appointment) {
            return `
            ${NavbarPatient.render('dashboard', name)}
            <main class="max-w-container-max mx-auto px-gutter py-stack-lg">
                <div class="text-center py-20">
                    <h2 class="text-2xl font-bold text-on-surface">${t('update.notFound')}</h2>
                    <a href="#/patient/dashboard" class="text-primary mt-4 inline-block">${t('update.returnDashboard')}</a>
                </div>
            </main>
            ${Footer.render()}
            `;
        }

        // We will allow updating Date, Time, and Payment Method
        return `
        ${NavbarPatient.render('dashboard', name)}
        <main class="max-w-container-max mx-auto px-gutter py-stack-lg min-h-screen">
            <div class="max-w-3xl mx-auto">
                <div class="flex items-center gap-2 text-on-surface-variant mb-6">
                    <a href="#/patient/dashboard" class="hover:text-primary transition-colors flex items-center">
                        <span class="material-symbols-outlined text-[20px]">arrow_back</span>
                        ${t('update.backDashboard')}
                    </a>
                </div>

                <div class="bg-clinical-white border border-outline-variant rounded-2xl p-8 soft-shadow relative overflow-hidden">
                    <div class="absolute top-0 right-0 w-32 h-32 bg-primary-container/20 rounded-bl-full -z-10"></div>
                    
                    <h1 class="font-headline-lg text-headline-md text-on-surface mb-2">${t('update.title')}</h1>
                    <p class="text-on-surface-variant mb-8">${t('update.sub', {therapist: appointment.therapistName || 'your therapist'})}</p>
                    
                    <form id="update-booking-form" class="space-y-8">
                        <!-- Current Info -->
                        <div class="bg-surface-muted p-5 rounded-xl border border-outline-variant/30 flex flex-col md:flex-row gap-6">
                            <div class="flex-1">
                                <span class="text-label-sm uppercase tracking-wider text-on-surface-variant block mb-1">${t('update.service')}</span>
                                <p class="font-bold text-on-surface">${appointment.serviceName}</p>
                            </div>
                            <div class="flex-1">
                                <span class="text-label-sm uppercase tracking-wider text-on-surface-variant block mb-1">${t('update.currentDate')}</span>
                                <p class="font-bold text-primary">${appointment.date}</p>
                            </div>
                            <div class="flex-1">
                                <span class="text-label-sm uppercase tracking-wider text-on-surface-variant block mb-1">${t('update.currentTime')}</span>
                                <p class="font-bold text-primary">${appointment.time}</p>
                            </div>
                        </div>

                        <!-- New Date & Time -->
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div class="space-y-2">
                                <label class="font-button-text text-button-text text-on-surface block">${t('update.newDate')} <span class="text-emergency-red">*</span></label>
                                <div class="relative">
                                    <span class="material-symbols-outlined absolute left-3 top-3 text-on-surface-variant">calendar_month</span>
                                    <input type="date" id="update-date" required class="w-full bg-surface-muted border-none rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-primary outline-none" value="${appointment.date}">
                                </div>
                            </div>
                            
                            <div class="space-y-2">
                                <label class="font-button-text text-button-text text-on-surface block">${t('update.newTime')} <span class="text-emergency-red">*</span></label>
                                <div class="relative">
                                    <span class="material-symbols-outlined absolute left-3 top-3 text-on-surface-variant">schedule</span>
                                    <select id="update-time" required class="w-full bg-surface-muted border-none rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-primary outline-none appearance-none">
                                        <option value="09:00 AM" ${appointment.time === '09:00 AM' ? 'selected' : ''}>09:00 AM</option>
                                        <option value="10:30 AM" ${appointment.time === '10:30 AM' ? 'selected' : ''}>10:30 AM</option>
                                        <option value="01:00 PM" ${appointment.time === '01:00 PM' ? 'selected' : ''}>01:00 PM</option>
                                        <option value="02:30 PM" ${appointment.time === '02:30 PM' ? 'selected' : ''}>02:30 PM</option>
                                        <option value="04:00 PM" ${appointment.time === '04:00 PM' ? 'selected' : ''}>04:00 PM</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <!-- Payment Method -->
                        <div class="space-y-3">
                            <label class="font-button-text text-button-text text-on-surface block">${t('update.paymentMethod')}</label>
                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <label class="relative flex items-center p-4 border border-outline-variant rounded-xl cursor-pointer hover:bg-surface-container-low transition-colors has-[:checked]:border-secondary has-[:checked]:bg-secondary/5">
                                    <input type="radio" name="update-payment" value="credit_card" class="peer h-5 w-5 text-secondary focus:ring-secondary border-outline-variant" ${appointment.paymentMethod === 'credit_card' ? 'checked' : ''}>
                                    <span class="ml-3 flex flex-col">
                                        <span class="font-bold text-on-surface flex items-center gap-2">
                                            <span class="material-symbols-outlined text-secondary">credit_card</span> ${t('update.creditCard')}
                                        </span>
                                    </span>
                                </label>
                                
                                <label class="relative flex items-center p-4 border border-outline-variant rounded-xl cursor-pointer hover:bg-surface-container-low transition-colors has-[:checked]:border-secondary has-[:checked]:bg-secondary/5">
                                    <input type="radio" name="update-payment" value="bank_transfer" class="peer h-5 w-5 text-secondary focus:ring-secondary border-outline-variant" ${appointment.paymentMethod === 'bank_transfer' ? 'checked' : (!appointment.paymentMethod ? 'checked' : '')}>
                                    <span class="ml-3 flex flex-col">
                                        <span class="font-bold text-on-surface flex items-center gap-2">
                                            <span class="material-symbols-outlined text-secondary">account_balance</span> ${t('update.bankTransfer')}
                                        </span>
                                    </span>
                                </label>
                            </div>
                        </div>

                        <!-- Policy Warning & Emergency Reason (Dynamic) -->
                        <div class="bg-warning-amber/10 border border-warning-amber/30 p-4 rounded-xl">
                            <div class="flex items-start gap-3">
                                <span class="material-symbols-outlined text-warning-amber">info</span>
                                <div>
                                    <p class="font-bold text-on-surface text-sm mb-1">${t('update.policy')}</p>
                                    <p class="text-xs text-on-surface-variant">${t('update.policyDesc')}</p>
                                </div>
                            </div>
                            <div id="emergency-reason-container" class="mt-4 hidden animate-fade-in">
                                <label class="block font-label-sm text-label-sm mb-1 text-on-surface">${t('update.reason')} <span class="text-error">*</span></label>
                                <textarea id="emergency-reason" class="w-full p-3 rounded-lg border border-outline-variant focus:ring-2 focus:ring-primary outline-none resize-none h-20" placeholder="${t('update.reasonPlaceholder')}"></textarea>
                                <p class="text-[10px] text-error mt-1">${t('update.adminDoc')}</p>
                            </div>
                        </div>
                        
                        <div class="flex items-start gap-3 mt-4">
                            <input type="checkbox" id="agree-policy" required class="mt-1 w-4 h-4 text-primary focus:ring-primary border-outline-variant rounded">
                            <label for="agree-policy" class="text-sm cursor-pointer text-on-surface-variant">
                                ${t('update.agree')} <a href="#" class="text-primary hover:underline">${t('update.terms')}</a> ${t('update.regarding')}
                            </label>
                        </div>

                        <!-- Actions -->
                        <div class="pt-6 border-t border-outline-variant/30 flex gap-4 justify-end">
                            <a href="#/patient/dashboard" class="px-6 py-3 rounded-lg font-button-text text-button-text border border-outline-variant hover:bg-surface-muted transition-colors">${t('update.cancel')}</a>
                            <button type="submit" class="px-6 py-3 bg-primary text-on-primary rounded-lg font-button-text text-button-text hover:bg-primary/90 active:scale-95 transition-all flex items-center gap-2">
                                ${t('update.save')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </main>
        ${Footer.render()}
        `;
    },

    init(params) {
        NavbarPatient.init();

        const form = document.getElementById('update-booking-form');
        const dateInput = document.getElementById('update-date');
        const emergencyContainer = document.getElementById('emergency-reason-container');
        const emergencyReason = document.getElementById('emergency-reason');

        // Logic to detect < 24h
        if (dateInput) {
            dateInput.addEventListener('change', () => {
                const selectedDate = new Date(dateInput.value);
                const today = new Date();
                const diffTime = selectedDate - today;
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
                
                // If the new date is today or tomorrow (simulating <24h logic for prototype)
                if (diffDays <= 1 && diffDays >= 0) {
                    emergencyContainer.classList.remove('hidden');
                    emergencyReason.setAttribute('required', 'true');
                } else {
                    emergencyContainer.classList.add('hidden');
                    emergencyReason.removeAttribute('required');
                }
            });
        }

        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const agreePolicy = document.getElementById('agree-policy').checked;
                if (!agreePolicy) {
                    alert(t('update.agreeRequired'));
                    return;
                }

                const appId = params && params.id ? params.id : null;
                if (!appId) return;

                const newDate = document.getElementById('update-date').value;
                const newTime = document.getElementById('update-time').value;
                const paymentMethod = document.querySelector('input[name="update-payment"]:checked').value;

                // Call model update
                const appointment = await AppointmentModel.getById(appId);
                if (appointment) {
                    await AppointmentModel.update(appId, {
                        date: newDate,
                        time: newTime,
                        paymentMethod: paymentMethod,
                        emergencyReason: emergencyReason.value || null
                    });
                }
                
                // Show success and redirect
                if (!emergencyContainer.classList.contains('hidden')) {
                    alert(t('update.rescheduleRequested'));
                } else {
                    alert(t('update.updated'));
                }
                window.location.hash = '#/patient/dashboard';
            });
        }
    }
};

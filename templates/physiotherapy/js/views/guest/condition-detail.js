/* ============================================
   PhysioCare - Condition Detail View
   ============================================ */

const GuestConditionDetailView = {
    async render(params) {
        const slug = params.slug;
        const conditionModel = new Condition();
        
        try {
            const condition = await conditionModel.bySlug(slug);
            
            if (!condition) {
                return `
                    ${NavbarGuest.render('conditions')}
                    <main class="min-h-screen pt-24 pb-16 flex items-center justify-center bg-surface-bright">
                        <div class="text-center">
                            <span class="material-symbols-outlined text-[64px] text-error mb-4">search_off</span>
                            <h1 class="font-headline-lg text-error mb-4">${t('condDetail.notFound')}</h1>
                            <a href="#/conditions" class="text-primary hover:underline font-medium">${t('condDetail.backToIndex')}</a>
                        </div>
                    </main>
                    ${Footer.render()}
                `;
            }

            // Fetch recommended services
            const serviceModel = new Service();
            const allServices = await serviceModel.all();
            const recommendedServices = allServices.filter(s => condition.recommendedServices && condition.recommendedServices.includes(s.id));
            
            let recommendedServicesHtml = '';
            if (recommendedServices.length > 0) {
                const cardsHtml = recommendedServices.map(service => 
                    ServiceCard.render(service, 'compact')
                ).join('');
                
                recommendedServicesHtml = `
                    <div class="mb-12">
                        <h2 class="font-headline-sm text-headline-sm text-on-background mb-6 flex items-center gap-3">
                            <span class="material-symbols-outlined text-primary text-[28px]" style="font-variation-settings: 'FILL' 1;">medical_services</span>
                            Layanan yang Disarankan
                        </h2>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            ${cardsHtml}
                        </div>
                    </div>
                `;
            }

            const symptomsList = condition.symptoms.map(s => `
                <li class="flex items-start gap-3 mb-3 p-3 rounded-xl hover:bg-surface-muted transition-colors">
                    <span class="material-symbols-outlined text-primary text-[20px] shrink-0 mt-0.5" style="font-variation-settings: 'FILL' 1;">check_circle</span> 
                    <span class="text-on-surface text-sm font-body-md">${s}</span>
                </li>
            `).join('');

            const causesList = condition.causes.map(c => `
                <li class="flex items-start gap-3 mb-3 p-3 rounded-xl hover:bg-surface-muted transition-colors">
                    <span class="material-symbols-outlined text-secondary text-[20px] shrink-0 mt-0.5" style="font-variation-settings: 'FILL' 1;">info</span> 
                    <span class="text-on-surface text-sm font-body-md">${c}</span>
                </li>
            `).join('');

            return `
                ${NavbarGuest.render('conditions')}
                
                <main class="min-h-screen pt-24 pb-24 bg-surface-bright">
                    <!-- Breadcrumb -->
                    <div class="bg-surface-container-low py-4 border-b border-outline-variant/30">
                        <div class="max-w-container-max mx-auto px-6 md:px-10 text-xs font-label-sm uppercase tracking-wide text-on-surface-variant flex items-center gap-2">
                            <a href="#/" class="hover:text-primary transition-colors">${t('nav.home')}</a> 
                            <span class="material-symbols-outlined text-[14px]">chevron_right</span>
                            <a href="#/conditions" class="hover:text-primary transition-colors">${t('nav.conditions')}</a> 
                            <span class="material-symbols-outlined text-[14px]">chevron_right</span>
                            <span class="text-primary font-bold">${condition.name}</span>
                        </div>
                    </div>

                    <!-- Content -->
                    <article class="max-w-3xl mx-auto px-6 py-12">
                        <!-- Header -->
                        <div class="flex items-center gap-5 mb-8">
                            <div class="w-20 h-20 rounded-[24px] bg-primary-container text-on-primary-container flex items-center justify-center shadow-inner">
                                <span class="material-symbols-outlined text-[40px]" style="font-variation-settings: 'FILL' 1;">${condition.icon}</span>
                            </div>
                            <div>
                                <span class="inline-flex items-center gap-1.5 px-3 py-1 bg-secondary/10 text-secondary border border-secondary/20 rounded-full text-xs font-bold mb-3 tracking-wide">
                                    <span class="material-symbols-outlined text-[14px]">body_system</span>
                                    ${condition.areaLabel}
                                </span>
                                <h1 class="font-headline-lg text-headline-lg lg:text-[40px] text-on-background leading-tight">${condition.name}</h1>
                            </div>
                        </div>

                        <p class="text-on-surface-variant font-body-lg text-lg leading-relaxed mb-12 p-6 bg-primary/5 rounded-2xl border-l-4 border-primary">
                            ${condition.shortDescription}
                        </p>

                        <!-- Symptoms & Causes -->
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                            <div class="bg-clinical-white rounded-3xl p-8 border border-outline-variant/40 shadow-sm">
                                <h2 class="font-headline-sm text-headline-sm text-on-background mb-6 flex items-center gap-3">
                                    <div class="w-10 h-10 rounded-xl bg-error-container/30 flex items-center justify-center text-error">
                                        <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">sick</span>
                                    </div>
                                    Gejala Umum
                                </h2>
                                <ul class="">
                                    ${symptomsList}
                                </ul>
                            </div>
                            <div class="bg-clinical-white rounded-3xl p-8 border border-outline-variant/40 shadow-sm">
                                <h2 class="font-headline-sm text-headline-sm text-on-background mb-6 flex items-center gap-3">
                                    <div class="w-10 h-10 rounded-xl bg-warning-amber/10 flex items-center justify-center text-warning-amber">
                                        <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">psychology_alt</span>
                                    </div>
                                    Faktor Penyebab
                                </h2>
                                <ul class="">
                                    ${causesList}
                                </ul>
                            </div>
                        </div>

                        <!-- Treatment section -->
                        <div class="bg-gradient-to-br from-primary-container/40 to-primary-container/10 rounded-3xl p-10 mb-12 border border-primary/10 relative overflow-hidden">
                            <div class="absolute right-0 top-0 w-48 h-48 bg-clinical-white/30 rounded-full blur-2xl translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
                            
                            <h2 class="font-headline-md text-headline-md text-on-background mb-6 relative z-10 flex items-center gap-3">
                                <span class="material-symbols-outlined text-primary text-[32px]" style="font-variation-settings: 'FILL' 1;">physical_therapy</span>
                                Pendekatan Fisioterapi
                            </h2>
                            <p class="text-on-surface-variant text-base leading-loose mb-8 relative z-10">
                                ${condition.treatment}
                            </p>
                            
                            <div class="flex items-center gap-4 bg-clinical-white/80 backdrop-blur p-5 rounded-2xl border border-clinical-white shadow-sm inline-flex relative z-10">
                                <div class="w-12 h-12 bg-secondary-container text-on-secondary-container rounded-xl flex items-center justify-center">
                                    <span class="material-symbols-outlined text-[24px]">update</span>
                                </div>
                                <div>
                                    <div class="text-xs font-label-sm uppercase tracking-wider text-on-surface-variant mb-1">Estimasi Pemulihan</div>
                                    <div class="font-bold text-on-background text-sm">${condition.recoveryEstimate}</div>
                                </div>
                            </div>
                        </div>

                        ${recommendedServicesHtml}

                        <!-- CTA -->
                        <div class="bg-clinical-white rounded-[32px] p-10 border-2 border-primary/10 text-center shadow-clinical">
                            <div class="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 text-primary">
                                <span class="material-symbols-outlined text-[32px]">event_available</span>
                            </div>
                            <h3 class="font-headline-md text-headline-md text-on-background mb-3">Butuh Penanganan Segera?</h3>
                            <p class="text-on-surface-variant font-body-md mb-8 max-w-md mx-auto">
                                Jangan biarkan nyeri membatasi aktivitas Anda. Jadwalkan konsultasi dengan fisioterapis kami untuk mendapatkan penanganan yang tepat.
                            </p>
                            <a href="#/booking" class="inline-flex items-center justify-center bg-primary text-on-primary px-10 py-4 rounded-xl font-button-text hover:bg-primary-hover hover:scale-105 hover:shadow-lg transition-all">
                                Buat Jadwal Konsultasi Sekarang
                                <span class="material-symbols-outlined ml-2">arrow_forward</span>
                            </a>
                        </div>
                    </article>
                </main>

                ${Footer.render()}
            `;
        } catch (error) {
            console.error('Error rendering condition detail view:', error);
            return `
                ${NavbarGuest.render('conditions')}
                <main class="min-h-screen pt-24 pb-16 flex items-center justify-center bg-surface-bright">
                    <div class="text-center text-error bg-error-container/20 p-8 rounded-3xl">
                        <p class="font-bold">Terjadi kesalahan saat memuat data kondisi.</p>
                    </div>
                </main>
                ${Footer.render()}
            `;
        }
    },
    
    init() {
        if (typeof NavbarGuest.initScrollEffect === 'function') {
            NavbarGuest.initScrollEffect();
        }

        // Initialize ScrollReveal if available
        if (typeof ScrollReveal !== 'undefined') {
            const sr = ScrollReveal({
                distance: '30px',
                duration: 800,
                easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
                viewFactor: 0.1,
                reset: false
            });

            sr.reveal('article > div.flex, article > p', { origin: 'bottom', interval: 100 });
            sr.reveal('.grid > div', { origin: 'bottom', interval: 100, delay: 100 });
            sr.reveal('.bg-gradient-to-br', { origin: 'bottom', delay: 200 });
            sr.reveal('article > .mb-12:not(.grid)', { origin: 'bottom', delay: 300 }); // Recommended services
            sr.reveal('article > .bg-clinical-white.text-center', { origin: 'bottom', delay: 400 }); // CTA
        }
    }
};

/* ============================================
   PhysioCare - Guest Home View (Landing Page)
   Sections:
     1. Hero
     2. Stats Bar
     3. Why Choose Us
     4. Our Services (FR-02)
     5. Kondisi yang Ditangani (FR-03 teaser)
     6. Patient Journey (FR-04)
     7. Our Therapists (FR-01 teaser)
     8. Testimonials (FR-05 teaser)
     9. Final CTA
   ============================================ */

const GuestHomeView = {
    async render() {
        const services   = await ServiceModel.all();
        const therapists = await TherapistModel.all();

        /* ── Service Cards (first 3) ── */
        const serviceCards = services.slice(0, 3).map(s => `
            <a href="#/services/${s.id}" class="group block bg-clinical-white rounded-2xl overflow-hidden service-card-hover shadow-clinical border border-outline-variant/30 reveal">
                <div class="relative h-48 overflow-hidden">
                    <img
                        src="${s.image}"
                        alt="${s.name}"
                        class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        loading="lazy"
                    >
                    <div class="absolute inset-0 bg-gradient-to-t from-on-background/60 via-transparent to-transparent"></div>
                    <div class="absolute top-4 left-4">
                        <div class="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg">
                            <span class="material-symbols-outlined text-on-primary text-[22px]" style="font-variation-settings: 'FILL' 1;">${s.icon}</span>
                        </div>
                    </div>
                    <div class="absolute bottom-4 left-4">
                        <span class="font-label-sm text-label-sm text-primary-fixed bg-on-background/50 backdrop-blur-sm px-2 py-0.5 rounded-full">
                            ${s.duration}
                        </span>
                    </div>
                </div>
                <div class="p-6">
                    <h3 class="font-headline-md text-headline-md text-on-background mb-2 group-hover:text-primary transition-colors">${s.name}</h3>
                    <p class="text-on-surface-variant text-sm leading-relaxed mb-4">${s.shortDescription}</p>
                    <div class="flex items-center justify-between">
                        <span class="text-primary font-bold text-sm">${t('home.startingFrom')} Rp ${(s.price / 1000).toFixed(0)}k</span>
                        <span class="text-primary flex items-center gap-1 text-sm font-semibold group-hover:gap-2 transition-all">
                            ${t('home.learnMore')} <span class="material-symbols-outlined text-[16px]">arrow_forward</span>
                        </span>
                    </div>
                </div>
            </a>
        `).join('');

        /* ── Condition body-area teaser items ── */
        const bodyAreas = [
            { icon: 'face', label: t('home.areaHead'),   key: 'leher',     count: 4 },
            { icon: 'sports_gymnastics', label: t('home.areaShoulder'), key: 'bahu', count: 5 },
            { icon: 'man',  label: t('home.areaBack'),   key: 'punggung',  count: 7 },
            { icon: 'accessibility_new', label: t('home.areaKnee'), key: 'lutut', count: 6 },
            { icon: 'directions_walk', label: t('home.areaAnkle'), key: 'pergelangan', count: 4 },
            { icon: 'back_hand', label: t('home.areaArm'), key: 'lengan', count: 5 },
        ];
        const conditionAreaCards = bodyAreas.map((area, i) => `
            <a href="#/conditions?area=${area.key}"
               class="group flex flex-col items-center gap-3 p-5 bg-clinical-white rounded-2xl border border-outline-variant/40
                      hover:border-primary hover:shadow-md transition-all duration-300 cursor-pointer reveal delay-${i+1}">
                <div class="w-14 h-14 rounded-2xl bg-primary/8 group-hover:bg-primary transition-all duration-300 flex items-center justify-center">
                    <span class="material-symbols-outlined text-primary group-hover:text-on-primary text-[28px] transition-colors" style="font-variation-settings: 'FILL' 1;">${area.icon}</span>
                </div>
                <div class="text-center">
                    <div class="font-semibold text-on-background text-sm">${area.label}</div>
                    <div class="text-on-surface-variant text-xs mt-0.5 font-label-sm">${area.count} ${t('home.conditions')}</div>
                </div>
            </a>
        `).join('');

        /* ── Patient Journey Steps (FR-04) ── */
        const journeySteps = [
            { icon: 'stethoscope', step: '01', title: t('home.journeyStep1'), desc: t('home.journeyStep1Desc') },
            { icon: 'assignment', step: '02', title: t('home.journeyStep2'), desc: t('home.journeyStep2Desc') },
            { icon: 'physical_therapy', step: '03', title: t('home.journeyStep3'), desc: t('home.journeyStep3Desc') },
            { icon: 'insights', step: '04', title: t('home.journeyStep4'), desc: t('home.journeyStep4Desc') },
            { icon: 'fitness_center', step: '05', title: t('home.journeyStep5'), desc: t('home.journeyStep5Desc') },
            { icon: 'task_alt', step: '06', title: t('home.journeyStep6'), desc: t('home.journeyStep6Desc') },
        ];
        const journeyCards = journeySteps.map((step, i) => `
            <div class="reveal delay-${i+1} flex flex-col items-center text-center group">
                <div class="relative mb-4">
                    <div class="w-14 h-14 rounded-2xl bg-surface-muted group-hover:bg-primary flex items-center justify-center transition-all duration-300 shadow-sm">
                        <span class="material-symbols-outlined text-primary group-hover:text-on-primary text-[26px] transition-colors" style="font-variation-settings: 'FILL' 1;">${step.icon}</span>
                    </div>
                    <div class="absolute -top-2 -right-2 w-6 h-6 bg-primary-container text-on-primary-container rounded-full flex items-center justify-center font-label-sm text-[10px] font-bold shadow">
                        ${step.step}
                    </div>
                </div>
                <h4 class="font-semibold text-on-background text-sm mb-1.5 leading-tight">${step.title}</h4>
                <p class="text-on-surface-variant text-xs leading-relaxed max-w-[120px]">${step.desc}</p>
            </div>
        `).join('');

        /* ── Therapist Cards (first 3) ── */
        const therapistCards = therapists.slice(0, 3).map(th => `
            <div class="group bg-clinical-white rounded-2xl p-6 border border-outline-variant/30 shadow-clinical service-card-hover reveal text-center">
                <div class="relative mx-auto w-20 h-20 mb-4">
                    <img
                        src="${th.image}" alt="${th.name}"
                        class="w-full h-full rounded-full object-cover border-4 border-primary-fixed shadow-md"
                        loading="lazy"
                    >
                    ${th.strVerified ? `
                    <div class="absolute -bottom-1 -right-1 w-7 h-7 bg-success-green rounded-full border-2 border-clinical-white flex items-center justify-center shadow-sm" title="STR Verified">
                        <span class="material-symbols-outlined text-on-primary text-[14px]" style="font-variation-settings: 'FILL' 1;">verified</span>
                    </div>` : ''}
                </div>
                <h3 class="font-semibold text-on-background mb-0.5 text-base">${th.name}</h3>
                <p class="text-on-surface-variant text-xs mb-3 font-label-sm">${th.specialization}</p>
                <div class="flex items-center justify-center gap-1 text-warning-amber mb-4">
                    <span class="material-symbols-outlined text-[14px]" style="font-variation-settings: 'FILL' 1;">star</span>
                    <span class="font-bold text-sm text-on-background">${th.rating}</span>
                    <span class="text-on-surface-variant text-xs">(${th.reviews})</span>
                </div>
                <a href="#/booking?therapist=${th.id}"
                   class="w-full block text-center border-2 border-primary text-primary px-4 py-2 rounded-xl text-sm font-semibold hover:bg-primary hover:text-on-primary transition-all">
                    ${t('home.bookSchedule')}
                </a>
            </div>
        `).join('');

        /* ── Testimonials ── */
        const testimonials = [
            {
                text: t('home.testimonial1'),
                name: 'David Kurniawan',
                role: t('home.marathonRunner'),
                rating: 5,
                initials: 'DK',
                color: 'bg-primary'
            },
            {
                text: t('home.testimonial2'),
                name: 'Siti Aminah',
                role: t('home.familyCaregiver'),
                rating: 5,
                initials: 'SA',
                color: 'bg-secondary'
            },
            {
                text: t('home.testimonial3'),
                name: 'Rudi Hartono',
                role: t('home.officeWorker'),
                rating: 5,
                initials: 'RH',
                color: 'bg-primary-container'
            },
        ];
        const testimonialCards = testimonials.map((tm, i) => `
            <div class="group bg-clinical-white p-7 rounded-2xl shadow-clinical border border-outline-variant/30 relative service-card-hover reveal delay-${i+1}">
                <div class="quote-mark">"</div>
                <!-- Stars -->
                <div class="flex gap-0.5 mb-4">
                    ${'<span class="material-symbols-outlined text-warning-amber text-[16px]" style="font-variation-settings: \'FILL\' 1;">star</span>'.repeat(tm.rating)}
                </div>
                <p class="text-on-surface-variant text-sm leading-relaxed italic mb-6">${tm.text}</p>
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full ${tm.color} flex items-center justify-center text-on-primary font-bold text-sm flex-shrink-0">${tm.initials}</div>
                    <div>
                        <div class="font-semibold text-on-background text-sm">${tm.name}</div>
                        <div class="text-on-surface-variant text-xs font-label-sm">${tm.role}</div>
                    </div>
                </div>
            </div>
        `).join('');

        return `
        ${NavbarGuest.render('home')}

        <main>
        <!-- ╔══════════════════════════════════════╗
             ║  SECTION 1: HERO                     ║
             ╚══════════════════════════════════════╝ -->
        <section class="relative min-h-[92vh] flex items-center overflow-hidden bg-gradient-to-br from-surface-bright via-surface-container-low to-primary-fixed/20">
            <!-- Background decorations -->
            <div class="hero-blob w-[500px] h-[500px] bg-primary/5 -top-40 -right-32" style="animation: float 12s ease-in-out infinite;"></div>
            <div class="hero-blob w-[350px] h-[350px] bg-secondary/6 bottom-0 left-0" style="animation: float 9s ease-in-out infinite reverse;"></div>
            <div class="hero-blob w-[250px] h-[250px] bg-primary-fixed/40 top-1/3 left-1/3" style="animation: float 15s ease-in-out infinite;"></div>

            <div class="relative z-10 max-w-container-max mx-auto px-6 md:px-10 w-full py-24 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <!-- Left: Copy -->
                <div class="space-y-6">
                    <!-- Trust badge -->
                    <div class="fade-in-up inline-flex items-center gap-2 px-4 py-2 bg-primary/8 border border-primary/20 rounded-full text-primary font-bold text-xs tracking-wide uppercase">
                        <span class="w-2 h-2 rounded-full bg-success-green animate-pulse flex-shrink-0"></span>
                        <span class="material-symbols-outlined text-[14px]">verified</span>
                        ${t('home.badge')}
                    </div>

                    <!-- Headline -->
                    <h1 class="fade-in-up delay-100 font-headline-lg text-headline-lg lg:text-[58px] lg:leading-[66px] text-on-background tracking-tight">
                        ${t('home.heroTitle1')}<br>
                        <span class="gradient-text">${t('home.heroTitle2')}</span>
                    </h1>

                    <!-- Subline -->
                    <p class="fade-in-up delay-200 font-body-lg text-body-lg text-on-surface-variant max-w-[520px] leading-relaxed">
                        ${t('home.heroSub')}
                    </p>

                    <!-- Disclaimer -->
                    <p class="fade-in-up delay-200 text-xs text-on-surface-variant/70 flex items-center gap-1.5">
                        <span class="material-symbols-outlined text-[14px] text-warning-amber">info</span>
                        ${t('home.heroPriceDisclaimer')}
                    </p>

                    <!-- CTAs -->
                    <div class="fade-in-up delay-300 flex flex-col sm:flex-row gap-4 pt-2">
                        <a href="#/booking"
                           class="flex items-center justify-center gap-2 bg-primary text-on-primary px-8 py-4 rounded-xl font-button-text text-button-text shadow-lg hover:bg-primary-container active:scale-[0.98] transition-all">
                            <span class="material-symbols-outlined">calendar_today</span>
                            ${t('home.bookAppointment')}
                        </a>
                        <a href="#/services"
                           class="flex items-center justify-center gap-2 border-2 border-primary text-primary px-8 py-4 rounded-xl font-button-text text-button-text hover:bg-primary/5 transition-all">
                            ${t('home.viewServices')}
                            <span class="material-symbols-outlined">arrow_forward</span>
                        </a>
                    </div>

                    <!-- Social proof -->
                    <div class="fade-in-up delay-400 flex flex-wrap items-center gap-6 pt-4">
                        <div class="flex items-center gap-3">
                            <div class="flex -space-x-2">
                                ${['bg-primary', 'bg-secondary', 'bg-primary-container', 'bg-success-green'].map((c, i) =>
                                    `<div class="w-9 h-9 rounded-full border-2 border-clinical-white ${c} flex items-center justify-center text-[10px] font-bold text-on-primary shadow-sm">${['DK','SA','RH','BW'][i]}</div>`
                                ).join('')}
                            </div>
                            <div>
                                <div class="flex gap-0.5 mb-0.5">
                                    ${'<span class="material-symbols-outlined text-warning-amber text-[14px]" style="font-variation-settings: \'FILL\' 1;">star</span>'.repeat(5)}
                                </div>
                                <span class="text-xs text-on-surface-variant"><strong class="text-primary">500+</strong> ${t('home.patientsRecovered')}</span>
                            </div>
                        </div>
                        <div class="h-8 w-px bg-outline-variant"></div>
                        <div class="flex items-center gap-2 text-xs text-on-surface-variant">
                            <span class="material-symbols-outlined text-success-green text-[16px]" style="font-variation-settings: 'FILL' 1;">check_circle</span>
                            ${t('home.strVerified')} ${t('home.certified')}
                        </div>
                    </div>
                </div>

                <!-- Right: Visual panel -->
                <div class="hidden lg:flex justify-center items-center relative">
                    <!-- Main card -->
                    <div class="relative w-[400px] h-[480px]">
                        <!-- Background decoration ring -->
                        <div class="absolute inset-0 rounded-[32px] bg-gradient-to-br from-primary/10 to-secondary/10 -rotate-3"></div>
                        <!-- Card -->
                        <div class="relative w-full h-full rounded-[32px] bg-clinical-white shadow-2xl border-[6px] border-clinical-white overflow-hidden flex flex-col items-center justify-center gap-6 p-8">
                            <!-- Big icon -->
                            <div class="w-32 h-32 rounded-3xl bg-primary/8 flex items-center justify-center animate-subtle-float">
                                <span class="material-symbols-outlined text-[72px] text-primary" style="font-variation-settings: 'FILL' 1;">health_and_safety</span>
                            </div>
                            <!-- Info row -->
                            <div class="w-full space-y-3">
                                <!-- STR Verified badge -->
                                <div class="glass-card rounded-2xl p-4 flex items-center gap-3">
                                    <div class="w-10 h-10 bg-success-green/15 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <span class="material-symbols-outlined text-success-green text-[22px]" style="font-variation-settings: 'FILL' 1;">verified</span>
                                    </div>
                                    <div>
                                        <div class="font-bold text-primary text-sm">${t('home.strVerified')}</div>
                                        <div class="text-on-surface-variant text-xs">${t('home.certified')}</div>
                                    </div>
                                </div>
                                <!-- Recovery rate -->
                                <div class="glass-card rounded-2xl p-4 flex items-center gap-3">
                                    <div class="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <span class="material-symbols-outlined text-primary text-[22px]" style="font-variation-settings: 'FILL' 1;">trending_up</span>
                                    </div>
                                    <div>
                                        <div class="font-bold text-primary text-sm">98% ${t('home.satisfactionRate')}</div>
                                        <div class="text-on-surface-variant text-xs">${t('home.basedOnReviews')}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Floating stat badges -->
                    <div class="absolute -top-4 -right-4 glass-card rounded-2xl p-3 shadow-xl flex items-center gap-2 animate-subtle-float" style="animation-delay: 1s;">
                        <div class="w-8 h-8 bg-warning-amber/15 rounded-lg flex items-center justify-center">
                            <span class="material-symbols-outlined text-warning-amber text-[18px]" style="font-variation-settings: 'FILL' 1;">star</span>
                        </div>
                        <div>
                            <div class="font-bold text-on-background text-sm">4.9/5</div>
                            <div class="text-on-surface-variant text-[10px] font-label-sm">RATING</div>
                        </div>
                    </div>
                    <div class="absolute -bottom-4 -left-4 glass-card rounded-2xl p-3 shadow-xl flex items-center gap-2 animate-subtle-float" style="animation-delay: 2s;">
                        <div class="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                            <span class="material-symbols-outlined text-primary text-[18px]" style="font-variation-settings: 'FILL' 1;">group</span>
                        </div>
                        <div>
                            <div class="font-bold text-on-background text-sm">7 ${t('home.therapists')}</div>
                            <div class="text-on-surface-variant text-[10px] font-label-sm">STR VERIFIED</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Scroll indicator -->
            <div class="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-on-surface-variant/50 text-xs animate-bounce">
                <span class="material-symbols-outlined text-[20px]">keyboard_arrow_down</span>
            </div>
        </section>

        <!-- ╔══════════════════════════════════════╗
             ║  SECTION 2: STATS BAR                ║
             ╚══════════════════════════════════════╝ -->
        <section class="py-12 bg-primary">
            <div class="max-w-container-max mx-auto px-6 md:px-10">
                <div class="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-0 md:divide-x md:divide-primary-container/50">
                    ${[
                        { value: '500+', label: t('home.statPatients'),    icon: 'group' },
                        { value: '7',    label: t('home.statTherapists'),  icon: 'medical_services' },
                        { value: '98%',  label: t('home.statSatisfaction'),icon: 'thumb_up' },
                        { value: '10+',  label: t('home.statYears'),       icon: 'history_edu' },
                    ].map(s => `
                        <div class="flex flex-col items-center text-center md:px-6">
                            <span class="material-symbols-outlined text-primary-fixed-dim text-[28px] mb-2" style="font-variation-settings: 'FILL' 1;">${s.icon}</span>
                            <div class="font-headline-lg text-headline-lg text-clinical-white font-extrabold leading-none">${s.value}</div>
                            <div class="text-primary-fixed/80 font-label-sm text-label-sm mt-1 uppercase tracking-wide">${s.label}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </section>

        <!-- ╔══════════════════════════════════════╗
             ║  SECTION 3: WHY CHOOSE US            ║
             ╚══════════════════════════════════════╝ -->
        <section class="py-24 bg-clinical-white">
            <div class="max-w-container-max mx-auto px-6 md:px-10">
                <div class="text-center mb-14 space-y-3 reveal">
                    <span class="font-label-sm text-secondary uppercase tracking-widest text-label-sm">${t('home.coreValues')}</span>
                    <h2 class="font-headline-lg text-headline-lg text-on-background">${t('home.whyChoose')}</h2>
                    <div class="w-16 h-1 bg-gradient-to-r from-primary to-secondary mx-auto rounded-full"></div>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                    ${[
                        { icon: 'clinical_notes', title: t('home.evidenceBased'), desc: t('home.evidenceBasedDesc'), delay: 'delay-1' },
                        { icon: 'psychology',      title: t('home.patientFirst'),  desc: t('home.patientFirstDesc'),  delay: 'delay-2' },
                        { icon: 'ecg',             title: t('home.advancedTech'), desc: t('home.advancedTechDesc'), delay: 'delay-3' },
                    ].map(item => `
                        <div class="group reveal ${item.delay} p-8 rounded-2xl bg-surface-muted hover:bg-primary transition-all duration-500 cursor-default service-card-hover">
                            <div class="w-14 h-14 rounded-2xl bg-primary group-hover:bg-primary-container flex items-center justify-center mb-6 transition-colors shadow-md">
                                <span class="material-symbols-outlined text-on-primary text-[28px]" style="font-variation-settings: 'FILL' 1;">${item.icon}</span>
                            </div>
                            <h3 class="font-headline-md text-headline-md mb-3 text-on-background group-hover:text-on-primary transition-colors">${item.title}</h3>
                            <p class="text-on-surface-variant group-hover:text-primary-fixed font-body-md text-sm leading-relaxed transition-colors">${item.desc}</p>
                        </div>
                    `).join('')}
                </div>
            </div>
        </section>

        <!-- ╔══════════════════════════════════════╗
             ║  SECTION 4: OUR SERVICES (FR-02)     ║
             ╚══════════════════════════════════════╝ -->
        <section class="py-24 bg-surface-bright">
            <div class="max-w-container-max mx-auto px-6 md:px-10">
                <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 reveal">
                    <div class="space-y-3">
                        <span class="font-label-sm text-secondary uppercase tracking-widest text-label-sm">${t('home.clinicalExcellence')}</span>
                        <h2 class="font-headline-lg text-headline-lg text-on-background">${t('home.specializedExpertise')}</h2>
                    </div>
                    <a class="text-primary font-semibold flex items-center gap-2 group text-sm hover:gap-3 transition-all" href="#/services">
                        ${t('home.exploreAllServices')}
                        <span class="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                    </a>
                </div>

                <!-- Price disclaimer -->
                <div class="mb-6 p-3 bg-warning-amber/8 border border-warning-amber/20 rounded-xl flex items-center gap-2 text-xs text-on-surface-variant reveal">
                    <span class="material-symbols-outlined text-warning-amber text-[16px]" style="font-variation-settings: 'FILL' 1;">info</span>
                    ${t('home.priceDisclaimer')}
                </div>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    ${serviceCards}
                </div>
            </div>
        </section>

        <!-- ╔══════════════════════════════════════╗
             ║  SECTION 5: KONDISI MEDIS (FR-03)    ║
             ╚══════════════════════════════════════╝ -->
        <section class="py-24 bg-clinical-white">
            <div class="max-w-container-max mx-auto px-6 md:px-10">
                <div class="text-center mb-12 space-y-3 reveal">
                    <span class="font-label-sm text-secondary uppercase tracking-widest text-label-sm">${t('home.conditionsBadge')}</span>
                    <h2 class="font-headline-lg text-headline-lg text-on-background">${t('home.conditionsTitle')}</h2>
                    <p class="text-on-surface-variant font-body-md max-w-2xl mx-auto">${t('home.conditionsSub')}</p>
                    <div class="w-16 h-1 bg-gradient-to-r from-primary to-secondary mx-auto rounded-full"></div>
                </div>

                <!-- Body area grid -->
                <div class="grid grid-cols-3 md:grid-cols-6 gap-4 mb-10">
                    ${conditionAreaCards}
                </div>

                <!-- Sample conditions -->
                <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
                    ${[
                        { name: t('cond.frozenShoulder'), area: t('home.areaShoulder'), icon: 'sports_gymnastics', href: '#/conditions/frozen-shoulder' },
                        { name: t('cond.hnp'), area: t('home.areaBack'), icon: 'man', href: '#/conditions/hnp' },
                        { name: t('cond.acl'), area: t('home.areaKnee'), icon: 'accessibility_new', href: '#/conditions/cedera-acl' },
                        { name: t('cond.tennisElbow'), area: t('home.areaArm'), icon: 'back_hand', href: '#/conditions/tennis-elbow' },
                        { name: t('cond.neckPain'), area: t('home.areaHead'), icon: 'face', href: '#/conditions/nyeri-leher' },
                        { name: t('cond.plantar'), area: t('home.areaAnkle'), icon: 'directions_walk', href: '#/conditions/plantar-fasciitis' },
                        { name: t('cond.lowerBack'), area: t('home.areaBack'), icon: 'man', href: '#/conditions/nyeri-punggung-bawah' },
                        { name: t('cond.kneeOsteo'), area: t('home.areaKnee'), icon: 'accessibility_new', href: '#/conditions/osteoarthritis-lutut' },
                    ].map((cond, i) => `
                        <a href="${cond.href}"
                           class="condition-card group flex items-center gap-3 p-4 rounded-xl border border-outline-variant/40 bg-surface-muted hover:bg-clinical-white cursor-pointer reveal delay-${(i%4)+1}">
                            <span class="material-symbols-outlined text-primary text-[20px]" style="font-variation-settings: 'FILL' 1;">${cond.icon}</span>
                            <div class="min-w-0">
                                <div class="font-semibold text-on-background text-sm truncate">${cond.name}</div>
                                <div class="text-on-surface-variant text-xs font-label-sm">${cond.area}</div>
                            </div>
                            <span class="material-symbols-outlined text-outline text-[16px] ml-auto group-hover:text-primary group-hover:translate-x-0.5 transition-all">chevron_right</span>
                        </a>
                    `).join('')}
                </div>

                <!-- CTA -->
                <div class="text-center reveal">
                    <a href="#/conditions"
                       class="inline-flex items-center gap-2 border-2 border-primary text-primary px-8 py-3.5 rounded-xl font-semibold hover:bg-primary hover:text-on-primary transition-all text-sm">
                        <span class="material-symbols-outlined">body_system</span>
                        ${t('home.viewAllConditions')}
                    </a>
                </div>
            </div>
        </section>

        <!-- ╔══════════════════════════════════════╗
             ║  SECTION 6: PATIENT JOURNEY (FR-04)  ║
             ╚══════════════════════════════════════╝ -->
        <section class="py-24 bg-gradient-to-br from-primary via-primary to-secondary relative overflow-hidden">
            <!-- Background decorations -->
            <div class="absolute top-0 right-0 w-96 h-96 bg-clinical-white/5 rounded-full blur-3xl pointer-events-none"></div>
            <div class="absolute bottom-0 left-0 w-64 h-64 bg-clinical-white/5 rounded-full blur-3xl pointer-events-none"></div>

            <div class="max-w-container-max mx-auto px-6 md:px-10 relative z-10">
                <div class="text-center mb-14 space-y-3 reveal">
                    <span class="font-label-sm text-primary-fixed uppercase tracking-widest text-label-sm">${t('home.journeyBadge')}</span>
                    <h2 class="font-headline-lg text-headline-lg text-clinical-white">${t('home.journeyTitle')}</h2>
                    <p class="text-primary-fixed/80 font-body-md max-w-2xl mx-auto">${t('home.journeySub')}</p>
                </div>

                <!-- Steps: mobile-friendly vertical on small, horizontal flow on large -->
                <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 md:gap-4">
                    ${journeyCards}
                </div>

                <!-- CTA -->
                <div class="text-center mt-12 reveal">
                    <a href="#/booking"
                       class="inline-flex items-center gap-2 bg-clinical-white text-primary px-10 py-4 rounded-xl font-button-text text-button-text shadow-xl hover:scale-105 transition-transform">
                        <span class="material-symbols-outlined">calendar_today</span>
                        ${t('home.startJourney')}
                    </a>
                </div>
            </div>
        </section>

        <!-- ╔══════════════════════════════════════╗
             ║  SECTION 7: OUR THERAPISTS (FR-01)   ║
             ╚══════════════════════════════════════╝ -->
        <section class="py-24 bg-surface-bright">
            <div class="max-w-container-max mx-auto px-6 md:px-10">
                <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 reveal">
                    <div class="space-y-3">
                        <span class="font-label-sm text-secondary uppercase tracking-widest text-label-sm">${t('home.therapistsBadge')}</span>
                        <h2 class="font-headline-lg text-headline-lg text-on-background">${t('home.therapistsTitle')}</h2>
                        <p class="text-on-surface-variant font-body-md max-w-xl">${t('home.therapistsSub')}</p>
                    </div>
                    <a class="text-primary font-semibold flex items-center gap-2 group text-sm hover:gap-3 transition-all" href="#/team">
                        ${t('home.meetAllTherapists')}
                        <span class="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                    </a>
                </div>

                <!-- STR verification notice -->
                <div class="mb-6 flex items-center gap-2 p-3 bg-success-green/8 border border-success-green/20 rounded-xl text-xs text-on-surface-variant reveal">
                    <span class="material-symbols-outlined text-success-green text-[16px]" style="font-variation-settings: 'FILL' 1;">verified</span>
                    ${t('home.strNotice')}
                </div>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    ${therapistCards}
                </div>
            </div>
        </section>

        <!-- ╔══════════════════════════════════════╗
             ║  SECTION 8: TESTIMONIALS             ║
             ╚══════════════════════════════════════╝ -->
        <section class="py-24 bg-clinical-white">
            <div class="max-w-container-max mx-auto px-6 md:px-10">
                <div class="text-center mb-12 space-y-3 reveal">
                    <span class="font-label-sm text-secondary uppercase tracking-widest text-label-sm">${t('home.patientVoices')}</span>
                    <h2 class="font-headline-lg text-headline-lg text-on-background">${t('home.restoringQuality')}</h2>
                    <div class="w-16 h-1 bg-gradient-to-r from-primary to-secondary mx-auto rounded-full"></div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    ${testimonialCards}
                </div>

                <!-- Trust badges -->
                <div class="p-8 bg-surface-muted rounded-2xl reveal">
                    <p class="text-center font-label-sm text-outline text-label-sm uppercase tracking-widest mb-6">${t('home.recognizedBy')}</p>
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
                        ${[
                            { icon: 'health_and_safety', label: t('home.mohCertified') },
                            { icon: 'workspace_premium', label: t('home.iso') },
                            { icon: 'award_star',        label: t('home.topPhysio') },
                            { icon: 'verified_user',     label: t('home.kars') },
                        ].map(b => `
                            <div class="flex flex-col items-center gap-2 text-center">
                                <span class="material-symbols-outlined text-[36px] text-primary" style="font-variation-settings: 'FILL' 1;">${b.icon}</span>
                                <span class="font-bold text-on-surface text-sm">${b.label}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        </section>

        <!-- ╔══════════════════════════════════════╗
             ║  SECTION 9: FINAL CTA                ║
             ╚══════════════════════════════════════╝ -->
        <section class="py-24 bg-surface-container-low relative overflow-hidden">
            <div class="absolute inset-0 pointer-events-none">
                <div class="absolute top-0 left-0 w-80 h-80 bg-primary/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
                <div class="absolute bottom-0 right-0 w-80 h-80 bg-secondary/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
            </div>
            <div class="max-w-container-max mx-auto px-6 md:px-10 relative z-10 text-center reveal">
                <span class="font-label-sm text-secondary uppercase tracking-widest text-label-sm">${t('home.ctaBadge')}</span>
                <h2 class="font-headline-lg text-headline-lg text-on-background mt-3 mb-4 max-w-3xl mx-auto">${t('home.ctaTitle')}</h2>
                <p class="font-body-lg text-on-surface-variant mb-10 max-w-2xl mx-auto">${t('home.ctaDesc')}</p>

                <div class="flex flex-col sm:flex-row justify-center gap-4 mb-10">
                    <a href="#/booking"
                       class="inline-flex items-center justify-center gap-2 bg-primary text-on-primary px-10 py-5 rounded-2xl font-button-text text-button-text shadow-xl hover:bg-primary-container hover:scale-105 transition-all">
                        <span class="material-symbols-outlined">calendar_today</span>
                        ${t('home.scheduleAssessment')}
                    </a>
                    <a href="#/contact"
                       class="inline-flex items-center justify-center gap-2 border-2 border-primary text-primary bg-clinical-white px-10 py-5 rounded-2xl font-button-text text-button-text hover:bg-surface-muted transition-all">
                        <span class="material-symbols-outlined">chat</span>
                        ${t('home.contactSpecialist')}
                    </a>
                </div>

                <!-- Quick info row -->
                <div class="flex flex-wrap justify-center gap-6 text-sm text-on-surface-variant">
                    <div class="flex items-center gap-1.5">
                        <span class="material-symbols-outlined text-success-green text-[16px]" style="font-variation-settings: 'FILL' 1;">check_circle</span>
                        ${t('home.ctaFreeConsult')}
                    </div>
                    <div class="flex items-center gap-1.5">
                        <span class="material-symbols-outlined text-success-green text-[16px]" style="font-variation-settings: 'FILL' 1;">check_circle</span>
                        ${t('home.ctaNoCommitment')}
                    </div>
                    <div class="flex items-center gap-1.5">
                        <span class="material-symbols-outlined text-success-green text-[16px]" style="font-variation-settings: 'FILL' 1;">check_circle</span>
                        ${t('home.ctaHomeVisit')}
                    </div>
                </div>
            </div>
        </section>
        </main>

        ${Footer.render()}
        `;
    },

    /**
     * Called after render — set up scroll reveal & navbar effect
     */
    init() {
        NavbarGuest.initScrollEffect();
        this._initScrollReveal();
    },

    _initScrollReveal() {
        const revealEls = document.querySelectorAll('.reveal');
        if (!revealEls.length) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

        revealEls.forEach(el => observer.observe(el));
    }
};

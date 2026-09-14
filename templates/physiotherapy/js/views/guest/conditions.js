/* ============================================
   PhysioCare - Conditions Index View
   ============================================ */

const GuestConditionsView = {
    async render() {
        const conditionModel = new Condition();
        
        try {
            const groupedConditions = await conditionModel.groupedByArea();
            
            let groupsHtml = '';
            for (const [areaLabel, group] of Object.entries(groupedConditions)) {
                let itemsHtml = group.items.map(item => `
                    <a href="#/conditions/${item.slug}" class="rounded-2xl p-5 bg-surface-bright border border-outline-variant/30 hover:border-primary/50 hover:shadow-md hover:bg-primary/5 transition-all group block">
                        <h3 class="font-bold text-lg text-on-background mb-2 group-hover:text-primary transition-colors">${item.name}</h3>
                        <p class="text-on-surface-variant font-body-sm text-sm line-clamp-2 mb-4">${item.shortDescription}</p>
                        <div class="flex items-center text-primary font-bold text-sm">
                            <span class="mr-2">Pelajari</span>
                            <span class="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
                        </div>
                    </a>
                `).join('');

                groupsHtml += `
                    <div class="mb-8 break-inside-avoid bg-clinical-white p-6 md:p-8 rounded-[32px] border border-outline-variant/30 shadow-sm hover:shadow-lg transition-shadow">
                        <div class="flex items-center gap-4 mb-6 pb-5 border-b border-outline-variant/30">
                            <div class="w-14 h-14 rounded-2xl bg-primary-container text-on-primary-container flex items-center justify-center shadow-inner">
                                <span class="material-symbols-outlined text-[28px]" style="font-variation-settings: 'FILL' 1;">${group.icon}</span>
                            </div>
                            <h2 class="font-headline-sm text-xl lg:text-2xl text-on-background">${areaLabel}</h2>
                        </div>
                        <div class="flex flex-col gap-4">
                            ${itemsHtml}
                        </div>
                    </div>
                `;
            }

            return `
                ${NavbarGuest.render('conditions')}
                
                <main class="min-h-screen pt-24 pb-24 bg-surface-bright">
                    <!-- Header -->
                    <section class="py-12 mb-12 bg-gradient-to-br from-primary-fixed to-surface-container-low border-b border-outline-variant/30 relative overflow-hidden">
                        <!-- Decorative shapes -->
                        <div class="absolute right-0 top-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
                        <div class="max-w-container-max mx-auto px-6 md:px-10 relative z-10 text-center">
                            <span class="font-label-sm text-primary uppercase tracking-widest text-label-sm mb-3 block">${t('condIndex.badge')}</span>
                            <h1 class="font-headline-lg text-headline-lg lg:text-[42px] text-on-background mb-4">${t('condIndex.title')}</h1>
                            <p class="text-on-surface-variant max-w-2xl mx-auto font-body-lg">
                                ${t('condIndex.desc')}
                            </p>
                        </div>
                    </section>

                    <!-- Content -->
                    <section class="max-w-container-max mx-auto px-6 md:px-10">
                        <div class="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8 pb-12">
                            ${groupsHtml}
                        </div>
                    </section>
                </main>

                ${Footer.render()}
            `;
        } catch (error) {
            console.error('Error rendering conditions view:', error);
            return `
                ${NavbarGuest.render('conditions')}
                <main class="min-h-screen pt-24 pb-16 flex items-center justify-center bg-surface-bright">
                    <div class="text-center text-error bg-error-container/20 p-8 rounded-3xl">
                        <span class="material-symbols-outlined text-[48px] mb-4">error</span>
                        <p class="font-bold">Gagal memuat data kondisi medis.</p>
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

            sr.reveal('.max-w-container-max.text-center > *', { origin: 'bottom', interval: 100 });
            sr.reveal('section.max-w-container-max > div > div', { origin: 'bottom', interval: 100, delay: 100 });
        }
    }
};

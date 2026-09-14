/* ============================================
   PhysioCare - Guest Service Detail View
   ============================================ */

const GuestServiceDetailView = {
    /**
     * Render the service detail page
     * @param {object} params - route params { slug }
     */
    async render(params) {
        const service = await ServiceModel.bySlug(params.slug);
        if (!service) {
            return `
            ${NavbarGuest.render('services')}
<div class="min-h-[60vh] flex flex-col items-center justify-center px-6 text-center">
                <span class="material-symbols-outlined text-[80px] text-primary mb-6">search_off</span>
                <h1 class="font-headline-lg text-headline-lg text-primary mb-4">${t('detail.notFound')}</h1>
                <p class="text-on-surface-variant mb-8">${t('detail.notFoundDesc')}</p>
                <a href="#/services" class="bg-primary text-on-primary px-8 py-4 rounded-xl font-button-text hover:bg-primary-container transition-all">${t('detail.viewAllServices')}</a>
            </div>
            ${Footer.render()}`;
        }

        const price = Service.formatPrice(service.price);

        const features = (service.features || []).map(f => `
            <li class="flex items-center gap-3">
                <span class="w-8 h-8 rounded-full bg-success-green/10 flex items-center justify-center">
                    <span class="material-symbols-outlined text-success-green text-[18px]" style="font-variation-settings: 'FILL' 1;">check</span>
                </span>
                <span class="text-on-surface-variant font-body-md">${f}</span>
            </li>
        `).join('');

        return `
        ${NavbarGuest.render('services')}
        <main class="min-h-screen bg-background">
            <!-- Premium Hero -->
            <section class="relative pt-32 pb-24 px-6 bg-surface-container-lowest overflow-hidden">
                <!-- Abstract Background Elements -->
                <div class="absolute inset-0 w-full h-full pointer-events-none">
                    <div class="absolute top-0 left-[-10%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[100px] mix-blend-multiply animate-pulse" style="animation-duration: 10s;"></div>
                    <div class="absolute bottom-0 right-[-10%] w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[120px] mix-blend-multiply animate-pulse" style="animation-duration: 8s; animation-delay: 1s;"></div>
                </div>
                
                <div class="max-w-container-max mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div>
<a href="#/services" class="inline-flex items-center gap-2 text-secondary font-bold mb-8 hover:text-primary transition-colors group">
                            <span class="material-symbols-outlined group-hover:-translate-x-1 transition-transform">arrow_back</span> ${t('detail.backToServices')}
                        </a>
                        <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary font-bold text-sm mb-6 backdrop-blur-sm">
                            <span class="material-symbols-outlined text-[18px]" style="font-variation-settings: 'FILL' 1;">${service.icon}</span>
                            ${service.duration}
                        </div>
                        <h1 class="font-headline-lg text-5xl lg:text-6xl mb-6 font-extrabold tracking-tight text-on-surface">${service.name}</h1>
                        <p class="font-body-lg text-xl text-on-surface-variant mb-10 leading-relaxed">${service.description}</p>
                        
                        <div class="flex flex-col sm:flex-row items-start sm:items-center gap-8 bg-white/50 backdrop-blur-md p-6 rounded-3xl border border-outline-variant/30 shadow-sm inline-flex">
                            <div>
<p class="text-[11px] font-bold uppercase tracking-wider text-outline-variant mb-1">${t('services.startingFrom')}</p>
                                <p class="text-4xl text-primary font-extrabold">${price}</p>
                            </div>
                            <div class="hidden sm:block w-px h-12 bg-outline-variant/30"></div>
                            <a href="#/booking" class="bg-primary text-white px-8 py-4 rounded-2xl font-bold shadow-[0_10px_30px_rgba(14,116,144,0.2)] hover:shadow-[0_15px_40px_rgba(14,116,144,0.3)] hover:scale-105 hover:-translate-y-1 transition-all flex items-center justify-center gap-2 group/btn">
                                ${t('detail.bookThisService')}
                                <span class="material-symbols-outlined group-hover/btn:translate-x-1 transition-transform">arrow_forward</span>
                            </a>
                        </div>
                    </div>
                    <div class="relative rounded-[2rem] overflow-hidden shadow-2xl border-[10px] border-white h-[500px] transform hover:scale-[1.02] transition-transform duration-500">
                        <div class="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent z-10 pointer-events-none"></div>
                        <img class="w-full h-full object-cover relative z-0" data-alt="${service.name}" src="${service.image}" alt="${service.name}">
                    </div>
                </div>
            </section>
            <!-- Features & Details -->
            <section class="py-20 px-6 max-w-container-max mx-auto">
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    <div class="lg:col-span-2">
<h2 class="font-headline-md text-headline-md mb-8">${t('detail.whatsIncluded')}</h2>
                        <ul class="space-y-4">
                            ${features}
                        </ul>
                        <div class="mt-12 p-6 bg-surface-muted rounded-2xl border border-outline-variant/30 flex gap-4">
                            <span class="material-symbols-outlined text-primary text-[40px]">medical_information</span>
                            <div>
                                <h3 class="font-headline-md text-headline-md mb-2">${t('detail.indications')}</h3>
<p class="text-on-surface-variant font-body-md">
                                    ${t('detail.indicationsDesc', { condition: service.name.toLowerCase() })}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div>
                        <div class="bg-clinical-white rounded-xl border border-outline-variant/20 p-8 shadow-sm sticky top-24">
                            <h3 class="font-headline-md text-headline-md mb-6 flex items-center gap-2">
                                <span class="material-symbols-outlined text-primary">info</span>
                                ${t('detail.quickInfo')}
                            </h3>
                            <div class="space-y-4">
                                <div class="flex justify-between">
                                    <span class="text-on-surface-variant">${t('detail.duration')}</span>
                                    <span class="font-bold">${service.duration}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-on-surface-variant">${t('detail.priceFrom')}</span>
                                    <span class="font-bold text-primary">${price}</span>
                                </div>
                                <div class="flex justify-between">
<span class="text-on-surface-variant">${t('detail.therapists')}</span>
                                    <span class="font-bold">${t('detail.strVerified')}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-on-surface-variant">${t('detail.warranty')}</span>
                                    <span class="font-bold text-success-green">${t('detail.freeReschedule')}</span>
                                </div>
                            </div>
                            <a href="#/booking" class="w-full mt-8 py-3 bg-primary text-on-primary rounded-xl font-button-text text-center hover:bg-primary-container transition-all block">
                                ${t('detail.bookNow')}
                            </a>
                            <a href="#/contact" class="w-full mt-3 py-3 border-2 border-primary text-primary rounded-xl font-button-text text-center hover:bg-primary/5 transition-all block">
                                ${t('detail.askQuestion')}
                            </a>
                        </div>
                    </div>
                </div>
            </section>
        </main>
        ${Footer.render()}
        `;
    },

    init() {
        // Initialize ScrollReveal if available
        if (typeof ScrollReveal !== 'undefined') {
            const sr = ScrollReveal({
                distance: '30px',
                duration: 800,
                easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
                viewFactor: 0.1,
                reset: false
            });

            sr.reveal('.max-w-container-max > div > div:first-child', { origin: 'left', interval: 100 });
            sr.reveal('.max-w-container-max > div > div:last-child', { origin: 'right', interval: 100 });
            sr.reveal('.grid > div.lg\\:col-span-2 > *', { origin: 'bottom', interval: 50 });
            sr.reveal('.sticky', { origin: 'bottom', delay: 200 });
        }
    }
};

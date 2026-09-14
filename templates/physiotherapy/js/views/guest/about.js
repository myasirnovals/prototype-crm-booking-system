/* ============================================
   PhysioCare - Guest About Us View (FR-01)
   Sections:
     1. Hero
     2. Clinic Profile & Story
     3. Locations & Map
   ============================================ */

const GuestAboutView = {
    async render() {
        return `
            ${NavbarGuest.render('about')}
            <main>
            <!-- Hero Section -->
            <section class="relative pt-32 pb-20 bg-surface-container overflow-hidden">
                <div class="absolute inset-0 bg-primary/5 opacity-50 z-0"></div>
                <div class="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 z-0"></div>
                
                <div class="max-w-7xl mx-auto px-5 lg:px-12 relative z-10 text-center">
                    <span class="inline-block px-3 py-1 bg-primary/10 text-primary font-bold text-sm rounded-full mb-4 reveal">
                        ${t('about.badge')}
                    </span>
                    <h1 class="font-headline-lg text-headline-lg text-on-surface mb-6 reveal reveal-delay-100">
                        ${t('about.title')}
                    </h1>
                    <p class="text-on-surface-variant text-lg max-w-2xl mx-auto mb-8 reveal reveal-delay-200">
                        ${t('about.subtitle')}
                    </p>
                </div>
            </section>

            <!-- Clinic Profile & Story Section -->
            <section class="py-20 bg-clinical-white">
                <div class="max-w-7xl mx-auto px-5 lg:px-12">
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div class="order-2 lg:order-1 reveal">
                            <h2 class="font-headline-md text-headline-md text-on-background mb-6">${t('about.story.title')}</h2>
                            <p class="text-on-surface-variant mb-6 leading-relaxed">
                                ${t('about.story.p1')}
                            </p>
                            <p class="text-on-surface-variant mb-8 leading-relaxed">
                                ${t('about.story.p2')}
                            </p>
                            
                            <div class="grid grid-cols-2 gap-6">
                                <div class="p-6 bg-surface-container rounded-2xl border border-outline-variant/30 text-center">
                                    <div class="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mx-auto mb-4">
                                        <span class="material-symbols-outlined text-[24px]" style="font-variation-settings: 'FILL' 1;">verified_user</span>
                                    </div>
                                    <h3 class="font-bold text-on-surface mb-2">${t('about.values.v1.title')}</h3>
                                    <p class="text-sm text-on-surface-variant">${t('about.values.v1.desc')}</p>
                                </div>
                                <div class="p-6 bg-surface-container rounded-2xl border border-outline-variant/30 text-center">
                                    <div class="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mx-auto mb-4">
                                        <span class="material-symbols-outlined text-[24px]" style="font-variation-settings: 'FILL' 1;">science</span>
                                    </div>
                                    <h3 class="font-bold text-on-surface mb-2">${t('about.values.v2.title')}</h3>
                                    <p class="text-sm text-on-surface-variant">${t('about.values.v2.desc')}</p>
                                </div>
                            </div>
                        </div>
                        <div class="order-1 lg:order-2 relative reveal reveal-delay-200">
                            <!-- Image Grid -->
                            <div class="grid grid-cols-2 gap-4">
                                <img src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=800" alt="Clinic Facility" class="rounded-2xl w-full h-[300px] object-cover shadow-clinical">
                                <div class="grid grid-rows-2 gap-4">
                                    <img src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=400" alt="Therapy Session" class="rounded-2xl w-full h-[142px] object-cover shadow-clinical">
                                    <div class="bg-primary rounded-2xl flex flex-col items-center justify-center text-on-primary shadow-clinical">
                                        <span class="font-headline-md text-3xl mb-1">10+</span>
                                        <span class="text-sm opacity-90">${t('about.stats.experience')}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Locations & Map Section -->
            <section class="py-20 bg-surface-container">
                <div class="max-w-7xl mx-auto px-5 lg:px-12">
                    <div class="text-center mb-16 reveal">
                        <span class="text-primary font-bold text-sm tracking-wider uppercase mb-2 block">${t('about.location.badge')}</span>
                        <h2 class="font-headline-md text-headline-md text-on-background mb-4">${t('about.location.title')}</h2>
                        <p class="text-on-surface-variant text-lg max-w-2xl mx-auto">${t('about.location.subtitle')}</p>
                    </div>

                    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div class="lg:col-span-1 space-y-4 reveal reveal-delay-100">
                            <!-- Branch Cards -->
                            <div class="bg-clinical-white p-6 rounded-2xl shadow-clinical border border-primary/20 cursor-pointer transition-all hover:-translate-y-1">
                                <div class="flex items-start justify-between mb-2">
                                    <h3 class="font-bold text-lg text-primary">Klinik Utama (Pusat)</h3>
                                    <span class="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full font-semibold">HQ</span>
                                </div>
                                <p class="text-on-surface-variant text-sm mb-4">Jl. Kesehatan No. 123, Jakarta Selatan, 12190</p>
                                <div class="flex items-center gap-2 text-sm text-on-surface-variant mb-2">
                                    <span class="material-symbols-outlined text-[16px] text-primary">schedule</span>
                                    <span>Senin - Sabtu: 08:00 - 20:00</span>
                                </div>
                                <div class="flex items-center gap-2 text-sm text-on-surface-variant">
                                    <span class="material-symbols-outlined text-[16px] text-primary">call</span>
                                    <span>+62 811 2345 6789</span>
                                </div>
                            </div>
                            
                            <div class="bg-clinical-white p-6 rounded-2xl shadow-sm border border-outline-variant/30 cursor-pointer transition-all hover:shadow-clinical hover:border-primary/20 hover:-translate-y-1 opacity-70 hover:opacity-100">
                                <h3 class="font-bold text-lg text-on-surface mb-2">Cabang Kelapa Gading</h3>
                                <p class="text-on-surface-variant text-sm mb-4">Boulevard Raya Blok M No. 45, Jakarta Utara</p>
                                <div class="flex items-center gap-2 text-sm text-on-surface-variant">
                                    <span class="material-symbols-outlined text-[16px]">call</span>
                                    <span>+62 811 3456 7890</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="lg:col-span-2 reveal reveal-delay-200">
                            <!-- Interactive Map Placeholder -->
                            <div class="w-full h-[400px] lg:h-full min-h-[400px] bg-outline-variant/20 rounded-2xl overflow-hidden shadow-clinical relative">
                                <iframe 
                                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d126917.18526543884!2d106.74415814041725!3d-6.241586524968155!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69f3e945e34b9d%3A0x100c5e82dd4b820!2sJakarta%20Selatan%2C%20Kota%20Jakarta%20Selatan%2C%20Daerah%20Khusus%20Ibukota%20Jakarta!5e0!3m2!1sid!2sid!4v1700000000000!5m2!1sid!2sid" 
                                    width="100%" 
                                    height="100%" 
                                    style="border:0;" 
                                    allowfullscreen="" 
                                    loading="lazy" 
                                    referrerpolicy="no-referrer-when-downgrade"
                                    class="absolute inset-0 grayscale contrast-125 opacity-90 hover:grayscale-0 transition-all duration-700"
                                ></iframe>
                            </div>
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

window.GuestAboutView = GuestAboutView;

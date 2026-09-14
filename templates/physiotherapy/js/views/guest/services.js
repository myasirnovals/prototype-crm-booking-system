/* ============================================
   PhysioCare - Guest Services View
   ============================================ */

const GuestServicesView = {
    /**
     * Render the services catalog page
     */
    async render() {
        const services = await ServiceModel.all();

        // Smart grid layout assignment
        const cards = services.map((s, index) => {
            let cols = 4;
            let type = 'compact';
            
            // Pattern: 
            // Row 1 (idx 0,1): 8, 4
            // Row 2 (idx 2,3,4): 4, 4, 4
            // Row 3 (idx 5,6): 4, 8
            // Row 4 (idx 7,8,9): 4, 4, 4
            const cycle = index % 5;
            
            if (cycle === 0) { cols = 8; type = 'bento'; }
            else if (cycle === 1) { cols = 4; type = 'compact'; }
            else if (cycle === 2) { cols = 4; type = 'compact'; }
            else if (cycle === 3) { cols = 4; type = 'compact'; }
            else if (cycle === 4) { cols = 4; type = 'compact'; }
            
            // If it's the last row and it's unbalanced, we adjust the col spans
            const isLastRow = index >= services.length - (services.length % 5 === 0 ? 5 : services.length % 5);
            if (isLastRow) {
                const remainingInRow = services.length - index;
                const itemsInThisRow = services.length % 5;
                
                if (itemsInThisRow === 1) {
                    cols = 12; // 1 item takes full width
                    type = 'bento';
                } else if (itemsInThisRow === 2) {
                    cols = 6; // 2 items take half width each
                    type = 'compact';
                } else if (itemsInThisRow === 4) {
                    // 4 items is impossible with % 5 logic here since pattern splits into 2 and 3
                    // Actually cycle 0,1 is 2 items. cycle 2,3,4 is 3 items.
                    // Let's refine the remaining logic.
                }
            }

            // More robust remaining logic based on the 2, 3 pattern:
            const rowIdx = Math.floor(index / 5) * 2 + (cycle < 2 ? 0 : 1); 
            // To simplify, let's just forcefully check how many items are in the current visual row
            // visually: indices [0,1], [2,3,4], [5,6], [7,8,9]
            let visualRowSize = 0;
            if (cycle < 2) visualRowSize = Math.min(2, services.length - (index - cycle));
            else visualRowSize = Math.min(3, services.length - (index - (cycle - 2)));
            
            if (visualRowSize === 1) { cols = 12; type = 'bento'; }
            if (visualRowSize === 2 && cycle >= 2) { cols = 6; type = 'compact'; }

            return `<div class="col-span-1 md:col-span-${cols}">${ServiceCard.render(s, type)}</div>`;
        }).join('');

        return `
        ${NavbarGuest.render('services')}
        <main class="min-h-screen">
            <!-- Hero Section -->
            <section class="relative pt-32 pb-20 px-6 bg-surface-container-lowest overflow-hidden">
                <!-- Premium Abstract Background Elements -->
                <div class="absolute inset-0 w-full h-full pointer-events-none">
                    <div class="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[100px] mix-blend-multiply animate-pulse" style="animation-duration: 8s;"></div>
                    <div class="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-secondary/15 rounded-full blur-[120px] mix-blend-multiply animate-pulse" style="animation-duration: 12s; animation-delay: 2s;"></div>
                </div>
                
                <div class="max-w-container-max mx-auto text-center relative z-10 flex flex-col items-center">
<div class="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-primary/5 border border-primary/20 text-primary font-bold text-sm mb-8 backdrop-blur-sm shadow-sm">
                        <span class="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                        ${t('services.badge')}
                    </div>
                    <h1 class="font-headline-lg text-5xl md:text-7xl mb-6 font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-on-surface via-primary to-secondary leading-tight pb-2">
                        ${t('services.title1')}<br/>${t('services.title2')}
                    </h1>
                    <p class="font-body-lg text-xl text-on-surface-variant max-w-2xl mx-auto leading-relaxed">
                        ${t('services.sub')}
                    </p>
                </div>
            </section>
            
            <!-- Services Catalog (Bento Grid Style) -->
            <section class="pb-32 px-6 max-w-container-max mx-auto relative z-20">
                <div class="grid grid-cols-1 md:grid-cols-12 gap-8">
                    ${cards}
                </div>
            </section>
            <!-- Premium CTA Section -->
            <section class="relative py-24 px-6 overflow-hidden">
                <div class="absolute inset-0 bg-gradient-to-br from-primary via-primary to-secondary z-0"></div>
                
                <!-- Glassmorphism Container -->
                <div class="max-w-container-max mx-auto relative z-10 bg-white/10 backdrop-blur-xl border border-white/20 p-12 md:p-20 rounded-[40px] shadow-2xl flex flex-col md:flex-row items-center justify-between gap-12 overflow-hidden">
                    <!-- Decorative element -->
                    <div class="absolute -top-24 -right-24 w-64 h-64 bg-white/20 rounded-full blur-3xl pointer-events-none"></div>
                    
<div class="max-w-2xl relative z-10">
                        <h2 class="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">${t('services.ctaTitle')}</h2>
                        <p class="text-xl text-white/80 leading-relaxed">${t('services.ctaDesc')}</p>
                    </div>
                    <div class="flex flex-col sm:flex-row gap-4 w-full md:w-auto relative z-10">
                        <a href="#/booking" class="bg-white text-primary px-10 py-5 rounded-2xl font-bold text-lg shadow-[0_10px_30px_rgba(0,0,0,0.15)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.25)] hover:scale-105 transition-all text-center flex items-center justify-center gap-2 group">
                            ${t('services.bookAppointment')}
                            <span class="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                        </a>
                        <a href="#/contact" class="bg-transparent border-2 border-white/50 text-white px-10 py-5 rounded-2xl font-bold text-lg hover:bg-white/10 transition-all text-center">
                            ${t('services.contactClinic')}
                        </a>
                    </div>
                </div>
            </section>
            <!-- Insurance Partners -->
            <section class="py-12 border-b border-outline-variant bg-clinical-white">
                <div class="max-w-container-max mx-auto px-6 text-center">
<p class="font-label-sm text-label-sm text-outline mb-8">${t('services.insurance')}</p>
                    <div class="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all">
                        <div class="flex items-center gap-2">
                            <span class="material-symbols-outlined text-3xl">verified_user</span>
                            <span class="font-headline-md font-bold text-lg">HealthFirst</span>
                        </div>
                        <div class="flex items-center gap-2">
                            <span class="material-symbols-outlined text-3xl">shield</span>
                            <span class="font-headline-md font-bold text-lg">BlueCross</span>
                        </div>
                        <div class="flex items-center gap-2">
                            <span class="material-symbols-outlined text-3xl">health_metrics</span>
                            <span class="font-headline-md font-bold text-lg">AetnaCare</span>
                        </div>
                        <div class="flex items-center gap-2">
                            <span class="material-symbols-outlined text-3xl">medical_information</span>
                            <span class="font-headline-md font-bold text-lg">GlobalHealth</span>
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

            sr.reveal('.max-w-container-max > h1, .max-w-container-max > p', { origin: 'bottom', interval: 100 });
            sr.reveal('.grid > div', { origin: 'bottom', interval: 50 });
            sr.reveal('.max-w-2xl, .flex-col.sm\\:flex-row', { origin: 'bottom', interval: 100 });
            sr.reveal('.opacity-50.grayscale', { origin: 'bottom', interval: 100 });
        }
    }
};

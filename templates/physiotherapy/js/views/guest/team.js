/* ============================================
   PhysioCare - Guest Team View
   ============================================ */

const GuestTeamView = {
    /**
     * Render the team page
     */
    async render() {
        const therapists = await TherapistModel.all();

        return `
        ${NavbarGuest.render('team')}
        <main class="min-h-screen bg-background">
            <!-- Premium Hero -->
            <section class="relative pt-32 pb-20 px-6 bg-surface-container-lowest overflow-hidden">
                <!-- Abstract Background Elements -->
                <div class="absolute inset-0 w-full h-full pointer-events-none">
                    <div class="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[100px] mix-blend-multiply animate-pulse" style="animation-duration: 9s;"></div>
                    <div class="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[120px] mix-blend-multiply animate-pulse" style="animation-duration: 11s; animation-delay: 1.5s;"></div>
                </div>
                
                <div class="max-w-container-max mx-auto text-center relative z-10 flex flex-col items-center">
                    <div class="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-secondary/10 border border-secondary/20 text-secondary font-bold text-sm mb-8 backdrop-blur-sm shadow-sm">
<span class="material-symbols-outlined text-[16px]">verified</span>
                        ${t('team.badge')}
                    </div>
                    <h1 class="font-headline-lg text-5xl md:text-7xl mb-6 font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-on-surface via-primary to-secondary leading-tight pb-2">
                        ${t('team.title')}
                    </h1>
                    <p class="font-body-lg text-xl text-on-surface-variant max-w-2xl mx-auto leading-relaxed">
                        ${t('team.sub')}
                    </p>
                </div>
            </section>
            <!-- Team Grid -->
            <section class="py-20 px-6 max-w-container-max mx-auto">
                <div class="flex flex-wrap justify-center gap-8">
                    ${therapists.map(t => `
                        <div class="w-full sm:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.4rem)] max-w-md">
                            ${TherapistCard.render(t, 'public')}
                        </div>
                    `).join('')}
                </div>
            </section>
            <!-- Premium Features / Trust Section -->
            <section class="relative py-32 px-6 overflow-hidden">
                <div class="absolute inset-0 bg-gradient-to-br from-primary via-primary to-secondary z-0"></div>
                <div class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay pointer-events-none z-0"></div>
                
                <div class="max-w-container-max mx-auto relative z-10">
<div class="text-center mb-16">
                        <h2 class="text-4xl md:text-5xl font-bold text-white mb-6">${t('team.trustTitle')}</h2>
                        <p class="text-xl text-white/80 max-w-2xl mx-auto">${t('team.trustSub')}</p>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <!-- Feature 1 -->
                        <div class="bg-white/10 backdrop-blur-xl border border-white/20 p-10 rounded-[2rem] text-center hover:bg-white/15 hover:-translate-y-2 transition-all duration-300">
                            <div class="w-20 h-20 mx-auto bg-white/20 rounded-2xl flex items-center justify-center mb-8 shadow-inner rotate-3">
                                <span class="material-symbols-outlined text-5xl text-white">verified</span>
                            </div>
<h3 class="text-2xl font-bold text-white mb-4">${t('team.strCertified')}</h3>
                            <p class="text-white/80 leading-relaxed">${t('team.strCertifiedDesc')}</p>
                        </div>
                        
                        <!-- Feature 2 -->
                        <div class="bg-white/10 backdrop-blur-xl border border-white/20 p-10 rounded-[2rem] text-center hover:bg-white/15 hover:-translate-y-2 transition-all duration-300">
                            <div class="w-20 h-20 mx-auto bg-white/20 rounded-2xl flex items-center justify-center mb-8 shadow-inner -rotate-3">
                                <span class="material-symbols-outlined text-5xl text-white">monitoring</span>
                            </div>
<h3 class="text-2xl font-bold text-white mb-4">${t('team.dataDriven')}</h3>
                            <p class="text-white/80 leading-relaxed">${t('team.dataDrivenDesc')}</p>
                        </div>
                        
                        <!-- Feature 3 -->
                        <div class="bg-white/10 backdrop-blur-xl border border-white/20 p-10 rounded-[2rem] text-center hover:bg-white/15 hover:-translate-y-2 transition-all duration-300">
                            <div class="w-20 h-20 mx-auto bg-white/20 rounded-2xl flex items-center justify-center mb-8 shadow-inner rotate-3">
                                <span class="material-symbols-outlined text-5xl text-white">favorite</span>
                            </div>
<h3 class="text-2xl font-bold text-white mb-4">${t('team.compassionate')}</h3>
                            <p class="text-white/80 leading-relaxed">${t('team.compassionateDesc')}</p>
                        </div>
                    </div>
                    
                    <div class="mt-16 text-center">
                        <a href="#/booking" class="inline-flex items-center justify-center gap-3 bg-white text-primary px-10 py-5 rounded-2xl font-bold text-lg shadow-[0_10px_30px_rgba(0,0,0,0.15)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.25)] hover:scale-105 transition-all group">
                            ${t('team.bookConsultation')}
                            <span class="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                        </a>
                    </div>
                </div>
            </section>
        </main>
        ${Footer.render()}
        `;
    },

    init() {
        if (typeof NavbarGuest !== 'undefined' && typeof NavbarGuest.initScrollEffect === 'function') {
            NavbarGuest.initScrollEffect();
        }

        // Initialize ScrollReveal if available
        if (typeof ScrollReveal !== 'undefined') {
            const sr = ScrollReveal({
                distance: '30px',
                duration: 800,
                easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
                mobile: true
            });

            sr.reveal('.max-w-container-max.text-center > *', { origin: 'bottom', interval: 100 });
            sr.reveal('.max-w-container-max .flex-wrap > div', { origin: 'bottom', interval: 100, delay: 150 });
            sr.reveal('.grid-cols-1 > div', { origin: 'bottom', interval: 100, delay: 200 });
        }
    }
};

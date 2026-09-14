/* ============================================
   PhysioCare - Shared Footer Component
   ============================================ */

const Footer = {
    render() {
        return `
        <footer class="bg-on-background text-inverse-on-surface w-full">
            <!-- Top section -->
            <div class="max-w-container-max mx-auto px-6 md:px-10 pt-16 pb-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
                <!-- Brand column -->
                <div class="space-y-5 lg:col-span-1">
                    <div class="flex items-center gap-2">
                        <div class="w-8 h-8 bg-primary-container rounded-lg flex items-center justify-center">
                            <span class="material-symbols-outlined text-on-primary text-[18px]" style="font-variation-settings: 'FILL' 1;">medical_services</span>
                        </div>
                        <span class="font-headline-md font-extrabold text-clinical-white text-lg tracking-tight">PhysioCare</span>
                    </div>
                    <p class="text-inverse-on-surface/70 font-body-md text-sm leading-relaxed">
                        ${t('footer.about')}
                    </p>
                    <!-- Social links -->
                    <div class="flex gap-3">
                        <a class="w-9 h-9 rounded-full bg-clinical-white/10 flex items-center justify-center text-inverse-on-surface/80 hover:bg-primary hover:text-on-primary transition-all" href="#" aria-label="Instagram">
                            <span class="material-symbols-outlined text-[18px]">photo_camera</span>
                        </a>
                        <a class="w-9 h-9 rounded-full bg-clinical-white/10 flex items-center justify-center text-inverse-on-surface/80 hover:bg-primary hover:text-on-primary transition-all" href="#" aria-label="Facebook">
                            <span class="material-symbols-outlined text-[18px]">public</span>
                        </a>
                        <a class="w-9 h-9 rounded-full bg-clinical-white/10 flex items-center justify-center text-inverse-on-surface/80 hover:bg-primary hover:text-on-primary transition-all" href="#" aria-label="Email">
                            <span class="material-symbols-outlined text-[18px]">mail</span>
                        </a>
                    </div>
                </div>

                <!-- Quick Links -->
                <div class="space-y-5">
                    <div class="font-bold text-clinical-white uppercase tracking-wider text-xs font-label-sm">${t('footer.quickLinks')}</div>
                    <nav class="flex flex-col gap-3">
                        <a class="text-inverse-on-surface/70 text-sm hover:text-secondary-fixed-dim transition-colors flex items-center gap-2" href="#/">
                            <span class="material-symbols-outlined text-[14px]">home</span>${t('nav.home')}
                        </a>
                        <a class="text-inverse-on-surface/70 text-sm hover:text-secondary-fixed-dim transition-colors flex items-center gap-2" href="#/services">
                            <span class="material-symbols-outlined text-[14px]">medical_services</span>${t('nav.services')}
                        </a>
                        <a class="text-inverse-on-surface/70 text-sm hover:text-secondary-fixed-dim transition-colors flex items-center gap-2" href="#/conditions">
                            <span class="material-symbols-outlined text-[14px]">body_system</span>${t('nav.conditions')}
                        </a>
                        <a class="text-inverse-on-surface/70 text-sm hover:text-secondary-fixed-dim transition-colors flex items-center gap-2" href="#/team">
                            <span class="material-symbols-outlined text-[14px]">group</span>${t('nav.team')}
                        </a>
                        <a class="text-inverse-on-surface/70 text-sm hover:text-secondary-fixed-dim transition-colors flex items-center gap-2" href="#/articles">
                            <span class="material-symbols-outlined text-[14px]">article</span>${t('nav.articles')}
                        </a>
                    </nav>
                </div>

                <!-- Services -->
                <div class="space-y-5">
                    <div class="font-bold text-clinical-white uppercase tracking-wider text-xs font-label-sm">${t('footer.ourServices')}</div>
                    <nav class="flex flex-col gap-3">
                        <a class="text-inverse-on-surface/70 text-sm hover:text-secondary-fixed-dim transition-colors" href="#/services/standard-physiotherapy">${t('footer.standardPhysio')}</a>
                        <a class="text-inverse-on-surface/70 text-sm hover:text-secondary-fixed-dim transition-colors" href="#/services/sports-rehabilitation">${t('footer.sportsRehab')}</a>
                        <a class="text-inverse-on-surface/70 text-sm hover:text-secondary-fixed-dim transition-colors" href="#/services/stroke-rehabilitation">${t('footer.strokeRehab')}</a>
                        <a class="text-inverse-on-surface/70 text-sm hover:text-secondary-fixed-dim transition-colors" href="#/services/geriatric-wellness">${t('footer.geriatric')}</a>
                        <a class="text-inverse-on-surface/70 text-sm hover:text-secondary-fixed-dim transition-colors" href="#/services/pediatric-therapy">${t('footer.pediatric')}</a>
                    </nav>
                </div>

                <!-- Contact -->
                <div class="space-y-5">
                    <div class="font-bold text-clinical-white uppercase tracking-wider text-xs font-label-sm">${t('footer.ourClinic')}</div>
                    <div class="space-y-4">
                        <div class="flex gap-3 items-start">
                            <span class="material-symbols-outlined text-primary-fixed-dim text-[18px] mt-0.5 flex-shrink-0">location_on</span>
                            <div class="text-inverse-on-surface/70 text-sm leading-relaxed">${t('footer.address')}</div>
                        </div>
                        <div class="flex gap-3 items-start">
                            <span class="material-symbols-outlined text-primary-fixed-dim text-[18px] mt-0.5 flex-shrink-0">schedule</span>
                            <div class="text-inverse-on-surface/70 text-sm">
                                ${t('footer.monSat')}<br>${t('footer.sunday')}
                            </div>
                        </div>
                        <div class="flex gap-3 items-start">
                            <span class="material-symbols-outlined text-primary-fixed-dim text-[18px] mt-0.5 flex-shrink-0">phone</span>
                            <div class="text-inverse-on-surface/70 text-sm">+62 21 5000 1234</div>
                        </div>
                        <a href="#/booking"
                           class="inline-flex items-center gap-2 mt-2 bg-primary text-on-primary px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary-container transition-all">
                            <span class="material-symbols-outlined text-[16px]">calendar_today</span>
                            ${t('footer.bookAppointment')}
                        </a>
                    </div>
                </div>
            </div>

            <!-- Bottom bar -->
            <div class="border-t border-clinical-white/10">
                <div class="max-w-container-max mx-auto px-6 md:px-10 py-5 flex flex-col md:flex-row items-center justify-between gap-3 text-inverse-on-surface/50 text-xs">
                    <span>${t('footer.rights')}</span>
                    <div class="flex gap-5">
                        <a href="#" class="hover:text-inverse-on-surface/80 transition-colors">${t('footer.privacy')}</a>
                        <a href="#" class="hover:text-inverse-on-surface/80 transition-colors">${t('footer.terms')}</a>
                    </div>
                </div>
            </div>
        </footer>`;
    }
};

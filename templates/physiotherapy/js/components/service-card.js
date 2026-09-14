/* ============================================
   PhysioCare - Service Card Component
   ============================================ */

const ServiceCard = {
    /**
     * Render a service card
     * @param {object} service - service data
     * @param {string} variant - 'bento' (large, with image) or 'compact'
     */
    render(service, variant = 'compact') {
        const price = Service.formatPrice(service.price);
        if (variant === 'bento') {
            return this.renderBento(service, price);
        }
        return this.renderCompact(service, price);
    },

    renderBento(service, price) {
        return `
        <div class="group relative overflow-hidden rounded-3xl bg-clinical-white border border-outline-variant/50 hover:border-primary/30 shadow-sm hover:shadow-[0_20px_40px_-15px_rgba(14,116,144,0.15)] transition-all duration-500 flex flex-col h-full transform hover:-translate-y-2 z-10 hover:z-20">
            <!-- Decorative gradient glow on hover -->
            <div class="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
            
            <div class="w-full h-64 overflow-hidden relative">
                <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10 opacity-60 group-hover:opacity-80 transition-opacity"></div>
                <img class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" data-alt="${service.name}" src="${service.image}" alt="${service.name}">
                
                <div class="absolute bottom-4 left-6 z-20 flex items-center gap-3">
                    <div class="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-lg">
                        <span class="material-symbols-outlined text-white text-2xl" style="font-variation-settings: 'FILL' 1;">${service.icon}</span>
                    </div>
                    <div class="text-white">
<p class="text-xs font-bold uppercase tracking-wider opacity-80">${t('services.startingFrom')}</p>
                        <p class="font-bold text-lg">${price}</p>
                    </div>
                </div>
            </div>
            
            <div class="p-8 flex flex-col flex-grow relative z-20 bg-clinical-white">
                <h3 class="font-headline-md text-2xl font-bold mb-3 text-on-surface group-hover:text-primary transition-colors">${service.name}</h3>
                <p class="font-body-md text-on-surface-variant mb-8 line-clamp-3 leading-relaxed">${service.shortDescription}</p>
                
                <div class="flex items-center justify-between mt-auto pt-6 border-t border-outline-variant/30">
                    <div class="flex items-center gap-2 text-outline-variant bg-surface-muted px-3 py-1.5 rounded-full">
                        <span class="material-symbols-outlined text-sm">schedule</span>
                        <span class="text-xs font-bold uppercase tracking-wide text-on-surface-variant">${service.duration}</span>
                    </div>
                    <a href="#/services/${service.id}" class="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
                        <span class="material-symbols-outlined">arrow_forward</span>
                    </a>
                </div>
            </div>
        </div>`;
    },

    renderCompact(service, price) {
        return `
        <div class="group relative rounded-3xl bg-clinical-white border border-outline-variant/50 hover:border-primary/30 p-8 flex flex-col h-full shadow-sm hover:shadow-[0_20px_40px_-15px_rgba(14,116,144,0.15)] transition-all duration-500 transform hover:-translate-y-2 z-10 hover:z-20 overflow-hidden">
            <!-- Decorative gradient glow on hover -->
            <div class="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
            
            <div class="relative z-10 flex flex-col h-full">
                <div class="flex justify-between items-start mb-8">
                    <div class="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300 shadow-inner">
                        <span class="material-symbols-outlined text-3xl" style="font-variation-settings: 'FILL' 1;">${service.icon}</span>
                    </div>
<div class="text-right bg-surface-muted px-4 py-2 rounded-xl">
                        <p class="text-[10px] font-bold uppercase tracking-wider text-outline">${t('services.startingFrom')}</p>
                        <p class="text-primary font-bold text-lg">${price}</p>
                    </div>
                </div>
                <h3 class="font-headline-md text-2xl font-bold mb-3 text-on-surface group-hover:text-primary transition-colors">${service.name}</h3>
                <p class="font-body-md text-on-surface-variant mb-8 line-clamp-3 leading-relaxed flex-grow">${service.shortDescription}</p>
                
                <div class="mt-auto">
                    <div class="flex items-center gap-2 text-outline-variant mb-6 bg-surface-muted inline-flex px-3 py-1.5 rounded-full">
                        <span class="material-symbols-outlined text-sm">schedule</span>
                        <span class="text-xs font-bold uppercase tracking-wide text-on-surface-variant">${service.duration}</span>
                    </div>
                    <a href="#/services/${service.id}" class="w-full py-4 bg-transparent border-2 border-primary text-primary rounded-xl font-bold hover:bg-primary hover:text-white transition-all text-center block shadow-sm hover:shadow-md flex items-center justify-center gap-2 group/btn">
${t('services.exploreTreatment')}
                        <span class="material-symbols-outlined text-sm group-hover/btn:translate-x-1 transition-transform">arrow_forward</span>
                    </a>
                </div>
            </div>
        </div>`;
    }
};

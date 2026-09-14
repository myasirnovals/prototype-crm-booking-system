/* ============================================
   PhysioCare - Therapist Card Component
   ============================================ */

const TherapistCard = {
    /**
     * Render a therapist card
     * @param {object} therapist - therapist data
     * @param {string} variant - 'public' or 'admin'
     */
    render(therapist, variant = 'public') {
        if (variant === 'admin') {
            const statusBadge = this.adminStatusBadge(therapist.status);
            return this.renderAdminCard(therapist, statusBadge);
        }
        return this.renderPublicCard(therapist);
    },

    adminStatusBadge(status) {
const map = {
            'available': `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-green/10 text-success-green border border-success-green/20">${t('therapist.available')}</span>`,
            'in-session': `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-warning-amber/10 text-warning-amber border border-warning-amber/20">${t('therapist.inSession')}</span>`,
            'off-duty': `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-outline/10 text-on-surface-variant border border-outline/20">${t('therapist.offDuty')}</span>`
        };
        return map[status] || '';
    },

    adminStatusDot(status) {
const map = {
            'available': { color: 'bg-success-green', label: t('therapist.available'), icon: 'check', iconColor: 'text-clinical-white' },
            'in-session': { color: 'bg-secondary', label: t('therapist.inSessionLeft'), icon: 'timer', iconColor: 'text-clinical-white' },
            'off-duty': { color: 'bg-outline', label: t('therapist.offDuty'), icon: 'close', iconColor: 'text-clinical-white' }
        };
        const s = map[status] || map['off-duty'];
        return `
            <span class="flex items-center gap-1.5 text-${status === 'available' ? 'success-green' : status === 'in-session' ? 'secondary' : 'outline'} font-semibold">
                <span class="w-2 h-2 rounded-full ${s.color} ${status === 'available' ? 'animate-pulse' : ''}"></span>
                ${s.label}
            </span>`;
    },

    renderPublicCard(therapist) {
        const ratingStars = Array.from({ length: 5 }, (_, i) =>
            `<span class="material-symbols-outlined text-sm ${i < Math.round(therapist.rating) ? 'text-warning-amber' : 'text-outline-variant'}" style="font-variation-settings: 'FILL' 1;">star</span>`
        ).join('');

        return `
        <div class="group relative bg-clinical-white rounded-[2rem] p-8 shadow-sm border border-outline-variant/40 hover:border-primary/30 hover:shadow-[0_20px_40px_-15px_rgba(14,116,144,0.15)] transition-all duration-500 transform hover:-translate-y-2 flex flex-col h-full overflow-hidden">
            <!-- Decorative gradient glow on hover -->
            <div class="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none z-0"></div>
            
            <div class="relative z-10 flex flex-col h-full">
                <div class="flex items-start gap-5 mb-6">
                    <div class="relative flex-shrink-0">
                        <div class="absolute inset-0 bg-primary/20 rounded-[1.5rem] transform rotate-3 group-hover:rotate-6 transition-transform duration-500"></div>
                        <img class="w-24 h-24 rounded-[1.5rem] object-cover ring-4 ring-white relative z-10 shadow-sm" data-alt="${therapist.name}" src="${therapist.image}" alt="${therapist.name}">
                        <div class="absolute -bottom-2 -right-2 w-8 h-8 ${therapist.status === 'available' ? 'bg-success-green' : 'bg-outline'} border-4 border-white rounded-full flex items-center justify-center z-20 shadow-sm">
                            <span class="material-symbols-outlined text-[14px] text-white" style="font-variation-settings: 'FILL' 1;">${therapist.status === 'available' ? 'check' : 'schedule'}</span>
                        </div>
                    </div>
                    <div class="flex-grow pt-2">
                        <h3 class="font-headline-md text-2xl font-bold text-on-surface mb-1 group-hover:text-primary transition-colors">${therapist.name}</h3>
                        <div class="flex items-center gap-2 mb-2 flex-wrap">
${therapist.strVerified ? `<span class="bg-secondary/10 text-secondary text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider border border-secondary/20">${t('therapist.strVerified')}</span>` : ''}
                        </div>
                        <span class="text-sm font-medium text-on-surface-variant block">${therapist.title}</span>
                    </div>
                </div>
                
                <div class="mb-8 flex-grow">
                    <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-muted text-on-surface-variant text-sm font-medium mb-4">
                        <span class="material-symbols-outlined text-[16px] text-primary">psychology</span> 
                        ${therapist.specialization}
                    </div>
<p class="text-on-surface-variant text-sm leading-relaxed">${therapist.experience} ${t('therapist.yearsExperience')}</p>
                </div>
                
                <div class="mt-auto pt-6 border-t border-outline-variant/30 flex items-center justify-between">
                    <div class="flex flex-col">
                        <div class="flex items-center gap-0.5 mb-1">
                            ${ratingStars}
                        </div>
                        <span class="text-xs font-bold text-on-surface-variant">${therapist.rating} (${therapist.reviews} ${t('therapist.reviews')})</span>
                    </div>
                    <a href="#/booking" class="w-12 h-12 flex items-center justify-center rounded-2xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white hover:scale-105 transition-all duration-300">
                        <span class="material-symbols-outlined">calendar_month</span>
                    </a>
                </div>
            </div>
        </div>`;
    },

    renderAdminCard(therapist, statusBadge) {
        const scheduleItems = (therapist.schedule || []).map(s => `
            <div class="flex justify-between items-center ${s.patient.includes('Current') ? 'text-primary' : ''}">
                <span class="text-sm font-medium${s.patient.includes('Current') ? ' font-bold' : ''}">${s.patient}</span>
                <span class="text-sm bg-clinical-white px-2 py-1 rounded ${s.patient.includes('Current') ? 'text-primary bg-primary/10' : ''}">${s.time}</span>
            </div>
        `).join('');

        const isOffDuty = therapist.status === 'off-duty';

        return `
        <div class="bg-clinical-white rounded-3xl p-6 shadow-clinical border border-outline-variant/20 hover:border-primary/30 transition-all flex flex-col ${isOffDuty ? 'grayscale-[0.5] opacity-80' : ''}">
            <div class="flex justify-between items-start mb-6">
                <div class="flex gap-4">
                    <div class="relative">
                        <img class="w-20 h-20 rounded-2xl object-cover ring-4 ring-surface-muted" data-alt="${therapist.name}" src="${therapist.image}" alt="${therapist.name}">
                        <div class="absolute -bottom-1 -right-1 w-6 h-6 bg-success-green border-2 border-clinical-white rounded-full flex items-center justify-center">
                            <span class="material-symbols-outlined text-[14px] text-clinical-white" style="font-variation-settings: 'FILL' 1;">check</span>
                        </div>
                    </div>
                    <div>
                        <h3 class="font-headline-md text-[20px] text-on-surface mb-1">${therapist.name}</h3>
                        <div class="flex items-center gap-2 mb-2">
${therapist.strVerified ? `<span class="bg-secondary/10 text-secondary text-[11px] font-bold px-2 py-0.5 rounded-full border border-secondary/20">${t('therapist.strVerified').toUpperCase()}</span>` : ''}
                            <span class="text-label-sm font-label-sm text-on-surface-variant">${therapist.title}</span>
                        </div>
                        <p class="text-on-surface-variant text-sm flex items-center gap-1">
                            <span class="material-symbols-outlined text-sm">psychology</span>
                            ${therapist.specialization}
                        </p>
                    </div>
                </div>
<button class="text-outline hover:text-primary transition-colors" aria-label="${t('therapist.moreOptions')}">
                    <span class="material-symbols-outlined">more_vert</span>
                </button>
            </div>
            <div class="space-y-4 mb-6">
<div class="flex items-center justify-between">
                    <span class="text-label-sm font-label-sm text-on-surface-variant">${t('therapist.currentStatus')}</span>
                    ${this.adminStatusDot(therapist.status)}
                </div>
                ${isOffDuty ? `
                <div class="p-4 bg-surface-muted rounded-2xl border border-outline-variant/30 italic">
                    <p class="text-label-sm font-bold text-on-surface-variant uppercase mb-3 flex items-center gap-2">
                        <span class="material-symbols-outlined text-sm">event</span>
                        ${t('therapist.nextAvailability')}
                    </p>
                    <p class="text-sm text-on-surface-variant">${therapist.nextAvailability || t('therapist.notAvailableToday')}</p>
                </div>
                ` : `
                <div class="p-4 bg-surface-muted rounded-2xl border border-outline-variant/30">
                    <p class="text-label-sm font-bold text-on-surface-variant uppercase mb-3 flex items-center gap-2">
                        <span class="material-symbols-outlined text-sm">schedule</span>
                        ${t('therapist.upcomingAppointments')}
                    </p>
                    <div class="space-y-3">
                        ${scheduleItems || `<p class="text-sm text-on-surface-variant">${t('therapist.noUpcoming')}</p>`}
                    </div>
                </div>
                `}
            </div>
            <div class="mt-auto grid grid-cols-2 gap-3">
                <button class="bg-surface-muted text-on-surface-variant hover:bg-surface-container-high px-4 py-3 rounded-xl font-button-text text-button-text transition-colors flex items-center justify-center gap-2">
                    <span class="material-symbols-outlined text-lg">calendar_today</span>
                    ${t('therapist.schedule')}
                </button>
                <button class="bg-primary text-on-primary hover:opacity-90 px-4 py-3 rounded-xl font-button-text text-button-text transition-all flex items-center justify-center gap-2">
                    <span class="material-symbols-outlined text-lg">edit</span>
                    ${t('therapist.editProfile')}
                </button>
            </div>
        </div>`;
    }
};

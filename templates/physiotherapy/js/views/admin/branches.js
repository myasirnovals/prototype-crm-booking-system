/* ============================================
   PhysioCare - Admin Branch Management View
   ============================================ */

const AdminBranchesView = {
    /**
     * Render the branch management page
     */
    async render() {
        const branches = [
            { id: 1, name: 'PhysioCare Sudirman', city: 'Jakarta', address: 'SCBD Level 12', phone: '+62 21 5550-1234', therapists: 12, status: 'active', icon: 'location_city' },
            { id: 2, name: 'PhysioCare Kelapa Gading', city: 'Jakarta Utara', address: 'Mall Kelapa Gading 3 Lt.2', phone: '+62 21 5550-5678', therapists: 8, status: 'active', icon: 'storefront' },
            { id: 3, name: 'PhysioCare BSD', city: 'Tangerang Selatan', address: 'BSD Green Office Park', phone: '+62 21 5550-9012', therapists: 6, status: 'active', icon: 'apartment' }
        ];

        const branchCards = branches.map(b => `
            <div class="bg-clinical-white rounded-3xl p-6 shadow-clinical border border-outline-variant/20 hover:border-primary/30 transition-all flex flex-col">
                <div class="flex justify-between items-start mb-6">
                    <div class="flex gap-4">
                        <div class="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                            <span class="material-symbols-outlined text-[36px]">${b.icon}</span>
                        </div>
                        <div>
                            <h3 class="font-headline-md text-[20px] text-on-surface mb-1">${b.name}</h3>
                            <p class="text-on-surface-variant text-sm">${b.city}</p>
                        </div>
                    </div>
                    <span class="bg-success-green/10 text-success-green text-[11px] font-bold px-2 py-0.5 rounded-full border border-success-green/20">${t('abranch.active')}</span>
                </div>
                <div class="space-y-3 mb-6">
                    <div class="flex gap-3">
                        <span class="material-symbols-outlined text-primary text-sm">location_on</span>
                        <p class="text-sm text-on-surface-variant">${b.address}</p>
                    </div>
                    <div class="flex gap-3">
                        <span class="material-symbols-outlined text-primary text-sm">call</span>
                        <p class="text-sm text-on-surface-variant">${b.phone}</p>
                    </div>
                    <div class="flex gap-3">
                        <span class="material-symbols-outlined text-primary text-sm">groups</span>
                        <p class="text-sm text-on-surface-variant">${t('abranch.therapists', { count: b.therapists })}</p>
                    </div>
                </div>
                <div class="mt-auto grid grid-cols-2 gap-3">
                    <button class="bg-surface-muted text-on-surface-variant hover:bg-surface-container-high px-4 py-3 rounded-xl font-button-text text-button-text transition-colors flex items-center justify-center gap-2">
                        <span class="material-symbols-outlined text-lg">settings</span>
                        ${t('abranch.manage')}
                    </button>
                    <button class="bg-primary text-on-primary hover:opacity-90 px-4 py-3 rounded-xl font-button-text text-button-text transition-all flex items-center justify-center gap-2">
                        <span class="material-symbols-outlined text-lg">edit</span>
                        ${t('abranch.edit')}
                    </button>
                </div>
            </div>
        `).join('');

return `
        <div class="font-body-md text-body-md bg-background text-on-surface">
        ${SidebarAdmin.render('branches')}
        <main class="ml-64 min-h-screen">
            <header class="sticky top-0 z-40 h-16 px-8 bg-clinical-white border-b border-outline-variant flex justify-between items-center shadow-sm">
                <div class="flex items-center gap-8">
                    <span class="font-headline-md text-headline-md font-extrabold text-primary">PhysioAdmin</span>
                    <div class="hidden md:flex gap-6">
                        <a class="text-on-surface-variant hover:text-primary font-medium" href="#">${t('adash.analytics')}</a>
                        <a class="text-on-surface-variant hover:text-primary font-medium" href="#">${t('adash.reporting')}</a>
                    </div>
                </div>
                <div class="flex items-center gap-4">
                    <div class="relative">
                        <span class="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline">search</span>
                        <input class="pl-10 pr-4 py-2 bg-surface-muted border-none rounded-full text-body-md focus:ring-2 focus:ring-secondary w-64" placeholder="${t('abranch.searchPlaceholder')}" type="text">
                    </div>
                    <button class="p-2 text-on-surface-variant hover:bg-surface-container-high rounded-full relative">
                        <span class="material-symbols-outlined">notifications</span>
                        <span class="absolute top-2 right-2 w-2 h-2 bg-emergency-red rounded-full"></span>
                    </button>
                    <div class="h-8 w-px bg-outline-variant mx-2"></div>
                    <button class="material-symbols-outlined text-on-surface-variant p-2 hover:bg-surface-container-high rounded-full">account_circle</button>
                </div>
            </header>
            <div class="p-8 max-w-[1400px] mx-auto">
                <div class="flex justify-between items-end mb-8">
                    <div>
                        <h2 class="font-headline-lg text-headline-lg text-on-surface mb-2">${t('abranch.title')}</h2>
                        <p class="text-on-surface-variant max-w-2xl">${t('abranch.sub')}</p>
                    </div>
                    <button class="flex items-center gap-2 bg-primary text-on-primary px-6 py-3 rounded-xl font-button-text text-button-text shadow-clinical hover:translate-y-[-2px] transition-all">
                        <span class="material-symbols-outlined">add_business</span>
                        ${t('abranch.addNew')}
                    </button>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    ${branchCards}
                </div>
            </div>
</main>
        </div>
        `;
    },

    init() {}
};

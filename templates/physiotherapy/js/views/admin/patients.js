/* ============================================
   PhysioCare - Admin Patient Records View
   ============================================ */

const AdminPatientsView = {
    /**
     * Render the patient records management page
     */
    async render() {
        const users = await UserModel.all();
        const patients = users.filter(u => u.role === 'patient');

        const patientRows = patients.map(p => `
            <tr class="hover:bg-surface-container-low transition-colors group">
                <td class="px-8 py-4 flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full bg-surface-container overflow-hidden flex items-center justify-center text-primary">
                        <span class="material-symbols-outlined">person</span>
                    </div>
                    <div>
                        <p class="font-bold text-on-surface">${p.name}</p>
                        <p class="text-sm text-on-surface-variant">${p.patientId}</p>
                    </div>
                </td>
                <td class="px-6 py-4 text-on-surface">${p.activeTreatment || t('apat.none')}</td>
                <td class="px-6 py-4">${p.lastVisit || '-'}</td>
                <td class="px-6 py-4">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-green/10 text-success-green border border-success-green/20">${t('apat.active')}</span>
                </td>
                <td class="px-8 py-4">
                    <button class="text-primary font-bold flex items-center gap-1 hover:underline">
                        ${t('apat.detail')} <span class="material-symbols-outlined text-sm">chevron_right</span>
                    </button>
                </td>
            </tr>
        `).join('');

return `
        <div class="font-body-md text-body-md bg-background text-on-surface">
        ${SidebarAdmin.render('patients')}
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
                        <input class="pl-10 pr-4 py-2 bg-surface-muted border-none rounded-full text-body-md focus:ring-2 focus:ring-secondary w-64" placeholder="${t('apat.searchPlaceholder')}" type="text">
                    </div>
                    <button class="p-2 text-on-surface-variant hover:bg-surface-container-high rounded-full relative">
                        <span class="material-symbols-outlined">notifications</span>
                        <span class="absolute top-2 right-2 w-2 h-2 bg-emergency-red rounded-full"></span>
                    </button>
                    <div class="h-8 w-px bg-outline-variant mx-2"></div>
                    <button class="material-symbols-outlined text-on-surface-variant p-2 hover:bg-surface-container-high rounded-full">account_circle</button>
                </div>
            </header>
            <div class="p-8 max-w-[1440px] mx-auto">
                <div class="flex justify-between items-end mb-8">
                    <div>
                        <h2 class="font-headline-lg text-headline-lg text-on-surface mb-2">${t('apat.title')}</h2>
                        <p class="text-on-surface-variant max-w-2xl">${t('apat.sub')}</p>
                    </div>
                    <button class="flex items-center gap-2 bg-primary text-on-primary px-6 py-3 rounded-xl font-button-text text-button-text shadow-clinical hover:translate-y-[-2px] transition-all">
                        <span class="material-symbols-outlined">person_add</span>
                        ${t('apat.register')}
                    </button>
                </div>
                <!-- Stats -->
                <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div class="bg-clinical-white p-6 rounded-2xl shadow-clinical border border-outline-variant/30 flex items-center gap-4">
                        <div class="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            <span class="material-symbols-outlined">groups</span>
                        </div>
                        <div>
                            <p class="text-label-sm font-label-sm uppercase tracking-wider text-on-surface-variant">${t('apat.totalPatients')}</p>
                            <p class="text-headline-md font-headline-md font-bold">${patients.length}</p>
                        </div>
                    </div>
                    <div class="bg-clinical-white p-6 rounded-2xl shadow-clinical border border-outline-variant/30 flex items-center gap-4">
                        <div class="w-12 h-12 rounded-full bg-success-green/10 flex items-center justify-center text-success-green">
                            <span class="material-symbols-outlined">person_add</span>
                        </div>
                        <div>
                            <p class="text-label-sm font-label-sm uppercase tracking-wider text-on-surface-variant">${t('apat.newThisMonth')}</p>
                            <p class="text-headline-md font-headline-md font-bold">156</p>
                        </div>
                    </div>
                    <div class="bg-clinical-white p-6 rounded-2xl shadow-clinical border border-outline-variant/30 flex items-center gap-4">
                        <div class="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
                            <span class="material-symbols-outlined">verified_user</span>
                        </div>
                        <div>
                            <p class="text-label-sm font-label-sm uppercase tracking-wider text-on-surface-variant">${t('apat.completeDocs')}</p>
                            <p class="text-headline-md font-headline-md font-bold">82%</p>
                        </div>
                    </div>
                    <div class="bg-clinical-white p-6 rounded-2xl shadow-clinical border border-outline-variant/30 flex items-center gap-4">
                        <div class="w-12 h-12 rounded-full bg-warning-amber/10 flex items-center justify-center text-warning-amber">
                            <span class="material-symbols-outlined">upload_file</span>
                        </div>
                        <div>
                            <p class="text-label-sm font-label-sm uppercase tracking-wider text-on-surface-variant">${t('apat.pendingVerif')}</p>
                            <p class="text-headline-md font-headline-md font-bold">24</p>
                        </div>
                    </div>
                </div>
                <!-- Patients Table -->
                <div class="bg-clinical-white rounded-xl shadow-sm border border-outline-variant/30 overflow-hidden">
                    <div class="p-6 border-b border-outline-variant/30 flex justify-between items-center">
                        <div>
                            <h2 class="font-headline-md text-headline-md font-bold text-on-surface">${t('apat.patientList')}</h2>
                            <p class="text-on-surface-variant text-body-md">${t('apat.patientListSub')}</p>
                        </div>
                        <div class="flex gap-2">
                            <button class="bg-surface-muted px-4 py-2 rounded-lg text-sm font-medium hover:bg-surface-variant transition-colors">${t('apat.filter')}</button>
                            <button class="bg-surface-muted px-4 py-2 rounded-lg text-sm font-medium hover:bg-surface-variant transition-colors">${t('apat.exportCsv')}</button>
                        </div>
                    </div>
                    <div class="overflow-x-auto">
                        <table class="w-full text-left border-collapse">
                            <thead>
                                <tr class="bg-surface-muted text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider">
                                    <th class="px-8 py-4">${t('apat.patient')}</th>
                                    <th class="px-6 py-4">${t('apat.activeTreatment')}</th>
                                    <th class="px-6 py-4">${t('apat.lastVisit')}</th>
                                    <th class="px-6 py-4">${t('apat.status')}</th>
                                    <th class="px-8 py-4">${t('apat.action')}</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-outline-variant/30">
                                ${patientRows}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
</main>
        </div>
        `;
    },

    init() {}
};

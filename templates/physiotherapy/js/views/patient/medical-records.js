/* ============================================
   PhysioCare - Patient Medical Records View
   ============================================ */

const PatientMedicalRecordsView = {
    /**
     * Render the medical records page
     */
    async render() {
        const user = User.getCurrentUser();
        const records = await PatientRecordModel.forPatient(user ? user.patientId : 'PC-8842');

        const recordCards = records.map(r => `
            <div class="bg-clinical-white rounded-xl border border-outline-variant/20 shadow-sm p-6">
                <div class="flex items-center justify-between mb-4">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary">
                            <span class="material-symbols-outlined">description</span>
                        </div>
                        <div>
                            <h4 class="font-bold">${r.title}</h4>
                            <p class="text-xs text-on-surface-variant">${r.date}</p>
                        </div>
                    </div>
                    <span class="bg-surface-variant text-primary text-[11px] px-2 py-0.5 rounded-full font-bold">${r.type}</span>
                </div>
                <p class="text-sm text-on-surface-variant mb-4">${r.summary}</p>
                <div class="flex gap-2">
                    <button class="flex-1 py-2 border border-primary text-primary rounded-lg text-sm font-bold hover:bg-surface-muted transition-colors">
                        ${t('records.viewDocument')}
                    </button>
                    <button class="flex-1 py-2 border border-outline-variant text-on-surface-variant rounded-lg text-sm font-medium hover:bg-surface-muted transition-colors">
                        ${t('records.downloadPdf')}
                    </button>
                </div>
            </div>
        `).join('');

        return `
        ${NavbarPatient.render('records', user ? user.name.split(' ')[0] : 'James')}
        <main class="max-w-container-max mx-auto px-gutter py-stack-lg">
            <!-- Page Header -->
            <header class="mb-10">
                <h1 class="font-headline-lg text-headline-lg mb-2">${t('records.title')}</h1>
                <p class="text-on-surface-variant font-body-lg">${t('records.sub')}</p>
            </header>
            <!-- Stats -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                <div class="bg-clinical-white p-6 rounded-xl border border-outline-variant/20 shadow-sm flex items-center gap-4">
                    <div class="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <span class="material-symbols-outlined">description</span>
                    </div>
                    <div>
                        <p class="font-headline-md text-headline-md font-bold">${records.length}</p>
                        <p class="text-sm text-on-surface-variant">${t('records.totalDocs')}</p>
                    </div>
                </div>
                <div class="bg-clinical-white p-6 rounded-xl border border-outline-variant/20 shadow-sm flex items-center gap-4">
                    <div class="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
                        <span class="material-symbols-outlined">history</span>
                    </div>
                    <div>
                        <p class="font-headline-md text-headline-md font-bold">${records.filter(r => r.type === 'Terapi').length}</p>
                        <p class="text-sm text-on-surface-variant">${t('records.therapyHistory')}</p>
                    </div>
                </div>
                <div class="bg-clinical-white p-6 rounded-xl border border-outline-variant/20 shadow-sm flex items-center gap-4">
                    <div class="w-12 h-12 rounded-full bg-success-green/10 flex items-center justify-center text-success-green">
                        <span class="material-symbols-outlined">upload_file</span>
                    </div>
                    <div>
                        <p class="font-headline-md text-headline-md font-bold">2</p>
                        <p class="text-sm text-on-surface-variant">${t('records.uploadedDocs')}</p>
                    </div>
                </div>
            </div>
            <!-- Records Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                ${recordCards}
            </div>
        </main>
        ${Footer.render()}
        `;
    },

    init() {
        NavbarPatient.init();
    }
};

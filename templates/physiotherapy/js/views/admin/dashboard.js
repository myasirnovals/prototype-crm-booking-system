/* ============================================
   PhysioCare - Admin Dashboard View
   ============================================ */

const AdminDashboardView = {
    /**
     * Render the admin dashboard page
     */
    async render() {
return `
        <div class="font-body-md text-body-md overflow-hidden bg-background text-on-surface">
        ${SidebarAdmin.render('dashboard')}
        <!-- Main Content Area -->
        <main class="ml-64 flex-1 h-screen overflow-y-auto custom-scrollbar bg-background">
            <!-- TopAppBar Component -->
            <header class="flex justify-between items-center h-16 px-8 bg-clinical-white dark:bg-surface-container-lowest border-b border-outline-variant sticky top-0 z-40 shadow-sm">
                <div class="flex items-center gap-6">
                    <div class="relative">
                        <span class="absolute inset-y-0 left-3 flex items-center text-outline">
                            <span class="material-symbols-outlined">search</span>
                        </span>
                        <input class="pl-10 pr-4 py-2 bg-surface-muted border-none rounded-full w-80 text-body-md focus:ring-2 focus:ring-primary/20 transition-all" placeholder="${t('adash.searchPlaceholder')}" type="text">
                    </div>
                    <nav class="hidden md:flex gap-6">
                        <a class="text-primary dark:text-primary-fixed-dim border-b-2 border-primary font-bold px-1 py-4 transition-all" href="#">${t('adash.analytics')}</a>
                        <a class="text-on-surface-variant dark:text-surface-variant hover:text-primary px-1 py-4 transition-all" href="#">${t('adash.reporting')}</a>
                    </nav>
                </div>
                <div class="flex items-center gap-4">
                    <div class="flex items-center gap-2 mr-4 border-r border-outline-variant pr-4">
                        <button class="p-2 text-on-surface-variant hover:bg-surface-container rounded-full transition-colors">
                            <span class="material-symbols-outlined">notifications</span>
                        </button>
                        <button class="p-2 text-on-surface-variant hover:bg-surface-container rounded-full transition-colors">
                            <span class="material-symbols-outlined">history</span>
                        </button>
                    </div>
                    <button class="flex items-center gap-2 bg-primary-container text-on-primary-container px-4 py-2 rounded-lg font-button-text text-button-text hover:opacity-90 active:opacity-80 transition-all">
                        <span class="material-symbols-outlined">download</span>
                        ${t('adash.quickExport')}
                    </button>
                    <div class="w-10 h-10 rounded-full bg-surface-container-highest overflow-hidden flex items-center justify-center text-primary">
                        <span class="material-symbols-outlined text-[28px]">account_circle</span>
                    </div>
                </div>
            </header>
            <section class="p-8 space-y-8 max-w-[1440px] mx-auto">
                <!-- Hero Stats / Bento Grid -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div class="bg-clinical-white p-6 rounded-xl shadow-[0_4px_20px_-5px_rgba(14,116,144,0.05)] border border-outline-variant/30 flex flex-col justify-between">
                        <div class="flex justify-between items-start mb-4">
                            <div class="p-2 bg-primary/10 rounded-lg text-primary">
                                <span class="material-symbols-outlined">payments</span>
                            </div>
                            <span class="text-success-green font-label-sm text-label-sm flex items-center gap-1">
                                <span class="material-symbols-outlined !text-sm">trending_up</span> 12.5%
                            </span>
                        </div>
                        <div>
                            <p class="text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider">${t('adash.totalRevenue')}</p>
                            <h3 class="font-headline-lg text-headline-lg font-bold text-primary mt-1">Rp 48.250.000</h3>
                        </div>
                        <div class="mt-4 h-1 w-full bg-surface-muted rounded-full overflow-hidden">
                            <div class="h-full bg-primary w-[75%] rounded-full"></div>
                        </div>
                    </div>
                    <div class="bg-clinical-white p-6 rounded-xl shadow-[0_4px_20px_-5px_rgba(14,116,144,0.05)] border border-outline-variant/30 flex flex-col justify-between">
                        <div class="flex justify-between items-start mb-4">
                            <div class="p-2 bg-secondary/10 rounded-lg text-secondary">
                                <span class="material-symbols-outlined">calendar_month</span>
                            </div>
                            <span class="text-warning-amber font-label-sm text-label-sm flex items-center gap-1">
                                <span class="material-symbols-outlined">remove</span> 0.0%
                            </span>
                        </div>
                        <div>
                            <p class="text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider">${t('adash.appointments')}</p>
                            <h3 class="font-headline-lg text-headline-lg font-bold text-secondary mt-1">1,284</h3>
                        </div>
                        <div class="mt-4 flex items-center gap-2">
                            <span class="w-2 h-2 rounded-full bg-success-green"></span>
                            <p class="text-on-surface-variant text-[12px]">84 ${t('adash.newToday')}</p>
                        </div>
                    </div>
                    <div class="bg-clinical-white p-6 rounded-xl shadow-[0_4px_20px_-5px_rgba(14,116,144,0.05)] border border-outline-variant/30 flex flex-col justify-between">
                        <div class="flex justify-between items-start mb-4">
                            <div class="p-2 bg-success-green/10 rounded-lg text-success-green">
                                <span class="material-symbols-outlined">person_add</span>
                            </div>
                            <span class="text-success-green font-label-sm text-label-sm flex items-center gap-1">
                                <span class="material-symbols-outlined !text-sm">trending_up</span> 8.2%
                            </span>
                        </div>
                        <div>
                            <p class="text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider">${t('adash.newPatients')}</p>
                            <h3 class="font-headline-lg text-headline-lg font-bold text-on-surface mt-1">156</h3>
                        </div>
                        <div class="mt-4 flex -space-x-2">
                            <div class="w-6 h-6 rounded-full border-2 border-clinical-white bg-surface-container-highest"></div>
                            <div class="w-6 h-6 rounded-full border-2 border-clinical-white bg-primary-fixed"></div>
                            <div class="w-6 h-6 rounded-full border-2 border-clinical-white bg-secondary-fixed"></div>
                            <div class="w-6 h-6 rounded-full border-2 border-clinical-white bg-surface-variant flex items-center justify-center text-[10px] font-bold">+12</div>
                        </div>
                    </div>
                    <div class="bg-clinical-white p-6 rounded-xl shadow-[0_4px_20px_-5px_rgba(14,116,144,0.05)] border border-outline-variant/30 flex flex-col justify-between">
                        <div class="flex justify-between items-start mb-4">
                            <div class="p-2 bg-tertiary/10 rounded-lg text-tertiary">
                                <span class="material-symbols-outlined">rebase_edit</span>
                            </div>
                            <span class="text-success-green font-label-sm text-label-sm flex items-center gap-1">
                                <span class="material-symbols-outlined !text-sm">trending_up</span> 3.1%
                            </span>
                        </div>
                        <div>
                            <p class="text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider">${t('adash.retentionRate')}</p>
                            <h3 class="font-headline-lg text-headline-lg font-bold text-tertiary mt-1">94.2%</h3>
                        </div>
                        <div class="mt-4 h-8 w-full flex items-end gap-1">
                            <div class="bg-tertiary/20 w-full h-[40%] rounded-t-sm"></div>
                            <div class="bg-tertiary/20 w-full h-[60%] rounded-t-sm"></div>
                            <div class="bg-tertiary/20 w-full h-[55%] rounded-t-sm"></div>
                            <div class="bg-tertiary/20 w-full h-[80%] rounded-t-sm"></div>
                            <div class="bg-tertiary/20 w-full h-[70%] rounded-t-sm"></div>
                            <div class="bg-tertiary w-full h-[95%] rounded-t-sm"></div>
                        </div>
                    </div>
                </div>
                <!-- Main Analytics Area -->
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div class="lg:col-span-2 bg-clinical-white p-8 rounded-xl shadow-sm border border-outline-variant/30">
                        <div class="flex justify-between items-center mb-8">
                            <div>
                                <h2 class="font-headline-md text-headline-md font-bold text-on-surface">${t('adash.revenueGrowth')}</h2>
                                <p class="text-on-surface-variant text-body-md">${t('adash.revenueSub')}</p>
                            </div>
                            <select class="bg-surface-muted border-none rounded-lg text-label-sm font-label-sm focus:ring-primary">
                                <option>${t('adash.last6Months')}</option>
                                <option>${t('adash.ytd')}</option>
                            </select>
                        </div>
                        <div class="relative h-[300px] w-full flex items-end justify-between gap-4 px-2">
                            <div class="absolute inset-0 flex flex-col justify-between pointer-events-none">
                                <div class="border-b border-outline-variant/20 w-full h-0"></div>
                                <div class="border-b border-outline-variant/20 w-full h-0"></div>
                                <div class="border-b border-outline-variant/20 w-full h-0"></div>
                                <div class="border-b border-outline-variant/20 w-full h-0"></div>
                                <div class="border-b border-outline-variant/20 w-full h-0"></div>
                            </div>
                            <div class="relative flex-1 flex flex-col items-center gap-2 group">
                                <div class="w-12 bg-primary/20 rounded-t-lg chart-bar h-[40%] group-hover:bg-primary/40 transition-colors"></div>
                                <span class="text-label-sm font-label-sm text-on-surface-variant">Jan</span>
                            </div>
                            <div class="relative flex-1 flex flex-col items-center gap-2 group">
                                <div class="w-12 bg-primary/20 rounded-t-lg chart-bar h-[60%] group-hover:bg-primary/40 transition-colors"></div>
                                <span class="text-label-sm font-label-sm text-on-surface-variant">Feb</span>
                            </div>
                            <div class="relative flex-1 flex flex-col items-center gap-2 group">
                                <div class="w-12 bg-primary/20 rounded-t-lg chart-bar h-[55%] group-hover:bg-primary/40 transition-colors"></div>
                                <span class="text-label-sm font-label-sm text-on-surface-variant">Mar</span>
                            </div>
                            <div class="relative flex-1 flex flex-col items-center gap-2 group">
                                <div class="w-12 bg-primary rounded-t-lg chart-bar h-[85%]"></div>
                                <span class="text-label-sm font-label-sm text-on-surface-variant">Apr</span>
                            </div>
                            <div class="relative flex-1 flex flex-col items-center gap-2 group">
                                <div class="w-12 bg-primary/20 rounded-t-lg chart-bar h-[70%] group-hover:bg-primary/40 transition-colors"></div>
                                <span class="text-label-sm font-label-sm text-on-surface-variant">May</span>
                            </div>
                            <div class="relative flex-1 flex flex-col items-center gap-2 group">
                                <div class="w-12 bg-primary/20 rounded-t-lg chart-bar h-[90%] group-hover:bg-primary/40 transition-colors"></div>
                                <span class="text-label-sm font-label-sm text-on-surface-variant">Jun</span>
                            </div>
                        </div>
                    </div>
                    <div class="bg-clinical-white p-8 rounded-xl shadow-sm border border-outline-variant/30 flex flex-col">
                        <div class="flex justify-between items-center mb-6">
                            <h2 class="font-headline-md text-headline-md font-bold text-on-surface">${t('adash.todaySchedule')}</h2>
                            <span class="text-primary font-bold">24 Oct</span>
                        </div>
                        <div class="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar">
                            <div class="flex gap-4 p-4 rounded-xl bg-surface-container-low border-l-4 border-primary">
                                <div class="text-center min-w-[50px]">
                                    <p class="font-bold text-primary">09:00</p>
                                    <p class="text-[12px] text-on-surface-variant">AM</p>
                                </div>
                                <div>
                                    <h4 class="font-bold text-on-surface">Sarah Johnson</h4>
                                    <p class="text-body-md text-on-surface-variant text-sm">${t('adash.postOp')} • Dr. Aris</p>
                                </div>
                            </div>
                            <div class="flex gap-4 p-4 rounded-xl bg-surface-muted">
                                <div class="text-center min-w-[50px]">
                                    <p class="font-bold text-on-surface-variant">10:30</p>
                                    <p class="text-[12px] text-on-surface-variant">AM</p>
                                </div>
                                <div>
                                    <h4 class="font-bold text-on-surface">Michael Chen</h4>
                                    <p class="text-body-md text-on-surface-variant text-sm">${t('adash.sportsMassage')} • Dr. Elena</p>
                                </div>
                            </div>
                            <div class="flex gap-4 p-4 rounded-xl bg-surface-container-low border-l-4 border-secondary">
                                <div class="text-center min-w-[50px]">
                                    <p class="font-bold text-secondary">11:15</p>
                                    <p class="text-[12px] text-on-surface-variant">AM</p>
                                </div>
                                <div>
                                    <h4 class="font-bold text-on-surface">Emma Watson</h4>
                                    <p class="text-body-md text-on-surface-variant text-sm">${t('adash.initialConsult')} • Dr. Aris</p>
                                </div>
                            </div>
                            <div class="flex gap-4 p-4 rounded-xl bg-surface-muted">
                                <div class="text-center min-w-[50px]">
                                    <p class="font-bold text-on-surface-variant">02:00</p>
                                    <p class="text-[12px] text-on-surface-variant">PM</p>
                                </div>
                                <div>
                                    <h4 class="font-bold text-on-surface">Robert Davis</h4>
                                    <p class="text-body-md text-on-surface-variant text-sm">${t('adash.spinalRehab')} • Dr. Marcus</p>
                                </div>
                            </div>
                        </div>
                        <button class="mt-6 w-full py-3 text-primary font-button-text text-button-text border border-primary/20 rounded-lg hover:bg-primary/5 transition-colors">
                            ${t('adash.viewFullCalendar')}
                        </button>
                    </div>
                </div>
                <!-- Therapist Activity Table -->
                <div class="bg-clinical-white rounded-xl shadow-sm border border-outline-variant/30 overflow-hidden">
                    <div class="p-6 border-b border-outline-variant/30 flex justify-between items-center">
                        <div>
                            <h2 class="font-headline-md text-headline-md font-bold text-on-surface">${t('adash.therapistActivity')}</h2>
                            <p class="text-on-surface-variant text-body-md">${t('adash.activitySub')}</p>
                        </div>
                        <button class="text-primary font-bold flex items-center gap-2 hover:underline">
                            ${t('adash.viewReport')} <span class="material-symbols-outlined">chevron_right</span>
                        </button>
                    </div>
                    <div class="overflow-x-auto">
                        <table class="w-full text-left border-collapse">
                            <thead>
                                <tr class="bg-surface-muted text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider">
                                    <th class="px-8 py-4">${t('adash.therapistTh')}</th>
                                    <th class="px-6 py-4">${t('adash.specialization')}</th>
                                    <th class="px-6 py-4">${t('adash.appointmentsMtd')}</th>
                                    <th class="px-6 py-4">${t('adash.revenueGen')}</th>
                                    <th class="px-6 py-4">${t('adash.rating')}</th>
                                    <th class="px-8 py-4">${t('adash.status')}</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-outline-variant/30">
                                <tr class="hover:bg-surface-container-low transition-colors group">
                                    <td class="px-8 py-4 flex items-center gap-3">
                                        <div class="w-10 h-10 rounded-full bg-surface-container overflow-hidden"></div>
                                        <div>
                                            <p class="font-bold text-on-surface">Dr. Aris Gunawan</p>
                                            <p class="text-sm text-on-surface-variant">aris.g@physiocare.com</p>
                                        </div>
                                    </td>
                                    <td class="px-6 py-4 text-on-surface">Orthopedic Rehab</td>
                                    <td class="px-6 py-4">142</td>
                                    <td class="px-6 py-4 font-bold">$12,450</td>
                                    <td class="px-6 py-4"><span class="text-warning-amber flex items-center"><span class="material-symbols-outlined !text-sm" style="font-variation-settings: 'FILL' 1;">star</span><span class="ml-1 text-on-surface font-bold">4.9</span></span></td>
                                    <td class="px-8 py-4"><span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-green/10 text-success-green border border-success-green/20">${t('adash.onDuty')}</span></td>
                                </tr>
                                <tr class="hover:bg-surface-container-low transition-colors group">
                                    <td class="px-8 py-4 flex items-center gap-3">
                                        <div class="w-10 h-10 rounded-full bg-surface-container overflow-hidden"></div>
                                        <div>
                                            <p class="font-bold text-on-surface">Dr. Elena Rodriguez</p>
                                            <p class="text-sm text-on-surface-variant">elena.r@physiocare.com</p>
                                        </div>
                                    </td>
                                    <td class="px-6 py-4 text-on-surface">Pediatric Therapy</td>
                                    <td class="px-6 py-4">98</td>
                                    <td class="px-6 py-4 font-bold">$8,200</td>
                                    <td class="px-6 py-4"><span class="text-warning-amber flex items-center"><span class="material-symbols-outlined !text-sm" style="font-variation-settings: 'FILL' 1;">star</span><span class="ml-1 text-on-surface font-bold">4.8</span></span></td>
                                    <td class="px-8 py-4"><span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-green/10 text-success-green border border-success-green/20">${t('adash.onDuty')}</span></td>
                                </tr>
                                <tr class="hover:bg-surface-container-low transition-colors group">
                                    <td class="px-8 py-4 flex items-center gap-3">
                                        <div class="w-10 h-10 rounded-full bg-surface-container overflow-hidden"></div>
                                        <div>
                                            <p class="font-bold text-on-surface">Dr. Marcus Thorne</p>
                                            <p class="text-sm text-on-surface-variant">marcus.t@physiocare.com</p>
                                        </div>
                                    </td>
                                    <td class="px-6 py-4 text-on-surface">Sports Medicine</td>
                                    <td class="px-6 py-4">115</td>
                                    <td class="px-6 py-4 font-bold">$10,120</td>
                                    <td class="px-6 py-4"><span class="text-warning-amber flex items-center"><span class="material-symbols-outlined !text-sm" style="font-variation-settings: 'FILL' 1;">star</span><span class="ml-1 text-on-surface font-bold">5.0</span></span></td>
                                    <td class="px-8 py-4"><span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-outline/10 text-on-surface-variant border border-outline/20">${t('adash.onLeave')}</span></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Refund & Reschedule Approvals Widget -->
                <div class="bg-clinical-white rounded-xl shadow-sm border border-outline-variant/30 overflow-hidden mt-8">
                    <div class="p-6 border-b border-outline-variant/30 flex justify-between items-center bg-error-container/10">
                        <div class="flex items-center gap-3">
                            <span class="material-symbols-outlined text-error">assignment_late</span>
                            <div>
                                <h2 class="font-headline-md text-headline-md font-bold text-on-surface">${t('adash.emergencyApprovals')}</h2>
                                <p class="text-on-surface-variant text-body-md">${t('adash.emergencySub')}</p>
                            </div>
                        </div>
                        <span class="bg-error text-white px-3 py-1 rounded-full text-xs font-bold">2 ${t('adash.pending')}</span>
                    </div>
                    <div class="p-6 space-y-4">
                        <!-- Request 1 -->
                        <div class="p-4 border border-outline-variant rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-surface-muted/30">
                            <div>
                                <div class="flex items-center gap-2 mb-1">
                                    <h4 class="font-bold text-on-surface">Budi Santoso</h4>
                                    <span class="bg-warning-amber/20 text-warning-amber px-2 py-0.5 rounded text-[10px] font-bold uppercase">${t('adash.reschedule')}</span>
                                </div>
                                <p class="text-sm text-on-surface-variant mb-2">${t('adash.original')} Oct 25, 09:00 AM • Home Visit</p>
                                <div class="bg-surface-container p-3 rounded-lg border border-outline-variant text-sm border-l-4 border-l-error">
                                    <span class="font-bold block mb-1">${t('adash.reason')}</span>
                                    ${t('adash.req1')}
                                    <button class="text-primary font-bold mt-2 flex items-center gap-1 text-xs hover:underline"><span class="material-symbols-outlined text-[14px]">attachment</span> View ER_Letter.pdf</button>
                                </div>
                            </div>
                            <div class="flex gap-2 w-full md:w-auto">
                                <button class="flex-1 md:flex-none px-4 py-2 border border-error text-error rounded-lg font-bold hover:bg-error/10 transition-colors">${t('adash.reject')}</button>
                                <button class="flex-1 md:flex-none px-4 py-2 bg-primary text-white rounded-lg font-bold hover:bg-primary/90 transition-colors shadow-md">${t('adash.approveWaive')}</button>
                            </div>
                        </div>
                        
                        <!-- Request 2 -->
                        <div class="p-4 border border-outline-variant rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-surface-muted/30">
                            <div>
                                <div class="flex items-center gap-2 mb-1">
                                    <h4 class="font-bold text-on-surface">Siti Aminah</h4>
                                    <span class="bg-error/20 text-error px-2 py-0.5 rounded text-[10px] font-bold uppercase">${t('adash.refund')}</span>
                                </div>
                                <p class="text-sm text-on-surface-variant mb-2">${t('adash.original')} Oct 24, 02:00 PM • ${t('booking.stdPhysio')}</p>
                                <div class="bg-surface-container p-3 rounded-lg border border-outline-variant text-sm border-l-4 border-l-error">
                                    <span class="font-bold block mb-1">${t('adash.reason')}</span>
                                    ${t('adash.req2')}
                                    <button class="text-primary font-bold mt-2 flex items-center gap-1 text-xs hover:underline"><span class="material-symbols-outlined text-[14px]">attachment</span> View Police_Report.jpg</button>
                                </div>
                            </div>
                            <div class="flex gap-2 w-full md:w-auto">
                                <button class="flex-1 md:flex-none px-4 py-2 border border-error text-error rounded-lg font-bold hover:bg-error/10 transition-colors">${t('adash.reject')}</button>
                                <button class="flex-1 md:flex-none px-4 py-2 bg-primary text-white rounded-lg font-bold hover:bg-primary/90 transition-colors shadow-md">${t('adash.approveRefund')}</button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            <!-- Footer -->
            <footer class="p-8 mt-8 border-t border-outline-variant/30 flex justify-between items-center text-on-surface-variant">
                <p class="text-body-md text-sm">${t('adash.footer')}</p>
                <div class="flex gap-6 text-sm">
                    <a class="hover:text-primary transition-colors" href="#">${t('adash.privacy')}</a>
                    <a class="hover:text-primary transition-colors" href="#">${t('adash.terms')}</a>
                    <a class="hover:text-primary transition-colors" href="#">${t('adash.compliance')}</a>
                </div>
            </footer>
</main>
        </div>
        `;
    },

    init() {
        // Animate chart bars
        const bars = document.querySelectorAll('.chart-bar');
        bars.forEach(bar => {
            const finalHeight = bar.style.height;
            bar.style.height = '0%';
            setTimeout(() => {
                bar.style.height = finalHeight;
            }, 100);
        });

        // Active state for sidebar nav items
        document.querySelectorAll('aside nav a').forEach(item => {
            item.addEventListener('click', (e) => {
                document.querySelectorAll('aside nav a').forEach(i => {
                    i.className = 'flex items-center gap-3 px-4 py-3 text-on-surface-variant dark:text-surface-variant font-button-text text-button-text hover:bg-surface-container-high dark:hover:bg-tertiary-container transition-colors duration-200';
                });
                item.className = 'flex items-center gap-3 px-4 py-3 bg-secondary-container dark:bg-secondary text-on-secondary-container dark:text-on-secondary rounded-lg font-button-text text-button-text active:scale-95 transition-transform';
            });
        });
    }
};

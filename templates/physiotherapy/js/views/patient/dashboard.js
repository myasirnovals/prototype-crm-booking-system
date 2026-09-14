/* ============================================
   PhysioCare - Patient Dashboard View
   ============================================ */

const PatientDashboardView = {
    /**
     * Render the patient dashboard page
     */
    async render() {
        const user = User.getCurrentUser();
        const name = user ? user.name.split(' ')[0] : 'James';
        const appointments = await AppointmentModel.forPatient(user ? user.patientId : 'PC-8842');
        const upcoming = appointments.filter(a => a.status === 'confirmed')[0] || null;
        const therapyHistory = appointments.filter(a => a.status === 'completed');

        // Exercise program
const exercises = [
            {
                title: t('pDash.exA1'),
                sets: t('pDash.set1'),
                status: t('pDash.completed'),
                statusColor: "text-success-green",
                statusIcon: "check_circle",
                mins: "10 MINS"
            },
            {
                title: t('pDash.exA2'),
                sets: t('pDash.set2'),
                status: t('pDash.pending'),
                statusColor: "text-warning-amber",
                statusIcon: "schedule",
                mins: "5 MINS"
            },
            {
                title: t('pDash.exA3'),
                sets: t('pDash.set3'),
                status: t('pDash.pending'),
                statusColor: "text-warning-amber",
                statusIcon: "schedule",
                mins: "12 MINS"
            }
        ];

        const exerciseCards = exercises.map(e => `
            <div class="group cursor-pointer bg-clinical-white rounded-3xl p-4 shadow-sm border border-outline-variant/30 hover:shadow-lg hover:border-primary/20 transition-all duration-300">
                <div class="relative aspect-video rounded-2xl overflow-hidden mb-4 bg-surface-container-low flex items-center justify-center group-hover:scale-[1.02] transition-transform">
                    <span class="material-symbols-outlined text-[64px] text-primary/30" style="font-variation-settings: 'FILL' 1;">fitness_center</span>
                    <div class="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div class="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-lg transform scale-50 group-hover:scale-100 transition-transform duration-300">
                            <span class="material-symbols-outlined text-primary text-3xl ml-1">play_arrow</span>
                        </div>
                    </div>
                    <div class="absolute top-3 right-3">
                        <span class="bg-black/40 backdrop-blur-md text-white text-[10px] px-2.5 py-1 rounded-lg uppercase font-bold tracking-wider">${e.mins}</span>
                    </div>
                </div>
                <h4 class="font-bold text-on-surface mb-2 group-hover:text-primary transition-colors text-lg">${e.title}</h4>
                <div class="flex items-center justify-between text-sm">
                    <span class="text-on-surface-variant font-medium">${e.sets}</span>
                    <span class="${e.statusColor} flex items-center gap-1.5 font-bold bg-${e.statusColor.replace('text-', '')}/10 px-2.5 py-1 rounded-full text-xs">
                        <span class="material-symbols-outlined text-[14px]">${e.statusIcon}</span> ${e.status}
                    </span>
                </div>
            </div>
        `).join('');

        const historyRows = therapyHistory.map(h => `
            <tr class="hover:bg-surface-muted/50 transition-colors">
                <td class="py-5 px-2">
                    <div class="font-bold">${h.date}</div>
                    <div class="text-xs text-on-surface-variant">${h.time}</div>
                </td>
                <td class="py-5 px-2">
                    <div class="flex items-center gap-2">
                        <div class="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center text-secondary font-bold text-xs">${h.therapist.split(' ').slice(0,2).map(w=>w[0]).join('')}</div>
                        <span>${h.therapist}</span>
                    </div>
                </td>
                <td class="py-5 px-2">
                    <span class="bg-surface-variant text-primary text-xs px-2 py-1 rounded font-medium">${h.assessment ? h.assessment.sessionType : t('pDash.therapySession')}</span>
                </td>
                <td class="py-5 px-2">
                    <p class="text-sm text-on-surface-variant line-clamp-1 max-w-md">${h.assessment ? h.assessment.notes : t('pDash.sessionCompleted')}</p>
                </td>
                <td class="py-5 px-2 text-right">
                    <button class="text-primary hover:text-secondary font-button-text text-button-text">${t('pDash.viewFullNote')}</button>
                </td>
            </tr>
        `).join('');

        return `
        ${NavbarPatient.render('dashboard', name)}
        <main class="max-w-container-max mx-auto px-6 py-12 space-y-12">
            <!-- Personalized Hero & Snapshot -->
            <section class="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <!-- Welcome Card -->
                <div class="lg:col-span-8 relative overflow-hidden bg-surface-container-lowest rounded-[2rem] p-10 shadow-sm border border-outline-variant/30 flex flex-col justify-center group">
                    <div class="absolute inset-0 w-full h-full pointer-events-none z-0">
                        <div class="absolute -right-20 -top-20 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[80px] mix-blend-multiply animate-pulse" style="animation-duration: 8s;"></div>
                        <div class="absolute -left-20 -bottom-20 w-[300px] h-[300px] bg-secondary/10 rounded-full blur-[60px] mix-blend-multiply animate-pulse" style="animation-duration: 10s; animation-delay: 2s;"></div>
                    </div>
                    
                    <div class="relative z-10">
                        <h1 class="text-4xl md:text-5xl font-extrabold tracking-tight text-on-surface mb-3 bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">${t('pDash.welcome', {name})}</h1>
                        <p class="text-lg text-on-surface-variant mb-10 max-w-xl leading-relaxed">${t('pDash.sub')}</p>
                        
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <!-- Next Session -->
                            <div class="bg-white/50 backdrop-blur-md p-6 rounded-3xl border border-outline-variant/50 relative shadow-sm hover:shadow-md transition-shadow">
                                <span class="text-xs font-bold uppercase tracking-widest text-outline-variant block mb-2">${t('pDash.nextSession')}</span>
                                <div class="flex items-center gap-3 mb-4">
                                    <div class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                        <span class="material-symbols-outlined">calendar_month</span>
                                    </div>
                                    <span class="text-xl font-bold text-on-surface">${upcoming ? upcoming.date + ', ' + upcoming.time : t('pDash.none')}</span>
                                </div>
                                ${upcoming ? `<a href="#/patient/update-booking?id=${upcoming.id}" class="inline-flex items-center gap-1.5 text-xs font-bold bg-white border border-outline-variant/50 text-on-surface hover:text-primary hover:border-primary/50 px-4 py-2 rounded-xl transition-all shadow-sm"><span class="material-symbols-outlined text-[16px]">edit_calendar</span> ${t('pDash.reschedule')}</a>` : ''}
                            </div>
                            
                            <!-- Recovery Progress -->
                            <div class="bg-white/50 backdrop-blur-md p-6 rounded-3xl border border-outline-variant/50 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-center">
                                <div class="flex justify-between items-end mb-3">
                                    <span class="text-xs font-bold uppercase tracking-widest text-outline-variant">${t('pDash.recoveryProgress')}</span>
                                    <span class="text-3xl font-extrabold text-secondary">${user ? user.recoveryProgress : 65}%</span>
                                </div>
                                <div class="w-full bg-outline-variant/30 h-3 rounded-full overflow-hidden">
                                    <div class="bg-gradient-to-r from-primary to-secondary h-full rounded-full progress-bar-fill relative">
                                        <div class="absolute inset-0 bg-white/20 animate-pulse"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Active Treatment Card -->
                <div class="lg:col-span-4 bg-gradient-to-br from-primary to-primary-container p-8 rounded-[2rem] text-white shadow-lg relative overflow-hidden group">
                    <div class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay pointer-events-none"></div>
                    <div class="relative z-10 flex flex-col h-full">
                        <span class="text-xs font-bold uppercase tracking-widest text-white/70 mb-2 flex items-center gap-1.5">
                            <span class="material-symbols-outlined text-[14px]">star</span>
                            ${t('pDash.activeTreatment')}
                        </span>
<h2 class="text-3xl font-bold mb-8 leading-tight">${user ? user.activeTreatment : t('pDash.lowerBackRehab')}</h2>
                        
                        <div class="space-y-4 flex-grow">
                            <div class="flex items-center gap-4 p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 hover:bg-white/20 transition-colors">
                                <div class="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                                    <span class="material-symbols-outlined text-white">exercise</span>
                                </div>
                                <div>
                                    <p class="font-bold text-white text-sm">${t('pDash.dailyRoutine')}</p>
                                    <p class="text-xs text-white/80">${t('pDash.exercisesRemaining')}</p>
                                </div>
                            </div>
                            <div class="flex items-center gap-4 p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 hover:bg-white/20 transition-colors">
                                <div class="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                                    <span class="material-symbols-outlined text-white">medical_information</span>
                                </div>
                                <div>
                                    <p class="font-bold text-white text-sm">${t('pDash.therapist')}</p>
                                    <p class="text-xs text-white/80">${user ? user.therapist : 'Dr. Sarah Mitchell, PT'}</p>
                                </div>
                            </div>
                        </div>
                        
                        <a href="#/patient/medical-records" class="w-full mt-8 py-4 bg-white text-primary rounded-xl font-bold text-center hover:shadow-[0_10px_20px_rgba(255,255,255,0.2)] hover:scale-[1.02] active:scale-95 transition-all">
                            ${t('pDash.viewFullPlan')}
                        </a>
                    </div>
                </div>
            </section>
            <!-- Quick Actions Bento -->
            <section class="grid grid-cols-2 md:grid-cols-4 gap-6">
                <a href="#/booking" class="group relative overflow-hidden bg-clinical-white rounded-[1.5rem] p-6 shadow-sm border border-outline-variant/40 hover:shadow-[0_15px_30px_-10px_rgba(14,116,144,0.15)] hover:border-primary/30 transition-all duration-300 transform hover:-translate-y-1 flex flex-col items-center justify-center text-center">
                    <div class="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                        <span class="material-symbols-outlined text-[32px]">add_circle</span>
                    </div>
                    <span class="font-bold text-on-surface group-hover:text-primary transition-colors text-sm">${t('pDash.bookNewSession')}</span>
                </a>
                <a href="#/patient/teleconsultation${upcoming ? '?id=' + upcoming.id : ''}" class="group relative overflow-hidden bg-clinical-white rounded-[1.5rem] p-6 shadow-sm border border-outline-variant/40 hover:shadow-[0_15px_30px_-10px_rgba(14,116,144,0.15)] hover:border-primary/30 transition-all duration-300 transform hover:-translate-y-1 flex flex-col items-center justify-center text-center">
                    <div class="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                        <span class="material-symbols-outlined text-[32px]">videocam</span>
                    </div>
                    <span class="font-bold text-on-surface group-hover:text-primary transition-colors text-sm">${t('pDash.teleconsultation')}</span>
                </a>
                <a href="#/articles" class="group relative overflow-hidden bg-clinical-white rounded-[1.5rem] p-6 shadow-sm border border-outline-variant/40 hover:shadow-[0_15px_30px_-10px_rgba(14,116,144,0.15)] hover:border-primary/30 transition-all duration-300 transform hover:-translate-y-1 flex flex-col items-center justify-center text-center">
                    <div class="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                        <span class="material-symbols-outlined text-[32px]">checklist_rtl</span>
                    </div>
                    <span class="font-bold text-on-surface group-hover:text-primary transition-colors text-sm">${t('pDash.checkProgram')}</span>
                </a>
                <a href="#/patient/medical-records" class="group relative overflow-hidden bg-clinical-white rounded-[1.5rem] p-6 shadow-sm border border-outline-variant/40 hover:shadow-[0_15px_30px_-10px_rgba(14,116,144,0.15)] hover:border-primary/30 transition-all duration-300 transform hover:-translate-y-1 flex flex-col items-center justify-center text-center">
                    <div class="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                        <span class="material-symbols-outlined text-[32px]">description</span>
                    </div>
                    <span class="font-bold text-on-surface group-hover:text-primary transition-colors text-sm">${t('pDash.medicalReports')}</span>
                </a>
            </section>
            <!-- Home Exercise Program -->
            <section class="bg-surface-container-lowest p-8 rounded-[2rem] shadow-sm border border-outline-variant/30">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                    <div>
                        <h2 class="text-2xl font-bold flex items-center gap-3 mb-1">
                            <span class="w-10 h-10 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center">
                                <span class="material-symbols-outlined">fitness_center</span>
                            </span>
                            ${t('pDash.homeExercise')}
                        </h2>
                        <p class="text-on-surface-variant text-sm ml-13">${t('pDash.homeExerciseSub')}</p>
                    </div>
                    <a href="#/articles" class="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-primary/10 text-primary font-bold rounded-xl hover:bg-primary hover:text-white transition-all group">
                        ${t('pDash.viewFullProgram')} 
                        <span class="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                    </a>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    ${exerciseCards}
                </div>
            </section>
            <!-- Therapy History -->
            <section class="bg-surface-container-lowest p-8 rounded-[2rem] shadow-sm border border-outline-variant/30 overflow-hidden">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                    <h2 class="text-2xl font-bold flex items-center gap-3">
                        <span class="w-10 h-10 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center">
                            <span class="material-symbols-outlined">history</span>
                        </span>
                        ${t('pDash.myTherapyHistory')}
                    </h2>
                    <div class="flex gap-3">
                        <button class="bg-white border border-outline-variant/50 px-4 py-2 rounded-xl text-sm font-bold text-on-surface hover:bg-surface-muted transition-colors flex items-center gap-2">
                            <span class="material-symbols-outlined text-[18px]">filter_list</span> ${t('pDash.filter')}
                        </button>
                        <button class="bg-white border border-outline-variant/50 px-4 py-2 rounded-xl text-sm font-bold text-on-surface hover:bg-surface-muted transition-colors flex items-center gap-2">
                            <span class="material-symbols-outlined text-[18px]">download</span> ${t('pDash.downloadAll')}
                        </button>
                    </div>
                </div>
                <div class="overflow-x-auto bg-white rounded-2xl border border-outline-variant/30 p-2">
                    <table class="w-full text-left border-collapse">
                        <thead>
                            <tr class="border-b-2 border-surface-muted text-on-surface-variant text-xs font-bold uppercase tracking-widest bg-surface-container-lowest/50">
                                <th class="py-4 px-4 rounded-tl-xl">${t('pDash.date')}</th>
                                <th class="py-4 px-4">${t('pDash.therapistTh')}</th>
                                <th class="py-4 px-4">${t('pDash.sessionType')}</th>
                                <th class="py-4 px-4">${t('pDash.notesAssessment')}</th>
                                <th class="py-4 px-4 text-right rounded-tr-xl">${t('pDash.action')}</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-surface-muted">
                            ${historyRows || `<tr><td colspan="5" class="py-12 text-center text-on-surface-variant italic">${t('pDash.noHistory')}</td></tr>`}
                        </tbody>
                    </table>
                </div>
            </section>
        </main>
        ${Footer.render()}
        `;
    },

    init() {
        // Progress bar animation
        const bar = document.querySelector('.progress-bar-fill');
        if (bar) {
            const targetWidth = bar.style.width;
            bar.style.width = '0%';
            setTimeout(() => {
                bar.style.width = targetWidth;
            }, 300);
        }
        NavbarPatient.init();
    }
};

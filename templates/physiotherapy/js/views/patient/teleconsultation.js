/* ============================================
   PhysioCare - Patient Teleconsultation View
   ============================================ */

const PatientTeleconsultationView = {
    /**
     * Render the teleconsultation session page
     */
    async render(params) {
        // Find appointment details if provided, else use defaults
        const appId = params && params.id ? params.id : null;
        let appointment = null;
        if (appId) {
            appointment = await AppointmentModel.getById(appId);
        }

        const therapistName = appointment ? appointment.therapistName : 'Dr. Sarah Jenkins';

        return `
        <div class="bg-background text-on-background font-body-md min-h-screen flex flex-col overflow-hidden">
            <!-- TopNavBar (Session Header) -->
            <header class="sticky top-0 w-full bg-clinical-white shadow-sm z-50">
                <div class="flex justify-between items-center px-6 py-4 max-w-container-max mx-auto">
                    <div class="flex items-center gap-4">
                        <a href="#/patient/dashboard" class="font-headline-md text-headline-md font-bold text-primary hover:opacity-80 transition-opacity">PhysioCare</a>
                        <div class="h-6 w-px bg-outline-variant hidden md:block"></div>
                        <div class="hidden md:flex items-center gap-3">
                            <span class="font-body-md text-on-surface-variant">${t('tele.sessionWith')}</span>
                            <span class="font-bold text-primary">${therapistName}</span>
                            <span class="bg-success-green/10 text-success-green px-3 py-0.5 rounded-full text-label-sm font-label-sm flex items-center gap-1">
                                <span class="material-symbols-outlined text-[14px]">fiber_manual_record</span>
                                ${t('tele.live')}
                            </span>
                        </div>
                    </div>
                    <div class="flex items-center gap-6">
                        <div class="flex items-center gap-2 bg-surface-muted px-4 py-2 rounded-xl">
                            <span class="material-symbols-outlined text-secondary">schedule</span>
                            <span class="font-label-sm text-label-sm text-on-surface-variant tabular-nums" id="tele-timer">24:18 ${t('tele.remaining')}</span>
                        </div>
                        <a href="#/patient/dashboard" class="bg-primary text-on-primary px-6 py-2 rounded-lg font-button-text text-button-text hover:opacity-90 active:scale-95 transition-all inline-block">
                            ${t('tele.endSession')}
                        </a>
                    </div>
                </div>
            </header>

            <!-- Main Content Canvas -->
            <main class="flex-1 flex flex-col md:flex-row overflow-hidden" style="height: calc(100vh - 120px);">
                <!-- Video Grid Area -->
                <section class="flex-1 relative bg-on-background p-4 flex flex-col">
                    <div class="flex-1 relative rounded-2xl overflow-hidden shadow-2xl group">
                        <!-- Large Therapist Video -->
                        <div class="absolute inset-0 w-full h-full bg-surface-variant flex items-center justify-center">
                            <img class="w-full h-full object-cover" data-alt="A professional female physiotherapist in a clinical setting." src="https://lh3.googleusercontent.com/aida-public/AB6AXuBfogcWwiWYAHC8-KkLHwuC1XELfQ6q1ny0XSI7_JJAbO2MFUC5iDFi5bcGEosTtfNiXKwR3xGxfjpr5djBAmDq1ju_eYX5Wj2CSTLysqFZnixMYUo0s51mFpT-VzgX8Q3KWufNVMM0y_vbTurzXbZuD7_VXscs_kpCUaVoH-z_zJjDMVv18hn1Yi-JNMlkduM-fhFSF2KQUcJVQRUKy9n7P4t8oismfcEVNtNVn98SEByvlnOrkYQQjQ"/>
                            <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60"></div>
                            
                            <!-- Remote View Label -->
                            <div class="absolute bottom-6 left-6 flex items-center gap-3">
                                <div class="w-10 h-10 rounded-full border-2 border-clinical-white overflow-hidden shadow-md">
                                    <img class="w-full h-full object-cover" data-alt="Close up portrait." src="https://lh3.googleusercontent.com/aida-public/AB6AXuCbTsrhEODMfeXPg-fdx3llyIbOKekadOV_hs7Zod1Er7gbQfcF9XKpgBdPkPOmKBv2Ob5o3zE8Gwe9qXLsr7vGB3VgNdPeSpAtdnUDfdMqAeKbDK2A3XUYBhGPuvYnHcFYx_rSiCSmaeaHkuU4gxc4JC3pforFDjIctlxTjUFWWYcxRcVBv16wRxrEfnCAK79FUtPAK1kKaQ2qs4aPOQwJke0zbUdwAOvp3qTKMVEeim9qlFXtN_A-4w"/>
                                </div>
                                <span class="text-clinical-white font-semibold">${therapistName}</span>
                            </div>
                        </div>

                        <!-- Self View (Floating PIP) -->
                        <div class="absolute top-6 right-6 w-32 md:w-48 aspect-video bg-on-surface-variant rounded-xl overflow-hidden border-2 border-clinical-white/20 shadow-xl z-10">
                            <img class="w-full h-full object-cover grayscale-[20%]" data-alt="A patient sitting in a living room." src="https://lh3.googleusercontent.com/aida-public/AB6AXuBS0zOeUQFJ0_sv62hW-BidsNH3BlD0vu45wbSz3fxnMHQDfzqDIIA1GcvI4Qy55Kh4AamWWXFsPGWixQxWl6DhKWKVUjtwkm08obqr7DGChXaqaW_TbmyDSX4urd-FfrFh-1yTdnFx-Gk0Yn_BrdPYqRiaWHykwmXxsx7D4wRs191s24_IFJinYLLKKrUMaP0pIfdE_dBcPTa8iyvrwkD6DJ4XgVftnuDHUhYAjED3Otq2ckCUn_fN-Q"/>
                            <div class="absolute bottom-2 left-2 px-2 py-0.5 bg-black/40 rounded backdrop-blur-md text-[10px] text-clinical-white font-medium">${t('ai.you')}</div>
                        </div>

                        <!-- Floating Shared Resource Alert -->
                        <div class="absolute top-6 left-6 bg-clinical-white p-3 rounded-xl shadow-2xl flex items-center gap-4 animate-bounce hover:animate-none cursor-pointer transition-all border border-secondary-container" id="tele-exercise-popup">
                            <div class="bg-secondary-container/20 p-2 rounded-lg">
                                <span class="material-symbols-outlined text-secondary">exercise</span>
                            </div>
                            <div>
                                <p class="text-[12px] font-bold text-primary leading-tight">${t('tele.newExercise')}</p>
                                <p class="text-[10px] text-on-surface-variant">Lumbar Extension Ver. 2</p>
                            </div>
                            <span class="material-symbols-outlined text-on-surface-variant text-[18px]">chevron_right</span>
                        </div>
                    </div>

                    <!-- Video Controls Bar -->
                    <div class="h-24 flex items-center justify-center gap-4">
                        <button class="w-12 h-12 rounded-full flex items-center justify-center bg-surface-muted/10 hover:bg-surface-muted/20 text-clinical-white transition-all">
                            <span class="material-symbols-outlined">mic</span>
                        </button>
                        <button class="w-12 h-12 rounded-full flex items-center justify-center bg-surface-muted/10 hover:bg-surface-muted/20 text-clinical-white transition-all">
                            <span class="material-symbols-outlined">videocam</span>
                        </button>
                        <button class="w-12 h-12 rounded-full flex items-center justify-center bg-surface-muted/10 hover:bg-surface-muted/20 text-clinical-white transition-all">
                            <span class="material-symbols-outlined">screen_share</span>
                        </button>
                        <div class="w-px h-8 bg-clinical-white/10 mx-2"></div>
                        <a href="#/patient/dashboard" class="w-12 h-12 rounded-full flex items-center justify-center bg-emergency-red text-clinical-white hover:scale-105 active:scale-95 transition-all shadow-lg shadow-emergency-red/30">
                            <span class="material-symbols-outlined">call_end</span>
                        </a>
                    </div>
                </section>

                <!-- Sidebar Panel -->
                <aside class="w-full md:w-[400px] bg-clinical-white border-l border-outline-variant flex flex-col shadow-[-4px_0px_20px_rgba(0,0,0,0.02)]">
                    <!-- Panel Navigation -->
                    <nav class="flex border-b border-outline-variant">
                        <button class="tele-tab-btn active flex-1 py-4 text-button-text font-button-text text-secondary border-b-2 border-secondary bg-surface-container-low transition-all" data-target="tele-notes-tab">${t('tele.notes')}</button>
                        <button class="tele-tab-btn flex-1 py-4 text-button-text font-button-text text-on-surface-variant hover:text-secondary transition-all" data-target="tele-chat-tab">${t('tele.chat')}</button>
                    </nav>

                    <div class="flex-1 overflow-y-auto p-6 space-y-8" style="scrollbar-width: thin;">
                        <!-- Notes Section -->
                        <div class="tele-tab-content space-y-6 block" id="tele-notes-tab">
                            <div>
                                <h3 class="font-headline-md text-primary mb-3 flex items-center gap-2">
                                    <span class="material-symbols-outlined text-[20px]">description</span>
                                    ${t('tele.sessionNotes')}
                                </h3>
                                <div class="bg-surface-muted p-4 rounded-xl border border-outline-variant/30 italic text-on-surface-variant">
                                    ${t('tele.noteText')}
                                </div>
                            </div>

                            <div>
                                <h3 class="font-headline-md text-primary mb-3 flex items-center gap-2">
                                    <span class="material-symbols-outlined text-[20px]">fitness_center</span>
                                    ${t('tele.prescribedExercises')}
                                </h3>
                                <div class="space-y-3">
                                    <div class="group p-3 border border-outline-variant rounded-xl hover:border-secondary transition-colors cursor-pointer bg-clinical-white shadow-sm hover:shadow-md">
                                        <div class="flex gap-4">
                                            <div class="w-16 h-16 rounded-lg overflow-hidden bg-surface-muted flex-shrink-0">
                                                <img class="w-full h-full object-cover" data-alt="Cat-cow stretch" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD6r3H41Sjz3FHRYA564xnoUZ46oN_HFPp_GyVW3uanR6YK9w-kVuIDRaAz0y8-IKRMbsROdvSdBA7tbKQYlDT_LXemMRFEU2llnha5va8Un4Wph20vMk7jhSmtMOrOF6Q11NaYBejIdct4dEPUi7cKbG73enKAt8OByOBmCXki5lIadjEtWczGxS6FD9NKAJDbT1PXPtcHfQNZ5nz-9mzJFvPREfKSzOKRe6-5fLhOEH3E55DbfsHeqg"/>
                                            </div>
                                            <div class="flex-1">
                                                <div class="flex justify-between items-start">
                                                    <p class="font-bold text-on-surface">Cat-Cow Stretch</p>
                                                    <span class="material-symbols-outlined text-secondary text-[18px]">play_circle</span>
                                                </div>
                                                <p class="text-label-sm text-on-surface-variant mt-1">3 sets x 10 reps</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="group p-3 border border-outline-variant rounded-xl hover:border-secondary transition-colors cursor-pointer bg-clinical-white shadow-sm hover:shadow-md">
                                        <div class="flex gap-4">
                                            <div class="w-16 h-16 rounded-lg overflow-hidden bg-surface-muted flex-shrink-0">
                                                <img class="w-full h-full object-cover" data-alt="Pelvic tilt" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCOkWP6yZtIkoWkxLcClXTxhhmb_clc7q5KzMoh3rkg-hu0Ivnpnbv1-vm04cHQ1jqZrXBvjjXIAT9ALQkVuX2QA0O4G8ps4K_gLttL397vMEEmWmZSyiqcPHFoio0O9MkRM_SpotjQWubk9PQ7dBJwyPA_xNiVccaoGFO6nadEJ3rdI2IZMuxvBIdedbEm09zhKuAVy46VIAskv_zmEdDyLxLRaGjMFexor_VcTiPpmabQpufpcPiUUg"/>
                                            </div>
                                            <div class="flex-1">
                                                <div class="flex justify-between items-start">
                                                    <p class="font-bold text-on-surface">Pelvic Tilt</p>
                                                    <span class="material-symbols-outlined text-secondary text-[18px]">play_circle</span>
                                                </div>
                                                <p class="text-label-sm text-on-surface-variant mt-1">2 sets x 12 reps</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="pt-4 border-t border-outline-variant">
                                <div class="bg-secondary-container/10 p-4 rounded-2xl border border-secondary/20">
                                    <div class="flex items-center gap-3 mb-2">
                                        <span class="material-symbols-outlined text-secondary">task_alt</span>
                                        <p class="font-bold text-secondary">${t('tele.postSessionPlan')}</p>
                                    </div>
                                    <p class="text-body-md text-on-surface-variant leading-relaxed">
                                        ${t('tele.postSessionDesc')}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <!-- Chat Section -->
                        <div class="tele-tab-content hidden h-full flex-col" id="tele-chat-tab">
                            <div class="flex-1 space-y-4">
                                <div class="flex flex-col items-start max-w-[80%]">
                                    <div class="bg-surface-muted p-3 rounded-2xl rounded-tl-none text-body-md text-on-surface">
                                        ${t('tele.chat1')}
                                    </div>
                                    <span class="text-[10px] text-outline mt-1 ml-1">10:02 AM</span>
                                </div>
                                <div class="flex flex-col items-end self-end max-w-[80%] ml-auto">
                                    <div class="bg-primary text-on-primary p-3 rounded-2xl rounded-tr-none text-body-md">
                                        ${t('tele.chat2')}
                                    </div>
                                    <span class="text-[10px] text-outline mt-1 mr-1">10:03 AM</span>
                                </div>
                                <div class="flex flex-col items-start max-w-[80%]">
                                    <div class="bg-surface-muted p-3 rounded-2xl rounded-tl-none text-body-md text-on-surface">
                                        ${t('tele.chat3')}
                                        <a class="block mt-2 text-secondary underline font-medium" href="#">physiocare.com/video/lumbar-ext</a>
                                    </div>
                                    <span class="text-[10px] text-outline mt-1 ml-1">10:05 AM</span>
                                </div>
                            </div>
                            <div class="mt-4 relative sticky bottom-0 bg-clinical-white pt-2">
                                <input class="w-full bg-surface-muted border-none rounded-full px-5 py-3 pr-12 focus:ring-2 focus:ring-secondary/30 outline-none" placeholder="${t('tele.typeMessage')}" type="text"/>
                                <button class="absolute right-2 top-[calc(0.5rem+4px)] w-8 h-8 rounded-full bg-secondary text-on-primary flex items-center justify-center">
                                    <span class="material-symbols-outlined text-[18px]">send</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </aside>
            </main>

            <!-- Footer Information (Non-Navigation) -->
            <div class="bg-surface-muted px-6 py-2 border-t border-outline-variant flex justify-between items-center text-[11px] text-outline uppercase tracking-widest font-label-sm">
                <span>${t('tele.sessionEncrypted')}</span>
                <div class="flex items-center gap-4">
                    <span class="flex items-center gap-1">
                        <span class="w-2 h-2 rounded-full bg-success-green"></span>
                        ${t('tele.connectionExcellent')}
                    </span>
                    <span>${t('tele.strVerified')}</span>
                </div>
            </div>
        </div>
        `;
    },

    /**
     * Initialize logic for teleconsultation view
     */
    init(params) {
        // Tab switching
        const tabs = document.querySelectorAll('.tele-tab-btn');
        tabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                const targetId = e.target.getAttribute('data-target');
                
                // Update buttons
                tabs.forEach(t => {
                    t.classList.remove('active', 'text-secondary', 'border-b-2', 'border-secondary', 'bg-surface-container-low');
                    t.classList.add('text-on-surface-variant');
                });
                e.target.classList.add('active', 'text-secondary', 'border-b-2', 'border-secondary', 'bg-surface-container-low');
                e.target.classList.remove('text-on-surface-variant');

                // Update content
                document.querySelectorAll('.tele-tab-content').forEach(content => {
                    content.classList.remove('block');
                    content.classList.remove('flex');
                    content.classList.add('hidden');
                });
                
                const targetContent = document.getElementById(targetId);
                targetContent.classList.remove('hidden');
                if (targetId === 'tele-chat-tab') {
                    targetContent.classList.add('flex');
                } else {
                    targetContent.classList.add('block');
                }
            });
        });

        // Simple Countdown Timer
        let minutes = 24;
        let seconds = 18;
        const timerEl = document.getElementById('tele-timer');
        
        if (this.timerInterval) clearInterval(this.timerInterval);
        
        this.timerInterval = setInterval(() => {
            if (seconds > 0) {
                seconds--;
            } else {
                if (minutes > 0) {
                    minutes--;
                    seconds = 59;
                } else {
                    clearInterval(this.timerInterval);
                }
            }
            if (timerEl) {
                timerEl.textContent = `${minutes}:${seconds.toString().padStart(2, '0')} ${t('tele.remaining')}`;
            }
        }, 1000);

        // Interaction for exercise popup
        const popup = document.getElementById('tele-exercise-popup');
        if (popup) {
            popup.addEventListener('click', () => {
                const notesBtn = document.querySelector('.tele-tab-btn[data-target="tele-notes-tab"]');
                if (notesBtn) notesBtn.click();
            });
        }
    },

    /**
     * Cleanup interval when navigating away
     */
    destroy() {
        if (this.timerInterval) clearInterval(this.timerInterval);
    }
};

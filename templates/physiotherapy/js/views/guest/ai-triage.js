/* ============================================
   PhysioCare - AI Triage Assistant View (Hilda)
   ============================================ */

const GuestAITriageView = {
    /**
     * Render the AI triage page
     */
    async render() {
        return `
        ${NavbarGuest.render('')}
        <main class="flex-grow flex flex-col lg:flex-row max-w-container-max mx-auto w-full px-4 md:px-section-padding-desktop py-8 gap-gutter overflow-hidden h-[calc(100vh-80px)]">
            <!-- Left Column: Chat Interface -->
            <section class="flex-1 flex flex-col bg-clinical-white rounded-xl shadow-sm overflow-hidden border border-surface-variant">
                <div class="p-4 bg-surface-container flex items-center justify-between border-b border-surface-variant">
                    <div class="flex items-center gap-3">
                        <div class="relative">
                            <div class="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container font-bold">H</div>
                            <div class="absolute bottom-0 right-0 w-3 h-3 bg-success-green rounded-full border-2 border-clinical-white"></div>
                        </div>
                        <div>
                            <h2 class="font-headline-md text-[18px] leading-tight">Hilda</h2>
<p class="text-label-sm font-label-sm text-on-surface-variant uppercase">${t('ai.assistant')}</p>
                        </div>
                    </div>
<div class="flex flex-col items-end">
                        <span class="text-label-sm font-label-sm text-primary mb-1">${t('ai.progress')}</span>
                        <div class="w-32 h-2 bg-surface-variant rounded-full overflow-hidden">
                            <div class="h-full bg-primary transition-all duration-500 w-[20%]" id="progress-bar"></div>
                        </div>
                    </div>
                </div>
                <div class="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth" id="chat-messages">
                    <div class="flex flex-col items-start max-w-[85%] animate-fade-in">
                        <div class="bg-surface-muted text-on-surface p-4 rounded-2xl chat-bubble-hilda shadow-sm">
                            <p class="font-body-md">${t('ai.hello1')}</p>
                            <p class="mt-2 text-on-surface-variant text-sm italic">${t('ai.helloNote')}</p>
                        </div>
                        <span class="text-[10px] text-outline mt-1 ml-2">${t('ai.justNow')}</span>
                    </div>
                    <div class="flex flex-col items-start max-w-[85%]">
                        <div class="bg-surface-muted text-on-surface p-4 rounded-2xl chat-bubble-hilda shadow-sm">
                            <p class="font-body-md">${t('ai.hello2')}</p>
                        </div>
                    </div>
                </div>
                <div class="p-4 bg-surface-bright border-t border-surface-variant">
                    <div class="relative">
                        <textarea class="w-full bg-clinical-white border border-outline-variant rounded-xl px-4 py-3 pr-16 focus:ring-2 focus:ring-secondary focus:border-secondary outline-none transition-all resize-none min-h-[60px]" id="user-input" placeholder="${t('ai.typeSymptoms')}" rows="2"></textarea>
                        <button class="absolute right-2 bottom-2 p-2 bg-primary text-on-primary rounded-lg hover:bg-primary-container transition-colors active:scale-95" id="send-btn">
                            <span class="material-symbols-outlined">send</span>
                        </button>
                    </div>
                    <div class="flex gap-2 mt-3 overflow-x-auto pb-1 no-scrollbar">
                        <button class="whitespace-nowrap px-3 py-1 bg-surface-muted hover:bg-surface-variant rounded-full text-sm transition-colors border border-outline-variant quick-chip">${t('ai.quick1')}</button>
                        <button class="whitespace-nowrap px-3 py-1 bg-surface-muted hover:bg-surface-variant rounded-full text-sm transition-colors border border-outline-variant quick-chip">${t('ai.quick2')}</button>
                        <button class="whitespace-nowrap px-3 py-1 bg-surface-muted hover:bg-surface-variant rounded-full text-sm transition-colors border border-outline-variant quick-chip">${t('ai.quick3')}</button>
                    </div>
                </div>
                
<!-- EMERGENCY LOCKDOWN OVERLAY -->
                <div id="emergency-overlay" class="hidden absolute inset-0 bg-error/95 z-50 flex-col items-center justify-center text-clinical-white p-8 text-center animate-fade-in backdrop-blur-sm">
                    <span class="material-symbols-outlined text-[80px] mb-4 animate-pulse">emergency</span>
                    <h2 class="text-3xl font-bold mb-2">${t('ai.emergencyDetected')}</h2>
                    <p class="text-lg mb-6 max-w-md">${t('ai.emergencyDesc')}</p>
                    <a href="tel:119" class="bg-clinical-white text-error font-bold text-xl py-4 px-8 rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-transform flex items-center gap-3">
                        <span class="material-symbols-outlined text-3xl">call</span>
                        ${t('ai.callNow')}
                    </a>
                    <p class="mt-8 text-sm opacity-80 max-w-md">${t('ai.emergencyFooter')}</p>
                </div>
            </section>
            <!-- Right Column: Body Map & Red Flags -->
            <aside class="w-full lg:w-[400px] flex flex-col gap-gutter">
                <div class="bg-clinical-white rounded-xl shadow-sm border border-surface-variant overflow-hidden">
                    <div class="p-4 bg-surface-container border-b border-surface-variant">
                        <h3 class="font-headline-md text-primary flex items-center gap-2">
                            <span class="material-symbols-outlined">accessibility_new</span>
                            ${t('ai.bodyMap')}
                        </h3>
                        <p class="text-sm text-on-surface-variant">${t('ai.bodyMapDesc')}</p>
                    </div>
                    <div class="p-6 flex justify-center bg-surface-muted/50 relative">
                        <div class="w-48 h-80 relative">
                            <div class="w-full h-full bg-surface-container-high rounded-lg flex items-center justify-center relative overflow-hidden">
                                <span class="material-symbols-outlined text-[140px] text-primary/30">accessibility_new</span>
                                <div class="absolute top-[55%] left-[45%] w-4 h-4 bg-error rounded-full body-map-pin cursor-pointer shadow-lg border-2 border-clinical-white"></div>
                            </div>
                        </div>
                    </div>
                    <div class="p-4 flex flex-wrap gap-2 justify-center">
                        <span class="px-3 py-1 bg-surface-variant rounded-full text-xs font-bold text-on-surface-variant">${t('ai.front')}</span>
                        <span class="px-3 py-1 bg-clinical-white border border-outline-variant rounded-full text-xs font-bold text-outline">${t('ai.back')}</span>
                    </div>
                </div>
                <!-- Red Flag Alert -->
                <div class="bg-error-container text-on-error-container p-5 rounded-xl border-l-4 border-error hidden animate-pulse" id="alert-box">
                    <div class="flex items-start gap-3">
                        <span class="material-symbols-outlined text-error text-3xl">emergency_home</span>
                        <div>
                            <h4 class="font-bold text-lg mb-1">${t('ai.critical')}</h4>
                            <p class="text-sm mb-4">${t('ai.criticalDesc')}</p>
                            <button class="w-full bg-emergency-red text-clinical-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-transform">
                                <span class="material-symbols-outlined">call</span>
                                ${t('ai.callEmergency')}
                            </button>
                        </div>
                    </div>
                </div>
                <div class="bg-clinical-white rounded-xl shadow-sm border border-surface-variant p-5 flex flex-col gap-4">
                    <h3 class="font-headline-md text-primary">${t('ai.help')}</h3>
                    <p class="text-sm text-on-surface-variant">${t('ai.helpDesc')}</p>
                    <div class="flex flex-col gap-2">
                        <a href="#/booking" class="w-full py-3 bg-secondary text-on-primary rounded-lg font-button-text hover:brightness-110 transition-all flex items-center justify-center gap-2">
                            <span class="material-symbols-outlined">video_call</span>
                            ${t('ai.talkTherapist')}
                        </a>
                        <a href="#/booking" class="w-full py-3 bg-clinical-white border-2 border-primary text-primary rounded-lg font-button-text hover:bg-surface-muted transition-all flex items-center justify-center gap-2">
                            <span class="material-symbols-outlined">event_available</span>
                            ${t('ai.bookClinic')}
                        </a>
                    </div>
                    <div class="mt-2 flex items-center gap-2 text-xs text-outline justify-center">
                        <span class="material-symbols-outlined text-[14px]">verified</span>
                        ${t('ai.verified')}
                    </div>
                </div>
            </aside>
        </main>
        `;

    },

    init() {
        const input = document.getElementById('user-input');
        const sendBtn = document.getElementById('send-btn');
        const chatMessages = document.getElementById('chat-messages');
        const progressBar = document.getElementById('progress-bar');
        const alertBox = document.getElementById('alert-box');

        if (!input || !sendBtn) return;
        let step = 1;

        function addMessage(text, isUser = false) {
            const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const bubbleClass = isUser ? 'bg-primary text-on-primary chat-bubble-user' : 'bg-surface-muted text-on-surface chat-bubble-hilda';
            const alignment = isUser ? 'items-end ml-auto' : 'items-start';
            const margin = isUser ? 'mr-2' : 'ml-2';
            const messageHtml = `
                <div class="flex flex-col ${alignment} max-w-[85%] animate-fade-in">
                    <div class="${bubbleClass} p-4 rounded-2xl shadow-sm">
                        <p class="font-body-md">${text}</p>
                    </div>
                    <span class="text-[10px] text-outline mt-1 ${margin}">${time}</span>
                </div>
            `;
            chatMessages.insertAdjacentHTML('beforeend', messageHtml);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }

        function triggerHilda(userInput) {
            step++;
            const progress = (step / 5) * 100;
            progressBar.style.width = `${progress}%`;

            setTimeout(() => {
if (userInput.toLowerCase().includes('chest') || userInput.toLowerCase().includes('numb')) {
                    addMessage(t('ai.urgetExt'));
                    if (alertBox) alertBox.classList.remove('hidden');
                    
                    // Trigger Lockdown
                    const overlay = document.getElementById('emergency-overlay');
                    if (overlay) {
                        overlay.classList.remove('hidden');
                        overlay.classList.add('flex');
                    }
                    input.disabled = true;
                    sendBtn.disabled = true;
                    document.querySelectorAll('.quick-chip').forEach(c => c.disabled = true);
                } else if (step === 2) {
                    addMessage(t('ai.intensity'));
                } else if (step === 3) {
                    addMessage(t('ai.radiate'));
                } else {
                    addMessage(t('ai.analyzing'));
                }
            }, 1000);
        }

        sendBtn.addEventListener('click', () => {
            const text = input.value.trim();
            if (text) {
                addMessage(text, true);
                input.value = '';
                triggerHilda(text);
            }
        });

        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendBtn.click();
            }
        });

        document.querySelectorAll('.quick-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                input.value = chip.textContent.trim();
                sendBtn.click();
            });
        });
    }
};

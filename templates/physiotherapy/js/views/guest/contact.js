/* ============================================
   PhysioCare - Guest Contact & Location View
   ============================================ */

const GuestContactView = {
    /**
     * Render the contact & location page
     */
    async render() {
        const branches = [
            {
                name: "PhysioCare Sudirman",
                address: "Sudirman Central Business District, Level 12",
                city: "Jakarta",
                phone: "+62 21 5550-1234",
hours: "Mon - Sat: 08:00 - 20:00",
                icon: "location_city",
                status: t('contact.openNow')
            },
            {
                name: "PhysioCare Kelapa Gading",
                address: "Mall Kelapa Gading 3, Lt. 2 No. 15",
                city: "Jakarta Utara",
                phone: "+62 21 5550-5678",
hours: "Mon - Sat: 09:00 - 19:00",
                icon: "storefront",
                status: t('contact.openNow')
            },
            {
                name: "PhysioCare BSD",
                address: "BSD Green Office Park, Jl. Boulevard",
                city: "Tangerang Selatan",
                phone: "+62 21 5550-9012",
hours: "Mon - Sat: 08:30 - 20:30",
                icon: "apartment",
                status: t('contact.openNow')
            }
        ];

        const branchCards = branches.map(b => `
            <div class="bg-clinical-white rounded-xl overflow-hidden border border-outline-variant/20 hover:shadow-xl transition-all duration-300">
                <div class="h-40 bg-surface-container-low flex items-center justify-center relative overflow-hidden">
                    <div class="absolute inset-0 bg-gradient-to-br from-primary-fixed/40 to-secondary-fixed/30"></div>
                    <span class="material-symbols-outlined text-[70px] text-primary relative z-10" style="font-variation-settings: 'FILL' 1;">${b.icon}</span>
                </div>
                <div class="p-6">
                    <div class="flex justify-between items-start mb-4">
                        <h3 class="font-headline-md text-headline-md">${b.name}</h3>
                        <span class="bg-success-green/10 text-success-green text-[11px] font-bold px-2 py-0.5 rounded-full">${b.status}</span>
                    </div>
                    <div class="space-y-3 mb-6">
                        <div class="flex gap-3">
                            <span class="material-symbols-outlined text-primary text-sm">location_on</span>
                            <p class="text-sm text-on-surface-variant">${b.address}<br>${b.city}</p>
                        </div>
                        <div class="flex gap-3">
                            <span class="material-symbols-outlined text-primary text-sm">call</span>
                            <p class="text-sm text-on-surface-variant">${b.phone}</p>
                        </div>
                        <div class="flex gap-3">
                            <span class="material-symbols-outlined text-primary text-sm">schedule</span>
                            <p class="text-sm text-on-surface-variant">${b.hours}</p>
                        </div>
                    </div>
<a href="#/booking" class="w-full py-3 bg-primary text-on-primary rounded-lg font-button-text text-center hover:bg-primary-container transition-all block">
                        ${t('contact.bookBranch')}
                    </a>
                </div>
            </div>
        `).join('');

        return `
        ${NavbarGuest.render('')}
        <main class="min-h-screen bg-background">
            <!-- Hero -->
            <section class="relative py-20 px-6 bg-surface-container-low overflow-hidden">
                <div class="max-w-container-max mx-auto text-center relative z-10">
<span class="inline-block px-4 py-1.5 rounded-full bg-secondary-fixed text-on-secondary-fixed-variant font-label-sm text-label-sm mb-6">
                        ${t('contact.badge')}
                    </span>
                    <h1 class="font-headline-lg text-headline-lg mb-6">${t('contact.title')}</h1>
                    <p class="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto">
                        ${t('contact.sub')}
                    </p>
                </div>
            </section>
            <!-- Branch Cards -->
            <section class="py-20 px-6 max-w-container-max mx-auto">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                    ${branchCards}
                </div>
            </section>
            <!-- Contact Form & Info -->
            <section class="py-20 px-6 bg-clinical-white">
                <div class="max-w-container-max mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16">
                    <div>
<h2 class="font-headline-lg text-headline-lg mb-4">${t('contact.contactUs')}</h2>
                        <p class="text-on-surface-variant font-body-lg mb-8">${t('contact.contactDesc')}</p>
                        <div class="space-y-6">
                            <div class="flex items-start gap-4">
                                <div class="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                    <span class="material-symbols-outlined">call</span>
                                </div>
                                <div>
                                    <h4 class="font-headline-md text-headline-md">${t('contact.waPhone')}</h4>
                                    <p class="text-on-surface-variant">+62 21 5550-1234 (24 jam)<br>+62 811-9999-7777 (WhatsApp)</p>
                                </div>
                            </div>
                            <div class="flex items-start gap-4">
                                <div class="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                    <span class="material-symbols-outlined">mail</span>
                                </div>
                                <div>
                                    <h4 class="font-headline-md text-headline-md">${t('contact.email')}</h4>
                                    <p class="text-on-surface-variant">halo@physiocare.id<br>marketing@physiocare.id</p>
                                </div>
                            </div>
                            <div class="flex items-start gap-4">
                                <div class="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                    <span class="material-symbols-outlined">schedule</span>
                                </div>
                                <div>
                                    <h4 class="font-headline-md text-headline-md">${t('contact.operatingHours')}</h4>
                                    <p class="text-on-surface-variant">${t('contact.hoursWeek')}<br>${t('contact.hoursSunday')}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="bg-surface-muted p-8 rounded-2xl border border-outline-variant/30">
                        <h3 class="font-headline-md text-headline-md mb-6">${t('contact.sendMessage')}</h3>
                        <form id="contact-form" class="space-y-4">
                            <div>
                                <label class="block font-button-text text-button-text text-on-surface-variant mb-2" for="c-name">${t('contact.fullName')}</label>
                                <input class="w-full px-4 py-3 bg-clinical-white border border-outline-variant rounded-lg font-body-md focus-ring" id="c-name" type="text" placeholder="${t('contact.namePlaceholder')}" required>
                            </div>
                            <div>
                                <label class="block font-button-text text-button-text text-on-surface-variant mb-2" for="c-email">${t('contact.email')}</label>
                                <input class="w-full px-4 py-3 bg-clinical-white border border-outline-variant rounded-lg font-body-md focus-ring" id="c-email" type="email" placeholder="${t('contact.emailPlaceholder')}" required>
                            </div>
                            <div>
                                <label class="block font-button-text text-button-text text-on-surface-variant mb-2" for="c-subject">${t('contact.subject')}</label>
                                <select class="w-full px-4 py-3 bg-clinical-white border border-outline-variant rounded-lg font-body-md focus-ring" id="c-subject">
                                    <option>${t('contact.subInfo')}</option>
                                    <option>${t('contact.subPartnership')}</option>
                                    <option>${t('contact.subFeedback')}</option>
                                    <option>${t('contact.subOther')}</option>
                                </select>
                            </div>
                            <div>
                                <label class="block font-button-text text-button-text text-on-surface-variant mb-2" for="c-message">${t('contact.message')}</label>
                                <textarea class="w-full px-4 py-3 bg-clinical-white border border-outline-variant rounded-lg font-body-md focus-ring h-32 resize-none" id="c-message" placeholder="${t('contact.messagePlaceholder')}" required></textarea>
                            </div>
                            <button type="submit" class="w-full py-4 bg-primary text-on-primary rounded-xl font-button-text text-button-text hover:bg-primary-container transition-all shadow-lg flex items-center justify-center gap-2">
                                <span class="material-symbols-outlined">send</span>
                                ${t('contact.send')}
                            </button>
                        </form>
                        <div id="contact-success" class="hidden mt-4 p-4 bg-success-green/10 border border-success-green/30 rounded-lg text-success-green font-bold text-center">
                            ${t('contact.success')}
                        </div>
                    </div>
                </div>
            </section>
        </main>
        ${Footer.render()}
        `;
    },

    init() {
        const form = document.getElementById('contact-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                const success = document.getElementById('contact-success');
                if (success) success.classList.remove('hidden');
                form.reset();
                setTimeout(() => {
                    if (success) success.classList.add('hidden');
                }, 4000);
            });
        }
    }
};

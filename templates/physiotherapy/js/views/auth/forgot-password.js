/* ============================================
   PhysioCare - Forgot Password View
   ============================================ */

const ForgotPasswordView = {
    /**
     * Render the forgot password page
     */
async render() {
        return `
        <div class="min-h-screen bg-background flex items-center justify-center px-6 py-12">
        <div class="w-full max-w-md">
            <a href="#/" class="flex items-center gap-3 mb-10 justify-center">
                <span class="material-symbols-outlined text-primary text-[40px]" style="font-variation-settings: 'FILL' 1;">medical_services</span>
                <span class="font-headline-md text-headline-md font-bold text-primary">PhysioCare</span>
            </a>
            <div class="bg-clinical-white rounded-2xl shadow-xl border border-outline-variant/30 p-8">
                <div class="text-center mb-8">
                    <div class="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center text-secondary mx-auto mb-4">
                        <span class="material-symbols-outlined text-[36px]">lock_reset</span>
                    </div>
                    <h1 class="font-headline-md text-headline-md text-on-surface mb-2">${t('forgot.title')}</h1>
                    <p class="font-body-md text-body-md text-on-surface-variant">
                        ${t('forgot.sub')}
                    </p>
                </div>
                <div id="forgot-success" class="hidden mb-6 p-4 bg-success-green/10 border border-success-green/30 rounded-lg text-success-green font-bold text-center">
                    ${t('forgot.success')}
                </div>
                <form id="forgot-form" class="space-y-6">
                    <div class="space-y-2">
                        <label class="block font-button-text text-button-text text-on-surface-variant" for="forgot-email">${t('forgot.email')}</label>
                        <div class="relative">
                            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span class="material-symbols-outlined text-outline text-xl">mail</span>
                            </div>
                            <input class="block w-full pl-10 pr-3 py-3 bg-surface-bright border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface placeholder:text-outline-variant focus-ring transition-all" id="forgot-email" name="email" placeholder="name@example.com" required="" type="email">
                        </div>
                    </div>
                    <button class="w-full bg-primary hover:bg-on-primary-fixed-variant text-white font-button-text text-button-text py-4 px-6 rounded-lg shadow-md hover:shadow-lg transform active:scale-[0.98] transition-all" type="submit">
                        ${t('forgot.send')}
                    </button>
                </form>
                <div class="mt-6 text-center">
                    <a class="text-primary font-button-text hover:underline decoration-2 underline-offset-4 flex items-center justify-center gap-2" href="#/login">
                        <span class="material-symbols-outlined text-lg">arrow_back</span>
                        ${t('forgot.backToLogin')}
                    </a>
                </div>
            </div>
            <p class="mt-8 text-center text-sm text-on-surface-variant">
                ${t('forgot.needHelp')} <a class="text-primary hover:underline" href="#/contact">${t('forgot.contactUs')}</a>
            </p>
</div>
        </div>
        `;
    },

    init() {
        const form = document.getElementById('forgot-form');
        if (!form) return;

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const success = document.getElementById('forgot-success');
            if (success) success.classList.remove('hidden');
            form.reset();
            setTimeout(() => {
                if (success) success.classList.add('hidden');
            }, 5000);
        });
    }
};

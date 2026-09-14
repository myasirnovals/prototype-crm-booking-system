/* ============================================
   PhysioCare - Register View
   ============================================ */

const RegisterView = {
    /**
     * Render the register page
     */
async render() {
        return `
        <div class="min-h-screen flex items-stretch overflow-hidden">
        <section class="hidden lg:flex lg:w-1/2 relative bg-primary-container overflow-hidden items-center justify-center p-section-padding-desktop">
            <div class="relative z-10 w-full max-w-lg text-white">
                <div class="mb-12">
                    <div class="flex items-center gap-3 mb-6">
                        <div class="w-12 h-12 bg-clinical-white rounded-xl flex items-center justify-center text-primary shadow-lg">
                            <span class="material-symbols-outlined text-[32px]" style="font-variation-settings: 'FILL' 1;">medical_services</span>
                        </div>
                        <span class="font-headline-md text-headline-md font-bold tracking-tight text-white">PhysioCare</span>
                    </div>
                    <h1 class="font-headline-lg text-headline-lg mb-4 leading-tight">${t('register.title')}</h1>
                    <p class="font-body-lg text-body-lg text-primary-fixed opacity-90">${t('register.sub')}</p>
                </div>
                <div class="bg-clinical-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
                    <div class="flex items-center gap-4 mb-4">
                        <div class="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container">
                            <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">verified</span>
                        </div>
                        <div>
                            <p class="font-button-text text-button-text text-white">${t('register.freeAssessment')}</p>
                            <p class="font-label-sm text-label-sm text-primary-fixed">${t('register.noCommitment')}</p>
                        </div>
                    </div>
                    <p class="text-sm text-primary-fixed opacity-90">${t('register.specialistDesc')}</p>
                </div>
            </div>
            <div class="absolute bottom-0 right-0 w-64 h-64 bg-secondary-container/20 blur-[120px] rounded-full translate-x-1/2 translate-y-1/2"></div>
            <div class="absolute top-0 left-0 w-48 h-48 bg-primary/30 blur-[80px] rounded-full -translate-x-1/2 -translate-y-1/2"></div>
        </section>
        <main class="w-full lg:w-1/2 bg-clinical-white flex flex-col justify-center px-6 md:px-16 lg:px-24 py-12">
            <div class="max-w-md w-full mx-auto">
                <div class="flex lg:hidden items-center gap-2 mb-10">
                    <span class="material-symbols-outlined text-primary text-3xl">medical_services</span>
                    <span class="font-headline-md text-headline-md font-bold text-primary">PhysioCare</span>
                </div>
                <div class="mb-10">
                    <h2 class="font-headline-lg-mobile text-headline-lg-mobile md:font-headline-md md:text-headline-md text-on-surface mb-2">${t('register.createAccount')}</h2>
                    <p class="font-body-md text-body-md text-on-surface-variant">${t('register.joinSub')}</p>
                </div>
                <div id="register-error" class="hidden mb-6 p-4 bg-error-container border border-error/30 rounded-lg text-error flex items-center gap-2">
                    <span class="material-symbols-outlined">error</span>
                    <span id="register-error-msg"></span>
                </div>
                <form id="register-form" class="space-y-5">
                    <div class="space-y-2">
                        <label class="block font-button-text text-button-text text-on-surface-variant" for="reg-name">${t('register.fullName')}</label>
                        <div class="relative">
                            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span class="material-symbols-outlined text-outline text-xl">person</span>
                            </div>
                            <input class="block w-full pl-10 pr-3 py-3 bg-surface-bright border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface placeholder:text-outline-variant focus-ring transition-all" id="reg-name" name="name" placeholder="${t('register.namePlaceholder')}" required="" type="text">
                        </div>
                    </div>
                    <div class="space-y-2">
                        <label class="block font-button-text text-button-text text-on-surface-variant" for="reg-email">${t('login.email')}</label>
                        <div class="relative">
                            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span class="material-symbols-outlined text-outline text-xl">mail</span>
                            </div>
                            <input class="block w-full pl-10 pr-3 py-3 bg-surface-bright border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface placeholder:text-outline-variant focus-ring transition-all" id="reg-email" name="email" placeholder="name@example.com" required="" type="email">
                        </div>
                    </div>
                    <div class="space-y-2">
                        <label class="block font-button-text text-button-text text-on-surface-variant" for="reg-password">${t('register.password')}</label>
                        <div class="relative">
                            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span class="material-symbols-outlined text-outline text-xl">lock</span>
                            </div>
                            <input class="block w-full pl-10 pr-10 py-3 bg-surface-bright border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface placeholder:text-outline-variant focus-ring transition-all" id="reg-password" name="password" placeholder="${t('register.passwordPlaceholder')}" required="" type="password" minlength="8">
                            <button class="absolute inset-y-0 right-0 pr-3 flex items-center text-outline hover:text-primary transition-colors" type="button" id="toggle-reg-password">
                                <span class="material-symbols-outlined text-xl">visibility</span>
                            </button>
                        </div>
                    </div>
                    <div class="space-y-2">
                        <label class="block font-button-text text-button-text text-on-surface-variant" for="reg-password2">${t('register.confirm')}</label>
                        <div class="relative">
                            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span class="material-symbols-outlined text-outline text-xl">lock</span>
                            </div>
                            <input class="block w-full pl-10 pr-3 py-3 bg-surface-bright border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface placeholder:text-outline-variant focus-ring transition-all" id="reg-password2" name="password2" placeholder="${t('register.confirmPlaceholder')}" required="" type="password">
                        </div>
                    </div>
                    <div class="flex items-start">
                        <input class="h-4 w-4 text-primary border-outline-variant rounded focus:ring-primary mt-1" id="reg-terms" name="terms" type="checkbox" required="">
                        <label class="ml-2 block font-body-md text-body-md text-on-surface-variant" for="reg-terms">
                            ${t('register.agree')} <a class="text-primary hover:underline" href="#">${t('register.termsAndConditions')}</a> ${t('register.and')} <a class="text-primary hover:underline" href="#">${t('register.privacyPolicy')}</a>
                        </label>
                    </div>
                    <button class="w-full bg-primary hover:bg-on-primary-fixed-variant text-white font-button-text text-button-text py-4 px-6 rounded-lg shadow-md hover:shadow-lg transform active:scale-[0.98] transition-all flex items-center justify-center gap-2 group" type="submit">
                        ${t('register.createAccount')}
                        <span class="material-symbols-outlined text-xl group-hover:translate-x-1 transition-transform">arrow_forward</span>
                    </button>
                </form>
                <p class="mt-8 text-center font-body-md text-body-md text-on-surface-variant">
                    ${t('register.alreadyHave')}
                    <a class="text-primary font-button-text hover:underline decoration-2 underline-offset-4" href="#/login">${t('register.signIn')}</a>
                </p>
                <div class="flex flex-col items-center gap-4 border-t border-surface-muted mt-8 pt-8">
                    <div class="flex items-center gap-6">
                        <div class="flex items-center gap-1 text-on-surface-variant">
                            <span class="material-symbols-outlined text-sm">lock</span>
                            <span class="font-label-sm text-label-sm">${t('register.hipaa')}</span>
                        </div>
                        <div class="flex items-center gap-1 text-on-surface-variant">
                            <span class="material-symbols-outlined text-sm">verified_user</span>
                            <span class="font-label-sm text-label-sm">${t('register.secureData')}</span>
                        </div>
                    </div>
                </div>
            </div>
</main>
        </div>
        `;
    },

    init() {
        const form = document.getElementById('register-form');
        if (!form) return;

        const togglePassword = document.getElementById('toggle-reg-password');
        if (togglePassword) {
            togglePassword.addEventListener('click', () => {
                const passwordInput = document.getElementById('reg-password');
                const icon = togglePassword.querySelector('.material-symbols-outlined');
                if (passwordInput.type === 'password') {
                    passwordInput.type = 'text';
                    icon.textContent = 'visibility_off';
                } else {
                    passwordInput.type = 'password';
                    icon.textContent = 'visibility';
                }
            });
        }

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('reg-name').value;
            const email = document.getElementById('reg-email').value;
            const password = document.getElementById('reg-password').value;
            const password2 = document.getElementById('reg-password2').value;
            const errorBox = document.getElementById('register-error');
            const errorMsg = document.getElementById('register-error-msg');

            if (password !== password2) {
                errorBox.classList.remove('hidden');
                errorMsg.textContent = t('register.pwMismatch');
                setTimeout(() => errorBox.classList.add('hidden'), 4000);
                return;
            }

            const result = await UserModel.register(name, email, password);
            if (result.error) {
                errorBox.classList.remove('hidden');
                errorMsg.textContent = result.error;
                setTimeout(() => errorBox.classList.add('hidden'), 4000);
            } else {
                User.setCurrentUser(result.user);
                router.navigate('/patient/dashboard');
            }
        });
    }
};

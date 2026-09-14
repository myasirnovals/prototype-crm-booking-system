/* ============================================
   PhysioCare - Login View (Patient Portal)
   ============================================ */

const LoginView = {
    /**
     * Render the login/sign-in page
     */
    async render() {
return `
        <div class="min-h-screen flex items-stretch overflow-hidden">
        <!-- Split Screen: Left Side (Visual/Brand) -->
        <section class="hidden lg:flex lg:w-1/2 relative bg-primary-container overflow-hidden items-center justify-center p-section-padding-desktop">
            <div class="relative z-10 w-full max-w-lg text-white">
                <div class="mb-12">
                    <div class="flex items-center gap-3 mb-6">
                        <div class="w-12 h-12 bg-clinical-white rounded-xl flex items-center justify-center text-primary shadow-lg">
                            <span class="material-symbols-outlined text-[32px]" style="font-variation-settings: 'FILL' 1;">medical_services</span>
                        </div>
                        <span class="font-headline-md text-headline-md font-bold tracking-tight text-white">PhysioCare</span>
                    </div>
                    <h1 class="font-headline-lg text-headline-lg mb-4 leading-tight">${t('login.title')}</h1>
                    <p class="font-body-lg text-body-lg text-primary-fixed opacity-90">${t('login.sub')}</p>
                </div>
                <div class="bg-clinical-white/10 backdrop-blur-md rounded-xl p-stack-md border border-white/20 animate-subtle-float">
                    <div class="flex items-center gap-4 mb-3">
                        <div class="w-10 h-10 rounded-full overflow-hidden border-2 border-primary-fixed-dim bg-clinical-white/20"></div>
                        <div>
                            <p class="font-button-text text-button-text text-white">Dr. Marcus Chen</p>
                            <p class="font-label-sm text-label-sm text-primary-fixed">${t('login.leadPhysio')}</p>
                        </div>
                    </div>
                    <p class="italic font-body-md text-body-md text-primary-fixed">${t('login.quote')}</p>
                </div>
            </div>
            <div class="absolute bottom-0 right-0 w-64 h-64 bg-secondary-container/20 blur-[120px] rounded-full translate-x-1/2 translate-y-1/2"></div>
            <div class="absolute top-0 left-0 w-48 h-48 bg-primary/30 blur-[80px] rounded-full -translate-x-1/2 -translate-y-1/2"></div>
        </section>
        <!-- Split Screen: Right Side (Login Form) -->
        <main class="w-full lg:w-1/2 bg-clinical-white flex flex-col justify-center px-6 md:px-16 lg:px-24 py-12">
            <div class="max-w-md w-full mx-auto">
                <div class="flex lg:hidden items-center gap-2 mb-10">
                    <span class="material-symbols-outlined text-primary text-3xl">medical_services</span>
                    <span class="font-headline-md text-headline-md font-bold text-primary">PhysioCare</span>
                </div>
                <div class="mb-10">
                    <h2 class="font-headline-lg-mobile text-headline-lg-mobile md:font-headline-md md:text-headline-md text-on-surface mb-2">${t('login.welcomeBack')}</h2>
                    <p class="font-body-md text-body-md text-on-surface-variant">${t('login.welcomeSub')}</p>
                </div>
                <div id="login-error" class="hidden mb-6 p-4 bg-error-container border border-error/30 rounded-lg text-error flex items-center gap-2">
                    <span class="material-symbols-outlined">error</span>
                    <span id="login-error-msg"></span>
                </div>
                <!-- Demo Credentials Info -->
                <div class="mb-6 p-3 bg-primary/10 border border-primary/20 rounded-lg flex items-start gap-2 text-sm text-primary">
                    <span class="material-symbols-outlined text-[18px]">info</span>
                    <div>
                        <strong>Demo Credentials (Patient):</strong><br>
                        Email: <code>james@example.com</code><br>
                        Password: <code>password123</code>
                    </div>
                </div>
                <form id="login-form" class="space-y-6">
                    <div class="space-y-2">
                        <label class="block font-button-text text-button-text text-on-surface-variant" for="email">${t('login.email')}</label>
                        <div class="relative">
                            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span class="material-symbols-outlined text-outline text-xl">mail</span>
                            </div>
                            <input class="block w-full pl-10 pr-3 py-3 bg-surface-bright border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface placeholder:text-outline-variant focus-ring transition-all" id="login-email" name="email" placeholder="name@example.com" required="" type="email" value="james@example.com">
                        </div>
                    </div>
                    <div class="space-y-2">
                        <div class="flex justify-between items-center">
                            <label class="block font-button-text text-button-text text-on-surface-variant" for="password">${t('login.password')}</label>
                            <a class="font-label-sm text-label-sm text-primary hover:text-secondary transition-colors" href="#/forgot-password">${t('login.forgot')}</a>
                        </div>
                        <div class="relative">
                            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span class="material-symbols-outlined text-outline text-xl">lock</span>
                            </div>
                            <input class="block w-full pl-10 pr-10 py-3 bg-surface-bright border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface placeholder:text-outline-variant focus-ring transition-all" id="login-password" name="password" placeholder="••••••••" required="" type="password" value="password123">
                            <button class="absolute inset-y-0 right-0 pr-3 flex items-center text-outline hover:text-primary transition-colors" type="button" id="toggle-password">
                                <span class="material-symbols-outlined text-xl">visibility</span>
                            </button>
                        </div>
                    </div>
                    <div class="flex items-center">
                        <input class="h-4 w-4 text-primary border-outline-variant rounded focus:ring-primary" id="remember-me" name="remember-me" type="checkbox">
                        <label class="ml-2 block font-body-md text-body-md text-on-surface-variant" for="remember-me">${t('login.remember')}</label>
                    </div>
                    <button class="w-full bg-primary hover:bg-on-primary-fixed-variant text-white font-button-text text-button-text py-4 px-6 rounded-lg shadow-md hover:shadow-lg transform active:scale-[0.98] transition-all flex items-center justify-center gap-2 group" type="submit">
                        ${t('login.signIn')}
                        <span class="material-symbols-outlined text-xl group-hover:translate-x-1 transition-transform">arrow_forward</span>
                    </button>
                </form>
                <div class="mt-8 relative">
                    <div aria-hidden="true" class="absolute inset-0 flex items-center">
                        <div class="w-full border-t border-outline-variant"></div>
                    </div>
                    <div class="relative flex justify-center text-label-sm font-label-sm uppercase">
                        <span class="px-4 bg-clinical-white text-on-surface-variant">${t('login.orContinue')}</span>
                    </div>
                </div>
                <div class="mt-8 grid grid-cols-2 gap-4">
                    <button class="flex items-center justify-center px-4 py-3 border border-outline-variant rounded-lg hover:bg-surface-muted transition-colors font-button-text text-button-text text-on-surface">
                        <svg class="w-5 h-5 mr-2" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"></path>
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
                        </svg>
                        Google
                    </button>
                    <button class="flex items-center justify-center px-4 py-3 border border-outline-variant rounded-lg hover:bg-surface-muted transition-colors font-button-text text-button-text text-on-surface">
                        <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z"></path>
                        </svg>
                        Facebook
                    </button>
                </div>
                <p class="mt-10 text-center font-body-md text-body-md text-on-surface-variant">
                    ${t('login.newTo')}
                    <a class="text-primary font-button-text hover:underline decoration-2 underline-offset-4" href="#/register">${t('login.createAccount')}</a>
                </p>
                <div class="flex flex-col items-center gap-4 border-t border-surface-muted mt-12 pt-10">
                    <div class="flex items-center gap-6">
                        <div class="flex items-center gap-1 text-on-surface-variant">
                            <span class="material-symbols-outlined text-sm">lock</span>
                            <span class="font-label-sm text-label-sm">${t('login.hipaa')}</span>
                        </div>
                        <div class="flex items-center gap-1 text-on-surface-variant">
                            <span class="material-symbols-outlined text-sm">verified_user</span>
                            <span class="font-label-sm text-label-sm">${t('login.secureData')}</span>
                        </div>
                    </div>
                    <div class="flex gap-4">
                        <a class="font-label-sm text-label-sm text-outline hover:text-primary transition-colors" href="#">${t('login.privacy')}</a>
                        <a class="font-label-sm text-label-sm text-outline hover:text-primary transition-colors" href="#">${t('login.terms')}</a>
                    </div>
                </div>
            </div>
</main>
        </div>
        `;
    },

    init() {
        const form = document.getElementById('login-form');
        const togglePassword = document.getElementById('toggle-password');
        if (!form) return;

        // Toggle password visibility
        if (togglePassword) {
            togglePassword.addEventListener('click', () => {
                const passwordInput = document.getElementById('login-password');
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

        // Form submit
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            const errorBox = document.getElementById('login-error');
            const errorMsg = document.getElementById('login-error-msg');

            const user = await UserModel.authenticate(email, password);

            if (user) {
                User.setCurrentUser(user);
                if (user.role === 'admin') {
                    router.navigate('/admin/dashboard');
                } else {
                    router.navigate('/patient/dashboard');
                }
            } else {
                errorBox.classList.remove('hidden');
                errorMsg.textContent = t('login.error');
                setTimeout(() => errorBox.classList.add('hidden'), 4000);
            }
        });

        // Validation visual feedback
        document.querySelectorAll('input').forEach(input => {
            input.addEventListener('blur', () => {
                if (input.value && input.checkValidity()) {
                    input.classList.add('border-success-green');
                    input.classList.remove('border-outline-variant');
                } else if (input.value) {
                    input.classList.add('border-emergency-red');
                    input.classList.remove('border-outline-variant');
                }
            });
            input.addEventListener('focus', () => {
                input.classList.remove('border-success-green', 'border-emergency-red');
                input.classList.add('border-outline-variant');
            });
        });
    }
};

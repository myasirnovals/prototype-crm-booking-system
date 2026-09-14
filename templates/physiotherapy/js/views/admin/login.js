/* ============================================
   PhysioCare - Admin Login View
   ============================================ */

const AdminLoginView = {
    /**
     * Render the admin login page
     */
async render() {
        return `
        <div class="min-h-screen bg-background flex items-center justify-center px-6 py-12">
        <div class="w-full max-w-md">
            <a href="#/" class="flex items-center gap-3 mb-10 justify-center">
                <div class="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-clinical-white shadow-lg">
                    <span class="material-symbols-outlined text-[32px]" style="font-variation-settings: 'FILL' 1;">medical_services</span>
                </div>
                <div class="text-left">
                    <span class="font-headline-md text-headline-md font-bold text-primary block">PhysioAdmin Pro</span>
                    <span class="font-label-sm text-label-sm text-on-surface-variant">Management System</span>
                </div>
            </a>
            <div class="bg-clinical-white rounded-2xl shadow-xl border border-outline-variant/30 p-8">
                <div class="text-center mb-8">
                    <div class="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center text-secondary mx-auto mb-4">
                        <span class="material-symbols-outlined text-[36px]">admin_panel_settings</span>
                    </div>
                    <h1 class="font-headline-md text-headline-md text-on-surface mb-2">${t('adminLogin.title')}</h1>
                    <p class="font-body-md text-body-md text-on-surface-variant">
                        ${t('adminLogin.sub')}
                    </p>
                </div>
                <div id="admin-login-error" class="hidden mb-6 p-4 bg-error-container border border-error/30 rounded-lg text-error flex items-center gap-2">
                    <span class="material-symbols-outlined">error</span>
                    <span id="admin-login-error-msg"></span>
                </div>
                <!-- Demo Credentials Info -->
                <div class="mb-6 p-3 bg-primary/10 border border-primary/20 rounded-lg flex items-start gap-2 text-sm text-primary">
                    <span class="material-symbols-outlined text-[18px]">info</span>
                    <div>
                        <strong>Demo Credentials (Admin):</strong><br>
                        Email: <code>admin@physiocare.com</code><br>
                        Password: <code>admin123</code>
                    </div>
                </div>
                <form id="admin-login-form" class="space-y-6">
                    <div class="space-y-2">
                        <label class="block font-button-text text-button-text text-on-surface-variant" for="admin-email">${t('adminLogin.emailLabel')}</label>
                        <div class="relative">
                            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span class="material-symbols-outlined text-outline text-xl">mail</span>
                            </div>
                            <input class="block w-full pl-10 pr-3 py-3 bg-surface-bright border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface placeholder:text-outline-variant focus-ring transition-all" id="admin-email" name="email" placeholder="admin@physiocare.com" required="" type="email" value="admin@physiocare.com">
                        </div>
                    </div>
                    <div class="space-y-2">
                        <div class="flex justify-between items-center">
                            <label class="block font-button-text text-button-text text-on-surface-variant" for="admin-password">${t('adminLogin.password')}</label>
                            <a class="font-label-sm text-label-sm text-primary hover:text-secondary transition-colors" href="#/forgot-password">${t('adminLogin.forgot')}</a>
                        </div>
                        <div class="relative">
                            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span class="material-symbols-outlined text-outline text-xl">lock</span>
                            </div>
                            <input class="block w-full pl-10 pr-10 py-3 bg-surface-bright border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface placeholder:text-outline-variant focus-ring transition-all" id="admin-password" name="password" placeholder="••••••••" required="" type="password" value="admin123">
                            <button class="absolute inset-y-0 right-0 pr-3 flex items-center text-outline hover:text-primary transition-colors" type="button" id="admin-toggle-password">
                                <span class="material-symbols-outlined text-xl">visibility</span>
                            </button>
                        </div>
                    </div>
                    <button class="w-full bg-primary hover:bg-on-primary-fixed-variant text-white font-button-text text-button-text py-4 px-6 rounded-lg shadow-md hover:shadow-lg transform active:scale-[0.98] transition-all" type="submit">
                        ${t('adminLogin.signIn')}
                    </button>
                </form>
            </div>
            <p class="mt-8 text-center text-sm text-on-surface-variant">
                <a class="text-primary hover:underline" href="#/">${t('adminLogin.backToWebsite')}</a>
            </p>
</div>
        </div>
        `;
    },

    init() {
        const form = document.getElementById('admin-login-form');
        const togglePassword = document.getElementById('admin-toggle-password');
        if (!form) return;

        if (togglePassword) {
            togglePassword.addEventListener('click', () => {
                const passwordInput = document.getElementById('admin-password');
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
            const email = document.getElementById('admin-email').value;
            const password = document.getElementById('admin-password').value;
            const errorBox = document.getElementById('admin-login-error');
            const errorMsg = document.getElementById('admin-login-error-msg');

            const user = await UserModel.authenticate(email, password);

            if (user && user.role === 'admin') {
                User.setCurrentUser(user);
                router.navigate('/admin/dashboard');
            } else {
                errorBox.classList.remove('hidden');
                errorMsg.textContent = t('adminLogin.error');
                setTimeout(() => errorBox.classList.add('hidden'), 4000);
            }
        });
    }
};

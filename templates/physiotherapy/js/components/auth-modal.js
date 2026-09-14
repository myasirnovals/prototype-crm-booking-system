/* ============================================
   PhysioCare - In-Place Authentication Modal
   Matches the SPA framework: prompts guest to log in
   or register right before payment execution without
   losing current booking state.
   ============================================ */

window._physioAuthCallback = null;

function ensurePhysioAuthModal() {
    let modal = document.getElementById('physio-login-modal');
    if (modal) return modal;

    modal = document.createElement('div');
    modal.id = 'physio-login-modal';
    modal.className = 'fixed inset-0 z-[9999] flex items-center justify-center p-4';
    modal.style.display = 'none';

    modal.innerHTML = `
        <!-- Backdrop Blur -->
        <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onclick="closePhysioAuthModal()"></div>

        <!-- Modal Card -->
        <div class="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-2xl border border-outline-variant/30 overflow-hidden font-sans transform transition-all p-6 sm:p-8">
            <!-- Close Button -->
            <button onclick="closePhysioAuthModal()" class="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-all">
                <span class="material-symbols-outlined text-[22px]">close</span>
            </button>

            <!-- Brand Header -->
            <div class="text-center mb-6">
                <div class="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mb-3 shadow-xs">
                    <span class="material-symbols-outlined text-[28px]" style="font-variation-settings: 'FILL' 1;">medical_services</span>
                </div>
                <h3 class="text-xl font-bold text-slate-900 font-headline">PhysioCare</h3>
                <p class="text-xs font-semibold text-primary uppercase tracking-widest mt-0.5">Clinical Rehabilitation</p>
            </div>

            <div class="mb-5 text-center">
                <h4 class="text-lg font-bold text-slate-800">Sign In to Confirm Booking</h4>
                <p class="text-xs text-slate-500 mt-1">Please sign in to finalize your reservation and track your treatment plan.</p>
            </div>

            <!-- Error Banner -->
            <div id="physio-modal-error" class="hidden mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2 font-medium">
                <span class="material-symbols-outlined text-[18px]">error</span>
                <span id="physio-modal-error-text">Invalid credentials. Please try again.</span>
            </div>

            <!-- Form -->
            <form id="physio-modal-login-form" class="space-y-4">
                <div>
                    <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Email Address</label>
                    <div class="relative flex items-center">
                        <span class="material-symbols-outlined absolute left-3 text-slate-400 text-[18px] pointer-events-none">mail</span>
                        <input id="physio-modal-email" type="email" required placeholder="your@email.com" value="james@example.com"
                            class="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all">
                    </div>
                </div>

                <div>
                    <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Password</label>
                    <div class="relative flex items-center">
                        <span class="material-symbols-outlined absolute left-3 text-slate-400 text-[18px] pointer-events-none">lock</span>
                        <input id="physio-modal-password" type="password" required placeholder="••••••••" value="password123"
                            class="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all">
                    </div>
                </div>

                <button type="submit" class="w-full py-3 px-4 rounded-xl bg-primary text-white font-bold text-sm shadow-md hover:bg-primary/90 active:scale-98 transition-all flex items-center justify-center gap-2">
                    <span class="material-symbols-outlined text-[18px]">lock_open</span>
                    Sign In &amp; Proceed to Payment
                </button>
            </form>

            <!-- Quick Demo Sign-In Box -->
            <div class="mt-4 pt-4 border-t border-slate-100 flex flex-col gap-2">
                <button type="button" onclick="handlePhysioModalDemoLogin()"
                    class="w-full py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center justify-center gap-1.5">
                    <span class="material-symbols-outlined text-amber-500 text-[18px]">bolt</span>
                    Instant Demo Sign-In (James Miller)
                </button>
                <p class="text-[11px] text-center text-slate-400">Default demo patient credentials pre-filled.</p>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    const form = modal.querySelector('#physio-modal-login-form');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('physio-modal-email').value;
        const password = document.getElementById('physio-modal-password').value;
        const errorBox = document.getElementById('physio-modal-error');
        const errorText = document.getElementById('physio-modal-error-text');

        const user = await UserModel.authenticate(email, password);
        if (user) {
            User.setCurrentUser(user);
            closePhysioAuthModal();
            if (window._physioAuthCallback) {
                const cb = window._physioAuthCallback;
                window._physioAuthCallback = null;
                cb(user);
            }
        } else {
            errorBox.classList.remove('hidden');
            errorText.textContent = 'Invalid email or password. Use demo account or check your input.';
            setTimeout(() => errorBox.classList.add('hidden'), 4000);
        }
    });

    return modal;
}

window.openPhysioAuthModal = function(callback) {
    window._physioAuthCallback = callback || null;
    const modal = ensurePhysioAuthModal();
    modal.style.display = 'flex';
};

window.closePhysioAuthModal = function() {
    const modal = document.getElementById('physio-login-modal');
    if (modal) modal.style.display = 'none';
};

window.handlePhysioModalDemoLogin = async function() {
    let user = await UserModel.authenticate('james@example.com', 'password123');
    if (!user) {
        user = {
            name: 'James Miller',
            email: 'james@example.com',
            role: 'patient',
            patientId: 'PC-8842',
            avatar: null
        };
    }
    User.setCurrentUser(user);
    closePhysioAuthModal();
    if (window._physioAuthCallback) {
        const cb = window._physioAuthCallback;
        window._physioAuthCallback = null;
        cb(user);
    }
};

/**
 * AuthModal.js — In-place authentication modal for NutriFlow.
 * Enables frictionless guest booking: guests choose service, dietitian, and schedule,
 * and are prompted to log in or register at the checkout / payment confirmation step.
 */

window._nutriAuthCallback = null;

export function ensureNutriAuthModal() {
  let modal = document.getElementById('nutriflow-login-modal');
  if (modal) return modal;

  modal = document.createElement('div');
  modal.id = 'nutriflow-login-modal';
  modal.className = 'fixed inset-0 z-[9999] flex items-center justify-center p-4';
  modal.style.display = 'none';

  modal.innerHTML = `
    <!-- Backdrop Blur -->
    <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onclick="closeNutriAuthModal()"></div>

    <!-- Modal Card -->
    <div class="relative z-10 w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden font-sans transform transition-all p-6 sm:p-8">
        <!-- Close Button -->
        <button onclick="closeNutriAuthModal()" class="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-all">
            <span class="material-symbols-outlined text-[22px]">close</span>
        </button>

        <!-- Brand Header -->
        <div class="text-center mb-6">
            <div class="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-50 text-primary mb-3 shadow-xs border border-emerald-100">
                <span class="material-symbols-outlined text-[28px]" style="font-variation-settings: 'FILL' 1;">eco</span>
            </div>
            <h3 class="text-xl font-bold text-slate-900 tracking-tight">NutriFlow</h3>
            <p class="text-xs font-semibold text-primary uppercase tracking-widest mt-0.5">Clinical Nutrition &amp; Dietetics</p>
        </div>

        <div class="mb-5 text-center">
            <h4 class="text-lg font-bold text-slate-800">Sign In to Confirm Booking</h4>
            <p class="text-xs text-slate-500 mt-1">Please log in to finalize your session reservation and connect with your specialist.</p>
        </div>

        <!-- Error Banner -->
        <div id="nutri-modal-error" class="hidden mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2 font-medium">
            <span class="material-symbols-outlined text-[18px]">error</span>
            <span id="nutri-modal-error-text">Invalid credentials. Please try again.</span>
        </div>

        <!-- Form -->
        <form id="nutri-modal-login-form" class="space-y-4">
            <div>
                <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Email Address</label>
                <div class="relative flex items-center">
                    <span class="material-symbols-outlined absolute left-3.5 text-slate-400 text-[18px] pointer-events-none">mail</span>
                    <input id="nutri-modal-email" type="email" required placeholder="your@email.com" value="sarah.j@email.com"
                        class="w-full pl-10 pr-3 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all">
                </div>
            </div>

            <div>
                <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Password</label>
                <div class="relative flex items-center">
                    <span class="material-symbols-outlined absolute left-3.5 text-slate-400 text-[18px] pointer-events-none">lock</span>
                    <input id="nutri-modal-password" type="password" required placeholder="••••••••" value="password123"
                        class="w-full pl-10 pr-3 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all">
                </div>
            </div>

            <button type="submit" class="w-full py-3 px-4 rounded-xl bg-primary text-white font-bold text-sm shadow-md hover:bg-[#005321] active:scale-98 transition-all flex items-center justify-center gap-2">
                <span class="material-symbols-outlined text-[18px]">lock_open</span>
                Sign In &amp; Proceed to Payment
            </button>
        </form>

        <!-- Quick Demo Sign-In Box -->
        <div class="mt-5 pt-4 border-t border-slate-100 flex flex-col gap-2">
            <button type="button" onclick="handleNutriModalDemoLogin()"
                class="w-full py-2.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition-all flex items-center justify-center gap-1.5 border border-emerald-200/60">
                <span class="material-symbols-outlined text-emerald-600 text-[18px]">bolt</span>
                Instant Demo Sign-In (Sarah Jenkins)
            </button>
            <p class="text-[11px] text-center text-slate-400">Pre-configured demo client profile.</p>
        </div>
    </div>
  `;

  document.body.appendChild(modal);

  const form = modal.querySelector('#nutri-modal-login-form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('nutri-modal-email').value;
    const password = document.getElementById('nutri-modal-password').value;

    if (email && password) {
      localStorage.setItem('nutriflow_client_logged', 'true');
      localStorage.setItem('nutriflow_client_logged_name', 'Sarah Jenkins');
      localStorage.setItem('nutriflow_client_email', email);
      closeNutriAuthModal();
      if (window._nutriAuthCallback) {
        const cb = window._nutriAuthCallback;
        window._nutriAuthCallback = null;
        cb({ name: 'Sarah Jenkins', email });
      }
    }
  });

  return modal;
}

window.openNutriAuthModal = function (callback) {
  window._nutriAuthCallback = callback || null;
  const modal = ensureNutriAuthModal();
  modal.style.display = 'flex';
};

window.closeNutriAuthModal = function () {
  const modal = document.getElementById('nutriflow-login-modal');
  if (modal) modal.style.display = 'none';
};

window.handleNutriModalDemoLogin = function () {
  localStorage.setItem('nutriflow_client_logged', 'true');
  localStorage.setItem('nutriflow_client_logged_name', 'Sarah Jenkins');
  localStorage.setItem('nutriflow_client_email', 'sarah.j@email.com');
  closeNutriAuthModal();
  if (window._nutriAuthCallback) {
    const cb = window._nutriAuthCallback;
    window._nutriAuthCallback = null;
    cb({ name: 'Sarah Jenkins', email: 'sarah.j@email.com' });
  }
};

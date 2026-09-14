/**
 * AuthModal.js — In-place authentication modal for Personal Trainer template.
 * Matches the SPA framework: allows visitors to choose date and time slot as a guest,
 * and prompts for login/registration at the final session confirmation step.
 */

window._ptAuthCallback = null;

export function ensurePtAuthModal() {
  let modal = document.getElementById('pt-login-modal');
  if (modal) return modal;

  modal = document.createElement('div');
  modal.id = 'pt-login-modal';
  modal.className = 'fixed inset-0 z-[9999] flex items-center justify-center p-4';
  modal.style.display = 'none';

  modal.innerHTML = `
    <!-- Backdrop Blur -->
    <div class="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity" onclick="closePtAuthModal()"></div>

    <!-- Modal Card -->
    <div class="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden font-sans transform transition-all p-6 sm:p-8">
        <!-- Close Button -->
        <button onclick="closePtAuthModal()" class="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-all">
            <span class="material-symbols-outlined text-[22px]">close</span>
        </button>

        <!-- Brand Header -->
        <div class="text-center mb-6">
            <div class="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-orange-50 text-[#ba4200] mb-3 shadow-xs border border-orange-200">
                <span class="material-symbols-outlined text-[28px]">fitness_center</span>
            </div>
            <h3 class="text-xl font-bold text-slate-900 tracking-tight font-headline">ElitePT</h3>
            <p class="text-xs font-semibold text-[#ba4200] uppercase tracking-widest mt-0.5">High Performance Coaching</p>
        </div>

        <div class="mb-5 text-center">
            <h4 class="text-lg font-bold text-slate-800">Sign In to Confirm Session</h4>
            <p class="text-xs text-slate-500 mt-1">Please sign in to confirm your training slot and sync with your personal coach.</p>
        </div>

        <!-- Error Banner -->
        <div id="pt-modal-error" class="hidden mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2 font-medium">
            <span class="material-symbols-outlined text-[18px]">error</span>
            <span id="pt-modal-error-text">Invalid credentials. Please try again.</span>
        </div>

        <!-- Form -->
        <form id="pt-modal-login-form" class="space-y-4">
            <div>
                <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Email Address</label>
                <div class="relative flex items-center">
                    <span class="material-symbols-outlined absolute left-3.5 text-slate-400 text-[18px] pointer-events-none">mail</span>
                    <input id="pt-modal-email" type="email" required placeholder="your@email.com" value="alex.runner@elitept.com"
                        class="w-full pl-10 pr-3 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all">
                </div>
            </div>

            <div>
                <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Password</label>
                <div class="relative flex items-center">
                    <span class="material-symbols-outlined absolute left-3.5 text-slate-400 text-[18px] pointer-events-none">lock</span>
                    <input id="pt-modal-password" type="password" required placeholder="••••••••" value="password123"
                        class="w-full pl-10 pr-3 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all">
                </div>
            </div>

            <button type="submit" class="w-full py-3 px-4 rounded-xl bg-primary hover:bg-[#8f3200] text-white font-bold text-sm shadow-md active:scale-98 transition-all flex items-center justify-center gap-2">
                <span class="material-symbols-outlined text-[18px]">lock_open</span>
                Sign In &amp; Confirm Session
            </button>
        </form>

        <!-- Quick Demo Sign-In Box -->
        <div class="mt-5 pt-4 border-t border-slate-100 flex flex-col gap-2">
            <button type="button" onclick="handlePtModalDemoLogin()"
                class="w-full py-2.5 px-3 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-900 text-xs font-bold transition-all flex items-center justify-center gap-1.5 border border-orange-200">
                <span class="material-symbols-outlined text-amber-600 text-[18px]">bolt</span>
                Instant Demo Sign-In (Alex Runner)
            </button>
            <p class="text-[11px] text-center text-slate-400">Pre-configured demo athlete account.</p>
        </div>
    </div>
  `;

  document.body.appendChild(modal);

  const form = modal.querySelector('#pt-modal-login-form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('pt-modal-email').value;
    const password = document.getElementById('pt-modal-password').value;

    if (email && password) {
      localStorage.setItem('elite_pt_role', 'client');
      localStorage.setItem('elite_pt_user_name', 'Alex Runner');
      localStorage.setItem('elite_pt_email', email);
      closePtAuthModal();
      if (window._ptAuthCallback) {
        const cb = window._ptAuthCallback;
        window._ptAuthCallback = null;
        cb();
      }
    }
  });

  return modal;
}

window.openPtAuthModal = function(callback) {
  window._ptAuthCallback = callback || null;
  const modal = ensurePtAuthModal();
  modal.style.display = 'flex';
};

window.closePtAuthModal = function() {
  const modal = document.getElementById('pt-login-modal');
  if (modal) modal.style.display = 'none';
};

window.handlePtModalDemoLogin = function() {
  localStorage.setItem('elite_pt_role', 'client');
  localStorage.setItem('elite_pt_user_name', 'Alex Runner');
  localStorage.setItem('elite_pt_email', 'alex.runner@elitept.com');
  closePtAuthModal();
  if (window._ptAuthCallback) {
    const cb = window._ptAuthCallback;
    window._ptAuthCallback = null;
    cb();
  }
};

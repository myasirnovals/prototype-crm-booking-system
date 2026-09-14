/**
 * App.js — Entry point utama aplikasi NutriFlow Client Portal.
 *
 * Menginisialisasi Core (Store, Router, Toast), Controllers, dan Views.
 * Dipanggil dari <script type="module" src="/src/mvc/App.js"></script> di index.html.
 *
 * SRS acuan: seluruh dokumen SRS-NutriFlow.md.
 */
import { Store } from './core/Store.js';
import { router } from './core/Router.js';
import { toast } from './core/Toast.js';
import { clientController } from './controllers/ClientController.js';
import { offlineQueue } from './core/OfflineQueue.js';

// Ekspos ke global untuk inline onclick handlers
window.Store = Store;
window.router = router;
window.toast = toast;

/**
 * Init — panggil setelah DOM siap.
 */
function initApp() {
  console.log('[NutriFlow MVC] Initializing app...');

  // 1. Bootstrap Store
  const store = Store.getInstance();
  store.loadFromStorage();

  // 2. Bootstrap Router
  router.init();

  // 3. Bootstrap Controller
  clientController.init();

  // 4. Bootstrap Toast
  toast.init();

  console.log('[NutriFlow MVC] App initialized successfully.');

  // 5. Handle DOM-based notification click outside
  document.addEventListener('click', (e) => {
    const dd = document.getElementById('client-notifications-dropdown');
    const btn = document.getElementById('client-notifications-btn');
    if (dd && !dd.classList.contains('hidden') && !dd.contains(e.target) && !btn?.contains(e.target)) {
      dd.classList.add('hidden');
    }
  });

  registerServiceWorker();
  setupPwaExperience();

  // 6. Expose utility functions to global scope for inline onclick compatibility
  window.navigateBackOrHome = () => {
    const prev = router.getPreviousView();
    router.navigate(prev || 'dashboard');
  };

  window.downloadLatestInvoicePDF = () => {
    toast.show('Invoice PDF download initiated (simulation).', 'success');
  };

  window.downloadProgressReportPDF = () => {
    toast.show('Progress report PDF export initiated (simulation).', 'success');
  };

  window.downloadInvoicePDF = (id, title, date, doc, price, method, duration, type) => {
    toast.show(`Invoice for "${title}" download initiated.`, 'success');
  };

  window.openChartZoomModal = (chartType) => {
    toast.show(`Zoom view for ${chartType} chart (simulation).`, 'info');
  };

  window.openClientFoodChatModal = () => {
    router.navigate('food-chat');
  };
}

/** Daftarkan PWA tanpa meng-cache data pengguna atau data medis. */
function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js').catch((error) => {
      console.warn('[NutriFlow PWA] service worker tidak dapat didaftarkan:', error);
    });
  }, { once: true });
}

/** UI PWA: install prompt, connectivity, dan status offline-sync. */
function setupPwaExperience() {
  let deferredInstallPrompt = null;
  const region = document.createElement('div');
  region.id = 'pwa-experience-region';
  region.className = 'fixed left-1/2 -translate-x-1/2 top-4 z-[60] w-[min(92vw,460px)] flex flex-col gap-2';
  region.setAttribute('aria-live', 'polite');
  document.body.appendChild(region);

  const renderConnectivity = () => {
    const count = offlineQueue.getAll().length;
    const existing = document.getElementById('pwa-connectivity-status');
    if (navigator.onLine && !count) { existing?.remove(); return; }
    const message = navigator.onLine
      ? `${count} saved item${count === 1 ? '' : 's'} synced successfully.`
      : `${count ? `${count} item${count === 1 ? '' : 's'} waiting to sync. ` : ''}You're offline — changes are saved on this device.`;
    const tone = navigator.onLine ? 'bg-emerald-700' : 'bg-slate-800';
    const html = `<div id="pwa-connectivity-status" class="${tone} text-white shadow-xl rounded-2xl px-4 py-3 text-xs font-semibold flex items-center gap-2"><span class="material-symbols-outlined text-base">${navigator.onLine ? 'cloud_done' : 'cloud_off'}</span><span>${message}</span></div>`;
    if (existing) existing.outerHTML = html;
    else region.insertAdjacentHTML('afterbegin', html);
    if (navigator.onLine && count) setTimeout(() => document.getElementById('pwa-connectivity-status')?.remove(), 3500);
  };

  window.addEventListener('offline', renderConnectivity);
  window.addEventListener('online', () => { offlineQueue.flush(); renderConnectivity(); });
  window.addEventListener('nutriflow:queue-change', renderConnectivity);
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredInstallPrompt = event;
    if (document.getElementById('pwa-install-banner')) return;
    region.insertAdjacentHTML('beforeend', `<div id="pwa-install-banner" class="bg-primary text-white shadow-xl rounded-2xl p-4 flex items-center gap-3"><span class="material-symbols-outlined text-2xl">install_mobile</span><div class="flex-1"><p class="font-bold text-sm">Install NutriFlow</p><p class="text-[11px] text-white/85">Access your nutrition plan faster from your home screen.</p></div><button id="pwa-install-action" class="bg-white text-primary font-bold text-xs px-3 py-2 rounded-xl">Install</button><button id="pwa-install-dismiss" class="text-white/80" aria-label="Dismiss install prompt">×</button></div>`);
    document.getElementById('pwa-install-action')?.addEventListener('click', async () => {
      await deferredInstallPrompt?.prompt();
      deferredInstallPrompt = null;
      document.getElementById('pwa-install-banner')?.remove();
    });
    document.getElementById('pwa-install-dismiss')?.addEventListener('click', () => document.getElementById('pwa-install-banner')?.remove());
  });
  renderConnectivity();
}

// Inisialisasi ketika DOM siap
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

export default { initApp };

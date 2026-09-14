/**
 * AdminApp.js — Entry point utama aplikasi NutriFlow Specialist Practitioner Portal.
 *
 * Menginisialisasi Core (Store, Router, Toast), Controllers, dan Views.
 *
 * SRS acuan: seluruh dokumen SRS-NutriFlow.md (Bagian Admin).
 */
import { Store } from '../core/Store.js';
import { router } from '../core/Router.js';
import { toast } from '../core/Toast.js';
import { adminController } from './controllers/AdminController.js';

// Ekspos ke global untuk inline onclick handlers (migrasi bertahap)
window.Store = Store;
window.router = router;
window.toast = toast;

function initAdminApp() {
  console.log('[NutriFlow Admin MVC] Initializing app...');

  // 1. Bootstrap Store
  const store = Store.getInstance();
  store.loadFromStorage();

  // 2. Bootstrap Router
  router.init();

  // 3. Bootstrap Controller
  adminController.init();

  // 4. Bootstrap Toast
  toast.init();

  console.log('[NutriFlow Admin MVC] App initialized successfully.');

  // Handle outside click for notifications
  document.addEventListener('click', (e) => {
    const dd = document.getElementById('admin-notifications-dropdown');
    const btn = document.getElementById('admin-notifications-btn');
    if (dd && !dd.classList.contains('hidden') && !dd.contains(e.target) && !btn?.contains(e.target)) {
      dd.classList.add('hidden');
    }
  });
}

// Inisialisasi ketika DOM siap
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAdminApp);
} else {
  initAdminApp();
}

export default { initAdminApp };

/**
 * Toast — Notifikasi kecil reusable untuk umpan balik user.
 * SRS acuan: FR-NOTIF-01 (panel notifikasi), NFR-05 (usability feedback).
 */
import { bus, EVENTS } from './EventBus.js';

export class Toast {
  /**
   * Tampilkan toast.
   * @param {string} message
   * @param {'success'|'error'|'info'} type
   */
  show(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    // Overwrite previous toast (hindari stacking)
    container.innerHTML = '';

    const toast = document.createElement('div');
    toast.className = 'p-4 rounded-xl shadow-lg text-white font-semibold text-xs flex items-center gap-3 transition-all duration-300 transform translate-y-4 opacity-0 border';

    if (type === 'success') toast.className += ' bg-[#006e2f] border-[#005321]';
    else if (type === 'error') toast.className += ' bg-red-600 border-red-800';
    else toast.className += ' bg-[#006a61] border-[#005049]';

    toast.innerHTML = `
      <span class="material-symbols-outlined text-[20px]" aria-hidden="true">${type === 'error' ? 'error' : 'check_circle'}</span>
      <span role="status">${message}</span>
    `;

    container.appendChild(toast);
    requestAnimationFrame(() => toast.classList.remove('translate-y-4', 'opacity-0'));
    setTimeout(() => {
      toast.classList.add('translate-y-[-10px]', 'opacity-0');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  /**
   * Init — bootstrap hook. Tidak ada setup khusus, disediakan agar
   * pemanggilan `toast.init()` pada App.js tidak error.
   */
  init() {
    return this;
  }

  success(message) {
    this.show(message, 'success');
  }

  error(message) {
    this.show(message, 'error');
  }

  info(message) {
    this.show(message, 'info');
  }
}

export const toast = new Toast();

// Daftarkan handler global agar module lain cukup `bus.emit(EVENTS.TOAST_SHOW, { message, type })`.
bus.on(EVENTS.TOAST_SHOW, ({ message, type }) => {
  toast.show(message, type || 'info');
});


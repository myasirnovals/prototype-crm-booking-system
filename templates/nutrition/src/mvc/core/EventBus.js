/**
 * EventBus — Pub/Sub sederhana untuk komunikasi antar layer MVC.
 * Model → View (perubahan data), Controller → Model (aksi user).
 */
export class EventBus {
  constructor() {
    this._events = new Map();
  }

  /**
   * Subscribe ke sebuah event.
   * @param {string} event
   * @param {Function} handler
   * @returns {Function} unsubscribe
   */
  on(event, handler) {
    if (!this._events.has(event)) {
      this._events.set(event, new Set());
    }
    this._events.get(event).add(handler);
    return () => this.off(event, handler);
  }

  /**
   * Unsubscribe handler dari sebuah event.
   */
  off(event, handler) {
    if (this._events.has(event)) {
      this._events.get(event).delete(handler);
    }
  }

  /**
   * Emit event dengan payload.
   * @param {string} event
   * @param {*} payload
   */
  emit(event, payload) {
    if (this._events.has(event)) {
      this._events.get(event).forEach((handler) => {
        try {
          handler(payload);
        } catch (err) {
          console.error(`[EventBus] handler error pada event "${event}":`, err);
        }
      });
    }
  }

  /** Hapus seluruh listener (dipakai saat reset app / test). */
  clear() {
    this._events.clear();
  }
}

// Singleton global agar semua modul berbagi bus yang sama.
export const bus = new EventBus();

// Nama-nama event terpusat agar tidak typo.
export const EVENTS = {
  STATE_CHANGED: 'state:changed',
  VIEW_CHANGED: 'view:changed',
  DATA_MEALS_UPDATED: 'data:meals-updated',
  DATA_APPOINTMENTS_UPDATED: 'data:appointments-updated',
  DATA_PROGRAM_UPDATED: 'data:program-updated',
  DATA_DIARY_UPDATED: 'data:diary-updated',
  AUTH_LOGGED_IN: 'auth:logged-in',
  AUTH_LOGGED_OUT: 'auth:logged-out',
  TOAST_SHOW: 'toast:show',
  MODAL_OPEN: 'modal:open',
  MODAL_CLOSE: 'modal:close',
};


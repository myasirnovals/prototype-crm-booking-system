/**
 * Store — Lapisan data terpusat (Model layer basis).
 *
 * Menyediakan state reaktif sederhana yang di-persist ke localStorage,
 * dengan API get/set/update/subscribe. Semua Model di aplikasi ini
 * menggunakan Store sebagai "satu sumber kebenaran" (single source of truth).
 *
 * Catatan kompatibilitas:
 * - API lama (get/set/update/remove/subscribe) dipertahankan untuk Model.
 * - API tambahan (getInstance/state/loadFromStorage/persist) melengkapi
 *   kebutuhan App.js & ClientController tanpa merusak kode yang ada.
 *
 * SRS acuan: §8 Model Data, §7.1 Arsitektur (Core Service layer).
 */
import { bus, EVENTS } from './EventBus.js';

const DEFAULT_NAMESPACE = 'nutriflow_store_v1';

// Kunci "bare" legacy (ditulis oleh admin.js / control-center.js / main.js lama)
// — disinkronkan ke namespace saat loadFromStorage agar Model membaca data sama.
const LEGACY_KEYS = [
  'nutriflow_clients',
  'nutriflow_client_logged',
  'nutriflow_client_logged_name',
  'nutriflow_logged_status',
  'nutriflow_client_meal_plans',
  'nutriflow_programs_draft',
  'nutriflow_food_library',
  'nutriflow_program_chats',
  'nutriflow_appointments',
  'nutriflow_payment_transactions',
  'nutriflow_scan_db',
  'nutriflow_food_scans',
];

export class Store {
  /**
   * @param {string} namespace prefix localStorage (default nutriflow_store_v1)
   */
  constructor(namespace = DEFAULT_NAMESPACE) {
    this.namespace = namespace;
    this._state = new Map(); // memory cache
    this._subscribers = new Map(); // key -> Set<handler>

    // State object untuk kompatibilitas dengan App.js / ClientController legacy.
    this.state = {
      loggedClientName: null,
      unreadNotifications: 0,
    };
    this.guestPreview = false;
    this.guestProgramId = null;
  }

  /**
   * Singleton — mengembalikan instance yang sama dengan `store` yang
   * dipakai seluruh Model di aplikasi.
   * @returns {Store}
   */
  static getInstance() {
    if (!Store._singleton) Store._singleton = new Store();
    return Store._singleton;
  }

  /** Build kunci localStorage penuh. */
  _key(key) {
    return `${this.namespace}:${key}`;
  }

  /**
   * Baca nilai. Bila tidak ada di memory, coba baca dari localStorage.
   * @param {string} key
   * @param {*} fallback
   */
  get(key, fallback = null) {
    if (this._state.has(key)) {
      return this._state.get(key);
    }
    const raw = localStorage.getItem(this._key(key));
    if (raw === null || raw === undefined) {
      return fallback;
    }
    try {
      const parsed = JSON.parse(raw);
      this._state.set(key, parsed);
      return parsed;
    } catch (e) {
      // Nilai non-JSON disimpan sebagai string mentah.
      this._state.set(key, raw);
      return raw;
    }
  }

  /**
   * Tulis nilai (selalu disimpan sebagai JSON) lalu notify subscriber.
   * @param {string} key
   * @param {*} value
   */
  set(key, value) {
    const previousValue = this._state.get(key);
    this._state.set(key, value);
    try {
      localStorage.setItem(this._key(key), JSON.stringify(value));
    } catch (e) {
      console.warn(`[Store] gagal persist key "${key}":`, e);
    }
    // Selama UI legacy masih dipakai, perubahan dari model harus terlihat
    // juga oleh halaman client/admin yang membaca key tanpa namespace.
    if (LEGACY_KEYS.includes(key)) {
      try {
        localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
      } catch (e) {
        console.warn(`[Store] gagal sinkron key legacy "${key}":`, e);
      }
    }
    this._notify(key, value, previousValue);
    bus.emit(EVENTS.STATE_CHANGED, { key, value });
    return value;
  }

  /**
   * Update sebagian properti dari sebuah object state.
   * @param {string} key
   * @param {object} patch
   */
  update(key, patch) {
    const current = this.get(key, {});
    if (current && typeof current === 'object' && !Array.isArray(current)) {
      return this.set(key, { ...current, ...patch });
    }
    return this.set(key, patch);
  }

  /** Hapus key dari memory & localStorage. */
  remove(key) {
    this._state.delete(key);
    localStorage.removeItem(this._key(key));
    if (LEGACY_KEYS.includes(key)) localStorage.removeItem(key);
    this._notify(key, null);
    bus.emit(EVENTS.STATE_CHANGED, { key, value: null });
  }

  /**
   * Subscribe perubahan pada sebuah key.
   * @param {string} key
   * @param {Function} handler (value, previousValue) => void
   * @returns {Function} unsubscribe
   */
  subscribe(key, handler) {
    if (!this._subscribers.has(key)) {
      this._subscribers.set(key, new Set());
    }
    this._subscribers.get(key).add(handler);
    return () => {
      const set = this._subscribers.get(key);
      if (set) set.delete(handler);
    };
  }

  /** Internal: notifikasi subscriber key. */
  _notify(key, value, previousValue) {
    const set = this._subscribers.get(key);
    if (set) {
      set.forEach((handler) => {
        try {
          handler(value, previousValue);
        } catch (err) {
          console.error(`[Store] subscriber error pada key "${key}":`, err);
        }
      });
    }
  }

  /**
   * Sinkronkan kunci "bare" legacy (ditulis oleh main.js/admin.js/control-center.js)
   * ke memory cache agar seluruh Model membaca data yang sama (single source of truth).
   * Dipanggil saat bootstrap App.
   */
  loadFromStorage() {
    LEGACY_KEYS.forEach((legacyKey) => {
      const raw = localStorage.getItem(legacyKey);
      if (raw !== null && raw !== undefined) {
        try {
          const parsed = JSON.parse(raw);
          if (!this._state.has(legacyKey)) {
            this._state.set(legacyKey, parsed);
          }
        } catch (e) {
          // Nilai non-JSON (string mentah)
          if (!this._state.has(legacyKey)) {
            this._state.set(legacyKey, raw);
          }
        }
      }
    });

    // State kompatibilitas
    const loggedName = this.get('nutriflow_client_logged_name', null);
    if (loggedName) {
      this.state.loggedClientName = loggedName;
    }
    const logged = this.get('nutriflow_client_logged', 'false');
    if (logged === 'true') {
      this.state.unreadNotifications = 4;
    }

    return this;
  }

  /**
   * Persist state objek kompatibilitas (state.loggedClientName, unreadNotifications)
   * ke kunci bare legacy agar seluruh bagian aplikasi tetap sinkron.
   */
  persist() {
    if (this.state.loggedClientName) {
      localStorage.setItem('nutriflow_client_logged_name', this.state.loggedClientName);
      this._state.set('nutriflow_client_logged_name', this.state.loggedClientName);
    }
    localStorage.setItem('nutriflow_client_logged', this.state.loggedClientName ? 'true' : 'false');
    localStorage.setItem('nutriflow_unread_notifications', String(this.state.unreadNotifications || 0));
    return this;
  }
}

// Singleton store — dipakai seluruh Model: `import { store } from '../core/Store.js'`
export const store = Store.getInstance();

/**
 * OfflineQueue — simulasi background sync untuk aksi yang dibuat tanpa koneksi.
 * Data tetap tersimpan lokal agar UI dapat langsung diperbarui; ketika online,
 * antrean ditandai tersinkron. Endpoint server ditambahkan pada fase backend.
 */
const QUEUE_KEY = 'nutriflow_offline_queue';

export class OfflineQueue {
  getAll() {
    try { return JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]'); } catch { return []; }
  }

  enqueue(type, payload) {
    const queue = this.getAll();
    queue.push({ id: `offline-${Date.now()}`, type, payload, createdAt: new Date().toISOString() });
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
    this._emit();
    return queue.at(-1);
  }

  flush() {
    const queued = this.getAll();
    if (!queued.length || !navigator.onLine) return 0;
    // Pada frontend-only, localStorage adalah persistence. Backend nantinya
    // mengirim tiap item ini ke endpoint terautentikasi sebelum queue dikosongkan.
    localStorage.removeItem(QUEUE_KEY);
    this._emit();
    return queued.length;
  }

  _emit() {
    window.dispatchEvent(new CustomEvent('nutriflow:queue-change', { detail: { count: this.getAll().length } }));
  }
}

export const offlineQueue = new OfflineQueue();

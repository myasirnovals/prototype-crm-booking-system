/**
 * ClientModel — Data klien, profil, medical intake, antropometri.
 *
 * SRS acuan: FR-CLIENT-01..06, §8 Model Data (User, ClientProfile, Anthropometry).
 */
import { store } from '../core/Store.js';

export class ClientModel {
  static CLIENTS_KEY = 'nutriflow_clients';
  static LOGGED_NAME_KEY = 'nutriflow_client_logged_name';
  static LOGGED_KEY = 'nutriflow_client_logged';

  /** Daftar seluruh klien. */
  getClients() {
    return store.get(ClientModel.CLIENTS_KEY, []);
  }

  setClients(clients) {
    return store.set(ClientModel.CLIENTS_KEY, clients);
  }

  /** Klien yang sedang login. */
  getLoggedClientName() {
    return store.get(ClientModel.LOGGED_NAME_KEY, 'Sarah Jenkins');
  }

  setLoggedClientName(name) {
    return store.set(ClientModel.LOGGED_NAME_KEY, name);
  }

  isLoggedIn() {
    return store.get(ClientModel.LOGGED_KEY, 'false') === 'true';
  }

  login(name) {
    store.set(ClientModel.LOGGED_KEY, 'true');
    this.setLoggedClientName(name);
  }

  logout() {
    store.remove(ClientModel.LOGGED_KEY);
    store.remove(ClientModel.LOGGED_NAME_KEY);
  }

  /** Cari klien berdasarkan nama. */
  findClient(name) {
    return this.getClients().find((c) => c.name === name) || null;
  }

  /** Tambah klien baru. */
  addClient(client) {
    const clients = this.getClients();
    clients.unshift(client);
    this.setClients(clients);
    return client;
  }

  /** Health profile (medical intake). */
  getProfileKey(clientName) {
    return `nutriflow_client_health_profile_${clientName}`;
  }

  getProfile(clientName) {
    return store.get(this.getProfileKey(clientName), null);
  }

  saveProfile(clientName, profile) {
    const before = this.getProfile(clientName);
    store.set(this.getProfileKey(clientName), profile);
    // Simpan juga ke nutriflow_client_intakes untuk kompatibilitas.
    const intakes = store.get('nutriflow_client_intakes', {});
    intakes[clientName] = {
      weight: profile.weight,
      targetWeight: profile.targetWeight,
      goal: profile.goal,
      diet: profile.dietPref,
      allergies: profile.allergies,
      notes: profile.notes,
      updatedAt: new Date().toISOString(),
    };
    store.set('nutriflow_client_intakes', intakes);
    // Audit lokal untuk mode prototype. Implementasi production harus
    // memindahkan audit trail ke server append-only dengan actor dari session.
    const auditLogs = store.get('nutriflow_audit_logs', []);
    auditLogs.unshift({
      id: `audit-${Date.now()}`,
      actor: clientName,
      action: before ? 'medical_profile_updated' : 'medical_profile_created',
      entity: 'ClientProfile',
      before,
      after: profile,
      timestamp: new Date().toISOString(),
    });
    store.set('nutriflow_audit_logs', auditLogs.slice(0, 200));
    return profile;
  }

  /** Weight history. */
  getWeightHistoryKey(clientName) {
    return `nutriflow_weight_history_${clientName}`;
  }

  getWeightHistory(clientName) {
    return store.get(this.getWeightHistoryKey(clientName), []);
  }

  setWeightHistory(clientName, history) {
    store.set(this.getWeightHistoryKey(clientName), history);
  }

  /**
   * Tambah entri berat badan terbaru ke riwayat.
   * @param {string} clientName
   * @param {number} weight (kg)
   */
  addWeightEntry(clientName, weight) {
    const history = this.getWeightHistory(clientName);
    const today = new Date().toISOString().split('T')[0];
    // Hindari duplikasi di tanggal yang sama (update nilai terakhir)
    const existingIdx = history.findIndex((e) => e.date === today);
    if (existingIdx >= 0) {
      history[existingIdx] = { date: today, weight: Number(weight) };
    } else {
      history.push({ date: today, weight: Number(weight) });
    }
    this.setWeightHistory(clientName, history);
    return history;
  }

  /** Measurements history. */
  getMeasurementsKey(clientName) {
    return `nutriflow_measurements_history_${clientName}`;
  }

  getMeasurements(clientName) {
    return store.get(this.getMeasurementsKey(clientName), []);
  }

  setMeasurements(clientName, history) {
    store.set(this.getMeasurementsKey(clientName), history);
  }

  /**
   * Tambah entri pengukuran tubuh (waist & hip dalam inch) ke riwayat.
   * @param {string} clientName
   * @param {number} waist (in)
   * @param {number} hip (in)
   */
  addMeasurementEntry(clientName, waist, hip) {
    const history = this.getMeasurements(clientName);
    const today = new Date().toISOString().split('T')[0];
    const existingIdx = history.findIndex((e) => e.date === today);
    const entry = { date: today, waist: Number(waist), hip: Number(hip) };
    if (existingIdx >= 0) {
      history[existingIdx] = { ...history[existingIdx], ...entry };
    } else {
      history.push(entry);
    }
    this.setMeasurements(clientName, history);
    return history;
  }

  /** Water glasses. */
  getWaterKey(clientName) {
    return `nutriflow_water_glasses_${clientName}`;
  }

  getWaterGlasses(clientName) {
    return parseInt(store.get(this.getWaterKey(clientName), '0'), 10) || 0;
  }

  setWaterGlasses(clientName, count) {
    store.set(this.getWaterKey(clientName), count);
  }

  /** Streak days. */
  getStreakKey(clientName) {
    return `nutriflow_streak_days_${clientName}`;
  }

  getStreakDays(clientName) {
    return parseInt(store.get(this.getStreakKey(clientName), '0'), 10) || 0;
  }

  setStreakDays(clientName, days) {
    store.set(this.getStreakKey(clientName), days);
  }

  /** Logged meals status. */
  getLoggedMealsKey(clientName) {
    return `nutriflow_logged_meals_${clientName}`;
  }

  getLoggedMeals(clientName) {
    return store.get(this.getLoggedMealsKey(clientName), { breakfast: false, lunch: false, snack: false, dinner: false });
  }

  setLoggedMeals(clientName, status) {
    store.set(this.getLoggedMealsKey(clientName), status);
  }

  /**
   * Init — bootstrap hook. Tidak menimpa data yang sudah ada.
   */
  init() {
    return this;
  }
}

export const clientModel = new ClientModel();

/**
 * AppointmentModel — Appointment, booking, services, payment.
 *
 * SRS acuan: FR-APPT-01..09, FR-SVC-01..03, FR-PAY-01..07, §8 (Appointment, Service, Payment).
 */
import { store } from '../core/Store.js';

export class AppointmentModel {
  static APPOINTMENTS_KEY = 'nutriflow_appointments';
  static PAYMENTS_KEY = 'nutriflow_payment_transactions';

  // ──── Appointments ──────────────────────────────────────────

  getAppointments() {
    return store.get(AppointmentModel.APPOINTMENTS_KEY, []);
  }

  setAppointments(appointments) {
    store.set(AppointmentModel.APPOINTMENTS_KEY, appointments);
  }

  addAppointment(apt) {
    const appointments = this.getAppointments();
    appointments.push(apt);
    this.setAppointments(appointments);
    return apt;
  }

  updateAppointment(id, patch) {
    const appointments = this.getAppointments();
    const idx = appointments.findIndex((a) => a.id === id);
    if (idx === -1) return null;
    appointments[idx] = { ...appointments[idx], ...patch };
    this.setAppointments(appointments);
    return appointments[idx];
  }

  getClientAppointments(clientName) {
    return this.getAppointments().filter((a) => a.clientName === clientName);
  }

  getUpcomingClientAppointments(clientName) {
    return this.getAppointments().filter(
      (a) => a.clientName === clientName && (a.status === 'approved' || a.status === 'pending')
    );
  }

  // ──── Services (per specialist) ─────────────────────────────

  getServicesKey(specialist) {
    return `nutriflow_services_${specialist}`;
  }

  getServices(specialist) {
    return store.get(this.getServicesKey(specialist), []);
  }

  setServices(specialist, services) {
    store.set(this.getServicesKey(specialist), services);
  }

  addService(specialist, service) {
    const services = this.getServices(specialist);
    services.push(service);
    this.setServices(specialist, services);
    return service;
  }

  removeService(specialist, serviceId) {
    const services = this.getServices(specialist).filter((s) => s.id !== serviceId);
    this.setServices(specialist, services);
  }

  // ──── Payments / Transactions ───────────────────────────────

  getPayments() {
    return store.get(AppointmentModel.PAYMENTS_KEY, []);
  }

  addPayment(payment) {
    const payments = this.getPayments();
    payments.unshift(payment);
    store.set(AppointmentModel.PAYMENTS_KEY, payments);
    return payment;
  }

  /**
   * Ajukan reschedule appointment ke tanggal/waktu baru.
   * @param {string} id
   * @param {string} date YYYY-MM-DD
   * @param {string} time e.g. '09:00 AM'
   * @returns {object|null} appointment yang diupdate, atau null jika tidak ditemukan
   */
  rescheduleAppointment(id, date, time) {
    return this.updateAppointment(id, {
      date,
      time,
      rescheduledAt: new Date().toISOString(),
    });
  }

  /**
   * Persist — dipanggil ClientController setelah mutasi appointment.
   * Karena Store.set langsung menulis ke localStorage, method ini cukup
   * menjadi no-op kompatibilitas (menjaga API konsisten dengan Model lain).
   */
  persist() {
    return this;
  }

  /**
   * Init — bootstrap hook. Tidak menimpa data yang sudah ada.
   */
  init() {
    return this;
  }
}

export const appointmentModel = new AppointmentModel();

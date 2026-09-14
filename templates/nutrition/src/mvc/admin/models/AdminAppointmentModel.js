/**
 * AdminAppointmentModel — Model untuk manajemen Appointment dari sisi Admin.
 */
export class AdminAppointmentModel {
  constructor() {
    this.storageKey = 'nutriflow_appointments';
  }

  init() {
    if (!localStorage.getItem(this.storageKey)) {
      localStorage.setItem(this.storageKey, JSON.stringify([]));
    }
  }

  getAppointments() {
    return JSON.parse(localStorage.getItem(this.storageKey) || '[]');
  }

  saveAppointments(appointments) {
    localStorage.setItem(this.storageKey, JSON.stringify(appointments));
  }

  updateAppointmentStatus(id, status) {
    const apts = this.getAppointments();
    const index = apts.findIndex(a => a.id === id);
    if (index !== -1) {
      apts[index].status = status;
      this.saveAppointments(apts);
      return true;
    }
    return false;
  }
}

export const adminAppointmentModel = new AdminAppointmentModel();

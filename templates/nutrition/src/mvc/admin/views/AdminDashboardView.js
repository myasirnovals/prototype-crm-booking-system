/**
 * AdminDashboardView — View untuk menangani dashboard summary.
 */
import { adminClientModel } from '../models/AdminClientModel.js';
import { adminAppointmentModel } from '../models/AdminAppointmentModel.js';

export class AdminDashboardView {
  renderMetrics() {
    const clients = adminClientModel.getClients();
    const apts = adminAppointmentModel.getAppointments();

    const elClients = document.getElementById('admin-metric-clients');
    const elCompliance = document.getElementById('admin-metric-compliance');
    const elConsultations = document.getElementById('admin-metric-consultations');

    if (elClients) {
      elClients.innerText = clients.length.toString();
    }

    if (elCompliance) {
      const avg = clients.length > 0 
        ? Math.round(clients.reduce((acc, c) => acc + (c.compliance || 0), 0) / clients.length)
        : 0;
      elCompliance.innerText = `${avg}%`;
    }

    if (elConsultations) {
      const today = new Date().toISOString().split('T')[0];
      const count = apts.filter(a => a.date === today && a.status === 'approved').length;
      elConsultations.innerText = count.toString();
    }
  }
}

export const adminDashboardView = new AdminDashboardView();

/**
 * AdminClientModel — Model untuk manajemen data klien dari sisi Admin.
 */
import { Store } from '../../core/Store.js';

export class AdminClientModel {
  constructor() {
    this.storageKey = 'nutriflow_clients';
  }

  init() {
    if (!localStorage.getItem(this.storageKey)) {
      // Default dummy data if empty
      const defaultClients = [
        { name: 'Sarah Jenkins', email: 'sarah.j@email.com', goal: 'Weight Loss', lastCheckIn: 'Today, 9:00 AM', compliance: 92, weightTrend: [168, 169, 170, 173, 174, 176], avatar: 'SJ', therapist: 'Dr. Hasan', activeProgramId: 'prog-sarah', allergies: ['Peanuts', 'Seafood/Shellfish'], conditions: ['Diabetes Type 2'] },
        { name: 'Marcus Reid', email: 'm.reid@email.com', goal: 'Muscle Gain', lastCheckIn: '2 days ago', compliance: 78, weightTrend: [180, 182, 181, 183, 182, 185], avatar: 'MR', therapist: 'Dr. Hasan', activeProgramId: 'prog-marcus', allergies: ['Lactose/Dairy'], conditions: ['GERD/Maag'] },
        { name: 'Elena Lopez', email: 'elena.l@email.com', goal: 'Maintenance', lastCheckIn: 'Yesterday', compliance: 95, weightTrend: [142, 142, 141, 142, 142, 142], avatar: 'EL', therapist: 'Dr. Amanda', activeProgramId: 'prog-elena', allergies: [], conditions: ['High Cholesterol'] }
      ];
      localStorage.setItem(this.storageKey, JSON.stringify(defaultClients));
    }
  }

  getClients() {
    return JSON.parse(localStorage.getItem(this.storageKey) || '[]');
  }

  saveClients(clients) {
    localStorage.setItem(this.storageKey, JSON.stringify(clients));
  }

  getClientByEmail(email) {
    return this.getClients().find(c => c.email === email);
  }

  addClient(clientData) {
    const clients = this.getClients();
    clients.unshift(clientData);
    this.saveClients(clients);
    
    // Add to audit trail
    this.logAudit('CREATE_CLIENT', clientData.email, `Created client ${clientData.name}`);
  }

  updateClient(email, updates) {
    const clients = this.getClients();
    const index = clients.findIndex(c => c.email === email);
    if (index !== -1) {
      clients[index] = { ...clients[index], ...updates };
      this.saveClients(clients);
      this.logAudit('UPDATE_CLIENT_INTAKE', email, `Updated medical intake for ${email}`);
      return true;
    }
    return false;
  }

  // Audit trail (SRS FR-CLIENT-07)
  logAudit(action, entity, details) {
    const auditKey = 'nutriflow_audit_log';
    const logs = JSON.parse(localStorage.getItem(auditKey) || '[]');
    const adminName = localStorage.getItem('nutriflow_specialist_name') || 'Admin';
    
    logs.unshift({
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor: adminName,
      action,
      entity,
      details
    });
    
    localStorage.setItem(auditKey, JSON.stringify(logs));
  }
}

export const adminClientModel = new AdminClientModel();

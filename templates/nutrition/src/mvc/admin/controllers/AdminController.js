/**
 * AdminController — Orchestrator untuk seluruh alur Specialist Practitioner Portal.
 *
 * Menghubungkan Model ↔ View ↔ DOM events.
 */
import { Store } from '../../core/Store.js';
import { router } from '../../core/Router.js';
import { toast } from '../../core/Toast.js';
import { adminClientModel } from '../models/AdminClientModel.js';
import { adminProgramModel } from '../models/AdminProgramModel.js';
import { adminAppointmentModel } from '../models/AdminAppointmentModel.js';

import { adminDashboardView } from '../views/AdminDashboardView.js';
import { adminClientView } from '../views/AdminClientView.js';
import { adminProgramView } from '../views/AdminProgramView.js';
import { adminAppointmentView } from '../views/AdminAppointmentView.js';

export class AdminController {
  constructor() {
    this._bindEvents();
  }

  init() {
    // 1. Cek session (RBAC: Admin)
    this._checkSession();

    // 2. Load state dari localStorage via Store (sudah dilakukan di AdminApp)
    if (typeof window.loadAdminState === 'function') {
      window.loadAdminState();
    }

    // 3. Init model defaults
    adminClientModel.init();
    adminProgramModel.init();
    adminAppointmentModel.init();

    // 4. Sinkronisasi UI
    this._syncUI();
  }

  // ============ SESSION ============
  _checkSession() {
    const logged = localStorage.getItem('nutriflow_admin_logged');
    if (logged !== 'true') {
      window.location.href = './login.html';
    }
  }

  _syncUI() {
    const activeSpecialistName = localStorage.getItem('nutriflow_specialist_name') || 'Dr. Hasan';
    
    // Set subtitle welcome message with specialist name
    const subtitle = document.getElementById('specialist-welcome-subtitle');
    if (subtitle) {
      subtitle.innerText = `Logged in as: ${activeSpecialistName} · Manage your active nutrition clients and monitor their progress.`;
    }

    // Set practitioner avatar label
    const avatarLabel = document.getElementById('practitioner-avatar-label');
    if (avatarLabel) {
      const initials = activeSpecialistName.split(' ').map(s => s[0]).join('').substring(0, 2).toUpperCase();
      avatarLabel.innerText = initials;
    }
    
    // Initial routing
    router.navigate('admin-clients');
  }

  // ============ BIND DOM EVENTS ============
  _bindEvents() {
    // Navigasi
    window.navigateTo = (viewId) => {
      // Clean up UI nav states
      document.querySelectorAll('.view-section').forEach(sec => sec.classList.add('hidden'));
      const activeSec = document.getElementById('view-' + viewId);
      if (activeSec) activeSec.classList.remove('hidden');

      document.querySelectorAll('.nav-link').forEach(link => {
        link.className = 'nav-link h-full flex items-center text-on-surface-variant hover:text-primary font-label-md text-label-md transition-colors px-3 cursor-pointer';
      });
      const activeLink = document.getElementById(`link-${viewId}`);
      if (activeLink) {
        activeLink.className = 'nav-link h-full flex items-center text-primary font-bold border-b-2 border-primary font-label-md text-label-md px-3 cursor-pointer';
      }

      router.navigate(viewId);

      // Render based on view
      if (viewId === 'admin-clients') {
        adminClientView.render();
        adminDashboardView.renderMetrics();
      } else if (viewId === 'admin-meal-builder') {
        adminProgramView.render();
      } else if (viewId === 'admin-calendar') {
        adminAppointmentView.render();
      }
    };

    window.handleAdminSignOut = () => {
      localStorage.removeItem('nutriflow_admin_logged');
      toast.show('Signed out of Admin account.');
      setTimeout(() => {
        window.location.href = './login.html';
      }, 1000);
    };

    // Client Management
    window.filterAdminClients = () => adminClientView.render();
    window.changeAdminClientsPage = (dir) => {
      adminClientView.changePage(dir);
    };

    window.renderProgramsList = () => adminProgramView.renderProgramsList();
    window.renderAdminAppointmentsTable = () => adminAppointmentView.render();
    // Client Modals
    window.showAddNewClientModal = () => adminClientView.openAddClientModal();
    window.closeAddNewClientModal = () => adminClientView.closeAddClientModal();
    window.openClientIntakeModal = (email) => adminClientView.openIntakeModal(email);
    window.closeClientIntakeModal = () => adminClientView.closeIntakeModal();
  }
}

// Singleton instance
export const adminController = new AdminController();

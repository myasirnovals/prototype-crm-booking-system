/**
 * ProfileView — Render profile, progress chart, stats log, intake edit/view.
 *
 * SRS acuan: FR-CLIENT-01..06, FR-SESS-01..05, §8 (Anthropometry, LabMarker).
 */
import { clientModel } from '../models/ClientModel.js';

export class ProfileView {
  render() {
    const clientName = clientModel.getLoggedClientName();
    this._renderHeader(clientName);
    this._renderCharts(clientName);
    this._renderIntake(clientName);
  }

  _renderHeader(clientName) {
    const profile = clientModel.getProfile(clientName);
    const clients = clientModel.getClients();
    const clientDetails = clients.find((c) => c.name === clientName);

    const initials = clientName.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase();

    const avatarEl = document.getElementById('profile-avatar-large');
    if (avatarEl) avatarEl.innerText = initials;

    const nameEl = document.getElementById('profile-name-label');
    if (nameEl) nameEl.innerText = clientName;

    const emailEl = document.getElementById('profile-email-label');
    if (emailEl) emailEl.innerText = clientDetails?.email || `${clientName.toLowerCase().replace(/\s+/g, '')}@email.com`;

    if (profile) {
      const setText = (id, val) => { const el = document.getElementById(id); if (el) el.innerText = val || '--'; };
      setText('profile-badge-height', profile.height ? `${profile.height} cm` : '-- cm');
      setText('profile-badge-weight', profile.weight ? `${profile.weight} kg` : '-- kg');
      setText('profile-badge-goal', profile.goal || 'Weight Loss');
    }
  }

  _renderCharts(clientName) {
    // Chart rendering is handled by Chart.js instances in views/context
    // This defers to the global window functions that use chart instances
    if (typeof window.updateWeightTrendChart === 'function') window.updateWeightTrendChart();
    if (typeof window.updateMeasurementsChart === 'function') window.updateMeasurementsChart();
  }

  _renderIntake(clientName) {
    const profile = clientModel.getProfile(clientName);
    const seedClients = ['Sarah Jenkins', 'Marcus Reid', 'Elena Lopez'];

    if (!profile) {
      // Fallback untuk seed clients
      if (seedClients.includes(clientName)) {
        const seedProfile = this._getSeedProfile(clientName);
        if (seedProfile) {
          this._populateIntake(seedProfile);
          return;
        }
      }
      this._populateIntake({ name: clientName, dob: '', sex: 'Female', height: '', weight: '', targetWeight: '', goal: 'Weight Loss & Fat Reduction', allergies: [], conditions: [], dietPref: 'None', notes: '' });
      return;
    }
    this._populateIntake(profile);
  }

  _getSeedProfile(clientName) {
    const profiles = {
      'Sarah Jenkins': { name: 'Sarah Jenkins', dob: '1990-04-12', sex: 'Female', height: 165, weight: 72.5, targetWeight: 65.0, goal: 'Weight Loss & Fat Reduction', allergies: ['Peanuts', 'Seafood/Shellfish'], conditions: ['Diabetes Type 2'], dietPref: 'Halal', notes: 'Pre-diabetic management, allergic to peanuts.' },
      'Marcus Reid': { name: 'Marcus Reid', dob: '1988-11-23', sex: 'Male', height: 182, weight: 85.0, targetWeight: 88.0, goal: 'Muscle Building & Fitness', allergies: [], conditions: ['High Cholesterol'], dietPref: 'Keto', notes: 'Focus on clean high-protein bulking.' },
      'Elena Lopez': { name: 'Elena Lopez', dob: '1993-08-04', sex: 'Female', height: 160, weight: 58.0, targetWeight: 55.0, goal: 'General Health Improvement', allergies: ['Lactose/Dairy'], conditions: ['GERD/Maag'], dietPref: 'Vegetarian', notes: 'Frequent bloating, looking for gut-friendly diet.' },
    };
    return profiles[clientName] || null;
  }

  _populateIntake(profile) {
    // Populate edit form
    const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.value = val; };
    setVal('intake-page-name', profile.name || '');
    setVal('intake-page-dob', profile.dob || '');
    setVal('intake-page-sex', profile.sex || 'Female');
    setVal('intake-page-height', profile.height || '');
    setVal('intake-page-weight', profile.weight || '');
    setVal('intake-page-target-weight', profile.targetWeight || '');
    setVal('intake-page-goal', profile.goal || 'Weight Loss & Fat Reduction');
    setVal('intake-page-diet', profile.dietPref || 'None');
    setVal('intake-page-notes', profile.notes || '');

    document.querySelectorAll('input[name="intake-page-allergies"]').forEach((cb) => {
      cb.checked = profile.allergies && profile.allergies.includes(cb.value);
    });
    document.querySelectorAll('input[name="intake-page-conditions"]').forEach((cb) => {
      cb.checked = profile.conditions && profile.conditions.includes(cb.value);
    });

    // Populate view mode
    const setText = (id, val) => { const el = document.getElementById(id); if (el) el.innerText = val || '—'; };
    setText('view-name', profile.name);
    setText('view-dob', profile.dob ? new Date(profile.dob).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : null);
    setText('view-sex', profile.sex);
    setText('view-height', profile.height ? `${profile.height} cm` : null);
    setText('view-weight', profile.weight ? `${profile.weight} kg` : null);
    setText('view-target-weight', profile.targetWeight ? `${profile.targetWeight} kg` : null);
    setText('view-goal', profile.goal);
    setText('view-diet', profile.dietPref === 'None' ? 'Balanced / No Restriction' : profile.dietPref);
    setText('view-notes', profile.notes);

    // Allergies & conditions badges
    const renderBadges = (containerId, items, cls) => {
      const el = document.getElementById(containerId);
      if (!el) return;
      if (!items || items.length === 0) {
        el.innerHTML = '<span class="text-xs text-on-surface-variant italic">None reported</span>';
        return;
      }
      el.innerHTML = items.map((item) => `<span class="${cls} text-xs font-bold px-3 py-1 rounded-full">${item}</span>`).join('');
    };
    renderBadges('view-allergies', profile.allergies, 'bg-amber-100 text-amber-800');
    renderBadges('view-conditions', profile.conditions, 'bg-red-100 text-red-700');
  }
}

export const profileView = new ProfileView();

/**
 * Cliniva — Branch Admin Component (Role 4)
 * SOLID: Single Responsibility for rendering Branch Capacity & Practitioner Roster Management
 */

export function renderBranchAdmin() {
  return `
    <section class="demo-pane" id="paneBranchAdmin">
      <div class="role-header-banner">
        <div class="role-header-meta">
          <div class="role-avatar">🏢</div>
          <div>
            <div class="pill" style="font-size:11px; padding:3px 10px; margin-bottom:4px;" data-i18n="demo.branch.roleBadge">ROLE: BRANCH ADMIN / CLINIC MANAGER</div>
            <h2 style="font-size:22px; margin:0;" data-i18n="demo.branch.title">Branch Capacity &amp; Roster Management</h2>
            <small style="color:var(--muted); font-size:12px;">Selected Branch: 🇸🇬 Paragon Medical Orchard Singapore (6 Rooms, 4 Specialists)</small>
          </div>
        </div>

        <div style="display:flex; gap:10px;">
          <button class="btn btn-primary" onclick="alert('Doctor roster &amp; branch capacity synchronized!')" data-i18n="demo.branch.saveRoster">💾 Save Branch Roster</button>
        </div>
      </div>

      <!-- Branch Metrics -->
      <div class="metric-grid-4">
        <div class="metric-card-box">
          <span data-i18n="demo.branch.metricOccupancy">Branch Occupancy Rate</span>
          <strong style="color:var(--primary-dark);">91.4%</strong>
          <small style="color:var(--success); font-size:11px;" data-i18n="demo.branch.metricOccupancySub">+8.2% vs last month</small>
        </div>
        <div class="metric-card-box">
          <span data-i18n="demo.branch.metricEquip">Medical Equipment Readiness</span>
          <strong style="color:var(--success-dark);">100%</strong>
          <small style="color:var(--muted); font-size:11px;" data-i18n="demo.branch.metricEquipSub">4 Units Calibrated</small>
        </div>
        <div class="metric-card-box">
          <span data-i18n="demo.branch.metricSterilize">Room Sterilization Buffer</span>
          <strong data-i18n="demo.branch.metricSterilizeVal">15 Minutes</strong>
          <small style="color:var(--muted); font-size:11px;" data-i18n="demo.branch.metricSterilizeSub">Anti-Collision Buffer</small>
        </div>
        <div class="metric-card-box">
          <span data-i18n="demo.branch.metricRevenue">Branch Revenue (Today)</span>
          <strong style="color:var(--primary-dark);">SGD 3,420</strong>
          <small style="color:var(--muted); font-size:11px;" data-i18n="demo.branch.metricRevenueSub">Deposit: SGD 980</small>
        </div>
      </div>

      <!-- Practitioner Roster & Availability Manager -->
      <div class="data-table-card">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
          <h3 style="font-size:17px; margin:0;" data-i18n="demo.branch.rosterTitle">Branch Practitioner Shift &amp; Schedule Settings</h3>
          <small style="color:var(--muted);" data-i18n="demo.branch.rosterSubtitle">Enable or disable practitioner schedules instantly.</small>
        </div>

        <table>
          <thead>
            <tr>
              <th data-i18n="demo.branch.thPractitioner">Practitioner</th>
              <th data-i18n="demo.branch.thSpecialty">Specialty</th>
              <th data-i18n="demo.branch.thRoom">Default Room</th>
              <th data-i18n="demo.branch.thHours">Practice Hours</th>
              <th data-i18n="demo.branch.thStatus">Today's Status</th>
              <th data-i18n="demo.branch.thAction">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Dr. Lim Wei Han</strong></td>
              <td>Senior Physiotherapist</td>
              <td>Room A1 (Physio)</td>
              <td>09:00 - 18:00</td>
              <td><span class="status-pill confirmed">ON DUTY</span></td>
              <td><button class="btn btn-sm btn-soft" onclick="alert('Dr. Lim\\'s schedule updated.')" data-i18n="demo.branch.editHours">Edit Hours</button></td>
            </tr>
            <tr>
              <td><strong>Dr. Wong Mei Ling</strong></td>
              <td>TCM Acupuncturist</td>
              <td>Room A2 (TCM)</td>
              <td>09:00 - 17:00</td>
              <td><span class="status-pill confirmed">ON DUTY</span></td>
              <td><button class="btn btn-sm btn-soft" onclick="alert('Dr. Wong\\'s schedule updated.')" data-i18n="demo.branch.editHours">Edit Hours</button></td>
            </tr>
            <tr>
              <td><strong>Therapist Sarah Tan</strong></td>
              <td>Deep Tissue Lead</td>
              <td>Bed 02 (Wellness)</td>
              <td>10:00 - 19:00</td>
              <td><span class="status-pill confirmed">ON DUTY</span></td>
              <td><button class="btn btn-sm btn-soft" onclick="alert('Sarah\\'s schedule updated.')" data-i18n="demo.branch.editHours">Edit Hours</button></td>
            </tr>
            <tr>
              <td><strong>Sinse Huang Wei</strong></td>
              <td>TCM Senior</td>
              <td>Bed 01 (TCM Acupuncture)</td>
              <td>09:00 - 15:00</td>
              <td><span class="status-pill confirmed">ON DUTY</span></td>
              <td><button class="btn btn-sm btn-soft" onclick="alert('Sinse Huang\\'s schedule updated.')" data-i18n="demo.branch.editHours">Edit Hours</button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  `;
}

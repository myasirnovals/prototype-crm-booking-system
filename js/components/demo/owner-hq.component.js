/**
 * Cliniva — Super Admin & Clinic Owner HQ Component (Role 5)
 * SOLID: Single Responsibility for rendering Multi-Branch HQ Executive & Financial Console
 */

export function renderOwnerHq() {
  return `
    <section class="demo-pane" id="paneSuperAdmin">
      <div class="role-header-banner">
        <div class="role-header-meta">
          <div class="role-avatar">👑</div>
          <div>
            <div class="pill" style="font-size:11px; padding:3px 10px; margin-bottom:4px;" data-i18n="demo.owner.roleBadge">ROLE: SUPER ADMIN / CLINIC OWNER (HQ)</div>
            <h2 style="font-size:22px; margin:0;" data-i18n="demo.owner.title">Multi-Branch Executive &amp; Financial Console</h2>
            <small style="color:var(--muted); font-size:12px;">Unified Control Center: 3 Active Branches (🇸🇬 Singapore, 🇲🇾 Kuala Lumpur, 🇲🇾 Penang)</small>
          </div>
        </div>

        <div style="display:flex; gap:10px;">
          <button class="btn btn-primary" onclick="alert('Consolidated report across all branches exported (PDF/Excel)!')" data-i18n="demo.owner.exportBtn">📥 Export Financial Report</button>
        </div>
      </div>

      <!-- Super Admin Global Network Metrics -->
      <div class="metric-grid-4">
        <div class="metric-card-box">
          <span data-i18n="demo.owner.metricNetRev">Network Revenue (This Month)</span>
          <strong style="color:var(--primary-dark);">SGD 54,280</strong>
          <small style="color:var(--success); font-size:11px;" data-i18n="demo.owner.metricNetRevSub">+14.5% MoM Growth</small>
        </div>
        <div class="metric-card-box">
          <span data-i18n="demo.owner.metricNoShow">Network No-Show Rate</span>
          <strong style="color:var(--success-dark);">3.1%</strong>
          <small style="color:var(--muted); font-size:11px;" data-i18n="demo.owner.metricNoShowSub">Down from 24.8% (Anti-No Show)</small>
        </div>
        <div class="metric-card-box">
          <span data-i18n="demo.owner.metricPatients">Total Patients Served</span>
          <strong data-i18n="demo.owner.metricPatientsSub">1,420 Patients</strong>
          <small style="color:var(--muted); font-size:11px;">3 Regional Branches</small>
        </div>
        <div class="metric-card-box">
          <span data-i18n="demo.owner.metricCommission">Therapist Commission Paid</span>
          <strong style="color:var(--warning-dark);">SGD 16,240</strong>
          <small style="color:var(--muted); font-size:11px;" data-i18n="demo.owner.metricCommissionSub">Auto-calculated per Session</small>
        </div>
      </div>

      <!-- Multi-Branch Consolidated Comparison Table -->
      <div class="data-table-card">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
          <h3 style="font-size:17px; margin:0;" data-i18n="demo.owner.tableTitle">Branch Financial &amp; Operational Performance</h3>
          <span class="pill" style="font-size:10px;">MULTI-CURRENCY (SGD / MYR)</span>
        </div>

        <table>
          <thead>
            <tr>
              <th data-i18n="demo.owner.thBranch">Clinic Branch</th>
              <th data-i18n="demo.owner.thCountry">Country / Currency</th>
              <th data-i18n="demo.owner.thBookings">Total Bookings</th>
              <th data-i18n="demo.owner.thOccupancy">Occupancy</th>
              <th data-i18n="demo.owner.thNoShow">No-Show Rate</th>
              <th data-i18n="demo.owner.thRevenue">Monthly Revenue</th>
              <th data-i18n="demo.owner.thStatus">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Orchard Wellness Clinic</strong></td>
              <td>🇸🇬 Singapore (SGD)</td>
              <td>640 Patients</td>
              <td>91.4%</td>
              <td><span style="color:var(--success); font-weight:800;">2.8%</span></td>
              <td><strong>SGD 28,450</strong></td>
              <td><span class="status-pill confirmed">OPTIMAL</span></td>
            </tr>
            <tr>
              <td><strong>Kuala Lumpur Integrated Care</strong></td>
              <td>🇲🇾 Malaysia (MYR)</td>
              <td>490 Patients</td>
              <td>86.2%</td>
              <td><span style="color:var(--success); font-weight:800;">3.4%</span></td>
              <td><strong>MYR 52,100</strong></td>
              <td><span class="status-pill confirmed">OPTIMAL</span></td>
            </tr>
            <tr>
              <td><strong>Penang TCM &amp; Physio Center</strong></td>
              <td>🇲🇾 Malaysia (MYR)</td>
              <td>290 Patients</td>
              <td>82.0%</td>
              <td><span style="color:var(--success); font-weight:800;">3.2%</span></td>
              <td><strong>MYR 31,400</strong></td>
              <td><span class="status-pill confirmed">OPTIMAL</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  `;
}

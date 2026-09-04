/**
 * Cliniva — Reception Desk Component (Role 2)
 * SOLID: Single Responsibility for rendering Front-Desk Receptionist operations, queue calling, POS, and calendar matrix
 */

export function renderReceptionistDesk() {
  return `
    <section class="demo-pane" id="paneReceptionist">
      <div class="role-header-banner">
        <div class="role-header-meta">
          <div class="role-avatar">👩‍💼</div>
          <div>
            <div class="pill" style="font-size:11px; padding:3px 10px; margin-bottom:4px;" data-i18n="demo.rec.roleBadge">ROLE: FRONT-DESK / RECEPTIONIST</div>
            <h2 style="font-size:22px; margin:0;" data-i18n="demo.rec.title">Reception Desk &amp; Daily Operations</h2>
            <small style="color:var(--muted); font-size:12px;">Logged in at: 🇸🇬 Paragon Medical Orchard Branch · Morning Shift</small>
          </div>
        </div>

        <div style="display:flex; gap:10px;">
          <button class="btn btn-primary" id="btnOpenWalkInModal" data-i18n="demo.rec.quickWalkIn">⚡ + Quick Walk-in Patient (&lt;30 Sec)</button>
        </div>
      </div>

      <!-- Receptionist Live Metrics -->
      <div class="metric-grid-4">
        <div class="metric-card-box">
          <span data-i18n="demo.rec.metricScheduled">Scheduled Patients</span>
          <strong>32</strong>
          <small style="color:var(--muted); font-size:11px;" data-i18n="demo.rec.metricScheduledSub">100% Slots Filled</small>
        </div>
        <div class="metric-card-box">
          <span data-i18n="demo.rec.metricArrived">Arrived &amp; Check-In</span>
          <strong style="color:var(--primary-dark);">18</strong>
          <small style="color:var(--success); font-size:11px;" data-i18n="demo.rec.metricArrivedSub">✓ On-Time</small>
        </div>
        <div class="metric-card-box">
          <span data-i18n="demo.rec.metricInTherapy">In Active Therapy</span>
          <strong style="color:var(--warning-dark);">6</strong>
          <small style="color:var(--muted); font-size:11px;" data-i18n="demo.rec.metricInTherapySub">In Room A1, A2, Bed 1-4</small>
        </div>
        <div class="metric-card-box">
          <span data-i18n="demo.rec.metricPos">POS Counter Settlement</span>
          <strong style="color:var(--success-dark);">SGD 1,980</strong>
          <small style="color:var(--muted); font-size:11px;" data-i18n="demo.rec.metricPosSub">12 Completed Transactions</small>
        </div>
      </div>

      <!-- Master Schedule Timeline Matrix (Sterilization Buffer Visual) -->
      <div class="timeline-matrix">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
          <div>
            <h3 style="font-size:17px; margin:0;" data-i18n="demo.rec.calendarTitle">📅 Master Operations Calendar &amp; Room Utilization</h3>
            <small style="color:var(--muted);" data-i18n="demo.rec.calendarSubtitle">Real-time visualization of doctor allocation, therapy beds, and automatic 15-minute sterilization buffers.</small>
          </div>
          <span class="badge-live">LIVE SYNC</span>
        </div>

        <table class="timeline-table">
          <thead>
            <tr>
              <th style="width:90px;" data-i18n="demo.rec.timeline.time">TIME</th>
              <th>ROOM A1 (Dr. Lim - Physio)</th>
              <th>ROOM A2 (Dr. Wong - TCM)</th>
              <th>BED 01 (Sinse Huang - TCM)</th>
              <th>BED 02 (Sarah Tan - Wellness)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="time-badge">09:00 - 10:00</td>
              <td><div class="schedule-chip chip-confirmed"><span>Amanda Tan</span><small data-i18n="demo.rec.timeline.statusCheckedIn">Checked-In</small></div></td>
              <td><div class="schedule-chip chip-confirmed"><span>K. Seng</span><small data-i18n="demo.rec.timeline.statusCheckedIn">Checked-In</small></div></td>
              <td><div class="schedule-chip chip-confirmed"><span>Jason L.</span><small data-i18n="demo.rec.timeline.statusCheckedIn">Checked-In</small></div></td>
              <td><div class="schedule-chip chip-progress"><span>S. Miller</span><small data-i18n="demo.rec.timeline.statusInTherapy">In-Therapy</small></div></td>
            </tr>
            <tr>
              <td class="time-badge">10:00 - 10:15</td>
              <td colspan="4" style="background:#fffbeb; text-align:center; padding:6px;">
                <span class="schedule-chip chip-buffer" style="justify-content:center; display:inline-flex;" data-i18n="demo.rec.sterilizationBuffer">
                  🧹 15-Minute Sterilization &amp; Linen Change Buffer (Zero Double-Booking)
                </span>
              </td>
            </tr>
            <tr>
              <td class="time-badge">10:15 - 11:15</td>
              <td><div class="schedule-chip chip-confirmed"><span>Nur Aisyah</span><small data-i18n="demo.rec.timeline.statusConfirmed">Confirmed</small></div></td>
              <td><div class="schedule-chip chip-confirmed"><span>D. Lim</span><small data-i18n="demo.rec.timeline.statusConfirmed">Confirmed</small></div></td>
              <td><div class="schedule-chip chip-progress"><span>B. Wong</span><small data-i18n="demo.rec.timeline.statusInTherapy">In-Therapy</small></div></td>
              <td><div class="schedule-chip chip-confirmed"><span>R. David</span><small data-i18n="demo.rec.timeline.statusConfirmed">Confirmed</small></div></td>
            </tr>
            <tr>
              <td class="time-badge">11:15 - 12:15</td>
              <td><div class="schedule-chip chip-confirmed"><span>Farhan A.</span><small data-i18n="demo.rec.timeline.statusDepositOk">Deposit OK</small></div></td>
              <td><div class="schedule-chip chip-confirmed"><span>Grace Tan</span><small data-i18n="demo.rec.timeline.statusDepositOk">Deposit OK</small></div></td>
              <td><div class="schedule-chip chip-confirmed"><span>L. Chen</span><small data-i18n="demo.rec.timeline.statusDepositOk">Deposit OK</small></div></td>
              <td><div class="schedule-chip chip-confirmed"><span>H. Patel</span><small data-i18n="demo.rec.timeline.statusDepositOk">Deposit OK</small></div></td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Live Queue Sound Caller Board -->
      <h3 style="font-size:18px; margin:24px 0 12px;" data-i18n="demo.rec.callerBoardTitle">🔊 Audio Queue Calling Display Board</h3>
      <div class="queue-card-grid">
        <div class="queue-card">
          <div style="display:flex; justify-content:space-between; align-items:flex-start;">
            <span class="queue-number">A-01</span>
            <span class="badge-live">READY CALL</span>
          </div>
          <h4 style="margin:8px 0 4px;">Amanda Tan</h4>
          <p style="font-size:12px; color:var(--muted); margin-bottom:14px;">Physiotherapy · Room A1 (Dr. Lim)</p>
          <button class="btn btn-sm btn-primary full btn-demo-call-queue" data-queue="A-01" data-patient="Amanda Tan" data-room="Consultation Room A1">
            🔊 Call Queue A-01 (Audio Chime)
          </button>
        </div>

        <div class="queue-card">
          <div style="display:flex; justify-content:space-between; align-items:flex-start;">
            <span class="queue-number">B-02</span>
            <span class="badge-live" style="background:#fef3c7; color:#b45309;">WAITING</span>
          </div>
          <h4 style="margin:8px 0 4px;">Nur Aisyah</h4>
          <p style="font-size:12px; color:var(--muted); margin-bottom:14px;">TCM Acupuncture · Bed 01 (Sinse Huang)</p>
          <button class="btn btn-sm btn-primary full btn-demo-call-queue" data-queue="B-02" data-patient="Nur Aisyah" data-room="Acupuncture Bed 01">
            🔊 Call Queue B-02 (Audio Chime)
          </button>
        </div>

        <div class="queue-card">
          <div style="display:flex; justify-content:space-between; align-items:flex-start;">
            <span class="queue-number">C-03</span>
            <span class="badge-live" style="background:#e0f2fe; color:#0369a1;">CHECK-IN</span>
          </div>
          <h4 style="margin:8px 0 4px;">Jason Lee</h4>
          <p style="font-size:12px; color:var(--muted); margin-bottom:14px;">Deep Tissue Wellness · Bed 02 (Sarah Tan)</p>
          <button class="btn btn-sm btn-primary full btn-demo-call-queue" data-queue="C-03" data-patient="Jason Lee" data-room="Wellness Bed 02">
            🔊 Call Queue C-03 (Audio Chime)
          </button>
        </div>
      </div>

      <!-- POS Cashier & SIMRS Ephemeral Proxy Row -->
      <div style="display:grid; grid-template-columns:1.2fr 0.8fr; gap:24px; margin-top:28px;">
        <div style="background:#fff; border:1px solid var(--line); border-radius:24px; padding:24px; box-shadow:var(--shadow-soft);">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
            <h4 style="font-size:16px; margin:0;" data-i18n="demo.rec.posTitle">💳 POS Cashier &amp; Settlement (Balance Payment)</h4>
            <span class="pill" style="font-size:10px;" data-i18n="demo.rec.posAutoDeduct">AUTO DEDUCT DEPOSIT</span>
          </div>

          <table class="timeline-table" style="min-width:auto;">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Service</th>
                <th>Total</th>
                <th>Deposit</th>
                <th>Balance Due</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Amanda Tan</strong> (A-01)</td>
                <td>Physiotherapy</td>
                <td>SGD 120.00</td>
                <td><span style="color:var(--success-dark); font-weight:800;">SGD 30.00</span></td>
                <td><strong style="color:var(--primary-dark);">SGD 90.00</strong></td>
                <td><button class="btn btn-sm btn-primary" onclick="openDemoPOSModal('A-01', 'Amanda Tan', '90.00')" data-i18n="demo.rec.settleBalance">Settle Balance</button></td>
              </tr>
              <tr>
                <td><strong>Nur Aisyah</strong> (B-02)</td>
                <td>TCM Acupuncture</td>
                <td>SGD 90.00</td>
                <td><span style="color:var(--success-dark); font-weight:800;">SGD 30.00</span></td>
                <td><strong style="color:var(--primary-dark);">SGD 60.00</strong></td>
                <td><button class="btn btn-sm btn-primary" onclick="openDemoPOSModal('B-02', 'Nur Aisyah', '60.00')" data-i18n="demo.rec.settleBalance">Settle Balance</button></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style="background:#fff; border:1px solid var(--line); border-radius:24px; padding:24px; box-shadow:var(--shadow-soft);">
          <h4 style="font-size:16px; margin-bottom:10px;" data-i18n="demo.rec.simrsTitle">🔁 SIMRS / EHR Referral Ephemeral Bridge</h4>
          <p style="font-size:13px; color:var(--muted); line-height:1.5; margin-bottom:16px;" data-i18n="demo.rec.simrsDesc">
            Forward insurance and referral files to partner hospital SIMRS/EHR webhook without storing permanent records (72-hour auto-purge).
          </p>
          <button class="btn btn-soft full" onclick="openDemoSIMRSInspection()" data-i18n="demo.rec.simrsBtn">Inspect SIMRS Webhook Payload (JSON)</button>
        </div>
      </div>
    </section>
  `;
}

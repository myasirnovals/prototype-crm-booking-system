/**
 * Cliniva — WhatsApp 2-Way Simulator Component (Role 6)
 * SOLID: Single Responsibility for rendering the interactive WhatsApp Reminder Engine & Anti-No Show Simulator
 */

export function renderWhatsAppSimulator() {
  return `
    <section class="demo-pane" id="paneWhatsAppSimulator">
      <div style="text-align:center; max-width:680px; margin:0 auto 28px;">
        <div class="pill" style="margin-bottom:12px;" data-i18n="demo.wa.badge">Anti-No Show Communication</div>
        <h2 style="font-size:30px; letter-spacing:-1px;" data-i18n="demo.wa.title">Two-Way WhatsApp Reminder Engine</h2>
        <p style="color:var(--muted); font-size:15px; margin-top:6px;" data-i18n="demo.wa.desc">
          WhatsApp achieves &gt;95% open rates compared to email (&lt;20%). Patients can confirm attendance or reschedule directly via interactive buttons.
        </p>
      </div>

      <div class="wa-demo-container">
        <div class="wa-demo-header">
          <div style="width:36px; height:36px; border-radius:50%; background:#25d366; display:grid; place-items:center; color:#fff; font-size:18px;">🏥</div>
          <div>
            <strong style="display:block; font-size:14px;">Cliniva Healthcare Official</strong>
            <small style="color:#dcfce7; font-size:11px;" data-i18n="demo.wa.headerStatus">Verified Clinic Gateway · Online</small>
          </div>
        </div>

        <div class="wa-demo-body">
          <div class="wa-msg wa-incoming">
            <strong data-i18n="demo.wa.clinicName">Orchard Wellness &amp; Therapy Clinic</strong><br>
            <span data-i18n="demo.wa.hello">Hello</span> <strong>Amanda Tan</strong>, <span data-i18n="demo.wa.msgConfirmed">your appointment is confirmed! 🎉</span><br><br>
            📅 <strong data-i18n="demo.wa.labelSchedule">Schedule:</strong> <span data-i18n="demo.wa.scheduleVal">Wed, 02 Sep 2026 • 10:30 SGT (UTC+8)</span><br>
            👨‍⚕️ <strong data-i18n="demo.wa.labelPractitioner">Practitioner:</strong> Dr. Lim Wei Han<br>
            🏥 <strong data-i18n="demo.wa.labelLocation">Location:</strong> <span data-i18n="demo.wa.locationVal">Paragon Medical Orchard #14-02, Singapore</span><br>
            🎟️ <strong data-i18n="demo.wa.labelTicketCode">Ticket Code:</strong> <code>BK-20260901-0812</code><br>
            💰 <strong data-i18n="demo.wa.labelDeposit">Deposit:</strong> <span data-i18n="demo.wa.depositVal">SGD 30.00 (Paid)</span>

            <div class="wa-actions-box">
              <button class="wa-action-btn" id="waBtnConfirmAttendance" data-i18n="demo.wa.btnConfirm">✅ Confirm Attendance</button>
              <button class="wa-action-btn" id="waBtnReschedule" data-i18n="demo.wa.btnReschedule">🔄 1-Click Reschedule</button>
              <button class="wa-action-btn" id="waBtnMaps" data-i18n="demo.wa.btnMaps">📍 Google Maps Directions</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;
}

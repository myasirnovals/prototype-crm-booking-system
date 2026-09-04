/**
 * Cliniva — Quick Walk-In Modal Component
 * SOLID: Single Responsibility for rendering the Quick Walk-In Patient Dispatch Modal (<30 Sec)
 */

export function renderWalkInModal() {
  return `
    <div class="demo-modal-backdrop" id="modalWalkIn">
      <div class="demo-modal-box">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:18px;">
          <h3 style="margin:0; font-size:18px;" data-i18n="demo.walkin.title">⚡ Quick Walk-in Dispatch (&lt;30 Sec)</h3>
          <button type="button" id="btnCloseWalkInModal" style="border:0; background:transparent; font-size:20px; cursor:pointer;">✕</button>
        </div>

        <form id="formQuickWalkIn">
          <div class="field">
            <label data-i18n="demo.walkin.name">Walk-in Patient Full Name</label>
            <input type="text" id="walkInName" data-i18n-placeholder="demo.walkin.namePlaceholder" placeholder="e.g. Robert Tan" required>
          </div>

          <div class="field">
            <label data-i18n="demo.walkin.phone">Patient WhatsApp Mobile (For Instant E-Ticket)</label>
            <input type="tel" id="walkInPhone" placeholder="+65 9123 4567" required>
          </div>

          <div class="field">
            <label data-i18n="demo.walkin.service">Select Fast-Track Clinical Service</label>
            <select id="walkInService">
              <option value="Physiotherapy">Physiotherapy &amp; Spine Rehab (Dr. Lim)</option>
              <option value="Acupuncture">TCM Acupuncture (Dr. Wong)</option>
              <option value="Wellness">Deep Tissue Massage (Sarah Tan)</option>
            </select>
          </div>

          <button type="submit" class="btn btn-primary full" style="margin-top:14px;" data-i18n="demo.walkin.submitBtn">
            Issue Walk-In Queue Ticket →
          </button>
        </form>
      </div>
    </div>
  `;
}

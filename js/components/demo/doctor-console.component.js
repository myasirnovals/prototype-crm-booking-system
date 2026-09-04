/**
 * Cliniva — Doctor & Practitioner Console Component (Role 3)
 * SOLID: Single Responsibility for rendering Practitioner queue, clinical assessment sheet, VAS slider, and procedures checklist
 */

export function renderDoctorConsole() {
  return `
    <section class="demo-pane" id="paneDoctor">
      <div class="role-header-banner">
        <div class="role-header-meta">
          <div class="role-avatar">👨‍⚕️</div>
          <div>
            <div class="pill" style="font-size:11px; padding:3px 10px; margin-bottom:4px;" data-i18n="demo.doc.roleBadge">ROLE: PRACTITIONER / DOCTOR / THERAPIST</div>
            <h2 style="font-size:22px; margin:0;" data-i18n="demo.doc.title">Practitioner Clinical Dashboard &amp; Therapy Notes</h2>
            <small style="color:var(--muted); font-size:12px;">Logged in: Dr. Lim Wei Han (Senior Physiotherapist) · Room A1</small>
          </div>
        </div>

        <div style="display:flex; gap:10px;">
          <span class="badge-live" style="background:#ecfdf5; color:#047857;" data-i18n="demo.doc.statusActive">STATUS: ACTIVE CONSULTATION</span>
        </div>
      </div>

      <div style="display:grid; grid-template-columns:0.9fr 1.1fr; gap:24px;">
        <!-- Left: Doctor's Queue for Today -->
        <div>
          <h3 style="font-size:17px; margin-bottom:14px;" data-i18n="demo.doc.queueTitle">Today's Patient Queue (3 Patients)</h3>

          <div class="doctor-patient-card active" data-patient="amanda">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <strong>Amanda Tan (28 Yrs)</strong>
              <span class="badge-live" style="font-size:10px;">IN PROGRESS</span>
            </div>
            <small style="color:var(--primary); font-weight:800; display:block; margin:4px 0;">09:00 - 10:00 • Physiotherapy &amp; Spine</small>
            <p style="font-size:12px; color:var(--muted); margin:0;" data-i18n="demo.doc.complaint.amanda">Complaint: Sharp lower back pain (L4-L5) radiating to right thigh.</p>
          </div>

          <div class="doctor-patient-card" data-patient="farhan">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <strong>Farhan Alatas (34 Yrs)</strong>
              <span class="status-pill pending" style="font-size:10px;">NEXT IN QUEUE</span>
            </div>
            <small style="color:var(--muted); font-weight:800; display:block; margin:4px 0;">11:15 - 12:15 • Post-Injury Rehab</small>
            <p style="font-size:12px; color:var(--muted); margin:0;" data-i18n="demo.doc.complaint.farhan">Complaint: Post-operative right knee ACL recovery.</p>
          </div>

          <div class="doctor-patient-card" data-patient="cynthia">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <strong>Cynthia Low (42 Yrs)</strong>
              <span class="status-pill confirmed" style="font-size:10px;">AFTERNOON (14:00)</span>
            </div>
            <small style="color:var(--muted); font-weight:800; display:block; margin:4px 0;">14:00 - 15:00 • Cervical &amp; Shoulder</small>
            <p style="font-size:12px; color:var(--muted); margin:0;" data-i18n="demo.doc.complaint.cynthia">Complaint: Neck stiffness and tension headache from desk work.</p>
          </div>
        </div>

        <!-- Right: Active Patient Clinical Sheet & Pain Map Viewer -->
        <div style="background:#fff; border:1px solid var(--line); border-radius:24px; padding:24px; box-shadow:var(--shadow-soft);">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; border-bottom:1px solid var(--line); padding-bottom:12px;">
            <div>
              <h3 style="font-size:18px; margin:0;" data-i18n="demo.doc.clinicalTitle">Clinical Assessment: Amanda Tan</h3>
              <small style="color:var(--muted);"><span data-i18n="demo.doc.treatmentPlan">Treatment Plan:</span> <strong data-i18n="demo.doc.planProgress">Session 3 of 8 (Scoliosis Plan)</strong></small>
            </div>
            <span class="pill" style="font-size:11px;">CODE: BK-20260901-0812</span>
          </div>

          <!-- Highlighted Pain Map Inspector -->
          <div style="background:#f8fafc; border:1px solid var(--line); border-radius:18px; padding:16px; margin-bottom:18px;">
            <div style="font-size:12px; font-weight:900; color:#334155; margin-bottom:8px;" data-i18n="demo.doc.painMapInput">
              📍 Visual Pain Map (Input from Patient Portal):
            </div>
            <div style="display:flex; gap:8px; flex-wrap:wrap;">
              <span class="pain-spot-tag active" style="font-size:12px;" data-i18n="demo.pain.lowerBack">⚡ Lower Back / Lumbar (L4-L5)</span>
              <span class="pain-spot-tag active" style="font-size:12px;" data-i18n="demo.pain.sciatica">💥 Pinched Nerve (HNP / Sciatica)</span>
            </div>
            <p style="font-size:12px; color:var(--text-secondary); margin-top:8px; line-height:1.4;">
              <strong data-i18n="demo.doc.historyLabel">Patient History:</strong> <span data-i18n="demo.doc.historyText">Desk worker &gt;8 hrs/day. Pain worsens upon forward bending. No prior fractures.</span>
            </p>
          </div>

          <!-- Clinical Progress & Pain Scale Slider -->
          <div style="margin-bottom:18px;">
            <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
              <label style="font-size:13px; font-weight:800;" data-i18n="demo.doc.vasLabel">Post-Treatment Pain Severity (VAS Scale 0-10):</label>
              <strong id="docPainScaleVal" style="color:var(--success-dark); font-size:15px;">3 / 10 (Mild Discomfort)</strong>
            </div>
            <input type="range" id="docPainScaleSlider" min="0" max="10" value="3" style="width:100%; accent-color:var(--primary); cursor:pointer;">
            <small style="color:var(--muted); font-size:11px; display:flex; justify-content:space-between; margin-top:4px;">
              <span data-i18n="demo.doc.vasPainFree">0 (Pain Free)</span>
              <span data-i18n="demo.doc.vasInitial">Initial: 8/10</span>
              <span data-i18n="demo.doc.vasSevere">10 (Severe Pain)</span>
            </small>
          </div>

          <!-- Action Checklist & Package Auto-Deduct -->
          <div class="field" style="margin-bottom:16px;">
            <label data-i18n="demo.doc.proceduresLabel">Clinical Procedures Administered Today:</label>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; font-size:12px; margin-top:6px;">
              <label><input type="checkbox" checked> <span data-i18n="demo.doc.proc.decompression">Decompression Spine</span></label>
              <label><input type="checkbox" checked> <span data-i18n="demo.doc.proc.shockwave">Shockwave 2000 Pulses</span></label>
              <label><input type="checkbox" checked> <span data-i18n="demo.doc.proc.coreStability">Core Stability Exercise</span></label>
              <label><input type="checkbox"> <span data-i18n="demo.doc.proc.homecareGuide">Homecare Exercise Guide</span></label>
            </div>
          </div>

          <button class="btn btn-primary full" id="btnDoctorCompleteSession" style="font-size:14px; padding:12px;" data-i18n="demo.doc.completeSessionBtn">
            ✓ Complete Session &amp; Deduct Plan Quota (5 Sessions Remaining) →
          </button>
        </div>
      </div>
    </section>
  `;
}

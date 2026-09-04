/**
 * Cliniva — Patient Booking Wizard Component (Role 1)
 * SOLID: Single Responsibility for rendering the 5-Step Patient Booking Intake & Checkout flow
 */

export function renderPatientWizard() {
  return `
    <section class="demo-pane active" id="panePatientBooking">
      <div style="text-align:center; max-width:680px; margin:0 auto 28px;">
        <div class="pill" style="margin-bottom:12px;" data-i18n="demo.journey">Step-by-Step Patient Journey</div>
        <h2 style="font-size:30px; letter-spacing:-1px;" data-i18n="demo.title">Patient Self-Booking Simulator</h2>
        <p style="color:var(--muted); font-size:15px; margin-top:6px;" data-i18n="demo.desc">
          Experience how patients effortlessly schedule therapies 24/7 without phone calls or double-booking collisions.
        </p>
      </div>

      <!-- Patient Booking Step Bar -->
      <div class="wizard-step-bar">
        <div class="wizard-step-item active" data-step="1">
          <div class="wizard-step-circle">1</div>
          <span class="wizard-step-label" data-i18n="demo.step1">Branch &amp; Service</span>
        </div>
        <div class="wizard-step-item" data-step="2">
          <div class="wizard-step-circle">2</div>
          <span class="wizard-step-label" data-i18n="demo.step2">Practitioner &amp; Engine</span>
        </div>
        <div class="wizard-step-item" data-step="3">
          <div class="wizard-step-circle">3</div>
          <span class="wizard-step-label" data-i18n="demo.step3">Slot &amp; Hold Timer</span>
        </div>
        <div class="wizard-step-item" data-step="4">
          <div class="wizard-step-circle">4</div>
          <span class="wizard-step-label" data-i18n="demo.step4">Intake &amp; Pain Map</span>
        </div>
        <div class="wizard-step-item" data-step="5">
          <div class="wizard-step-circle">5</div>
          <span class="wizard-step-label" data-i18n="demo.step5">Checkout &amp; Ticket</span>
        </div>
      </div>

      <div style="display:grid; grid-template-columns:1.3fr 0.7fr; gap:24px; align-items:start;">
        <!-- Left: Step Panels -->
        <div class="wizard-card">

          <!-- STEP 1: Branch & Service Selection -->
          <div class="wizard-step-panel active" id="wizardStep1">
            <h3 style="font-size:20px; margin-bottom:14px;" data-i18n="demo.step1Title">1. Choose Clinic Location &amp; Treatment</h3>

            <!-- Mode Selector: In-Clinic vs Homecare -->
            <div class="service-mode-tabs">
              <button class="service-mode-tab active" data-mode="in-clinic" data-i18n="demo.mode.inClinic">
                🏥 In-Clinic Treatment (Visit Branch)
              </button>
              <button class="service-mode-tab" data-mode="homecare" data-i18n="demo.mode.homecare">
                🚗 Homecare / Home Visit (+ Travel Matrix)
              </button>
            </div>

            <div id="homecareTravelBox" style="display:none; background:#ecfdf5; border:1px solid #a7f3d0; padding:12px 16px; border-radius:14px; margin-bottom:16px; font-size:13px; color:#065f46;" data-i18n="demo.homecareBuffer">
              📍 GPS Travel Logistics Buffer Active: Automatically calculates 15 km radius, therapist travel buffer 35 mins, and travel surcharge.
            </div>

            <div class="field">
              <label data-i18n="demo.selectBranch">Select Branch Location</label>
              <select id="demoBranchSelect">
                <option value="sg-orchard">🇸🇬 Orchard Wellness Clinic — Paragon Medical #14-02, Singapore</option>
                <option value="my-kl">🇲🇾 Kuala Lumpur Integrated Care — Pavilion Embassy, Malaysia</option>
                <option value="my-penang">🇲🇾 Penang TCM &amp; Physio Center — Gurney Walk, Penang</option>
              </select>
            </div>

            <label style="margin-top:16px; display:block; font-size:13px; font-weight:900; color:#334155;" data-i18n="demo.selectService">
              Select Therapy / Service Profile
            </label>
            <div class="service-cards" style="grid-template-columns:repeat(2,1fr);">
              <div class="service-card demo-service-card active" data-service="physio">
                <span class="service-profile-badge profile-physio">PHYSIOTHERAPY</span>
                <h4 data-i18n="demo.service.physio.title">Physiotherapy &amp; Spine Rehab</h4>
                <small data-i18n="demo.service.physio.meta">60 min · SGD 120 / MYR 280</small>
                <p style="font-size:11px; color:var(--muted); margin-top:6px;" data-i18n="demo.service.physio.desc">Postural assessment, manual decompression therapy.</p>
              </div>

              <div class="service-card demo-service-card" data-service="tcm">
                <span class="service-profile-badge profile-tcm">TCM ACUPUNCTURE</span>
                <h4 data-i18n="demo.service.tcm.title">Acupuncture &amp; Nerve Stimulator</h4>
                <small data-i18n="demo.service.tcm.meta">45 min · SGD 90 / MYR 210</small>
                <p style="font-size:11px; color:var(--muted); margin-top:6px;" data-i18n="demo.service.tcm.desc">Pulse diagnosis, electro-acupuncture needle therapy.</p>
              </div>

              <div class="service-card demo-service-card" data-service="wellness">
                <span class="service-profile-badge profile-spa">SPA &amp; WELLNESS</span>
                <h4 data-i18n="demo.service.wellness.title">Deep Tissue &amp; Herbal Aroma</h4>
                <small data-i18n="demo.service.wellness.meta">75 min · SGD 150 / MYR 350</small>
                <p style="font-size:11px; color:var(--muted); margin-top:6px;" data-i18n="demo.service.wellness.desc">Myofascial release with essential herbal oil infusion.</p>
              </div>

              <div class="service-card demo-service-card" data-service="referral">
                <span class="service-profile-badge profile-medical">MEDICAL REFERRAL</span>
                <h4 data-i18n="demo.service.referral.title">Faskes / Insurance Bridging</h4>
                <small data-i18n="demo.service.referral.meta">30 min · Ephemeral Proxy</small>
                <p style="font-size:11px; color:var(--muted); margin-top:6px;" data-i18n="demo.service.referral.desc">Forward BPJS/Insurance referral document to SIMRS.</p>
              </div>
            </div>

            <div style="display:flex; justify-content:flex-end; margin-top:24px;">
              <button class="btn btn-primary btn-wizard-next" data-i18n="demo.btnNextPrac">Next: Practitioner &amp; Engine →</button>
            </div>
          </div>

          <!-- STEP 2: Practitioner & Triple-Constraint Engine -->
          <div class="wizard-step-panel" id="wizardStep2">
            <h3 style="font-size:20px; margin-bottom:10px;" data-i18n="demo.step2Title">2. Practitioner &amp; Multi-Resource Allocation</h3>
            <p style="color:var(--muted); font-size:13px; margin-bottom:18px;" data-i18n="demo.step2Desc">
              Cliniva's Triple-Constraint engine validates simultaneous real-time availability of Practitioner + Room/Bed + Medical Device.
            </p>

            <div class="field">
              <label data-i18n="demo.selectPrac">Select Preferred Doctor / Practitioner</label>
              <select id="demoPracSelect">
                <option value="dr-lim">Dr. Lim Wei Han (Senior Physiotherapist - Spine &amp; Sports)</option>
                <option value="dr-wong">Dr. Wong Mei Ling (Registered TCM Physician)</option>
                <option value="therapist-sarah">Therapist Sarah Tan (Lead Clinical Therapist)</option>
                <option value="sinse-huang">Sinse Huang Wei, B.Med (TCM Acupuncturist)</option>
              </select>
            </div>

            <!-- Triple Constraint Live Inspector -->
            <div class="tc-inspector">
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <strong data-i18n="demo.tc.status">⚡ Triple-Constraint Engine Status</strong>
                <span class="badge-live" style="background:#042f2e; color:#2dd4bf; border:1px solid #14b8a6;" data-i18n="demo.tc.zeroCollision">ZERO COLLISION GUARANTEE</span>
              </div>

              <div class="tc-grid">
                <div class="tc-card">
                  <span style="color:#94a3b8; font-size:10px;" data-i18n="demo.tc.practitioner">1. PRACTITIONER</span>
                  <strong id="tcPractitionerVal">Dr. Lim Wei Han (Ready)</strong>
                  <span data-i18n="demo.tc.pracStatus">✓ 100% Available</span>
                </div>
                <div class="tc-card">
                  <span style="color:#94a3b8; font-size:10px;" data-i18n="demo.tc.room">2. ROOM / BED</span>
                  <strong id="tcRoomVal">Room A2 - Bed 01</strong>
                  <span data-i18n="demo.tc.roomStatus">✓ Sterilized (15m Buffer)</span>
                </div>
                <div class="tc-card">
                  <span style="color:#94a3b8; font-size:10px;" data-i18n="demo.tc.equipment">3. SPECIALIZED EQUIPMENT</span>
                  <strong id="tcEquipVal">Shockwave Therapy Unit</strong>
                  <span data-i18n="demo.tc.equipStatus">✓ Calibrated &amp; Ready</span>
                </div>
              </div>
            </div>

            <div style="display:flex; justify-content:space-between; margin-top:24px;">
              <button class="btn btn-soft btn-wizard-prev" data-i18n="common.back">← Back</button>
              <button class="btn btn-primary btn-wizard-next" data-i18n="demo.btnNextSlot">Next: Date &amp; Slot Hold →</button>
            </div>
          </div>

          <!-- STEP 3: Slot Picker & Hold Countdown Timer -->
          <div class="wizard-step-panel" id="wizardStep3">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
              <h3 style="font-size:20px;" data-i18n="demo.step3Title">3. Choose Date &amp; Available Time Slot</h3>
              <div class="hold-timer-badge">
                <span data-i18n="demo.holdTimerLabel">⏳ Temporary Hold:</span>
                <strong id="demoHoldTimerDisplay">10:00 left</strong>
              </div>
            </div>

            <p style="color:var(--muted); font-size:13px; margin-bottom:18px;" data-i18n="demo.holdTimerDesc">
              Selected slots are exclusively held for 10 minutes to prevent collisions while you complete your intake form.
            </p>

            <div class="field">
              <label for="demoDateInput" data-i18n="demo.selectDate">Select Appointment Date</label>
              <input type="date" id="demoDateInput" style="max-width:260px;" required>
              <small style="color:var(--muted); font-size:11px; display:block; margin-top:4px;" data-i18n="demo.pastDisabled">* Past dates automatically disabled.</small>
            </div>

            <label style="font-size:13px; font-weight:900; margin-bottom:8px; display:block;" data-i18n="demo.availableSlots">Available Slots Today</label>
            <div class="slot-grid" style="grid-template-columns:repeat(4,1fr); gap:10px;">
              <div class="slot demo-slot">09:00</div>
              <div class="slot demo-slot active">10:30</div>
              <div class="slot demo-slot">11:45</div>
              <div class="slot demo-slot">14:00</div>
              <div class="slot demo-slot">15:30</div>
              <div class="slot demo-slot">16:15</div>
              <div class="slot demo-slot">17:00</div>
              <div class="slot demo-slot">18:30</div>
            </div>

            <div style="display:flex; justify-content:space-between; margin-top:24px;">
              <button class="btn btn-soft btn-wizard-prev" data-i18n="common.back">← Back</button>
              <button class="btn btn-primary btn-wizard-next" data-i18n="demo.btnNextIntake">Next: Intake &amp; Pain Map →</button>
            </div>
          </div>

          <!-- STEP 4: Dynamic Intake Form & Visual Body Pain Map -->
          <div class="wizard-step-panel" id="wizardStep4">
            <h3 style="font-size:20px; margin-bottom:10px;" data-i18n="demo.step4Title">4. Dynamic Intake &amp; Visual Pain Map</h3>
            <p style="color:var(--muted); font-size:13px; margin-bottom:18px;" data-i18n="demo.step4Desc">
              This intake assessment dynamically adapts to the selected clinical practice profile.
            </p>

            <!-- TCM / Physio Profile: Visual Body Pain Map -->
            <div id="intakeGroupTCM">
              <label style="font-size:13px; font-weight:900; color:#334155;" data-i18n="demo.painMapTitle">
                Visual Body Pain Map (Tap to highlight discomfort location)
              </label>

              <div class="pain-map-container">
                <div class="body-silhouette">
                  <svg width="120" height="200" viewBox="0 0 100 180" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="50" cy="20" r="14" fill="#cbd5e1" stroke="#64748b" stroke-width="2"/>
                    <rect x="42" y="34" width="16" height="12" fill="#cbd5e1"/>
                    <path d="M25 46 C25 46, 40 44, 50 44 C60 44, 75 46, 75 46 L82 90 L70 92 L62 58 L62 105 L66 165 L52 165 L50 115 L48 165 L34 165 L38 105 L38 58 L30 92 L18 90 Z" fill="#cbd5e1" stroke="#64748b" stroke-width="2"/>
                  </svg>
                </div>

                <div class="pain-spots-grid">
                  <span class="pain-spot-tag" data-spot="Head / Migraine" data-i18n="demo.pain.head">💆 Head &amp; Migraine</span>
                  <span class="pain-spot-tag" data-spot="Stiff Neck & Shoulder" data-i18n="demo.pain.neck">🧣 Stiff Neck &amp; Shoulder</span>
                  <span class="pain-spot-tag" data-spot="Upper Back" data-i18n="demo.pain.upperBack">🦾 Upper Back (Thoracic)</span>
                  <span class="pain-spot-tag active" data-spot="Lower Back / Lumbar" data-i18n="demo.pain.lowerBack">⚡ Lower Back / Lumbar (L4-L5)</span>
                  <span class="pain-spot-tag" data-spot="Knee Joint" data-i18n="demo.pain.knee">🦵 Knee Joint (Knee Pain)</span>
                  <span class="pain-spot-tag" data-spot="Foot Sole" data-i18n="demo.pain.plantar">🦶 Foot Sole (Plantar)</span>
                  <span class="pain-spot-tag" data-spot="Pinched Nerve" data-i18n="demo.pain.sciatica">💥 Pinched Nerve (HNP / Sciatica)</span>
                </div>
              </div>
            </div>

            <!-- Spa Profile: Pressure & Aromatherapy -->
            <div id="intakeGroupSpa" style="display:none; margin-top:16px;">
              <div class="field">
                <label data-i18n="demo.spa.pressure">Massage Pressure Preference</label>
                <select>
                  <option data-i18n="demo.spa.pressureMedium">Medium Relaxing (Moderate Pressure)</option>
                  <option data-i18n="demo.spa.pressureSoft">Soft Gentle (Light Touch)</option>
                  <option data-i18n="demo.spa.pressureDeep">Deep Tissue Strong (Firm Pressure)</option>
                </select>
              </div>
              <div class="field">
                <label data-i18n="demo.spa.aroma">Infused Essential Aroma</label>
                <select>
                  <option>🌿 Lavender &amp; Chamomile (Calming)</option>
                  <option>🌱 Peppermint &amp; Eucalyptus (Refreshing)</option>
                  <option>🪵 Lemongrass &amp; Ginger (Herbal Detox)</option>
                </select>
              </div>
            </div>

            <!-- Medical Referral Profile: Upload Document -->
            <div id="intakeGroupMedical" style="display:none; margin-top:16px;">
              <div class="field">
                <label data-i18n="demo.med.refNumber">Insurance / Referral ID</label>
                <input type="text" placeholder="e.g. 0115R0010926P0001">
              </div>
              <div class="field">
                <label data-i18n="demo.med.refUpload">Upload Referral Document (Ephemeral Transit 72 Hours)</label>
                <input type="file" style="background:#fff;">
              </div>
            </div>

            <div class="field" style="margin-top:16px;">
              <label data-i18n="demo.notes">Additional Patient Notes (Specific Symptoms / Allergies)</label>
              <textarea rows="3" data-i18n-placeholder="demo.notesPlaceholder" placeholder="Mention any allergies to topical oils, medications, or special requests..."></textarea>
            </div>

            <label class="checkbox-line">
              <input type="checkbox" checked>
              <span data-i18n="demo.pdpaConsent">I consent to data processing and WhatsApp communications based on Singapore PDPA &amp; Malaysia PDPA compliance.</span>
            </label>

            <div style="display:flex; justify-content:space-between; margin-top:24px;">
              <button class="btn btn-soft btn-wizard-prev" data-i18n="common.back">← Back</button>
              <button class="btn btn-primary btn-wizard-next" data-i18n="demo.btnNextCheckout">Continue to Review &amp; Checkout →</button>
            </div>
          </div>

          <!-- STEP 5: Checkout & Final Confirmation -->
          <div class="wizard-step-panel" id="wizardStep5">
            <h3 style="font-size:20px; margin-bottom:14px;" data-i18n="demo.step5Title">5. Review &amp; Secure Checkout</h3>

            <div style="background:#f8fafc; border:1px solid var(--line); border-radius:18px; padding:18px; margin-bottom:18px;">
              <h4 style="font-size:15px; margin-bottom:12px;" data-i18n="demo.pay.settlementOption">Payment &amp; Settlement Option:</h4>
              <div class="pay-option-cards">
                <label class="pay-option-card active" data-paytype="deposit">
                  <input type="radio" name="payType" value="deposit" checked>
                  <span data-i18n="demo.pay.deposit">Deposit (Hold Slot)</span>
                </label>
                <label class="pay-option-card" data-paytype="full">
                  <input type="radio" name="payType" value="full">
                  <span data-i18n="demo.pay.full">Full Payment</span>
                </label>
                <label class="pay-option-card" data-paytype="clinic">
                  <input type="radio" name="payType" value="clinic">
                  <span data-i18n="demo.pay.clinic">Pay at Clinic</span>
                </label>
              </div>
              <p id="payTypeDesc" style="font-size:12px; color:var(--text-secondary); margin-top:10px; margin-bottom:0;" data-i18n="demo.pay.descDeposit">
                💡 Pay deposit now to guarantee your slot, settle remaining balance at the clinic cashier after treatment.
              </p>
            </div>

            <div class="field" id="paymentMethodField">
              <label data-i18n="demo.pay.methodLabel">Select Regional Payment Method</label>
              <select id="demoPaymentChannelSelect">
                <option>🇸🇬 PayNow QR (Singapore Instant Rails)</option>
                <option>🇲🇾 DuitNow QR &amp; FPX Online Banking (Malaysia)</option>
                <option>💳 Credit / Debit Card (Stripe Encrypted)</option>
              </select>
            </div>

            <button class="btn btn-primary full" id="btnConfirmDemoBooking" style="font-size:16px; padding:16px;" data-i18n="demo.pay.btnConfirm">
              ⚡ Complete Checkout &amp; Issue WhatsApp E-Ticket →
            </button>

            <div class="wizard-bottom-actions">
              <button class="btn btn-soft btn-wizard-prev" data-i18n="demo.pay.backToIntake">← Back to Intake Form</button>
              <button class="btn btn-primary" id="btnBottomCheckout" data-i18n="demo.pay.btnBottom">
                💳 Complete Checkout &amp; Confirm Now →
              </button>
            </div>
          </div>

        </div>

        <!-- Right: Real-Time Order & Engine Summary Card -->
        <div style="background:#fff; border:1px solid var(--line); border-radius:24px; padding:22px; box-shadow:var(--shadow-soft);">
          <div class="preview-card" style="margin-bottom:16px; padding:18px;">
            <div style="font-size:11px; font-weight:800; opacity:0.85;" data-i18n="demo.summary.badge">LIVE ORDER SUMMARY</div>
            <h4 style="font-size:18px; margin:4px 0;" data-i18n="demo.summary.engineTitle">Cliniva Intake Engine</h4>
            <p style="font-size:12px; opacity:0.9;" data-i18n="demo.summary.engineSubtitle">Automated scheduling and multi-resource allocation.</p>
          </div>

          <div class="summary-list">
            <div class="summary-item">
              <span data-i18n="demo.summary.branch">Branch Location:</span>
              <strong id="summaryBranch">Orchard Wellness Clinic</strong>
            </div>
            <div class="summary-item">
              <span data-i18n="demo.summary.service">Selected Service:</span>
              <strong id="summaryService">Physiotherapy (SGD 120)</strong>
            </div>
            <div class="summary-item">
              <span data-i18n="demo.summary.practitioner">Practitioner:</span>
              <strong id="summaryPractitioner">Dr. Lim Wei Han</strong>
            </div>
            <div class="summary-item">
              <span data-i18n="demo.summary.schedule">Schedule Slot:</span>
              <strong id="summarySchedule" style="color:var(--primary);">Wednesday, 10:30 SGT</strong>
            </div>
            <div class="summary-item">
              <span data-i18n="demo.summary.painFocus">Primary Complaint:</span>
              <strong id="summaryPain">Lower Back / Lumbar</strong>
            </div>
            <div class="summary-item">
              <span id="summaryPayLabel" data-i18n="demo.summary.payLabelDeposit">Deposit Commitment (Online):</span>
              <strong id="summaryDeposit" style="color:var(--success-dark);">SGD 30.00 (Deposit)</strong>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;
}

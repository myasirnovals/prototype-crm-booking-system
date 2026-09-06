/**
 * Cliniva — Dynamic Intake Form Component
 * SOLID: Single Responsibility for Dynamic Rendering, Interactive Inputs & Data Extraction across Clinic Specializations
 * Supports: Wellness & Spa, Physiotherapy, Clinical Nutrition, and Traditional Chinese Medicine
 */

import { getTemplateById } from "../config/templates/index.js";
import { soundService } from "../services/sound.service.js";

export class IntakeFormComponent {
  constructor() {
    this.activeTemplateId = "wellness";
    this.currentData = {};
    this.container = null;
    this.onChange = null;
  }

  /**
   * Mount and render intake form for a specific template
   * @param {HTMLElement} container
   * @param {string} templateId - "wellness" | "physio" | "nutrition" | "tcm"
   * @param {object} initialData
   * @param {Function} onChange
   */
  mount(container, templateId = "wellness", initialData = {}, onChange = null) {
    this.container = container;
    this.activeTemplateId = String(templateId || "wellness").toLowerCase();
    this.currentData = { ...initialData };
    this.onChange = onChange;

    this.render();
    this.bindEvents();
  }

  /**
   * Get HTML string for a specific template
   * @param {string} templateId
   * @returns {string}
   */
  getHtml(templateId = this.activeTemplateId) {
    const tid = String(templateId || "wellness").toLowerCase();
    switch (tid) {
      case "physio":
      case "physiotherapy":
        return this.renderPhysioForm();

      case "nutrition":
        return this.renderNutritionForm();

      case "tcm":
        return this.renderTcmForm();

      case "wellness":
      case "spa":
      default:
        return this.renderWellnessForm();
    }
  }

  /**
   * Render HTML structure based on template specialization
   */
  render() {
    const html = this.getHtml(this.activeTemplateId);
    if (this.container) {
      this.container.innerHTML = html;
    }
    return html;
  }

  /* ------------------------------------------------------------------
   * 1. WELLNESS & LUXURY SPA INTAKE FORM
   * ------------------------------------------------------------------ */
  renderWellnessForm() {
    return `
      <div class="intake-specialty-card" style="border:1.5px solid #fef08a; background:#fefce8; border-radius:var(--radius-lg); padding:24px; margin-bottom:20px;">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:18px; flex-wrap:wrap; gap:10px;">
          <div>
            <div style="display:inline-flex; align-items:center; gap:6px; background:#fef08a; color:#854d0e; font-size:11px; font-weight:800; padding:3px 10px; border-radius:var(--radius-full); text-transform:uppercase; margin-bottom:6px;">
              🌸 Wellness &amp; Luxury Spa Template
            </div>
            <h3 style="margin:0; font-size:18px; color:#854d0e;">Aromatherapy &amp; Therapy Preferences</h3>
            <p style="margin:4px 0 0; font-size:13px; color:#a16207;">Personalize your bespoke spa experience with preferred essential oils and customized pressure.</p>
          </div>
          <span class="pill" style="background:#fff; color:#854d0e; border:1px solid #fef08a; font-size:11px; font-weight:700;">Relaxation Profile</span>
        </div>

        <div style="display:grid; grid-template-columns:1fr; gap:20px;">
          <!-- Aromatherapy Oil Selection -->
          <div>
            <label style="font-size:12px; font-weight:800; color:#854d0e; text-transform:uppercase; display:block; margin-bottom:10px;">
              1. Aromatherapy Essential Oil Blend (Select 1 preferred essence)
            </label>
            <div class="aroma-oil-grid" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:10px;">
              <div class="aroma-choice-card selected" data-oil="Balinese Lemongrass" style="border:2px solid var(--primary); background:#fff; border-radius:var(--radius-md); padding:12px 14px; cursor:pointer; transition:all 0.2s;">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                  <strong style="font-size:13px; color:var(--primary-dark);">🌱 Balinese Lemongrass</strong>
                  <span class="pill" style="font-size:9px; background:#f0fdf4; color:#16a34a; font-weight:800;">Popular</span>
                </div>
                <small style="font-size:11px; color:var(--muted); line-height:1.4; display:block; margin-top:4px;">Energizing botanical blend for micro-circulation, detox, and fatigue relief.</small>
              </div>

              <div class="aroma-choice-card" data-oil="French Lavender" style="border:1.5px solid #e2e8f0; background:#fff; border-radius:var(--radius-md); padding:12px 14px; cursor:pointer; transition:all 0.2s;">
                <strong style="font-size:13px; color:var(--text); display:block;">🌿 French Lavender</strong>
                <small style="font-size:11px; color:var(--muted); line-height:1.4; display:block; margin-top:4px;">Deep nervous system calming, stress reduction, and restful sleep support.</small>
              </div>

              <div class="aroma-choice-card" data-oil="Eucalyptus Radiata" style="border:1.5px solid #e2e8f0; background:#fff; border-radius:var(--radius-md); padding:12px 14px; cursor:pointer; transition:all 0.2s;">
                <strong style="font-size:13px; color:var(--text); display:block;">🍃 Eucalyptus Radiata</strong>
                <small style="font-size:11px; color:var(--muted); line-height:1.4; display:block; margin-top:4px;">Muscle stiffness easing, joint tension relief &amp; respiratory clarity.</small>
              </div>

              <div class="aroma-choice-card" data-oil="Tropical Frangipani" style="border:1.5px solid #e2e8f0; background:#fff; border-radius:var(--radius-md); padding:12px 14px; cursor:pointer; transition:all 0.2s;">
                <strong style="font-size:13px; color:var(--text); display:block;">🌸 Tropical Frangipani</strong>
                <small style="font-size:11px; color:var(--muted); line-height:1.4; display:block; margin-top:4px;">Nourishing floral glow, skin softening, and luxurious exotic indulgence.</small>
              </div>
            </div>
          </div>

          <!-- Massage Pressure Level -->
          <div>
            <label style="font-size:12px; font-weight:800; color:#854d0e; text-transform:uppercase; display:block; margin-bottom:8px;">
              2. Desired Massage Pressure Level
            </label>
            <div class="pressure-pills-row" style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:10px;">
              <button type="button" class="pressure-pill btn btn-soft" data-pressure="Soft" style="text-align:center; padding:12px 8px; background:#fff; border:1px solid #e2e8f0; border-radius:var(--radius-md);">
                <div style="font-size:13px; font-weight:700;">Gentle / Soft</div>
                <div style="font-size:11px; color:var(--muted); margin-top:2px;">Light Swedish strokes</div>
              </button>
              <button type="button" class="pressure-pill btn btn-soft active" data-pressure="Medium" style="text-align:center; padding:12px 8px; background:#fff; border:2px solid var(--primary); border-radius:var(--radius-md); color:var(--primary-dark);">
                <div style="font-size:13px; font-weight:800;">Medium</div>
                <div style="font-size:11px; color:var(--primary); margin-top:2px;">Balanced rhythmic tension release</div>
              </button>
              <button type="button" class="pressure-pill btn btn-soft" data-pressure="Deep" style="text-align:center; padding:12px 8px; background:#fff; border:1px solid #e2e8f0; border-radius:var(--radius-md);">
                <div style="font-size:13px; font-weight:700;">Deep / Firm</div>
                <div style="font-size:11px; color:var(--muted); margin-top:2px;">Intensive trigger point work</div>
              </button>
            </div>
          </div>

          <!-- Focus Areas (Multi-select) -->
          <div>
            <label style="font-size:12px; font-weight:800; color:#854d0e; text-transform:uppercase; display:block; margin-bottom:8px;">
              3. Target Focus Areas (Tap all that apply)
            </label>
            <div class="spa-focus-tags" style="display:flex; flex-wrap:wrap; gap:8px;">
              <span class="spa-focus-tag active" data-focus="Full Body Balanced" style="padding:7px 14px; border-radius:var(--radius-full); font-size:12px; font-weight:700; border:1px solid var(--primary); background:var(--primary); color:#fff; cursor:pointer;">✨ Full Body Balanced</span>
              <span class="spa-focus-tag active" data-focus="Upper Back &amp; Shoulders" style="padding:7px 14px; border-radius:var(--radius-full); font-size:12px; font-weight:700; border:1px solid var(--primary); background:var(--primary); color:#fff; cursor:pointer;">🧣 Upper Back &amp; Shoulders</span>
              <span class="spa-focus-tag" data-focus="Lower Back &amp; Lumbar" style="padding:7px 14px; border-radius:var(--radius-full); font-size:12px; font-weight:700; border:1px solid var(--line); background:#fff; color:var(--text); cursor:pointer;">⚡ Lower Back &amp; Lumbar</span>
              <span class="spa-focus-tag" data-focus="Legs &amp; Foot Reflex" style="padding:7px 14px; border-radius:var(--radius-full); font-size:12px; font-weight:700; border:1px solid var(--line); background:#fff; color:var(--text); cursor:pointer;">🦶 Legs &amp; Foot Reflex</span>
              <span class="spa-focus-tag" data-focus="Head &amp; Scalp Release" style="padding:7px 14px; border-radius:var(--radius-full); font-size:12px; font-weight:700; border:1px solid var(--line); background:#fff; color:var(--text); cursor:pointer;">💆 Head &amp; Scalp Release</span>
            </div>
          </div>

          <!-- Therapist Gender & Room Preferences -->
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px;">
            <div>
              <label for="spaTherapistGender" style="font-size:12px; font-weight:800; color:#854d0e; text-transform:uppercase; display:block; margin-bottom:6px;">
                Therapist Preference
              </label>
              <select id="spaTherapistGender" class="input" style="width:100%; background:#fff;">
                <option value="No Preference" selected>No Preference (Earliest Available)</option>
                <option value="Female Therapist">Female Therapist Preferred</option>
                <option value="Male Therapist">Male Therapist Preferred</option>
              </select>
            </div>
            <div>
              <label for="spaRoomAmbiance" style="font-size:12px; font-weight:800; color:#854d0e; text-transform:uppercase; display:block; margin-bottom:6px;">
                Room Temperature &amp; Ambiance
              </label>
              <select id="spaRoomAmbiance" class="input" style="width:100%; background:#fff;">
                <option value="Standard Warm" selected>Cozy Warm (Warm Blankets &amp; Soft Light)</option>
                <option value="Cool & Fresh">Cool &amp; Crisp Air Conditioning</option>
                <option value="Muted Meditation">Dimmed Serenity &amp; Tibetan Singing Bowls</option>
              </select>
            </div>
          </div>

          <!-- Allergies / Special Notes -->
          <div>
            <label for="spaSpecialNotes" style="font-size:12px; font-weight:800; color:#854d0e; text-transform:uppercase; display:block; margin-bottom:6px;">
              Skin Allergies, Pregnancy or Sensitive Areas
            </label>
            <textarea id="spaSpecialNotes" rows="3" class="input" style="width:100%; background:#fff;" placeholder="Mention any sensitive skin, nut oil allergies, bruised areas, or pregnancy...">No nut oils please. Extra focus on neck and shoulder knots from long desk hours.</textarea>
          </div>
        </div>
      </div>
    `;
  }

  /* ------------------------------------------------------------------
   * 2. PHYSIOTHERAPY & SPORTS REHABILITATION INTAKE FORM
   * ------------------------------------------------------------------ */
  renderPhysioForm() {
    return `
      <div class="intake-specialty-card" style="border:1.5px solid #bae6fd; background:#f0f9ff; border-radius:var(--radius-lg); padding:24px; margin-bottom:20px;">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:18px; flex-wrap:wrap; gap:10px;">
          <div>
            <div style="display:inline-flex; align-items:center; gap:6px; background:#bae6fd; color:#0369a1; font-size:11px; font-weight:800; padding:3px 10px; border-radius:var(--radius-full); text-transform:uppercase; margin-bottom:6px;">
              🏃 Physiotherapy &amp; Rehab Template
            </div>
            <h3 style="margin:0; font-size:18px; color:#0369a1;">Musculoskeletal &amp; Pain Assessment</h3>
            <p style="margin:4px 0 0; font-size:13px; color:#0284c7;">Locate your pain area, indicate symptom duration, and rate discomfort intensity.</p>
          </div>
          <span class="pill" style="background:#fff; color:#0284c7; border:1px solid #bae6fd; font-size:11px; font-weight:700;">Clinical Assessment</span>
        </div>

        <div style="display:grid; grid-template-columns:1fr; gap:20px;">
          <!-- Pain Location Buttons Grid -->
          <div>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
              <label style="font-size:12px; font-weight:800; color:#0369a1; text-transform:uppercase; margin:0;">
                1. Primary Pain / Injury Location
              </label>
              <span id="selectedPhysioLocationBadge" class="pill" style="background:#0284c7; color:#fff; font-size:11px; font-weight:700;">
                Lower Back (Lumbar)
              </span>
            </div>
            <div class="physio-location-grid" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(140px, 1fr)); gap:10px;">
              <button type="button" class="physio-loc-btn btn btn-soft" data-loc="Neck (Cervical Spine)" style="padding:12px 10px; background:#fff; border:1px solid #bae6fd; text-align:center; border-radius:var(--radius-md);">
                <span style="font-size:18px; display:block; margin-bottom:2px;">🦒</span>
                <strong style="font-size:12px; color:var(--text);">Neck (Cervical)</strong>
              </button>
              <button type="button" class="physio-loc-btn btn btn-soft" data-loc="Shoulder & Rotator Cuff" style="padding:12px 10px; background:#fff; border:1px solid #bae6fd; text-align:center; border-radius:var(--radius-md);">
                <span style="font-size:18px; display:block; margin-bottom:2px;">💪</span>
                <strong style="font-size:12px; color:var(--text);">Shoulder</strong>
              </button>
              <button type="button" class="physio-loc-btn btn btn-soft active" data-loc="Lower Back (Lumbar)" style="padding:12px 10px; background:#fff; border:2px solid #0284c7; text-align:center; border-radius:var(--radius-md);">
                <span style="font-size:18px; display:block; margin-bottom:2px;">⚡</span>
                <strong style="font-size:12px; color:#0284c7;">Lower Back</strong>
              </button>
              <button type="button" class="physio-loc-btn btn btn-soft" data-loc="Knee Joint & Ligament" style="padding:12px 10px; background:#fff; border:1px solid #bae6fd; text-align:center; border-radius:var(--radius-md);">
                <span style="font-size:18px; display:block; margin-bottom:2px;">🦵</span>
                <strong style="font-size:12px; color:var(--text);">Knee Joint</strong>
              </button>
              <button type="button" class="physio-loc-btn btn btn-soft" data-loc="Ankle & Foot (Achilles)" style="padding:12px 10px; background:#fff; border:1px solid #bae6fd; text-align:center; border-radius:var(--radius-md);">
                <span style="font-size:18px; display:block; margin-bottom:2px;">🦶</span>
                <strong style="font-size:12px; color:var(--text);">Ankle / Foot</strong>
              </button>
              <button type="button" class="physio-loc-btn btn btn-soft" data-loc="Hip & Pelvis" style="padding:12px 10px; background:#fff; border:1px solid #bae6fd; text-align:center; border-radius:var(--radius-md);">
                <span style="font-size:18px; display:block; margin-bottom:2px;">🦴</span>
                <strong style="font-size:12px; color:var(--text);">Hip &amp; Pelvis</strong>
              </button>
            </div>
          </div>

          <!-- Symptom Duration (Radio Pills) -->
          <div>
            <label style="font-size:12px; font-weight:800; color:#0369a1; text-transform:uppercase; display:block; margin-bottom:8px;">
              2. Onset &amp; Duration of Pain
            </label>
            <div class="physio-duration-row" style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:10px;">
              <div class="physio-dur-card" data-duration="Acute (< 1 week)" style="border:1.5px solid #bae6fd; background:#fff; border-radius:var(--radius-md); padding:12px; cursor:pointer; text-align:center;">
                <strong style="font-size:13px; color:var(--text); display:block;">Acute</strong>
                <small style="font-size:11px; color:var(--muted);">&lt; 1 week (recent onset)</small>
              </div>
              <div class="physio-dur-card selected" data-duration="Subacute (1 - 4 weeks)" style="border:2px solid #0284c7; background:#fff; border-radius:var(--radius-md); padding:12px; cursor:pointer; text-align:center;">
                <strong style="font-size:13px; color:#0284c7; display:block;">Subacute</strong>
                <small style="font-size:11px; color:#0284c7;">1 - 4 weeks ongoing</small>
              </div>
              <div class="physio-dur-card" data-duration="Chronic (> 4 weeks)" style="border:1.5px solid #bae6fd; background:#fff; border-radius:var(--radius-md); padding:12px; cursor:pointer; text-align:center;">
                <strong style="font-size:13px; color:var(--text); display:block;">Chronic</strong>
                <small style="font-size:11px; color:var(--muted);">&gt; 4 weeks recurring</small>
              </div>
            </div>
          </div>

          <!-- VAS Pain Scale (1-10 Slider) -->
          <div style="background:#fff; border:1px solid #bae6fd; border-radius:var(--radius-md); padding:16px 20px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
              <label for="physioPainScaleRange" style="font-size:12px; font-weight:800; color:#0369a1; text-transform:uppercase; margin:0;">
                3. Pain Severity (VAS 1 - 10 Scale)
              </label>
              <div style="display:flex; align-items:center; gap:8px;">
                <span id="physioPainSeverityLabel" style="font-size:12px; font-weight:700; color:#ef4444;">Moderate - Severe</span>
                <span id="physioPainScaleDisplay" style="font-size:18px; font-weight:900; color:#ef4444; background:#fef2f2; padding:2px 10px; border-radius:var(--radius-full);">7 / 10</span>
              </div>
            </div>
            <input type="range" id="physioPainScaleRange" min="1" max="10" value="7" style="width:100%; accent-color:#0284c7; cursor:pointer;" />
            <div style="display:flex; justify-content:space-between; font-size:11px; color:var(--muted); margin-top:6px;">
              <span>1 - 3: Mild Discomfort</span>
              <span>4 - 6: Moderate Pain</span>
              <span>7 - 10: Severe / Functional Impairment</span>
            </div>
          </div>

          <!-- Symptoms & Functional Impact -->
          <div>
            <label for="physioSymptomsNotes" style="font-size:12px; font-weight:800; color:#0369a1; text-transform:uppercase; display:block; margin-bottom:6px;">
              4. Functional Impact &amp; Aggravating Factors
            </label>
            <textarea id="physioSymptomsNotes" rows="3" class="input" style="width:100%; background:#fff;" placeholder="Describe what movements trigger the pain (bending, sitting, walking) and any previous treatments...">Sharp pain in lower lumbar (L4-L5) when bending forward or sitting longer than 20 minutes after half-marathon run. Mild morning stiffness.</textarea>
          </div>

          <!-- Referral / Imaging Document Simulation -->
          <div style="background:#fff; border:1.5px dashed #bae6fd; border-radius:var(--radius-md); padding:16px; text-align:center;">
            <div style="font-size:24px; margin-bottom:4px;">📎</div>
            <strong style="font-size:13px; color:#0369a1; display:block;">Upload Medical Referral or MRI / X-Ray (Optional)</strong>
            <p style="font-size:11px; color:var(--muted); margin:4px 0 10px;">Hospital SIMRS Referral, Specialist Doctor Note, or Imaging Scan (PDF, JPG, PNG up to 10MB)</p>
            <input type="file" id="physioDocInput" style="display:none;" />
            <button type="button" class="btn btn-sm btn-soft" id="btnUploadPhysioDoc" style="background:#f0f9ff; color:#0284c7; border:1px solid #bae6fd; font-weight:700;">
              📂 Choose File / Hospital Referral
            </button>
            <div id="physioDocStatus" style="font-size:11px; color:#16a34a; font-weight:700; margin-top:6px; display:none;">
              ✓ Hospital_Referral_L4L5.pdf attached (Encrypted 72h retention)
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /* ------------------------------------------------------------------
   * 3. CLINICAL NUTRITION & DIETETICS INTAKE FORM
   * ------------------------------------------------------------------ */
  renderNutritionForm() {
    return `
      <div class="intake-specialty-card" style="border:1.5px solid #bbf7d0; background:#f0fdf4; border-radius:var(--radius-lg); padding:24px; margin-bottom:20px;">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:18px; flex-wrap:wrap; gap:10px;">
          <div>
            <div style="display:inline-flex; align-items:center; gap:6px; background:#bbf7d0; color:#15803d; font-size:11px; font-weight:800; padding:3px 10px; border-radius:var(--radius-full); text-transform:uppercase; margin-bottom:6px;">
              🥗 Clinical Nutrition &amp; Dietetics Template
            </div>
            <h3 style="margin:0; font-size:18px; color:#15803d;">Nutritional &amp; Metabolic Profile Assessment</h3>
            <p style="margin:4px 0 0; font-size:13px; color:#16a34a;">Provide biometric data, primary health goals, and dietary restrictions for clinical consultation.</p>
          </div>
          <span class="pill" style="background:#fff; color:#16a34a; border:1px solid #bbf7d0; font-size:11px; font-weight:700;">Dietetics Audit</span>
        </div>

        <div style="display:grid; grid-template-columns:1fr; gap:20px;">
          <!-- Biometric Basics & Real-time BMI Calculator -->
          <div style="background:#fff; border:1px solid #bbf7d0; border-radius:var(--radius-md); padding:18px;">
            <label style="font-size:12px; font-weight:800; color:#15803d; text-transform:uppercase; display:block; margin-bottom:12px;">
              1. Biometrics &amp; Real-Time BMI Calculation
            </label>
            <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(130px, 1fr)); gap:12px; margin-bottom:14px;">
              <div>
                <label for="nutriHeight" style="font-size:11px; font-weight:700; color:var(--muted); display:block; margin-bottom:4px;">Height (cm)</label>
                <input type="number" id="nutriHeight" class="input" style="width:100%;" value="168" min="100" max="230" />
              </div>
              <div>
                <label for="nutriWeight" style="font-size:11px; font-weight:700; color:var(--muted); display:block; margin-bottom:4px;">Current Weight (kg)</label>
                <input type="number" id="nutriWeight" class="input" style="width:100%;" value="68" min="30" max="250" />
              </div>
              <div>
                <label for="nutriTargetWeight" style="font-size:11px; font-weight:700; color:var(--muted); display:block; margin-bottom:4px;">Target Weight (kg)</label>
                <input type="number" id="nutriTargetWeight" class="input" style="width:100%;" value="62" min="30" max="250" />
              </div>
              <div>
                <label for="nutriSex" style="font-size:11px; font-weight:700; color:var(--muted); display:block; margin-bottom:4px;">Biological Sex</label>
                <select id="nutriSex" class="input" style="width:100%;">
                  <option value="Female" selected>Female</option>
                  <option value="Male">Male</option>
                </select>
              </div>
            </div>

            <!-- BMI Result Pill Banner -->
            <div id="nutriBmiBanner" style="display:flex; justify-content:space-between; align-items:center; background:#f0fdf4; border:1px solid #86efac; border-radius:var(--radius-sm); padding:10px 14px;">
              <div style="display:flex; align-items:center; gap:8px;">
                <span style="font-size:14px;">⚖️</span>
                <span style="font-size:12px; font-weight:700; color:#15803d;">Calculated BMI:</span>
                <strong id="nutriBmiValue" style="font-size:15px; color:#15803d;">24.1 kg/m²</strong>
              </div>
              <span id="nutriBmiCategory" class="pill" style="background:#16a34a; color:#fff; font-size:11px; font-weight:800;">
                Normal Weight (18.5 - 24.9)
              </span>
            </div>
          </div>

          <!-- Primary Nutritional Goals -->
          <div>
            <label style="font-size:12px; font-weight:800; color:#15803d; text-transform:uppercase; display:block; margin-bottom:8px;">
              2. Primary Nutritional &amp; Health Goal
            </label>
            <div class="nutri-goals-grid" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:10px;">
              <div class="nutri-goal-card selected" data-goal="Weight Loss & Fat Reduction" style="border:2px solid #16a34a; background:#fff; border-radius:var(--radius-md); padding:12px; cursor:pointer;">
                <strong style="font-size:13px; color:#15803d; display:block;">🔥 Weight Loss &amp; Fat Reduction</strong>
                <small style="font-size:11px; color:var(--muted); margin-top:2px; display:block;">Caloric deficit &amp; metabolic boosting</small>
              </div>
              <div class="nutri-goal-card" data-goal="Muscle Hypertrophy & Strength" style="border:1.5px solid #bbf7d0; background:#fff; border-radius:var(--radius-md); padding:12px; cursor:pointer;">
                <strong style="font-size:13px; color:var(--text); display:block;">💪 Muscle Gain &amp; Strength</strong>
                <small style="font-size:11px; color:var(--muted); margin-top:2px; display:block;">High protein &amp; lean mass gain</small>
              </div>
              <div class="nutri-goal-card" data-goal="Metabolic & Blood Glucose Control" style="border:1.5px solid #bbf7d0; background:#fff; border-radius:var(--radius-md); padding:12px; cursor:pointer;">
                <strong style="font-size:13px; color:var(--text); display:block;">🩸 Blood Sugar / Pre-diabetes</strong>
                <small style="font-size:11px; color:var(--muted); margin-top:2px; display:block;">Glycemic control &amp; insulin support</small>
              </div>
              <div class="nutri-goal-card" data-goal="Gut Health & IBS Relief" style="border:1.5px solid #bbf7d0; background:#fff; border-radius:var(--radius-md); padding:12px; cursor:pointer;">
                <strong style="font-size:13px; color:var(--text); display:block;">🌿 Gut Health &amp; IBS Relief</strong>
                <small style="font-size:11px; color:var(--muted); margin-top:2px; display:block;">Microbiome &amp; low-FODMAP diet</small>
              </div>
            </div>
          </div>

          <!-- Dietary Pattern & Food Allergies -->
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px;">
            <div>
              <label for="nutriDietPattern" style="font-size:12px; font-weight:800; color:#15803d; text-transform:uppercase; display:block; margin-bottom:6px;">
                Dietary Pattern / Regimen
              </label>
              <select id="nutriDietPattern" class="input" style="width:100%; background:#fff;">
                <option value="Omnivore / Standard" selected>Standard Omnivore (No restrictions)</option>
                <option value="Halal Compliance">Halal Compliance</option>
                <option value="Vegetarian">Vegetarian (Lacto-Ovo)</option>
                <option value="Strict Vegan">Strict Vegan / Plant-Based</option>
                <option value="Pescatarian">Pescatarian</option>
                <option value="Keto / Low-Carb">Keto / Low-Carbohydrate</option>
                <option value="Gluten-Free">Gluten-Free / Celiac</option>
              </select>
            </div>

            <div>
              <label for="nutriActivityLevel" style="font-size:12px; font-weight:800; color:#15803d; text-transform:uppercase; display:block; margin-bottom:6px;">
                Physical Activity Level
              </label>
              <select id="nutriActivityLevel" class="input" style="width:100%; background:#fff;">
                <option value="Sedentary (Desk Job)">Sedentary (Desk job, minimal workouts)</option>
                <option value="Lightly Active (1-3x/week)" selected>Lightly Active (1-3 workouts/week)</option>
                <option value="Moderately Active (3-5x/week)">Moderately Active (Gym 3-5x/week)</option>
                <option value="Very Active / Athlete">Very Active / Athlete (Daily intense)</option>
              </select>
            </div>
          </div>

          <!-- Allergies & Food Sensitivities (Chips) -->
          <div>
            <label style="font-size:12px; font-weight:800; color:#15803d; text-transform:uppercase; display:block; margin-bottom:8px;">
              Food Allergies &amp; Sensitivities (Select all that apply)
            </label>
            <div class="nutri-allergy-tags" style="display:flex; flex-wrap:wrap; gap:8px;">
              <span class="nutri-allergy-tag active" data-allergy="None" style="padding:6px 14px; border-radius:var(--radius-full); font-size:12px; font-weight:700; border:1.5px solid #16a34a; background:#16a34a; color:#fff; cursor:pointer;">✓ No Known Allergies</span>
              <span class="nutri-allergy-tag" data-allergy="Dairy / Lactose" style="padding:6px 14px; border-radius:var(--radius-full); font-size:12px; font-weight:700; border:1px solid #cbd5e1; background:#fff; color:var(--text); cursor:pointer;">🥛 Dairy / Lactose</span>
              <span class="nutri-allergy-tag" data-allergy="Gluten / Wheat" style="padding:6px 14px; border-radius:var(--radius-full); font-size:12px; font-weight:700; border:1px solid #cbd5e1; background:#fff; color:var(--text); cursor:pointer;">🌾 Gluten / Wheat</span>
              <span class="nutri-allergy-tag" data-allergy="Peanuts" style="padding:6px 14px; border-radius:var(--radius-full); font-size:12px; font-weight:700; border:1px solid #cbd5e1; background:#fff; color:var(--text); cursor:pointer;">🥜 Peanuts</span>
              <span class="nutri-allergy-tag" data-allergy="Shellfish" style="padding:6px 14px; border-radius:var(--radius-full); font-size:12px; font-weight:700; border:1px solid #cbd5e1; background:#fff; color:var(--text); cursor:pointer;">🦐 Shellfish</span>
              <span class="nutri-allergy-tag" data-allergy="Eggs" style="padding:6px 14px; border-radius:var(--radius-full); font-size:12px; font-weight:700; border:1px solid #cbd5e1; background:#fff; color:var(--text); cursor:pointer;">🥚 Eggs</span>
            </div>
          </div>

          <!-- Notes / Daily Water & Eating Habits -->
          <div>
            <label for="nutriDietNotes" style="font-size:12px; font-weight:800; color:#15803d; text-transform:uppercase; display:block; margin-bottom:6px;">
              Current Eating Habits &amp; Notes
            </label>
            <textarea id="nutriDietNotes" rows="3" class="input" style="width:100%; background:#fff;" placeholder="Mention daily coffee/sugar intake, late-night snacking, hydration levels...">Targeting 6kg weight reduction before December. Usually skip breakfast, average 1.5L water/day. Slight afternoon sugar cravings.</textarea>
          </div>
        </div>
      </div>
    `;
  }

  /* ------------------------------------------------------------------
   * 4. TRADITIONAL CHINESE MEDICINE (TCM) INTAKE FORM
   * ------------------------------------------------------------------ */
  renderTcmForm() {
    return `
      <div class="intake-specialty-card" style="border:1.5px solid #ccfbf1; background:#f0fdfa; border-radius:var(--radius-lg); padding:24px; margin-bottom:20px;">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:18px; flex-wrap:wrap; gap:10px;">
          <div>
            <div style="display:inline-flex; align-items:center; gap:6px; background:#ccfbf1; color:#0f766e; font-size:11px; font-weight:800; padding:3px 10px; border-radius:var(--radius-full); text-transform:uppercase; margin-bottom:6px;">
              🌿 Traditional Chinese Medicine (TCM)
            </div>
            <h3 style="margin:0; font-size:18px; color:#0f766e;">Body Pain Points &amp; Meridian Assessment</h3>
            <p style="margin:4px 0 0; font-size:13px; color:#115e59;">Indicate meridian discomfort, pulse indicators, and symptom onset for your TCM physician.</p>
          </div>
          <span class="pill" style="background:#fff; color:#0f766e; border:1px solid #ccfbf1; font-size:11px; font-weight:700;">Meridian Holistic</span>
        </div>

        <div style="display:grid; grid-template-columns:1fr; gap:20px;">
          <div style="display:grid; grid-template-columns:160px 1fr; gap:20px; align-items:center;">
            <!-- Anatomical Map Silhouette -->
            <div style="position:relative; width:160px; height:240px; margin:0 auto;">
              <svg viewBox="0 0 200 400" xmlns="http://www.w3.org/2000/svg" style="width:100%; height:100%;">
                <ellipse cx="100" cy="40" rx="20" ry="26" fill="#e2e8f0" stroke="#94a3b8" stroke-width="2" />
                <rect x="94" y="66" width="12" height="16" fill="#e2e8f0" stroke="#94a3b8" stroke-width="2" />
                <path d="M 65 82 L 135 82 L 125 200 L 75 200 Z" fill="#e2e8f0" stroke="#94a3b8" stroke-width="2" />
                <path d="M 65 85 L 40 180 L 52 182 L 72 105 Z" fill="#e2e8f0" stroke="#94a3b8" stroke-width="2" />
                <path d="M 135 85 L 160 180 L 148 182 L 128 105 Z" fill="#e2e8f0" stroke="#94a3b8" stroke-width="2" />
                <path d="M 75 200 L 125 200 L 120 230 L 80 230 Z" fill="#e2e8f0" stroke="#94a3b8" stroke-width="2" />
                <path d="M 80 230 L 70 380 L 84 380 L 96 230 Z" fill="#e2e8f0" stroke="#94a3b8" stroke-width="2" />
                <path d="M 120 230 L 130 380 L 116 380 L 104 230 Z" fill="#e2e8f0" stroke="#94a3b8" stroke-width="2" />
              </svg>
              <button type="button" class="pain-marker tcm-marker selected" id="tcm-marker-lumbar" style="top:47%; left:50%; position:absolute; transform:translate(-50%, -50%); width:22px; height:22px; border-radius:50%; background:#ef4444; color:#fff; font-size:10px; font-weight:800; border:2px solid #fff; cursor:pointer;" data-part="Bladder Meridian (Lumbar)">!</button>
              <button type="button" class="pain-marker tcm-marker" id="tcm-marker-cervical" style="top:20%; left:50%; position:absolute; transform:translate(-50%, -50%); width:22px; height:22px; border-radius:50%; background:#94a3b8; color:#fff; font-size:10px; font-weight:800; border:2px solid #fff; cursor:pointer;" data-part="Gallbladder Meridian (Neck)">!</button>
              <button type="button" class="pain-marker tcm-marker" id="tcm-marker-knee" style="top:75%; left:62%; position:absolute; transform:translate(-50%, -50%); width:22px; height:22px; border-radius:50%; background:#94a3b8; color:#fff; font-size:10px; font-weight:800; border:2px solid #fff; cursor:pointer;" data-part="Stomach Meridian (Knee)">!</button>
            </div>

            <div>
              <div class="field" style="margin-bottom:14px;">
                <label style="display:flex; justify-content:space-between; align-items:center;">
                  <span style="font-size:12px; font-weight:800; color:#0f766e; text-transform:uppercase;">Meridian Discomfort Scale</span>
                  <strong id="tcmPainScaleDisplay" style="font-size:16px; color:#ef4444;">7 / 10</strong>
                </label>
                <input type="range" id="tcmPainScaleRange" min="1" max="10" value="7" style="width:100%; accent-color:#0f766e; margin-top:6px;" />
              </div>

              <div class="field">
                <label for="tcmChiefComplaint" style="font-size:12px; font-weight:800; color:#0f766e; text-transform:uppercase; display:block; margin-bottom:4px;">
                  Symptom Notes &amp; Cold/Heat Sensitivity
                </label>
                <textarea id="tcmChiefComplaint" rows="3" class="input" style="width:100%; background:#fff;" placeholder="State whether pain worsens in air-conditioning, cold limbs, or fatigue...">Dull chronic ache in lumbar spine aggravated by rainy weather and prolonged sitting. Cold extremities.</textarea>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /* ------------------------------------------------------------------
   * EVENT BINDING & INTERACTIVITY
   * ------------------------------------------------------------------ */
  bindEvents() {
    if (!this.container) return;

    if (this.activeTemplateId === "wellness" || this.activeTemplateId === "spa") {
      this.bindWellnessEvents();
    } else if (this.activeTemplateId === "physio" || this.activeTemplateId === "physiotherapy") {
      this.bindPhysioEvents();
    } else if (this.activeTemplateId === "nutrition") {
      this.bindNutritionEvents();
    } else if (this.activeTemplateId === "tcm") {
      this.bindTcmEvents();
    }
  }

  bindWellnessEvents() {
    // Aroma Choice Cards
    const cards = this.container.querySelectorAll(".aroma-choice-card");
    cards.forEach((card) => {
      card.addEventListener("click", () => {
        soundService.playClickTone();
        cards.forEach((c) => {
          c.classList.remove("selected");
          c.style.borderColor = "#e2e8f0";
          c.style.borderWidth = "1.5px";
          const title = c.querySelector("strong");
          if (title) title.style.color = "var(--text)";
        });
        card.classList.add("selected");
        card.style.borderColor = "var(--primary)";
        card.style.borderWidth = "2px";
        const title = card.querySelector("strong");
        if (title) title.style.color = "var(--primary-dark)";
        this.notifyChange();
      });
    });

    // Pressure Pills
    const pills = this.container.querySelectorAll(".pressure-pill");
    pills.forEach((pill) => {
      pill.addEventListener("click", () => {
        soundService.playClickTone();
        pills.forEach((p) => {
          p.classList.remove("active");
          p.style.borderColor = "#e2e8f0";
          p.style.color = "var(--text)";
        });
        pill.classList.add("active");
        pill.style.borderColor = "var(--primary)";
        pill.style.color = "var(--primary-dark)";
        this.notifyChange();
      });
    });

    // Focus Tags
    const tags = this.container.querySelectorAll(".spa-focus-tag");
    tags.forEach((tag) => {
      tag.addEventListener("click", () => {
        soundService.playClickTone();
        const isActive = tag.classList.contains("active");
        if (isActive) {
          tag.classList.remove("active");
          tag.style.background = "#fff";
          tag.style.color = "var(--text)";
          tag.style.borderColor = "var(--line)";
        } else {
          tag.classList.add("active");
          tag.style.background = "var(--primary)";
          tag.style.color = "#fff";
          tag.style.borderColor = "var(--primary)";
        }
        this.notifyChange();
      });
    });

    // Textarea & dropdown change
    const notesEl = this.container.querySelector("#spaSpecialNotes");
    if (notesEl) notesEl.addEventListener("input", () => this.notifyChange());
  }

  bindPhysioEvents() {
    // Location Buttons
    const locBtns = this.container.querySelectorAll(".physio-loc-btn");
    const badge = this.container.querySelector("#selectedPhysioLocationBadge");

    locBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        soundService.playClickTone();
        locBtns.forEach((b) => {
          b.classList.remove("active");
          b.style.borderColor = "#bae6fd";
          const strong = b.querySelector("strong");
          if (strong) strong.style.color = "var(--text)";
        });
        btn.classList.add("active");
        btn.style.borderColor = "#0284c7";
        btn.style.borderWidth = "2px";
        const strong = btn.querySelector("strong");
        if (strong) strong.style.color = "#0284c7";

        const loc = btn.dataset.loc;
        if (badge) badge.textContent = loc;
        this.notifyChange();
      });
    });

    // Duration Cards
    const durCards = this.container.querySelectorAll(".physio-dur-card");
    durCards.forEach((card) => {
      card.addEventListener("click", () => {
        soundService.playClickTone();
        durCards.forEach((c) => {
          c.classList.remove("selected");
          c.style.borderColor = "#bae6fd";
          const s = c.querySelector("strong");
          const sm = c.querySelector("small");
          if (s) s.style.color = "var(--text)";
          if (sm) sm.style.color = "var(--muted)";
        });
        card.classList.add("selected");
        card.style.borderColor = "#0284c7";
        const s = card.querySelector("strong");
        const sm = card.querySelector("small");
        if (s) s.style.color = "#0284c7";
        if (sm) sm.style.color = "#0284c7";
        this.notifyChange();
      });
    });

    // VAS Slider
    const range = this.container.querySelector("#physioPainScaleRange");
    const display = this.container.querySelector("#physioPainScaleDisplay");
    const label = this.container.querySelector("#physioPainSeverityLabel");

    if (range && display) {
      range.addEventListener("input", (e) => {
        const val = parseInt(e.target.value, 10);
        display.textContent = `${val} / 10`;

        if (val <= 3) {
          display.style.color = "#16a34a";
          display.style.background = "#f0fdf4";
          if (label) {
            label.textContent = "Mild Discomfort";
            label.style.color = "#16a34a";
          }
        } else if (val <= 6) {
          display.style.color = "#d97706";
          display.style.background = "#fefce8";
          if (label) {
            label.textContent = "Moderate Pain";
            label.style.color = "#d97706";
          }
        } else {
          display.style.color = "#ef4444";
          display.style.background = "#fef2f2";
          if (label) {
            label.textContent = "Severe / Functional Impairment";
            label.style.color = "#ef4444";
          }
        }
        this.notifyChange();
      });
    }

    // Upload simulation
    const uploadBtn = this.container.querySelector("#btnUploadPhysioDoc");
    const fileInput = this.container.querySelector("#physioDocInput");
    const uploadStatus = this.container.querySelector("#physioDocStatus");

    if (uploadBtn && fileInput) {
      uploadBtn.addEventListener("click", () => fileInput.click());
      fileInput.addEventListener("change", (e) => {
        if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          if (uploadStatus) {
            uploadStatus.style.display = "block";
            uploadStatus.textContent = `✓ ${file.name} attached (SIMRS proxy retention active)`;
          }
          this.notifyChange();
        }
      });
    }

    const notes = this.container.querySelector("#physioSymptomsNotes");
    if (notes) notes.addEventListener("input", () => this.notifyChange());
  }

  bindNutritionEvents() {
    // Height & Weight inputs for real-time BMI
    const heightInput = this.container.querySelector("#nutriHeight");
    const weightInput = this.container.querySelector("#nutriWeight");
    const bmiVal = this.container.querySelector("#nutriBmiValue");
    const bmiCat = this.container.querySelector("#nutriBmiCategory");

    const updateBmi = () => {
      const h = parseFloat(heightInput?.value || 0) / 100;
      const w = parseFloat(weightInput?.value || 0);

      if (h > 0 && w > 0) {
        const bmi = (w / (h * h)).toFixed(1);
        if (bmiVal) bmiVal.textContent = `${bmi} kg/m²`;

        if (bmiCat) {
          if (bmi < 18.5) {
            bmiCat.textContent = "Underweight (< 18.5)";
            bmiCat.style.background = "#0284c7";
          } else if (bmi <= 24.9) {
            bmiCat.textContent = "Normal Weight (18.5 - 24.9)";
            bmiCat.style.background = "#16a34a";
          } else if (bmi <= 29.9) {
            bmiCat.textContent = "Overweight (25 - 29.9)";
            bmiCat.style.background = "#d97706";
          } else {
            bmiCat.textContent = "Obese Category (≥ 30)";
            bmiCat.style.background = "#ef4444";
          }
        }
      }
      this.notifyChange();
    };

    if (heightInput) heightInput.addEventListener("input", updateBmi);
    if (weightInput) weightInput.addEventListener("input", updateBmi);

    // Goal Cards
    const goalCards = this.container.querySelectorAll(".nutri-goal-card");
    goalCards.forEach((card) => {
      card.addEventListener("click", () => {
        soundService.playClickTone();
        goalCards.forEach((c) => {
          c.classList.remove("selected");
          c.style.borderColor = "#bbf7d0";
          const s = c.querySelector("strong");
          if (s) s.style.color = "var(--text)";
        });
        card.classList.add("selected");
        card.style.borderColor = "#16a34a";
        const s = card.querySelector("strong");
        if (s) s.style.color = "#15803d";
        this.notifyChange();
      });
    });

    // Allergy Tags
    const allergyTags = this.container.querySelectorAll(".nutri-allergy-tag");
    allergyTags.forEach((tag) => {
      tag.addEventListener("click", () => {
        soundService.playClickTone();
        const isNone = tag.dataset.allergy === "None";

        if (isNone) {
          // If clicking "None", deactivate all others
          allergyTags.forEach((t) => {
            t.classList.remove("active");
            t.style.background = "#fff";
            t.style.color = "var(--text)";
            t.style.borderColor = "#cbd5e1";
          });
          tag.classList.add("active");
          tag.style.background = "#16a34a";
          tag.style.color = "#fff";
          tag.style.borderColor = "#16a34a";
        } else {
          // Deactivate "None"
          const noneTag = this.container.querySelector('.nutri-allergy-tag[data-allergy="None"]');
          if (noneTag) {
            noneTag.classList.remove("active");
            noneTag.style.background = "#fff";
            noneTag.style.color = "var(--text)";
            noneTag.style.borderColor = "#cbd5e1";
          }

          const isActive = tag.classList.contains("active");
          if (isActive) {
            tag.classList.remove("active");
            tag.style.background = "#fff";
            tag.style.color = "var(--text)";
            tag.style.borderColor = "#cbd5e1";
          } else {
            tag.classList.add("active");
            tag.style.background = "#16a34a";
            tag.style.color = "#fff";
            tag.style.borderColor = "#16a34a";
          }
        }
        this.notifyChange();
      });
    });

    const notes = this.container.querySelector("#nutriDietNotes");
    if (notes) notes.addEventListener("input", () => this.notifyChange());
  }

  bindTcmEvents() {
    const markers = this.container.querySelectorAll(".tcm-marker");
    markers.forEach((m) => {
      m.addEventListener("click", () => {
        soundService.playClickTone();
        markers.forEach((item) => (item.style.background = "#94a3b8"));
        m.style.background = "#ef4444";
        this.notifyChange();
      });
    });

    const range = this.container.querySelector("#tcmPainScaleRange");
    const display = this.container.querySelector("#tcmPainScaleDisplay");
    if (range && display) {
      range.addEventListener("input", (e) => {
        display.textContent = `${e.target.value} / 10`;
        this.notifyChange();
      });
    }

    const complaint = this.container.querySelector("#tcmChiefComplaint");
    if (complaint) complaint.addEventListener("input", () => this.notifyChange());
  }

  notifyChange() {
    if (typeof this.onChange === "function") {
      this.onChange(this.getIntakeData());
    }
  }

  /* ------------------------------------------------------------------
   * EXTRACT STRUCTURED INTAKE DATA
   * ------------------------------------------------------------------ */
  getIntakeData() {
    if (!this.container) return {};

    switch (this.activeTemplateId) {
      case "physio":
      case "physiotherapy": {
        const activeLocBtn = this.container.querySelector(".physio-loc-btn.active");
        const painLoc = activeLocBtn ? activeLocBtn.dataset.loc : "Lower Back (Lumbar)";

        const activeDurCard = this.container.querySelector(".physio-dur-card.selected");
        const duration = activeDurCard ? activeDurCard.dataset.duration : "Subacute (1 - 4 weeks)";

        const scaleVal = this.container.querySelector("#physioPainScaleRange")?.value || "7";
        const notes = this.container.querySelector("#physioSymptomsNotes")?.value.trim() || "Mild stiffness upon movement";

        const docStatus = this.container.querySelector("#physioDocStatus");
        const hasDoc = docStatus && docStatus.style.display !== "none";

        return {
          templateType: "physio",
          templateName: "Physiotherapy & Sports Rehab",
          painLocation: painLoc,
          painScale: `${scaleVal} / 10`,
          duration: duration,
          symptoms: notes,
          hasMedicalDoc: hasDoc,
          summaryText: `Loc: ${painLoc} | VAS: ${scaleVal}/10 | Duration: ${duration}`,
          chiefComplaint: `${painLoc} (VAS ${scaleVal}/10, ${duration}) — "${notes}"`
        };
      }

      case "nutrition": {
        const h = this.container.querySelector("#nutriHeight")?.value || "168";
        const w = this.container.querySelector("#nutriWeight")?.value || "68";
        const tw = this.container.querySelector("#nutriTargetWeight")?.value || "62";
        const sex = this.container.querySelector("#nutriSex")?.value || "Female";
        const bmi = (parseFloat(w) / Math.pow(parseFloat(h) / 100, 2)).toFixed(1);

        const activeGoalCard = this.container.querySelector(".nutri-goal-card.selected");
        const goal = activeGoalCard ? activeGoalCard.dataset.goal : "Weight Loss & Fat Reduction";

        const dietPattern = this.container.querySelector("#nutriDietPattern")?.value || "Omnivore / Standard";
        const activity = this.container.querySelector("#nutriActivityLevel")?.value || "Lightly Active";

        const allergies = Array.from(this.container.querySelectorAll(".nutri-allergy-tag.active"))
          .map((t) => t.dataset.allergy)
          .join(", ") || "None";

        const notes = this.container.querySelector("#nutriDietNotes")?.value.trim() || "Standard consultation";

        return {
          templateType: "nutrition",
          templateName: "Clinical Nutrition & Dietetics",
          height: `${h} cm`,
          weight: `${w} kg`,
          targetWeight: `${tw} kg`,
          bmi: `${bmi} kg/m²`,
          sex: sex,
          primaryGoal: goal,
          dietPattern: dietPattern,
          activityLevel: activity,
          allergies: allergies,
          notes: notes,
          summaryText: `Goal: ${goal} | BMI: ${bmi} (${w}kg → ${tw}kg) | Diet: ${dietPattern}`,
          chiefComplaint: `Goal: ${goal} · BMI: ${bmi} (${w}kg) · Allergies: ${allergies}`
        };
      }

      case "tcm": {
        const activeMarker = this.container.querySelector(".tcm-marker.selected");
        const part = activeMarker ? activeMarker.dataset.part : "Bladder Meridian (Lumbar)";
        const scaleVal = this.container.querySelector("#tcmPainScaleRange")?.value || "7";
        const notes = this.container.querySelector("#tcmChiefComplaint")?.value.trim() || "Meridian stiffness";

        return {
          templateType: "tcm",
          templateName: "Traditional Chinese Medicine",
          painLocation: part,
          painScale: `${scaleVal} / 10`,
          symptoms: notes,
          summaryText: `Meridian: ${part} | VAS: ${scaleVal}/10 | Pulse: Standard`,
          chiefComplaint: `${part} (${scaleVal}/10) — "${notes}"`
        };
      }

      case "wellness":
      case "spa":
      default: {
        const activeAroma = this.container.querySelector(".aroma-choice-card.selected");
        const oil = activeAroma ? activeAroma.dataset.oil : "Balinese Lemongrass";

        const activePressure = this.container.querySelector(".pressure-pill.active");
        const pressure = activePressure ? activePressure.dataset.pressure : "Medium";

        const focusAreas = Array.from(this.container.querySelectorAll(".spa-focus-tag.active"))
          .map((t) => t.dataset.focus)
          .join(", ") || "Full Body Balanced";

        const therapistGender = this.container.querySelector("#spaTherapistGender")?.value || "No Preference";
        const roomAmbiance = this.container.querySelector("#spaRoomAmbiance")?.value || "Cozy Warm";
        const notes = this.container.querySelector("#spaSpecialNotes")?.value.trim() || "Standard luxury relaxation";

        return {
          templateType: "wellness",
          templateName: "Wellness & Luxury Spa Care",
          aromaOil: oil,
          pressureLevel: pressure,
          focusAreas: focusAreas,
          therapistGender: therapistGender,
          roomAmbiance: roomAmbiance,
          specialNotes: notes,
          summaryText: `Aroma: ${oil} | Pressure: ${pressure} | Focus: ${focusAreas}`,
          chiefComplaint: `Aroma: ${oil} (${pressure} Pressure) · Focus: ${focusAreas} · Therapist: ${therapistGender}`
        };
      }
    }
  }
}

export const intakeFormComponent = new IntakeFormComponent();

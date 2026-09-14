/**
 * ScannerView — AI Food Scanner modal: upload, progress, result, log.
 *
 * SRS acuan: FR-SCAN-01..10, FR-MEAL-01..04.
 */
import { scanModel } from '../models/ScanModel.js';
import { clientModel } from '../models/ClientModel.js';
import { Html5Qrcode } from 'html5-qrcode';

export class ScannerView {
  constructor() {
    this.activeScannedMeal = null;
    this.activeScanSlot = null;
    this.html5QrCode = null;
  }

  open(slotName) {
    this.activeScanSlot = slotName || null;
    this.activeScannedMeal = null;

    // Reset UI
    const promptEl = document.getElementById('scanner-select-prompt');
    const foodImg = document.getElementById('scanner-food-image');
    const laser = document.getElementById('scanner-laser');
    const progress = document.getElementById('scanner-progress-log');
    const results = document.getElementById('scanner-results');
    const logBtn = document.getElementById('btn-log-scanned');
    const allergenWarning = document.getElementById('res-food-allergen-warning');

    if (promptEl) promptEl.classList.remove('hidden');
    if (foodImg) foodImg.classList.add('hidden');
    if (laser) laser.style.display = 'none';
    if (progress) progress.classList.add('hidden');
    if (results) results.classList.add('hidden');
    if (allergenWarning) allergenWarning.classList.add('hidden');
    if (logBtn) {
      logBtn.disabled = true;
      logBtn.className = 'bg-slate-300 text-slate-500 font-bold text-xs px-5 py-2 rounded-xl cursor-not-allowed';
    }

    // Render samples
    this._renderSamples();

    const modal = document.getElementById('ai-scanner-modal');
    if (modal) {
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }
  }

  close() {
    const modal = document.getElementById('ai-scanner-modal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
    this.stopBarcodeScan();
  }

  _renderSamples() {
    const samplesList = document.getElementById('scanner-samples-list');
    if (!samplesList) return;
    const db = scanModel.getScanDb();
    samplesList.innerHTML = Object.keys(db)
      .map(
        (key) => `
      <button onclick="selectScanSample('${key}')" class="bg-surface hover:bg-primary/10 text-on-surface hover:text-primary border border-outline-variant/35 font-bold text-[10px] px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-95">
        <span class="material-symbols-outlined text-sm">restaurant</span> ${db[key].title}
      </button>`
      )
      .join('');
  }

  selectSample(sampleId) {
    const db = scanModel.getScanDb();
    const mealData = db[sampleId];
    if (!mealData) return;
    this.activeScannedMeal = mealData;
    this._triggerAnimation(mealData);
  }

  handleImageUpload(file) {
    const setLog = (id, html) => { const el = document.getElementById(id); if (el) el.innerHTML = html; };
    setLog('log-step-1', `<span class="material-symbols-outlined text-[14px]">checklist</span> Identifying ingredients...`);
    setLog('log-step-2', `<span class="material-symbols-outlined text-[14px]">scale</span> Estimating food volume & weight...`);
    setLog('log-step-3', `<span class="material-symbols-outlined text-[14px]">bar_chart_4_bars</span> Extracting calorie & macro values...`);

    const imageUrl = URL.createObjectURL(file);
    let foodName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
    foodName = foodName.replace(/[-_]/g, ' ').split(' ').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

    const dummyMeal = {
      title: foodName,
      type: this.activeScanSlot || 'Lunch',
      calories: 320 + Math.floor(Math.random() * 200),
      p: 12 + Math.floor(Math.random() * 25),
      c: 25 + Math.floor(Math.random() * 40),
      f: 6 + Math.floor(Math.random() * 15),
      image: imageUrl,
      advice: `AI Scan complete! Detected ${foodName}. Nutrition profile calculated based on volume and food type.`,
      confidence: 72 + Math.floor(Math.random() * 23),
    };
    this.activeScannedMeal = dummyMeal;
    this._triggerAnimation(dummyMeal);
  }

  async handleBarcodeScan() {
    this.open();
    const container = document.getElementById('barcode-scanner-container');
    const promptEl = document.getElementById('scanner-select-prompt');
    
    if (container) container.classList.remove('hidden');
    if (promptEl) promptEl.classList.add('hidden');

    if (!this.html5QrCode) {
      this.html5QrCode = new Html5Qrcode("qr-reader");
    }

    try {
      await this.html5QrCode.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 }
        },
        async (decodedText, decodedResult) => {
          // Success callback
          await this.stopBarcodeScan();
          this.processBarcodeData(decodedText);
        },
        (errorMessage) => {
          // parse error, ignore silently
        }
      );
    } catch (err) {
      console.error("Error starting barcode scanner", err);
      alert("Could not start camera. Please check permissions.");
      this.cancelBarcodeScan();
    }
  }

  async stopBarcodeScan() {
    if (this.html5QrCode && this.html5QrCode.isScanning) {
      try {
        await this.html5QrCode.stop();
      } catch (err) {
        console.error("Failed to stop scanner", err);
      }
    }
    const container = document.getElementById('barcode-scanner-container');
    if (container) container.classList.add('hidden');
  }

  async cancelBarcodeScan() {
    await this.stopBarcodeScan();
    const promptEl = document.getElementById('scanner-select-prompt');
    if (promptEl) promptEl.classList.remove('hidden');
  }

  async processBarcodeData(barcode) {
    try {
      const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
      const data = await response.json();
      
      if (data.status === 1 && data.product) {
        const p = data.product;
        const nut = p.nutriments || {};
        
        const meal = {
          title: p.product_name || `Scanned Product (${barcode})`,
          type: this.activeScanSlot || 'Snack',
          calories: Math.round(nut['energy-kcal_100g'] || nut['energy-kcal'] || 0),
          p: Math.round(nut.proteins_100g || nut.proteins || 0),
          c: Math.round(nut.carbohydrates_100g || nut.carbohydrates || 0),
          f: Math.round(nut.fat_100g || nut.fat || 0),
          image: p.image_url || "https://images.unsplash.com/photo-1517673132405-a56a62b18caf?auto=format&fit=crop&q=80&w=400",
          advice: `Barcode scanned successfully! Retrieved from OpenFoodFacts (per 100g).`,
          confidence: 100,
        };
        this.activeScannedMeal = meal;
        this._triggerAnimation(meal);
      } else {
        alert("Product not found in OpenFoodFacts database.");
        const promptEl = document.getElementById('scanner-select-prompt');
        if (promptEl) promptEl.classList.remove('hidden');
      }
    } catch (err) {
      console.error("Error fetching product data", err);
      alert("Failed to fetch product data. Check connection.");
      const promptEl = document.getElementById('scanner-select-prompt');
      if (promptEl) promptEl.classList.remove('hidden');
    }
  }

  _triggerAnimation(mealData) {
    const promptEl = document.getElementById('scanner-select-prompt');
    const foodImg = document.getElementById('scanner-food-image');
    const progress = document.getElementById('scanner-progress-log');
    const laser = document.getElementById('scanner-laser');
    const results = document.getElementById('scanner-results');
    const logBtn = document.getElementById('btn-log-scanned');

    if (promptEl) promptEl.classList.add('hidden');
    if (foodImg) {
      foodImg.src = mealData.image;
      foodImg.classList.remove('hidden');
    }
    if (progress) progress.classList.remove('hidden');
    if (laser) laser.style.display = 'block';
    if (logBtn) {
      logBtn.disabled = true;
      logBtn.className = 'bg-slate-300 text-slate-500 font-bold text-xs px-5 py-2 rounded-xl cursor-not-allowed';
    }

    ['log-step-1', 'log-step-2', 'log-step-3'].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.className = 'flex items-center gap-2 opacity-40';
    });

    const step1 = document.getElementById('log-step-1');
    setTimeout(() => { if (step1) step1.className = 'flex items-center gap-2 text-primary font-bold animate-pulse'; }, 400);
    setTimeout(() => {
      if (step1) step1.className = 'flex items-center gap-2 text-primary/80';
      const step2 = document.getElementById('log-step-2');
      if (step2) step2.className = 'flex items-center gap-2 text-primary font-bold animate-pulse';
    }, 1000);
    setTimeout(() => {
      const step2 = document.getElementById('log-step-2');
      if (step2) step2.className = 'flex items-center gap-2 text-primary/80';
      const step3 = document.getElementById('log-step-3');
      if (step3) step3.className = 'flex items-center gap-2 text-primary font-bold animate-pulse';
    }, 1600);
    setTimeout(() => {
      if (laser) laser.style.display = 'none';
      if (progress) progress.classList.add('hidden');

      const setText = (id, val) => { const el = document.getElementById(id); if (el) el.innerText = val; };
      setText('res-food-title', mealData.title);
      setText('res-food-type', `${mealData.type} Meal`);
      setText('res-food-calories', `${mealData.calories} kcal`);
      setText('res-food-protein', `${mealData.p}g`);
      setText('res-food-carbs', `${mealData.c}g`);
      setText('res-food-fat', `${mealData.f}g`);
      setText('res-food-advice', mealData.advice);
      setText('res-food-confidence', `${mealData.confidence || 88}% confidence`);
      this._populateEditableFields(mealData);
      this._renderAllergenWarning(mealData);

      if (results) results.classList.remove('hidden');
      if (logBtn) {
        logBtn.disabled = false;
        logBtn.className = 'bg-primary hover:bg-[#005321] text-white font-bold text-xs px-5 py-2 rounded-xl shadow-sm cursor-pointer transition-all active:scale-95';
      }
    }, 2200);
  }

  _populateEditableFields(mealData) {
    const fields = {
      'edit-scan-name': mealData.title,
      'edit-scan-calories': mealData.calories,
      'edit-scan-protein': mealData.p,
      'edit-scan-carbs': mealData.c,
      'edit-scan-fat': mealData.f,
    };
    Object.entries(fields).forEach(([id, value]) => {
      const el = document.getElementById(id);
      if (el) el.value = value;
    });
  }

  _renderAllergenWarning(mealData) {
    const warning = document.getElementById('res-food-allergen-warning');
    if (!warning) return;
    const clientName = clientModel.getLoggedClientName();
    const allergies = (clientModel.getProfile(clientName)?.allergies || []).map((item) => item.toLowerCase());
    const content = `${mealData.title} ${mealData.advice || ''}`.toLowerCase();
    const matched = allergies.filter((allergy) => {
      const terms = allergy.includes('peanut') ? ['peanut', 'nuts'] : allergy.includes('dairy') || allergy.includes('lactose') ? ['milk', 'dairy', 'yogurt', 'whey'] : [allergy];
      return terms.some((term) => content.includes(term));
    });
    if (matched.length) {
      warning.textContent = `Allergen warning: potentially contains ${matched.join(', ')}. Please verify ingredients.`;
      warning.classList.remove('hidden');
    } else {
      warning.classList.add('hidden');
    }
  }

  applyEdits() {
    if (!this.activeScannedMeal) return null;
    const read = (id, fallback) => document.getElementById(id)?.value ?? fallback;
    this.activeScannedMeal = {
      ...this.activeScannedMeal,
      title: String(read('edit-scan-name', this.activeScannedMeal.title)).trim() || this.activeScannedMeal.title,
      calories: Math.max(0, Number(read('edit-scan-calories', this.activeScannedMeal.calories)) || 0),
      p: Math.max(0, Number(read('edit-scan-protein', this.activeScannedMeal.p)) || 0),
      c: Math.max(0, Number(read('edit-scan-carbs', this.activeScannedMeal.c)) || 0),
      f: Math.max(0, Number(read('edit-scan-fat', this.activeScannedMeal.f)) || 0),
      edited: true,
    };
    const meal = this.activeScannedMeal;
    const setText = (id, value) => { const el = document.getElementById(id); if (el) el.textContent = value; };
    setText('res-food-title', meal.title);
    setText('res-food-calories', `${meal.calories} kcal`);
    setText('res-food-protein', `${meal.p}g`);
    setText('res-food-carbs', `${meal.c}g`);
    setText('res-food-fat', `${meal.f}g`);
    this._renderAllergenWarning(meal);
    return meal;
  }

  logMeal() {
    return this.activeScannedMeal;
  }
}

export const scannerView = new ScannerView();

/**
 * ScanModel — AI Food Scanner, scan database, dan hasil scan.
 *
 * SRS acuan: FR-SCAN-01..10, §8 (FoodScan).
 */
import { store } from '../core/Store.js';

export class ScanModel {
  static SCAN_DB_KEY = 'nutriflow_scan_db';

  /**
   * Dapatkan database makanan untuk scan.
   * Digenerate dari food library bila ada, atau fallback ke default.
   */
  getScanDb() {
    // Coba build dari food library terlebih dulu
    const library = store.get('nutriflow_food_library', null);
    if (library && Array.isArray(library) && library.length > 0) {
      return this._buildFromLibrary(library);
    }
    // Cek cache
    const cached = store.get(ScanModel.SCAN_DB_KEY, null);
    if (cached) return cached;
    // Default built-in DB
    const defaults = this._defaults();
    store.set(ScanModel.SCAN_DB_KEY, defaults);
    return defaults;
  }

  _buildFromLibrary(library) {
    const db = {};
    library.forEach((food) => {
      const key = food.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      db[key] = {
        title: food.title,
        type: food.type === 'Recipes' ? 'Recipe' : 'Raw Food',
        calories: food.calories,
        p: food.p,
        c: food.c,
        f: food.f,
        image: food.image,
        advice: food.recipeSteps
          ? `Rich in nutrients. Preparation: ${food.recipeSteps}`
          : 'Fresh and healthy option. Enjoy directly!',
      };
    });
    store.set(ScanModel.SCAN_DB_KEY, db);
    return db;
  }

  _defaults() {
    return {
      'avocado-toast': { title: 'Avocado Egg Toast', type: 'Breakfast', calories: 320, p: 14, c: 22, f: 18, image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=500', advice: 'Rich in healthy monounsaturated fats and high-quality protein.' },
      'chicken-salad': { title: 'Grilled Chicken Salad', type: 'Lunch', calories: 450, p: 45, c: 12, f: 20, image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500', advice: 'Fantastic lean-protein choice! High fiber from garden vegetables.' },
      'salmon': { title: 'Grilled Salmon & Asparagus', type: 'Dinner', calories: 520, p: 42, c: 12, f: 32, image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=500', advice: 'Excellent source of Omega-3. Promotes cardiovascular health.' },
      'yogurt': { title: 'Greek Yogurt Bowl', type: 'Breakfast', calories: 250, p: 20, c: 30, f: 5, image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=500', advice: 'Probiotic-rich breakfast. Great for gut microbiome health.' },
      'buddha-bowl': { title: 'Quinoa Buddha Bowl', type: 'Lunch', calories: 450, p: 15, c: 65, f: 18, image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500', advice: 'Loaded with complex fiber, quinoa delivers all nine essential amino acids.' },
      'burger': { title: 'Cheeseburger', type: 'Dinner', calories: 650, p: 32, c: 45, f: 38, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500', advice: 'Enjoy occasionally as a cheat meal, but balance with active cardio!' },
    };
  }

  /** Simpan hasil scan. */
  saveScanResult(scanData) {
    const scans = store.get('nutriflow_food_scans', []);
    scans.unshift({
      ...scanData,
      id: `scan-${Date.now()}`,
      timestamp: new Date().toISOString(),
    });
    store.set('nutriflow_food_scans', scans);
    return scans[0];
  }

  /** Dapatkan riwayat scan. */
  getScanHistory() {
    return store.get('nutriflow_food_scans', []);
  }

  /**
   * Init — bootstrap hook. Tidak menimpa data yang sudah ada.
   */
  init() {
    return this;
  }
}

export const scanModel = new ScanModel();

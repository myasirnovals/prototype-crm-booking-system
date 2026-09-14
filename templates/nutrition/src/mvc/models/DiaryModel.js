/**
 * DiaryModel — Food diary, water logging, meal status, dan log global.
 *
 * SRS acuan: FR-DIARY-01..06, §8 (DiaryEntry, loggedStatus).
 */
import { store } from '../core/Store.js';

export class DiaryModel {
  static LOGGED_STATUS_KEY = 'nutriflow_logged_status';

  /** Status log makan per klien/hari/meal-type. */
  getLoggedStatus() {
    return store.get(DiaryModel.LOGGED_STATUS_KEY, {});
  }

  setLoggedStatus(status) {
    store.set(DiaryModel.LOGGED_STATUS_KEY, status);
  }

  /**
   * Toggle log status untuk sebuah meal.
   * @param {string} clientName
   * @param {string} day
   * @param {string} slotName
   * @returns {boolean} status baru (true=logged, false=unlogged)
   */
  toggleMeal(clientName, day, slotName) {
    const status = this.getLoggedStatus();
    if (!status[clientName]) status[clientName] = {};
    if (!status[clientName][day]) status[clientName][day] = {};
    const current = status[clientName][day][slotName] === true;
    status[clientName][day][slotName] = !current;
    this.setLoggedStatus(status);
    return !current;
  }

  /**
   * Cek apakah sebuah meal sudah di-log.
   */
  isMealLogged(clientName, day, slotName) {
    const status = this.getLoggedStatus();
    return status[clientName]?.[day]?.[slotName] === true;
  }

  /** Dietitian target kalori per klien. */
  getTargetKcalKey(clientName) {
    return `nutriflow_target_kcal_${clientName}`;
  }

  getTargetKcal(clientName) {
    return parseInt(store.get(this.getTargetKcalKey(clientName), '2100'), 10) || 2100;
  }

  setTargetKcal(clientName, kcal) {
    store.set(this.getTargetKcalKey(clientName), kcal);
  }

  /** Target makro global (sementara, nanti per program). */
  getMacroTargets() {
    return {
      protein: parseInt(store.get('nutriflow_client_protein_target', '150'), 10) || 150,
      carbs: parseInt(store.get('nutriflow_client_carbs_target', '250'), 10) || 250,
      fats: parseInt(store.get('nutriflow_client_fats_target', '65'), 10) || 65,
    };
  }

  setMacroTargets({ protein, carbs, fats }) {
    if (protein != null) store.set('nutriflow_client_protein_target', protein);
    if (carbs != null) store.set('nutriflow_client_carbs_target', carbs);
    if (fats != null) store.set('nutriflow_client_fats_target', fats);
  }

  /**
   * Alias toggleMeal — dipakai ClientController (toggle log meal).
   * @returns {boolean} status baru (true=logged, false=unlogged)
   */
  toggleLogMeal(clientName, day, slotName) {
    return this.toggleMeal(clientName, day, slotName);
  }

  /**
   * Tambah (log) sebuah meal ke diary klien untuk hari/slot tertentu.
   * Menyimpan data meal pada meal plan per klien + menandai status logged.
   * @param {string} clientName
   * @param {string} day e.g. 'Mon'
   * @param {string} slotName e.g. 'Breakfast'
   * @param {object} meal { title, calories, p, c, f, image, advice }
   */
  addMeal(clientName, day, slotName, meal) {
    // 1. Simpan meal ke meal plan klien (agar muncul di dashboard & program view)
    const plans = store.get('nutriflow_client_meal_plans', {});
    if (!plans[clientName]) plans[clientName] = {};
    if (!plans[clientName][day]) plans[clientName][day] = [];
    const dayMeals = plans[clientName][day];
    const existing = dayMeals.findIndex((m) => m.type && m.type.toLowerCase() === String(slotName).toLowerCase());
    const mealEntry = {
      title: meal.title,
      type: meal.type || slotName,
      calories: Number(meal.calories) || 0,
      p: Number(meal.p) || 0,
      c: Number(meal.c) || 0,
      f: Number(meal.f) || 0,
      image: meal.image || '',
      advice: meal.advice || '',
    };
    if (existing >= 0) {
      dayMeals[existing] = { ...dayMeals[existing], ...mealEntry };
    } else {
      dayMeals.push(mealEntry);
    }
    store.set('nutriflow_client_meal_plans', plans);

    // 2. Tandai status logged
    const status = this.getLoggedStatus();
    if (!status[clientName]) status[clientName] = {};
    if (!status[clientName][day]) status[clientName][day] = {};
    status[clientName][day][slotName] = true;
    this.setLoggedStatus(status);

    return mealEntry;
  }

  /**
   * Init — bootstrap hook. Tidak menimpa data yang sudah ada.
   */
  init() {
    return this;
  }
}

export const diaryModel = new DiaryModel();

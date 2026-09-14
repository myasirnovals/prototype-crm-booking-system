/**
 * ProgramModel — Program nutrisi, meal plans, food library, recipes.
 *
 * SRS acuan: FR-PROG-01..08, FR-LIB-01..07, §8 (Program, ProgramDay, ProgramMeal, FoodItem/Recipe).
 */
import { store } from '../core/Store.js';

export class ProgramModel {
  static PROGRAMS_KEY = 'nutriflow_programs_draft';
  static MEAL_PLANS_KEY = 'nutriflow_client_meal_plans';
  static FOOD_LIBRARY_KEY = 'nutriflow_food_library';
  static CHATS_KEY = 'nutriflow_program_chats';

  // ──── Program ────────────────────────────────────────────────

  getPrograms() {
    return store.get(ProgramModel.PROGRAMS_KEY, []);
  }

  setPrograms(programs) {
    store.set(ProgramModel.PROGRAMS_KEY, programs);
  }

  getProgram(id) {
    return this.getPrograms().find((p) => p.id === id) || null;
  }

  addProgram(program) {
    const programs = this.getPrograms();
    programs.push(program);
    this.setPrograms(programs);
    return program;
  }

  updateProgram(id, patch) {
    const programs = this.getPrograms();
    const idx = programs.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    programs[idx] = { ...programs[idx], ...patch };
    this.setPrograms(programs);
    return programs[idx];
  }

  removeProgram(id) {
    const programs = this.getPrograms().filter((p) => p.id !== id);
    this.setPrograms(programs);
  }

  // ──── Meal Plans (per klien) ────────────────────────────────

  getMealPlans() {
    return store.get(ProgramModel.MEAL_PLANS_KEY, {});
  }

  setMealPlans(plans) {
    store.set(ProgramModel.MEAL_PLANS_KEY, plans);
  }

  getClientMealPlan(clientName) {
    return this.getMealPlans()[clientName] || {};
  }

  setClientDayMeals(clientName, day, meals) {
    const plans = this.getMealPlans();
    if (!plans[clientName]) plans[clientName] = {};
    plans[clientName][day] = meals;
    this.setMealPlans(plans);
  }

  // ──── Food Library ──────────────────────────────────────────

  getFoodLibrary() {
    return store.get(ProgramModel.FOOD_LIBRARY_KEY, []);
  }

  setFoodLibrary(library) {
    store.set(ProgramModel.FOOD_LIBRARY_KEY, library);
  }

  addFood(food) {
    const library = this.getFoodLibrary();
    library.push(food);
    this.setFoodLibrary(library);
    return food;
  }

  removeFood(index) {
    const library = this.getFoodLibrary();
    library.splice(index, 1);
    this.setFoodLibrary(library);
  }

  // ──── Program Chats ─────────────────────────────────────────

  getChats() {
    return store.get(ProgramModel.CHATS_KEY, []);
  }

  setChats(chats) {
    store.set(ProgramModel.CHATS_KEY, chats);
  }

  getChat(chatId) {
    return this.getChats().find((c) => c.id === chatId) || null;
  }

  addMessage(chatId, message) {
    const chats = this.getChats();
    let chat = chats.find((c) => c.id === chatId);
    if (!chat) {
      chat = { id: chatId, chatHistory: [] };
      chats.push(chat);
    }
    chat.chatHistory.push(message);
    this.setChats(chats);
    return chat;
  }

  /**
   * Init — bootstrap hook. Tidak menimpa data yang sudah ada.
   */
  init() {
    return this;
  }
}

export const programModel = new ProgramModel();

/**
 * MealPlanView — Render program nutrisi, day switcher, progress bar, log meal.
 *
 * SRS acuan: FR-PROG-01..05, FR-DIARY-01..06.
 */
import { clientModel } from '../models/ClientModel.js';
import { programModel } from '../models/ProgramModel.js';
import { diaryModel } from '../models/DiaryModel.js';

export class MealPlanView {
  constructor() {
    this.selectedDay = 'Wed';
    this.activeProgramName = '';
    this.activeProgramDescription = '';
    this.activeProgramTargetKcal = 2000;
  }

  render() {
    const clientName = clientModel.getLoggedClientName();
    this._syncProgramMeta(clientName);
    this._renderDaySwitcher();
    this._renderMeals(clientName);
  }

  _syncProgramMeta(clientName) {
    const clients = clientModel.getClients();
    const clientDetails = clients.find((c) => c.name === clientName);
    if (clientDetails?.activeProgramId) {
      const program = programModel.getProgram(clientDetails.activeProgramId);
      if (program) {
        this.activeProgramName = program.name;
        this.activeProgramDescription = program.description;
        this.activeProgramTargetKcal = program.targetKcal || 2000;
      }
    }
  }

  _renderDaySwitcher() {
    const switcher = document.getElementById('meal-weekday-switcher');
    if (!switcher) return;
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    switcher.innerHTML = days
      .map((d) => {
        const isToday = d === 'Wed';
        const isSelected = d === this.selectedDay;
        return `<button onclick="selectMealDay('${d}')" class="px-4 py-2 rounded-lg font-bold text-xs transition-all whitespace-nowrap ${isSelected ? 'bg-primary text-white shadow-sm' : 'text-on-surface-variant hover:text-primary hover:bg-surface-container'}">${d}${isToday ? ' (Today)' : ''}</button>`;
      })
      .join('');

    const titleEl = document.getElementById('client-program-title');
    const descEl = document.getElementById('client-program-description');
    if (titleEl) titleEl.innerText = this.activeProgramName || 'Your Nutrition Program';
    if (descEl) descEl.innerText = this.activeProgramDescription || 'Follow this program to reach your wellness goals.';
  }

  _renderMeals(clientName) {
    const plans = programModel.getClientMealPlan(clientName);
    const dayMeals = plans[this.selectedDay] || [];
    const target = this.activeProgramTargetKcal || diaryModel.getTargetKcal(clientName);
    const macros = diaryModel.getMacroTargets();
    const loggedStatus = diaryModel.getLoggedStatus();

    let curKcal = 0, curP = 0, curC = 0, curF = 0;
    dayMeals.forEach((m) => {
      curKcal += m.calories;
      curP += m.p || 0;
      curC += m.c || 0;
      curF += m.f || 0;
    });

    const setText = (id, val) => { const el = document.getElementById(id); if (el) el.innerText = val; };
    setText('meals-kcal-ratio', curKcal.toLocaleString());
    setText('meals-kcal-target-label', `/ ${target} kcal`);
    setText('meals-macro-protein-label', `${curP}g / ${macros.protein}g`);
    setText('meals-macro-carbs-label', `${curC}g / ${macros.carbs}g`);
    setText('meals-macro-fats-label', `${curF}g / ${macros.fats}g`);

    const circle = document.getElementById('meals-progress-circle');
    if (circle) circle.style.strokeDashoffset = 251.2 * (1 - Math.min(curKcal / target, 1));

    const barP = document.getElementById('meals-macro-protein-bar');
    const barC = document.getElementById('meals-macro-carbs-bar');
    const barF = document.getElementById('meals-macro-fats-bar');
    if (barP) barP.style.width = `${Math.min((curP / macros.protein) * 100, 100)}%`;
    if (barC) barC.style.width = `${Math.min((curC / macros.carbs) * 100, 100)}%`;
    if (barF) barF.style.width = `${Math.min((curF / macros.fats) * 100, 100)}%`;

    const container = document.getElementById('meals-plan-cards-container');
    if (!container) return;
    container.className = 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-gutter w-full';

    const slots = ['Breakfast', 'Lunch', 'Snack', 'Dinner'];
    container.innerHTML = slots
      .map((slotName) => {
        const meal = dayMeals.find((m) => m.type.toLowerCase() === slotName.toLowerCase());
        const isLogged = loggedStatus[clientName]?.[this.selectedDay]?.[slotName] === true;
        if (!meal) return this._emptySlot(slotName);
        return this._mealCard(slotName, meal, isLogged, clientName);
      })
      .join('');
  }

  _emptySlot(slotName) {
    return `
      <div class="bg-surface border-2 border-dashed border-outline-variant/30 rounded-2xl p-6 flex flex-col justify-center items-center min-h-[220px] shadow-sm">
        <span class="material-symbols-outlined text-4xl text-outline-variant/60" aria-hidden="true">restaurant_menu</span>
        <span class="font-bold text-sm text-slate-500 mt-2">${slotName}</span>
        <span class="text-xs text-slate-400">No meal planned</span>
      </div>`;
  }

  _mealCard(slotName, meal, isLogged, clientName) {
    const btnClass = isLogged
      ? 'bg-primary hover:bg-[#005321] text-white font-bold text-[10px] px-3.5 py-2.5 rounded-xl flex items-center gap-1 cursor-pointer transition-all active:scale-95 w-full justify-center'
      : 'bg-primary/10 hover:bg-primary/20 text-primary font-bold text-[10px] px-3.5 py-2.5 rounded-xl flex items-center gap-1 cursor-pointer transition-all active:scale-95 w-full justify-center';
    const btnIcon = isLogged ? 'check_circle' : 'radio_button_unchecked';
    const btnLabel = isLogged ? 'Logged' : 'Log Meal';

    return `
      <div class="service-card glass-card rounded-2xl overflow-hidden flex flex-col h-full bg-white relative group w-full shadow-sm">
        <div class="h-36 w-full relative">
          ${meal.image ? `<img class="w-full h-full object-cover" src="${meal.image}" alt="${meal.title}" loading="lazy">` : `
            <div class="w-full h-full bg-primary/10 flex items-center justify-center text-primary">
              <span class="material-symbols-outlined text-4xl">restaurant</span>
            </div>`}
          <div class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
          <span class="absolute top-3 left-3 bg-[#e5eeff] text-[#006a61] border border-[#86f2e4]/35 font-bold text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider">${slotName}</span>
        </div>
        <div class="p-4 flex flex-col flex-grow">
          <h3 class="font-bold text-on-surface text-base mb-1 leading-tight">${meal.title}</h3>
          <p class="text-[11px] text-on-surface-variant flex-grow line-clamp-2 mb-3 mt-1 leading-normal">Plan designed by your nutritionist.</p>
          <div class="grid grid-cols-4 gap-1 text-center bg-slate-50 p-1.5 rounded-lg border border-slate-200 text-[9px] font-bold text-on-surface-variant/90 mb-3">
            <div><span class="block text-on-background">${meal.calories}</span>KCAL</div>
            <div><span class="block text-on-background">${meal.p}g</span>PRO</div>
            <div><span class="block text-on-background">${meal.c}g</span>CARB</div>
            <div><span class="block text-on-background">${meal.f}g</span>FAT</div>
          </div>
          <div class="flex items-center justify-between border-t border-outline-variant/20 pt-2 mt-auto gap-2">
            <button onclick="viewRecipeDetails('${meal.title}','${slotName}','${meal.image || ''}',${meal.calories},${meal.p},${meal.c},${meal.f})" class="border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold text-[10px] px-3.5 py-2.5 rounded-xl transition-all cursor-pointer w-full justify-center">View Recipe</button>
            <button onclick="toggleLogMeal('${this.selectedDay}','${slotName}')" class="${btnClass}">
              <span class="material-symbols-outlined text-[14px]">${btnIcon}</span> ${btnLabel}
            </button>
          </div>
        </div>
      </div>`;
  }

  selectDay(day) {
    this.selectedDay = day;
    this.render();
  }
}

export const mealPlanView = new MealPlanView();

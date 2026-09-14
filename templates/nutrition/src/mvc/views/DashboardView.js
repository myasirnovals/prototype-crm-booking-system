/**
 * DashboardView — Render ringkasan harian, meals, hydration, progress ring.
 *
 * SRS acuan: FR-DASH-01..06, FR-DIARY-01..06.
 */
import { clientModel } from '../models/ClientModel.js';
import { programModel } from '../models/ProgramModel.js';
import { diaryModel } from '../models/DiaryModel.js';

export class DashboardView {
  constructor() {
    this.today = 'Wed'; // prototype: Rabu = hari ini
  }

  render() {
    const clientName = clientModel.getLoggedClientName();
    this._updateWelcome(clientName);
    this._updateStreak(clientName);
    this._renderMeals(clientName);
    this._updateKcal(clientName);
    this._renderWater(clientName);
    this._renderChatPreview(clientName);
    this._handleOnboardingBanner(clientName);
  }

  _updateWelcome(clientName) {
    const el = document.getElementById('client-welcome-name-label');
    if (el) el.innerText = `Good morning, ${clientName.split(' ')[0]}!`;
  }

  _updateStreak(clientName) {
    const el = document.getElementById('client-streak-label');
    const days = clientModel.getStreakDays(clientName);
    if (el) el.innerText = `Streak: ${days} Days`;
  }

  _renderMeals(clientName) {
    const grid = document.getElementById('dashboard-meals-grid');
    if (!grid) return;

    const plans = programModel.getClientMealPlan(clientName);
    const dayMeals = plans[this.today] || [];
    const slots = ['Breakfast', 'Lunch', 'Snack', 'Dinner'];
    const loggedStatus = diaryModel.getLoggedStatus();

    grid.innerHTML = slots.map((slotName) => {
      const meal = dayMeals.find((m) => m.type.toLowerCase() === slotName.toLowerCase());
      const isLogged = loggedStatus[clientName]?.[this.today]?.[slotName] === true;
      const totalMacros = (meal?.p || 0) + (meal?.c || 0) + (meal?.f || 0) || 1;
      const cPct = ((meal?.c || 0) / totalMacros) * 100;
      const pPct = ((meal?.p || 0) / totalMacros) * 100;
      const fPct = ((meal?.f || 0) / totalMacros) * 100;

      if (!meal) {
        return this._emptySlotHtml(slotName);
      }

      return this._mealCardHtml(slotName, meal, isLogged, cPct, pPct, fPct);
    }).join('');
  }

  _emptySlotHtml(slotName) {
    return `
      <div class="bg-white border border-outline-variant/35 rounded-2xl p-6 flex flex-col justify-center items-center text-center shadow-sm min-h-[120px] gap-2">
        <div class="w-10 h-10 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center shrink-0 border border-slate-100">
          <span class="material-symbols-outlined text-lg">restaurant_menu</span>
        </div>
        <div>
          <span class="block text-[8px] uppercase tracking-widest text-slate-400 font-bold leading-none">${slotName}</span>
          <span class="font-bold text-xs text-slate-400/90 block mt-1.5">No meal planned for today</span>
        </div>
      </div>
    `;
  }

  _mealCardHtml(slotName, meal, isLogged, cPct, pPct, fPct) {
    const cardBg = isLogged ? 'bg-white border-primary/25' : 'bg-slate-50/70 border-slate-200';
    const imageStyle = isLogged ? 'filter: none;' : 'filter: grayscale(100%) contrast(85%) opacity(70%);';
    const btnHtml = isLogged
      ? `<button onclick="toggleLogMeal('${this.today}', '${slotName}')" class="bg-red-600 hover:bg-red-700 text-white rounded-full p-1 border border-outline-variant/35 shadow-md flex items-center justify-center cursor-pointer transition-transform active:scale-90" title="Unlog meal" aria-label="Unlog ${slotName}">
           <span class="material-symbols-outlined text-[10px] font-bold">close</span>
         </button>`
      : `<button onclick="toggleLogMeal('${this.today}', '${slotName}')" class="bg-primary hover:bg-[#005321] text-white font-bold text-[9px] px-2.5 py-1.5 rounded-xl flex items-center gap-0.5 shadow-sm transition-all active:scale-95 cursor-pointer" title="Log consumed" aria-label="Log ${slotName}">
           <span class="material-symbols-outlined text-[12px] font-bold">check_circle</span> Log Eat
         </button>`;

    return `
      <div class="border rounded-2xl overflow-hidden shadow-sm relative group ${cardBg} transition-all duration-300" data-slot="${slotName}">
        <div class="h-28 w-full relative overflow-hidden">
          <img class="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300 pointer-events-none select-none" style="${imageStyle}" src="${meal.image}" alt="${meal.title}" loading="lazy">
          <span class="absolute top-2.5 left-2.5 bg-white/95 text-slate-700 font-bold text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm z-10">${slotName}</span>
        </div>
        <div class="p-3 flex flex-col gap-2 bg-white">
          <div class="flex justify-between items-center gap-2">
            <span class="font-bold text-xs text-slate-800 line-clamp-1">${meal.title}</span>
            <span class="text-xs font-bold text-slate-500 shrink-0">${meal.calories} kcal</span>
          </div>
          <div class="w-full h-1.5 rounded-full overflow-hidden flex bg-slate-100" role="progressbar" aria-label="Macronutrient distribution" aria-valuenow="${meal.calories}" aria-valuemin="0" aria-valuemax="${meal.calories}">
            <div class="bg-[#006e2f]" style="width: ${cPct}%"></div>
            <div class="bg-[#006a61]" style="width: ${pPct}%"></div>
            <div class="bg-[#9d4300]" style="width: ${fPct}%"></div>
          </div>
          <div class="flex justify-between text-[9px] text-slate-400 font-bold">
            <span>${meal.c || 0}G C</span>
            <span>${meal.p || 0}G P</span>
            <span>${meal.f || 0}G F</span>
          </div>
          <div class="pt-2 border-t border-slate-100 flex justify-end">${btnHtml}</div>
        </div>
      </div>
    `;
  }

  _updateKcal(clientName) {
    const target = diaryModel.getTargetKcal(clientName);
    const macros = diaryModel.getMacroTargets();
    const plans = programModel.getClientMealPlan(clientName);
    const dayMeals = plans[this.today] || [];
    const loggedStatus = diaryModel.getLoggedStatus();

    let consumed = 0, pro = 0, carb = 0, fat = 0;
    dayMeals.forEach((meal) => {
      if (loggedStatus[clientName]?.[this.today]?.[meal.type] === true) {
        consumed += meal.calories;
        pro += meal.p || 0;
        carb += meal.c || 0;
        fat += meal.f || 0;
      }
    });

    const setText = (id, val) => { const el = document.getElementById(id); if (el) el.innerText = val; };
    setText('kcal-left-value', consumed.toLocaleString());
    setText('summary-consumed-kcal', `${consumed} kcal`);
    setText('summary-protein', `${pro}g / ${macros.protein}g`);
    setText('summary-carbs', `${carb}g / ${macros.carbs}g`);
    setText('summary-fat', `${fat}g / ${macros.fats}g`);

    const pct = Math.min(consumed / target, 1);
    const offset = 251.2 * (1 - pct);
    const circle = document.getElementById('kcal-progress-circle');
    if (circle) circle.style.strokeDashoffset = offset;

    const barP = document.getElementById('summary-protein-bar');
    const barC = document.getElementById('summary-carbs-bar');
    const barF = document.getElementById('summary-fat-bar');
    if (barP) barP.style.width = `${Math.min((pro / macros.protein) * 100, 100)}%`;
    if (barC) barC.style.width = `${Math.min((carb / macros.carbs) * 100, 100)}%`;
    if (barF) barF.style.width = `${Math.min((fat / macros.fats) * 100, 100)}%`;
  }

  _renderWater(clientName) {
    const grid = document.getElementById('water-glasses-grid');
    if (!grid) return;
    const glasses = clientModel.getWaterGlasses(clientName);
    const max = 8;
    let html = '';
    for (let i = 1; i <= max; i++) {
      const filled = i <= glasses;
      html += `
        <button onclick="toggleWaterGlass(${i})" class="water-glass ${filled ? 'filled' : 'text-outline-variant hover:text-secondary'} w-12 h-14 rounded-b-lg rounded-t-sm border-2 border-outline-variant/30 bg-surface flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-sm" aria-label="${filled ? 'Remove' : 'Add'} water glass ${i}">
          <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' ${filled ? 1 : 0};">water_drop</span>
        </button>`;
    }
    grid.innerHTML = html;
    const label = document.getElementById('water-count-label');
    if (label) label.innerText = `${glasses} / ${max}`;
  }

  _renderChatPreview(clientName) {
    const previewText = document.getElementById('client-food-chat-preview-text');
    const previewSender = document.getElementById('client-food-chat-preview-sender');
    if (!previewText || !previewSender) return;
    const chats = programModel.getChats();
    const chatKey = `${clientName}_food_chat`;
    const chat = chats.find((c) => c.id === chatKey);
    if (chat && chat.chatHistory.length > 0) {
      const last = chat.chatHistory[chat.chatHistory.length - 1];
      previewSender.innerText = last.senderName || 'Nutrition Specialist';
      previewText.innerText = last.text || 'No recent nutrition discussions.';
    } else {
      previewSender.innerText = 'Nutrition Specialist';
      previewText.innerText = 'No recent nutrition discussions.';
    }
  }

  _handleOnboardingBanner(clientName) {
    const banner = document.getElementById('onboarding-incomplete-banner');
    if (!banner) return;
    const profile = clientModel.getProfile(clientName);
    const seedClients = ['Sarah Jenkins', 'Marcus Reid', 'Elena Lopez'];
    if (!profile && !seedClients.includes(clientName)) {
      banner.classList.remove('hidden');
    } else {
      banner.classList.add('hidden');
    }
  }
}

export const dashboardView = new DashboardView();

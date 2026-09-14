/**
 * AdminProgramView — View untuk menangani Programs Directory dan Meal Builder.
 */
import { adminProgramModel } from '../models/AdminProgramModel.js';
import { adminClientModel } from '../models/AdminClientModel.js';

export class AdminProgramView {
  render() {
    this.renderProgramsList();
  }

  renderProgramsList() {
    const container = document.getElementById('programs-cards-grid');
    if (!container) return;

    let programs = adminProgramModel.getPrograms();
    const searchEl = document.getElementById('programs-search');
    if (searchEl && searchEl.value.trim()) {
      const q = searchEl.value.toLowerCase();
      programs = programs.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
    }

    container.innerHTML = programs.map(p => {
      // Calculate total weekly cals/macros (mock for now, we'll keep it simple)
      const clientsOnProgram = adminClientModel.getClients().filter(c => c.activeProgramId === p.id).length;
      
      return `
        <div class="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-5 shadow-sm flex flex-col gap-4 relative overflow-hidden group">
            <div class="flex justify-between items-start gap-4">
                <div class="flex-grow">
                    <h3 class="font-bold text-on-background text-sm group-hover:text-primary transition-colors cursor-pointer">${p.name}</h3>
                    <p class="text-[11px] text-on-surface-variant mt-1 line-clamp-2">${p.description}</p>
                </div>
            </div>
            
            <div class="flex gap-2 text-[10px] font-bold text-on-surface-variant">
                <span class="bg-surface-container-low px-2 py-1 rounded-md border border-outline-variant/20 flex items-center gap-1"><span class="material-symbols-outlined text-[12px] text-primary">local_fire_department</span> ${p.targetKcal} kcal/day</span>
                <span class="bg-surface-container-low px-2 py-1 rounded-md border border-outline-variant/20 flex items-center gap-1"><span class="material-symbols-outlined text-[12px] text-[#006a61]">group</span> ${clientsOnProgram} active</span>
            </div>

            <div class="flex gap-2 mt-auto border-t border-surface-variant/20 pt-4">
                <button onclick="editProgram('${p.id}')" class="flex-1 bg-[#e0f2fe] hover:bg-[#bae6fd] text-[#0369a1] font-bold text-[10px] py-2 rounded-xl transition-all shadow-sm">
                    Builder
                </button>
                <button onclick="shareProgramDirect('${p.id}')" class="flex-1 bg-surface border border-outline-variant/40 hover:bg-slate-50 text-on-surface-variant font-bold text-[10px] py-2 rounded-xl transition-all shadow-sm">
                    Share Link
                </button>
            </div>
        </div>
      `;
    }).join('');
  }
}

export const adminProgramView = new AdminProgramView();

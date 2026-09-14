/**
 * AdminClientView — View untuk menangani daftar klien dan Medical Intake (Admin side).
 */
import { adminClientModel } from '../models/AdminClientModel.js';

export class AdminClientView {
  constructor() {
    this.page = 0;
    this.itemsPerPage = 10;
  }

  render() {
    const tableBody = document.getElementById('admin-clients-table-body');
    if (!tableBody) return;

    let clients = adminClientModel.getClients();
    
    // Search
    const searchEl = document.getElementById('admin-client-search');
    if (searchEl && searchEl.value.trim()) {
      const q = searchEl.value.toLowerCase();
      clients = clients.filter(c => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q));
    }
    
    // Filters
    const ownerEl = document.getElementById('admin-client-filter-owner');
    if (ownerEl && ownerEl.value === 'mine') {
      const activeSpecialistName = localStorage.getItem('nutriflow_specialist_name') || 'Dr. Hasan';
      clients = clients.filter(c => c.therapist === activeSpecialistName);
    }
    const goalEl = document.getElementById('admin-client-filter-goal');
    if (goalEl && goalEl.value !== 'all') {
      clients = clients.filter(c => c.goal === goalEl.value);
    }

    const total = clients.length;
    const maxPage = Math.ceil(total / this.itemsPerPage) - 1;
    if (this.page > maxPage) this.page = maxPage < 0 ? 0 : maxPage;

    const start = this.page * this.itemsPerPage;
    const paginated = clients.slice(start, start + this.itemsPerPage);

    tableBody.innerHTML = paginated.map(cli => {
      const isDeclining = cli.weightTrend && cli.weightTrend.length >= 2 && cli.weightTrend[cli.weightTrend.length - 1] > cli.weightTrend[cli.weightTrend.length - 2];
      const hasIntake = cli.allergies?.length > 0 || cli.conditions?.length > 0;
      
      return `
        <tr class="bg-surface-container-lowest lg:hover:bg-surface-container-low transition-colors group cursor-pointer lg:cursor-auto" onclick="window.innerWidth < 1024 ? window.toggleMobileAccordion(this) : null">
          <td class="p-4 pl-6 flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0 shadow-sm border border-outline-variant/20">
              ${cli.avatar || 'C'}
            </div>
            <div>
              <p class="font-bold text-on-background text-sm flex items-center gap-1.5">
                ${cli.name} 
                ${hasIntake ? `<span class="material-symbols-outlined text-amber-600 text-[14px]" title="Has Medical Intake Data">warning</span>` : ''}
              </p>
              <p class="text-[10px] text-on-surface-variant">${cli.email}</p>
            </div>
            <span class="material-symbols-outlined accordion-chevron ml-auto lg:hidden text-on-surface-variant transition-transform">expand_more</span>
          </td>
          <td class="p-4 hidden lg:table-cell"><span class="bg-surface-container-high text-on-surface text-[10px] font-bold px-2 py-1 rounded-full whitespace-nowrap border border-outline-variant/30">${cli.goal || 'General'}</span></td>
          <td class="p-4 hidden lg:table-cell text-[11px] text-on-surface-variant font-medium whitespace-nowrap">${cli.lastCheckIn || '-'}</td>
          <td class="p-4 hidden lg:table-cell">
            <div class="flex items-center gap-2 w-32">
              <div class="w-full bg-surface-variant rounded-full h-1.5 overflow-hidden">
                <div class="${(cli.compliance || 0) >= 80 ? 'bg-[#006e2f]' : ((cli.compliance || 0) > 50 ? 'bg-amber-500' : 'bg-red-500')} h-1.5 rounded-full" style="width: ${cli.compliance || 0}%"></div>
              </div>
              <span class="text-[10px] font-bold text-on-surface w-6 text-right">${cli.compliance || 0}%</span>
            </div>
          </td>
          <td class="p-4 hidden lg:table-cell">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-[16px] ${isDeclining ? 'text-red-500' : 'text-emerald-500'} font-bold">
                ${isDeclining ? 'trending_up' : 'trending_down'}
              </span>
              <span class="text-xs font-semibold text-on-surface-variant">${cli.weightTrend?.[cli.weightTrend.length - 1] || '-'} lbs</span>
            </div>
          </td>
          <td class="p-4 pr-6 hidden lg:table-cell text-right">
            <div class="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onclick="event.stopPropagation(); openClientIntakeModal('${cli.email}')" class="p-2 hover:bg-surface-container hover:text-primary text-on-surface-variant rounded-full transition-colors inline-block cursor-pointer" title="View/Edit Medical Intake">
                <span class="material-symbols-outlined text-lg">medical_information</span>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    const countLabel = document.getElementById('admin-clients-count-label');
    if (countLabel) {
      countLabel.innerText = total === 0 ? 'No clients found' : `Showing ${start + 1} to ${Math.min(start + this.itemsPerPage, total)} of ${total} clients`;
    }
    
    const prevBtn = document.getElementById('admin-pagination-prev');
    const nextBtn = document.getElementById('admin-pagination-next');
    if (prevBtn) prevBtn.disabled = this.page === 0;
    if (nextBtn) nextBtn.disabled = this.page >= maxPage;
  }

  changePage(dir) {
    this.page += dir;
    this.render();
  }

  openIntakeModal(email) {
    const cli = adminClientModel.getClientByEmail(email);
    if (!cli) return;

    // Fill the intake modal form
    const m = document.getElementById('client-intake-modal');
    if (!m) return;
    
    m.classList.remove('hidden');
    m.classList.add('flex');
    
    document.getElementById('admin-intake-client-name').innerText = cli.name;
    // Note: The UI doesn't have an ID for goal-label in this modal in the new HTML, skipping it if missing
    document.getElementById('admin-intake-client-email').value = cli.email;

    // Basic checkboxes
    document.querySelectorAll('input[name="admin-intake-allergies"]').forEach(cb => cb.checked = (cli.allergies || []).includes(cb.value));
    document.querySelectorAll('input[name="admin-intake-conditions"]').forEach(cb => cb.checked = (cli.conditions || []).includes(cb.value));
  }

  closeIntakeModal() {
    const m = document.getElementById('client-intake-modal');
    if (m) {
      m.classList.add('hidden');
      m.classList.remove('flex');
    }
  }

  openAddClientModal() {
    const m = document.getElementById('add-client-modal');
    if (m) {
      m.classList.remove('hidden');
      m.classList.add('flex');
    }
  }

  closeAddClientModal() {
    const m = document.getElementById('add-client-modal');
    if (m) {
      m.classList.add('hidden');
      m.classList.remove('flex');
    }
  }
}

export const adminClientView = new AdminClientView();

/**
 * AdminAppointmentView — View untuk menangani tabel jadwal appointment (Admin side).
 */
import { adminAppointmentModel } from '../models/AdminAppointmentModel.js';

export class AdminAppointmentView {
  render() {
    const tbody = document.getElementById('appointments-table-body');
    const footer = document.getElementById('appointments-table-footer');
    if (!tbody) return;

    let apts = adminAppointmentModel.getAppointments();
    
    // Filter & Search
    const searchEl = document.getElementById('appointments-search');
    const filterEl = document.getElementById('appointments-filter-status');
    
    if (searchEl && searchEl.value.trim()) {
      const q = searchEl.value.toLowerCase();
      apts = apts.filter(a => a.clientName.toLowerCase().includes(q) || a.serviceTitle.toLowerCase().includes(q));
    }

    if (filterEl && filterEl.value !== 'all') {
      apts = apts.filter(a => a.status === filterEl.value);
    }

    if (apts.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" class="text-center py-8 text-on-surface-variant text-sm">No reservations found.</td></tr>`;
      if (footer) footer.innerText = 'Showing 0 reservations';
      return;
    }

    const getStatusStyle = (status) => {
      if (status === 'approved' || status === 'confirmed' || status === 'completed') return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      if (status === 'pending') return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      if (status === 'cancelled') return 'bg-gray-100 text-gray-800 border-gray-200';
      return 'bg-surface-container-high text-on-surface border-outline-variant/30';
    };

    const getStatusText = (status) => {
      if (status === 'approved') return 'Confirmed';
      return status.charAt(0).toUpperCase() + status.slice(1);
    };

    tbody.innerHTML = apts.map(apt => `
        <tr class="flex flex-col lg:table-row bg-surface-container-lowest border border-outline-variant/30 lg:border-0 rounded-2xl p-4 lg:p-0 gap-3 mb-4 lg:mb-0 hover:bg-surface-container-low/30 transition-colors shadow-[0_2px_8px_rgba(0,0,0,0.02)] lg:shadow-none">
            <!-- Patient Header (Mobile Card Header - Click to Expand) -->
            <td onclick="window.innerWidth < 1024 ? window.toggleMobileAccordion(this.closest('tr')) : null" class="cursor-pointer lg:cursor-default flex justify-between items-center lg:table-cell p-0 lg:p-4 pl-0 lg:pl-6 text-left border-b border-outline-variant/15 lg:border-0 pb-3 lg:pb-4">
                <div class="flex justify-between items-start w-full">
                    <div class="text-left">
                        <div class="font-bold text-on-background text-sm lg:text-xs">${apt.clientName}</div>
                        <div class="text-[10px] font-mono text-on-surface-variant/80 mt-0.5">#${apt.id.toUpperCase()}</div>
                        <div class="mt-1">
                            ${apt.paymentStatus === 'paid' ? `<span class="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] font-bold px-1.5 py-0.5 rounded-full inline-flex items-center gap-0.5"><span class="material-symbols-outlined text-[10px]">verified</span> Paid ($${apt.price})</span>` : `<span class="bg-amber-50 text-amber-700 border border-amber-200 text-[9px] font-bold px-1.5 py-0.5 rounded-full">Unpaid / Pending</span>`}
                        </div>
                    </div>
                    <div class="flex items-center gap-2">
                        <!-- Mobile Status Badge -->
                        <span class="lg:hidden text-[9px] font-bold px-2 py-1 rounded-full border ${getStatusStyle(apt.status)}">
                            ${getStatusText(apt.status)}
                        </span>
                        <span class="material-symbols-outlined accordion-chevron text-on-surface-variant transition-transform lg:hidden">expand_more</span>
                    </div>
                </div>
            </td>
            
            <!-- Details (Collapsible on Mobile) -->
            <td class="accordion-content hidden lg:table-cell p-0 lg:p-4 text-left border-b border-outline-variant/10 lg:border-0 pb-2 lg:pb-4">
                <span class="lg:hidden text-[9px] font-bold text-on-surface-variant uppercase tracking-wider block mb-0.5">Service</span>
                <span class="font-semibold text-on-surface bg-surface-container-low px-2 py-1 rounded-md text-[11px] border border-outline-variant/20 inline-block">${apt.serviceTitle}</span>
            </td>
            <td class="accordion-content hidden lg:table-cell p-0 lg:p-4 text-left border-b border-outline-variant/10 lg:border-0 pb-2 lg:pb-4">
                <span class="lg:hidden text-[9px] font-bold text-on-surface-variant uppercase tracking-wider block mb-0.5">Therapist</span>
                <div class="flex items-center gap-1.5">
                    <div class="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[8px] font-bold border border-primary/20 shrink-0">
                        ${apt.therapist.split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase()}
                    </div>
                    <span class="text-on-surface-variant font-medium text-[11px]">${apt.therapist}</span>
                </div>
            </td>
            <td class="accordion-content hidden lg:table-cell p-0 lg:p-4 text-left border-b border-outline-variant/10 lg:border-0 pb-2 lg:pb-4">
                <span class="lg:hidden text-[9px] font-bold text-on-surface-variant uppercase tracking-wider block mb-0.5">Date & Time</span>
                <div class="flex flex-col">
                    <span class="text-on-background font-bold text-[11px]">${apt.date}</span>
                    <span class="text-on-surface-variant text-[10px]">${apt.time}</span>
                </div>
            </td>
            <td class="accordion-content hidden lg:table-cell p-0 lg:p-4 text-left border-b border-outline-variant/10 lg:border-0 pb-2 lg:pb-4">
                <span class="lg:hidden text-[9px] font-bold text-on-surface-variant uppercase tracking-wider block mb-0.5">Duration/Type</span>
                <div class="flex flex-col gap-1 items-start">
                    <span class="text-on-surface-variant text-[11px]">${apt.duration}</span>
                    <span class="text-[9px] px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded-md border border-slate-200">${apt.type || 'Video Call'}</span>
                </div>
            </td>
            
            <td class="accordion-content hidden lg:table-cell p-0 lg:p-4 text-center lg:text-center border-b border-outline-variant/10 lg:border-0 pb-2 lg:pb-4">
                <span class="text-[9px] font-bold px-2.5 py-1 rounded-full border ${getStatusStyle(apt.status)}">
                    ${getStatusText(apt.status)}
                </span>
            </td>
            
            <!-- Actions -->
            <td class="accordion-content hidden lg:table-cell p-0 lg:p-4 pt-2 lg:pt-4 text-right">
                <div class="flex items-center justify-end gap-1.5">
                    ${apt.status === 'pending' ? `
                        <button onclick="approveAppointment('${apt.id}')" class="bg-primary hover:bg-[#005321] text-white p-1.5 rounded-lg transition-colors cursor-pointer shadow-sm border border-[#005321]/50" title="Approve">
                            <span class="material-symbols-outlined text-[16px]">check</span>
                        </button>
                        <button onclick="declineAppointment('${apt.id}')" class="bg-white hover:bg-red-50 text-red-600 border border-red-200 p-1.5 rounded-lg transition-colors cursor-pointer shadow-sm" title="Decline">
                            <span class="material-symbols-outlined text-[16px]">close</span>
                        </button>
                    ` : ''}
                    
                    ${apt.status === 'approved' && apt.type !== 'In-Person' ? `
                        <button onclick="joinAdminVideoCall('${apt.id}')" class="bg-[#006e2f] hover:bg-[#005321] text-white text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all shadow-sm border border-[#005321]/50 flex items-center gap-1 cursor-pointer">
                            <span class="material-symbols-outlined text-[14px]">videocam</span> Join Call
                        </button>
                    ` : ''}

                    <div class="relative group inline-block">
                        <button class="p-1.5 text-on-surface-variant hover:text-primary hover:bg-surface-container-low rounded-lg transition-colors cursor-pointer">
                            <span class="material-symbols-outlined text-[18px]">more_vert</span>
                        </button>
                        <!-- Dropdown actions -->
                        <div class="absolute right-0 top-full mt-1 w-32 bg-surface border border-outline-variant/30 rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 flex flex-col overflow-hidden">
                            <button onclick="editAppointment('${apt.id}')" class="text-left px-3 py-2 text-[10px] font-semibold text-on-surface-variant hover:bg-surface-container-low hover:text-primary transition-colors border-b border-outline-variant/10">Reschedule</button>
                            <button onclick="deleteAppointment('${apt.id}')" class="text-left px-3 py-2 text-[10px] font-semibold text-red-600 hover:bg-red-50 transition-colors">Cancel Appt</button>
                        </div>
                    </div>
                </div>
            </td>
        </tr>
    `).join('');

    if (footer) footer.innerText = `Showing ${apts.length} reservations`;
  }
}

export const adminAppointmentView = new AdminAppointmentView();

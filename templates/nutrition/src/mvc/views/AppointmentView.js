/**
 * AppointmentView — Render daftar appointment, upcoming, history, overview stats.
 *
 * SRS acuan: FR-APPT-01..09, FR-SESS-01..02.
 */
import { clientModel } from '../models/ClientModel.js';
import { appointmentModel } from '../models/AppointmentModel.js';

export class AppointmentView {
  render() {
    const clientName = clientModel.getLoggedClientName();
    this._renderUpcoming(clientName);
    this._renderOverview(clientName);
    this._renderHistory(clientName);
  }

  _renderUpcoming(clientName) {
    const list = document.getElementById('appointments-upcoming-list');
    if (!list) return;

    const upcoming = appointmentModel.getUpcomingClientAppointments(clientName);
    const clients = clientModel.getClients();
    const clientDetails = clients.find((c) => c.name === clientName);
    const therapist = clientDetails?.therapist || 'Dr. Hasan';

    if (upcoming.length === 0) {
      list.innerHTML = `
        <div class="w-full py-8 text-center text-xs font-semibold text-on-surface-variant border border-dashed border-outline-variant/35 rounded-2xl bg-surface-container-lowest">
          No upcoming appointments. Book a new session to get started.
        </div>`;
      return;
    }

    list.innerHTML = upcoming
      .map((apt) => {
        const dateObj = new Date(apt.date);
        const monthStr = dateObj.toLocaleString('en-US', { month: 'short' }).toUpperCase();
        const dayStr = dateObj.getDate();
        const isPending = apt.status === 'pending';
        const isVideo = apt.type?.toLowerCase().includes('video') || apt.type?.toLowerCase().includes('virtual');

        return `
          <div class="bg-surface-container-lowest rounded-2xl p-4 border border-outline-variant/30 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 md:w-16 md:h-16 rounded-xl bg-surface-container-low border border-surface-variant/35 flex flex-col items-center justify-center shrink-0">
                <span class="text-[8px] md:text-[10px] font-bold text-on-surface-variant">${monthStr}</span>
                <span class="text-lg md:text-2xl font-extrabold text-on-surface mt-0.5 leading-none">${dayStr}</span>
              </div>
              <div>
                <div class="flex items-center gap-2 flex-wrap">
                  <h3 class="font-bold text-on-background text-sm md:text-base leading-tight">${apt.serviceTitle}</h3>
                  ${isPending ? '<span class="bg-amber-100 text-amber-800 text-[8px] font-bold px-1.5 py-0.5 rounded-full border border-amber-300">Pending</span>' : ''}
                </div>
                <div class="flex items-center gap-2.5 text-[10px] md:text-xs text-on-surface-variant font-medium mt-1">
                  <span class="flex items-center gap-1"><span class="material-symbols-outlined text-[13px] md:text-[15px]" aria-hidden="true">schedule</span> ${apt.time}</span>
                  <span>•</span>
                  <span class="flex items-center gap-1"><span class="material-symbols-outlined text-[13px] md:text-[15px]" aria-hidden="true">videocam</span> ${apt.type}</span>
                </div>
                <div class="flex items-center gap-2 mt-1.5">
                  <div class="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[9px] font-bold border shrink-0">${therapist.split(' ').map((s) => s[0]).join('').substring(0, 2).toUpperCase()}</div>
                  <span class="text-[10px] md:text-xs text-on-surface font-semibold">${therapist}</span>
                </div>
              </div>
            </div>
            <div class="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0 pt-2 sm:pt-0 border-t border-slate-100 sm:border-t-0 justify-end shrink-0">
              ${!isPending && isVideo
                ? `<button onclick="joinVideoCall('${apt.id}')" class="bg-primary hover:bg-[#005321] text-white font-bold text-[10px] md:text-xs px-3.5 py-2 rounded-lg shadow-sm transition-all active:scale-95 cursor-pointer flex-1 sm:flex-initial text-center justify-center">Join Call</button>`
                : ''}
              <button onclick="rescheduleAppointment('${apt.id}')" class="border border-outline-variant/30 hover:bg-surface-container text-on-surface-variant font-bold text-[10px] md:text-xs px-3.5 py-2 rounded-lg transition-colors cursor-pointer flex-1 sm:flex-initial text-center justify-center">Reschedule</button>
            </div>
          </div>`;
      })
      .join('');
  }

  _renderOverview(clientName) {
    const appointments = appointmentModel.getAppointments();
    const completed = appointments.filter((a) => a.status === 'completed' && a.clientName === clientName).length + 12;
    const upcoming = appointments.filter((a) => (a.status === 'approved' || a.status === 'pending') && a.clientName === clientName).length;

    const elCompleted = document.getElementById('overview-completed-count');
    const elUpcoming = document.getElementById('overview-upcoming-count');
    if (elCompleted) elCompleted.innerText = completed;
    if (elUpcoming) elUpcoming.innerText = upcoming;
  }

  _renderHistory(clientName) {
    const list = document.getElementById('appointments-history-list');
    if (!list) return;
    const clients = clientModel.getClients();
    const clientDetails = clients.find((c) => c.name === clientName);
    const therapist = clientDetails?.therapist || 'Dr. Hasan';

    const histories = [
      { title: 'Initial Consultation', date: 'Sep 15, 2023', doc: therapist },
      { title: 'Check-in', date: 'Aug 02, 2023', doc: therapist },
    ];

    list.innerHTML = histories
      .map(
        (h) => `
      <div onclick="viewHistoryDetailsByTitle('${h.title}')" class="flex justify-between items-center pb-2 border-b border-surface-variant/30 text-xs cursor-pointer hover:text-primary transition-colors group">
        <div>
          <h4 class="font-bold text-on-background group-hover:text-primary transition-colors">${h.title}</h4>
          <p class="text-[10px] text-on-surface-variant/80 mt-0.5">${h.date} • ${h.doc}</p>
        </div>
        <span class="material-symbols-outlined text-on-surface-variant/50 group-hover:text-primary group-hover:translate-x-0.5 text-[18px] transition-all" aria-hidden="true">chevron_right</span>
      </div>`
      )
      .join('');
  }
}

export const appointmentView = new AppointmentView();

/**
 * ChatView — Program discussion chat antara client dan specialist.
 *
 * SRS acuan: FR-MSG-01..07, FR-PROG-01..08.
 */
import { clientModel } from '../models/ClientModel.js';
import { programModel } from '../models/ProgramModel.js';

export class ChatView {
  render() {
    const clientName = clientModel.getLoggedClientName();
    this._renderChat(clientName);
  }

  _renderChat(clientName) {
    const container = document.getElementById('program-chat-container');
    if (!container) return;

    const clients = clientModel.getClients();
    const clientDetails = clients.find((c) => c.name === clientName);
    const progId = clientDetails?.activeProgramId || 'prog-sarah';
    const programs = programModel.getPrograms();
    const program = programs.find((p) => p.id === progId);

    if (!program) {
      container.innerHTML = '<div class="text-[10px] text-on-surface-variant font-medium text-center py-6">No program discussion thread available.</div>';
      return;
    }

    // Sync header
    const therapistName = clientDetails?.therapist || program.creator || 'Dr. Hasan';
    const specNameEl = document.getElementById('chat-page-specialist-name');
    const specAvatarEl = document.getElementById('chat-page-specialist-avatar');
    if (specNameEl) specNameEl.innerText = therapistName;
    if (specAvatarEl) specAvatarEl.innerText = therapistName.split(' ').map((s) => s[0]).join('').substring(0, 2).toUpperCase();

    const chatKey = `${progId}_${clientName}`;
    const chats = programModel.getChats();
    let chat = chats.find((c) => c.id === chatKey);

    if (!chat) {
      chat = {
        id: chatKey,
        programId: progId,
        clientName,
        chatHistory: [
          { sender: 'doctor', senderName: therapistName, text: `Welcome to your customized nutrition program "${program.name}". Ask me any questions!`, time: '10:00 AM' },
        ],
      };
    }

    container.innerHTML = chat.chatHistory
      .map((msg) => {
        const isDoc = msg.sender === 'doctor';
        const bubbleBg = isDoc ? 'bg-[#f1f5f9] text-slate-800 rounded-tl-none' : 'bg-primary text-white rounded-tr-none';
        const align = isDoc ? 'justify-start' : 'justify-end';

        let attachmentHtml = '';
        if (msg.type === 'ai_food_scan' && msg.scanData) {
          const sd = msg.scanData;
          attachmentHtml = `
            <div class="mt-2 rounded-xl overflow-hidden border border-outline-variant/30 shadow-md bg-surface text-slate-800 w-[240px] max-w-full flex flex-col">
              <div class="relative h-32 bg-slate-100"><img src="${sd.imageUrl}" class="w-full h-full object-cover"></div>
              <div class="p-3">
                <h4 class="font-black text-sm">${sd.foodName}</h4>
                <div class="text-lg font-black text-primary">${sd.calories} <span class="text-[10px]">kcal</span></div>
                <div class="grid grid-cols-3 gap-1.5 my-2">
                  <div class="bg-slate-50 p-1.5 rounded text-center"><span class="text-[9px] font-black text-slate-500">Pro</span><div class="text-[11px] font-bold">${sd.protein}g</div></div>
                  <div class="bg-slate-50 p-1.5 rounded text-center"><span class="text-[9px] font-black text-slate-500">Carb</span><div class="text-[11px] font-bold">${sd.carbs}g</div></div>
                  <div class="bg-slate-50 p-1.5 rounded text-center"><span class="text-[9px] font-black text-slate-500">Fat</span><div class="text-[11px] font-bold">${sd.fat}g</div></div>
                </div>
                <button onclick="approveAndAddToDiary('${sd.foodName}',${sd.calories},${sd.protein},${sd.carbs},${sd.fat})" class="w-full bg-primary hover:bg-[#005321] text-white text-[11px] font-bold py-2 rounded-lg flex items-center justify-center gap-1.5">Add to Meal Plan</button>
              </div>
            </div>`;
        } else if (msg.file) {
          if (msg.file.type.startsWith('image/')) {
            attachmentHtml = `<div class="mt-2 rounded-lg overflow-hidden border bg-white p-1"><img class="max-h-48 object-contain" src="${msg.file.dataUrl}" alt="${msg.file.name}"></div>`;
          } else {
            attachmentHtml = `<a href="${msg.file.dataUrl}" download="${msg.file.name}" class="mt-2 flex items-center gap-2 p-2.5 rounded-xl bg-white border">${msg.file.name}</a>`;
          }
        }

        return `
          <div class="flex ${align} w-full">
            <div class="${bubbleBg} text-xs px-3.5 py-2.5 rounded-2xl max-w-[85%] shadow-sm leading-relaxed">
              <div class="flex justify-between items-baseline gap-4 mb-0.5 opacity-80 text-[8px] font-bold uppercase tracking-wider">
                <span>${msg.senderName}</span>
                <span>${msg.time}</span>
              </div>
              ${msg.text ? `<div>${msg.text}</div>` : ''}
              ${attachmentHtml}
            </div>
          </div>`;
      })
      .join('');

    container.scrollTop = container.scrollHeight;
  }

  submitMessage(clientName, text, file) {
    const clients = clientModel.getClients();
    const clientDetails = clients.find((c) => c.name === clientName);
    const progId = clientDetails?.activeProgramId || 'prog-sarah';
    const chatKey = `${progId}_${clientName}`;
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const message = { sender: 'client', senderName: clientName, text, time: timeNow };
    if (file) message.file = file;

    programModel.addMessage(chatKey, message);
    this.render();
    return message;
  }
}

export const chatView = new ChatView();

/**
 * NutritionChatView — Chat khusus nutrisi & food scan antara client dan specialist.
 *
 * SRS acuan: FR-MSG-01..07, FR-SCAN-08..10.
 */
import { clientModel } from '../models/ClientModel.js';
import { programModel } from '../models/ProgramModel.js';

export class NutritionChatView {
  render() {
    const clientName = clientModel.getLoggedClientName();
    const container = document.getElementById('client-food-chat-messages-container');
    if (!container) return;

    const chatKey = `${clientName}_food_chat`;
    const chats = programModel.getChats();
    const chat = chats.find((c) => c.id === chatKey);

    // Update preview on dashboard
    const previewText = document.getElementById('client-food-chat-preview-text');
    const previewSender = document.getElementById('client-food-chat-preview-sender');
    if (previewSender) previewSender.innerText = 'Nutrition Specialist';
    if (previewText) {
      if (chat && chat.chatHistory.length > 0) {
        const last = chat.chatHistory[chat.chatHistory.length - 1];
        previewText.innerText = last.text || 'No recent nutrition discussions.';
      } else {
        previewText.innerText = 'No recent nutrition discussions.';
      }
    }

    if (!chat) {
      container.innerHTML = `
        <div class="flex flex-col items-center justify-center h-full text-center text-xs text-slate-400 gap-2">
          <span class="material-symbols-outlined text-3xl text-slate-300">forum</span>
          <p>Start a conversation with your nutrition specialist about food scans and meal plans.</p>
        </div>`;
      return;
    }

    container.innerHTML = chat.chatHistory
      .map((msg) => {
        const isClient = msg.sender === 'client';
        const bubbleBg = isClient ? 'bg-primary text-white rounded-tr-none' : 'bg-[#f1f5f9] text-slate-800 rounded-tl-none';
        const align = isClient ? 'justify-end' : 'justify-start';

        let attachmentHtml = '';
        if (msg.type === 'food_scan' && msg.scanData) {
          attachmentHtml = `
            <div class="mt-2 bg-white border rounded-xl p-2 text-slate-800 w-48">
              <img src="${msg.scanData.imageUrl}" class="w-full h-24 object-cover rounded-lg mb-1">
              <div class="font-bold text-xs">${msg.scanData.foodName}</div>
              <div class="text-primary font-black">${msg.scanData.calories} kcal</div>
            </div>`;
        }

        return `
          <div class="flex ${align} w-full">
            <div class="${bubbleBg} text-xs px-3.5 py-2.5 rounded-2xl max-w-[85%] shadow-sm leading-relaxed">
              <div class="flex justify-between text-[8px] font-bold uppercase opacity-80 mb-0.5">
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

  submitMessage(clientName, text) {
    const chatKey = `${clientName}_food_chat`;
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const message = { sender: 'client', senderName: clientName, text, time: timeNow };
    programModel.addMessage(chatKey, message);
    this.render();
    return message;
  }
}

export const nutritionChatView = new NutritionChatView();

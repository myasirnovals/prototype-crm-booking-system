import { state } from '../models/State.js';

let botTimer = null;
const typingDelay = 1200; // ms to simulate typing

export function openWABot() {
    window.openWABot = openWABot;
    const modal = document.getElementById('modal-wa-bot');
    const content = document.getElementById('wa-bot-content');
    
    if (modal) {
        modal.classList.remove('hidden');
        modal.style.display = 'flex';
        
        // Initial bot greeting if chat is empty
        const chatArea = document.getElementById('wa-chat-area');
        if (chatArea && chatArea.children.length === 0) {
            const brandName = window.currentTenant?.name || 'Serenity';
            appendMessage('bot', `Hi! I am the ${brandName} Expert System. How can I help you today?`);
            setTimeout(() => {
                appendMessage('bot', 'Please reply with a number:\n1. I need a relaxing massage to sleep better.\n2. I have back pain and need deep tissue work.\n3. I want a glowing face for an upcoming event.');
            }, 800);
        }

        setTimeout(() => {
            if (content) {
                content.classList.remove('translate-y-full', 'sm:translate-y-8', 'opacity-0');
                content.classList.add('translate-y-0', 'opacity-100');
            }
        }, 10);
    }
}
window.openWABot = openWABot;

export function closeWABot() {
    window.closeWABot = closeWABot;
    const modal = document.getElementById('modal-wa-bot');
    const content = document.getElementById('wa-bot-content');
    
    if (content) {
        content.classList.remove('translate-y-0', 'opacity-100');
        content.classList.add('translate-y-full', 'sm:translate-y-8', 'opacity-0');
    }
    
    setTimeout(() => {
        if (modal) {
            modal.classList.add('hidden');
            modal.style.display = 'none';
        }
    }, 300);
}
window.closeWABot = closeWABot;

export function sendWAMessage() {
    window.sendWAMessage = sendWAMessage;
    const input = document.getElementById('wa-input');
    const text = input ? input.value.trim() : '';
    
    if (!text) return;
    
    appendMessage('user', text);
    if (input) input.value = '';
    
    // Show typing indicator
    showTypingIndicator();
    
    // Simulate bot thinking
    clearTimeout(botTimer);
    botTimer = setTimeout(() => {
        hideTypingIndicator();
        handleBotReply(text);
    }, typingDelay);
}
window.sendWAMessage = sendWAMessage;

function handleBotReply(userText) {
    const text = userText.trim().toLowerCase();
    
    if (text === '1') {
        appendMessage('bot', 'I recommend our **Aromatherapy Massage**. It uses soothing essential oils like lavender to help calm your nervous system and promote deep sleep.');
        appendDeepLink('aromatherapy-massage', 'Book Aromatherapy Massage');
    } else if (text === '2') {
        appendMessage('bot', 'For muscle pain and tension, our **Serenity Signature Deep Tissue** is perfect. The therapist will focus on realigning deep muscle layers to relieve chronic aches.');
        appendDeepLink('deep-tissue', 'Book Deep Tissue');
    } else if (text === '3') {
        appendMessage('bot', 'You will love our **Illuminating Peel**. It uses fruit enzymes to instantly brighten and smooth your skin for that radiant event glow!');
        appendDeepLink('illuminating-peel', 'Book Illuminating Peel');
    } else {
        appendMessage('bot', 'I am sorry, I didn\'t quite catch that. Please reply with **1**, **2**, or **3** to get a recommendation based on your needs.');
    }
}

function appendMessage(sender, text) {
    const chatArea = document.getElementById('wa-chat-area');
    if (!chatArea) return;
    
    const div = document.createElement('div');
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Format text (simple bold replacement)
    const formattedText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');
    
    if (sender === 'user') {
        div.className = 'self-end bg-[#dcf8c6] text-[#111b21] px-3 py-1.5 rounded-lg max-w-[85%] shadow-sm relative text-[14.2px] leading-snug';
        div.innerHTML = `
            ${formattedText}
            <span class="text-[10px] text-[#667781] float-right mt-2 ml-3 flex items-center gap-1">
                ${time}
                <span class="material-symbols-outlined text-[14px] text-[#53bdeb]">done_all</span>
            </span>
        `;
    } else {
        div.className = 'self-start bg-white text-[#111b21] px-3 py-1.5 rounded-lg max-w-[85%] shadow-sm relative text-[14.2px] leading-snug';
        div.innerHTML = `
            ${formattedText}
            <span class="text-[10px] text-[#667781] float-right mt-2 ml-3">
                ${time}
            </span>
        `;
    }
    
    chatArea.appendChild(div);
    chatArea.scrollTop = chatArea.scrollHeight;
}

function showTypingIndicator() {
    const chatArea = document.getElementById('wa-chat-area');
    if (!chatArea) return;
    
    const div = document.createElement('div');
    div.id = 'wa-typing';
    div.className = 'self-start bg-white text-[#111b21] px-4 py-2 rounded-lg max-w-[85%] shadow-sm flex gap-1 items-center h-8';
    div.innerHTML = `
        <div class="w-1.5 h-1.5 bg-[#8696a0] rounded-full animate-bounce"></div>
        <div class="w-1.5 h-1.5 bg-[#8696a0] rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
        <div class="w-1.5 h-1.5 bg-[#8696a0] rounded-full animate-bounce" style="animation-delay: 0.4s"></div>
    `;
    chatArea.appendChild(div);
    chatArea.scrollTop = chatArea.scrollHeight;
}

function hideTypingIndicator() {
    const typing = document.getElementById('wa-typing');
    if (typing) {
        typing.remove();
    }
}

function appendDeepLink(serviceId, buttonText) {
    const chatArea = document.getElementById('wa-chat-area');
    if (!chatArea) return;
    
    const div = document.createElement('div');
    div.className = 'self-start bg-white text-[#111b21] px-3 py-2 rounded-lg max-w-[85%] shadow-sm mt-1 mb-2';
    div.innerHTML = `
        <div class="flex flex-col gap-2">
            <button onclick="window.closeWABot(); window.startBookingWithService('${serviceId}')" class="bg-[#00a884] hover:bg-[#008f6f] text-white font-bold text-xs px-4 py-2 rounded shadow-sm transition-colors text-center">
                ${buttonText}
            </button>
        </div>
    `;
    
    chatArea.appendChild(div);
    chatArea.scrollTop = chatArea.scrollHeight;
}

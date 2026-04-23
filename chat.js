(function () {
  console.log('Chat Widget v5 (Site-Matched Dark/Gold) loaded');

  // --- КОНФИГУРАЦИЯ ---
  const config = {
    apiEndpoint: 'https://crm.asap.repair',
    fontFamily: "'Outfit', 'Inter', sans-serif",
    storageKey: 'repair_asap_thread_id'
  };
  const containerId = 'repair-asap-chatbot';
  // --------------------

  let state = { threadId: null, isOpen: false, isLoading: false };

  function injectStyles() {
    const style = document.createElement('style');
    style.textContent = `

      /* === CHATBOT CONTAINER === */
      #repair-asap-chatbot-container { 
          position: fixed; 
          bottom: 28px; 
          right: 28px; 
          z-index: 999999;
          font-family: ${config.fontFamily};
      }
      
      /* === LAUNCHER BUTTON — matches .floating-cta === */
      #repair-asap-chat-button { 
          display: flex;
          align-items: center;
          gap: 8px;
          background: linear-gradient(135deg, #c9a84c, #b8943f);
          color: #0a0f1c;
          padding: 14px 24px;
          border-radius: 100px;
          font-family: ${config.fontFamily};
          font-weight: 700;
          font-size: 14px;
          letter-spacing: 0.3px;
          cursor: pointer; 
          box-shadow: 0 8px 30px rgba(201, 168, 76, 0.35);
          transition: all 0.4s cubic-bezier(0.22, 0.61, 0.36, 1);
          position: relative;
          border: none;
          text-decoration: none;
          animation: chatLauncherIn 0.5s 0.3s cubic-bezier(0.22, 0.61, 0.36, 1) both;
      }

      @keyframes chatLauncherIn {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
      }
      
      #repair-asap-chat-button:hover { 
          transform: translateY(-3px) scale(1.03);
          box-shadow: 0 12px 40px rgba(201, 168, 76, 0.45);
      }

      #repair-asap-chat-button svg {
          flex-shrink: 0;
          width: 22px;
          height: 22px;
          fill: none;
          stroke: #0a0f1c;
          stroke-width: 2;
      }

      /* Pulse ring */
      #repair-asap-chat-button::before {
          content: '';
          position: absolute;
          inset: -4px;
          border-radius: inherit;
          border: 2px solid #c9a84c;
          opacity: 0;
          animation: chatPulse 2.5s ease-in-out infinite;
          pointer-events: none;
      }

      @keyframes chatPulse {
          0%, 100% { opacity: 0; transform: scale(1); }
          50% { opacity: 0.3; transform: scale(1.08); }
      }
      
      /* === CHAT WINDOW — dark theme === */
      #repair-asap-chat-window { 
          position: absolute; 
          bottom: 72px; 
          right: 0; 
          width: 380px; 
          height: 560px; 
          max-height: 75vh;
          background-color: #0a0f1c;
          border-radius: 20px; 
          box-shadow: 0 16px 56px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(201, 168, 76, 0.12);
          display: flex; 
          flex-direction: column; 
          overflow: hidden; 
          opacity: 0; 
          pointer-events: none; 
          transform: translateY(20px) scale(0.96);
          transform-origin: bottom right;
          transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
      }
      
      #repair-asap-chat-window.open { 
          opacity: 1; 
          transform: translateY(0) scale(1); 
          pointer-events: all; 
      }
      
      /* === HEADER === */
      #repair-asap-chat-header { 
          background: linear-gradient(135deg, #c9a84c, #b8943f);
          color: #0a0f1c; 
          padding: 16px 20px; 
          display: flex; 
          justify-content: space-between; 
          align-items: center; 
          flex-shrink: 0;
      }

      .chat-header-info { display: flex; align-items: center; gap: 10px; }
      .chat-header-title { font-weight: 700; font-size: 15px; letter-spacing: 0.3px; color: #0a0f1c; }
      .chat-header-status { font-size: 12px; color: rgba(10, 15, 28, 0.7); display: flex; align-items: center; gap: 6px; }
      .status-dot { width: 8px; height: 8px; background-color: #166534; border-radius: 50%; display: inline-block; }

      #repair-asap-chat-close { 
          cursor: pointer; 
          background: rgba(10, 15, 28, 0.15); 
          border: none; 
          color: #0a0f1c; 
          width: 30px; 
          height: 30px; 
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s;
      }
      #repair-asap-chat-close:hover { background: rgba(10, 15, 28, 0.25); }
      #repair-asap-chat-close svg { width: 18px; height: 18px; fill: #0a0f1c; }
      
      /* === MESSAGES AREA === */
      #repair-asap-chat-messages { 
          flex: 1; 
          overflow-y: auto; 
          padding: 20px; 
          display: flex; 
          flex-direction: column; 
          gap: 14px; 
          background-color: #0a0f1c;
          scrollbar-width: thin;
          scrollbar-color: rgba(201, 168, 76, 0.2) transparent;
      }
      
      #repair-asap-chat-messages::-webkit-scrollbar { width: 5px; }
      #repair-asap-chat-messages::-webkit-scrollbar-track { background: transparent; }
      #repair-asap-chat-messages::-webkit-scrollbar-thumb { background-color: rgba(201, 168, 76, 0.2); border-radius: 10px; }

      .chat-message { 
          max-width: 82%; 
          padding: 12px 16px; 
          border-radius: 16px; 
          font-size: 14px; 
          line-height: 1.55; 
          position: relative;
          word-wrap: break-word; 
          animation: chatSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      }

      /* Bot messages — dark card */
      .bot-message { 
          background-color: #141b2d;
          border: 1px solid #1e293b;
          color: #e2e8f0; 
          align-self: flex-start; 
          border-bottom-left-radius: 4px; 
      }
      .bot-message a { color: #c9a84c; font-weight: 600; text-decoration: none; }
      .bot-message a:hover { text-decoration: underline; color: #dab95e; }

      /* User messages — gold */
      .user-message { 
          background: linear-gradient(135deg, #c9a84c, #b8943f);
          color: #0a0f1c; 
          font-weight: 500;
          align-self: flex-end; 
          border-bottom-right-radius: 4px; 
      }
      
      /* === PHOTO MESSAGE === */
      .chat-photo-msg { max-width: 70%; align-self: flex-end; animation: chatSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
      .chat-photo-msg img { width: 100%; max-width: 220px; border-radius: 12px; display: block; border: 1px solid #1e293b; }

      /* === INPUT AREA === */
      #repair-asap-chat-input-container { 
          padding: 14px 16px; 
          background: #0f1629; 
          border-top: 1px solid #1e293b; 
          display: flex; 
          gap: 8px; 
          align-items: center;
          flex-shrink: 0;
      }

      #repair-asap-chat-attach {
          background: none;
          border: none;
          cursor: pointer;
          padding: 6px;
          border-radius: 50%;
          transition: background 0.2s;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
      }
      #repair-asap-chat-attach:hover { background: rgba(201, 168, 76, 0.12); }
      #repair-asap-chat-attach svg { width: 22px; height: 22px; fill: none; stroke: #64748b; stroke-width: 2; }
      #repair-asap-chat-attach:hover svg { stroke: #c9a84c; }
      #repair-asap-chat-file { display: none; }
      
      #repair-asap-chat-input { 
          flex: 1; 
          padding: 11px 16px; 
          border: 1px solid #1e293b; 
          border-radius: 24px; 
          outline: none; 
          font-size: 14px; 
          transition: all 0.2s; 
          font-family: ${config.fontFamily};
          background-color: #141b2d;
          color: #e2e8f0;
      }
      
      #repair-asap-chat-input::placeholder { color: #64748b; }
      
      #repair-asap-chat-input:focus { 
          border-color: #c9a84c;
          box-shadow: 0 0 0 2px rgba(201, 168, 76, 0.15);
      }
      
      #repair-asap-chat-send { 
          background: linear-gradient(135deg, #c9a84c, #b8943f);
          color: #0a0f1c; 
          border: none; 
          border-radius: 50%; 
          width: 40px; 
          height: 40px; 
          cursor: pointer; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          transition: all 0.2s;
          flex-shrink: 0;
      }
      #repair-asap-chat-send:hover { transform: scale(1.08); box-shadow: 0 4px 16px rgba(201, 168, 76, 0.3); }
      #repair-asap-chat-send:active { transform: scale(0.95); }
      #repair-asap-chat-send svg { width: 18px; height: 18px; fill: #0a0f1c; margin-left: 2px; }
      #repair-asap-chat-send:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }

      /* === ANIMATIONS === */
      @keyframes chatSlideIn { 
          from { opacity: 0; transform: translateY(8px); } 
          to { opacity: 1; transform: translateY(0); } 
      }
      
      .loading-indicator { 
          padding: 10px 18px; 
          background: #141b2d;
          border: 1px solid #1e293b;
          border-radius: 16px; 
          border-bottom-left-radius: 4px;
          align-self: flex-start;
          display: flex; 
          gap: 5px; 
          width: fit-content;
      }
      .loading-dot { width: 6px; height: 6px; background: #c9a84c; border-radius: 50%; animation: chatBounce 1.4s infinite ease-in-out both; }
      .loading-dot:nth-child(1) { animation-delay: -0.32s; }
      .loading-dot:nth-child(2) { animation-delay: -0.16s; }
      @keyframes chatBounce { 0%, 80%, 100% { transform: scale(0); } 40% { transform: scale(1); } }

      /* === MOBILE (≤ 768px) — icon-only launcher + fullscreen chat === */
      @media (max-width: 768px) {
        #repair-asap-chatbot-container {
            bottom: 20px;
            right: 20px;
        }

        #repair-asap-chat-button {
            padding: 16px;
            border-radius: 50%;
        }

        #repair-asap-chat-button .chat-btn-label {
            display: none;
        }

        #repair-asap-chatbot-container.mobile-active {
            bottom: 0 !important;
            inset: 0 !important;
            width: 100% !important;
            height: 100% !important;
            z-index: 2147483647 !important;
        }

        #repair-asap-chat-window { 
            width: 100% !important;
            height: 100% !important;
            height: 100dvh !important;
            max-height: none !important;
            border-radius: 0 !important;
            position: fixed !important;
            inset: 0 !important;
            transform: none !important;
            margin: 0 !important;
        }

        #repair-asap-chatbot-container.mobile-active #repair-asap-chat-button { display: none !important; }
        
        #repair-asap-chat-header { padding: 15px 20px !important; }
        #repair-asap-chat-messages { font-size: 15px !important; }
        #repair-asap-chat-input { font-size: 16px !important; } /* Fix iOS zoom */
      }
    `;
    document.head.appendChild(style);
  }

  function createChatUI() {
    const container = document.getElementById(containerId);
    if (!container) return;

    const chatContainer = document.createElement('div');
    chatContainer.id = 'repair-asap-chatbot-container';

    // Launcher button — matches .floating-cta design
    const chatButton = document.createElement('div');
    chatButton.id = 'repair-asap-chat-button';
    chatButton.innerHTML = `
      <svg viewBox="0 0 24 24">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
      <span class="chat-btn-label">Get a Quote</span>`;
    chatButton.addEventListener('click', toggleChat);

    // Chat window
    const chatWindow = document.createElement('div');
    chatWindow.id = 'repair-asap-chat-window';

    // Header
    const chatHeader = document.createElement('div');
    chatHeader.id = 'repair-asap-chat-header';
    chatHeader.innerHTML = `
      <div class="chat-header-info">
        <div>
            <div class="chat-header-title">Repair ASAP Support</div>
            <div class="chat-header-status"><span class="status-dot"></span> Online 24/7</div>
        </div>
      </div>
      <button id="repair-asap-chat-close">
        <svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
      </button>`;

    const chatMessages = document.createElement('div');
    chatMessages.id = 'repair-asap-chat-messages';

    const chatInputContainer = document.createElement('div');
    chatInputContainer.id = 'repair-asap-chat-input-container';

    // Photo attach button
    const attachBtn = document.createElement('button');
    attachBtn.id = 'repair-asap-chat-attach';
    attachBtn.title = 'Attach photo';
    attachBtn.innerHTML = `<svg viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`;

    const fileInput = document.createElement('input');
    fileInput.id = 'repair-asap-chat-file';
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.addEventListener('change', () => { if (fileInput.files[0]) sendPhoto(fileInput.files[0]); fileInput.value = ''; });
    attachBtn.addEventListener('click', () => fileInput.click());

    const chatInput = document.createElement('input');
    chatInput.id = 'repair-asap-chat-input';
    chatInput.type = 'text';
    chatInput.placeholder = 'Type your message...';
    chatInput.setAttribute('enterkeyhint', 'send');
    chatInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') sendMessage(); });

    const chatSend = document.createElement('button');
    chatSend.id = 'repair-asap-chat-send';
    chatSend.innerHTML = `<svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>`;
    chatSend.addEventListener('click', sendMessage);

    chatInputContainer.appendChild(fileInput);
    chatInputContainer.appendChild(attachBtn);
    chatInputContainer.appendChild(chatInput);
    chatInputContainer.appendChild(chatSend);
    chatWindow.appendChild(chatHeader);
    chatWindow.appendChild(chatMessages);
    chatWindow.appendChild(chatInputContainer);

    chatContainer.appendChild(chatWindow);
    chatContainer.appendChild(chatButton);
    container.appendChild(chatContainer);

    document.getElementById('repair-asap-chat-close').addEventListener('click', toggleChat);

    initThread();
  }

  function toggleChat() {
    const chatWindow = document.getElementById('repair-asap-chat-window');
    const container = document.getElementById('repair-asap-chatbot-container');
    const isMobile = window.innerWidth <= 768;

    state.isOpen = !state.isOpen;

    if (state.isOpen) {
      chatWindow.classList.add('open');
      if (isMobile) container.classList.add('mobile-active');

      setTimeout(() => {
        const msgs = document.getElementById('repair-asap-chat-messages');
        msgs.scrollTop = msgs.scrollHeight;
      }, 100);
    } else {
      chatWindow.classList.remove('open');
      container.classList.remove('mobile-active');
    }
  }

  async function initThread() {
    const storedThreadId = localStorage.getItem(config.storageKey);
    // Old proxy used OpenAI thread IDs (thread_xxx). New CRM endpoints use
    // their own format. Drop legacy IDs so we mint a fresh thread.
    if (storedThreadId && storedThreadId.startsWith('thread_')) {
      localStorage.removeItem(config.storageKey);
    } else if (storedThreadId) {
      state.threadId = storedThreadId;
      if (document.getElementById('repair-asap-chat-messages').children.length === 0) {
        addMessageToUI('bot', 'Hi! 👋 I\'m here to help with your project. What do you need done?');
      }
      return;
    }
    try {
      const sessionContext = {};
      try { sessionContext.page = window.location.href; } catch (_) {}
      try { sessionContext.referrer = document.referrer || ''; } catch (_) {}
      try { sessionContext.language = navigator.language || ''; } catch (_) {}
      try { sessionContext.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch (_) {}
      const response = await fetch(`${config.apiEndpoint}/api/widget/thread`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sessionContext),
      });
      if (response.ok) {
        const data = await response.json();
        state.threadId = data.threadId;
        localStorage.setItem(config.storageKey, state.threadId);
        addMessageToUI('bot', 'Hi! 👋 I\'m here to help with your project. What do you need done?');
      }
    } catch (e) { console.error('Init failed', e); }
  }

  async function sendMessage() {
    const inputEl = document.getElementById('repair-asap-chat-input');
    const sendBtn = document.getElementById('repair-asap-chat-send');
    const message = inputEl.value.trim();
    if (!message || state.isLoading || !state.threadId) return;

    inputEl.value = '';
    sendBtn.disabled = true;

    addMessageToUI('user', message);
    state.isLoading = true;
    showLoading();

    try {
      const response = await fetch(`${config.apiEndpoint}/api/widget/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ threadId: state.threadId, message: message, pageContext: window.location.pathname })
      });

      removeLoading();

      if (!response.ok) throw new Error('Server error');

      const data = await response.json();

      if (data.message) {
        addMessageToUI('bot', data.message);
        if (data.action && data.action.type === 'FILL_FORM') {
          triggerWebsiteForm(data.action.payload);
        }
      }
    } catch (error) {
      removeLoading();
      addMessageToUI('bot', 'Sorry, connection error. Please try again.');
    } finally {
      state.isLoading = false;
      sendBtn.disabled = false;
      if (window.innerWidth > 768) inputEl.focus();
    }
  }

  // --- Photo compression ---
  function compressChatImage(file, maxW = 1200, quality = 0.7) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let w = img.width, h = img.height;
          if (w > maxW) { h = (h * maxW) / w; w = maxW; }
          canvas.width = w;
          canvas.height = h;
          canvas.getContext('2d').drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  }

  // --- Send photo ---
  async function sendPhoto(file) {
    if (state.isLoading || !state.threadId) return;
    if (!file.type.startsWith('image/') || file.size > 5 * 1024 * 1024) {
      addMessageToUI('bot', 'Please send an image file under 5 MB.');
      return;
    }

    state.isLoading = true;
    const sendBtn = document.getElementById('repair-asap-chat-send');
    sendBtn.disabled = true;

    try {
      const dataUrl = await compressChatImage(file);
      const base64 = dataUrl.split(',')[1];

      // Show photo preview in chat
      const container = document.getElementById('repair-asap-chat-messages');
      const photoDiv = document.createElement('div');
      photoDiv.className = 'chat-photo-msg';
      photoDiv.innerHTML = `<img src="${dataUrl}" alt="Uploaded photo">`;
      container.appendChild(photoDiv);
      container.scrollTop = container.scrollHeight;

      showLoading();

      const response = await fetch(`${config.apiEndpoint}/api/widget/chat-photo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          threadId: state.threadId,
          photo: { data: base64, name: file.name, type: 'image/jpeg' },
          pageContext: window.location.pathname
        })
      });

      removeLoading();

      if (response.ok) {
        const data = await response.json();
        if (data.message) addMessageToUI('bot', data.message);
      } else {
        addMessageToUI('bot', 'Sorry, couldn\'t process the photo. Please try again.');
      }
    } catch (err) {
      removeLoading();
      addMessageToUI('bot', 'Photo upload failed. Please try again.');
      console.error('Photo upload error:', err);
    } finally {
      state.isLoading = false;
      sendBtn.disabled = false;
    }
  }

  function triggerWebsiteForm(payload) {
    const fill = (selector, value) => {
      const el = document.querySelector(selector) || document.querySelector(`input[name="${selector}"]`) || document.querySelector(`input[name="${selector.toLowerCase()}"]`);
      if (el && value) {
        el.value = value;
        el.classList.add('auto-filled-field');
        el.dispatchEvent(new Event('input', { bubbles: true }));
        return el;
      }
      return null;
    };
    fill('Name', payload.name);
    fill('Email', payload.email);
    const phoneEl = fill('Phone', payload.phone) || fill('Tel', payload.phone);
    if (phoneEl && phoneEl.form) {
      phoneEl.form.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  function addMessageToUI(sender, text) {
    const container = document.getElementById('repair-asap-chat-messages');
    const div = document.createElement('div');
    div.className = `chat-message ${sender === 'user' ? 'user-message' : 'bot-message'}`;
    let html = text.replace(/\n/g, '<br>').replace(/\[([^\]]+)]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank">$1</a>');
    div.innerHTML = html;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
  }

  function showLoading() {
    const container = document.getElementById('repair-asap-chat-messages');
    const div = document.createElement('div');
    div.id = 'chat-loading';
    div.className = 'loading-indicator';
    div.innerHTML = `<div class="loading-dot"></div><div class="loading-dot"></div><div class="loading-dot"></div>`;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
  }

  function removeLoading() {
    const el = document.getElementById('chat-loading');
    if (el) el.remove();
  }

  function init() {
    if (!document.getElementById(containerId)) {
      const c = document.createElement('div');
      c.id = containerId;
      document.body.appendChild(c);
    }
    injectStyles();
    createChatUI();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

})();
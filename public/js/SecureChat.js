class SecureChat {
  constructor() {
    this.socket = null;
    this.roomId = null;
    this.encryptionKey = null;
    this.roomCode = null;
    this.messages = [];
    this.isConnected = false;
    this.isInRoom = false;
    this.userId = this.generateUserId();
    this.userColors = new Map();
    this.wasConnectedBefore = false;
    this.rateLimitCooldown = false; // NUOVO: flag rate limiting
    
    this.initializeSocketIO();
    this.initializeEventListeners();
  }

  generateUserId() {
    return 'user_' + Math.random().toString(36).substring(2, 11);
  }

  getUserColor(userId) {
    if (!this.userColors.has(userId)) {
      let hash = 0;
      for (let i = 0; i < userId.length; i++) {
        hash = ((hash << 5) - hash) + userId.charCodeAt(i);
        hash = hash & hash;
      }
      const colorIndex = Math.abs(hash) % CONFIG.USER_COLORS.length;
      this.userColors.set(userId, CONFIG.USER_COLORS[colorIndex]);
    }
    return this.userColors.get(userId);
  }

  getUserIcon(userId) {
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      hash = ((hash << 5) - hash) + userId.charCodeAt(i);
      hash = hash & hash;
    }
    return CONFIG.USER_ICONS[Math.abs(hash) % CONFIG.USER_ICONS.length];
  }

  initializeSocketIO() {
    this.socket = io({
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    this.socket.on('connect', () => {
      console.log('Connesso al server WebSocket');
      this.isConnected = true;
      this.updateConnectionStatus(true);
      
      if (this.wasConnectedBefore) {
        this.showNotification('Riconnesso al server');
      }
      this.wasConnectedBefore = true;
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnesso dal server');
      this.isConnected = false;
      this.updateConnectionStatus(false);
      
      this.showError('Connessione persa...');
    });

    this.socket.on('error', (data) => {
      console.error('Errore dal server:', data.message);
      this.showError(data.message);
    });
    
    // NUOVO: Gestione rate limiting
    this.socket.on('rate_limit_exceeded', (data) => {
      console.warn('Rate limit exceeded:', data);
      this.rateLimitCooldown = true;
      
      const minutes = Math.ceil(data.retryAfter / 60);
      this.showError(`${data.message} Riprova tra ${minutes} minuto${minutes > 1 ? 'i' : ''}.`);
      
      // Disabilita pulsanti invio
      this.disableSendControls(data.retryAfter);
      
      // Reset dopo cooldown
      setTimeout(() => {
        this.rateLimitCooldown = false;
        this.enableSendControls();
      }, data.retryAfter * 1000);
    });

    this.socket.on('room_joined', (data) => {
      console.log('Unito alla stanza:', data.roomId);
      this.isInRoom = true;
      
      this.showNotification('Connesso alla chat cifrata!');
      this.addSystemMessage('Chat cifrata attiva. I messaggi si autodistruggono dopo 1 ora.');
    });

    this.socket.on('message_history', async (data) => {
      console.log('Ricevuti messaggi storici:', data.messages.length);
      for (const msg of data.messages) {
        await this.displayEncryptedMessage(msg);
      }
    });

    this.socket.on('new_message', async (message) => {
      console.log('Nuovo messaggio ricevuto');
      await this.displayEncryptedMessage(message);
    });

    this.socket.on('room_blocked', (data) => {
      this.showError(data.reason);
      this.isInRoom = false;
      setTimeout(() => {
        window.location.reload();
      }, 3000);
    });

    this.socket.on('room_erased', (data) => {
      this.handleRoomErased(data);
    });

    this.socket.on('connect_error', (error) => {
      console.error('Errore di connessione:', error);
      this.showError('Impossibile connettersi al server');
    });
  }

  updateConnectionStatus(connected) {
    const statusElement = document.getElementById('encryption-status');
    if (connected) {
      statusElement.textContent = 'Connesso';
      statusElement.className = 'encryption-status';
    } else {
      statusElement.textContent = 'Offline';
      statusElement.className = 'encryption-status disconnected';
    }
  }
  
  // NUOVO: Disabilita controlli invio durante rate limit
  disableSendControls(seconds) {
    const sendBtn = document.getElementById('send-btn');
    const fileInput = document.getElementById('file-input');
    const messageInput = document.getElementById('message-input');
    
    sendBtn.disabled = true;
    fileInput.disabled = true;
    messageInput.disabled = true;
    
    const originalText = sendBtn.textContent;
    const countdown = setInterval(() => {
      seconds--;
      sendBtn.textContent = `Attendi ${seconds}s`;
      if (seconds <= 0) {
        clearInterval(countdown);
        sendBtn.textContent = originalText;
      }
    }, 1000);
  }
  
  // NUOVO: Riabilita controlli invio
  enableSendControls() {
    const sendBtn = document.getElementById('send-btn');
    const fileInput = document.getElementById('file-input');
    const messageInput = document.getElementById('message-input');
    
    sendBtn.disabled = false;
    fileInput.disabled = false;
    messageInput.disabled = false;
    sendBtn.textContent = 'Invia';
    
    this.showNotification('Puoi inviare di nuovo messaggi');
  }

  initializeEventListeners() {
    document.getElementById('create-room-btn').addEventListener('click', () => this.createRoom());
    document.getElementById('join-room-btn').addEventListener('click', () => this.joinRoom());
    document.getElementById('send-btn').addEventListener('click', () => this.sendMessage());
    document.getElementById('file-input').addEventListener('change', (e) => this.handleFileUpload(e));
    document.getElementById('erase-btn').addEventListener('click', () => this.eraseRoom());
    document.getElementById('copy-room-code-btn').addEventListener('click', () => this.copyRoomCode());
    document.getElementById('modal-copy-btn').addEventListener('click', () => this.copyRoomCodeFromModal());
    document.getElementById('modal-confirm-btn').addEventListener('click', () => this.closeModal());
    
    const messageInput = document.getElementById('message-input');
    messageInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });
  }

  async createRoom() {
    if (!this.isConnected) {
      this.showError('Non connesso al server. Riprova tra poco.');
      return;
    }

    try {
      const btn = document.getElementById('create-room-btn');
      btn.disabled = true;
      btn.innerHTML = '<span class="loading"></span> Creazione...';
      
      this.showNotification('Creazione stanza in corso...');

      const seedArray = crypto.getRandomValues(new Uint8Array(12));
      const seedHex = Array.from(seedArray)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
      
      console.log('Seed generato:', seedHex, '(lunghezza:', seedHex.length, ')');
      
      this.encryptionKey = await CryptoHelper.generateKeyFromSeed(seedHex);
      console.log('Chiave derivata:', this.encryptionKey);

      const response = await fetch('/api/room/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // NUOVO: Gestione rate limiting HTTP
      if (response.status === 429) {
        const data = await response.json();
        const minutes = Math.ceil(data.retryAfter / 60);
        throw new Error(`${data.error} Riprova tra ${minutes} minuto${minutes > 1 ? 'i' : ''}.`);
      }

      if (!response.ok) {
        throw new Error('Errore nella creazione della stanza');
      }

      const data = await response.json();
      this.roomId = data.roomId;
      console.log('Room ID ricevuto:', this.roomId);

      this.roomCode = await CryptoHelper.encodeRoomCode(this.roomId, seedHex);
      const words = this.roomCode.split('-');
      const preview = words.slice(0, 5).join('-') + '...';
      console.log('Codice generato:', words.length, 'parole -', preview);

      try {
        await navigator.clipboard.writeText(this.roomCode);
        this.showNotification(`Codice copiato! (${words.length} parole)`);
        console.log('Codice completo:', this.roomCode);
      } catch (err) {
        const textarea = document.createElement('textarea');
        textarea.value = this.roomCode;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        this.showNotification('Codice copiato negli appunti!');
        console.log('Codice completo:', this.roomCode);
      }

      btn.disabled = false;
      btn.textContent = 'Crea Stanza Sicura';

      this.showRoomCodeModal();

    } catch (error) {
      console.error('Errore nella creazione della stanza:', error);
      this.showError(error.message || 'Errore nella creazione della stanza sicura');
      
      const btn = document.getElementById('create-room-btn');
      btn.disabled = false;
      btn.textContent = 'Crea Stanza Sicura';
    }
  }

  showRoomCodeModal() {
    const modal = document.getElementById('room-code-modal');
    const codeTextarea = document.getElementById('modal-room-code');
    
    codeTextarea.value = this.roomCode;
    modal.style.display = 'flex';
  }

  closeModal() {
    const modal = document.getElementById('room-code-modal');
    modal.style.display = 'none';
    this.joinChat();
  }

  async copyRoomCodeFromModal() {
    const codeTextarea = document.getElementById('modal-room-code');
    const btn = document.getElementById('modal-copy-btn');
    
    try {
      await navigator.clipboard.writeText(this.roomCode);
      const originalText = btn.textContent;
      btn.textContent = 'Copiato!';
      setTimeout(() => {
        btn.textContent = originalText;
      }, 2000);
    } catch (err) {
      codeTextarea.select();
      document.execCommand('copy');
      const originalText = btn.textContent;
      btn.textContent = 'Copiato!';
      setTimeout(() => {
        btn.textContent = originalText;
      }, 2000);
    }
  }

  async copyRoomCode() {
    const btn = document.getElementById('copy-room-code-btn');
    
    try {
      await navigator.clipboard.writeText(this.roomCode);
      const originalText = btn.textContent;
      btn.textContent = 'OK!';
      setTimeout(() => {
        btn.textContent = originalText;
      }, 2000);
      this.showNotification('Codice copiato!');
    } catch (err) {
      const codeInput = document.getElementById('room-code-text');
      codeInput.select();
      document.execCommand('copy');
      const originalText = btn.textContent;
      btn.textContent = 'OK!';
      setTimeout(() => {
        btn.textContent = originalText;
      }, 2000);
      this.showNotification('Codice copiato!');
    }
  }

  async joinRoom() {
    const input = document.getElementById('join-room-input').value.trim();
    if (!input) {
      this.showError('Incolla il codice della stanza');
      return;
    }

    if (!this.isConnected) {
      this.showError('Non connesso al server. Riprova tra poco.');
      return;
    }

    try {
      const btn = document.getElementById('join-room-btn');
      btn.disabled = true;
      btn.innerHTML = '<span class="loading"></span> Accesso...';
      
      this.showNotification('Connessione alla stanza...');

      if (input.includes('://') || input.includes('#room=')) {
        throw new Error('Formato URL non supportato. Usa il codice 20 parole.');
      } else {
        const sanitizedInput = input
          .trim()
          .replace(/\s+/g, '')
          .replace(/[\r\n\t]/g, '')
          .toLowerCase();
        
        console.log('Input sanitizzato:', sanitizedInput);
        
        const decoded = await CryptoHelper.decodeRoomCode(sanitizedInput);
        this.roomId = decoded.roomId;
        this.encryptionKey = decoded.key;
        this.roomCode = sanitizedInput;
        
        console.log('Decoded roomId:', this.roomId);
        console.log('Decoded key:', this.encryptionKey);
      }

      const response = await fetch(`/api/room/${this.roomId}/exists`);
      const roomData = await response.json();

      if (!roomData.exists) {
        if (roomData.blocked) {
          throw new Error('Questa stanza e stata bloccata');
        }
        throw new Error('Stanza non trovata o scaduta');
      }

      btn.disabled = false;
      btn.textContent = 'Accedi';

      this.joinChat();

    } catch (error) {
      console.error('Errore nell\'accesso alla stanza:', error);
      this.showError(error.message || 'Codice della stanza non valido');
      
      const btn = document.getElementById('join-room-btn');
      btn.disabled = false;
      btn.textContent = 'Accedi';
    }
  }

  joinChat() {
    document.getElementById('welcome-screen').classList.add('hidden');
    document.getElementById('sidebar').classList.add('hidden');
    document.getElementById('chat-interface').classList.remove('hidden');

    if (this.roomCode) {
      const codeDisplay = document.getElementById('room-code-display');
      const codeInput = document.getElementById('room-code-text');
      const messagesContainer = document.getElementById('messages-container');
      
      codeInput.value = this.roomCode;
      codeDisplay.style.display = 'flex';
      messagesContainer.classList.remove('no-code-display');
    }

    this.socket.emit('join_room', { roomId: this.roomId });
  }

  async eraseRoom() {
    if (!this.roomId || !this.isInRoom) {
      return;
    }

    try {
      const response = await fetch(`/api/room/${this.roomId}/erase`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        console.log('Stanza eliminata con successo');
        this.closeChat();
      } else {
        throw new Error('Errore nella cancellazione');
      }
    } catch (error) {
      console.error('Errore nella cancellazione stanza:', error);
      this.showError('Errore nella cancellazione della stanza');
    }
  }

  handleRoomErased(data) {
    this.showError(data.reason || 'Stanza cancellata');
    setTimeout(() => {
      this.closeChat();
    }, 3000);
  }

  closeChat() {
    document.getElementById('chat-interface').classList.add('hidden');
    document.getElementById('sidebar').classList.remove('hidden');
    document.getElementById('welcome-screen').classList.remove('hidden');
    
    const codeDisplay = document.getElementById('room-code-display');
    codeDisplay.style.display = 'none';
    
    this.roomId = null;
    this.encryptionKey = null;
    this.roomCode = null;
    this.isInRoom = false;
    this.messages = [];
    this.rateLimitCooldown = false; // NUOVO: reset rate limit
    
    const messagesContainer = document.getElementById('messages-container');
    messagesContainer.innerHTML = '';
    messagesContainer.classList.add('no-code-display');
    
    document.getElementById('message-input').value = '';
    document.getElementById('join-room-input').value = '';
    
    // NUOVO: Riabilita controlli
    this.enableSendControls();
  }

  async sendMessage() {
    const messageInput = document.getElementById('message-input');
    const messageText = messageInput.value.trim();

    if (!messageText) return;
    
    if (!this.isConnected || !this.isInRoom) {
      this.showError('Non connesso alla stanza');
      return;
    }
    
    // NUOVO: Controlla rate limit locale
    if (this.rateLimitCooldown) {
      this.showError('Stai inviando troppi messaggi. Rallenta.');
      return;
    }

    try {
      const sendBtn = document.getElementById('send-btn');
      sendBtn.disabled = true;

      const encryptedContent = await CryptoHelper.encryptMessage(messageText, this.encryptionKey);

      this.socket.emit('send_message', {
        roomId: this.roomId,
        message: {
          content: encryptedContent,
          type: 'text',
          userId: this.userId
        }
      });

      messageInput.value = '';
      sendBtn.disabled = false;
      messageInput.focus();

    } catch (error) {
      console.error('Errore nell\'invio del messaggio:', error);
      this.showError('Errore nell\'invio del messaggio cifrato');
      document.getElementById('send-btn').disabled = false;
    }
  }

  async handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.showError('Solo immagini sono supportate');
      event.target.value = '';
      return;
    }

    if (file.size > CONFIG.MAX_FILE_SIZE) {
      this.showError('Immagine troppo grande. Massimo 2MB');
      event.target.value = '';
      return;
    }

    if (!this.isConnected || !this.isInRoom) {
      this.showError('Non connesso alla stanza');
      event.target.value = '';
      return;
    }
    
    // NUOVO: Controlla rate limit locale
    if (this.rateLimitCooldown) {
      this.showError('Stai inviando troppi file. Rallenta.');
      event.target.value = '';
      return;
    }

    try {
      this.showNotification('Caricamento immagine...');

      const reader = new FileReader();

      reader.onload = async (e) => {
        try {
          const imageData = e.target.result;
          const encryptedImage = await CryptoHelper.encryptMessage(imageData, this.encryptionKey);

          this.socket.emit('send_message', {
            roomId: this.roomId,
            message: {
              content: encryptedImage,
              type: 'image',
              mimeType: file.type,
              userId: this.userId
            }
          });

          this.showNotification('Immagine inviata!');

        } catch (error) {
          console.error('Errore nel caricamento file:', error);
          this.showError('Errore nel caricamento del file cifrato');
        }
      };

      reader.onerror = () => {
        this.showError('Errore nella lettura del file');
      };

      reader.readAsDataURL(file);
      event.target.value = '';

    } catch (error) {
      console.error('Errore nel caricamento file:', error);
      this.showError('Errore nel caricamento del file cifrato');
      event.target.value = '';
    }
  }

  async displayEncryptedMessage(encryptedMessage) {
    try {
      const decryptedContent = await CryptoHelper.decryptMessage(encryptedMessage.content, this.encryptionKey);

      const messagesContainer = document.getElementById('messages-container');
      const messageElement = document.createElement('div');
      
      const isOwnMessage = encryptedMessage.userId === this.userId;
      
      messageElement.className = isOwnMessage ? 'message sent' : 'message received';
      messageElement.dataset.messageId = encryptedMessage.id;

      if (!isOwnMessage && encryptedMessage.userId) {
        const userColor = this.getUserColor(encryptedMessage.userId);
        const userIcon = this.getUserIcon(encryptedMessage.userId);
        messageElement.style.borderLeft = `4px solid ${userColor}`;
        messageElement.style.paddingLeft = '0.5rem';
        
        if (encryptedMessage.type === 'text') {
          messageElement.innerHTML = `
            <div style="display: flex; align-items: center;">
              <span style="margin-right: 0.5rem; font-size: 1.1rem;">${userIcon}</span>
              <span>${this.escapeHtml(decryptedContent)}</span>
            </div>
            <small>${new Date(encryptedMessage.timestamp).toLocaleTimeString('it-IT')}</small>
            <button class="report-btn" onclick="secureChat.reportMessage('${encryptedMessage.id}')">Segnala</button>
          `;
        } else if (encryptedMessage.type === 'image') {
          messageElement.innerHTML = `
            <div style="display: flex; align-items: center; margin-bottom: 0.5rem;">
              <span style="margin-right: 0.5rem; font-size: 1.1rem;">${userIcon}</span>
              <span>Immagine cifrata</span>
            </div>
            <img src="${decryptedContent}" 
                 alt="Immagine cifrata" 
                 class="message-image"
                 style="max-width: 300px;">
            <small>${new Date(encryptedMessage.timestamp).toLocaleTimeString('it-IT')}</small>
            <button class="report-btn" onclick="secureChat.reportMessage('${encryptedMessage.id}')">Segnala</button>
          `;
        }
      } else {
        if (encryptedMessage.type === 'text') {
          messageElement.innerHTML = `
            <div>${this.escapeHtml(decryptedContent)}</div>
            <small>${new Date(encryptedMessage.timestamp).toLocaleTimeString('it-IT')}</small>
          `;
        } else if (encryptedMessage.type === 'image') {
          messageElement.innerHTML = `
            <div>Immagine cifrata</div>
            <img src="${decryptedContent}" 
                 alt="Immagine cifrata" 
                 class="message-image"
                 style="max-width: 300px;">
            <small>${new Date(encryptedMessage.timestamp).toLocaleTimeString('it-IT')}</small>
          `;
        }
      }

      messagesContainer.appendChild(messageElement);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;

    } catch (error) {
      console.error('Errore nella visualizzazione del messaggio:', error);
      this.addSystemMessage('Impossibile decifrare un messaggio (chiave errata?)');
    }
  }

  addSystemMessage(text) {
    const messagesContainer = document.getElementById('messages-container');
    const messageElement = document.createElement('div');
    messageElement.className = 'message';
    messageElement.style.cssText = `
      background-color: rgba(83, 52, 131, 0.3);
      color: var(--text-light);
      text-align: center;
      margin: 0.5rem auto;
      max-width: 90%;
      border: 1px solid var(--accent);
      font-size: 0.85rem;
    `;
    messageElement.innerHTML = `<em>${text}</em>`;
    messagesContainer.appendChild(messageElement);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  async reportMessage(messageId) {
    if (!confirm('Vuoi davvero segnalare questa stanza? Verra bloccata per tutti.')) {
      return;
    }

    try {
      const response = await fetch(`/api/room/${this.roomId}/report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ messageId })
      });

      if (response.ok) {
        this.showError('Stanza segnalata e bloccata');
      }
    } catch (error) {
      console.error('Errore nella segnalazione:', error);
      this.showError('Errore nella segnalazione');
    }
  }

  showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error';
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);
    setTimeout(() => errorDiv.remove(), 3000);
  }

  showNotification(message) {
    const notifDiv = document.createElement('div');
    notifDiv.className = 'notification';
    notifDiv.textContent = message;
    document.body.appendChild(notifDiv);
    setTimeout(() => notifDiv.remove(), 3000);
  }

  escapeHtml(unsafe) {
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
}

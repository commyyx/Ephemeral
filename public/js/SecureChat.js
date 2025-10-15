class SecureChat {
  constructor() {
    this.socket = null;
    this.roomId = null;
    this.encryptionKey = null;
    this.messages = [];
    this.isConnected = false;
    this.isInRoom = false;
    this.userId = this.generateUserId();
    this.userColors = new Map();
    
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
      
      // QW-001: Feedback visivo riconnessione (se era disconnesso)
      if (this.isInRoom) {
        this.showNotification('Riconnesso al server');
      }
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnesso dal server');
      this.isConnected = false;
      this.updateConnectionStatus(false);
      
      // QW-001: Feedback visivo disconnect
      if (this.isInRoom) {
        this.showError('Connessione persa. Tentativo riconnessione...');
      }
    });

    this.socket.on('error', (data) => {
      console.error('Errore dal server:', data.message);
      this.showError(data.message);
    });

    this.socket.on('room_joined', (data) => {
      console.log('Unito alla stanza:', data.roomId);
      this.isInRoom = true;
      
      // QW-001: Feedback visivo successo
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

    // NUOVO: Listener per room_erased
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

  initializeEventListeners() {
    document.getElementById('create-room-btn').addEventListener('click', () => this.createRoom());
    document.getElementById('join-room-btn').addEventListener('click', () => this.joinRoom());
    document.getElementById('send-btn').addEventListener('click', () => this.sendMessage());
    document.getElementById('file-input').addEventListener('change', (e) => this.handleFileUpload(e));
    
    // NUOVO: Event listener per bottone Erase
    document.getElementById('erase-btn').addEventListener('click', () => this.eraseRoom());
    
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
      
      // QW-001: Feedback visivo
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

      if (!response.ok) {
        throw new Error('Errore nella creazione della stanza');
      }

      const data = await response.json();
      this.roomId = data.roomId;
      console.log('Room ID ricevuto:', this.roomId);

      const roomCode = await CryptoHelper.encodeRoomCode(this.roomId, seedHex);
      const words = roomCode.split('-');
      const preview = words.slice(0, 5).join('-') + '...';
      console.log('Codice generato:', words.length, 'parole -', preview);

      try {
        await navigator.clipboard.writeText(roomCode);
        this.showNotification(`Codice copiato! (${words.length} parole)`);
        console.log('Codice completo:', roomCode);
      } catch (err) {
        const textarea = document.createElement('textarea');
        textarea.value = roomCode;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        this.showNotification('Codice copiato negli appunti!');
        console.log('Codice completo:', roomCode);
      }

      btn.disabled = false;
      btn.textContent = 'Crea Stanza Sicura';

      this.joinChat();

    } catch (error) {
      console.error('Errore nella creazione della stanza:', error);
      this.showError('Errore nella creazione della stanza sicura');
      
      const btn = document.getElementById('create-room-btn');
      btn.disabled = false;
      btn.textContent = 'Crea Stanza Sicura';
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
      
      // QW-001: Feedback visivo
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
        
        console.log('Decoded roomId:', this.roomId);
        console.log('Decoded key:', this.encryptionKey);
      }

      const response = await fetch(`/api/room/${this.roomId}/exists`);
      const roomData = await response.json();

      if (!roomData.exists) {
        if (roomData.blocked) {
          throw new Error('Questa stanza è stata bloccata');
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

    this.socket.emit('join_room', { roomId: this.roomId });
  }

  // NUOVO METODO: Erase Room
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

  // NUOVO METODO: Handle room erased event
  handleRoomErased(data) {
    // Mostra notifica rossa
    this.showError(data.reason || 'Stanza cancellata');
    
    // Chiudi chat dopo 3 secondi
    setTimeout(() => {
      this.closeChat();
    }, 3000);
  }

  // NUOVO METODO: Close chat
  closeChat() {
    document.getElementById('chat-interface').classList.add('hidden');
    document.getElementById('sidebar').classList.remove('hidden');
    document.getElementById('welcome-screen').classList.remove('hidden');
    
    // Reset stato
    this.roomId = null;
    this.encryptionKey = null;
    this.isInRoom = false;
    this.messages = [];
    
    // Pulisci container messaggi
    const messagesContainer = document.getElementById('messages-container');
    messagesContainer.innerHTML = '';
    
    // Reset input
    document.getElementById('message-input').value = '';
    document.getElementById('join-room-input').value = '';
  }

  async sendMessage() {
    const messageInput = document.getElementById('message-input');
    const messageText = messageInput.value.trim();

    if (!messageText) return;
    
    if (!this.isConnected || !this.isInRoom) {
      this.showError('Non connesso alla stanza');
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

module.exports = {
  PORT: process.env.PORT || 3000,
  MESSAGE_EXPIRY_MS: 60 * 60 * 1000, // 1 ora
  ROOM_CLEANUP_INTERVAL: 30 * 60 * 1000, // 30 minuti
  ROOM_INACTIVE_HOURS: 24,
  MAX_MESSAGES_HISTORY: 50,
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // RATE LIMITING CONFIG
  RATE_LIMIT: {
    // Creazione stanze: max 5 per ora per IP
    CREATE_ROOM: {
      windowMs: 60 * 60 * 1000, // 1 ora
      max: 5,
      message: 'Troppe stanze create. Riprova tra 1 ora.',
      standardHeaders: true,
      legacyHeaders: false
    },
    
    // API generali: max 100 richieste per 15 minuti per IP
    GENERAL_API: {
      windowMs: 15 * 60 * 1000, // 15 minuti
      max: 100,
      message: 'Troppe richieste. Riprova tra 15 minuti.',
      standardHeaders: true,
      legacyHeaders: false
    },
    
    // Messaggi WebSocket: max 10 al minuto per socket
    MESSAGES: {
      windowMs: 60 * 1000, // 1 minuto
      max: 10,
      message: 'Troppe messaggi inviati. Rallenta.'
    },
    
    // Upload file: max 20 MB per finestra (cumulative per stanza)
    FILE_UPLOAD: {
      windowMs: 24 * 60 * 60 * 1000, // 24 ore
      maxSize: 20 * 1024 * 1024, // 20 MB totali
      message: 'Limite upload giornaliero raggiunto per questa stanza.'
    }
  }
};

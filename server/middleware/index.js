const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const config = require('../config/config');

// Rate limiter per creazione stanze
const createRoomLimiter = rateLimit({
  windowMs: config.RATE_LIMIT.CREATE_ROOM.windowMs,
  max: config.RATE_LIMIT.CREATE_ROOM.max,
  message: { 
    success: false, 
    error: config.RATE_LIMIT.CREATE_ROOM.message,
    retryAfter: config.RATE_LIMIT.CREATE_ROOM.windowMs / 1000
  },
  standardHeaders: config.RATE_LIMIT.CREATE_ROOM.standardHeaders,
  legacyHeaders: config.RATE_LIMIT.CREATE_ROOM.legacyHeaders,
  handler: (req, res) => {
    console.log(`Rate limit exceeded for IP ${req.ip} - Create Room`);
    res.status(429).json({
      success: false,
      error: config.RATE_LIMIT.CREATE_ROOM.message,
      retryAfter: Math.ceil(config.RATE_LIMIT.CREATE_ROOM.windowMs / 1000)
    });
  }
});

// Rate limiter per API generali
const generalApiLimiter = rateLimit({
  windowMs: config.RATE_LIMIT.GENERAL_API.windowMs,
  max: config.RATE_LIMIT.GENERAL_API.max,
  message: { 
    success: false, 
    error: config.RATE_LIMIT.GENERAL_API.message,
    retryAfter: config.RATE_LIMIT.GENERAL_API.windowMs / 1000
  },
  standardHeaders: config.RATE_LIMIT.GENERAL_API.standardHeaders,
  legacyHeaders: config.RATE_LIMIT.GENERAL_API.legacyHeaders,
  handler: (req, res) => {
    console.log(`Rate limit exceeded for IP ${req.ip} - General API`);
    res.status(429).json({
      success: false,
      error: config.RATE_LIMIT.GENERAL_API.message,
      retryAfter: Math.ceil(config.RATE_LIMIT.GENERAL_API.windowMs / 1000)
    });
  }
});

// Storage per tracking messaggi WebSocket (in-memory)
const messageRateLimits = new Map();

// Cleanup periodico dello storage rate limits
setInterval(() => {
  const now = Date.now();
  for (const [socketId, data] of messageRateLimits.entries()) {
    if (now - data.windowStart > config.RATE_LIMIT.MESSAGES.windowMs) {
      messageRateLimits.delete(socketId);
    }
  }
}, 60000); // Cleanup ogni minuto

// Rate limiter per messaggi WebSocket
function checkMessageRateLimit(socketId) {
  const now = Date.now();
  const limit = config.RATE_LIMIT.MESSAGES;
  
  if (!messageRateLimits.has(socketId)) {
    messageRateLimits.set(socketId, {
      count: 1,
      windowStart: now
    });
    return { allowed: true, remaining: limit.max - 1 };
  }
  
  const data = messageRateLimits.get(socketId);
  const timeElapsed = now - data.windowStart;
  
  // Reset finestra se passato il tempo
  if (timeElapsed > limit.windowMs) {
    messageRateLimits.set(socketId, {
      count: 1,
      windowStart: now
    });
    return { allowed: true, remaining: limit.max - 1 };
  }
  
  // Incrementa contatore
  data.count++;
  
  if (data.count > limit.max) {
    const retryAfter = Math.ceil((limit.windowMs - timeElapsed) / 1000);
    return { 
      allowed: false, 
      remaining: 0,
      retryAfter,
      message: limit.message
    };
  }
  
  return { 
    allowed: true, 
    remaining: limit.max - data.count 
  };
}

// Storage per tracking upload file (in-memory, per stanza)
const fileUploadLimits = new Map();

// Cleanup periodico upload limits
setInterval(() => {
  const now = Date.now();
  for (const [roomId, data] of fileUploadLimits.entries()) {
    if (now - data.windowStart > config.RATE_LIMIT.FILE_UPLOAD.windowMs) {
      fileUploadLimits.delete(roomId);
    }
  }
}, 3600000); // Cleanup ogni ora

// Rate limiter per upload file
function checkFileUploadLimit(roomId, fileSize) {
  const now = Date.now();
  const limit = config.RATE_LIMIT.FILE_UPLOAD;
  
  if (!fileUploadLimits.has(roomId)) {
    fileUploadLimits.set(roomId, {
      totalSize: fileSize,
      windowStart: now
    });
    return { 
      allowed: true, 
      remaining: limit.maxSize - fileSize 
    };
  }
  
  const data = fileUploadLimits.get(roomId);
  const timeElapsed = now - data.windowStart;
  
  // Reset finestra se passate 24h
  if (timeElapsed > limit.windowMs) {
    fileUploadLimits.set(roomId, {
      totalSize: fileSize,
      windowStart: now
    });
    return { 
      allowed: true, 
      remaining: limit.maxSize - fileSize 
    };
  }
  
  // Controlla se supera limite
  const newTotal = data.totalSize + fileSize;
  if (newTotal > limit.maxSize) {
    const retryAfter = Math.ceil((limit.windowMs - timeElapsed) / 1000);
    return { 
      allowed: false, 
      remaining: limit.maxSize - data.totalSize,
      retryAfter,
      message: limit.message
    };
  }
  
  // Aggiorna totale
  data.totalSize = newTotal;
  
  return { 
    allowed: true, 
    remaining: limit.maxSize - newTotal 
  };
}

// Middleware setup principale
function setupMiddleware(app) {
  app.use(express.json({ limit: '10mb' }));
  app.use(cors());
  app.use(express.static('public'));
  
  // Applica rate limiting generale a tutte le API
  app.use('/api', generalApiLimiter);
  
  console.log('Rate limiting attivato:');
  console.log(`- API generali: ${config.RATE_LIMIT.GENERAL_API.max} req/${config.RATE_LIMIT.GENERAL_API.windowMs / 60000}min`);
  console.log(`- Creazione stanze: ${config.RATE_LIMIT.CREATE_ROOM.max} req/${config.RATE_LIMIT.CREATE_ROOM.windowMs / 3600000}h`);
  console.log(`- Messaggi: ${config.RATE_LIMIT.MESSAGES.max} msg/${config.RATE_LIMIT.MESSAGES.windowMs / 60000}min`);
  console.log(`- Upload file: ${config.RATE_LIMIT.FILE_UPLOAD.maxSize / 1024 / 1024}MB/${config.RATE_LIMIT.FILE_UPLOAD.windowMs / 3600000 / 24}giorni`);
}

module.exports = { 
  setupMiddleware,
  createRoomLimiter,
  generalApiLimiter,
  checkMessageRateLimit,
  checkFileUploadLimit
};

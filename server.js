const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const crypto = require('crypto');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Configurazione
const PORT = process.env.PORT || 3000;
const MESSAGE_EXPIRY_MS = 60 * 60 * 1000; // 1 ora
const ROOM_CLEANUP_INTERVAL = 30 * 60 * 1000; // 30 minuti

// Memorizzazione in memoria (in produzione usa Redis o DB)
const rooms = new Map();
const messages = new Map();

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Serve il frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API Routes
app.post('/api/room/create', (req, res) => {
  const roomId = generateRoomId();
  const room = {
    id: roomId,
    createdAt: new Date(),
    lastActivity: new Date(),
    users: new Set(),
    isBlocked: false
  };
  
  rooms.set(roomId, room);
  messages.set(roomId, []);
  
  console.log(`Stanza creata: ${roomId}`);
  res.json({ roomId, success: true });
});

app.get('/api/room/:roomId/exists', (req, res) => {
  const roomId = req.params.roomId;
  const room = rooms.get(roomId);
  
  if (!room) {
    return res.json({ exists: false });
  }
  
  if (room.isBlocked) {
    return res.json({ exists: false, blocked: true });
  }
  
  res.json({ exists: true, createdAt: room.createdAt });
});

app.post('/api/room/:roomId/report', (req, res) => {
  const roomId = req.params.roomId;
  const room = rooms.get(roomId);
  
  if (room) {
    room.isBlocked = true;
    console.log(`Stanza ${roomId} bloccata per segnalazione`);
    
    // Notifica tutti gli utenti nella stanza
    io.to(roomId).emit('room_blocked', {
      reason: 'Questa stanza e stata segnalata e bloccata'
    });
  }
  
  res.json({ success: true });
});

// WebSocket per comunicazione in tempo reale
io.on('connection', (socket) => {
  console.log('Nuovo client connesso:', socket.id);

  socket.on('join_room', (data) => {
    const { roomId } = data;
    
    if (!roomId) {
      socket.emit('error', { message: 'Room ID mancante' });
      return;
    }
    
    const room = rooms.get(roomId);
    if (!room || room.isBlocked) {
      socket.emit('error', { message: 'Stanza non trovata o bloccata' });
      return;
    }
    
    // Unisciti alla stanza
    socket.join(roomId);
    room.users.add(socket.id);
    room.lastActivity = new Date();
    
    socket.roomId = roomId;
    
    console.log(`Client ${socket.id} unito alla stanza ${roomId}`);
    socket.emit('room_joined', { roomId });
    
    // Invia ultimi messaggi (se presenti)
    const roomMessages = messages.get(roomId) || [];
    socket.emit('message_history', {
      messages: roomMessages.slice(-50) // Ultimi 50 messaggi
    });
  });

  socket.on('send_message', (data) => {
    const { roomId, message } = data;
    
    if (!roomId || !message) {
      socket.emit('error', { message: 'Dati messaggio incompleti' });
      return;
    }
    
    const room = rooms.get(roomId);
    if (!room || room.isBlocked) {
      socket.emit('error', { message: 'Stanza non trovata o bloccata' });
      return;
    }
    
    // Crea oggetto messaggio - MANTIENI userId dal client
    const messageObj = {
      id: generateMessageId(),
      content: message.content,
      type: message.type,
      userId: message.userId || 'unknown', // Importante: mantieni userId
      timestamp: new Date().toISOString(),
      expiresAt: new Date(Date.now() + MESSAGE_EXPIRY_MS)
    };
    
    // Salva messaggio
    const roomMessages = messages.get(roomId) || [];
    roomMessages.push(messageObj);
    messages.set(roomId, roomMessages);
    
    // Aggiorna ultima attivita
    room.lastActivity = new Date();
    
    // Invia a tutti nella stanza (incluso mittente)
    io.to(roomId).emit('new_message', messageObj);
    
    console.log(`Messaggio inviato in stanza ${roomId} - Tipo: ${message.type} - User: ${messageObj.userId}`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnesso:', socket.id);
    
    if (socket.roomId) {
      const room = rooms.get(socket.roomId);
      if (room) {
        room.users.delete(socket.id);
      }
    }
  });
});

// Pulizia automatica delle stanze e messaggi scaduti
setInterval(() => {
  const now = new Date();
  let cleanedRooms = 0;
  let cleanedMessages = 0;

  // Pulizia messaggi scaduti
  for (const [roomId, roomMessages] of messages) {
    const validMessages = roomMessages.filter(msg => new Date(msg.expiresAt) > now);
    if (validMessages.length !== roomMessages.length) {
      cleanedMessages += roomMessages.length - validMessages.length;
      messages.set(roomId, validMessages);
    }
  }

  // Pulizia stanze inattive (piu di 24 ore)
  for (const [roomId, room] of rooms) {
    const hoursInactive = (now - room.lastActivity) / (1000 * 60 * 60);
    if (hoursInactive > 24 && room.users.size === 0) {
      rooms.delete(roomId);
      messages.delete(roomId);
      cleanedRooms++;
    }
  }

  if (cleanedRooms > 0 || cleanedMessages > 0) {
    console.log(`Pulizia automatica: ${cleanedRooms} stanze e ${cleanedMessages} messaggi rimossi`);
  }
}, ROOM_CLEANUP_INTERVAL);

// Funzioni di utilita
function generateRoomId() {
  return crypto.randomBytes(8).toString('hex');
}

function generateMessageId() {
  return Date.now().toString(36) + crypto.randomBytes(4).toString('hex');
}

// Gestione errori non catturati
process.on('uncaughtException', (error) => {
  console.error('Errore non catturato:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Promise rifiutata non gestita:', reason);
});

server.listen(PORT, () => {
  console.log(`Server SecureChat in esecuzione sulla porta ${PORT}`);
  console.log(`Ambiente: ${process.env.NODE_ENV || 'development'}`);
});

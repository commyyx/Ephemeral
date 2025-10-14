const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const config = require('./config/config');
const { setupMiddleware } = require('./middleware');
const createRoomRoutes = require('./routes/room');
const { setupWebSocketHandlers } = require('./websocket/handlers');
const { startCleanupTask } = require('./utils/cleanup');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Storage in-memory
const rooms = new Map();
const messages = new Map();

// Setup middleware
setupMiddleware(app);

// Serve frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

// API Routes
app.use('/api/room', createRoomRoutes(rooms, messages, io));

// WebSocket handlers
setupWebSocketHandlers(io, rooms, messages);

// Cleanup automatico
startCleanupTask(rooms, messages);

// Error handlers
process.on('uncaughtException', (error) => {
  console.error('Errore non catturato:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Promise rifiutata non gestita:', reason);
});

// Start server
server.listen(config.PORT, () => {
  console.log(`Server SecureChat in esecuzione sulla porta ${config.PORT}`);
  console.log(`Ambiente: ${config.NODE_ENV}`);
});

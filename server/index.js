/**
 * SecureChat - Server Entry Point
 * @version 1.2.0
 * @description Server Node.js per chat cifrata E2E con rate limiting
 */

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
  console.log('='.repeat(60));
  console.log(`  Ephemeral SecureChat v${config.VERSION} - ${config.VERSION_NAME}`);
  console.log('='.repeat(60));
  console.log(`  Server in esecuzione: http://localhost:${config.PORT}`);
  console.log(`  Ambiente: ${config.NODE_ENV}`);
  console.log(`  Build: ${config.BUILD_DATE}`);
  console.log('='.repeat(60));
  console.log('  Features:');
  console.log('    - E2EE (AES-256-GCM)');
  console.log('    - Codice 20 parole');
  console.log('    - Rate Limiting attivo');
  console.log('    - Auto-cleanup messaggi');
  console.log('    - Upload file cifrati');
  console.log('='.repeat(60));
});

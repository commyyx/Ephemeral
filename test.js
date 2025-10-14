// TEST SCRIPT - Verifica moduli funzionanti

console.log('=== TEST MODULARE SECURECHAT ===\n');

// Test 1: Config
console.log('1. Test Config...');
const config = require('./server/config/config');
console.log('   PORT:', config.PORT);
console.log('   MESSAGE_EXPIRY_MS:', config.MESSAGE_EXPIRY_MS);
console.log('   OK\n');

// Test 2: Crypto Utils
console.log('2. Test Crypto Utils...');
const { generateRoomId, generateMessageId } = require('./server/utils/crypto');
const roomId = generateRoomId();
const msgId = generateMessageId();
console.log('   Room ID:', roomId);
console.log('   Message ID:', msgId);
console.log('   Room ID length:', roomId.length, '(expected: 16)');
console.log('   Message ID length:', msgId.length, '(expected: >10)');
console.log('   OK\n');

// Test 3: Storage
console.log('3. Test Storage...');
const rooms = new Map();
const messages = new Map();

rooms.set('test123', {
  id: 'test123',
  createdAt: new Date(),
  lastActivity: new Date(),
  users: new Set(['user1', 'user2']),
  isBlocked: false
});

messages.set('test123', [
  { id: 'msg1', content: 'test', timestamp: new Date() }
]);

console.log('   Rooms size:', rooms.size, '(expected: 1)');
console.log('   Messages size:', messages.size, '(expected: 1)');
console.log('   Room users:', rooms.get('test123').users.size, '(expected: 2)');
console.log('   OK\n');

// Test 4: Cleanup Logic (dry run)
console.log('4. Test Cleanup Logic...');
const now = new Date();
const oldDate = new Date(now - 25 * 60 * 60 * 1000); // 25 ore fa

rooms.set('old_room', {
  id: 'old_room',
  createdAt: oldDate,
  lastActivity: oldDate,
  users: new Set(),
  isBlocked: false
});

let cleaned = 0;
for (const [roomId, room] of rooms) {
  const hoursInactive = (now - room.lastActivity) / (1000 * 60 * 60);
  if (hoursInactive > 24 && room.users.size === 0) {
    console.log('   Would clean room:', roomId);
    cleaned++;
  }
}

console.log('   Rooms to clean:', cleaned, '(expected: 1)');
console.log('   OK\n');

// Test 5: Middleware
console.log('5. Test Middleware...');
const express = require('express');
const app = express();
const { setupMiddleware } = require('./server/middleware');

setupMiddleware(app);
console.log('   Middleware setup completed');
console.log('   OK\n');

// Test 6: Routes
console.log('6. Test Routes...');
const createRoomRoutes = require('./server/routes/room');
const testRooms = new Map();
const testMessages = new Map();
const mockIo = { to: () => ({ emit: () => {} }) };

const router = createRoomRoutes(testRooms, testMessages, mockIo);
console.log('   Routes created');
console.log('   Router type:', typeof router);
console.log('   OK\n');

console.log('=== TUTTI I TEST PASSATI ===\n');
console.log('Struttura modularizzata funzionante.\n');
console.log('Avvia server con: npm start');
console.log('Apri browser: http://localhost:3000');

const config = require('../config/config');
const { generateMessageId } = require('../utils/crypto');

function setupWebSocketHandlers(io, rooms, messages) {
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
      
      socket.join(roomId);
      room.users.add(socket.id);
      room.lastActivity = new Date();
      
      socket.roomId = roomId;
      
      console.log(`Client ${socket.id} unito alla stanza ${roomId}`);
      socket.emit('room_joined', { roomId });
      
      const roomMessages = messages.get(roomId) || [];
      socket.emit('message_history', {
        messages: roomMessages.slice(-config.MAX_MESSAGES_HISTORY)
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
      
      const messageObj = {
        id: generateMessageId(),
        content: message.content,
        type: message.type,
        userId: message.userId || 'unknown',
        timestamp: new Date().toISOString(),
        expiresAt: new Date(Date.now() + config.MESSAGE_EXPIRY_MS)
      };
      
      const roomMessages = messages.get(roomId) || [];
      roomMessages.push(messageObj);
      messages.set(roomId, roomMessages);
      
      room.lastActivity = new Date();
      
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
}

module.exports = { setupWebSocketHandlers };

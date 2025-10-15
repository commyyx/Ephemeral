const express = require('express');
const router = express.Router();
const { generateRoomId } = require('../utils/crypto');

function createRoomRoutes(rooms, messages, io) {
  router.post('/create', (req, res) => {
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

  router.get('/:roomId/exists', (req, res) => {
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

  router.post('/:roomId/report', (req, res) => {
    const roomId = req.params.roomId;
    const room = rooms.get(roomId);
    
    if (room) {
      room.isBlocked = true;
      console.log(`Stanza ${roomId} bloccata per segnalazione`);
      
      io.to(roomId).emit('room_blocked', {
        reason: 'Questa stanza e stata segnalata e bloccata'
      });
    }
    
    res.json({ success: true });
  });

  // FEAT-ERASE: DELETE /api/room/:roomId/erase
  router.delete('/:roomId/erase', (req, res) => {
    const roomId = req.params.roomId;
    const room = rooms.get(roomId);
    
    if (room) {
      // Notifica tutti gli utenti connessi PRIMA di eliminare
      io.to(roomId).emit('room_erased', {
        reason: 'Stanza cancellata'
      });
      
      // Elimina stanza e messaggi
      rooms.delete(roomId);
      messages.delete(roomId);
      
      console.log(`Stanza ${roomId} eliminata (erase)`);
    }
    
    res.json({ success: true, erased: true });
  });

  return router;
}

module.exports = createRoomRoutes;

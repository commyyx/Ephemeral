const config = require('../config/config');

function startCleanupTask(rooms, messages) {
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

    // Pulizia stanze inattive
    for (const [roomId, room] of rooms) {
      const hoursInactive = (now - room.lastActivity) / (1000 * 60 * 60);
      if (hoursInactive > config.ROOM_INACTIVE_HOURS && room.users.size === 0) {
        rooms.delete(roomId);
        messages.delete(roomId);
        cleanedRooms++;
      }
    }

    if (cleanedRooms > 0 || cleanedMessages > 0) {
      console.log(`Pulizia automatica: ${cleanedRooms} stanze e ${cleanedMessages} messaggi rimossi`);
    }
  }, config.ROOM_CLEANUP_INTERVAL);
}

module.exports = { startCleanupTask };

module.exports = {
  PORT: process.env.PORT || 3000,
  MESSAGE_EXPIRY_MS: 60 * 60 * 1000, // 1 ora
  ROOM_CLEANUP_INTERVAL: 30 * 60 * 1000, // 30 minuti
  ROOM_INACTIVE_HOURS: 24,
  MAX_MESSAGES_HISTORY: 50,
  NODE_ENV: process.env.NODE_ENV || 'development'
};

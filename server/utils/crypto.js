const crypto = require('crypto');

function generateRoomId() {
  return crypto.randomBytes(8).toString('hex');
}

function generateMessageId() {
  return Date.now().toString(36) + crypto.randomBytes(4).toString('hex');
}

module.exports = {
  generateRoomId,
  generateMessageId
};

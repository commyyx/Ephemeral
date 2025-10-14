const express = require('express');
const cors = require('cors');

function setupMiddleware(app) {
  app.use(express.json({ limit: '10mb' }));
  app.use(cors());
  app.use(express.static('public'));
}

module.exports = { setupMiddleware };

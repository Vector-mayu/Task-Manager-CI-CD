'use strict';

const express = require('express');

const router = express.Router();

router.get('/hello', (req, res) => {
  res.send('Hello from Mayuresh Dandekar!');
});

router.get('/bye', (req, res) => {
  res.send('Bye Bye!');
});

router.get('/hi', (req, res) => {
  res.send('I am saying Hi!');
});

router.get('/health', (req, res) => {
  res.json({
    status: 'UP',
    uptimeSeconds: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;

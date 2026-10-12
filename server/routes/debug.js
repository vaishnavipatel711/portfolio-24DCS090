const express = require('express');
const auth = require('../middleware/auth');
const cache = require('../utils/cache');

const router = express.Router();

// Debug tools for Practical 9. Login is required (same JWT as the task routes).
// server.js only mounts this router when NODE_ENV is not "production".
router.use(auth);

// GET /debug/cache -> hit/miss counters and settings
router.get('/cache', (req, res) => {
  res.status(200).json(cache.stats());
});

// DELETE /debug/cache -> clear YOUR cached entries, so the next read is a guaranteed MISS.
// Used by the benchmark script to measure "uncached" response times.
router.delete('/cache', (req, res) => {
  res.status(200).json({ cleared: cache.flushUser(req.user.id) });
});

module.exports = router;
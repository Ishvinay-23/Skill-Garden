// routes/debugRoutes.js — development-only endpoints
const express = require('express');
const router = express.Router();
const { seed } = require('../controllers/debugController');

// POST /api/debug/seed?force=1
router.post('/seed', seed);

module.exports = router;
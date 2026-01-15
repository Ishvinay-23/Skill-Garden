// routes/leaderboardRoutes.js
const express = require('express');
const router = express.Router();
const { weeklyLeaderboard } = require('../controllers/leaderboardController');

router.get('/weekly', weeklyLeaderboard);

module.exports = router;
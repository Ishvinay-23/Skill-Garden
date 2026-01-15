// routes/challengeRoutes.js
const express = require('express');
const { param, body } = require('express-validator');
const router = express.Router();
const { listChallenges, getDailyChallenge, submitSolution } = require('../controllers/challengeController');
const { requireAuth } = require('../middleware/authMiddleware');

// List challenges (optional type)
router.get('/', listChallenges);

// Daily challenge
router.get('/daily', getDailyChallenge);

// Submit solution (protected)
router.post('/:id/submit', [ requireAuth, param('id').isMongoId().withMessage('Invalid challenge id'), body('solution').exists().withMessage('Solution is required') ], submitSolution);

module.exports = router;
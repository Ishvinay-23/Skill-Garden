// routes/teamRoutes.js
const express = require('express');
const { body, param } = require('express-validator');
const router = express.Router();
const { createTeam, listTeams, getTeam, joinTeam } = require('../controllers/teamController');
const { requireAuth } = require('../middleware/authMiddleware');

// Create team (protected)
router.post('/', [
  requireAuth,
  body('name').isLength({ min: 2 }).withMessage('Name required'),
  body('needs').optional().isInt({ min: 0 }).withMessage('Needs must be a non-negative integer')
], createTeam);

// List teams (public) — supports ?status=Need Members
router.get('/', listTeams);

// Get team details
router.get('/:id', [ param('id').isMongoId().withMessage('Invalid team id') ], getTeam);

// Join team (protected)
router.post('/:id/join', [ requireAuth, param('id').isMongoId().withMessage('Invalid team id') ], joinTeam);

module.exports = router;
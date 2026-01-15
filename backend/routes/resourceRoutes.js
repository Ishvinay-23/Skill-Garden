// routes/resourceRoutes.js
const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const { createResource, listResources } = require('../controllers/resourceController');
const { requireAuth } = require('../middleware/authMiddleware');

// Create resource (protected)
router.post('/', [
  requireAuth,
  body('title').isLength({ min: 2 }).withMessage('Title required'),
  body('category').isIn(['notes','books','equipment']).withMessage('Category required')
], createResource);

// List resources (public)
router.get('/', listResources);

module.exports = router;
// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { register, login } = require('../controllers/authController');

// Register route
router.post('/register', [
  body('name').isLength({ min: 2 }).withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], register);

// Login route
router.post('/login', [
  body('email').isEmail().withMessage('Valid email required'),
  body('password').exists().withMessage('Password required')
], login);

module.exports = router;

// controllers/authController.js
// Handles register and login logic. Uses async/await and returns JSON responses for the frontend.

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET;
if(!JWT_SECRET) console.warn('Warning: JWT_SECRET is not set in .env');

// Utility: generate token (keeps payload small)
function generateToken(user){
  return jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });
}

// POST /api/auth/registers
// Body: { name, email, password }
// Returns: { success, token, user }
async function register(req, res, next){
  try{
    const errors = validationResult(req);
    if(!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    const { name, email, password } = req.body;
    // Check for existing user
    const existing = await User.findOne({ email });
    if(existing) return res.status(409).json({ success: false, message: 'Email already in use' });

    // Hash the password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const user = new User({ name, email, passwordHash });
    await user.save();

    const token = generateToken(user);

    // TODO: frontend will call POST /api/auth/register and receive this payload
    return res.status(201).json({ success: true, token, user: user.toPublicJSON() });
  }catch(err){
    next(err);
  }
}

// POST /api/auth/login
// Body: { email, password }
// Returns: { success, token, user }
async function login(req, res, next){
  try{
    const errors = validationResult(req);
    if(!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if(!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.passwordHash);
    if(!match) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const token = generateToken(user);
    return res.json({ success: true, token, user: user.toPublicJSON() });
  }catch(err){
    next(err);
  }
}

module.exports = { register, login };

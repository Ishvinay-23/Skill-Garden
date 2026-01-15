// middleware/authMiddleware.js
// Protect routes using JWT; attaches `req.user` (public fields) on success.

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const JWT_SECRET = process.env.JWT_SECRET;
if(!JWT_SECRET) console.warn('Warning: JWT_SECRET is not set in .env');

async function requireAuth(req, res, next){
  const auth = req.header('authorization') || req.header('Authorization');
  if(!auth) return res.status(401).json({ success: false, message: 'Authorization required' });

  const parts = auth.split(' ');
  if(parts.length !== 2 || parts[0] !== 'Bearer') return res.status(401).json({ success: false, message: 'Invalid authorization format' });
  const token = parts[1];

  try{
    const payload = jwt.verify(token, JWT_SECRET);
    // Attach user info (public) to request; fetch user from DB
    const user = await User.findById(payload.userId).select('-passwordHash');
    if(!user) return res.status(401).json({ success: false, message: 'User not found for token' });
    req.user = user; // controllers can use req.user
    next();
  }catch(err){
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
}

module.exports = { requireAuth };

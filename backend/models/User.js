// models/User.js — Mongoose schema for application users
// Schema intentionally keeps persistence concerns only (no heavy business logic).

const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  // passwordHash will be set by controller using bcrypt before saving
  passwordHash: { type: String, required: true },

  // Gamification fields
  xp: { type: Number, default: 0, index: true },
  level: { type: Number, default: 1 },
  badges: [{ type: String }],

  // Profile
  skills: [{ type: String }],
  interests: [{ type: String }],

  // Teams the user is a member of
  teams: [{ type: Schema.Types.ObjectId, ref: 'Team' }],

  // Streaks: number of consecutive days active and last active date
  streak: { type: Number, default: 0 },
  lastActiveAt: { type: Date },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update timestamps on save
userSchema.pre('save', function(next){
  this.updatedAt = Date.now();
  next();
});

// Instance method to return a safe JSON payload for frontend (no passwordHash)
userSchema.methods.toPublicJSON = function(){
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    xp: this.xp,
    level: this.level,
    badges: this.badges,
    skills: this.skills,
    interests: this.interests,
    streak: this.streak
  };
};

module.exports = mongoose.model('User', userSchema);

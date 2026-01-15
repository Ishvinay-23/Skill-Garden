// models/Challenge.js — schema for coding challenges (arena)
// Stores challenge metadata and simple status fields; submission validation lives in controllers

const mongoose = require('mongoose');
const { Schema } = mongoose;

const challengeSchema = new Schema({
  title: { type: String, required: true, trim: true },
  type: { type: String, enum: ['Speed Run','Bug Hunt','Other'], default: 'Other' },
  description: { type: String, default: '' },
  difficulty: { type: String, enum: ['Easy','Medium','Hard'], default: 'Medium' },
  rewardXP: { type: Number, default: 100 },
  // If a challenge is scheduled for a given date (daily challenge)
  scheduledFor: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Challenge', challengeSchema);

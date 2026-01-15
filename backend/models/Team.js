// models/Team.js — Mongoose schema for teams
// Team stores basic metadata; member management and business rules live in controllers/services

const mongoose = require('mongoose');
const { Schema } = mongoose;

const teamSchema = new Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, default: '', trim: true },
  tags: [{ type: String }],

  // Members references
  members: [{ type: Schema.Types.ObjectId, ref: 'User' }],

  // How many members the team still needs
  needs: { type: Number, default: 0 },

  // Status: 'Need Members' or 'Open' etc. Kept as string for flexibility
  status: { type: String, default: 'Need Members' },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

teamSchema.pre('save', function(next){
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Team', teamSchema);

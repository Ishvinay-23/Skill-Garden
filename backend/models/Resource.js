// models/Resource.js — metadata for notes, books, equipment

const mongoose = require('mongoose');
const { Schema } = mongoose;

const resourceSchema = new Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  // type: notes/books/equipment
  category: { type: String, enum: ['notes','books','equipment'], required: true },
  author: { type: String },
  tags: [{ type: String }],
  // link to the resource location (could be a URL or internal id for future uploads)
  link: { type: String, default: '#' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Resource', resourceSchema);

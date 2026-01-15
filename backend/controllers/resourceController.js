// controllers/resourceController.js
// CRUD for resource board metadata (notes, books, equipment)

const { validationResult } = require('express-validator');
const Resource = require('../models/Resource');

// POST /api/resources — create resource metadata (protected)
async function createResource(req, res, next){
  try{
    const errors = validationResult(req);
    if(!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    const { title, description, category, author, tags, link } = req.body;
    const r = new Resource({ title, description, category, author, tags: tags || [], link });
    await r.save();
    return res.status(201).json({ success: true, resource: r });
  }catch(err){ next(err); }
}

// GET /api/resources?category=notes
async function listResources(req, res, next){
  try{
    const filter = {};
    if(req.query.category) filter.category = req.query.category;
    const resources = await Resource.find(filter).lean();
    return res.json({ success: true, resources });
  }catch(err){ next(err); }
}

module.exports = { createResource, listResources };

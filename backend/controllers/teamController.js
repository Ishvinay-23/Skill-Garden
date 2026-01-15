// controllers/teamController.js
// Business logic for teams (create, list, get, join)

const { validationResult } = require('express-validator');
const Team = require('../models/Team');
const User = require('../models/User');

// POST /api/teams
// Body: { name, description, tags, needs }
// Protected: requireAuth
async function createTeam(req, res, next){
  try{
    const errors = validationResult(req);
    if(!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    const { name, description, tags, needs } = req.body;

    const team = new Team({ name, description, tags: tags || [], needs: needs || 0, status: needs > 0 ? 'Need Members' : 'Open' });
    // Add creator as first member
    team.members = [req.user._id];
    await team.save();

    // Add team to user's teams
    const user = await User.findById(req.user._id);
    user.teams = user.teams || [];
    if(!user.teams.includes(team._id)) user.teams.push(team._id);
    await user.save();

    return res.status(201).json({ success: true, team });
  }catch(err){
    next(err);
  }
}

// GET /api/teams
// Query: ?status=Need Members
// Public
async function listTeams(req, res, next){
  try{
    const filter = {};
    if(req.query.status) filter.status = req.query.status;

    const teams = await Team.find(filter).select('-__v').lean();
    return res.json({ success: true, teams });
  }catch(err){
    next(err);
  }
}

// GET /api/teams/:id
// Public — includes populated member info
async function getTeam(req, res, next){
  try{
    const team = await Team.findById(req.params.id).populate('members', 'name xp level skills');
    if(!team) return res.status(404).json({ success: false, message: 'Team not found' });
    return res.json({ success: true, team });
  }catch(err){
    next(err);
  }
}

// POST /api/teams/:id/join
// Protected — user requests to join; for now it's immediate join
async function joinTeam(req, res, next){
  try{
    const team = await Team.findById(req.params.id);
    if(!team) return res.status(404).json({ success: false, message: 'Team not found' });

    const userId = req.user._id;

    // Prevent duplicate membership
    if(team.members.includes(userId)) return res.status(400).json({ success: false, message: 'Already a member' });

    team.members.push(userId);
    // decrement needs if > 0
    if(team.needs && team.needs > 0) team.needs -= 1;
    // update status
    if(team.needs <= 0) team.status = 'Open';
    await team.save();

    // update user teams
    const user = await User.findById(userId);
    user.teams = user.teams || [];
    if(!user.teams.includes(team._id)) user.teams.push(team._id);
    await user.save();

    return res.json({ success: true, message: `Joined ${team.name}`, team });
  }catch(err){
    next(err);
  }
}

module.exports = { createTeam, listTeams, getTeam, joinTeam };

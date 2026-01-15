// controllers/challengeController.js
// Handles challenge listing, daily challenge, and submission (mock validation)

const { validationResult } = require('express-validator');
const Challenge = require('../models/Challenge');
const User = require('../models/User');
const { awardXPToUser } = require('../utils/xpEngine');

// GET /api/challenges
// optional query: ?type=Speed Run
async function listChallenges(req, res, next){
  try{
    const filter = {};
    if(req.query.type) filter.type = req.query.type;
    const challenges = await Challenge.find(filter).lean();
    return res.json({ success: true, challenges });
  }catch(err){ next(err); }
}

// GET /api/challenges/daily
// Returns the challenge scheduled for today, falling back to a random challenge if none scheduled
async function getDailyChallenge(req, res, next){
  try{
    const todayStart = new Date();
    todayStart.setHours(0,0,0,0);
    const todayEnd = new Date();
    todayEnd.setHours(23,59,59,999);

    let challenge = await Challenge.findOne({ scheduledFor: { $gte: todayStart, $lte: todayEnd } }).lean();
    if(!challenge){
      // fallback: pick a random challenge
      const count = await Challenge.countDocuments();
      if(count === 0) return res.status(404).json({ success: false, message: 'No challenges available' });
      const rand = Math.floor(Math.random() * count);
      challenge = await Challenge.findOne().skip(rand).lean();
    }
    return res.json({ success: true, challenge });
  }catch(err){ next(err); }
}

// POST /api/challenges/:id/submit
// Protected route — user submits solution (mock validation). Body: { solution }
async function submitSolution(req, res, next){
  try{
    const errors = validationResult(req);
    if(!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    const challenge = await Challenge.findById(req.params.id);
    if(!challenge) return res.status(404).json({ success: false, message: 'Challenge not found' });

    const { solution } = req.body;
    // Mock validation: accept if solution string contains the word 'solve' or random pass
    const accepted = (typeof solution === 'string' && /solve/i.test(solution)) || (Math.random() > 0.4);

    if(!accepted) return res.json({ success: false, message: 'Solution rejected', accepted: false });

    // Award XP and update user progress (using xpEngine)
    const user = await User.findById(req.user._id);
    const award = await awardXPToUser(user, challenge.rewardXP);

    // Update lastActiveAt and streak (simple logic)
    const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
    const lastActive = user.lastActiveAt ? new Date(user.lastActiveAt) : null;
    if(lastActive && lastActive.toDateString() === yesterday.toDateString()){
      user.streak = (user.streak || 0) + 1;
    }else if(!lastActive || lastActive.toDateString() !== new Date().toDateString()){
      user.streak = 1; // reset to 1 for today
    }
    user.lastActiveAt = new Date();
    await user.save();

    return res.json({ success: true, accepted: true, award });
  }catch(err){ next(err); }
}

module.exports = { listChallenges, getDailyChallenge, submitSolution };

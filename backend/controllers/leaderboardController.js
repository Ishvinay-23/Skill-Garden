// controllers/leaderboardController.js
// Provides leaderboard endpoints. Currently implements weekly/top leaderboard by XP.

const User = require('../models/User');

// GET /api/leaderboard/weekly
// For now we sort users by total XP (could be adapted to weekly XP when tracking history)
async function weeklyLeaderboard(req, res, next){
  try{
    const users = await User.find({}).select('name xp level').sort({ xp: -1 }).limit(50).lean();
    return res.json({ success: true, leaderboard: users });
  }catch(err){ next(err); }
}

module.exports = { weeklyLeaderboard };

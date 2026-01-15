// utils/xpEngine.js
// Simple XP & Level engine used by controllers to calculate XP gains and level progression.

// Rules (simple and replaceable):
// - Level increases every 1000 XP (so level = Math.floor(xp / 1000) + 1)
// - awardXPToUser will increment user's xp and update level accordingly

function getLevelFromXP(xp){
  return Math.floor(xp / 1000) + 1;
}

async function awardXPToUser(user, xpAmount){
  // `user` is a Mongoose document; this function updates it and saves.
  if(!user) throw new Error('User required');
  if(typeof xpAmount !== 'number' || xpAmount <= 0) return { xp: user.xp, level: user.level };

  user.xp = (user.xp || 0) + xpAmount;
  const newLevel = getLevelFromXP(user.xp);
  const levelUp = newLevel > (user.level || 1);
  if(levelUp) user.level = newLevel;

  // Simple badge logic: award 'Speedster' for large single rewards
  let awardedBadge = null;
  if(xpAmount >= 200 && !(user.badges || []).includes('Big Win')){
    user.badges = user.badges || [];
    user.badges.push('Big Win');
    awardedBadge = 'Big Win';
  }

  // Update streak is handled elsewhere (e.g., challenge submission logic)
  await user.save();
  return { xp: user.xp, level: user.level, awardedBadge, levelUp };
}

module.exports = { getLevelFromXP, awardXPToUser };

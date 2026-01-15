// controllers/debugController.js
// Development-only seeding endpoint. NOT enabled in production.

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Team = require('../models/Team');
const Challenge = require('../models/Challenge');
const Resource = require('../models/Resource');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

async function seed(req, res, next){
  try{
    if(process.env.NODE_ENV === 'production') return res.status(403).json({ success: false, message: 'Seeding disabled in production' });

    const force = req.query.force === '1' || req.query.force === 'true';
    const existingUsers = await User.countDocuments();
    if(existingUsers > 0 && !force) return res.status(400).json({ success: false, message: 'Database already contains users. Use ?force=1 to reseed.' });

    // Clear collections
    await Promise.all([
      User.deleteMany({}),
      Team.deleteMany({}),
      Challenge.deleteMany({}),
      Resource.deleteMany({})
    ]);

    // Create users
    const usersData = [
      { name: 'Ava Green', email: 'ava@example.com', password: 'password1', skills: ['HTML','CSS','JS'], interests: ['Frontend'] },
      { name: 'Diego Park', email: 'diego@example.com', password: 'secret123', skills: ['Debugging','Node'], interests: ['Backend'] },
      { name: 'Lina Shen', email: 'lina@example.com', password: 'hunter2', skills: ['Algorithms','DSA'], interests: ['DSA'] }
    ];

    const savedUsers = [];
    for(const u of usersData){
      const passwordHash = await bcrypt.hash(u.password, 10);
      const user = new User({ name: u.name, email: u.email, passwordHash, skills: u.skills, interests: u.interests });
      await user.save();
      const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });
      savedUsers.push({ id: user._id, email: user.email, password: u.password, token });
    }

    // Create teams
    const team1 = new Team({ name: 'Frontend Sprouts', description: 'A small frontend team', tags: ['HTML','CSS'], members: [savedUsers[0].id], needs: 2, status: 'Need Members' });
    const team2 = new Team({ name: 'Bug Busters', description: 'Focused on finding and fixing bugs', tags: ['Debugging','JS'], members: [savedUsers[1].id], needs: 1, status: 'Need Members' });
    await team1.save(); await team2.save();

    // Link teams to users
    await User.findByIdAndUpdate(savedUsers[0].id, { $push: { teams: team1._id } });
    await User.findByIdAndUpdate(savedUsers[1].id, { $push: { teams: team2._id } });

    // Challenges
    const today = new Date();
    const c1 = new Challenge({ title: 'Optimize Sorting Routine', type: 'Speed Run', description: 'Optimize a slow sorting routine for large inputs.', difficulty: 'Hard', rewardXP: 200, scheduledFor: today });
    const c2 = new Challenge({ title: 'Fix Unit Tests', type: 'Bug Hunt', description: 'Identify failing tests and fix them.', difficulty: 'Medium', rewardXP: 120 });
    const c3 = new Challenge({ title: 'Tiny Algorithms', type: 'Speed Run', description: 'Solve small algorithmic tasks.', difficulty: 'Medium', rewardXP: 100 });
    await c1.save(); await c2.save(); await c3.save();

    // Resources
    const r1 = new Resource({ title: 'JS Event Loop Cheat Sheet', description: 'Concise notes on the event loop.', category: 'notes', tags: ['JS'] });
    const r2 = new Resource({ title: 'Clean Code', description: 'A handbook of agile software craftsmanship', category: 'books', author: 'Robert C. Martin', tags: ['Best Practices'] });
    const r3 = new Resource({ title: 'Mechanical Keyboard Guide', description: 'Choosing switches for comfort', category: 'equipment', tags: ['Hardware'] });
    await r1.save(); await r2.save(); await r3.save();

    return res.json({ success: true, message: 'Seed complete', users: savedUsers });
  }catch(err){
    next(err);
  }
}

module.exports = { seed };

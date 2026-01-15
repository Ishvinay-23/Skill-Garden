// seeds/seed.js — populate development database with sample data
// Usage: NODE_ENV=development node seeds/seed.js

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { connectDB } = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Team = require('../models/Team');
const Challenge = require('../models/Challenge');
const Resource = require('../models/Resource');

async function run(){
  if(!process.env.MONGO_URI) throw new Error('MONGO_URI must be set in .env');
  console.log('Connecting to DB...');
  await connectDB(process.env.MONGO_URI);

  console.log('Clearing collections...');
  await Promise.all([
    User.deleteMany({}),
    Team.deleteMany({}),
    Challenge.deleteMany({}),
    Resource.deleteMany({})
  ]);

  console.log('Creating users...');
  const usersData = [
    { name: 'Ava Green', email: 'ava@example.com', password: 'password1', skills: ['HTML','CSS','JS'], interests: ['Frontend'] },
    { name: 'Diego Park', email: 'diego@example.com', password: 'secret123', skills: ['Debugging','Node'], interests: ['Backend'] },
    { name: 'Lina Shen', email: 'lina@example.com', password: 'hunter2', skills: ['Algorithms','DSA'], interests: ['DSA'] }
  ];

  const users = [];
  for(const u of usersData){
    const passwordHash = await bcrypt.hash(u.password, 10);
    const user = new User({ name: u.name, email: u.email, passwordHash, skills: u.skills, interests: u.interests });
    await user.save();
    users.push({ model: user, plainPassword: u.password });
  }

  console.log('Creating teams...');
  const team1 = new Team({ name: 'Frontend Sprouts', description: 'A small frontend team', tags: ['HTML','CSS'], members: [users[0].model._id], needs: 2, status: 'Need Members' });
  const team2 = new Team({ name: 'Bug Busters', description: 'Focused on finding and fixing bugs', tags: ['Debugging','JS'], members: [users[1].model._id], needs: 1, status: 'Need Members' });
  await team1.save(); await team2.save();

  // Link teams to users
  users[0].model.teams = [team1._id]; await users[0].model.save();
  users[1].model.teams = [team2._id]; await users[1].model.save();

  console.log('Creating challenges...');
  const today = new Date();
  const c1 = new Challenge({ title: 'Optimize Sorting Routine', type: 'Speed Run', description: 'Optimize a slow sorting routine for large inputs.', difficulty: 'Hard', rewardXP: 200, scheduledFor: today });
  const c2 = new Challenge({ title: 'Fix Unit Tests', type: 'Bug Hunt', description: 'Identify failing tests and fix them.', difficulty: 'Medium', rewardXP: 120 });
  const c3 = new Challenge({ title: 'Tiny Algorithms', type: 'Speed Run', description: 'Solve small algorithmic tasks.', difficulty: 'Medium', rewardXP: 100 });
  await c1.save(); await c2.save(); await c3.save();

  console.log('Creating resources...');
  const r1 = new Resource({ title: 'JS Event Loop Cheat Sheet', description: 'Concise notes on the event loop.', category: 'notes', tags: ['JS'] });
  const r2 = new Resource({ title: 'Clean Code', description: 'A handbook of agile software craftsmanship', category: 'books', author: 'Robert C. Martin', tags: ['Best Practices'] });
  const r3 = new Resource({ title: 'Mechanical Keyboard Guide', description: 'Choosing switches for comfort', category: 'equipment', tags: ['Hardware'] });
  await r1.save(); await r2.save(); await r3.save();

  // Generate JWT tokens for convenience
  console.log('\nSeed complete! Users created:');
  users.forEach(u => {
    const token = process.env.JWT_SECRET ? jwt.sign({ userId: u.model._id }, process.env.JWT_SECRET, { expiresIn: '7d' }) : 'JWT_SECRET_NOT_SET';
    console.log(`- ${u.model.email} / password: ${u.plainPassword} → token: ${token}`);
  });

  console.log('\nCreated teams:');
  console.log(`- ${team1.name} (${team1._id})`);
  console.log(`- ${team2.name} (${team2._id})`);

  console.log('\nCreated challenges and resources.');
  console.log('You can now run the server and try endpoints (see API_EXAMPLES.md).');
  process.exit(0);
}

run().catch(err => { console.error(err); process.exit(1); });
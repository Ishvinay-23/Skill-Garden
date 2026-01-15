// Integration tests for challenges endpoints
const request = require('supertest');
const mongoose = require('mongoose');
const setup = require('./setup');
const createApp = require('../app');
const Challenge = require('../models/Challenge');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

let app;
let token;

beforeAll(async ()=>{
  await setup.setup();
  app = createApp();

  // seed a user and a challenge
  const pass = await bcrypt.hash('password', 10);
  const user = new User({ name: 'Challenger', email: 'ch@example.com', passwordHash: pass });
  await user.save();
  token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'testsecret', { expiresIn: '1h' });

  const c = new Challenge({ title: 'Sample Challenge', type: 'Speed Run', description: 'Do it', difficulty: 'Easy', rewardXP: 50 });
  await c.save();
});

afterAll(async ()=>{
  await setup.teardown();
});

test('Get daily challenge (fallback when none scheduled)', async () => {
  const res = await request(app).get('/api/challenges/daily');
  expect(res.statusCode).toBe(200);
  expect(res.body.success).toBe(true);
  expect(res.body.challenge).toBeDefined();
});

test('Submit solution (protected) accepted or rejected (200 status)', async () => {
  const ch = await Challenge.findOne({});
  const res = await request(app).post(`/api/challenges/${ch._id}/submit`).set('Authorization', `Bearer ${token}`).send({ solution: 'I solve it' });
  expect([200, 200]).toContain(res.statusCode);
  expect(res.body.success === true || res.body.success === false).toBeTruthy();
});

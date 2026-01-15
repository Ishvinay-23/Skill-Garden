// Integration tests for auth endpoints
const request = require('supertest');
const mongoose = require('mongoose');
const setup = require('./setup');
const createApp = require('../app');
const User = require('../models/User');

let app;

beforeAll(async ()=>{
  await setup.setup();
  app = createApp();
});

afterAll(async ()=>{
  await setup.teardown();
});

afterEach(async ()=>{
  await User.deleteMany({});
});

test('Register and login flow', async () => {
  const registerRes = await request(app).post('/api/auth/register').send({ name: 'Test User', email: 'test@example.com', password: 'password' });
  expect(registerRes.statusCode).toBe(201);
  expect(registerRes.body.success).toBe(true);
  expect(registerRes.body.token).toBeDefined();

  const loginRes = await request(app).post('/api/auth/login').send({ email: 'test@example.com', password: 'password' });
  expect(loginRes.statusCode).toBe(200);
  expect(loginRes.body.success).toBe(true);
  expect(loginRes.body.token).toBeDefined();
});

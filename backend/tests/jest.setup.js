// tests/jest.setup.js — setup common test env variables
// Provide a deterministic JWT secret for tests to avoid errors from jwt.sign
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret';

// Optionally silence warnings during tests
process.env.NODE_ENV = 'test';

// app.js — sets up the Express app without starting the server (for testing)
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');

const authRoutes = require('./routes/authRoutes');
const teamRoutes = require('./routes/teamRoutes');
const challengeRoutes = require('./routes/challengeRoutes');
const resourceRoutes = require('./routes/resourceRoutes');
const leaderboardRoutes = require('./routes/leaderboardRoutes');

const createApp = () => {
  const app = express();
  app.use(helmet());
  app.use(cors());
  app.use(express.json());
  app.use(morgan('dev'));

  // Sanitize request URLs to avoid accidental control characters (e.g. trailing newlines) causing 404s.
  // Removes control characters from req.url and req.originalUrl. This is a defensive measure for dev-friendly behavior.
  app.use((req, res, next) => {
    const sanitize = (u) => typeof u === 'string' ? u.replace(/[\x00-\x1F\x7F]+/g, '') : u;
    const cleanedUrl = sanitize(req.url);
    if(cleanedUrl !== req.url){
      // Update both url and originalUrl so downstream routing and logging use the sanitized version
      req.url = cleanedUrl;
      req.originalUrl = sanitize(req.originalUrl);
      console.warn('Sanitized incoming request URL to remove control characters');
    }
    next();
  });

  // mount routes
  app.use('/api/auth', authRoutes);
  app.use('/api/teams', teamRoutes);
  app.use('/api/challenges', challengeRoutes);
  app.use('/api/resources', resourceRoutes);
  app.use('/api/leaderboard', leaderboardRoutes);

  // Development-only debug routes (seed, etc.)
  if(process.env.NODE_ENV !== 'production'){
    const debugRoutes = require('./routes/debugRoutes');
    app.use('/api/debug', debugRoutes);
  }

  app.get('/health', (req, res) => res.json({ status: 'ok' }));

  // 404 — include requested method and path in response to aid debugging
  app.use((req, res, next) => {
    const info = { method: req.method, path: req.originalUrl || req.url };
    console.warn('404 - endpoint not found:', info);
    res.status(404).json({ success: false, message: 'Endpoint not found', request: info });
  });

  // error handler
  app.use((err, req, res, next) => {
    console.error(err);
    const status = err.status || 500;
    res.status(status).json({ success: false, message: err.message || 'Server error' });
  });

  return app;
};

module.exports = createApp;
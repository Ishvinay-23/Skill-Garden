// server.js — entry point for Skill Garden backend
const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '.env') });

const { connectDB } = require('./config/db');

// Route files (implemented later)
const authRoutes = require('./routes/authRoutes');
const teamRoutes = require('./routes/teamRoutes');
const challengeRoutes = require('./routes/challengeRoutes');
const resourceRoutes = require('./routes/resourceRoutes');
const leaderboardRoutes = require('./routes/leaderboardRoutes');

const PORT = process.env.PORT || 4000;

async function start(){
  try{
    let mongoUri = process.env.MONGO_URI;

    // Try connecting to provided MongoDB URI first
    try{
      await connectDB(mongoUri);
    }catch(connectErr){
      // If connection fails and we're in development, fallback to an in-memory MongoDB
      if(process.env.NODE_ENV !== 'production'){
        console.warn('Primary MongoDB connection failed — falling back to in-memory MongoDB for development.');
        const { MongoMemoryServer } = require('mongodb-memory-server');
        const mongod = await MongoMemoryServer.create();
        mongoUri = mongod.getUri();
        await connectDB(mongoUri);

        // Ensure the in-memory server stops when the process exits
        const stop = async () => { try{ await mongod.stop(); }catch(e){} };
        process.on('exit', stop);
        process.on('SIGINT', async ()=>{ await stop(); process.exit(0); });
      }else{
        throw connectErr;
      }
    }

    // Use app factory so tests can require without starting server
    const createApp = require('./app');
    const app = createApp();

    app.listen(PORT, () => console.log(`Skill Garden backend running on port ${PORT}`));

  }catch(err){
    console.error('Failed to start server', err);
    process.exit(1);
  }
}

if(require.main === module){
  start();
}

module.exports = start;

// config/db.js — Mongoose connection
const mongoose = require('mongoose');
const debug = require('debug')('skillgarden:db');

function connectDB(uri){
  if(!uri) throw new Error('MONGO_URI is required to connect to database');
  return mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }).then((conn)=>{
    debug('Connected to MongoDB');
    return conn;
  }).catch(err => {
    console.error('MongoDB connection error:', err.message);
    throw err;
  });
}

module.exports = { connectDB };

// tests/setup.js — Jest setup: start in-memory MongoDB and connect mongoose
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

module.exports = {
  async setup(){
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    return uri;
  },
  async teardown(){
    await mongoose.disconnect();
    await mongoServer.stop();
  },
  getUri(){
    return mongoServer.getUri();
  }
};
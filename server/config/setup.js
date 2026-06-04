// tests/setup.js — runs ONCE before all test suites
const mongoose = require('mongoose');

module.exports = async () => {
  // Use the MONGO_URI from the environment.
  // In CI this points to the GitHub Actions MongoDB service.
  // Locally you can set it to a local mongod or a test Atlas cluster.
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/food-delivery-test';

  await mongoose.connect(uri);
  console.log(`\n🧪 Test DB connected: ${mongoose.connection.host}`);

  // Store uri so teardown can find it
  global.__MONGO_URI__ = uri;
};
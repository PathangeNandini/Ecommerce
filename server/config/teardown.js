// tests/teardown.js — runs ONCE after all test suites
const mongoose = require('mongoose');

module.exports = async () => {
  // Drop the test database so every CI run starts clean
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  console.log('\n🧹 Test DB dropped and connection closed');
};
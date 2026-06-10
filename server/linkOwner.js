/**
 * Run this once: node linkOwner.js
 * Links owner@test.com to the first restaurant in the DB
 * and creates a courier test account
 */
require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const User = require('./models/User');
  const Restaurant = require('./models/Restaurant');
  const bcrypt = require('bcryptjs');

  // Find owner user
  const owner = await User.findOne({ email: 'owner@test.com' });
  if (!owner) { console.log('owner@test.com not found — run seed.js first'); process.exit(1); }

  // Find first restaurant and link it
  const restaurant = await Restaurant.findOne({});
  if (!restaurant) { console.log('No restaurants found — run seed.js first'); process.exit(1); }

  restaurant.ownerId = owner._id;
  await restaurant.save();
  console.log(`✅ Linked "${restaurant.name}" to owner@test.com`);

  // Create courier test account
  const existing = await User.findOne({ email: 'courier@test.com' });
  if (!existing) {
    const pw = await bcrypt.hash('password123', 10);
    await User.create({ name: 'Test Courier', email: 'courier@test.com', password: pw, role: 'courier' });
    console.log('✅ Created courier@test.com / password123');
  } else {
    console.log('ℹ️  courier@test.com already exists');
  }

  console.log('\nTest accounts:');
  console.log('  Customer : customer@test.com / password123');
  console.log('  Owner    : owner@test.com    / password123');
  console.log('  Courier  : courier@test.com  / password123');

  mongoose.disconnect();
});
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const hash = await bcrypt.hash('owner123', 10);
  
  const emails = [
    'owner@foodrush.com',
    'customer@foodrush.com', 
    'courier@test.com',
    'owner@test.com',
    'customer@test.com'
  ];

  for (const email of emails) {
    const result = await User.updateOne({ email }, { $set: { password: hash } });
    console.log(`${email}: ${result.modifiedCount ? '✅ updated' : '❌ not found'}`);
  }

  process.exit();
});
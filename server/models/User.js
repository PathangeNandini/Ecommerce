const mongoose = require('mongoose');

/**
 * User model
 * Roles:
 *   consumer   - browses restaurants, places orders, writes reviews
 *   restaurant - manages menu, views/accepts incoming orders
 *   courier    - assigned to orders, marks delivered
 */
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6
  },
  role: {
    type: String,
    enum: ['consumer', 'restaurant', 'courier'],
    default: 'consumer'
  },
  loyaltyPoints: {
    type: Number,
    default: 0,
    min: 0
  },
  rewardPoints: {
  type: Number,
  default: 0,
}
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);

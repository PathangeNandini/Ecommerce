const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Item name is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: 0
  },
  category: {
    type: String,
    trim: true,
    default: 'Main'
  },
  available: {
    type: Boolean,
    default: true  // Restaurant can toggle this on/off
  },
  imageUrl: {
    type: String
  }
}, { timestamps: true });

module.exports = mongoose.model('MenuItem', menuItemSchema);

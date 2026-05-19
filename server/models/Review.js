const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
    unique: true  // One review per order
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true
  },
  text: {
    type: String,
    required: [true, 'Review text is required'],
    minlength: [10, 'Review must be at least 10 characters']
  },
  score: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
    // Calculated by reviewScorer.js based on word count, photo, and keywords
  },
  mediaUrl: {
    type: String  // Photo URL (optional)
  },
  keywords: {
    type: [String],
    default: []
    // AI-suggested keywords the user clicked (e.g. "crispy", "spicy", "generous portions")
  },
  pointsEarned: {
    type: Number,
    default: 0  // = score / 2, awarded to user as loyalty points
  }
}, { timestamps: true });

module.exports = mongoose.model('Review', reviewSchema);

const Review = require('../models/Review');
const Order = require('../models/Order');
const User = require('../models/User');
const MenuItem = require('../models/MenuItem');
const { scoreReview, calculatePoints } = require('../utils/reviewScorer');
const { suggestKeywords } = require('../utils/nlpHelper');

/**
 * POST /api/reviews
 * Submit a review for a delivered order.
 * Awards loyalty points to the user based on review quality.
 */
exports.submitReview = async (req, res) => {
  try {
    const { orderId, text, mediaUrl, keywords = [] } = req.body;

    // Verify the order exists, belongs to this user, and is delivered
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ msg: 'Order not found' });
    if (order.userId.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'You can only review your own orders' });
    }
    if (order.status !== 'delivered') {
      return res.status(400).json({ msg: 'You can only review delivered orders' });
    }

    // Check for duplicate review
    const existing = await Review.findOne({ orderId });
    if (existing) return res.status(400).json({ msg: 'You have already reviewed this order' });

    // Score the review using our algorithm
    const score = scoreReview(text, mediaUrl, keywords);
    const pointsEarned = calculatePoints(score);

    // Save the review
    const review = await Review.create({
      orderId,
      userId: req.user.id,
      restaurantId: order.restaurantId,
      text,
      mediaUrl,
      keywords,
      score,
      pointsEarned
    });

    // Award loyalty points to the user (atomic update)
    await User.findByIdAndUpdate(req.user.id, {
      $inc: { loyaltyPoints: pointsEarned }
    });

    res.status(201).json({
      review,
      score,
      pointsEarned,
      message: `Great review! You earned ${pointsEarned} loyalty points.`
    });
  } catch (err) {
    console.error('submitReview error:', err.message);
    res.status(500).json({ msg: err.message });
  }
};

/**
 * GET /api/reviews/:restaurantId
 * Get paginated reviews for a restaurant.
 * 
 * Query params: page (default 0), limit (default 10)
 */
exports.getReviews = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 0;
    const limit = parseInt(req.query.limit) || 10;

    const reviews = await Review.find({ restaurantId: req.params.restaurantId })
      .populate('userId', 'name')
      .sort({ createdAt: -1 })
      .skip(page * limit)
      .limit(limit);

    const total = await Review.countDocuments({ restaurantId: req.params.restaurantId });

    res.json({ reviews, total, page, hasMore: (page + 1) * limit < total });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

/**
 * GET /api/reviews/suggestions
 * Get AI keyword suggestions based on ordered items.
 * 
 * Query params: orderId
 */
exports.getSuggestions = async (req, res) => {
  try {
    const { orderId } = req.query;
    if (!orderId) return res.status(400).json({ msg: 'orderId is required' });

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ msg: 'Order not found' });

    // Build comma-separated list of ordered items
    const itemNames = order.items.map(i => i.name).join(', ');

    const keywords = await suggestKeywords(itemNames);

    res.json({ keywords, items: itemNames });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

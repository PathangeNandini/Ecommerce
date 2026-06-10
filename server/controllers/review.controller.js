import Review from "../models/Review.js";
import User from "../models/User.js";
import Restaurant from "../models/Restaurant.js";

// Helper — count meaningful words (5+ chars)
const countMeaningfulWords = (text) => {
  return text.split(/\s+/).filter((w) => w.length >= 5).length;
};

// Helper — award points based on review quality
const calcPoints = (text, rating, hasPhoto) => {
  let points = 10; // base
  const meaningfulWords = countMeaningfulWords(text);

  if (meaningfulWords >= 20) points += 20;
  else if (meaningfulWords >= 10) points += 10;
  else if (meaningfulWords >= 5) points += 5;

  if (rating === 5) points += 5;
  if (hasPhoto) points += 15; // bonus for photo upload

  return points;
};

// POST /api/reviews
export const createReview = async (req, res) => {
  try {
    const { restaurantId, orderId, rating, text } = req.body;

    if (!restaurantId || !rating || !text) {
      return res.status(400).json({ message: "restaurantId, rating, and text are required" });
    }

    // Prevent duplicate reviews for same order
    if (orderId) {
      const existing = await Review.findOne({ orderId, userId: req.user.id });
      if (existing) {
        return res.status(400).json({ message: "You already reviewed this order" });
      }
    }

    // Handle uploaded photo
    const photoUrl = req.file
      ? `/uploads/reviews/${req.file.filename}`
      : null;

    const hasPhoto = !!photoUrl;
    const points = calcPoints(text, parseInt(rating), hasPhoto);
    const meaningfulWords = countMeaningfulWords(text);

    const review = await Review.create({
      restaurantId,
      orderId,
      userId: req.user.id,
      rating: parseInt(rating),
      text,
      photoUrl,
      pointsAwarded: points,
    });

    // Add points to user
    await User.findByIdAndUpdate(req.user.id, {
      $inc: { rewardPoints: points },
    });

    // Recalculate restaurant average rating
    const allReviews = await Review.find({ restaurantId });
    const avgRating =
      allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    await Restaurant.findByIdAndUpdate(restaurantId, {
      rating: Math.round(avgRating * 10) / 10,
    });

    res.status(201).json({
      success: true,
      review,
      pointsAwarded: points,
      meaningfulWords,
      hasPhoto,
      message: `You earned ${points} reward points for this review!${hasPhoto ? " (+15 for photo)" : ""}`,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/reviews/:restaurantId
export const getReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ restaurantId: req.params.restaurantId })
      .populate("userId", "name")
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/reviews/my
export const getMyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ userId: req.user.id })
      .populate("restaurantId", "name")
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/reviews/keywords/:restaurantId
export const getKeywordSuggestions = async (req, res) => {
  try {
    const reviews = await Review.find({
      restaurantId: req.params.restaurantId,
    }).select("text");

    const wordMap = {};
    const stopWords = new Set([
      "the", "and", "was", "for", "are", "with", "this", "that",
      "have", "from", "they", "will", "been", "were", "said",
    ]);

    reviews.forEach((r) => {
      r.text
        .toLowerCase()
        .replace(/[^a-z\s]/g, "")
        .split(/\s+/)
        .filter((w) => w.length > 4 && !stopWords.has(w))
        .forEach((w) => {
          wordMap[w] = (wordMap[w] || 0) + 1;
        });
    });

    const keywords = Object.entries(wordMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([word]) => word);

    res.json({ keywords });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/reviews/my-keywords/:restaurantId
export const getMyKeywords = async (req, res) => {
  try {
    const Order = (await import("../models/Order.js")).default;

    const orders = await Order.find({
      userId: req.user.id,
      restaurantId: req.params.restaurantId,
      status: "delivered",
    }).select("items");

    if (orders.length === 0) {
      return res.json({
        keywords: [
          "delicious", "fresh", "tasty", "crispy", "spicy",
          "portions", "flavour", "service", "packaging", "quick",
        ],
        source: "general",
      });
    }

    const itemNames = [];
    orders.forEach((order) => {
      order.items.forEach((item) => {
        if (item.name) itemNames.push(item.name.toLowerCase());
      });
    });

    const qualityWords = [
      "delicious", "fresh", "crispy", "spicy", "flavourful",
      "generous", "portions", "packaging", "service", "quick",
      "tasty", "aromatic", "value",
    ];

    const itemWords = [...new Set(
      itemNames.join(" ").split(/\s+/).filter((w) => w.length > 3)
    )];

    const keywords = [...new Set([...itemWords, ...qualityWords])].slice(0, 10);

    res.json({
      keywords,
      source: "order-history",
      itemsOrdered: [...new Set(itemNames)],
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
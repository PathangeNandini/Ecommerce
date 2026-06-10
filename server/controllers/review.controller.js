import Review from "../models/Review.js";
import User from "../models/User.js";
import Restaurant from "../models/Restaurant.js";

// Helper — count meaningful words (5+ chars) for gamification
const countMeaningfulWords = (text) => {
  return text.split(/\s+/).filter((w) => w.length >= 5).length;
};

// Helper — award points based on review quality
const calcPoints = (text, rating) => {
  let points = 10; // base points for any review
  const meaningfulWords = countMeaningfulWords(text);

  if (meaningfulWords >= 20) points += 20;
  else if (meaningfulWords >= 10) points += 10;
  else if (meaningfulWords >= 5) points += 5;

  if (rating === 5) points += 5; // bonus for 5-star

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

    const points = calcPoints(text, rating);
    const meaningfulWords = countMeaningfulWords(text);

    const review = await Review.create({
      restaurantId,
      orderId,
      userId: req.user.id,
      rating,
      text,
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
      message: `You earned ${points} reward points for this review!`,
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

// GET /api/reviews/keywords/:restaurantId — AI keyword suggestions
export const getKeywordSuggestions = async (req, res) => {
  try {
    const reviews = await Review.find({
      restaurantId: req.params.restaurantId,
    }).select("text");

    // Extract common words from existing reviews
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
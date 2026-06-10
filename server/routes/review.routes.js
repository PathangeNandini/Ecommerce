import express from "express";
import {
  createReview,
  getReviews,
  getMyReviews,
  getKeywordSuggestions,
} from "../controllers/reviewController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// POST /api/reviews
router.post("/", protect, createReview);

// GET /api/reviews/my
router.get("/my", protect, getMyReviews);

// GET /api/reviews/keywords/:restaurantId
router.get("/keywords/:restaurantId", getKeywordSuggestions);

// GET /api/reviews/:restaurantId
router.get("/:restaurantId", getReviews);

export default router;
import express from "express";
import {
  createReview,
  getReviews,
  getMyReviews,
  getKeywordSuggestions,
  getMyKeywords,
} from "../controllers/reviewController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// POST /api/reviews
router.post("/", protect, createReview);

// GET /api/reviews/my
router.get("/my", protect, getMyReviews);

// GET /api/reviews/my-keywords/:restaurantId  ← order-history based
router.get("/my-keywords/:restaurantId", protect, getMyKeywords);

// GET /api/reviews/keywords/:restaurantId  ← general keywords from other reviews
router.get("/keywords/:restaurantId", getKeywordSuggestions);

// GET /api/reviews/:restaurantId
router.get("/:restaurantId", getReviews);

export default router;
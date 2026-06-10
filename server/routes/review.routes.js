import express from "express";
import {
  createReview,
  getReviews,
  getMyReviews,
  getKeywordSuggestions,
  getMyKeywords,
} from "../controllers/reviewController.js";
import { protect } from "../middleware/authMiddleware.js";
import upload from "../middleware/upload.js";

const router = express.Router();

// POST /api/reviews — accepts optional photo upload
router.post("/", protect, upload.single("photo"), createReview);

// GET /api/reviews/my
router.get("/my", protect, getMyReviews);

// GET /api/reviews/my-keywords/:restaurantId
router.get("/my-keywords/:restaurantId", protect, getMyKeywords);

// GET /api/reviews/keywords/:restaurantId
router.get("/keywords/:restaurantId", getKeywordSuggestions);

// GET /api/reviews/:restaurantId
router.get("/:restaurantId", getReviews);

export default router;
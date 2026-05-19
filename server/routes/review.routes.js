const express = require('express');

const router = express.Router();

const {
  submitReview,
  getReviews,
  getSuggestions
} = require('../controllers/review.controller');

const {
  protect
} = require('../middleware/authMiddleware');

router.get('/suggestions', protect, getSuggestions);

router.post('/', protect, submitReview);

router.get('/:restaurantId', getReviews);

module.exports = router;
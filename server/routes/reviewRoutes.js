const express = require('express');
const {
  createReview,
  getReviews,
  getMyReviews,
  getKeywordSuggestions,
  getMyKeywords,
} = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

const router = express.Router();

router.post('/', protect, upload.single('photo'), createReview);
router.get('/my', protect, getMyReviews);
router.get('/my-keywords/:restaurantId', protect, getMyKeywords);
router.get('/keywords/:restaurantId', getKeywordSuggestions);
router.get('/:restaurantId', getReviews);

module.exports = router;
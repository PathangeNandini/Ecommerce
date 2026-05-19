const express = require('express');
const router = express.Router();
const { submitReview, getReviews, getSuggestions } = require('../controllers/review.controller');
const { authMiddleware } = require('../middleware/authMiddleware');

router.get('/suggestions', authMiddleware, getSuggestions);
router.post('/', authMiddleware, submitReview);
router.get('/:restaurantId', getReviews);

module.exports = router;

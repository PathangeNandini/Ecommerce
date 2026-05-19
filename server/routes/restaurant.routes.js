const express = require('express');
const router = express.Router();

const {
  getNearby,
  getById,
  create
} = require('../controllers/restaurant.controller');

const {
  protect,
  restaurantOnly
} = require('../middleware/authMiddleware');

// Public routes
router.get('/nearby', getNearby);
router.get('/:id', getById);

// Protected — restaurant role only
router.post('/', protect, restaurantOnly, create);

module.exports = router;
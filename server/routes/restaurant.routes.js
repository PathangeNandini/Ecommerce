const express = require('express');
const router = express.Router();
const {
  getNearby,
  getById,
  create,
  getMyRestaurant,
  toggleOpen,
} = require('../controllers/restaurant.controller');
const { protect, restaurantOnly } = require('../middleware/authMiddleware');

// Public
router.get('/nearby', getNearby);

// Protected — restaurant owner
router.get('/mine',         protect, restaurantOnly, getMyRestaurant);
router.patch('/mine/toggle',protect, restaurantOnly, toggleOpen);
router.post('/',            protect, restaurantOnly, create);

// Public (must be after /mine to avoid conflict)
router.get('/:id', getById);

module.exports = router;
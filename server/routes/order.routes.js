const express = require('express');

const router = express.Router();

const {
  placeOrder,
  getOrder,
  updateStatus,
  getDailyRevenue,
  getMyOrders
} = require('../controllers/order.controller');

const {
  protect,
  restaurantOnly,
  courierOnly
} = require('../middleware/authMiddleware');

// Protect all order routes
router.use(protect);

router.post('/', placeOrder);

router.get('/my', getMyOrders);

router.get('/revenue', restaurantOnly, getDailyRevenue);

router.get('/:id', getOrder);

// Combined role check
router.patch('/:id/status', (req, res, next) => {
  if (
    req.user.role === 'restaurant' ||
    req.user.role === 'courier'
  ) {
    return next();
  }

  return res.status(403).json({
    message: 'Access denied'
  });

}, updateStatus);

module.exports = router;
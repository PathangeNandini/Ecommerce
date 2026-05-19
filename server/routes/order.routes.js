const express = require('express');
const router = express.Router();
const {
  placeOrder,
  getOrder,
  updateStatus,
  getDailyRevenue,
  getMyOrders
} = require('../controllers/order.controller');
const { authMiddleware, roleMiddleware } = require('../middleware/authMiddleware');

// All order routes are protected
router.use(authMiddleware);

router.post('/', placeOrder);
router.get('/my', getMyOrders);
router.get('/revenue', roleMiddleware('restaurant'), getDailyRevenue);
router.get('/:id', getOrder);
router.patch('/:id/status', roleMiddleware('restaurant', 'courier'), updateStatus);

module.exports = router;

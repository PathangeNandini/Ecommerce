const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const { protect, restaurantOnly, courierOnly } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/',                                           orderController.placeOrder);
router.get('/my',                                          orderController.getMyOrders);
router.get('/my-deliveries',      courierOnly,             orderController.getMyDeliveries);
router.get('/my-earnings',        courierOnly,             orderController.getMyEarnings);
router.get('/revenue',            restaurantOnly,          orderController.getDailyRevenue);
router.get('/pending',            restaurantOnly,          orderController.getPendingOrders);
router.get('/all',                restaurantOnly,          orderController.getAllOrders);
router.get('/all-pending',        restaurantOnly,          orderController.getPendingOrders);
router.get('/available-deliveries', courierOnly,           orderController.getAvailableDeliveries);
router.get('/:id',                                         orderController.getOrder);
router.patch('/:id/status', (req, res, next) => {
  if (req.user.role === 'restaurant' || req.user.role === 'courier') return next();
  return res.status(403).json({ message: 'Access denied' });
}, orderController.updateStatus);

module.exports = router;
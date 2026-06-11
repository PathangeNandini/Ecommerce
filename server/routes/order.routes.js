const express = require('express');
const router = express.Router();
const { protect, restaurantOnly, courierOnly } = require('../middleware/authMiddleware');
const {
  placeOrder,
  getMyOrders,
  getOrder,
  updateStatus,
  getPendingOrders,   // ✅ FIX: was "getAllPendingOrders" — doesn't exist in controller
  getAllOrders,
  getAvailableDeliveries,
  getDailyRevenue,
  getMyDeliveries,
  getMyEarnings,
} = require('../controllers/orderController');

// ── Consumer ──────────────────────────────────────────────
router.post('/',        protect, placeOrder);
router.get('/my',       protect, getMyOrders);

// ── Restaurant Owner ──────────────────────────────────────
router.get('/revenue',      protect, restaurantOnly, getDailyRevenue);
router.get('/all-pending',  protect, restaurantOnly, getPendingOrders);   // ✅ FIX: now uses getPendingOrders
router.get('/all',          protect, restaurantOnly, getAllOrders);
router.get('/pending',      protect, restaurantOnly, getPendingOrders);

// ── Courier ───────────────────────────────────────────────
router.get('/available-deliveries', protect, courierOnly, getAvailableDeliveries);
router.get('/my-deliveries',        protect, courierOnly, getMyDeliveries);
router.get('/my-earnings',          protect, courierOnly, getMyEarnings);

// ── Shared ────────────────────────────────────────────────
router.get('/:id',           protect, getOrder);
router.patch('/:id/status',  protect, updateStatus);

module.exports = router;
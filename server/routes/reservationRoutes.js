const express = require('express');
const {
  createReservation,
  getMyReservations,
  getRestaurantReservations,
  cancelReservation,
  getAvailableSlots,
} = require('../controllers/reservationController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/my', protect, getMyReservations);
router.get('/slots/:restaurantId', getAvailableSlots);
router.get('/restaurant/:restaurantId', protect, getRestaurantReservations);
router.post('/', protect, createReservation);
router.patch('/:id/cancel', protect, cancelReservation);

module.exports = router;
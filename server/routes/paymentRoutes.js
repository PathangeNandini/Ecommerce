const express = require('express');
const { chargePayment, getPaymentStatus } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/charge', protect, chargePayment);
router.get('/status/:orderId', protect, getPaymentStatus);

module.exports = router;
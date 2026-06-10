import express from "express";
import { chargePayment, getPaymentStatus } from "../controllers/paymentController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// POST /api/payments/charge
router.post("/charge", protect, chargePayment);

// GET /api/payments/status/:orderId
router.get("/status/:orderId", protect, getPaymentStatus);

export default router;
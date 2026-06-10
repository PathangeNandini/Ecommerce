import express from "express";
import {
  createReservation,
  getMyReservations,
  getRestaurantReservations,
  cancelReservation,
  getAvailableSlots,
} from "../controllers/reservationController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET /api/reservations/my
router.get("/my", protect, getMyReservations);

// GET /api/reservations/slots/:restaurantId?date=2024-01-01
router.get("/slots/:restaurantId", getAvailableSlots);

// GET /api/reservations/restaurant/:restaurantId  (owner view)
router.get("/restaurant/:restaurantId", protect, getRestaurantReservations);

// POST /api/reservations
router.post("/", protect, createReservation);

// PATCH /api/reservations/:id/cancel
router.patch("/:id/cancel", protect, cancelReservation);

export default router;
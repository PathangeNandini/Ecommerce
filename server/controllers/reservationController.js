import Reservation from "../models/Reservation.js";
import Restaurant from "../models/Restaurant.js";

// POST /api/reservations
export const createReservation = async (req, res) => {
  try {
    const { restaurantId, date, timeSlot, partySize, specialRequests } = req.body;

    if (!restaurantId || !date || !timeSlot || !partySize) {
      return res.status(400).json({
        message: "restaurantId, date, timeSlot and partySize are required",
      });
    }

    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    if (!restaurant.acceptsReservations) {
      return res.status(400).json({ message: "This restaurant does not accept reservations" });
    }

    // Count existing reservations for that slot
    const existingCount = await Reservation.countDocuments({
      restaurantId,
      date: new Date(date),
      timeSlot,
      status: { $in: ["pending", "confirmed"] },
    });

    if (existingCount >= restaurant.tablesAvailable) {
      return res.status(400).json({ message: "No tables available for this time slot" });
    }

    // Assign a table number
    const tableNumber = existingCount + 1;

    const reservation = await Reservation.create({
      restaurantId,
      userId: req.user.id,
      date: new Date(date),
      timeSlot,
      partySize,
      specialRequests,
      status: "confirmed",
      tableNumber,
    });

    await reservation.populate("restaurantId", "name address");

    res.status(201).json({
      success: true,
      reservation,
      message: `Table ${tableNumber} confirmed at ${timeSlot} on ${new Date(date).toDateString()}`,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/reservations/my
export const getMyReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find({ userId: req.user.id })
      .populate("restaurantId", "name address image")
      .sort({ date: -1 });

    res.json(reservations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/reservations/restaurant/:restaurantId
export const getRestaurantReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find({
      restaurantId: req.params.restaurantId,
      status: { $in: ["pending", "confirmed"] },
    })
      .populate("userId", "name phone")
      .sort({ date: 1, timeSlot: 1 });

    res.json(reservations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/reservations/:id/cancel
export const cancelReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!reservation) {
      return res.status(404).json({ message: "Reservation not found" });
    }

    if (reservation.status === "cancelled") {
      return res.status(400).json({ message: "Already cancelled" });
    }

    reservation.status = "cancelled";
    await reservation.save();

    res.json({ success: true, message: "Reservation cancelled", reservation });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/reservations/slots/:restaurantId
export const getAvailableSlots = async (req, res) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ message: "date query param is required" });
    }

    const restaurant = await Restaurant.findById(req.params.restaurantId);
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    // Count bookings per slot for that date
    const bookings = await Reservation.aggregate([
      {
        $match: {
          restaurantId: restaurant._id,
          date: new Date(date),
          status: { $in: ["pending", "confirmed"] },
        },
      },
      {
        $group: {
          _id: "$timeSlot",
          count: { $sum: 1 },
        },
      },
    ]);

    const bookedMap = {};
    bookings.forEach((b) => {
      bookedMap[b._id] = b.count;
    });

    const slots = (restaurant.timeSlots || []).map((slot) => ({
      time: slot,
      available: (restaurant.tablesAvailable || 10) - (bookedMap[slot] || 0),
    }));

    res.json({ date, slots });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
import mongoose from "mongoose";

const reservationSchema = new mongoose.Schema(
  {
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    timeSlot: {
      type: String,
      required: true, // e.g. "19:00"
    },
    partySize: {
      type: Number,
      required: true,
      min: 1,
      max: 20,
    },
    specialRequests: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed"],
      default: "pending",
    },
    tableNumber: {
      type: Number,
      default: null,
    },
  },
  { timestamps: true }
);

// Prevent double booking — same restaurant, date, timeSlot, tableNumber
reservationSchema.index({ userId: 1, date: -1 });
reservationSchema.index({ restaurantId: 1, date: 1, status: 1 });

export default mongoose.model("Reservation", reservationSchema);
import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
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
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    text: {
      type: String,
      required: true,
      minlength: 10,
    },
    photoUrl: {
      type: String,
      default: null,
    },
    pointsAwarded: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

reviewSchema.index({ orderId: 1, userId: 1 }, { unique: true, sparse: true });
reviewSchema.index({ restaurantId: 1, createdAt: -1 });
reviewSchema.index({ userId: 1 });
export default mongoose.model("Review", reviewSchema);
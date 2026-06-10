const mongoose = require('mongoose');

/**
 * Order model
 * 
 * Status flow:
 *   placed → preparing → assigned → transit → delivered 
 * 
 * Each status change emits a Socket.io event to the consumer.
 */
const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true
  },
  items: [
    {
      menuItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' },
      name: String,      // Snapshot at order time (in case menu changes later)
      price: Number,     // Snapshot at order time
      qty: { type: Number, min: 1 }
    }
  ],
  totalPrice: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['placed', 'preparing', 'assigned', 'transit', 'delivered'],
    default: 'placed'
  },
  courierId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  deliveryAddress: {
    type: String
  },
  paymentStatus: {
  type: String,
  enum: ["pending", "paid", "failed"],
  default: "pending",
},
paymentDetails: {
  transactionId: String,
  status: String,
  amount: Number,
  paymentMethod: String,
  paidAt: Date,
}
}, { timestamps: true });

// Index for fast lookup of orders by user
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ restaurantId: 1, status: 1 });

module.exports = mongoose.model('Order', orderSchema);

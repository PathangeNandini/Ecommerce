import Order from "../models/Order.js";

// POST /api/payments/charge
export const chargePayment = async (req, res) => {
  try {
    const { orderId, paymentMethod, amount } = req.body;

    if (!orderId || !amount) {
      return res.status(400).json({ message: "orderId and amount are required" });
    }

    // Mock payment — always succeeds
    const mockTransaction = {
      transactionId: "TXN" + Date.now(),
      status: "success",
      amount,
      paymentMethod: paymentMethod || "card",
      paidAt: new Date(),
    };

    // Update order with payment info
    const order = await Order.findByIdAndUpdate(
      orderId,
      {
        paymentStatus: "paid",
        paymentDetails: mockTransaction,
      },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({
      success: true,
      transaction: mockTransaction,
      order,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/payments/status/:orderId
export const getPaymentStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId).select(
      "paymentStatus paymentDetails totalPrice"
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({
      orderId: order._id,
      paymentStatus: order.paymentStatus,
      paymentDetails: order.paymentDetails,
      totalPrice: order.totalPrice,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
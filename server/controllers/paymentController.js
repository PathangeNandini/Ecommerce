const Order = require('../models/Order');

exports.chargePayment = async (req, res) => {
  try {
    const { orderId, paymentMethod, amount } = req.body;

    if (!orderId || !amount) {
      return res.status(400).json({ message: "orderId and amount are required" });
    }

    const mockTransaction = {
      transactionId: "TXN" + Date.now(),
      status: "success",
      amount,
      paymentMethod: paymentMethod || "card",
      paidAt: new Date(),
    };

    const order = await Order.findByIdAndUpdate(
      orderId,
      { paymentStatus: "paid", paymentDetails: mockTransaction },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({ success: true, transaction: mockTransaction, order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getPaymentStatus = async (req, res) => {
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
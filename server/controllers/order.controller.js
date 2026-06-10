const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const mongoose = require('mongoose');

/** POST /api/orders */
exports.placeOrder = async (req, res) => {
  try {
    const { restaurantId, items, deliveryAddress } = req.body;

    if (!restaurantId || !mongoose.Types.ObjectId.isValid(restaurantId))
      return res.status(400).json({ msg: 'Invalid or missing restaurantId' });

    if (!items || items.length === 0)
      return res.status(400).json({ msg: 'Cart is empty' });

    const menuItemIds = items.map(i => i.menuItemId || i._id);
    const dbItems = await MenuItem.find({ _id: { $in: menuItemIds }, available: true });

    if (dbItems.length !== items.length)
      return res.status(400).json({ msg: 'Some items are unavailable or not found' });

    const orderItems = items.map(cartItem => {
      const id = cartItem.menuItemId || cartItem._id;
      const dbItem = dbItems.find(d => d._id.toString() === id.toString());
      return { menuItemId: dbItem._id, name: dbItem.name, price: dbItem.price, qty: cartItem.qty || cartItem.quantity || 1 };
    });

    const totalPrice = orderItems.reduce((sum, item) => sum + item.price * item.qty, 0);

    const order = await Order.create({
      userId: req.user.id, restaurantId, items: orderItems,
      totalPrice, deliveryAddress, status: 'placed'
    });

    const io = req.app.get('io');
    if (io) {
      // Emit to specific restaurant room AND a general owner room
      io.to(`restaurant:${restaurantId}`).emit('order:placed', {
        _id: order._id, orderId: order._id, items: orderItems,
        totalPrice, userId: req.user.id, status: 'placed', createdAt: order.createdAt
      });
      io.to('owner:all').emit('order:placed', {
        _id: order._id, orderId: order._id, items: orderItems,
        totalPrice, userId: req.user.id, status: 'placed', createdAt: order.createdAt,
        restaurantId
      });
    }

    res.status(201).json(order);
  } catch (err) {
    console.error('placeOrder error:', err.message);
    res.status(500).json({ msg: err.message });
  }
};

/** GET /api/orders/my */
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id })
      .populate('restaurantId', 'name')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) { res.status(500).json({ msg: err.message }); }
};

/** GET /api/orders/pending — ALL placed orders from ALL restaurants */
exports.getPendingOrders = async (req, res) => {
  try {
    const orders = await Order.find({ status: 'placed' })
      .populate('restaurantId', 'name address')
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    const result = orders.map(o => ({
      ...o.toObject(),
      restaurantName: o.restaurantId?.name,
      restaurantAddress: o.restaurantId?.address,
    }));

    res.json(result);
  } catch (err) { res.status(500).json({ msg: err.message }); }
};

/** GET /api/orders/all — ALL orders from ALL restaurants */
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate('restaurantId', 'name address')
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    const result = orders.map(o => ({
      ...o.toObject(),
      restaurantName: o.restaurantId?.name,
      restaurantAddress: o.restaurantId?.address,
    }));

    res.json(result);
  } catch (err) { res.status(500).json({ msg: err.message }); }
};

/** GET /api/orders/available-deliveries — courier only */
exports.getAvailableDeliveries = async (req, res) => {
  try {
    const orders = await Order.find({ status: 'preparing', courierId: null })
      .populate('restaurantId', 'name address')
      .populate('userId', 'name')
      .sort({ createdAt: -1 });

    const result = orders.map(o => ({
      ...o.toObject(),
      restaurantName: o.restaurantId?.name,
      restaurantAddress: o.restaurantId?.address,
      customerName: o.userId?.name,
    }));

    res.json(result);
  } catch (err) { res.status(500).json({ msg: err.message }); }
};

/** GET /api/orders/:id */
exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('restaurantId', 'name address')
      .populate('userId', 'name email');

    if (!order) return res.status(404).json({ msg: 'Order not found' });

    if (req.user.role === 'consumer' && order.userId._id.toString() !== req.user.id)
      return res.status(403).json({ msg: 'Access denied' });

    res.json(order);
  } catch (err) { res.status(500).json({ msg: err.message }); }
};

/** PATCH /api/orders/:id/status */
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['preparing', 'assigned', 'transit', 'delivered', 'rejected'];

    if (!validStatuses.includes(status))
      return res.status(400).json({ msg: 'Invalid status' });

    const updateData = { status };
    if (status === 'assigned' && req.user.role === 'courier') {
      updateData.courierId = req.user.id;
    }

    const order = await Order.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!order) return res.status(404).json({ msg: 'Order not found' });

    const io = req.app.get('io');
    if (io) {
      io.to(`order:${order._id}`).emit(`order:${status}`, {
        orderId: order._id, status, updatedAt: new Date()
      });
    }

    res.json(order);
  } catch (err) { res.status(500).json({ msg: err.message }); }
};

/** GET /api/orders/revenue — restaurant only */
exports.getDailyRevenue = async (req, res) => {
  try {
    const date = req.query.date ? new Date(req.query.date) : new Date();
    const startOfDay = new Date(date); startOfDay.setHours(0, 0, 0, 0);
    const endOfDay   = new Date(date); endOfDay.setHours(23, 59, 59, 999);

    const result = await Order.aggregate([
      { $match: { status: 'delivered', createdAt: { $gte: startOfDay, $lte: endOfDay } } },
      { $group: { _id: null, total: { $sum: '$totalPrice' }, count: { $sum: 1 } } }
    ]);

    res.json({
      date: date.toDateString(),
      total: result[0]?.total || 0,
      count: result[0]?.count || 0,
    });
  } catch (err) { res.status(500).json({ msg: err.message }); }
};

/** GET /api/orders/my-deliveries — courier only */
exports.getMyDeliveries = async (req, res) => {
  try {
    const orders = await Order.find({
      courierId: req.user.id,
      status: { $in: ['assigned', 'transit'] }
    })
      .populate('restaurantId', 'name address')
      .populate('userId', 'name')
      .sort({ createdAt: -1 });

    const result = orders.map(o => ({
      ...o.toObject(),
      restaurantName: o.restaurantId?.name,
      restaurantAddress: o.restaurantId?.address,
      customerName: o.userId?.name,
    }));

    res.json(result);
  } catch (err) { res.status(500).json({ msg: err.message }); }
};
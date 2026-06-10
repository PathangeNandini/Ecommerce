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

/** GET /api/orders/revenue — restaurant owner only */
exports.getDailyRevenue = async (req, res) => {
  try {
    const restaurant = await require('../models/Restaurant').findOne({ ownerId: req.user.id });
    if (!restaurant) return res.status(404).json({ msg: 'Restaurant not found' });

    // Last 7 days including today
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const result = await Order.aggregate([
      {
        $match: {
          restaurantId: restaurant._id,
          status: 'delivered',
          createdAt: { $gte: sevenDaysAgo, $lte: today },
        },
      },
      {
        $group: {
          _id: {
            year:  { $year:  '$createdAt' },
            month: { $month: '$createdAt' },
            day:   { $dayOfMonth: '$createdAt' },
          },
          total:      { $sum: '$totalPrice' },
          orderCount: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
    ]);

    // Fill in missing days with 0
    const revenueMap = {};
    result.forEach((r) => {
      const key = `${r._id.year}-${String(r._id.month).padStart(2,'0')}-${String(r._id.day).padStart(2,'0')}`;
      revenueMap[key] = { total: r.total, orderCount: r.orderCount };
    });

    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
      last7Days.push({
        date:       key,
        label:      d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }),
        total:      revenueMap[key]?.total      || 0,
        orderCount: revenueMap[key]?.orderCount || 0,
      });
    }

    const grandTotal  = last7Days.reduce((s, d) => s + d.total, 0);
    const totalOrders = last7Days.reduce((s, d) => s + d.orderCount, 0);

    res.json({
      last7Days,
      grandTotal,
      totalOrders,
      restaurantName: restaurant.name,
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
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
/** GET /api/orders/my-earnings — courier only */
exports.getMyEarnings = async (req, res) => {
  try {
    const courierId = new mongoose.Types.ObjectId(req.user.id);

    const today = new Date();
    const startOfToday = new Date(today); startOfToday.setHours(0,0,0,0);
    const endOfToday   = new Date(today); endOfToday.setHours(23,59,59,999);
    const sevenDaysAgo = new Date(today); sevenDaysAgo.setDate(today.getDate() - 6);
    sevenDaysAgo.setHours(0,0,0,0);

    const [todayResult, weekResult, totalResult] = await Promise.all([
      // Today's earnings
      Order.aggregate([
        { $match: { courierId, status: "delivered",
            createdAt: { $gte: startOfToday, $lte: endOfToday } } },
        { $group: { _id: null,
            earnings: { $sum: { $multiply: ["$totalPrice", 0.1] } },
            count: { $sum: 1 } } },
      ]),
      // This week's earnings
      Order.aggregate([
        { $match: { courierId, status: "delivered",
            createdAt: { $gte: sevenDaysAgo, $lte: endOfToday } } },
        { $group: { _id: null,
            earnings: { $sum: { $multiply: ["$totalPrice", 0.1] } } } },
      ]),
      // All time deliveries
      Order.countDocuments({ courierId, status: "delivered" }),
    ]);

    res.json({
      today:            todayResult[0]?.earnings    ?? 0,
      todayDeliveries:  todayResult[0]?.count        ?? 0,
      week:             weekResult[0]?.earnings      ?? 0,
      totalDeliveries:  totalResult,
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};
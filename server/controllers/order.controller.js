const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const User = require('../models/User');

/**
 * POST /api/orders
 * Place a new order.
 */
exports.placeOrder = async (req, res) => {
  try {
    const { restaurantId, items, deliveryAddress } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ msg: 'Cart is empty' });
    }

    // Fetch menu items from DB — removed restaurantId filter to avoid mismatch
    const menuItemIds = items.map(i => i.menuItemId || i._id);
    const dbItems = await MenuItem.find({
      _id: { $in: menuItemIds },
      available: true
    });

    if (dbItems.length !== items.length) {
      return res.status(400).json({ msg: 'Some items are unavailable or not found' });
    }

    // Build order items with server-side pricing
    const orderItems = items.map(cartItem => {
      const id = cartItem.menuItemId || cartItem._id;
      const dbItem = dbItems.find(d => d._id.toString() === id.toString());
      return {
        menuItemId: dbItem._id,
        name: dbItem.name,
        price: dbItem.price,
        qty: cartItem.qty || cartItem.quantity || 1
      };
    });

    // Calculate total server-side
    const totalPrice = orderItems.reduce((sum, item) => sum + item.price * item.qty, 0);

    const order = await Order.create({
      userId: req.user.id,
      restaurantId,
      items: orderItems,
      totalPrice,
      deliveryAddress,
      status: 'placed'
    });

    // Emit socket event to restaurant
    const io = req.app.get('io');
    if (io) {
      io.to(`restaurant:${restaurantId}`).emit('order:placed', {
        orderId: order._id,
        items: orderItems,
        totalPrice,
        userId: req.user.id,
        status: 'placed',
        createdAt: order.createdAt
      });
    }

    res.status(201).json(order);
  } catch (err) {
    console.error('placeOrder error:', err.message);
    res.status(500).json({ msg: err.message });
  }
};

/**
 * GET /api/orders/:id
 */
exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('restaurantId', 'name address')
      .populate('userId', 'name email');

    if (!order) return res.status(404).json({ msg: 'Order not found' });

    if (req.user.role === 'consumer' && order.userId._id.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Access denied' });
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

/**
 * PATCH /api/orders/:id/status
 */
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['preparing', 'assigned', 'transit', 'delivered'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ msg: `Invalid status. Valid options: ${validStatuses.join(', ')}` });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!order) return res.status(404).json({ msg: 'Order not found' });

    const io = req.app.get('io');
    if (io) {
      io.to(`order:${order._id}`).emit(`order:${status}`, {
        orderId: order._id,
        status,
        updatedAt: new Date()
      });
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

/**
 * GET /api/orders/revenue
 */
exports.getDailyRevenue = async (req, res) => {
  try {
    const date = req.query.date ? new Date(req.query.date) : new Date();
    const startOfDay = new Date(date); startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);   endOfDay.setHours(23, 59, 59, 999);

    const Restaurant = require('../models/Restaurant');
    const restaurant = await Restaurant.findOne({ ownerId: req.user.id });
    if (!restaurant) return res.status(404).json({ msg: 'Restaurant not found for this user' });

    const result = await Order.aggregate([
      { $match: { restaurantId: restaurant._id, status: 'delivered', createdAt: { $gte: startOfDay, $lte: endOfDay } } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalPrice' }, orderCount: { $sum: 1 } } }
    ]);

    res.json({
      date: date.toDateString(),
      totalRevenue: result[0]?.totalRevenue || 0,
      orderCount: result[0]?.orderCount || 0
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

/**
 * GET /api/orders/my
 */
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id })
      .populate('restaurantId', 'name')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};
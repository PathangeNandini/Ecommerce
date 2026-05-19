const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const User = require('../models/User');

/**
 * POST /api/orders
 * Place a new order.
 * 
 * SECURITY: We never trust the price from the client.
 * We re-fetch each item from the DB and calculate totalPrice server-side.
 * 
 * Body: { restaurantId, items: [{ menuItemId, qty }], deliveryAddress }
 */
exports.placeOrder = async (req, res) => {
  try {
    const { restaurantId, items, deliveryAddress } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ msg: 'Cart is empty' });
    }

    // Fetch menu items from DB and validate
    const menuItemIds = items.map(i => i.menuItemId);
    const dbItems = await MenuItem.find({
      _id: { $in: menuItemIds },
      restaurantId,
      available: true
    });

    if (dbItems.length !== items.length) {
      return res.status(400).json({ msg: 'Some items are unavailable or not found' });
    }

    // Build order items with server-side pricing (snapshots)
    const orderItems = items.map(cartItem => {
      const dbItem = dbItems.find(d => d._id.toString() === cartItem.menuItemId);
      return {
        menuItemId: dbItem._id,
        name: dbItem.name,     // Snapshot in case menu changes later
        price: dbItem.price,   // Server-authoritative price
        qty: cartItem.qty
      };
    });

    // Calculate total server-side
    const totalPrice = orderItems.reduce((sum, item) => sum + item.price * item.qty, 0);

    // Simulate payment gateway (always succeeds in this mock)
    const paymentSuccess = true;
    if (!paymentSuccess) {
      return res.status(402).json({ msg: 'Payment failed' });
    }

    const order = await Order.create({
      userId: req.user.id,
      restaurantId,
      items: orderItems,
      totalPrice,
      deliveryAddress,
      status: 'placed'
    });

    // Emit socket event to the restaurant's room
    const io = req.app.get('io');
    io.to(`restaurant:${restaurantId}`).emit('order:placed', {
      orderId: order._id,
      items: orderItems,
      totalPrice,
      userId: req.user.id,
      status: 'placed',
      createdAt: order.createdAt
    });

    res.status(201).json(order);
  } catch (err) {
    console.error('placeOrder error:', err.message);
    res.status(500).json({ msg: err.message });
  }
};

/**
 * GET /api/orders/:id
 * Get a single order by ID. Users can only see their own orders.
 */
exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('restaurantId', 'name address')
      .populate('userId', 'name email');

    if (!order) return res.status(404).json({ msg: 'Order not found' });

    // Consumers can only view their own orders
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
 * Update the status of an order.
 * Emits a socket event to the consumer after update.
 * 
 * Body: { status } — one of: preparing, assigned, transit, delivered
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

    // Emit real-time update to the consumer tracking this order
    const io = req.app.get('io');
    io.to(`order:${order._id}`).emit(`order:${status}`, {
      orderId: order._id,
      status,
      updatedAt: new Date()
    });

    res.json(order);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

/**
 * GET /api/orders/revenue
 * Daily revenue for a restaurant. Restaurant owners only.
 * 
 * Query params: date (optional, defaults to today)
 */
exports.getDailyRevenue = async (req, res) => {
  try {
    const date = req.query.date ? new Date(req.query.date) : new Date();

    // Set time range for the full day
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // Find the restaurant owned by this user
    const Restaurant = require('../models/Restaurant');
    const restaurant = await Restaurant.findOne({ ownerId: req.user.id });
    if (!restaurant) return res.status(404).json({ msg: 'Restaurant not found for this user' });

    // Aggregate delivered orders for the day
    const result = await Order.aggregate([
      {
        $match: {
          restaurantId: restaurant._id,
          status: 'delivered',
          createdAt: { $gte: startOfDay, $lte: endOfDay }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalPrice' },
          orderCount: { $sum: 1 }
        }
      }
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
 * Get all orders for the logged-in consumer.
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



const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const Restaurant = require('../models/Restaurant');

let io;

const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      credentials: true,
      methods: ['GET', 'POST']
    },
    pingTimeout: 60000,
    pingInterval: 25000
  });

  // JWT auth middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Authentication error'));
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', async (socket) => {
    const { id: userId, role } = socket.user;
    console.log(`🔌 Socket connected: ${userId} (${role})`);

    // Consumer joins personal room
    socket.join(`user:${userId}`);

    // ── Restaurant owner ──────────────────────────────────────────────
    if (role === 'restaurant') {
      // Auto-join restaurant room on connect (lookup by ownerId)
      try {
        const restaurant = await Restaurant.findOne({ ownerId: userId });
        if (restaurant) {
          socket.join(`restaurant:${restaurant._id}`);
          socket.join('owner:all');
          socket.restaurantId = restaurant._id.toString();
          console.log(`🏪 Owner joined restaurant:${restaurant._id}`);
        }
      } catch (e) {
        console.error('Socket restaurant lookup error:', e.message);
      }

      // Also support manual join (legacy)
      socket.on('restaurant:join', (restaurantId) => {
        socket.join(`restaurant:${restaurantId}`);
        console.log(`🏪 Restaurant ${restaurantId} joined manually`);
      });

      // Support join:owner event from OwnerDashboard.jsx
      socket.on('join:owner', async () => {
        try {
          const restaurant = await Restaurant.findOne({ ownerId: userId });
          if (restaurant) {
            socket.join(`restaurant:${restaurant._id}`);
            socket.join('owner:all');
            console.log(`🏪 Owner joined via join:owner → restaurant:${restaurant._id}`);
          }
        } catch (e) {
          console.error('join:owner error:', e.message);
        }
      });
    }

    // ── Courier ───────────────────────────────────────────────────────
    if (role === 'courier') {
      socket.join(`courier:${userId}`);
      socket.join('couriers:all'); // all couriers see new orders
      console.log(`🚴 Courier ${userId} joined couriers:all`);
    }

    // ── Order tracking ────────────────────────────────────────────────
    socket.on('order:track', (orderId) => {
      socket.join(`order:${orderId}`);
      console.log(`📍 User ${userId} tracking order ${orderId}`);
    });

    socket.on('order:untrack', (orderId) => {
      socket.leave(`order:${orderId}`);
    });

    // ── Live courier location ─────────────────────────────────────────
    socket.on('courier:location', ({ orderId, lat, lng, heading, speed }) => {
      if (role !== 'courier') return;
      io.to(`order:${orderId}`).emit('location:update', {
        courierId: userId, orderId, lat, lng, heading, speed, ts: Date.now()
      });
    });

    // ── Order accept/reject from owner ────────────────────────────────
    socket.on('order:accept', ({ orderId }) => {
      if (role !== 'restaurant') return;
      io.to(`order:${orderId}`).emit('order:accepted', { orderId, ts: Date.now() });
    });

    socket.on('order:reject', ({ orderId, reason }) => {
      if (role !== 'restaurant') return;
      io.to(`order:${orderId}`).emit('order:rejected', { orderId, reason, ts: Date.now() });
    });

    // ── Disconnect ────────────────────────────────────────────────────
    socket.on('disconnect', (reason) => {
      console.log(`🔌 Socket disconnected: ${userId} — ${reason}`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
};

module.exports = { initSocket, getIO };
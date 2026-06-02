const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

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

  // JWT auth middleware for socket
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

  io.on('connection', (socket) => {
    const { id: userId, role } = socket.user;
    console.log(`🔌 Socket connected: ${userId} (${role})`);

    // ── Room management ──────────────────────────────────────────────
    // Consumer joins their personal room
    socket.join(`user:${userId}`);

    // Restaurant owner joins their restaurant room
    if (role === 'restaurant') {
      socket.on('restaurant:join', (restaurantId) => {
        socket.join(`restaurant:${restaurantId}`);
        console.log(`🏪 Restaurant ${restaurantId} online`);
      });
    }

    // Courier joins their own room
    if (role === 'courier') {
      socket.join(`courier:${userId}`);
    }

    // ── Live location updates ─────────────────────────────────────────
    // Courier broadcasts real-time position
    socket.on('courier:location', async ({ orderId, lat, lng, heading, speed }) => {
      if (role !== 'courier') return;
      const payload = { courierId: userId, orderId, lat, lng, heading, speed, ts: Date.now() };

      // Broadcast to the consumer tracking this order
      io.to(`order:${orderId}`).emit('location:update', payload);

      // Also update in DB (throttled — handled in location controller via REST)
    });

    // Consumer subscribes to an order's live location
    socket.on('order:track', (orderId) => {
      socket.join(`order:${orderId}`);
      console.log(`📍 User ${userId} tracking order ${orderId}`);
    });

    socket.on('order:untrack', (orderId) => {
      socket.leave(`order:${orderId}`);
    });

    // ── Order lifecycle events ────────────────────────────────────────
    // order:placed       → emitted by server when order created
    // order:accepted     → restaurant accepts
    // order:preparing    → restaurant starts prep
    // order:ready        → food ready for pickup
    // order:courier_assigned → courier picked it up
    // order:in_transit   → courier on the way
    // order:arrived      → courier nearby
    // order:delivered    → delivered

    socket.on('order:accept', ({ orderId, restaurantId }) => {
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
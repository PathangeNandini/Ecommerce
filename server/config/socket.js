const { Server } = require('socket.io');

let io;

/**
 * Initialize Socket.io server attached to the HTTP server.
 * 
 * HOW IT WORKS:
 * - Each order gets its own "room" (room name = orderId)
 * - Restaurant joins room: socket.join(`restaurant:${restaurantId}`)
 * - Consumer joins room: socket.join(`order:${orderId}`)
 * - Server emits to the correct room when status changes
 */
const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Consumer or merchant joins a specific order room to track updates
    socket.on('join:order', (orderId) => {
      socket.join(`order:${orderId}`);
      console.log(`Socket ${socket.id} joined room order:${orderId}`);
    });

    // Restaurant joins their own room to receive new order notifications
    socket.on('join:restaurant', (restaurantId) => {
      socket.join(`restaurant:${restaurantId}`);
      console.log(`Socket ${socket.id} joined room restaurant:${restaurantId}`);
    });

    // Merchant accepts/rejects an order
    socket.on('order:accept', async (orderId) => {
      // Notify the consumer their order is being prepared
      io.to(`order:${orderId}`).emit('order:preparing', { orderId, status: 'preparing' });
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
};

module.exports = { initSocket, getIO };

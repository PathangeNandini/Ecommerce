const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const { createServer } = require('http');
const { Server } = require('socket.io');
const path = require('path');

dotenv.config();

// Route imports
const authRoutes        = require('./routes/auth.routes');
const restaurantRoutes  = require('./routes/restaurant.routes');
const orderRoutes       = require('./routes/order.routes');
const paymentRoutes     = require('./routes/paymentRoutes');
const reviewRoutes      = require('./routes/reviewRoutes');
const reservationRoutes = require('./routes/reservationRoutes');

const app = express();
const httpServer = createServer(app);

// Socket.io setup
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

// Make io available in controllers via req.app.get('io')
app.set('io', io);

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

// Serve uploaded review images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth',         authRoutes);
app.use('/api/restaurants',  restaurantRoutes);
app.use('/api/orders',       orderRoutes);
app.use('/api/payments',     paymentRoutes);
app.use('/api/reviews',      reviewRoutes);
app.use('/api/reservations', reservationRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Socket.io events
io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);

  socket.on('join:order', (orderId) => {
    socket.join(`order:${orderId}`);
  });

  socket.on('join:owner', () => {
    socket.join('owner:all');
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected:', socket.id);
  });
});

// MongoDB + server start
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    httpServer.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

module.exports = app;
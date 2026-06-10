const express = require('express');
const http = require('http');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');
const { initSocket } = require('./config/socket');

dotenv.config();
connectDB();

const app = express();
const httpServer = http.createServer(app);
const io = initSocket(httpServer);
app.set('io', io);

// ── Middleware ──────────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded review images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── Routes ──────────────────────────────────────────────────
app.use('/api/auth',         require('./routes/auth.routes'));
app.use('/api/restaurants',  require('./routes/restaurant.routes'));
app.use('/api/orders',       require('./routes/order.routes'));
app.use('/api/menu',         require('./routes/menu.routes'));
app.use('/api/reviews',      require('./routes/reviewRoutes'));
app.use('/api/payments',     require('./routes/paymentRoutes'));
app.use('/api/reservations', require('./routes/reservationRoutes'));

// ── Health check ────────────────────────────────────────────
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

// ── Error handler ───────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ msg: 'Internal server error', error: err.message });
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = { app, httpServer };
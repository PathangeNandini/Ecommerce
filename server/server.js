require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const connectDB = require('./config/db');
const { initSocket } = require('./config/socket');

// route imports
const authRoutes       = require('./routes/auth.routes');
const restaurantRoutes = require('./routes/restaurant.routes');
const menuRoutes       = require('./routes/menu.routes');
const orderRoutes      = require('./routes/order.routes');
const reviewRoutes     = require('./routes/review.routes');

connectDB();

const app = express();
const httpServer = http.createServer(app);

const io = initSocket(httpServer);
app.set('io', io);

app.use(cors());
app.use(express.json());

// health check
app.get('/', (req, res) => res.json({ message: 'Food Delivery API running ✅' }));

// routes
app.use('/api/auth',        authRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/menu',        menuRoutes);
app.use('/api/orders',      orderRoutes);
app.use('/api/reviews',     reviewRoutes);

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";

dotenv.config();

// Route imports
import authRoutes from "./routes/authRoutes.js";
import restaurantRoutes from "./routes/restaurantRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import reservationRoutes from "./routes/reservationRoutes.js";

const app = express();
const httpServer = createServer(app);

// Socket.io setup
export const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);

// Serve uploaded review images
app.use("/uploads", express.static(join(__dirname, "uploads")));

// Routes
app.use("/api/auth",         authRoutes);
app.use("/api/restaurants",  restaurantRoutes);
app.use("/api/orders",       orderRoutes);
app.use("/api/payments",     paymentRoutes);
app.use("/api/reviews",      reviewRoutes);
app.use("/api/reservations", reservationRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Socket.io events
io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("join:order", (orderId) => {
    socket.join(`order:${orderId}`);
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

// MongoDB + server start
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    httpServer.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

export default app;
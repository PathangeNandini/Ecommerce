require("dotenv").config();
const mongoose = require("mongoose");

const MONGO_URI = process.env.MONGO_URI;

async function createIndexes() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB");

  const db = mongoose.connection;

  // ── Orders ─────────────────────────────────────────────
  await db.collection("orders").createIndex({ userId: 1, createdAt: -1 });
  await db.collection("orders").createIndex({ restaurantId: 1, status: 1 });
  await db.collection("orders").createIndex({ courierId: 1, status: 1 });
  await db.collection("orders").createIndex({ status: 1, createdAt: -1 });
  console.log("✅ Orders indexes created");

  // ── Reviews ────────────────────────────────────────────
  await db.collection("reviews").createIndex({ restaurantId: 1, createdAt: -1 });
  await db.collection("reviews").createIndex({ userId: 1 });
  console.log("✅ Reviews indexes created");

  // ── Reservations ───────────────────────────────────────
  await db.collection("reservations").createIndex({ userId: 1, date: -1 });
  await db.collection("reservations").createIndex({ restaurantId: 1, date: 1, status: 1 });
  console.log("✅ Reservations indexes created");

  // ── Restaurants ────────────────────────────────────────
  await db.collection("restaurants").createIndex({ location: "2dsphere" });
  console.log("✅ Restaurant 2dsphere index created");

  // ── Users ──────────────────────────────────────────────
  await db.collection("users").createIndex({ email: 1 }, { unique: true });
  console.log("✅ Users email index created");

  console.log("\n✅ All indexes created successfully!");
  await mongoose.connection.close();
  process.exit(0);
}

createIndexes().catch((err) => {
  console.error("Error creating indexes:", err);
  process.exit(1);
});
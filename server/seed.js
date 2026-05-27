/**
 * seed.js — Populate MongoDB with sample restaurants + menu items
 *
 * Usage:
 * node seed.js
 *
 * ⚠️ Make sure .env contains:
 * MONGO_URI=your_mongodb_connection
 */

require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const Restaurant = require("./models/Restaurant");
const MenuItem = require("./models/MenuItem");
const User = require("./models/User");

/* ─────────────────────────────────────────────
   RESTAURANTS
───────────────────────────────────────────── */

const RESTAURANTS = [

  /* ================= CHENNAI ================= */

  {
    name: "Murugan Idli Shop",
    cuisine: "South Indian",
    rating: 4.7,
    address: "Tambaram, Chennai",
    location: {
      type: "Point",
      coordinates: [80.1183, 12.9249],
    },
    isOpen: true,
  },

  {
    name: "Anjappar Chettinad",
    cuisine: "Chettinad",
    rating: 4.5,
    address: "Chrompet, Chennai",
    location: {
      type: "Point",
      coordinates: [80.1390, 12.9516],
    },
    isOpen: true,
  },

  {
    name: "Pizza Hut Velachery",
    cuisine: "Pizza",
    rating: 4.2,
    address: "Velachery, Chennai",
    location: {
      type: "Point",
      coordinates: [80.2207, 12.9830],
    },
    isOpen: true,
  },

  {
    name: "Dindigul Thalappakatti",
    cuisine: "Biryani",
    rating: 4.6,
    address: "Vadapalani, Chennai",
    location: {
      type: "Point",
      coordinates: [80.2121, 13.0513],
    },
    isOpen: true,
  },

  {
    name: "KFC Tambaram",
    cuisine: "Burgers",
    rating: 4.1,
    address: "Tambaram West, Chennai",
    location: {
      type: "Point",
      coordinates: [80.1147, 12.9236],
    },
    isOpen: true,
  },

  /* ================= VIJAYAWADA ================= */

  {
    name: "Paradise Vijayawada",
    cuisine: "Biryani",
    rating: 4.6,
    address: "Benz Circle, Vijayawada",
    location: {
      type: "Point",
      coordinates: [80.6480, 16.5062],
    },
    isOpen: true,
  },

  {
    name: "RR Durbar",
    cuisine: "Biryani",
    rating: 4.7,
    address: "Governorpet, Vijayawada",
    location: {
      type: "Point",
      coordinates: [80.6305, 16.5185],
    },
    isOpen: true,
  },

  {
    name: "Sweet Magic",
    cuisine: "Desserts",
    rating: 4.5,
    address: "Labbipet, Vijayawada",
    location: {
      type: "Point",
      coordinates: [80.6489, 16.5068],
    },
    isOpen: true,
  },

  {
    name: "KFC Vijayawada",
    cuisine: "Burgers",
    rating: 4.2,
    address: "Moghalrajpuram, Vijayawada",
    location: {
      type: "Point",
      coordinates: [80.6400, 16.5055],
    },
    isOpen: true,
  },

  {
    name: "Domino's Vijayawada",
    cuisine: "Pizza",
    rating: 4.3,
    address: "Patamata, Vijayawada",
    location: {
      type: "Point",
      coordinates: [80.6677, 16.4901],
    },
    isOpen: true,
  },

  /* ================= GUNTUR ================= */

  {
    name: "Paradise Guntur",
    cuisine: "Biryani",
    rating: 4.5,
    address: "Brodipet, Guntur",
    location: {
      type: "Point",
      coordinates: [80.4365, 16.3067],
    },
    isOpen: true,
  },

  {
    name: "Hotel Swagruha",
    cuisine: "South Indian",
    rating: 4.4,
    address: "Arundelpet, Guntur",
    location: {
      type: "Point",
      coordinates: [80.4400, 16.2990],
    },
    isOpen: true,
  },

  {
    name: "Domino's Guntur",
    cuisine: "Pizza",
    rating: 4.2,
    address: "Lakshmipuram, Guntur",
    location: {
      type: "Point",
      coordinates: [80.4250, 16.3122],
    },
    isOpen: true,
  },

  {
    name: "KFC Guntur",
    cuisine: "Burgers",
    rating: 4.1,
    address: "Pattabhipuram, Guntur",
    location: {
      type: "Point",
      coordinates: [80.4200, 16.3200],
    },
    isOpen: true,
  },

  {
    name: "Bawarchi Guntur",
    cuisine: "Biryani",
    rating: 4.6,
    address: "Brindavan Gardens, Guntur",
    location: {
      type: "Point",
      coordinates: [80.4500, 16.3100],
    },
    isOpen: true,
  },
];

/* ─────────────────────────────────────────────
   MENUS
───────────────────────────────────────────── */

const MENUS = {

  "Murugan Idli Shop": [
    {
      name: "Mini Idli",
      price: 60,
      category: "Main Course",
      description: "Soft mini idlis with chutney",
    },

    {
      name: "Dosa",
      price: 80,
      category: "Main Course",
      description: "Crispy dosa with sambar",
    },

    {
      name: "Filter Coffee",
      price: 30,
      category: "Beverages",
      description: "South Indian coffee",
    },
  ],

  "Paradise Vijayawada": [
    {
      name: "Chicken Biryani",
      price: 240,
      category: "Main Course",
      description: "Special Vijayawada spicy biryani",
    },

    {
      name: "Mutton Biryani",
      price: 320,
      category: "Main Course",
      description: "Hyderabadi dum biryani",
    },

    {
      name: "Double Ka Meetha",
      price: 90,
      category: "Desserts",
      description: "Famous Hyderabadi dessert",
    },
  ],

  "RR Durbar": [
    {
      name: "Special Chicken Biryani",
      price: 260,
      category: "Main Course",
      description: "RR Durbar special biryani",
    },

    {
      name: "Apollo Fish",
      price: 220,
      category: "Starters",
      description: "Spicy fish starter",
    },

    {
      name: "Cool Drinks",
      price: 50,
      category: "Beverages",
      description: "Cold beverages",
    },
  ],

  "Sweet Magic": [
    {
      name: "Chocolate Ice Cream",
      price: 120,
      category: "Desserts",
      description: "Creamy chocolate delight",
    },

    {
      name: "Brownie",
      price: 140,
      category: "Desserts",
      description: "Hot chocolate brownie",
    },
  ],

  "Paradise Guntur": [
    {
      name: "Chicken Dum Biryani",
      price: 230,
      category: "Main Course",
      description: "Authentic dum biryani",
    },

    {
      name: "Chicken 65",
      price: 190,
      category: "Starters",
      description: "Spicy fried chicken",
    },
  ],
};

/* ─────────────────────────────────────────────
   DEFAULT MENU
───────────────────────────────────────────── */

const DEFAULT_MENU = [
  {
    name: "Chef Special",
    price: 250,
    category: "Main Course",
    description: "Chef special food",
  },

  {
    name: "Veg Starter",
    price: 120,
    category: "Starters",
    description: "Mixed veg starter",
  },

  {
    name: "Ice Cream",
    price: 80,
    category: "Desserts",
    description: "Vanilla ice cream",
  },

  {
    name: "Cool Drinks",
    price: 40,
    category: "Beverages",
    description: "Cold soft drink",
  },
];

/* ─────────────────────────────────────────────
   SEED FUNCTION
───────────────────────────────────────────── */

async function seed() {

  try {

    console.log("🌱 Connecting MongoDB...");

    await mongoose.connect(process.env.MONGO_URI);

    console.log("✅ MongoDB Connected");

    /* ================= USERS ================= */

    let owner = await User.findOne({
      email: "owner@foodrush.com",
    });

    if (!owner) {

      const hashed = await bcrypt.hash("owner123", 10);

      owner = await User.create({
        name: "Restaurant Owner",
        email: "owner@foodrush.com",
        password: hashed,
        role: "restaurant",
      });

      console.log("✅ Owner account created");
    }

    let customer = await User.findOne({
      email: "customer@foodrush.com",
    });

    if (!customer) {

      const hashed = await bcrypt.hash("customer123", 10);

      customer = await User.create({
        name: "Test Customer",
        email: "customer@foodrush.com",
        password: hashed,
        role: "consumer",
      });

      console.log("✅ Customer account created");
    }

    /* ================= CLEAR OLD DATA ================= */

    console.log("🗑 Clearing old restaurants...");

    await Restaurant.deleteMany({});
    await MenuItem.deleteMany({});

    /* ================= INSERT RESTAURANTS ================= */

    for (const restData of RESTAURANTS) {

      const restaurant = await Restaurant.create({
        ...restData,
        ownerId: owner._id,
      });

      const menuItems =
        MENUS[restData.name] || DEFAULT_MENU;

      const items = menuItems.map((item) => ({
        ...item,
        restaurantId: restaurant._id,
        available: true,
      }));

      await MenuItem.insertMany(items);

      console.log(`✅ ${restaurant.name} (${items.length} items)`);
    }

    console.log("\n🎉 Database Seeding Complete!");
    console.log("────────────────────────────");

    console.log("\n📍 Cities Added:");
    console.log("• Chennai");
    console.log("• Vijayawada");
    console.log("• Guntur");

    console.log("\n👤 Demo Accounts:");
    console.log("Customer → customer@foodrush.com / customer123");
    console.log("Owner    → owner@foodrush.com / owner123");

    console.log("\n🚀 Restaurants + Menus added successfully");

    process.exit(0);

  } catch (err) {

    console.error("❌ Seed Failed:", err);

    process.exit(1);
  }
}

seed();
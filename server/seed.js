const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Restaurant = require('./models/Restaurant');
const MenuItem = require('./models/MenuItem');
const User = require('./models/User');

const restaurants = [
  {
    name: 'Murugan Idli Shop',
    cuisine: 'South Indian',
    rating: 4.5,
    address: 'Tambaram, Chennai',
    location: { type: 'Point', coordinates: [80.1214, 12.9249] } // [lng, lat]
  },
  {
    name: 'Saravana Bhavan',
    cuisine: 'South Indian',
    rating: 4.3,
    address: 'Guindy, Chennai',
    location: { type: 'Point', coordinates: [80.2127, 13.0100] }
  },
  {
    name: 'Buhari Hotel',
    cuisine: 'Mughlai',
    rating: 4.1,
    address: 'Anna Salai, Chennai',
    location: { type: 'Point', coordinates: [80.2450, 13.0524] }
  },
  {
    name: 'Ponnusamy Hotel',
    cuisine: 'Chettinad',
    rating: 4.4,
    address: 'Vadapalani, Chennai',
    location: { type: 'Point', coordinates: [80.2121, 13.0510] }
  },
  {
    name: 'Junior Kuppanna',
    cuisine: 'Chettinad',
    rating: 4.2,
    address: 'Anna Nagar, Chennai',
    location: { type: 'Point', coordinates: [80.2101, 13.0850] }
  },
  {
    name: 'Ratna Cafe',
    cuisine: 'South Indian',
    rating: 4.6,
    address: 'Triplicane, Chennai',
    location: { type: 'Point', coordinates: [80.2797, 13.0604] }
  },
  {
    name: 'Dindigul Thalappakatti',
    cuisine: 'Biryani',
    rating: 4.5,
    address: 'Velachery, Chennai',
    location: { type: 'Point', coordinates: [80.2181, 12.9830] }
  },
  {
    name: 'Zaitoon Restaurant',
    cuisine: 'North Indian',
    rating: 4.0,
    address: 'Porur, Chennai',
    location: { type: 'Point', coordinates: [80.1578, 13.0357] }
  }
];

const menuTemplates = {
  'South Indian': [
    { name: 'Idli (2 pieces)', price: 40, category: 'Breakfast' },
    { name: 'Masala Dosa', price: 80, category: 'Breakfast' },
    { name: 'Vada (2 pieces)', price: 50, category: 'Breakfast' },
    { name: 'Pongal', price: 60, category: 'Breakfast' },
    { name: 'Filter Coffee', price: 30, category: 'Beverages' },
    { name: 'Sambar Rice', price: 90, category: 'Lunch' },
    { name: 'Curd Rice', price: 70, category: 'Lunch' }
  ],
  'Mughlai': [
    { name: 'Chicken Biryani', price: 220, category: 'Main' },
    { name: 'Mutton Biryani', price: 280, category: 'Main' },
    { name: 'Chicken Tikka', price: 180, category: 'Starters' },
    { name: 'Butter Naan', price: 40, category: 'Breads' },
    { name: 'Raita', price: 40, category: 'Sides' }
  ],
  'Chettinad': [
    { name: 'Chettinad Chicken Curry', price: 200, category: 'Main' },
    { name: 'Mutton Kola Urundai', price: 160, category: 'Starters' },
    { name: 'Kavuni Arisi Payasam', price: 80, category: 'Desserts' },
    { name: 'Idiyappam', price: 60, category: 'Main' },
    { name: 'Appam', price: 50, category: 'Main' }
  ],
  'Biryani': [
    { name: 'Dindigul Chicken Biryani', price: 200, category: 'Main' },
    { name: 'Mutton Biryani', price: 280, category: 'Main' },
    { name: 'Egg Biryani', price: 150, category: 'Main' },
    { name: 'Salna', price: 60, category: 'Sides' },
    { name: 'Raita', price: 40, category: 'Sides' }
  ],
  'North Indian': [
    { name: 'Butter Chicken', price: 220, category: 'Main' },
    { name: 'Palak Paneer', price: 180, category: 'Main' },
    { name: 'Garlic Naan', price: 50, category: 'Breads' },
    { name: 'Dal Makhani', price: 160, category: 'Main' },
    { name: 'Mango Lassi', price: 80, category: 'Beverages' }
  ]
};

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Restaurant.deleteMany({});
    await MenuItem.deleteMany({});
    console.log('Cleared existing restaurants and menu items');

    // Create a dummy restaurant owner user if not exists
    let owner = await User.findOne({ email: 'owner@test.com' });
    if (!owner) {
      const bcrypt = require('bcryptjs');
      owner = await User.create({
        name: 'Restaurant Owner',
        email: 'owner@test.com',
        password: await bcrypt.hash('password123', 10),
        role: 'restaurant'
      });
    }

    // Insert restaurants
    for (const rest of restaurants) {
      const created = await Restaurant.create({ ...rest, ownerId: owner._id });
      console.log(`Created restaurant: ${created.name}`);

      // Add menu items based on cuisine type
      const menuItems = menuTemplates[rest.cuisine] || menuTemplates['South Indian'];
      for (const item of menuItems) {
        await MenuItem.create({
          restaurantId: created._id,
          ...item,
          description: `${item.name} — freshly prepared`
        });
      }
      console.log(`  Added ${menuItems.length} menu items`);
    }

    console.log('\nSeeding complete!');
    console.log('Test user: owner@test.com / password123 (role: restaurant)');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err.message);
    process.exit(1);
  }
}

seed();

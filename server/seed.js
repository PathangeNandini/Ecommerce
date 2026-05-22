// server/seed.js — Run: node seed.js
// Seeds 50 restaurants × 12 menu items = 600+ records

require('dotenv').config();
const mongoose = require('mongoose');

const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');
};

const restaurantSchema = new mongoose.Schema({
  name: String, cuisine: String, rating: Number, address: String,
  location: { type: { type: String, enum: ['Point'] }, coordinates: [Number] },
  isOpen: Boolean, ownerId: mongoose.Schema.Types.ObjectId
}, { timestamps: true });
restaurantSchema.index({ location: '2dsphere' });

const menuItemSchema = new mongoose.Schema({
  restaurantId: mongoose.Schema.Types.ObjectId,
  name: String, description: String, price: Number,
  category: String, available: Boolean
}, { timestamps: true });

const userSchema = new mongoose.Schema({
  name: String, email: String, password: String, role: String, loyaltyPoints: Number
}, { timestamps: true });

const Restaurant = mongoose.models.Restaurant || mongoose.model('Restaurant', restaurantSchema);
const MenuItem   = mongoose.models.MenuItem   || mongoose.model('MenuItem', menuItemSchema);
const User       = mongoose.models.User       || mongoose.model('User', userSchema);

// 20 different Chennai area coordinates
const areas = [
  { area: 'Tambaram',       lat: 12.9249, lng: 80.1147 },
  { area: 'Chromepet',      lat: 12.9516, lng: 80.1462 },
  { area: 'Pallavaram',     lat: 12.9675, lng: 80.1491 },
  { area: 'Vandalur',       lat: 12.8891, lng: 80.0824 },
  { area: 'Perungalathur',  lat: 12.9042, lng: 80.0889 },
  { area: 'T Nagar',        lat: 13.0418, lng: 80.2341 },
  { area: 'Anna Nagar',     lat: 13.0891, lng: 80.2098 },
  { area: 'Adyar',          lat: 13.0012, lng: 80.2565 },
  { area: 'Velachery',      lat: 12.9815, lng: 80.2180 },
  { area: 'Porur',          lat: 13.0358, lng: 80.1567 },
  { area: 'Perambur',       lat: 13.1132, lng: 80.2421 },
  { area: 'Sholinganallur', lat: 12.9010, lng: 80.2279 },
  { area: 'OMR',            lat: 12.8654, lng: 80.2275 },
  { area: 'Perungudi',      lat: 12.9601, lng: 80.2458 },
  { area: 'Guindy',         lat: 13.0067, lng: 80.2206 },
  { area: 'Mylapore',       lat: 13.0368, lng: 80.2676 },
  { area: 'Royapettah',     lat: 13.0524, lng: 80.2602 },
  { area: 'Nungambakkam',   lat: 13.0569, lng: 80.2425 },
  { area: 'Kodambakkam',    lat: 13.0490, lng: 80.2271 },
  { area: 'Ambattur',       lat: 13.1143, lng: 80.1548 },
];

const restaurants = [
  { name: 'Murugan Idli Shop',         cuisine: 'South Indian',  rating: 4.5 },
  { name: 'Saravana Bhavan',           cuisine: 'South Indian',  rating: 4.4 },
  { name: 'Ratna Cafe',                cuisine: 'South Indian',  rating: 4.3 },
  { name: 'Vasanta Bhavan',            cuisine: 'South Indian',  rating: 4.1 },
  { name: 'Sri Krishna Bhavan',        cuisine: 'South Indian',  rating: 4.0 },
  { name: 'Mylai Karpagambal Mess',    cuisine: 'South Indian',  rating: 4.6 },
  { name: 'Dindigul Thalappakatti',    cuisine: 'Biryani',       rating: 4.6 },
  { name: 'Buhari Hotel',              cuisine: 'Biryani',       rating: 4.2 },
  { name: 'Junior Kuppanna',           cuisine: 'Biryani',       rating: 4.4 },
  { name: 'Ponnusamy Hotel',           cuisine: 'Biryani',       rating: 4.3 },
  { name: 'Paradise Biryani',          cuisine: 'Biryani',       rating: 4.5 },
  { name: 'Bawarchi Restaurant',       cuisine: 'Biryani',       rating: 4.2 },
  { name: 'Anjappar Chettinad',        cuisine: 'Chettinad',     rating: 4.3 },
  { name: 'Karaikudi Restaurant',      cuisine: 'Chettinad',     rating: 4.1 },
  { name: 'Bangala Table',             cuisine: 'Chettinad',     rating: 4.5 },
  { name: 'Chettinad Mess',            cuisine: 'Chettinad',     rating: 4.0 },
  { name: 'Pizza Hut',                 cuisine: 'Fast Food',     rating: 3.9 },
  { name: "Domino's Pizza",            cuisine: 'Fast Food',     rating: 4.0 },
  { name: "McDonald's",                cuisine: 'Fast Food',     rating: 3.8 },
  { name: 'KFC',                       cuisine: 'Fast Food',     rating: 3.9 },
  { name: 'Burger King',               cuisine: 'Fast Food',     rating: 3.8 },
  { name: 'Subway',                    cuisine: 'Fast Food',     rating: 3.7 },
  { name: 'Mainland China',            cuisine: 'Chinese',       rating: 4.2 },
  { name: 'Wok Express',               cuisine: 'Chinese',       rating: 4.0 },
  { name: 'Yo China',                  cuisine: 'Chinese',       rating: 3.8 },
  { name: 'Chinese Hut',               cuisine: 'Chinese',       rating: 3.9 },
  { name: 'Copper Chimney',            cuisine: 'North Indian',  rating: 4.3 },
  { name: 'Punjabi Dhaba',             cuisine: 'North Indian',  rating: 4.1 },
  { name: 'Tandoor Garden',            cuisine: 'North Indian',  rating: 4.0 },
  { name: 'Rajdhani Thali',            cuisine: 'North Indian',  rating: 4.2 },
  { name: 'Peshawri',                  cuisine: 'North Indian',  rating: 4.4 },
  { name: 'Zaitoon Restaurant',        cuisine: 'Seafood',       rating: 4.4 },
  { name: 'Marina Fish Corner',        cuisine: 'Seafood',       rating: 4.2 },
  { name: 'Kaaraikudi Fish House',     cuisine: 'Seafood',       rating: 4.3 },
  { name: 'Hot Breads',                cuisine: 'Bakery',        rating: 4.0 },
  { name: 'Nilgiris Bakery',           cuisine: 'Bakery',        rating: 3.9 },
  { name: 'Bread & Circus',            cuisine: 'Cafe',          rating: 4.3 },
  { name: 'The Brew Room',             cuisine: 'Cafe',          rating: 4.2 },
  { name: 'Adyar Ananda Bhavan',       cuisine: 'Sweets',        rating: 4.4 },
  { name: 'Kalathi Sweets',            cuisine: 'Sweets',        rating: 4.2 },
  { name: 'Cream Stone Ice Cream',     cuisine: 'Desserts',      rating: 4.1 },
  { name: 'The Flying Elephant',       cuisine: 'Continental',   rating: 4.5 },
  { name: 'Tuscana Pizzeria',          cuisine: 'Italian',       rating: 4.2 },
  { name: 'Savya Rasa',                cuisine: 'South Indian',  rating: 4.6 },
  { name: 'Dakshin',                   cuisine: 'South Indian',  rating: 4.5 },
  { name: 'Southern Spice',            cuisine: 'South Indian',  rating: 4.4 },
  { name: 'Hyderabad Biryani House',   cuisine: 'Biryani',       rating: 4.1 },
  { name: 'The Great Kabab Factory',   cuisine: 'North Indian',  rating: 4.3 },
  { name: 'Barbeque Nation',           cuisine: 'Multi Cuisine', rating: 4.4 },
  { name: 'The Tamil Nadu Restaurant', cuisine: 'South Indian',  rating: 4.2 },
];

const menuByCuisine = {
  'South Indian': [
    { name: 'Idli (2 pcs)',        price: 40,  category: 'Breakfast',  description: 'Soft steamed rice cakes with sambar and chutney' },
    { name: 'Masala Dosa',         price: 70,  category: 'Breakfast',  description: 'Crispy rice crepe stuffed with spiced potato' },
    { name: 'Plain Dosa',          price: 50,  category: 'Breakfast',  description: 'Thin crispy rice crepe with sambar and chutney' },
    { name: 'Rava Dosa',           price: 80,  category: 'Breakfast',  description: 'Crispy semolina crepe with onions and chillies' },
    { name: 'Pongal',              price: 60,  category: 'Breakfast',  description: 'Comfort rice and lentil dish with ghee and pepper' },
    { name: 'Medu Vada (2 pcs)',   price: 50,  category: 'Breakfast',  description: 'Crispy fried lentil donuts with sambar and chutney' },
    { name: 'Uttapam',             price: 65,  category: 'Breakfast',  description: 'Thick rice pancake with onions and tomatoes' },
    { name: 'Mini Tiffin',         price: 90,  category: 'Combo',      description: '2 idli + 1 vada + 1 dosa with sambar' },
    { name: 'Full Meals',          price: 150, category: 'Meals',      description: 'Rice, sambar, rasam, 3 vegetables, papad, pickle' },
    { name: 'Filter Coffee',       price: 25,  category: 'Beverages',  description: 'Strong aromatic South Indian filter coffee' },
    { name: 'Paneer Dosa',         price: 90,  category: 'Breakfast',  description: 'Crispy dosa stuffed with spiced paneer' },
    { name: 'Sambar Vada',         price: 60,  category: 'Breakfast',  description: 'Vada soaked in rich sambar' },
  ],
  'Biryani': [
    { name: 'Chicken Biryani',     price: 180, category: 'Biryani',    description: 'Aromatic basmati with tender chicken and spices' },
    { name: 'Mutton Biryani',      price: 220, category: 'Biryani',    description: 'Slow-cooked mutton with fragrant basmati rice' },
    { name: 'Veg Biryani',         price: 130, category: 'Biryani',    description: 'Flavourful basmati with mixed vegetables' },
    { name: 'Egg Biryani',         price: 150, category: 'Biryani',    description: 'Biryani with perfectly spiced boiled eggs' },
    { name: 'Prawn Biryani',       price: 250, category: 'Biryani',    description: 'Juicy prawns cooked with aromatic biryani rice' },
    { name: 'Chicken 65',          price: 180, category: 'Starters',   description: 'Spicy deep-fried chicken — a Chennai classic' },
    { name: 'Mutton Chops',        price: 220, category: 'Starters',   description: 'Tender mutton chops grilled to perfection' },
    { name: 'Raita',               price: 40,  category: 'Sides',      description: 'Cooling yogurt with cucumber and spices' },
    { name: 'Salna',               price: 50,  category: 'Sides',      description: 'Spicy gravy perfect with parotta or biryani' },
    { name: 'Lassi',               price: 60,  category: 'Beverages',  description: 'Chilled yogurt drink — sweet or salted' },
    { name: 'Family Pack Biryani', price: 550, category: 'Family',     description: 'Biryani for 4 — chicken or veg' },
    { name: 'Double Ka Meetha',    price: 80,  category: 'Desserts',   description: 'Hyderabadi bread pudding with rabri' },
  ],
  'Chettinad': [
    { name: 'Chettinad Chicken Curry', price: 220, category: 'Main Course', description: 'Bold spicy chicken curry with freshly ground spices' },
    { name: 'Kuzhi Paniyaram',         price: 80,  category: 'Snacks',      description: 'Soft rice dumplings — sweet or savoury' },
    { name: 'Chettinad Mutton Curry',  price: 260, category: 'Main Course', description: 'Rich mutton curry with Chettinad masala' },
    { name: 'Kavuni Arisi Payasam',    price: 80,  category: 'Desserts',    description: 'Black rice kheer — a Chettinad specialty' },
    { name: 'Appam with Stew',         price: 90,  category: 'Breakfast',   description: 'Lacy rice hoppers with vegetable stew' },
    { name: 'Nandu Rasam',             price: 120, category: 'Soups',       description: 'Crab rasam — tangy and spicy' },
    { name: 'Parotta',                 price: 30,  category: 'Breads',      description: 'Flaky layered flatbread — 2 pieces' },
    { name: 'Idiappam',                price: 60,  category: 'Breakfast',   description: 'String hoppers with coconut milk or stew' },
    { name: 'Kozhi Varuval',           price: 200, category: 'Starters',    description: 'Dry-fried chicken with Chettinad spices' },
    { name: 'Vellai Paniyaram',        price: 70,  category: 'Snacks',      description: 'White rice dumplings with coconut chutney' },
    { name: 'Chettinad Fish Curry',    price: 240, category: 'Main Course', description: 'Tangy tamarind-based fish curry' },
    { name: 'Sol Kadhi',               price: 50,  category: 'Beverages',   description: 'Cooling kokum and coconut milk drink' },
  ],
  'Fast Food': [
    { name: 'Margherita Pizza (M)', price: 299, category: 'Pizza',     description: 'Classic tomato sauce with mozzarella' },
    { name: 'Pepperoni Pizza (M)',  price: 349, category: 'Pizza',     description: 'Pepperoni slices on rich tomato sauce' },
    { name: 'Veg Supreme (M)',      price: 329, category: 'Pizza',     description: 'Loaded with fresh vegetables' },
    { name: 'Chicken Wings (6)',    price: 199, category: 'Starters',  description: 'Crispy fried chicken wings with dipping sauce' },
    { name: 'Veg Burger',           price: 99,  category: 'Burgers',   description: 'Crispy veg patty with lettuce and sauce' },
    { name: 'Chicken Burger',       price: 129, category: 'Burgers',   description: 'Juicy chicken patty with special sauce' },
    { name: 'French Fries (R)',     price: 69,  category: 'Sides',     description: 'Golden crispy fries with ketchup' },
    { name: 'Garlic Bread',         price: 99,  category: 'Sides',     description: 'Toasted bread with garlic butter' },
    { name: 'Chocolate Lava Cake',  price: 129, category: 'Desserts',  description: 'Warm chocolate cake with molten centre' },
    { name: 'Pepsi (L)',            price: 60,  category: 'Beverages', description: 'Chilled Pepsi — large' },
    { name: 'Pasta Arabiata',       price: 199, category: 'Pasta',     description: 'Penne in spicy tomato sauce' },
    { name: 'Stuffed Garlic Bread', price: 149, category: 'Sides',     description: 'Garlic bread stuffed with cheese and veggies' },
  ],
  'Chinese': [
    { name: 'Veg Fried Rice',       price: 130, category: 'Rice',      description: 'Wok-tossed rice with fresh vegetables' },
    { name: 'Chicken Fried Rice',   price: 160, category: 'Rice',      description: 'Smoky wok-fried rice with chicken pieces' },
    { name: 'Hakka Noodles',        price: 140, category: 'Noodles',   description: 'Stir-fried noodles with vegetables and soy' },
    { name: 'Chicken Manchurian',   price: 180, category: 'Starters',  description: 'Crispy chicken in tangy Manchurian sauce' },
    { name: 'Gobi Manchurian',      price: 150, category: 'Starters',  description: 'Crispy cauliflower in spicy Manchurian sauce' },
    { name: 'Spring Rolls (4)',     price: 120, category: 'Starters',  description: 'Crispy rolls stuffed with vegetables' },
    { name: 'Dim Sum (4 pcs)',      price: 140, category: 'Starters',  description: 'Steamed dumplings with dipping sauce' },
    { name: 'Schezwan Fried Rice',  price: 160, category: 'Rice',      description: 'Spicy Schezwan sauce fried rice' },
    { name: 'Hot and Sour Soup',    price: 100, category: 'Soups',     description: 'Tangy and spicy Chinese soup' },
    { name: 'Kung Pao Chicken',     price: 200, category: 'Mains',     description: 'Spicy chicken with peanuts and vegetables' },
    { name: 'Honey Chilli Potato',  price: 130, category: 'Starters',  description: 'Crispy potato fingers in sweet chilli sauce' },
    { name: 'Dragon Chicken',       price: 210, category: 'Mains',     description: 'Spicy chicken in red chilli sauce' },
  ],
  'North Indian': [
    { name: 'Butter Chicken',       price: 280, category: 'Mains',     description: 'Tender chicken in rich tomato-butter gravy' },
    { name: 'Paneer Butter Masala', price: 240, category: 'Mains',     description: 'Soft paneer in creamy tomato gravy' },
    { name: 'Dal Makhani',          price: 180, category: 'Mains',     description: 'Slow-cooked black lentils in buttery gravy' },
    { name: 'Naan',                 price: 40,  category: 'Breads',    description: 'Soft leavened bread from the tandoor' },
    { name: 'Tandoori Roti',        price: 30,  category: 'Breads',    description: 'Whole wheat bread from the tandoor' },
    { name: 'Chicken Tikka',        price: 280, category: 'Starters',  description: 'Marinated chicken grilled in tandoor' },
    { name: 'Seekh Kebab',          price: 260, category: 'Starters',  description: 'Minced meat kebabs grilled on skewers' },
    { name: 'Palak Paneer',         price: 220, category: 'Mains',     description: 'Paneer in creamy spinach gravy' },
    { name: 'Rajma Chawal',         price: 160, category: 'Combo',     description: 'Kidney bean curry with steamed basmati rice' },
    { name: 'Jeera Rice',           price: 120, category: 'Rice',      description: 'Fragrant cumin-tempered basmati rice' },
    { name: 'Gulab Jamun (2 pcs)',  price: 80,  category: 'Desserts',  description: 'Soft milk solid balls in rose sugar syrup' },
    { name: 'Lassi',                price: 70,  category: 'Beverages', description: 'Thick yogurt drink — sweet or salty' },
  ],
  'Seafood': [
    { name: 'Grilled Fish',         price: 320, category: 'Mains',     description: 'Fresh fish grilled with herbs and spices' },
    { name: 'Prawn Masala',         price: 350, category: 'Mains',     description: 'Juicy prawns in spicy masala gravy' },
    { name: 'Fish Fry',             price: 280, category: 'Starters',  description: 'Crispy fried fish with mint chutney' },
    { name: 'Crab Curry',           price: 420, category: 'Mains',     description: 'Fresh crab in rich coconut-based curry' },
    { name: 'Prawn Biryani',        price: 280, category: 'Biryani',   description: 'Aromatic biryani with fresh prawns' },
    { name: 'Calamari Rings',       price: 220, category: 'Starters',  description: 'Crispy fried squid rings with aioli' },
    { name: 'Clam Masala',          price: 260, category: 'Mains',     description: 'Spicy clam curry with coconut milk' },
    { name: 'Coconut Rice',         price: 80,  category: 'Rice',      description: 'Fragrant rice cooked with coconut' },
    { name: 'Rasam',                price: 60,  category: 'Soups',     description: 'Tangy and peppery South Indian soup' },
    { name: 'Fish Tacos',           price: 180, category: 'Snacks',    description: 'Crispy fish in soft tortillas with slaw' },
    { name: 'Lobster Thermidor',    price: 850, category: 'Mains',     description: 'Lobster in rich cream sauce — premium dish' },
    { name: 'Buttermilk',           price: 30,  category: 'Beverages', description: 'Chilled spiced buttermilk' },
  ],
  'Bakery': [
    { name: 'Croissant',            price: 60,  category: 'Pastry',    description: 'Flaky buttery French croissant' },
    { name: 'Chocolate Cake',       price: 80,  category: 'Cakes',     description: 'Rich moist chocolate cake slice' },
    { name: 'Bread Loaf',           price: 45,  category: 'Breads',    description: 'Fresh baked white sandwich bread' },
    { name: 'Whole Wheat Bread',    price: 55,  category: 'Breads',    description: 'Healthy whole wheat loaf' },
    { name: 'Cream Puffs (3)',      price: 90,  category: 'Pastry',    description: 'Light pastry filled with cream' },
    { name: 'Danish Pastry',        price: 70,  category: 'Pastry',    description: 'Flaky pastry with fruit filling' },
    { name: 'Banana Bread',         price: 80,  category: 'Breads',    description: 'Moist banana bread with walnuts' },
    { name: 'Red Velvet Cake',      price: 100, category: 'Cakes',     description: 'Classic red velvet with cream cheese frosting' },
    { name: 'Blueberry Muffin',     price: 70,  category: 'Pastry',    description: 'Soft muffin loaded with blueberries' },
    { name: 'Cappuccino',           price: 80,  category: 'Beverages', description: 'Espresso with steamed milk foam' },
    { name: 'Fresh Orange Juice',   price: 60,  category: 'Beverages', description: 'Freshly squeezed orange juice' },
    { name: 'Cheese Straws',        price: 60,  category: 'Snacks',    description: 'Crispy baked cheese pastry sticks' },
  ],
  'Cafe': [
    { name: 'Flat White',           price: 120, category: 'Coffee',    description: 'Espresso with velvety steamed milk' },
    { name: 'Avocado Toast',        price: 180, category: 'Breakfast', description: 'Toasted sourdough with smashed avocado' },
    { name: 'Eggs Benedict',        price: 220, category: 'Breakfast', description: 'Poached eggs on English muffin with hollandaise' },
    { name: 'Club Sandwich',        price: 200, category: 'Sandwiches',description: 'Triple-decker sandwich with chicken' },
    { name: 'Caesar Salad',         price: 180, category: 'Salads',    description: 'Romaine lettuce with caesar dressing' },
    { name: 'Cheesecake',           price: 150, category: 'Desserts',  description: 'New York style baked cheesecake' },
    { name: 'Cold Brew Coffee',     price: 140, category: 'Coffee',    description: '18-hour cold-steeped smooth coffee' },
    { name: 'Matcha Latte',         price: 130, category: 'Beverages', description: 'Japanese matcha with steamed milk' },
    { name: 'Smoothie Bowl',        price: 170, category: 'Breakfast', description: 'Thick smoothie topped with fresh fruits' },
    { name: 'Pasta Primavera',      price: 220, category: 'Mains',     description: 'Fresh pasta with spring vegetables' },
    { name: 'Tiramisu',             price: 160, category: 'Desserts',  description: 'Classic Italian coffee dessert' },
    { name: 'Granola Bowl',         price: 160, category: 'Breakfast', description: 'Homemade granola with berries and yogurt' },
  ],
  'Sweets': [
    { name: 'Kaju Katli (250g)',    price: 180, category: 'Sweets',    description: 'Premium cashew fudge — festive favourite' },
    { name: 'Gulab Jamun (500g)',   price: 120, category: 'Sweets',    description: 'Soft milk solid balls in sugar syrup' },
    { name: 'Halwa',                price: 80,  category: 'Sweets',    description: 'Rich semolina or carrot halwa' },
    { name: 'Rasgulla (6 pcs)',     price: 90,  category: 'Sweets',    description: 'Spongy cottage cheese balls in syrup' },
    { name: 'Mysore Pak',           price: 100, category: 'Sweets',    description: 'Rich gram flour and ghee sweet' },
    { name: 'Ladoo (250g)',         price: 120, category: 'Sweets',    description: 'Round sweet balls — besan or boondi' },
    { name: 'Kheer',                price: 60,  category: 'Desserts',  description: 'Creamy rice pudding with nuts and saffron' },
    { name: 'Jangiri (250g)',       price: 100, category: 'Sweets',    description: 'Crispy funnel cake in sugar syrup' },
    { name: 'Palkova (250g)',       price: 140, category: 'Sweets',    description: 'Thick milk fudge — Tamil Nadu specialty' },
    { name: 'Badam Halwa (250g)',   price: 200, category: 'Sweets',    description: 'Rich almond halwa with saffron' },
    { name: 'Rose Milk',            price: 40,  category: 'Beverages', description: 'Chilled rose-flavoured milk' },
    { name: 'Payasam',              price: 70,  category: 'Desserts',  description: 'South Indian kheer — rice or vermicelli' },
  ],
  'Desserts': [
    { name: 'Chocolate Sundae',     price: 120, category: 'Ice Cream', description: 'Vanilla ice cream with hot chocolate sauce' },
    { name: 'Brownie + Ice Cream',  price: 150, category: 'Desserts',  description: 'Warm fudgy brownie with vanilla ice cream' },
    { name: 'Mango Kulfi',          price: 80,  category: 'Ice Cream', description: 'Traditional Indian ice cream with mango' },
    { name: 'Waffle',               price: 160, category: 'Waffles',   description: 'Crispy waffle with toppings of your choice' },
    { name: 'Milkshake',            price: 120, category: 'Beverages', description: 'Thick creamy milkshake — multiple flavours' },
    { name: 'Banana Split',         price: 180, category: 'Ice Cream', description: 'Classic banana split with 3 scoops' },
    { name: 'Churros + Chocolate',  price: 130, category: 'Desserts',  description: 'Crispy fried dough with chocolate dip' },
    { name: 'Fruit Parfait',        price: 120, category: 'Desserts',  description: 'Layers of yogurt, granola and fresh fruits' },
    { name: 'Hot Chocolate',        price: 100, category: 'Beverages', description: 'Rich creamy hot chocolate' },
    { name: 'Bubble Tea',           price: 130, category: 'Beverages', description: 'Taiwanese milk tea with tapioca pearls' },
    { name: 'Crepe',                price: 140, category: 'Crepes',    description: 'Thin French pancake with sweet filling' },
    { name: 'Crème Brûlée',        price: 160, category: 'Desserts',  description: 'French custard with caramel top' },
  ],
  'Continental': [
    { name: 'Grilled Chicken',      price: 280, category: 'Mains',     description: 'Herb-marinated grilled chicken breast' },
    { name: 'Fish and Chips',       price: 260, category: 'Mains',     description: 'Battered fish with crispy chips' },
    { name: 'French Onion Soup',    price: 180, category: 'Soups',     description: 'Classic caramelised onion soup with crouton' },
    { name: 'Coq au Vin',          price: 420, category: 'Mains',     description: 'Chicken braised in red wine with mushrooms' },
    { name: 'Bruschetta',           price: 140, category: 'Starters',  description: 'Toasted bread with tomato and basil' },
    { name: 'Caesar Salad',         price: 180, category: 'Salads',    description: 'Romaine with caesar dressing and croutons' },
    { name: 'Cheese Board',         price: 320, category: 'Sharing',   description: 'Selection of artisan cheeses with crackers' },
    { name: 'Crème Brûlée',        price: 180, category: 'Desserts',  description: 'Vanilla custard with caramelised sugar top' },
    { name: 'Risotto',              price: 240, category: 'Mains',     description: 'Creamy Italian rice with mushrooms' },
    { name: 'Tiramisu',             price: 180, category: 'Desserts',  description: 'Classic coffee and mascarpone dessert' },
    { name: 'Mojito (Virgin)',      price: 120, category: 'Beverages', description: 'Fresh mint and lime mocktail' },
    { name: 'Garlic Prawns',        price: 320, category: 'Starters',  description: 'Sautéed prawns in garlic butter sauce' },
  ],
  'Italian': [
    { name: 'Spaghetti Carbonara',  price: 280, category: 'Pasta',     description: 'Creamy pasta with pancetta and egg' },
    { name: 'Penne Arabiata',       price: 240, category: 'Pasta',     description: 'Penne in spicy tomato sauce' },
    { name: 'Lasagne',              price: 300, category: 'Mains',     description: 'Layered pasta with meat sauce and bechamel' },
    { name: 'Bruschetta',           price: 140, category: 'Starters',  description: 'Toasted bread with tomato and basil' },
    { name: 'Caprese Salad',        price: 180, category: 'Salads',    description: 'Fresh mozzarella, tomato and basil' },
    { name: 'Tiramisu',             price: 180, category: 'Desserts',  description: 'Classic Italian coffee and mascarpone dessert' },
    { name: 'Focaccia',             price: 120, category: 'Breads',    description: 'Herb-topped Italian flatbread' },
    { name: 'Minestrone Soup',      price: 140, category: 'Soups',     description: 'Hearty Italian vegetable soup' },
    { name: 'Gnocchi',              price: 260, category: 'Pasta',     description: 'Potato dumplings in tomato or cream sauce' },
    { name: 'Cannoli',              price: 150, category: 'Desserts',  description: 'Crispy pastry filled with sweet ricotta' },
    { name: 'Margherita Pizza',     price: 320, category: 'Pizza',     description: 'Authentic Neapolitan pizza with fresh basil' },
    { name: 'San Pellegrino',       price: 80,  category: 'Beverages', description: 'Italian sparkling mineral water' },
  ],
  'Multi Cuisine': [
    { name: 'Grilled Chicken',      price: 280, category: 'Grills',    description: 'Herb-marinated grilled chicken breast' },
    { name: 'Nachos',               price: 180, category: 'Starters',  description: 'Tortilla chips with cheese, salsa and guacamole' },
    { name: 'Falafel Wrap',         price: 160, category: 'Wraps',     description: 'Crispy falafel in flatbread with hummus' },
    { name: 'Greek Salad',          price: 160, category: 'Salads',    description: 'Tomatoes, olives, feta and cucumber' },
    { name: 'Butter Chicken',       price: 280, category: 'Mains',     description: 'Tender chicken in rich tomato-butter gravy' },
    { name: 'Tom Yum Soup',         price: 160, category: 'Soups',     description: 'Thai spicy and sour prawn soup' },
    { name: 'Loaded Fries',         price: 160, category: 'Sides',     description: 'Fries topped with cheese and jalapeños' },
    { name: 'Quesadilla',           price: 180, category: 'Snacks',    description: 'Grilled tortilla with cheese and peppers' },
    { name: 'Chicken Biryani',      price: 200, category: 'Rice',      description: 'Aromatic basmati rice with chicken' },
    { name: 'Panna Cotta',          price: 140, category: 'Desserts',  description: 'Italian set cream with berry coulis' },
    { name: 'Mojito (Virgin)',      price: 120, category: 'Beverages', description: 'Fresh mint and lime mocktail' },
    { name: 'BBQ Platter',          price: 450, category: 'Sharing',   description: 'Mixed grill platter for 2' },
  ],
};

const defaultMenu = menuByCuisine['South Indian'];

const seedDB = async () => {
  try {
    await connectDB();

    await Restaurant.deleteMany({});
    await MenuItem.deleteMany({});
    console.log('Cleared existing restaurants and menu items');

    let totalRestaurants = 0;
    let totalMenuItems = 0;

    for (let i = 0; i < restaurants.length; i++) {
      const r = restaurants[i];
      const area = areas[i % areas.length];
      const latOffset = (Math.random() - 0.5) * 0.018;
      const lngOffset = (Math.random() - 0.5) * 0.018;
      const ratingVar = +(r.rating + (Math.random() - 0.5) * 0.2).toFixed(1);

      const restaurant = await Restaurant.create({
        name: r.name,
        cuisine: r.cuisine,
        rating: Math.min(5, Math.max(3.0, ratingVar)),
        address: `${area.area}, Chennai`,
        location: {
          type: 'Point',
          coordinates: [
            +(area.lng + lngOffset).toFixed(6),
            +(area.lat + latOffset).toFixed(6)
          ]
        },
        isOpen: Math.random() > 0.08,
      });

      totalRestaurants++;

      const menu = menuByCuisine[r.cuisine] || defaultMenu;
      const items = menu.map(item => ({
        restaurantId: restaurant._id,
        name: item.name,
        description: item.description,
        price: item.price,
        category: item.category,
        available: Math.random() > 0.05,
      }));

      await MenuItem.insertMany(items);
      totalMenuItems += items.length;
      console.log(`✅ ${r.name} (${area.area}) — ${items.length} items`);
    }

    // Create test users
    const bcrypt = require('bcryptjs');
    const pw = await bcrypt.hash('password123', 10);
    await User.deleteMany({ email: { $in: ['owner@test.com', 'customer@test.com'] } });
    await User.create([
      { name: 'Restaurant Owner', email: 'owner@test.com',    password: pw, role: 'restaurant', loyaltyPoints: 0 },
      { name: 'Test Customer',    email: 'customer@test.com', password: pw, role: 'consumer',   loyaltyPoints: 150 },
    ]);

    console.log('\n═══════════════════════════════════════════');
    console.log('✅ Seeding complete!');
    console.log(`   Restaurants  : ${totalRestaurants}`);
    console.log(`   Menu Items   : ${totalMenuItems}`);
    console.log(`   Total Records: ${totalRestaurants + totalMenuItems}`);
    console.log('═══════════════════════════════════════════');
    console.log('\nTest accounts:');
    console.log('  Customer : customer@test.com / password123');
    console.log('  Owner    : owner@test.com    / password123');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
};

seedDB();
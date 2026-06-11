require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const Restaurant = require("./models/Restaurant");
const MenuItem = require("./models/MenuItem");
const User = require("./models/User");

/* ─────────────────────────────────────────────
   MASSIVE MENU TEMPLATES (Swiggy/Zomato style)
───────────────────────────────────────────── */

const SOUTH_INDIAN_MENU = [
  // Starters
  { name: "Medu Vada", price: 60, category: "Starters", description: "Crispy fried lentil donuts served with coconut chutney and sambar", available: true },
  { name: "Masala Vada", price: 55, category: "Starters", description: "Spicy chana dal fritters with onion and curry leaves", available: true },
  { name: "Paneer 65", price: 160, category: "Starters", description: "Crispy fried paneer tossed in spicy tangy masala", available: true },
  { name: "Gobi 65", price: 140, category: "Starters", description: "Cauliflower florets fried with Indian spices", available: true },
  { name: "Onion Pakoda", price: 80, category: "Starters", description: "Crispy onion fritters with green chutney", available: true },
  { name: "Bread Bajji", price: 50, category: "Starters", description: "Bread slices stuffed with potato and fried in batter", available: true },
  { name: "Mirchi Bajji", price: 40, category: "Starters", description: "Stuffed chili peppers dipped in gram flour batter", available: true },
  { name: "Banana Bajji", price: 45, category: "Starters", description: "Ripe banana slices fried in sweet batter", available: true },

  // Main Course
  { name: "Idli (2 pcs)", price: 50, category: "Main Course", description: "Fluffy steamed rice cakes served with sambar and 3 chutneys", available: true },
  { name: "Mini Idli (12 pcs)", price: 80, category: "Main Course", description: "Bite-size idlis dunked in special sambar with ghee", available: true },
  { name: "Plain Dosa", price: 70, category: "Main Course", description: "Classic crispy rice crepe served with sambar and chutney", available: true },
  { name: "Masala Dosa", price: 90, category: "Main Course", description: "Crispy dosa stuffed with spiced potato filling", available: true },
  { name: "Butter Masala Dosa", price: 110, category: "Main Course", description: "Masala dosa topped with generous butter", available: true },
  { name: "Ghee Roast Dosa", price: 120, category: "Main Course", description: "Dosa roasted in pure ghee until golden and crispy", available: true },
  { name: "Paper Roast Dosa", price: 100, category: "Main Course", description: "Extra thin and crispy paper dosa", available: true },
  { name: "Onion Rava Dosa", price: 110, category: "Main Course", description: "Instant crispy semolina dosa with onions", available: true },
  { name: "Uttapam", price: 90, category: "Main Course", description: "Thick soft pancake with onion, tomato, chili toppings", available: true },
  { name: "Pongal", price: 70, category: "Main Course", description: "Creamy rice and lentil porridge with pepper and ghee", available: true },
  { name: "Upma", price: 60, category: "Main Course", description: "Savory semolina porridge with vegetables and mustard", available: true },
  { name: "Poha", price: 55, category: "Main Course", description: "Flattened rice with onion, peas and turmeric", available: true },
  { name: "Pesarattu", price: 80, category: "Main Course", description: "Green moong dal crepe with ginger chutney", available: true },
  { name: "Idiyappam", price: 70, category: "Main Course", description: "Steamed rice noodles with coconut milk and egg curry", available: true },
  { name: "Appam", price: 80, category: "Main Course", description: "Lacy rice pancake with stew or coconut milk", available: true },
  { name: "Veg Thali", price: 180, category: "Main Course", description: "Full South Indian meal: rice, sambar, rasam, 3 gravies, papad, pickle, dessert", available: true },
  { name: "Mini Tiffin", price: 120, category: "Main Course", description: "2 idlis + 1 vada + 1 dosa with sambar and chutney", available: true },

  // Breads
  { name: "Chapati (2 pcs)", price: 40, category: "Breads", description: "Soft whole wheat flatbread", available: true },
  { name: "Parotta", price: 30, category: "Breads", description: "Layered flaky flatbread, best with kurma", available: true },
  { name: "Poori (2 pcs)", price: 50, category: "Breads", description: "Deep fried puffed bread with potato masala", available: true },
  { name: "Stuffed Parotta", price: 60, category: "Breads", description: "Parotta stuffed with egg or chicken filling", available: true },

  // Rice
  { name: "Sambar Rice", price: 90, category: "Rice", description: "Rice mixed with lentil vegetable stew and ghee", available: true },
  { name: "Curd Rice", price: 80, category: "Rice", description: "Chilled rice mixed with yogurt, mustard and curry leaves", available: true },
  { name: "Lemon Rice", price: 80, category: "Rice", description: "Tangy rice with lemon, peanuts and turmeric", available: true },
  { name: "Tamarind Rice", price: 80, category: "Rice", description: "Puliyodarai — spicy tangy tamarind rice", available: true },
  { name: "Coconut Rice", price: 85, category: "Rice", description: "Fragrant rice with grated coconut and cashews", available: true },
  { name: "Tomato Rice", price: 80, category: "Rice", description: "Spiced tomato rice with curry leaves", available: true },
  { name: "Ghee Rice", price: 100, category: "Rice", description: "Aromatic basmati rice cooked in pure ghee with whole spices", available: true },

  // Desserts
  { name: "Payasam", price: 70, category: "Desserts", description: "Creamy vermicelli pudding with cardamom and dry fruits", available: true },
  { name: "Kesari Bath", price: 60, category: "Desserts", description: "Semolina halwa with saffron and cashews", available: true },
  { name: "Paal Payasam", price: 80, category: "Desserts", description: "Slow-cooked rice and milk pudding", available: true },
  { name: "Gulab Jamun (2 pcs)", price: 60, category: "Desserts", description: "Soft fried milk balls soaked in rose syrup", available: true },
  { name: "Rasgulla (2 pcs)", price: 65, category: "Desserts", description: "Soft cheese dumplings in light sugar syrup", available: true },

  // Beverages
  { name: "Filter Coffee", price: 30, category: "Beverages", description: "Strong South Indian decoction coffee with frothy milk", available: true },
  { name: "Masala Tea", price: 25, category: "Beverages", description: "Spiced Indian chai with ginger and cardamom", available: true },
  { name: "Buttermilk", price: 30, category: "Beverages", description: "Chilled salted lassi with cumin and curry leaves", available: true },
  { name: "Fresh Lime Soda", price: 40, category: "Beverages", description: "Sweet or salted lime soda", available: true },
  { name: "Mango Lassi", price: 70, category: "Beverages", description: "Thick chilled yogurt drink with Alphonso mango pulp", available: true },
  { name: "Tender Coconut Water", price: 50, category: "Beverages", description: "Fresh natural coconut water", available: true },
];

const BIRYANI_MENU = [
  // Starters
  { name: "Chicken 65", price: 220, category: "Starters", description: "Classic spicy deep-fried chicken with curry leaves", available: true },
  { name: "Chicken Lollipop (6 pcs)", price: 280, category: "Starters", description: "Crispy chicken lollipops with schezwan dip", available: true },
  { name: "Mutton Seekh Kebab", price: 320, category: "Starters", description: "Minced mutton skewers with mint chutney", available: true },
  { name: "Paneer Tikka", price: 240, category: "Starters", description: "Marinated paneer grilled in tandoor with peppers", available: true },
  { name: "Apollo Fish", price: 260, category: "Starters", description: "Vijayawada-style spicy fried fish", available: true },
  { name: "Prawn Fry", price: 340, category: "Starters", description: "Crispy fried prawns with chili garlic sauce", available: true },
  { name: "Egg 65", price: 160, category: "Starters", description: "Spiced boiled eggs fried until crispy", available: true },
  { name: "Veg Manchurian", price: 160, category: "Starters", description: "Crispy veg balls in tangy manchurian sauce", available: true },
  { name: "Gobi Manchurian", price: 160, category: "Starters", description: "Cauliflower in spicy manchurian gravy", available: true },
  { name: "Hara Bhara Kebab (4 pcs)", price: 180, category: "Starters", description: "Green spinach and pea patties with mint dip", available: true },

  // Main Course
  { name: "Chicken Dum Biryani", price: 280, category: "Main Course", description: "Slow-cooked on dum with whole spices, saffron basmati rice", available: true },
  { name: "Mutton Dum Biryani", price: 380, category: "Main Course", description: "Tender mutton pieces in aromatic dum biryani", available: true },
  { name: "Prawn Biryani", price: 360, category: "Main Course", description: "Juicy prawns layered with fragrant basmati", available: true },
  { name: "Egg Biryani", price: 200, category: "Main Course", description: "Four boiled eggs in spiced biryani rice", available: true },
  { name: "Veg Biryani", price: 200, category: "Main Course", description: "Mixed vegetable dum biryani with raita", available: true },
  { name: "Paneer Biryani", price: 240, category: "Main Course", description: "Cottage cheese cubes layered in aromatic rice", available: true },
  { name: "Fish Biryani", price: 340, category: "Main Course", description: "Tender fish fillets in coastal-style biryani", available: true },
  { name: "Chicken Curry", price: 260, category: "Main Course", description: "Rich tomato-onion based chicken curry", available: true },
  { name: "Mutton Curry", price: 340, category: "Main Course", description: "Slow-cooked mutton in thick masala gravy", available: true },
  { name: "Dal Fry", price: 160, category: "Main Course", description: "Yellow lentils tempered with garlic and cumin", available: true },
  { name: "Paneer Butter Masala", price: 240, category: "Main Course", description: "Paneer in rich tomato cashew cream sauce", available: true },
  { name: "Chicken Butter Masala", price: 280, category: "Main Course", description: "Tender chicken in smooth buttery tomato gravy", available: true },
  { name: "Mutton Keema", price: 300, category: "Main Course", description: "Minced mutton cooked with peas and spices", available: true },
  { name: "Veg Thali", price: 220, category: "Main Course", description: "Dal, 2 sabzis, rice, roti, salad, papad, pickle, sweet", available: true },
  { name: "Non-Veg Thali", price: 320, category: "Main Course", description: "Chicken curry, biryani, raita, naan, salad, sweet", available: true },

  // Breads
  { name: "Butter Naan", price: 50, category: "Breads", description: "Soft leavened bread brushed with butter from tandoor", available: true },
  { name: "Garlic Naan", price: 60, category: "Breads", description: "Naan topped with garlic and coriander butter", available: true },
  { name: "Tandoori Roti", price: 35, category: "Breads", description: "Whole wheat bread baked in tandoor", available: true },
  { name: "Laccha Paratha", price: 55, category: "Breads", description: "Layered flaky whole wheat paratha", available: true },
  { name: "Peshwari Naan", price: 70, category: "Breads", description: "Sweet naan stuffed with coconut and almonds", available: true },
  { name: "Cheese Naan", price: 80, category: "Breads", description: "Naan stuffed with melted cheese", available: true },

  // Rice
  { name: "Steamed Basmati Rice", price: 80, category: "Rice", description: "Plain fragrant basmati rice", available: true },
  { name: "Jeera Rice", price: 100, category: "Rice", description: "Basmati rice tempered with cumin and ghee", available: true },
  { name: "Pulao", price: 160, category: "Rice", description: "Vegetable pulao with whole spices", available: true },
  { name: "Curd Rice", price: 90, category: "Rice", description: "Cooling rice with yogurt and mustard", available: true },

  // Desserts
  { name: "Gulab Jamun (3 pcs)", price: 80, category: "Desserts", description: "Warm milk dumplings in rose cardamom syrup", available: true },
  { name: "Double Ka Meetha", price: 100, category: "Desserts", description: "Hyderabadi bread pudding with khoya and dry fruits", available: true },
  { name: "Phirni", price: 90, category: "Desserts", description: "Ground rice pudding with saffron and pistachios", available: true },
  { name: "Shahi Tukda", price: 110, category: "Desserts", description: "Fried bread topped with sweetened condensed milk", available: true },
  { name: "Kheer", price: 80, category: "Desserts", description: "Creamy rice pudding with cardamom and raisins", available: true },
  { name: "Ice Cream (2 scoops)", price: 100, category: "Desserts", description: "Choice of vanilla, chocolate or strawberry", available: true },

  // Beverages
  { name: "Mango Lassi", price: 80, category: "Beverages", description: "Thick mango yogurt drink", available: true },
  { name: "Sweet Lassi", price: 60, category: "Beverages", description: "Chilled sweet yogurt drink", available: true },
  { name: "Raita", price: 60, category: "Beverages", description: "Cooling yogurt with cucumber and cumin", available: true },
  { name: "Masala Chaas", price: 50, category: "Beverages", description: "Spiced buttermilk with coriander", available: true },
  { name: "Cold Coffee", price: 90, category: "Beverages", description: "Chilled coffee with ice cream", available: true },
  { name: "Fresh Lime Water", price: 40, category: "Beverages", description: "Sweet or salted lime water", available: true },
];

const PIZZA_MENU = [
  // Starters
  { name: "Garlic Bread (4 pcs)", price: 120, category: "Starters", description: "Toasted baguette with herb garlic butter", available: true },
  { name: "Cheesy Garlic Bread", price: 160, category: "Starters", description: "Garlic bread loaded with mozzarella cheese", available: true },
  { name: "Chicken Wings (6 pcs)", price: 280, category: "Starters", description: "Crispy buffalo wings with ranch dip", available: true },
  { name: "Loaded Potato Skins", price: 200, category: "Starters", description: "Crispy potato shells with cheese and sour cream", available: true },
  { name: "Bruschetta", price: 160, category: "Starters", description: "Toasted bread with tomato, basil and olive oil", available: true },
  { name: "Mozzarella Sticks (6 pcs)", price: 220, category: "Starters", description: "Breaded fried mozzarella with marinara dip", available: true },
  { name: "Nachos with Dips", price: 200, category: "Starters", description: "Crispy tortilla chips with cheese sauce and salsa", available: true },

  // Main Course
  { name: "Margherita Pizza", price: 280, category: "Main Course", description: "Classic tomato base, mozzarella, fresh basil — 12 inch", available: true },
  { name: "Pepperoni Pizza", price: 380, category: "Main Course", description: "Loaded with pepperoni on rich tomato sauce — 12 inch", available: true },
  { name: "BBQ Chicken Pizza", price: 400, category: "Main Course", description: "Grilled chicken, BBQ sauce, red onion, mozzarella — 12 inch", available: true },
  { name: "Chicken Tikka Pizza", price: 400, category: "Main Course", description: "Indian-spiced chicken tikka on pizza — 12 inch", available: true },
  { name: "Veg Supreme Pizza", price: 350, category: "Main Course", description: "Bell peppers, mushrooms, olives, onion, corn — 12 inch", available: true },
  { name: "Paneer Tikka Pizza", price: 360, category: "Main Course", description: "Spiced paneer with capsicum on tandoori base — 12 inch", available: true },
  { name: "Four Cheese Pizza", price: 420, category: "Main Course", description: "Mozzarella, cheddar, parmesan, gouda blend — 12 inch", available: true },
  { name: "Peri Peri Chicken Pizza", price: 400, category: "Main Course", description: "Fiery peri peri chicken with jalapeños — 12 inch", available: true },
  { name: "Farmhouse Pizza", price: 380, category: "Main Course", description: "Fresh veggies, mushrooms, golden corn, black olives — 12 inch", available: true },
  { name: "Non-Veg Supreme Pizza", price: 450, category: "Main Course", description: "Chicken, pepperoni, bacon, mushrooms — 12 inch", available: true },
  { name: "Pasta Arrabbiata", price: 250, category: "Main Course", description: "Penne in spicy tomato garlic sauce", available: true },
  { name: "Pasta Alfredo", price: 270, category: "Main Course", description: "Fettuccine in creamy parmesan white sauce", available: true },
  { name: "Chicken Pasta", price: 320, category: "Main Course", description: "Penne with grilled chicken in tomato herb sauce", available: true },

  // Breads
  { name: "Focaccia", price: 160, category: "Breads", description: "Italian herb flatbread with olive oil and rosemary", available: true },
  { name: "Calzone", price: 300, category: "Breads", description: "Folded stuffed pizza with cheese and chicken", available: true },

  // Desserts
  { name: "Choco Lava Cake", price: 160, category: "Desserts", description: "Warm chocolate cake with molten chocolate center", available: true },
  { name: "Tiramisu", price: 200, category: "Desserts", description: "Classic Italian coffee dessert with mascarpone", available: true },
  { name: "NY Cheesecake", price: 180, category: "Desserts", description: "Creamy baked cheesecake with berry compote", available: true },
  { name: "Brownie Sundae", price: 200, category: "Desserts", description: "Warm brownie with vanilla ice cream and chocolate sauce", available: true },
  { name: "Panna Cotta", price: 170, category: "Desserts", description: "Silky Italian cream dessert with strawberry coulis", available: true },

  // Beverages
  { name: "Pepsi (300ml)", price: 60, category: "Beverages", description: "Chilled Pepsi", available: true },
  { name: "7UP (300ml)", price: 60, category: "Beverages", description: "Chilled 7UP lemon soda", available: true },
  { name: "Iced Tea (Lemon)", price: 90, category: "Beverages", description: "Chilled lemon iced tea", available: true },
  { name: "Iced Tea (Peach)", price: 90, category: "Beverages", description: "Refreshing peach iced tea", available: true },
  { name: "Mojito (Virgin)", price: 120, category: "Beverages", description: "Mint lime soda mocktail", available: true },
  { name: "Milkshake (Chocolate)", price: 140, category: "Beverages", description: "Thick chocolate milkshake with whipped cream", available: true },
  { name: "Milkshake (Strawberry)", price: 140, category: "Beverages", description: "Thick strawberry milkshake", available: true },
  { name: "Fresh Orange Juice", price: 100, category: "Beverages", description: "Freshly squeezed orange juice", available: true },
];

const BURGER_MENU = [
  // Starters
  { name: "French Fries (Regular)", price: 100, category: "Starters", description: "Crispy golden fries with ketchup", available: true },
  { name: "French Fries (Large)", price: 140, category: "Starters", description: "Large portion crispy fries", available: true },
  { name: "Peri Peri Fries", price: 150, category: "Starters", description: "Fries tossed in peri peri spice blend", available: true },
  { name: "Cheese Fries", price: 160, category: "Starters", description: "Fries loaded with molten cheese sauce", available: true },
  { name: "Onion Rings (6 pcs)", price: 130, category: "Starters", description: "Crispy beer-battered onion rings", available: true },
  { name: "Chicken Nuggets (6 pcs)", price: 180, category: "Starters", description: "Juicy breaded chicken nuggets with dip", available: true },
  { name: "Chicken Strips (4 pcs)", price: 220, category: "Starters", description: "Crispy chicken tenders with honey mustard", available: true },
  { name: "Coleslaw", price: 80, category: "Starters", description: "Creamy cabbage and carrot slaw", available: true },

  // Main Course
  { name: "Classic Veg Burger", price: 160, category: "Main Course", description: "Crispy veg patty with lettuce, tomato, cheese, mayo", available: true },
  { name: "Crispy Chicken Burger", price: 220, category: "Main Course", description: "Crunchy fried chicken fillet with sriracha mayo", available: true },
  { name: "Spicy Chicken Burger", price: 240, category: "Main Course", description: "Fiery spiced chicken patty with jalapeños", available: true },
  { name: "BBQ Chicken Burger", price: 260, category: "Main Course", description: "Grilled chicken with smoky BBQ sauce and caramelized onion", available: true },
  { name: "Double Patty Burger", price: 300, category: "Main Course", description: "Two beef/chicken patties with special sauce", available: true },
  { name: "Zinger Burger", price: 240, category: "Main Course", description: "Signature crispy spiced chicken fillet burger", available: true },
  { name: "Paneer Burger", price: 200, category: "Main Course", description: "Grilled paneer tikka patty with mint chutney", available: true },
  { name: "Mushroom Swiss Burger", price: 260, category: "Main Course", description: "Juicy patty with sautéed mushrooms and Swiss cheese", available: true },
  { name: "Veggie Club Sandwich", price: 200, category: "Main Course", description: "Triple-decker sandwich with veggies and cheese", available: true },
  { name: "Grilled Chicken Sandwich", price: 240, category: "Main Course", description: "Grilled chicken with pesto and sun-dried tomatoes", available: true },
  { name: "Wraps (Chicken Tikka)", price: 220, category: "Main Course", description: "Soft tortilla with chicken tikka and veggies", available: true },
  { name: "Meal Combo (Burger + Fries + Drink)", price: 350, category: "Main Course", description: "Any burger + regular fries + 300ml drink", available: true },

  // Desserts
  { name: "Soft Serve (Vanilla)", price: 80, category: "Desserts", description: "Classic soft vanilla ice cream cone", available: true },
  { name: "McFlurry Style (Oreo)", price: 130, category: "Desserts", description: "Creamy soft serve blended with Oreo cookies", available: true },
  { name: "Chocolate Sundae", price: 120, category: "Desserts", description: "Soft serve with hot chocolate fudge", available: true },
  { name: "Apple Pie (Slice)", price: 100, category: "Desserts", description: "Warm baked apple cinnamon pie", available: true },

  // Beverages
  { name: "Coca-Cola (Medium)", price: 70, category: "Beverages", description: "Ice-cold Coca-Cola", available: true },
  { name: "Sprite (Medium)", price: 70, category: "Beverages", description: "Refreshing lemon-lime soda", available: true },
  { name: "Chocolate Milkshake", price: 150, category: "Beverages", description: "Thick blended chocolate milkshake", available: true },
  { name: "Vanilla Milkshake", price: 150, category: "Beverages", description: "Thick blended vanilla milkshake", available: true },
  { name: "Strawberry Milkshake", price: 150, category: "Beverages", description: "Thick blended strawberry milkshake", available: true },
  { name: "Orange Juice", price: 90, category: "Beverages", description: "Freshly squeezed orange juice", available: true },
  { name: "Cold Coffee", price: 110, category: "Beverages", description: "Blended iced coffee with milk", available: true },
  { name: "Mineral Water", price: 30, category: "Beverages", description: "500ml chilled mineral water", available: true },
];

const CHETTINAD_MENU = [
  // Starters
  { name: "Kavuni Arisi Payasam", price: 90, category: "Starters", description: "Black rice pudding — Chettinad specialty", available: true },
  { name: "Paneer 65", price: 180, category: "Starters", description: "Crispy spiced paneer cubes", available: true },
  { name: "Chicken 65", price: 230, category: "Starters", description: "Chettinad-style fiery chicken", available: true },
  { name: "Mutton Sukka", price: 320, category: "Starters", description: "Dry-roasted mutton with Chettinad spices", available: true },
  { name: "Egg Podimas", price: 130, category: "Starters", description: "Scrambled egg with onion and green chili", available: true },
  { name: "Prawn Pepper Fry", price: 360, category: "Starters", description: "Prawns tossed in freshly ground pepper masala", available: true },
  { name: "Fish Fry", price: 280, category: "Starters", description: "Chettinad spiced fried fish", available: true },
  { name: "Vada (2 pcs)", price: 60, category: "Starters", description: "Crispy lentil fritters", available: true },

  // Main Course
  { name: "Chettinad Chicken Curry", price: 300, category: "Main Course", description: "Signature bold Chettinad spiced chicken gravy", available: true },
  { name: "Chettinad Mutton Curry", price: 400, category: "Main Course", description: "Slow-cooked mutton in authentic Chettinad masala", available: true },
  { name: "Kuzhi Paniyaram", price: 90, category: "Main Course", description: "Ball-shaped fermented rice dumplings, savory or sweet", available: true },
  { name: "Idiyappam with Egg Curry", price: 120, category: "Main Course", description: "String hoppers with spiced egg curry", available: true },
  { name: "Dosa with Chicken Kuzhambu", price: 150, category: "Main Course", description: "Crispy dosa served with tangy chicken curry", available: true },
  { name: "Veg Chettinad Curry", price: 220, category: "Main Course", description: "Mixed vegetables in Chettinad spice base", available: true },
  { name: "Nandu Rasam", price: 180, category: "Main Course", description: "Crab rasam — thin spicy tangy crab soup", available: true },
  { name: "Chettinad Veg Thali", price: 220, category: "Main Course", description: "Complete Chettinad vegetarian meal", available: true },
  { name: "Chettinad Non-Veg Thali", price: 380, category: "Main Course", description: "Complete Chettinad non-veg feast", available: true },
  { name: "Meen Kuzhambu", price: 280, category: "Main Course", description: "Traditional fish curry with tamarind and Chettinad spices", available: true },

  // Breads
  { name: "Parotta", price: 35, category: "Breads", description: "Flaky layered flatbread, best with Chettinad curry", available: true },
  { name: "Veechu Parotta", price: 40, category: "Breads", description: "Extra flaky Chettinad style parotta", available: true },
  { name: "Poori (2 pcs)", price: 55, category: "Breads", description: "Puffed fried bread", available: true },
  { name: "Chapati (3 pcs)", price: 50, category: "Breads", description: "Soft whole wheat flatbread", available: true },

  // Rice
  { name: "Chettinad Chicken Biryani", price: 300, category: "Rice", description: "Spice-loaded Chettinad-style chicken biryani", available: true },
  { name: "Curd Rice", price: 80, category: "Rice", description: "Cooling yogurt rice with mustard and curry leaves", available: true },
  { name: "Ghee Rice", price: 100, category: "Rice", description: "Fragrant ghee rice with spices", available: true },

  // Desserts
  { name: "Kavuni Arisi", price: 100, category: "Desserts", description: "Black sticky rice pudding with jaggery and coconut", available: true },
  { name: "Semiya Payasam", price: 70, category: "Desserts", description: "Vermicelli pudding with cardamom", available: true },
  { name: "Adirasam", price: 60, category: "Desserts", description: "Traditional jaggery rice flour sweet", available: true },

  // Beverages
  { name: "Filter Coffee", price: 35, category: "Beverages", description: "Strong decoction coffee", available: true },
  { name: "Nannari Sherbet", price: 50, category: "Beverages", description: "Sweet sarsaparilla drink — Chettinad specialty", available: true },
  { name: "Buttermilk", price: 30, category: "Beverages", description: "Chilled spiced buttermilk", available: true },
  { name: "Rose Milk", price: 50, category: "Beverages", description: "Chilled rose-flavored milk", available: true },
];

const DESSERT_MENU = [
  // Starters (light bites)
  { name: "Waffle (Plain)", price: 150, category: "Starters", description: "Belgian waffle with maple syrup and butter", available: true },
  { name: "Waffle (Fruit)", price: 180, category: "Starters", description: "Belgian waffle with seasonal fruits and cream", available: true },
  { name: "Pancakes (3 pcs)", price: 160, category: "Starters", description: "Fluffy American pancakes with maple syrup", available: true },
  { name: "French Toast", price: 140, category: "Starters", description: "Golden French toast with honey and cinnamon", available: true },

  // Main Course
  { name: "Choco Lava Cake", price: 180, category: "Main Course", description: "Warm dark chocolate cake with molten center", available: true },
  { name: "Tiramisu", price: 220, category: "Main Course", description: "Classic Italian ladyfinger and mascarpone dessert", available: true },
  { name: "NY Cheesecake", price: 200, category: "Main Course", description: "Dense creamy baked cheesecake with berry coulis", available: true },
  { name: "Strawberry Cheesecake", price: 200, category: "Main Course", description: "No-bake cheesecake with fresh strawberry topping", available: true },
  { name: "Red Velvet Cake (Slice)", price: 180, category: "Main Course", description: "Moist red velvet with cream cheese frosting", available: true },
  { name: "Chocolate Truffle Cake (Slice)", price: 200, category: "Main Course", description: "Rich dense chocolate ganache cake", available: true },
  { name: "Banana Foster", price: 190, category: "Main Course", description: "Caramelized bananas over vanilla ice cream", available: true },
  { name: "Pineapple Upside Down Cake", price: 170, category: "Main Course", description: "Caramelized pineapple on buttery sponge cake", available: true },

  // Desserts
  { name: "Sundae — Chocolate Fudge", price: 160, category: "Desserts", description: "3 scoops ice cream, hot fudge, whipped cream, cherry", available: true },
  { name: "Sundae — Strawberry", price: 160, category: "Desserts", description: "3 scoops with strawberry sauce and fresh berries", available: true },
  { name: "Banana Split", price: 200, category: "Desserts", description: "Classic banana split with 3 flavors, sauces, nuts", available: true },
  { name: "Scoop (Single)", price: 80, category: "Desserts", description: "Single scoop: vanilla, chocolate, strawberry, or mango", available: true },
  { name: "Scoop (Double)", price: 140, category: "Desserts", description: "Two scoops of your choice", available: true },
  { name: "Kulfi (Malai)", price: 80, category: "Desserts", description: "Traditional Indian milk ice cream on stick", available: true },
  { name: "Kulfi (Kesar Pista)", price: 100, category: "Desserts", description: "Saffron pistachio kulfi", available: true },
  { name: "Rabri Malpua", price: 150, category: "Desserts", description: "Fried sweet pancake with condensed milk", available: true },
  { name: "Gulab Jamun (4 pcs)", price: 100, category: "Desserts", description: "Soft dumplings in warm rose syrup with ice cream", available: true },
  { name: "Jalebi (Hot)", price: 80, category: "Desserts", description: "Crispy spiral sweets soaked in saffron syrup", available: true },
  { name: "Kheer", price: 90, category: "Desserts", description: "Slow-cooked rice pudding with cardamom and saffron", available: true },

  // Beverages
  { name: "Thick Shake (Chocolate)", price: 160, category: "Beverages", description: "Extra thick blended chocolate milkshake", available: true },
  { name: "Thick Shake (Oreo)", price: 180, category: "Beverages", description: "Oreo cookie blended thick shake", available: true },
  { name: "Thick Shake (Mango)", price: 180, category: "Beverages", description: "Alphonso mango thick shake", available: true },
  { name: "Thick Shake (Butterscotch)", price: 160, category: "Beverages", description: "Butterscotch blended milkshake", available: true },
  { name: "Hot Chocolate", price: 140, category: "Beverages", description: "Rich creamy hot chocolate with marshmallows", available: true },
  { name: "Cappuccino", price: 120, category: "Beverages", description: "Espresso with steamed milk foam", available: true },
  { name: "Caramel Latte", price: 150, category: "Beverages", description: "Espresso with caramel and steamed milk", available: true },
  { name: "Cold Coffee (Frappe)", price: 160, category: "Beverages", description: "Blended iced coffee with whipped cream", available: true },
  { name: "Mojito (Virgin)", price: 130, category: "Beverages", description: "Mint lime soda mocktail", available: true },
];

function getMenuByCuisine(cuisine) {
  const map = {
    "South Indian": SOUTH_INDIAN_MENU,
    "Chettinad":   CHETTINAD_MENU,
    "Biryani":     BIRYANI_MENU,
    "Pizza":       PIZZA_MENU,
    "Burgers":     BURGER_MENU,
    "Desserts":    DESSERT_MENU,
  };
  return map[cuisine] || BIRYANI_MENU;
}

const RESTAURANTS = [
  // ── CHENNAI ──────────────────────────────
  { name: "Murugan Idli Shop", cuisine: "South Indian", rating: 4.7, address: "Tambaram, Chennai", location: { type: "Point", coordinates: [80.1183, 12.9249] }, isOpen: true },
  { name: "Anjappar Chettinad", cuisine: "Chettinad", rating: 4.5, address: "Chrompet, Chennai", location: { type: "Point", coordinates: [80.1390, 12.9516] }, isOpen: true },
  { name: "Pizza Hut Velachery", cuisine: "Pizza", rating: 4.2, address: "Velachery, Chennai", location: { type: "Point", coordinates: [80.2207, 12.9830] }, isOpen: true },
  { name: "Dindigul Thalappakatti", cuisine: "Biryani", rating: 4.6, address: "Vadapalani, Chennai", location: { type: "Point", coordinates: [80.2121, 13.0513] }, isOpen: true },
  { name: "KFC Tambaram", cuisine: "Burgers", rating: 4.1, address: "Tambaram West, Chennai", location: { type: "Point", coordinates: [80.1147, 12.9236] }, isOpen: true },
  { name: "Saravana Bhavan", cuisine: "South Indian", rating: 4.8, address: "T Nagar, Chennai", location: { type: "Point", coordinates: [80.2338, 13.0418] }, isOpen: true },
  { name: "Junior Kuppanna", cuisine: "Chettinad", rating: 4.6, address: "Anna Nagar, Chennai", location: { type: "Point", coordinates: [80.2100, 13.0850] }, isOpen: true },
  { name: "Domino's OMR", cuisine: "Pizza", rating: 4.3, address: "OMR, Chennai", location: { type: "Point", coordinates: [80.2450, 12.9560] }, isOpen: true },
  { name: "Buhari Hotel", cuisine: "Biryani", rating: 4.4, address: "Mount Road, Chennai", location: { type: "Point", coordinates: [80.2707, 13.0610] }, isOpen: true },
  { name: "McDonald's Velachery", cuisine: "Burgers", rating: 4.0, address: "Velachery, Chennai", location: { type: "Point", coordinates: [80.2175, 12.9795] }, isOpen: true },
  { name: "Adyar Ananda Bhavan", cuisine: "South Indian", rating: 4.5, address: "Adyar, Chennai", location: { type: "Point", coordinates: [80.2574, 13.0012] }, isOpen: true },
  { name: "Cream Centre", cuisine: "Pizza", rating: 4.2, address: "Nungambakkam, Chennai", location: { type: "Point", coordinates: [80.2487, 13.0574] }, isOpen: true },
  { name: "Bawarchi Chennai", cuisine: "Biryani", rating: 4.5, address: "Egmore, Chennai", location: { type: "Point", coordinates: [80.2626, 13.0785] }, isOpen: true },
  { name: "Zaitoon", cuisine: "Biryani", rating: 4.3, address: "Royapettah, Chennai", location: { type: "Point", coordinates: [80.2624, 13.0496] }, isOpen: true },
  { name: "Sweet Karam Coffee", cuisine: "South Indian", rating: 4.4, address: "Alwarpet, Chennai", location: { type: "Point", coordinates: [80.2583, 13.0355] }, isOpen: true },
  { name: "Krispy Kreme Chennai", cuisine: "Desserts", rating: 4.1, address: "Express Avenue, Chennai", location: { type: "Point", coordinates: [80.2727, 13.0610] }, isOpen: true },
  { name: "Belgian Waffle Co.", cuisine: "Desserts", rating: 4.3, address: "Phoenix Mall, Chennai", location: { type: "Point", coordinates: [80.2150, 13.0600] }, isOpen: true },

  // ── VIJAYAWADA ────────────────────────────
  { name: "Paradise Vijayawada", cuisine: "Biryani", rating: 4.6, address: "Benz Circle, Vijayawada", location: { type: "Point", coordinates: [80.6480, 16.5062] }, isOpen: true },
  { name: "RR Durbar", cuisine: "Biryani", rating: 4.7, address: "Governorpet, Vijayawada", location: { type: "Point", coordinates: [80.6305, 16.5185] }, isOpen: true },
  { name: "Sweet Magic", cuisine: "Desserts", rating: 4.5, address: "Labbipet, Vijayawada", location: { type: "Point", coordinates: [80.6489, 16.5068] }, isOpen: true },
  { name: "KFC Vijayawada", cuisine: "Burgers", rating: 4.2, address: "Moghalrajpuram, Vijayawada", location: { type: "Point", coordinates: [80.6400, 16.5055] }, isOpen: true },
  { name: "Domino's Vijayawada", cuisine: "Pizza", rating: 4.3, address: "Patamata, Vijayawada", location: { type: "Point", coordinates: [80.6677, 16.4901] }, isOpen: true },
  { name: "Nagarjuna Vijayawada", cuisine: "Chettinad", rating: 4.5, address: "MG Road, Vijayawada", location: { type: "Point", coordinates: [80.6370, 16.5102] }, isOpen: true },
  { name: "Spice Garden VJA", cuisine: "Biryani", rating: 4.4, address: "Suryaraopet, Vijayawada", location: { type: "Point", coordinates: [80.6290, 16.5120] }, isOpen: true },
  { name: "McDonald's Vijayawada", cuisine: "Burgers", rating: 4.0, address: "Eluru Road, Vijayawada", location: { type: "Point", coordinates: [80.6510, 16.5070] }, isOpen: true },
  { name: "Cream Stone VJA", cuisine: "Desserts", rating: 4.4, address: "Benz Circle, Vijayawada", location: { type: "Point", coordinates: [80.6470, 16.5040] }, isOpen: true },
  { name: "Pizza Hut Vijayawada", cuisine: "Pizza", rating: 4.1, address: "Siddhartha Nagar, Vijayawada", location: { type: "Point", coordinates: [80.6600, 16.5150] }, isOpen: true },
  { name: "Hotel Mamatha VJA", cuisine: "South Indian", rating: 4.3, address: "Governorpet, Vijayawada", location: { type: "Point", coordinates: [80.6320, 16.5200] }, isOpen: true },
  { name: "Vijaya Grand", cuisine: "Biryani", rating: 4.5, address: "Besant Road, Vijayawada", location: { type: "Point", coordinates: [80.6340, 16.5160] }, isOpen: true },

  // ── GUNTUR ───────────────────────────────
  { name: "Paradise Guntur", cuisine: "Biryani", rating: 4.5, address: "Brodipet, Guntur", location: { type: "Point", coordinates: [80.4365, 16.3067] }, isOpen: true },
  { name: "Hotel Swagruha", cuisine: "South Indian", rating: 4.4, address: "Arundelpet, Guntur", location: { type: "Point", coordinates: [80.4400, 16.2990] }, isOpen: true },
  { name: "Domino's Guntur", cuisine: "Pizza", rating: 4.2, category: "Pizza", address: "Lakshmipuram, Guntur", location: { type: "Point", coordinates: [80.4250, 16.3122] }, isOpen: true },
  { name: "KFC Guntur", cuisine: "Burgers", rating: 4.1, address: "Pattabhipuram, Guntur", location: { type: "Point", coordinates: [80.4200, 16.3200] }, isOpen: true },
  { name: "Bawarchi Guntur", cuisine: "Biryani", rating: 4.6, address: "Brindavan Gardens, Guntur", location: { type: "Point", coordinates: [80.4500, 16.3100] }, isOpen: true },
  { name: "Swagath Grand Guntur", cuisine: "Biryani", rating: 4.3, address: "Kothapet, Guntur", location: { type: "Point", coordinates: [80.4450, 16.3050] }, isOpen: true },
  { name: "Spicy Venue Guntur", cuisine: "Chettinad", rating: 4.2, address: "Nagarampalem, Guntur", location: { type: "Point", coordinates: [80.4350, 16.3150] }, isOpen: true },
  { name: "Cream Stone Guntur", cuisine: "Desserts", rating: 4.3, address: "AT Agraharam, Guntur", location: { type: "Point", coordinates: [80.4300, 16.3000] }, isOpen: true },
  { name: "Pizza Hut Guntur", cuisine: "Pizza", rating: 4.0, address: "Old Town, Guntur", location: { type: "Point", coordinates: [80.4280, 16.3080] }, isOpen: true },
  { name: "McDonald's Guntur", cuisine: "Burgers", rating: 4.0, address: "Brodipet, Guntur", location: { type: "Point", coordinates: [80.4390, 16.3090] }, isOpen: true },

  // ── HYDERABAD ────────────────────────────
  { name: "Paradise Banjara Hills", cuisine: "Biryani", rating: 4.8, address: "Banjara Hills, Hyderabad", location: { type: "Point", coordinates: [78.4350, 17.4126] }, isOpen: true },
  { name: "Bawarchi Hyderabad", cuisine: "Biryani", rating: 4.7, address: "RTC X Roads, Hyderabad", location: { type: "Point", coordinates: [78.4867, 17.4400] }, isOpen: true },
  { name: "Chutneys Jubilee Hills", cuisine: "South Indian", rating: 4.6, address: "Jubilee Hills, Hyderabad", location: { type: "Point", coordinates: [78.4104, 17.4319] }, isOpen: true },
  { name: "Kritunga Hyderabad", cuisine: "Chettinad", rating: 4.5, address: "Ameerpet, Hyderabad", location: { type: "Point", coordinates: [78.4485, 17.4348] }, isOpen: true },
  { name: "Domino's Banjara Hills", cuisine: "Pizza", rating: 4.2, address: "Banjara Hills, Hyderabad", location: { type: "Point", coordinates: [78.4440, 17.4250] }, isOpen: true },
  { name: "KFC Hitech City", cuisine: "Burgers", rating: 4.1, address: "Hitech City, Hyderabad", location: { type: "Point", coordinates: [78.3823, 17.4435] }, isOpen: true },
  { name: "Cream Stone Jubilee Hills", cuisine: "Desserts", rating: 4.5, address: "Jubilee Hills, Hyderabad", location: { type: "Point", coordinates: [78.4050, 17.4300] }, isOpen: true },
  { name: "Pista House", cuisine: "Biryani", rating: 4.6, address: "Shah Ali Banda, Hyderabad", location: { type: "Point", coordinates: [78.4868, 17.3849] }, isOpen: true },
  { name: "Hotel Shadab", cuisine: "Biryani", rating: 4.7, address: "Ghansi Bazaar, Hyderabad", location: { type: "Point", coordinates: [78.4863, 17.3611] }, isOpen: true },
  { name: "McDonald's Hitech City", cuisine: "Burgers", rating: 4.0, address: "Hitech City, Hyderabad", location: { type: "Point", coordinates: [78.3760, 17.4430] }, isOpen: true },
  { name: "Pizza Hut Kukatpally", cuisine: "Pizza", rating: 4.2, address: "Kukatpally, Hyderabad", location: { type: "Point", coordinates: [78.4126, 17.4847] }, isOpen: true },
  { name: "Belgian Waffle Banjara", cuisine: "Desserts", rating: 4.3, address: "Banjara Hills, Hyderabad", location: { type: "Point", coordinates: [78.4480, 17.4200] }, isOpen: true },

  // ── BANGALORE ────────────────────────────
  { name: "MTR Lalbagh", cuisine: "South Indian", rating: 4.8, address: "Lalbagh Road, Bangalore", location: { type: "Point", coordinates: [77.5946, 12.9507] }, isOpen: true },
  { name: "Vidyarthi Bhavan", cuisine: "South Indian", rating: 4.7, address: "Gandhi Bazaar, Bangalore", location: { type: "Point", coordinates: [77.5760, 12.9456] }, isOpen: true },
  { name: "Empire Indiranagar", cuisine: "Biryani", rating: 4.5, address: "Indiranagar, Bangalore", location: { type: "Point", coordinates: [77.6410, 12.9784] }, isOpen: true },
  { name: "Meghana Foods Koramangala", cuisine: "Biryani", rating: 4.6, address: "Koramangala, Bangalore", location: { type: "Point", coordinates: [77.6270, 12.9352] }, isOpen: true },
  { name: "Domino's Koramangala", cuisine: "Pizza", rating: 4.2, address: "Koramangala, Bangalore", location: { type: "Point", coordinates: [77.6245, 12.9330] }, isOpen: true },
  { name: "KFC MG Road", cuisine: "Burgers", rating: 4.1, address: "MG Road, Bangalore", location: { type: "Point", coordinates: [77.6108, 12.9716] }, isOpen: true },
  { name: "Corner House Ice Cream", cuisine: "Desserts", rating: 4.7, address: "Double Road, Bangalore", location: { type: "Point", coordinates: [77.6050, 12.9500] }, isOpen: true },
  { name: "Pizza Hut Whitefield", cuisine: "Pizza", rating: 4.0, address: "Whitefield, Bangalore", location: { type: "Point", coordinates: [77.7480, 12.9698] }, isOpen: true },
  { name: "Brahmin's Coffee Bar", cuisine: "South Indian", rating: 4.6, address: "Basavanagudi, Bangalore", location: { type: "Point", coordinates: [77.5730, 12.9432] }, isOpen: true },
  { name: "Meghana Foods Residency", cuisine: "Biryani", rating: 4.5, address: "Residency Road, Bangalore", location: { type: "Point", coordinates: [77.6040, 12.9695] }, isOpen: true },

  // ── MUMBAI ───────────────────────────────
  { name: "Britannia & Co", cuisine: "Biryani", rating: 4.7, address: "Ballard Estate, Mumbai", location: { type: "Point", coordinates: [72.8438, 18.9333] }, isOpen: true },
  { name: "Pizza by the Bay", cuisine: "Pizza", rating: 4.4, address: "Marine Drive, Mumbai", location: { type: "Point", coordinates: [72.8258, 18.9440] }, isOpen: true },
  { name: "McDonald's Andheri", cuisine: "Burgers", rating: 4.0, address: "Andheri, Mumbai", location: { type: "Point", coordinates: [72.8479, 19.1194] }, isOpen: true },
  { name: "Haji Ali Juice Centre", cuisine: "Desserts", rating: 4.6, address: "Haji Ali, Mumbai", location: { type: "Point", coordinates: [72.8089, 18.9827] }, isOpen: true },
  { name: "KFC BKC", cuisine: "Burgers", rating: 4.1, address: "BKC, Mumbai", location: { type: "Point", coordinates: [72.8657, 19.0596] }, isOpen: true },
  { name: "Shiv Sagar Juhu", cuisine: "South Indian", rating: 4.3, address: "Juhu, Mumbai", location: { type: "Point", coordinates: [72.8296, 19.1000] }, isOpen: true },

  // ── DELHI / NCR ──────────────────────────
  { name: "Karim's Old Delhi", cuisine: "Biryani", rating: 4.8, address: "Jama Masjid, Delhi", location: { type: "Point", coordinates: [77.2410, 28.6507] }, isOpen: true },
  { name: "Domino's Connaught Place", cuisine: "Pizza", rating: 4.2, address: "Connaught Place, Delhi", location: { type: "Point", coordinates: [77.2195, 28.6315] }, isOpen: true },
  { name: "McDonald's Saket", cuisine: "Burgers", rating: 4.0, address: "Saket, Delhi", location: { type: "Point", coordinates: [77.2069, 28.5254] }, isOpen: true },
  { name: "Sagar Ratna CP", cuisine: "South Indian", rating: 4.4, address: "Connaught Place, Delhi", location: { type: "Point", coordinates: [77.2168, 28.6329] }, isOpen: true },
  { name: "Haldiram's Chandni Chowk", cuisine: "Desserts", rating: 4.5, address: "Chandni Chowk, Delhi", location: { type: "Point", coordinates: [77.2300, 28.6561] }, isOpen: true },
  { name: "KFC Cyber Hub", cuisine: "Burgers", rating: 4.1, address: "Cyber Hub, Gurugram", location: { type: "Point", coordinates: [77.0895, 28.4947] }, isOpen: true },
];

/* ─────────────────────────────────────────────
   SEED
───────────────────────────────────────────── */

async function seed() {
  try {
    console.log("🌱 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Connected\n");

    // ── Clear ALL users and data for a clean slate ──
    console.log("🗑  Clearing old users and data...");
    await User.deleteMany({});
    await Restaurant.deleteMany({});
    await MenuItem.deleteMany({});
    console.log("✅ Old data cleared\n");

    // ── Create Users ────────────────────────────────
    const owner = await User.create({
      name: "Restaurant Owner",
      email: "owner@foodrush.com",
      password: await bcrypt.hash("owner123", 10),
      role: "restaurant",   // ✅ must match restaurantOnly middleware check
    });
    console.log("✅ Owner account created   → owner@foodrush.com / owner123");

    await User.create({
      name: "Test Customer",
      email: "customer@foodrush.com",
      password: await bcrypt.hash("customer123", 10),
      role: "consumer",
    });
    console.log("✅ Customer account created → customer@foodrush.com / customer123");

    // ✅ NEW: Courier account for delivery dashboard testing
    await User.create({
      name: "Test Courier",
      email: "courier@foodrush.com",
      password: await bcrypt.hash("courier123", 10),
      role: "courier",
    });
    console.log("✅ Courier account created  → courier@foodrush.com / courier123\n");

    // ── Insert restaurants + menus ───────────────────
    let totalItems = 0;
    for (const r of RESTAURANTS) {
      const restaurant = await Restaurant.create({ ...r, ownerId: owner._id });
      const menu = getMenuByCuisine(r.cuisine).map((item) => ({
        ...item,
        restaurantId: restaurant._id,
      }));
      await MenuItem.insertMany(menu);
      totalItems += menu.length;
      console.log(`✅ ${restaurant.name.padEnd(35)} — ${menu.length} items  [${r.cuisine}]`);
    }

    // ── Summary ─────────────────────────────────────
    console.log("\n🎉 Seeding Complete!");
    console.log("═══════════════════════════════════════");
    console.log(`📦 Restaurants : ${RESTAURANTS.length}`);
    console.log(`🍽️  Menu items  : ${totalItems}`);
    console.log("───────────────────────────────────────");
    console.log("📍 Cities: Chennai • Vijayawada • Guntur • Hyderabad • Bangalore • Mumbai • Delhi");
    console.log("\n👤 Demo Accounts:");
    console.log("   Customer → customer@foodrush.com / customer123");
    console.log("   Owner    → owner@foodrush.com    / owner123");
    console.log("   Courier  → courier@foodrush.com  / courier123");
    console.log("═══════════════════════════════════════\n");

    process.exit(0);
  } catch (err) {
    console.error("❌ Seed Failed:", err.message);
    process.exit(1);
  }
}

seed();
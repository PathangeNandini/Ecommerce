const MenuItem = require('../models/MenuItem');
const Restaurant = require('../models/Restaurant');

/**
 * Helper: find the restaurant owned by the logged-in user.
 * The User schema has no restaurantId field, so we query Restaurant by ownerId.
 */
const getOwnedRestaurant = (userId) =>
  Restaurant.findOne({ ownerId: userId });

/**
 * @desc   Toggle a menu item's availability (available: true/false)
 * @route  PATCH /api/menu/:id
 * @access Private — restaurant owner only
 */
const toggleAvailability = async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    // Verify the logged-in user owns the restaurant this item belongs to
    const restaurant = await Restaurant.findOne({
      _id: item.restaurantId,
      ownerId: req.user.id
    });
    if (!restaurant) {
      return res.status(403).json({ message: 'Not authorized to modify this item' });
    }

    // Use explicit value from body, or flip current state
    item.available =
      req.body.available !== undefined ? req.body.available : !item.available;

    await item.save();

    res.status(200).json({
      message: `Item marked as ${item.available ? 'available' : 'unavailable'}`,
      item
    });
  } catch (err) {
    console.error('toggleAvailability error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc   Get all menu items belonging to the authenticated restaurant owner
 * @route  GET /api/menu/mine
 * @access Private — restaurant owner only
 */
const getMyMenu = async (req, res) => {
  try {
    const restaurant = await getOwnedRestaurant(req.user.id);
    if (!restaurant) {
      return res.status(404).json({ message: 'No restaurant found for this account' });
    }

    const items = await MenuItem.find({ restaurantId: restaurant._id }).sort({
      category: 1,
      name: 1
    });

    res.status(200).json(items);
  } catch (err) {
    console.error('getMyMenu error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc   Get all menu items for a specific restaurant (public)
 * @route  GET /api/menu/:restaurantId
 * @access Private — any logged-in user
 */
const getMenuByRestaurant = async (req, res) => {
  try {
    const items = await MenuItem.find({
      restaurantId: req.params.restaurantId
    }).sort({ category: 1, name: 1 });

    res.status(200).json(items);
  } catch (err) {
    console.error('getMenuByRestaurant error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc   Add a new menu item to the owner's restaurant
 * @route  POST /api/menu
 * @access Private — restaurant owner only
 */
const addMenuItem = async (req, res) => {
  try {
    const { name, description, price, category } = req.body;

    if (!name || price === undefined) {
      return res.status(400).json({ message: 'Name and price are required' });
    }

    const restaurant = await getOwnedRestaurant(req.user.id);
    if (!restaurant) {
      return res.status(404).json({ message: 'No restaurant found for this account' });
    }

    const item = await MenuItem.create({
      restaurantId: restaurant._id,
      name,
      description,
      price,
      category,
      available: true
    });

    res.status(201).json(item);
  } catch (err) {
    console.error('addMenuItem error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc   Delete a menu item
 * @route  DELETE /api/menu/:id
 * @access Private — restaurant owner only
 */
const deleteMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    const restaurant = await Restaurant.findOne({
      _id: item.restaurantId,
      ownerId: req.user.id
    });
    if (!restaurant) {
      return res.status(403).json({ message: 'Not authorized to delete this item' });
    }

    await item.deleteOne();
    res.status(200).json({ message: 'Menu item deleted' });
  } catch (err) {
    console.error('deleteMenuItem error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  toggleAvailability,
  getMyMenu,
  getMenuByRestaurant,
  addMenuItem,
  deleteMenuItem
};
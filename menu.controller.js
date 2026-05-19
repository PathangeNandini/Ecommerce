const MenuItem = require("./server/models/MenuItem");

/**
 * @desc    Toggle a menu item's availability (available: true/false)
 * @route   PATCH /api/menu/:id
 * @access  Private — restaurant owner only
 */
const toggleAvailability = async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    // Make sure the logged-in restaurant owner actually owns this item
    if (item.restaurantId.toString() !== req.user.restaurantId?.toString()) {
      return res.status(403).json({ message: "Not authorized to modify this item" });
    }

    // If body sends an explicit value use it, otherwise flip the current state
    item.available =
      req.body.available !== undefined ? req.body.available : !item.available;

    await item.save();

    res.status(200).json({
      message: `Item marked as ${item.available ? "available" : "unavailable"}`,
      item,
    });
  } catch (err) {
    console.error("toggleAvailability error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * @desc    Get all menu items belonging to the authenticated restaurant owner
 * @route   GET /api/menu/mine
 * @access  Private — restaurant owner only
 */
const getMyMenu = async (req, res) => {
  try {
    const items = await MenuItem.find({
      restaurantId: req.user.restaurantId,
    }).sort({ category: 1, name: 1 });

    res.status(200).json(items);
  } catch (err) {
    console.error("getMyMenu error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * @desc    Get all available menu items for a specific restaurant (public)
 * @route   GET /api/menu/:restaurantId
 * @access  Private — any logged-in user
 */
const getMenuByRestaurant = async (req, res) => {
  try {
    const items = await MenuItem.find({
      restaurantId: req.params.restaurantId,
    }).sort({ category: 1, name: 1 });

    res.status(200).json(items);
  } catch (err) {
    console.error("getMenuByRestaurant error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * @desc    Add a new menu item to a restaurant
 * @route   POST /api/menu
 * @access  Private — restaurant owner only
 */
const addMenuItem = async (req, res) => {
  try {
    const { name, description, price, category } = req.body;

    if (!name || !price) {
      return res.status(400).json({ message: "Name and price are required" });
    }

    const item = await MenuItem.create({
      restaurantId: req.user.restaurantId,
      name,
      description,
      price,
      category,
      available: true,
    });

    res.status(201).json(item);
  } catch (err) {
    console.error("addMenuItem error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * @desc    Delete a menu item
 * @route   DELETE /api/menu/:id
 * @access  Private — restaurant owner only
 */
const deleteMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    if (item.restaurantId.toString() !== req.user.restaurantId?.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this item" });
    }

    await item.deleteOne();
    res.status(200).json({ message: "Menu item deleted" });
  } catch (err) {
    console.error("deleteMenuItem error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  toggleAvailability,
  getMyMenu,
  getMenuByRestaurant,
  addMenuItem,
  deleteMenuItem,
};

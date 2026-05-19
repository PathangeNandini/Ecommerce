const express = require('express');
const router = express.Router();
const MenuItem = require('../models/MenuItem');
const Restaurant = require('../models/Restaurant');
const { authMiddleware, roleMiddleware } = require('../middleware/authMiddleware');

/**
 * PATCH /api/menu/:id
 * Toggle a menu item's availability (available: true/false).
 * Only the restaurant owner can modify their own menu items.
 */
router.patch('/:id', authMiddleware, roleMiddleware('restaurant'), async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id);
    if (!item) return res.status(404).json({ msg: 'Menu item not found' });

    // Verify ownership
    const restaurant = await Restaurant.findOne({
      _id: item.restaurantId,
      ownerId: req.user.id
    });
    if (!restaurant) {
      return res.status(403).json({ msg: 'You do not own this restaurant' });
    }

    // Toggle availability or set explicitly
    const available = req.body.available !== undefined
      ? req.body.available
      : !item.available;

    const updated = await MenuItem.findByIdAndUpdate(
      req.params.id,
      { available },
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

/**
 * POST /api/menu
 * Create a new menu item for the logged-in restaurant owner.
 */
router.post('/', authMiddleware, roleMiddleware('restaurant'), async (req, res) => {
  try {
    const { name, description, price, category, restaurantId } = req.body;

    // Verify ownership
    const restaurant = await Restaurant.findOne({
      _id: restaurantId,
      ownerId: req.user.id
    });
    if (!restaurant) {
      return res.status(403).json({ msg: 'You do not own this restaurant' });
    }

    const item = await MenuItem.create({
      restaurantId,
      name,
      description,
      price,
      category
    });

    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

/**
 * GET /api/menu/:restaurantId
 * Get all menu items for a restaurant (including unavailable — for the owner).
 */
router.get('/:restaurantId', authMiddleware, async (req, res) => {
  try {
    const items = await MenuItem.find({ restaurantId: req.params.restaurantId })
      .sort({ category: 1, name: 1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();

const MenuItem = require('../models/MenuItem');
const Restaurant = require('../models/Restaurant');

const {
  protect,
  restaurantOnly
} = require('../middleware/authMiddleware');

/**
 * PATCH /api/menu/:id
 */
router.patch('/:id', protect, restaurantOnly, async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ msg: 'Menu item not found' });
    }

    const restaurant = await Restaurant.findOne({
      _id: item.restaurantId,
      ownerId: req.user.id
    });

    if (!restaurant) {
      return res.status(403).json({ msg: 'You do not own this restaurant' });
    }

    const available =
      req.body.available !== undefined
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
 */
router.post('/', protect, restaurantOnly, async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      restaurantId
    } = req.body;

    const restaurant = await Restaurant.findOne({
      _id: restaurantId,
      ownerId: req.user.id
    });

    if (!restaurant) {
      return res.status(403).json({
        msg: 'You do not own this restaurant'
      });
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
 */
router.get('/:restaurantId', protect, async (req, res) => {
  try {
    const items = await MenuItem.find({
      restaurantId: req.params.restaurantId
    });

    res.json(items);

  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

module.exports = router;

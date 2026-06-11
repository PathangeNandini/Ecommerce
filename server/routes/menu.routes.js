const express = require('express');
const router = express.Router();
const MenuItem = require('../models/MenuItem');
const Restaurant = require('../models/Restaurant');
const { protect, restaurantOnly } = require('../middleware/authMiddleware');

// GET /api/menu/mine — get all menu items for the logged-in owner's restaurant
router.get('/mine', protect, restaurantOnly, async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ ownerId: req.user.id });
    if (!restaurant) return res.status(404).json({ msg: 'No restaurant found for this account' });
    const items = await MenuItem.find({ restaurantId: restaurant._id }).sort({ category: 1, name: 1 });
    res.json(items);
  } catch (err) { res.status(500).json({ msg: err.message }); }
});

// POST /api/menu — add new item
router.post('/', protect, restaurantOnly, async (req, res) => {
  try {
    const { name, description, price, category } = req.body;
    if (!name || !price) return res.status(400).json({ msg: 'Name and price are required' });

    const restaurant = await Restaurant.findOne({ ownerId: req.user.id });
    if (!restaurant) return res.status(404).json({ msg: 'No restaurant found for this account' });

    const item = await MenuItem.create({
      restaurantId: restaurant._id,
      name, description, price, category, available: true
    });
    res.status(201).json(item);
  } catch (err) { res.status(500).json({ msg: err.message }); }
});

// PUT /api/menu/:id — update item
router.put('/:id', protect, restaurantOnly, async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id);
    if (!item) return res.status(404).json({ msg: 'Item not found' });

    const restaurant = await Restaurant.findOne({ _id: item.restaurantId, ownerId: req.user.id });
    if (!restaurant) return res.status(403).json({ msg: 'Not authorized' });

    const updated = await MenuItem.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) { res.status(500).json({ msg: err.message }); }
});

// PATCH /api/menu/:id — toggle availability
router.patch('/:id', protect, restaurantOnly, async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id);
    if (!item) return res.status(404).json({ msg: 'Item not found' });

    const restaurant = await Restaurant.findOne({ _id: item.restaurantId, ownerId: req.user.id });
    if (!restaurant) return res.status(403).json({ msg: 'Not authorized' });

    const available = req.body.available !== undefined ? req.body.available : !item.available;
    const updated = await MenuItem.findByIdAndUpdate(req.params.id, { available }, { new: true });
    res.json({ item: updated });
  } catch (err) { res.status(500).json({ msg: err.message }); }
});

// DELETE /api/menu/:id
router.delete('/:id', protect, restaurantOnly, async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id);
    if (!item) return res.status(404).json({ msg: 'Item not found' });

    const restaurant = await Restaurant.findOne({ _id: item.restaurantId, ownerId: req.user.id });
    if (!restaurant) return res.status(403).json({ msg: 'Not authorized' });

    await item.deleteOne();
    res.json({ msg: 'Deleted' });
  } catch (err) { res.status(500).json({ msg: err.message }); }
});

// GET /api/menu/:restaurantId — public (no auth required)
router.get('/:restaurantId', async (req, res) => {
  try {
    const items = await MenuItem.find({ restaurantId: req.params.restaurantId });
    res.json(items);
  } catch (err) { res.status(500).json({ msg: err.message }); }
});

module.exports = router;
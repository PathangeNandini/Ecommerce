const Restaurant = require('../models/Restaurant');
const MenuItem = require('../models/MenuItem');

/** GET /api/restaurants/nearby */
exports.getNearby = async (req, res) => {
  try {
    const { lat, lng, radius = 500, cuisine, minRating, page = 0 } = req.query;

    if (!lat || !lng)
      return res.status(400).json({ msg: 'Latitude and longitude are required' });

    const limit = 8;
    const skip = parseInt(page) * limit;

    const geoNearStage = {
      $geoNear: {
        near: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
        distanceField: 'distance',
        maxDistance: parseFloat(radius) * 1000,
        spherical: true
      }
    };

    const matchFilters = { isOpen: true };
    if (cuisine && cuisine !== 'All') matchFilters.cuisine = new RegExp(cuisine, 'i');
    if (minRating) matchFilters.rating = { $gte: parseFloat(minRating) };

    const pipeline = [
      geoNearStage,
      { $match: matchFilters },
      { $sort: { distance: 1 } },
      { $skip: skip },
      { $limit: limit },
      { $addFields: { distanceKm: { $round: [{ $divide: ['$distance', 1000] }, 1] } } }
    ];

    const restaurants = await Restaurant.aggregate(pipeline);
    res.json({ results: restaurants, page: parseInt(page), count: restaurants.length, hasMore: restaurants.length === limit });
  } catch (err) {
    console.error('Restaurant fetch error:', err);
    res.status(500).json({ msg: err.message });
  }
};

/** GET /api/restaurants/mine — restaurant owner */
exports.getMyRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ ownerId: req.user.id });
    if (!restaurant) return res.status(404).json({ msg: 'No restaurant found for this account' });
    res.json(restaurant);
  } catch (err) { res.status(500).json({ msg: err.message }); }
};

/** PATCH /api/restaurants/mine/toggle — open/close restaurant */
exports.toggleOpen = async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ ownerId: req.user.id });
    if (!restaurant) return res.status(404).json({ msg: 'Restaurant not found' });

    restaurant.isOpen = !restaurant.isOpen;
    await restaurant.save();
    res.json({ isOpen: restaurant.isOpen });
  } catch (err) { res.status(500).json({ msg: err.message }); }
};

/** GET /api/restaurants/:id */
exports.getById = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) return res.status(404).json({ msg: 'Restaurant not found' });

    const menuItems = await MenuItem.find({ restaurantId: req.params.id, available: true });
    res.json({ restaurant, menuItems });
  } catch (err) { res.status(500).json({ msg: err.message }); }
};

/** POST /api/restaurants */
exports.create = async (req, res) => {
  try {
    const { name, cuisine, address, lat, lng } = req.body;
    const restaurant = await Restaurant.create({
      name, cuisine, address,
      location: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
      ownerId: req.user.id
    });
    res.status(201).json(restaurant);
  } catch (err) { res.status(500).json({ msg: err.message }); }
};
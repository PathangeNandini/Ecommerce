const Restaurant = require('../models/Restaurant');
const MenuItem = require('../models/MenuItem');

/**
 * GET /api/restaurants/nearby
 * 
 * Find restaurants near the user's location using MongoDB's $geoNear aggregation.
 * 
 * How $geoNear works:
 *   1. Looks at the 2dsphere index on Restaurant.location
 *   2. Calculates distance from the given point to each restaurant
 *   3. Filters by maxDistance, then applies any additional $match filters
 *   4. Returns results sorted by distance (nearest first)
 * 
 * Query params:
 *   lat       - user's latitude (required)
 *   lng       - user's longitude (required)
 *   radius    - search radius in km (default: 5)
 *   cuisine   - filter by cuisine type (optional)
 *   minRating - minimum rating filter (optional)
 *   page      - page number for pagination (default: 0)
 */
exports.getNearby = async (req, res) => {
  try {
    const {
      lat,
      lng,
      radius = 5,
      cuisine,
      minRating,
      page = 0
    } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ msg: 'lat and lng query parameters are required' });
    }

    const limit = 10;
    const skip = parseInt(page) * limit;

    // Build the $geoNear stage (MUST be the first stage in the pipeline)
    const geoNearStage = {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [parseFloat(lng), parseFloat(lat)] // [lng, lat] order!
        },
        distanceField: 'distance',          // Adds a 'distance' field (in meters)
        maxDistance: parseFloat(radius) * 1000, // Convert km to meters
        spherical: true                      // Use spherical (earth) geometry
      }
    };

    // Build optional filter stages
    const matchFilters = {};
    if (cuisine) matchFilters.cuisine = new RegExp(cuisine, 'i');
    if (minRating) matchFilters.rating = { $gte: parseFloat(minRating) };
    matchFilters.isOpen = true;

    const pipeline = [
      geoNearStage,
      { $match: matchFilters },
      { $sort: { distance: 1, rating: -1 } },  // Nearest first, then by rating
      { $skip: skip },
      { $limit: limit },
      {
        // Add a distanceKm field rounded to 1 decimal
        $addFields: {
          distanceKm: { $round: [{ $divide: ['$distance', 1000] }, 1] }
        }
      }
    ];

    const restaurants = await Restaurant.aggregate(pipeline);

    res.json({
      results: restaurants,
      page: parseInt(page),
      count: restaurants.length,
      hasMore: restaurants.length === limit
    });
  } catch (err) {
    console.error('getNearby error:', err.message);
    res.status(500).json({ msg: err.message });
  }
};

/**
 * GET /api/restaurants/:id
 * Returns a single restaurant with its full menu.
 */
exports.getById = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ msg: 'Restaurant not found' });
    }

    // Fetch all available menu items for this restaurant
    const menuItems = await MenuItem.find({
      restaurantId: req.params.id,
      available: true
    }).sort({ category: 1, name: 1 });

    // Group menu items by category for easier UI rendering
    const menuByCategory = menuItems.reduce((acc, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    }, {});

    res.json({ restaurant, menu: menuByCategory, menuItems });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

/**
 * POST /api/restaurants
 * Create a new restaurant. Only for restaurant-role users.
 */
exports.create = async (req, res) => {
  try {
    const { name, cuisine, address, lat, lng } = req.body;

    const restaurant = await Restaurant.create({
      name,
      cuisine,
      address,
      location: {
        type: 'Point',
        coordinates: [parseFloat(lng), parseFloat(lat)] // [lng, lat]
      },
      ownerId: req.user.id
    });

    res.status(201).json(restaurant);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

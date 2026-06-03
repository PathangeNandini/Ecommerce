const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Verifies the Bearer JWT in the Authorization header.
 * Attaches the full user document to req.user.
 */
const protect = async (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }
  try {
    const token = auth.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) return res.status(401).json({ message: 'User not found' });
    next();
  } catch {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

/**
 * Generic role-based guard. Pass one or more allowed roles.
 * Example: authorize('restaurant', 'courier')
 */
const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res
      .status(403)
      .json({ message: `Role '${req.user.role}' is not authorized for this route` });
  }
  next();
};

/**
 * Shorthand guards for specific roles.
 * These were referenced in routes but were missing — now defined here.
 */
const restaurantOnly = authorize('restaurant');
const courierOnly = authorize('courier');
const consumerOnly = authorize('consumer');

module.exports = { protect, authorize, restaurantOnly, courierOnly, consumerOnly };
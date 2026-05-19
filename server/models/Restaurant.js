const mongoose = require('mongoose');

/**
 * Restaurant model
 * 
 * The location field uses GeoJSON format:
 *   { type: "Point", coordinates: [longitude, latitude] }
 * 
 * NOTE: MongoDB uses [longitude, latitude] order (opposite of what most
 * people expect). Always store as [lng, lat].
 * 
 * The 2dsphere index on `location` enables $geoNear aggregation queries
 * which find restaurants within a given radius in kilometers.
 */
const restaurantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Restaurant name is required'],
    trim: true
  },
  cuisine: {
    type: String,
    trim: true
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  address: {
    type: String,
    trim: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: [true, 'Coordinates are required']
    }
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isOpen: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

// CRITICAL: This index is required for $geoNear to work.
// Without it, MongoDB throws: "Unable to find index for $geoNear query"
restaurantSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Restaurant', restaurantSchema);

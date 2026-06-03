const mongoose = require('mongoose');

/**
 * Connect to MongoDB Atlas using the MONGO_URI env variable.
 * Note: useNewUrlParser and useUnifiedTopology were removed in Mongoose 7.
 * Passing them causes deprecation warnings on v6 and crashes on v7+.
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
Food Delivery App – Backend Architecture & Real-Time System

A full-stack food delivery application focused on scalable backend architecture, real-time communication, geospatial restaurant search, and secure authentication.

This project demonstrates how modern food delivery platforms work internally using technologies like MongoDB, Express.js, React, Socket.io, and JWT authentication.

🚀 Features
🔐 JWT Authentication & Authorization
🧂 Password Hashing with bcrypt
📍 Geospatial Restaurant Search using MongoDB
🗺️ Nearby Restaurant Discovery with 2dsphere
🛒 Smart Cart Management
⚡ Real-Time Order Updates with Socket.io
🍽️ Restaurant & Consumer Dashboards
📦 MongoDB Atlas Cloud Database
🔄 Context API State Management
🌐 REST API Architecture
📱 Responsive Frontend using React + Vite
🏗️ Tech Stack
Frontend
React.js
Vite
Axios
Context API
Socket.io Client
Backend
Node.js
Express.js
MongoDB Atlas
Mongoose
JWT Authentication
bcrypt
Socket.io
📂 Project Architecture
food-delivery-app/
│
├── client/                 # React Frontend
│   ├── src/
│   ├── components/
│   ├── pages/
│   └── context/
│
├── server/                 # Express Backend
│   ├── controllers/
│   ├── routes/
│   ├── middleware/
│   ├── models/
│   ├── sockets/
│   └── config/
│
├── package.json
└── README.md
🔐 Authentication Flow
JWT Authentication Process
User registers or logs in.
Password is hashed using bcrypt.
Backend generates a JWT token.
Frontend stores the token.
Token is attached to protected API requests.
Middleware verifies the token before access.
👤 User Roles

The application supports multiple user roles:

Consumer → Places food orders
Restaurant → Manages menu & orders
Courier → Handles delivery tracking

Role-based access helps secure dashboards and APIs.

🗄️ MongoDB & Mongoose
Why MongoDB?

MongoDB is used because food delivery applications contain:

Flexible menu structures
Nested reviews
Dynamic order data
Location-based searches
Why Mongoose?

Mongoose provides:

Schema validation
Cleaner data models
Middleware support
Better error handling
📍 Geospatial Restaurant Search
GeoJSON Format

Restaurant locations are stored using GeoJSON:

location: {
  type: "Point",
  coordinates: [longitude, latitude]
}

⚠️ Coordinate order is important.

Correct:

[longitude, latitude]

Wrong order may place restaurants in incorrect locations.

🌍 2dsphere Index

MongoDB uses a 2dsphere index for fast location-based queries.

restaurantSchema.index({ location: "2dsphere" });

This enables:

Nearby restaurant search
Distance calculation
Radius filtering
🔎 $geoNear Aggregation

MongoDB’s $geoNear aggregation stage is used to:

Find nearby restaurants
Calculate distances
Sort results
Apply filters
Support pagination

Example:

{
  $geoNear: {
    near: {
      type: "Point",
      coordinates: [lng, lat]
    },
    distanceField: "distance",
    maxDistance: 5000,
    spherical: true
  }
}

📌 MongoDB stores distances in meters.

🛒 Cart Logic

The cart system prevents users from ordering from multiple restaurants at the same time.

Why?

This avoids:

Delivery confusion
Order mismatch
Incorrect pricing

Total price is dynamically calculated to maintain consistency.

⚡ Socket.io Real-Time Updates
Order Flow
Consumer places an order
Restaurant receives update instantly
Restaurant accepts/rejects order
Consumer receives live status updates

No page refresh required.

🔄 Why Socket.io?

Socket.io is used instead of polling because it provides:

Faster communication
Lower server load
Real-time bidirectional updates
Better user experience
🌐 API Architecture

The backend follows REST API principles.

Example Routes
Authentication
POST /api/auth/register
POST /api/auth/login
Restaurants
GET /api/restaurants/nearby
GET /api/restaurants/:id
Orders
POST /api/orders
GET /api/orders/my-orders
PATCH /api/orders/:id/status
🔒 Middleware Protection

Protected routes use authentication middleware:

verifyToken(req, res, next)

This ensures only authorized users can access secure endpoints.

☁️ MongoDB Atlas Setup
Create MongoDB Atlas cluster
Add IP whitelist
Create database user
Copy connection string
Store in .env

Example:

MONGO_URI=your_mongodb_connection
JWT_SECRET=your_secret_key
🧪 Seed Data

Real restaurant coordinates from Google Maps are recommended for testing.

Using fake coordinates may produce incorrect search results.

🧠 State Management
Context API

Used for:

Authentication state
Cart state
Shared application data

This avoids unnecessary prop drilling.

🚀 Production-Grade Improvements

Future enhancements include:

Refresh Tokens
Redis Caching
Payment Gateway Integration
Courier Live Tracking using Leaflet.js
Playwright End-to-End Testing
Docker Deployment
CI/CD Pipelines
Monitoring & Logging
📸 Reference Features
Real-time order tracking
Restaurant dashboards
Nearby restaurant discovery
Secure authentication system
Live order updates
💡 Key Learning Outcomes

This project demonstrates:

Backend architecture design
JWT authentication systems
MongoDB geospatial queries
Real-time systems with Socket.io
State management concepts
Scalable API development
Production-level thinking
⭐ Why This Project Matters

This is more than a CRUD application.

It demonstrates understanding of:

Real-world system design
Authentication workflows
Geospatial indexing
Real-time communication
Scalable backend architecture

Perfect for:

Internship portfolios
Full-stack developer resumes
Backend engineering practice
MERN stack learning
🛠️ Installation
Clone Repository
git clone <your-repository-url>
Install Dependencies
Backend
cd server
npm install
Frontend
cd client
npm install
▶️ Run Project
Start Backend
npm run dev
Start Frontend
npm run dev
📌 Environment Variables

Create a .env file:

PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret
CLIENT_URL=http://localhost:5173

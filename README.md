# 🍔 FoodRush – Food Delivery Platform

A full-stack food delivery application built with the MERN stack, featuring real-time order updates, geospatial restaurant search, role-based dashboards, and a smart cart system.

This project demonstrates how modern food delivery platforms work internally using MongoDB, Express.js, React, Socket.io, and JWT authentication.

---

## 🚀 Features

- 🔐 JWT Authentication & Role-Based Authorization
- 🧂 Password Hashing with bcrypt
- 📍 Geospatial Restaurant Search using MongoDB 2dsphere
- 🗺️ Nearby Restaurant Discovery with distance calculation
- 🛒 Smart Cart Management with conflict detection
- ⚡ Real-Time Order Updates with Socket.io
- 🍽️ Consumer, Merchant & Courier Dashboards
- 📦 MongoDB Atlas Cloud Database
- 🔄 Context API State Management
- 🌐 REST API Architecture
- 📱 Fully Responsive Frontend using React + Vite

---

## 🏗️ Tech Stack

### Frontend
- React.js + Vite
- Axios
- Context API
- Socket.io Client
- React Router DOM

### Backend
- Node.js + Express.js
- MongoDB Atlas + Mongoose
- JWT Authentication
- bcrypt
- Socket.io

---

## 📂 Project Structure

```
food-delivery-app/
│
├── client/                   # React Frontend
│   └── src/
│       ├── components/       # Navbar, CartSidebar
│       ├── context/          # AuthContext, CartContext
│       └── pages/
│           ├── consumer/     # Home, RestaurantDetail, Cart, Orders
│           ├── merchant/     # ManageMenu, ManageOrders, Owner Dashboard
│           └── courier/      # DeliveryHome, ActiveDelivery, DeliveryHistory
│
├── server/                   # Express Backend
│   ├── controllers/          # auth, restaurant, order, menu
│   ├── routes/               # auth, restaurant, order, menu routes
│   ├── middleware/           # authMiddleware (JWT verification)
│   ├── models/               # User, Restaurant, MenuItem, Order
│   ├── config/               # db.js, socket.js
│   └── seed.js               # 50 restaurants × 12 menu items
│
└── README.md
```

---

## 👤 User Roles

| Role | Access |
|------|--------|
| Consumer | Browse restaurants, manage cart, place & track orders |
| Restaurant Owner | Manage menu items, view & update incoming orders |
| Courier | View assigned deliveries, update delivery status |

Role-based middleware secures all dashboards and API endpoints.

---

## 🔐 Authentication Flow

1. User registers or logs in
2. Password is hashed using bcrypt before storage
3. Backend generates a signed JWT token on success
4. Frontend stores the token and attaches it to all protected requests
5. `verifyToken` middleware validates the token before granting access

---

## 📍 Geospatial Restaurant Search

Restaurant locations are stored as GeoJSON points:

```js
location: {
  type: "Point",
  coordinates: [longitude, latitude]  // ⚠️ longitude first
}
```

A `2dsphere` index enables fast location-based queries:

```js
restaurantSchema.index({ location: "2dsphere" });
```

The `$geoNear` aggregation stage powers nearby search with distance calculation, radius filtering, cuisine filters, rating filters, and pagination.

---

## 🛒 Cart System

The cart prevents ordering from multiple restaurants simultaneously to avoid delivery confusion and order mismatches.

- `CartContext` uses `useRef` to track `restaurantId` without stale closures
- When a user adds an item from a different restaurant, a custom conflict modal appears
- `forceAddItem` clears the existing cart and starts a new one on confirmation
- Total price is calculated dynamically on both frontend and backend

---

## ⚡ Real-Time Order Updates (Socket.io)

```
Consumer places order → Restaurant receives instant notification
Restaurant updates status → Consumer sees live status change
```

Socket.io rooms are used per order and per restaurant:
- `restaurant:{id}` — notifies owner of new orders
- `order:{id}` — pushes status updates to the consumer

No page refresh required.

---

## 🌐 API Routes

### Auth
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login and receive JWT |

### Restaurants
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/restaurants/nearby` | Find restaurants by location |
| GET | `/api/restaurants/:id` | Get restaurant + menu items |

### Orders
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/orders` | Place a new order |
| GET | `/api/orders/my` | Get current user's orders |
| PATCH | `/api/orders/:id/status` | Update order status |

---

## 🗄️ Database Models

- **User** — name, email, password (hashed), role
- **Restaurant** — name, cuisine, address, location (GeoJSON), rating, ownerId
- **MenuItem** — name, description, price, category, available, restaurantId
- **Order** — userId, restaurantId, items (snapshot), totalPrice, status, deliveryAddress

---

## 🛠️ Installation & Setup

### 1. Clone the repository
```bash
git clone <your-repository-url>
cd food-delivery-app
```

### 2. Install dependencies

```bash
# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

### 3. Configure environment variables

Create a `.env` file inside the `server/` folder:

```env
PORT=5000
MONGO_URI=your_mongodb_atlas_uri
JWT_SECRET=your_secret_key
CLIENT_URL=http://localhost:5173
```

### 4. Seed the database

```bash
cd server
node seed.js
```

This creates 50 restaurants across Chennai with 600 menu items and test accounts:
- **Customer:** customer@test.com / password123
- **Owner:** owner@test.com / password123

### 5. Run the project

```bash
# Start backend (from /server)
npm run dev

# Start frontend (from /client)
npm run dev
```

Frontend runs on `http://localhost:5173` — Backend runs on `http://localhost:5000`

---

## 🚀 Production-Grade Future Improvements

- Refresh token rotation
- Redis caching for restaurant listings
- Payment gateway integration
- Courier live tracking with Leaflet.js
- Docker deployment + CI/CD pipelines
- End-to-end testing with Playwright
- Monitoring & logging (Winston + Sentry)

---

## 💡 Key Learning Outcomes

- Backend architecture design with Express.js
- JWT authentication and role-based access control
- MongoDB geospatial indexing and aggregation pipelines
- Real-time bidirectional communication with Socket.io
- React Context API for global state management
- Debugging stale closures in React hooks
- End-to-end order flow from cart to delivery

---

## 🧪 Test Accounts

| Role | Email | Password |
|------|-------|----------|
| Consumer | customer@test.com | password123 |
| Owner | owner@test.com | password123 |

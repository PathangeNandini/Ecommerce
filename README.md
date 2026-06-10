# 🍔 FoodRush – Food Delivery Platform

A full-stack food delivery application built with the MERN stack, featuring real-time order updates, geospatial restaurant search, role-based dashboards, and a smart cart system.

This project demonstrates how modern food delivery platforms work internally using MongoDB, Express.js, React, Socket.io, and JWT authentication.

---

## 📸 Screenshots

**Consumer Home**
![Home](https://github.com/user-attachments/assets/95bdacd4-563a-456c-b98f-24eac24c95a6)

**Restaurant Detail**
![Restaurant](https://github.com/user-attachments/assets/d73dd55b-5a54-4e26-8d85-dacaed43aa68)

**Order Tracking**
![Tracking](https://github.com/user-attachments/assets/514b7a02-1a3c-488e-83ad-84a9f3727356)

**Cart Sidebar**
![Cart](https://github.com/user-attachments/assets/c5d35fc5-0b67-4516-bfff-a8a8352bbf5b)

**Conflict Modal**
![Conflict](https://github.com/user-attachments/assets/ac775c79-84e8-4cdf-8d18-9fbe28eb0009)

**Owner Dashboard**
![Owner](https://github.com/user-attachments/assets/c6bacbc1-cbc7-448c-8887-f18ff3d35a8a)

**Courier Dashboard**
![Courier](https://github.com/user-attachments/assets/883519ce-7954-4629-9d9e-4a049244a6d2)

**Order Status**
![Status](https://github.com/user-attachments/assets/6661170e-b144-40fd-9e02-a74fa7b5e9c6)

---

## 🚀 Features

### Consumer
- 🔍 Browse nearby restaurants with geospatial search
- 🍽️ Filter by cuisine, rating, and distance
- 🛒 Smart cart with multi-restaurant conflict detection
- 📦 Place orders with delivery address
- 📍 Live order tracking with real-time status updates

### Restaurant Owner
- 🏪 Owner dashboard with daily revenue and order count
- 📋 View and accept incoming orders in real time
- 🍱 Manage menu items (add, edit, toggle availability)
- ⚙️ Restaurant settings and open/close toggle

### Courier
- 🛵 View available deliveries
- ✅ Accept and manage active deliveries
- 🔄 Update status: Courier Assigned → On the Way → Delivered
- 📜 Delivery history

### Platform
- 🔐 JWT Authentication with role-based authorization
- 🧂 Password hashing with bcrypt
- ⚡ Real-time updates with Socket.io (no page refresh)
- 📱 Fully responsive frontend

---

## 🏗️ Tech Stack

### Frontend
- React.js + Vite
- Axios
- Context API (AuthContext, CartContext)
- Socket.io Client
- React Router DOM
- Google Fonts (Syne + DM Sans)

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
├── client/                      # React Frontend
│   └── src/
│       ├── components/          # Navbar, CartSidebar
│       ├── context/             # AuthContext, CartContext
│       ├── hooks/               # useSocket
│       └── pages/
│           ├── Home.jsx         # Restaurant discovery
│           ├── RestaurantDetail.jsx
│           ├── OrderStatus.jsx  # Live order tracking
│           ├── Login.jsx
│           ├── Register.jsx
│           ├── merchant/        # ManageMenu, ManageOrders, OwnerDashboard
│           └── courier/         # DeliveryHome, ActiveDelivery, DeliveryHistory
│
├── server/                      # Express Backend
│   ├── controllers/             # auth, restaurant, order, menu
│   ├── routes/                  # auth, restaurant, order, menu routes
│   ├── middleware/              # authMiddleware (JWT verification)
│   ├── models/                  # User, Restaurant, MenuItem, Order
│   ├── config/                  # db.js, socket.js
│   └── seed.js                  # 50 restaurants × 12 menu items
│
└── README.md
```

---

## 👤 User Roles

| Role | Access |
|------|--------|
| Consumer | Browse restaurants, manage cart, place & track orders |
| Restaurant Owner | Manage menu items, view & accept incoming orders in real time |
| Courier | View available deliveries, update delivery status live |

Role-based middleware secures all dashboards and API endpoints.

---

## 🔐 Authentication Flow

1. User registers with name, email, password, and role
2. Password is hashed using bcrypt before storage
3. Backend generates a signed JWT token on success
4. Frontend stores the token and attaches it to all protected requests via Axios interceptor
5. `verifyToken` middleware validates the token before granting access to protected routes
6. Each role is redirected to its own dashboard after login

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

The `$geoNear` aggregation stage powers nearby search with:
- Distance calculation in km
- Configurable radius filtering
- Cuisine and rating filters
- Pagination support
- Automatic fallback to Chennai coordinates if location is denied

---

## 🛒 Cart System

The cart prevents ordering from multiple restaurants simultaneously.

- `CartContext` uses `useRef` to track `restaurantId` without stale closures
- When a user adds an item from a different restaurant, a **custom styled conflict modal** appears
- `forceAddItem` clears the existing cart and starts a new one on confirmation
- `CartSidebar` passes the real `restaurantId` to `addItem` (not null) to avoid corrupting cart state
- Total price is calculated dynamically on both frontend and backend

---

## ⚡ Real-Time Order Updates (Socket.io)

```
Consumer places order  →  Restaurant receives instant notification
Restaurant accepts     →  Consumer sees "Preparing" live
Courier picks up       →  Consumer sees "Courier Assigned" live
Courier marks transit  →  Consumer sees "On the Way" live
Courier delivers       →  Consumer sees "Delivered" live
```

Socket.io rooms used:
- `restaurant:{id}` — notifies owner of new orders
- `order:{id}` — pushes status updates to the consumer
- `owner:all` — broadcasts all incoming orders to the owner dashboard

No page refresh required at any stage.

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
| GET | `/api/restaurants/mine` | Get owner's restaurant |
| PATCH | `/api/restaurants/mine/toggle` | Toggle restaurant open/close |
| GET | `/api/restaurants/:id` | Get restaurant + menu items |
| POST | `/api/restaurants` | Create a new restaurant |

### Menu
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/menu/:restaurantId` | Get menu items |
| POST | `/api/menu` | Add a menu item (owner only) |
| PATCH | `/api/menu/:id` | Update a menu item (owner only) |
| DELETE | `/api/menu/:id` | Delete a menu item (owner only) |

### Orders
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/orders` | Place a new order |
| GET | `/api/orders/my` | Get consumer's order history |
| GET | `/api/orders/pending` | Get pending orders (owner) |
| GET | `/api/orders/all-pending` | Get all pending orders (owner) |
| GET | `/api/orders/available-deliveries` | Get orders ready for pickup (courier) |
| GET | `/api/orders/my-deliveries` | Get courier's delivery history |
| GET | `/api/orders/:id` | Get a single order |
| PATCH | `/api/orders/:id/status` | Update order status |

---

## 🗄️ Database Models

### User
- name, email, password (hashed), role (`consumer` / `restaurant` / `courier`)

### Restaurant
- name, cuisine, address, location (GeoJSON Point), rating, isOpen, ownerId

### MenuItem
- name, description, price, category, available, restaurantId

### Order
- userId, restaurantId, items (snapshot with name, price, quantity), totalPrice, status, deliveryAddress, courierId

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

This creates 50 restaurants across Chennai with 600 menu items and test accounts.

### 5. Run the project

```bash
# Start backend (from /server)
npm run dev

# Start frontend (from /client)
npm run dev
```

Frontend runs on `http://localhost:5173` — Backend runs on `http://localhost:5000`

---

## 🧪 Test Accounts

| Role | Email | Password |
|------|-------|----------|
| Consumer | customer@test.com | password123 |
| Restaurant Owner | owner@test.com | password123 |
| Courier | courier@test.com | password123 |

---

## 🐛 Key Bugs Fixed During Development

| Bug | Root Cause | Fix |
|-----|-----------|-----|
| Cart items not adding | `restaurant._id` undefined due to API response shape mismatch | Used `data.restaurant ?? data` fallback |
| Cart state corrupted after opening sidebar | `CartSidebar` passed `null` as `restaurantId` to `addItem` | Passed real `restaurantId` from context |
| `window.confirm` ugly browser dialog | Confirmation dialog was inside `CartContext` | Moved to UI with custom styled modal |
| Restaurants not loading | Location denied with no fallback | Added Chennai coordinates as default fallback |
| Orders not showing in owner dashboard | Dashboard filtered by single `ownerId` | Updated to fetch all orders across restaurants |
| Order item price showing NaN | `item.price` undefined in order snapshot | Used `item.totalPrice ?? item.price * item.quantity` |
| Courier navigation broken | Route mismatch `/courier/active` vs `/delivery/active` | Aligned all navigate calls with App.jsx routes |

---

## 🚀 Future Improvements

- Refresh token rotation
- Redis caching for restaurant listings
- Payment gateway integration (Razorpay)
- Courier live GPS tracking with Leaflet.js
- Push notifications (Firebase FCM)
- Docker deployment + CI/CD pipelines
- End-to-end testing with Playwright
- Monitoring & logging (Winston + Sentry)
- Admin panel for platform management

---

## 💡 Key Learning Outcomes

- Backend architecture design with Express.js
- JWT authentication and role-based access control
- MongoDB geospatial indexing and aggregation pipelines
- Real-time bidirectional communication with Socket.io
- React Context API for global state management
- Debugging stale closures in React hooks (`useRef` pattern)
- End-to-end order flow from cart to delivery
- Debugging API response shape mismatches
- Socket.io room-based event broadcasting

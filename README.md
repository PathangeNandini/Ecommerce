# 🍔 FoodRush – Integrated Food Delivery & Dine-Out Hospitality Platform

A full-stack food delivery and hospitality application built with the MERN stack, featuring real-time order updates, geospatial restaurant search, role-based dashboards, gamified reviews, table reservations, and a mock payment gateway.

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
- 💳 Mock payment gateway (Card, UPI, Cash on Delivery)
- ⭐ Gamified review system with reward points and photo upload
- 🪑 Table reservation with real-time slot availability
- 📅 View and cancel reservations

### Restaurant Owner
- 🏪 Owner dashboard with 7-day revenue chart
- 📋 View and accept incoming orders in real time
- 🍱 Manage menu items (add, edit, toggle availability)
- ⚙️ Restaurant settings and open/close toggle
- 📊 Daily revenue aggregates and order count

### Courier
- 🛵 View available deliveries
- ✅ Accept and manage active deliveries
- 🔄 Update status: Courier Assigned → On the Way → Delivered
- 💰 Earnings tracker (today, this week, all time)
- 📜 Delivery history

### Platform
- 🔐 JWT Authentication with role-based authorization
- 🧂 Password hashing with bcrypt
- ⚡ Real-time updates with Socket.io (no page refresh)
- 📱 Fully responsive frontend
- 🐳 Docker containerization (client + server + nginx)
- 🔁 GitHub Actions CI pipeline
- 🧪 WebSocket reconnection tests (7 passing)
- 📈 MongoDB index optimization with explain() verification

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
- Multer (photo uploads)

---

## 📂 Project Structure
food-delivery-app/
│
├── client/                      # React Frontend
│   └── src/
│       ├── components/          # Navbar, CartSidebar
│       ├── context/             # AuthContext, CartContext
│       ├── hooks/               # useSocket
│       └── pages/
│           ├── Home.jsx
│           ├── RestaurantDetail.jsx
│           ├── OrderStatus.jsx
│           ├── Payment.jsx
│           ├── PaymentSuccess.jsx
│           ├── Review.jsx
│           ├── Reservation.jsx
│           ├── MyReservations.jsx
│           ├── Login.jsx
│           ├── Register.jsx
│           ├── merchant/        # ManageMenu, ManageOrders, OwnerDashboard
│           └── courier/         # DeliveryHome, ActiveDelivery, DeliveryHistory
│
├── server/                      # Express Backend
│   ├── controllers/             # auth, restaurant, order, menu, payment, review, reservation
│   ├── routes/                  # all route files
│   ├── middleware/              # authMiddleware, upload (multer)
│   ├── models/                  # User, Restaurant, MenuItem, Order, Review, Reservation
│   ├── scripts/                 # createIndexes.js
│   ├── tests/                   # socket.test.js, indexes.test.js
│   └── seed.js
│
├── Dockerfile.client
├── Dockerfile.server
├── docker-compose.yml
├── nginx.conf
└── README.md

---

## 👤 User Roles

| Role | Access |
|------|--------|
| Consumer | Browse restaurants, manage cart, place & track orders, pay, review, reserve tables |
| Restaurant Owner | Manage menu items, view & accept incoming orders, revenue chart |
| Courier | View available deliveries, update delivery status, track earnings |

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

The `$geoNear` aggregation pipeline powers nearby search with a combined score:

```js
score = (normalizedDistance × 0.6) + (normalizedRating × 0.4)
```

This means a highly rated restaurant slightly farther away ranks above a poorly rated nearby one. Additional features include cuisine and rating filters, pagination, and automatic fallback to Chennai coordinates if location is denied.

---

## 🛒 Cart System

The cart prevents ordering from multiple restaurants simultaneously.

- `CartContext` uses `useRef` to track `restaurantId` without stale closures
- When a user adds an item from a different restaurant, a **custom styled conflict modal** appears
- `forceAddItem` clears the existing cart and starts a new one on confirmation
- `CartSidebar` passes the real `restaurantId` to `addItem` to avoid corrupting cart state
- Total price is calculated dynamically on both frontend and backend

---

## 💳 Payment Gateway

A simulated payment gateway handles the full transaction flow:

- Supports Card, UPI, and Cash on Delivery
- `POST /api/payments/charge` simulates a successful charge and updates order `paymentStatus`
- Returns a mock transaction ID and confirmation
- Consumer is redirected to a payment success page with transaction details
- Order tracking continues after payment confirmation

---

## ⭐ Gamified Review Engine

Reviews are scored based on quality to incentivize detailed feedback:

| Condition | Points Awarded |
|-----------|---------------|
| Base points (any review) | +10 |
| 5+ meaningful words | +5 |
| 10+ meaningful words | +10 |
| 20+ meaningful words | +20 |
| 5-star rating | +5 |
| Photo uploaded | +15 |

Points are added to the user's `rewardPoints` balance automatically. The restaurant's average rating is recalculated on every new review.

Keyword suggestions are powered by the user's own order history — if you ordered Butter Chicken, the system suggests words like "buttery", "chicken", "portions", "flavour". Falls back to general keywords if no order history exists.

---

## 🪑 Table Reservation System

- Consumers can book tables at any restaurant that accepts reservations
- Available time slots are fetched in real time based on date selected
- Each slot shows how many tables are still available
- Party size selector (1–20 people)
- Special requests field
- Instant confirmation with table number assigned
- Cancel reservation from My Reservations page
- Restaurant owners can view all upcoming reservations

---

## ⚡ Real-Time Order Updates (Socket.io)
Consumer places order  →  Restaurant receives instant notification
Restaurant accepts     →  Consumer sees "Preparing" live
Courier picks up       →  Consumer sees "Courier Assigned" live
Courier marks transit  →  Consumer sees "On the Way" live
Courier delivers       →  Consumer sees "Delivered" live

Socket.io rooms used:
- `restaurant:{id}` — notifies owner of new orders
- `order:{id}` — pushes status updates to the consumer
- `owner:all` — broadcasts all incoming orders to the owner dashboard

WebSocket reconnection is handled gracefully — clients re-join their rooms automatically on reconnect without losing any payload data.

---

## 🌐 API Routes

### Auth
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login and receive JWT |
| PATCH | `/api/auth/profile` | Update user profile |

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
| PATCH | `/api/menu/:id` | Toggle availability (owner only) |
| DELETE | `/api/menu/:id` | Delete a menu item (owner only) |

### Orders
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/orders` | Place a new order |
| GET | `/api/orders/my` | Get consumer's order history |
| GET | `/api/orders/revenue` | Get 7-day revenue chart (owner) |
| GET | `/api/orders/pending` | Get pending orders (owner) |
| GET | `/api/orders/all-pending` | Get all pending orders (owner) |
| GET | `/api/orders/available-deliveries` | Get orders ready for pickup (courier) |
| GET | `/api/orders/my-deliveries` | Get courier's active deliveries |
| GET | `/api/orders/my-earnings` | Get courier's earnings summary |
| GET | `/api/orders/:id` | Get a single order |
| PATCH | `/api/orders/:id/status` | Update order status |

### Payments
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/payments/charge` | Simulate payment charge |
| GET | `/api/payments/status/:orderId` | Get payment status |

### Reviews
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/reviews` | Submit a review (with optional photo) |
| GET | `/api/reviews/my` | Get user's reviews |
| GET | `/api/reviews/my-keywords/:restaurantId` | Get order-history based keywords |
| GET | `/api/reviews/keywords/:restaurantId` | Get general keyword suggestions |
| GET | `/api/reviews/:restaurantId` | Get all reviews for a restaurant |

### Reservations
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/reservations` | Book a table |
| GET | `/api/reservations/my` | Get user's reservations |
| GET | `/api/reservations/slots/:restaurantId` | Get available time slots |
| GET | `/api/reservations/restaurant/:restaurantId` | Get restaurant's reservations (owner) |
| PATCH | `/api/reservations/:id/cancel` | Cancel a reservation |

---

## 🗄️ Database Models

### User
- name, email, password (hashed), role (`consumer` / `restaurant` / `courier`), rewardPoints

### Restaurant
- name, cuisine, address, location (GeoJSON Point), rating, isOpen, ownerId, tablesAvailable, timeSlots, acceptsReservations

### MenuItem
- name, description, price, category, available, restaurantId

### Order
- userId, restaurantId, items (snapshot), totalPrice, status, deliveryAddress, courierId, paymentStatus, paymentDetails

### Review
- userId, restaurantId, orderId, rating, text, photoUrl, pointsAwarded

### Reservation
- userId, restaurantId, date, timeSlot, partySize, specialRequests, status, tableNumber

---

## 🗂️ MongoDB Index Optimization

All frequent query patterns are covered by indexes — verified using `explain()` execution plans:

| Collection | Index | Query Pattern |
|------------|-------|---------------|
| restaurants | `location: 2dsphere` | Geospatial nearby search |
| orders | `userId + createdAt` | Consumer order history |
| orders | `restaurantId + status` | Owner order management |
| orders | `courierId + status` | Courier delivery lookup |
| reviews | `restaurantId + createdAt` | Restaurant review listing |
| reservations | `userId + date` | User reservation history |

No full collection scans (COLLSCAN) on any critical query path.

---

## 🧪 Testing

### WebSocket Reconnection Tests (7 passing)
```bash
cd server
npm test
```

Tests verify:
- Client connects successfully
- Client joins order room and receives updates
- Client reconnects and re-joins room without losing payload
- No payload loss after reconnection
- Multiple clients in same room all receive updates
- Owner room receives order:placed events
- Ping/pong echo with same payload

### MongoDB Index Tests (6 passing)
```bash
npm run test:indexes
```

Tests verify no COLLSCAN on restaurants, orders (userId, restaurantId, courierId), reviews, and reservations.

---

## 🐳 Docker Deployment

```bash
docker-compose up --build
```

App runs at `http://localhost`. nginx proxies `/api/` and `/socket.io/` to the backend container.

---

## 🛠️ Installation & Setup

### 1. Clone the repository
```bash
git clone <your-repository-url>
cd food-delivery-app
```

### 2. Install dependencies
```bash
cd server && npm install
cd ../client && npm install
```

### 3. Configure environment variables

Create `server/.env`:
```env
PORT=5000
MONGO_URI=your_mongodb_atlas_uri
JWT_SECRET=your_secret_key
CLIENT_URL=http://localhost:5173
```

### 4. Create database indexes
```bash
cd server
node scripts/createIndexes.js
```

### 5. Seed the database
```bash
node seed.js
```

### 6. Run the project
```bash
# Backend
cd server && npm run dev

# Frontend
cd client && npm run dev
```

Frontend: `http://localhost:5173` — Backend: `http://localhost:5000`

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
| Order item price showing ₹NaN | `item.price` undefined in order snapshot | Used `item.totalPrice ?? item.price * item.quantity` |
| Courier navigation broken | Route mismatch `/courier/active` vs `/delivery/active` | Aligned all navigate calls with App.jsx routes |
| OrderStatus.jsx encoding corruption | File saved with broken encoding | Rewrote file cleanly from scratch |
| Revenue chart showing today only | getDailyRevenue returned single day aggregate | Rewrote to return 7-day breakdown with zero-fill |
| Index tests failing COLLSCAN | Indexes defined in schema but not yet applied to Atlas | Ran createIndexes.js script to force creation |

---

## 🚀 Future Improvements

- Refresh token rotation
- Redis caching for restaurant listings
- Razorpay live payment integration
- Courier live GPS tracking with Leaflet.js
- Push notifications (Firebase FCM)
- Admin panel for platform management
- End-to-end testing with Playwright
- Monitoring & logging (Winston + Sentry)
- AWS S3 for restaurant images and review photos

---

## 💡 Key Learning Outcomes

- Backend architecture design with Express.js
- JWT authentication and role-based access control
- MongoDB geospatial indexing and aggregation pipelines
- Combined distance + rating scoring algorithm
- Real-time bidirectional communication with Socket.io
- WebSocket room management and reconnection handling
- React Context API for global state management
- Gamified engagement systems (points, keywords, photo bonuses)
- Mock payment gateway implementation
- Table reservation with slot availability logic
- MongoDB explain() query plan analysis
- Docker multi-stage builds with nginx reverse proxy
- GitHub Actions CI pipeline setup
- Debugging stale closures in React hooks (useRef pattern)

# 🍔 Food Delivery App 

A robust, full-stack food delivery application featuring geospatial restaurant discovery, real-time order tracking, and a secure role-based authentication system. This project is built to demonstrate production-grade system design, scalable database architectures, and efficient real-time communication.

---

## 🚀 Architecture Overview

The application is split into a decoupled client-server architecture designed for high performance and scalability:

* **Backend:** Node.js with **Express.js**, interfaces with **MongoDB** via **Mongoose ORM**.
* **Frontend:** **React** powered by **Vite** for lightning-fast development and optimized production builds.
* **State Management:** React **Context API** for global states (Authentication, Cart management).
* **Network Client:** **Axios** with interceptors for seamless JWT injection and API communication.
* **Real-Time Engine:** **Socket.io** for bi-directional, event-driven communication between consumers and restaurants.

---

## 🛠️ Tech Stack & Key Features

### 1. Database & Geospatial Search (MongoDB + Mongoose)
* **Flexible Schema:** Leverages MongoDB’s NoSQL nature to handle highly nested and dynamic data structures like restaurant menus, user reviews, and order histories.
* **Geospatial Indexing (`2dsphere`):** Uses GeoJSON format `[longitude, latitude]` to index restaurant locations.
* **Location-Based Discovery:** Implements MongoDB's `$geoNear` aggregation pipeline to calculate distances in meters, filter, sort, and paginate "restaurants near me" in a single database query.

### 2. Secure Role-Based Authentication (JWT & bcrypt)
* **Password Hashing:** Utilizing `bcrypt` for secure, one-way password hashing before database insertion.
* **Stateless Scaling:** Implements JSON Web Tokens (JWT) for stateless authentication, allowing the backend to scale across multiple servers effortlessly.
* **Role-Based Access Control (RBAC):** Middleware validation isolates routes and dashboards specifically for **Consumers**, **Restaurants**, and **Couriers**.

### 3. Real-Time Order Lifecycle (Socket.io)
* Eliminates inefficient HTTP polling by establishing a persistent WebSocket connection.
* **Live Workflow:** 1. Consumer places an order $\rightarrow$ Server emits event to the specific Restaurant dashboard.
    2. Restaurant accepts/updates order status $\rightarrow$ Server broadcasts live progress to the Consumer UI instantly.

### 4. Smart Cart Logic
* Strict validation prevents users from mixing items from different
* restaurants within a single order.
* Dynamic, server-side price calculation to mitigate frontend data tampering and mismatches.

---
[ Client ]                                     [ Server ]
| --- 1. Register / Login -------------->      |
|                                              | -- 2. Hash password (bcrypt)
|                                              | -- 3. Generate JWT
| <-- 4. Store Token & Respond -----------    |
|                                              |
| --- 5. Request + JWT (Axios Header) --->    |
|                                              | -- 6. Middleware verifies token
| <-- 7. Protected Data / Access ---------     |

### Real-Time Order Flow

[ Consumer UI ]             [ Server (Socket.io) ]             [ Restaurant Dashboard ]
|                               |                                   |
| ----- 1. Place Order -------> |                                   |
|                               | ----- 2. Instant Alert ---------> |
|                               |                                   | (Prepares Food)
|                               | <---- 3. Status Update ("Cooking")|
| <---- 4. Live Update -------- |                                   |

---

## 🔮 Future Production-Grade Enhancements

To transition this project from a strong portfolio piece to a commercial-scale platform, the following roadmap is planned:
* 🔑 **Enhanced Security:** Implement Refresh Tokens alongside Access Tokens for safer session management.
* ⚡ **Performance Optimization:** Introduce **Redis Caching** for frequently queried data like popular restaurants and static menus.
* 📍 **Advanced Mapping:** Integrate **Leaflet.js** on the frontend for precise, visual live courier tracking on a map.
* 💳 **Payment Gateway:** Secure integration with Stripe or Razorpay API for processing transactions.
* 🧪 **Robust Testing:** Implement end-to-end (E2E) testing suites using **Playwright** to ensure seamless user journeys.

---

## ⚙️ Setup and Installation (Local Development)

### Prerequisites
* Node.js (v18+ recommended)
* MongoDB Atlas Account (or local MongoDB instance)

### Backend Setup
1. Clone the repository and navigate to the backend folder:
   ```bash
   cd backend
Install dependencies:

Bash
npm install
Create a .env file in the root of the backend directory and add your credentials:

Code snippet
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_super_secret_jwt_key
Start the development server:

=> npm run dev
**Frontend Setup**
Navigate to the frontend folder:

**Frontend Setup
Navigate to the frontend folder:**
cd ../frontend
Install dependencies:

Install dependencies:
npm install
Start the Vite development server:
Install dependencies:
npm run dev
## 📋 System Workflow & Deep Dives

### JWT Authentication Flow

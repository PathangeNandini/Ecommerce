# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

# 🍔 Food Delivery Platform — Progress Update

## ✅ Work Completed Today

Today, the backend and frontend initial setup for the Food Delivery Platform project was completed successfully.

---

# 📁 Project Setup

## Connected GitHub Project to VS Code

* Opened the shared team project in VS Code
* Verified project folder structure
* Set up frontend and backend folders

---

# ⚛ Frontend Setup

## React + Vite Frontend Running

Frontend server successfully started using:

```bash
npm run dev
```

Frontend running at:

```bash
http://localhost:5173/
```

---

## Created Frontend Folder Structure

Created:

```bash
components/
pages/
context/
hooks/
services/
utils/
```

---

## Created Initial React Pages

Created:

* Cart.jsx
* Profile.jsx
* OrderStatus.jsx
* Login.jsx
* Register.jsx

---

## Fixed React Errors

Resolved:

```bash
The requested module does not provide an export named 'default'
```

Application successfully compiled after fixing component exports.

---

# 🖥 Backend Setup

## Node.js + Express Server Setup

Backend server successfully started using:

```bash
npm run dev
```

Server running on:

```bash
PORT 5000
```

---

# 🍃 MongoDB Atlas Setup

## Completed MongoDB Atlas Configuration

Completed:

* Created MongoDB Atlas account
* Created Cluster0 database
* Added IP Access List
* Created database user
* Generated MongoDB connection string
* Configured `.env` file

---

## Fixed MongoDB Connection Errors

Resolved:

```bash
querySrv ECONNREFUSED
```

Solution:

* Switched from SRV connection string to standard MongoDB connection string.

---

## Successfully Connected MongoDB

Terminal Output:

```bash
MongoDB Connected
```

---

# 🔐 Authentication Setup

## Installed Authentication Packages

Installed:

```bash
bcryptjs
jsonwebtoken
```

---

## Created Authentication System

Created:

* User Model
* Register API
* Login API
* JWT Token Generation
* Password Hashing

Files created:

```bash
server/models/User.js
server/controllers/auth.controller.js
server/routes/auth.routes.js
```

---

# 🧪 API Testing

## Installed and Configured Postman

Completed:

* Installed Postman desktop app
* Signed in using GitHub account
* Created API requests
* Tested Register API
* Tested Login API

---

# ✅ Current Project Status

Completed Successfully:

* Frontend setup
* Backend setup
* MongoDB Atlas connection
* Authentication APIs
* Postman API testing
* React pages setup
* Express server setup

---

# 🚀 Next Steps

Upcoming tasks:

* Connect frontend login/register forms with backend
* Add Axios API integration
* Create AuthContext
* Store JWT token
* Build protected routes
* Add animations and modern UI
* Build restaurant pages
* Add cart functionality
* Implement Socket.io real-time tracking

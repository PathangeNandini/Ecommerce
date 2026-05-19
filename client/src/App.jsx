import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import RestaurantDetail from "./pages/RestaurantDetail";
import Cart from "./pages/Cart";
import OrderStatus from "./pages/OrderStatus";
import ReviewPage from "./pages/ReviewPage";
import Profile from "./pages/Profile";
import MerchantDashboard from "./pages/MerchantDashboard";

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return !user ? children : <Navigate to="/" replace />;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login"    element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

      {/* Protected */}
      <Route path="/"                    element={<PrivateRoute><Home /></PrivateRoute>} />
      <Route path="/restaurant/:id"      element={<PrivateRoute><RestaurantDetail /></PrivateRoute>} />
      <Route path="/cart"                element={<PrivateRoute><Cart /></PrivateRoute>} />
      <Route path="/order/:id"           element={<PrivateRoute><OrderStatus /></PrivateRoute>} />
      <Route path="/review/:orderId"     element={<PrivateRoute><ReviewPage /></PrivateRoute>} />
      <Route path="/profile"             element={<PrivateRoute><Profile /></PrivateRoute>} />
      <Route path="/merchant"            element={<PrivateRoute><MerchantDashboard /></PrivateRoute>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <AppRoutes />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

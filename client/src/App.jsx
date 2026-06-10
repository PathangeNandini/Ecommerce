import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";

// ── Public ────────────────────────────────────────────────
import Login    from "./pages/Login";
import Register from "./pages/Register";

// ── Customer pages ────────────────────────────────────────
import Home             from "./pages/Home";
import RestaurantDetail from "./pages/RestaurantDetail";
import Cart             from "./pages/Cart";
import OrderStatus      from "./pages/OrderStatus";
import ReviewPage       from "./pages/ReviewPage";
import Payment          from "./pages/Payment";
import PaymentSuccess   from "./pages/PaymentSuccess";
import Reservation      from "./pages/Reservation";
import MyReservations   from "./pages/MyReservations";

// ── Shared ────────────────────────────────────────────────
import Profile      from "./pages/Profile";
import Unauthorized from "./pages/Unauthorized";

// ── Restaurant Owner pages ────────────────────────────────
import OwnerDashboard     from "./pages/merchant/OwnerDashboard";
import ManageMenu         from "./pages/merchant/ManageMenu";
import ManageOrders       from "./pages/merchant/ManageOrders";
import RestaurantSettings from "./pages/merchant/RestaurantSettings";

// ── Delivery Partner pages ────────────────────────────────
import DeliveryHome    from "./pages/courier/DeliveryHome";
import ActiveDelivery  from "./pages/courier/ActiveDelivery";
import DeliveryHistory from "./pages/courier/DeliveryHistory";

// ─────────────────────────────────────────────────────────
//  Route Guards
// ─────────────────────────────────────────────────────────

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="route-loading">Loading…</div>;
  return user ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return children;
  if (user.role === "restaurant") return <Navigate to="/owner/dashboard" replace />;
  if (user.role === "courier")    return <Navigate to="/delivery"        replace />;
  return <Navigate to="/" replace />;
}

function RoleRoute({ children, role }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="route-loading">Loading…</div>;
  if (!user)              return <Navigate to="/login"        replace />;
  if (user.role !== role) return <Navigate to="/unauthorized" replace />;
  return children;
}

// ─────────────────────────────────────────────────────────
//  Routes
// ─────────────────────────────────────────────────────────
function AppRoutes() {
  return (
    <Routes>

      {/* ── Public ── */}
      <Route path="/login"        element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register"     element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* ── Customer ── */}
      <Route path="/" element={
        <RoleRoute role="consumer"><Home /></RoleRoute>
      }/>
      <Route path="/restaurant/:id" element={
        <RoleRoute role="consumer"><RestaurantDetail /></RoleRoute>
      }/>
      <Route path="/cart" element={
        <RoleRoute role="consumer"><Cart /></RoleRoute>
      }/>
      <Route path="/order/:id" element={
        <PrivateRoute><OrderStatus /></PrivateRoute>
      }/>
      <Route path="/review/:orderId" element={
        <RoleRoute role="consumer"><ReviewPage /></RoleRoute>
      }/>
      <Route path="/payment" element={
        <RoleRoute role="consumer"><Payment /></RoleRoute>
      }/>
      <Route path="/payment-success" element={
        <RoleRoute role="consumer"><PaymentSuccess /></RoleRoute>
      }/>
      <Route path="/reservation/:restaurantId" element={
        <RoleRoute role="consumer"><Reservation /></RoleRoute>
      }/>
      <Route path="/my-reservations" element={
        <RoleRoute role="consumer"><MyReservations /></RoleRoute>
      }/>

      {/* ── Shared ── */}
      <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />

      {/* ── Restaurant Owner ── */}
      <Route path="/owner/dashboard" element={
        <RoleRoute role="restaurant"><OwnerDashboard /></RoleRoute>
      }/>
      <Route path="/owner/menu" element={
        <RoleRoute role="restaurant"><ManageMenu /></RoleRoute>
      }/>
      <Route path="/owner/orders" element={
        <RoleRoute role="restaurant"><ManageOrders /></RoleRoute>
      }/>
      <Route path="/owner/settings" element={
        <RoleRoute role="restaurant"><RestaurantSettings /></RoleRoute>
      }/>

      {/* ── Delivery Partner ── */}
      <Route path="/delivery" element={
        <RoleRoute role="courier"><DeliveryHome /></RoleRoute>
      }/>
      <Route path="/delivery/active/:id" element={
        <RoleRoute role="courier"><ActiveDelivery /></RoleRoute>
      }/>
      <Route path="/delivery/history" element={
        <RoleRoute role="courier"><DeliveryHistory /></RoleRoute>
      }/>

      {/* ── Catch-all ── */}
      <Route path="*" element={<RoleRedirect />} />

    </Routes>
  );
}

function RoleRedirect() {
  const { user } = useAuth();
  if (!user)                      return <Navigate to="/login"          replace />;
  if (user.role === "restaurant") return <Navigate to="/owner/dashboard" replace />;
  if (user.role === "courier")    return <Navigate to="/delivery"        replace />;
  return <Navigate to="/" replace />;
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
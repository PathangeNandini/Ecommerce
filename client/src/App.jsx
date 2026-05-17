<<<<<<< HEAD
import Navbar from "./components/Navbar";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Cart from "./pages/Cart";
import Profile from "./pages/Profile";
import OrderStatus from "./pages/OrderStatus";

function App() {
  return (
    <BrowserRouter>

      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/order-status" element={<OrderStatus />} />
      </Routes>

    </BrowserRouter>
=======
function App() {
  return (
    <div>
      <h1>Food Delivery Platform</h1>
    </div>
>>>>>>> 8b316517a531f7badef938e90e2a5f76bbf0f7b2
  );
}

export default App;
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaShoppingCart, FaUserCircle } from "react-icons/fa";

function Navbar() {
  return (
    <motion.nav
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-white shadow-lg sticky top-0 z-50"
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">

        {/* LOGO */}
        <motion.h1
          whileHover={{ scale: 1.05 }}
          className="text-3xl font-extrabold text-red-500"
        >
          FoodieHub
        </motion.h1>

        {/* NAV LINKS */}
        <div className="hidden md:flex items-center gap-8 text-lg font-medium">

          <Link
            to="/"
            className="hover:text-red-500 transition duration-300"
          >
            Home
          </Link>

          <Link
            to="/cart"
            className="hover:text-red-500 transition duration-300 flex items-center gap-2"
          >
            <FaShoppingCart />
            Cart
          </Link>

          <Link
            to="/profile"
            className="hover:text-red-500 transition duration-300 flex items-center gap-2"
          >
            <FaUserCircle />
            Profile
          </Link>

          <Link
            to="/login"
            className="bg-red-500 text-white px-5 py-2 rounded-full hover:bg-red-600 transition"
          >
            Login
          </Link>
        </div>

      </div>
    </motion.nav>
  );
}

export default Navbar;
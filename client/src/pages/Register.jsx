import { motion } from "framer-motion";
import { FaUser, FaEnvelope, FaLock } from "react-icons/fa";

function Register() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-orange-500 to-red-500 p-6">

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7 }}
        className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-10"
      >

        {/* HEADER */}
        <div className="text-center mb-8">

          <h1 className="text-4xl font-bold text-red-500">
            Create Account
          </h1>

          <p className="text-gray-500 mt-2">
            Join FoodieHub today
          </p>

        </div>

        {/* FORM */}
        <form className="space-y-5">

          {/* NAME */}
          <div>
            <label className="block mb-2 font-medium">
              Full Name
            </label>

            <div className="flex items-center border rounded-xl px-4 py-3">
              <FaUser className="text-gray-400 mr-3" />

              <input
                type="text"
                placeholder="Enter your name"
                className="w-full outline-none"
              />
            </div>
          </div>

          {/* EMAIL */}
          <div>
            <label className="block mb-2 font-medium">
              Email
            </label>

            <div className="flex items-center border rounded-xl px-4 py-3">
              <FaEnvelope className="text-gray-400 mr-3" />

              <input
                type="email"
                placeholder="Enter your email"
                className="w-full outline-none"
              />
            </div>
          </div>

          {/* PASSWORD */}
          <div>
            <label className="block mb-2 font-medium">
              Password
            </label>

            <div className="flex items-center border rounded-xl px-4 py-3">
              <FaLock className="text-gray-400 mr-3" />

              <input
                type="password"
                placeholder="Create password"
                className="w-full outline-none"
              />
            </div>
          </div>

          {/* BUTTON */}
          <button
            type="submit"
            className="w-full bg-red-500 text-white py-3 rounded-xl font-bold hover:bg-red-600 transition"
          >
            Register
          </button>

        </form>

      </motion.div>

    </div>
  );
}

export default Register;
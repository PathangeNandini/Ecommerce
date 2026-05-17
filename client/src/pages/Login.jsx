import { motion } from "framer-motion";
import { FaEnvelope, FaLock } from "react-icons/fa";

function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-red-500 to-orange-400 p-6">

      <motion.div
        initial={{ opacity: 0, y: 80 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-10"
      >

        {/* TITLE */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-red-500">
            Welcome Back
          </h1>

          <p className="text-gray-500 mt-2">
            Login to continue ordering delicious food
          </p>
        </div>

        {/* FORM */}
        <form className="space-y-6">

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
                placeholder="Enter your password"
                className="w-full outline-none"
              />
            </div>
          </div>

          {/* BUTTON */}
          <button
            type="submit"
            className="w-full bg-red-500 text-white py-3 rounded-xl font-bold hover:bg-red-600 transition"
          >
            Login
          </button>

        </form>

        {/* FOOTER */}
        <p className="text-center text-gray-500 mt-6">
          Don’t have an account?

          <span className="text-red-500 font-semibold cursor-pointer ml-2">
            Register
          </span>
        </p>

      </motion.div>

    </div>
  );
}

export default Login;
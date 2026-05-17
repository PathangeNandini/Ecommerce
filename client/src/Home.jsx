import { motion } from "framer-motion";

const restaurants = [
  {
    id: 1,
    name: "Pizza Palace",
    image:
      "https://images.unsplash.com/photo-1513104890138-7c749659a591",
    cuisine: "Italian",
    rating: "4.8",
  },
  {
    id: 2,
    name: "Burger Hub",
    image:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd",
    cuisine: "Fast Food",
    rating: "4.6",
  },
  {
    id: 3,
    name: "Sushi World",
    image:
      "https://images.unsplash.com/photo-1579871494447-9811cf80d66c",
    cuisine: "Japanese",
    rating: "4.9",
  },
];

function Home() {
  return (
    <div className="bg-gray-100 min-h-screen">

      {/* HERO SECTION */}
      <section className="bg-gradient-to-r from-red-500 to-orange-500 text-white py-24 px-8">
        <motion.div
          initial={{ opacity: 0, y: -60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="max-w-6xl mx-auto"
        >
          <h1 className="text-6xl font-extrabold leading-tight">
            Discover Amazing Food Near You
          </h1>

          <p className="mt-6 text-xl max-w-2xl">
            Order food, reserve tables, track deliveries live,
            and earn loyalty rewards.
          </p>

          <div className="mt-10 flex gap-5">
            <button className="bg-white text-red-500 px-8 py-3 rounded-full font-bold hover:scale-105 transition">
              Explore Restaurants
            </button>

            <button className="border border-white px-8 py-3 rounded-full hover:bg-white hover:text-red-500 transition">
              Learn More
            </button>
          </div>
        </motion.div>
      </section>

      {/* POPULAR RESTAURANTS */}
      <section className="max-w-7xl mx-auto px-6 py-20">

        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="text-5xl font-bold text-center mb-16"
        >
          Popular Restaurants
        </motion.h2>

        <div className="grid md:grid-cols-3 gap-10">

          {restaurants.map((restaurant, index) => (
            <motion.div
              key={restaurant.id}
              initial={{ opacity: 0, y: 80 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
              whileHover={{
                scale: 1.05,
                rotate: 1,
              }}
              className="bg-white rounded-3xl overflow-hidden shadow-xl"
            >
              <img
                src={restaurant.image}
                alt={restaurant.name}
                className="w-full h-64 object-cover"
              />

              <div className="p-6">

                <div className="flex justify-between items-center">
                  <h3 className="text-2xl font-bold">
                    {restaurant.name}
                  </h3>

                  <span className="bg-yellow-400 px-3 py-1 rounded-full text-sm font-semibold">
                    ⭐ {restaurant.rating}
                  </span>
                </div>

                <p className="text-gray-500 mt-3">
                  {restaurant.cuisine}
                </p>

                <button className="mt-6 w-full bg-red-500 text-white py-3 rounded-xl hover:bg-red-600 transition">
                  View Menu
                </button>

              </div>
            </motion.div>
          ))}

        </div>
      </section>

    </div>
  );
}

export default Home;
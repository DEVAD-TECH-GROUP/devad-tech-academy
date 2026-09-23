import { motion } from "framer-motion";

export default function ServicesIntroSection() {
  return (
    <section className="relative bg-black text-white py-28 overflow-hidden">

      {/* subtle background glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/10 via-transparent to-transparent" />

      <div className="relative max-w-6xl mx-auto px-6">

        {/* Top Label */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-indigo-500 uppercase tracking-widest text-sm"
        >
          Our Expertise
        </motion.p>

        {/* Main Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mt-6 text-4xl md:text-6xl font-bold leading-tight max-w-4xl"
        >
          Engineering Intelligent Systems <br />
          For Homes, Industries & Businesses
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="mt-8 text-gray-400 text-lg max-w-3xl"
        >
          At DEVAD Technologies, we design and develop advanced automation,
          robotics, embedded systems, and smart IoT solutions that improve
          efficiency, safety, and performance. Every system is built with
          precision engineering and future-ready architecture.
        </motion.p>

        {/* Stats Row (Authority Boost) */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2 }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8"
        >
          <div>
            <h3 className="text-3xl font-bold text-indigo-500">5+</h3>
            <p className="text-gray-400 mt-2 text-sm">Core Service Areas</p>
          </div>

          <div>
            <h3 className="text-3xl font-bold text-indigo-500">100%</h3>
            <p className="text-gray-400 mt-2 text-sm">Custom Built Systems</p>
          </div>

          <div>
            <h3 className="text-3xl font-bold text-indigo-500">IoT</h3>
            <p className="text-gray-400 mt-2 text-sm">Remote Monitoring</p>
          </div>

          <div>
            <h3 className="text-3xl font-bold text-indigo-500">AI</h3>
            <p className="text-gray-400 mt-2 text-sm">Intelligent Control</p>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
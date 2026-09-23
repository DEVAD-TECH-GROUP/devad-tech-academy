import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import bgVideo from "../../../../assets/videos/bg.mp4";
export default function HeroSection() {
  return (
    <section className="relative min-h-screen overflow-hidden bg-[#020617] text-white flex items-center pt-24 lg:pt-20 lg:mt-10 lg:pb-20">

      {/* 🎬 Background Video */}
  <video
  className="absolute inset-0 w-full h-full object-cover object-center opacity-40"
  autoPlay
  loop
  muted
  playsInline
  src={bgVideo}
/>

      {/* Background Grid */}
      <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:45px_45px]" />

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-[#020617]/60 z-0" />

      {/* Glow Effects */}
      <div className="absolute top-[-150px] left-[-100px] w-[500px] h-[500px] bg-cyan-500/25 blur-[140px] rounded-full" />
      <div className="absolute bottom-[-200px] right-[-100px] w-[500px] h-[500px] bg-blue-600/25 blur-[140px] rounded-full" />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 w-full text-center">
        <div className="flex items-center min-h-[75vh] justify-center">
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="max-w-4xl text-center justify-center items-center"
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 text-cyan-300 text-sm mb-6 backdrop-blur-md mx-auto">
              Future-Driven Tech Academy
            </div>

            {/* Heading */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
              Learn High-Income
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500">
                Tech Skills
              </span>
              That Build Real Careers
            </h1>

            {/* Description */}
            <p className="mt-8 text-gray-300 text-base sm:text-lg lg:text-xl max-w-3xl leading-relaxed mx-auto">
              Master in-demand tech skills through hands-on learning.
              Build real projects and prepare for career opportunities.
            </p>

            {/* CTA Buttons */}
            {/* <div className="mt-10 flex flex-row gap-3 justify-center items-center flex-wrap sm:flex-nowrap">
              <button className="bg-gradient-to-r from-cyan-400 to-blue-600 hover:scale-105 transition-all duration-300 py-3 px-6 sm:py-4 sm:px-8 rounded-xl text-black font-semibold flex items-center gap-2 shadow-lg shadow-cyan-500/30 text-sm sm:text-base whitespace-nowrap">
                Enroll Now
                <ArrowRight size={16} />
              </button>

              <button className="border border-white/20 hover:border-cyan-400 hover:bg-cyan-500/10 transition-all duration-300 px-6 py-3 sm:px-8 sm:py-4 rounded-xl backdrop-blur-md text-sm sm:text-base whitespace-nowrap">
                Explore Courses
              </button>
            </div> */}

          </motion.div>
        </div>
      </div>
    </section>
  );
}
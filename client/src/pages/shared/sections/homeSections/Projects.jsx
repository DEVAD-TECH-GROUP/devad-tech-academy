import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  UserPlus,
  BookOpen,
  Laptop,
  Users,
  Briefcase,
  Rocket,
} from "lucide-react";

const journeySteps = [
  {
    icon: UserPlus,
    title: "Enroll",
    description:
      "Choose your preferred program and begin your journey into the world of technology.",
  },
  {
    icon: BookOpen,
    title: "Learn Fundamentals",
    description:
      "Build a strong foundation with structured lessons, guided exercises, and expert instruction.",
  },
  {
    icon: Laptop,
    title: "Build Real Projects",
    description:
      "Apply your knowledge by creating practical projects that strengthen your skills and portfolio.",
  },
  {
    icon: Users,
    title: "Get Mentorship",
    description:
      "Receive guidance, feedback, and support from experienced mentors throughout your learning journey.",
  },
  {
    icon: Briefcase,
    title: "Career Preparation",
    description:
      "Prepare for internships, freelance opportunities, and professional tech careers.",
  },
  {
    icon: Rocket,
    title: "Launch Your Career",
    description:
      "Graduate with confidence and the skills needed to thrive in the technology industry.",
  },
];

export default function LearningJourney() {

  const navigate = useNavigate();
  return (
    <section className="relative py-24 bg-slate-900 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute bottom-20 right-20 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />

        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(to right,#ffffff 1px,transparent 1px), linear-gradient(to bottom,#ffffff 1px,transparent 1px)",
            backgroundSize: "80px 80px",
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-20"
        >
          <span className="inline-flex rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-400">
            Learning Journey
          </span>

          <h2 className="mt-6 text-4xl md:text-5xl font-bold text-white">
            Your Roadmap To A
            <span className="block text-cyan-400">
              Successful Tech Career
            </span>
          </h2>

          <p className="mt-6 text-lg text-slate-400">
            Follow a proven step-by-step learning path designed to take you
            from beginner to industry-ready professional.
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {/* Center Line */}
          <div className="absolute left-1/2 top-0 bottom-0 hidden md:block w-px bg-gradient-to-b from-cyan-400 via-blue-500 to-cyan-400 -translate-x-1/2" />

          <div className="space-y-12">
            {journeySteps.map((step, index) => {
              const Icon = step.icon;
              const isLeft = index % 2 === 0;

              return (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className={`flex items-center ${
                    isLeft ? "md:flex-row" : "md:flex-row-reverse"
                  } flex-col`}
                >
                  {/* Content */}
                  <div className="w-full md:w-1/2 px-4">
                    <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-950/70 backdrop-blur-xl p-8 py-10 lg: py-0">

                    <span className="absolute top-1 right-1 md:top-4 md:right-6 text-4xl md:text-6xl font-black text-slate-800/40 md:text-slate-800 z-0 pointer-events-none">
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    <div className="relative z-10">
                      <h3 className="text-2xl font-bold text-white">
                        {step.title}
                      </h3>

                      <p className="mt-4 text-slate-400 leading-relaxed">
                        {step.description}
                      </p>
                    </div>

                  </div>
                  </div>

                  {/* Timeline Circle */}
                  <div className="relative z-10 flex items-center justify-center w-16 h-16 rounded-full border border-cyan-500/30 bg-slate-950 text-cyan-400 shadow-[0_0_25px_rgba(34,211,238,0.25)] my-6 md:my-0">
                    <Icon size={28} />
                  </div>

                  {/* Spacer */}
                  <div className="hidden md:block w-1/2" />
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Bottom Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mt-24 grid md:grid-cols-3 gap-6"
        >
          {[
            { value: "7+", label: "Career Paths" },
            { value: "100%", label: "Practical Learning" },
            { value: "24/7", label: "Learning Support" },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-3xl border border-slate-800 bg-slate-950/70 backdrop-blur-xl p-8 text-center"
            >
              <h3 className="text-4xl font-bold text-cyan-400">
                {item.value}
              </h3>

              <p className="mt-3 text-slate-400">
                {item.label}
              </p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

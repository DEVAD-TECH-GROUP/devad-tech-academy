import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  Code2,
  BrainCircuit,
  ShieldCheck,
  BarChart3,
  Users,
} from "lucide-react";

const features = [
  {
    icon: <Code2 size={28} />,
    title: "Industry-Relevant Skills",
    description:
      "Master Software Development, AI, Cybersecurity, Data Analytics, UI/UX Design, and other high-demand tech skills.",
  },
  {
    icon: <BrainCircuit size={28} />,
    title: "Hands-On Learning",
    description:
      "Build real-world projects, strengthen your portfolio, and gain practical experience that employers value.",
  },
  {
    icon: <BarChart3 size={28} />,
    title: "Career-Focused Curriculum",
    description:
      "Follow structured learning paths designed to help you transition from beginner to job-ready professional.",
  },
  {
    icon: <Users size={28} />,
    title: "Live Interactive Sessions",
    description:
      "Attend engaging live classes, ask questions in real time, and receive direct guidance from instructors.",
  },
  {
    icon: <ShieldCheck size={28} />,
    title: "Expert-Led Training",
    description:
      "Learn from experienced instructors who bring real industry knowledge and best practices into every lesson.",
  },
  {
    icon: <CheckCircle2 size={28} />,
    title: "Supportive Community",
    description:
      "Connect with mentors, fellow learners, and tech professionals who help accelerate your growth.",
  },
];

export default function WhyChooseUs() {

  const navigate = useNavigate();

  return (
    <section className="relative bg-slate-950 py-24 overflow-hidden">
      {/* Background Glow */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute bottom-20 right-20 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="inline-flex items-center rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-400">
            Why Choose Us
          </span>

          <h2 className="mt-6 text-4xl md:text-5xl font-bold text-white">
            Build Skills That Open
            <span className="block text-cyan-400">
              Real Career Opportunities
            </span>
          </h2>

          <p className="mt-6 text-lg text-slate-400 leading-relaxed">
            We go beyond theory. Our academy equips students with practical
            experience, industry-relevant skills, and the confidence needed to
            thrive in today's rapidly evolving technology landscape.
          </p>
        </motion.div>

        {/* Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 35 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              viewport={{ once: true }}
              whileHover={{ y: -8 }}
              className="group relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm p-8"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/0 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="relative">
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  {item.icon}
                </div>

                <h3 className="mt-6 text-xl font-semibold text-white">
                  {item.title}
                </h3>

                <p className="mt-4 text-slate-400 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="mt-20"
        >
          <div className="rounded-3xl border border-cyan-500/20 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-cyan-500/10 p-10 text-center">
            <h3 className="text-3xl font-bold text-white">
              Start Building Your Future Today
            </h3>

            <p className="mt-4 max-w-2xl mx-auto text-slate-300">
              Whether you're a complete beginner or looking to upgrade your
              skills, our programs provide the knowledge, mentorship, and
              hands-on experience needed to succeed in the tech industry.
            </p>

            <button 
            onClick={() => navigate("/courses")}
            className="mt-8 rounded-xl bg-cyan-500 px-8 py-4 font-semibold text-slate-950 transition hover:bg-cyan-400">
              Enroll Now
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
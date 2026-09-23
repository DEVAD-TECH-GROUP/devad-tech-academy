import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  Code2,
  Rocket,
  Users,
} from "lucide-react";

export default function FinalCTA() {

  const navigate = useNavigate()
  return (
    <section className="relative py-28 bg-slate-950 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/10 blur-[120px]" />

        <div className="absolute top-0 left-0 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />

        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(to right,#ffffff 1px,transparent 1px), linear-gradient(to bottom,#ffffff 1px,transparent 1px)",
            backgroundSize: "80px 80px",
          }}
        />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="rounded-[40px] border border-cyan-500/20 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-cyan-500/10 backdrop-blur-xl p-10 md:p-16 text-center"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-400">
            <Rocket size={16} />
            Start Your Journey Today
          </div>

          {/* Heading */}
          <h2 className="mt-8 text-4xl md:text-6xl font-bold text-white leading-tight">
            Ready To Start Your
            <span className="block text-cyan-400">
              Tech Journey?
            </span>
          </h2>

          {/* Description */}
          <p className="mt-6 max-w-3xl mx-auto text-lg text-slate-300 leading-relaxed">
            Join ambitious learners building the skills, projects,
            and confidence needed to succeed in today's rapidly
            growing technology industry.
          </p>

          {/* Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
            <button 
            onClick={() => navigate("/courses")}
            className="group inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-8 py-4 font-semibold text-slate-950 transition hover:bg-cyan-400">
              Enroll Now
              <ArrowRight
                size={18}
                className="transition group-hover:translate-x-1"
              />
            </button>
          </div>

          {/* Trust Points */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              "Beginner Friendly",
              "Hands-On Projects",
              "Mentor Support",
              "Flexible Learning",
            ].map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4"
              >
                <div className="flex items-center justify-center gap-2 text-slate-300">
                  <CheckCircle2
                    size={18}
                    className="text-cyan-400"
                  />
                  <span className="text-sm font-medium">
                    {item}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Stats */}
          <div className="mt-12 border-t border-slate-800 pt-10">
            <div className="grid md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-3xl font-bold text-white">
                  6+
                </h3>
                <p className="mt-2 text-slate-400">
                  Career-Focused Programs
                </p>
              </div>

              <div>
                <h3 className="text-3xl font-bold text-white">
                  100%
                </h3>
                <p className="mt-2 text-slate-400">
                  Practical Learning Approach
                </p>
              </div>

              <div>
                <h3 className="text-3xl font-bold text-white">
                  24/7
                </h3>
                <p className="mt-2 text-slate-400">
                  Learning & Community Support
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
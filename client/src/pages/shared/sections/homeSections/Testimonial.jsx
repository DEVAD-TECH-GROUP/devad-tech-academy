import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";

const faqs = [
  {
    question: "Do I need prior experience?",
    answer:
      "No. Most of our programs are beginner-friendly and designed to help you learn from the ground up. We guide you step-by-step, even if you have never written a line of code before.",
  },
  {
    question: "Which course is best for beginners?",
    answer:
      "Software Development, UI/UX Design, and Data Analytics are excellent starting points for beginners. If you're unsure, our team can help you choose the right learning path.",
  },
  {
    question: "How are classes conducted?",
    answer:
      "Classes may be delivered online, onsite, or in a hybrid format depending on the program. You'll have access to lessons, assignments, projects, and instructor support.",
  },
  {
    question: "Will I build real projects?",
    answer:
      "Yes. Practical learning is a core part of our training. You'll build real-world projects that strengthen your skills and help you create a portfolio.",
  },
  {
    question: "How long are the programs?",
    answer:
      "Program duration varies depending on the course. Most programs range from 8 to 16 weeks and include hands-on projects and assessments.",
  },
  {
    question: "Will I receive a certificate?",
    answer:
      "Yes. Students who successfully complete their training requirements receive a certificate of completion.",
  },
  {
    question: "Can I pay in installments?",
    answer:
      "Yes. Flexible payment plans may be available depending on the program. Contact our admissions team for current payment options.",
  },
  {
    question: "How much do the programs cost?",
    answer:
      "Program fees vary depending on the course and duration. Contact our admissions team for the latest pricing information and available payment plans.",
  },
  {
    question: "Will I get mentorship and support?",
    answer:
      "Absolutely. Students receive guidance, project reviews, feedback, and support from experienced instructors and mentors throughout their learning journey.",
  },
  {
    question: "How do I enroll?",
    answer:
      "Simply choose a program, complete the registration process, and our admissions team will guide you through the next steps.",
  },
];

export default function FAQSection() {

  const navigate = useNavigate();
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section className="relative py-24 bg-zinc-900 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-green-500/10 blur-3xl" />

        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(to right,#ffffff 1px,transparent 1px), linear-gradient(to bottom,#ffffff 1px,transparent 1px)",
            backgroundSize: "80px 80px",
          }}
        />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-flex rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-400">
            Frequently Asked Questions
          </span>

          <h2 className="mt-6 text-4xl md:text-5xl font-bold text-white">
            Answers To Your
            <span className="block text-emerald-400">
              Most Common Questions
            </span>
          </h2>

          <p className="mt-6 text-lg text-slate-400 max-w-2xl mx-auto">
            Everything you need to know about our programs, learning
            experience, mentorship, payments, and enrollment process.
          </p>
        </motion.div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;

            return (
              <motion.div
                key={faq.question}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.4,
                  delay: index * 0.03,
                }}
                viewport={{ once: true }}
                className={`overflow-hidden rounded-2xl border backdrop-blur-xl transition-all duration-300 ${
                  isOpen
                    ? "border-emerald-500/20 bg-emerald-500/5"
                    : "border-zinc-800 bg-zinc-950/60"
                }`}
              >
                <button
                  onClick={() =>
                    setOpenIndex(isOpen ? -1 : index)
                  }
                  className="flex w-full items-center justify-between p-6 text-left"
                >
                  <h3 className="pr-4 text-lg font-semibold text-white">
                    {faq.question}
                  </h3>

                  <div className="flex-shrink-0 text-emerald-400">
                    {isOpen ? (
                      <Minus size={22} />
                    ) : (
                      <Plus size={22} />
                    )}
                  </div>
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{
                        height: 0,
                        opacity: 0,
                      }}
                      animate={{
                        height: "auto",
                        opacity: 1,
                      }}
                      exit={{
                        height: 0,
                        opacity: 0,
                      }}
                      transition={{
                        duration: 0.25,
                      }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-zinc-800 px-6 py-5">
                        <p className="leading-relaxed text-slate-400">
                          {faq.answer}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mt-16"
        >
          <div className="rounded-3xl border border-emerald-500/20 bg-gradient-to-r from-emerald-500/10 via-green-500/10 to-emerald-500/10 p-10 text-center">
            <h3 className="text-3xl font-bold text-white">
              Still Have Questions?
            </h3>

            <p className="mt-4 max-w-2xl mx-auto text-slate-300">
              Our admissions team is ready to help you choose the right program,
              understand payment options, and start your journey into tech.
            </p>

            <button 
            onClick={() => navigate("/contact")}
            className="mt-8 rounded-xl bg-emerald-500 px-8 py-4 font-semibold text-slate-950 transition hover:bg-emerald-400">
              Contact Admissions
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
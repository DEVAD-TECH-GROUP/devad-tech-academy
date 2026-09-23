import { useState } from "react";

const FAQS = [
  { q: "Do I need experience to join?", a: "Most of our programs are beginner-friendly. Check each course's prerequisites." },
  { q: "Are classes online or in-person?", a: "All classes are online with live interactive sessions." },
  { q: "Can I get a refund?", a: "Yes, within the first 7 days if you're not satisfied." },
  { q: "Do I get a certificate?", a: "Yes, upon successful completion of all projects and assessments." },
];

export default function CoursesFAQ() {
  const [open, setOpen] = useState(null);

  return (
    <section className="px-6 py-20 max-w-3xl mx-auto">
      <div className="text-center mb-10">
        <span className="text-xs font-bold tracking-widest text-violet-400 uppercase">Got Questions?</span>
        <h2 className="text-3xl font-black mt-2">Quick Answers</h2>
      </div>

      <div className="space-y-3">
        {FAQS.map((faq, i) => (
          <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="w-full flex items-center justify-between px-5 py-4 text-left font-semibold text-sm hover:text-violet-400 transition-colors"
            >
              {faq.q}
              <span className={`transition-transform ${open === i ? "rotate-180" : ""}`}>⌄</span>
            </button>
            {open === i && (
              <div className="px-5 pb-4 text-slate-400 text-sm">{faq.a}</div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
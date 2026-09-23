import { StarRating } from "../../components/ui";

const STATS = [
  ["500+", "Graduates"],
  ["92%", "Job Placement"],
  ["4.9★", "Average Rating"],
  ["15+", "Tech Partners"],
];

export default function StudentSuccessStories({ testimonials }) {
  return (
    <section className="px-6 py-20 bg-slate-900/40 border-y border-slate-800/60">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-xs font-bold tracking-widest text-violet-400 uppercase">Social Proof</span>
          <h2 className="text-3xl font-black mt-2">Student Success Stories</h2>
        </div>

        {/* Testimonials */}
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div key={t.name} className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <img src={t.avatar} alt={t.name} className="w-12 h-12 rounded-full ring-2 ring-violet-500/30" />
                <div>
                  <div className="font-bold text-sm">{t.name}</div>
                  <div className="text-xs text-violet-400">{t.role}</div>
                </div>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">"{t.text}"</p>
              <div className="mt-4">
                <StarRating rating={5} />
              </div>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
          {STATS.map(([val, label]) => (
            <div key={label} className="text-center">
              <div className="text-4xl font-black text-violet-400 mb-1">{val}</div>
              <div className="text-sm text-slate-400">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
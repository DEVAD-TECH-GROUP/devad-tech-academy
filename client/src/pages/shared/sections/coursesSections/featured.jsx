import { useNavigate } from "react-router-dom";
import { fmt } from "../../../../components/ui/courseUi/fmt";

const getCategoryIcon = (category) => {
  const iconClass = "w-6 h-6 text-violet-400";

  switch (category) {
    case "Development":
      return (
        <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
        </svg>
      );
    case "Design":
      return (
        <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122l3.95-3.95m2.03-2.03l2.877-2.877a2.414 2.414 0 00-3.414-3.414L12.095 5.73m0 0L8.044 9.78m4.051-4.051l-4.05 4.051m0 0l-5.38 5.38a2.414 2.414 0 003.414 3.414l5.38-5.38m-3.414-3.414l3.414 3.414m-4.908 4.908L4.3 19.1c-.43.43-.12 1.17.49 1.17h3.35c.32 0 .62-.13.85-.35l1.63-1.63M16.4 18.122h4.1M16.4 15.122h1.1m-1.1 6h2.1" />
        </svg>
      );
    case "AI & Data":
      return (
        <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v16.5M21 19.5H3.75M6.75 12v3m3.75-6v6m3.75-9v9M18.75 6v12" />
        </svg>
      );
    default:
      return (
        <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
        </svg>
      );
  }
};

export default function FeaturedCourses({ courses }) {
  const navigate = useNavigate();

  return (
    <section className="px-6 py-20 border-t border-slate-800/60 max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <span className="text-xs font-bold tracking-widest text-violet-400 uppercase">Most Popular</span>
        <h2 className="text-3xl font-black mt-2">Featured Programs</h2>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {courses.slice(0, 3).map((c) => (
          <div
            key={c.slug}
            onClick={() => navigate(`/courses/${c.slug}`)}
            className="cursor-pointer group relative bg-gradient-to-br from-slate-900 to-slate-900/50 border border-slate-800 rounded-2xl p-6 hover:border-violet-500/50 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-violet-600/10 border border-violet-500/10 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform duration-300">
                {getCategoryIcon(c.category)}
              </div>
              <h3 className="font-bold text-lg mb-2 group-hover:text-violet-400 transition-colors">{c.title}</h3>
              <p className="text-slate-400 text-sm mb-6 leading-relaxed">{c.subtitle}</p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800/40">
              <span className="font-black text-white">{fmt(c.price)}</span>
              <span className="text-violet-400 text-sm font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                Explore
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
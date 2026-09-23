import { useState, useRef, useEffect } from "react";

const COURSES = [
  { title: "Frontend Web Development", category: "Development", tags: ["HTML5", "CSS3", "JavaScript", "React"] },
  { title: "Backend Engineering", category: "Development", tags: ["React", "JavaScript", "Node.js"] },
  { title: "Full Stack Software Development", category: "Development", tags: ["React", "Node.js", "MongoDB"] },
  { title: "AI & Machine Learning Engineering", category: "Data Science", tags: ["Python", "Pandas", "Machine Learning"] },
  { title: "Data Analytics", category: "Data Science", tags: ["Python", "TensorFlow", "NumPy"] },
  { title: "UI/UX Design", category: "Design", tags: ["Figma", "Prototyping", "Research"] },
  // { title: "Ethical Hacking & Penetration Testing", category: "Cybersecurity", tags: ["Linux", "Kali", "Networking"] },
  { title: "Cybersecurity", category: "Cybersecurity", tags: ["Networking", "Firewalls", "OWASP"] },
  { title: "Mobile App Development", category: "Development", tags: ["Flutter", "Dart", "Firebase"] },
];

function highlight(text, query) {
  const i = text.toLowerCase().indexOf(query.toLowerCase());
  if (i < 0) return <span>{text}</span>;
  return (
    <>
      {text.slice(0, i)}
      <span className="text-violet-400 font-semibold">{text.slice(i, i + query.length)}</span>
      {text.slice(i + query.length)}
    </>
  );
}

export default function CoursesHero({ search, setSearch }) {
  const [suggestions, setSuggestions] = useState([]);
  const [activeIdx, setActiveIdx] = useState(-1);
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleChange = (e) => {
    const q = e.target.value;
    setSearch(q);
    setActiveIdx(-1);
    if (!q.trim()) { setSuggestions([]); setOpen(false); return; }
    const lower = q.toLowerCase();
    const results = COURSES.filter((c) =>
      c.title.toLowerCase().includes(lower) ||
      c.tags.some((t) => t.toLowerCase().includes(lower)) ||
      c.category.toLowerCase().includes(lower)
    ).slice(0, 6);
    setSuggestions(results);
    setOpen(results.length > 0);
  };

  const handleSelect = (title) => {
    setSearch(title);
    setSuggestions([]);
    setOpen(false);
  };

  const handleKeyDown = (e) => {
    if (!open) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setActiveIdx((i) => Math.min(i + 1, suggestions.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActiveIdx((i) => Math.max(i - 1, 0)); }
    else if (e.key === "Enter" && activeIdx >= 0) { handleSelect(suggestions[activeIdx].title); }
    else if (e.key === "Escape") setOpen(false);
  };

  return (
    <section className="relative overflow-hidden px-6 py-28 text-center">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-900/30 via-slate-950 to-slate-950" />
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-violet-600/10 rounded-full blur-3xl" />

      <div className="relative max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-violet-900/30 border border-violet-700/40 rounded-full px-4 py-1.5 text-xs text-violet-300 font-medium mb-6">
          <svg className="w-3.5 h-3.5 text-violet-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.63 8.41m5.96 5.96a14.96 14.96 0 01-10.5 4.15m10.5-4.15l-1.08 1.08M9.63 8.41a14.96 14.96 0 00-4.15 10.5m4.15-10.5L8.55 9.49m0 0A14.95 14.95 0 013 10.81m5.55-1.32L6.12 7.07m0 0A14.97 14.97 0 0113.19 3m-7.07 4.07L4.47 8.78m0 0A14.97 14.97 0 003 15.37m0 0a6 6 0 007.38-5.84" />
          </svg>
          New Cohort Starting Soon
        </div>
        <h1 className="text-5xl md:text-6xl font-black mb-4 tracking-tight leading-tight">
          Explore Our<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400">
            Tech Programs
          </span>
        </h1>
        <p className="text-slate-400 text-lg mb-10 max-w-xl mx-auto">
          World-class tech education built for ambitious Africans. Learn in-demand skills, build real projects, get hired.
        </p>

        {/* Search with suggestions */}
        <div className="max-w-xl mx-auto relative" ref={wrapperRef}>
          <div className="flex items-center gap-3 bg-slate-900 border border-slate-700 rounded-2xl px-4 py-3 focus-within:border-violet-500 transition-colors">
            <svg className="w-4 h-4 text-slate-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <input
              value={search}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              onFocus={() => suggestions.length > 0 && setOpen(true)}
              placeholder="Search courses, skills, tracks…"
              autoComplete="off"
              className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 outline-none"
            />
            {search && (
              <button onClick={() => { setSearch(""); setSuggestions([]); setOpen(false); }} className="text-slate-500 hover:text-white transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M18 6 6 18M6 6l12 12" /></svg>
              </button>
            )}
          </div>

          {open && (
            <ul className="absolute left-0 right-0 mt-2 bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden z-50 shadow-xl shadow-black/40">
              {suggestions.map((c, i) => (
                <li
                  key={c.title}
                  onMouseDown={() => handleSelect(c.title)}
                  onMouseEnter={() => setActiveIdx(i)}
                  className={`flex items-center gap-3 px-4 py-3 cursor-pointer text-sm transition-colors ${i === activeIdx ? "bg-slate-800" : "hover:bg-slate-800/60"}`}
                >
                  <svg className="w-4 h-4 text-slate-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                  <span className="flex-1 text-left text-white">{highlight(c.title, search)}</span>
                  <span className="text-xs text-slate-500 bg-slate-800 border border-slate-700 rounded px-2 py-0.5 flex-shrink-0">{c.category}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
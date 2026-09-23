// ─── FORMAT PRICE ─────────────────────────────────────────────────────────────
export const fmt = (n) => `₦${n.toLocaleString()}`;

// ─── STAR RATING ──────────────────────────────────────────────────────────────
export function StarRating({ rating }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg
          key={s}
          className={`w-4 h-4 ${s <= rating ? "text-amber-400" : "text-slate-600"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

// ─── TECH BADGE ───────────────────────────────────────────────────────────────
export function TechBadge({ name }) {
  const colors = {
    HTML5: "bg-orange-500/20 text-orange-300 border-orange-500/30",
    CSS3: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    JavaScript: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
    React: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
    "Node.js": "bg-green-500/20 text-green-300 border-green-500/30",
    MongoDB: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    Git: "bg-red-500/20 text-red-300 border-red-500/30",
    GitHub: "bg-slate-500/20 text-slate-300 border-slate-500/30",
    "VS Code": "bg-blue-600/20 text-blue-300 border-blue-600/30",
    default: "bg-violet-500/20 text-violet-300 border-violet-500/30",
  };
  const cls = colors[name] || colors.default;
  return (
    <span className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${cls} tracking-wide`}>
      {name}
    </span>
  );
}
export default function ProgressBar({ value = 0, max = 100, color = "accent", height = "sm", label }) {
  const pct = Math.min(Math.round((value / max) * 100), 100);
  const heights = { xs: "h-1", sm: "h-1.5", md: "h-2", lg: "h-3" };
  const colors = {
    accent: "bg-accent",
    green:  "bg-green",
    yellow: "bg-yellow",
    red:    "bg-red",
    orange: "bg-orange",
  };

  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between text-xs text-muted mb-1">
          <span>{label}</span>
          <span>{pct}%</span>
        </div>
      )}
      <div className={`w-full bg-border rounded-full overflow-hidden ${heights[height]}`}>
        <div
          className={`h-full rounded-full transition-all duration-500 ${colors[color]}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
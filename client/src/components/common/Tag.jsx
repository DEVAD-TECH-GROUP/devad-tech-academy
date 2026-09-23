export default function Tag({ children, color = "accent", onRemove }) {
  const colors = {
    accent: "bg-accent/10 text-accent",
    green:  "bg-green/10 text-green",
    red:    "bg-red/10 text-red",
    yellow: "bg-yellow/10 text-yellow",
    muted:  "bg-surfaceHigh text-muted",
  };

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-medium ${colors[color]}`}>
      {children}
      {onRemove && (
        <button onClick={onRemove} className="hover:opacity-70 transition ml-0.5">×</button>
      )}
    </span>
  );
}
export default function Tabs({ tabs = [], active, onChange }) {
  return (
    <div className="flex items-center gap-1 bg-surfaceHigh border border-border rounded-xl p-1">
      {tabs.map(({ key, label, icon }) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition flex-1 justify-center
            ${active === key ? "bg-surface text-text shadow-sm" : "text-muted hover:text-text"}`}
        >
          {icon && <span>{icon}</span>}
          {label}
        </button>
      ))}
    </div>
  );
}
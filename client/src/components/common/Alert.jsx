export default function Alert({ type = "info", message, onClose }) {
  const types = {
    info:    "bg-blue/10 border-blue/20 text-blue",
    success: "bg-green/10 border-green/20 text-green",
    warning: "bg-yellow/10 border-yellow/20 text-yellow",
    error:   "bg-red/10 border-red/20 text-red",
  };

  const icons = { info: "ℹ️", success: "✅", warning: "⚠️", error: "❌" };

  return (
    <div className={`flex items-start gap-3 p-4 border rounded-xl ${types[type]}`}>
      <span className="shrink-0">{icons[type]}</span>
      <p className="text-sm flex-1">{message}</p>
      {onClose && (
        <button onClick={onClose} className="shrink-0 opacity-70 hover:opacity-100 transition">×</button>
      )}
    </div>
  );
}
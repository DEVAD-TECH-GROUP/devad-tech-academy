export default function EmptyState({ icon = "📭", title, message, action, actionLabel }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-4">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="dsp text-base font-bold text-text mb-2">{title}</h3>
      {message && <p className="text-sm text-muted mb-6 max-w-sm">{message}</p>}
      {action && actionLabel && (
        <button
          onClick={action}
          className="bg-accent hover:bg-accent/90 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
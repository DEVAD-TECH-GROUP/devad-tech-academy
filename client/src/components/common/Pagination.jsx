export default function Pagination({ page, totalPages, onNext, onPrev, onGoTo }) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 mt-4">
      <button
        onClick={onPrev}
        disabled={page === 1}
        className="px-3 py-1.5 text-xs bg-surfaceHigh border border-border rounded-lg text-muted hover:text-text disabled:opacity-40 transition"
      >
        ← Prev
      </button>

      {[...Array(totalPages)].map((_, i) => (
        <button
          key={i}
          onClick={() => onGoTo(i + 1)}
          className={`w-8 h-8 text-xs rounded-lg transition ${
            page === i + 1
              ? "bg-accent text-white"
              : "bg-surfaceHigh border border-border text-muted hover:text-text"
          }`}
        >
          {i + 1}
        </button>
      ))}

      <button
        onClick={onNext}
        disabled={page === totalPages}
        className="px-3 py-1.5 text-xs bg-surfaceHigh border border-border rounded-lg text-muted hover:text-text disabled:opacity-40 transition"
      >
        Next →
      </button>
    </div>
  );
}
import { useEffect } from "react";

const config = {
  loading: {
    color: "#3b82f6",
    icon: (
      <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
    ),
  },

  success: {
    color: "#22c55e",
    icon: (
      <svg
        className="w-16 h-16"
        fill="none"
        viewBox="0 0 24 24"
        stroke="#22c55e"
        strokeWidth="2.5"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M5 13l4 4L19 7"
        />
      </svg>
    ),
  },

  error: {
    color: "#ef4444",
    icon: (
      <svg
        className="w-16 h-16"
        fill="none"
        viewBox="0 0 24 24"
        stroke="#ef4444"
        strokeWidth="2.5"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M6 6l12 12M18 6L6 18"
        />
      </svg>
    ),
  },

  warning: {
    color: "#f59e0b",
    icon: (
      <svg
        className="w-16 h-16"
        fill="none"
        viewBox="0 0 24 24"
        stroke="#f59e0b"
        strokeWidth="2.5"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
        />
      </svg>
    ),
  },

  info: {
    color: "#06b6d4",
    icon: (
      <svg
        className="w-16 h-16"
        fill="none"
        viewBox="0 0 24 24"
        stroke="#06b6d4"
        strokeWidth="2.5"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M13 16h-1v-4h-1m1-4h.01"
        />
      </svg>
    ),
  },
};

export default function ResponseModal({
  open,
  type = "info",
  title = "",
  message = "",
  buttonText = "OK",
  showButton = true,
  showClose = true,
  disableBackdropClose = false,
  onClose = () => {},
}) {
  useEffect(() => {
    const esc = (e) => {
      if (e.key === "Escape") onClose();
    };

    if (open) {
      window.addEventListener("keydown", esc);
    }

    return () => {
      window.removeEventListener("keydown", esc);
    };
  }, [open, onClose]);

  if (!open) return null;

  const current = config[type] || config.info;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-md p-5"
      onClick={() => {
        if (!disableBackdropClose) onClose();
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-3xl border border-cyan-500/20 bg-slate-900 p-8 shadow-2xl animate-[fadeIn_.25s]"
      >
        <div className="flex justify-center mb-6">
          {current.icon}
        </div>

        <h2
          className="text-2xl font-bold text-center mb-3"
          style={{ color: current.color }}
        >
          {title}
        </h2>

        <p className="text-center text-slate-300 leading-7">
          {message}
        </p>

        {showButton && type !== "loading" && (
          <button
            onClick={onClose}
            className="mt-8 w-full rounded-xl py-3 font-bold text-white transition hover:scale-[1.02]"
            style={{
              background: current.color,
            }}
          >
            {buttonText}
          </button>
        )}

        {showClose && type !== "loading" && (
          <button
            onClick={onClose}
            className="mt-3 w-full rounded-xl border border-slate-700 py-3 text-slate-300 hover:bg-slate-800"
          >
            Close
          </button>
        )}
      </div>
    </div>
  );
}
import { useEffect } from "react";
import { createPortal } from "react-dom";

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
}) {
  useEffect(() => {
    if (!isOpen) return;

    // Prevent background scrolling
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Close modal with Escape key
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizes = {
    sm: "max-w-sm",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 fade-ov"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Content */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "modal-title" : undefined}
        className={`
          relative z-10
          w-full ${sizes[size] || sizes.md}
          max-h-[90vh] overflow-y-auto
          bg-surface border border-border
          rounded-2xl shadow-2xl fi
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="flex items-center justify-between p-5 border-b border-border">
            <h3 id="modal-title" className="dsp text-base font-bold text-text">
              {title}
            </h3>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close modal"
              className="text-muted hover:text-text transition text-xl leading-none"
            >
              ×
            </button>
          </div>
        )}

        <div className="p-5">{children}</div>
      </div>
    </div>,
    document.body,
  );
}

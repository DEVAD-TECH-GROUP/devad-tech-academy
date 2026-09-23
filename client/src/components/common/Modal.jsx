import { useEffect } from "react";

export default function Modal({ isOpen, onClose, title, children, size = "md" }) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizes = {
    sm: "max-w-sm",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 fade-ov" onClick={onClose} />
      <div className={`relative w-full ${sizes[size]} bg-surface border border-border rounded-2xl shadow-2xl fi`}>
        {title && (
          <div className="flex items-center justify-between p-5 border-b border-border">
            <h3 className="dsp text-base font-bold text-text">{title}</h3>
            <button
              onClick={onClose}
              className="text-muted hover:text-text transition text-xl leading-none"
            >
              ×
            </button>
          </div>
        )}
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
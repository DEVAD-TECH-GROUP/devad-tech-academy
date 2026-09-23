import { useEffect } from "react";

export default function Drawer({ isOpen, onClose, title, children, position = "right" }) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen) return null;

  const positions = {
    right: "right-0 top-0 h-full w-80",
    left:  "left-0 top-0 h-full w-80",
    bottom: "bottom-0 left-0 w-full rounded-t-2xl",
  };

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/60 fade-ov" onClick={onClose} />
      <div className={`absolute ${positions[position]} bg-surface border-l border-border shadow-2xl slide-in flex flex-col`}>
        <div className="flex items-center justify-between p-5 border-b border-border shrink-0">
          <h3 className="dsp text-sm font-bold text-text">{title}</h3>
          <button onClick={onClose} className="text-muted hover:text-text text-xl">×</button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  );
}
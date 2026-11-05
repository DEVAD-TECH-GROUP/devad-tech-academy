import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

export default function Dropdown({ trigger, items = [], align = "right" }) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const ref = useRef(null);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);

  const updatePosition = () => {
    if (!triggerRef.current) return;

    const rect = triggerRef.current.getBoundingClientRect();

    const menuWidth = 192;
    const menuHeight = menuRef.current?.offsetHeight || 150;

    let left = align === "right" ? rect.right - menuWidth : rect.left;

    left = Math.max(8, Math.min(left, window.innerWidth - menuWidth - 8));

    let top = rect.bottom + 8;

    // Open upwards if there isn't enough room below
    if (top + menuHeight > window.innerHeight - 8) {
      top = rect.top - menuHeight - 8;
    }

    setPosition({ top, left });
  };

  useEffect(() => {
    if (!open) return;

    updatePosition();

    const handleOutsideClick = (e) => {
      if (
        !ref.current?.contains(e.target) &&
        !menuRef.current?.contains(e.target)
      ) {
        setOpen(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === "Escape") setOpen(false);
    };

    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, align]);

  return (
    <>
      <div className="relative" ref={ref}>
        <div
          ref={triggerRef}
          onClick={() => setOpen((prev) => !prev)}
          className="cursor-pointer"
        >
          {trigger}
        </div>
      </div>

      {open &&
        createPortal(
          <div
            ref={menuRef}
            style={{
              position: "fixed",
              top: position.top,
              left: position.left,
              width: "192px",
              zIndex: 99999,
            }}
            className="bg-surface border border-border rounded-xl shadow-2xl overflow-hidden"
          >
            {items.map((item, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setOpen(false);
                  item.onClick?.();
                }}
                className={`w-full text-left px-4 py-2.5 text-sm transition
                  ${
                    item.danger
                      ? "text-red hover:bg-red/10"
                      : "text-text hover:bg-surfaceHigh"
                  }`}
              >
                {item.icon && <span className="mr-2">{item.icon}</span>}
                {item.label}
              </button>
            ))}
          </div>,
          document.body,
        )}
    </>
  );
}

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";

export const C = {
  ACCENT: "#38BDF8",
  ACCENT_LIGHT: "rgba(56,189,248,0.10)",
  ACCENT_BORDER: "rgba(56,189,248,0.22)",
  BG: "#050B14",
  SURFACE: "#0A1220",
  SURFACE2: "#0D1728",
  BORDER: "rgba(148,163,184,0.12)",
  TEXT_PRIMARY: "#F8FAFC",
  TEXT_SECONDARY: "#94A3B8",
  TEXT_MUTED: "#64748B",
  GREEN: "#4ADE80",
  GREEN_BG: "rgba(74,222,128,0.08)",
  RED: "#FCA5A5",
};

const base = {
  width: "100%",
  background: C.SURFACE2,
  border: `1px solid ${C.BORDER}`,
  borderRadius: 10,
  padding: "0.78rem 0.95rem",
  fontSize: 14,
  color: C.TEXT_PRIMARY,
  outline: "none",
  boxSizing: "border-box",
  fontFamily: "inherit",
  transition: "border-color 0.2s, box-shadow 0.2s",
};

function useFocusStyle() {
  const [focused, setFocused] = useState(false);

  return {
    focusProps: {
      onFocus: () => setFocused(true),
      onBlur: () => setFocused(false),
    },
    style: {
      ...base,
      borderColor: focused ? C.ACCENT : C.BORDER,
      boxShadow: focused ? "0 0 0 3px rgba(56,189,248,0.08)" : "none",
    },
  };
}

export function TextInput({ style, ...props }) {
  const f = useFocusStyle();
  return (
    <input {...props} {...f.focusProps} style={{ ...f.style, ...style }} />
  );
}

export function TextArea({ style, minHeight = 100, ...props }) {
  const f = useFocusStyle();
  return (
    <textarea
      {...props}
      {...f.focusProps}
      style={{ ...f.style, resize: "vertical", minHeight, ...style }}
    />
  );
}

export function Select({ style, children, ...props }) {
  const f = useFocusStyle();
  return (
    <select
      {...props}
      {...f.focusProps}
      style={{ ...f.style, cursor: "pointer", ...style }}
    >
      {children}
    </select>
  );
}

export function Label({ children, optional }) {
  return (
    <label
      style={{
        display: "block",
        fontSize: 12,
        fontWeight: 600,
        color: C.TEXT_SECONDARY,
        marginBottom: 7,
        letterSpacing: "0.03em",
      }}
    >
      {children}
      {optional && (
        <span style={{ color: C.TEXT_MUTED, fontWeight: 400 }}>
          {" "}
          (Optional)
        </span>
      )}
    </label>
  );
}

export function SectionTitle({ icon: Icon, children }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        fontSize: 11,
        fontWeight: 700,
        color: C.ACCENT,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        paddingTop: 10,
        paddingBottom: 2,
        borderTop: `1px solid ${C.BORDER}`,
      }}
    >
      {Icon && <Icon size={14} />}
      {children}
    </div>
  );
}

const ghostBtn = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  background: C.ACCENT_LIGHT,
  border: `1px solid ${C.ACCENT_BORDER}`,
  color: C.ACCENT,
  borderRadius: 9,
  padding: "0.55rem 0.9rem",
  fontSize: 12,
  fontWeight: 700,
  cursor: "pointer",
  fontFamily: "inherit",
};

export function RepeatableList({
  rows,
  fields,
  onChange,
  onAdd,
  onRemove,
  addLabel,
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {rows.map((row, i) => (
        <div
          key={i}
          style={{
            background: C.SURFACE,
            border: `1px solid ${C.BORDER}`,
            borderRadius: 12,
            padding: "0.9rem",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 10,
            alignItems: "center",
          }}
        >
          {fields.map((f) => (
            <TextInput
              key={f.key}
              value={row[f.key]}
              placeholder={f.placeholder}
              onChange={(e) => onChange(i, f.key, e.target.value)}
            />
          ))}

          <button
            type="button"
            onClick={() => onRemove(i)}
            style={{
              ...ghostBtn,
              justifySelf: "start",
              color: C.RED,
              background: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.2)",
            }}
          >
            <Trash2 size={13} /> Remove
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={onAdd}
        style={{ ...ghostBtn, alignSelf: "flex-start" }}
      >
        <Plus size={14} /> {addLabel}
      </button>
    </div>
  );
}

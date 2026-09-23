export default function Input({
  label, type = "text", value, onChange,
  placeholder, required, error,
  className = "", disabled = false,
  icon, rightElement,
}) {
  return (
    <div className="w-full">
      {label && (
        <label className="text-xs text-mutedLight font-medium mb-1.5 block">
          {label} {required && <span className="text-red">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted">
            {icon}
          </div>
        )}
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={`
            w-full bg-surfaceHigh border rounded-xl py-3 text-sm text-text
            placeholder-muted focus:outline-none transition
            ${error ? "border-red focus:border-red" : "border-border focus:border-accent"}
            ${icon ? "pl-10" : "pl-4"}
            ${rightElement ? "pr-12" : "pr-4"}
            ${disabled ? "opacity-50 cursor-not-allowed" : ""}
            ${className}
          `}
        />
        {rightElement && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {rightElement}
          </div>
        )}
      </div>
      {error && <p className="text-xs text-red mt-1">{error}</p>}
    </div>
  );
}
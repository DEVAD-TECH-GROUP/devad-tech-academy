export default function Textarea({
  label, value, onChange, placeholder,
  required, error, rows = 4, className = "",
}) {
  return (
    <div className="w-full">
      {label && (
        <label className="text-xs text-mutedLight font-medium mb-1.5 block">
          {label} {required && <span className="text-red">*</span>}
        </label>
      )}
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        rows={rows}
        className={`
          w-full bg-surfaceHigh border rounded-xl px-4 py-3 text-sm text-text
          placeholder-muted focus:outline-none transition resize-none
          ${error ? "border-red" : "border-border focus:border-accent"}
          ${className}
        `}
      />
      {error && <p className="text-xs text-red mt-1">{error}</p>}
    </div>
  );
}
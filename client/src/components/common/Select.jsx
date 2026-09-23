export default function Select({
  label, value, onChange, options = [],
  placeholder = "Select...", required,
  error, className = "",
}) {
  return (
    <div className="w-full">
      {label && (
        <label className="text-xs text-mutedLight font-medium mb-1.5 block">
          {label} {required && <span className="text-red">*</span>}
        </label>
      )}
      <select
        value={value}
        onChange={onChange}
        required={required}
        className={`
          w-full bg-surfaceHigh border rounded-xl px-4 py-3 text-sm text-text
          focus:outline-none transition appearance-none cursor-pointer
          ${error ? "border-red" : "border-border focus:border-accent"}
          ${className}
        `}
      >
        <option value="">{placeholder}</option>
        {options.map(({ value: v, label: l }) => (
          <option key={v} value={v}>{l}</option>
        ))}
      </select>
      {error && <p className="text-xs text-red mt-1">{error}</p>}
    </div>
  );
}
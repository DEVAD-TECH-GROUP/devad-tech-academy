import Spinner from "./Spinner";

export default function Button({
  children, onClick, type = "button",
  variant = "primary", size = "md",
  loading = false, disabled = false,
  className = "", fullWidth = false,
}) {
  const base = "inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary:   "bg-accent hover:bg-accent/90 text-white",
    secondary: "bg-surfaceHigh border border-border text-text hover:border-accent/40",
    danger:    "bg-red/10 border border-red/20 text-red hover:bg-red/20",
    ghost:     "text-muted hover:text-text hover:bg-surfaceHigh",
    success:   "bg-green/10 border border-green/20 text-green hover:bg-green/20",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2.5 text-sm",
    lg: "px-6 py-3 text-sm",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${base} ${variants[variant]} ${sizes[size]} ${fullWidth ? "w-full" : ""} ${className}`}
    >
      {loading && <Spinner size="sm" color="white" />}
      {children}
    </button>
  );
}
export default function Badge({ children, variant = "default", size = "sm" }) {
  const variants = {
    default:  "bg-surfaceHigh text-muted border-border",
    accent:   "bg-accent/10 text-accent border-accent/20",
    green:    "bg-green/10 text-green border-green/20",
    red:      "bg-red/10 text-red border-red/20",
    yellow:   "bg-yellow/10 text-yellow border-yellow/20",
    blue:     "bg-blue/10 text-blue border-blue/20",
    orange:   "bg-orange/10 text-orange border-orange/20",
    purple:   "bg-purple/10 text-purple border-purple/20",
    pink:     "bg-pink/10 text-pink border-pink/20",
  };

  const sizes = {
    xs: "px-1.5 py-0.5 text-[10px]",
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
  };

  return (
    <span className={`inline-flex items-center border rounded-lg font-medium ${variants[variant]} ${sizes[size]}`}>
      {children}
    </span>
  );
}
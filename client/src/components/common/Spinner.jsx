export default function Spinner({ size = "md", color = "accent" }) {
  const sizes = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-10 h-10",
  };

  const colors = {
    accent: "border-accent",
    white: "border-white",
    muted: "border-muted",
  };

  return (
    <div
      className={`${sizes[size] || sizes.md} border-2 ${
        colors[color] || colors.accent
      } border-t-transparent rounded-full animate-spin`}
    />
  );
}

export default function Card({ children, className = "", onClick, hover = false }) {
  return (
    <div
      onClick={onClick}
      className={`
        bg-surface border border-border rounded-2xl
        ${hover ? "hover:border-accent/40 cursor-pointer transition" : ""}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
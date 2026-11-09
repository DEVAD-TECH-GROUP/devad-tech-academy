// Instructor-specific progress bar with label
export default function InstructorProgressBar({ value = 0, label }) {
  return (
    <div>
      {label && (
        <div className="flex justify-between text-xs text-muted mb-1">
          <span>{label}</span>
          <span>{value}%</span>
        </div>
      )}
      <div className="h-1.5 bg-border rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${Math.min(value, 100)}%`,
            background: value >= 100 ? "#34D399" : "#FB923C",
          }}
        />
      </div>
    </div>
  );
}

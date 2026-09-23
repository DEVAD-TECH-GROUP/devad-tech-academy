export default function Rating({ value = 0, max = 5, onChange, readonly = false, size = "md" }) {
  const sizes = { sm: "text-sm", md: "text-lg", lg: "text-2xl" };

  return (
    <div className={`flex items-center gap-0.5 ${sizes[size]}`}>
      {[...Array(max)].map((_, i) => (
        <button
          key={i}
          type="button"
          onClick={() => !readonly && onChange && onChange(i + 1)}
          className={`transition ${readonly ? "cursor-default" : "cursor-pointer hover:scale-110"}`}
        >
          <span className={i < value ? "text-yellow" : "text-border"}>★</span>
        </button>
      ))}
    </div>
  );
}

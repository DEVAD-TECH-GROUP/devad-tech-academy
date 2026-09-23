import { useState } from "react";
import useDebounce from "../../hooks/useDebounce";
import { useEffect } from "react";

export default function SearchBar({ onSearch, placeholder = "Search...", className = "" }) {
  const [query, setQuery] = useState("");
  const debounced = useDebounce(query);

  useEffect(() => {
    onSearch(debounced);
  }, [debounced]);

  return (
    <div className={`relative ${className}`}>
      <svg
        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted"
        fill="none" stroke="currentColor" viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-surfaceHigh border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-text placeholder-muted focus:outline-none focus:border-accent transition"
      />
      {query && (
        <button
          onClick={() => setQuery("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-text text-lg"
        >
          ×
        </button>
      )}
    </div>
  );
}
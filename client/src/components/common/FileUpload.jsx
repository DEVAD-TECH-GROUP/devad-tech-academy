import { useRef } from "react";

export default function FileUpload({ onFile, accept = "*", label = "Upload File", multiple = false }) {
  const ref = useRef(null);

  const handleChange = (e) => {
    const files = multiple ? Array.from(e.target.files) : e.target.files[0];
    if (files) onFile(files);
  };

  return (
    <div>
      <input
        ref={ref}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleChange}
        className="hidden"
      />
      <button
        type="button"
        onClick={() => ref.current.click()}
        className="flex items-center gap-2 bg-surfaceHigh border border-dashed border-border rounded-xl px-4 py-3 text-sm text-muted hover:border-accent/40 hover:text-text transition w-full justify-center"
      >
        <span>📎</span> {label}
      </button>
    </div>
  );
}

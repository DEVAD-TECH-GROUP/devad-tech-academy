import { useRef, useState } from "react";

export default function ImageUpload({ onFile, current, label = "Upload Image" }) {
  const ref = useRef(null);
  const [preview, setPreview] = useState(current || null);

  const handleChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    onFile(file);
  };

  return (
    <div>
      <input ref={ref} type="file" accept="image/*" onChange={handleChange} className="hidden" />
      <div
        onClick={() => ref.current.click()}
        className="w-24 h-24 rounded-2xl border-2 border-dashed border-border hover:border-accent/40 cursor-pointer overflow-hidden flex items-center justify-center bg-surfaceHigh transition"
      >
        {preview
          ? <img src={preview} alt="" className="w-full h-full object-cover" />
          : <span className="text-2xl">📷</span>
        }
      </div>
      <p className="text-xs text-muted mt-1">{label}</p>
    </div>
  );
}
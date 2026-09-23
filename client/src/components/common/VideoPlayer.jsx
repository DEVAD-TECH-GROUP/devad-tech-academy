import { useRef, useState } from "react";

export default function VideoPlayer({ src, poster, onProgress, onComplete }) {
  const ref = useRef(null);
  const [playing, setPlaying] = useState(false);

  const handleTimeUpdate = () => {
    if (!ref.current) return;
    const { currentTime, duration } = ref.current;
    if (onProgress) onProgress({ currentTime, duration });
    if (duration > 0 && currentTime / duration >= 0.9 && onComplete) {
      onComplete();
    }
  };

  return (
    <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden">
      <video
        ref={ref}
        src={src}
        poster={poster}
        className="w-full h-full"
        controls
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onTimeUpdate={handleTimeUpdate}
      />
    </div>
  );
}
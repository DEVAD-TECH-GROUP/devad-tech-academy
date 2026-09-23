import { useMemo } from "react";

export default function GalaxyBackground() {
  const stars = useMemo(() => {
    return Array.from({ length: 80 }).map((_, i) => ({
      id: i,
      size: Math.random() * 3 + 1,
      left: Math.random() * 100,
      top: Math.random() * 100,
      duration: Math.random() * 20 + 10,
      delay: Math.random() * 5,
    }));
  }, []);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-black">
      {stars.map((star) => (
        <span
          key={star.id}
          className="absolute bg-white rounded-full opacity-70 animate-float"
          style={{
            width: star.size,
            height: star.size,
            left: `${star.left}%`,
            top: `${star.top}%`,
            animationDuration: `${star.duration}s`,
            animationDelay: `${star.delay}s`,
          }}
        />
      ))}

      {/* Soft Glow Nebula */}
      <div className="absolute w-[800px] h-[800px] bg-indigo-600/20 blur-[180px] rounded-full top-[-200px] left-[-200px]" />
      <div className="absolute w-[600px] h-[600px] bg-purple-600/20 blur-[160px] rounded-full bottom-[-200px] right-[-200px]" />
    </div>
  );
}

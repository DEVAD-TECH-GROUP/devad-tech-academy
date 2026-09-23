import { useState, useEffect } from "react";

export default function Countdown({ seconds, onExpire }) {
  const [remaining, setRemaining] = useState(seconds);

  useEffect(() => {
    if (remaining <= 0) { onExpire?.(); return; }
    const timer = setInterval(() => setRemaining((r) => r - 1), 1000);
    return () => clearInterval(timer);
  }, [remaining]);

  const m = Math.floor(remaining / 60);
  const s = remaining % 60;

  return (
    <span className={`font-mono font-bold ${remaining < 60 ? "text-red" : "text-text"}`}>
      {String(m).padStart(2, "0")}:{String(s).padStart(2, "0")}
    </span>
  );
}
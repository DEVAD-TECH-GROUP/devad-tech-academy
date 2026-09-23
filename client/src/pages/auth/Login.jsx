import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import useAuthStore from "../../store/authStore";

// ─── Particles ────────────────────────────────────────────────────────────────
function Particles() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let animId;
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);
    const particles = Array.from({ length: 80 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 2 + 0.5,
      dx: (Math.random() - 0.5) * 0.4,
      dy: (Math.random() - 0.5) * 0.4,
      alpha: Math.random() * 0.6 + 0.2,
    }));
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p, i) => {
        particles.slice(i + 1).forEach((p2) => {
          const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (dist < 120) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(0, 180, 255, ${0.15 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        });
      });
      particles.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 200, 255, ${p.alpha})`;
        ctx.fill();
        p.x += p.dx;
        p.y += p.dy;
        if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
      });
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);
  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}

// ─── Circuit Lines ────────────────────────────────────────────────────────────
function CircuitLines({ side }) {
  const isLeft = side === "left";
  return (
    <svg
      className={`absolute top-0 ${isLeft ? "left-0" : "right-0"} h-full w-64 opacity-20 pointer-events-none`}
      viewBox="0 0 200 600"
      preserveAspectRatio="none"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d={
          isLeft
            ? "M200 50 H120 V150 H60 V250 H100 V350 H40 V450 H130 V550"
            : "M0 80 H80 V180 H140 V280 H90 V380 H160 V480 H70 V560"
        }
        stroke="#00b4ff"
        strokeWidth="1.5"
        strokeDasharray="6 4"
        className="animate-pulse"
      />
      {[60, 160, 260, 360, 460].map((y, i) => (
        <circle
          key={i}
          cx={isLeft ? [120, 60, 100, 40, 130][i] : [80, 140, 90, 160, 70][i]}
          cy={y}
          r="4"
          fill="#00d4ff"
          className="animate-pulse"
          style={{ animationDelay: `${i * 0.3}s` }}
        />
      ))}
    </svg>
  );
}

// ─── Input Field ──────────────────────────────────────────────────────────────
function InputField({ id, type = "text", placeholder, value, onChange, icon, focusedField, setFocusedField, rightSlot }) {
  return (
    <div className="relative group">
      <div
        className="absolute inset-0 rounded-xl transition-opacity duration-300"
        style={{
          background: "linear-gradient(135deg, #0066ff22, #00d4ff11)",
          opacity: focusedField === id ? 1 : 0,
          border: "1px solid rgba(0,180,255,0.4)",
          borderRadius: "12px",
        }}
      />
      <div
        className="relative flex items-center rounded-xl overflow-hidden"
        style={{
          background: "rgba(255,255,255,0.04)",
          border: `1px solid ${focusedField === id ? "rgba(0,180,255,0.5)" : "rgba(100,150,255,0.15)"}`,
          transition: "border-color 0.3s",
        }}
      >
        <div className="pl-4 pr-3 flex items-center">
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            style={{
              color: focusedField === id ? "#38bdf8" : "rgba(150,180,255,0.5)",
              transition: "color 0.3s",
            }}
          >
            {icon}
          </svg>
        </div>
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onFocus={() => setFocusedField(id)}
          onBlur={() => setFocusedField(null)}
          className="flex-1 py-3.5 pr-4 bg-transparent outline-none text-sm"
          style={{
            color: "rgba(220,235,255,0.9)",
            fontFamily: "'Rajdhani', sans-serif",
            fontSize: "14px",
            letterSpacing: "0.02em",
          }}
        />
        {rightSlot}
      </div>
    </div>
  );
}

const ICONS = {
  email: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />,
  lock: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />,
};

function EyeIcon({ open }) {
  return open ? (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  ) : (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const navigate = useNavigate();
  const { login, isLoading } = useAuthStore();

  useEffect(() => {
    setTimeout(() => setMounted(true), 100);
  }, []);

  const set = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation (same logic as your original, but using toasts)
    const { email, password } = form;
    if (!email) {
      toast.error("Please enter your email address.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Please enter a valid email address.");
      return;
    }
    if (!password) {
      toast.error("Please enter your password.");
      return;
    }

    try {
      setLoading(true);
      const user = await login(form.email, form.password);
      toast.success("Welcome back! 👋");

      if (user.role === "super_admin") {
        navigate("/admin/dashboard");
      } else if (user.role === "instructor") {
        navigate("/instructor/dashboard");
      } else {
        navigate("/student/dashboard");
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Login failed"
      );
    } finally {
      setLoading(false);
    }
  };

  const googleAuthUrl = `${import.meta.env.VITE_API_URL}/auth/google`;

  const cardStyle = {
    transform: mounted ? "translateY(0)" : "translateY(30px)",
    opacity: mounted ? 1 : 0,
    transition: "all 0.7s cubic-bezier(0.23, 1, 0.32, 1)",
  };

  const fadeIn = (delay) => ({
    transform: mounted ? "translateY(0)" : "translateY(10px)",
    opacity: mounted ? 1 : 0,
    transition: `all 0.8s cubic-bezier(0.23, 1, 0.32, 1) ${delay}s`,
  });

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center relative overflow-hidden py-24"
      style={{
        background: "linear-gradient(135deg, #020b18 0%, #041428 40%, #061c35 70%, #030e1c 100%)",
      }}
    >
      <Particles />

      {/* Glow spots */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 1 }}>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #0066ff 0%, transparent 70%)", filter: "blur(40px)" }} />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-8"
          style={{ background: "radial-gradient(circle, #00aaff 0%, transparent 70%)", filter: "blur(50px)" }} />
      </div>

      {/* Circuit lines */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 1 }}>
        <CircuitLines side="left" />
        <div className="absolute right-0 top-0 h-full w-64">
          <CircuitLines side="right" />
        </div>
      </div>

      {/* Card */}
      <div className="relative w-full max-w-md mx-4" style={{ zIndex: 10, ...cardStyle }}>
        <div
          className="absolute -inset-0.5 rounded-2xl opacity-60"
          style={{
            background: "linear-gradient(135deg, #0066ff44, #00d4ff33, #0066ff22)",
            filter: "blur(1px)",
          }}
        />

        <div
          className="relative rounded-2xl p-8 overflow-hidden"
          style={{
            background: "linear-gradient(160deg, rgba(6,20,45,0.95) 0%, rgba(4,14,32,0.98) 100%)",
            border: "1px solid rgba(0,180,255,0.25)",
            boxShadow: "0 0 60px rgba(0,100,255,0.15), 0 25px 50px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)",
            backdropFilter: "blur(20px)",
          }}
        >
          <div className="absolute top-0 left-0 right-0 h-px"
            style={{ background: "linear-gradient(90deg, transparent, rgba(0,200,255,0.6), transparent)" }} />

          {/* Header */}
          <div className="text-center mb-6" style={fadeIn(0.25)}>
            <h2
              className="text-xl font-bold uppercase tracking-wider"
              style={{
                background: "linear-gradient(90deg, #38bdf8, #60a5fa)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                fontFamily: "'Orbitron', sans-serif",
              }}
            >
              Welcome Back
            </h2>
            <p className="text-sm mt-1" style={{ color: "rgba(180,210,255,0.65)" }}>
              Sign in to continue your learning journey
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3" style={fadeIn(0.35)}>
            <InputField
              id="email"
              type="email"
              placeholder="Email address"
              value={form.email}
              onChange={set("email")}
              focusedField={focusedField}
              setFocusedField={setFocusedField}
              icon={ICONS.email}
            />

            <div className="space-y-2">
              <InputField
                id="password"
                type={showPass ? "text" : "password"}
                placeholder="Password"
                value={form.password}
                onChange={set("password")}
                focusedField={focusedField}
                setFocusedField={setFocusedField}
                icon={ICONS.lock}
                rightSlot={
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="px-4 flex items-center transition-colors duration-200"
                    style={{ color: showPass ? "#38bdf8" : "rgba(150,180,255,0.5)" }}
                  >
                    <EyeIcon open={showPass} />
                  </button>
                }
              />
              <div className="text-right px-1">
                <button
                  type="button"
                  onClick={() => navigate("/forgot-password")}
                  className="font-bold transition-all duration-200 hover:brightness-125 cursor-pointer"
                  style={{ color: "#38bdf8", fontFamily: "'Orbitron', sans-serif", fontSize: "11px" }}
                >
                  Forgot Password?
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || isLoading}
              className="w-full relative overflow-hidden rounded-xl py-3.5 font-bold text-sm tracking-widest transition-all duration-300 group mt-5 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              style={{
                background: loading || isLoading
                  ? "rgba(0,100,200,0.5)"
                  : "linear-gradient(135deg, #0066ff 0%, #0099ff 50%, #00c8ff 100%)",
                color: "#fff",
                fontFamily: "'Orbitron', 'Rajdhani', sans-serif",
                fontSize: "13px",
                letterSpacing: "0.15em",
                boxShadow: loading || isLoading ? "none" : "0 0 30px rgba(0,150,255,0.4), 0 4px 15px rgba(0,100,255,0.3)",
                transform: loading || isLoading ? "scale(0.99)" : "scale(1)",
              }}
            >
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 shimmer-effect"
                style={{
                  background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 50%, transparent 100%)",
                }}
              />
              <span className="relative flex items-center justify-center gap-3">
                {loading || isLoading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    SIGNING IN...
                  </>
                ) : (
                  <>
                    SIGN IN
                    <svg
                      className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
                      fill="none" viewBox="0 0 24 24" stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </>
                )}
              </span>
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-5" style={fadeIn(0.45)}>
            <div className="flex-1 h-px bg-slate-800" />
            <span className="px-3 text-xs tracking-wider" style={{ color: "rgba(150,180,255,0.35)", fontFamily: "'Orbitron', sans-serif" }}>OR</span>
            <div className="flex-1 h-px bg-slate-800" />
          </div>

          {/* Google */}
          <div style={fadeIn(0.55)} className="w-full flex justify-center min-h-[40px] GoogleLoginWrapper cursor-pointer">
            <div className="w-[350px] overflow-hidden rounded-xl bg-[#0b1426] flex justify-center">
              <a
                href={googleAuthUrl}
                className="w-full flex items-center justify-center gap-3 rounded-xl border border-slate-700 bg-[#0b1426] py-3 text-sm font-medium text-slate-200 transition hover:border-[#00b4ff] hover:bg-[#0f1b33]"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continue with Google
              </a>
            </div>
          </div>

          {/* Register link */}
          <p
            className="text-center text-sm mt-5"
            style={{ color: "rgba(150,180,255,0.55)", fontFamily: "'Rajdhani', sans-serif", ...fadeIn(0.65) }}
          >
            Don't have an account yet?{" "}
            <button
              type="button"
              onClick={() => navigate("/register")}
              className="font-bold transition-all duration-200 hover:brightness-125 cursor-pointer"
              style={{ color: "#38bdf8", fontFamily: "'Orbitron', sans-serif", fontSize: "12px" }}
            >
              Register
            </button>
          </p>

          <div
            className="absolute bottom-0 left-0 right-0 h-px"
            style={{ background: "linear-gradient(90deg, transparent, rgba(0,150,255,0.3), transparent)" }}
          />
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@400;500;600;700&display=swap');

        @keyframes shimmerAnimation {
          0% { transform: translateX(-100%) skewX(-20deg); }
          100% { transform: translateX(300%) skewX(-20deg); }
        }
        .shimmer-effect {
          transform: skewX(-20deg);
          animation: shimmerAnimation 1.5s infinite;
        }
        input::placeholder {
          color: rgba(150, 180, 255, 0.35);
          font-family: 'Rajdhani', sans-serif;
        }
        .GoogleLoginWrapper iframe,
        .GoogleLoginWrapper a {
          background-color: transparent !important;
          color-scheme: dark !important;
        }
        * { -webkit-font-smoothing: antialiased; }

        /* Mobile responsiveness tweaks */
        @media (max-width: 420px) {
          .GoogleLoginWrapper > div {
            width: 100% !important;
            max-width: 350px;
          }
        }
      `}</style>
    </div>
  );
}

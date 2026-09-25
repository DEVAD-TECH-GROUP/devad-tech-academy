import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  ArrowLeft,
  CheckCircle2,
  Mail,
  Send,
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";

// ============================================================
// DEVAD TECH ACADEMY — FORGOT PASSWORD
// Same visual language as Login.jsx
// ============================================================

const log = (...args) => {
  console.log("[DEVAD FORGOT PASSWORD]", ...args);
};

// ============================================================
// PARTICLES
// ============================================================

const Particles = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    let animationFrame;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resize();

    const particles = Array.from({ length: 80 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 1.5 + 0.4,
      speedX: (Math.random() - 0.5) * 0.25,
      speedY: (Math.random() - 0.5) * 0.25,
      opacity: Math.random() * 0.5 + 0.2,
    }));

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle) => {
        particle.x += particle.speedX;
        particle.y += particle.speedY;

        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;

        ctx.beginPath();
        ctx.arc(
          particle.x,
          particle.y,
          particle.radius,
          0,
          Math.PI * 2
        );

        ctx.fillStyle = `rgba(56, 189, 248, ${particle.opacity})`;
        ctx.fill();
      });

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);

            ctx.strokeStyle = `rgba(0, 180, 255, ${
              0.08 * (1 - distance / 120)
            })`;

            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      animationFrame = requestAnimationFrame(animate);
    };

    animate();

    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
    />
  );
};

// ============================================================
// CIRCUIT LINES
// ============================================================

const CircuitLines = () => {
  return (
    <>
      <svg
        className="fixed left-0 top-0 h-full w-1/3 pointer-events-none opacity-30"
        viewBox="0 0 400 800"
        preserveAspectRatio="none"
      >
        <path
          d="M0 120 H100 V220 H180 V320 H280"
          fill="none"
          stroke="rgba(0,180,255,0.25)"
          strokeWidth="1"
        />

        <path
          d="M0 500 H80 V420 H160 V360 H240"
          fill="none"
          stroke="rgba(0,180,255,0.18)"
          strokeWidth="1"
        />

        <circle
          cx="100"
          cy="120"
          r="3"
          fill="rgba(56,189,248,0.6)"
        />

        <circle
          cx="180"
          cy="220"
          r="3"
          fill="rgba(56,189,248,0.5)"
        />

        <circle
          cx="160"
          cy="420"
          r="3"
          fill="rgba(56,189,248,0.5)"
        />
      </svg>

      <svg
        className="fixed right-0 top-0 h-full w-1/3 pointer-events-none opacity-30"
        viewBox="0 0 400 800"
        preserveAspectRatio="none"
      >
        <path
          d="M400 180 H300 V280 H220 V380 H120"
          fill="none"
          stroke="rgba(0,180,255,0.25)"
          strokeWidth="1"
        />

        <path
          d="M400 560 H320 V480 H250 V400 H180"
          fill="none"
          stroke="rgba(0,180,255,0.18)"
          strokeWidth="1"
        />

        <circle
          cx="300"
          cy="180"
          r="3"
          fill="rgba(56,189,248,0.6)"
        />

        <circle
          cx="220"
          cy="280"
          r="3"
          fill="rgba(56,189,248,0.5)"
        />

        <circle
          cx="250"
          cy="480"
          r="3"
          fill="rgba(56,189,248,0.5)"
        />
      </svg>
    </>
  );
};

// ============================================================
// INPUT FIELD
// ============================================================

const InputField = ({
  icon: Icon,
  type = "text",
  value,
  onChange,
  placeholder,
  name,
  disabled = false,
}) => {
  return (
    <div className="relative">
      <Icon
        size={18}
        strokeWidth={1.7}
        className="absolute left-4 top-1/2 -translate-y-1/2 text-sky-400/70 pointer-events-none"
      />

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete="email"
        className="w-full rounded-xl border border-cyan-400/20 bg-slate-950/50 py-3.5 pl-11 pr-4 text-sm text-blue-100 placeholder:text-blue-200/30 outline-none transition-all duration-300 focus:border-cyan-400/60 focus:bg-slate-950/70 focus:ring-2 focus:ring-cyan-400/10 disabled:cursor-not-allowed disabled:opacity-50"
        style={{
          fontFamily: "'Rajdhani', sans-serif",
          letterSpacing: "0.03em",
        }}
      />
    </div>
  );
};

// ============================================================
// MAIN COMPONENT
// ============================================================

const ForgotPassword = () => {
  const navigate = useNavigate();

  const { forgotPassword, isLoading } = useAuthStore();

  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    log("Forgot password page mounted.");

    return () => {
      log("Forgot password page unmounted.");
    };
  }, []);

  // ============================================================
  // SUBMIT
  // ============================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      toast.error("Please enter your email address.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(normalizedEmail)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    try {
      log("Submitting password reset request.");

      await forgotPassword(normalizedEmail);

      setSubmitted(true);

      toast.success("Password reset email sent.");

      log("Password reset request completed.");
    } catch (error) {
      log("Password reset request failed:", {
        message: error?.message,
        status: error?.response?.status,
        responseMessage: error?.response?.data?.message,
      });

      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to send password reset email."
      );
    }
  };

  // ============================================================
  // SUCCESS STATE
  // ============================================================

  if (submitted) {
    return (
      <div
        className="relative min-h-screen overflow-hidden flex items-center justify-center px-4 py-10"
        style={{
          background:
            "linear-gradient(135deg, #020b18 0%, #041428 40%, #061c35 70%, #030e1c 100%)",
        }}
      >
        <Particles />
        <CircuitLines />

        <div
          className="fixed inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at 50% 50%, rgba(0,140,255,0.10), transparent 45%)",
          }}
        />

        <div
          className={`relative z-10 w-full max-w-md transition-all duration-700 ${
            mounted
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-4"
          }`}
        >
          <div
            className="relative overflow-hidden rounded-2xl p-8"
            style={{
              background:
                "linear-gradient(160deg, rgba(6,20,45,0.95) 0%, rgba(4,14,32,0.98) 100%)",
              border: "1px solid rgba(0,180,255,0.25)",
              boxShadow:
                "0 0 60px rgba(0,100,255,0.15), 0 25px 50px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)",
              backdropFilter: "blur(20px)",
            }}
          >
            <div
              className="absolute left-0 right-0 top-0 h-px"
              style={{
                background:
                  "linear-gradient(90deg, transparent, #38bdf8, transparent)",
              }}
            />

            <div className="text-center">
              <div
                className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full"
                style={{
                  background:
                    "radial-gradient(circle, rgba(0,180,255,0.18), rgba(0,180,255,0.04))",
                  border: "1px solid rgba(56,189,248,0.35)",
                  boxShadow:
                    "0 0 30px rgba(0,180,255,0.15)",
                }}
              >
                <CheckCircle2
                  size={30}
                  strokeWidth={1.5}
                  className="text-sky-400"
                />
              </div>

              <div
                className="mb-2 text-xs uppercase tracking-[0.3em] text-sky-400/70"
                style={{
                  fontFamily: "'Orbitron', sans-serif",
                }}
              >
                DEVAD TECH ACADEMY
              </div>

              <h1
                className="mb-3 text-2xl font-bold"
                style={{
                  fontFamily: "'Orbitron', sans-serif",
                  background:
                    "linear-gradient(90deg, #38bdf8, #60a5fa)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Check Your Email
              </h1>

              <p
                className="mx-auto max-w-sm text-sm leading-6 text-blue-100/60"
                style={{
                  fontFamily: "'Rajdhani', sans-serif",
                  fontSize: "16px",
                }}
              >
                If an account exists for this email, a password
                reset link has been sent. Please check your inbox.
              </p>

              <div className="mt-8 space-y-3">
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="group relative w-full overflow-hidden rounded-xl py-3.5 text-sm font-semibold uppercase tracking-widest text-white transition-all duration-300 hover:scale-[1.01]"
                  style={{
                    fontFamily: "'Rajdhani', sans-serif",
                    background:
                      "linear-gradient(135deg, #0284c7, #2563eb)",
                    boxShadow:
                      "0 0 25px rgba(14,165,233,0.25)",
                  }}
                >
                  CONTINUE TO SIGN IN
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false);
                    setEmail("");
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm text-blue-200/60 transition-colors hover:text-sky-300"
                  style={{
                    fontFamily: "'Rajdhani', sans-serif",
                  }}
                >
                  <ArrowLeft size={16} />
                  USE ANOTHER EMAIL
                </button>
              </div>
            </div>
          </div>
        </div>

        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800&family=Rajdhani:wght@400;500;600;700&display=swap');
        `}</style>
      </div>
    );
  }

  // ============================================================
  // FORM
  // ============================================================

  return (
    <div
      className="relative min-h-screen overflow-hidden flex items-center justify-center px-4 py-10"
      style={{
        background:
          "linear-gradient(135deg, #020b18 0%, #041428 40%, #061c35 70%, #030e1c 100%)",
      }}
    >
      <Particles />
      <CircuitLines />

      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(0,140,255,0.10), transparent 45%)",
        }}
      />

      <div
        className="fixed left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(0,100,255,0.08), transparent 65%)",
          filter: "blur(30px)",
        }}
      />

      <div
        className={`relative z-10 w-full max-w-md transition-all duration-700 ${
          mounted
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-4"
        }`}
      >
        <div
          className="relative overflow-hidden rounded-2xl p-8"
          style={{
            background:
              "linear-gradient(160deg, rgba(6,20,45,0.95) 0%, rgba(4,14,32,0.98) 100%)",
            border: "1px solid rgba(0,180,255,0.25)",
            boxShadow:
              "0 0 60px rgba(0,100,255,0.15), 0 25px 50px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)",
            backdropFilter: "blur(20px)",
          }}
        >
          <div
            className="absolute left-0 right-0 top-0 h-px"
            style={{
              background:
                "linear-gradient(90deg, transparent, #38bdf8, transparent)",
            }}
          />

          {/* HEADER */}
          <div className="mb-8 text-center">
            <div
              className="mb-2 text-xs uppercase tracking-[0.3em] text-sky-400/70"
              style={{
                fontFamily: "'Orbitron', sans-serif",
              }}
            >
              DEVAD TECH ACADEMY
            </div>

            <h1
              className="mb-2 text-2xl font-bold"
              style={{
                fontFamily: "'Orbitron', sans-serif",
                background:
                  "linear-gradient(90deg, #38bdf8, #60a5fa)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Forgot Password
            </h1>

            <p
              className="text-sm text-blue-100/50"
              style={{
                fontFamily: "'Rajdhani', sans-serif",
                fontSize: "16px",
              }}
            >
              Enter your email to receive a password reset link
            </p>
          </div>

          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <InputField
              icon={Mail}
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              disabled={isLoading}
            />

            <button
              type="submit"
              disabled={isLoading}
              className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl py-3.5 text-sm font-semibold uppercase tracking-widest text-white transition-all duration-300 hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
              style={{
                fontFamily: "'Rajdhani', sans-serif",
                background:
                  "linear-gradient(135deg, #0284c7, #2563eb)",
                boxShadow:
                  "0 0 25px rgba(14,165,233,0.25)",
              }}
            >
              {isLoading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  SENDING...
                </>
              ) : (
                <>
                  <Send size={17} />
                  SEND RESET LINK
                </>
              )}
            </button>
          </form>

          {/* BACK TO LOGIN */}
          <div className="mt-7 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-sm text-blue-200/50 transition-colors hover:text-sky-300"
              style={{
                fontFamily: "'Rajdhani', sans-serif",
              }}
            >
              <ArrowLeft size={16} />
              Back to Sign In
            </Link>
          </div>
        </div>

        <div
          className="mt-5 text-center text-xs text-blue-200/25"
          style={{
            fontFamily: "'Rajdhani', sans-serif",
          }}
        >
          SECURE ACCOUNT RECOVERY • DEVAD TECH ACADEMY
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800&family=Rajdhani:wght@400;500;600;700&display=swap');
      `}</style>
    </div>
  );
};

export default ForgotPassword;

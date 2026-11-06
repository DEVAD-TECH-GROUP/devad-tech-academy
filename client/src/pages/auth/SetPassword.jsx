import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  LockKeyhole,
  ShieldCheck,
  ShieldAlert,
  GraduationCap,
  Check,
  X,
} from "lucide-react";

import api from "../../services/api";

// ============================================================
// DEVAD TECH ACADEMY
// INSTRUCTOR PASSWORD SETUP
//
// Flow:
// Approval Email → Password Setup → Instructor Login
//
// Backend:
// POST /auth/set-password
//
// Token:
// /set-password/:token
// ============================================================

const log = (...args) => {
  console.log("[DEVAD SET PASSWORD]", ...args);
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

        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);

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
    <canvas className="fixed inset-0 pointer-events-none" ref={canvasRef} />
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

        <circle cx="100" cy="120" r="3" fill="rgba(56,189,248,0.6)" />
        <circle cx="180" cy="220" r="3" fill="rgba(56,189,248,0.5)" />
        <circle cx="160" cy="420" r="3" fill="rgba(56,189,248,0.5)" />
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

        <circle cx="300" cy="180" r="3" fill="rgba(56,189,248,0.6)" />
        <circle cx="220" cy="280" r="3" fill="rgba(56,189,248,0.5)" />
        <circle cx="250" cy="480" r="3" fill="rgba(56,189,248,0.5)" />
      </svg>
    </>
  );
};

// ============================================================
// INPUT FIELD
// ============================================================

const InputField = ({
  value,
  onChange,
  placeholder,
  name,
  type = "password",
  disabled = false,
  autoComplete = "new-password",
  rightElement,
}) => {
  return (
    <div className="relative">
      <LockKeyhole
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
        autoComplete={autoComplete}
        required
        minLength={8}
        maxLength={50}
        className={`w-full rounded-xl border border-cyan-400/20 bg-slate-950/50 py-3.5 ${
          rightElement ? "pr-12" : "pr-4"
        } pl-11 text-sm text-blue-100 placeholder:text-blue-200/30 outline-none transition-all duration-300 focus:border-cyan-400/60 focus:bg-slate-950/70 focus:ring-2 focus:ring-cyan-400/10 disabled:cursor-not-allowed disabled:opacity-50`}
        style={{
          fontFamily: "'Rajdhani', sans-serif",
          letterSpacing: "0.03em",
        }}
      />

      {rightElement && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {rightElement}
        </div>
      )}
    </div>
  );
};

// ============================================================
// PASSWORD REQUIREMENTS
// ============================================================

const PasswordRequirements = ({ password }) => {
  const requirements = [
    {
      label: "At least 8 characters",
      valid: password.length >= 8,
    },
    {
      label: "Uppercase letter",
      valid: /[A-Z]/.test(password),
    },
    {
      label: "Lowercase letter",
      valid: /[a-z]/.test(password),
    },
    {
      label: "Number",
      valid: /\d/.test(password),
    },
  ];

  const completed = requirements.filter(
    (requirement) => requirement.valid,
  ).length;

  return (
    <div className="rounded-xl border border-cyan-400/10 bg-slate-950/30 p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <p
          className="text-xs uppercase tracking-[0.2em] text-blue-200/40"
          style={{ fontFamily: "'Orbitron', sans-serif" }}
        >
          Password Requirements
        </p>

        <span
          className="text-xs text-sky-400"
          style={{ fontFamily: "'Rajdhani', sans-serif" }}
        >
          {completed}/4
        </span>
      </div>

      <div className="mb-4 grid grid-cols-4 gap-2">
        {requirements.map((requirement, index) => (
          <div
            key={index}
            className={`h-1 rounded-full transition-all duration-300 ${
              requirement.valid
                ? "bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.7)]"
                : "bg-blue-200/10"
            }`}
          />
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {requirements.map((requirement) => (
          <div
            key={requirement.label}
            className={`flex items-center gap-2 text-xs transition-colors ${
              requirement.valid ? "text-cyan-300" : "text-blue-200/35"
            }`}
            style={{ fontFamily: "'Rajdhani', sans-serif" }}
          >
            {requirement.valid ? (
              <Check size={13} />
            ) : (
              <span className="h-1.5 w-1.5 rounded-full bg-blue-200/20" />
            )}

            {requirement.label}
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================================
// HEADER
// ============================================================

const Header = ({ title, subtitle }) => {
  return (
    <div className="mb-8 text-center">
      <div
        className="mb-2 text-xs uppercase tracking-[0.3em] text-sky-400/70"
        style={{ fontFamily: "'Orbitron', sans-serif" }}
      >
        DEVAD TECH ACADEMY
      </div>

      <h1
        className="mb-3 text-2xl font-bold"
        style={{
          fontFamily: "'Orbitron', sans-serif",
          background: "linear-gradient(90deg, #38bdf8, #60a5fa)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        {title}
      </h1>

      <p
        className="text-sm leading-6 text-blue-100/50"
        style={{
          fontFamily: "'Rajdhani', sans-serif",
          fontSize: "16px",
        }}
      >
        {subtitle}
      </p>
    </div>
  );
};

// ============================================================
// PRIMARY BUTTON
// ============================================================

const PrimaryButton = ({
  children,
  type = "button",
  loading = false,
  disabled = false,
  icon: Icon,
}) => {
  return (
    <button
      type={type}
      disabled={loading || disabled}
      className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl py-3.5 text-sm font-semibold uppercase tracking-widest text-white transition-all duration-300 hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
      style={{
        fontFamily: "'Rajdhani', sans-serif",
        background: "linear-gradient(135deg, #0284c7, #2563eb)",
        boxShadow: "0 0 25px rgba(14,165,233,0.25)",
      }}
    >
      {loading ? (
        <>
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          CREATING PASSWORD...
        </>
      ) : (
        <>
          {Icon && <Icon size={17} />}
          {children}
        </>
      )}
    </button>
  );
};

// ============================================================
// PAGE SHELL
// ============================================================

const PageShell = ({ children, mounted }) => {
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
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        <div
          className="relative overflow-hidden rounded-2xl p-6 sm:p-8"
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

          {children}
        </div>

        <div
          className="mt-5 text-center text-xs text-blue-200/25"
          style={{ fontFamily: "'Rajdhani', sans-serif" }}
        >
          SECURE ACCOUNT ACTIVATION • DEVAD TECH ACADEMY
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800&family=Rajdhani:wght@400;500;600;700&display=swap');
      `}</style>
    </div>
  );
};

// ============================================================
// MAIN
// ============================================================

export default function SetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    log("Password setup page mounted.");

    if (!token) {
      log("Password setup token is missing.");
    }

    return () => {
      log("Password setup page unmounted.");
    };
  }, [token]);

  // ============================================================
  // PASSWORD VALIDATION
  // ============================================================

  const requirementsMet =
    password.length >= 8 &&
    password.length <= 50 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /\d/.test(password);

  // ============================================================
  // SET PASSWORD
  // ============================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      toast.error("Your password setup link is invalid.");
      return;
    }

    if (!requirementsMet) {
      toast.error("Please meet all password requirements.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Your passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      log("Submitting instructor password setup.");

      const response = await api.post("/auth/set-password", {
        token,
        password,
        confirmPassword,
      });

      log("Password setup successful.");

      setSuccess(true);

      setPassword("");
      setConfirmPassword("");

      toast.success(
        response.data.message || "Your password has been created successfully.",
      );
    } catch (error) {
      log("Password setup failed.", {
        message: error?.message,
        status: error?.response?.status,
        responseMessage: error?.response?.data?.message,
      });

      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to create your password. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // SUCCESS SCREEN
  // ============================================================

  if (success) {
    return (
      <PageShell mounted={mounted}>
        <div className="text-center">
          <div
            className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(0,180,255,0.18), rgba(0,180,255,0.04))",
              border: "1px solid rgba(56,189,248,0.35)",
              boxShadow: "0 0 30px rgba(0,180,255,0.15)",
            }}
          >
            <CheckCircle2
              size={32}
              strokeWidth={1.5}
              className="text-sky-400"
            />
          </div>

          <Header
            title="Account Activated"
            subtitle="Your password has been created successfully. You can now access your instructor account."
          />

          <div
            className="mb-7 rounded-xl border border-cyan-400/15 bg-slate-950/30 p-4 text-left"
            style={{ fontFamily: "'Rajdhani', sans-serif" }}
          >
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-cyan-300">
              <ShieldCheck size={17} />
              YOUR ACCOUNT IS READY
            </div>

            <p className="text-sm leading-6 text-blue-100/45">
              Your instructor account is now ready for sign-in. Use your
              registered email address and newly created password to continue.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/login", { replace: true })}
            className="flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold uppercase tracking-widest text-white transition-all duration-300 hover:scale-[1.01]"
            style={{
              fontFamily: "'Rajdhani', sans-serif",
              background: "linear-gradient(135deg, #0284c7, #2563eb)",
              boxShadow: "0 0 25px rgba(14,165,233,0.25)",
            }}
          >
            CONTINUE TO SIGN IN
            <ArrowRight size={17} />
          </button>
        </div>
      </PageShell>
    );
  }

  // ============================================================
  // INVALID TOKEN NOTICE
  // ============================================================

  if (!token) {
    return (
      <PageShell mounted={mounted}>
        <div className="text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-rose-400/20 bg-rose-400/10">
            <ShieldAlert size={30} className="text-rose-400" />
          </div>

          <Header
            title="Invalid Setup Link"
            subtitle="This password setup link is incomplete. Please use the link provided in your instructor approval email."
          />

          <Link
            to="/login"
            className="flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold uppercase tracking-widest text-white"
            style={{
              fontFamily: "'Rajdhani', sans-serif",
              background: "linear-gradient(135deg, #0284c7, #2563eb)",
            }}
          >
            <ArrowLeft size={17} />
            BACK TO SIGN IN
          </Link>
        </div>
      </PageShell>
    );
  }

  // ============================================================
  // PASSWORD SETUP FORM
  // ============================================================

  return (
    <PageShell mounted={mounted}>
      {/* Brand Icon */}
      <div className="mb-6 flex justify-center">
        <div
          className="flex h-14 w-14 items-center justify-center rounded-2xl"
          style={{
            background:
              "radial-gradient(circle, rgba(0,180,255,0.18), rgba(0,180,255,0.04))",
            border: "1px solid rgba(56,189,248,0.3)",
            boxShadow: "0 0 30px rgba(0,180,255,0.12)",
          }}
        >
          <GraduationCap size={27} className="text-sky-400" />
        </div>
      </div>

      <Header
        title="Create Your Password"
        subtitle="Your instructor application has been approved. Set up your password to activate your instructor account."
      />

      {/* Approval Notice */}
      <div
        className="mb-6 flex items-start gap-3 rounded-xl border border-cyan-400/15 bg-cyan-400/[0.04] p-4"
        style={{ fontFamily: "'Rajdhani', sans-serif" }}
      >
        <ShieldCheck size={19} className="mt-0.5 shrink-0 text-sky-400" />

        <div>
          <p className="text-sm font-semibold text-sky-300">
            APPLICATION APPROVED
          </p>

          <p className="mt-1 text-xs leading-5 text-blue-100/45">
            Welcome to DEVAD TECH ACADEMY. Your instructor journey starts here.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* New Password */}
        <div>
          <label
            className="mb-2 block text-xs uppercase tracking-[0.2em] text-blue-200/50"
            style={{ fontFamily: "'Orbitron', sans-serif" }}
          >
            New Password
          </label>

          <InputField
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Create a strong password"
            type={showPassword ? "text" : "password"}
            disabled={loading}
            rightElement={
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="text-blue-200/40 transition-colors hover:text-sky-300"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            }
          />
        </div>

        {/* Confirm Password */}
        <div>
          <label
            className="mb-2 block text-xs uppercase tracking-[0.2em] text-blue-200/50"
            style={{ fontFamily: "'Orbitron', sans-serif" }}
          >
            Confirm Password
          </label>

          <InputField
            name="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Enter your password again"
            type={showConfirmPassword ? "text" : "password"}
            disabled={loading}
            rightElement={
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="text-blue-200/40 transition-colors hover:text-sky-300"
                aria-label={
                  showConfirmPassword ? "Hide password" : "Show password"
                }
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            }
          />
        </div>

        {/* Password Match */}
        {confirmPassword && (
          <div
            className={`flex items-center gap-2 text-xs ${
              password === confirmPassword ? "text-cyan-300" : "text-rose-400"
            }`}
            style={{ fontFamily: "'Rajdhani', sans-serif" }}
          >
            {password === confirmPassword ? (
              <Check size={14} />
            ) : (
              <X size={14} />
            )}

            {password === confirmPassword
              ? "Passwords match"
              : "Passwords do not match"}
          </div>
        )}

        {/* Requirements */}
        <PasswordRequirements password={password} />

        {/* Submit */}
        <PrimaryButton
          type="submit"
          loading={loading}
          disabled={
            !requirementsMet || !confirmPassword || password !== confirmPassword
          }
          icon={ArrowRight}
        >
          CREATE MY PASSWORD
        </PrimaryButton>
      </form>

      {/* Footer Link */}
      <div className="mt-7 text-center">
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-sm text-blue-200/40 transition-colors hover:text-sky-300"
          style={{ fontFamily: "'Rajdhani', sans-serif" }}
        >
          <ArrowLeft size={16} />
          Back to Sign In
        </Link>
      </div>
    </PageShell>
  );
}

import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Send,
} from "lucide-react";

import { useAuthStore } from "../../store/authStore";

// ============================================================
// DEVAD TECH ACADEMY
// FORGOT PASSWORD
//
// Flow:
// Email → OTP → New Password → Success
//
// Backend:
// POST /auth/forgot-password
// POST /auth/reset-password
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

            ctx.moveTo(
              particles[i].x,
              particles[i].y
            );

            ctx.lineTo(
              particles[j].x,
              particles[j].y
            );

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
  autoComplete,
  rightElement,
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
        autoComplete={autoComplete}
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
// OTP INPUT
// ============================================================

const OTPInput = ({
  value,
  onChange,
  disabled,
}) => {
  const inputsRef = useRef([]);

  const digits = value.padEnd(6, "").split("").slice(0, 6);

  const handleChange = (index, rawValue) => {
    const digit = rawValue.replace(/\D/g, "").slice(-1);

    const current = value.split("");

    current[index] = digit;

    const nextValue = current
      .join("")
      .replace(/\D/g, "")
      .slice(0, 6);

    onChange(nextValue);

    if (digit && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (
      e.key === "Backspace" &&
      !digits[index] &&
      index > 0
    ) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();

    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);

    if (!pasted) return;

    onChange(pasted);

    const focusIndex = Math.min(pasted.length, 5);

    inputsRef.current[focusIndex]?.focus();
  };

  return (
    <div
      className="flex justify-center gap-2 sm:gap-3"
      onPaste={handlePaste}
    >
      {Array.from({ length: 6 }).map((_, index) => (
        <input
          key={index}
          ref={(element) => {
            inputsRef.current[index] = element;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digits[index] || ""}
          disabled={disabled}
          onChange={(e) =>
            handleChange(index, e.target.value)
          }
          onKeyDown={(e) =>
            handleKeyDown(index, e)
          }
          className="h-14 w-11 rounded-xl border border-cyan-400/20 bg-slate-950/50 text-center text-xl font-bold text-sky-300 outline-none transition-all duration-300 focus:border-cyan-400/70 focus:bg-slate-950/80 focus:ring-2 focus:ring-cyan-400/10 sm:h-16 sm:w-12"
          style={{
            fontFamily: "'Orbitron', sans-serif",
          }}
        />
      ))}
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

  return (
    <div className="rounded-xl border border-cyan-400/10 bg-slate-950/30 p-4">
      <p
        className="mb-3 text-xs uppercase tracking-[0.2em] text-blue-200/40"
        style={{
          fontFamily: "'Orbitron', sans-serif",
        }}
      >
        Password Requirements
      </p>

      <div className="grid grid-cols-2 gap-2">
        {requirements.map((requirement) => (
          <div
            key={requirement.label}
            className={`flex items-center gap-2 text-xs transition-colors ${
              requirement.valid
                ? "text-cyan-300"
                : "text-blue-200/35"
            }`}
            style={{
              fontFamily: "'Rajdhani', sans-serif",
            }}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                requirement.valid
                  ? "bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.7)]"
                  : "bg-blue-200/20"
              }`}
            />

            {requirement.label}
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================================
// MAIN
// ============================================================

const ForgotPassword = () => {
  const navigate = useNavigate();

  const {
    forgotPassword,
    resetPassword,
    isLoading,
  } = useAuthStore();

  const [step, setStep] = useState("email");

  const [email, setEmail] = useState("");

  const [otp, setOtp] = useState("");

  const [password, setPassword] = useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    log("Forgot password page mounted.");

    return () => {
      log("Forgot password page unmounted.");
    };
  }, []);

  // ============================================================
  // SEND OTP
  // ============================================================

  const handleSendOTP = async (e) => {
    e.preventDefault();

    const normalizedEmail = email
      .trim()
      .toLowerCase();

    if (!normalizedEmail) {
      toast.error("Please enter your email address.");
      return;
    }

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(normalizedEmail)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    try {
      log("Requesting password reset OTP.");

      await forgotPassword(normalizedEmail);

      setEmail(normalizedEmail);

      setStep("otp");

      toast.success("Verification code sent to your email.");

      log("Password reset OTP sent successfully.");
    } catch (error) {
      log("Failed to send password reset OTP.", {
        message: error?.message,
        status: error?.response?.status,
        responseMessage:
          error?.response?.data?.message,
      });

      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to send verification code."
      );
    }
  };

  // ============================================================
  // OTP CONTINUE
  //
  // We don't need a separate backend verification endpoint.
  // Your existing reset-password endpoint validates the OTP
  // through passwordResetToken + passwordResetExpire.
  //
  // Therefore we only validate the frontend format here,
  // then move to the password screen.
  // ============================================================

  const handleContinueOTP = (e) => {
    e.preventDefault();

    if (!/^\d{6}$/.test(otp)) {
      toast.error("Please enter the 6-digit verification code.");
      return;
    }

    log("OTP format accepted.");

    setStep("password");
  };

  // ============================================================
  // RESET PASSWORD
  // ============================================================

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (otp.length !== 6) {
      toast.error("Please enter the 6-digit verification code.");
      setStep("otp");
      return;
    }

    if (password.length < 8) {
      toast.error(
        "Password must be at least 8 characters."
      );
      return;
    }

    if (!/[A-Z]/.test(password)) {
      toast.error(
        "Password must contain at least one uppercase letter."
      );
      return;
    }

    if (!/[a-z]/.test(password)) {
      toast.error(
        "Password must contain at least one lowercase letter."
      );
      return;
    }

    if (!/\d/.test(password)) {
      toast.error(
        "Password must contain at least one number."
      );
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    try {
      log("Submitting password reset.");

      await resetPassword(otp, password, confirmPassword);

      toast.success("Password reset successful.");

      log("Password reset completed successfully.");

      setStep("success");

      setPassword("");
      setConfirmPassword("");
      setOtp("");
    } catch (error) {
      log("Password reset failed.", {
        message: error?.message,
        status: error?.response?.status,
        responseMessage:
          error?.response?.data?.message,
      });

      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to reset password."
      );
    }
  };

  // ============================================================
  // RESEND
  // ============================================================

  const handleResend = async () => {
    try {
      await forgotPassword(email);

      setOtp("");

      toast.success("A new verification code has been sent.");

      log("Password reset OTP resent.");
    } catch (error) {
      log("Failed to resend password reset OTP.", {
        message: error?.message,
        status: error?.response?.status,
      });

      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to resend verification code."
      );
    }
  };

  // ============================================================
  // SUCCESS
  // ============================================================

  if (step === "success") {
    return (
      <PageShell mounted={mounted}>
        <div className="text-center">
          <div
            className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(0,180,255,0.18), rgba(0,180,255,0.04))",
              border:
                "1px solid rgba(56,189,248,0.35)",
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

          <Header
            title="Password Reset Complete"
            subtitle="Your password has been updated successfully."
          />

          <button
            type="button"
            onClick={() => navigate("/login")}
            className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold uppercase tracking-widest text-white transition-all duration-300 hover:scale-[1.01]"
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
        </div>
      </PageShell>
    );
  }

  // ============================================================
  // PAGE
  // ============================================================

  return (
    <PageShell mounted={mounted}>
      {step === "email" && (
        <>
          <Header
            title="Forgot Password"
            subtitle="Enter your email to receive a 6-digit verification code"
          />

          <form
            onSubmit={handleSendOTP}
            className="space-y-5"
          >
            <InputField
              icon={Mail}
              type="email"
              name="email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              placeholder="Email address"
              autoComplete="email"
              disabled={isLoading}
            />

            <PrimaryButton
              type="submit"
              loading={isLoading}
              icon={Send}
            >
              SEND VERIFICATION CODE
            </PrimaryButton>
          </form>

          <BackToLogin />
        </>
      )}

      {step === "otp" && (
        <>
          <Header
            title="Verify Your Email"
            subtitle={`Enter the 6-digit code sent to ${email}`}
          />

          <form
            onSubmit={handleContinueOTP}
            className="space-y-6"
          >
            <div className="flex justify-center">
              <div
                className="flex h-14 w-14 items-center justify-center rounded-full"
                style={{
                  background:
                    "radial-gradient(circle, rgba(0,180,255,0.16), rgba(0,180,255,0.03))",
                  border:
                    "1px solid rgba(56,189,248,0.25)",
                }}
              >
                <ShieldCheck
                  size={24}
                  className="text-sky-400"
                />
              </div>
            </div>

            <OTPInput
              value={otp}
              onChange={setOtp}
              disabled={isLoading}
            />

            <p
              className="text-center text-xs text-blue-200/40"
              style={{
                fontFamily: "'Rajdhani', sans-serif",
              }}
            >
              The verification code expires in 10 minutes.
            </p>

            <PrimaryButton
              type="submit"
              loading={false}
              icon={ShieldCheck}
            >
              VERIFY CODE
            </PrimaryButton>
          </form>

          <div className="mt-6 flex flex-col items-center gap-3">
            <button
              type="button"
              onClick={handleResend}
              disabled={isLoading}
              className="text-sm text-sky-400/70 transition-colors hover:text-sky-300 disabled:opacity-50"
              style={{
                fontFamily: "'Rajdhani', sans-serif",
              }}
            >
              Didn't receive the code?{" "}
              <span className="font-semibold">
                RESEND CODE
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setStep("email");
                setOtp("");
              }}
              className="inline-flex items-center gap-2 text-sm text-blue-200/50 transition-colors hover:text-sky-300"
              style={{
                fontFamily: "'Rajdhani', sans-serif",
              }}
            >
              <ArrowLeft size={16} />
              CHANGE EMAIL
            </button>
          </div>
        </>
      )}

      {step === "password" && (
        <>
          <Header
            title="Create New Password"
            subtitle="Create a new secure password for your account"
          />

          <form
            onSubmit={handleResetPassword}
            className="space-y-4"
          >
            <InputField
              icon={LockKeyhole}
              type={showPassword ? "text" : "password"}
              name="password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              placeholder="New password"
              autoComplete="new-password"
              disabled={isLoading}
              rightElement={
                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      (previous) => !previous
                    )
                  }
                  className="text-blue-200/40 transition-colors hover:text-sky-300"
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              }
            />

            <InputField
              icon={LockKeyhole}
              type={
                showConfirmPassword
                  ? "text"
                  : "password"
              }
              name="confirmPassword"
              value={confirmPassword}
              onChange={(e) =>
                setConfirmPassword(e.target.value)
              }
              placeholder="Confirm new password"
              autoComplete="new-password"
              disabled={isLoading}
              rightElement={
                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(
                      (previous) => !previous
                    )
                  }
                  className="text-blue-200/40 transition-colors hover:text-sky-300"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              }
            />

            <PasswordRequirements
              password={password}
            />

            <PrimaryButton
              type="submit"
              loading={isLoading}
              icon={LockKeyhole}
            >
              RESET PASSWORD
            </PrimaryButton>
          </form>

          <button
            type="button"
            onClick={() => {
              setStep("otp");
              setPassword("");
              setConfirmPassword("");
            }}
            className="mx-auto mt-6 flex items-center gap-2 text-sm text-blue-200/50 transition-colors hover:text-sky-300"
            style={{
              fontFamily: "'Rajdhani', sans-serif",
            }}
          >
            <ArrowLeft size={16} />
            BACK TO VERIFICATION
          </button>
        </>
      )}
    </PageShell>
  );
};

// ============================================================
// PAGE SHELL
// ============================================================

const PageShell = ({
  children,
  mounted,
}) => {
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
            border:
              "1px solid rgba(0,180,255,0.25)",
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

// ============================================================
// HEADER
// ============================================================

const Header = ({
  title,
  subtitle,
}) => {
  return (
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
  icon: Icon,
}) => {
  return (
    <button
      type={type}
      disabled={loading}
      className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl py-3.5 text-sm font-semibold uppercase tracking-widest text-white transition-all duration-300 hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
      style={{
        fontFamily: "'Rajdhani', sans-serif",
        background:
          "linear-gradient(135deg, #0284c7, #2563eb)",
        boxShadow:
          "0 0 25px rgba(14,165,233,0.25)",
      }}
    >
      {loading ? (
        <>
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          PROCESSING...
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
// BACK TO LOGIN
// ============================================================

const BackToLogin = () => {
  return (
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
  );
};

export default ForgotPassword;

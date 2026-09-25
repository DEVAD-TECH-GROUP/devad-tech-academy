import { useEffect, useRef, useState } from "react";

import { useNavigate } from "react-router-dom";

import { toast } from "react-hot-toast";

import useAuthStore from "../../store/authStore";

/* ============================================================
   DEBUG LOGGER
   ============================================================ */

const DEBUG_PREFIX = "[DEVAD FORGOT PASSWORD]";

const log = (...args) => {
  console.log(DEBUG_PREFIX, ...args);
};

const logInfo = (label, data = null) => {
  if (data !== null) {
    console.info(`${DEBUG_PREFIX} ${label}`, data);
  } else {
    console.info(`${DEBUG_PREFIX} ${label}`);
  }
};

const logWarn = (label, data = null) => {
  if (data !== null) {
    console.warn(`${DEBUG_PREFIX} ${label}`, data);
  } else {
    console.warn(`${DEBUG_PREFIX} ${label}`);
  }
};

const logError = (label, error = null) => {
  if (error) {
    console.error(`${DEBUG_PREFIX} ${label}`, error);
  } else {
    console.error(`${DEBUG_PREFIX} ${label}`);
  }
};

/* ============================================================
   PARTICLES
   ============================================================ */

function Particles() {
  const canvasRef = useRef(null);

  useEffect(() => {
    log("Particles mounted.");

    const canvas = canvasRef.current;

    if (!canvas) {
      logWarn("Particles canvas reference is missing.");
      return;
    }

    const ctx = canvas.getContext("2d");

    if (!ctx) {
      logWarn("Unable to obtain 2D canvas context.");
      return;
    }

    let animationFrameId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resize();

    window.addEventListener("resize", resize);

    const particles = Array.from(
      { length: 80 },
      () => ({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        r: Math.random() * 2 + 0.5,
        dx: (Math.random() - 0.5) * 0.4,
        dy: (Math.random() - 0.5) * 0.4,
        alpha: Math.random() * 0.6 + 0.2,
      })
    );

    const draw = () => {
      ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
      );

      particles.forEach((particle, index) => {
        particles
          .slice(index + 1)
          .forEach((other) => {
            const distance = Math.hypot(
              particle.x - other.x,
              particle.y - other.y
            );

            if (distance < 120) {
              ctx.beginPath();

              ctx.strokeStyle = `rgba(
                0,
                180,
                255,
                ${0.15 * (1 - distance / 120)}
              )`;

              ctx.lineWidth = 0.5;

              ctx.moveTo(
                particle.x,
                particle.y
              );

              ctx.lineTo(
                other.x,
                other.y
              );

              ctx.stroke();
            }
          });
      });

      particles.forEach((particle) => {
        ctx.beginPath();

        ctx.arc(
          particle.x,
          particle.y,
          particle.r,
          0,
          Math.PI * 2
        );

        ctx.fillStyle = `rgba(
          0,
          200,
          255,
          ${particle.alpha}
        )`;

        ctx.fill();

        particle.x += particle.dx;
        particle.y += particle.dy;

        if (
          particle.x < 0 ||
          particle.x > canvas.width
        ) {
          particle.dx *= -1;
        }

        if (
          particle.y < 0 ||
          particle.y > canvas.height
        ) {
          particle.dy *= -1;
        }
      });

      animationFrameId =
        requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(
        animationFrameId
      );

      window.removeEventListener(
        "resize",
        resize
      );

      log("Particles unmounted.");
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

/* ============================================================
   CIRCUIT LINES
   ============================================================ */

function CircuitLines({ side }) {
  const isLeft = side === "left";

  return (
    <svg
      className={`absolute top-0 ${
        isLeft ? "left-0" : "right-0"
      } h-full w-64 opacity-20 pointer-events-none`}
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

      {[60, 160, 260, 360, 460].map(
        (y, index) => (
          <circle
            key={index}
            cx={
              isLeft
                ? [120, 60, 100, 40, 130][index]
                : [80, 140, 90, 160, 70][index]
            }
            cy={y}
            r="4"
            fill="#00d4ff"
            className="animate-pulse"
            style={{
              animationDelay: `${index * 0.3}s`,
            }}
          />
        )
      )}
    </svg>
  );
}

/* ============================================================
   INPUT FIELD
   ============================================================ */

function InputField({
  id,
  type = "text",
  placeholder,
  value,
  onChange,
  icon,
  focusedField,
  setFocusedField,
  autoComplete,
}) {
  return (
    <div className="relative group">
      <div
        className="absolute inset-0 rounded-xl transition-opacity duration-300"
        style={{
          background:
            "linear-gradient(135deg, #0066ff22, #00d4ff11)",
          opacity:
            focusedField === id ? 1 : 0,
          border:
            "1px solid rgba(0,180,255,0.4)",
          borderRadius: "12px",
        }}
      />

      <div
        className="relative flex items-center rounded-xl overflow-hidden"
        style={{
          background:
            "rgba(255,255,255,0.04)",
          border: `1px solid ${
            focusedField === id
              ? "rgba(0,180,255,0.5)"
              : "rgba(100,150,255,0.15)"
          }`,
          transition:
            "border-color 0.3s",
        }}
      >
        <div className="pl-4 pr-3 flex items-center">
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            style={{
              color:
                focusedField === id
                  ? "#38bdf8"
                  : "rgba(150,180,255,0.5)",
              transition:
                "color 0.3s",
            }}
          >
            {icon}
          </svg>
        </div>

        <input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onFocus={() => {
            log(`Input focused: ${id}`);
            setFocusedField(id);
          }}
          onBlur={() => {
            log(`Input blurred: ${id}`);
            setFocusedField(null);
          }}
          autoComplete={autoComplete}
          className="flex-1 py-3.5 pr-4 bg-transparent outline-none text-sm"
          style={{
            color:
              "rgba(220,235,255,0.9)",
            fontFamily:
              "'Rajdhani', sans-serif",
            fontSize: "14px",
            letterSpacing: "0.02em",
          }}
        />
      </div>
    </div>
  );
}

/* ============================================================
   ICON
   ============================================================ */

const EMAIL_ICON = (
  <path
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth={1.5}
    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
  />
);

/* ============================================================
   FORGOT PASSWORD PAGE
   ============================================================ */

export default function ForgotPasswordPage() {
  const navigate = useNavigate();

  const {
    forgotPassword,
    isLoading,
  } = useAuthStore();

  /* ==========================================================
     FORM
     ========================================================== */

  const [email, setEmail] =
    useState("");

  /* ==========================================================
     UI STATE
     ========================================================== */

  const [focusedField, setFocusedField] =
    useState(null);

  const [mounted, setMounted] =
    useState(false);

  const [submitted, setSubmitted] =
    useState(false);

  /* ==========================================================
     MOUNT
     ========================================================== */

  useEffect(() => {
    log("ForgotPasswordPage mounted.");

    const timer = setTimeout(() => {
      setMounted(true);
    }, 100);

    return () => {
      clearTimeout(timer);
      log("ForgotPasswordPage unmounted.");
    };
  }, []);

  /* ==========================================================
     LOADING LOGGER
     ========================================================== */

  useEffect(() => {
    logInfo(
      "Auth store loading state changed.",
      isLoading
    );
  }, [isLoading]);

  /* ==========================================================
     EMAIL CHANGE
     ========================================================== */

  const handleEmailChange = (
    event
  ) => {
    const value =
      event.target.value;

    setEmail(value);
    setSubmitted(false);

    log(
      "Email field changed.",
      {
        value,
      }
    );
  };

  /* ==========================================================
     VALIDATE EMAIL
     ========================================================== */

  const validateEmail = () => {
    const normalizedEmail =
      email.trim().toLowerCase();

    if (!normalizedEmail) {
      toast.error(
        "Please enter your email address."
      );

      return false;
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        normalizedEmail
      )
    ) {
      toast.error(
        "Please enter a valid email address."
      );

      return false;
    }

    return true;
  };

  /* ==========================================================
     SUBMIT
     ========================================================== */

  const handleSubmit =
    async (event) => {
      event.preventDefault();

      if (!validateEmail()) {
        return;
      }

      const normalizedEmail =
        email.trim().toLowerCase();

      try {
        logInfo(
          "Requesting password reset.",
          {
            email: normalizedEmail,
          }
        );

        await forgotPassword(
          normalizedEmail
        );

        setSubmitted(true);

        toast.success(
          "Password reset email sent."
        );

        logInfo(
          "Password reset request completed."
        );
      } catch (error) {
        logError(
          "Password reset request failed.",
          {
            message:
              error?.message ||
              null,
            status:
              error?.response?.status ||
              null,
            responseMessage:
              error?.response?.data
                ?.message ||
              null,
          }
        );

        toast.error(
          error?.response?.data?.message ||
            error?.message ||
            "Unable to send password reset email."
        );
      }
    };

  /* ==========================================================
     BACK TO LOGIN
     ========================================================== */

  const handleBackToLogin = () => {
    log(
      "Navigating back to login."
    );

    navigate("/login");
  };

  /* ==========================================================
     STYLES
     ========================================================== */

  const cardStyle = {
    transform: mounted
      ? "translateY(0)"
      : "translateY(30px)",

    opacity: mounted ? 1 : 0,

    transition:
      "all 0.7s cubic-bezier(0.23, 1, 0.32, 1)",
  };

  const fadeIn = (delay) => ({
    transform: mounted
      ? "translateY(0)"
      : "translateY(10px)",

    opacity: mounted ? 1 : 0,

    transition: `all 0.8s cubic-bezier(0.23, 1, 0.32, 1) ${delay}s`,
  });

  /* ==========================================================
     RENDER
     ========================================================== */

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center relative overflow-hidden py-24"
      style={{
        background:
          "linear-gradient(135deg, #020b18 0%, #041428 40%, #061c35 70%, #030e1c 100%)",
      }}
    >
      <Particles />

      {/* ======================================================
          GLOW
          ====================================================== */}

      <div
        className="fixed inset-0 pointer-events-none"
        style={{ zIndex: 1 }}
      >
        <div
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-10"
          style={{
            background:
              "radial-gradient(circle, #0066ff 0%, transparent 70%)",
            filter:
              "blur(40px)",
          }}
        />

        <div
          className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-8"
          style={{
            background:
              "radial-gradient(circle, #00aaff 0%, transparent 70%)",
            filter:
              "blur(50px)",
          }}
        />
      </div>

      {/* ======================================================
          CIRCUIT
          ====================================================== */}

      <div
        className="fixed inset-0 pointer-events-none overflow-hidden"
        style={{ zIndex: 1 }}
      >
        <CircuitLines side="left" />

        <div className="absolute right-0 top-0 h-full w-64">
          <CircuitLines side="right" />
        </div>
      </div>

      {/* ======================================================
          CARD
          ====================================================== */}

      <div
        className="relative w-full max-w-md mx-4"
        style={{
          zIndex: 10,
          ...cardStyle,
        }}
      >
        <div
          className="absolute -inset-0.5 rounded-2xl opacity-60"
          style={{
            background:
              "linear-gradient(135deg, #0066ff44, #00d4ff33, #0066ff22)",
            filter:
              "blur(1px)",
          }}
        />

        <div
          className="relative rounded-2xl p-8 overflow-hidden"
          style={{
            background:
              "linear-gradient(160deg, rgba(6,20,45,0.95) 0%, rgba(4,14,32,0.98) 100%)",
            border:
              "1px solid rgba(0,180,255,0.25)",
            boxShadow:
              "0 0 60px rgba(0,100,255,0.15), 0 25px 50px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)",
            backdropFilter:
              "blur(20px)",
          }}
        >
          <div
            className="absolute top-0 left-0 right-0 h-px"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(0,200,255,0.6), transparent)",
            }}
          />

          {/* ==================================================
              HEADER
              ================================================== */}

          <div
            className="text-center mb-7"
            style={fadeIn(0.25)}
          >
            <p
              className="text-[10px] tracking-[0.25em] uppercase mb-2"
              style={{
                color:
                  "rgba(56,189,248,0.65)",
                fontFamily:
                  "'Orbitron', sans-serif",
              }}
            >
              DEVAD TECH ACADEMY
            </p>

            <h2
              className="text-xl font-bold"
              style={{
                background:
                  "linear-gradient(90deg, #38bdf8, #60a5fa)",
                WebkitBackgroundClip:
                  "text",
                WebkitTextFillColor:
                  "transparent",
                backgroundClip:
                  "text",
                fontFamily:
                  "'Orbitron', sans-serif",
              }}
            >
              Reset Password
            </h2>

            <p
              className="text-sm mt-1"
              style={{
                color:
                  "rgba(180,210,255,0.65)",
                fontFamily:
                  "'Rajdhani', sans-serif",
              }}
            >
              Enter your email to receive a password reset link
            </p>
          </div>

          {/* ==================================================
              SUCCESS STATE
              ================================================== */}

          {submitted ? (
            <div
              className="text-center"
              style={fadeIn(0.35)}
            >
              <div
                className="mx-auto mb-5 w-16 h-16 rounded-full flex items-center justify-center"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(0,102,255,0.2), rgba(0,200,255,0.12))",
                  border:
                    "1px solid rgba(0,180,255,0.35)",
                  boxShadow:
                    "0 0 30px rgba(0,150,255,0.2)",
                }}
              >
                <svg
                  className="w-7 h-7"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="#38bdf8"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8"
                  />

                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>

              <h3
                className="text-lg font-bold mb-2"
                style={{
                  color:
                    "rgba(220,235,255,0.95)",
                  fontFamily:
                    "'Orbitron', sans-serif",
                }}
              >
                Check Your Email
              </h3>

              <p
                className="text-sm leading-relaxed mb-6"
                style={{
                  color:
                    "rgba(180,210,255,0.65)",
                  fontFamily:
                    "'Rajdhani', sans-serif",
                }}
              >
                If an account exists for{" "}
                <span
                  style={{
                    color:
                      "#38bdf8",
                  }}
                >
                  {email.trim().toLowerCase()}
                </span>
                , a password reset link has been sent.
              </p>

              <button
                type="button"
                onClick={handleBackToLogin}
                className="w-full rounded-xl py-3.5 font-bold text-sm tracking-widest transition-all duration-300 cursor-pointer"
                style={{
                  background:
                    "linear-gradient(135deg, #0066ff 0%, #0099ff 50%, #00c8ff 100%)",
                  color: "#fff",
                  fontFamily:
                    "'Orbitron', 'Rajdhani', sans-serif",
                  boxShadow:
                    "0 0 30px rgba(0,150,255,0.4), 0 4px 15px rgba(0,100,255,0.3)",
                }}
              >
                BACK TO SIGN IN
              </button>

              <button
                type="button"
                onClick={() =>
                  setSubmitted(false)
                }
                className="mt-4 text-xs font-semibold cursor-pointer"
                style={{
                  color:
                    "#38bdf8",
                  fontFamily:
                    "'Rajdhani', sans-serif",
                }}
              >
                Try another email
              </button>
            </div>
          ) : (
            <>
              {/* ================================================
                  FORM
                  ================================================ */}

              <form
                onSubmit={handleSubmit}
                className="space-y-4"
                style={fadeIn(0.35)}
              >
                <InputField
                  id="email"
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={
                    handleEmailChange
                  }
                  focusedField={
                    focusedField
                  }
                  setFocusedField={
                    setFocusedField
                  }
                  icon={EMAIL_ICON}
                  autoComplete="email"
                />

                {/* ============================================
                    SEND BUTTON
                    ============================================ */}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full rounded-xl py-3.5 font-bold text-sm tracking-widest transition-all duration-300 mt-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{
                    background:
                      isLoading
                        ? "rgba(0,100,200,0.5)"
                        : "linear-gradient(135deg, #0066ff 0%, #0099ff 50%, #00c8ff 100%)",
                    color: "#fff",
                    fontFamily:
                      "'Orbitron', 'Rajdhani', sans-serif",
                    boxShadow:
                      "0 0 30px rgba(0,150,255,0.4), 0 4px 15px rgba(0,100,255,0.3)",
                  }}
                >
                  {isLoading
                    ? "SENDING..."
                    : "SEND RESET LINK"}
                </button>
              </form>

              {/* ================================================
                  BACK TO LOGIN
                  ================================================ */}

              <div
                className="text-center mt-6"
                style={fadeIn(0.45)}
              >
                <button
                  type="button"
                  onClick={
                    handleBackToLogin
                  }
                  className="text-xs font-semibold cursor-pointer"
                  style={{
                    color:
                      "#38bdf8",
                    fontFamily:
                      "'Rajdhani', sans-serif",
                  }}
                >
                  ← Back to Sign In
                </button>
              </div>
            </>
          )}

          {/* ==================================================
              BOTTOM LINE
              ================================================== */}

          <div
            className="absolute bottom-0 left-0 right-0 h-px"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(0,150,255,0.3), transparent)",
            }}
          />
        </div>
      </div>

      {/* ======================================================
          GLOBAL STYLES
          ====================================================== */}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@400;500;600;700&display=swap');

        input::placeholder {
          color: rgba(150, 180, 255, 0.35);
          font-family: 'Rajdhani', sans-serif;
        }

        * {
          -webkit-font-smoothing: antialiased;
        }
      `}</style>
    </div>
  );
}

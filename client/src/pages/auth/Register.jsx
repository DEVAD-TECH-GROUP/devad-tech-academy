import { useState, useEffect, useRef } from "react";
import {
  useNavigate,
  useLocation,
} from "react-router-dom";
import { toast } from "react-hot-toast";
import useAuthStore from "../../store/authStore";

/* ============================================================
   DEBUG LOGGER
   ============================================================ */

const DEBUG_PREFIX = "[DEVAD REGISTER]";

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

/*
 * IMPORTANT:
 * Never log:
 * - password
 * - confirmPassword
 * - OTP codes
 * - registrationToken
 * - Google credential/JWT
 */
const sanitizeError = (err) => ({
  message: err?.message || null,
  status: err?.response?.status || null,
  responseMessage: err?.response?.data?.message || null,
  responseData: err?.response?.data || null,
  code: err?.code || null,
});

/* ============================================================
   PARTICLES
   ============================================================ */

function Particles() {
  const canvasRef = useRef(null);

  useEffect(() => {
    log("Particles mounted.");

    const canvas = canvasRef.current;

    if (!canvas) {
      logWarn("Particles: canvas reference is missing.");
      return;
    }

    const ctx = canvas.getContext("2d");

    if (!ctx) {
      logWarn("Particles: unable to obtain 2D canvas context.");
      return;
    }

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
      ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
      );

      particles.forEach((p, i) => {
        particles.slice(i + 1).forEach((p2) => {
          const dist = Math.hypot(
            p.x - p2.x,
            p.y - p2.y
          );

          if (dist < 120) {
            ctx.beginPath();

            ctx.strokeStyle = `rgba(
              0,
              180,
              255,
              ${0.15 * (1 - dist / 120)}
            )`;

            ctx.lineWidth = 0.5;
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        });
      });

      particles.forEach((p) => {
        ctx.beginPath();

        ctx.arc(
          p.x,
          p.y,
          p.r,
          0,
          Math.PI * 2
        );

        ctx.fillStyle = `rgba(
          0,
          200,
          255,
          ${p.alpha}
        )`;

        ctx.fill();

        p.x += p.dx;
        p.y += p.dy;

        if (
          p.x < 0 ||
          p.x > canvas.width
        ) {
          p.dx *= -1;
        }

        if (
          p.y < 0 ||
          p.y > canvas.height
        ) {
          p.dy *= -1;
        }
      });

      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animId);

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
        (y, i) => (
          <circle
            key={i}
            cx={
              isLeft
                ? [120, 60, 100, 40, 130][i]
                : [80, 140, 90, 160, 70][i]
            }
            cy={y}
            r="4"
            fill="#00d4ff"
            className="animate-pulse"
            style={{
              animationDelay: `${i * 0.3}s`,
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
  rightSlot,
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
              color:
                focusedField === id
                  ? "#38bdf8"
                  : "rgba(150,180,255,0.5)",
              transition: "color 0.3s",
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

/* ============================================================
   ICONS
   ============================================================ */

const ICONS = {
  user: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
    />
  ),

  email: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
    />
  ),

  lock: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
    />
  ),

  phone: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M2.5 5.5A2.5 2.5 0 015 3h2a1 1 0 011 .75l1 4a1 1 0 01-.27.9L7.5 9.88a16.04 16.04 0 006.62 6.62l1.23-1.23a1 1 0 01.9-.27l4 1a1 1 0 01.75 1v2A2.5 2.5 0 0118.5 21C9.94 21 3 14.06 3 5.5a.5.5 0 01-.5 0z"
    />
  ),
};

/* ============================================================
   EYE ICON
   ============================================================ */

function EyeIcon({ open }) {
  return open ? (
    <svg
      className="w-4 h-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
      />
    </svg>
  ) : (
    <svg
      className="w-4 h-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />

      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
      />
    </svg>
  );
}

/* ============================================================
   PASSWORD STRENGTH
   ============================================================ */

function StrengthBar({ password }) {
  const criteria = [
    {
      label: "At least 6 characters",
      met: password.length >= 6,
    },
    {
      label: "Uppercase letter (A-Z)",
      met: /[A-Z]/.test(password),
    },
    {
      label: "Lowercase letter (a-z)",
      met: /[a-z]/.test(password),
    },
    {
      label: "Number (0-9)",
      met: /[0-9]/.test(password),
    },
    {
      label: "Special symbol (@, #, $...)",
      met: /[^A-Za-z0-9]/.test(password),
    },
  ];

  const metCount = criteria.filter(
    (c) => c.met
  ).length;

  const labels = [
    "Empty",
    "Weak",
    "Fair",
    "Good",
    "Strong",
  ];

  const colors = [
    "rgba(100,150,255,0.15)",
    "#ef4444",
    "#f59e0b",
    "#38bdf8",
    "#22c55e",
  ];

  if (!password) return null;

  const strengthIndex =
    metCount === 0
      ? 1
      : Math.min(metCount, 4);

  return (
    <div className="mt-2 px-1 space-y-2">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="flex-1 h-1 rounded-full transition-all duration-300"
            style={{
              background:
                i <= metCount - 1 &&
                metCount > 1
                  ? colors[strengthIndex]
                  : "rgba(100,150,255,0.15)",
            }}
          />
        ))}
      </div>

      <div className="flex justify-between items-center">
        <span
          className="text-xs font-semibold"
          style={{
            color: colors[strengthIndex],
            fontFamily:
              "'Rajdhani', sans-serif",
          }}
        >
          Strength: {labels[strengthIndex]}
        </span>
      </div>

      <div
        className="pt-1 grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-1 text-[11px]"
        style={{
          fontFamily:
            "'Rajdhani', sans-serif",
        }}
      >
        {criteria.map((c, index) => (
          <div
            key={index}
            className="flex items-center gap-1.5 transition-colors duration-200"
            style={{
              color: c.met
                ? "#22c55e"
                : "rgba(150,180,255,0.4)",
            }}
          >
            <span>
              {c.met ? "✓" : "○"}
            </span>

            <span>{c.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============================================================
   OTP INPUT
   ============================================================ */

function OTPInput({
  value,
  onChange,
  disabled = false,
}) {
  return (
    <input
      type="text"
      inputMode="numeric"
      maxLength={6}
      autoComplete="one-time-code"
      placeholder="000000"
      value={value}
      disabled={disabled}
      onChange={(e) => {
        const cleanValue =
          e.target.value.replace(/\D/g, "");

        log("OTP input changed:", {
          length: cleanValue.length,
        });

        onChange(cleanValue);
      }}
      className="w-full rounded-xl py-4 px-4 text-center tracking-[0.5em] text-xl font-bold outline-none"
      style={{
        background:
          "rgba(255,255,255,0.04)",
        border:
          "1px solid rgba(0,180,255,0.25)",
        color: "#dbeafe",
        fontFamily:
          "'Orbitron', sans-serif",
        opacity: disabled ? 0.6 : 1,
      }}
    />
  );
}

/* ============================================================
   REGISTER PAGE
   ============================================================ */

export default function RegisterPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    register,
    verifyEmail,
    resendVerification,
    updateRegistrationPhone,
    sendPhoneOTP,
    verifyPhone,
    googleLogin,
    isLoading,
  } = useAuthStore();

  /* ==========================================================
     STEP
     ========================================================== */

  const [step, setStep] = useState(1);

  /*
   * This is only used to identify that Step 3 was reached
   * through Google authentication.
   */
  const [isGoogleRegistration, setIsGoogleRegistration] =
    useState(false);

  /* ==========================================================
     REGISTRATION FORM
     ========================================================== */

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  /* ==========================================================
     EMAIL OTP
     ========================================================== */

  const [emailOtp, setEmailOtp] = useState("");

  /* ==========================================================
     PHONE
     ========================================================== */

  const [phone, setPhone] = useState("");
  const [phoneOtp, setPhoneOtp] = useState("");

  /* ==========================================================
     REGISTRATION SESSION
     ========================================================== */

  const [
    registrationToken,
    setRegistrationToken,
  ] = useState("");

  const [phoneOtpId, setPhoneOtpId] =
    useState("");

  /* ==========================================================
     LOADING STATES
     ========================================================== */

  const [loading, setLoading] =
    useState(false);

  const [
    emailResendLoading,
    setEmailResendLoading,
  ] = useState(false);

  const [
    phoneSendLoading,
    setPhoneSendLoading,
  ] = useState(false);

  const [
    phoneResendLoading,
    setPhoneResendLoading,
  ] = useState(false);

  /* ==========================================================
     UI STATE
     ========================================================== */

  const [showPass, setShowPass] =
    useState(false);

  const [showConfirm, setShowConfirm] =
    useState(false);

  const [mounted, setMounted] =
    useState(false);

  const [focusedField, setFocusedField] =
    useState(null);

  const [agreed, setAgreed] =
    useState(false);

  /* ==========================================================
     MOUNT
     ========================================================== */

  useEffect(() => {
    log("RegisterPage mounted.");

    const timer = setTimeout(() => {
      setMounted(true);
      log("RegisterPage entrance animation completed.");
    }, 100);

    return () => {
      clearTimeout(timer);
      log("RegisterPage unmounted.");
    };
  }, []);

  /* ==========================================================
     GOOGLE REGISTRATION RETURN
     ========================================================== */

  useEffect(() => {
    const state = location.state;

    if (!state?.googleAuth) {
      return;
    }

    const googleRegistrationToken =
      state?.registrationToken || "";

    const googleEmail =
      state?.email || "";

    /*
     * The backend must provide a registration token
     * when Google authentication requires phone verification.
     */
    if (!googleRegistrationToken) {
      logWarn(
        "Google registration state received without registration token."
      );

      toast.error(
        "Google registration session is invalid. Please try again."
      );

      navigate("/register", {
        replace: true,
        state: {},
      });

      return;
    }

    logInfo(
      "Google registration flow detected."
    );

    /*
     * Do NOT log the actual token.
     */
    logInfo(
      "Google registration session received.",
      {
        tokenPresent: true,
        tokenLength:
          googleRegistrationToken.length,
        emailPresent:
          Boolean(googleEmail),
      }
    );

    setIsGoogleRegistration(true);

    setRegistrationToken(
      googleRegistrationToken
    );

    if (googleEmail) {
      setForm((previous) => ({
        ...previous,
        email: googleEmail,
      }));
    }

    /*
     * Google has already verified the email.
     * Therefore we skip:
     *
     * STEP 1 Create account
     * STEP 2 Email verification
     *
     * and continue directly with:
     *
     * STEP 3 Phone collection
     */
    setStep(3);

    /*
     * Clear the sensitive Google registration data
     * from React Router history state.
     *
     * The token is already stored in React state above.
     */
    navigate("/register", {
      replace: true,
      state: {},
    });

    toast.success(
      "Google account verified. Please add your phone number."
    );
  }, [location.state, navigate]);

  /* ==========================================================
     STEP CHANGE LOGGER
     ========================================================== */

  useEffect(() => {
    logInfo(
      `Registration step changed: STEP ${step}`
    );

    const descriptions = {
      1: "Create Account",
      2: "Verify Your Email",
      3: "Add Your Phone",
      4: "Verify Your Phone",
    };

    log("Current step details:", {
      step,
      title: descriptions[step],
      googleRegistration:
        isGoogleRegistration,
    });
  }, [step, isGoogleRegistration]);

  /* ==========================================================
     STORE LOADING LOGGER
     ========================================================== */

  useEffect(() => {
    log(
      "Auth store loading state changed:",
      isLoading
    );
  }, [isLoading]);

  /* ==========================================================
     FORM SETTER
     ========================================================== */

  const set = (field) => (e) => {
    const value = e.target.value;

    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (
      field !== "password" &&
      field !== "confirmPassword"
    ) {
      log(`Form field changed: ${field}`, {
        value,
      });
    } else {
      log(`Form field changed: ${field}`, {
        length: value.length,
      });
    }
  };

  /* ==========================================================
     VALIDATE STEP 1
     ========================================================== */

  const validateStepOne = () => {
    log("Starting Step 1 validation.");

    const {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
    } = form;

    if (
      !firstName.trim() ||
      !lastName.trim() ||
      !email.trim() ||
      !password ||
      !confirmPassword
    ) {
      logWarn(
        "Step 1 validation failed: required field missing."
      );

      toast.error(
        "Please complete all required fields."
      );

      return false;
    }

    const normalizedEmail =
      email.trim().toLowerCase();

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

    /*
     * Backend requires at least 8 characters,
     * uppercase, lowercase and number.
     *
     * We also require a special character
     * on the frontend.
     */
    if (password.length < 8) {
      toast.error(
        "Password must be at least 8 characters."
      );

      return false;
    }

    if (!/[A-Z]/.test(password)) {
      toast.error(
        "Password must contain at least one uppercase letter."
      );

      return false;
    }

    if (!/[a-z]/.test(password)) {
      toast.error(
        "Password must contain at least one lowercase letter."
      );

      return false;
    }

    if (!/[0-9]/.test(password)) {
      toast.error(
        "Password must contain at least one number."
      );

      return false;
    }

    if (!/[^A-Za-z0-9]/.test(password)) {
      toast.error(
        "Password must contain at least one special symbol."
      );

      return false;
    }

    if (
      password !== confirmPassword
    ) {
      toast.error(
        "Passwords do not match."
      );

      return false;
    }

    if (!agreed) {
      toast.error(
        "Please agree to the Terms of Service and Privacy Policy."
      );

      return false;
    }

    logInfo(
      "Step 1 validation successful."
    );

    return true;
  };

  /* ==========================================================
     STEP 1 → REGISTER → EMAIL OTP
     ========================================================== */

  const handleCreateAccount = async (e) => {
    e.preventDefault();

    if (!validateStepOne()) {
      return;
    }

    try {
      setLoading(true);

      const payload = {
        firstName:
          form.firstName.trim(),

        lastName:
          form.lastName.trim(),

        email:
          form.email
            .trim()
            .toLowerCase(),

        password:
          form.password,
      };

      logInfo(
        "Calling authStore.register()...",
        {
          firstName: payload.firstName,
          lastName: payload.lastName,
          email: payload.email,
          hasPassword:
            Boolean(payload.password),
          passwordLength:
            payload.password.length,
        }
      );

      const response =
        await register(payload);

      logInfo(
        "Registration API returned.",
        {
          responseExists:
            Boolean(response),
          responseType:
            typeof response,
        }
      );

      const data =
        response?.data ||
        response ||
        {};

      const returnedEmail =
        data?.registration?.email ||
        data?.email ||
        payload.email;

      if (!returnedEmail) {
        throw new Error(
          "Registration response did not contain an email address."
        );
      }

      toast.success(
        "Account created. Check your email for the verification code."
      );

      setStep(2);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (err) {
      logError(
        "Registration failed.",
        sanitizeError(err)
      );

      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  /* ==========================================================
     VERIFY EMAIL
     ========================================================== */

  const handleVerifyEmail = async (e) => {
    e.preventDefault();

    const code =
      emailOtp.trim();

    if (!/^\d{6}$/.test(code)) {
      toast.error(
        "Please enter the 6-digit email verification code."
      );

      return;
    }

    try {
      setLoading(true);

      const email =
        form.email
          .trim()
          .toLowerCase();

      const response =
        await verifyEmail(
          email,
          code
        );

      const data =
        response?.data ||
        response ||
        {};

      const token =
        data?.registrationToken ||
        data?.registration
          ?.registrationToken ||
        "";

      if (!token) {
        throw new Error(
          "Email verified, but the registration verification session was not returned."
        );
      }

      setRegistrationToken(token);

      setIsGoogleRegistration(false);

      toast.success(
        "Email verified successfully!"
      );

      setStep(3);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (err) {
      logError(
        "Email verification failed.",
        sanitizeError(err)
      );

      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Email verification failed."
      );
    } finally {
      setLoading(false);
    }
  };

  /* ==========================================================
     RESEND EMAIL OTP
     ========================================================== */

  const handleResendEmailOTP = async () => {
    const email =
      form.email
        .trim()
        .toLowerCase();

    if (!email) {
      toast.error(
        "Your email address is missing."
      );

      return;
    }

    try {
      setEmailResendLoading(true);

      await resendVerification(
        email
      );

      setEmailOtp("");

      toast.success(
        "A new email verification code has been sent."
      );
    } catch (err) {
      logError(
        "Resend email OTP failed.",
        sanitizeError(err)
      );

      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to resend email verification code."
      );
    } finally {
      setEmailResendLoading(false);
    }
  };

  /* ==========================================================
     VALIDATE PHONE
     ========================================================== */

  const validatePhone = () => {
    const cleanPhone =
      phone.trim();

    if (!cleanPhone) {
      toast.error(
        "Please enter your phone number."
      );

      return false;
    }

    const digits =
      cleanPhone.replace(
        /\D/g,
        ""
      );

    if (
      digits.length < 10 ||
      digits.length > 15
    ) {
      toast.error(
        "Please enter a valid phone number."
      );

      return false;
    }

    return true;
  };

  /* ==========================================================
     STEP 3 → SAVE PHONE + SEND OTP
     ========================================================== */

  const handleSendPhoneOTP = async () => {
    if (!validatePhone()) {
      return;
    }

    if (!registrationToken) {
      logError(
        "Registration token is missing."
      );

      toast.error(
        "Your registration session has expired. Please restart registration."
      );

      setStep(1);

      return;
    }

    try {
      setPhoneSendLoading(true);

      const cleanPhone =
        phone.trim();

      /*
       * First save the phone against the
       * temporary registration session.
       */
      await updateRegistrationPhone(
        registrationToken,
        cleanPhone
      );

      /*
       * Then request Robase OTP.
       */
      const response =
        await sendPhoneOTP(
          registrationToken
        );

      const data =
        response?.data ||
        response ||
        {};

      const returnedOtpId =
        data?.phoneVerification
          ?.otpId ||
        data?.otpId ||
        data?.phoneOtpId ||
        "";

      if (!returnedOtpId) {
        throw new Error(
          "Phone verification session was not returned."
        );
      }

      setPhoneOtpId(
        returnedOtpId
      );

      setPhoneOtp("");

      toast.success(
        "Verification code sent to your phone."
      );

      setStep(4);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (err) {
      logError(
        "Phone OTP request failed.",
        sanitizeError(err)
      );

      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to send phone verification code."
      );
    } finally {
      setPhoneSendLoading(false);
    }
  };

  /* ==========================================================
     VERIFY PHONE
     ========================================================== */

  const handleVerifyPhone = async (e) => {
    e.preventDefault();

    const code =
      phoneOtp.trim();

    if (!/^\d{6}$/.test(code)) {
      toast.error(
        "Please enter the 6-digit phone verification code."
      );

      return;
    }

    if (!registrationToken) {
      toast.error(
        "Your registration session has expired."
      );

      setStep(1);

      return;
    }

    if (!phoneOtpId) {
      toast.error(
        "Phone verification session is missing. Please request a new code."
      );

      return;
    }

    try {
      setLoading(true);

      await verifyPhone(
        registrationToken,
        phoneOtpId,
        code
      );

      toast.success(
        "Registration completed successfully!"
      );

      setTimeout(() => {
        const email =
          form.email
            .trim()
            .toLowerCase();

        navigate("/login", {
          replace: true,
          state: {
            registered: true,
            email,
          },
        });
      }, 1000);
    } catch (err) {
      logError(
        "Phone verification failed.",
        sanitizeError(err)
      );

      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Phone verification failed."
      );
    } finally {
      setLoading(false);
    }
  };

  /* ==========================================================
     RESEND PHONE OTP
     ========================================================== */

  const handleResendPhoneOTP = async () => {
    if (!registrationToken) {
      toast.error(
        "Your registration session has expired."
      );

      return;
    }

    try {
      setPhoneResendLoading(true);

      const response =
        await sendPhoneOTP(
          registrationToken
        );

      const data =
        response?.data ||
        response ||
        {};

      const newOtpId =
        data?.phoneVerification
          ?.otpId ||
        data?.otpId ||
        data?.phoneOtpId ||
        "";

      if (newOtpId) {
        setPhoneOtpId(
          newOtpId
        );
      }

      setPhoneOtp("");

      toast.success(
        "A new phone verification code has been sent."
      );
    } catch (err) {
      logError(
        "Resend phone OTP failed.",
        sanitizeError(err)
      );

      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to resend phone verification code."
      );
    } finally {
      setPhoneResendLoading(false);
    }
  };

  /* ==========================================================
     GOOGLE AUTH
     ========================================================== */

  /*
   * IMPORTANT:
   *
   * Google is now handled by Passport on the backend.
   *
   * There is NO credential here.
   * There is NO POST /auth/google.
   *
   * googleLogin() simply redirects the browser to:
   *
   * GET /api/auth/google
   *
   * Passport then sends the user to Google.
   */
  const handleGoogleLogin = () => {
    log(
      "Starting Google authentication redirect..."
    );

    try {
      googleLogin();
    } catch (err) {
      logError(
        "Unable to start Google authentication.",
        sanitizeError(err)
      );

      toast.error(
        "Unable to start Google authentication. Please try again."
      );
    }
  };

  /* ==========================================================
     STEP NAVIGATION
     ========================================================== */

  const goBack = () => {
    log(
      "Back navigation requested.",
      {
        currentStep: step,
        googleRegistration:
          isGoogleRegistration,
      }
    );

    if (step === 2) {
      setEmailOtp("");
      setStep(1);

      return;
    }

    /*
     * Google users should not go back to
     * account creation or email verification.
     *
     * Their Google account has already been
     * authenticated.
     */
    if (step === 3) {
      if (isGoogleRegistration) {
        toast(
          "Your Google account has already been verified. Continue with phone verification."
        );

        return;
      }

      setPhone("");
      setStep(2);

      return;
    }

    if (step === 4) {
      setPhoneOtp("");
      setPhoneOtpId("");
      setStep(3);

      return;
    }
  };

  /* ==========================================================
     TERMS TOGGLE
     ========================================================== */

  const handleTermsToggle = () => {
    setAgreed((prev) => {
      const next = !prev;

      log(
        "Terms agreement changed:",
        next
      );

      return next;
    });
  };

  /* ==========================================================
     LOGIN NAVIGATION
     ========================================================== */

  const handleLoginNavigation = () => {
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
     STEP TITLES
     ========================================================== */

  const stepTitle = {
    1: "Create Account",
    2: "Verify Your Email",
    3: "Add Your Phone",
    4: "Verify Your Phone",
  };

  const stepDescription = {
    1: "Start your learning journey today",
    2: "Check your email for your verification code",
    3: isGoogleRegistration
      ? "Complete your Google account registration"
      : "Secure your account with phone verification",
    4: "Enter the code sent to your phone",
  };

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

      {/* Glow spots */}

      <div
        className="fixed inset-0 pointer-events-none"
        style={{ zIndex: 1 }}
      >
        <div
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-10"
          style={{
            background:
              "radial-gradient(circle, #0066ff 0%, transparent 70%)",
            filter: "blur(40px)",
          }}
        />

        <div
          className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-8"
          style={{
            background:
              "radial-gradient(circle, #00aaff 0%, transparent 70%)",
            filter: "blur(50px)",
          }}
        />
      </div>

      {/* Circuit lines */}

      <div
        className="fixed inset-0 pointer-events-none overflow-hidden"
        style={{ zIndex: 1 }}
      >
        <CircuitLines side="left" />

        <div className="absolute right-0 top-0 h-full w-64">
          <CircuitLines side="right" />
        </div>
      </div>

      {/* Card */}

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
            filter: "blur(1px)",
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
          {/* Top shimmer */}

          <div
            className="absolute top-0 left-0 right-0 h-px"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(0,200,255,0.6), transparent)",
            }}
          />

          {/* Header */}

          <div
            className="text-center mb-6"
            style={fadeIn(0.25)}
          >
            {/* Step indicator */}

            <div className="flex justify-center mb-4">
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4].map(
                  (item, index) => (
                    <div
                      key={item}
                      className="flex items-center gap-2"
                    >
                      <div
                        className={`w-2.5 h-2.5 rounded-full ${
                          step >= item
                            ? "bg-cyan-400"
                            : "bg-slate-700"
                        }`}
                      />

                      {index < 3 && (
                        <div
                          className={`w-6 sm:w-8 h-px ${
                            step > item
                              ? "bg-cyan-400"
                              : "bg-slate-700"
                          }`}
                        />
                      )}
                    </div>
                  )
                )}
              </div>
            </div>

            <p
              className="text-[10px] tracking-[0.2em] uppercase mb-2"
              style={{
                color:
                  "rgba(56,189,248,0.65)",
                fontFamily:
                  "'Orbitron', sans-serif",
              }}
            >
              Step {step} of 4
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
              {stepTitle[step]}
            </h2>

            <p
              className="text-sm mt-1"
              style={{
                color:
                  "rgba(180,210,255,0.65)",
              }}
            >
              {stepDescription[step]}
            </p>
          </div>

          {/* ==================================================
              STEP 1
              ================================================== */}

          {step === 1 && (
            <>
              <form
                onSubmit={
                  handleCreateAccount
                }
                className="space-y-4"
                style={fadeIn(0.35)}
              >
                {/* First + Last Name */}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <InputField
                    id="firstName"
                    placeholder="First name"
                    value={
                      form.firstName
                    }
                    onChange={set(
                      "firstName"
                    )}
                    focusedField={
                      focusedField
                    }
                    setFocusedField={
                      setFocusedField
                    }
                    icon={
                      ICONS.user
                    }
                    autoComplete="given-name"
                  />

                  <InputField
                    id="lastName"
                    placeholder="Last name"
                    value={
                      form.lastName
                    }
                    onChange={set(
                      "lastName"
                    )}
                    focusedField={
                      focusedField
                    }
                    setFocusedField={
                      setFocusedField
                    }
                    icon={
                      ICONS.user
                    }
                    autoComplete="family-name"
                  />
                </div>

                {/* Email */}

                <InputField
                  id="email"
                  type="email"
                  placeholder="Email address"
                  value={
                    form.email
                  }
                  onChange={set(
                    "email"
                  )}
                  focusedField={
                    focusedField
                  }
                  setFocusedField={
                    setFocusedField
                  }
                  icon={
                    ICONS.email
                  }
                  autoComplete="email"
                />

                {/* Password */}

                <div>
                  <InputField
                    id="password"
                    type={
                      showPass
                        ? "text"
                        : "password"
                    }
                    placeholder="Password"
                    value={
                      form.password
                    }
                    onChange={set(
                      "password"
                    )}
                    focusedField={
                      focusedField
                    }
                    setFocusedField={
                      setFocusedField
                    }
                    icon={
                      ICONS.lock
                    }
                    autoComplete="new-password"
                    rightSlot={
                      <button
                        type="button"
                        onClick={() =>
                          setShowPass(
                            (prev) =>
                              !prev
                          )
                        }
                        className="px-4 flex items-center transition-colors duration-200"
                        style={{
                          color:
                            showPass
                              ? "#38bdf8"
                              : "rgba(150,180,255,0.5)",
                        }}
                      >
                        <EyeIcon
                          open={
                            showPass
                          }
                        />
                      </button>
                    }
                  />

                  <StrengthBar
                    password={
                      form.password
                    }
                  />
                </div>

                {/* Confirm password */}

                <InputField
                  id="confirmPassword"
                  type={
                    showConfirm
                      ? "text"
                      : "password"
                  }
                  placeholder="Confirm password"
                  value={
                    form.confirmPassword
                  }
                  onChange={set(
                    "confirmPassword"
                  )}
                  focusedField={
                    focusedField
                  }
                  setFocusedField={
                    setFocusedField
                  }
                  icon={
                    ICONS.lock
                  }
                  autoComplete="new-password"
                  rightSlot={
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirm(
                          (prev) =>
                            !prev
                        )
                      }
                      className="px-4 flex items-center transition-colors duration-200"
                      style={{
                        color:
                          showConfirm
                            ? "#38bdf8"
                            : "rgba(150,180,255,0.5)",
                      }}
                    >
                      <EyeIcon
                        open={
                          showConfirm
                        }
                      />
                    </button>
                  }
                />

                {/* Password match */}

                {form.confirmPassword && (
                  <p
                    className="text-xs px-1 -mt-2"
                    style={{
                      color:
                        form.password ===
                        form.confirmPassword
                          ? "#22c55e"
                          : "#ef4444",

                      fontFamily:
                        "'Rajdhani', sans-serif",
                    }}
                  >
                    {form.password ===
                    form.confirmPassword
                      ? "✓ Passwords match"
                      : "✗ Passwords do not match"}
                  </p>
                )}

                {/* Terms */}

                <label
                  className="flex items-start gap-3 cursor-pointer group mt-1"
                  style={{
                    fontFamily:
                      "'Rajdhani', sans-serif",
                  }}
                >
                  <div
                    onClick={
                      handleTermsToggle
                    }
                    className="mt-0.5 w-4 h-4 rounded flex-shrink-0 flex items-center justify-center transition-all duration-200"
                    style={{
                      background:
                        agreed
                          ? "linear-gradient(135deg, #0066ff, #00c8ff)"
                          : "rgba(255,255,255,0.04)",

                      border: `1px solid ${
                        agreed
                          ? "rgba(0,180,255,0.8)"
                          : "rgba(100,150,255,0.25)"
                      }`,

                      boxShadow:
                        agreed
                          ? "0 0 10px rgba(0,150,255,0.3)"
                          : "none",
                    }}
                  >
                    {agreed && (
                      <svg
                        className="w-2.5 h-2.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="white"
                        strokeWidth={3}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </div>

                  <span
                    className="text-xs leading-relaxed"
                    style={{
                      color:
                        "rgba(150,180,255,0.65)",
                    }}
                  >
                    I agree to the{" "}
                    <span
                      className="font-semibold"
                      style={{
                        color:
                          "#38bdf8",
                      }}
                    >
                      Terms of Service
                    </span>{" "}
                    and{" "}
                    <span
                      className="font-semibold"
                      style={{
                        color:
                          "#38bdf8",
                      }}
                    >
                      Privacy Policy
                    </span>
                  </span>
                </label>

                {/* Continue */}

                <button
                  type="submit"
                  disabled={
                    loading ||
                    isLoading
                  }
                  className="w-full relative overflow-hidden rounded-xl py-3.5 font-bold text-sm tracking-widest transition-all duration-300 group mt-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{
                    background:
                      loading ||
                      isLoading
                        ? "rgba(0,100,200,0.5)"
                        : "linear-gradient(135deg, #0066ff 0%, #0099ff 50%, #00c8ff 100%)",

                    color: "#fff",

                    fontFamily:
                      "'Orbitron', 'Rajdhani', sans-serif",

                    fontSize: "13px",

                    letterSpacing:
                      "0.15em",

                    boxShadow:
                      "0 0 30px rgba(0,150,255,0.4), 0 4px 15px rgba(0,100,255,0.3)",
                  }}
                >
                  <span className="relative flex items-center justify-center gap-3">
                    {loading ||
                    isLoading
                      ? "CREATING ACCOUNT..."
                      : "CONTINUE"}

                    <svg
                      className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                  </span>
                </button>
              </form>

              {/* Divider */}

              <div
                className="flex items-center my-5"
                style={fadeIn(0.45)}
              >
                <div className="flex-1 h-px bg-slate-800" />

                <span
                  className="px-3 text-xs tracking-wider"
                  style={{
                    color:
                      "rgba(150,180,255,0.35)",
                    fontFamily:
                      "'Orbitron', sans-serif",
                  }}
                >
                  OR
                </span>

                <div className="flex-1 h-px bg-slate-800" />
              </div>

              {/* ==================================================
                  GOOGLE
                  ================================================== */}

              <div
                style={fadeIn(0.55)}
                className="w-full flex justify-center"
              >
                <div className="w-full overflow-hidden rounded-xl">
                  <button
                    type="button"
                    onClick={
                      handleGoogleLogin
                    }
                    disabled={
                      isLoading ||
                      loading
                    }
                    className="w-full flex items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        fill="#4285F4"
                        d="M21.35 12.23c0-.79-.07-1.55-.23-2.27H12v4.3h5.24a4.48 4.48 0 0 1-1.94 2.94v2.45h3.14c1.84-1.69 2.91-4.18 2.91-7.42z"
                      />

                      <path
                        fill="#34A853"
                        d="M12 21.6c2.63 0 4.84-.87 6.45-2.35l-3.14-2.45c-.87.58-1.98.92-3.31.92-2.54 0-4.69-1.72-5.46-4.03H3.3v2.53A9.74 9.74 0 0 0 12 21.6z"
                      />

                      <path
                        fill="#FBBC05"
                        d="M6.54 13.69A5.86 5.86 0 0 1 6.23 12c0-.59.11-1.16.31-1.69V7.78H3.3A9.74 9.74 0 0 0 2.25 12c0 1.57.38 3.05 1.05 4.22l3.24-2.53z"
                      />

                      <path
                        fill="#EA4335"
                        d="M12 6.28c1.43 0 2.72.49 3.73 1.45l2.8-2.8C16.84 3.37 14.63 2.4 12 2.4a9.74 9.74 0 0 0-8.7 5.38l3.24 2.53C7.31 8 9.46 6.28 12 6.28z"
                      />
                    </svg>

                    Continue with Google
                  </button>
                </div>
              </div>
            </>
          )}

          {/* ==================================================
              STEP 2 — EMAIL VERIFICATION
              ================================================== */}

          {step === 2 && (
            <form
              onSubmit={
                handleVerifyEmail
              }
              className="space-y-5"
              style={fadeIn(0.35)}
            >
              <div
                className="rounded-xl p-4"
                style={{
                  background:
                    "rgba(0,180,255,0.05)",
                  border:
                    "1px solid rgba(0,180,255,0.12)",
                }}
              >
                <p
                  className="text-sm leading-relaxed"
                  style={{
                    color:
                      "rgba(180,210,255,0.7)",
                    fontFamily:
                      "'Rajdhani', sans-serif",
                  }}
                >
                  We sent a 6-digit
                  verification code to
                  <br />

                  <strong
                    style={{
                      color:
                        "#38bdf8",
                    }}
                  >
                    {form.email}
                  </strong>
                </p>
              </div>

              <div>
                <label
                  className="block text-xs mb-2 px-1"
                  style={{
                    color:
                      "rgba(150,180,255,0.6)",
                    fontFamily:
                      "'Rajdhani', sans-serif",
                  }}
                >
                  Enter 6-digit email
                  verification code
                </label>

                <OTPInput
                  value={
                    emailOtp
                  }
                  onChange={
                    setEmailOtp
                  }
                  disabled={
                    loading ||
                    isLoading
                  }
                />
              </div>

              <button
                type="submit"
                disabled={
                  loading ||
                  isLoading ||
                  emailOtp.length !== 6
                }
                className="w-full rounded-xl py-3.5 font-bold text-sm tracking-widest transition-all duration-300 cursor-pointer disabled:cursor-not-allowed"
                style={{
                  background:
                    loading ||
                    isLoading ||
                    emailOtp.length !== 6
                      ? "rgba(0,100,200,0.35)"
                      : "linear-gradient(135deg, #0066ff 0%, #0099ff 50%, #00c8ff 100%)",

                  color: "#fff",

                  fontFamily:
                    "'Orbitron', sans-serif",

                  fontSize:
                    "12px",
                }}
              >
                {loading ||
                isLoading
                  ? "VERIFYING..."
                  : "VERIFY EMAIL"}
              </button>

              <button
                type="button"
                onClick={
                  handleResendEmailOTP
                }
                disabled={
                  emailResendLoading ||
                  loading
                }
                className="w-full text-xs font-semibold cursor-pointer disabled:opacity-50"
                style={{
                  color:
                    "#38bdf8",
                  fontFamily:
                    "'Rajdhani', sans-serif",
                }}
              >
                {emailResendLoading
                  ? "Sending new code..."
                  : "Didn't receive the code? Resend OTP"}
              </button>

              <button
                type="button"
                onClick={
                  goBack
                }
                className="w-full text-xs cursor-pointer"
                style={{
                  color:
                    "rgba(150,180,255,0.5)",
                  fontFamily:
                    "'Rajdhani', sans-serif",
                }}
              >
                ← Back to account details
              </button>
            </form>
          )}

          {/* ==================================================
              STEP 3 — PHONE NUMBER
              ================================================== */}

          {step === 3 && (
            <div
              className="space-y-5"
              style={fadeIn(0.35)}
            >
              <div
                className="rounded-xl p-4"
                style={{
                  background:
                    "rgba(0,180,255,0.05)",
                  border:
                    "1px solid rgba(0,180,255,0.12)",
                }}
              >
                <p
                  className="text-sm leading-relaxed"
                  style={{
                    color:
                      "rgba(180,210,255,0.7)",
                    fontFamily:
                      "'Rajdhani', sans-serif",
                  }}
                >
                  {isGoogleRegistration ? (
                    <>
                      Your Google account has
                      been verified successfully.
                      Now add your Nigerian phone
                      number. We will send you a
                      verification code to secure
                      your account.
                    </>
                  ) : (
                    <>
                      Your email is verified.
                      Now add your Nigerian phone
                      number. We will send you a
                      verification code to secure
                      your account and prevent fake
                      registrations.
                    </>
                  )}
                </p>
              </div>

              {isGoogleRegistration &&
                form.email && (
                  <div
                    className="rounded-lg px-4 py-3 text-center"
                    style={{
                      background:
                        "rgba(0,180,255,0.04)",
                      border:
                        "1px solid rgba(0,180,255,0.10)",
                    }}
                  >
                    <span
                      className="text-xs"
                      style={{
                        color:
                          "rgba(150,180,255,0.55)",
                        fontFamily:
                          "'Rajdhani', sans-serif",
                      }}
                    >
                      Google account
                    </span>

                    <div
                      className="text-sm font-semibold mt-1"
                      style={{
                        color:
                          "#38bdf8",
                      }}
                    >
                      {form.email}
                    </div>
                  </div>
                )}

              <InputField
                id="phone"
                type="tel"
                placeholder="08012345678"
                value={phone}
                onChange={(e) => {
                  const value =
                    e.target.value;

                  setPhone(value);
                }}
                focusedField={
                  focusedField
                }
                setFocusedField={
                  setFocusedField
                }
                icon={
                  ICONS.phone
                }
                autoComplete="tel"
              />

              <button
                type="button"
                onClick={
                  handleSendPhoneOTP
                }
                disabled={
                  phoneSendLoading ||
                  loading ||
                  isLoading
                }
                className="w-full rounded-xl py-3.5 font-bold text-sm tracking-widest transition-all duration-300 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                style={{
                  background:
                    phoneSendLoading ||
                    loading ||
                    isLoading
                      ? "rgba(0,100,200,0.5)"
                      : "linear-gradient(135deg, #0066ff 0%, #0099ff 50%, #00c8ff 100%)",

                  color: "#fff",

                  fontFamily:
                    "'Orbitron', sans-serif",

                  fontSize:
                    "12px",

                  boxShadow:
                    "0 0 30px rgba(0,150,255,0.3)",
                }}
              >
                {phoneSendLoading ||
                loading ||
                isLoading
                  ? "SENDING CODE..."
                  : "SEND PHONE CODE"}
              </button>

              <button
                type="button"
                onClick={
                  goBack
                }
                className="w-full text-xs cursor-pointer"
                style={{
                  color:
                    "rgba(150,180,255,0.5)",
                  fontFamily:
                    "'Rajdhani', sans-serif",
                }}
              >
                {isGoogleRegistration
                  ? "← Continue with Google account"
                  : "← Back to email verification"}
              </button>
            </div>
          )}

          {/* ==================================================
              STEP 4 — PHONE OTP
              ================================================== */}

          {step === 4 && (
            <form
              onSubmit={
                handleVerifyPhone
              }
              className="space-y-5"
              style={fadeIn(0.35)}
            >
              <div
                className="rounded-xl p-4"
                style={{
                  background:
                    "rgba(0,180,255,0.05)",
                  border:
                    "1px solid rgba(0,180,255,0.12)",
                }}
              >
                <p
                  className="text-sm leading-relaxed"
                  style={{
                    color:
                      "rgba(180,210,255,0.7)",
                    fontFamily:
                      "'Rajdhani', sans-serif",
                  }}
                >
                  We sent a 6-digit
                  verification code to
                  <br />

                  <strong
                    style={{
                      color:
                        "#38bdf8",
                    }}
                  >
                    {phone}
                  </strong>
                </p>
              </div>

              <div>
                <label
                  className="block text-xs mb-2 px-1"
                  style={{
                    color:
                      "rgba(150,180,255,0.6)",
                    fontFamily:
                      "'Rajdhani', sans-serif",
                  }}
                >
                  Enter 6-digit phone
                  verification code
                </label>

                <OTPInput
                  value={
                    phoneOtp
                  }
                  onChange={
                    setPhoneOtp
                  }
                  disabled={
                    loading ||
                    isLoading
                  }
                />
              </div>

              <button
                type="submit"
                disabled={
                  loading ||
                  isLoading ||
                  phoneOtp.length !== 6
                }
                className="w-full rounded-xl py-3.5 font-bold text-sm tracking-widest transition-all duration-300 cursor-pointer disabled:cursor-not-allowed"
                style={{
                  background:
                    loading ||
                    isLoading ||
                    phoneOtp.length !== 6
                      ? "rgba(0,100,200,0.35)"
                      : "linear-gradient(135deg, #0066ff 0%, #0099ff 50%, #00c8ff 100%)",

                  color: "#fff",

                  fontFamily:
                    "'Orbitron', sans-serif",

                  fontSize:
                    "12px",
                }}
              >
                {loading ||
                isLoading
                  ? "VERIFYING..."
                  : "VERIFY PHONE"}
              </button>

              <button
                type="button"
                onClick={
                  handleResendPhoneOTP
                }
                disabled={
                  phoneResendLoading ||
                  loading
                }
                className="w-full text-xs font-semibold cursor-pointer disabled:opacity-50"
                style={{
                  color:
                    "#38bdf8",
                  fontFamily:
                    "'Rajdhani', sans-serif",
                }}
              >
                {phoneResendLoading
                  ? "Sending new code..."
                  : "Didn't receive the code? Resend OTP"}
              </button>

              <button
                type="button"
                onClick={
                  goBack
                }
                className="w-full text-xs cursor-pointer"
                style={{
                  color:
                    "rgba(150,180,255,0.5)",
                  fontFamily:
                    "'Rajdhani', sans-serif",
                }}
              >
                ← Change phone number
              </button>
            </form>
          )}

          {/* Login */}

          <p
            className="text-center text-sm mt-6"
            style={{
              color:
                "rgba(150,180,255,0.55)",
              fontFamily:
                "'Rajdhani', sans-serif",
            }}
          >
            Already have an account?{" "}

            <button
              type="button"
              onClick={
                handleLoginNavigation
              }
              className="font-bold transition-all duration-200 hover:brightness-125 cursor-pointer"
              style={{
                color: "#38bdf8",
                fontFamily:
                  "'Orbitron', sans-serif",
                fontSize: "12px",
              }}
            >
              Login
            </button>
          </p>

          {/* Bottom shimmer */}

          <div
            className="absolute bottom-0 left-0 right-0 h-px"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(0,150,255,0.3), transparent)",
            }}
          />
        </div>
      </div>

      {/* Styles */}

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

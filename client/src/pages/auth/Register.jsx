import { useState, useEffect, useRef } from "react";
import {
  useNavigate,
  useLocation,
} from "react-router-dom";
import { toast } from "react-hot-toast";
import useAuthStore from "../../store/authStore";
import { GoogleLogin } from "@react-oauth/google";

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
 * - passwords
 * - OTP codes
 * - registration tokens
 * - Google credentials
 */

const sanitizeError = (err) => ({
  message: err?.message || null,
  status: err?.response?.status || null,
  responseMessage:
    err?.response?.data?.message || null,
  responseData:
    err?.response?.data || null,
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
      logWarn(
        "Particles canvas reference is missing."
      );
      return;
    }

    const ctx = canvas.getContext("2d");

    if (!ctx) {
      logWarn(
        "Unable to obtain 2D canvas context."
      );
      return;
    }

    let animationFrameId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resize();

    window.addEventListener(
      "resize",
      resize
    );

    const particles = Array.from(
      { length: 80 },
      () => ({
        x:
          Math.random() *
          window.innerWidth,

        y:
          Math.random() *
          window.innerHeight,

        r:
          Math.random() * 2 + 0.5,

        dx:
          (Math.random() - 0.5) *
          0.4,

        dy:
          (Math.random() - 0.5) *
          0.4,

        alpha:
          Math.random() * 0.6 + 0.2,
      })
    );

    const draw = () => {
      ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
      );

      particles.forEach(
        (particle, index) => {
          particles
            .slice(index + 1)
            .forEach((other) => {
              const distance =
                Math.hypot(
                  particle.x -
                    other.x,
                  particle.y -
                    other.y
                );

              if (distance < 120) {
                ctx.beginPath();

                ctx.strokeStyle = `rgba(
                  0,
                  180,
                  255,
                  ${0.15 *
                  (1 -
                    distance /
                      120)}
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
        }
      );

      particles.forEach(
        (particle) => {
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
            particle.x >
              canvas.width
          ) {
            particle.dx *= -1;
          }

          if (
            particle.y < 0 ||
            particle.y >
              canvas.height
          ) {
            particle.dy *= -1;
          }
        }
      );

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
        isLeft
          ? "left-0"
          : "right-0"
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
                ? [
                    120,
                    60,
                    100,
                    40,
                    130,
                  ][index]
                : [
                    80,
                    140,
                    90,
                    160,
                    70,
                  ][index]
            }
            cy={y}
            r="4"
            fill="#00d4ff"
            className="animate-pulse"
            style={{
              animationDelay: `${
                index * 0.3
              }s`,
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
            focusedField === id
              ? 1
              : 0,
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
            log(
              `Input focused: ${id}`
            );

            setFocusedField(id);
          }}
          onBlur={() => {
            log(
              `Input blurred: ${id}`
            );

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
      label: "At least 8 characters",
      met: password.length >= 8,
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

  const metCount =
    criteria.filter(
      (item) => item.met
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

  if (!password) {
    return null;
  }

  const strengthIndex =
    metCount === 0
      ? 1
      : Math.min(metCount, 4);

  return (
    <div className="mt-2 px-1 space-y-2">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map(
          (item) => (
            <div
              key={item}
              className="flex-1 h-1 rounded-full transition-all duration-300"
              style={{
                background:
                  item <= metCount
                    ? colors[
                        strengthIndex
                      ]
                    : "rgba(100,150,255,0.15)",
              }}
            />
          )
        )}
      </div>

      <div className="flex justify-between items-center">
        <span
          className="text-xs font-semibold"
          style={{
            color:
              colors[strengthIndex],

            fontFamily:
              "'Rajdhani', sans-serif",
          }}
        >
          Strength:{" "}
          {labels[strengthIndex]}
        </span>
      </div>

      <div
        className="pt-1 grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-1 text-[11px]"
        style={{
          fontFamily:
            "'Rajdhani', sans-serif",
        }}
      >
        {criteria.map(
          (criterion, index) => (
            <div
              key={index}
              className="flex items-center gap-1.5"
              style={{
                color: criterion.met
                  ? "#22c55e"
                  : "rgba(150,180,255,0.4)",
              }}
            >
              <span>
                {criterion.met
                  ? "✓"
                  : "○"}
              </span>

              <span>
                {criterion.label}
              </span>
            </div>
          )
        )}
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
      onChange={(event) => {
        const cleanValue =
          event.target.value.replace(
            /\D/g,
            ""
          );

        log(
          "OTP input changed:",
          {
            length:
              cleanValue.length,
          }
        );

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

        opacity: disabled
          ? 0.6
          : 1,
      }}
    />
  );
}

/* ============================================================
   GOOGLE RESPONSE HELPERS
   ============================================================ */

const extractGoogleRegistrationData = (
  response
) => {
  const root =
    response?.data ||
    response ||
    {};

  const nested =
    root?.data || {};

  const user =
    root?.user ||
    nested?.user ||
    root?.registration?.user ||
    null;

  const registrationToken =
    root?.registrationToken ||
    nested?.registrationToken ||
    root?.registration
      ?.registrationToken ||
    "";

  const email =
    root?.email ||
    nested?.email ||
    user?.email ||
    root?.registration?.email ||
    "";

  const firstName =
    root?.firstName ||
    nested?.firstName ||
    user?.firstName ||
    root?.registration?.firstName ||
    "";

  const lastName =
    root?.lastName ||
    nested?.lastName ||
    user?.lastName ||
    root?.registration?.lastName ||
    "";

  const requiresPhone =
    root?.requiresPhone === true ||
    nested?.requiresPhone === true ||
    Boolean(registrationToken) ||
    user?.isPhoneVerified === false;

  return {
    user,
    registrationToken,
    email,
    firstName,
    lastName,
    requiresPhone,
  };
};

/* ============================================================
   REGISTER PAGE
   ============================================================ */

export default function RegisterPage() {
  const navigate =
    useNavigate();

  const location =
    useLocation();

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

  const [step, setStep] =
    useState(1);

  const [
    isGoogleRegistration,
    setIsGoogleRegistration,
  ] = useState(false);

  /*
   * IMPORTANT:
   * This is used when an existing user logs in
   * successfully but still needs phone verification.
   */
  const [
    isResumingPhoneVerification,
    setIsResumingPhoneVerification,
  ] = useState(false);

  /* ==========================================================
     FORM
     ========================================================== */

  const [form, setForm] =
    useState({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    });

  /* ==========================================================
     EMAIL OTP
     ========================================================== */

  const [emailOtp, setEmailOtp] =
    useState("");

  /* ==========================================================
     PHONE
     ========================================================== */

  const [phone, setPhone] =
    useState("");

  const [phoneOtp, setPhoneOtp] =
    useState("");

  /* ==========================================================
     REGISTRATION SESSION
     ========================================================== */

  const [
    registrationToken,
    setRegistrationToken,
  ] = useState("");

  const [
    phoneOtpId,
    setPhoneOtpId,
  ] = useState("");

  /* ==========================================================
     LOADING
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

  const [
    googleLoading,
    setGoogleLoading,
  ] = useState(false);

  /* ==========================================================
     UI
     ========================================================== */

  const [showPass, setShowPass] =
    useState(false);

  const [
    showConfirm,
    setShowConfirm,
  ] = useState(false);

  const [
    mounted,
    setMounted,
  ] = useState(false);

  const [
    focusedField,
    setFocusedField,
  ] = useState(null);

  const [agreed, setAgreed] =
    useState(false);

  /* ==========================================================
     RESUME PHONE VERIFICATION
     ========================================================== */

  useEffect(() => {
    const state =
      location.state;

    if (
      !state?.resumePhoneVerification
    ) {
      return;
    }

    logInfo(
      "Resuming existing account directly at phone verification.",
      {
        email:
          state.email ||
          state.user?.email ||
          null,

        hasUser:
          Boolean(state.user),

        hasRegistrationToken:
          Boolean(
            state.registrationToken
          ),
      }
    );

    if (
      state.registrationToken
    ) {
      setRegistrationToken(
        state.registrationToken
      );
    }

    setForm((previous) => ({
      ...previous,

      firstName:
        state.firstName ||
        state.user?.firstName ||
        previous.firstName,

      lastName:
        state.lastName ||
        state.user?.lastName ||
        previous.lastName,

      email:
        state.email ||
        state.user?.email ||
        previous.email,
    }));

    setIsGoogleRegistration(
      false
    );

    setIsResumingPhoneVerification(
      true
    );

    setPhone("");
    setPhoneOtp("");
    setPhoneOtpId("");

    setStep(3);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

    /*
     * Clear navigation state so refresh
     * does not restart the resume flow.
     */
    navigate("/register", {
      replace: true,
      state: {},
    });
  }, [
    location,
    navigate,
  ]);

  /* ==========================================================
     MOUNT
     ========================================================== */

  useEffect(() => {
    log("RegisterPage mounted.");

    const timer =
      setTimeout(() => {
        setMounted(true);
      }, 100);

    return () => {
      clearTimeout(timer);

      log(
        "RegisterPage unmounted."
      );
    };
  }, []);

  /* ==========================================================
     STEP LOGGER
     ========================================================== */

  useEffect(() => {
    const titles = {
      1: "Create Account",
      2: "Verify Your Email",
      3: "Add Your Phone",
      4: "Verify Your Phone",
    };

    logInfo(
      `Registration step changed: STEP ${step}`,
      {
        title: titles[step],

        googleRegistration:
          isGoogleRegistration,

        resumePhoneVerification:
          isResumingPhoneVerification,
      }
    );
  }, [
    step,
    isGoogleRegistration,
    isResumingPhoneVerification,
  ]);

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

  const set = (field) => (
    event
  ) => {
    const value =
      event.target.value;

    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));

    if (
      field === "password" ||
      field === "confirmPassword"
    ) {
      log(
        `Form field changed: ${field}`,
        {
          length:
            value.length,
        }
      );
    } else {
      log(
        `Form field changed: ${field}`,
        {
          value,
        }
      );
    }
  };

  /* ==========================================================
     VALIDATE STEP 1
     ========================================================== */

  const validateStepOne =
    () => {
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
        toast.error(
          "Please complete all required fields."
        );

        return false;
      }

      const normalizedEmail =
        email
          .trim()
          .toLowerCase();

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

      if (
        password.length < 8
      ) {
        toast.error(
          "Password must be at least 8 characters."
        );

        return false;
      }

      if (
        !/[A-Z]/.test(password)
      ) {
        toast.error(
          "Password must contain at least one uppercase letter."
        );

        return false;
      }

      if (
        !/[a-z]/.test(password)
      ) {
        toast.error(
          "Password must contain at least one lowercase letter."
        );

        return false;
      }

      if (
        !/[0-9]/.test(password)
      ) {
        toast.error(
          "Password must contain at least one number."
        );

        return false;
      }

      if (
        !/[^A-Za-z0-9]/.test(
          password
        )
      ) {
        toast.error(
          "Password must contain at least one special symbol."
        );

        return false;
      }

      if (
        password !==
        confirmPassword
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

      return true;
    };

  /* ==========================================================
     STEP 1 → REGISTER
     ========================================================== */

  const handleCreateAccount =
    async (event) => {
      event.preventDefault();

      if (
        !validateStepOne()
      ) {
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
          "Calling authStore.register()",
          {
            firstName:
              payload.firstName,

            lastName:
              payload.lastName,

            email:
              payload.email,

            passwordLength:
              payload.password
                .length,
          }
        );

        const response =
          await register(
            payload
          );

        const data =
          response?.data ||
          response ||
          {};

        const returnedEmail =
          data?.registration
            ?.email ||
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
      } catch (error) {
        logError(
          "Registration failed.",
          sanitizeError(error)
        );

        toast.error(
          error?.response?.data
            ?.message ||
            error?.message ||
            "Registration failed. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

  /* ==========================================================
     GOOGLE LOGIN — CLIENT ID FLOW
     ========================================================== */

  const handleGoogleSuccess =
    async (
      credentialResponse
    ) => {
      const credential =
        credentialResponse?.credential;

      if (!credential) {
        logError(
          "Google did not return a credential."
        );

        toast.error(
          "Google authentication failed. No credential was returned."
        );

        return;
      }

      try {
        setGoogleLoading(true);

        logInfo(
          "Google credential received. Sending it to authStore.googleLogin()."
        );

        const response =
          await googleLogin(
            credential
          );

        logInfo(
          "Google authentication response received."
        );

        const googleData =
          extractGoogleRegistrationData(
            response
          );

        if (
          googleData.registrationToken
        ) {
          setRegistrationToken(
            googleData.registrationToken
          );
        }

        if (googleData.email) {
          setForm((previous) => ({
            ...previous,

            email:
              googleData.email,

            firstName:
              googleData.firstName ||
              previous.firstName,

            lastName:
              googleData.lastName ||
              previous.lastName,
          }));
        }

        if (
          googleData.requiresPhone ||
          googleData.registrationToken
        ) {
          if (
            !googleData.registrationToken
          ) {
            throw new Error(
              "Google authentication succeeded, but the phone verification session was not returned."
            );
          }

          setIsGoogleRegistration(
            true
          );

          setIsResumingPhoneVerification(
            false
          );

          setPhone("");
          setPhoneOtp("");
          setPhoneOtpId("");

          setStep(3);

          toast.success(
            "Google account verified. Please add your phone number."
          );

          window.scrollTo({
            top: 0,
            behavior: "smooth",
          });

          return;
        }

        toast.success(
          "Google sign-in successful."
        );

        const user =
          googleData.user;

        if (
          user?.role ===
          "super_admin"
        ) {
          navigate(
            "/admin/dashboard",
            {
              replace: true,
            }
          );
        } else if (
          user?.role ===
          "instructor"
        ) {
          navigate(
            "/instructor/dashboard",
            {
              replace: true,
            }
          );
        } else {
          navigate(
            "/student/dashboard",
            {
              replace: true,
            }
          );
        }
      } catch (error) {
        logError(
          "Google authentication failed.",
          sanitizeError(error)
        );

        toast.error(
          error?.response?.data
            ?.message ||
            error?.message ||
            "Google sign-in failed. Please try again."
        );
      } finally {
        setGoogleLoading(
          false
        );
      }
    };

  /* ==========================================================
     GOOGLE ERROR
     ========================================================== */

  const handleGoogleError =
    () => {
      logWarn(
        "Google authentication was cancelled or failed."
      );

      toast.error(
        "Google sign-in was cancelled or failed. Please try again."
      );
    };

  /* ==========================================================
     VERIFY EMAIL
     ========================================================== */

  const handleVerifyEmail =
    async (event) => {
      event.preventDefault();

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
          data?.data
            ?.registrationToken ||
          "";

        if (!token) {
          throw new Error(
            "Email verified, but the registration verification session was not returned."
          );
        }

        setRegistrationToken(
          token
        );

        setIsGoogleRegistration(
          false
        );

        setIsResumingPhoneVerification(
          false
        );

        setEmailOtp("");

        toast.success(
          "Email verified successfully!"
        );

        setStep(3);

        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      } catch (error) {
        logError(
          "Email verification failed.",
          sanitizeError(error)
        );

        toast.error(
          error?.response?.data
            ?.message ||
            error?.message ||
            "Email verification failed."
        );
      } finally {
        setLoading(false);
      }
    };

  /* ==========================================================
     RESEND EMAIL OTP
     ========================================================== */

  const handleResendEmailOTP =
    async () => {
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
        setEmailResendLoading(
          true
        );

        await resendVerification(
          email
        );

        setEmailOtp("");

        toast.success(
          "A new email verification code has been sent."
        );
      } catch (error) {
        logError(
          "Resend email OTP failed.",
          sanitizeError(error)
        );

        toast.error(
          error?.response?.data
            ?.message ||
            error?.message ||
            "Unable to resend email verification code."
        );
      } finally {
        setEmailResendLoading(
          false
        );
      }
    };

  /* ==========================================================
     VALIDATE PHONE
     ========================================================== */

  const validatePhone =
    () => {
      const cleanPhone =
        phone.trim();

      if (!cleanPhone) {
        toast.error(
          "Please enter your phone number."
        );

        return false;
      }

      const normalized =
        cleanPhone.replace(
          /[\s()-]/g,
          ""
        );

      const nigeriaPhonePattern =
        /^(?:\+234|234|0)8\d{9}$/;

      if (
        !nigeriaPhonePattern.test(
          normalized
        )
      ) {
        toast.error(
          "Please enter a valid Nigerian phone number."
        );

        return false;
      }

      return true;
    };

  /* ==========================================================
     SEND PHONE OTP
     ========================================================== */

  const handleSendPhoneOTP =
    async () => {
      if (!validatePhone()) {
        return;
      }

      if (!registrationToken) {
        toast.error(
          "Your verification session has expired. Please restart the verification process."
        );

        if (
          isResumingPhoneVerification
        ) {
          navigate("/login", {
            replace: true,
          });

          return;
        }

        setStep(1);

        return;
      }

      try {
        setPhoneSendLoading(
          true
        );

        const cleanPhone =
          phone.trim();

        logInfo(
          "Saving registration phone number.",
          {
            email:
              form.email || null,

            isResumeFlow:
              isResumingPhoneVerification,

            isGoogleRegistration,
          }
        );

        await updateRegistrationPhone(
          registrationToken,
          cleanPhone
        );

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
          data?.data?.otpId ||
          response?.phoneVerification
            ?.otpId ||
          response?.otpId ||
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

        logInfo(
          "Phone verification OTP sent.",
          {
            isResumeFlow:
              isResumingPhoneVerification,
          }
        );
      } catch (error) {
        logError(
          "Phone OTP request failed.",
          sanitizeError(error)
        );

        toast.error(
          error?.response?.data
            ?.message ||
            error?.message ||
            "Unable to send phone verification code."
        );
      } finally {
        setPhoneSendLoading(
          false
        );
      }
    };

  /* ==========================================================
     VERIFY PHONE
     ========================================================== */

  const handleVerifyPhone =
    async (event) => {
      event.preventDefault();

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

        if (
          isResumingPhoneVerification
        ) {
          navigate("/login", {
            replace: true,
          });

          return;
        }

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

        const response =
          await verifyPhone(
            registrationToken,
            phoneOtpId,
            code
          );

        toast.success(
          "Registration completed successfully!"
        );

        /*
         * Backend currently completes phone verification
         * without issuing an access token.
         *
         * If a future backend response contains a token,
         * support it without changing the current flow.
         */

        const data =
          response?.data ||
          response ||
          {};

        const accessToken =
          data?.accessToken ||
          data?.token ||
          data?.data
            ?.accessToken ||
          data?.data?.token ||
          null;

        const verifiedUser =
          data?.user ||
          data?.data?.user ||
          null;

        if (accessToken) {
          localStorage.setItem(
            "accessToken",
            accessToken
          );

          if (
            verifiedUser?.role ===
            "super_admin"
          ) {
            navigate(
              "/admin/dashboard",
              {
                replace: true,
              }
            );
          } else if (
            verifiedUser?.role ===
            "instructor"
          ) {
            navigate(
              "/instructor/dashboard",
              {
                replace: true,
              }
            );
          } else {
            navigate(
              "/student/dashboard",
              {
                replace: true,
              }
            );
          }

          return;
        }

        const email =
          form.email
            .trim()
            .toLowerCase();

        setTimeout(() => {
          navigate("/login", {
            replace: true,
            state: {
              registered: true,
              phoneVerified: true,
              email,
            },
          });
        }, 1000);
      } catch (error) {
        logError(
          "Phone verification failed.",
          sanitizeError(error)
        );

        toast.error(
          error?.response?.data
            ?.message ||
            error?.message ||
            "Phone verification failed."
        );
      } finally {
        setLoading(false);
      }
    };

  /* ==========================================================
     RESEND PHONE OTP
     ========================================================== */

  const handleResendPhoneOTP =
    async () => {
      if (!registrationToken) {
        toast.error(
          "Your registration session has expired."
        );

        return;
      }

      try {
        setPhoneResendLoading(
          true
        );

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
          data?.data?.otpId ||
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
      } catch (error) {
        logError(
          "Resend phone OTP failed.",
          sanitizeError(error)
        );

        toast.error(
          error?.response?.data
            ?.message ||
            error?.message ||
            "Unable to resend phone verification code."
        );
      } finally {
        setPhoneResendLoading(
          false
        );
      }
    };

  /* ==========================================================
     BACK NAVIGATION
     ========================================================== */

  const goBack = () => {
    if (step === 2) {
      setEmailOtp("");

      setStep(1);

      return;
    }

    if (step === 3) {
      /*
       * Existing user came from LOGIN.
       *
       * Do not send them back to email
       * verification because their email
       * is already verified.
       */
      if (
        isResumingPhoneVerification
      ) {
        toast(
          "Your email is already verified. Please complete phone verification.",
          {
            icon: "📱",
          }
        );

        return;
      }

      if (isGoogleRegistration) {
        toast(
          "Your Google account has already been verified. Continue with phone verification.",
          {
            icon: "🔐",
          }
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
    }
  };

  /* ==========================================================
     TERMS
     ========================================================== */

  const handleTermsToggle =
    () => {
      setAgreed(
        (previous) => !previous
      );
    };

  /* ==========================================================
     LOGIN
     ========================================================== */

  const handleLoginNavigation =
    () => {
      navigate("/login");
    };

  /* ==========================================================
     STYLES
     ========================================================== */

  const cardStyle = {
    transform: mounted
      ? "translateY(0)"
      : "translateY(30px)",

    opacity:
      mounted ? 1 : 0,

    transition:
      "all 0.7s cubic-bezier(0.23, 1, 0.32, 1)",
  };

  const fadeIn = (delay) => ({
    transform: mounted
      ? "translateY(0)"
      : "translateY(10px)",

    opacity:
      mounted ? 1 : 0,

    transition: `all 0.8s cubic-bezier(0.23, 1, 0.32, 1) ${delay}s`,
  });

  /* ==========================================================
     STEP TITLES
     ========================================================== */

  const stepTitle = {
    1: "Create Account",
    2: "Verify Your Email",
    3: isResumingPhoneVerification
      ? "Complete Phone Verification"
      : "Add Your Phone",
    4: "Verify Your Phone",
  };

  const stepDescription = {
    1: "Start your learning journey today",

    2: "Check your email for your verification code",

    3: isResumingPhoneVerification
      ? "Your email is already verified. Complete your phone verification."
      : isGoogleRegistration
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

      {/* Glow */}

      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          zIndex: 1,
        }}
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

      {/* Circuit */}

      <div
        className="fixed inset-0 pointer-events-none overflow-hidden"
        style={{
          zIndex: 1,
        }}
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

          {/* Header */}

          <div
            className="text-center mb-6"
            style={fadeIn(0.25)}
          >
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
                            (
                              previous
                            ) =>
                              !previous
                          )
                        }
                        className="px-4 flex items-center"
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
                          (
                            previous
                          ) =>
                            !previous
                        )
                      }
                      className="px-4 flex items-center"
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

                <label
                  className="flex items-start gap-3 cursor-pointer group mt-1"
                  style={{
                    fontFamily:
                      "'Rajdhani', sans-serif",
                  }}
                >
                  <button
                    type="button"
                    onClick={
                      handleTermsToggle
                    }
                    aria-pressed={
                      agreed
                    }
                    className="mt-0.5 w-4 h-4 rounded flex-shrink-0 flex items-center justify-center"
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
                  </button>

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

                <button
                  type="submit"
                  disabled={
                    loading ||
                    isLoading
                  }
                  className="w-full rounded-xl py-3.5 font-bold text-sm tracking-widest transition-all duration-300 mt-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{
                    background:
                      loading ||
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
                  {loading ||
                  isLoading
                    ? "CREATING ACCOUNT..."
                    : "CONTINUE"}
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

              {/* Google */}

              <div
                className="w-full"
                style={fadeIn(0.55)}
              >
                <div
                  className="w-full rounded-xl overflow-hidden"
                  style={{
                    opacity:
                      googleLoading ||
                      loading ||
                      isLoading
                        ? 0.6
                        : 1,

                    pointerEvents:
                      googleLoading ||
                      loading ||
                      isLoading
                        ? "none"
                        : "auto",
                  }}
                >
                  <GoogleLogin
                    onSuccess={
                      handleGoogleSuccess
                    }
                    onError={
                      handleGoogleError
                    }
                    useOneTap={false}
                    shape="rectangular"
                    size="large"
                    width="100%"
                    text="continue_with"
                    logo_alignment="center"
                    auto_select={false}
                    cancel_on_tap_outside={
                      true
                    }
                  />
                </div>

                {googleLoading && (
                  <p
                    className="text-center text-xs mt-2"
                    style={{
                      color:
                        "rgba(150,180,255,0.55)",

                      fontFamily:
                        "'Rajdhani', sans-serif",
                    }}
                  >
                    Verifying your Google
                    account...
                  </p>
                )}
              </div>
            </>
          )}

          {/* ==================================================
              STEP 2
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
                  emailOtp.length !==
                    6
                }
                className="w-full rounded-xl py-3.5 font-bold text-sm tracking-widest cursor-pointer disabled:cursor-not-allowed"
                style={{
                  background:
                    loading ||
                    isLoading ||
                    emailOtp.length !==
                      6
                      ? "rgba(0,100,200,0.35)"
                      : "linear-gradient(135deg, #0066ff 0%, #0099ff 50%, #00c8ff 100%)",

                  color: "#fff",

                  fontFamily:
                    "'Orbitron', sans-serif",
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
                onClick={goBack}
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
              STEP 3
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
                    isResumingPhoneVerification
                      ? "rgba(245,158,11,0.07)"
                      : isGoogleRegistration
                      ? "rgba(0,180,255,0.05)"
                      : "rgba(34,197,94,0.05)",

                  border:
                    isResumingPhoneVerification
                      ? "1px solid rgba(245,158,11,0.18)"
                      : isGoogleRegistration
                      ? "1px solid rgba(0,180,255,0.12)"
                      : "1px solid rgba(34,197,94,0.12)",
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
                  {isResumingPhoneVerification ? (
                    <>
                      <strong
                        className="block mb-1"
                        style={{
                          color:
                            "#fbbf24",
                        }}
                      >
                        Complete your phone
                        verification
                      </strong>

                      Your account already
                      exists and your email
                      has been verified. Add
                      your phone number to
                      continue to your
                      dashboard.
                    </>
                  ) : isGoogleRegistration ? (
                    <>
                      Your Google account has
                      been verified
                      successfully. Now add
                      your Nigerian phone
                      number. We will send you
                      a verification code to
                      secure your account.
                    </>
                  ) : (
                    <>
                      Your email is verified.
                      Now add your Nigerian
                      phone number. We will
                      send you a verification
                      code to secure your
                      account and prevent
                      fake registrations.
                    </>
                  )}
                </p>
              </div>

              {form.email && (
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
                    Account
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
                onChange={(event) => {
                  setPhone(
                    event.target.value
                  );
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
                className="w-full rounded-xl py-3.5 font-bold text-sm tracking-widest cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
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

              {!isGoogleRegistration &&
                !isResumingPhoneVerification && (
                  <button
                    type="button"
                    onClick={goBack}
                    className="w-full text-xs cursor-pointer"
                    style={{
                      color:
                        "rgba(150,180,255,0.5)",

                      fontFamily:
                        "'Rajdhani', sans-serif",
                    }}
                  >
                    ← Back to email
                    verification
                  </button>
                )}

              {isResumingPhoneVerification && (
                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      "/login",
                      {
                        replace: true,
                      }
                    )
                  }
                  className="w-full text-xs cursor-pointer"
                  style={{
                    color:
                      "rgba(150,180,255,0.5)",

                    fontFamily:
                      "'Rajdhani', sans-serif",
                  }}
                >
                  ← Back to login
                </button>
              )}
            </div>
          )}

          {/* ==================================================
              STEP 4
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
                  phoneOtp.length !==
                    6
                }
                className="w-full rounded-xl py-3.5 font-bold text-sm tracking-widest cursor-pointer disabled:cursor-not-allowed"
                style={{
                  background:
                    loading ||
                    isLoading ||
                    phoneOtp.length !==
                      6
                      ? "rgba(0,100,200,0.35)"
                      : "linear-gradient(135deg, #0066ff 0%, #0099ff 50%, #00c8ff 100%)",

                  color: "#fff",

                  fontFamily:
                    "'Orbitron', sans-serif",
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
                onClick={goBack}
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

          {/* LOGIN */}

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
              className="font-bold cursor-pointer"
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

          <div
            className="absolute bottom-0 left-0 right-0 h-px"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(0,150,255,0.3), transparent)",
            }}
          />
        </div>
      </div>

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

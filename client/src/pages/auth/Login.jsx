import { useEffect, useRef, useState } from "react";

import { useLocation, useNavigate } from "react-router-dom";

import { toast } from "react-hot-toast";

import { GoogleLogin } from "@react-oauth/google";

import useAuthStore from "../../store/authStore";

/* ============================================================
   DEBUG LOGGER
   ============================================================ */

const DEBUG_PREFIX = "[DEVAD LOGIN]";

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
 *
 * Never log:
 * - passwords
 * - OTP codes
 * - access tokens
 * - refresh tokens
 * - Google credentials
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

      particles.forEach((particle, index) => {
        particles.slice(index + 1).forEach((other) => {
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

        {rightSlot}
      </div>
    </div>
  );
}

/* ============================================================
   ICONS
   ============================================================ */

const ICONS = {
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
   LOGIN PAGE
   ============================================================ */

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    login,
    googleLogin,
    isLoading,
  } = useAuthStore();

  /* ==========================================================
     FORM
     ========================================================== */

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  /* ==========================================================
     UI STATE
     ========================================================== */

  const [showPassword, setShowPassword] =
    useState(false);

  const [rememberMe, setRememberMe] =
    useState(true);

  const [focusedField, setFocusedField] =
    useState(null);

  const [mounted, setMounted] =
    useState(false);

  const [googleLoading, setGoogleLoading] =
    useState(false);

  const [loginLoading, setLoginLoading] =
    useState(false);

  /* ==========================================================
     REGISTRATION SUCCESS MESSAGE
     ========================================================== */

  useEffect(() => {
    const registered =
      location.state?.registered;

    const email =
      location.state?.email;

    if (!registered) {
      return;
    }

    logInfo(
      "Registration completed. Preparing login page.",
      {
        email: email || null,
      }
    );

    toast.success(
      "Registration completed successfully. Please log in."
    );

    if (email) {
      setForm((previous) => ({
        ...previous,
        email,
      }));
    }

    navigate(location.pathname, {
      replace: true,
      state: {},
    });
  }, [location, navigate]);

  /* ==========================================================
     MOUNT
     ========================================================== */

  useEffect(() => {
    log("LoginPage mounted.");

    const timer = setTimeout(() => {
      setMounted(true);
    }, 100);

    return () => {
      clearTimeout(timer);
      log("LoginPage unmounted.");
    };
  }, []);

  /* ==========================================================
     AUTH LOADING LOGGER
     ========================================================== */

  useEffect(() => {
    logInfo(
      "Auth store loading state changed.",
      isLoading
    );
  }, [isLoading]);

  /* ==========================================================
     FORM SETTER
     ========================================================== */

  const handleChange =
    (field) => (event) => {
      const value =
        event.target.value;

      setForm((previous) => ({
        ...previous,
        [field]: value,
      }));

      if (field === "password") {
        log(
          "Password field changed.",
          {
            length: value.length,
          }
        );
      } else {
        log(
          "Email field changed.",
          {
            value,
          }
        );
      }
    };

  /* ==========================================================
     ROLE REDIRECT
     ========================================================== */

  const redirectByRole = (user) => {
    const role = user?.role;

    logInfo(
      "Redirecting authenticated user.",
      {
        role,
        userId:
          user?._id ||
          user?.id ||
          null,
      }
    );

    if (role === "super_admin") {
      navigate(
        "/admin/dashboard",
        {
          replace: true,
        }
      );

      return;
    }

    if (role === "instructor") {
      navigate(
        "/instructor/dashboard",
        {
          replace: true,
        }
      );

      return;
    }

    navigate(
      "/student/dashboard",
      {
        replace: true,
      }
    );
  };

  /* ==========================================================
     VALIDATE LOGIN
     ========================================================== */

  const validateLogin = () => {
    const email =
      form.email.trim().toLowerCase();

    const password =
      form.password;

    if (!email) {
      toast.error(
        "Please enter your email address."
      );

      return false;
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        email
      )
    ) {
      toast.error(
        "Please enter a valid email address."
      );

      return false;
    }

    if (!password) {
      toast.error(
        "Please enter your password."
      );

      return false;
    }

    return true;
  };

  /* ==========================================================
     EXTRACT AUTH RESPONSE
     ========================================================== */

  /*
   * Backend login response:
   *
   * {
   *   success: true,
   *   message: "Phone verification required.",
   *   data: {
   *     requiresPhone: true,
   *     registrationToken: "...",
   *     user: {...}
   *   }
   * }
   *
   * Normal login:
   *
   * {
   *   success: true,
   *   data: {
   *     accessToken: "...",
   *     user: {...}
   *   }
   * }
   */

  const getAuthResponseData = (
    response
  ) => {
    const outer =
      response || {};

    const data =
      outer?.data || {};

    const nestedData =
      data?.data || {};

    const user =
      data?.user ||
      nestedData?.user ||
      outer?.user ||
      null;

    const accessToken =
      data?.accessToken ||
      nestedData?.accessToken ||
      outer?.accessToken ||
      null;

    const registrationToken =
      data?.registrationToken ||
      nestedData?.registrationToken ||
      outer?.registrationToken ||
      "";

    const requiresPhone =
      data?.requiresPhone === true ||
      nestedData?.requiresPhone === true ||
      outer?.requiresPhone === true ||
      user?.isPhoneVerified === false;

    return {
      user,
      accessToken,
      registrationToken,
      requiresPhone,
    };
  };

  /* ==========================================================
     GO TO PHONE VERIFICATION
     ========================================================== */

  const continueToPhoneVerification = ({
    registrationToken,
    user,
    email,
  }) => {
    if (!registrationToken) {
      logError(
        "Phone verification is required but no registration token was returned."
      );

      toast.error(
        "Phone verification is required, but your verification session could not be created. Please try logging in again."
      );

      return false;
    }

    const verificationEmail =
      user?.email ||
      email ||
      form.email
        .trim()
        .toLowerCase();

    logInfo(
      "Redirecting user to phone verification.",
      {
        email: verificationEmail,
        hasRegistrationToken:
          Boolean(registrationToken),
        phoneVerified:
          user?.isPhoneVerified,
      }
    );

    toast(
      "Your email is verified. Please complete phone verification."
    );

    /*
     * IMPORTANT:
     *
     * This is NOT a new registration.
     *
     * Register.jsx receives:
     *
     * resumePhoneVerification: true
     *
     * and opens directly at STEP 3.
     */

    navigate(
      "/register",
      {
        replace: true,

        state: {
          resumePhoneVerification: true,

          registrationToken,

          email: verificationEmail,

          firstName:
            user?.firstName || "",

          lastName:
            user?.lastName || "",

          user,
        },
      }
    );

    return true;
  };

  /* ==========================================================
     NORMAL LOGIN
     ========================================================== */

  const handleLogin =
    async (event) => {
      event.preventDefault();

      if (!validateLogin()) {
        return;
      }

      try {
        setLoginLoading(true);

        const email =
          form.email
            .trim()
            .toLowerCase();

        logInfo(
          "Calling authStore.login().",
          {
            email,
            passwordLength:
              form.password.length,
          }
        );

        /*
         * authStore.login() must return:
         *
         * NORMAL:
         * {
         *   requiresPhone: false,
         *   user,
         *   accessToken
         * }
         *
         * PHONE REQUIRED:
         * {
         *   requiresPhone: true,
         *   registrationToken,
         *   user
         * }
         */

        const response =
          await login({
            email,
            password:
              form.password,
          });

        const authData =
          getAuthResponseData(
            response
          );

        logInfo(
          "Login response received.",
          {
            success:
              response?.success ??
              null,

            requiresPhone:
              authData.requiresPhone,

            hasAccessToken:
              Boolean(
                authData.accessToken
              ),

            hasRegistrationToken:
              Boolean(
                authData.registrationToken
              ),

            email:
              authData.user?.email ||
              email,

            phoneVerified:
              authData.user
                ?.isPhoneVerified ??
              null,
          }
        );

        /* ======================================================
           PHONE VERIFICATION REQUIRED
           ====================================================== */

        if (
          authData.requiresPhone
        ) {
          logInfo(
            "Email authentication succeeded but phone verification is required."
          );

          /*
           * DO NOT:
           *
           * - send to dashboard
           * - set normal authenticated state
           * - restart registration
           *
           * Instead:
           *
           * /register
           * → STEP 3
           */

          const redirected =
            continueToPhoneVerification({
              registrationToken:
                authData.registrationToken,

              user:
                authData.user,

              email,
            });

          if (!redirected) {
            logWarn(
              "Could not continue to phone verification."
            );
          }

          return;
        }

        /* ======================================================
           NORMAL LOGIN SUCCESS
           ====================================================== */

        const currentState =
          useAuthStore.getState();

        const user =
          authData.user ||
          currentState.user ||
          null;

        if (!user) {
          logWarn(
            "Login succeeded but no authenticated user was found."
          );

          throw new Error(
            "Login succeeded, but your account information could not be loaded."
          );
        }

        /*
         * Extra safety:
         *
         * Never allow dashboard access from
         * this page if phone verification is
         * somehow still false.
         */

        if (
          user.isPhoneVerified === false
        ) {
          logWarn(
            "User returned from login without phone verification. Redirecting to phone verification."
          );

          const redirected =
            continueToPhoneVerification({
              registrationToken:
                authData.registrationToken,

              user,

              email,
            });

          if (!redirected) {
            toast.error(
              "Phone verification is required before you can access your dashboard."
            );
          }

          return;
        }

        toast.success(
          "Welcome back!"
        );

        redirectByRole(user);
      } catch (error) {
        logError(
          "Login failed.",
          sanitizeError(error)
        );

        /* ======================================================
           HANDLE PHONE VERIFICATION ERROR RESPONSE
           ====================================================== */

        const errorData =
          error?.response?.data ||
          null;

        const errorAuthData =
          getAuthResponseData(
            errorData
          );

        if (
          errorAuthData.requiresPhone &&
          errorAuthData.registrationToken
        ) {
          logInfo(
            "Phone verification required from login error response."
          );

          const email =
            form.email
              .trim()
              .toLowerCase();

          continueToPhoneVerification({
            registrationToken:
              errorAuthData.registrationToken,

            user:
              errorAuthData.user,

            email,
          });

          return;
        }

        /* ======================================================
           EMAIL VERIFICATION REQUIRED
           ====================================================== */

        const verificationRequired =
          errorData
            ?.data
            ?.verificationRequired ||
          errorData
            ?.verificationRequired;

        if (
          verificationRequired ===
          "email"
        ) {
          logInfo(
            "Login blocked because email verification is required."
          );

          toast.error(
            errorData?.message ||
              "Please verify your email address before logging in."
          );

          return;
        }

        /* ======================================================
           NORMAL ERROR
           ====================================================== */

        const message =
          errorData?.message ||
          error?.message ||
          "Login failed. Please check your credentials and try again.";

        toast.error(message);
      } finally {
        setLoginLoading(false);
      }
    };

  /* ==========================================================
     GOOGLE LOGIN
     ========================================================== */

  const handleGoogleSuccess =
    async (credentialResponse) => {
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

        /*
         * NEVER log the Google credential.
         */

        logInfo(
          "Google credential received. Sending it to authStore.googleLogin()."
        );

        const response =
          await googleLogin(
            credential
          );

        const authData =
          getAuthResponseData(
            response
          );

        logInfo(
          "Google authentication response received.",
          {
            success:
              response?.success ??
              null,

            requiresPhone:
              authData.requiresPhone,

            hasAccessToken:
              Boolean(
                authData.accessToken
              ),

            hasRegistrationToken:
              Boolean(
                authData.registrationToken
              ),

            email:
              authData.user
                ?.email ||
              null,

            phoneVerified:
              authData.user
                ?.isPhoneVerified ??
              null,
          }
        );

        /* ======================================================
           GOOGLE ACCOUNT REQUIRES PHONE
           ====================================================== */

        if (
          authData.requiresPhone
        ) {
          logInfo(
            "Google authentication succeeded but phone verification is required."
          );

          const redirected =
            continueToPhoneVerification({
              registrationToken:
                authData.registrationToken,

              user:
                authData.user,

              email:
                authData.user
                  ?.email ||
                "",
            });

          if (!redirected) {
            logWarn(
              "Google phone verification redirect could not be completed."
            );
          }

          return;
        }

        /* ======================================================
           GOOGLE LOGIN SUCCESS
           ====================================================== */

        const currentState =
          useAuthStore.getState();

        const user =
          authData.user ||
          currentState.user ||
          null;

        if (!user) {
          throw new Error(
            "Google login succeeded, but your account information could not be loaded."
          );
        }

        /*
         * Extra safety:
         *
         * A Google account with an unverified
         * phone must never enter the dashboard.
         */

        if (
          user.isPhoneVerified === false
        ) {
          logWarn(
            "Google account has not verified its phone."
          );

          const redirected =
            continueToPhoneVerification({
              registrationToken:
                authData.registrationToken,

              user,

              email:
                user?.email ||
                "",
            });

          if (!redirected) {
            toast.error(
              "Phone verification is required before you can access your dashboard."
            );
          }

          return;
        }

        toast.success(
          "Google sign-in successful."
        );

        redirectByRole(user);
      } catch (error) {
        logError(
          "Google authentication failed.",
          sanitizeError(error)
        );

        /* ======================================================
           GOOGLE ERROR RESPONSE
           ====================================================== */

        const errorData =
          error?.response?.data ||
          null;

        const errorAuthData =
          getAuthResponseData(
            errorData
          );

        if (
          errorAuthData.requiresPhone &&
          errorAuthData.registrationToken
        ) {
          logInfo(
            "Phone verification required from Google authentication error response."
          );

          continueToPhoneVerification({
            registrationToken:
              errorAuthData.registrationToken,

            user:
              errorAuthData.user,

            email:
              errorAuthData.user
                ?.email ||
              "",
          });

          return;
        }

        toast.error(
          errorData?.message ||
            error?.message ||
            "Google sign-in failed. Please try again."
        );
      } finally {
        setGoogleLoading(false);
      }
    };

  /* ==========================================================
     GOOGLE ERROR
     ========================================================== */

  const handleGoogleError = () => {
    logWarn(
      "Google authentication was cancelled or failed."
    );

    toast.error(
      "Google sign-in was cancelled or failed. Please try again."
    );
  };

  /* ==========================================================
     FORGOT PASSWORD
     ========================================================== */

  const handleForgotPassword =
    () => {
      log(
        "Navigating to forgot password."
      );

      navigate(
        "/forgot-password"
      );
    };

  /* ==========================================================
     REGISTER
     ========================================================== */

  const handleRegister =
    () => {
      log(
        "Navigating to registration."
      );

      navigate("/register");
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

  const submitting =
    loginLoading ||
    googleLoading ||
    isLoading;

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
              Welcome Back
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
              Sign in to continue your learning journey
            </p>
          </div>

          {/* ==================================================
              LOGIN FORM
              ================================================== */}

          <form
            onSubmit={handleLogin}
            className="space-y-4"
            style={fadeIn(0.35)}
          >
            <InputField
              id="email"
              type="email"
              placeholder="Email address"
              value={form.email}
              onChange={handleChange(
                "email"
              )}
              focusedField={
                focusedField
              }
              setFocusedField={
                setFocusedField
              }
              icon={ICONS.email}
              autoComplete="email"
            />

            <InputField
              id="password"
              type={
                showPassword
                  ? "text"
                  : "password"
              }
              placeholder="Password"
              value={form.password}
              onChange={handleChange(
                "password"
              )}
              focusedField={
                focusedField
              }
              setFocusedField={
                setFocusedField
              }
              icon={ICONS.lock}
              autoComplete="current-password"
              rightSlot={
                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      (previous) =>
                        !previous
                    )
                  }
                  className="px-4 flex items-center cursor-pointer"
                  style={{
                    color:
                      showPassword
                        ? "#38bdf8"
                        : "rgba(150,180,255,0.5)",
                  }}
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  <EyeIcon
                    open={
                      showPassword
                    }
                  />
                </button>
              }
            />

            {/* ==================================================
                OPTIONS
                ================================================== */}

            <div className="flex items-center justify-between px-1">
              <button
                type="button"
                onClick={() =>
                  setRememberMe(
                    (previous) =>
                      !previous
                  )
                }
                className="flex items-center gap-2 cursor-pointer"
              >
                <span
                  className="w-4 h-4 rounded flex items-center justify-center"
                  style={{
                    background:
                      rememberMe
                        ? "linear-gradient(135deg, #0066ff, #00c8ff)"
                        : "rgba(255,255,255,0.04)",

                    border: `1px solid ${
                      rememberMe
                        ? "rgba(0,180,255,0.8)"
                        : "rgba(100,150,255,0.25)"
                    }`,
                  }}
                >
                  {rememberMe && (
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
                </span>

                <span
                  className="text-xs"
                  style={{
                    color:
                      "rgba(150,180,255,0.6)",

                    fontFamily:
                      "'Rajdhani', sans-serif",
                  }}
                >
                  Remember me
                </span>
              </button>

              <button
                type="button"
                onClick={
                  handleForgotPassword
                }
                className="text-xs font-semibold cursor-pointer"
                style={{
                  color:
                    "#38bdf8",

                  fontFamily:
                    "'Rajdhani', sans-serif",
                }}
              >
                Forgot password?
              </button>
            </div>

            {/* ==================================================
                LOGIN BUTTON
                ================================================== */}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl py-3.5 font-bold text-sm tracking-widest transition-all duration-300 mt-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              style={{
                background:
                  submitting
                    ? "rgba(0,100,200,0.5)"
                    : "linear-gradient(135deg, #0066ff 0%, #0099ff 50%, #00c8ff 100%)",

                color: "#fff",

                fontFamily:
                  "'Orbitron', 'Rajdhani', sans-serif",

                boxShadow:
                  "0 0 30px rgba(0,150,255,0.4), 0 4px 15px rgba(0,100,255,0.3)",
              }}
            >
              {loginLoading ||
              isLoading
                ? "SIGNING IN..."
                : "SIGN IN"}
            </button>
          </form>

          {/* ==================================================
              DIVIDER
              ================================================== */}

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
              GOOGLE LOGIN
              ================================================== */}

          <div
            className="w-full"
            style={fadeIn(0.55)}
          >
            <div
              className="w-full rounded-xl overflow-hidden"
              style={{
                opacity:
                  submitting ? 0.6 : 1,

                pointerEvents:
                  submitting
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
                Verifying your Google account...
              </p>
            )}
          </div>

          {/* ==================================================
              REGISTER
              ================================================== */}

          <p
            className="text-center text-sm mt-7"
            style={{
              color:
                "rgba(150,180,255,0.55)",

              fontFamily:
                "'Rajdhani', sans-serif",
            }}
          >
            Don't have an account?{" "}

            <button
              type="button"
              onClick={
                handleRegister
              }
              className="font-bold cursor-pointer"
              style={{
                color:
                  "#38bdf8",

                fontFamily:
                  "'Orbitron', sans-serif",

                fontSize: "12px",
              }}
            >
              Create Account
            </button>
          </p>

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

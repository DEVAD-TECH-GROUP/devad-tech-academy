import {
  useState,
  useEffect,
  useRef,
} from "react";

import {
  useNavigate,
  useLocation,
} from "react-router-dom";

import { toast } from "react-hot-toast";

import useAuthStore from "../../store/authStore";

import { GoogleLogin } from "@react-oauth/google";

// Keep your existing UI/component imports below this point.
// If these components already exist in your original Register.jsx,
// keep their exact import paths.
// Example:
// import Particles from "../../components/auth/Particles";
// import CircuitLines from "../../components/auth/CircuitLines";
// import ResponseModal from "../../components/common/ResponseModal";


// ================================================================
// REGISTER PAGE
// ================================================================

const RegisterPage = () => {
  // ==============================================================
  // ROUTER
  // ==============================================================

  const navigate = useNavigate();
  const location = useLocation();

  // ==============================================================
  // AUTH STORE
  // ==============================================================

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

  // ==============================================================
  // GENERAL UI STATE
  // ==============================================================

  const [mounted, setMounted] =
    useState(false);

  const [step, setStep] =
    useState(1);

  const [isGoogleRegistration, setIsGoogleRegistration] =
    useState(false);

  // ==============================================================
  // LOGIN → PHONE VERIFICATION RESUME FLOW
  // ==============================================================
  //
  // TRUE means:
  //
  // The user already has an account.
  //
  // Their email/password login succeeded.
  //
  // Their phone is not verified.
  //
  // Therefore:
  //
  // DO NOT restart registration.
  //
  // Start directly at Step 3.
  //
  // ==============================================================

  const [
    isResumingPhoneVerification,
    setIsResumingPhoneVerification,
  ] = useState(false);

  // ==============================================================
  // FORM
  // ==============================================================

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // ==============================================================
  // EMAIL OTP
  // ==============================================================

  const [emailOtp, setEmailOtp] =
    useState("");

  // ==============================================================
  // PHONE
  // ==============================================================

  const [phone, setPhone] =
    useState("");

  const [phoneOtp, setPhoneOtp] =
    useState("");

  // ==============================================================
  // REGISTRATION SESSION
  // ==============================================================

  const [
    registrationToken,
    setRegistrationToken,
  ] = useState("");

  const [
    phoneOtpId,
    setPhoneOtpId,
  ] = useState("");

  // ==============================================================
  // LOADING STATES
  // ==============================================================

  const [
    phoneSendLoading,
    setPhoneSendLoading,
  ] = useState(false);

  const [
    phoneVerifyLoading,
    setPhoneVerifyLoading,
  ] = useState(false);

  const [
    emailVerifyLoading,
    setEmailVerifyLoading,
  ] = useState(false);

  const [
    resendEmailLoading,
    setResendEmailLoading,
  ] = useState(false);

  const [
    googleLoading,
    setGoogleLoading,
  ] = useState(false);

  // ==============================================================
  // REFS
  // ==============================================================

  const emailOtpInputRef =
    useRef(null);

  const phoneOtpInputRef =
    useRef(null);

  // ==============================================================
  // LOGGER
  // ==============================================================

  const logInfo = (
    message,
    data = {}
  ) => {
    console.log(
      `[DEVAD REGISTER] ${message}`,
      data
    );
  };

  // ==============================================================
  // MOUNT
  // ==============================================================

  useEffect(() => {
    logInfo("RegisterPage mounted.");

    const timer = setTimeout(() => {
      setMounted(true);
    }, 100);

    return () => {
      clearTimeout(timer);

      logInfo(
        "RegisterPage unmounted."
      );
    };
  }, []);

  // ==============================================================
  // RESUME PHONE VERIFICATION
  // ==============================================================
  //
  // This is the important new part.
  //
  // Login.jsx navigates here with:
  //
  // navigate("/register", {
  //   replace: true,
  //   state: {
  //     resumePhoneVerification: true,
  //     registrationToken,
  //     email,
  //     firstName,
  //     lastName,
  //     user,
  //   },
  // });
  //
  // We then:
  //
  // 1. Restore the existing registration token.
  // 2. Restore existing user information.
  // 3. Mark this as a resume flow.
  // 4. Open Step 3 directly.
  //
  // ==============================================================

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

    // ------------------------------------------------------------
    // RESTORE REGISTRATION TOKEN
    // ------------------------------------------------------------

    if (
      state.registrationToken
    ) {
      setRegistrationToken(
        state.registrationToken
      );
    }

    // ------------------------------------------------------------
    // RESTORE USER INFORMATION
    // ------------------------------------------------------------

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

    // ------------------------------------------------------------
    // THIS IS NOT GOOGLE REGISTRATION
    // ------------------------------------------------------------

    setIsGoogleRegistration(
      false
    );

    // ------------------------------------------------------------
    // MARK AS RESUME FLOW
    // ------------------------------------------------------------

    setIsResumingPhoneVerification(
      true
    );

    // ------------------------------------------------------------
    // OPEN DIRECTLY AT PHONE STEP
    // ------------------------------------------------------------

    setStep(3);

    // ------------------------------------------------------------
    // SCROLL TO TOP
    // ------------------------------------------------------------

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

    // ------------------------------------------------------------
    // CLEAR NAVIGATION STATE
    //
    // This prevents the flow from being triggered again
    // after a refresh/navigation.
    // ------------------------------------------------------------

    navigate("/register", {
      replace: true,
      state: {},
    });
  }, [
    location,
    navigate,
  ]);

  // ==============================================================
  // FORM HANDLER
  // ==============================================================

  const handleChange = (
    event
  ) => {
    const {
      name,
      value,
    } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ==============================================================
  // PHONE CHANGE
  // ==============================================================

  const handlePhoneChange = (
    event
  ) => {
    let value =
      event.target.value;

    // Keep numbers, spaces, +, -, and parentheses.
    value =
      value.replace(
        /[^\d+\s()-]/g,
        ""
      );

    setPhone(value);
  };

  // ==============================================================
  // PHONE OTP CHANGE
  // ==============================================================

  const handlePhoneOtpChange = (
    event
  ) => {
    const value =
      event.target.value
        .replace(/\D/g, "")
        .slice(0, 6);

    setPhoneOtp(value);
  };

  // ==============================================================
  // EMAIL OTP CHANGE
  // ==============================================================

  const handleEmailOtpChange = (
    event
  ) => {
    const value =
      event.target.value
        .replace(/\D/g, "")
        .slice(0, 6);

    setEmailOtp(value);
  };

  // ==============================================================
  // VALIDATE BASIC REGISTRATION
  // ==============================================================

  const validateAccountForm = () => {
    const firstName =
      form.firstName.trim();

    const lastName =
      form.lastName.trim();

    const email =
      form.email
        .trim()
        .toLowerCase();

    const password =
      form.password;

    const confirmPassword =
      form.confirmPassword;

    if (!firstName) {
      toast.error(
        "First name is required."
      );

      return false;
    }

    if (!lastName) {
      toast.error(
        "Last name is required."
      );

      return false;
    }

    if (!email) {
      toast.error(
        "Email is required."
      );

      return false;
    }

    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (
      !emailPattern.test(email)
    ) {
      toast.error(
        "Please enter a valid email address."
      );

      return false;
    }

    if (!password) {
      toast.error(
        "Password is required."
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
      password !==
      confirmPassword
    ) {
      toast.error(
        "Passwords do not match."
      );

      return false;
    }

    return true;
  };

  // ==============================================================
  // VALIDATE PHONE
  // ==============================================================

  const validatePhone = () => {
    const cleanPhone =
      phone.trim();

    if (!cleanPhone) {
      toast.error(
        "Phone number is required."
      );

      return false;
    }

    // Nigerian phone numbers.
    //
    // Accept:
    // 08012345678
    // +2348012345678
    // 2348012345678
    //
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

  // ==============================================================
  // CREATE ACCOUNT
  // ==============================================================

  const handleCreateAccount =
    async () => {
      if (
        !validateAccountForm()
      ) {
        return;
      }

      try {
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

          confirmPassword:
            form.confirmPassword,
        };

        logInfo(
          "Creating account.",
          {
            email:
              payload.email,
          }
        );

        const response =
          await register(
            payload
          );

        // --------------------------------------------------------
        // NORMAL REGISTRATION
        // --------------------------------------------------------

        setIsResumingPhoneVerification(
          false
        );

        setIsGoogleRegistration(
          false
        );

        toast.success(
          "Account created. Check your email for the verification code."
        );

        setStep(2);

        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });

        logInfo(
          "Account registration request completed."
        );

        return response;
      } catch (error) {
        console.error(
          "[DEVAD REGISTER] Account creation failed:",
          error
        );
      }
    };

  // ==============================================================
  // EXTRACT EMAIL VERIFICATION DATA
  // ==============================================================

  const extractRegistrationToken =
    (response) => {
      const root =
        response?.data ||
        response ||
        {};

      const nested =
        root?.data || {};

      return (
        root?.registrationToken ||
        nested?.registrationToken ||
        root?.token ||
        nested?.token ||
        ""
      );
    };

  // ==============================================================
  // VERIFY EMAIL
  // ==============================================================

  const handleVerifyEmail =
    async () => {
      const code =
        emailOtp.trim();

      if (
        !/^\d{6}$/.test(code)
      ) {
        toast.error(
          "Enter the 6-digit verification code."
        );

        return;
      }

      const email =
        form.email
          .trim()
          .toLowerCase();

      if (!email) {
        toast.error(
          "Email is missing."
        );

        return;
      }

      try {
        setEmailVerifyLoading(
          true
        );

        logInfo(
          "Verifying email.",
          {
            email,
          }
        );

        const response =
          await verifyEmail(
            email,
            code
          );

        const token =
          extractRegistrationToken(
            response
          );

        if (!token) {
          throw new Error(
            "Email verification succeeded but no registration session was returned."
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

        setStep(3);

        setEmailOtp("");

        toast.success(
          "Email verified successfully."
        );

        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });

        logInfo(
          "Email verification completed."
        );
      } catch (error) {
        console.error(
          "[DEVAD REGISTER] Email verification failed:",
          error
        );
      } finally {
        setEmailVerifyLoading(
          false
        );
      }
    };

  // ==============================================================
  // RESEND EMAIL VERIFICATION
  // ==============================================================

  const handleResendEmail =
    async () => {
      const email =
        form.email
          .trim()
          .toLowerCase();

      if (!email) {
        toast.error(
          "Email is missing."
        );

        return;
      }

      try {
        setResendEmailLoading(
          true
        );

        await resendVerification(
          email
        );

        toast.success(
          "A new verification code has been sent."
        );

        logInfo(
          "Email verification code resent.",
          {
            email,
          }
        );
      } catch (error) {
        console.error(
          "[DEVAD REGISTER] Resend email verification failed:",
          error
        );
      } finally {
        setResendEmailLoading(
          false
        );
      }
    };

  // ==============================================================
  // SEND PHONE OTP
  // ==============================================================

  const handleSendPhoneOTP =
    async () => {
      if (!validatePhone()) {
        return;
      }

      // ------------------------------------------------------------
      // REGISTRATION TOKEN REQUIRED
      // ------------------------------------------------------------

      if (!registrationToken) {
        toast.error(
          "Your verification session has expired. Please restart the verification process."
        );

        // IMPORTANT:
        //
        // If this is a login-resume flow, we cannot continue
        // without the existing registration token.
        //
        // Send them back to login instead of pretending that
        // a new registration should begin.
        //

        if (
          isResumingPhoneVerification
        ) {
          navigate(
            "/login",
            {
              replace: true,
            }
          );

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
              form.email ||
              null,
            isResumeFlow:
              isResumingPhoneVerification,
            isGoogleRegistration,
          }
        );

        // --------------------------------------------------------
        // SAVE PHONE
        // --------------------------------------------------------

        await updateRegistrationPhone(
          registrationToken,
          cleanPhone
        );

        // --------------------------------------------------------
        // SEND OTP
        // --------------------------------------------------------

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
        console.error(
          "[DEVAD REGISTER] Phone OTP request failed:",
          error
        );
      } finally {
        setPhoneSendLoading(
          false
        );
      }
    };

  // ==============================================================
  // VERIFY PHONE
  // ==============================================================

  const handleVerifyPhone =
    async () => {
      const code =
        phoneOtp.trim();

      if (
        !/^\d{6}$/.test(code)
      ) {
        toast.error(
          "Enter the 6-digit phone verification code."
        );

        return;
      }

      if (!registrationToken) {
        toast.error(
          "Your verification session has expired."
        );

        navigate(
          "/login",
          {
            replace: true,
          }
        );

        return;
      }

      if (!phoneOtpId) {
        toast.error(
          "Your phone verification session is missing. Please request a new code."
        );

        setStep(3);

        return;
      }

      try {
        setPhoneVerifyLoading(
          true
        );

        logInfo(
          "Verifying phone number.",
          {
            email:
              form.email ||
              null,

            isResumeFlow:
              isResumingPhoneVerification,
          }
        );

        const response =
          await verifyPhone(
            registrationToken,
            phoneOtpId,
            code
          );

        toast.success(
          "Phone number verified successfully."
        );

        // --------------------------------------------------------
        // IF SERVER RETURNED ACCESS TOKEN
        //
        // verifyPhone() already saves the token into the store.
        //
        // This is the important path for:
        //
        // LOGIN → PHONE VERIFICATION → DASHBOARD
        //
        // --------------------------------------------------------

        const responseData =
          response?.data ||
          response ||
          {};

        const accessToken =
          responseData?.accessToken ||
          response?.accessToken ||
          localStorage.getItem(
            "accessToken"
          );

        const user =
          responseData?.user ||
          response?.user ||
          useAuthStore.getState()
            ?.user ||
          null;

        if (
          accessToken
        ) {
          logInfo(
            "Phone verification completed with authentication token."
          );

          // ------------------------------------------------------
          // DETERMINE DASHBOARD
          // ------------------------------------------------------

          const role =
            user?.role;

          if (
            role ===
            "super_admin"
          ) {
            navigate(
              "/admin/dashboard",
              {
                replace: true,
              }
            );

            return;
          }

          if (
            role ===
            "instructor"
          ) {
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

          return;
        }

        // --------------------------------------------------------
        // NO ACCESS TOKEN
        //
        // This is normal if the backend only verifies the phone
        // and expects a separate login.
        //
        // --------------------------------------------------------

        logInfo(
          "Phone verification completed without an access token."
        );

        // Normal registration can return to login.
        //
        // For resume flow, also return to login because the server
        // did not authenticate this session.
        //

        navigate(
          "/login",
          {
            replace: true,
            state: {
              phoneVerified: true,
              email:
                form.email
                  .trim()
                  .toLowerCase(),
            },
          }
        );
      } catch (error) {
        console.error(
          "[DEVAD REGISTER] Phone verification failed:",
          error
        );
      } finally {
        setPhoneVerifyLoading(
          false
        );
      }
    };

  // ==============================================================
  // RESEND PHONE OTP
  // ==============================================================

  const handleResendPhoneOTP =
    async () => {
      if (!registrationToken) {
        toast.error(
          "Your verification session has expired."
        );

        navigate(
          "/login",
          {
            replace: true,
          }
        );

        return;
      }

      try {
        setPhoneSendLoading(
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

        if (
          returnedOtpId
        ) {
          setPhoneOtpId(
            returnedOtpId
          );
        }

        setPhoneOtp("");

        toast.success(
          "A new phone verification code has been sent."
        );

        logInfo(
          "Phone verification OTP resent."
        );
      } catch (error) {
        console.error(
          "[DEVAD REGISTER] Resend phone OTP failed:",
          error
        );
      } finally {
        setPhoneSendLoading(
          false
        );
      }
    };

  // ==============================================================
  // CHANGE PHONE
  // ==============================================================

  const handleChangePhone =
    () => {
      setPhoneOtp("");

      setPhoneOtpId("");

      setStep(3);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    };

  // ==============================================================
  // GOOGLE RESPONSE EXTRACTION
  // ==============================================================

  const extractGoogleRegistrationData =
    (response) => {
      const root =
        response?.data ||
        response ||
        {};

      const nested =
        root?.data ||
        {};

      const user =
        root?.user ||
        nested?.user ||
        null;

      const registrationToken =
        root?.registrationToken ||
        nested?.registrationToken ||
        "";

      const email =
        root?.email ||
        nested?.email ||
        user?.email ||
        "";

      const firstName =
        root?.firstName ||
        nested?.firstName ||
        user?.firstName ||
        "";

      const lastName =
        root?.lastName ||
        nested?.lastName ||
        user?.lastName ||
        "";

      const requiresPhone =
        root?.requiresPhone ===
          true ||
        nested?.requiresPhone ===
          true ||
        Boolean(
          registrationToken
        ) ||
        user?.isPhoneVerified ===
          false;

      return {
        user,
        registrationToken,
        email,
        firstName,
        lastName,
        requiresPhone,
      };
    };

  // ==============================================================
  // GOOGLE SUCCESS
  // ==============================================================

  const handleGoogleSuccess =
    async (credentialResponse) => {
      const credential =
        credentialResponse?.credential;

      if (!credential) {
        toast.error(
          "Google authentication credential was not received."
        );

        return;
      }

      try {
        setGoogleLoading(
          true
        );

        logInfo(
          "Google registration/login started."
        );

        const response =
          await googleLogin(
            credential
          );

        const {
          user,
          registrationToken:
            googleRegistrationToken,
          email,
          firstName,
          lastName,
          requiresPhone,
        } =
          extractGoogleRegistrationData(
            response
          );

        // --------------------------------------------------------
        // GOOGLE ACCOUNT NEEDS PHONE
        // --------------------------------------------------------

        if (
          requiresPhone
        ) {
          if (
            !googleRegistrationToken
          ) {
            throw new Error(
              "Google authentication requires phone verification, but no registration session was returned."
            );
          }

          setRegistrationToken(
            googleRegistrationToken
          );

          setForm(
            (previous) => ({
              ...previous,

              firstName:
                firstName ||
                previous.firstName,

              lastName:
                lastName ||
                previous.lastName,

              email:
                email ||
                previous.email,
            })
          );

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

          logInfo(
            "Google account requires phone verification."
          );

          return;
        }

        // --------------------------------------------------------
        // GOOGLE LOGIN COMPLETED
        // --------------------------------------------------------

        const role =
          user?.role;

        toast.success(
          "Google authentication successful."
        );

        if (
          role ===
          "super_admin"
        ) {
          navigate(
            "/admin/dashboard",
            {
              replace: true,
            }
          );

          return;
        }

        if (
          role ===
          "instructor"
        ) {
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
      } catch (error) {
        console.error(
          "[DEVAD REGISTER] Google authentication failed:",
          error
        );
      } finally {
        setGoogleLoading(
          false
        );
      }
    };

  // ==============================================================
  // GOOGLE ERROR
  // ==============================================================

  const handleGoogleError =
    () => {
      console.error(
        "[DEVAD REGISTER] Google authentication failed."
      );

      toast.error(
        "Google authentication failed. Please try again."
      );

      setGoogleLoading(
        false
      );
    };

  // ==============================================================
  // BACK BUTTON
  // ==============================================================

  const goBack = () => {
    // ------------------------------------------------------------
    // STEP 2 → STEP 1
    // ------------------------------------------------------------

    if (step === 2) {
      setEmailOtp("");

      setStep(1);

      return;
    }

    // ------------------------------------------------------------
    // STEP 3
    // ------------------------------------------------------------

    if (step === 3) {
      // ----------------------------------------------------------
      // LOGIN RESUME FLOW
      //
      // NEVER return to email verification.
      //
      // The user's email is already verified.
      // ----------------------------------------------------------

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

      // ----------------------------------------------------------
      // GOOGLE REGISTRATION
      // ----------------------------------------------------------

      if (
        isGoogleRegistration
      ) {
        toast(
          "Your Google account has already been verified. Continue with phone verification.",
          {
            icon: "🔐",
          }
        );

        return;
      }

      // ----------------------------------------------------------
      // NORMAL REGISTRATION
      // ----------------------------------------------------------

      setPhone("");

      setStep(2);

      return;
    }

    // ------------------------------------------------------------
    // STEP 4 → STEP 3
    // ------------------------------------------------------------

    if (step === 4) {
      setPhoneOtp("");

      setPhoneOtpId("");

      setStep(3);
    }
  };

  // ==============================================================
  // STEP LABELS
  // ==============================================================

  const getStepTitle =
    () => {
      if (
        step === 1
      ) {
        return "Create Your Account";
      }

      if (
        step === 2
      ) {
        return "Verify Your Email";
      }

      if (
        step === 3
      ) {
        if (
          isResumingPhoneVerification
        ) {
          return "Complete Phone Verification";
        }

        if (
          isGoogleRegistration
        ) {
          return "Add Your Phone";
        }

        return "Add Your Phone";
      }

      if (
        step === 4
      ) {
        return "Verify Your Phone";
      }

      return "Create Your Account";
    };

  // ==============================================================
  // STEP DESCRIPTION
  // ==============================================================

  const getStepDescription =
    () => {
      if (
        step === 1
      ) {
        return "Create your Devad Tech Academy account.";
      }

      if (
        step === 2
      ) {
        return "Enter the verification code sent to your email.";
      }

      if (
        step === 3
      ) {
        if (
          isResumingPhoneVerification
        ) {
          return "Your email is already verified. Add your phone number to continue.";
        }

        if (
          isGoogleRegistration
        ) {
          return "Your Google account has been verified. Add your phone number to continue.";
        }

        return "Secure your account with phone verification.";
      }

      if (
        step === 4
      ) {
        return "Enter the verification code sent to your phone.";
      }

      return "";
    };

  // ==============================================================
  // RENDER
  // ==============================================================

  return (
    <div
      className={`min-h-screen bg-[#020617] text-white transition-opacity duration-700 ${
        mounted
          ? "opacity-100"
          : "opacity-0"
      }`}
    >
      {/* ========================================================
          BACKGROUND
      ======================================================== */}

      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(37,99,235,0.18),transparent_45%)]" />

        <div className="absolute inset-0 bg-[linear-gradient(rgba(30,64,175,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(30,64,175,0.04)_1px,transparent_1px)] bg-[size:50px_50px]" />
      </div>

      {/* ========================================================
          MAIN
      ======================================================== */}

      <main className="relative z-10 flex min-h-screen items-center justify-center px-4 py-12">
        <div className="w-full max-w-xl">

          {/* ====================================================
              HEADER
          ==================================================== */}

          <div className="mb-8 text-center">

            <div className="mb-5 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-blue-400/30 bg-blue-500/10 shadow-[0_0_40px_rgba(37,99,235,0.2)]">
                <span className="text-2xl font-black text-blue-400">
                  D
                </span>
              </div>
            </div>

            <h1 className="font-[Orbitron] text-2xl font-bold tracking-wider text-white sm:text-3xl">
              {getStepTitle()}
            </h1>

            <p className="mt-3 text-sm leading-6 text-slate-400">
              {getStepDescription()}
            </p>
          </div>

          {/* ====================================================
              STEP INDICATOR
          ==================================================== */}

          <div className="mb-8 flex items-center justify-center gap-2">

            {[1, 2, 3, 4].map(
              (item) => (
                <div
                  key={item}
                  className="flex items-center"
                >
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-full border text-xs font-bold transition-all duration-300 ${
                      step >= item
                        ? "border-blue-400 bg-blue-500/20 text-blue-300 shadow-[0_0_20px_rgba(37,99,235,0.25)]"
                        : "border-slate-700 bg-slate-900/50 text-slate-600"
                    }`}
                  >
                    {item}
                  </div>

                  {item < 4 && (
                    <div
                      className={`mx-2 h-px w-6 transition-all duration-300 sm:w-10 ${
                        step > item
                          ? "bg-blue-400"
                          : "bg-slate-700"
                      }`}
                    />
                  )}
                </div>
              )
            )}
          </div>

          {/* ====================================================
              CARD
          ==================================================== */}

          <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-5 shadow-2xl backdrop-blur-xl sm:p-8">

            {/* ==================================================
                STEP 1
            ================================================== */}

            {step === 1 && (
              <div className="space-y-5">

                <div className="grid gap-5 sm:grid-cols-2">

                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                      First Name
                    </label>

                    <input
                      type="text"
                      name="firstName"
                      value={
                        form.firstName
                      }
                      onChange={
                        handleChange
                      }
                      autoComplete="given-name"
                      placeholder="David"
                      className="w-full rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Last Name
                    </label>

                    <input
                      type="text"
                      name="lastName"
                      value={
                        form.lastName
                      }
                      onChange={
                        handleChange
                      }
                      autoComplete="family-name"
                      placeholder="Daniel"
                      className="w-full rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Email Address
                  </label>

                  <input
                    type="email"
                    name="email"
                    value={
                      form.email
                    }
                    onChange={
                      handleChange
                    }
                    autoComplete="email"
                    placeholder="you@example.com"
                    className="w-full rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Password
                  </label>

                  <input
                    type="password"
                    name="password"
                    value={
                      form.password
                    }
                    onChange={
                      handleChange
                    }
                    autoComplete="new-password"
                    placeholder="Create a strong password"
                    className="w-full rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Confirm Password
                  </label>

                  <input
                    type="password"
                    name="confirmPassword"
                    value={
                      form.confirmPassword
                    }
                    onChange={
                      handleChange
                    }
                    autoComplete="new-password"
                    placeholder="Repeat your password"
                    className="w-full rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <button
                  type="button"
                  onClick={
                    handleCreateAccount
                  }
                  disabled={
                    isLoading
                  }
                  className="w-full rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-bold tracking-wide text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isLoading
                    ? "CREATING ACCOUNT..."
                    : "CREATE ACCOUNT"}
                </button>

                {/* GOOGLE */}

                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-800" />
                  </div>

                  <div className="relative flex justify-center">
                    <span className="bg-slate-950 px-3 text-xs text-slate-500">
                      OR
                    </span>
                  </div>
                </div>

                <div className="flex justify-center">
                  <GoogleLogin
                    onSuccess={
                      handleGoogleSuccess
                    }
                    onError={
                      handleGoogleError
                    }
                    useOneTap={false}
                  />
                </div>

                <p className="text-center text-sm text-slate-500">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        "/login"
                      )
                    }
                    className="font-semibold text-blue-400 transition hover:text-blue-300"
                  >
                    Login
                  </button>
                </p>
              </div>
            )}

            {/* ==================================================
                STEP 2
            ================================================== */}

            {step === 2 && (
              <div className="space-y-6">

                <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-5 text-center">
                  <p className="text-sm leading-6 text-slate-300">
                    We sent a verification
                    code to
                  </p>

                  <p className="mt-2 break-all font-semibold text-blue-300">
                    {form.email}
                  </p>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Email Verification Code
                  </label>

                  <input
                    ref={
                      emailOtpInputRef
                    }
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={
                      emailOtp
                    }
                    onChange={
                      handleEmailOtpChange
                    }
                    placeholder="000000"
                    className="w-full rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-4 text-center text-2xl font-bold tracking-[0.5em] text-white outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <button
                  type="button"
                  onClick={
                    handleVerifyEmail
                  }
                  disabled={
                    emailVerifyLoading ||
                    isLoading
                  }
                  className="w-full rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-bold tracking-wide text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {emailVerifyLoading ||
                  isLoading
                    ? "VERIFYING..."
                    : "VERIFY EMAIL"}
                </button>

                <button
                  type="button"
                  onClick={
                    handleResendEmail
                  }
                  disabled={
                    resendEmailLoading ||
                    isLoading
                  }
                  className="w-full rounded-xl border border-slate-700 bg-slate-900/60 px-5 py-3.5 text-sm font-semibold text-slate-300 transition hover:border-blue-500 hover:text-blue-300 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {resendEmailLoading
                    ? "SENDING..."
                    : "RESEND CODE"}
                </button>

                <button
                  type="button"
                  onClick={
                    goBack
                  }
                  className="w-full text-sm text-slate-500 transition hover:text-slate-300"
                >
                  ← Back
                </button>
              </div>
            )}

            {/* ==================================================
                STEP 3 — PHONE
            ================================================== */}

            {step === 3 && (
              <div className="space-y-6">

                {/* RESUME FLOW MESSAGE */}

                {isResumingPhoneVerification && (
                  <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5">
                    <div className="flex gap-3">
                      <div className="text-xl">
                        📱
                      </div>

                      <div>
                        <p className="font-semibold text-amber-300">
                          Complete your phone verification
                        </p>

                        <p className="mt-1 text-sm leading-6 text-slate-400">
                          Your account already
                          exists and your email
                          has been verified.
                          Add your phone number
                          to continue to your
                          dashboard.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* GOOGLE MESSAGE */}

                {isGoogleRegistration &&
                  !isResumingPhoneVerification && (
                    <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-5">
                      <div className="flex gap-3">
                        <div className="text-xl">
                          🔐
                        </div>

                        <div>
                          <p className="font-semibold text-blue-300">
                            Google account verified
                          </p>

                          <p className="mt-1 text-sm leading-6 text-slate-400">
                            Your Google account
                            has been verified.
                            Add your Nigerian
                            phone number to
                            complete your
                            registration.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                {/* NORMAL EMAIL MESSAGE */}

                {!isGoogleRegistration &&
                  !isResumingPhoneVerification && (
                    <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5">
                      <div className="flex gap-3">
                        <div className="text-xl">
                          ✓
                        </div>

                        <div>
                          <p className="font-semibold text-emerald-300">
                            Email verified
                          </p>

                          <p className="mt-1 text-sm leading-6 text-slate-400">
                            Your email has been
                            successfully verified.
                            Add your phone number
                            to secure your account.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                {/* EMAIL */}

                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Account Email
                  </label>

                  <input
                    type="email"
                    value={
                      form.email
                    }
                    readOnly
                    className="w-full rounded-xl border border-slate-800 bg-slate-900/40 px-4 py-3 text-sm text-slate-500 outline-none"
                  />
                </div>

                {/* PHONE */}

                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Nigerian Phone Number
                  </label>

                  <input
                    type="tel"
                    value={phone}
                    onChange={
                      handlePhoneChange
                    }
                    autoComplete="tel"
                    placeholder="08012345678"
                    className="w-full rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />

                  <p className="mt-2 text-xs leading-5 text-slate-500">
                    Enter a valid Nigerian
                    phone number. You will
                    receive a verification code
                    by SMS.
                  </p>
                </div>

                {/* SEND OTP */}

                <button
                  type="button"
                  onClick={
                    handleSendPhoneOTP
                  }
                  disabled={
                    phoneSendLoading ||
                    isLoading
                  }
                  className="w-full rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-bold tracking-wide text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {phoneSendLoading ||
                  isLoading
                    ? "SENDING CODE..."
                    : "SEND PHONE CODE"}
                </button>

                {/* BACK */}

                {!isGoogleRegistration &&
                  !isResumingPhoneVerification && (
                    <button
                      type="button"
                      onClick={
                        goBack
                      }
                      className="w-full text-sm text-slate-500 transition hover:text-slate-300"
                    >
                      ← Back to email verification
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
                    className="w-full text-sm text-slate-500 transition hover:text-slate-300"
                  >
                    ← Back to login
                  </button>
                )}
              </div>
            )}

            {/* ==================================================
                STEP 4 — PHONE OTP
            ================================================== */}

            {step === 4 && (
              <div className="space-y-6">

                <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-5 text-center">
                  <p className="text-sm leading-6 text-slate-300">
                    We sent a verification
                    code to
                  </p>

                  <p className="mt-2 font-semibold text-blue-300">
                    {phone}
                  </p>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Phone Verification Code
                  </label>

                  <input
                    ref={
                      phoneOtpInputRef
                    }
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={
                      phoneOtp
                    }
                    onChange={
                      handlePhoneOtpChange
                    }
                    placeholder="000000"
                    className="w-full rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-4 text-center text-2xl font-bold tracking-[0.5em] text-white outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <button
                  type="button"
                  onClick={
                    handleVerifyPhone
                  }
                  disabled={
                    phoneVerifyLoading ||
                    isLoading
                  }
                  className="w-full rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-bold tracking-wide text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {phoneVerifyLoading ||
                  isLoading
                    ? "VERIFYING PHONE..."
                    : "VERIFY PHONE"}
                </button>

                <button
                  type="button"
                  onClick={
                    handleResendPhoneOTP
                  }
                  disabled={
                    phoneSendLoading ||
                    isLoading
                  }
                  className="w-full rounded-xl border border-slate-700 bg-slate-900/60 px-5 py-3.5 text-sm font-semibold text-slate-300 transition hover:border-blue-500 hover:text-blue-300 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {phoneSendLoading
                    ? "SENDING..."
                    : "RESEND CODE"}
                </button>

                <button
                  type="button"
                  onClick={
                    handleChangePhone
                  }
                  className="w-full text-sm text-slate-500 transition hover:text-slate-300"
                >
                  Change phone number
                </button>
              </div>
            )}
          </div>

          {/* ====================================================
              FOOTER
          ==================================================== */}

          <div className="mt-8 text-center">
            <p className="text-xs text-slate-600">
              © {new Date().getFullYear()}{" "}
              Devad Tech Academy. All
              rights reserved.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default RegisterPage;

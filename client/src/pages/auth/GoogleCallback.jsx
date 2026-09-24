import {
  useEffect,
  useRef,
} from "react";

import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import { toast } from "react-hot-toast";

import useAuthStore from "../../store/authStore";

const GoogleCallback = () => {
  const navigate = useNavigate();

  const [searchParams] =
    useSearchParams();

  const processedRef =
    useRef(false);

  const setGoogleAuth =
    useAuthStore(
      (state) =>
        state.setGoogleAuth
    );

  useEffect(() => {
    if (processedRef.current) {
      return;
    }

    processedRef.current = true;

    const status =
      searchParams.get("status");

    const accessToken =
      searchParams.get(
        "accessToken"
      );

    const registrationToken =
      searchParams.get(
        "registrationToken"
      );

    const email =
      searchParams.get("email");

    const error =
      searchParams.get("error");

    // ==========================================================
    // GOOGLE AUTH ERROR
    // ==========================================================

    if (error) {
      toast.error(
        "Google authentication failed. Please try again."
      );

      navigate("/login", {
        replace: true,
      });

      return;
    }

    // ==========================================================
    // PHONE VERIFICATION REQUIRED
    // ==========================================================

    if (
      status === "phone-required" &&
      registrationToken
    ) {
      toast.success(
        "Google verified your email. Please verify your phone number."
      );

      navigate("/register", {
        replace: true,

        state: {
          googleAuth: true,
          registrationToken,
          email,
        },
      });

      return;
    }

    // ==========================================================
    // SUCCESSFUL LOGIN
    // ==========================================================

    if (
      status === "success" &&
      accessToken
    ) {
      setGoogleAuth(
        accessToken
      );

      toast.success(
        "Google login successful."
      );

      navigate("/dashboard", {
        replace: true,
      });

      return;
    }

    // ==========================================================
    // INVALID CALLBACK
    // ==========================================================

    toast.error(
      "Invalid Google authentication response."
    );

    navigate("/login", {
      replace: true,
    });
  }, [
    searchParams,
    navigate,
    setGoogleAuth,
  ]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0F0F14] text-white px-6">
      <div className="w-full max-w-md text-center">
        <div className="mb-6 flex justify-center">
          <div className="h-12 w-12 rounded-full border-4 border-white/10 border-t-indigo-500 animate-spin" />
        </div>

        <h1 className="text-xl font-semibold">
          Completing Google sign-in...
        </h1>

        <p className="mt-2 text-sm text-white/50">
          Please wait while we securely complete your authentication.
        </p>
      </div>
    </div>
  );
};

export default GoogleCallback;

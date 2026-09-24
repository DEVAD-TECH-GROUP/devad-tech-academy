import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const GoogleCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const status = searchParams.get("status");
    const accessToken = searchParams.get("accessToken");
    const error = searchParams.get("error");

    // ========================================================
    // GOOGLE ERROR
    // ========================================================

    if (error) {
      console.error(
        "Google authentication error:",
        error
      );

      navigate(
        `/login?error=${encodeURIComponent(error)}`,
        { replace: true }
      );

      return;
    }

    // ========================================================
    // PHONE VERIFICATION REQUIRED
    // ========================================================

    if (status === "phone-required") {
      const registrationToken =
        searchParams.get("registrationToken");

      const email =
        searchParams.get("email");

      if (!registrationToken) {
        navigate("/login", {
          replace: true,
        });

        return;
      }

      navigate(
        `/auth/google-phone?registrationToken=${encodeURIComponent(
          registrationToken
        )}&email=${encodeURIComponent(email || "")}`,
        {
          replace: true,
        }
      );

      return;
    }

    // ========================================================
    // SUCCESSFUL LOGIN
    // ========================================================

    if (
      status === "success" &&
      accessToken
    ) {
      localStorage.setItem(
        "accessToken",
        accessToken
      );

      console.log(
        "✅ Google access token stored."
      );

      navigate(
        "/dashboard",
        {
          replace: true,
        }
      );

      return;
    }

    // ========================================================
    // INVALID CALLBACK
    // ========================================================

    navigate("/login", {
      replace: true,
    });
  }, [
    navigate,
    searchParams,
  ]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>
        Completing Google sign-in...
      </p>
    </div>
  );
};

export default GoogleCallback;

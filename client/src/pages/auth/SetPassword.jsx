import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  LockKeyhole,
  ShieldCheck,
  XCircle,
} from "lucide-react";

import { useAuthStore } from "../../store/authStore";

export default function SetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const { setPasswordWithToken, isLoading } = useAuthStore();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [success, setSuccess] = useState(false);

  const [errors, setErrors] = useState({});

  // ------------------------------------------------------------
  // PASSWORD REQUIREMENTS
  // ------------------------------------------------------------

  const requirements = [
    {
      label: "At least 8 characters",
      valid: password.length >= 8,
    },
    {
      label: "At least one uppercase letter",
      valid: /[A-Z]/.test(password),
    },
    {
      label: "At least one lowercase letter",
      valid: /[a-z]/.test(password),
    },
    {
      label: "At least one number",
      valid: /[0-9]/.test(password),
    },
  ];

  const allRequirementsMet = requirements.every((item) => item.valid);

  const passwordsMatch =
    password.length > 0 &&
    confirmPassword.length > 0 &&
    password === confirmPassword;

  // ------------------------------------------------------------
  // HANDLE INVALID LINK
  // ------------------------------------------------------------

  useEffect(() => {
    if (!token) {
      toast.error("Invalid password setup link.");
    }
  }, [token]);

  // ------------------------------------------------------------
  // FORM VALIDATION
  // ------------------------------------------------------------

  const validateForm = () => {
    const newErrors = {};

    if (!password) {
      newErrors.password = "Please enter your password.";
    } else if (password.length < 8) {
      newErrors.password = "Password must contain at least 8 characters.";
    } else if (
      !/[A-Z]/.test(password) ||
      !/[a-z]/.test(password) ||
      !/[0-9]/.test(password)
    ) {
      newErrors.password = "Your password does not meet all requirements.";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password.";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // ------------------------------------------------------------
  // SUBMIT PASSWORD
  // ------------------------------------------------------------

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      toast.error("Your password setup link is invalid.");
      return;
    }

    if (!validateForm()) {
      return;
    }

    try {
      const response = await setPasswordWithToken(
        token,
        password,
        confirmPassword,
      );

      console.log("[DEVAD SET PASSWORD] Response received:", {
        success: response?.success,
      });

      setSuccess(true);

      toast.success("Your password has been set successfully!");
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to set your password.",
      );
    }
  };

  // ------------------------------------------------------------
  // INVALID TOKEN VIEW
  // ------------------------------------------------------------

  if (!token) {
    return (
      <PageShell>
        <div className="set-password-card">
          <div className="status-icon error-icon">
            <XCircle size={38} />
          </div>

          <h1>Invalid Setup Link</h1>

          <p className="description">
            This password setup link is missing or invalid. Please contact the
            administrator who approved your instructor application for
            assistance.
          </p>

          <Link to="/login" className="primary-button">
            <ArrowLeft size={18} />
            Back to Login
          </Link>
        </div>
      </PageShell>
    );
  }

  // ------------------------------------------------------------
  // SUCCESS VIEW
  // ------------------------------------------------------------

  if (success) {
    return (
      <PageShell>
        <div className="set-password-card">
          <div className="status-icon success-icon">
            <CheckCircle2 size={40} />
          </div>

          <span className="eyebrow">PASSWORD SETUP COMPLETE</span>

          <h1>You're All Set!</h1>

          <p className="description">
            Your instructor account password has been created successfully. You
            can now sign in to your DEVAD Academy account.
          </p>

          <button
            type="button"
            className="primary-button"
            onClick={() => navigate("/login")}
          >
            Continue to Login
            <ArrowLeft size={18} className="button-arrow" />
          </button>
        </div>
      </PageShell>
    );
  }

  // ------------------------------------------------------------
  // MAIN SET PASSWORD VIEW
  // ------------------------------------------------------------

  return (
    <PageShell>
      <div className="set-password-card">
        <Link to="/login" className="back-link">
          <ArrowLeft size={17} />
          Back to Login
        </Link>

        <div className="brand-icon">
          <ShieldCheck size={30} />
        </div>

        <span className="eyebrow">INSTRUCTOR ACCOUNT ACTIVATION</span>

        <h1>Set Your Password</h1>

        <p className="description">
          Congratulations on your approval! Create a secure password to activate
          your DEVAD Academy instructor account.
        </p>

        <form onSubmit={handleSubmit}>
          {/* PASSWORD */}

          <div className="form-group">
            <label htmlFor="password">Create Password</label>

            <div className="input-wrapper">
              <LockKeyhole size={19} className="input-icon" />

              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your new password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);

                  setErrors((prev) => ({
                    ...prev,
                    password: "",
                  }));
                }}
                autoComplete="new-password"
                disabled={isLoading}
              />

              <button
                type="button"
                className="visibility-button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
              </button>
            </div>

            {errors.password && (
              <span className="error-message">{errors.password}</span>
            )}
          </div>

          {/* PASSWORD REQUIREMENTS */}

          <div className="requirements">
            <p>Password requirements</p>

            <div className="requirements-list">
              {requirements.map((item, index) => (
                <div className="requirement-item" key={index}>
                  {item.valid ? (
                    <CheckCircle2 size={15} className="valid-icon" />
                  ) : (
                    <span className="requirement-dot" />
                  )}

                  <span className={item.valid ? "valid-text" : ""}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* CONFIRM PASSWORD */}

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>

            <div className="input-wrapper">
              <LockKeyhole size={19} className="input-icon" />

              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);

                  setErrors((prev) => ({
                    ...prev,
                    confirmPassword: "",
                  }));
                }}
                autoComplete="new-password"
                disabled={isLoading}
              />

              <button
                type="button"
                className="visibility-button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                aria-label={
                  showConfirmPassword ? "Hide password" : "Show password"
                }
              >
                {showConfirmPassword ? <EyeOff size={19} /> : <Eye size={19} />}
              </button>
            </div>

            {errors.confirmPassword && (
              <span className="error-message">{errors.confirmPassword}</span>
            )}

            {confirmPassword && !errors.confirmPassword && (
              <span
                className={passwordsMatch ? "match-message" : "error-message"}
              >
                {passwordsMatch ? "Passwords match" : "Passwords do not match"}
              </span>
            )}
          </div>

          {/* SUBMIT */}

          <button
            type="submit"
            className="primary-button"
            disabled={isLoading || !allRequirementsMet || !passwordsMatch}
          >
            {isLoading ? (
              <>
                <span className="spinner" />
                Setting Password...
              </>
            ) : (
              <>
                <ShieldCheck size={19} />
                Set Password & Activate Account
              </>
            )}
          </button>
        </form>

        <div className="security-note">
          <ShieldCheck size={16} />
          Your password is securely encrypted.
        </div>
      </div>
    </PageShell>
  );
}

// ============================================================
// PAGE BACKGROUND
// ============================================================

function PageShell({ children }) {
  return (
    <div className="set-password-page">
      <style>{styles}</style>

      <div className="background-glow glow-one" />
      <div className="background-glow glow-two" />

      <div className="grid-overlay" />

      <div className="page-content">
        <div className="page-brand">
          <span className="brand-mark">D</span>

          <span>
            DEVAD <strong>ACADEMY</strong>
          </span>
        </div>

        {children}

        <p className="footer-text">
          © {new Date().getFullYear()} DEVAD Academy. All rights reserved.
        </p>
      </div>
    </div>
  );
}

// ============================================================
// STYLES
// ============================================================

const styles = `
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800&family=Rajdhani:wght@400;500;600;700&display=swap');

* {
  box-sizing: border-box;
}

.set-password-page {
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 45px 20px;
  background: linear-gradient(
    135deg,
    #020b18 0%,
    #041428 40%,
    #061c35 70%,
    #030e1c 100%
  );
  color: #e2e8f0;
  font-family: 'Rajdhani', sans-serif;
}

.background-glow {
  position: absolute;
  width: 420px;
  height: 420px;
  border-radius: 50%;
  filter: blur(100px);
  pointer-events: none;
  opacity: 0.2;
}

.glow-one {
  background: #0284c7;
  top: -180px;
  left: -120px;
}

.glow-two {
  background: #2563eb;
  bottom: -180px;
  right: -120px;
}

.grid-overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0.12;
  background-image:
    linear-gradient(rgba(56,189,248,0.12) 1px, transparent 1px),
    linear-gradient(90deg, rgba(56,189,248,0.12) 1px, transparent 1px);
  background-size: 45px 45px;
  mask-image: linear-gradient(
    to bottom,
    transparent,
    black 20%,
    black 80%,
    transparent
  );
}

.page-content {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 470px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.page-brand {
  display: flex;
  align-items: center;
  gap: 11px;
  margin-bottom: 28px;
  font-family: 'Orbitron', sans-serif;
  font-size: 15px;
  letter-spacing: 1.5px;
  color: #e2e8f0;
}

.page-brand strong {
  color: #38bdf8;
  font-weight: 700;
}

.brand-mark {
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  border-radius: 9px;
  color: white;
  font-size: 19px;
  font-weight: 800;
  background: linear-gradient(135deg, #0284c7, #2563eb);
  box-shadow: 0 0 20px rgba(56,189,248,0.3);
}

.set-password-card {
  width: 100%;
  padding: 38px;
  border-radius: 20px;
  border: 1px solid rgba(0,180,255,0.25);
  background: linear-gradient(
    160deg,
    rgba(6,20,45,0.95) 0%,
    rgba(4,14,32,0.98) 100%
  );
  box-shadow:
    0 0 60px rgba(0,100,255,0.15),
    0 25px 50px rgba(0,0,0,0.5),
    inset 0 1px 0 rgba(255,255,255,0.05);
  backdrop-filter: blur(18px);
  animation: cardEnter 0.6s ease;
}

@keyframes cardEnter {
  from {
    opacity: 0;
    transform: translateY(18px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #94a3b8;
  font-size: 15px;
  text-decoration: none;
  margin-bottom: 28px;
  transition: color 0.2s ease;
}

.back-link:hover {
  color: #38bdf8;
}

.brand-icon {
  width: 62px;
  height: 62px;
  display: grid;
  place-items: center;
  margin-bottom: 22px;
  color: #38bdf8;
  border-radius: 17px;
  border: 1px solid rgba(56,189,248,0.3);
  background: rgba(14,165,233,0.1);
  box-shadow: 0 0 30px rgba(14,165,233,0.12);
}

.eyebrow {
  display: block;
  margin-bottom: 10px;
  color: #38bdf8;
  font-family: 'Orbitron', sans-serif;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 1.7px;
}

.set-password-card h1 {
  margin: 0;
  color: #f8fafc;
  font-family: 'Orbitron', sans-serif;
  font-size: clamp(21px, 5vw, 27px);
  font-weight: 700;
  line-height: 1.4;
}

.description {
  margin: 13px 0 28px;
  color: #94a3b8;
  font-size: 17px;
  line-height: 1.6;
}

.form-group {
  margin-bottom: 21px;
}

.form-group label {
  display: block;
  margin-bottom: 9px;
  color: #cbd5e1;
  font-size: 15px;
  font-weight: 600;
}

.input-wrapper {
  display: flex;
  align-items: center;
  gap: 11px;
  min-height: 54px;
  padding: 0 14px;
  border: 1px solid rgba(71,85,105,0.65);
  border-radius: 10px;
  background: rgba(15,23,42,0.65);
  transition: all 0.2s ease;
}

.input-wrapper:focus-within {
  border-color: #38bdf8;
  box-shadow: 0 0 0 3px rgba(56,189,248,0.1);
}

.input-icon {
  flex-shrink: 0;
  color: #64748b;
}

.input-wrapper input {
  width: 100%;
  min-width: 0;
  border: none;
  outline: none;
  background: transparent;
  color: #f8fafc;
  font-family: 'Rajdhani', sans-serif;
  font-size: 17px;
  font-weight: 500;
}

.input-wrapper input::placeholder {
  color: #64748b;
}

.visibility-button {
  display: grid;
  place-items: center;
  padding: 5px;
  border: none;
  background: transparent;
  color: #64748b;
  cursor: pointer;
}

.visibility-button:hover {
  color: #38bdf8;
}

.requirements {
  padding: 15px;
  margin: -4px 0 22px;
  border: 1px solid rgba(56,189,248,0.12);
  border-radius: 10px;
  background: rgba(8,47,73,0.18);
}

.requirements > p {
  margin: 0 0 12px;
  color: #cbd5e1;
  font-size: 14px;
  font-weight: 700;
}

.requirements-list {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.requirement-item {
  display: flex;
  align-items: center;
  gap: 7px;
  color: #64748b;
  font-size: 13px;
}

.requirement-dot {
  width: 7px;
  height: 7px;
  flex-shrink: 0;
  border-radius: 50%;
  background: #475569;
}

.valid-icon,
.valid-text {
  color: #38bdf8;
}

.error-message {
  display: block;
  margin-top: 7px;
  color: #f87171;
  font-size: 13px;
}

.match-message {
  display: block;
  margin-top: 7px;
  color: #38bdf8;
  font-size: 13px;
}

.primary-button {
  width: 100%;
  min-height: 54px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 13px 18px;
  border: none;
  border-radius: 10px;
  background: linear-gradient(135deg, #0284c7, #2563eb);
  color: white;
  font-family: 'Orbitron', sans-serif;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.3px;
  text-decoration: none;
  cursor: pointer;
  box-shadow: 0 8px 24px rgba(2,132,199,0.2);
  transition: all 0.2s ease;
}

.primary-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 12px 30px rgba(2,132,199,0.35);
}

.primary-button:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.button-arrow {
  transform: rotate(180deg);
}

.spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.security-note {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 23px;
  color: #64748b;
  font-size: 14px;
}

.security-note svg {
  color: #38bdf8;
}

.status-icon {
  width: 75px;
  height: 75px;
  display: grid;
  place-items: center;
  margin: 0 auto 25px;
  border-radius: 50%;
}

.success-icon {
  color: #38bdf8;
  background: rgba(56,189,248,0.1);
  border: 1px solid rgba(56,189,248,0.3);
}

.error-icon {
  color: #f87171;
  background: rgba(248,113,113,0.1);
  border: 1px solid rgba(248,113,113,0.3);
}

.set-password-card:has(.status-icon) {
  text-align: center;
}

.set-password-card:has(.status-icon) .description {
  margin-bottom: 28px;
}

.footer-text {
  margin-top: 25px;
  color: #475569;
  font-size: 13px;
  text-align: center;
}

@media (max-width: 520px) {
  .set-password-page {
    padding: 30px 15px;
  }

  .set-password-card {
    padding: 27px 21px;
  }

  .requirements-list {
    grid-template-columns: 1fr;
  }

  .page-brand {
    font-size: 13px;
  }
}
`;

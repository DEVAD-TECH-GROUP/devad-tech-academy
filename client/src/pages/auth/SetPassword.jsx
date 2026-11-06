import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Loader2, AlertCircle, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";

import { setPassword } from "../../../services/instructor/instructorApplicationService";
import {
  C,
  Label,
  TextInput,
} from "../../../components/instructor/applicationUI";

export default function SetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPasswordValue] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    if (password.length < 8)
      return setError("Password must be at least 8 characters.");
    if (password !== confirm) return setError("Passwords do not match.");

    try {
      setSubmitting(true);
      setError("");
      await setPassword(token, password);
      setDone(true);
      toast.success("Password set. You can now log in.");
      setTimeout(() => navigate("/login"), 1800);
    } catch (err) {
      setError(
        err?.response?.data?.message || "Could not set password. Try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: C.BG,
        color: C.TEXT_PRIMARY,
        fontFamily: "'Inter', system-ui, sans-serif",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1.5rem",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          background: C.SURFACE,
          border: `1px solid ${C.ACCENT_BORDER}`,
          borderRadius: 18,
          padding: "2rem",
        }}
      >
        {done ? (
          <div style={{ textAlign: "center" }}>
            <CheckCircle size={40} color={C.GREEN} />
            <h2 style={{ margin: "12px 0 6px", fontSize: 18 }}>Password set</h2>
            <p style={{ margin: 0, color: C.TEXT_SECONDARY, fontSize: 14 }}>
              Redirecting to login...
            </p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            <div>
              <h2 style={{ margin: 0, fontSize: 20 }}>Set your password</h2>
              <p
                style={{
                  margin: "6px 0 0",
                  color: C.TEXT_SECONDARY,
                  fontSize: 13,
                }}
              >
                Choose a password to access your instructor account.
              </p>
            </div>

            {error && (
              <div
                style={{
                  display: "flex",
                  gap: 9,
                  padding: "0.8rem 1rem",
                  borderRadius: 10,
                  background: "rgba(239,68,68,0.08)",
                  border: "1px solid rgba(239,68,68,0.2)",
                  color: C.RED,
                  fontSize: 12,
                }}
              >
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            <div>
              <Label>New password</Label>
              <TextInput
                type="password"
                value={password}
                onChange={(e) => {
                  setPasswordValue(e.target.value);
                  setError("");
                }}
                placeholder="At least 8 characters"
              />
            </div>

            <div>
              <Label>Confirm password</Label>
              <TextInput
                type="password"
                value={confirm}
                onChange={(e) => {
                  setConfirm(e.target.value);
                  setError("");
                }}
                placeholder="Repeat password"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                background: "linear-gradient(135deg, #0EA5E9, #2563EB)",
                color: "#fff",
                border: "none",
                borderRadius: 10,
                padding: "0.85rem",
                fontSize: 14,
                fontWeight: 700,
                cursor: submitting ? "not-allowed" : "pointer",
                opacity: submitting ? 0.7 : 1,
              }}
            >
              {submitting && (
                <Loader2
                  size={15}
                  style={{ animation: "spin 1s linear infinite" }}
                />
              )}
              {submitting ? "Saving..." : "Set password"}
            </button>
          </form>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

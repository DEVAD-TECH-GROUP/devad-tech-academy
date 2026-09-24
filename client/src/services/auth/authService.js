import api from "../../api/Api";

/* ============================================================
   AUTHENTICATION
   ============================================================ */

/**
 * Login
 */
export const login = (email, password) =>
  api.post("/auth/login", {
    email,
    password,
  });

/**
 * Register
 */
export const register = (payload) =>
  api.post("/auth/register", payload);

/**
 * Logout
 */
export const logout = () =>
  api.post("/auth/logout");

/**
 * Get current authenticated user
 */
export const getMe = () =>
  api.get("/auth/me");


/* ============================================================
   EMAIL VERIFICATION
   ============================================================ */

/**
 * Verify email
 */
export const verifyEmail = (token) =>
  api.post("/auth/verify-email", {
    token,
  });

/**
 * Resend email verification
 */
export const resendVerification = () =>
  api.post("/auth/resend-verification");


/* ============================================================
   PHONE VERIFICATION — ROBASE OTP
   ============================================================ */

/**
 * Send phone verification OTP
 *
 * The backend gets the phone number from the
 * authenticated user's account.
 */
export const sendPhoneOTP = () =>
  api.post("/auth/send-phone-otp");

/**
 * Verify phone using Robase OTP
 *
 * otpId = the Robase OTP ID returned/stored by the backend
 * code  = the 6-digit OTP entered by the user
 */
export const verifyPhone = (otpId, code) =>
  api.post("/auth/verify-phone", {
    otpId,
    code,
  });

/**
 * Update/change phone number
 *
 * Backend updates the user's phone and automatically
 * sends a new Robase OTP.
 */
export const updatePhone = (phone) =>
  api.put("/auth/phone", {
    phone,
  });

/**
 * Get email and phone verification status
 */
export const getVerificationStatus = () =>
  api.get("/auth/verification-status");


/* ============================================================
   PASSWORD
   ============================================================ */

/**
 * Forgot password
 */
export const forgotPassword = (email) =>
  api.post("/auth/forgot-password", {
    email,
  });

/**
 * Reset password
 */
export const resetPassword = (token, password) =>
  api.post("/auth/reset-password", {
    token,
    password,
  });

/**
 * Change password
 */
export const changePassword = (
  currentPassword,
  newPassword
) =>
  api.post("/auth/change-password", {
    currentPassword,
    newPassword,
  });


/* ============================================================
   TOKEN
   ============================================================ */

/**
 * Refresh access token
 */
export const refreshToken = () =>
  api.post("/auth/refresh-token");
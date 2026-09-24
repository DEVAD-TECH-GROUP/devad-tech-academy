import api from "../../api/Api";

export const authService = {
  // ============================================================
  // LOGIN
  // ============================================================

  login: (email, password) =>
    api.post("/auth/login", {
      email,
      password,
    }),

  // ============================================================
  // REGISTRATION
  // ============================================================

  register: (payload) =>
    api.post("/auth/register", payload),

  // ============================================================
  // EMAIL VERIFICATION
  // ============================================================

  verifyEmail: (email, token) =>
    api.post("/auth/verify-email", {
      email,
      token,
    }),

  resendVerification: (email) =>
    api.post("/auth/resend-verification", {
      email,
    }),

  // ============================================================
  // PHONE REGISTRATION VERIFICATION
  // ============================================================

  updateRegistrationPhone: (
    registrationToken,
    phone
  ) =>
    api.post("/auth/update-registration-phone", {
      registrationToken,
      phone,
    }),

  sendPhoneOTP: (registrationToken) =>
    api.post("/auth/send-phone-otp", {
      registrationToken,
    }),

  verifyPhone: (
    registrationToken,
    otpId,
    code
  ) =>
    api.post("/auth/verify-phone", {
      registrationToken,
      otpId,
      code,
    }),

  // ============================================================
  // GOOGLE
  // ============================================================

  googleLogin: (credential) =>
    api.post("/auth/google", {
      credential,
    }),

  // ============================================================
  // AUTHENTICATED USER
  // ============================================================

  logout: () =>
    api.post("/auth/logout"),

  getMe: () =>
    api.get("/auth/me"),

  getVerificationStatus: () =>
    api.get("/auth/verification-status"),

  updatePhone: (phone) =>
    api.post("/auth/update-phone", {
      phone,
    }),

  // ============================================================
  // PASSWORD
  // ============================================================

  forgotPassword: (email) =>
    api.post("/auth/forgot-password", {
      email,
    }),

  resetPassword: (
    token,
    password
  ) =>
    api.post("/auth/reset-password", {
      token,
      password,
    }),

  changePassword: (
    currentPassword,
    newPassword
  ) =>
    api.post("/auth/change-password", {
      currentPassword,
      newPassword,
    }),

  // ============================================================
  // TOKEN
  // ============================================================

  refreshToken: () =>
    api.post("/auth/refresh-token"),
};

export default authService;

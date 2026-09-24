import express from "express";

import {
  register,
  login,
  logout,
  getMe,

  verifyEmail,
  resendVerification,

  updateRegistrationPhone,
  sendPhoneOTP,
  verifyPhone,
  updatePhone,

  getVerificationStatus,
} from "../../controllers/auth/authController.js";

import authenticate from "../../middlewares/auth/authenticate.js";

import {
  authLimiter,
} from "../../middlewares/security/rateLimiter.js";

const router = express.Router();

// ============================================================
// PUBLIC AUTH ROUTES
// ============================================================

router.post(
  "/register",
  authLimiter,
  register
);

router.post(
  "/login",
  authLimiter,
  login
);

router.post(
  "/verify-email",
  authLimiter,
  verifyEmail
);

router.post(
  "/resend-verification",
  authLimiter,
  resendVerification
);

// ============================================================
// REGISTRATION PHONE VERIFICATION
// IMPORTANT:
// These MUST remain BEFORE router.use(authenticate)
// because the user has not logged in yet.
// They use registrationToken, NOT JWT.
// ============================================================

router.post(
  "/registration-phone",
  authLimiter,
  updateRegistrationPhone
);

router.post(
  "/send-phone-otp",
  authLimiter,
  sendPhoneOTP
);

router.post(
  "/verify-phone",
  authLimiter,
  verifyPhone
);

// ============================================================
// PROTECTED ROUTES
// Everything below this point requires JWT.
// ============================================================

router.use(authenticate);

router.post(
  "/logout",
  logout
);

router.get(
  "/me",
  getMe
);

router.put(
  "/phone",
  authLimiter,
  updatePhone
);

router.get(
  "/verification-status",
  getVerificationStatus
);

export default router;

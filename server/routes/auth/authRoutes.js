import express from "express";

import {
  register,
  login,
  logout,
  getMe,

  verifyEmail,
  resendVerification,

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

/* ============================================================
   PUBLIC AUTH ROUTES
   ============================================================ */

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post(
  "/register",
  authLimiter,
  register
);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post(
  "/login",
  authLimiter,
  login
);

/**
 * @route   POST /api/auth/verify-email
 * @desc    Verify user's email address
 * @access  Public
 */
router.post(
  "/verify-email",
  authLimiter,
  verifyEmail
);

/**
 * @route   POST /api/auth/resend-verification
 * @desc    Resend email verification code
 * @access  Public
 *
 * NOTE:
 * This must remain public because a newly registered user
 * has not logged in yet.
 */
router.post(
  "/resend-verification",
  authLimiter,
  resendVerification
);


/* ============================================================
   PROTECTED AUTH ROUTES
   ============================================================ */

/**
 * All routes below this point require authentication.
 */
router.use(authenticate);


/* ============================================================
   SESSION
   ============================================================ */

/**
 * @route   POST /api/auth/logout
 * @desc    Logout current user
 * @access  Private
 */
router.post(
  "/logout",
  logout
);

/**
 * @route   GET /api/auth/me
 * @desc    Get current authenticated user
 * @access  Private
 */
router.get(
  "/me",
  getMe
);


/* ============================================================
   PHONE VERIFICATION — ROBASE OTP
   ============================================================ */

/**
 * @route   POST /api/auth/send-phone-otp
 * @desc    Send phone verification OTP through Robase
 * @access  Private
 */
router.post(
  "/send-phone-otp",
  authLimiter,
  sendPhoneOTP
);

/**
 * @route   POST /api/auth/verify-phone
 * @desc    Verify phone using Robase OTP
 * @access  Private
 */
router.post(
  "/verify-phone",
  authLimiter,
  verifyPhone
);


/* ============================================================
   PHONE NUMBER MANAGEMENT
   ============================================================ */

/**
 * @route   PUT /api/auth/phone
 * @desc    Change/update phone number and send new OTP
 * @access  Private
 */
router.put(
  "/phone",
  authLimiter,
  updatePhone
);


/* ============================================================
   VERIFICATION STATUS
   ============================================================ */

/**
 * @route   GET /api/auth/verification-status
 * @desc    Get current user's email/phone verification status
 * @access  Private
 */
router.get(
  "/verification-status",
  getVerificationStatus
);


export default router;

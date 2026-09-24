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


/* ============================================================
   PUBLIC EMAIL VERIFICATION
   ============================================================ */

/**
 * @route   POST /api/auth/verify-email
 * @desc    Verify user's email using 6-digit OTP
 * @access  Public
 */
router.post(
  "/verify-email",
  authLimiter,
  verifyEmail
);


/**
 * @route   POST /api/auth/resend-verification
 * @desc    Resend email verification OTP
 * @access  Public
 */
router.post(
  "/resend-verification",
  authLimiter,
  resendVerification
);


/* ============================================================
   PUBLIC REGISTRATION PHONE VERIFICATION
   ============================================================ */

/**
 * These routes happen BEFORE login.
 *
 * They use registrationToken instead of JWT.
 */


/**
 * @route   POST /api/auth/registration-phone
 * @desc    Add phone number during registration
 * @access  Public
 */
router.post(
  "/registration-phone",
  authLimiter,
  updateRegistrationPhone
);


/**
 * @route   POST /api/auth/send-phone-otp
 * @desc    Send phone verification OTP through Robase
 * @access  Public
 */
router.post(
  "/send-phone-otp",
  authLimiter,
  sendPhoneOTP
);


/**
 * @route   POST /api/auth/verify-phone
 * @desc    Verify phone using Robase OTP
 * @access  Public
 */
router.post(
  "/verify-phone",
  authLimiter,
  verifyPhone
);


/* ============================================================
   PROTECTED AUTH ROUTES
   ============================================================ */

/**
 * IMPORTANT:
 *
 * Authentication starts HERE.
 *
 * Everything below this middleware requires
 * a valid JWT/access token.
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
   PHONE NUMBER MANAGEMENT
   ============================================================ */

/**
 * @route   PUT /api/auth/phone
 * @desc    Change authenticated user's phone number
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
 * @desc    Get current user's verification status
 * @access  Private
 */
router.get(
  "/verification-status",
  getVerificationStatus
);


export default router;

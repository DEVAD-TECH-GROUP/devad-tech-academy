import crypto from "crypto";

import User from "../../models/user/User.js";
import Student from "../../models/user/Student.js";
import Instructor from "../../models/user/Instructor.js";
import SuperAdmin from "../../models/user/SuperAdmin.js";
import Token from "../../models/auth/Token.js";

import { sendTokenResponse } from "../../utils/generateToken.js";

import {
  generateReferralCode,
  generateOTP,
} from "../../utils/generateCode.js";

import sendResponse from "../../utils/sendResponse.js";
import asyncHandler from "../../middlewares/error/asyncHandler.js";

import registerValidator from "../../validators/auth/registerValidator.js";
import loginValidator from "../../validators/auth/loginValidator.js";

import sendEmail from "../../services/email/emailService.js";

import {
  sendOTP,
  verifyOTP,
} from "../../services/sms/smsService.js";

import { normalizePhone } from "../../config/robase.js";

import welcomeTemplate from "../../templates/email/welcome.js";
import verifyEmailTemplate from "../../templates/email/verifyEmail.js";

import {
  EMAIL_SUBJECTS,
  ROLES,
  AUDIT_TYPES,
} from "../../utils/constants.js";

import auditLogger from "../../services/audit/auditLogger.js";

/* ============================================================
   CONSTANTS
   ============================================================ */

// Email OTP lifetime
const EMAIL_VERIFICATION_MINUTES = 10;

// Phone OTP lifetime
const PHONE_VERIFICATION_MINUTES = 10;

// Temporary registration session lifetime
// Starts after email verification.
const REGISTRATION_SESSION_MINUTES = 15;

/* ============================================================
   HELPERS
   ============================================================ */

/**
 * Generate a secure temporary registration token.
 *
 * This token is used between:
 *
 * Email verification
 *        ↓
 * Phone verification
 *
 * It is NOT a login token and does NOT authenticate the user.
 */
const generateRegistrationVerificationToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

/**
 * Generate expiration date.
 */
const getExpirationDate = (minutes) => {
  return new Date(Date.now() + minutes * 60 * 1000);
};

/**
 * Safely write an audit log without allowing audit failures
 * to break authentication.
 */
const createAuditLog = async ({
  actor,
  actorRole,
  action,
  req,
}) => {
  try {
    await auditLogger({
      actor,
      actorRole,
      action,
      type: AUDIT_TYPES.AUTH,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });
  } catch (error) {
    console.error(
      "Authentication audit log failed:",
      error.message
    );
  }
};

/* ============================================================
   REGISTER
   ============================================================ */

/**
 * MANUAL REGISTRATION
 *
 * Flow:
 *
 * POST /auth/register
 *       ↓
 * Create user
 *       ↓
 * Send EMAIL OTP
 *       ↓
 * No JWT
 *       ↓
 * Frontend moves to email verification
 */
export const register = asyncHandler(async (req, res) => {
  // ----------------------------------------------------------
  // Validate request
  // ----------------------------------------------------------

  const { error, value } = registerValidator(req.body);

  if (error) {
    return sendResponse(
      res,
      400,
      error.details[0]?.message ||
        "Invalid registration details"
    );
  }

  // ----------------------------------------------------------
  // Extract validated fields
  // ----------------------------------------------------------

  const {
    firstName,
    lastName,
    email,
    password,
    phone,
    role,
    referralCode,
  } = value;

  // ----------------------------------------------------------
  // Normalize email
  // ----------------------------------------------------------

  const normalizedEmail = String(email)
    .trim()
    .toLowerCase();

  // ----------------------------------------------------------
  // Normalize phone
  // ----------------------------------------------------------

  const normalizedPhone = normalizePhone(phone);

  if (!normalizedPhone) {
    return sendResponse(
      res,
      400,
      "Please enter a valid phone number"
    );
  }

  // ----------------------------------------------------------
  // Check existing email
  // ----------------------------------------------------------

  const existingEmail = await User.findOne({
    email: normalizedEmail,
  });

  if (existingEmail) {
    return sendResponse(
      res,
      409,
      "An account with this email already exists"
    );
  }

  // ----------------------------------------------------------
  // Check existing phone
  // ----------------------------------------------------------

  const existingPhone = await User.findOne({
    phone: normalizedPhone,
  });

  if (existingPhone) {
    return sendResponse(
      res,
      409,
      "An account with this phone number already exists"
    );
  }

  // ----------------------------------------------------------
  // Public registration roles
  //
  // NEVER allow SUPER_ADMIN through public registration.
  // ----------------------------------------------------------

  const allowedRoles = [
    ROLES.STUDENT,
    ROLES.INSTRUCTOR,
  ];

  const selectedRole = role || ROLES.STUDENT;

  if (!allowedRoles.includes(selectedRole)) {
    return sendResponse(
      res,
      400,
      "Invalid account role"
    );
  }

  // ----------------------------------------------------------
  // Referral lookup
  // ----------------------------------------------------------

  let referredBy = null;

  if (referralCode) {
    const normalizedReferralCode = String(
      referralCode
    )
      .trim()
      .toUpperCase();

    const referringUser = await User.findOne({
      referralCode: normalizedReferralCode,
    });

    if (!referringUser) {
      return sendResponse(
        res,
        400,
        "Invalid referral code"
      );
    }

    referredBy = referringUser._id;
  }

  // ----------------------------------------------------------
  // Generate email verification OTP
  // ----------------------------------------------------------

  const emailVerificationToken = generateOTP();

  const emailVerificationExpire =
    getExpirationDate(
      EMAIL_VERIFICATION_MINUTES
    );

  // ----------------------------------------------------------
  // Generate unique referral code
  // ----------------------------------------------------------

  let newReferralCode =
    generateReferralCode();

  let referralExists = await User.findOne({
    referralCode: newReferralCode,
  });

  while (referralExists) {
    newReferralCode =
      generateReferralCode();

    referralExists = await User.findOne({
      referralCode: newReferralCode,
    });
  }

  // ----------------------------------------------------------
  // Create user
  //
  // IMPORTANT:
  //
  // We DO NOT:
  // - send phone OTP here
  // - send welcome email here
  // - issue JWT here
  //
  // Email verification comes first.
  // ----------------------------------------------------------

  const user = await User.create({
    firstName: String(firstName).trim(),
    lastName: String(lastName).trim(),

    email: normalizedEmail,

    password,

    phone: normalizedPhone,

    role: selectedRole,

    status: "active",

    referralCode: newReferralCode,

    referredBy,

    // Email verification
    isEmailVerified: false,
    emailVerificationToken,
    emailVerificationExpire,

    // Phone verification
    isPhoneVerified: false,

    phoneVerificationToken: undefined,
    phoneVerificationExpire: undefined,

    // Manual registration
    isGoogleAuth: false,
  });

  // ----------------------------------------------------------
  // Create role-specific profile
  // ----------------------------------------------------------

  try {
    if (selectedRole === ROLES.STUDENT) {
      await Student.create({
        user: user._id,
      });
    }

    if (selectedRole === ROLES.INSTRUCTOR) {
      await Instructor.create({
        user: user._id,
      });
    }

    /*
     * This should never be reached through public registration
     * because SUPER_ADMIN is not an allowed public role.
     *
     * Keeping this branch here protects the controller if the
     * role system changes later.
     */
    if (selectedRole === ROLES.SUPER_ADMIN) {
      await SuperAdmin.create({
        user: user._id,
      });
    }
  } catch (profileError) {
    // Remove user if profile creation fails
    await User.findByIdAndDelete(user._id);

    throw profileError;
  }

  // ----------------------------------------------------------
  // Send EMAIL verification OTP
  // ----------------------------------------------------------

  try {
    await sendEmail({
      to: user.email,
      subject: EMAIL_SUBJECTS.VERIFY_EMAIL,
      html: verifyEmailTemplate({
        firstName: user.firstName,
        token: emailVerificationToken,
      }),
    });
  } catch (error) {
    /*
     * The account already exists.
     *
     * We do not delete the account because the user can use
     * resend-verification.
     */
    console.error(
      "Verification email failed:",
      error.message
    );
  }

  // ----------------------------------------------------------
  // Audit registration
  // ----------------------------------------------------------

  await createAuditLog({
    actor: user._id,
    actorRole: user.role,
    action: `New account registered: ${user.email}`,
    req,
  });

  // ----------------------------------------------------------
  // IMPORTANT:
  //
  // DO NOT call sendTokenResponse().
  //
  // The user is not authenticated yet.
  // ----------------------------------------------------------

  return sendResponse(
    res,
    201,
    "Registration successful. Please verify your email.",
    {
      registration: {
        userId: user._id,
        email: user.email,
        phone: user.phone,
        emailVerified: false,
        phoneVerified: false,
        nextStep: "email-verification",
      },
    }
  );
});

/* ============================================================
   LOGIN
   ============================================================ */

/**
 * LOGIN
 *
 * Requirements:
 *
 * Email verified
 *       +
 * Phone verified
 *       +
 * Correct password
 *       ↓
 * JWT/session issued
 */
export const login = asyncHandler(async (req, res) => {
  // ----------------------------------------------------------
  // Validate request
  // ----------------------------------------------------------

  const { error, value } =
    loginValidator(req.body);

  if (error) {
    return sendResponse(
      res,
      400,
      error.details[0]?.message ||
        "Invalid login details"
    );
  }

  const {
    email,
    password,
  } = value;

  // ----------------------------------------------------------
  // Normalize email
  // ----------------------------------------------------------

  const normalizedEmail = String(email)
    .trim()
    .toLowerCase();

  // ----------------------------------------------------------
  // Find user
  // ----------------------------------------------------------

  const user = await User.findOne({
    email: normalizedEmail,
  }).select("+password");

  if (!user) {
    return sendResponse(
      res,
      401,
      "Invalid email or password"
    );
  }

  // ----------------------------------------------------------
  // Check account status
  // ----------------------------------------------------------

  if (user.status === "suspended") {
    return sendResponse(
      res,
      403,
      "Your account has been suspended. Please contact support."
    );
  }

  if (user.status === "inactive") {
    return sendResponse(
      res,
      403,
      "Your account is inactive. Please contact support."
    );
  }

  // ----------------------------------------------------------
  // Check password
  // ----------------------------------------------------------

  const passwordMatch =
    await user.comparePassword(password);

  if (!passwordMatch) {
    return sendResponse(
      res,
      401,
      "Invalid email or password"
    );
  }

  // ----------------------------------------------------------
  // EMAIL VERIFICATION GATE
  // ----------------------------------------------------------

  if (!user.isEmailVerified) {
    return sendResponse(
      res,
      403,
      "Please verify your email before logging in.",
      {
        verificationRequired: "email",
        email: user.email,
      }
    );
  }

  // ----------------------------------------------------------
  // PHONE VERIFICATION GATE
  // ----------------------------------------------------------

  if (!user.isPhoneVerified) {
    return sendResponse(
      res,
      403,
      "Please verify your phone number before logging in.",
      {
        verificationRequired: "phone",
        email: user.email,
        phone: user.phone,
      }
    );
  }

  // ----------------------------------------------------------
  // Update last login
  // ----------------------------------------------------------

  await user.updateLastLogin();

  // ----------------------------------------------------------
  // Audit login
  // ----------------------------------------------------------

  await createAuditLog({
    actor: user._id,
    actorRole: user.role,
    action: `User logged in: ${user.email}`,
    req,
  });

  // ----------------------------------------------------------
  // Send authentication response
  // ----------------------------------------------------------

  return sendTokenResponse(
    user,
    200,
    res,
    "Login successful"
  );
});

/* ============================================================
   LOGOUT
   ============================================================ */

export const logout = asyncHandler(async (req, res) => {
  // ----------------------------------------------------------
  // Delete refresh tokens
  // ----------------------------------------------------------

  if (req.user?._id) {
    await Token.deleteMany({
      user: req.user._id,
    });
  }

  // ----------------------------------------------------------
  // Clear refresh token cookie
  // ----------------------------------------------------------

  res.cookie("refreshToken", "", {
    httpOnly: true,

    secure:
      process.env.NODE_ENV === "production",

    sameSite:
      process.env.NODE_ENV === "production"
        ? "none"
        : "lax",

    expires: new Date(0),
  });

  // ----------------------------------------------------------
  // Audit logout
  // ----------------------------------------------------------

  if (req.user?._id) {
    await createAuditLog({
      actor: req.user._id,
      actorRole: req.user.role,
      action: `User logged out: ${req.user.email}`,
      req,
    });
  }

  return sendResponse(
    res,
    200,
    "Logout successful"
  );
});

/* ============================================================
   GET CURRENT USER
   ============================================================ */

export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(
    req.user._id
  );

  if (!user) {
    return sendResponse(
      res,
      404,
      "User account not found"
    );
  }

  return sendResponse(
    res,
    200,
    "User retrieved successfully",
    {
      user,
    }
  );
});

/* ============================================================
   VERIFY EMAIL
   ============================================================ */

/**
 * PUBLIC ENDPOINT
 *
 * Request:
 *
 * {
 *   email: "user@example.com",
 *   token: "123456"
 * }
 *
 * After successful verification:
 *
 * Email verified
 *       ↓
 * Create temporary registration session
 *       ↓
 * Send phone OTP
 *       ↓
 * Return registrationToken
 */
export const verifyEmail = asyncHandler(
  async (req, res) => {
    const {
      email,
      token,
    } = req.body;

    // --------------------------------------------------------
    // Validate input
    // --------------------------------------------------------

    if (!email) {
      return sendResponse(
        res,
        400,
        "Email is required"
      );
    }

    if (!token) {
      return sendResponse(
        res,
        400,
        "Email verification code is required"
      );
    }

    // --------------------------------------------------------
    // Normalize email
    // --------------------------------------------------------

    const normalizedEmail = String(email)
      .trim()
      .toLowerCase();

    // --------------------------------------------------------
    // Find user
    //
    // Verification fields are select:false in User.js,
    // therefore explicitly select them.
    // --------------------------------------------------------

    const user = await User.findOne({
      email: normalizedEmail,
    }).select(
      "+emailVerificationToken +emailVerificationExpire"
    );

    if (!user) {
      return sendResponse(
        res,
        404,
        "User account not found"
      );
    }

    // --------------------------------------------------------
    // Already verified
    // --------------------------------------------------------

    if (user.isEmailVerified) {
      return sendResponse(
        res,
        400,
        "Your email is already verified"
      );
    }

    // --------------------------------------------------------
    // Check token
    // --------------------------------------------------------

    if (
      !user.emailVerificationToken ||
      user.emailVerificationToken !==
        String(token).trim()
    ) {
      return sendResponse(
        res,
        400,
        "Invalid email verification code"
      );
    }

    // --------------------------------------------------------
    // Check expiration
    // --------------------------------------------------------

    if (
      !user.emailVerificationExpire ||
      user.emailVerificationExpire < new Date()
    ) {
      return sendResponse(
        res,
        400,
        "Email verification code has expired. Please request a new code."
      );
    }

    // --------------------------------------------------------
    // Verify email
    // --------------------------------------------------------

    user.isEmailVerified = true;

    user.emailVerificationToken = undefined;

    user.emailVerificationExpire = undefined;

    // --------------------------------------------------------
    // Create temporary registration verification session
    //
    // This is NOT a JWT.
    // It only allows the user to continue registration.
    // --------------------------------------------------------

    const registrationVerificationToken =
      generateRegistrationVerificationToken();

    user.registrationVerificationToken =
      registrationVerificationToken;

    user.registrationVerificationExpire =
      getExpirationDate(
        REGISTRATION_SESSION_MINUTES
      );

    await user.save({
      validateBeforeSave: false,
    });

    // --------------------------------------------------------
    // Audit email verification
    // --------------------------------------------------------

    await createAuditLog({
      actor: user._id,
      actorRole: user.role,
      action: `Email verified: ${user.email}`,
      req,
    });

    // --------------------------------------------------------
    // SEND PHONE OTP
    // --------------------------------------------------------

    let phoneOtpResult;

    try {
      phoneOtpResult =
        await sendOTP(user.phone);
    } catch (error) {
      console.error(
        "Phone OTP after email verification failed:",
        error.message
      );

      return sendResponse(
        res,
        502,
        "Email verified, but we could not send the phone verification code. Please try sending the phone code again.",
        {
          registrationToken:
            registrationVerificationToken,

          emailVerified: true,

          phoneVerified: false,

          nextStep: "phone-verification",
        }
      );
    }

    // --------------------------------------------------------
    // Make sure Robase returned OTP ID
    // --------------------------------------------------------

    if (
      !phoneOtpResult?.success ||
      !phoneOtpResult?.otpId
    ) {
      return sendResponse(
        res,
        502,
        phoneOtpResult?.error ||
          "Email verified, but we could not send the phone verification code.",
        {
          registrationToken:
            registrationVerificationToken,

          emailVerified: true,

          phoneVerified: false,

          nextStep: "phone-verification",
        }
      );
    }

    // --------------------------------------------------------
    // Store Robase OTP ID
    // --------------------------------------------------------

    user.phoneVerificationToken =
      phoneOtpResult.otpId;

    user.phoneVerificationExpire =
      getExpirationDate(
        PHONE_VERIFICATION_MINUTES
      );

    await user.save({
      validateBeforeSave: false,
    });

    // --------------------------------------------------------
    // Response
    // --------------------------------------------------------

    return sendResponse(
      res,
      200,
      "Email verified successfully. A phone verification code has been sent.",
      {
        registrationToken:
          registrationVerificationToken,

        emailVerified: true,

        phoneVerified: false,

        nextStep: "phone-verification",

        phone: user.phone,
      }
    );
  }
);

/* ============================================================
   RESEND EMAIL VERIFICATION
   ============================================================ */

/**
 * PUBLIC ENDPOINT
 *
 * The user is not logged in yet, therefore this endpoint
 * cannot depend on req.user.
 */
export const resendVerification =
  asyncHandler(async (req, res) => {
    const { email } = req.body;

    // --------------------------------------------------------
    // Validate email
    // --------------------------------------------------------

    if (!email) {
      return sendResponse(
        res,
        400,
        "Email is required"
      );
    }

    const normalizedEmail = String(email)
      .trim()
      .toLowerCase();

    // --------------------------------------------------------
    // Find user
    // --------------------------------------------------------

    const user = await User.findOne({
      email: normalizedEmail,
    }).select(
      "+emailVerificationToken +emailVerificationExpire"
    );

    if (!user) {
      return sendResponse(
        res,
        404,
        "No account was found with this email"
      );
    }

    // --------------------------------------------------------
    // Already verified
    // --------------------------------------------------------

    if (user.isEmailVerified) {
      return sendResponse(
        res,
        400,
        "Your email is already verified"
      );
    }

    // --------------------------------------------------------
    // Generate new email OTP
    // --------------------------------------------------------

    const emailVerificationToken =
      generateOTP();

    user.emailVerificationToken =
      emailVerificationToken;

    user.emailVerificationExpire =
      getExpirationDate(
        EMAIL_VERIFICATION_MINUTES
      );

    await user.save({
      validateBeforeSave: false,
    });

    // --------------------------------------------------------
    // Send email
    // --------------------------------------------------------

    try {
      await sendEmail({
        to: user.email,

        subject:
          EMAIL_SUBJECTS.VERIFY_EMAIL,

        html: verifyEmailTemplate({
          firstName: user.firstName,
          token: emailVerificationToken,
        }),
      });
    } catch (error) {
      console.error(
        "Resend verification email failed:",
        error.message
      );

      return sendResponse(
        res,
        502,
        "Unable to send verification email. Please try again."
      );
    }

    // --------------------------------------------------------
    // Response
    // --------------------------------------------------------

    return sendResponse(
      res,
      200,
      "A new email verification code has been sent"
    );
  });

/* ============================================================
   SEND PHONE OTP
   ============================================================ */

/**
 * PUBLIC ENDPOINT
 *
 * Used after email verification.
 *
 * Request:
 *
 * {
 *   registrationToken: "..."
 * }
 */
export const sendPhoneOTP =
  asyncHandler(async (req, res) => {
    const {
      registrationToken,
    } = req.body;

    // --------------------------------------------------------
    // Validate registration token
    // --------------------------------------------------------

    if (!registrationToken) {
      return sendResponse(
        res,
        400,
        "Registration verification token is required"
      );
    }

    // --------------------------------------------------------
    // Find registration session
    // --------------------------------------------------------

    const user = await User.findOne({
      registrationVerificationToken:
        String(registrationToken).trim(),

      registrationVerificationExpire: {
        $gt: new Date(),
      },
    }).select(
      "+registrationVerificationToken +registrationVerificationExpire"
    );

    if (!user) {
      return sendResponse(
        res,
        400,
        "Registration verification session is invalid or expired. Please verify your email again."
      );
    }

    // --------------------------------------------------------
    // Email must already be verified
    // --------------------------------------------------------

    if (!user.isEmailVerified) {
      return sendResponse(
        res,
        403,
        "Please verify your email before verifying your phone."
      );
    }

    // --------------------------------------------------------
    // Phone already verified
    // --------------------------------------------------------

    if (user.isPhoneVerified) {
      return sendResponse(
        res,
        400,
        "Your phone number is already verified"
      );
    }

    // --------------------------------------------------------
    // Check phone
    // --------------------------------------------------------

    if (!user.phone) {
      return sendResponse(
        res,
        400,
        "No phone number is associated with this account"
      );
    }

    // --------------------------------------------------------
    // Send Robase OTP
    // --------------------------------------------------------

    let result;

    try {
      result = await sendOTP(user.phone);
    } catch (error) {
      console.error(
        "Phone OTP send failed:",
        error.message
      );

      return sendResponse(
        res,
        502,
        "Unable to send phone verification code. Please try again."
      );
    }

    if (
      !result?.success ||
      !result?.otpId
    ) {
      return sendResponse(
        res,
        502,
        result?.error ||
          "Unable to send phone verification code"
      );
    }

    // --------------------------------------------------------
    // Store Robase OTP ID
    // --------------------------------------------------------

    user.phoneVerificationToken =
      result.otpId;

    user.phoneVerificationExpire =
      getExpirationDate(
        PHONE_VERIFICATION_MINUTES
      );

    await user.save({
      validateBeforeSave: false,
    });

    // --------------------------------------------------------
    // Response
    // --------------------------------------------------------

    return sendResponse(
      res,
      200,
      "Phone verification code sent successfully",
      {
        nextStep: "phone-verification",
        phone: user.phone,
      }
    );
  });

/* ============================================================
   VERIFY PHONE
   ============================================================ */

/**
 * PUBLIC ENDPOINT
 *
 * Request:
 *
 * {
 *   registrationToken: "...",
 *   otpId: "...",
 *   code: "123456"
 * }
 *
 * Successful result:
 *
 * Email verified
 * Phone verified
 * Registration complete
 * No JWT yet
 */
export const verifyPhone =
  asyncHandler(async (req, res) => {
    const {
      registrationToken,
      otpId,
      code,
    } = req.body;

    // --------------------------------------------------------
    // Validate input
    // --------------------------------------------------------

    if (!registrationToken) {
      return sendResponse(
        res,
        400,
        "Registration verification token is required"
      );
    }

    if (!otpId) {
      return sendResponse(
        res,
        400,
        "OTP ID is required"
      );
    }

    if (!code) {
      return sendResponse(
        res,
        400,
        "OTP code is required"
      );
    }

    // --------------------------------------------------------
    // Find registration session
    // --------------------------------------------------------

    const user = await User.findOne({
      registrationVerificationToken:
        String(registrationToken).trim(),

      registrationVerificationExpire: {
        $gt: new Date(),
      },
    }).select(
      "+registrationVerificationToken +registrationVerificationExpire +phoneVerificationToken +phoneVerificationExpire"
    );

    if (!user) {
      return sendResponse(
        res,
        400,
        "Registration verification session is invalid or expired. Please verify your email again."
      );
    }

    // --------------------------------------------------------
    // Email must be verified
    // --------------------------------------------------------

    if (!user.isEmailVerified) {
      return sendResponse(
        res,
        403,
        "Please verify your email first."
      );
    }

    // --------------------------------------------------------
    // Already verified
    // --------------------------------------------------------

    if (user.isPhoneVerified) {
      return sendResponse(
        res,
        400,
        "Your phone number is already verified"
      );
    }

    // --------------------------------------------------------
    // Check stored OTP ID
    // --------------------------------------------------------

    if (
      !user.phoneVerificationToken ||
      user.phoneVerificationToken !==
        String(otpId).trim()
    ) {
      return sendResponse(
        res,
        400,
        "Invalid OTP"
      );
    }

    // --------------------------------------------------------
    // Check local OTP expiration
    // --------------------------------------------------------

    if (
      !user.phoneVerificationExpire ||
      user.phoneVerificationExpire < new Date()
    ) {
      return sendResponse(
        res,
        400,
        "OTP has expired. Please request a new code."
      );
    }

    // --------------------------------------------------------
    // Verify OTP with Robase
    // --------------------------------------------------------

    let result;

    try {
      result = await verifyOTP(
        otpId,
        code
      );
    } catch (error) {
      console.error(
        "Robase phone OTP verification failed:",
        error.message
      );

      return sendResponse(
        res,
        400,
        "Invalid or expired OTP"
      );
    }

    if (!result?.success) {
      return sendResponse(
        res,
        400,
        result?.error ||
          "Invalid or expired OTP"
      );
    }

    // --------------------------------------------------------
    // Mark phone verified
    // --------------------------------------------------------

    user.isPhoneVerified = true;

    user.phoneVerificationToken =
      undefined;

    user.phoneVerificationExpire =
      undefined;

    // --------------------------------------------------------
    // Registration session is now complete.
    //
    // Clear the temporary registration token.
    // --------------------------------------------------------

    user.registrationVerificationToken =
      undefined;

    user.registrationVerificationExpire =
      undefined;

    await user.save({
      validateBeforeSave: false,
    });

    // --------------------------------------------------------
    // Audit phone verification
    // --------------------------------------------------------

    await createAuditLog({
      actor: user._id,
      actorRole: user.role,
      action: `Phone number verified: ${user.phone}`,
      req,
    });

    // --------------------------------------------------------
    // SEND WELCOME EMAIL
    //
    // This happens ONLY after both:
    //
    // Email = verified
    // Phone = verified
    // --------------------------------------------------------

    try {
      await sendEmail({
        to: user.email,

        subject:
          EMAIL_SUBJECTS.WELCOME,

        html: welcomeTemplate({
          firstName: user.firstName,
          lastName: user.lastName,
        }),
      });
    } catch (error) {
      /*
       * Do not fail registration because of a welcome-email
       * delivery problem.
       *
       * The account is already completely verified.
       */
      console.error(
        "Welcome email failed:",
        error.message
      );
    }

    // --------------------------------------------------------
    // Audit completed registration
    // --------------------------------------------------------

    await createAuditLog({
      actor: user._id,
      actorRole: user.role,
      action: `Registration verification completed: ${user.email}`,
      req,
    });

    // --------------------------------------------------------
    // FINAL RESPONSE
    //
    // IMPORTANT:
    //
    // Still do NOT authenticate here.
    //
    // User should now be redirected to LOGIN.
    // --------------------------------------------------------

    return sendResponse(
      res,
      200,
      "Registration completed successfully. You can now log in.",
      {
        registration: {
          complete: true,
          emailVerified:
            user.isEmailVerified,
          phoneVerified:
            user.isPhoneVerified,
          nextStep: "login",
        },
      }
    );
  });

/* ============================================================
   UPDATE PHONE NUMBER
   ============================================================ */

/**
 * AUTHENTICATED ENDPOINT
 *
 * Used by an already logged-in user to change their phone.
 *
 * After changing the phone:
 *
 * isPhoneVerified = false
 *
 * A new OTP is sent.
 */
export const updatePhone =
  asyncHandler(async (req, res) => {
    const {
      phone,
    } = req.body;

    // --------------------------------------------------------
    // Validate phone
    // --------------------------------------------------------

    if (!phone) {
      return sendResponse(
        res,
        400,
        "Phone number is required"
      );
    }

    const normalizedPhone =
      normalizePhone(phone);

    if (!normalizedPhone) {
      return sendResponse(
        res,
        400,
        "Please enter a valid phone number"
      );
    }

    // --------------------------------------------------------
    // Check if phone belongs to another user
    // --------------------------------------------------------

    const existingUser =
      await User.findOne({
        phone: normalizedPhone,

        _id: {
          $ne: req.user._id,
        },
      });

    if (existingUser) {
      return sendResponse(
        res,
        409,
        "This phone number is already associated with another account"
      );
    }

    // --------------------------------------------------------
    // Get current user
    // --------------------------------------------------------

    const user = await User.findById(
      req.user._id
    );

    if (!user) {
      return sendResponse(
        res,
        404,
        "User account not found"
      );
    }

    // --------------------------------------------------------
    // Update phone
    // --------------------------------------------------------

    user.phone = normalizedPhone;

    user.isPhoneVerified = false;

    user.phoneVerificationToken =
      undefined;

    user.phoneVerificationExpire =
      undefined;

    await user.save({
      validateBeforeSave: false,
    });

    // --------------------------------------------------------
    // Send new OTP
    // --------------------------------------------------------

    let result;

    try {
      result = await sendOTP(
        user.phone
      );
    } catch (error) {
      console.error(
        "Phone update OTP failed:",
        error.message
      );

      return sendResponse(
        res,
        502,
        "Phone number was updated, but the verification code could not be sent. Please request a new code."
      );
    }

    if (
      !result?.success ||
      !result?.otpId
    ) {
      return sendResponse(
        res,
        502,
        result?.error ||
          "Phone number was updated, but the verification code could not be sent."
      );
    }

    // --------------------------------------------------------
    // Store new OTP
    // --------------------------------------------------------

    user.phoneVerificationToken =
      result.otpId;

    user.phoneVerificationExpire =
      getExpirationDate(
        PHONE_VERIFICATION_MINUTES
      );

    await user.save({
      validateBeforeSave: false,
    });

    // --------------------------------------------------------
    // Response
    // --------------------------------------------------------

    return sendResponse(
      res,
      200,
      "Phone number updated. Verification code sent successfully.",
      {
        phone: user.phone,
        phoneVerified: false,
      }
    );
  });

/* ============================================================
   CHECK VERIFICATION STATUS
   ============================================================ */

export const getVerificationStatus =
  asyncHandler(async (req, res) => {
    const user =
      await User.findById(
        req.user._id
      ).select(
        "isEmailVerified isPhoneVerified email phone role status"
      );

    if (!user) {
      return sendResponse(
        res,
        404,
        "User account not found"
      );
    }

    return sendResponse(
      res,
      200,
      "Verification status retrieved successfully",
      {
        verification: {
          email: {
            verified:
              user.isEmailVerified,
          },

          phone: {
            verified:
              user.isPhoneVerified,
          },

          complete:
            user.isEmailVerified &&
            user.isPhoneVerified,
        },
      }
    );
  });
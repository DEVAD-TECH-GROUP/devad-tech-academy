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

import welcomeTemplate from "../../templates/email/welcome.js";
import verifyEmailTemplate from "../../templates/email/verifyEmail.js";

import {
  EMAIL_SUBJECTS,
  ROLES,
  AUDIT_TYPES,
} from "../../utils/constants.js";

import auditLogger from "../../services/audit/auditLogger.js";

/* ============================================================
   REGISTER
   ============================================================ */

export const register = asyncHandler(async (req, res) => {
  // ----------------------------------------------------------
  // Validate request
  // ----------------------------------------------------------

  const { error } = registerValidator.validate(req.body);

  if (error) {
    return sendResponse(
      res,
      400,
      error.details[0]?.message || "Invalid registration details"
    );
  }

  // ----------------------------------------------------------
  // Extract fields
  // ----------------------------------------------------------

  const {
    firstName,
    lastName,
    email,
    password,
    phone,
    role,
    referralCode,
  } = req.body;

  // ----------------------------------------------------------
  // Normalize email
  // ----------------------------------------------------------

  const normalizedEmail = String(email).trim().toLowerCase();

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
  // Phone is required for manual registration
  // ----------------------------------------------------------

  if (!phone) {
    return sendResponse(
      res,
      400,
      "Phone number is required for registration"
    );
  }

  // ----------------------------------------------------------
  // Check existing phone
  // ----------------------------------------------------------

  const existingPhone = await User.findOne({
    phone: String(phone).trim(),
  });

  if (existingPhone) {
    return sendResponse(
      res,
      409,
      "An account with this phone number already exists"
    );
  }

  // ----------------------------------------------------------
  // Validate role
  // ----------------------------------------------------------

  const allowedRoles = [
    ROLES.STUDENT,
    ROLES.INSTRUCTOR,
    ROLES.SUPER_ADMIN,
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
    const referringUser = await User.findOne({
      referralCode: String(referralCode).trim().toUpperCase(),
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

  const emailVerificationExpire = new Date(
    Date.now() + 10 * 60 * 1000
  );

  // ----------------------------------------------------------
  // Generate referral code for new user
  // ----------------------------------------------------------

  let newReferralCode = generateReferralCode();

  // Make sure referral code is unique
  let referralExists = await User.findOne({
    referralCode: newReferralCode,
  });

  while (referralExists) {
    newReferralCode = generateReferralCode();

    referralExists = await User.findOne({
      referralCode: newReferralCode,
    });
  }

  // ----------------------------------------------------------
  // Create user
  // ----------------------------------------------------------

  const user = await User.create({
    firstName: String(firstName).trim(),
    lastName: String(lastName).trim(),
    email: normalizedEmail,
    password,
    phone: String(phone).trim(),

    role: selectedRole,

    status: "active",

    referralCode: newReferralCode,
    referredBy,

    isEmailVerified: false,
    emailVerificationToken,
    emailVerificationExpire,

    isPhoneVerified: false,

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

    if (selectedRole === ROLES.SUPER_ADMIN) {
      await SuperAdmin.create({
        user: user._id,
      });
    }
  } catch (profileError) {
    // Remove user if role profile creation fails
    await User.findByIdAndDelete(user._id);

    throw profileError;
  }

  // ----------------------------------------------------------
  // Send Robase phone OTP
  // ----------------------------------------------------------

  let phoneOtpResult;

  try {
    phoneOtpResult = await sendOTP(user.phone);
  } catch (error) {
    // Account has been created but phone OTP failed.
    // User can use resend-phone-otp after authentication.
    console.error(
      "Initial phone OTP failed:",
      error.message
    );
  }

  if (phoneOtpResult?.success && phoneOtpResult?.otpId) {
    user.phoneVerificationToken = phoneOtpResult.otpId;

    user.phoneVerificationExpire = new Date(
      Date.now() + 10 * 60 * 1000
    );

    await user.save({
      validateBeforeSave: false,
    });
  }

  // ----------------------------------------------------------
  // Send welcome email
  // ----------------------------------------------------------

  try {
    await sendEmail({
      to: user.email,
      subject: EMAIL_SUBJECTS.WELCOME,
      html: welcomeTemplate({
        firstName: user.firstName,
        lastName: user.lastName,
      }),
    });
  } catch (error) {
    console.error(
      "Welcome email failed:",
      error.message
    );
  }

  // ----------------------------------------------------------
  // Send email verification
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
    console.error(
      "Verification email failed:",
      error.message
    );
  }

  // ----------------------------------------------------------
  // Audit registration
  // ----------------------------------------------------------

  try {
    await auditLogger({
      actor: user._id,
      actorRole: user.role,
      action: `New account registered: ${user.email}`,
      type: AUDIT_TYPES.AUTH,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });
  } catch (error) {
    console.error(
      "Registration audit log failed:",
      error.message
    );
  }

  // ----------------------------------------------------------
  // Response
  // ----------------------------------------------------------

  return sendTokenResponse(
    user,
    201,
    res,
    "Registration successful. Please verify your email and phone number."
  );
});

/* ============================================================
   LOGIN
   ============================================================ */

export const login = asyncHandler(async (req, res) => {
  // ----------------------------------------------------------
  // Validate request
  // ----------------------------------------------------------

  const { error } = loginValidator.validate(req.body);

  if (error) {
    return sendResponse(
      res,
      400,
      error.details[0]?.message || "Invalid login details"
    );
  }

  const {
    email,
    password,
  } = req.body;

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

  const passwordMatch = await user.comparePassword(password);

  if (!passwordMatch) {
    return sendResponse(
      res,
      401,
      "Invalid email or password"
    );
  }

  // ----------------------------------------------------------
  // Update last login
  // ----------------------------------------------------------

  await user.updateLastLogin();

  // ----------------------------------------------------------
  // Audit login
  // ----------------------------------------------------------

  try {
    await auditLogger({
      actor: user._id,
      actorRole: user.role,
      action: `User logged in: ${user.email}`,
      type: AUDIT_TYPES.AUTH,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });
  } catch (error) {
    console.error(
      "Login audit log failed:",
      error.message
    );
  }

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
  // Delete refresh token
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
    secure: process.env.NODE_ENV === "production",
    sameSite:
      process.env.NODE_ENV === "production"
        ? "none"
        : "lax",
    expires: new Date(0),
  });

  // ----------------------------------------------------------
  // Audit logout
  // ----------------------------------------------------------

  try {
    if (req.user?._id) {
      await auditLogger({
        actor: req.user._id,
        actorRole: req.user.role,
        action: `User logged out: ${req.user.email}`,
        type: AUDIT_TYPES.AUTH,
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
      });
    }
  } catch (error) {
    console.error(
      "Logout audit log failed:",
      error.message
    );
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
  const user = await User.findById(req.user._id);

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

export const verifyEmail = asyncHandler(async (req, res) => {
  const {
    token,
  } = req.body;

  if (!token) {
    return sendResponse(
      res,
      400,
      "Email verification token is required"
    );
  }

  // ----------------------------------------------------------
  // Find user
  // ----------------------------------------------------------

  const user = await User.findOne({
    emailVerificationToken: token,
    emailVerificationExpire: {
      $gt: new Date(),
    },
  });

  if (!user) {
    return sendResponse(
      res,
      400,
      "Invalid or expired email verification token"
    );
  }

  // ----------------------------------------------------------
  // Verify email
  // ----------------------------------------------------------

  user.isEmailVerified = true;

  user.emailVerificationToken = undefined;
  user.emailVerificationExpire = undefined;

  await user.save({
    validateBeforeSave: false,
  });

  // ----------------------------------------------------------
  // Audit
  // ----------------------------------------------------------

  try {
    await auditLogger({
      actor: user._id,
      actorRole: user.role,
      action: `Email verified: ${user.email}`,
      type: AUDIT_TYPES.AUTH,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });
  } catch (error) {
    console.error(
      "Email verification audit failed:",
      error.message
    );
  }

  return sendResponse(
    res,
    200,
    "Email verified successfully"
  );
});

/* ============================================================
   RESEND EMAIL VERIFICATION
   ============================================================ */

export const resendVerification = asyncHandler(
  async (req, res) => {
    const user = await User.findById(req.user._id);

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
    // Generate new OTP
    // --------------------------------------------------------

    const emailVerificationToken = generateOTP();

    user.emailVerificationToken =
      emailVerificationToken;

    user.emailVerificationExpire = new Date(
      Date.now() + 10 * 60 * 1000
    );

    await user.save({
      validateBeforeSave: false,
    });

    // --------------------------------------------------------
    // Send email
    // --------------------------------------------------------

    await sendEmail({
      to: user.email,
      subject: EMAIL_SUBJECTS.VERIFY_EMAIL,
      html: verifyEmailTemplate({
        firstName: user.firstName,
        token: emailVerificationToken,
      }),
    });

    return sendResponse(
      res,
      200,
      "A new email verification code has been sent"
    );
  }
);

/* ============================================================
   SEND PHONE OTP
   ============================================================ */

export const sendPhoneOTP = asyncHandler(
  async (req, res) => {
    const user = await User.findById(req.user._id);

    if (!user) {
      return sendResponse(
        res,
        404,
        "User account not found"
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
    // Send Robase OTP
    // --------------------------------------------------------

    const result = await sendOTP(user.phone);

    if (!result?.success || !result?.otpId) {
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

    user.phoneVerificationToken = result.otpId;

    user.phoneVerificationExpire = new Date(
      Date.now() + 10 * 60 * 1000
    );

    await user.save({
      validateBeforeSave: false,
    });

    return sendResponse(
      res,
      200,
      "Phone verification code sent successfully"
    );
  }
);

/* ============================================================
   VERIFY PHONE
   ============================================================ */

export const verifyPhone = asyncHandler(
  async (req, res) => {
    const {
      otpId,
      code,
    } = req.body;

    // --------------------------------------------------------
    // Validate input
    // --------------------------------------------------------

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
    // Find user using stored Robase OTP ID
    // --------------------------------------------------------

    const user = await User.findOne({
      phoneVerificationToken: otpId,
    });

    if (!user) {
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
      user.phoneVerificationExpire &&
      user.phoneVerificationExpire < new Date()
    ) {
      return sendResponse(
        res,
        400,
        "OTP has expired. Please request a new code."
      );
    }

    // --------------------------------------------------------
    // Verify with Robase
    // --------------------------------------------------------

    const result = await verifyOTP(
      otpId,
      code
    );

    if (!result?.success) {
      return sendResponse(
        res,
        400,
        result?.error ||
          "Invalid or expired OTP"
      );
    }

    // --------------------------------------------------------
    // Mark phone as verified
    // --------------------------------------------------------

    user.isPhoneVerified = true;

    user.phoneVerificationToken = undefined;
    user.phoneVerificationExpire = undefined;

    await user.save({
      validateBeforeSave: false,
    });

    // --------------------------------------------------------
    // Audit
    // --------------------------------------------------------

    try {
      await auditLogger({
        actor: user._id,
        actorRole: user.role,
        action: `Phone number verified: ${user.phone}`,
        type: AUDIT_TYPES.AUTH,
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
      });
    } catch (error) {
      console.error(
        "Phone verification audit failed:",
        error.message
      );
    }

    return sendResponse(
      res,
      200,
      "Phone number verified successfully"
    );
  }
);

/* ============================================================
   UPDATE PHONE NUMBER
   ============================================================ */

export const updatePhone = asyncHandler(
  async (req, res) => {
    const {
      phone,
    } = req.body;

    if (!phone) {
      return sendResponse(
        res,
        400,
        "Phone number is required"
      );
    }

    const normalizedPhone = String(phone)
      .trim();

    // --------------------------------------------------------
    // Check if phone belongs to another user
    // --------------------------------------------------------

    const existingUser = await User.findOne({
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

    user.phoneVerificationToken = undefined;
    user.phoneVerificationExpire = undefined;

    await user.save({
      validateBeforeSave: false,
    });

    // --------------------------------------------------------
    // Send new OTP
    // --------------------------------------------------------

    const result = await sendOTP(
      user.phone
    );

    if (!result?.success || !result?.otpId) {
      return sendResponse(
        res,
        502,
        result?.error ||
          "Phone number updated but verification code could not be sent"
      );
    }

    user.phoneVerificationToken =
      result.otpId;

    user.phoneVerificationExpire =
      new Date(
        Date.now() + 10 * 60 * 1000
      );

    await user.save({
      validateBeforeSave: false,
    });

    return sendResponse(
      res,
      200,
      "Phone number updated. Verification code sent successfully."
    );
  }
);

/* ============================================================
   CHECK VERIFICATION STATUS
   ============================================================ */

export const getVerificationStatus =
  asyncHandler(async (req, res) => {
    const user = await User.findById(
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
            verified: user.isEmailVerified,
          },

          phone: {
            verified: user.isPhoneVerified,
          },

          complete:
            user.isEmailVerified &&
            user.isPhoneVerified,
        },
      }
    );
  });
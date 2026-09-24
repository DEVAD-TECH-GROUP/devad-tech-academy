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

const EMAIL_VERIFICATION_MINUTES = 10;

const PHONE_VERIFICATION_MINUTES = 10;

const REGISTRATION_SESSION_MINUTES = 15;

/* ============================================================
   HELPERS
   ============================================================ */

const generateRegistrationVerificationToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

const getExpirationDate = (minutes) => {
  return new Date(Date.now() + minutes * 60 * 1000);
};

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
 * Register
 *    ↓
 * Create account
 *    ↓
 * Send email verification OTP
 *    ↓
 * Email verification
 *
 * IMPORTANT:
 *
 * Phone is NOT collected here.
 * Phone is collected only after email verification.
 *
 * No JWT is issued here.
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
  //
  // IMPORTANT:
  // There is NO phone here.
  // ----------------------------------------------------------

  const {
    firstName,
    lastName,
    email,
    password,
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
  // CREATE USER
  //
  // IMPORTANT:
  //
  // No phone is saved here.
  // No phone OTP is sent here.
  // No welcome email is sent here.
  // No JWT is issued here.
  // ----------------------------------------------------------

  const user = await User.create({
    firstName: String(firstName).trim(),

    lastName: String(lastName).trim(),

    email: normalizedEmail,

    password,

    // NO PHONE HERE

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
  // CREATE ROLE-SPECIFIC PROFILE
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
    await User.findByIdAndDelete(user._id);

    throw profileError;
  }

  // ----------------------------------------------------------
  // SEND EMAIL VERIFICATION OTP
  // ----------------------------------------------------------

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
      "Verification email failed:",
      error.message
    );
  }

  // ----------------------------------------------------------
  // AUDIT REGISTRATION
  // ----------------------------------------------------------

  await createAuditLog({
    actor: user._id,

    actorRole: user.role,

    action:
      `New account registered: ${user.email}`,

    req,
  });

  // ----------------------------------------------------------
  // RESPONSE
  // ----------------------------------------------------------

  return sendResponse(
    res,
    201,
    "Registration successful. Please verify your email.",
    {
      registration: {
        userId: user._id,

        email: user.email,

        phone: null,

        emailVerified: false,

        phoneVerified: false,

        nextStep:
          "email-verification",
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
 *      +
 * Phone verified
 *      +
 * Correct password
 *      ↓
 * JWT/session issued
 */

export const login = asyncHandler(async (req, res) => {
  // ----------------------------------------------------------
  // Validate request
  // ----------------------------------------------------------

  const {
    error,
    value,
  } = loginValidator(req.body);

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
  // ACCOUNT STATUS
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
  // PASSWORD
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
  // UPDATE LAST LOGIN
  // ----------------------------------------------------------

  await user.updateLastLogin();

  // ----------------------------------------------------------
  // AUDIT LOGIN
  // ----------------------------------------------------------

  await createAuditLog({
    actor: user._id,

    actorRole: user.role,

    action:
      `User logged in: ${user.email}`,

    req,
  });

  // ----------------------------------------------------------
  // AUTHENTICATE
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
  if (req.user?._id) {
    await Token.deleteMany({
      user: req.user._id,
    });
  }

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

  if (req.user?._id) {
    await createAuditLog({
      actor: req.user._id,

      actorRole: req.user.role,

      action:
        `User logged out: ${req.user.email}`,

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
 *      ↓
 * Create temporary registration session
 *      ↓
 * Ask frontend for phone
 *
 * IMPORTANT:
 *
 * Phone OTP is NOT sent here because the user
 * has not entered their phone yet.
 */

export const verifyEmail = asyncHandler(
  async (req, res) => {
    const {
      email,
      token,
    } = req.body;

    // --------------------------------------------------------
    // VALIDATE INPUT
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
    // NORMALIZE EMAIL
    // --------------------------------------------------------

    const normalizedEmail = String(email)
      .trim()
      .toLowerCase();

    // --------------------------------------------------------
    // FIND USER
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
    // ALREADY VERIFIED
    // --------------------------------------------------------

    if (user.isEmailVerified) {
      return sendResponse(
        res,
        400,
        "Your email is already verified"
      );
    }

    // --------------------------------------------------------
    // CHECK TOKEN
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
    // CHECK EXPIRATION
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
    // VERIFY EMAIL
    // --------------------------------------------------------

    user.isEmailVerified = true;

    user.emailVerificationToken =
      undefined;

    user.emailVerificationExpire =
      undefined;

    // --------------------------------------------------------
    // CREATE TEMPORARY REGISTRATION SESSION
    //
    // This is NOT a JWT.
    // It does NOT authenticate the user.
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
    // AUDIT EMAIL VERIFICATION
    // --------------------------------------------------------

    await createAuditLog({
      actor: user._id,

      actorRole: user.role,

      action:
        `Email verified: ${user.email}`,

      req,
    });

    // --------------------------------------------------------
    // IMPORTANT
    //
    // DO NOT SEND PHONE OTP HERE.
    //
    // The user has not entered their phone yet.
    // --------------------------------------------------------

    return sendResponse(
      res,
      200,
      "Email verified successfully. Please enter your phone number.",
      {
        registrationToken:
          registrationVerificationToken,

        emailVerified: true,

        phoneVerified: false,

        nextStep:
          "phone-collection",

        email: user.email,
      }
    );
  }
);

/* ============================================================
   RESEND EMAIL VERIFICATION
   ============================================================ */

export const resendVerification =
  asyncHandler(async (req, res) => {
    const {
      email,
    } = req.body;

    // --------------------------------------------------------
    // VALIDATE EMAIL
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
    // FIND USER
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
    // ALREADY VERIFIED
    // --------------------------------------------------------

    if (user.isEmailVerified) {
      return sendResponse(
        res,
        400,
        "Your email is already verified"
      );
    }

    // --------------------------------------------------------
    // GENERATE NEW OTP
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
    // SEND EMAIL
    // --------------------------------------------------------

    try {
      await sendEmail({
        to: user.email,

        subject:
          EMAIL_SUBJECTS.VERIFY_EMAIL,

        html: verifyEmailTemplate({
          firstName: user.firstName,

          token:
            emailVerificationToken,
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
    // RESPONSE
    // --------------------------------------------------------

    return sendResponse(
      res,
      200,
      "A new email verification code has been sent"
    );
  });

/* ============================================================
   UPDATE REGISTRATION PHONE
   ============================================================ */

/**
 * PUBLIC ENDPOINT
 *
 * This is used AFTER email verification.
 *
 * Request:
 *
 * {
 *   registrationToken: "...",
 *   phone: "08012345678"
 * }
 *
 * Flow:
 *
 * Email verified
 *      ↓
 * User enters phone
 *      ↓
 * Normalize phone
 *      ↓
 * Save phone
 *      ↓
 * Send phone OTP
 */

export const updateRegistrationPhone =
  asyncHandler(async (req, res) => {
    const {
      registrationToken,
      phone,
    } = req.body;

    // --------------------------------------------------------
    // VALIDATE REGISTRATION TOKEN
    // --------------------------------------------------------

    if (!registrationToken) {
      return sendResponse(
        res,
        400,
        "Registration verification token is required"
      );
    }

    // --------------------------------------------------------
    // VALIDATE PHONE
    // --------------------------------------------------------

    if (!phone) {
      return sendResponse(
        res,
        400,
        "Phone number is required"
      );
    }

    // --------------------------------------------------------
    // NORMALIZE PHONE
    // --------------------------------------------------------

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
    // FIND REGISTRATION SESSION
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
    // EMAIL MUST BE VERIFIED
    // --------------------------------------------------------

    if (!user.isEmailVerified) {
      return sendResponse(
        res,
        403,
        "Please verify your email before adding your phone number."
      );
    }

    // --------------------------------------------------------
    // CHECK EXISTING PHONE
    // --------------------------------------------------------

    const existingPhone =
      await User.findOne({
        phone: normalizedPhone,

        _id: {
          $ne: user._id,
        },
      });

    if (existingPhone) {
      return sendResponse(
        res,
        409,
        "An account with this phone number already exists"
      );
    }

    // --------------------------------------------------------
    // SAVE PHONE
    // --------------------------------------------------------

    user.phone =
      normalizedPhone;

    user.isPhoneVerified =
      false;

    user.phoneVerificationToken =
      undefined;

    user.phoneVerificationExpire =
      undefined;

    await user.save({
      validateBeforeSave: false,
    });

    // --------------------------------------------------------
    // RESPONSE
    //
    // Frontend will now call sendPhoneOTP().
    // --------------------------------------------------------

    return sendResponse(
      res,
      200,
      "Phone number added successfully.",
      {
        registrationToken:
          registrationToken,

        phone:
          user.phone,

        emailVerified:
          user.isEmailVerified,

        phoneVerified:
          false,

        nextStep:
          "phone-verification",
      }
    );
  });

/* ============================================================
   SEND PHONE OTP
   ============================================================ */

/**
 * PUBLIC ENDPOINT
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
    // VALIDATE REGISTRATION TOKEN
    // --------------------------------------------------------

    if (!registrationToken) {
      return sendResponse(
        res,
        400,
        "Registration verification token is required"
      );
    }

    // --------------------------------------------------------
    // FIND REGISTRATION SESSION
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
    // EMAIL MUST BE VERIFIED
    // --------------------------------------------------------

    if (!user.isEmailVerified) {
      return sendResponse(
        res,
        403,
        "Please verify your email before verifying your phone."
      );
    }

    // --------------------------------------------------------
    // PHONE ALREADY VERIFIED
    // --------------------------------------------------------

    if (user.isPhoneVerified) {
      return sendResponse(
        res,
        400,
        "Your phone number is already verified"
      );
    }

    // --------------------------------------------------------
    // CHECK PHONE
    // --------------------------------------------------------

    if (!user.phone) {
      return sendResponse(
        res,
        400,
        "Please add your phone number before requesting a verification code"
      );
    }

    // --------------------------------------------------------
    // SEND ROBAsE OTP
    // --------------------------------------------------------

    let result;

    try {
      result = await sendOTP(
        user.phone
      );
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

    // --------------------------------------------------------
    // VALIDATE ROBAsE RESPONSE
    // --------------------------------------------------------

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
    // STORE ROBAsE OTP ID
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
    // RESPONSE
    // --------------------------------------------------------

    return sendResponse(
      res,
      200,
      "Phone verification code sent successfully",
      {
        nextStep:
          "phone-verification",

        phone:
          user.phone,

        otpId:
          result.otpId,
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
 *      +
 * Phone verified
 *      ↓
 * Registration complete
 *      ↓
 * Welcome email
 *      ↓
 * Login
 *
 * NO JWT IS ISSUED HERE.
 */

export const verifyPhone =
  asyncHandler(async (req, res) => {
    const {
      registrationToken,
      otpId,
      code,
    } = req.body;

    // --------------------------------------------------------
    // VALIDATE INPUT
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
    // FIND REGISTRATION SESSION
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
    // EMAIL MUST BE VERIFIED
    // --------------------------------------------------------

    if (!user.isEmailVerified) {
      return sendResponse(
        res,
        403,
        "Please verify your email first."
      );
    }

    // --------------------------------------------------------
    // PHONE MUST EXIST
    // --------------------------------------------------------

    if (!user.phone) {
      return sendResponse(
        res,
        400,
        "Please add your phone number before verifying it."
      );
    }

    // --------------------------------------------------------
    // ALREADY VERIFIED
    // --------------------------------------------------------

    if (user.isPhoneVerified) {
      return sendResponse(
        res,
        400,
        "Your phone number is already verified"
      );
    }

    // --------------------------------------------------------
    // CHECK STORED OTP ID
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
    // CHECK LOCAL OTP EXPIRATION
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
    // VERIFY OTP WITH ROBAsE
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
    // MARK PHONE VERIFIED
    // --------------------------------------------------------

    user.isPhoneVerified =
      true;

    user.phoneVerificationToken =
      undefined;

    user.phoneVerificationExpire =
      undefined;

    // --------------------------------------------------------
    // REGISTRATION SESSION COMPLETE
    // --------------------------------------------------------

    user.registrationVerificationToken =
      undefined;

    user.registrationVerificationExpire =
      undefined;

    await user.save({
      validateBeforeSave: false,
    });

    // --------------------------------------------------------
    // AUDIT PHONE VERIFICATION
    // --------------------------------------------------------

    await createAuditLog({
      actor: user._id,

      actorRole: user.role,

      action:
        `Phone number verified: ${user.phone}`,

      req,
    });

    // --------------------------------------------------------
    // BOTH VERIFICATIONS ARE NOW COMPLETE
    //
    // Email = verified
    // Phone = verified
    //
    // ONLY NOW SEND WELCOME EMAIL.
    // --------------------------------------------------------

    if (
      user.isEmailVerified &&
      user.isPhoneVerified
    ) {
      try {
        await sendEmail({
          to: user.email,

          subject:
            EMAIL_SUBJECTS.WELCOME,

          html: welcomeTemplate({
            firstName:
              user.firstName,

            lastName:
              user.lastName,
          }),
        });
      } catch (error) {
        console.error(
          "Welcome email failed:",
          error.message
        );
      }
    }

    // --------------------------------------------------------
    // AUDIT COMPLETED REGISTRATION
    // --------------------------------------------------------

    await createAuditLog({
      actor: user._id,

      actorRole: user.role,

      action:
        `Registration verification completed: ${user.email}`,

      req,
    });

    // --------------------------------------------------------
    // FINAL RESPONSE
    //
    // NO JWT.
    //
    // User goes to LOGIN.
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

          nextStep:
            "login",
        },
      }
    );
  });

/* ============================================================
   UPDATE PHONE
   ============================================================ */

/**
 * AUTHENTICATED ENDPOINT
 *
 * Used by an already logged-in user to change
 * their phone number.
 */

export const updatePhone =
  asyncHandler(async (req, res) => {
    const {
      phone,
    } = req.body;

    // --------------------------------------------------------
    // VALIDATE PHONE
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
    // CHECK EXISTING PHONE
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
    // GET CURRENT USER
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
    // UPDATE PHONE
    // --------------------------------------------------------

    user.phone =
      normalizedPhone;

    user.isPhoneVerified =
      false;

    user.phoneVerificationToken =
      undefined;

    user.phoneVerificationExpire =
      undefined;

    await user.save({
      validateBeforeSave: false,
    });

    // --------------------------------------------------------
    // SEND NEW OTP
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
    // STORE OTP
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
    // RESPONSE
    // --------------------------------------------------------

    return sendResponse(
      res,
      200,
      "Phone number updated. Verification code sent successfully.",
      {
        phone:
          user.phone,

        phoneVerified:
          false,
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
  
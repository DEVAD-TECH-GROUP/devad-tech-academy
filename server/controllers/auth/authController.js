// controllers/auth/authController.js

import crypto from "crypto";

import User from "../../models/user/User.js";
import Student from "../../models/user/Student.js";
import Instructor from "../../models/user/Instructor.js";
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

import env from "../../config/env.js";

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

/**
 * Generate a secure temporary registration verification token.
 *
 * This is different from the 6-digit email OTP.
 * The OTP verifies the email.
 * This token keeps the user inside the registration flow
 * while they proceed to phone verification.
 */
const generateRegistrationVerificationToken = () => {
  return crypto.randomBytes(32).toString("hex");
};


/**
 * Generate an expiration date from a number of minutes.
 */
const getExpirationDate = (minutes) => {
  return new Date(Date.now() + minutes * 60 * 1000);
};


/**
 * Create an email verification URL.
 *
 * The frontend can read the email and token from the URL.
 */
const createEmailVerificationUrl = (email, otp) => {
  const baseUrl = String(env.CLIENT_URL || "").replace(/\/+$/, "");

  return `${baseUrl}/auth/verify-email?email=${encodeURIComponent(
    email
  )}&token=${encodeURIComponent(otp)}`;
};


/**
 * Safely render an email template.
 *
 * Supports templates that return:
 *
 * 1. A string
 * 2. { htmlContent: "..." }
 * 3. { html: "..." }
 *
 * This prevents undefined HTML from silently being sent
 * to Brevo.
 */
const renderEmailTemplate = (template, data) => {
  const rendered = template(data);

  if (typeof rendered === "string") {
    return rendered.trim();
  }

  if (
    rendered &&
    typeof rendered.htmlContent === "string"
  ) {
    return rendered.htmlContent.trim();
  }

  if (
    rendered &&
    typeof rendered.html === "string"
  ) {
    return rendered.html.trim();
  }

  return "";
};


/**
 * Create an authentication audit log.
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
      ipAddress: req.ip || null,
      userAgent: req.headers["user-agent"] || null,
      endpoint: req.originalUrl || req.url || null,
      method: req.method || null,
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
 * @route   POST /api/auth/register
 * @desc    Register a new student/instructor
 * @access  Public
 */
export const register = asyncHandler(async (req, res) => {
  /* ----------------------------------------------------------
     Validate request
     ---------------------------------------------------------- */

  const { error, value } = registerValidator(req.body);

  if (error) {
    return sendResponse(
      res,
      400,
      error.details[0]?.message ||
        "Invalid registration details"
    );
  }


  /* ----------------------------------------------------------
     Extract data
     ---------------------------------------------------------- */

  const {
    firstName,
    lastName,
    email,
    password,
    role,
    referralCode,
  } = value;


  const normalizedEmail = String(email)
    .trim()
    .toLowerCase();


  /* ----------------------------------------------------------
     Check existing email
     ---------------------------------------------------------- */

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


  /* ----------------------------------------------------------
     Validate public registration roles
     ---------------------------------------------------------- */

  const allowedRoles = [
    ROLES.STUDENT,
    ROLES.INSTRUCTOR,
  ];

  const selectedRole =
    role || ROLES.STUDENT;

  if (!allowedRoles.includes(selectedRole)) {
    return sendResponse(
      res,
      400,
      "Invalid account role"
    );
  }


  /* ----------------------------------------------------------
     Referral
     ---------------------------------------------------------- */

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


  /* ----------------------------------------------------------
     Generate email verification OTP
     ---------------------------------------------------------- */

  const emailVerificationToken =
    generateOTP();

  const emailVerificationExpire =
    getExpirationDate(
      EMAIL_VERIFICATION_MINUTES
    );


  /* ----------------------------------------------------------
     Generate unique referral code
     ---------------------------------------------------------- */

  let newReferralCode =
    generateReferralCode(
      `${firstName} ${lastName}`
    );

  let referralExists =
    await User.findOne({
      referralCode: newReferralCode,
    });

  while (referralExists) {
    newReferralCode =
      generateReferralCode(
        `${firstName} ${lastName}`
      );

    referralExists =
      await User.findOne({
        referralCode: newReferralCode,
      });
  }


  /* ----------------------------------------------------------
     Create user
     ---------------------------------------------------------- */

  const user = await User.create({
    firstName: String(firstName).trim(),
    lastName: String(lastName).trim(),

    email: normalizedEmail,

    password,

    role: selectedRole,

    status: "active",

    referralCode: newReferralCode,

    referredBy,

    isEmailVerified: false,

    emailVerificationToken,

    emailVerificationExpire,

    isPhoneVerified: false,

    phoneVerificationToken: undefined,

    phoneVerificationExpire: undefined,

    isGoogleAuth: false,
  });


  /* ----------------------------------------------------------
     Create role profile
     ---------------------------------------------------------- */

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
  } catch (profileError) {
    await User.findByIdAndDelete(
      user._id
    );

    throw profileError;
  }


  /* ----------------------------------------------------------
     Create verification URL
     ---------------------------------------------------------- */

  const verificationUrl =
    createEmailVerificationUrl(
      user.email,
      emailVerificationToken
    );


  /* ----------------------------------------------------------
     Render verification email
     ---------------------------------------------------------- */

  let verificationHtml = "";

  try {
    verificationHtml =
      renderEmailTemplate(
        verifyEmailTemplate,
        {
          firstName: user.firstName,

          verificationUrl,

          // IMPORTANT:
          // verifyEmail.js expects "otp"
          otp: emailVerificationToken,
        }
      );
  } catch (templateError) {
    console.error(
      "Verification email template failed:",
      templateError.message
    );
  }


  /* ----------------------------------------------------------
     Send verification email
     ---------------------------------------------------------- */

  try {
    await sendEmail({
      to: user.email,

      subject:
        EMAIL_SUBJECTS.VERIFY_EMAIL,

      ...(verificationHtml && {
        htmlContent: verificationHtml,
      }),

      // Always provide a text fallback.
      textContent: `Hi ${
        user.firstName
      }, your Devad Tech Academy email verification code is ${
        emailVerificationToken
      }. This code is valid for ${EMAIL_VERIFICATION_MINUTES} minutes.`,
    });

    console.log(
      `✅ Verification email sent to ${user.email}`
    );
  } catch (emailError) {
    console.error(
      "Verification email failed:",
      emailError?.message ||
        emailError
    );
  }


  /* ----------------------------------------------------------
     Audit
     ---------------------------------------------------------- */

  await createAuditLog({
    actor: user._id,
    actorRole: user.role,

    action: `New account registered: ${user.email}`,

    req,
  });


  /* ----------------------------------------------------------
     Response
     ---------------------------------------------------------- */

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
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
export const login = asyncHandler(async (req, res) => {
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


  const normalizedEmail =
    String(email)
      .trim()
      .toLowerCase();


  /* ----------------------------------------------------------
     Find user
     ---------------------------------------------------------- */

  const user =
    await User.findOne({
      email: normalizedEmail,
    }).select("+password");


  if (!user) {
    return sendResponse(
      res,
      401,
      "Invalid email or password"
    );
  }


  /* ----------------------------------------------------------
     Account status
     ---------------------------------------------------------- */

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


  /* ----------------------------------------------------------
     Password
     ---------------------------------------------------------- */

  const passwordMatch =
    await user.comparePassword(
      password
    );

  if (!passwordMatch) {
    return sendResponse(
      res,
      401,
      "Invalid email or password"
    );
  }


  /* ----------------------------------------------------------
     Email verification
     ---------------------------------------------------------- */

  if (!user.isPhoneVerified) {
  const phoneVerificationToken = jwt.sign(
    {
      id: user._id.toString(),
      purpose: "phone_verification",
    },
    env.JWT_SECRET,
    {
      expiresIn: "15m",
    }
  );

  return res.status(200).json({
    success: true,
    message: "Phone verification required.",
    data: {
      requiresPhone: true,
      registrationToken: phoneVerificationToken,
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified,
      },
    },
  });
}
  /* ----------------------------------------------------------
     Phone verification
     ---------------------------------------------------------- */

  if (!user.isPhoneVerified) {
    return sendResponse(
      res,
      403,
      "Please verify your phone number before logging in.",
      {
        verificationRequired:
          "phone",

        email: user.email,

        phone: user.phone,
      }
    );
  }


  /* ----------------------------------------------------------
     Update login
     ---------------------------------------------------------- */

  await user.updateLastLogin();


  await createAuditLog({
    actor: user._id,

    actorRole: user.role,

    action: `User logged in: ${user.email}`,

    req,
  });


  /* ----------------------------------------------------------
     Send tokens
     ---------------------------------------------------------- */

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

/**
 * @route   POST /api/auth/logout
 * @desc    Logout current user
 * @access  Private
 */
export const logout = asyncHandler(async (req, res) => {
  if (req.user?._id) {
    await Token.deleteMany({
      user: req.user._id,
    });
  }


  res.cookie(
    "refreshToken",
    "",
    {
      httpOnly: true,

      secure:
        process.env.NODE_ENV ===
        "production",

      sameSite:
        process.env.NODE_ENV ===
        "production"
          ? "none"
          : "lax",

      expires: new Date(0),
    }
  );


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

/**
 * @route   GET /api/auth/me
 * @desc    Get current authenticated user
 * @access  Private
 */
export const getMe = asyncHandler(async (req, res) => {
  const user =
    await User.findById(
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
 * @route   POST /api/auth/verify-email
 * @desc    Verify email using 6-digit OTP
 * @access  Public
 */
export const verifyEmail = asyncHandler(async (req, res) => {
  const {
    email,
    token,
  } = req.body;


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


  const normalizedEmail =
    String(email)
      .trim()
      .toLowerCase();


  /* ----------------------------------------------------------
     Find user
     ---------------------------------------------------------- */

  const user =
    await User.findOne({
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


  if (user.isEmailVerified) {
    return sendResponse(
      res,
      400,
      "Your email is already verified"
    );
  }


  /* ----------------------------------------------------------
     Check OTP
     ---------------------------------------------------------- */

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


  /* ----------------------------------------------------------
     Check expiration
     ---------------------------------------------------------- */

  if (
    !user.emailVerificationExpire ||
    user.emailVerificationExpire <
      new Date()
  ) {
    return sendResponse(
      res,
      400,
      "Email verification code has expired. Please request a new code."
    );
  }


  /* ----------------------------------------------------------
     Verify email
     ---------------------------------------------------------- */

  user.isEmailVerified = true;

  user.emailVerificationToken =
    undefined;

  user.emailVerificationExpire =
    undefined;


  /* ----------------------------------------------------------
     Generate temporary registration token
     ---------------------------------------------------------- */

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


  /* ----------------------------------------------------------
     Audit
     ---------------------------------------------------------- */

  await createAuditLog({
    actor: user._id,

    actorRole: user.role,

    action: `Email verified: ${user.email}`,

    req,
  });


  /* ----------------------------------------------------------
     Response
     ---------------------------------------------------------- */

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
});


/* ============================================================
   RESEND EMAIL VERIFICATION
   ============================================================ */

/**
 * @route   POST /api/auth/resend-verification
 * @desc    Resend email verification OTP
 * @access  Public
 */
export const resendVerification = asyncHandler(
  async (req, res) => {
    const { email } = req.body;


    if (!email) {
      return sendResponse(
        res,
        400,
        "Email is required"
      );
    }


    const normalizedEmail =
      String(email)
        .trim()
        .toLowerCase();


    const user =
      await User.findOne({
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


    if (user.isEmailVerified) {
      return sendResponse(
        res,
        400,
        "Your email is already verified"
      );
    }


    /* --------------------------------------------------------
       Generate new OTP
       -------------------------------------------------------- */

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


    /* --------------------------------------------------------
       Verification URL
       -------------------------------------------------------- */

    const verificationUrl =
      createEmailVerificationUrl(
        user.email,
        emailVerificationToken
      );


    /* --------------------------------------------------------
       Render email
       -------------------------------------------------------- */

    let verificationHtml = "";

    try {
      verificationHtml =
        renderEmailTemplate(
          verifyEmailTemplate,
          {
            firstName:
              user.firstName,

            verificationUrl,

            otp:
              emailVerificationToken,
          }
        );
    } catch (templateError) {
      console.error(
        "Resend verification template failed:",
        templateError.message
      );
    }


    /* --------------------------------------------------------
       Send email
       -------------------------------------------------------- */

    try {
      await sendEmail({
        to: user.email,

        subject:
          EMAIL_SUBJECTS.VERIFY_EMAIL,

        ...(verificationHtml && {
          htmlContent:
            verificationHtml,
        }),

        textContent: `Hi ${
          user.firstName
        }, your new Devad Tech Academy email verification code is ${
          emailVerificationToken
        }. This code is valid for ${EMAIL_VERIFICATION_MINUTES} minutes.`,
      });
    } catch (error) {
      console.error(
        "Resend verification email failed:",
        error?.message || error
      );

      return sendResponse(
        res,
        502,
        "Unable to send verification email. Please try again."
      );
    }


    return sendResponse(
      res,
      200,
      "A new email verification code has been sent"
    );
  }
);


/* ============================================================
   UPDATE REGISTRATION PHONE
   ============================================================ */

/**
 * @route   POST /api/auth/registration-phone
 * @desc    Add phone number during registration
 * @access  Public
 */
export const updateRegistrationPhone =
  asyncHandler(async (req, res) => {
    const {
      registrationToken,
      phone,
    } = req.body;


    if (!registrationToken) {
      return sendResponse(
        res,
        400,
        "Registration verification token is required"
      );
    }


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


    /* --------------------------------------------------------
       Find registration session
       -------------------------------------------------------- */

    const user =
      await User.findOne({
        registrationVerificationToken:
          String(
            registrationToken
          ).trim(),

        registrationVerificationExpire:
          {
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


    if (!user.isEmailVerified) {
      return sendResponse(
        res,
        403,
        "Please verify your email before adding your phone number."
      );
    }


    /* --------------------------------------------------------
       Check duplicate phone
       -------------------------------------------------------- */

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


    /* --------------------------------------------------------
       Save phone
       -------------------------------------------------------- */

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


    return sendResponse(
      res,
      200,
      "Phone number added successfully.",
      {
        registrationToken,

        phone: user.phone,

        emailVerified:
          user.isEmailVerified,

        phoneVerified: false,

        nextStep:
          "phone-verification",
      }
    );
  });


/* ============================================================
   SEND PHONE OTP
   ============================================================ */

/**
 * @route   POST /api/auth/send-phone-otp
 * @desc    Send phone OTP through Robase
 * @access  Public during registration
 */
export const sendPhoneOTP =
  asyncHandler(async (req, res) => {
    const {
      registrationToken,
    } = req.body;


    if (!registrationToken) {
      return sendResponse(
        res,
        400,
        "Registration verification token is required"
      );
    }


    /* --------------------------------------------------------
       Find registration session
       -------------------------------------------------------- */

    const user =
      await User.findOne({
        registrationVerificationToken:
          String(
            registrationToken
          ).trim(),

        registrationVerificationExpire:
          {
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


    if (!user.isEmailVerified) {
      return sendResponse(
        res,
        403,
        "Please verify your email before verifying your phone."
      );
    }


    if (user.isPhoneVerified) {
      return sendResponse(
        res,
        400,
        "Your phone number is already verified"
      );
    }


    if (!user.phone) {
      return sendResponse(
        res,
        400,
        "Please add your phone number before requesting a verification code"
      );
    }


    /* --------------------------------------------------------
       Send Robase OTP
       -------------------------------------------------------- */

    let result;

    try {
      result =
        await sendOTP(
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


    /* --------------------------------------------------------
       Save OTP ID
       -------------------------------------------------------- */

    user.phoneVerificationToken =
      result.otpId;

    user.phoneVerificationExpire =
      getExpirationDate(
        PHONE_VERIFICATION_MINUTES
      );


    await user.save({
      validateBeforeSave: false,
    });


    return sendResponse(
      res,
      200,
      "Phone verification code sent successfully",
      {
        nextStep:
          "phone-verification",

        phone: user.phone,

        otpId:
          result.otpId,
      }
    );
  });


/* ============================================================
   VERIFY PHONE
   ============================================================ */

/**
 * @route   POST /api/auth/verify-phone
 * @desc    Verify phone using Robase OTP
 * @access  Public during registration
 */
export const verifyPhone =
  asyncHandler(async (req, res) => {
    const {
      registrationToken,
      otpId,
      code,
    } = req.body;


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


    /* --------------------------------------------------------
       Find registration session
       -------------------------------------------------------- */

    const user =
      await User.findOne({
        registrationVerificationToken:
          String(
            registrationToken
          ).trim(),

        registrationVerificationExpire:
          {
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


    if (!user.isEmailVerified) {
      return sendResponse(
        res,
        403,
        "Please verify your email first."
      );
    }


    if (!user.phone) {
      return sendResponse(
        res,
        400,
        "Please add your phone number before verifying it."
      );
    }


    if (user.isPhoneVerified) {
      return sendResponse(
        res,
        400,
        "Your phone number is already verified"
      );
    }


    /* --------------------------------------------------------
       Validate OTP ID
       -------------------------------------------------------- */

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


    /* --------------------------------------------------------
       Check expiration
       -------------------------------------------------------- */

    if (
      !user.phoneVerificationExpire ||
      user.phoneVerificationExpire <
        new Date()
    ) {
      return sendResponse(
        res,
        400,
        "OTP has expired. Please request a new code."
      );
    }


    /* --------------------------------------------------------
       Verify OTP with Robase
       -------------------------------------------------------- */

    let result;

    try {
      result =
        await verifyOTP(
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


    /* --------------------------------------------------------
       Mark phone as verified
       -------------------------------------------------------- */

    user.isPhoneVerified =
      true;

    user.phoneVerificationToken =
      undefined;

    user.phoneVerificationExpire =
      undefined;

    user.registrationVerificationToken =
      undefined;

    user.registrationVerificationExpire =
      undefined;


    await user.save({
      validateBeforeSave: false,
    });


    /* --------------------------------------------------------
       Audit phone verification
       -------------------------------------------------------- */

    await createAuditLog({
      actor: user._id,

      actorRole: user.role,

      action: `Phone number verified: ${user.phone}`,

      req,
    });


    /* --------------------------------------------------------
       Send welcome email
       -------------------------------------------------------- */

    if (
      user.isEmailVerified &&
      user.isPhoneVerified
    ) {
      try {
        const welcomeHtml =
          renderEmailTemplate(
            welcomeTemplate,
            {
              firstName:
                user.firstName,

              lastName:
                user.lastName,
            }
          );


        await sendEmail({
          to: user.email,

          subject:
            EMAIL_SUBJECTS.WELCOME,

          ...(welcomeHtml && {
            htmlContent:
              welcomeHtml,
          }),

          textContent: `Welcome to Devad Tech Academy, ${
            user.firstName
          }! Your registration is now complete. You can now log in to your account.`,
        });
      } catch (error) {
        console.error(
          "Welcome email failed:",
          error?.message || error
        );
      }
    }


    /* --------------------------------------------------------
       Audit registration completion
       -------------------------------------------------------- */

    await createAuditLog({
      actor: user._id,

      actorRole: user.role,

      action: `Registration verification completed: ${user.email}`,

      req,
    });


    /* --------------------------------------------------------
       Final response
       -------------------------------------------------------- */

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
   UPDATE PHONE — AUTHENTICATED USER
   ============================================================ */

/**
 * @route   PUT /api/auth/phone
 * @desc    Change authenticated user's phone number
 * @access  Private
 */
export const updatePhone =
  asyncHandler(async (req, res) => {
    const { phone } =
      req.body;


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


    /* --------------------------------------------------------
       Check duplicate phone
       -------------------------------------------------------- */

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


    /* --------------------------------------------------------
       Find current user
       -------------------------------------------------------- */

    const user =
      await User.findById(
        req.user._id
      );


    if (!user) {
      return sendResponse(
        res,
        404,
        "User account not found"
      );
    }


    /* --------------------------------------------------------
       Update phone
       -------------------------------------------------------- */

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


    /* --------------------------------------------------------
       Send OTP
       -------------------------------------------------------- */

    let result;

    try {
      result =
        await sendOTP(
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


    /* --------------------------------------------------------
       Save OTP ID
       -------------------------------------------------------- */

    user.phoneVerificationToken =
      result.otpId;

    user.phoneVerificationExpire =
      getExpirationDate(
        PHONE_VERIFICATION_MINUTES
      );


    await user.save({
      validateBeforeSave: false,
    });


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
   GET VERIFICATION STATUS
   ============================================================ */

/**
 * @route   GET /api/auth/verification-status
 * @desc    Get current user's verification status
 * @access  Private
 */
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
  
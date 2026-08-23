import crypto from "crypto";
import User from "../../models/user/User.js";
import Student from "../../models/user/Student.js";
import Instructor from "../../models/user/Instructor.js";
import SuperAdmin from "../../models/user/SuperAdmin.js";
import Token from "../../models/auth/Token.js";
import { sendTokenResponse } from "../../utils/generateToken.js";
import { generateReferralCode, generateOTP } from "../../utils/generateCode.js";
import sendResponse from "../../utils/sendResponse.js";
import asyncHandler from "../../middlewares/error/asyncHandler.js";
import registerValidator from "../../validators/auth/registerValidator.js";
import loginValidator from "../../validators/auth/loginValidator.js";
import sendEmail from "../../services/email/emailService.js";
import welcomeTemplate from "../../templates/email/welcome.js";
import verifyEmailTemplate from "../../templates/email/verifyEmail.js";
import { EMAIL_SUBJECTS, ROLES } from "../../utils/constants.js";
import auditLogger from "../../services/audit/auditLogger.js";
import { AUDIT_TYPES } from "../../utils/constants.js";

// ── Register ──────────────────────────────────────────────
export const register = asyncHandler(async (req, res) => {
  const { error } = registerValidator(req.body);
  if (error) {
    return sendResponse(
      res, 400,
      error.details.map((d) => d.message).join(", ")
    );
  }

  const {
    firstName, lastName, email, password,
    phone, role = ROLES.STUDENT, referralCode,
  } = req.body;

  // Check email exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return sendResponse(res, 400, "Email already registered");
  }

  // Handle referral
  let referredBy = null;
  if (referralCode) {
    const referrer = await User.findOne({ referralCode });
    if (referrer) referredBy = referrer._id;
  }

  // Generate verification OTP
  const otp = generateOTP();
  const otpExpire = new Date(Date.now() + 10 * 60 * 1000);

  // Create user
  const user = await User.create({
    firstName, lastName, email, password, phone,
    role, referredBy,
    referralCode: generateReferralCode(`${firstName} ${lastName}`),
    emailVerificationToken: otp,
    emailVerificationExpire: otpExpire,
  });

  // Create role profile
  if (role === ROLES.STUDENT) {
    await Student.create({ user: user._id });
  } else if (role === ROLES.INSTRUCTOR) {
    await Instructor.create({ user: user._id });
  } else if (role === ROLES.SUPER_ADMIN) {
    await SuperAdmin.create({ user: user._id });
  }

  // Send welcome + verify email
  await sendEmail({
    to: email,
    subject: EMAIL_SUBJECTS.WELCOME,
    htmlContent: welcomeTemplate({ firstName }),
  });

  await sendEmail({
    to: email,
    subject: EMAIL_SUBJECTS.VERIFY_EMAIL,
    htmlContent: verifyEmailTemplate({
      firstName,
      verificationUrl: `${process.env.CLIENT_URL}/verify-email?token=${otp}`,
      otp,
    }),
  });

  await auditLogger({
    actor: user._id,
    actorRole: role,
    action: `New user registered: ${email}`,
    type: AUDIT_TYPES.AUTH,
    ipAddress: req.ip,
    userAgent: req.headers["user-agent"],
  });

  sendTokenResponse(user, 201, res, "Registration successful");
});

// ── Login ─────────────────────────────────────────────────
export const login = asyncHandler(async (req, res) => {
  const { error } = loginValidator(req.body);
  if (error) {
    return sendResponse(
      res, 400,
      error.details.map((d) => d.message).join(", ")
    );
  }

  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return sendResponse(res, 401, "Invalid credentials");
  }

  if (user.status === "suspended") {
    return sendResponse(res, 403, "Account suspended. Contact support");
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return sendResponse(res, 401, "Invalid credentials");
  }

  await user.updateLastLogin();

  await auditLogger({
    actor: user._id,
    actorRole: user.role,
    action: `User logged in: ${email}`,
    type: AUDIT_TYPES.AUTH,
    ipAddress: req.ip,
    userAgent: req.headers["user-agent"],
  });

  sendTokenResponse(user, 200, res, "Login successful");
});

// ── Logout ────────────────────────────────────────────────
export const logout = asyncHandler(async (req, res) => {
  await Token.findOneAndDelete({ user: req.user._id });

  res.cookie("refreshToken", "", {
    expires: new Date(0),
    httpOnly: true,
  });

  sendResponse(res, 200, "Logged out successfully");
});

// ── Get current user ──────────────────────────────────────
export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  sendResponse(res, 200, "User retrieved", user);
});

// ── Verify email ──────────────────────────────────────────
export const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.body;

  const user = await User.findOne({
    emailVerificationToken: token,
    emailVerificationExpire: { $gt: Date.now() },
  });

  if (!user) {
    return sendResponse(res, 400, "Invalid or expired verification token");
  }

  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpire = undefined;
  await user.save({ validateBeforeSave: false });

  sendResponse(res, 200, "Email verified successfully");
});

// ── Resend verification email ─────────────────────────────
export const resendVerification = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user.isEmailVerified) {
    return sendResponse(res, 400, "Email already verified");
  }

  const otp = generateOTP();
  user.emailVerificationToken = otp;
  user.emailVerificationExpire = new Date(Date.now() + 10 * 60 * 1000);
  await user.save({ validateBeforeSave: false });

  await sendEmail({
    to: user.email,
    subject: EMAIL_SUBJECTS.VERIFY_EMAIL,
    htmlContent: verifyEmailTemplate({
      firstName: user.firstName,
      verificationUrl: `${process.env.CLIENT_URL}/verify-email?token=${otp}`,
      otp,
    }),
  });

  sendResponse(res, 200, "Verification email sent");
});
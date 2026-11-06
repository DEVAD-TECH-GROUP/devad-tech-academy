import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import User from "../../models/user/User.js";
import sendResponse from "../../utils/sendResponse.js";
import asyncHandler from "../../middlewares/error/asyncHandler.js";
import { generateOTP } from "../../utils/generateCode.js";
import sendEmail from "../../services/email/emailService.js";
import passwordResetTemplate from "../../templates/email/passwordReset.js";
import { EMAIL_SUBJECTS } from "../../utils/constants.js";

import {
  forgotPasswordValidator,
  resetPasswordValidator,
  changePasswordValidator,
  setPasswordValidator,
} from "../../validators/auth/passwordValidator.js";

// ── Forgot password ───────────────────────────────────────
export const forgotPassword = asyncHandler(async (req, res) => {
  const { error } = forgotPasswordValidator(req.body);

  if (error) {
    return sendResponse(
      res,
      400,
      error.details.map((d) => d.message).join(", ")
    );
  }

  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    return sendResponse(
      res,
      200,
      "If an account exists, a reset email has been sent"
    );
  }

  const otp = generateOTP();

  user.passwordResetToken = otp;
  user.passwordResetExpire = new Date(Date.now() + 10 * 60 * 1000);

  await user.save({ validateBeforeSave: false });

  await sendEmail({
    to: email,
    subject: EMAIL_SUBJECTS.PASSWORD_RESET,
    htmlContent: passwordResetTemplate({
      firstName: user.firstName,
      resetUrl: `${process.env.CLIENT_URL}/reset-password?token=${otp}`,
      otp,
    }),
  });

  return sendResponse(res, 200, "Password reset email sent");
});

// ── Reset password ────────────────────────────────────────
export const resetPassword = asyncHandler(async (req, res) => {
  const { error } = resetPasswordValidator(req.body);

  if (error) {
    return sendResponse(
      res,
      400,
      error.details.map((d) => d.message).join(", ")
    );
  }

  const { token, password } = req.body;

  const user = await User.findOne({
    passwordResetToken: token,
    passwordResetExpire: { $gt: Date.now() },
  });

  if (!user) {
    return sendResponse(res, 400, "Invalid or expired reset token");
  }

  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpire = undefined;

  await user.save();

  return sendResponse(res, 200, "Password reset successful");
});

// ── Change password ───────────────────────────────────────
export const changePassword = asyncHandler(async (req, res) => {
  const { error } = changePasswordValidator(req.body);

  if (error) {
    return sendResponse(
      res,
      400,
      error.details.map((d) => d.message).join(", ")
    );
  }

  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select("+password");

  if (!user) {
    return sendResponse(res, 404, "User not found");
  }

  const isMatch = await user.comparePassword(currentPassword);

  if (!isMatch) {
    return sendResponse(res, 400, "Current password is incorrect");
  }

  user.password = newPassword;
  await user.save();

  return sendResponse(res, 200, "Password changed successfully");
});


// ── Set password with invitation token ────────────────────
// POST /api/auth/set-password (PUBLIC)

export const setPasswordWithToken = asyncHandler(async (req, res) => {
  // 1. Validate request
  const { error } = setPasswordValidator(req.body);

  if (error) {
    return sendResponse(
      res,
      400,
      error.details.map((d) => d.message).join(", ")
    );
  }

  const { token, password } = req.body;

  // 2. Hash the incoming token
  const tokenHash = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  // 3. Atomically find and consume the valid token.
  // This prevents two requests from using the same invitation.
  const user = await User.findOneAndUpdate(
    {
      passwordSetupTokenHash: tokenHash,
      passwordSetupExpire: { $gt: new Date() },
    },
    {
      $unset: {
        passwordSetupTokenHash: 1,
        passwordSetupExpire: 1,
      },
    },
    {
      new: true,
      runValidators: false,
    }
  ).select("+password");

  if (!user) {
    return sendResponse(
      res,
      400,
      "Password setup link is invalid, expired, or has already been used"
    );
  }

  // 4. Set password
  user.password = password;

  // 5. Save through User model password hashing middleware
  await user.save();

  return sendResponse(
    res,
    200,
    "Password set successfully. You can now log in."
  );
});

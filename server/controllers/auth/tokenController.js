import jwt from "jsonwebtoken";
import Token from "../../models/auth/Token.js";
import User from "../../models/user/User.js";
import { sendTokenResponse, generateTokens } from "../../utils/generateToken.js";
import sendResponse from "../../utils/sendResponse.js";
import asyncHandler from "../../middlewares/error/asyncHandler.js";
import env from "../../config/env.js";

// ── Refresh access token ──────────────────────────────────
export const refreshToken = asyncHandler(async (req, res) => {
  const refreshToken =
    req.cookies.refreshToken ||
    req.body.refreshToken;

  if (!refreshToken) {
    return sendResponse(res, 401, "Refresh token required");
  }

  const decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET);

  const tokenDoc = await Token.findOne({
    user: decoded.id,
    refreshToken,
    isValid: true,
  });

  if (!tokenDoc) {
    return sendResponse(res, 401, "Invalid refresh token");
  }

  if (new Date() > tokenDoc.expiresAt) {
    await tokenDoc.deleteOne();
    return sendResponse(res, 401, "Refresh token expired");
  }

  const user = await User.findById(decoded.id);
  if (!user) {
    return sendResponse(res, 401, "User not found");
  }

  sendTokenResponse(user, 200, res, "Token refreshed");
});
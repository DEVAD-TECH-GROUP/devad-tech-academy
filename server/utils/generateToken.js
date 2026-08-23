import jwt from "jsonwebtoken";
import env from "../config/env.js";

// ── Generate access token ─────────────────────────────────
export const generateAccessToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRE }
  );
};

// ── Generate refresh token ────────────────────────────────
export const generateRefreshToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role },
    env.JWT_REFRESH_SECRET,
    { expiresIn: env.JWT_REFRESH_EXPIRE }
  );
};

// ── Generate both tokens ──────────────────────────────────
export const generateTokens = (userId, role) => {
  const accessToken = generateAccessToken(userId, role);
  const refreshToken = generateRefreshToken(userId, role);
  return { accessToken, refreshToken };
};

// ── Send tokens in response ───────────────────────────────
export const sendTokenResponse = (user, statusCode, res, message) => {
  const { accessToken, refreshToken } = generateTokens(
    user._id,
    user.role
  );

  // Cookie options
  const cookieOptions = {
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "strict",
  };

  // Set refresh token in cookie
  res.cookie("refreshToken", refreshToken, cookieOptions);

  res.status(statusCode).json({
    success: true,
    message,
    data: {
      accessToken,
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        isEmailVerified: user.isEmailVerified,
      },
    },
  });
};

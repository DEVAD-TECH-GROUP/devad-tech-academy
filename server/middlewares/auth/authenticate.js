import jwt from "jsonwebtoken";
import asyncHandler from "../error/asyncHandler.js";
import sendResponse from "../../utils/sendResponse.js";
import env from "../../config/env.js";
import User from "../../models/user/User.js";

const authenticate = asyncHandler(async (req, res, next) => {
  let token;

  // ── Get token from header ─────────────────────────────
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  // ── Check token exists ────────────────────────────────
  if (!token) {
    return sendResponse(
      res,
      401,
      "Not authorized. No token provided"
    );
  }

  // ── Verify token ──────────────────────────────────────
  const decoded = jwt.verify(token, env.JWT_SECRET);

  // ── Get user from token ───────────────────────────────
  const user = await User.findById(decoded.id).select("-password");

  if (!user) {
    return sendResponse(res, 401, "User not found");
  }

  // ── Check if user is active ───────────────────────────
  if (user.status === "suspended") {
    return sendResponse(
      res,
      403,
      "Your account has been suspended. Contact support"
    );
  }

  if (user.status === "inactive") {
    return sendResponse(
      res,
      403,
      "Your account is inactive. Contact support"
    );
  }

  // ── Attach user to request ────────────────────────────
  req.user = user;
  next();
});

export default authenticate;
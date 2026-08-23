import express from "express";
import {
  register,
  login,
  logout,
  getMe,
  verifyEmail,
  resendVerification,
} from "../../controllers/auth/authController.js";
import authenticate from "../../middlewares/auth/authenticate.js";
import { authLimiter } from "../../middlewares/security/rateLimiter.js";

const router = express.Router();

router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);
router.post("/logout", authenticate, logout);
router.get("/me", authenticate, getMe);
router.post("/verify-email", verifyEmail);
router.post("/resend-verification", authenticate, resendVerification);

export default router;
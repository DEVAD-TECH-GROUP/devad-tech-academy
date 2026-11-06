import express from "express";
import {
  forgotPassword,
  resetPassword,
  changePassword,
  setPasswordWithToken

} from "../../controllers/auth/passwordController.js";
import { refreshToken } from "../../controllers/auth/tokenController.js";
import authenticate from "../../middlewares/auth/authenticate.js";
import {
  passwordLimiter,
  authLimiter,
} from "../../middlewares/security/rateLimiter.js";

const router = express.Router();

router.post("/forgot-password", passwordLimiter, forgotPassword);
router.post("/reset-password", passwordLimiter, resetPassword);
router.post("/change-password", authenticate, changePassword);
router.post("/refresh-token", authLimiter, refreshToken);
router.post("/set-password", passwordLimiter, setPasswordWithToken);
export default router;

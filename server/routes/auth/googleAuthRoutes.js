// routes/auth/googleAuthRoutes.js

import express from "express";
import passport from "passport";

import {
  googleAuth,
  googleCallback,
  googleAuthFailure,
} from "../../controllers/auth/googleAuthController.js";

const router = express.Router();

// ============================================================
// START GOOGLE LOGIN
// ============================================================

router.get(
  "/google",
  googleAuth
);

// ============================================================
// GOOGLE CALLBACK
// ============================================================

router.get(
  "/google/callback",

  passport.authenticate(
    "google",
    {
      session: false,
      failureRedirect:
        `${process.env.CLIENT_URL || "http://localhost:5173"}/auth/google/callback?error=google-auth-failed`,
    }
  ),

  googleCallback
);

export default router;

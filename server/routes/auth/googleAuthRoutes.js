// routes/auth/googleAuthRoutes.js

import express from "express";
import passport from "passport";

import {
  googleAuth,
  googleCallback,
} from "../../controllers/auth/googleAuthController.js";

const router = express.Router();

// ============================================================
// DEBUG MIDDLEWARE
// ============================================================

router.use((req, res, next) => {
  console.log("================================================");
  console.log("🔵 [GOOGLE ROUTER] Google auth router reached");
  console.log("🔵 [GOOGLE ROUTER] Method:", req.method);
  console.log("🔵 [GOOGLE ROUTER] Original URL:", req.originalUrl);
  console.log("🔵 [GOOGLE ROUTER] Base URL:", req.baseUrl);
  console.log("🔵 [GOOGLE ROUTER] Path:", req.path);
  console.log(
    "🔵 [GOOGLE ROUTER] Authorization:",
    req.headers.authorization
      ? "PRESENT"
      : "NOT PRESENT"
  );
  console.log("================================================");

  next();
});

// ============================================================
// START GOOGLE LOGIN
// ============================================================

router.get(
  "/google",
  (req, res, next) => {
    console.log("🚀 [GOOGLE ROUTER] GET /google matched");
    console.log(
      "🚀 [GOOGLE ROUTER] Passing request to googleAuth controller"
    );

    next();
  },
  googleAuth
);

// ============================================================
// GOOGLE CALLBACK
// ============================================================

router.get(
  "/google/callback",

  passport.authenticate("google", {
    session: false,

    failureRedirect:
      `${process.env.CLIENT_URL || "http://localhost:5173"}` +
      `/auth/google/callback?error=google-auth-failed`,
  }),

  googleCallback
);

export default router;

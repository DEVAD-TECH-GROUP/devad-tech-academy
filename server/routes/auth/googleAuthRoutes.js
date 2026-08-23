import express from "express";
import passport from "passport";
import { googleAuth, googleCallback } from "../../controllers/auth/googleAuthController.js";

const router = express.Router();

router.get("/google", googleAuth);
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "/login" }),
  googleCallback
);

export default router;
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../../models/user/User.js";
import Student from "../../models/user/Student.js";
import { sendTokenResponse } from "../../utils/generateToken.js";
import { generateReferralCode } from "../../utils/generateCode.js";
import sendResponse from "../../utils/sendResponse.js";
import asyncHandler from "../../middlewares/error/asyncHandler.js";
import env from "../../config/env.js";
import { ROLES } from "../../utils/constants.js";

// ── Configure Google Strategy ─────────────────────────────
passport.use(
  new GoogleStrategy(
    {
      clientID: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      callbackURL: env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
          user = await User.findOne({
            email: profile.emails[0].value,
          });
        }

        if (!user) {
          user = await User.create({
            firstName: profile.name.givenName,
            lastName: profile.name.familyName,
            email: profile.emails[0].value,
            googleId: profile.id,
            isGoogleAuth: true,
            isEmailVerified: true,
            role: ROLES.STUDENT,
            avatar: {
              url: profile.photos[0]?.value || null,
            },
            referralCode: generateReferralCode(profile.displayName),
            connectedAccounts: { google: true },
          });

          await Student.create({ user: user._id });
        } else if (!user.googleId) {
          user.googleId = profile.id;
          user.isGoogleAuth = true;
          user.connectedAccounts = {
            ...user.connectedAccounts,
            google: true,
          };
          await user.save({ validateBeforeSave: false });
        }

        done(null, user);
      } catch (error) {
        done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => done(null, user._id));
passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);
  done(null, user);
});

// ── Google auth initiate ──────────────────────────────────
export const googleAuth = passport.authenticate("google", {
  scope: ["profile", "email"],
});

// ── Google auth callback ──────────────────────────────────
export const googleCallback = asyncHandler(async (req, res) => {
  await req.user.updateLastLogin();
  sendTokenResponse(req.user, 200, res, "Google login successful");
});
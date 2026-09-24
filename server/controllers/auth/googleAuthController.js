// controllers/auth/googleAuthController.js

import crypto from "crypto";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";

import User from "../../models/user/User.js";
import Student from "../../models/user/Student.js";

import {
  generateAccessToken,
  generateRefreshToken,
} from "../../utils/generateToken.js";

import { generateReferralCode } from "../../utils/generateCode.js";

import env from "../../config/env.js";
import { ROLES } from "../../utils/constants.js";

// ============================================================
// GOOGLE REGISTRATION SESSION
// ============================================================

const GOOGLE_REGISTRATION_MINUTES = 15;

const generateGoogleRegistrationToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

const getExpirationDate = (minutes) => {
  return new Date(Date.now() + minutes * 60 * 1000);
};

// ============================================================
// COOKIE OPTIONS
// ============================================================

const getRefreshCookieOptions = () => ({
  expires: new Date(
    Date.now() + 30 * 24 * 60 * 60 * 1000
  ),

  httpOnly: true,

  secure: env.NODE_ENV === "production",

  sameSite: "strict",
});

// ============================================================
// REDIRECT HELPER
// ============================================================

const redirectToFrontend = (res, params = {}) => {
  const baseUrl = String(env.CLIENT_URL || "").replace(
    /\/+$/,
    ""
  );

  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (
      value !== undefined &&
      value !== null &&
      value !== ""
    ) {
      searchParams.set(key, String(value));
    }
  });

  const query = searchParams.toString();

  const redirectUrl = query
    ? `${baseUrl}/auth/google/callback?${query}`
    : `${baseUrl}/auth/google/callback`;

  return res.redirect(redirectUrl);
};

// ============================================================
// CONFIGURE GOOGLE STRATEGY
// ============================================================

passport.use(
  new GoogleStrategy(
    {
      clientID: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      callbackURL: env.GOOGLE_CALLBACK_URL,
    },

    async (
      accessToken,
      refreshToken,
      profile,
      done
    ) => {
      try {
        const googleId = profile.id;

        const googleEmail =
          profile.emails?.[0]?.value?.toLowerCase().trim();

        if (!googleEmail) {
          return done(
            new Error(
              "Google account did not provide an email address."
            ),
            null
          );
        }

        // ======================================================
        // FIND USER BY GOOGLE ID
        // ======================================================

        let user = await User.findOne({
          googleId,
        });

        // ======================================================
        // IF NOT FOUND, TRY EMAIL
        // ======================================================

        if (!user) {
          user = await User.findOne({
            email: googleEmail,
          });
        }

        // ======================================================
        // CREATE NEW GOOGLE ACCOUNT
        // ======================================================

        if (!user) {
          const registrationToken =
            generateGoogleRegistrationToken();

          user = await User.create({
            firstName:
              profile.name?.givenName ||
              profile.displayName?.split(" ")[0] ||
              "Google",

            lastName:
              profile.name?.familyName ||
              profile.displayName
                ?.split(" ")
                .slice(1)
                .join(" ") ||
              "User",

            email: googleEmail,

            googleId,

            isGoogleAuth: true,

            isEmailVerified: true,

            role: ROLES.STUDENT,

            avatar: {
              url:
                profile.photos?.[0]?.value ||
                null,
            },

            referralCode:
              generateReferralCode(
                profile.displayName ||
                  `${profile.name?.givenName || "Google"} User`
              ),

            connectedAccounts: {
              google: true,
            },

            // Google has verified the email,
            // but NOT the phone.
            isPhoneVerified: false,

            registrationVerificationToken:
              registrationToken,

            registrationVerificationExpire:
              getExpirationDate(
                GOOGLE_REGISTRATION_MINUTES
              ),
          });

          await Student.create({
            user: user._id,
          });

          return done(null, user);
        }

        // ======================================================
        // EXISTING USER
        // ======================================================

        let changed = false;

        // Link Google account if email already exists
        if (!user.googleId) {
          user.googleId = googleId;
          changed = true;
        }

        if (!user.isGoogleAuth) {
          user.isGoogleAuth = true;
          changed = true;
        }

        if (
          !user.connectedAccounts?.google
        ) {
          user.connectedAccounts = {
            ...user.connectedAccounts,
            google: true,
          };

          changed = true;
        }

        // Google verified this email
        if (!user.isEmailVerified) {
          user.isEmailVerified = true;
          changed = true;
        }

        if (changed) {
          await user.save({
            validateBeforeSave: false,
          });
        }

        return done(null, user);
      } catch (error) {
        console.error(
          "❌ Google strategy error:",
          error
        );

        return done(error, null);
      }
    }
  )
);

// ============================================================
// PASSPORT SERIALIZATION
// ============================================================

passport.serializeUser(
  (user, done) => {
    done(null, user._id);
  }
);

passport.deserializeUser(
  async (id, done) => {
    try {
      const user =
        await User.findById(id);

      done(null, user);
    } catch (error) {
      done(error, null);
    }
  }
);

// ============================================================
// GOOGLE AUTH INITIATE
// ============================================================

export const googleAuth =
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  });

// ============================================================
// GOOGLE CALLBACK
// ============================================================

export const googleCallback =
  async (req, res) => {
    try {
      const user = req.user;

      if (!user) {
        return redirectToFrontend(
          res,
          {
            error:
              "Google authentication failed.",
          }
        );
      }

      await user.updateLastLogin();

      // ======================================================
      // PHONE NOT VERIFIED
      // ======================================================

      if (!user.isPhoneVerified) {
        return redirectToFrontend(
          res,
          {
            status: "phone-required",

            registrationToken:
              user.registrationVerificationToken,

            email: user.email,
          }
        );
      }

      // ======================================================
      // PHONE VERIFIED → NORMAL LOGIN
      // ======================================================

      const {
        accessToken,
        refreshToken,
      } = {
        accessToken:
          generateAccessToken(
            user._id,
            user.role
          ),

        refreshToken:
          generateRefreshToken(
            user._id,
            user.role
          ),
      };

      // ======================================================
      // REFRESH TOKEN COOKIE
      // ======================================================

      res.cookie(
        "refreshToken",
        refreshToken,
        getRefreshCookieOptions()
      );

      // ======================================================
      // REDIRECT TO FRONTEND
      // ======================================================

      return redirectToFrontend(
        res,
        {
          status: "success",
          accessToken,
        }
      );
    } catch (error) {
      console.error(
        "❌ Google callback error:",
        error
      );

      return redirectToFrontend(
        res,
        {
          error:
            "Google authentication failed. Please try again.",
        }
      );
    }
  };

// ============================================================
// GOOGLE AUTH ERROR HANDLER
// ============================================================

export const googleAuthFailure = (
  req,
  res
) => {
  return redirectToFrontend(
    res,
    {
      error:
        "Google authentication was unsuccessful.",
    }
  );
};

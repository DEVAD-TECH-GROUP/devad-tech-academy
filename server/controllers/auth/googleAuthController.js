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
// CONSTANTS
// ============================================================

const GOOGLE_REGISTRATION_MINUTES = 15;
const REFRESH_TOKEN_DAYS = 30;

// ============================================================
// HELPERS
// ============================================================

const generateGoogleRegistrationToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

const getExpirationDate = (minutes) => {
  return new Date(Date.now() + minutes * 60 * 1000);
};

// ============================================================
// REFRESH TOKEN COOKIE
// ============================================================

const getRefreshCookieOptions = () => ({
  httpOnly: true,
  secure: env.NODE_ENV === "production",

  // IMPORTANT:
  // "strict" can interfere with some OAuth redirect flows.
  sameSite: "lax",

  expires: new Date(
    Date.now() +
      REFRESH_TOKEN_DAYS *
        24 *
        60 *
        60 *
        1000
  ),

  path: "/",
});

// ============================================================
// FRONTEND REDIRECT
// ============================================================

const redirectToFrontend = (res, params = {}) => {
  const baseUrl = String(
    env.CLIENT_URL || "http://localhost:5173"
  ).replace(/\/+$/, "");

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

  console.log("================================================");
  console.log("🔀 [GOOGLE] Redirecting to frontend");
  console.log("🔀 [GOOGLE] URL:", redirectUrl);
  console.log("================================================");

  return res.redirect(redirectUrl);
};

// ============================================================
// GOOGLE STRATEGY CONFIGURATION
// ============================================================

console.log("================================================");
console.log("🔐 [GOOGLE] Initializing Google OAuth strategy");
console.log("================================================");

console.log(
  "🔐 [GOOGLE] Client ID present:",
  Boolean(env.GOOGLE_CLIENT_ID)
);

console.log(
  "🔐 [GOOGLE] Client Secret present:",
  Boolean(env.GOOGLE_CLIENT_SECRET)
);

console.log(
  "🔐 [GOOGLE] Callback URL:",
  env.GOOGLE_CALLBACK_URL || "NOT SET"
);

console.log(
  "🔐 [GOOGLE] Frontend URL:",
  env.CLIENT_URL || "NOT SET"
);

console.log("================================================");

// ============================================================
// PASSPORT GOOGLE STRATEGY
// ============================================================

passport.use(
  new GoogleStrategy(
    {
      clientID: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      callbackURL: env.GOOGLE_CALLBACK_URL,
    },

    async (
      googleAccessToken,
      googleRefreshToken,
      profile,
      done
    ) => {
      console.log("================================================");
      console.log("🔵 [GOOGLE STRATEGY] Callback reached");
      console.log(
        "🔵 [GOOGLE STRATEGY] Profile ID:",
        profile?.id
      );
      console.log(
        "🔵 [GOOGLE STRATEGY] Display name:",
        profile?.displayName
      );
      console.log(
        "🔵 [GOOGLE STRATEGY] Email:",
        profile?.emails?.[0]?.value || "NO EMAIL"
      );
      console.log("================================================");

      try {
        // ======================================================
        // GOOGLE DATA
        // ======================================================

        const googleId = profile?.id;

        const googleEmail = profile?.emails?.[0]?.value
          ?.toLowerCase()
          .trim();

        if (!googleId) {
          return done(
            new Error(
              "Google account did not provide a valid account ID."
            ),
            null
          );
        }

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
        // FIND USER BY EMAIL
        // ======================================================

        if (!user) {
          user = await User.findOne({
            email: googleEmail,
          });
        }

        // ======================================================
        // CREATE NEW GOOGLE USER
        // ======================================================

        if (!user) {
          console.log(
            "🆕 [GOOGLE] Creating new Google account..."
          );

          const registrationToken =
            generateGoogleRegistrationToken();

          const firstName =
            profile.name?.givenName ||
            profile.displayName?.split(" ")[0] ||
            "Google";

          const lastName =
            profile.name?.familyName ||
            profile.displayName
              ?.split(" ")
              .slice(1)
              .join(" ") ||
            "User";

          const displayName =
            profile.displayName ||
            `${firstName} ${lastName}`;

          user = await User.create({
            firstName,
            lastName,

            email: googleEmail,

            googleId,

            isGoogleAuth: true,

            isEmailVerified: true,

            isPhoneVerified: false,

            role: ROLES.STUDENT,

            avatar: {
              url:
                profile.photos?.[0]?.value ||
                null,
            },

            referralCode:
              generateReferralCode(displayName),

            connectedAccounts: {
              google: true,
            },

            registrationVerificationToken:
              registrationToken,

            registrationVerificationExpire:
              getExpirationDate(
                GOOGLE_REGISTRATION_MINUTES
              ),
          });

          console.log(
            "✅ [GOOGLE] User created:",
            user._id.toString()
          );

          // ====================================================
          // CREATE STUDENT PROFILE
          // ====================================================

          await Student.create({
            user: user._id,
          });

          console.log(
            "✅ [GOOGLE] Student profile created."
          );

          // select:false protection
          user.registrationVerificationToken =
            registrationToken;

          return done(null, user);
        }

        // ======================================================
        // EXISTING USER
        // ======================================================

        console.log(
          "👤 [GOOGLE] Existing user:",
          user._id.toString()
        );

        let changed = false;

        // ======================================================
        // LINK GOOGLE ID
        // ======================================================

        if (!user.googleId) {
          user.googleId = googleId;
          changed = true;
        }

        // ======================================================
        // GOOGLE AUTH FLAG
        // ======================================================

        if (!user.isGoogleAuth) {
          user.isGoogleAuth = true;
          changed = true;
        }

        // ======================================================
        // CONNECTED ACCOUNTS
        // ======================================================

        if (!user.connectedAccounts?.google) {
          user.connectedAccounts = {
            ...(user.connectedAccounts || {}),
            google: true,
          };

          changed = true;
        }

        // ======================================================
        // GOOGLE EMAIL IS VERIFIED
        // ======================================================

        if (!user.isEmailVerified) {
          user.isEmailVerified = true;
          changed = true;
        }

        // ======================================================
        // PHONE NOT VERIFIED
        // ======================================================

        if (!user.isPhoneVerified) {
          const registrationToken =
            generateGoogleRegistrationToken();

          user.registrationVerificationToken =
            registrationToken;

          user.registrationVerificationExpire =
            getExpirationDate(
              GOOGLE_REGISTRATION_MINUTES
            );

          changed = true;
        }

        // ======================================================
        // SAVE
        // ======================================================

        if (changed) {
          await user.save({
            validateBeforeSave: false,
          });
        }

        // ======================================================
        // MAKE SURE TOKEN IS AVAILABLE TO CALLBACK
        // ======================================================

        if (!user.isPhoneVerified) {
          const token =
            user.registrationVerificationToken;

          if (token) {
            user.registrationVerificationToken =
              token;
          }
        }

        console.log(
          "✅ [GOOGLE] Existing user ready."
        );

        return done(null, user);
      } catch (error) {
        console.error("================================================");
        console.error("❌ [GOOGLE STRATEGY] ERROR");
        console.error(
          "❌ Message:",
          error?.message
        );
        console.error(
          "❌ Stack:",
          error?.stack
        );
        console.error("================================================");

        return done(error, null);
      }
    }
  )
);

// ============================================================
// PASSPORT SERIALIZATION
// ============================================================

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);

    if (!user) {
      return done(
        new Error("User not found."),
        null
      );
    }

    return done(null, user);
  } catch (error) {
    return done(error, null);
  }
});

// ============================================================
// START GOOGLE LOGIN
// ============================================================

export const googleAuth = (req, res, next) => {
  console.log("================================================");
  console.log("🚀 [GOOGLE AUTH] ROUTE REACHED");
  console.log("🚀 Method:", req.method);
  console.log("🚀 URL:", req.originalUrl);
  console.log("🚀 IP:", req.ip);
  console.log("================================================");

  return passport.authenticate("google", {
    scope: [
      "profile",
      "email",
    ],

    session: false,
  })(req, res, next);
};

// ============================================================
// GOOGLE CALLBACK
// ============================================================

export const googleCallback = async (req, res) => {
  console.log("================================================");
  console.log("🔄 [GOOGLE CALLBACK] ROUTE REACHED");
  console.log("🔄 URL:", req.originalUrl);
  console.log(
    "🔄 User:",
    req.user?._id?.toString() || "NONE"
  );
  console.log("================================================");

  try {
    const user = req.user;

    if (!user) {
      return redirectToFrontend(res, {
        error: "Google authentication failed.",
      });
    }

    // ========================================================
    // UPDATE LAST LOGIN
    // ========================================================

    await user.updateLastLogin();

    // ========================================================
    // PHONE VERIFICATION REQUIRED
    // ========================================================

    if (!user.isPhoneVerified) {
      console.log(
        "📱 [GOOGLE CALLBACK] Phone verification required."
      );

      let registrationToken =
        user.registrationVerificationToken;

      // ------------------------------------------------------
      // Generate token if unavailable
      // ------------------------------------------------------

      if (!registrationToken) {
        registrationToken =
          generateGoogleRegistrationToken();

        user.registrationVerificationToken =
          registrationToken;

        user.registrationVerificationExpire =
          getExpirationDate(
            GOOGLE_REGISTRATION_MINUTES
          );

        await user.save({
          validateBeforeSave: false,
        });
      }

      console.log(
        "📱 [GOOGLE CALLBACK] Redirecting to phone verification."
      );

      return redirectToFrontend(res, {
        status: "phone-required",
        registrationToken,
        email: user.email,
      });
    }

    // ========================================================
    // PHONE VERIFIED → COMPLETE LOGIN
    // ========================================================

    console.log(
      "✅ [GOOGLE CALLBACK] Phone already verified."
    );

    // ========================================================
    // GENERATE DEVAD ACCESS TOKEN
    // ========================================================

    const accessToken = generateAccessToken(
      user._id,
      user.role
    );

    // ========================================================
    // GENERATE DEVAD REFRESH TOKEN
    // ========================================================

    const refreshToken = generateRefreshToken(
      user._id,
      user.role
    );

    // ========================================================
    // STORE REFRESH TOKEN IN HTTP-ONLY COOKIE
    // ========================================================

    res.cookie(
      "refreshToken",
      refreshToken,
      getRefreshCookieOptions()
    );

    console.log(
      "🍪 [GOOGLE CALLBACK] Refresh token cookie set."
    );

    // ========================================================
    // REDIRECT TO FRONTEND
    // ========================================================

    return redirectToFrontend(res, {
      status: "success",
      accessToken,
    });
  } catch (error) {
    console.error("================================================");
    console.error("❌ [GOOGLE CALLBACK] ERROR");
    console.error(
      "❌ Message:",
      error?.message
    );
    console.error(
      "❌ Stack:",
      error?.stack
    );
    console.error("================================================");

    return redirectToFrontend(res, {
      error:
        "Google authentication failed. Please try again.",
    });
  }
};

// ============================================================
// GOOGLE AUTH FAILURE
// ============================================================

export const googleAuthFailure = (req, res) => {
  console.error(
    "❌ [GOOGLE AUTH FAILURE]"
  );

  return redirectToFrontend(res, {
    error:
      "Google authentication was unsuccessful.",
  });
};

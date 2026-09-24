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

  console.log("────────────────────────────────────────");
  console.log("🔀 [GOOGLE] Redirecting to frontend");
  console.log("🔀 [GOOGLE] URL:", redirectUrl);
  console.log("────────────────────────────────────────");

  return res.redirect(redirectUrl);
};

// ============================================================
// GOOGLE STRATEGY CONFIGURATION
// ============================================================

console.log("================================================");
console.log("🔐 [GOOGLE] Initializing Google OAuth strategy");
console.log("================================================");

console.log("🔐 [GOOGLE] Client ID present:", Boolean(env.GOOGLE_CLIENT_ID));
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
      accessToken,
      refreshToken,
      profile,
      done
    ) => {
      console.log("================================================");
      console.log("🔵 [GOOGLE STRATEGY] Callback reached");
      console.log("🔵 [GOOGLE STRATEGY] Profile ID:", profile?.id);
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
        // ------------------------------------------------------
        // Extract Google information
        // ------------------------------------------------------

        const googleId = profile?.id;

        const googleEmail = profile?.emails?.[0]?.value
          ?.toLowerCase()
          .trim();

        if (!googleId) {
          console.error(
            "❌ [GOOGLE STRATEGY] Google profile has no ID."
          );

          return done(
            new Error(
              "Google account did not provide a valid account ID."
            ),
            null
          );
        }

        if (!googleEmail) {
          console.error(
            "❌ [GOOGLE STRATEGY] Google profile has no email."
          );

          return done(
            new Error(
              "Google account did not provide an email address."
            ),
            null
          );
        }

        console.log(
          "✅ [GOOGLE STRATEGY] Google account:",
          googleEmail
        );

        // ------------------------------------------------------
        // Find user by Google ID
        // ------------------------------------------------------

        console.log(
          "🔎 [GOOGLE STRATEGY] Searching user by googleId..."
        );

        let user = await User.findOne({
          googleId,
        });

        if (user) {
          console.log(
            "✅ [GOOGLE STRATEGY] User found by googleId:",
            user._id.toString()
          );
        } else {
          console.log(
            "ℹ️ [GOOGLE STRATEGY] No user found by googleId."
          );
        }

        // ------------------------------------------------------
        // Find user by email
        // ------------------------------------------------------

        if (!user) {
          console.log(
            "🔎 [GOOGLE STRATEGY] Searching user by email..."
          );

          user = await User.findOne({
            email: googleEmail,
          });

          if (user) {
            console.log(
              "✅ [GOOGLE STRATEGY] Existing user found by email:",
              user._id.toString()
            );
          } else {
            console.log(
              "ℹ️ [GOOGLE STRATEGY] No existing user found."
            );
          }
        }

        // ======================================================
        // CREATE NEW GOOGLE ACCOUNT
        // ======================================================

        if (!user) {
          console.log(
            "🆕 [GOOGLE STRATEGY] Creating new Google account..."
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

            // Google verified email,
            // but phone still needs verification.
            isPhoneVerified: false,

            registrationVerificationToken:
              registrationToken,

            registrationVerificationExpire:
              getExpirationDate(
                GOOGLE_REGISTRATION_MINUTES
              ),
          });

          console.log(
            "✅ [GOOGLE STRATEGY] Google user created:",
            user._id.toString()
          );

          console.log(
            "📱 [GOOGLE STRATEGY] Phone verification required."
          );

          // ----------------------------------------------------
          // Create student profile
          // ----------------------------------------------------

          await Student.create({
            user: user._id,
          });

          console.log(
            "✅ [GOOGLE STRATEGY] Student profile created."
          );

          // ----------------------------------------------------
          // Important:
          // Return token on the user object because the field
          // may be select:false in the User model.
          // ----------------------------------------------------

          user.registrationVerificationToken =
            registrationToken;

          console.log(
            "✅ [GOOGLE STRATEGY] Registration token prepared."
          );

          return done(null, user);
        }

        // ======================================================
        // EXISTING USER
        // ======================================================

        console.log(
          "👤 [GOOGLE STRATEGY] Processing existing user:",
          user._id.toString()
        );

        let changed = false;

        // ------------------------------------------------------
        // Link Google account
        // ------------------------------------------------------

        if (!user.googleId) {
          console.log(
            "🔗 [GOOGLE STRATEGY] Linking Google ID..."
          );

          user.googleId = googleId;
          changed = true;
        }

        // ------------------------------------------------------
        // Mark Google authentication
        // ------------------------------------------------------

        if (!user.isGoogleAuth) {
          console.log(
            "🔗 [GOOGLE STRATEGY] Marking isGoogleAuth=true..."
          );

          user.isGoogleAuth = true;
          changed = true;
        }

        // ------------------------------------------------------
        // Connected accounts
        // ------------------------------------------------------

        if (!user.connectedAccounts?.google) {
          console.log(
            "🔗 [GOOGLE STRATEGY] Updating connectedAccounts..."
          );

          user.connectedAccounts = {
            ...user.connectedAccounts,
            google: true,
          };

          changed = true;
        }

        // ------------------------------------------------------
        // Google verified email
        // ------------------------------------------------------

        if (!user.isEmailVerified) {
          console.log(
            "✉️ [GOOGLE STRATEGY] Marking email as verified..."
          );

          user.isEmailVerified = true;
          changed = true;
        }

        // ------------------------------------------------------
        // Existing user without phone
        // ------------------------------------------------------

        if (!user.isPhoneVerified) {
          console.log(
            "📱 [GOOGLE STRATEGY] Existing user requires phone verification."
          );

          // The fields are select:false in User model,
          // so generate a fresh temporary registration token.
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

        // ------------------------------------------------------
        // Save changes
        // ------------------------------------------------------

        if (changed) {
          await user.save({
            validateBeforeSave: false,
          });

          console.log(
            "✅ [GOOGLE STRATEGY] Existing user updated."
          );
        }

        console.log(
          "✅ [GOOGLE STRATEGY] Authentication user ready."
        );

        return done(null, user);
      } catch (error) {
        console.error(
          "================================================"
        );

        console.error(
          "❌ [GOOGLE STRATEGY] ERROR"
        );

        console.error(
          "❌ Message:",
          error?.message
        );

        console.error(
          "❌ Stack:",
          error?.stack
        );

        console.error(
          "================================================"
        );

        return done(error, null);
      }
    }
  )
);

// ============================================================
// PASSPORT SERIALIZATION
// ============================================================

passport.serializeUser((user, done) => {
  console.log(
    "🔐 [GOOGLE PASSPORT] serializeUser:",
    user?._id?.toString()
  );

  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  console.log(
    "🔐 [GOOGLE PASSPORT] deserializeUser:",
    id
  );

  try {
    const user = await User.findById(id);

    if (!user) {
      console.error(
        "❌ [GOOGLE PASSPORT] User not found during deserialize."
      );

      return done(
        new Error("User not found."),
        null
      );
    }

    done(null, user);
  } catch (error) {
    console.error(
      "❌ [GOOGLE PASSPORT] Deserialize error:",
      error?.message
    );

    done(error, null);
  }
});

// ============================================================
// GOOGLE AUTH INITIATE
// ============================================================

export const googleAuth = (req, res, next) => {
  console.log("================================================");
  console.log("🚀 [GOOGLE AUTH] Google login route reached");
  console.log("🚀 [GOOGLE AUTH] Method:", req.method);
  console.log("🚀 [GOOGLE AUTH] URL:", req.originalUrl);
  console.log(
    "🚀 [GOOGLE AUTH] IP:",
    req.ip
  );
  console.log(
    "🚀 [GOOGLE AUTH] Authorization header:",
    req.headers.authorization
      ? "PRESENT"
      : "NOT PRESENT"
  );
  console.log(
    "🚀 [GOOGLE AUTH] Google Client ID:",
    env.GOOGLE_CLIENT_ID
      ? "PRESENT"
      : "MISSING"
  );
  console.log(
    "🚀 [GOOGLE AUTH] Google Client Secret:",
    env.GOOGLE_CLIENT_SECRET
      ? "PRESENT"
      : "MISSING"
  );
  console.log(
    "🚀 [GOOGLE AUTH] Callback URL:",
    env.GOOGLE_CALLBACK_URL ||
      "MISSING"
  );
  console.log("================================================");

  return passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  })(req, res, next);
};

// ============================================================
// GOOGLE CALLBACK
// ============================================================

export const googleCallback = async (req, res) => {
  console.log("================================================");
  console.log("🔄 [GOOGLE CALLBACK] Callback route reached");
  console.log(
    "🔄 [GOOGLE CALLBACK] URL:",
    req.originalUrl
  );
  console.log(
    "🔄 [GOOGLE CALLBACK] User exists:",
    Boolean(req.user)
  );
  console.log("================================================");

  try {
    const user = req.user;

    if (!user) {
      console.error(
        "❌ [GOOGLE CALLBACK] No user found on request."
      );

      return redirectToFrontend(res, {
        error: "Google authentication failed.",
      });
    }

    console.log(
      "✅ [GOOGLE CALLBACK] User:",
      user._id.toString()
    );

    console.log(
      "📧 [GOOGLE CALLBACK] Email:",
      user.email
    );

    console.log(
      "📱 [GOOGLE CALLBACK] Phone verified:",
      Boolean(user.isPhoneVerified)
    );

    await user.updateLastLogin();

    // ========================================================
    // PHONE NOT VERIFIED
    // ========================================================

    if (!user.isPhoneVerified) {
      console.log(
        "📱 [GOOGLE CALLBACK] Phone verification required."
      );

      // The token is select:false on the schema, but our
      // strategy explicitly placed it on the object.
      let registrationToken =
        user.registrationVerificationToken;

      // Safety fallback in case the token isn't available.
      if (!registrationToken) {
        console.log(
          "⚠️ [GOOGLE CALLBACK] Registration token missing."
        );

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

        console.log(
          "✅ [GOOGLE CALLBACK] New registration token generated."
        );
      }

      return redirectToFrontend(res, {
        status: "phone-required",
        registrationToken,
        email: user.email,
      });
    }

    // ========================================================
    // PHONE VERIFIED → NORMAL LOGIN
    // ========================================================

    console.log(
      "✅ [GOOGLE CALLBACK] Phone already verified."
    );

    console.log(
      "🔐 [GOOGLE CALLBACK] Generating access token..."
    );

    const accessToken = generateAccessToken(
      user._id,
      user.role
    );

    console.log(
      "🔐 [GOOGLE CALLBACK] Generating refresh token..."
    );

    const refreshToken = generateRefreshToken(
      user._id,
      user.role
    );

    // ========================================================
    // REFRESH TOKEN COOKIE
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

    console.log(
      "🎉 [GOOGLE CALLBACK] Google login successful."
    );

    return redirectToFrontend(res, {
      status: "success",
      accessToken,
    });
  } catch (error) {
    console.error(
      "================================================"
    );

    console.error(
      "❌ [GOOGLE CALLBACK] ERROR"
    );

    console.error(
      "❌ Message:",
      error?.message
    );

    console.error(
      "❌ Stack:",
      error?.stack
    );

    console.error(
      "================================================"
    );

    return redirectToFrontend(res, {
      error:
        "Google authentication failed. Please try again.",
    });
  }
};

// ============================================================
// GOOGLE AUTH ERROR HANDLER
// ============================================================

export const googleAuthFailure = (req, res) => {
  console.error(
    "❌ [GOOGLE AUTH FAILURE] Google authentication failed."
  );

  console.error(
    "❌ [GOOGLE AUTH FAILURE] URL:",
    req.originalUrl
  );

  return redirectToFrontend(res, {
    error:
      "Google authentication was unsuccessful.",
  });
};

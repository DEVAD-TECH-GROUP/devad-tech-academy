// controllers/auth/googleAuthController.js

import crypto from "crypto";
import { OAuth2Client } from "google-auth-library";

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
// GOOGLE CLIENT
// ============================================================
//
// The frontend receives the Google credential using:
//
// @react-oauth/google
//
// The backend verifies that credential using the SAME
// Google Web Client ID.
//
// No Google client secret is required for this flow.
//
// ============================================================

const googleClient = new OAuth2Client(
  env.GOOGLE_CLIENT_ID
);

// ============================================================
// HELPERS
// ============================================================

const generateGoogleRegistrationToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

const getExpirationDate = (minutes) => {
  return new Date(
    Date.now() + minutes * 60 * 1000
  );
};

// ============================================================
// REFRESH TOKEN COOKIE
// ============================================================

const getRefreshCookieOptions = () => ({
  httpOnly: true,

  secure:
    env.NODE_ENV === "production",

  sameSite:
    env.NODE_ENV === "production"
      ? "none"
      : "lax",

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
// GOOGLE CREDENTIAL VERIFICATION
// ============================================================

const verifyGoogleCredential = async (
  credential
) => {
  if (!credential) {
    throw new Error(
      "Google credential is required."
    );
  }

  if (!env.GOOGLE_CLIENT_ID) {
    throw new Error(
      "Google Client ID is not configured on the server."
    );
  }

  console.log(
    "🔐 [GOOGLE] Verifying Google credential..."
  );

  const ticket =
    await googleClient.verifyIdToken({
      idToken: credential,

      audience:
        env.GOOGLE_CLIENT_ID,
    });

  const payload =
    ticket.getPayload();

  if (!payload) {
    throw new Error(
      "Google did not return a valid account."
    );
  }

  // ----------------------------------------------------------
  // Basic Google account information
  // ----------------------------------------------------------

  const googleId =
    payload.sub;

  const googleEmail =
    payload.email
      ?.toLowerCase()
      .trim();

  const emailVerified =
    payload.email_verified === true;

  const firstName =
    payload.given_name ||
    payload.name?.split(" ")?.[0] ||
    "Google";

  const lastName =
    payload.family_name ||
    payload.name
      ?.split(" ")
      ?.slice(1)
      ?.join(" ") ||
    "User";

  const displayName =
    payload.name ||
    `${firstName} ${lastName}`;

  const avatar =
    payload.picture || null;

  // ----------------------------------------------------------
  // Validate Google response
  // ----------------------------------------------------------

  if (!googleId) {
    throw new Error(
      "Google account ID was not provided."
    );
  }

  if (!googleEmail) {
    throw new Error(
      "Google account email was not provided."
    );
  }

  if (!emailVerified) {
    throw new Error(
      "Your Google email address has not been verified."
    );
  }

  return {
    googleId,
    googleEmail,
    firstName,
    lastName,
    displayName,
    avatar,
  };
};

// ============================================================
// CREATE GOOGLE REGISTRATION TOKEN
// ============================================================

const createRegistrationToken = async (
  user
) => {
  const registrationToken =
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

  return registrationToken;
};

// ============================================================
// COMPLETE AUTHENTICATION
// ============================================================

const completeAuthentication = async (
  user,
  res
) => {
  // ----------------------------------------------------------
  // Update last login
  // ----------------------------------------------------------

  if (
    typeof user.updateLastLogin ===
    "function"
  ) {
    await user.updateLastLogin();
  }

  // ----------------------------------------------------------
  // Generate Devad access token
  // ----------------------------------------------------------

  const accessToken =
    generateAccessToken(
      user._id,
      user.role
    );

  // ----------------------------------------------------------
  // Generate Devad refresh token
  // ----------------------------------------------------------

  const refreshToken =
    generateRefreshToken(
      user._id,
      user.role
    );

  // ----------------------------------------------------------
  // Store refresh token in HTTP-only cookie
  // ----------------------------------------------------------

  res.cookie(
    "refreshToken",
    refreshToken,
    getRefreshCookieOptions()
  );

  return {
    accessToken,
    user,
  };
};

// ============================================================
// GOOGLE LOGIN / REGISTRATION
// ============================================================
//
// POST /api/auth/google
//
// Body:
//
// {
//   "credential": "GOOGLE_ID_TOKEN"
// }
//
// ============================================================

export const googleLogin = async (
  req,
  res
) => {
  console.log(
    "================================================"
  );

  console.log(
    "🔵 [GOOGLE] POST /auth/google"
  );

  console.log(
    "🔵 [GOOGLE] IP:",
    req.ip
  );

  console.log(
    "🔵 [GOOGLE] Credential received:",
    Boolean(req.body?.credential)
  );

  console.log(
    "================================================"
  );

  try {
    // ========================================================
    // 1. GET GOOGLE CREDENTIAL
    // ========================================================

    const credential =
      req.body?.credential;

    if (!credential) {
      return res.status(400).json({
        success: false,
        message:
          "Google credential is required.",
      });
    }

    // ========================================================
    // 2. VERIFY GOOGLE CREDENTIAL
    // ========================================================

    const googleAccount =
      await verifyGoogleCredential(
        credential
      );

    const {
      googleId,
      googleEmail,
      firstName,
      lastName,
      displayName,
      avatar,
    } = googleAccount;

    console.log(
      "✅ [GOOGLE] Credential verified."
    );

    console.log(
      "🔵 [GOOGLE] Google ID:",
      googleId
    );

    console.log(
      "🔵 [GOOGLE] Email:",
      googleEmail
    );

    // ========================================================
    // 3. FIND USER BY GOOGLE ID
    // ========================================================

    let user =
      await User.findOne({
        googleId,
      });

    // ========================================================
    // 4. IF NOT FOUND, FIND BY EMAIL
    // ========================================================

    if (!user) {
      user =
        await User.findOne({
          email: googleEmail,
        });
    }

    // ========================================================
    // 5. CREATE NEW GOOGLE USER
    // ========================================================

    if (!user) {
      console.log(
        "🆕 [GOOGLE] Creating new Google user..."
      );

      user = await User.create({
        firstName,

        lastName,

        email: googleEmail,

        googleId,

        isGoogleAuth: true,

        // Google already verified the email
        isEmailVerified: true,

        // Phone must still be verified
        isPhoneVerified: false,

        role: ROLES.STUDENT,

        avatar: {
          url: avatar,
        },

        referralCode:
          generateReferralCode(
            displayName
          ),

        connectedAccounts: {
          google: true,
        },
      });

      console.log(
        "✅ [GOOGLE] User created:",
        user._id.toString()
      );

      // ======================================================
      // CREATE STUDENT PROFILE
      // ======================================================

      const existingStudent =
        await Student.findOne({
          user: user._id,
        });

      if (!existingStudent) {
        await Student.create({
          user: user._id,
        });

        console.log(
          "✅ [GOOGLE] Student profile created."
        );
      }
    }

    // ========================================================
    // 6. EXISTING USER
    // ========================================================

    else {
      console.log(
        "👤 [GOOGLE] Existing user:",
        user._id.toString()
      );

      let changed = false;

      // ------------------------------------------------------
      // Link Google ID
      // ------------------------------------------------------

      if (!user.googleId) {
        user.googleId =
          googleId;

        changed = true;
      }

      // ------------------------------------------------------
      // Mark Google authentication
      // ------------------------------------------------------

      if (!user.isGoogleAuth) {
        user.isGoogleAuth = true;

        changed = true;
      }

      // ------------------------------------------------------
      // Mark Google account as connected
      // ------------------------------------------------------

      if (
        !user.connectedAccounts
          ?.google
      ) {
        user.connectedAccounts = {
          ...(user.connectedAccounts ||
            {}),
          google: true,
        };

        changed = true;
      }

      // ------------------------------------------------------
      // Google has verified the email
      // ------------------------------------------------------

      if (!user.isEmailVerified) {
        user.isEmailVerified = true;

        changed = true;
      }

      // ------------------------------------------------------
      // Update avatar if missing
      // ------------------------------------------------------

      if (
        avatar &&
        (!user.avatar?.url ||
          user.avatar.url !== avatar)
      ) {
        user.avatar = {
          url: avatar,
        };

        changed = true;
      }

      // ------------------------------------------------------
      // Save changes
      // ------------------------------------------------------

      if (changed) {
        await user.save({
          validateBeforeSave: false,
        });
      }
    }

    // ========================================================
    // 7. PHONE VERIFICATION CHECK
    // ========================================================
    //
    // Google verifies email.
    //
    // Google does NOT complete our application's
    // phone-verification requirement.
    //
    // Therefore:
    //
    // isPhoneVerified === false
    //
    // → return registrationToken
    //
    // ========================================================

    if (!user.isPhoneVerified) {
      console.log(
        "📱 [GOOGLE] Phone verification required."
      );

      const registrationToken =
        await createRegistrationToken(
          user
        );

      console.log(
        "📱 [GOOGLE] Registration token generated."
      );

      return res.status(200).json({
        success: true,

        message:
          "Google account verified. Phone verification is required.",

        data: {
          requiresPhone: true,

          registrationToken,

          user: {
            id: user._id,
            firstName:
              user.firstName,
            lastName:
              user.lastName,
            email:
              user.email,
            isEmailVerified:
              user.isEmailVerified,
            isPhoneVerified:
              user.isPhoneVerified,
            role:
              user.role,
            avatar:
              user.avatar,
          },
        },
      });
    }

    // ========================================================
    // 8. PHONE ALREADY VERIFIED
    // ========================================================

    console.log(
      "✅ [GOOGLE] Phone already verified."
    );

    const authentication =
      await completeAuthentication(
        user,
        res
      );

    // ========================================================
    // 9. RETURN FULL AUTHENTICATION
    // ========================================================

    console.log(
      "✅ [GOOGLE] Authentication completed."
    );

    return res.status(200).json({
      success: true,

      message:
        "Google login successful.",

      data: {
        requiresPhone: false,

        user:
          authentication.user,

        accessToken:
          authentication.accessToken,
      },
    });
  } catch (error) {
    console.error(
      "================================================"
    );

    console.error(
      "❌ [GOOGLE] AUTHENTICATION ERROR"
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

    // --------------------------------------------------------
    // Google token errors
    // --------------------------------------------------------

    const message =
      error?.message ||
      "Google authentication failed.";

    return res.status(401).json({
      success: false,

      message,
    });
  }
};

// models/user/User.js

import mongoose from "mongoose";
import bcrypt from "bcryptjs";

import { ROLES, USER_STATUS } from "../../utils/constants.js";

const userSchema = new mongoose.Schema(
  {
    // ============================================================
    // BASIC PROFILE
    // ============================================================

    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      maxlength: [50, "First name cannot exceed 50 characters"],
    },

    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
      maxlength: [50, "Last name cannot exceed 50 characters"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },

    password: {
      type: String,
      minlength: [8, "Password must be at least 8 characters"],
      select: false,
    },

    // ============================================================
    // PHONE
    // ============================================================

    /*
     * Phone is intentionally NOT required here.
     *
     * Why?
     * Google OAuth does not reliably provide the user's phone number.
     *
     * Therefore:
     *
     * Normal registration:
     *   Account → Email verification → Phone verification
     *
     * Google registration:
     *   Google → Phone verification
     *
     * The phone is collected during the phone-verification step.
     */
// ============================================================
// PHONE
// ============================================================

/*
 * Phone is intentionally NOT required here.
 *
 * Normal registration:
 *   Account → Email verification → Phone verification
 *
 * Google registration:
 *   Google → Phone collection → Phone verification
 *
 * Robase handles the SMS OTP.
 */

phone: {
  type: String,
  trim: true,
  unique: true,
  sparse: true,
},

isPhoneVerified: {
  type: Boolean,
  default: false,
},

phoneVerificationToken: {
  type: String,
  select: false,
},

phoneVerificationExpire: {
  type: Date,
  select: false,
},

    // ============================================================
    // ROLE & ACCOUNT STATUS
    // ============================================================

    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.STUDENT,
    },

    status: {
      type: String,
      enum: Object.values(USER_STATUS),
      default: USER_STATUS.ACTIVE,
    },

    // ============================================================
    // PROFILE IMAGE
    // ============================================================

    avatar: {
      public_id: {
        type: String,
        default: null,
      },

      url: {
        type: String,
        default: null,
      },
    },

    // ============================================================
    // EMAIL VERIFICATION
    // ============================================================

    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    emailVerificationToken: {
      type: String,
      select: false,
    },

    emailVerificationExpire: {
      type: Date,
      select: false,
    },

    // ============================================================
    // PASSWORD RESET
    // ============================================================

    passwordResetToken: {
      type: String,
      select: false,
    },

    passwordResetExpire: {
      type: Date,
      select: false,
    },

    // ============================================================
    // GOOGLE AUTHENTICATION
    // ============================================================

    googleId: {
      type: String,
      default: null,
      sparse: true,
    },

    isGoogleAuth: {
      type: Boolean,
      default: false,
    },

    // ============================================================
    // TWO FACTOR AUTHENTICATION
    // ============================================================

    isTwoFactorEnabled: {
      type: Boolean,
      default: false,
    },

    twoFactorSecret: {
      type: String,
      select: false,
    },

    // ============================================================
    // LOGIN INFORMATION
    // ============================================================

    lastLogin: {
      type: Date,
      default: null,
    },

    // ============================================================
    // REFERRALS
    // ============================================================

    referralCode: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },

    referredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // ============================================================
    // NOTIFICATION PREFERENCES
    // ============================================================

    notificationPreferences: {
      email: {
        type: Boolean,
        default: true,
      },

      push: {
        type: Boolean,
        default: true,
      },

      sms: {
        type: Boolean,
        default: false,
      },

      assignments: {
        type: Boolean,
        default: true,
      },

      liveClasses: {
        type: Boolean,
        default: true,
      },

      quizzes: {
        type: Boolean,
        default: true,
      },

      announcements: {
        type: Boolean,
        default: true,
      },

      community: {
        type: Boolean,
        default: true,
      },
    },

    // ============================================================
    // USER PREFERENCES
    // ============================================================

    theme: {
      type: String,
      enum: ["dark", "light"],
      default: "dark",
    },

    language: {
      type: String,
      default: "en",
    },

    timezone: {
      type: String,
      default: "Africa/Lagos",
    },

    // ============================================================
    // SOCIAL LINKS
    // ============================================================

    socialLinks: {
      github: {
        type: String,
        default: null,
      },

      linkedin: {
        type: String,
        default: null,
      },

      twitter: {
        type: String,
        default: null,
      },

      website: {
        type: String,
        default: null,
      },
    },

    // ============================================================
    // CONNECTED ACCOUNTS
    // ============================================================

    connectedAccounts: {
      google: {
        type: Boolean,
        default: false,
      },

      github: {
        type: Boolean,
        default: false,
      },

      linkedin: {
        type: Boolean,
        default: false,
      },
    },

    // ============================================================
    // PROFILE INFORMATION
    // ============================================================

    bio: {
      type: String,
      maxlength: [500, "Bio cannot exceed 500 characters"],
      default: null,
    },

    headline: {
      type: String,
      maxlength: [100, "Headline cannot exceed 100 characters"],
      default: null,
    },

    location: {
      type: String,
      default: null,
    },
  },

  {
    timestamps: true,

    toJSON: {
      virtuals: true,
    },

    toObject: {
      virtuals: true,
    },
  }
);

// ================================================================
// VIRTUALS
// ================================================================

userSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// ================================================================
// INDEXES
// ================================================================

userSchema.index({
  email: 1,
});

userSchema.index({
  role: 1,
});

userSchema.index({
  status: 1,
});

userSchema.index({
  referralCode: 1,
});

userSchema.index({
  googleId: 1,
});

userSchema.index({
  phone: 1,
});

// ================================================================
// PASSWORD HASHING
// ================================================================

userSchema.pre("save", async function () {
  // Don't hash if password wasn't changed
  if (!this.isModified("password")) {
    return;
  }

  // Google accounts may not have a password
  if (!this.password) {
    return;
  }

  const salt = await bcrypt.genSalt(12);

  this.password = await bcrypt.hash(this.password, salt);
});

// ================================================================
// PASSWORD COMPARISON
// ================================================================

userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// ================================================================
// UPDATE LAST LOGIN
// ================================================================

userSchema.methods.updateLastLogin = async function () {
  this.lastLogin = new Date();

  await this.save({
    validateBeforeSave: false,
  });
};

// ================================================================
// USER MODEL
// ================================================================

const User = mongoose.model("User", userSchema);

export default User;

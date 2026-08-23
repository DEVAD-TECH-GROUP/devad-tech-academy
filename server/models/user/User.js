import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import {
  ROLES,
  USER_STATUS,
} from "../../utils/constants.js";

const userSchema = new mongoose.Schema(
  {
    // ── Basic info ──────────────────────────────────────
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
    phone: {
      type: String,
      trim: true,
    },

    // ── Role ────────────────────────────────────────────
    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.STUDENT,
    },

    // ── Status ──────────────────────────────────────────
    status: {
      type: String,
      enum: Object.values(USER_STATUS),
      default: USER_STATUS.ACTIVE,
    },

    // ── Avatar ──────────────────────────────────────────
    avatar: {
      public_id: { type: String, default: null },
      url: {
        type: String,
        default: null,
      },
    },

    // ── Email verification ───────────────────────────────
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

    // ── Password reset ───────────────────────────────────
    passwordResetToken: {
      type: String,
      select: false,
    },
    passwordResetExpire: {
      type: Date,
      select: false,
    },

    // ── Google OAuth ─────────────────────────────────────
    googleId: {
      type: String,
      default: null,
    },
    isGoogleAuth: {
      type: Boolean,
      default: false,
    },

    // ── Two factor auth ──────────────────────────────────
    isTwoFactorEnabled: {
      type: Boolean,
      default: false,
    },
    twoFactorSecret: {
      type: String,
      select: false,
    },

    // ── Last login ───────────────────────────────────────
    lastLogin: {
      type: Date,
      default: null,
    },

    // ── Referral ─────────────────────────────────────────
    referralCode: {
      type: String,
      unique: true,
      sparse: true,
    },
    referredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // ── Notifications preferences ────────────────────────
    notificationPreferences: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
      assignments: { type: Boolean, default: true },
      liveClasses: { type: Boolean, default: true },
      quizzes: { type: Boolean, default: true },
      announcements: { type: Boolean, default: true },
      community: { type: Boolean, default: true },
    },

    // ── Appearance ───────────────────────────────────────
    theme: {
      type: String,
      enum: ["dark", "light"],
      default: "dark",
    },
    language: {
      type: String,
      default: "en",
    },

    // ── Timezone ─────────────────────────────────────────
    timezone: {
      type: String,
      default: "Africa/Lagos",
    },

    // ── Social links ─────────────────────────────────────
    socialLinks: {
      github: { type: String, default: null },
      linkedin: { type: String, default: null },
      twitter: { type: String, default: null },
      website: { type: String, default: null },
    },

    // ── Connected accounts ────────────────────────────────
    connectedAccounts: {
      google: { type: Boolean, default: false },
      github: { type: Boolean, default: false },
      linkedin: { type: Boolean, default: false },
    },

    // ── Bio ──────────────────────────────────────────────
    bio: {
      type: String,
      maxlength: [500, "Bio cannot exceed 500 characters"],
      default: null,
    },

    // ── Headline ──────────────────────────────────────────
    headline: {
      type: String,
      maxlength: [100, "Headline cannot exceed 100 characters"],
      default: null,
    },

    // ── Location ─────────────────────────────────────────
    location: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ── Virtual: full name ────────────────────────────────────
userSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// ── Index ─────────────────────────────────────────────────
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ status: 1 });
userSchema.index({ referralCode: 1 });
userSchema.index({ googleId: 1 });

// ── Hash password before save ─────────────────────────────
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  if (!this.password) return next();

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ── Compare password ──────────────────────────────────────
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// ── Update last login ─────────────────────────────────────
userSchema.methods.updateLastLogin = async function () {
  this.lastLogin = new Date();
  await this.save({ validateBeforeSave: false });
};

const User = mongoose.model("User", userSchema);

export default User;

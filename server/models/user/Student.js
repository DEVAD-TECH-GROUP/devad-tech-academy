import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    // ── Reference to User ─────────────────────────────
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    // ── Learning stats ────────────────────────────────
    totalCoursesEnrolled: {
      type: Number,
      default: 0,
    },
    totalCoursesCompleted: {
      type: Number,
      default: 0,
    },
    totalLessonsCompleted: {
      type: Number,
      default: 0,
    },
    totalTimeSpent: {
      type: Number,
      default: 0, // in minutes
    },

    // ── XP and gamification ───────────────────────────
    xpPoints: {
      type: Number,
      default: 0,
    },
    level: {
      type: Number,
      default: 1,
    },
    badges: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Badge",
      },
    ],

    // ── Streak ────────────────────────────────────────
    currentStreak: {
      type: Number,
      default: 0,
    },
    longestStreak: {
      type: Number,
      default: 0,
    },
    lastActiveDate: {
      type: Date,
      default: null,
    },

    // ── Daily goal ────────────────────────────────────
    dailyGoalMinutes: {
      type: Number,
      default: 60,
    },
    todayMinutes: {
      type: Number,
      default: 0,
    },

    // ── Weekly activity chart ─────────────────────────
    weeklyActivity: [
      {
        date: { type: Date },
        minutes: { type: Number, default: 0 },
      },
    ],

    // ── Wishlist ──────────────────────────────────────
    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
      },
    ],

    // ── Learning path ─────────────────────────────────
    learningPath: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LearningPath",
      default: null,
    },

    // ── Subscription ──────────────────────────────────
    subscription: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subscription",
      default: null,
    },
    isSubscribed: {
      type: Boolean,
      default: false,
    },

    // ── Certificates ──────────────────────────────────
    totalCertificates: {
      type: Number,
      default: 0,
    },

    // ── Referral discount ─────────────────────────────
    subscriptionDiscount: {
      type: Number,
      default: 0,
    },

    // ── Career info ───────────────────────────────────
    skills: [
      {
        type: String,
        trim: true,
      },
    ],
    jobTitle: {
      type: String,
      default: null,
    },
    company: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// ── Index ─────────────────────────────────────────────────
studentSchema.index({ user: 1 });
studentSchema.index({ isSubscribed: 1 });

const Student = mongoose.model("Student", studentSchema);

export default Student;

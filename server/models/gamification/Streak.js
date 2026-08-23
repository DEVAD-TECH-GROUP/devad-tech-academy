import mongoose from "mongoose";

const streakSchema = new mongoose.Schema(
  {
    // ── References ────────────────────────────────────
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    // ── Streak info ───────────────────────────────────
    currentStreak: {
      type: Number,
      default: 0,
    },
    longestStreak: {
      type: Number,
      default: 0,
    },

    // ── Activity log ──────────────────────────────────
    activityLog: [
      {
        date: {
          type: Date,
          required: true,
        },
        minutesLearned: {
          type: Number,
          default: 0,
        },
        lessonsCompleted: {
          type: Number,
          default: 0,
        },
        goalMet: {
          type: Boolean,
          default: false,
        },
      },
    ],

    // ── Last active ───────────────────────────────────
    lastActiveDate: {
      type: Date,
      default: null,
    },

    // ── Streak started ────────────────────────────────
    streakStartDate: {
      type: Date,
      default: null,
    },

    // ── Total active days ─────────────────────────────
    totalActiveDays: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// ── Index ─────────────────────────────────────────────────
streakSchema.index({ student: 1 });
streakSchema.index({ currentStreak: -1 });

const Streak = mongoose.model("Streak", streakSchema);

export default Streak;
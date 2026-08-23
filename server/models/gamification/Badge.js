import mongoose from "mongoose";

const badgeSchema = new mongoose.Schema(
  {
    // ── References ────────────────────────────────────
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    achievement: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Achievement",
      required: true,
    },

    // ── Badge info ────────────────────────────────────
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    icon: {
      type: String,
      required: true,
    },

    // ── Earned at ─────────────────────────────────────
    earnedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// ── Prevent duplicate badges ──────────────────────────────
badgeSchema.index(
  { student: 1, achievement: 1 },
  { unique: true }
);
badgeSchema.index({ student: 1 });

const Badge = mongoose.model("Badge", badgeSchema);

export default Badge;
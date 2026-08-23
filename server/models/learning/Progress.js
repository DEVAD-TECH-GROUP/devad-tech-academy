import mongoose from "mongoose";

const progressSchema = new mongoose.Schema(
  {
    // ── References ────────────────────────────────────
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    lesson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lesson",
      required: true,
    },
    enrollment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Enrollment",
      required: true,
    },

    // ── Progress ──────────────────────────────────────
    isCompleted: {
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: Date,
      default: null,
    },

    // ── Watch time ────────────────────────────────────
    watchedDuration: {
      type: Number,
      default: 0, // in seconds
    },
    totalDuration: {
      type: Number,
      default: 0, // in seconds
    },
    watchedPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    // ── Last watched position ─────────────────────────
    lastPosition: {
      type: Number,
      default: 0, // in seconds
    },

    // ── Notes by student ──────────────────────────────
    notes: {
      type: String,
      default: null,
    },

    // ── Times accessed ────────────────────────────────
    accessCount: {
      type: Number,
      default: 0,
    },
    lastAccessedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// ── Prevent duplicate progress records ────────────────────
progressSchema.index(
  { student: 1, lesson: 1 },
  { unique: true }
);
progressSchema.index({ student: 1, course: 1 });
progressSchema.index({ enrollment: 1 });

const Progress = mongoose.model("Progress", progressSchema);

export default Progress;
import mongoose from "mongoose";

const enrollmentSchema = new mongoose.Schema(
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

    // ── Enrollment status ─────────────────────────────
    status: {
      type: String,
      enum: ["active", "completed", "dropped", "expired"],
      default: "active",
    },

    // ── Progress ──────────────────────────────────────
    progress: {
      type: Number,
      default: 0, // percentage 0-100
      min: 0,
      max: 100,
    },
    completedLessons: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Lesson",
      },
    ],
    totalLessonsCompleted: {
      type: Number,
      default: 0,
    },

    // ── Last accessed ─────────────────────────────────
    lastAccessedAt: {
      type: Date,
      default: null,
    },
    lastAccessedLesson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lesson",
      default: null,
    },

    // ── Completion ────────────────────────────────────
    isCompleted: {
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: Date,
      default: null,
    },

    // ── Certificate ───────────────────────────────────
    certificateIssued: {
      type: Boolean,
      default: false,
    },
    certificate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Certificate",
      default: null,
    },

    // ── Payment reference ─────────────────────────────
    payment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
      default: null,
    },

    // ── Time spent ────────────────────────────────────
    totalTimeSpent: {
      type: Number,
      default: 0, // in minutes
    },

    // ── Rating given ──────────────────────────────────
    hasReviewed: {
      type: Boolean,
      default: false,
    },

    // ── Enrolled at ───────────────────────────────────
    enrolledAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// ── Prevent duplicate enrollments ─────────────────────────
enrollmentSchema.index(
  { student: 1, course: 1 },
  { unique: true }
);
enrollmentSchema.index({ student: 1 });
enrollmentSchema.index({ course: 1 });
enrollmentSchema.index({ status: 1 });
enrollmentSchema.index({ isCompleted: 1 });

const Enrollment = mongoose.model("Enrollment", enrollmentSchema);

export default Enrollment;

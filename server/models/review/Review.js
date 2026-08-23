import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
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
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    enrollment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Enrollment",
      required: true,
    },

    // ── Review info ───────────────────────────────────
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot exceed 5"],
    },
    title: {
      type: String,
      maxlength: [100, "Title cannot exceed 100 characters"],
      default: null,
    },
    content: {
      type: String,
      required: [true, "Review content is required"],
      maxlength: [2000, "Content cannot exceed 2000 characters"],
    },

    // ── Detailed ratings ──────────────────────────────
    detailedRatings: {
      contentQuality: { type: Number, min: 1, max: 5, default: null },
      instructorRating: { type: Number, min: 1, max: 5, default: null },
      valueForMoney: { type: Number, min: 1, max: 5, default: null },
      support: { type: Number, min: 1, max: 5, default: null },
    },

    // ── Instructor reply ──────────────────────────────
    instructorReply: {
      content: { type: String, default: null },
      repliedAt: { type: Date, default: null },
    },

    // ── Stats ─────────────────────────────────────────
    totalLikes: {
      type: Number,
      default: 0,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // ── Moderation ────────────────────────────────────
    isFlagged: {
      type: Boolean,
      default: false,
    },
    flagReason: {
      type: String,
      default: null,
    },
    flaggedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    isRemoved: {
      type: Boolean,
      default: false,
    },
    removedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    removedAt: {
      type: Date,
      default: null,
    },

    // ── Verified purchase ─────────────────────────────
    isVerified: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// ── Prevent duplicate reviews ─────────────────────────────
reviewSchema.index(
  { student: 1, course: 1 },
  { unique: true }
);
reviewSchema.index({ course: 1 });
reviewSchema.index({ instructor: 1 });
reviewSchema.index({ rating: -1 });
reviewSchema.index({ isFlagged: 1 });

const Review = mongoose.model("Review", reviewSchema);

export default Review;
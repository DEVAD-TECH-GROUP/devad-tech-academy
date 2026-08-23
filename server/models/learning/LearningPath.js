import mongoose from "mongoose";

const learningPathSchema = new mongoose.Schema(
  {
    // ── Basic info ────────────────────────────────────
    title: {
      type: String,
      required: [true, "Learning path title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    description: {
      type: String,
      maxlength: [500, "Description cannot exceed 500 characters"],
      default: null,
    },

    // ── Thumbnail ─────────────────────────────────────
    thumbnail: {
      public_id: { type: String, default: null },
      url: { type: String, default: null },
    },

    // ── Courses ───────────────────────────────────────
    requiredCourses: [
      {
        course: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Course",
        },
        order: { type: Number, default: 0 },
      },
    ],
    optionalCourses: [
      {
        course: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Course",
        },
        order: { type: Number, default: 0 },
      },
    ],

    // ── Milestones ────────────────────────────────────
    milestones: [
      {
        title: { type: String, required: true },
        description: { type: String, default: null },
        requiredCourses: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Course",
          },
        ],
        xpReward: { type: Number, default: 0 },
        badgeReward: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Badge",
          default: null,
        },
      },
    ],

    // ── Stats ─────────────────────────────────────────
    totalCourses: {
      type: Number,
      default: 0,
    },
    totalStudents: {
      type: Number,
      default: 0,
    },
    estimatedDuration: {
      type: Number,
      default: 0, // in hours
    },

    // ── Level ─────────────────────────────────────────
    level: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "beginner",
    },

    // ── Status ────────────────────────────────────────
    isActive: {
      type: Boolean,
      default: true,
    },

    // ── Created by ────────────────────────────────────
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// ── Index ─────────────────────────────────────────────────
learningPathSchema.index({ isActive: 1 });
learningPathSchema.index({ createdBy: 1 });

const LearningPath = mongoose.model("LearningPath", learningPathSchema);

export default LearningPath;

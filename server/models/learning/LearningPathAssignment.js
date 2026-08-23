import mongoose from "mongoose";

const learningPathAssignmentSchema = new mongoose.Schema(
  {
    // ── References ────────────────────────────────────
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    learningPath: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LearningPath",
      required: true,
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ── Progress ──────────────────────────────────────
    completedCourses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
      },
    ],
    progress: {
      type: Number,
      default: 0, // percentage 0-100
      min: 0,
      max: 100,
    },

    // ── Milestones achieved ───────────────────────────
    achievedMilestones: [
      {
        milestone: { type: String },
        achievedAt: { type: Date, default: Date.now },
      },
    ],

    // ── Status ────────────────────────────────────────
    status: {
      type: String,
      enum: ["active", "completed", "dropped"],
      default: "active",
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: Date,
      default: null,
    },

    // ── Assigned at ───────────────────────────────────
    assignedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// ── Prevent duplicate assignments ─────────────────────────
learningPathAssignmentSchema.index(
  { student: 1, learningPath: 1 },
  { unique: true }
);
learningPathAssignmentSchema.index({ student: 1 });
learningPathAssignmentSchema.index({ learningPath: 1 });

const LearningPathAssignment = mongoose.model(
  "LearningPathAssignment",
  learningPathAssignmentSchema
);

export default LearningPathAssignment;
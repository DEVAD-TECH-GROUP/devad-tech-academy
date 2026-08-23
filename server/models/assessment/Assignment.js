import mongoose from "mongoose";

const assignmentSchema = new mongoose.Schema(
  {
    // ── References ────────────────────────────────────
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

    // ── Basic info ────────────────────────────────────
    title: {
      type: String,
      required: [true, "Assignment title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Assignment description is required"],
      maxlength: [5000, "Description cannot exceed 5000 characters"],
    },

    // ── Instructions ──────────────────────────────────
    instructions: {
      type: String,
      maxlength: [5000, "Instructions cannot exceed 5000 characters"],
      default: null,
    },

    // ── Resources ─────────────────────────────────────
    attachments: [
      {
        name: { type: String },
        url: { type: String },
        public_id: { type: String },
        type: { type: String },
      },
    ],

    // ── Due date ──────────────────────────────────────
    dueDate: {
      type: Date,
      required: [true, "Due date is required"],
    },

    // ── Points ────────────────────────────────────────
    totalPoints: {
      type: Number,
      required: [true, "Total points is required"],
      default: 100,
    },
    passingPoints: {
      type: Number,
      default: 50,
    },

    // ── Rubric ────────────────────────────────────────
    rubric: [
      {
        criterion: { type: String, required: true },
        description: { type: String },
        points: { type: Number, required: true },
      },
    ],

    // ── Submission settings ───────────────────────────
    allowLateSubmission: {
      type: Boolean,
      default: false,
    },
    latePenaltyPercent: {
      type: Number,
      default: 0,
    },
    maxFileSize: {
      type: Number,
      default: 50, // in MB
    },
    allowedFileTypes: [
      {
        type: String,
      },
    ],

    // ── Stats ─────────────────────────────────────────
    totalSubmissions: {
      type: Number,
      default: 0,
    },
    totalGraded: {
      type: Number,
      default: 0,
    },
    averageGrade: {
      type: Number,
      default: 0,
    },

    // ── Status ────────────────────────────────────────
    isPublished: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// ── Index ─────────────────────────────────────────────────
assignmentSchema.index({ course: 1 });
assignmentSchema.index({ instructor: 1 });
assignmentSchema.index({ dueDate: 1 });
assignmentSchema.index({ isPublished: 1 });

const Assignment = mongoose.model("Assignment", assignmentSchema);

export default Assignment;
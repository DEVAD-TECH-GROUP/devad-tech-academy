import mongoose from "mongoose";
import { ASSIGNMENT_STATUS } from "../../utils/constants.js";

const submissionSchema = new mongoose.Schema(
  {
    // ── References ────────────────────────────────────
    assignment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Assignment",
      required: true,
    },
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

    // ── Submission content ────────────────────────────
    content: {
      type: String,
      default: null,
    },
    attachments: [
      {
        name: { type: String },
        url: { type: String },
        public_id: { type: String },
        size: { type: Number },
        type: { type: String },
      },
    ],
    links: [
      {
        label: { type: String },
        url: { type: String },
      },
    ],

    // ── Status ────────────────────────────────────────
    status: {
      type: String,
      enum: Object.values(ASSIGNMENT_STATUS),
      default: ASSIGNMENT_STATUS.SUBMITTED,
    },

    // ── Late submission ───────────────────────────────
    isLate: {
      type: Boolean,
      default: false,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },

    // ── Grading ───────────────────────────────────────
    grade: {
      type: Number,
      default: null,
    },
    gradedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    gradedAt: {
      type: Date,
      default: null,
    },

    // ── Feedback ──────────────────────────────────────
    feedback: {
      type: String,
      maxlength: [2000, "Feedback cannot exceed 2000 characters"],
      default: null,
    },
    rubricGrades: [
      {
        criterion: { type: String },
        pointsEarned: { type: Number },
        comment: { type: String },
      },
    ],

    // ── Resubmission ──────────────────────────────────
    isResubmission: {
      type: Boolean,
      default: false,
    },
    resubmissionCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// ── Prevent duplicate submissions ─────────────────────────
submissionSchema.index(
  { assignment: 1, student: 1 },
  { unique: true }
);
submissionSchema.index({ assignment: 1 });
submissionSchema.index({ student: 1 });
submissionSchema.index({ status: 1 });

const Submission = mongoose.model("Submission", submissionSchema);

export default Submission;
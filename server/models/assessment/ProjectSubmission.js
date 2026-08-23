import mongoose from "mongoose";
import { PROJECT_STATUS } from "../../utils/constants.js";

const projectSubmissionSchema = new mongoose.Schema(
  {
    // ── References ────────────────────────────────────
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
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

    // ── Team members ──────────────────────────────────
    teamMembers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // ── Submission content ────────────────────────────
    description: {
      type: String,
      maxlength: [2000, "Description cannot exceed 2000 characters"],
      default: null,
    },
    githubUrl: {
      type: String,
      default: null,
    },
    liveUrl: {
      type: String,
      default: null,
    },
    files: [
      {
        name: { type: String },
        url: { type: String },
        public_id: { type: String },
        size: { type: Number },
        type: { type: String },
      },
    ],
    videoDemo: {
      type: String,
      default: null,
    },

    // ── Status ────────────────────────────────────────
    status: {
      type: String,
      enum: Object.values(PROJECT_STATUS),
      default: PROJECT_STATUS.SUBMITTED,
    },
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
    letterGrade: {
      type: String,
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
      maxlength: [3000, "Feedback cannot exceed 3000 characters"],
      default: null,
    },
    rubricGrades: [
      {
        criterion: { type: String },
        pointsEarned: { type: Number },
        comment: { type: String },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// ── Prevent duplicate submissions ─────────────────────────
projectSubmissionSchema.index(
  { project: 1, student: 1 },
  { unique: true }
);
projectSubmissionSchema.index({ project: 1 });
projectSubmissionSchema.index({ student: 1 });
projectSubmissionSchema.index({ status: 1 });

const ProjectSubmission = mongoose.model(
  "ProjectSubmission",
  projectSubmissionSchema
);

export default ProjectSubmission;
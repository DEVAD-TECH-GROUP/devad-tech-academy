import mongoose from "mongoose";
import { QUIZ_STATUS } from "../../utils/constants.js";

const quizSchema = new mongoose.Schema(
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
    lesson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lesson",
      default: null,
    },

    // ── Basic info ────────────────────────────────────
    title: {
      type: String,
      required: [true, "Quiz title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    description: {
      type: String,
      maxlength: [500, "Description cannot exceed 500 characters"],
      default: null,
    },
    instructions: {
      type: String,
      maxlength: [1000, "Instructions cannot exceed 1000 characters"],
      default: null,
    },

    // ── Settings ──────────────────────────────────────
    duration: {
      type: Number,
      default: 30, // in minutes
    },
    totalQuestions: {
      type: Number,
      default: 0,
    },
    totalPoints: {
      type: Number,
      default: 0,
    },
    passingScore: {
      type: Number,
      default: 50, // percentage
    },
    maxAttempts: {
      type: Number,
      default: 3,
    },
    shuffleQuestions: {
      type: Boolean,
      default: true,
    },
    shuffleOptions: {
      type: Boolean,
      default: true,
    },
    showResults: {
      type: Boolean,
      default: true,
    },
    showCorrectAnswers: {
      type: Boolean,
      default: true,
    },

    // ── Schedule ──────────────────────────────────────
    availableFrom: {
      type: Date,
      default: null,
    },
    availableUntil: {
      type: Date,
      default: null,
    },

    // ── Status ────────────────────────────────────────
    status: {
      type: String,
      enum: Object.values(QUIZ_STATUS),
      default: QUIZ_STATUS.DRAFT,
    },

    // ── Stats ─────────────────────────────────────────
    totalAttempts: {
      type: Number,
      default: 0,
    },
    averageScore: {
      type: Number,
      default: 0,
    },
    passRate: {
      type: Number,
      default: 0,
    },

    // ── Academic integrity ────────────────────────────
    flaggedAttempts: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// ── Index ─────────────────────────────────────────────────
quizSchema.index({ course: 1 });
quizSchema.index({ instructor: 1 });
quizSchema.index({ status: 1 });

const Quiz = mongoose.model("Quiz", quizSchema);

export default Quiz;
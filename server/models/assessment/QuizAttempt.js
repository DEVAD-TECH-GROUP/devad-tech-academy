import mongoose from "mongoose";

const quizAttemptSchema = new mongoose.Schema(
  {
    // ── References ────────────────────────────────────
    quiz: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
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

    // ── Attempt number ────────────────────────────────
    attemptNumber: {
      type: Number,
      required: true,
      default: 1,
    },

    // ── Answers ───────────────────────────────────────
    answers: [
      {
        question: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Question",
        },
        selectedOption: { type: String, default: null },
        textAnswer: { type: String, default: null },
        codeAnswer: { type: String, default: null },
        isCorrect: { type: Boolean, default: false },
        pointsEarned: { type: Number, default: 0 },
        timeTaken: { type: Number, default: 0 }, // in seconds
      },
    ],

    // ── Score ─────────────────────────────────────────
    score: {
      type: Number,
      default: 0,
    },
    percentage: {
      type: Number,
      default: 0,
    },
    isPassed: {
      type: Boolean,
      default: false,
    },

    // ── Timing ────────────────────────────────────────
    startedAt: {
      type: Date,
      default: Date.now,
    },
    submittedAt: {
      type: Date,
      default: null,
    },
    timeTaken: {
      type: Number,
      default: 0, // in minutes
    },

    // ── Status ────────────────────────────────────────
    status: {
      type: String,
      enum: ["in-progress", "submitted", "graded", "flagged"],
      default: "in-progress",
    },

    // ── Academic integrity ────────────────────────────
    isFlagged: {
      type: Boolean,
      default: false,
    },
    flagReason: {
      type: String,
      default: null,
    },

    // ── Manual grading ────────────────────────────────
    gradedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    gradedAt: {
      type: Date,
      default: null,
    },
    instructorFeedback: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// ── Index ─────────────────────────────────────────────────
quizAttemptSchema.index({ quiz: 1, student: 1 });
quizAttemptSchema.index({ student: 1 });
quizAttemptSchema.index({ status: 1 });
quizAttemptSchema.index({ isFlagged: 1 });

const QuizAttempt = mongoose.model("QuizAttempt", quizAttemptSchema);

export default QuizAttempt;

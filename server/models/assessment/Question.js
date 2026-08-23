import mongoose from "mongoose";
import { QUESTION_TYPES } from "../../utils/constants.js";

const questionSchema = new mongoose.Schema(
  {
    // ── References ────────────────────────────────────
    quiz: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },

    // ── Question ──────────────────────────────────────
    question: {
      type: String,
      required: [true, "Question is required"],
      maxlength: [1000, "Question cannot exceed 1000 characters"],
    },
    type: {
      type: String,
      enum: Object.values(QUESTION_TYPES),
      required: true,
    },

    // ── Options (for multiple choice) ─────────────────
    options: [
      {
        text: { type: String, required: true },
        isCorrect: { type: Boolean, default: false },
      },
    ],

    // ── Correct answer ────────────────────────────────
    correctAnswer: {
      type: String,
      default: null,
      select: false,
    },

    // ── Explanation ───────────────────────────────────
    explanation: {
      type: String,
      maxlength: [1000, "Explanation cannot exceed 1000 characters"],
      default: null,
    },

    // ── Points ────────────────────────────────────────
    points: {
      type: Number,
      default: 1,
    },

    // ── Coding question ───────────────────────────────
    codeLanguage: {
      type: String,
      default: null,
    },
    starterCode: {
      type: String,
      default: null,
    },
    testCases: [
      {
        input: { type: String },
        expectedOutput: { type: String },
        isHidden: { type: Boolean, default: false },
      },
    ],

    // ── Order ─────────────────────────────────────────
    order: {
      type: Number,
      default: 0,
    },

    // ── Difficulty ────────────────────────────────────
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
    },

    // ── Tags ──────────────────────────────────────────
    tags: [{ type: String }],
  },
  {
    timestamps: true,
  }
);

// ── Index ─────────────────────────────────────────────────
questionSchema.index({ quiz: 1, order: 1 });
questionSchema.index({ course: 1 });
questionSchema.index({ type: 1 });

const Question = mongoose.model("Question", questionSchema);

export default Question;

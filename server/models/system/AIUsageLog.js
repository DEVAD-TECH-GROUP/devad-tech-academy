import mongoose from "mongoose";

const aiUsageLogSchema = new mongoose.Schema(
  {
    // ── References ────────────────────────────────────
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ── Usage info ────────────────────────────────────
    feature: {
      type: String,
      enum: [
        "quiz-generation",
        "assignment-generation",
        "lesson-outline",
        "concept-explanation",
        "coding-exercise",
        "student-analysis",
        "chatbot",
        "tutor",
        "content-moderation",
      ],
      required: true,
    },
    prompt: {
      type: String,
      maxlength: [2000, "Prompt cannot exceed 2000 characters"],
      select: false,
    },
    response: {
      type: String,
      select: false,
    },

    // ── Model used ────────────────────────────────────
    model: {
      type: String,
      default: "claude-sonnet-4-6",
    },

    // ── Token usage ───────────────────────────────────
    inputTokens: {
      type: Number,
      default: 0,
    },
    outputTokens: {
      type: Number,
      default: 0,
    },
    totalTokens: {
      type: Number,
      default: 0,
    },

    // ── Cost ──────────────────────────────────────────
    estimatedCost: {
      type: Number,
      default: 0,
    },

    // ── Status ────────────────────────────────────────
    isSuccess: {
      type: Boolean,
      default: true,
    },
    errorMessage: {
      type: String,
      default: null,
    },

    // ── Duration ──────────────────────────────────────
    duration: {
      type: Number,
      default: 0, // in ms
    },
  },
  {
    timestamps: true,
  }
);

// ── Auto delete after 90 days ─────────────────────────────
aiUsageLogSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 90 * 24 * 60 * 60 }
);
aiUsageLogSchema.index({ user: 1 });
aiUsageLogSchema.index({ feature: 1 });
aiUsageLogSchema.index({ createdAt: -1 });

const AIUsageLog = mongoose.model("AIUsageLog", aiUsageLogSchema);

export default AIUsageLog;
import mongoose from "mongoose";

const faqSchema = new mongoose.Schema(
  {
    // ── Basic info ────────────────────────────────────
    question: {
      type: String,
      required: [true, "Question is required"],
      trim: true,
      maxlength: [300, "Question cannot exceed 300 characters"],
    },
    answer: {
      type: String,
      required: [true, "Answer is required"],
      maxlength: [2000, "Answer cannot exceed 2000 characters"],
    },

    // ── Category ──────────────────────────────────────
    category: {
      type: String,
      enum: [
        "general",
        "courses",
        "payments",
        "certificates",
        "technical",
        "account",
      ],
      default: "general",
    },

    // ── Order ─────────────────────────────────────────
    order: {
      type: Number,
      default: 0,
    },

    // ── Stats ─────────────────────────────────────────
    totalViews: {
      type: Number,
      default: 0,
    },
    isHelpful: {
      type: Number,
      default: 0,
    },
    notHelpful: {
      type: Number,
      default: 0,
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
faqSchema.index({ category: 1, order: 1 });
faqSchema.index({ isActive: 1 });

const FAQ = mongoose.model("FAQ", faqSchema);

export default FAQ;
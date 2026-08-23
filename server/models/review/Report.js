import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    // ── Reporter ──────────────────────────────────────
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ── Reported content ──────────────────────────────
    contentType: {
      type: String,
      enum: [
        "discussion",
        "reply",
        "review",
        "message",
        "user",
        "course",
      ],
      required: true,
    },
    contentId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    // ── Report info ───────────────────────────────────
    reason: {
      type: String,
      enum: [
        "spam",
        "inappropriate",
        "harassment",
        "misinformation",
        "copyright",
        "other",
      ],
      required: true,
    },
    description: {
      type: String,
      maxlength: [500, "Description cannot exceed 500 characters"],
      default: null,
    },

    // ── Status ────────────────────────────────────────
    status: {
      type: String,
      enum: ["pending", "reviewed", "resolved", "dismissed"],
      default: "pending",
    },

    // ── Resolution ────────────────────────────────────
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
    resolutionNote: {
      type: String,
      default: null,
    },
    actionTaken: {
      type: String,
      enum: [
        "none",
        "warning",
        "content-removed",
        "user-suspended",
        "dismissed",
      ],
      default: "none",
    },
  },
  {
    timestamps: true,
  }
);

// ── Index ─────────────────────────────────────────────────
reportSchema.index({ reportedBy: 1 });
reportSchema.index({ contentType: 1, contentId: 1 });
reportSchema.index({ status: 1 });

const Report = mongoose.model("Report", reportSchema);

export default Report;
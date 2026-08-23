import mongoose from "mongoose";
import { XP_POINTS } from "../../utils/constants.js";

const xpSchema = new mongoose.Schema(
  {
    // ── References ────────────────────────────────────
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      default: null,
    },

    // ── XP info ───────────────────────────────────────
    action: {
      type: String,
      enum: Object.keys(XP_POINTS),
      required: true,
    },
    points: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      maxlength: [200, "Description cannot exceed 200 characters"],
      default: null,
    },

    // ── Reference ─────────────────────────────────────
    reference: {
      model: {
        type: String,
        default: null,
      },
      id: {
        type: mongoose.Schema.Types.ObjectId,
        default: null,
      },
    },
  },
  {
    timestamps: true,
  }
);

// ── Index ─────────────────────────────────────────────────
xpSchema.index({ student: 1 });
xpSchema.index({ student: 1, createdAt: -1 });

const XP = mongoose.model("XP", xpSchema);

export default XP;
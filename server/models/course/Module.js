import mongoose from "mongoose";

const moduleSchema = new mongoose.Schema(
  {
    // ── Course reference ──────────────────────────────
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },

    // ── Basic info ────────────────────────────────────
    title: {
      type: String,
      required: [true, "Module title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    description: {
      type: String,
      maxlength: [500, "Description cannot exceed 500 characters"],
      default: null,
    },

    // ── Order ─────────────────────────────────────────
    order: {
      type: Number,
      required: true,
      default: 0,
    },

    // ── Stats ─────────────────────────────────────────
    totalLessons: {
      type: Number,
      default: 0,
    },
    totalDuration: {
      type: Number,
      default: 0, // in minutes
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
moduleSchema.index({ course: 1, order: 1 });

const Module = mongoose.model("Module", moduleSchema);

export default Module;

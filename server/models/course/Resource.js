import mongoose from "mongoose";
import { RESOURCE_TYPES } from "../../utils/constants.js";

const resourceSchema = new mongoose.Schema(
  {
    // ── References ────────────────────────────────────
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    lesson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lesson",
      default: null,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ── Basic info ────────────────────────────────────
    name: {
      type: String,
      required: [true, "Resource name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    description: {
      type: String,
      maxlength: [300, "Description cannot exceed 300 characters"],
      default: null,
    },

    // ── File info ─────────────────────────────────────
    type: {
      type: String,
      enum: Object.values(RESOURCE_TYPES),
      required: true,
    },
    file: {
      public_id: { type: String, default: null },
      url: { type: String, required: true },
      size: { type: Number, default: 0 }, // in bytes
      format: { type: String, default: null },
    },

    // ── Downloads ─────────────────────────────────────
    totalDownloads: {
      type: Number,
      default: 0,
    },

    // ── Status ────────────────────────────────────────
    isPublic: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// ── Index ─────────────────────────────────────────────────
resourceSchema.index({ course: 1 });
resourceSchema.index({ lesson: 1 });
resourceSchema.index({ type: 1 });

const Resource = mongoose.model("Resource", resourceSchema);

export default Resource;

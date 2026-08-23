import mongoose from "mongoose";
import { LESSON_TYPES } from "../../utils/constants.js";

const lessonSchema = new mongoose.Schema(
  {
    // ── References ────────────────────────────────────
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    module: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Module",
      required: true,
    },

    // ── Basic info ────────────────────────────────────
    title: {
      type: String,
      required: [true, "Lesson title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    description: {
      type: String,
      maxlength: [500, "Description cannot exceed 500 characters"],
      default: null,
    },

    // ── Type ──────────────────────────────────────────
    type: {
      type: String,
      enum: Object.values(LESSON_TYPES),
      default: LESSON_TYPES.VIDEO,
    },

    // ── Video ─────────────────────────────────────────
    video: {
      public_id: { type: String, default: null },
      url: { type: String, default: null },
      duration: { type: Number, default: 0 }, // in minutes
      thumbnail: { type: String, default: null },
    },

    // ── Text content ──────────────────────────────────
    content: {
      type: String,
      default: null,
    },

    // ── Order ─────────────────────────────────────────
    order: {
      type: Number,
      required: true,
      default: 0,
    },

    // ── Free preview ──────────────────────────────────
    isFreePreview: {
      type: Boolean,
      default: false,
    },

    // ── Status ────────────────────────────────────────
    isPublished: {
      type: Boolean,
      default: false,
    },

    // ── Resources ─────────────────────────────────────
    resources: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Resource",
      },
    ],

    // ── Notes ─────────────────────────────────────────
    notes: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// ── Index ─────────────────────────────────────────────────
lessonSchema.index({ course: 1, module: 1, order: 1 });

const Lesson = mongoose.model("Lesson", lessonSchema);

export default Lesson;
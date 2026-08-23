import mongoose from "mongoose";

const testimonialSchema = new mongoose.Schema(
  {
    // ── References ────────────────────────────────────
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // ── Basic info ────────────────────────────────────
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    role: {
      type: String,
      maxlength: [100, "Role cannot exceed 100 characters"],
      default: null,
    },
    company: {
      type: String,
      maxlength: [100, "Company cannot exceed 100 characters"],
      default: null,
    },
    avatar: {
      public_id: { type: String, default: null },
      url: { type: String, default: null },
    },

    // ── Testimonial ───────────────────────────────────
    content: {
      type: String,
      required: [true, "Testimonial content is required"],
      maxlength: [1000, "Content cannot exceed 1000 characters"],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: 5,
    },

    // ── Course ────────────────────────────────────────
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      default: null,
    },

    // ── Order ─────────────────────────────────────────
    order: {
      type: Number,
      default: 0,
    },

    // ── Status ────────────────────────────────────────
    isActive: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
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
testimonialSchema.index({ isActive: 1, isFeatured: -1 });
testimonialSchema.index({ order: 1 });

const Testimonial = mongoose.model("Testimonial", testimonialSchema);

export default Testimonial;
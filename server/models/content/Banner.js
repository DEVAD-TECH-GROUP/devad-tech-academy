import mongoose from "mongoose";

const bannerSchema = new mongoose.Schema(
  {
    // ── Basic info ────────────────────────────────────
    title: {
      type: String,
      required: [true, "Banner title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    subtitle: {
      type: String,
      maxlength: [200, "Subtitle cannot exceed 200 characters"],
      default: null,
    },

    // ── Image ─────────────────────────────────────────
    image: {
      public_id: { type: String, default: null },
      url: { type: String, required: true },
    },
    mobileImage: {
      public_id: { type: String, default: null },
      url: { type: String, default: null },
    },

    // ── CTA ───────────────────────────────────────────
    ctaText: {
      type: String,
      maxlength: [50, "CTA text cannot exceed 50 characters"],
      default: null,
    },
    ctaUrl: {
      type: String,
      default: null,
    },

    // ── Position ──────────────────────────────────────
    position: {
      type: String,
      enum: ["hero", "sidebar", "popup", "footer"],
      default: "hero",
    },
    order: {
      type: Number,
      default: 0,
    },

    // ── Schedule ──────────────────────────────────────
    startDate: {
      type: Date,
      default: null,
    },
    endDate: {
      type: Date,
      default: null,
    },

    // ── Stats ─────────────────────────────────────────
    totalClicks: {
      type: Number,
      default: 0,
    },
    totalViews: {
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
bannerSchema.index({ isActive: 1, position: 1, order: 1 });

const Banner = mongoose.model("Banner", bannerSchema);

export default Banner;
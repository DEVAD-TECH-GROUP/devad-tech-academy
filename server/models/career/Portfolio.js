import mongoose from "mongoose";

const portfolioSchema = new mongoose.Schema(
  {
    // ── References ────────────────────────────────────
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    // ── Basic info ────────────────────────────────────
    headline: {
      type: String,
      maxlength: [100, "Headline cannot exceed 100 characters"],
      default: null,
    },
    summary: {
      type: String,
      maxlength: [1000, "Summary cannot exceed 1000 characters"],
      default: null,
    },

    // ── Skills ────────────────────────────────────────
    skills: [
      {
        name: { type: String, required: true },
        level: {
          type: String,
          enum: ["beginner", "intermediate", "advanced", "expert"],
          default: "beginner",
        },
      },
    ],

    // ── Projects ──────────────────────────────────────
    projects: [
      {
        title: { type: String, required: true },
        description: {
          type: String,
          maxlength: [500, "Description cannot exceed 500 characters"],
        },
        techStack: [{ type: String }],
        githubUrl: { type: String, default: null },
        liveUrl: { type: String, default: null },
        thumbnail: {
          public_id: { type: String, default: null },
          url: { type: String, default: null },
        },
        isFeatured: { type: Boolean, default: false },
        completedAt: { type: Date, default: null },
      },
    ],

    // ── Experience ────────────────────────────────────
    experience: [
      {
        title: { type: String, required: true },
        company: { type: String, required: true },
        location: { type: String, default: null },
        startDate: { type: Date, required: true },
        endDate: { type: Date, default: null },
        isCurrent: { type: Boolean, default: false },
        description: { type: String, default: null },
      },
    ],

    // ── Education ─────────────────────────────────────
    education: [
      {
        degree: { type: String, required: true },
        institution: { type: String, required: true },
        field: { type: String, default: null },
        startDate: { type: Date, default: null },
        endDate: { type: Date, default: null },
        isCurrent: { type: Boolean, default: false },
      },
    ],

    // ── Certificates ──────────────────────────────────
    certificates: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Certificate",
      },
    ],

    // ── Social links ──────────────────────────────────
    socialLinks: {
      github: { type: String, default: null },
      linkedin: { type: String, default: null },
      twitter: { type: String, default: null },
      website: { type: String, default: null },
      youtube: { type: String, default: null },
    },

    // ── Resume ────────────────────────────────────────
    resume: {
      public_id: { type: String, default: null },
      url: { type: String, default: null },
      uploadedAt: { type: Date, default: null },
    },

    // ── Visibility ────────────────────────────────────
    isPublic: {
      type: Boolean,
      default: true,
    },
    publicUrl: {
      type: String,
      default: null,
    },

    // ── Stats ─────────────────────────────────────────
    totalViews: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// ── Index ─────────────────────────────────────────────────
portfolioSchema.index({ student: 1 });
portfolioSchema.index({ isPublic: 1 });

const Portfolio = mongoose.model("Portfolio", portfolioSchema);

export default Portfolio;
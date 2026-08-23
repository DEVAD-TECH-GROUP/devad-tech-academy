import mongoose from "mongoose";

const jobBoardSchema = new mongoose.Schema(
  {
    // ── References ────────────────────────────────────
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ── Job info ──────────────────────────────────────
    title: {
      type: String,
      required: [true, "Job title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    company: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
      maxlength: [100, "Company cannot exceed 100 characters"],
    },
    companyLogo: {
      public_id: { type: String, default: null },
      url: { type: String, default: null },
    },
    description: {
      type: String,
      required: [true, "Job description is required"],
      maxlength: [5000, "Description cannot exceed 5000 characters"],
    },
    requirements: [
      {
        type: String,
        trim: true,
      },
    ],

    // ── Type ──────────────────────────────────────────
    type: {
      type: String,
      enum: [
        "full-time",
        "part-time",
        "contract",
        "internship",
        "freelance",
        "remote",
      ],
      required: true,
    },

    // ── Location ──────────────────────────────────────
    location: {
      type: String,
      default: null,
    },
    isRemote: {
      type: Boolean,
      default: false,
    },

    // ── Salary ────────────────────────────────────────
    salary: {
      min: { type: Number, default: null },
      max: { type: Number, default: null },
      currency: { type: String, default: "NGN" },
      isNegotiable: { type: Boolean, default: false },
    },

    // ── Skills required ───────────────────────────────
    skills: [
      {
        type: String,
        trim: true,
      },
    ],
    experienceLevel: {
      type: String,
      enum: ["entry", "junior", "mid", "senior", "lead"],
      default: "entry",
    },

    // ── Application ───────────────────────────────────
    applicationUrl: {
      type: String,
      default: null,
    },
    applicationEmail: {
      type: String,
      default: null,
    },
    applicationDeadline: {
      type: Date,
      default: null,
    },

    // ── Stats ─────────────────────────────────────────
    totalViews: {
      type: Number,
      default: 0,
    },
    totalApplications: {
      type: Number,
      default: 0,
    },

    // ── Status ────────────────────────────────────────
    status: {
      type: String,
      enum: ["active", "closed", "draft"],
      default: "active",
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },

    // ── Match score fields ────────────────────────────
    matchSkills: [
      {
        type: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// ── Index ─────────────────────────────────────────────────
jobBoardSchema.index({ status: 1 });
jobBoardSchema.index({ type: 1 });
jobBoardSchema.index({ isFeatured: -1 });
jobBoardSchema.index({ createdAt: -1 });
jobBoardSchema.index({ skills: 1 });

const JobBoard = mongoose.model("JobBoard", jobBoardSchema);

export default JobBoard;
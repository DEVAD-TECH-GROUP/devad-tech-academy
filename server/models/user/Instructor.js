import mongoose from "mongoose";

const instructorSchema = new mongoose.Schema(
  {
    // ── Reference to User ─────────────────────────────
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    // ── Application status ────────────────────────────
    applicationStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    applicationDate: {
      type: Date,
      default: Date.now,
    },

    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    approvedAt: {
      type: Date,
      default: null,
    },

    rejectionReason: {
      type: String,
      default: null,
    },

    // ── Application contact information ───────────────
    applicationEmail: {
      type: String,
      trim: true,
      lowercase: true,
      default: null,
    },

    applicationPhone: {
      type: String,
      trim: true,
      default: null,
    },

    // ── Professional info ─────────────────────────────
    expertise: [
      {
        type: String,
        trim: true,
      },
    ],

    experience: {
      type: Number,
      default: 0,
      min: 0,
    },

    portfolio: {
      type: String,
      trim: true,
      default: null,
    },

    // ── Teaching application information ──────────────
    teachingExperience: {
      type: String,
      trim: true,
      default: null,
    },

    course: {
      type: String,
      trim: true,
      default: null,
    },

    availability: {
      type: String,
      trim: true,
      default: null,
    },

    coverLetter: {
      type: String,
      trim: true,
      default: null,
    },

    // ── CV / Resume ───────────────────────────────────
    cv: {
      url: {
        type: String,
        default: null,
      },

      publicId: {
        type: String,
        default: null,
      },

      originalName: {
        type: String,
        default: null,
      },
    },

    // ── Professional education ────────────────────────
    education: [
      {
        degree: {
          type: String,
          trim: true,
        },

        institution: {
          type: String,
          trim: true,
        },

        year: {
          type: Number,
        },
      },
    ],

    // ── Certifications ────────────────────────────────
    certifications: [
      {
        name: {
          type: String,
          trim: true,
        },

        issuer: {
          type: String,
          trim: true,
        },

        year: {
          type: Number,
        },

        url: {
          type: String,
          trim: true,
        },
      },
    ],

    // ── Teaching stats ────────────────────────────────
    totalCourses: {
      type: Number,
      default: 0,
    },

    totalStudents: {
      type: Number,
      default: 0,
    },

    totalRevenue: {
      type: Number,
      default: 0,
    },

    totalLiveClasses: {
      type: Number,
      default: 0,
    },

    totalAssignmentsGraded: {
      type: Number,
      default: 0,
    },

    averageRating: {
      type: Number,
      default: 0,
    },

    totalReviews: {
      type: Number,
      default: 0,
    },

    // ── XP and level ──────────────────────────────────
    xpPoints: {
      type: Number,
      default: 0,
    },

    level: {
      type: Number,
      default: 1,
    },

    // ── Payout settings ───────────────────────────────
    payoutSettings: {
      bankName: {
        type: String,
        default: null,
      },

      accountNumber: {
        type: String,
        default: null,
      },

      accountName: {
        type: String,
        default: null,
      },
    },

    // ── Platform fee discount ─────────────────────────
    platformFeeDiscount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// ── Indexes ────────────────────────────────────────────────
instructorSchema.index({ user: 1 });
instructorSchema.index({ applicationStatus: 1 });
instructorSchema.index({ applicationEmail: 1 });

const Instructor = mongoose.model(
  "Instructor",
  instructorSchema
);

export default Instructor;
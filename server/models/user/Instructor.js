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
    },
    education: [
      {
        degree: String,
        institution: String,
        year: Number,
      },
    ],
    certifications: [
      {
        name: String,
        issuer: String,
        year: Number,
        url: String,
      },
    ],
    portfolio: {
      type: String,
      default: null,
    },

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
      bankName: { type: String, default: null },
      accountNumber: { type: String, default: null },
      accountName: { type: String, default: null },
    },

    // ── Platform fee discount (referrals) ─────────────
    platformFeeDiscount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// ── Index ─────────────────────────────────────────────────
instructorSchema.index({ user: 1 });
instructorSchema.index({ applicationStatus: 1 });

const Instructor = mongoose.model("Instructor", instructorSchema);

export default Instructor;
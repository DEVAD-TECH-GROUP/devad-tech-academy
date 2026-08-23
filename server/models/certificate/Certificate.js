import mongoose from "mongoose";
import { CERTIFICATE_STATUS } from "../../utils/constants.js";

const certificateSchema = new mongoose.Schema(
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
      required: true,
    },
    enrollment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Enrollment",
      required: true,
    },
    template: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CertificateTemplate",
      required: true,
    },
    issuedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ── Certificate ID ────────────────────────────────
    certificateId: {
      type: String,
      required: true,
      unique: true,
    },

    // ── Certificate file ──────────────────────────────
    file: {
      public_id: { type: String, default: null },
      url: { type: String, default: null },
    },

    // ── Status ────────────────────────────────────────
    status: {
      type: String,
      enum: Object.values(CERTIFICATE_STATUS),
      default: CERTIFICATE_STATUS.ISSUED,
    },

    // ── Issue date ────────────────────────────────────
    issuedAt: {
      type: Date,
      default: Date.now,
    },

    // ── Expiry ────────────────────────────────────────
    expiresAt: {
      type: Date,
      default: null,
    },
    hasExpiry: {
      type: Boolean,
      default: false,
    },

    // ── Revocation ────────────────────────────────────
    revokedAt: {
      type: Date,
      default: null,
    },
    revokedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    revocationReason: {
      type: String,
      default: null,
    },

    // ── Verification ──────────────────────────────────
    verificationUrl: {
      type: String,
      default: null,
    },
    isVerified: {
      type: Boolean,
      default: true,
    },

    // ── Shares ────────────────────────────────────────
    totalShares: {
      type: Number,
      default: 0,
    },
    totalDownloads: {
      type: Number,
      default: 0,
    },

    // ── Grade info ────────────────────────────────────
    grade: {
      type: String,
      default: null,
    },
    completionDate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// ── Index ─────────────────────────────────────────────────
certificateSchema.index({ certificateId: 1 });
certificateSchema.index({ student: 1 });
certificateSchema.index({ course: 1 });
certificateSchema.index({ status: 1 });

const Certificate = mongoose.model("Certificate", certificateSchema);

export default Certificate;
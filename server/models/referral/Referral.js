import mongoose from "mongoose";
import { REFERRAL_STATUS, REFERRAL } from "../../utils/constants.js";

const referralSchema = new mongoose.Schema(
  {
    // ── Referrer ──────────────────────────────────────
    referrer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    referrerRole: {
      type: String,
      enum: ["student", "instructor"],
      required: true,
    },

    // ── Referee ───────────────────────────────────────
    referee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ── Referral code ─────────────────────────────────
    referralCode: {
      type: String,
      required: true,
    },

    // ── Status ────────────────────────────────────────
    status: {
      type: String,
      enum: Object.values(REFERRAL_STATUS),
      default: REFERRAL_STATUS.PENDING,
    },

    // ── Discount applied ──────────────────────────────
    discountPercent: {
      type: Number,
      default: 0,
    },
    creditAmount: {
      type: Number,
      default: 0,
    },

    // ── Active since ──────────────────────────────────
    activatedAt: {
      type: Date,
      default: null,
    },
    expiresAt: {
      type: Date,
      default: null,
    },

    // ── Subscription reference ────────────────────────
    subscription: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subscription",
      default: null,
    },

    // ── Total credits earned ──────────────────────────
    totalCreditsEarned: {
      type: Number,
      default: 0,
    },

    // ── Credit history ────────────────────────────────
    creditHistory: [
      {
        amount: { type: Number, required: true },
        cycle: { type: String, required: true },
        creditedAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// ── Prevent duplicate referrals ───────────────────────────
referralSchema.index(
  { referrer: 1, referee: 1 },
  { unique: true }
);
referralSchema.index({ referrer: 1 });
referralSchema.index({ referralCode: 1 });
referralSchema.index({ status: 1 });

const Referral = mongoose.model("Referral", referralSchema);

export default Referral;
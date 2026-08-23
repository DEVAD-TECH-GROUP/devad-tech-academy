import mongoose from "mongoose";

const payoutSchema = new mongoose.Schema(
  {
    // ── References ────────────────────────────────────
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // ── Payout info ───────────────────────────────────
    amount: {
      type: Number,
      required: [true, "Payout amount is required"],
    },
    currency: {
      type: String,
      default: "NGN",
    },
    platformFee: {
      type: Number,
      default: 0,
    },
    platformFeePercent: {
      type: Number,
      default: 30,
    },
    netAmount: {
      type: Number,
      required: true,
    },

    // ── Period ────────────────────────────────────────
    periodStart: {
      type: Date,
      required: true,
    },
    periodEnd: {
      type: Date,
      required: true,
    },

    // ── Bank details ──────────────────────────────────
    bankName: {
      type: String,
      required: true,
    },
    accountNumber: {
      type: String,
      required: true,
    },
    accountName: {
      type: String,
      required: true,
    },

    // ── Status ────────────────────────────────────────
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "failed"],
      default: "pending",
    },

    // ── Reference ─────────────────────────────────────
    reference: {
      type: String,
      default: null,
    },
    gatewayResponse: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
      select: false,
    },

    // ── Notes ─────────────────────────────────────────
    notes: {
      type: String,
      default: null,
    },

    // ── Processed at ──────────────────────────────────
    processedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// ── Index ─────────────────────────────────────────────────
payoutSchema.index({ instructor: 1 });
payoutSchema.index({ status: 1 });
payoutSchema.index({ createdAt: -1 });

const Payout = mongoose.model("Payout", payoutSchema);

export default Payout;
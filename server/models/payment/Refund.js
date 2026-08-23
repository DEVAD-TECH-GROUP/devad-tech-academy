import mongoose from "mongoose";

const refundSchema = new mongoose.Schema(
  {
    // ── References ────────────────────────────────────
    payment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ── Refund info ───────────────────────────────────
    amount: {
      type: Number,
      required: [true, "Refund amount is required"],
    },
    currency: {
      type: String,
      default: "NGN",
    },
    reason: {
      type: String,
      required: [true, "Refund reason is required"],
      maxlength: [500, "Reason cannot exceed 500 characters"],
    },

    // ── Gateway ───────────────────────────────────────
    gateway: {
      type: String,
      enum: ["paystack", "flutterwave", "manual"],
      required: true,
    },
    gatewayRefundId: {
      type: String,
      default: null,
    },
    gatewayResponse: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
      select: false,
    },

    // ── Status ────────────────────────────────────────
    status: {
      type: String,
      enum: ["pending", "processed", "failed"],
      default: "pending",
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
refundSchema.index({ payment: 1 });
refundSchema.index({ student: 1 });
refundSchema.index({ status: 1 });

const Refund = mongoose.model("Refund", refundSchema);

export default Refund;
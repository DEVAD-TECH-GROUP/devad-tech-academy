import mongoose from "mongoose";
import {
  PAYMENT_STATUS,
  PAYMENT_TYPES,
} from "../../utils/constants.js";

const paymentSchema = new mongoose.Schema(
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
      default: null,
    },
    subscription: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subscription",
      default: null,
    },
    coupon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Coupon",
      default: null,
    },

    // ── Payment info ──────────────────────────────────
    type: {
      type: String,
      enum: Object.values(PAYMENT_TYPES),
      required: true,
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
    },
    currency: {
      type: String,
      default: "NGN",
    },
    discountAmount: {
      type: Number,
      default: 0,
    },
    finalAmount: {
      type: Number,
      required: true,
    },

    // ── Gateway ───────────────────────────────────────
    gateway: {
      type: String,
      enum: ["paystack", "flutterwave", "manual"],
      required: true,
    },
    gatewayReference: {
      type: String,
      unique: true,
      sparse: true,
    },
    gatewayResponse: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
      select: false,
    },

    // ── Status ────────────────────────────────────────
    status: {
      type: String,
      enum: Object.values(PAYMENT_STATUS),
      default: PAYMENT_STATUS.PENDING,
    },

    // ── Invoice ───────────────────────────────────────
    invoiceId: {
      type: String,
      unique: true,
      sparse: true,
    },

    // ── Metadata ──────────────────────────────────────
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    // ── Paid at ───────────────────────────────────────
    paidAt: {
      type: Date,
      default: null,
    },

    // ── Refund ────────────────────────────────────────
    isRefunded: {
      type: Boolean,
      default: false,
    },
    refundedAt: {
      type: Date,
      default: null,
    },
    refundAmount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// ── Index ─────────────────────────────────────────────────
paymentSchema.index({ student: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ gateway: 1 });
paymentSchema.index({ gatewayReference: 1 });
paymentSchema.index({ createdAt: -1 });

const Payment = mongoose.model("Payment", paymentSchema);

export default Payment;
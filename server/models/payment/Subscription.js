import mongoose from "mongoose";
import {
  SUBSCRIPTION_PLANS,
  SUBSCRIPTION_STATUS,
} from "../../utils/constants.js";

const subscriptionSchema = new mongoose.Schema(
  {
    // ── References ────────────────────────────────────
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    payment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
      default: null,
    },

    // ── Plan ──────────────────────────────────────────
    plan: {
      type: String,
      enum: Object.values(SUBSCRIPTION_PLANS),
      required: true,
    },

    // ── Pricing ───────────────────────────────────────
    originalAmount: {
      type: Number,
      required: true,
    },
    discountPercent: {
      type: Number,
      default: 0,
    },
    discountAmount: {
      type: Number,
      default: 0,
    },
    finalAmount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: "NGN",
    },

    // ── Status ────────────────────────────────────────
    status: {
      type: String,
      enum: Object.values(SUBSCRIPTION_STATUS),
      default: SUBSCRIPTION_STATUS.ACTIVE,
    },

    // ── Dates ─────────────────────────────────────────
    startDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    endDate: {
      type: Date,
      required: true,
    },
    nextBillingDate: {
      type: Date,
      default: null,
    },

    // ── Auto renew ────────────────────────────────────
    autoRenew: {
      type: Boolean,
      default: true,
    },

    // ── Cancellation ──────────────────────────────────
    cancelledAt: {
      type: Date,
      default: null,
    },
    cancellationReason: {
      type: String,
      default: null,
    },

    // ── Referral discount ─────────────────────────────
    referralDiscount: {
      type: Number,
      default: 0,
    },
    activeReferrals: {
      type: Number,
      default: 0,
    },

    // ── Gateway subscription ──────────────────────────
    gatewaySubscriptionCode: {
      type: String,
      default: null,
    },
    gatewayCustomerCode: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// ── Index ─────────────────────────────────────────────────
subscriptionSchema.index({ student: 1 });
subscriptionSchema.index({ status: 1 });
subscriptionSchema.index({ endDate: 1 });
subscriptionSchema.index({ plan: 1 });

const Subscription = mongoose.model("Subscription", subscriptionSchema);

export default Subscription;
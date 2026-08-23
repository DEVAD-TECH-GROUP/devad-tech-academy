import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
  {
    // ── Coupon info ───────────────────────────────────
    code: {
      type: String,
      required: [true, "Coupon code is required"],
      unique: true,
      uppercase: true,
      trim: true,
    },
    description: {
      type: String,
      maxlength: [200, "Description cannot exceed 200 characters"],
      default: null,
    },

    // ── Discount ──────────────────────────────────────
    discountType: {
      type: String,
      enum: ["percentage", "fixed"],
      default: "percentage",
    },
    discountValue: {
      type: Number,
      required: [true, "Discount value is required"],
    },
    maxDiscount: {
      type: Number,
      default: null,
    },
    currency: {
      type: String,
      default: "NGN",
    },

    // ── Validity ──────────────────────────────────────
    validFrom: {
      type: Date,
      default: Date.now,
    },
    validUntil: {
      type: Date,
      required: [true, "Expiry date is required"],
    },

    // ── Usage limits ──────────────────────────────────
    maxUsage: {
      type: Number,
      default: null,
    },
    maxUsagePerUser: {
      type: Number,
      default: 1,
    },
    totalUsed: {
      type: Number,
      default: 0,
    },

    // ── Restrictions ──────────────────────────────────
    applicableTo: {
      type: String,
      enum: ["all", "subscription", "course"],
      default: "all",
    },
    applicableCourses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
      },
    ],
    applicablePlans: [
      {
        type: String,
        enum: ["monthly", "annual"],
      },
    ],
    minimumAmount: {
      type: Number,
      default: 0,
    },

    // ── Status ────────────────────────────────────────
    isActive: {
      type: Boolean,
      default: true,
    },

    // ── Created by ────────────────────────────────────
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ── Users who used it ─────────────────────────────
    usedBy: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        usedAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// ── Index ─────────────────────────────────────────────────
couponSchema.index({ code: 1 });
couponSchema.index({ isActive: 1 });
couponSchema.index({ validUntil: 1 });

const Coupon = mongoose.model("Coupon", couponSchema);

export default Coupon;
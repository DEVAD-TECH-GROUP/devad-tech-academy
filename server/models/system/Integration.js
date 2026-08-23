import mongoose from "mongoose";

const integrationSchema = new mongoose.Schema(
  {
    // ── Basic info ────────────────────────────────────
    name: {
      type: String,
      required: [true, "Integration name is required"],
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      default: null,
    },
    icon: {
      type: String,
      default: null,
    },
    category: {
      type: String,
      enum: [
        "payment",
        "email",
        "sms",
        "video",
        "storage",
        "ai",
        "analytics",
        "other",
      ],
      required: true,
    },

    // ── Status ────────────────────────────────────────
    isConnected: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: false,
    },

    // ── Config ────────────────────────────────────────
    config: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
      select: false,
    },

    // ── Last synced ───────────────────────────────────
    lastSyncedAt: {
      type: Date,
      default: null,
    },

    // ── Updated by ────────────────────────────────────
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// ── Index ─────────────────────────────────────────────────
integrationSchema.index({ slug: 1 });
integrationSchema.index({ category: 1 });
integrationSchema.index({ isConnected: 1 });

const Integration = mongoose.model("Integration", integrationSchema);

export default Integration;
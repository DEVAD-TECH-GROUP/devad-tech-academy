import mongoose from "mongoose";

const apiKeySchema = new mongoose.Schema(
  {
    // ── References ────────────────────────────────────
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ── Key info ──────────────────────────────────────
    name: {
      type: String,
      required: [true, "API key name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    key: {
      type: String,
      required: true,
      unique: true,
      select: false,
    },
    prefix: {
      type: String,
      required: true,
    },

    // ── Permissions ───────────────────────────────────
    permissions: [
      {
        type: String,
        enum: ["read", "write", "delete", "admin"],
      },
    ],

    // ── Usage ─────────────────────────────────────────
    totalRequests: {
      type: Number,
      default: 0,
    },
    lastUsedAt: {
      type: Date,
      default: null,
    },

    // ── Rate limit ────────────────────────────────────
    rateLimit: {
      type: Number,
      default: 1000, // per hour
    },

    // ── Expiry ────────────────────────────────────────
    expiresAt: {
      type: Date,
      default: null,
    },

    // ── Status ────────────────────────────────────────
    isActive: {
      type: Boolean,
      default: true,
    },
    revokedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// ── Index ─────────────────────────────────────────────────
apiKeySchema.index({ prefix: 1 });
apiKeySchema.index({ createdBy: 1 });
apiKeySchema.index({ isActive: 1 });

const APIKey = mongoose.model("APIKey", apiKeySchema);

export default APIKey;
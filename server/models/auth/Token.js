import mongoose from "mongoose";

const tokenSchema = new mongoose.Schema(
  {
    // ── User reference ────────────────────────────────
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ── Refresh token ─────────────────────────────────
    refreshToken: {
      type: String,
      required: true,
    },

    // ── Device info ───────────────────────────────────
    deviceInfo: {
      userAgent: { type: String, default: null },
      ip: { type: String, default: null },
      device: { type: String, default: null },
      browser: { type: String, default: null },
      os: { type: String, default: null },
    },

    // ── Token status ──────────────────────────────────
    isValid: {
      type: Boolean,
      default: true,
    },

    // ── Expiry ────────────────────────────────────────
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// ── Auto delete expired tokens ────────────────────────────
tokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
tokenSchema.index({ user: 1 });
tokenSchema.index({ refreshToken: 1 });

const Token = mongoose.model("Token", tokenSchema);

export default Token;

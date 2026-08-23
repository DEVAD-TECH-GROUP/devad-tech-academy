import mongoose from "mongoose";
import { AUDIT_TYPES } from "../../utils/constants.js";

const auditLogSchema = new mongoose.Schema(
  {
    // ── Actor ─────────────────────────────────────────
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    actorRole: {
      type: String,
      required: true,
    },

    // ── Action ────────────────────────────────────────
    action: {
      type: String,
      required: [true, "Action is required"],
      maxlength: [200, "Action cannot exceed 200 characters"],
    },
    type: {
      type: String,
      enum: Object.values(AUDIT_TYPES),
      required: true,
    },

    // ── Target ────────────────────────────────────────
    targetModel: {
      type: String,
      default: null,
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },

    // ── Changes ───────────────────────────────────────
    previousData: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
      select: false,
    },
    newData: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
      select: false,
    },

    // ── Request info ──────────────────────────────────
    ipAddress: {
      type: String,
      default: null,
    },
    userAgent: {
      type: String,
      default: null,
    },
    endpoint: {
      type: String,
      default: null,
    },
    method: {
      type: String,
      default: null,
    },

    // ── Status ────────────────────────────────────────
    isSuccess: {
      type: Boolean,
      default: true,
    },
    errorMessage: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// ── Auto delete after 1 year ──────────────────────────────
auditLogSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 365 * 24 * 60 * 60 }
);
auditLogSchema.index({ actor: 1 });
auditLogSchema.index({ type: 1 });
auditLogSchema.index({ createdAt: -1 });

const AuditLog = mongoose.model("AuditLog", auditLogSchema);

export default AuditLog;
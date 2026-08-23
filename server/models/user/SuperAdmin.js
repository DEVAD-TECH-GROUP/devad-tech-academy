import mongoose from "mongoose";

const superAdminSchema = new mongoose.Schema(
  {
    // ── Reference to User ─────────────────────────────
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    // ── Permissions ───────────────────────────────────
    permissions: {
      manageUsers: { type: Boolean, default: true },
      manageInstructors: { type: Boolean, default: true },
      manageCourses: { type: Boolean, default: true },
      managePayments: { type: Boolean, default: true },
      manageSettings: { type: Boolean, default: true },
      manageIntegrations: { type: Boolean, default: true },
      viewAuditLogs: { type: Boolean, default: true },
      manageAI: { type: Boolean, default: true },
      manageBackups: { type: Boolean, default: true },
      manageBranding: { type: Boolean, default: true },
    },

    // ── Activity stats ────────────────────────────────
    totalActions: {
      type: Number,
      default: 0,
    },
    lastAction: {
      type: String,
      default: null,
    },
    lastActionAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// ── Index ─────────────────────────────────────────────────
superAdminSchema.index({ user: 1 });

const SuperAdmin = mongoose.model("SuperAdmin", superAdminSchema);

export default SuperAdmin;
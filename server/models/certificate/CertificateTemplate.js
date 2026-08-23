import mongoose from "mongoose";

const certificateTemplateSchema = new mongoose.Schema(
  {
    // ── Basic info ────────────────────────────────────
    name: {
      type: String,
      required: [true, "Template name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    description: {
      type: String,
      maxlength: [300, "Description cannot exceed 300 characters"],
      default: null,
    },

    // ── Template design ───────────────────────────────
    thumbnail: {
      public_id: { type: String, default: null },
      url: { type: String, default: null },
    },
    templateFile: {
      public_id: { type: String, default: null },
      url: { type: String, default: null },
    },

    // ── Template settings ─────────────────────────────
    settings: {
      backgroundColor: { type: String, default: "#ffffff" },
      primaryColor: { type: String, default: "#818CF8" },
      secondaryColor: { type: String, default: "#34D399" },
      fontFamily: { type: String, default: "Space Grotesk" },
      logoPosition: {
        type: String,
        enum: ["top-left", "top-center", "top-right"],
        default: "top-center",
      },
      signaturePosition: {
        type: String,
        enum: ["bottom-left", "bottom-center", "bottom-right"],
        default: "bottom-right",
      },
    },

    // ── Type ──────────────────────────────────────────
    type: {
      type: String,
      enum: [
        "completion",
        "excellence",
        "project",
        "participation",
      ],
      default: "completion",
    },

    // ── Status ────────────────────────────────────────
    isActive: {
      type: Boolean,
      default: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },

    // ── Created by ────────────────────────────────────
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// ── Index ─────────────────────────────────────────────────
certificateTemplateSchema.index({ isActive: 1 });
certificateTemplateSchema.index({ type: 1 });

const CertificateTemplate = mongoose.model(
  "CertificateTemplate",
  certificateTemplateSchema
);

export default CertificateTemplate;
import mongoose from "mongoose";
import createSlug from "../../utils/slugify.js";

const knowledgeBaseSchema = new mongoose.Schema(
  {
    // ── References ────────────────────────────────────
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ── Basic info ────────────────────────────────────
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    slug: {
      type: String,
      unique: true,
    },
    content: {
      type: String,
      required: [true, "Content is required"],
    },
    excerpt: {
      type: String,
      maxlength: [300, "Excerpt cannot exceed 300 characters"],
      default: null,
    },

    // ── Category ──────────────────────────────────────
    category: {
      type: String,
      enum: [
        "getting-started",
        "courses",
        "payments",
        "certificates",
        "technical",
        "account",
        "instructors",
      ],
      default: "getting-started",
    },

    // ── Tags ──────────────────────────────────────────
    tags: [
      {
        type: String,
        trim: true,
      },
    ],

    // ── Stats ─────────────────────────────────────────
    totalViews: {
      type: Number,
      default: 0,
    },
    isHelpful: {
      type: Number,
      default: 0,
    },
    notHelpful: {
      type: Number,
      default: 0,
    },

    // ── Order ─────────────────────────────────────────
    order: {
      type: Number,
      default: 0,
    },

    // ── Status ────────────────────────────────────────
    isActive: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// ── Auto generate slug ────────────────────────────────────
knowledgeBaseSchema.pre("save", function (next) {
  if (this.isModified("title")) {
    this.slug = createSlug(this.title);
  }
  next();
});

// ── Index ─────────────────────────────────────────────────
knowledgeBaseSchema.index({ slug: 1 });
knowledgeBaseSchema.index({ category: 1 });
knowledgeBaseSchema.index({ isActive: 1 });

const KnowledgeBase = mongoose.model("KnowledgeBase", knowledgeBaseSchema);

export default KnowledgeBase;
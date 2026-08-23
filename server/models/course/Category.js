import mongoose from "mongoose";
import createSlug from "../../utils/slugify.js";

const categorySchema = new mongoose.Schema(
  {
    // ── Basic info ────────────────────────────────────
    name: {
      type: String,
      required: [true, "Category name is required"],
      unique: true,
      trim: true,
      maxlength: [50, "Category name cannot exceed 50 characters"],
    },
    slug: {
      type: String,
      unique: true,
    },
    description: {
      type: String,
      maxlength: [200, "Description cannot exceed 200 characters"],
      default: null,
    },

    // ── Icon ──────────────────────────────────────────
    icon: {
      type: String,
      default: null,
    },
    color: {
      type: String,
      default: "#818CF8",
    },

    // ── Stats ─────────────────────────────────────────
    totalCourses: {
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
  },
  {
    timestamps: true,
  }
);

// ── Auto generate slug ────────────────────────────────────
categorySchema.pre("save", function (next) {
  if (this.isModified("name")) {
    this.slug = createSlug(this.name);
  }
  next();
});

// ── Index ─────────────────────────────────────────────────
categorySchema.index({ slug: 1 });
categorySchema.index({ isActive: 1 });

const Category = mongoose.model("Category", categorySchema);

export default Category;
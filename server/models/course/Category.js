import mongoose from "mongoose";
import createSlug from "../../utils/slugify.js";

const categorySchema = new mongoose.Schema(
  {
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

    icon: {
      type: String,
      default: null,
    },

    color: {
      type: String,
      default: "#818CF8",
    },

    totalCourses: {
      type: Number,
      default: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

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

// Auto-generate slug before saving
categorySchema.pre("save", function () {
  if (this.isModified("name")) {
    this.slug = createSlug(this.name);
  }
});

categorySchema.index({ slug: 1 });
categorySchema.index({ isActive: 1 });

const Category = mongoose.model("Category", categorySchema);

export default Category;
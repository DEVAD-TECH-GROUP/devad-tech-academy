import mongoose from "mongoose";
import createSlug from "../../utils/slugify.js";

const blogPostSchema = new mongoose.Schema(
  {
    // ── References ────────────────────────────────────
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ── Basic info ────────────────────────────────────
    title: {
      type: String,
      required: [true, "Blog post title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    slug: {
      type: String,
      unique: true,
    },
    excerpt: {
      type: String,
      maxlength: [300, "Excerpt cannot exceed 300 characters"],
      default: null,
    },
    content: {
      type: String,
      required: [true, "Blog post content is required"],
    },

    // ── Thumbnail ─────────────────────────────────────
    thumbnail: {
      public_id: { type: String, default: null },
      url: { type: String, default: null },
    },

    // ── Category & tags ───────────────────────────────
    category: {
      type: String,
      enum: [
        "tutorial",
        "news",
        "announcement",
        "student-spotlight",
        "career",
        "other",
      ],
      default: "tutorial",
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],

    // ── SEO ───────────────────────────────────────────
    metaTitle: {
      type: String,
      maxlength: [60, "Meta title cannot exceed 60 characters"],
      default: null,
    },
    metaDescription: {
      type: String,
      maxlength: [160, "Meta description cannot exceed 160 characters"],
      default: null,
    },

    // ── Stats ─────────────────────────────────────────
    totalViews: {
      type: Number,
      default: 0,
    },
    totalLikes: {
      type: Number,
      default: 0,
    },
    totalComments: {
      type: Number,
      default: 0,
    },
    readTime: {
      type: Number,
      default: 0, // in minutes
    },

    // ── Status ────────────────────────────────────────
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
    },
    publishedAt: {
      type: Date,
      default: null,
    },

    // ── Featured ──────────────────────────────────────
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
blogPostSchema.pre("save", function (next) {
  if (this.isModified("title")) {
    this.slug = createSlug(this.title);
  }
  next();
});

// ── Auto calculate read time ──────────────────────────────
blogPostSchema.pre("save", function (next) {
  if (this.isModified("content")) {
    const wordsPerMinute = 200;
    const wordCount = this.content.split(/\s+/).length;
    this.readTime = Math.ceil(wordCount / wordsPerMinute);
  }
  next();
});

// ── Index ─────────────────────────────────────────────────
blogPostSchema.index({ slug: 1 });
blogPostSchema.index({ status: 1 });
blogPostSchema.index({ category: 1 });
blogPostSchema.index({ isFeatured: 1 });
blogPostSchema.index({ publishedAt: -1 });

const BlogPost = mongoose.model("BlogPost", blogPostSchema);

export default BlogPost;
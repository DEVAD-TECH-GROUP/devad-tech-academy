import mongoose from "mongoose";
import createSlug from "../../utils/slugify.js";
import { COURSE_STATUS } from "../../utils/constants.js";

const courseSchema = new mongoose.Schema(
  {
    // ── Basic info ────────────────────────────────────
    title: {
      type: String,
      required: [true, "Course title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    slug: {
      type: String,
      unique: true,
    },
    description: {
      type: String,
      required: [true, "Course description is required"],
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    shortDescription: {
      type: String,
      maxlength: [200, "Short description cannot exceed 200 characters"],
    },

    // ── Instructor ────────────────────────────────────
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ── Category ──────────────────────────────────────
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    // ── Tags ──────────────────────────────────────────
    tags: [
      {
        type: String,
        trim: true,
      },
    ],

    // ── Thumbnail ─────────────────────────────────────
    thumbnail: {
      public_id: { type: String, default: null },
      url: { type: String, default: null },
    },

    // ── Preview video ─────────────────────────────────
    previewVideo: {
      public_id: { type: String, default: null },
      url: { type: String, default: null },
      duration: { type: Number, default: 0 },
    },

    // ── Level & language ──────────────────────────────
    level: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "beginner",
    },
    language: {
      type: String,
      default: "English",
    },

    // ── Status ────────────────────────────────────────
    status: {
      type: String,
      enum: Object.values(COURSE_STATUS),
      default: COURSE_STATUS.DRAFT,
    },

    // ── Pricing ───────────────────────────────────────
    price: {
      type: Number,
      default: 0,
    },
    isFree: {
      type: Boolean,
      default: false,
    },
    discountPrice: {
      type: Number,
      default: null,
    },
    discountExpiry: {
      type: Date,
      default: null,
    },

    // ── Requirements ──────────────────────────────────
    prerequisites: [
      {
        type: String,
        trim: true,
      },
    ],

    // ── Learning outcomes ─────────────────────────────
    learningOutcomes: [
      {
        type: String,
        trim: true,
      },
    ],

    // ── Course stats ──────────────────────────────────
    totalModules: {
      type: Number,
      default: 0,
    },
    totalLessons: {
      type: Number,
      default: 0,
    },
    totalDuration: {
      type: Number,
      default: 0, // in minutes
    },
    totalStudents: {
      type: Number,
      default: 0,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalRevenue: {
      type: Number,
      default: 0,
    },

    // ── Settings ──────────────────────────────────────
    settings: {
      enrollmentType: {
        type: String,
        enum: ["open", "invite"],
        default: "open",
      },
      hasCertificate: {
        type: Boolean,
        default: true,
      },
      hasDiscussion: {
        type: Boolean,
        default: true,
      },
      dripContent: {
        type: Boolean,
        default: false,
      },
      allowDownloads: {
        type: Boolean,
        default: true,
      },
    },

    // ── Featured ──────────────────────────────────────
    isFeatured: {
      type: Boolean,
      default: false,
    },

    // ── Approval ──────────────────────────────────────
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    approvedAt: {
      type: Date,
      default: null,
    },
    rejectionReason: {
      type: String,
      default: null,
    },

    // ── Published at ──────────────────────────────────
    publishedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ── Auto generate slug ────────────────────────────────────
courseSchema.pre("save", function (next) {
  if (this.isModified("title")) {
    this.slug = createSlug(this.title);
  }
  next();
});

// ── Index ─────────────────────────────────────────────────
courseSchema.index({ slug: 1 });
courseSchema.index({ instructor: 1 });
courseSchema.index({ category: 1 });
courseSchema.index({ status: 1 });
courseSchema.index({ isFeatured: 1 });
courseSchema.index({ averageRating: -1 });
courseSchema.index({ totalStudents: -1 });
courseSchema.index({ createdAt: -1 });

const Course = mongoose.model("Course", courseSchema);

export default Course;
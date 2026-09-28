import mongoose from "mongoose";
import createSlug from "../../utils/slugify.js";
import { COURSE_STATUS } from "../../utils/constants.js";

const courseSchema = new mongoose.Schema(
  {
    // ============================================================
    // BASIC INFORMATION
    // ============================================================

    title: {
      type: String,
      required: [true, "Course title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },

    slug: {
      type: String,
      unique: true,
      index: true,
    },

    subtitle: {
      type: String,
      trim: true,
      maxlength: [200, "Subtitle cannot exceed 200 characters"],
      default: null,
    },

    shortDescription: {
      type: String,
      trim: true,
      maxlength: [200, "Short description cannot exceed 200 characters"],
      default: null,
    },

    description: {
      type: String,
      required: [true, "Course description is required"],
      trim: true,
      maxlength: [5000, "Description cannot exceed 5000 characters"],
    },

    // ============================================================
    // INSTRUCTOR
    // ============================================================

    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // ============================================================
    // CATEGORY
    // ============================================================

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      index: true,
    },

    // ============================================================
    // TAGS
    // ============================================================

    tags: [
      {
        type: String,
        trim: true,
      },
    ],

    // ============================================================
    // TECHNOLOGIES / TOOLS
    // ============================================================

    technologies: [
      {
        type: String,
        trim: true,
      },
    ],

    // ============================================================
    // MEDIA
    // ============================================================

    thumbnail: {
      public_id: {
        type: String,
        default: null,
      },

      url: {
        type: String,
        default: null,
      },
    },

    previewVideo: {
      public_id: {
        type: String,
        default: null,
      },

      url: {
        type: String,
        default: null,
      },

      duration: {
        type: Number,
        default: 0,
        min: 0,
      },
    },

    // ============================================================
    // LEVEL / LANGUAGE
    // ============================================================

    level: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "beginner",
    },

    language: {
      type: String,
      trim: true,
      default: "English",
    },

    // ============================================================
    // COURSE STATUS
    // ============================================================

    status: {
      type: String,
      enum: Object.values(COURSE_STATUS),
      default: COURSE_STATUS.DRAFT,
      index: true,
    },

    // ============================================================
    // PRICING
    // ============================================================

    price: {
      type: Number,
      default: 0,
      min: 0,
    },

    isFree: {
      type: Boolean,
      default: false,
    },

    discountPrice: {
      type: Number,
      default: null,
      min: 0,
    },

    discountExpiry: {
      type: Date,
      default: null,
    },

    // ============================================================
    // INSTALLMENT PAYMENT
    // ============================================================

    installments: {
      enabled: {
        type: Boolean,
        default: false,
      },

      amount: {
        type: Number,
        default: 0,
        min: 0,
      },

      count: {
        type: Number,
        default: 0,
        min: 0,
      },

      interval: {
        type: String,
        enum: ["weekly", "monthly"],
        default: "monthly",
      },
    },

    // ============================================================
    // REQUIREMENTS
    // ============================================================

    prerequisites: [
      {
        type: String,
        trim: true,
      },
    ],

    // ============================================================
    // LEARNING OUTCOMES
    // ============================================================

    learningOutcomes: [
      {
        type: String,
        trim: true,
      },
    ],

    // ============================================================
    // COURSE STATS
    // ============================================================

    totalModules: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalLessons: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalProjects: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalAssignments: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalDuration: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalStudents: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalReviews: {
      type: Number,
      default: 0,
      min: 0,
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
      min: 0,
    },

    // ============================================================
    // COURSE SETTINGS
    // ============================================================

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

    // ============================================================
    // LIVE CLASSES
    // ============================================================

    liveClasses: {
      enabled: {
        type: Boolean,
        default: false,
      },

      frequency: {
        type: String,
        enum: [
          "once",
          "weekly",
          "twice-weekly",
          "three-times-weekly",
          "custom",
        ],
        default: "weekly",
      },

      duration: {
        type: Number,
        default: 60,
        min: 15,
      },

      platform: {
        type: String,
        enum: ["google-meet", "zoom", "microsoft-teams", "other"],
        default: "google-meet",
      },

      description: {
        type: String,
        trim: true,
        maxlength: 500,
        default: null,
      },
    },

    // ============================================================
    // FEATURED
    // ============================================================

    isFeatured: {
      type: Boolean,
      default: false,
    },

    // ============================================================
    // APPROVAL
    // ============================================================

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

    // ============================================================
    // PUBLISHED
    // ============================================================

    publishedAt: {
      type: Date,
      default: null,
    },
  },

  {
    timestamps: true,

    toJSON: {
      virtuals: true,
    },

    toObject: {
      virtuals: true,
    },
  }
);

// ============================================================
// AUTO SLUG
// ============================================================

courseSchema.pre("save", function () {
  if (this.isModified("title")) {
    this.slug = createSlug(this.title);
  }
});

// ============================================================
// INDEXES
// ============================================================

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